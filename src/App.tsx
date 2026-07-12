import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import {
  officialDocumentsLibrary,
  officialQuestionsWithCoverage,
  practiceQuestions,
  sourceLookup,
} from './data/practice';
import { themeMeta } from './data/theme-meta';
import { useQuestionAudio } from './hooks/use-question-audio';
import { exportRevisionPdf } from './lib/pdf';
import { formatCountdown, getStudyPack } from './lib/study';
import type {
  ExamHistoryEntry,
  OfficialDocument,
  PracticeQuestion,
  ProgressStats,
  QuizAttempt,
  QuizSettings,
  ThemeLabel,
} from './types';

type TabKey = 'overview' | 'quiz' | 'bank' | 'sources';

type QuizSession = {
  questions: PracticeQuestion[];
  answers: Record<string, number>;
  note?: string;
  mode: QuizSettings['mode'];
  startedAt: string;
  durationSeconds?: number;
  finishedAt?: string;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
};

const STORAGE_KEY = 'residence-civique-progress-v2';
const DEFAULT_SETTINGS: QuizSettings = {
  count: 20,
  theme: 'all',
  onlyIncorrect: false,
  mode: 'practice',
};

const EMPTY_PROGRESS: ProgressStats = {
  attemptsByQuestion: {},
  bookmarks: [],
  examHistory: [],
};

function normalizeProgress(value: Partial<ProgressStats> | null | undefined): ProgressStats {
  return {
    attemptsByQuestion: value?.attemptsByQuestion ?? {},
    bookmarks: Array.isArray(value?.bookmarks)
      ? value.bookmarks.filter((bookmark): bookmark is string => typeof bookmark === 'string')
      : [],
    examHistory: Array.isArray(value?.examHistory)
      ? (value.examHistory as ExamHistoryEntry[])
      : [],
  };
}

function loadProgress(): ProgressStats {
  if (typeof window === 'undefined') {
    return EMPTY_PROGRESS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return EMPTY_PROGRESS;
    }
    const parsed = JSON.parse(raw) as Partial<ProgressStats>;
    return normalizeProgress(parsed);
  } catch {
    return EMPTY_PROGRESS;
  }
}

function saveProgress(progress: ProgressStats) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
}

function shuffle<T>(items: T[]) {
  const clone = [...items];
  for (let index = clone.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [clone[index], clone[randomIndex]] = [clone[randomIndex], clone[index]];
  }
  return clone;
}

function randomizeQuestionOptions(question: PracticeQuestion): PracticeQuestion {
  const shuffledOptions = shuffle(
    question.options.map((option, index) => ({
      option,
      isCorrect: index === question.correctIndex,
    })),
  );

  return {
    ...question,
    options: shuffledOptions.map((entry) => entry.option) as PracticeQuestion['options'],
    correctIndex: shuffledOptions.findIndex((entry) => entry.isCorrect),
  };
}

function getLastAttempt(progress: ProgressStats, questionId: string) {
  const attempts = progress.attemptsByQuestion[questionId] ?? [];
  return attempts.at(-1);
}

function appendAttempt(
  progress: ProgressStats,
  questionId: string,
  selectedIndex: number | null,
  isCorrect: boolean,
  mode: QuizAttempt['mode'],
) {
  const nextAttempt: QuizAttempt = {
    questionId,
    selectedIndex,
    isCorrect,
    answeredAt: new Date().toISOString(),
    mode,
  };

  return {
    ...progress,
    attemptsByQuestion: {
      ...progress.attemptsByQuestion,
      [questionId]: [...(progress.attemptsByQuestion[questionId] ?? []), nextAttempt],
    },
  };
}

function buildQuizSession(settings: QuizSettings, progress: ProgressStats) {
  if (settings.mode === 'exam') {
    return {
      questions: shuffle(practiceQuestions).slice(0, 40).map(randomizeQuestionOptions),
      answers: {},
      note:
        "Simulation 45 minutes : les mises en situation officielles ne sont pas publiques, donc cette session utilise la banque publique de connaissance.",
      mode: 'exam' as const,
      startedAt: new Date().toISOString(),
      durationSeconds: settings.durationSeconds ?? 45 * 60,
    };
  }

  let candidates = practiceQuestions.filter(
    (question) => settings.theme === 'all' || question.theme === settings.theme,
  );
  let note = '';

  if (settings.onlyIncorrect) {
    const retryCandidates = candidates.filter((question) => {
      const lastAttempt = getLastAttempt(progress, question.id);
      return !lastAttempt || !lastAttempt.isCorrect;
    });

    if (retryCandidates.length > 0) {
      candidates = retryCandidates;
    } else {
      note = "Aucune erreur récente sur ce filtre, j'ai relancé un quiz complet.";
    }
  }

  const count = Math.min(settings.count, candidates.length);
  return {
    questions: shuffle(candidates).slice(0, count).map(randomizeQuestionOptions),
    answers: {},
    note,
    mode: 'practice' as const,
    startedAt: new Date().toISOString(),
  };
}

function percentage(value: number, total: number) {
  if (!total) {
    return 0;
  }
  return Math.round((value / total) * 100);
}

function formatLastmod(lastmod?: string) {
  if (!lastmod) {
    return 'Mise à jour non précisée';
  }

  const date = new Date(lastmod);
  if (Number.isNaN(date.getTime())) {
    return lastmod;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

function getSources(sourceIds: string[]) {
  return sourceIds
    .map((sourceId) => sourceLookup.get(sourceId))
    .filter(Boolean) as OfficialDocument[];
}

function getAttemptCount(progress: ProgressStats, questionId: string) {
  return progress.attemptsByQuestion[questionId]?.length ?? 0;
}

function formatDateTime(value: string) {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'short',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value));
}

function getDayKey(value: string | Date) {
  const date = value instanceof Date ? value : new Date(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function getStreakDays(progress: ProgressStats) {
  const dayKeys = new Set(
    Object.values(progress.attemptsByQuestion)
      .flat()
      .map((attempt) => getDayKey(attempt.answeredAt)),
  );

  let streak = 0;
  const cursor = new Date();
  cursor.setHours(0, 0, 0, 0);

  while (dayKeys.has(getDayKey(cursor))) {
    streak += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return streak;
}

function MetricCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint: string;
}) {
  return (
    <article className="metric-card">
      <p>{label}</p>
      <strong>{value}</strong>
      <span>{hint}</span>
    </article>
  );
}

function TabButton({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`tab-button ${active ? 'active' : ''}`} onClick={onClick}>
      {label}
    </button>
  );
}

function BookmarkButton({
  active,
  onClick,
}: {
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button className={`bookmark-button ${active ? 'active' : ''}`} onClick={onClick}>
      {active ? 'Favori enregistré' : 'Ajouter aux favoris'}
    </button>
  );
}

export default function App() {
  const [activeTab, setActiveTab] = useState<TabKey>('overview');
  const [settings, setSettings] = useState<QuizSettings>(DEFAULT_SETTINGS);
  const [progress, setProgress] = useState<ProgressStats>(() => loadProgress());
  const [session, setSession] = useState<QuizSession | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [bankSearch, setBankSearch] = useState('');
  const [bankTheme, setBankTheme] = useState<ThemeLabel | 'all'>('all');
  const [bankStatus, setBankStatus] = useState<'all' | 'bookmarked' | 'mastered' | 'review' | 'unseen'>('all');
  const [sourceSearch, setSourceSearch] = useState('');
  const [sourceTheme, setSourceTheme] = useState<string>('all');
  const [now, setNow] = useState(() => Date.now());
  const [isExportingPdf, setIsExportingPdf] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isOnline, setIsOnline] = useState(() =>
    typeof navigator === 'undefined' ? true : navigator.onLine,
  );
  const [isInstalled, setIsInstalled] = useState(() => {
    if (typeof window === 'undefined') {
      return false;
    }

    const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
    const iosStandalone = Boolean(
      (window.navigator as Navigator & { standalone?: boolean }).standalone,
    );
    return isStandalone || iosStandalone;
  });
  const [profileMessage, setProfileMessage] = useState('');

  const finalizedSessionRef = useRef<string | null>(null);
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const audio = useQuestionAudio();

  const deferredBankSearch = useDeferredValue(bankSearch);
  const deferredSourceSearch = useDeferredValue(sourceSearch);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setInstallPromptEvent(event as BeforeInstallPromptEvent);
    };
    const handleInstalled = () => {
      setIsInstalled(true);
      setInstallPromptEvent(null);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleInstalled);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleInstalled);
    };
  }, []);

  useEffect(() => {
    if (!session || session.mode !== 'exam' || session.finishedAt) {
      return;
    }

    const timer = window.setInterval(() => {
      setNow(Date.now());
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [session]);

  const themeLabels = themeMeta.map((item) => item.label);
  const practiceByPrompt = new Map(practiceQuestions.map((question) => [question.prompt, question]));
  const bookmarkedSet = new Set(progress.bookmarks);
  const totalAttempts = Object.values(progress.attemptsByQuestion).reduce(
    (sum, attempts) => sum + attempts.length,
    0,
  );
  const totalCorrect = Object.values(progress.attemptsByQuestion).reduce(
    (sum, attempts) => sum + attempts.filter((attempt) => attempt.isCorrect).length,
    0,
  );
  const masteredCount = practiceQuestions.filter((question) => getLastAttempt(progress, question.id)?.isCorrect).length;
  const seenCount = practiceQuestions.filter((question) => getAttemptCount(progress, question.id) > 0).length;
  const accuracy = percentage(totalCorrect, totalAttempts);
  const coverage = percentage(practiceQuestions.length, officialQuestionsWithCoverage.length);
  const revisionCoverage = percentage(seenCount, practiceQuestions.length);
  const streakDays = getStreakDays(progress);
  const latestExam = progress.examHistory[0];
  const passedExams = progress.examHistory.filter((entry) => entry.passed).length;
  const averageExamAccuracy = progress.examHistory.length
    ? Math.round(
        progress.examHistory.reduce((sum, entry) => sum + entry.accuracy, 0) /
          progress.examHistory.length,
      )
    : 0;
  const bestExamAccuracy = progress.examHistory.length
    ? Math.max(...progress.examHistory.map((entry) => entry.accuracy))
    : 0;
  const bookmarkedQuestions = practiceQuestions.filter((question) => bookmarkedSet.has(question.id));
  const canInstall = Boolean(installPromptEvent);

  const currentQuestion = session?.questions[currentIndex] ?? null;
  const currentAnswer =
    currentQuestion && session ? session.answers[currentQuestion.id] : undefined;
  const currentStudyPack = currentQuestion ? getStudyPack(currentQuestion) : null;
  const examDeadline =
    session?.mode === 'exam' && session.durationSeconds
      ? new Date(session.startedAt).getTime() + session.durationSeconds * 1000
      : null;
  const remainingSeconds =
    examDeadline && !session?.finishedAt
      ? Math.max(0, Math.ceil((examDeadline - now) / 1000))
      : 0;
  const sessionFinished =
    !!session?.finishedAt ||
    (session?.mode === 'exam' && !session.finishedAt && remainingSeconds === 0);
  const currentIsCorrect =
    currentQuestion && typeof currentAnswer === 'number'
      ? currentAnswer === currentQuestion.correctIndex
      : false;
  const answeredCount = session ? Object.keys(session.answers).length : 0;
  const unansweredCount = session ? session.questions.length - answeredCount : 0;
  const quizScore = session
    ? session.questions.reduce((sum, question) => {
        const answer = session.answers[question.id];
        return sum + (answer === question.correctIndex ? 1 : 0);
      }, 0)
    : 0;
  const quizCompleted =
    !!session &&
    (session.mode === 'exam'
      ? sessionFinished
      : answeredCount === session.questions.length && session.questions.length > 0);

  const filteredOfficialQuestions = officialQuestionsWithCoverage.filter((question) => {
    const searchText = deferredBankSearch.trim().toLowerCase();
    const playable = practiceByPrompt.get(question.prompt);
    const lastAttempt = playable ? getLastAttempt(progress, playable.id) : null;
    const matchesSearch =
      !searchText ||
      question.prompt.toLowerCase().includes(searchText) ||
      question.theme.toLowerCase().includes(searchText);
    const matchesTheme = bankTheme === 'all' || question.theme === bankTheme;
    const matchesStatus =
      bankStatus === 'all' ||
      (bankStatus === 'bookmarked' && !!playable && bookmarkedSet.has(playable.id)) ||
      (bankStatus === 'mastered' && !!lastAttempt?.isCorrect) ||
      (bankStatus === 'review' && !!playable && (!lastAttempt || !lastAttempt.isCorrect)) ||
      (bankStatus === 'unseen' && !!playable && getAttemptCount(progress, playable.id) === 0);

    return matchesSearch && matchesTheme && matchesStatus;
  });

  const filteredDocuments = officialDocumentsLibrary.filter((document) => {
    const searchText = deferredSourceSearch.trim().toLowerCase();
    const matchesSearch =
      !searchText ||
      document.title.toLowerCase().includes(searchText) ||
      document.theme.toLowerCase().includes(searchText);
    const matchesTheme = sourceTheme === 'all' || document.theme === sourceTheme;
    return matchesSearch && matchesTheme;
  });

  const currentSources = currentQuestion ? getSources(currentQuestion.sourceIds) : [];
  const weakQuestions = [...practiceQuestions]
    .sort((left, right) => {
      const leftAttempt = getLastAttempt(progress, left.id);
      const rightAttempt = getLastAttempt(progress, right.id);
      const leftScore = !leftAttempt ? 2 : leftAttempt.isCorrect ? 0 : 1;
      const rightScore = !rightAttempt ? 2 : rightAttempt.isCorrect ? 0 : 1;
      return rightScore - leftScore;
    })
    .slice(0, 6);
  const smartRevisionQuestions = Array.from(
    new Map(
      [
        ...bookmarkedQuestions.filter((question) => !getLastAttempt(progress, question.id)?.isCorrect),
        ...practiceQuestions.filter((question) => {
          const lastAttempt = getLastAttempt(progress, question.id);
          return !lastAttempt || !lastAttempt.isCorrect;
        }),
        ...practiceQuestions.filter((question) => getAttemptCount(progress, question.id) === 0),
      ].map((question) => [question.id, question]),
    ).values(),
  ).slice(0, 12);
  const practiceSettings: QuizSettings = {
    count: settings.count,
    theme: settings.theme,
    onlyIncorrect: settings.onlyIncorrect,
    mode: 'practice',
  };

  function launchQuiz(nextSettings = settings) {
    const nextSession = buildQuizSession(nextSettings, progress);
    if (!nextSession.questions.length) {
      return;
    }

    finalizedSessionRef.current = null;
    audio.stop();
    startTransition(() => {
      setSettings(nextSettings);
      setSession(nextSession);
      setCurrentIndex(0);
      setNow(Date.now());
      setActiveTab('quiz');
    });
  }

  function launchExam() {
    launchQuiz({
      count: 40,
      theme: 'all',
      onlyIncorrect: false,
      mode: 'exam',
      durationSeconds: 45 * 60,
    });
  }

  function launchPracticeQuiz(overrides: Partial<QuizSettings> = {}) {
    launchQuiz({
      ...practiceSettings,
      ...overrides,
      mode: 'practice',
    });
  }

  function launchQuestionPack(questions: PracticeQuestion[], note: string) {
    const selectedQuestions = questions.slice(0, 20).map(randomizeQuestionOptions);
    if (!selectedQuestions.length) {
      return;
    }

    finalizedSessionRef.current = null;
    audio.stop();

    startTransition(() => {
      setSettings({
        count: selectedQuestions.length,
        theme: 'all',
        onlyIncorrect: false,
        mode: 'practice',
      });
      setSession({
        questions: selectedQuestions,
        answers: {},
        mode: 'practice',
        startedAt: new Date().toISOString(),
        note,
      });
      setCurrentIndex(0);
      setNow(Date.now());
      setActiveTab('quiz');
    });
  }

  function launchSingleQuestion(question: PracticeQuestion) {
    finalizedSessionRef.current = null;
    audio.stop();

    const nextSession: QuizSession = {
      questions: [randomizeQuestionOptions(question)],
      answers: {},
      mode: 'practice',
      startedAt: new Date().toISOString(),
      note: 'Question ciblée : entraîne-toi sur cette formulation avant de revenir au quiz complet.',
    };

    startTransition(() => {
      setSettings({
        ...practiceSettings,
        count: 1,
        theme: question.theme,
        onlyIncorrect: false,
        mode: 'practice',
      });
      setSession(nextSession);
      setCurrentIndex(0);
      setNow(Date.now());
      setActiveTab('quiz');
    });
  }

  function toggleBookmark(questionId: string) {
    setProgress((previous) => {
      const alreadyBookmarked = previous.bookmarks.includes(questionId);
      return {
        ...previous,
        bookmarks: alreadyBookmarked
          ? previous.bookmarks.filter((bookmark) => bookmark !== questionId)
          : [questionId, ...previous.bookmarks],
      };
    });
  }

  async function handleInstallApp() {
    if (!installPromptEvent) {
      return;
    }

    await installPromptEvent.prompt();
    const choice = await installPromptEvent.userChoice;
    if (choice.outcome === 'accepted') {
      setInstallPromptEvent(null);
      setProfileMessage("L'application a été ajoutée à ton appareil.");
    }
  }

  function handleExportProfile() {
    const payload = JSON.stringify(normalizeProgress(progress), null, 2);
    const blob = new Blob([payload], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `profil-test-civique-${new Date().toISOString().slice(0, 10)}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    setProfileMessage('Sauvegarde exportée en JSON.');
  }

  function openImportPicker() {
    importInputRef.current?.click();
  }

  function handleImportProfile(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      try {
        const parsed = JSON.parse(String(reader.result)) as Partial<ProgressStats>;
        const nextProgress = normalizeProgress(parsed);
        setProgress(nextProgress);
        finalizedSessionRef.current = null;
        setSession(null);
        setCurrentIndex(0);
        setProfileMessage('Sauvegarde importée avec succès.');
      } catch {
        setProfileMessage("Le fichier n'est pas valide. Vérifie que c'est bien une sauvegarde JSON de l'application.");
      } finally {
        event.target.value = '';
      }
    };
    reader.onerror = () => {
      setProfileMessage("Impossible de lire le fichier sélectionné.");
      event.target.value = '';
    };
    reader.readAsText(file, 'utf-8');
  }

  function finalizeSession(note?: string) {
    if (!session || session.finishedAt) {
      return;
    }

    const sessionKey = `${session.mode}:${session.startedAt}`;
    if (finalizedSessionRef.current === sessionKey) {
      return;
    }

    finalizedSessionRef.current = sessionKey;
    const finishedSession: QuizSession = {
      ...session,
      finishedAt: new Date().toISOString(),
      note: note ?? session.note,
    };

    setSession(finishedSession);

    if (session.mode === 'exam') {
      const score = finishedSession.questions.reduce((sum, question) => {
        const selectedIndex = finishedSession.answers[question.id];
        return sum + (selectedIndex === question.correctIndex ? 1 : 0);
      }, 0);
      const total = finishedSession.questions.length;
      const unansweredCount = finishedSession.questions.filter(
        (question) => typeof finishedSession.answers[question.id] !== 'number',
      ).length;
      const finishedAt = finishedSession.finishedAt ?? new Date().toISOString();
      const elapsedSeconds = Math.max(
        0,
        Math.min(
          session.durationSeconds ?? 45 * 60,
          Math.ceil(
            (new Date(finishedAt).getTime() - new Date(session.startedAt).getTime()) / 1000,
          ),
        ),
      );
      const historyEntry: ExamHistoryEntry = {
        id: `${finishedSession.startedAt}-exam`,
        startedAt: finishedSession.startedAt,
        finishedAt,
        score,
        total,
        accuracy: percentage(score, total),
        passed: score >= 32,
        unansweredCount,
        elapsedSeconds,
      };

      setProgress((previous) => {
        let nextProgress = previous;
        for (const question of finishedSession.questions) {
          const selectedIndex = finishedSession.answers[question.id];
          nextProgress = appendAttempt(
            nextProgress,
            question.id,
            typeof selectedIndex === 'number' ? selectedIndex : null,
            selectedIndex === question.correctIndex,
            'exam',
          );
        }
        return {
          ...nextProgress,
          examHistory: [historyEntry, ...nextProgress.examHistory].slice(0, 12),
        };
      });
    }

    audio.stop();
  }

  useEffect(() => {
    if (
      session &&
      session.mode === 'exam' &&
      !session.finishedAt &&
      remainingSeconds === 0
    ) {
      finalizeSession(
        'Temps écoulé : la simulation a été soumise automatiquement.',
      );
    }
  }, [session, remainingSeconds]);

  function answerQuestion(optionIndex: number) {
    if (!session || !currentQuestion || sessionFinished) {
      return;
    }

    if (session.mode === 'exam') {
      setSession({
        ...session,
        answers: {
          ...session.answers,
          [currentQuestion.id]: optionIndex,
        },
      });
      return;
    }

    if (typeof currentAnswer === 'number') {
      return;
    }

    const isCorrect = optionIndex === currentQuestion.correctIndex;
    setSession({
      ...session,
      answers: {
        ...session.answers,
        [currentQuestion.id]: optionIndex,
      },
    });
    setProgress((previous) =>
      appendAttempt(previous, currentQuestion.id, optionIndex, isCorrect, 'practice'),
    );
  }

  async function handleExportPdf() {
    try {
      setIsExportingPdf(true);
      await exportRevisionPdf({
        progress,
        questions: practiceQuestions,
      });
    } finally {
      setIsExportingPdf(false);
    }
  }

  function resetProgress() {
    finalizedSessionRef.current = null;
    setProgress(EMPTY_PROGRESS);
  }

  return (
    <div className="app-shell">
      <div className="page-orb orb-one" />
      <div className="page-orb orb-two" />
      <div className="page-orb orb-three" />

      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Préparation carte de résident 10 ans</span>
          <div className="hero-badges">
            <span className="badge subtle">Sources officielles</span>
            <span className="badge subtle">Français simple + arabe</span>
            <span className="badge subtle">Application installable</span>
          </div>
          <h1>Prépare ton examen civique avec une méthode claire, moderne et rassurante.</h1>
          <p className="hero-text">
            Application d’entraînement construite à partir de la liste officielle des
            questions CR publiée par le ministère de l’Intérieur. L’examen officiel
            comporte depuis le <strong>1er janvier 2026</strong> un QCM de
            <strong> 40 questions</strong>, dont <strong>28 questions de connaissance</strong> et
            <strong> 12 mises en situation</strong> non publiques.
          </p>
          <div className="hero-story">
            <div className="hero-story-card">
              <strong>Révise à ton rythme</strong>
              <span>Quiz rapides, favoris, audio, PDF et explications pédagogiques.</span>
            </div>
            <div className="hero-story-card">
              <strong>Pour ton usage personnel</strong>
              <span>Tout reste disponible directement dans l&apos;application, sans abonnement.</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="primary-button" onClick={() => launchPracticeQuiz({ count: 20 })}>
              Lancer un quiz de 20 questions
            </button>
            <button
              className="secondary-button"
              onClick={() => launchPracticeQuiz({ count: 20, onlyIncorrect: true })}
            >
              Réviser mes erreurs
            </button>
            <button className="secondary-button" onClick={launchExam}>
              Simulation examen
            </button>
            <button
              className="secondary-button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
            >
              {isExportingPdf ? 'Export PDF...' : 'Exporter ma fiche PDF'}
            </button>
            {(canInstall || isInstalled) && (
              <button
                className="secondary-button"
                onClick={handleInstallApp}
                disabled={isInstalled || !canInstall}
              >
                {isInstalled ? 'Application installée' : "Installer l'application"}
              </button>
            )}
            <a
              className="ghost-link"
              href={sourceLookup.get('exam-info')?.url}
              target="_blank"
              rel="noreferrer"
            >
              Voir la source officielle
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-grid">
            <MetricCard
              label="Questions officielles"
              value={String(officialQuestionsWithCoverage.length)}
              hint="Liste CR publique"
            />
            <MetricCard
              label="QCM jouables"
              value={String(practiceQuestions.length)}
              hint={`${coverage}% de couverture entraînable`}
            />
            <MetricCard
              label="Sources officielles"
              value={String(officialDocumentsLibrary.length)}
              hint="Ministère et docs associés"
            />
            <MetricCard
              label="Seuil de réussite"
              value="32 / 40"
              hint="80 % de bonnes réponses"
            />
          </div>
          <p className="hero-note">
            Les questions et thèmes viennent de sources officielles. Les propositions de
            réponses sont conçues pour l’entraînement et peuvent différer de la formulation
            exacte du jour d’examen.
          </p>
        </div>
      </header>

      <nav className="tab-bar" aria-label="Navigation principale">
        <TabButton
          label="Tableau de bord"
          active={activeTab === 'overview'}
          onClick={() => setActiveTab('overview')}
        />
        <TabButton
          label="Quiz"
          active={activeTab === 'quiz'}
          onClick={() => setActiveTab('quiz')}
        />
        <TabButton
          label="Banque officielle"
          active={activeTab === 'bank'}
          onClick={() => setActiveTab('bank')}
        />
        <TabButton
          label="Sources"
          active={activeTab === 'sources'}
          onClick={() => setActiveTab('sources')}
        />
      </nav>

      {activeTab === 'overview' && (
        <main className="page-grid">
          <section className="panel section-span-2">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Progression</p>
                <h2>Où tu en es dans la préparation</h2>
              </div>
              <button className="text-button" onClick={resetProgress}>
                Réinitialiser ma progression
              </button>
            </div>
            <div className="stats-grid">
              <MetricCard label="Tentatives" value={String(totalAttempts)} hint="Réponses enregistrées" />
              <MetricCard label="Précision" value={`${accuracy}%`} hint="Toutes sessions confondues" />
              <MetricCard label="Questions maîtrisées" value={String(masteredCount)} hint="Dernière réponse correcte" />
              <MetricCard
                label="À retravailler"
                value={String(practiceQuestions.length - masteredCount)}
                hint="Non vues ou encore fragiles"
              />
            </div>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Configurer un quiz</p>
                <h2>Simulation rapide</h2>
              </div>
            </div>

            <label className="field-label" htmlFor="theme-select">
              Thématique
            </label>
            <select
              id="theme-select"
              className="input"
              value={settings.theme}
              onChange={(event) =>
                setSettings({
                  ...practiceSettings,
                  theme: event.target.value as QuizSettings['theme'],
                  mode: 'practice',
                })
              }
            >
              <option value="all">Toutes les thématiques</option>
              {themeLabels.map((label) => (
                <option key={label} value={label}>
                  {label}
                </option>
              ))}
            </select>

            <label className="field-label">Nombre de questions</label>
            <div className="choice-row">
              {[10, 20, 40].map((count) => (
                <button
                  key={count}
                  className={`pill-button ${settings.count === count ? 'active' : ''}`}
                  onClick={() =>
                    setSettings({
                      ...practiceSettings,
                      count,
                      mode: 'practice',
                    })
                  }
                >
                  {count}
                </button>
              ))}
            </div>

            <label className="toggle-row">
              <input
                type="checkbox"
                checked={settings.onlyIncorrect}
                onChange={(event) =>
                  setSettings({
                    ...practiceSettings,
                    onlyIncorrect: event.target.checked,
                    mode: 'practice',
                  })
                }
              />
              <span>Réviser en priorité les questions ratées ou jamais vues</span>
            </label>

            <button className="primary-button wide" onClick={() => launchPracticeQuiz()}>
              Démarrer ce quiz
            </button>

            <div className="callout-box">
              <p className="callout-title">Mode examen blanc</p>
              <p>
                Lance une simulation de 40 questions avec minuteur de 45 minutes
                et soumission automatique quand le temps est écoulé.
              </p>
              <button className="secondary-button wide" onClick={launchExam}>
                Lancer l&apos;examen blanc
              </button>
            </div>
          </section>

          <section className="panel section-span-3">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Pilotage V3</p>
                <h2>Suivi personnel et raccourcis</h2>
              </div>
            </div>
            <div className="stats-grid">
              <MetricCard
                label="Questions vues"
                value={String(seenCount)}
                hint={`${revisionCoverage}% de la banque jouable`}
              />
              <MetricCard
                label="Série active"
                value={`${streakDays} jour(s)`}
                hint="Jours consécutifs avec activité"
              />
              <MetricCard
                label="Favoris"
                value={String(progress.bookmarks.length)}
                hint="Questions enregistrées"
              />
              <MetricCard
                label="Examens réussis"
                value={String(passedExams)}
                hint={
                  progress.examHistory.length
                    ? `Meilleur score ${bestExamAccuracy}%`
                    : 'Aucune simulation encore'
                }
              />
            </div>
            <div className="question-row-actions">
              <button
                className="primary-button"
                onClick={() =>
                  launchQuestionPack(
                    smartRevisionQuestions,
                    'Pack intelligent : favoris, erreurs récentes et questions jamais vues.',
                  )
                }
                disabled={!smartRevisionQuestions.length}
              >
                Lancer mon pack intelligent
              </button>
              <button
                className="secondary-button"
                onClick={() =>
                  launchQuestionPack(
                    bookmarkedQuestions,
                    'Pack favoris : révise les questions que tu as enregistrées.',
                  )
                }
                disabled={!bookmarkedQuestions.length}
              >
                Réviser mes favoris
              </button>
            </div>
            {latestExam && (
              <p className="inline-note">
                Dernière simulation : {latestExam.score} / {latestExam.total} le{' '}
                {formatDateTime(latestExam.finishedAt)}. Moyenne examen : {averageExamAccuracy}%.
              </p>
            )}
          </section>

          <section className="panel section-span-3">
            <div className="panel-header">
              <div>
                <p className="section-kicker">V4 mobile et sauvegarde</p>
                <h2>Installer l&apos;app et protéger tes données</h2>
              </div>
            </div>
            <input
              ref={importInputRef}
              className="hidden-input"
              type="file"
              accept="application/json"
              onChange={handleImportProfile}
            />
            <div className="status-strip">
              <span className={`status-badge ${isOnline ? 'mastered' : 'review'}`}>
                {isOnline ? 'En ligne' : 'Hors ligne'}
              </span>
              <span className={`status-badge ${isInstalled || canInstall ? 'covered' : 'plain'}`}>
                {isInstalled
                  ? 'App installée'
                  : canInstall
                    ? 'Installation navigateur disponible'
                    : 'Version web prête'}
              </span>
              <span className="status-badge plain">Cache hors ligne actif après première visite</span>
            </div>
            <div className="question-row-actions">
              <button
                className="primary-button"
                onClick={handleInstallApp}
                disabled={isInstalled || !canInstall}
              >
                {isInstalled
                  ? 'Déjà installée'
                  : canInstall
                    ? "Installer l'application"
                    : 'Installation depuis navigateur non proposée ici'}
              </button>
              <button className="secondary-button" onClick={handleExportProfile}>
                Exporter ma sauvegarde
              </button>
              <button className="secondary-button" onClick={openImportPicker}>
                Importer une sauvegarde
              </button>
            </div>
            <p className="muted-line">
              Tu peux installer l&apos;application sur téléphone ou ordinateur, puis exporter
              ton profil en JSON pour le restaurer plus tard sur le même appareil ou un autre.
            </p>
            {profileMessage && <p className="inline-note">{profileMessage}</p>}
          </section>

          <section className="panel section-span-3">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Révision intelligente</p>
                <h2>Questions prioritaires</h2>
              </div>
              <button
                className="secondary-button"
                onClick={handleExportPdf}
                disabled={isExportingPdf}
              >
                {isExportingPdf ? 'Préparation...' : 'Exporter PDF'}
              </button>
            </div>
            <div className="result-list">
              {weakQuestions.map((question) => {
                const pack = getStudyPack(question);
                return (
                  <article key={question.id} className="result-card">
                    <p className="result-theme">{question.theme}</p>
                    <h3>{question.prompt}</h3>
                    <p>{pack.frSimple}</p>
                    <p className="arabic-text">{pack.arSummary}</p>
                    <p className="memory-chip">{pack.memoryTip}</p>
                    <div className="question-row-actions">
                      <button
                        className="secondary-button"
                        onClick={() => launchSingleQuestion(question)}
                      >
                        Travailler cette question
                      </button>
                      <BookmarkButton
                        active={bookmarkedSet.has(question.id)}
                        onClick={() => toggleBookmark(question.id)}
                      />
                    </div>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel section-span-3">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Thématiques</p>
                <h2>Réviser par bloc officiel</h2>
              </div>
            </div>
            <div className="theme-grid">
              {themeMeta.map((meta) => {
                const practiceByTheme = practiceQuestions.filter(
                  (question) => question.theme === meta.label,
                );
                const officialByTheme = officialQuestionsWithCoverage.filter(
                  (question) => question.theme === meta.label,
                );
                const masteredByTheme = practiceByTheme.filter(
                  (question) => getLastAttempt(progress, question.id)?.isCorrect,
                ).length;

                return (
                  <article
                    key={meta.key}
                    className="theme-card"
                    style={{
                      background: meta.gradient,
                    }}
                  >
                    <div className="theme-card-top">
                      <span className="theme-icon">{meta.icon}</span>
                      <span className="theme-short">{meta.shortLabel}</span>
                    </div>
                    <h3>{meta.label}</h3>
                    <p>{meta.blurb}</p>
                    <div className="theme-metrics">
                      <span>{practiceByTheme.length} QCM jouables</span>
                      <span>{officialByTheme.length} questions officielles</span>
                      <span>{masteredByTheme} maîtrisées</span>
                    </div>
                    <div className="mini-progress">
                      <div
                        className="mini-progress-fill"
                        style={{ width: `${percentage(masteredByTheme, practiceByTheme.length)}%` }}
                      />
                    </div>
                    <button
                      className="theme-action"
                      onClick={() => launchPracticeQuiz({ count: 10, theme: meta.label, onlyIncorrect: false })}
                    >
                      Lancer 10 questions
                    </button>
                  </article>
                );
              })}
            </div>
          </section>

          <section className="panel section-span-3">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Historique examen</p>
                <h2>Mes dernières simulations</h2>
              </div>
            </div>
            {progress.examHistory.length ? (
              <div className="exam-history-list">
                {progress.examHistory.map((entry) => (
                  <article key={entry.id} className="exam-history-card">
                    <div className="question-row-top">
                      <span className={`status-badge ${entry.passed ? 'mastered' : 'review'}`}>
                        {entry.passed ? 'Réussi' : 'À retravailler'}
                      </span>
                      <span className="badge subtle">{formatDateTime(entry.finishedAt)}</span>
                    </div>
                    <h3>{entry.score} / {entry.total}</h3>
                    <p className="muted-line">
                      {entry.accuracy}% de bonnes réponses, {entry.unansweredCount} sans réponse.
                    </p>
                    <p className="muted-line">
                      Temps utilisé : {formatCountdown(entry.elapsedSeconds)}.
                    </p>
                  </article>
                ))}
              </div>
            ) : (
              <p className="muted-line">
                Aucune simulation enregistrée pour le moment. Lance un examen blanc pour créer ton historique.
              </p>
            )}
          </section>
        </main>
      )}

      {activeTab === 'quiz' && (
        <main className="page-grid">
          {!session && (
            <section className="panel section-span-3 empty-panel">
              <p className="section-kicker">Quiz</p>
              <h2>Aucune session en cours</h2>
              <p>
                Lance un quiz depuis le tableau de bord ou démarre directement une session
                d’entraînement ici.
              </p>
              <div className="stacked-actions">
                <button className="primary-button wide" onClick={() => launchPracticeQuiz()}>
                  Commencer maintenant
                </button>
                <button className="secondary-button wide" onClick={launchExam}>
                  Lancer le mode examen 45 min
                </button>
              </div>
            </section>
          )}

          {session && currentQuestion && (
            <>
              <section className="panel section-span-3 quiz-panel">
                <div className="quiz-topbar">
                  <div className="quiz-topbar-meta">
                    <span className="badge subtle">{currentQuestion.theme}</span>
                    <span className="badge">
                      {session.mode === 'exam'
                        ? 'Mode examen'
                        : `Question ${currentIndex + 1} / ${session.questions.length}`}
                    </span>
                  </div>
                  <BookmarkButton
                    active={bookmarkedSet.has(currentQuestion.id)}
                    onClick={() => toggleBookmark(currentQuestion.id)}
                  />
                </div>
                {session.mode === 'exam' && (
                  <div className="exam-banner">
                    <div className="exam-banner-metrics">
                      <div>
                        <span className="exam-label">Temps restant</span>
                        <strong
                          className={`timer-pill ${remainingSeconds <= 300 ? 'danger' : ''}`}
                        >
                          {formatCountdown(remainingSeconds)}
                        </strong>
                      </div>
                      <div>
                        <span className="exam-label">Répondues</span>
                        <strong>{answeredCount} / {session.questions.length}</strong>
                      </div>
                      <div>
                        <span className="exam-label">Sans réponse</span>
                        <strong>{unansweredCount}</strong>
                      </div>
                    </div>
                    <button
                      className="secondary-button"
                      onClick={() => finalizeSession('Session terminée manuellement.')}
                      disabled={sessionFinished}
                    >
                      Terminer l&apos;examen
                    </button>
                  </div>
                )}
                <div className="audio-bar">
                  <button
                    className="secondary-button"
                    onClick={() => audio.speak(currentQuestion)}
                    disabled={!audio.isSupported}
                  >
                    Écouter la question
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => audio.speak(currentQuestion, true)}
                    disabled={!audio.isSupported}
                  >
                    Écouter avec réponses
                  </button>
                  <button
                    className="text-button"
                    onClick={audio.stop}
                    disabled={audio.speakingKey !== currentQuestion.id}
                  >
                    Stop audio
                  </button>
                </div>
                <div className="progress-track">
                  <div
                    className="progress-fill"
                    style={{
                      width: `${percentage(
                        session.mode === 'exam'
                          ? answeredCount
                          : currentIndex + (typeof currentAnswer === 'number' ? 1 : 0),
                        session.questions.length,
                      )}%`,
                    }}
                  />
                </div>
                <h2 className="quiz-prompt">{currentQuestion.prompt}</h2>
                <div className="answer-grid">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = currentAnswer === index;
                    const isCorrectAnswer = currentQuestion.correctIndex === index;
                    const classes = [
                      'answer-button',
                      sessionFinished && isCorrectAnswer ? 'correct' : '',
                      sessionFinished && isSelected && !isCorrectAnswer ? 'wrong' : '',
                      session.mode === 'practice' &&
                      typeof currentAnswer === 'number' &&
                      isCorrectAnswer
                        ? 'correct'
                        : '',
                      session.mode === 'practice' &&
                      typeof currentAnswer === 'number' &&
                      isSelected &&
                      !isCorrectAnswer
                        ? 'wrong'
                        : '',
                      session.mode === 'exam' && !sessionFinished && isSelected
                        ? 'selected'
                        : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <button
                        key={option}
                        className={classes}
                        onClick={() => answerQuestion(index)}
                        disabled={
                          sessionFinished ||
                          (session.mode === 'practice' &&
                            typeof currentAnswer === 'number')
                        }
                      >
                        <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {((session.mode === 'practice' && typeof currentAnswer === 'number') ||
                  (session.mode === 'exam' && sessionFinished)) &&
                  currentStudyPack && (
                    <div
                      className={`feedback-card ${
                        typeof currentAnswer !== 'number'
                          ? 'neutral'
                          : currentIsCorrect
                            ? 'success'
                            : 'failure'
                      }`}
                    >
                      <p className="feedback-title">
                        {typeof currentAnswer !== 'number'
                          ? 'Sans réponse'
                          : currentIsCorrect
                            ? 'Bonne réponse'
                            : 'À revoir'}
                      </p>
                      <div className="review-grid">
                        <div>
                          <h3>Français simple</h3>
                          <p>{currentStudyPack.frSimple}</p>
                        </div>
                        <div>
                          <h3>Explication détaillée</h3>
                          <p>{currentStudyPack.frDetailed}</p>
                        </div>
                        <div>
                          <h3>العربية</h3>
                          <p className="arabic-text">{currentStudyPack.arSummary}</p>
                        </div>
                        <div>
                          <h3>Mémo</h3>
                          <p>{currentStudyPack.memoryTip}</p>
                        </div>
                      </div>
                      <div className="source-list">
                        {currentSources.map((source) => (
                          <a
                            key={source.id}
                            className="source-chip"
                            href={source.url}
                            target="_blank"
                            rel="noreferrer"
                          >
                            {source.title}
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                <div className="session-nav">
                  <button
                    className="secondary-button"
                    onClick={() => setCurrentIndex((value) => Math.max(0, value - 1))}
                    disabled={currentIndex === 0}
                  >
                    Question précédente
                  </button>
                  {session.mode === 'practice' &&
                    typeof currentAnswer === 'number' &&
                    currentIndex < session.questions.length - 1 && (
                      <button
                        className="primary-button"
                        onClick={() => setCurrentIndex((value) => value + 1)}
                      >
                        Question suivante
                      </button>
                    )}
                  {session.mode === 'exam' && (
                    <button
                      className="secondary-button"
                      onClick={() =>
                        setCurrentIndex((value) =>
                          Math.min(session.questions.length - 1, value + 1),
                        )
                      }
                      disabled={currentIndex === session.questions.length - 1}
                    >
                      Question suivante
                    </button>
                  )}
                </div>
              </section>

              <section className="panel">
                <p className="section-kicker">Session</p>
                <h2>Score en direct</h2>
                <div className="stats-grid compact">
                  <MetricCard label="Répondues" value={String(answeredCount)} hint={`${session.questions.length} au total`} />
                  <MetricCard label="Bonnes réponses" value={String(quizScore)} hint="Dans cette session" />
                </div>
                {session.note && <p className="inline-note">{session.note}</p>}
                {session.mode === 'exam' && !sessionFinished && (
                  <p className="inline-note">
                    En mode examen, tu peux modifier tes réponses jusqu’à la soumission finale.
                  </p>
                )}
              </section>

              <section className="panel">
                <p className="section-kicker">Navigation</p>
                <h2>Actions rapides</h2>
                <div className="stacked-actions">
                  <button
                    className="secondary-button wide"
                    onClick={() => launchPracticeQuiz({ theme: 'all', onlyIncorrect: false })}
                  >
                    Refaire un quiz aléatoire
                  </button>
                  <button className="secondary-button wide" onClick={launchExam}>
                    Nouvelle simulation examen
                  </button>
                  <button
                    className="secondary-button wide"
                    onClick={() => launchPracticeQuiz({ onlyIncorrect: true })}
                  >
                    Rejouer mes erreurs
                  </button>
                  <button
                    className="secondary-button wide"
                    onClick={() =>
                      launchQuestionPack(
                        bookmarkedQuestions,
                        'Pack favoris : révise les questions que tu as enregistrées.',
                      )
                    }
                    disabled={!bookmarkedQuestions.length}
                  >
                    Ouvrir mes favoris
                  </button>
                  <button className="text-button align-left" onClick={() => setActiveTab('bank')}>
                    Ouvrir la banque officielle
                  </button>
                </div>
              </section>

              {quizCompleted && (
                <section className="panel section-span-3">
                  <div className="panel-header">
                    <div>
                      <p className="section-kicker">Résultat</p>
                      <h2>Session terminée</h2>
                    </div>
                    <span className="score-pill">{`${quizScore} / ${session.questions.length}`}</span>
                  </div>
                  <p className="summary-line">
                    Si c’était une simulation sur 40 questions, l’objectif officiel est
                    <strong> 32 bonnes réponses</strong>. Ici, tu es à
                    <strong> {percentage(quizScore, session.questions.length)}%</strong>.
                  </p>
                  <div className="result-list">
                    {session.questions
                      .filter((question) => session.answers[question.id] !== question.correctIndex)
                      .slice(0, 8)
                      .map((question) => {
                        const pack = getStudyPack(question);
                        const selectedIndex = session.answers[question.id];

                        return (
                          <article key={question.id} className="result-card">
                            <p className="result-theme">{question.theme}</p>
                            <h3>{question.prompt}</h3>
                            <p className="muted-line">
                              {typeof selectedIndex === 'number'
                                ? `Ta réponse : ${String.fromCharCode(65 + selectedIndex)}. ${question.options[selectedIndex]}`
                                : 'Sans réponse sur cette question.'}
                            </p>
                            <p>
                              <strong>Bonne réponse :</strong> {pack.correctLetter}. {pack.correctOption}
                            </p>
                            <p>{pack.frSimple}</p>
                            <p className="arabic-text">{pack.arSummary}</p>
                            <p className="memory-chip">{pack.memoryTip}</p>
                            <div className="source-list">
                              {getSources(question.sourceIds).map((source) => (
                                <a
                                  key={source.id}
                                  className="source-chip"
                                  href={source.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {source.title}
                                </a>
                              ))}
                            </div>
                          </article>
                        );
                      })}
                    {quizScore === session.questions.length && (
                      <article className="result-card success-only">
                        <h3>Excellent travail</h3>
                        <p>Toutes les réponses de cette session sont correctes.</p>
                      </article>
                    )}
                  </div>
                </section>
              )}
            </>
          )}
        </main>
      )}

      {activeTab === 'bank' && (
        <main className="page-grid">
          <section className="panel section-span-3">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Liste officielle CR</p>
                <h2>Banque des questions publiques</h2>
              </div>
              <span className="badge">{`${filteredOfficialQuestions.length} résultat(s)`}</span>
            </div>
            <div className="toolbar">
              <input
                className="input"
                placeholder="Rechercher un mot-clé"
                value={bankSearch}
                onChange={(event) => setBankSearch(event.target.value)}
              />
              <select
                className="input"
                value={bankTheme}
                onChange={(event) => setBankTheme(event.target.value as ThemeLabel | 'all')}
              >
                <option value="all">Toutes les thématiques</option>
                {themeLabels.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
              <select
                className="input"
                value={bankStatus}
                onChange={(event) =>
                  setBankStatus(
                    event.target.value as 'all' | 'bookmarked' | 'mastered' | 'review' | 'unseen',
                  )
                }
              >
                <option value="all">Tous les statuts</option>
                <option value="bookmarked">Mes favoris</option>
                <option value="mastered">Maîtrisées</option>
                <option value="review">À revoir</option>
                <option value="unseen">Jamais vues</option>
              </select>
            </div>
            <div className="list-grid">
              {filteredOfficialQuestions.map((question) => {
                const playable = practiceByPrompt.get(question.prompt);
                const lastAttempt = playable ? getLastAttempt(progress, playable.id) : null;
                const pack = playable ? getStudyPack(playable) : null;
                const playableSources = playable ? getSources(playable.sourceIds) : [];

                return (
                  <article key={question.id} className="question-row">
                    <div className="question-row-top">
                      <span className="badge subtle">{question.theme}</span>
                      <div className="question-row-badges">
                        <span className={`status-badge ${question.hasPlayableTraining ? 'covered' : 'plain'}`}>
                          {question.hasPlayableTraining ? 'QCM disponible' : 'Liste officielle'}
                        </span>
                        {lastAttempt && (
                          <span className={`status-badge ${lastAttempt.isCorrect ? 'mastered' : 'review'}`}>
                            {lastAttempt.isCorrect ? 'Dernière réponse correcte' : 'À retravailler'}
                          </span>
                        )}
                      </div>
                    </div>
                    <h3>{question.prompt}</h3>
                    {playable && (
                      <p className="muted-line">
                        {getAttemptCount(progress, playable.id)} tentative(s) enregistrée(s)
                      </p>
                    )}
                    <div className="question-row-actions">
                      {playable ? (
                        <>
                          <button
                            className="primary-button"
                            onClick={() => launchSingleQuestion(playable)}
                          >
                            M&apos;entraîner sur cette question
                          </button>
                          <button
                            className="secondary-button"
                            onClick={() => audio.speak(playable, true)}
                            disabled={!audio.isSupported}
                          >
                            Écouter
                          </button>
                          <BookmarkButton
                            active={bookmarkedSet.has(playable.id)}
                            onClick={() => toggleBookmark(playable.id)}
                          />
                        </>
                      ) : (
                        <button
                          className="secondary-button"
                          onClick={() =>
                            launchPracticeQuiz({
                              count: 10,
                              theme: question.theme,
                              onlyIncorrect: false,
                            })
                          }
                        >
                          Réviser ce thème
                        </button>
                      )}
                    </div>
                    {playable && pack && (
                      <details className="details-card">
                        <summary>Voir la fiche d&apos;entraînement</summary>
                        <div className="review-grid">
                          <div>
                            <h3>Bonne réponse</h3>
                            <p>
                              {pack.correctLetter}. {pack.correctOption}
                            </p>
                          </div>
                          <div>
                            <h3>Français simple</h3>
                            <p>{pack.frSimple}</p>
                          </div>
                          <div>
                            <h3>العربية</h3>
                            <p className="arabic-text">{pack.arSummary}</p>
                          </div>
                          <div>
                            <h3>Mémo</h3>
                            <p>{pack.memoryTip}</p>
                          </div>
                        </div>
                        <div className="source-list">
                          {playableSources.map((source) => (
                            <a
                              key={source.id}
                              className="source-chip"
                              href={source.url}
                              target="_blank"
                              rel="noreferrer"
                            >
                              {source.title}
                            </a>
                          ))}
                        </div>
                      </details>
                    )}
                  </article>
                );
              })}
            </div>
          </section>
        </main>
      )}

      {activeTab === 'sources' && (
        <main className="page-grid">
          <section className="panel section-span-3">
            <div className="panel-header">
              <div>
                <p className="section-kicker">Documents officiels</p>
                <h2>Bibliothèque de référence</h2>
              </div>
              <span className="badge">{`${filteredDocuments.length} document(s)`}</span>
            </div>
            <div className="toolbar">
              <input
                className="input"
                placeholder="Rechercher une fiche, un thème, une page"
                value={sourceSearch}
                onChange={(event) => setSourceSearch(event.target.value)}
              />
              <select
                className="input"
                value={sourceTheme}
                onChange={(event) => setSourceTheme(event.target.value)}
              >
                <option value="all">Toutes les sources</option>
                <option value="Examen civique">Examen civique</option>
                {themeLabels.map((label) => (
                  <option key={label} value={label}>
                    {label}
                  </option>
                ))}
              </select>
            </div>
            <div className="source-grid">
              {filteredDocuments.map((document) => (
                <article key={document.id} className="source-card">
                  <span className="badge subtle">{document.theme}</span>
                  <h3>{document.title}</h3>
                  <p className="muted-line">{formatLastmod(document.lastmod)}</p>
                  <a href={document.url} target="_blank" rel="noreferrer" className="source-link">
                    Ouvrir la source officielle
                  </a>
                </article>
              ))}
            </div>
          </section>
        </main>
      )}
    </div>
  );
}
