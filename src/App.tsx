import {
  startTransition,
  useDeferredValue,
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
} from 'react';
import { examTrackCatalog, normalizeQuestionPrompt, sourceLookup } from './data/practice';
import { themeMeta } from './data/theme-meta';
import { useQuestionAudio } from './hooks/use-question-audio';
import {
  initializeMobileAds,
  setMobileBannerVisible,
  showMobileAdsPrivacyOptions,
  showQuestionMilestoneAd,
  showSessionCompleteAd,
} from './lib/mobile-ads';
import { exportRevisionPdf } from './lib/pdf';
import { formatCountdown, getStudyPack } from './lib/study';
import type {
  ExamTrackKey,
  ExamHistoryEntry,
  OfficialDocument,
  PracticeQuestion,
  ProgressStats,
  QuizAttempt,
  QuizSettings,
  ThemeLabel,
} from './types';

type TabKey = 'overview' | 'quiz' | 'bank' | 'sources';
type WebSectionKey =
  | 'dashboard'
  | 'practice'
  | 'progress'
  | 'priority'
  | 'themes'
  | 'bank'
  | 'sources';

type QuizSession = {
  questions: PracticeQuestion[];
  answers: Record<string, number>;
  note?: string;
  mode: QuizSettings['mode'];
  track?: ExamTrackKey;
  startedAt: string;
  durationSeconds?: number;
  finishedAt?: string;
};

type PersistedQuizState = {
  version: 1;
  session: QuizSession;
  currentIndex: number;
  settings: QuizSettings;
};

type QuestionMilestonePause = {
  completedCount: number;
  nextIndex: number;
  sessionKey: string;
  startedAt: number;
};

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{
    outcome: 'accepted' | 'dismissed';
    platform: string;
  }>;
};

type ThemeMode = 'dark' | 'light';
type ExamTrackData = (typeof examTrackCatalog)[ExamTrackKey];

const STORAGE_KEY = 'residence-civique-progress-v2';
const ACTIVE_SESSION_STORAGE_KEY = 'residence-civique-active-session-v1';
const THEME_STORAGE_KEY = 'residence-civique-theme-mode-v1';
const TRACK_STORAGE_KEY = 'residence-civique-active-track-v1';
const QUESTION_MILESTONE_INTERVAL = 10;
const LAUNCH_SCREEN_DURATION_MS = 3600;
const LAUNCH_SCREEN_MIN_REACT_MS = 700;
const PRIVACY_POLICY_URL = '/privacy-policy.html';
const ABOUT_PAGE_URL = '/about.html';
const ADMOB_TEST_MODE = import.meta.env.VITE_ADMOB_TEST_MODE !== 'false';
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

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

function isExamTrackKey(value: unknown): value is ExamTrackKey {
  return value === 'residence' || value === 'pluriannuelle' || value === 'naturalisation';
}

function isPersistedQuestion(value: unknown): value is PracticeQuestion {
  if (!isRecord(value)) {
    return false;
  }

  return (
    typeof value.id === 'string' &&
    typeof value.theme === 'string' &&
    typeof value.prompt === 'string' &&
    Array.isArray(value.options) &&
    value.options.length === 4 &&
    value.options.every((option) => typeof option === 'string') &&
    Number.isInteger(value.correctIndex) &&
    Number(value.correctIndex) >= 0 &&
    Number(value.correctIndex) <= 3 &&
    typeof value.explanation === 'string' &&
    Array.isArray(value.sourceIds) &&
    value.sourceIds.every((sourceId) => typeof sourceId === 'string') &&
    (value.difficulty === 'essentiel' || value.difficulty === 'avance')
  );
}

function loadActiveQuizState(): PersistedQuizState | null {
  if (typeof window === 'undefined') {
    return null;
  }

  try {
    const raw = window.localStorage.getItem(ACTIVE_SESSION_STORAGE_KEY);
    if (!raw) {
      return null;
    }

    const persisted = JSON.parse(raw) as unknown;
    if (!isRecord(persisted) || persisted.version !== 1 || !isRecord(persisted.session)) {
      throw new Error('Invalid persisted quiz state');
    }

    const sessionValue = persisted.session;
    const questionsValue = sessionValue.questions;
    const answersValue = sessionValue.answers;
    const mode = sessionValue.mode;

    if (
      !Array.isArray(questionsValue) ||
      questionsValue.length === 0 ||
      !questionsValue.every(isPersistedQuestion) ||
      !isRecord(answersValue) ||
      (mode !== 'practice' && mode !== 'exam') ||
      typeof sessionValue.startedAt !== 'string' ||
      Number.isNaN(new Date(sessionValue.startedAt).getTime()) ||
      typeof sessionValue.finishedAt === 'string'
    ) {
      throw new Error('Invalid persisted quiz session');
    }

    const questionIds = new Set(questionsValue.map((question) => question.id));
    const answers = Object.fromEntries(
      Object.entries(answersValue).filter(
        ([questionId, answer]) =>
          questionIds.has(questionId) &&
          Number.isInteger(answer) &&
          Number(answer) >= 0 &&
          Number(answer) <= 3,
      ),
    ) as Record<string, number>;
    const track = isExamTrackKey(sessionValue.track) ? sessionValue.track : loadExamTrack();
    const durationSeconds =
      mode === 'exam' &&
      typeof sessionValue.durationSeconds === 'number' &&
      Number.isFinite(sessionValue.durationSeconds) &&
      sessionValue.durationSeconds > 0
        ? sessionValue.durationSeconds
        : mode === 'exam'
          ? 45 * 60
          : undefined;
    const session: QuizSession = {
      questions: questionsValue,
      answers,
      mode,
      track,
      startedAt: sessionValue.startedAt,
      durationSeconds,
      ...(typeof sessionValue.note === 'string' ? { note: sessionValue.note } : {}),
    };
    const settingsValue = isRecord(persisted.settings) ? persisted.settings : {};
    const storedTheme = settingsValue.theme;
    const settings: QuizSettings = {
      count:
        typeof settingsValue.count === 'number' &&
        Number.isInteger(settingsValue.count) &&
        settingsValue.count > 0
          ? settingsValue.count
          : questionsValue.length,
      theme:
        storedTheme === 'all' ||
        (typeof storedTheme === 'string' &&
          questionsValue.some((question) => question.theme === storedTheme))
          ? (storedTheme as QuizSettings['theme'])
          : 'all',
      onlyIncorrect:
        typeof settingsValue.onlyIncorrect === 'boolean' ? settingsValue.onlyIncorrect : false,
      mode,
      ...(durationSeconds ? { durationSeconds } : {}),
    };
    const storedIndex =
      typeof persisted.currentIndex === 'number' && Number.isInteger(persisted.currentIndex)
        ? persisted.currentIndex
        : 0;

    return {
      version: 1,
      session,
      settings,
      currentIndex: Math.max(0, Math.min(questionsValue.length - 1, storedIndex)),
    };
  } catch {
    window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
    return null;
  }
}

function saveActiveQuizState(
  session: QuizSession | null,
  currentIndex: number,
  settings: QuizSettings,
) {
  if (typeof window === 'undefined') {
    return;
  }

  try {
    if (!session || session.finishedAt) {
      window.localStorage.removeItem(ACTIVE_SESSION_STORAGE_KEY);
      return;
    }

    const persisted: PersistedQuizState = {
      version: 1,
      session,
      currentIndex,
      settings,
    };
    window.localStorage.setItem(ACTIVE_SESSION_STORAGE_KEY, JSON.stringify(persisted));
  } catch {
    // A storage failure must not interrupt an active quiz.
  }
}

function getLaunchScreenDelayMs() {
  const elapsedSincePageStart =
    typeof performance !== 'undefined' && typeof performance.now === 'function' ? performance.now() : 0;

  return Math.max(LAUNCH_SCREEN_MIN_REACT_MS, LAUNCH_SCREEN_DURATION_MS - elapsedSincePageStart);
}

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

function loadThemeMode(): ThemeMode {
  if (typeof window === 'undefined') {
    return 'dark';
  }

  return window.localStorage.getItem(THEME_STORAGE_KEY) === 'light' ? 'light' : 'dark';
}

function saveThemeMode(themeMode: ThemeMode) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(THEME_STORAGE_KEY, themeMode);
}

function applyThemeMode(themeMode: ThemeMode) {
  if (typeof document === 'undefined') {
    return;
  }

  document.documentElement.dataset.theme = themeMode;
}

function loadExamTrack(): ExamTrackKey {
  if (typeof window === 'undefined') {
    return 'residence';
  }

  const storedTrack = window.localStorage.getItem(TRACK_STORAGE_KEY);
  return storedTrack === 'pluriannuelle' || storedTrack === 'naturalisation'
    ? storedTrack
    : 'residence';
}

function saveExamTrack(track: ExamTrackKey) {
  if (typeof window === 'undefined') {
    return;
  }

  window.localStorage.setItem(TRACK_STORAGE_KEY, track);
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

function getQuestionAttemptCount(progress: ProgressStats, questionId: string) {
  return progress.attemptsByQuestion[questionId]?.length ?? 0;
}

function getLastAnsweredTime(progress: ProgressStats, questionId: string) {
  const lastAttempt = getLastAttempt(progress, questionId);
  if (!lastAttempt) {
    return 0;
  }

  const timestamp = new Date(lastAttempt.answeredAt).getTime();
  return Number.isNaN(timestamp) ? 0 : timestamp;
}

function pickRotatingQuestions(
  candidates: PracticeQuestion[],
  count: number,
  progress: ProgressStats,
) {
  return shuffle(candidates)
    .map((question) => ({
      question,
      attempts: getQuestionAttemptCount(progress, question.id),
      lastAnsweredAt: getLastAnsweredTime(progress, question.id),
    }))
    .sort((left, right) => {
      if (left.attempts !== right.attempts) {
        return left.attempts - right.attempts;
      }

      return left.lastAnsweredAt - right.lastAnsweredAt;
    })
    .slice(0, count)
    .map(({ question }) => question);
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

function buildQuizSession(
  settings: QuizSettings,
  progress: ProgressStats,
  trackData: ExamTrackData,
) {
  if (settings.mode === 'exam') {
    const examCandidates = trackData.officialPracticeQuestions.length >= 40
      ? trackData.officialPracticeQuestions
      : trackData.practiceQuestions;

    return {
      questions: pickRotatingQuestions(examCandidates, 40, progress).map(
        randomizeQuestionOptions,
      ),
      answers: {},
      note: trackData.examNote,
      mode: 'exam' as const,
      track: trackData.key,
      startedAt: new Date().toISOString(),
      durationSeconds: settings.durationSeconds ?? 45 * 60,
    };
  }

  let candidates = trackData.practiceQuestions.filter(
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
    questions: pickRotatingQuestions(candidates, count, progress).map(randomizeQuestionOptions),
    answers: {},
    note:
      note ||
      'Rotation intelligente : priorité aux questions jamais vues, puis aux moins récentes.',
    mode: 'practice' as const,
    track: trackData.key,
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

function getStreakDays(progress: ProgressStats, questionIds?: Set<string>) {
  const dayKeys = new Set(
    Object.entries(progress.attemptsByQuestion)
      .filter(([questionId]) => !questionIds || questionIds.has(questionId))
      .flatMap(([, attempts]) => attempts)
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

function AppBrand() {
  return (
    <div className="app-brand" aria-label="Test Civique QCM">
      <span className="brand-mark" aria-hidden="true">
        <span className="flag-stripe blue" />
        <span className="flag-stripe white" />
        <span className="flag-stripe red" />
        <span className="brand-seal">QCM</span>
      </span>
      <span className="brand-copy">
        <strong>Test Civique</strong>
        <span>QCM</span>
      </span>
    </div>
  );
}

function LaunchScreen() {
  return (
    <main className="launch-screen" aria-label="Chargement de Test Civique QCM">
      <div className="launch-orbit" aria-hidden="true" />
      <section className="launch-card">
        <div className="launch-flag" aria-hidden="true">
          <span className="launch-flag-blue" />
          <span className="launch-flag-white" />
          <span className="launch-flag-red" />
          <strong>QCM</strong>
        </div>
        <p className="launch-republic">Préparation indépendante</p>
        <div className="launch-brand">
          <span className="brand-mark launch-brand-mark" aria-hidden="true">
            <span className="flag-stripe blue" />
            <span className="flag-stripe white" />
            <span className="flag-stripe red" />
            <span className="brand-seal">QCM</span>
          </span>
          <div>
            <span>Application d'entraînement</span>
            <h1>Test Civique QCM</h1>
          </div>
        </div>
        <p className="launch-copy">
            Préparation carte de séjour pluriannuelle, carte de résident et naturalisation française.
        </p>
        <div className="launch-loader" aria-label="Chargement en cours">
          <span />
        </div>
      </section>
    </main>
  );
}

function TrackChoiceCard({
  track,
  active,
  onSelect,
  ctaLabel = 'Ouvrir ce parcours',
}: {
  track: ExamTrackData;
  active?: boolean;
  onSelect: () => void;
  ctaLabel?: string;
}) {
  return (
    <button
      className={`track-card track-card-${track.key} ${active ? 'active' : ''}`}
      type="button"
      onClick={onSelect}
      aria-pressed={active}
    >
      <span className="track-card-glow" aria-hidden="true" />
      <span className="track-card-symbol" aria-hidden="true">
        {track.key === 'naturalisation' ? 'QCM' : track.key === 'pluriannuelle' ? 'CSP' : 'CR'}
      </span>
      <span className="track-card-badge">{track.badge}</span>
      <strong>{track.title}</strong>
      <span>{track.heroText}</span>
      <small>
        {track.officialQuestions.length} questions publiques sourcées ·{' '}
        {track.practiceQuestions.length} QCM jouables
      </small>
      <em>
        <ActionIcon
          name={
            track.key === 'naturalisation'
              ? 'results'
              : track.key === 'pluriannuelle'
                ? 'practice'
                : 'exam'
          }
          tone={track.key === 'naturalisation' ? 'green' : 'blue'}
        />
        {ctaLabel}
      </em>
    </button>
  );
}

function TrackPortal({
  onSelect,
}: {
  onSelect: (track: ExamTrackKey) => void;
}) {
  return (
    <main className="track-portal" aria-labelledby="track-portal-title">
      <section className="track-portal-copy">
        <img
          className="portal-hero-image"
          src="/hero-candidats-test-civique.png"
          alt="Des candidats adultes préparent ensemble le test civique dans une bibliothèque"
        />
        <span className="portal-image-shade" aria-hidden="true" />
        <div className="portal-tricolor" aria-hidden="true">
          <span />
          <span />
          <span />
        </div>
        <span className="eyebrow">Objectif France</span>
        <h1 id="track-portal-title">Réussis ton test civique avec confiance.</h1>
        <p>
          Choisis ton objectif, lance une simulation réaliste et avance étape par étape.
          L'idée est simple : arriver prêt, calme et sûr de toi le jour du test.
        </p>
        <div className="portal-free-badge">
          <strong>100 % gratuit</strong>
          <span>Sans abonnement. Les annonces financent l'accès libre aux entraînements.</span>
        </div>
        <div className="portal-mission-strip" aria-label="Repères de l'examen">
          <span>
            <strong>40</strong>
            questions
          </span>
          <span>
            <strong>45</strong>
            minutes
          </span>
          <span>
            <strong>32</strong>
            bonnes réponses
          </span>
        </div>
        <div className="portal-encouragement">
          <span>Prochaine étape</span>
          <strong>Choisis ton objectif, puis fais une simulation comme le vrai jour.</strong>
        </div>
        <p className="portal-independence-note">
          Plateforme d'entraînement indépendante, non affiliée à l'administration française.
        </p>
      </section>

      <section className="track-portal-grid" aria-label="Parcours disponibles">
        <TrackChoiceCard
          track={examTrackCatalog.residence}
          onSelect={() => onSelect('residence')}
          ctaLabel="Entrer dans Carte de résident"
        />
        <TrackChoiceCard
          track={examTrackCatalog.pluriannuelle}
          onSelect={() => onSelect('pluriannuelle')}
          ctaLabel="Entrer dans Séjour pluriannuel"
        />
        <TrackChoiceCard
          track={examTrackCatalog.naturalisation}
          onSelect={() => onSelect('naturalisation')}
          ctaLabel="Entrer dans Naturalisation"
        />
      </section>

      <section className="portal-editorial-guide" aria-labelledby="portal-guide-title">
        <div className="portal-guide-intro">
          <span className="eyebrow">Guide de préparation</span>
          <h2 id="portal-guide-title">Réviser avec une méthode claire</h2>
          <p>
            Les entraînements suivent les grands thèmes du programme civique. Voici une méthode
            simple pour progresser sans apprendre les réponses par cœur.
          </p>
        </div>
        <ol className="portal-guide-steps">
          <li>
            <span>01</span>
            <div>
              <strong>Choisir le bon parcours</strong>
              <p>Carte de résident, séjour pluriannuel ou naturalisation française.</p>
            </div>
          </li>
          <li>
            <span>02</span>
            <div>
              <strong>Réviser les thèmes officiels</strong>
              <p>Valeurs, institutions, droits, histoire, culture et vie en société.</p>
            </div>
          </li>
          <li>
            <span>03</span>
            <div>
              <strong>Mesurer sa progression</strong>
              <p>Faire une simulation, consulter la correction puis reprendre ses points faibles.</p>
            </div>
          </li>
        </ol>
        <p className="portal-guide-source">
          Les ressources publiques utilisées sont indiquées dans la page Sources. Cette plateforme
          indépendante n’est pas un service de l’État.
        </p>
      </section>

      <section className="portal-knowledge" aria-labelledby="portal-knowledge-title">
        <div className="portal-knowledge-heading">
          <span className="eyebrow">Comprendre avant de memoriser</span>
          <h2 id="portal-knowledge-title">Les reperes essentiels de la preparation civique</h2>
          <p>
            Une bonne revision relie chaque reponse a une notion : valeur republicaine, institution,
            droit, devoir ou situation de la vie quotidienne. Cette methode permet de reconnaitre la
            bonne idee meme lorsque la formulation de la question change.
          </p>
        </div>
        <div className="portal-knowledge-grid">
          <article>
            <h3>Valeurs et principes</h3>
            <p>Comprendre la liberte, l'egalite, la fraternite et la laicite a travers des exemples concrets.</p>
          </article>
          <article>
            <h3>Institutions</h3>
            <p>Distinguer les roles du president, du Gouvernement, du Parlement, de la justice et des collectivites.</p>
          </article>
          <article>
            <h3>Droits et devoirs</h3>
            <p>Relier les libertes individuelles au respect de la loi, des autres personnes et de l'interet general.</p>
          </article>
        </div>
      </section>

    </main>
  );
}

type WebIconName =
  | 'dashboard'
  | 'practice'
  | 'progress'
  | 'priority'
  | 'themes'
  | 'bank'
  | 'sources'
  | 'target'
  | 'exam'
  | 'quiz'
  | 'speaker'
  | 'speakerList'
  | 'stop'
  | 'previous'
  | 'next'
  | 'results'
  | 'review'
  | 'home'
  | 'download'
  | 'install'
  | 'privacy';

const WEB_ICON_PATHS: Record<WebIconName, string> = {
  dashboard: 'M4 4h6v6H4V4Zm10 0h6v6h-6V4ZM4 14h6v6H4v-6Zm10 0h6v6h-6v-6Z',
  practice:
    'M9 4h6l1 3h3a2 2 0 0 1 2 2v7a4 4 0 0 1-4 4h-1l-2-3h-4l-2 3H7a4 4 0 0 1-4-4V9a2 2 0 0 1 2-2h3l1-3ZM7 11v4m-2-2h4m7-1h.01M18 15h.01',
  progress: 'M4 20V10m5 10V5m5 15v-8m5 8V3',
  priority: 'M12 3 2.5 20h19L12 3Zm0 6v5m0 3h.01',
  themes: 'M5 4h11a3 3 0 0 1 3 3v13H8a3 3 0 0 0-3 1V4Zm3 0v16',
  bank: 'M3 10h18M5 10v8m4-8v8m6-8v8m4-8v8M3 21h18M12 3l9 5H3l9-5Z',
  sources: 'M6 3h9l4 4v14H6V3Zm9 0v5h5M9 12h7M9 16h7',
  target: 'M12 3a9 9 0 1 0 9 9M12 7a5 5 0 1 0 5 5m-5-2a2 2 0 1 0 2 2m0 0 7-7m0 0v4m0-4h-4',
  exam: 'M7 3h10v3h3v15H4V6h3V3Zm2 0v5h6V3H9Zm-1 9h8m-8 4h5',
  quiz: 'M5 4h14v16H5V4Zm3 4h8M8 12h5m-5 4h7',
  speaker: 'M5 10v4h3l4 4V6l-4 4H5Zm10-1a5 5 0 0 1 0 6m2-8a8 8 0 0 1 0 10',
  speakerList: 'M4 10v4h3l4 4V6l-4 4H4Zm11-3h5m-5 4h5m-5 4h5',
  stop: 'M7 7h10v10H7V7Z',
  previous: 'm14 6-6 6 6 6',
  next: 'm10 6 6 6-6 6',
  results: 'M4 19V9m5 10V5m5 14v-7m5 7V3M3 21h18',
  review: 'M4 4v6h6M5 9a8 8 0 1 1-1 6',
  home: 'm3 11 9-8 9 8v10h-6v-6H9v6H3V11Z',
  download: 'M12 3v12m0 0 5-5m-5 5-5-5M4 18v3h16v-3',
  install: 'M7 3h10v4h3v14H4V7h3V3Zm2 0v6h6V3H9Zm3 9v6m0 0 3-3m-3 3-3-3',
  privacy: 'M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6l-8-3Zm-3 9 2 2 4-4',
};

function WebIcon({ name, className = '' }: { name: WebIconName; className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={WEB_ICON_PATHS[name]} />
    </svg>
  );
}

type IconTone = 'cyan' | 'green' | 'gold' | 'coral' | 'blue';

function ActionIcon({ name, tone = 'cyan' }: { name: WebIconName; tone?: IconTone }) {
  return (
    <span className={`button-icon tone-${tone}`} aria-hidden="true">
      <WebIcon name={name} />
    </span>
  );
}

const WEB_NAV_ITEMS: Array<{
  key: WebSectionKey;
  label: string;
  icon: WebIconName;
}> = [
  { key: 'dashboard', label: 'Tableau de bord', icon: 'dashboard' },
  { key: 'practice', label: 'Simulations et quiz', icon: 'practice' },
  { key: 'progress', label: 'Ma progression', icon: 'progress' },
  { key: 'priority', label: 'Questions prioritaires', icon: 'priority' },
  { key: 'themes', label: 'Blocs du programme', icon: 'themes' },
  { key: 'bank', label: 'Banque de questions', icon: 'bank' },
  { key: 'sources', label: 'Sources publiques', icon: 'sources' },
];

function WebSidebar({
  activeSection,
  activeTab,
  track,
  progress,
  themeMode,
  onNavigate,
  onChangeTrack,
  onToggleTheme,
}: {
  activeSection: WebSectionKey;
  activeTab: TabKey;
  track: ExamTrackData;
  progress: number;
  themeMode: ThemeMode;
  onNavigate: (section: WebSectionKey) => void;
  onChangeTrack: () => void;
  onToggleTheme: () => void;
}) {
  const visibleSection = activeTab === 'quiz' ? 'practice' : activeSection;

  return (
    <aside className="web-sidebar" aria-label="Navigation du parcours">
      <div className="web-sidebar-brand">
        <span className="web-sidebar-mark" aria-hidden="true">
          <span />
          <span />
          <span />
          <strong>QCM</strong>
        </span>
        <span>
          <strong>Test Civique QCM</strong>
          <small>Préparation indépendante</small>
        </span>
      </div>

      <div className="web-sidebar-track">
        <span>Parcours actif</span>
        <strong>{track.shortTitle}</strong>
        <button type="button" onClick={onChangeTrack}>
          Changer de parcours
        </button>
      </div>

      <nav className="web-sidebar-nav">
        {WEB_NAV_ITEMS.map((item) => (
          <button
            key={item.key}
            className={visibleSection === item.key ? 'active' : ''}
            type="button"
            onClick={() => onNavigate(item.key)}
            aria-current={visibleSection === item.key ? 'page' : undefined}
          >
            <span className="web-nav-icon"><WebIcon name={item.icon} /></span>
            {item.label}
          </button>
        ))}
      </nav>

      <div className="web-sidebar-progress">
        <div>
          <span>Banque parcourue</span>
          <strong>{progress}%</strong>
        </div>
        <div className="web-sidebar-progress-track" aria-hidden="true">
          <span style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="web-sidebar-controls">
        <button className="web-theme-button" type="button" onClick={onToggleTheme}>
          <span aria-hidden="true">{themeMode === 'dark' ? '☀' : '◐'}</span>
          {themeMode === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit'}
        </button>
      </div>
    </aside>
  );
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
  icon,
  active,
  onClick,
}: {
  label: string;
  icon: WebIconName;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`tab-button ${active ? 'active' : ''}`}
      onClick={onClick}
    >
      <ActionIcon name={icon} tone={active ? 'cyan' : 'blue'} />
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

function isNativeRuntime() {
  if (typeof window === 'undefined') {
    return false;
  }

  const runtime = window as Window & {
    Capacitor?: { isNativePlatform?: () => boolean };
  };

  return (
    window.location.protocol === 'capacitor:' ||
    Boolean(runtime.Capacitor?.isNativePlatform?.())
  );
}

function WebSiteFooter() {
  if (isNativeRuntime()) {
    return null;
  }

  return (
    <footer className="website-footer">
      <div>
        <strong>Test Civique QCM</strong>
        <span>Entraînement indépendant pour le séjour, la résidence et la naturalisation.</span>
      </div>
      <nav aria-label="Informations du site">
        <a href={ABOUT_PAGE_URL}>À propos</a>
        <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
          Confidentialité
        </a>
      </nav>
      <p>
        Service non officiel, sans affiliation avec l'administration française. Consulte toujours
        les sources publiques de référence pour confirmer une information.
      </p>
    </footer>
  );
}

function QuizInlineAdSlot({ mobileAdsReady }: { mobileAdsReady: boolean }) {
  if (!isNativeRuntime()) {
    return null;
  }

  if (!ADMOB_TEST_MODE) {
    return null;
  }

  return (
    <aside
      className={`quiz-inline-ad native-quiz-ad ${mobileAdsReady ? 'ready' : 'preview'}`}
      aria-label="Annonce test AdMob"
    >
      <span className="native-quiz-ad-test">Test Ad</span>
      <span className="native-quiz-ad-mark" aria-hidden="true">
        Ad
      </span>
      <span className="native-quiz-ad-copy">
        <small>developers.google.com</small>
        <strong>AdMob Adaptive Banner</strong>
      </span>
      <span className="native-quiz-ad-cta">OPEN</span>
    </aside>
  );
}

type WebAdConfig = {
  client?: string;
  quizRail?: string;
  quizBreak?: string;
};

function getWebAdConfig() {
  const config = (window as Window & { TEST_CIVIQUE_ADS?: WebAdConfig }).TEST_CIVIQUE_ADS;
  return {
    client: String(config?.client ?? '').trim(),
    quizRail: String(config?.quizRail ?? '').trim(),
    quizBreak: String(config?.quizBreak ?? '').trim(),
  };
}

function WebAdSenseSlot({ placement, className = '' }: { placement: 'quizRail' | 'quizBreak'; className?: string }) {
  const adRef = useRef<HTMLModElement | null>(null);
  const requestedRef = useRef(false);
  const config = getWebAdConfig();
  const slot = config[placement];
  const enabled = !isNativeRuntime() && config.client.startsWith('ca-pub-') && /^\d+$/.test(slot);

  useEffect(() => {
    if (!enabled || requestedRef.current || !adRef.current) return;

    let script = document.querySelector<HTMLScriptElement>('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
    if (!script) {
      script = document.createElement('script');
      script.async = true;
      script.crossOrigin = 'anonymous';
      script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${encodeURIComponent(config.client)}`;
      document.head.appendChild(script);
    }

    requestedRef.current = true;
    const timeoutId = window.setTimeout(() => {
      const runtime = window as Window & { adsbygoogle?: unknown[] };
      runtime.adsbygoogle = runtime.adsbygoogle || [];
      runtime.adsbygoogle.push({});
    }, 250);
    return () => window.clearTimeout(timeoutId);
  }, [config.client, enabled]);

  if (!enabled) return null;

  return (
    <aside className={`web-ad-slot ${className}`} aria-label="Emplacement publicitaire">
      <span className="web-ad-label">Publicité</span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: 'block' }}
        data-ad-client={config.client}
        data-ad-slot={slot}
        data-ad-format="auto"
        data-full-width-responsive="true"
      />
    </aside>
  );
}

function WebTrainingHeader() {
  if (isNativeRuntime()) return null;
  return (
    <header className="training-site-header">
      <a className="training-site-logo" href="/"><span>TC</span><strong>Test Civique QCM</strong></a>
    </header>
  );
}

export default function App() {
  const [restoredQuizState] = useState(() => loadActiveQuizState());
  const [activeTab, setActiveTab] = useState<TabKey>(() =>
    restoredQuizState ? 'quiz' : 'overview',
  );
  const [webSection, setWebSection] = useState<WebSectionKey>('dashboard');
  const [settings, setSettings] = useState<QuizSettings>(
    () => restoredQuizState?.settings ?? DEFAULT_SETTINGS,
  );
  const [progress, setProgress] = useState<ProgressStats>(() => loadProgress());
  const [session, setSession] = useState<QuizSession | null>(
    () => restoredQuizState?.session ?? null,
  );
  const [currentIndex, setCurrentIndex] = useState(
    () => restoredQuizState?.currentIndex ?? 0,
  );
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
  const [mobileAdsReady, setMobileAdsReady] = useState(false);
  const [milestonePause, setMilestonePause] = useState<QuestionMilestonePause | null>(null);
  const [milestoneAdLoading, setMilestoneAdLoading] = useState(false);
  const [completionAdLoading, setCompletionAdLoading] = useState(false);
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => loadThemeMode());
  const [activeTrack, setActiveTrack] = useState<ExamTrackKey>(
    () => restoredQuizState?.session.track ?? loadExamTrack(),
  );
  const [hasSelectedTrack, setHasSelectedTrack] = useState(() => Boolean(restoredQuizState));
  const [showLaunchScreen, setShowLaunchScreen] = useState(true);

  const finalizedSessionRef = useRef<string | null>(null);
  const completedAdSessionRef = useRef<string | null>(null);
  const questionMilestoneAdRef = useRef<Set<string>>(new Set());
  const importInputRef = useRef<HTMLInputElement | null>(null);
  const completionPanelRef = useRef<HTMLElement | null>(null);
  const audio = useQuestionAudio();

  const deferredBankSearch = useDeferredValue(bankSearch);
  const deferredSourceSearch = useDeferredValue(sourceSearch);

  useEffect(() => {
    saveProgress(progress);
  }, [progress]);

  useEffect(() => {
    saveActiveQuizState(session, currentIndex, settings);
  }, [currentIndex, session, settings]);

  useEffect(() => {
    applyThemeMode(themeMode);
    saveThemeMode(themeMode);
  }, [themeMode]);

  useEffect(() => {
    saveExamTrack(activeTrack);
  }, [activeTrack]);

  useEffect(() => {
    const timeoutId = window.setTimeout(() => {
      setShowLaunchScreen(false);
    }, getLaunchScreenDelayMs());

    return () => window.clearTimeout(timeoutId);
  }, []);

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
    let isActive = true;

    initializeMobileAds().then((ready) => {
      if (isActive) {
        setMobileAdsReady(ready);
      }
    });

    return () => {
      isActive = false;
      void setMobileBannerVisible(false);
    };
  }, []);

  useEffect(() => {
    if (!mobileAdsReady) {
      return;
    }

    const shouldShowBanner = !showLaunchScreen;
    const bannerMargin = 0;

    void setMobileBannerVisible(shouldShowBanner, { margin: bannerMargin });
  }, [mobileAdsReady, showLaunchScreen]);

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

  const activeTrackData = examTrackCatalog[activeTrack];
  const practiceQuestions = activeTrackData.practiceQuestions;
  const officialPracticeQuestions = activeTrackData.officialPracticeQuestions;
  const officialQuestionsWithCoverage = activeTrackData.officialQuestionsWithCoverage;
  const supplementalTrainingQuestions = activeTrackData.supplementalTrainingQuestions;
  const officialDocumentsLibrary = activeTrackData.officialDocumentsLibrary;
  const themeLabels = themeMeta.map((item) => item.label);
  const practiceByPrompt = new Map(
    practiceQuestions.map((question) => [normalizeQuestionPrompt(question.prompt), question]),
  );
  const activeQuestionIds = new Set(practiceQuestions.map((question) => question.id));
  const activeAttempts = Object.entries(progress.attemptsByQuestion)
    .filter(([questionId]) => activeQuestionIds.has(questionId))
    .flatMap(([, attempts]) => attempts);
  const activeExamHistory = progress.examHistory.filter(
    (entry) => (entry.track ?? 'residence') === activeTrack,
  );
  const bookmarkedSet = new Set(progress.bookmarks);
  const activeBookmarks = progress.bookmarks.filter((questionId) => activeQuestionIds.has(questionId));
  const totalAttempts = activeAttempts.length;
  const totalCorrect = activeAttempts.filter((attempt) => attempt.isCorrect).length;
  const masteredCount = practiceQuestions.filter((question) => getLastAttempt(progress, question.id)?.isCorrect).length;
  const seenCount = practiceQuestions.filter((question) => getAttemptCount(progress, question.id) > 0).length;
  const accuracy = percentage(totalCorrect, totalAttempts);
  const coverage = percentage(officialPracticeQuestions.length, officialQuestionsWithCoverage.length);
  const revisionCoverage = percentage(seenCount, practiceQuestions.length);
  const streakDays = getStreakDays(progress, activeQuestionIds);
  const latestExam = activeExamHistory[0];
  const passedExams = activeExamHistory.filter((entry) => entry.passed).length;
  const averageExamAccuracy = activeExamHistory.length
    ? Math.round(
        activeExamHistory.reduce((sum, entry) => sum + entry.accuracy, 0) /
          activeExamHistory.length,
      )
    : 0;
  const bestExamAccuracy = activeExamHistory.length
    ? Math.max(...activeExamHistory.map((entry) => entry.accuracy))
    : 0;
  const bookmarkedQuestions = practiceQuestions.filter((question) => bookmarkedSet.has(question.id));
  const canInstall = Boolean(installPromptEvent);

  const currentQuestion = session?.questions[currentIndex] ?? null;
  const isLastSessionQuestion = Boolean(
    session && currentIndex === session.questions.length - 1,
  );
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
  const incorrectSessionQuestions = session
    ? session.questions.filter((question) => session.answers[question.id] !== question.correctIndex)
    : [];
  const quizAccuracy = session ? percentage(quizScore, session.questions.length) : 0;
  const quizTargetScore = session ? Math.ceil(session.questions.length * 0.8) : 0;
  const quizResultTone =
    quizAccuracy >= 80 ? 'success' : quizAccuracy >= 60 ? 'progress' : 'review';
  const quizResultTitle =
    quizResultTone === 'success'
      ? 'Objectif atteint'
      : quizResultTone === 'progress'
        ? 'Tu progresses'
        : 'À renforcer';
  const quizResultMessage =
    quizResultTone === 'success'
      ? 'Très bon rythme. Continue à varier les thèmes pour garder le niveau.'
      : quizResultTone === 'progress'
        ? 'Tu es sur la bonne voie. Rejoue les erreurs pour solidifier les réflexes.'
        : 'Pas grave, on reprend calmement les questions difficiles et ça va monter.';
  const themeResults = session
    ? themeMeta
        .map((meta) => {
          const questions = session.questions.filter((question) => question.theme === meta.label);
          const correct = questions.filter(
            (question) => session.answers[question.id] === question.correctIndex,
          ).length;
          const answered = questions.filter(
            (question) => typeof session.answers[question.id] === 'number',
          ).length;

          return {
            ...meta,
            total: questions.length,
            correct,
            answered,
            accuracy: percentage(correct, questions.length),
          };
        })
        .filter((result) => result.total > 0)
        .sort((left, right) => left.accuracy - right.accuracy)
    : [];
  const weakestThemeResult = themeResults[0] ?? null;
  const currentSessionKey = session ? `${session.mode}:${session.startedAt}` : null;
  const activeMilestonePause =
    milestonePause && currentSessionKey === milestonePause.sessionKey ? milestonePause : null;
  const milestoneQuestions =
    activeMilestonePause && session
      ? session.questions.slice(0, activeMilestonePause.completedCount)
      : [];
  const milestoneUpcomingQuestions =
    activeMilestonePause && session
      ? session.questions.slice(
          activeMilestonePause.nextIndex,
          Math.min(activeMilestonePause.nextIndex + 10, session.questions.length),
        )
      : [];
  const milestoneUpcomingThemes = Array.from(
    new Set(milestoneUpcomingQuestions.map((question) => question.theme)),
  ).slice(0, 3);
  const milestoneAnsweredCount = session
    ? milestoneQuestions.filter(
        (question) => typeof session.answers[question.id] === 'number',
      ).length
    : 0;
  const milestoneCorrectCount = session
    ? milestoneQuestions.filter(
        (question) => session.answers[question.id] === question.correctIndex,
      ).length
    : 0;
  const milestoneAccuracy = percentage(
    milestoneCorrectCount,
    Math.max(milestoneAnsweredCount, 1),
  );
  const milestoneRemainingCount = session
    ? Math.max(session.questions.length - milestoneQuestions.length, 0)
    : 0;
  const milestoneTip =
    milestoneAnsweredCount === 0
      ? 'Tu peux passer une question difficile et y revenir avant de terminer.'
      : milestoneCorrectCount / milestoneAnsweredCount >= 0.8
        ? 'Très bon rythme. Garde la même méthode pour le prochain bloc.'
        : 'Prends quelques secondes pour relire chaque proposition avant de répondre.';
  const quizCompleted =
    !!session &&
    !activeMilestonePause &&
    sessionFinished;
  const shouldShowNativeBanner = mobileAdsReady && !showLaunchScreen;
  const simulationButtonLabel =
    activeTrack === 'naturalisation'
      ? 'Simulation nationalité'
      : activeTrack === 'pluriannuelle'
        ? 'Simulation séjour pluriannuel'
        : 'Simulation carte de résident';
  const appClasses = [
    'app-shell',
    isNativeRuntime() ? 'native-runtime' : 'web-runtime',
    hasSelectedTrack ? 'track-selected' : 'active-portal',
    `active-${activeTab}`,
    `theme-${themeMode}`,
    `track-${activeTrack}`,
    `web-section-${webSection}`,
    session ? 'has-session' : 'no-session',
    quizCompleted ? 'quiz-completed' : 'quiz-running',
    activeMilestonePause ? 'milestone-pause-active' : '',
    showLaunchScreen ? 'launch-screen-active' : '',
    shouldShowNativeBanner ? 'native-ads-enabled' : 'native-ads-disabled',
  ].join(' ');

  const filteredOfficialQuestions = officialQuestionsWithCoverage.filter((question) => {
    const searchText = deferredBankSearch.trim().toLowerCase();
    const playable = practiceByPrompt.get(normalizeQuestionPrompt(question.prompt));
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
  const sourceThemeOptions = Array.from(
    new Set(officialDocumentsLibrary.map((document) => document.theme)),
  );

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
    const nextSession = buildQuizSession(nextSettings, progress, activeTrackData);
    if (!nextSession.questions.length) {
      return;
    }

    finalizedSessionRef.current = null;
    completedAdSessionRef.current = null;
    questionMilestoneAdRef.current.clear();
    setMilestonePause(null);
    setMilestoneAdLoading(false);
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
    completedAdSessionRef.current = null;
    questionMilestoneAdRef.current.clear();
    setMilestonePause(null);
    setMilestoneAdLoading(false);
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
        track: activeTrack,
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
    completedAdSessionRef.current = null;
    questionMilestoneAdRef.current.clear();
    setMilestonePause(null);
    setMilestoneAdLoading(false);
    audio.stop();

    const nextSession: QuizSession = {
      questions: [randomizeQuestionOptions(question)],
      answers: {},
      mode: 'practice',
      track: activeTrack,
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
        completedAdSessionRef.current = null;
        questionMilestoneAdRef.current.clear();
        setMilestonePause(null);
        setMilestoneAdLoading(false);
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

    const recordFinishedAttempts = (previous: ProgressStats) => {
      let nextProgress = previous;
      for (const question of finishedSession.questions) {
        const selectedIndex = finishedSession.answers[question.id];
        nextProgress = appendAttempt(
          nextProgress,
          question.id,
          typeof selectedIndex === 'number' ? selectedIndex : null,
          selectedIndex === question.correctIndex,
          session.mode,
        );
      }
      return nextProgress;
    };

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
        track: finishedSession.track ?? activeTrack,
      };

      setProgress((previous) => {
        const nextProgress = recordFinishedAttempts(previous);
        return {
          ...nextProgress,
          examHistory: [historyEntry, ...nextProgress.examHistory].slice(0, 12),
        };
      });
    } else {
      setProgress(recordFinishedAttempts);
    }

    audio.stop();
  }

  async function submitSessionFromLastQuestion() {
    if (!session || session.finishedAt || completionAdLoading) {
      return;
    }

    const sessionKey = `${session.mode}:${session.startedAt}`;
    setCompletionAdLoading(true);

    try {
      if (mobileAdsReady && completedAdSessionRef.current !== sessionKey) {
        completedAdSessionRef.current = sessionKey;
        await showSessionCompleteAd();
      }

      finalizeSession('Questionnaire soumis depuis la dernière question.');
    } finally {
      setCompletionAdLoading(false);
    }
  }

  useEffect(() => {
    if (
      session &&
      session.mode === 'exam' &&
      !session.finishedAt &&
      !activeMilestonePause &&
      remainingSeconds === 0
    ) {
      finalizeSession(
        'Temps écoulé : la simulation a été soumise automatiquement.',
      );
    }
  }, [activeMilestonePause, session, remainingSeconds]);

  useEffect(() => {
    if (!quizCompleted || activeTab !== 'quiz' || typeof window === 'undefined') {
      return;
    }

    const frameId = window.requestAnimationFrame(() => {
      const completionPanel = completionPanelRef.current;
      const scrollContainer = completionPanel?.closest('.page-grid');

      if (scrollContainer instanceof HTMLElement) {
        scrollContainer.scrollTo({ top: 0, behavior: 'auto' });
      }

      window.scrollTo({ top: 0, behavior: 'smooth' });
      completionPanel?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });

    return () => window.cancelAnimationFrame(frameId);
  }, [activeTab, quizCompleted, session?.finishedAt]);

  function moveToQuestion(nextIndex: number) {
    if (!session || activeMilestonePause) {
      return;
    }

    const boundedIndex = Math.max(0, Math.min(session.questions.length - 1, nextIndex));
    const completedQuestionCount = currentIndex + 1;
    const isForwardTransition = boundedIndex > currentIndex;
    const hasNextQuestion = boundedIndex < session.questions.length;
    const isAdMilestone = completedQuestionCount % QUESTION_MILESTONE_INTERVAL === 0;
    const milestoneKey = `${session.mode}:${session.startedAt}:${completedQuestionCount}`;

    if (
      !quizCompleted &&
      isForwardTransition &&
      hasNextQuestion &&
      isAdMilestone &&
      !questionMilestoneAdRef.current.has(milestoneKey)
    ) {
      questionMilestoneAdRef.current.add(milestoneKey);
      setMilestonePause({
        completedCount: completedQuestionCount,
        nextIndex: boundedIndex,
        sessionKey: `${session.mode}:${session.startedAt}`,
        startedAt: Date.now(),
      });
      return;
    }

    setCurrentIndex(boundedIndex);
  }

  async function continueAfterMilestonePause() {
    if (!activeMilestonePause || milestoneAdLoading) {
      return;
    }

    const pause = activeMilestonePause;
    setMilestoneAdLoading(true);
    audio.stop();

    try {
      if (mobileAdsReady) {
        await showQuestionMilestoneAd();
      }
    } finally {
      const pauseSeconds = Math.max(1, Math.ceil((Date.now() - pause.startedAt) / 1000));
      setSession((previous) => {
        if (
          !previous ||
          `${previous.mode}:${previous.startedAt}` !== pause.sessionKey ||
          previous.mode !== 'exam' ||
          previous.finishedAt ||
          !previous.durationSeconds
        ) {
          return previous;
        }

        return {
          ...previous,
          durationSeconds: previous.durationSeconds + pauseSeconds,
        };
      });
      setCurrentIndex(pause.nextIndex);
      setMilestonePause(null);
      setMilestoneAdLoading(false);
      setNow(Date.now());
    }
  }

  function answerQuestion(optionIndex: number) {
    if (!session || !currentQuestion || sessionFinished) {
      return;
    }

    setSession({
      ...session,
      answers: {
        ...session.answers,
        [currentQuestion.id]: optionIndex,
      },
    });
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

  function selectExamTrack(nextTrack: ExamTrackKey) {
    finalizedSessionRef.current = null;
    completedAdSessionRef.current = null;
    questionMilestoneAdRef.current.clear();
    audio.stop();
    setActiveTrack(nextTrack);
    setSettings(DEFAULT_SETTINGS);
    setSession(null);
    setCurrentIndex(0);
    setMilestonePause(null);
    setMilestoneAdLoading(false);
    setBankTheme('all');
    setBankStatus('all');
    setSourceTheme('all');
    setHasSelectedTrack(true);
    setActiveTab('overview');
    setWebSection('dashboard');
  }

  function openTrackPortal() {
    finalizedSessionRef.current = null;
    completedAdSessionRef.current = null;
    questionMilestoneAdRef.current.clear();
    audio.stop();
    setSession(null);
    setCurrentIndex(0);
    setMilestonePause(null);
    setMilestoneAdLoading(false);
    setHasSelectedTrack(false);
    setActiveTab('overview');
    setWebSection('dashboard');
  }

  function navigateWeb(section: WebSectionKey) {
    setWebSection(section);
    if (section === 'bank' || section === 'sources') {
      setActiveTab(section);
      return;
    }

    setActiveTab('overview');
  }

  function toggleThemeMode() {
    setThemeMode((currentThemeMode) => (currentThemeMode === 'dark' ? 'light' : 'dark'));
  }

  return (
    <div className={appClasses}>
      {showLaunchScreen ? (
        <LaunchScreen />
      ) : (
        <>
      <div className="page-orb orb-one" />
      <div className="page-orb orb-two" />
      <div className="page-orb orb-three" />

      <WebTrainingHeader />
      <AppBrand />

      <button
        className="theme-switch"
        type="button"
        onClick={toggleThemeMode}
        aria-pressed={themeMode === 'dark'}
        aria-label={themeMode === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit'}
      >
        <span className="theme-switch-text">
          {themeMode === 'dark' ? 'Mode nuit' : 'Mode jour'}
        </span>
        <span className="theme-switch-track" aria-hidden="true">
          <span className="theme-switch-thumb" />
        </span>
      </button>

      {isNativeRuntime() && (
        <button
          className="mobile-privacy-shortcut"
          type="button"
          onClick={() => void showMobileAdsPrivacyOptions()}
          aria-label="Gérer mes choix publicitaires"
          title="Gérer mes choix publicitaires"
        >
          <ActionIcon name="privacy" tone="green" />
          <span>Choix publicitaires</span>
        </button>
      )}

    {!hasSelectedTrack ? (
      <>
        <TrackPortal onSelect={selectExamTrack} />
        <WebSiteFooter />
        </>
      ) : (
        <>
          <WebSidebar
            activeSection={webSection}
            activeTab={activeTab}
            track={activeTrackData}
            progress={revisionCoverage}
            themeMode={themeMode}
            onNavigate={navigateWeb}
            onChangeTrack={openTrackPortal}
            onToggleTheme={toggleThemeMode}
          />

          <section className="web-workspace-bar" aria-label="Contexte du parcours">
            <div>
              <span>{activeTrackData.badge}</span>
              <strong>{activeTrackData.title}</strong>
            </div>
            <div className="web-workspace-actions">
              <span className="web-independent-badge">Plateforme indépendante</span>
              <button type="button" onClick={openTrackPortal}>
                Changer de parcours
              </button>
            </div>
          </section>

          <section className="workspace-header" aria-label="Parcours actif">
            <div>
              <span className="eyebrow">Espace sélectionné</span>
              <h1>{activeTrackData.title}</h1>
              <p>{activeTrackData.heroText}</p>
            </div>
            <button className="secondary-button" type="button" onClick={openTrackPortal}>
              Changer de parcours
            </button>
          </section>

      <header className="hero">
        <div className="hero-copy">
          <span className="eyebrow">Préparation examen civique · {activeTrackData.badge}</span>
          <div className="hero-badges">
            <span className="badge subtle">Sources publiques</span>
            <span className="badge subtle">Français simple + arabe</span>
            <span className="badge subtle">Application installable</span>
            <span className="badge subtle">Rotation anti-répétition</span>
            <span className="badge subtle">Gratuit, sans abonnement</span>
          </div>
          <h1>{activeTrackData.heroTitle}</h1>
          <p className="hero-text">
            {activeTrackData.heroText} Depuis le <strong>1er janvier 2026</strong>, l’examen
            civique se présente comme un QCM de <strong>40 questions</strong> avec un seuil de
            <strong> 32 bonnes réponses</strong>.
          </p>
          <div className="hero-story">
            <div className="hero-story-card">
              <strong>Révise à ton rythme</strong>
              <span>Quiz rapides, favoris, audio, PDF et explications pédagogiques.</span>
            </div>
            <div className="hero-story-card">
              <strong>Gratuit, sans abonnement</strong>
              <span>Les annonces financent l'accès libre à tous les entraînements.</span>
            </div>
          </div>
          <div className="hero-actions">
            <button className="primary-button" onClick={launchExam}>
              <ActionIcon name="exam" tone="blue" />
              {simulationButtonLabel}
            </button>
            <button className="secondary-button" onClick={() => launchPracticeQuiz({ count: 20 })}>
              <ActionIcon name="quiz" tone="cyan" />
              Lancer un quiz de 20 questions
            </button>
            <button
              className="secondary-button"
              onClick={() => launchPracticeQuiz({ count: 20, onlyIncorrect: true })}
            >
              <ActionIcon name="review" tone="coral" />
              Réviser mes erreurs
            </button>
            <button
              className="secondary-button"
              onClick={handleExportPdf}
              disabled={isExportingPdf}
            >
              <ActionIcon name="download" tone="gold" />
              {isExportingPdf ? 'Export PDF...' : 'Exporter ma fiche PDF'}
            </button>
            {(canInstall || isInstalled) && (
              <button
                className="secondary-button"
                onClick={handleInstallApp}
                disabled={isInstalled || !canInstall}
              >
                <ActionIcon name="install" tone="green" />
                {isInstalled ? 'Application installée' : "Installer l'application"}
              </button>
            )}
            <a
              className="ghost-link"
              href={sourceLookup.get(activeTrackData.primarySourceId)?.url}
              target="_blank"
              rel="noreferrer"
            >
              Voir la source officielle {activeTrackData.shortTitle}
            </a>
          </div>
        </div>

        <div className="hero-panel">
          <div className="hero-grid">
            <MetricCard
              label="Questions publiques sourcées"
              value={String(officialQuestionsWithCoverage.length)}
              hint={activeTrackData.officialHint}
            />
            <MetricCard
              label="QCM d'entraînement"
              value={String(practiceQuestions.length)}
              hint={`${officialPracticeQuestions.length} sourcés + ${supplementalTrainingQuestions.length} bonus`}
            />
            <MetricCard
              label={activeTrackData.coverageLabel}
              value={`${coverage}%`}
              hint="Questions sourcées jouables"
            />
            <MetricCard
              label="Seuil de réussite"
              value="32 / 40"
              hint="80 % de bonnes réponses"
            />
          </div>
          <p className="hero-note">
            Les thèmes et informations sont construits à partir de sources publiques de référence. Les propositions de
            réponses sont conçues pour l’entraînement et peuvent différer de la formulation
            exacte du jour d’examen. Application indépendante, non affiliée à
            l&apos;administration française.
          </p>
        </div>
      </header>

      <nav className="tab-bar" aria-label="Navigation principale">
        <TabButton
          label="Accueil"
          icon="home"
          active={activeTab === 'overview'}
          onClick={() => navigateWeb('dashboard')}
        />
        <TabButton
          label="Quiz"
          icon="quiz"
          active={activeTab === 'quiz'}
          onClick={() => setActiveTab('quiz')}
        />
        <TabButton
          label="Banque"
          icon="bank"
          active={activeTab === 'bank'}
          onClick={() => navigateWeb('bank')}
        />
        <TabButton
          label="Sources"
          icon="sources"
          active={activeTab === 'sources'}
          onClick={() => navigateWeb('sources')}
        />
        {isNativeRuntime() && (
          <>
            <button
              className="tab-button native-nav-utility"
              type="button"
              onClick={toggleThemeMode}
              aria-pressed={themeMode === 'dark'}
              aria-label={themeMode === 'dark' ? 'Passer en mode jour' : 'Passer en mode nuit'}
              title={themeMode === 'dark' ? 'Mode jour' : 'Mode nuit'}
            >
              <span className="theme-switch-track" aria-hidden="true">
                <span className="theme-switch-thumb" />
              </span>
            </button>
            <button
              className="tab-button native-nav-utility"
              type="button"
              onClick={() => void showMobileAdsPrivacyOptions()}
              aria-label="Gérer mes choix publicitaires"
              title="Choix publicitaires"
            >
              <ActionIcon name="privacy" tone="green" />
            </button>
          </>
        )}
      </nav>

      {activeTab === 'overview' && (
        <main className="web-dashboard" aria-live="polite">
          {webSection === 'dashboard' && (
            <>
              <section className="web-dashboard-hero">
                <div className="web-dashboard-hero-copy">
                  <span className="web-overline web-overline-icon">
                    <WebIcon name="dashboard" />
                    Ton espace de préparation
                  </span>
                  <h2>Avance avec un plan clair, pas avec une longue page.</h2>
                  <p>
                    Commence par une simulation, puis utilise tes résultats pour cibler les thèmes
                    et les questions qui méritent vraiment ton temps.
                  </p>
                  <div className="web-dashboard-actions">
                    <button className="primary-button" type="button" onClick={launchExam}>
                      <ActionIcon name="exam" tone="blue" />
                      {simulationButtonLabel}
                    </button>
                    <button
                      className="secondary-button"
                      type="button"
                      onClick={() => navigateWeb('practice')}
                    >
                      <ActionIcon name="quiz" tone="cyan" />
                      Personnaliser un quiz
                    </button>
                  </div>
                </div>
                <div className="web-progress-summary" aria-label={`${revisionCoverage}% de la banque parcourue`}>
                  <div
                    className="web-progress-ring"
                    style={{
                      background: `conic-gradient(var(--accent) ${revisionCoverage}%, rgba(147, 189, 255, 0.14) 0)`,
                    }}
                  >
                    <span>
                      <strong>{revisionCoverage}%</strong>
                      parcouru
                    </span>
                  </div>
                  <p>
                    <strong>{seenCount}</strong> questions vues sur {practiceQuestions.length}
                  </p>
                </div>
              </section>

              <section className="web-metric-row" aria-label="Résumé de progression">
                <article>
                  <span>Précision</span>
                  <strong>{accuracy}%</strong>
                  <small>{totalAttempts ? `${totalAttempts} réponses analysées` : 'Commence par un quiz'}</small>
                </article>
                <article>
                  <span>Maîtrisées</span>
                  <strong>{masteredCount}</strong>
                  <small>Dernière réponse correcte</small>
                </article>
                <article>
                  <span>À revoir</span>
                  <strong>{practiceQuestions.length - masteredCount}</strong>
                  <small>Non vues ou encore fragiles</small>
                </article>
                <article>
                  <span>Examens réussis</span>
                  <strong>{passedExams}</strong>
                  <small>{activeExamHistory.length ? `Meilleur score ${bestExamAccuracy}%` : 'Aucune simulation'}</small>
                </article>
              </section>

              <section className="web-dashboard-grid">
                <article className="web-focus-card">
                  <div className="web-panel-heading">
                    <div>
                      <span className="web-overline">Prochaine action</span>
                      <h3>{totalAttempts ? 'Consolide tes points faibles' : 'Mesure ton niveau réel'}</h3>
                    </div>
                    <span className="web-step-number"><WebIcon name="target" /></span>
                  </div>
                  <p>
                    {totalAttempts
                      ? 'Un pack court construit à partir de tes erreurs, favoris et questions jamais vues.'
                      : 'La simulation de 40 questions te donnera un premier diagnostic utile.'}
                  </p>
                  <button
                    className="primary-button"
                    type="button"
                    onClick={() =>
                      totalAttempts
                        ? launchQuestionPack(
                            smartRevisionQuestions,
                            'Pack intelligent : favoris, erreurs récentes et questions jamais vues.',
                          )
                        : launchExam()
                    }
                    disabled={totalAttempts > 0 && !smartRevisionQuestions.length}
                  >
                    <ActionIcon name={totalAttempts ? 'target' : 'exam'} tone={totalAttempts ? 'green' : 'blue'} />
                    {totalAttempts ? 'Lancer mon pack intelligent' : simulationButtonLabel}
                  </button>
                </article>

                <article className="web-focus-card web-focus-card-soft">
                  <div className="web-panel-heading">
                    <div>
                      <span className="web-overline">Dernier repère</span>
                      <h3>{latestExam ? `${latestExam.score} / ${latestExam.total}` : 'Pas encore de score'}</h3>
                    </div>
                    <span className="web-step-number"><WebIcon name="progress" /></span>
                  </div>
                  <p>
                    {latestExam
                      ? `Dernière simulation le ${formatDateTime(latestExam.finishedAt)}. Moyenne actuelle : ${averageExamAccuracy}%.`
                      : 'Après ton premier examen blanc, ton score et tes priorités apparaîtront ici.'}
                  </p>
                  <button className="secondary-button" type="button" onClick={() => navigateWeb('progress')}>
                    <ActionIcon name="progress" tone="gold" />
                    Voir ma progression
                  </button>
                </article>
              </section>

              <section className="web-dashboard-grid web-dashboard-grid-lower">
                <article className="web-compact-panel">
                  <div className="web-panel-heading">
                    <div>
                      <span className="web-overline">Priorités</span>
                      <h3>À travailler maintenant</h3>
                    </div>
                    <button type="button" onClick={() => navigateWeb('priority')}>Tout voir</button>
                  </div>
                  <div className="web-priority-preview">
                    {weakQuestions.slice(0, 3).map((question, index) => (
                      <button key={question.id} type="button" onClick={() => launchSingleQuestion(question)}>
                        <span>{String(index + 1).padStart(2, '0')}</span>
                        <strong>{question.prompt}</strong>
                        <small>{question.theme}</small>
                      </button>
                    ))}
                  </div>
                </article>

                <article className="web-compact-panel">
                  <div className="web-panel-heading">
                    <div>
                      <span className="web-overline">Programme de référence</span>
                      <h3>Réviser par thème</h3>
                    </div>
                    <button type="button" onClick={() => navigateWeb('themes')}>Tous les blocs</button>
                  </div>
                  <div className="web-theme-preview">
                    {themeMeta.slice(0, 4).map((meta) => {
                      const themeQuestions = practiceQuestions.filter((question) => question.theme === meta.label);
                      const themeMastered = themeQuestions.filter(
                        (question) => getLastAttempt(progress, question.id)?.isCorrect,
                      ).length;
                      return (
                        <button
                          key={meta.key}
                          type="button"
                          onClick={() => launchPracticeQuiz({ count: 10, theme: meta.label, onlyIncorrect: false })}
                        >
                          <span>{meta.icon}</span>
                          <strong>{meta.shortLabel}</strong>
                          <small>{percentage(themeMastered, themeQuestions.length)}% maîtrisé</small>
                        </button>
                      );
                    })}
                  </div>
                </article>
              </section>
            </>
          )}

          {webSection === 'practice' && (
            <section className="web-section-view">
              <header className="web-section-heading">
                <div>
                  <span className="web-overline web-overline-icon">
                    <WebIcon name="practice" />
                    Entraînement
                  </span>
                  <h2>Choisis la bonne séance pour aujourd'hui.</h2>
                  <p>La simulation reste l'action principale. Les quiz courts servent à cibler un besoin précis.</p>
                </div>
                <button className="primary-button" type="button" onClick={launchExam}>
                  <ActionIcon name="exam" tone="blue" />
                  {simulationButtonLabel}
                </button>
              </header>
              <div className="web-practice-layout">
                <article className="web-exam-card">
                  <span className="web-overline">Conditions réelles</span>
                  <h3>Simulation complète</h3>
                  <div className="web-exam-facts">
                    <span><strong>40</strong> questions</span>
                    <span><strong>45</strong> minutes</span>
                    <span><strong>32</strong> bonnes réponses</span>
                  </div>
                  <p>Les réponses ne sont corrigées qu'à la fin, comme dans un examen blanc.</p>
                  <button className="primary-button" type="button" onClick={launchExam}>
                    Commencer la simulation
                  </button>
                </article>

                <article className="web-quiz-builder">
                  <span className="web-overline">Séance personnalisée</span>
                  <h3>Créer un quiz court</h3>
                  <label htmlFor="web-theme-select">Thématique</label>
                  <select
                    id="web-theme-select"
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
                    {themeLabels.map((label) => <option key={label} value={label}>{label}</option>)}
                  </select>
                  <label>Nombre de questions</label>
                  <div className="web-count-picker">
                    {[10, 20, 40].map((count) => (
                      <button
                        key={count}
                        className={settings.count === count ? 'active' : ''}
                        type="button"
                        onClick={() => setSettings({ ...practiceSettings, count, mode: 'practice' })}
                      >
                        {count}
                      </button>
                    ))}
                  </div>
                  <label className="web-check-row">
                    <input
                      type="checkbox"
                      checked={settings.onlyIncorrect}
                      onChange={(event) =>
                        setSettings({ ...practiceSettings, onlyIncorrect: event.target.checked, mode: 'practice' })
                      }
                    />
                    Prioriser mes erreurs et les questions jamais vues
                  </label>
                  <button className="secondary-button" type="button" onClick={() => launchPracticeQuiz()}>
                    Lancer ce quiz
                  </button>
                </article>
              </div>
            </section>
          )}

          {webSection === 'progress' && (
            <section className="web-section-view">
              <header className="web-section-heading">
                <div>
                  <span className="web-overline">Progression</span>
                  <h2>Les chiffres utiles, sans tableau surchargé.</h2>
                  <p>Ces indicateurs sont enregistrés sur cet appareil et évoluent après chaque séance.</p>
                </div>
                <button className="secondary-button" type="button" onClick={resetProgress}>
                  Réinitialiser
                </button>
              </header>
              <section className="web-metric-row web-metric-row-large">
                <article><span>Questions vues</span><strong>{seenCount}</strong><small>{revisionCoverage}% de la banque</small></article>
                <article><span>Précision</span><strong>{accuracy}%</strong><small>{totalAttempts} tentatives</small></article>
                <article><span>Série active</span><strong>{streakDays} j</strong><small>Jours consécutifs</small></article>
                <article><span>Favoris</span><strong>{activeBookmarks.length}</strong><small>Questions enregistrées</small></article>
                <article><span>Moyenne examen</span><strong>{averageExamAccuracy}%</strong><small>{activeExamHistory.length} simulation(s)</small></article>
                <article><span>Meilleur score</span><strong>{bestExamAccuracy}%</strong><small>{passedExams} examen(s) réussi(s)</small></article>
              </section>
              <article className="web-history-panel">
                <div className="web-panel-heading">
                  <div><span className="web-overline">Historique</span><h3>Dernières simulations</h3></div>
                </div>
                {activeExamHistory.length ? (
                  <div className="web-history-list">
                    {activeExamHistory.slice(0, 6).map((entry) => (
                      <div key={`${entry.finishedAt}-${entry.score}`}>
                        <span>{formatDateTime(entry.finishedAt)}</span>
                        <strong>{entry.score} / {entry.total}</strong>
                        <small>{entry.accuracy}% · {entry.passed ? 'Objectif atteint' : 'À renforcer'}</small>
                      </div>
                    ))}
                  </div>
                ) : <p className="web-empty-state">Aucune simulation terminée pour le moment.</p>}
              </article>
            </section>
          )}

          {webSection === 'priority' && (
            <section className="web-section-view">
              <header className="web-section-heading">
                <div>
                  <span className="web-overline">Révision intelligente</span>
                  <h2>Travaille d'abord ce qui fera progresser ton score.</h2>
                  <p>La sélection privilégie les erreurs récentes et les questions encore jamais vues.</p>
                </div>
                <button
                  className="primary-button"
                  type="button"
                  disabled={!smartRevisionQuestions.length}
                  onClick={() => launchQuestionPack(smartRevisionQuestions, 'Pack intelligent de révision ciblée.')}
                >
                  Lancer le pack intelligent
                </button>
              </header>
              <div className="web-priority-grid">
                {weakQuestions.map((question, index) => {
                  const attempt = getLastAttempt(progress, question.id);
                  return (
                    <article key={question.id}>
                      <div><span>{String(index + 1).padStart(2, '0')}</span><small>{question.theme}</small></div>
                      <h3>{question.prompt}</h3>
                      <p>{!attempt ? 'Question pas encore vue' : attempt.isCorrect ? 'À consolider' : 'Dernière réponse incorrecte'}</p>
                      <button className="secondary-button" type="button" onClick={() => launchSingleQuestion(question)}>
                        Travailler cette question
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          )}

          {webSection === 'themes' && (
            <section className="web-section-view">
              <header className="web-section-heading">
                <div>
                  <span className="web-overline">Programme de référence</span>
                  <h2>Révise bloc par bloc, avec une vision immédiate.</h2>
                  <p>Chaque carte résume le volume disponible et ton niveau actuel dans le thème.</p>
                </div>
              </header>
              <div className="web-official-grid">
                {themeMeta.map((meta) => {
                  const themeQuestions = practiceQuestions.filter((question) => question.theme === meta.label);
                  const officialByTheme = officialQuestionsWithCoverage.filter((question) => question.theme === meta.label);
                  const themeMastered = themeQuestions.filter(
                    (question) => getLastAttempt(progress, question.id)?.isCorrect,
                  ).length;
                  const themePercent = percentage(themeMastered, themeQuestions.length);
                  return (
                    <article key={meta.key}>
                      <div className="web-theme-card-top"><span>{meta.icon}</span><small>{meta.shortLabel}</small></div>
                      <h3>{meta.label}</h3>
                      <p>{meta.blurb}</p>
                      <div className="web-theme-card-meta">
                        <span>{themeQuestions.length} QCM</span>
                        <span>{officialByTheme.length} sourcées</span>
                        <strong>{themePercent}%</strong>
                      </div>
                      <div className="web-theme-progress"><span style={{ width: `${themePercent}%` }} /></div>
                      <button
                        className="secondary-button"
                        type="button"
                        onClick={() => launchPracticeQuiz({ count: 10, theme: meta.label, onlyIncorrect: false })}
                      >
                        Lancer 10 questions
                      </button>
                    </article>
                  );
                })}
              </div>
            </section>
          )}
        </main>
      )}

      {activeTab === 'overview' && (
        <main className="page-grid legacy-overview">
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
                value={String(activeBookmarks.length)}
                hint={`Questions ${activeTrackData.shortTitle.toLowerCase()}`}
              />
              <MetricCard
                label="Examens réussis"
                value={String(passedExams)}
                hint={
                  activeExamHistory.length
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
              <span className={`status-badge ${mobileAdsReady ? 'covered' : 'plain'}`}>
                {mobileAdsReady ? 'Pubs Android actives' : 'Pubs actives sur Android'}
              </span>
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
              <button className="secondary-button" onClick={showMobileAdsPrivacyOptions}>
                Gérer mes choix publicitaires
              </button>
            </div>
            <p className="muted-line">
              Tu peux installer l&apos;application sur téléphone ou ordinateur, puis exporter
              ton profil en JSON pour le restaurer plus tard sur le même appareil ou un autre.
            </p>
            <p className="muted-line">
              Application indépendante, non officielle.{' '}
              <a href={PRIVACY_POLICY_URL} target="_blank" rel="noreferrer">
                Politique de confidentialité
              </a>
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
                <h2>Réviser par bloc du programme</h2>
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
                      <span>{officialByTheme.length} questions publiques sourcées</span>
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
            {activeExamHistory.length ? (
              <div className="exam-history-list">
                {activeExamHistory.map((entry) => (
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
        <main className={`page-grid ${session ? 'quiz-session-grid' : 'quiz-empty-grid'}`}>
          {!session && (
            <section className="panel section-span-3 empty-panel">
              <p className="section-kicker">Quiz</p>
              <h2>Aucune session en cours</h2>
              <p>
                Lance un quiz depuis le tableau de bord ou démarre directement une session
                d’entraînement ici.
              </p>
              <div className="stacked-actions">
                <button className="primary-button wide" onClick={launchExam}>
                  <ActionIcon name="exam" tone="blue" />
                  {simulationButtonLabel}
                </button>
                <button className="secondary-button wide" onClick={() => launchPracticeQuiz()}>
                  <ActionIcon name="quiz" tone="cyan" />
                  Commencer un quiz rapide
                </button>
              </div>
            </section>
          )}

          {session && currentQuestion && (
            <>
              <section className="panel section-span-3 quiz-panel">
                {!isNativeRuntime() && (
                  <div className="quiz-editorial-intro">
                    <span>Exercice corrigé</span>
                    <p>Réponds à la question puis consulte l'explication, le mémo et les sources. En mode exercice, le contenu pédagogique fait partie de chaque étape.</p>
                  </div>
                )}
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
                  </div>
                )}
                <div className="audio-bar">
                  <button
                    className="secondary-button"
                    onClick={() => audio.speak(currentQuestion)}
                    disabled={!audio.isSupported}
                  >
                    <ActionIcon name="speaker" tone="cyan" />
                    Écouter la question
                  </button>
                  <button
                    className="secondary-button"
                    onClick={() => audio.speak(currentQuestion, true)}
                    disabled={!audio.isSupported}
                  >
                    <ActionIcon name="speakerList" tone="green" />
                    Écouter avec réponses
                  </button>
                  <button
                    className="text-button"
                    onClick={audio.stop}
                    disabled={audio.speakingKey !== currentQuestion.id}
                  >
                    <ActionIcon name="stop" tone="coral" />
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
                <div className="quiz-prompt-card">
                  <div className="quiz-prompt-meta">
                    <span>Question {currentIndex + 1} sur {session.questions.length}</span>
                    <span>{currentQuestion.theme}</span>
                  </div>
                  <h2 className="quiz-prompt">{currentQuestion.prompt}</h2>
                </div>
                <div className="answer-grid">
                  {currentQuestion.options.map((option, index) => {
                    const isSelected = currentAnswer === index;
                    const isCorrectAnswer = currentQuestion.correctIndex === index;
                    const classes = [
                      'answer-button',
                      sessionFinished && isCorrectAnswer ? 'correct' : '',
                      sessionFinished && isSelected && !isCorrectAnswer ? 'wrong' : '',
                      !sessionFinished && isSelected ? 'selected' : '',
                    ]
                      .filter(Boolean)
                      .join(' ');

                    return (
                      <button
                        key={option}
                        className={classes}
                        onClick={() => answerQuestion(index)}
                        disabled={sessionFinished}
                      >
                        <span className="answer-letter">{String.fromCharCode(65 + index)}</span>
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>

                {(sessionFinished || (session.mode === 'practice' && typeof currentAnswer === 'number')) && currentStudyPack && (
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
                    onClick={() => moveToQuestion(currentIndex - 1)}
                    disabled={currentIndex === 0}
                  >
                    <ActionIcon name="previous" tone="blue" />
                    Question précédente
                  </button>
                  {!isLastSessionQuestion && (
                    <button
                      className="secondary-button"
                      onClick={() => moveToQuestion(currentIndex + 1)}
                    >
                      <ActionIcon name="next" tone="cyan" />
                      Question suivante
                    </button>
                  )}
                  {isLastSessionQuestion && (
                    <button
                      className="primary-button result-submit-button"
                      onClick={() => void submitSessionFromLastQuestion()}
                      disabled={sessionFinished || completionAdLoading}
                    >
                      <ActionIcon name="results" tone="green" />
                      {completionAdLoading ? 'Ouverture des résultats...' : 'Voir mes résultats'}
                    </button>
                  )}
                </div>
                <QuizInlineAdSlot mobileAdsReady={mobileAdsReady} />
              </section>

              {!isNativeRuntime() && currentQuestion && !sessionFinished && (
                <aside
                  className="quiz-learning-rail"
                  aria-label="Méthode de révision et publicité"
                >
                  <section className="quiz-learning-card">
                    <p className="section-kicker">Repère utile</p>
                    <h3>Réponds avec une méthode simple</h3>
                    <ol className="quiz-method-list">
                      <li>
                        <strong>Lis la question</strong>
                        <span>Repère l’institution, le droit ou la valeur demandée.</span>
                      </li>
                      <li>
                        <strong>Élimine l’impossible</strong>
                        <span>
                          Compare chaque proposition avec le rôle réel de l’institution.
                        </span>
                      </li>
                      <li>
                        <strong>Choisis calmement</strong>
                        <span>Tu peux passer une question et y revenir avant la fin.</span>
                      </li>
                    </ol>
                    <div className="quiz-current-focus">
                      <span>Thème en cours</span>
                      <strong>{currentQuestion.theme}</strong>
                    </div>
                  </section>
                  {session.mode === 'practice' && <WebAdSenseSlot placement="quizRail" className="web-ad-rail" />}
                </aside>
              )}

              {activeMilestonePause && (
                <section
                  className="milestone-break"
                  role="dialog"
                  aria-modal="true"
                  aria-labelledby="milestone-title"
                >
                  <div className="milestone-card">
                    <div className="milestone-visual" aria-hidden="true">
                      <span className="milestone-ring" />
                      <span className="milestone-ring secondary" />
                      <span className="milestone-spark spark-one" />
                      <span className="milestone-spark spark-two" />
                      <strong>{activeMilestonePause.completedCount}</strong>
                    </div>
                    <p className="section-kicker">Point d'étape</p>
                    <h2 id="milestone-title">Bravo, tu avances bien.</h2>
                    <p className="milestone-copy">
                      Voici ton bilan intermédiaire après {activeMilestonePause.completedCount}
                      questions. Respire un instant avant le prochain bloc.
                    </p>
                    <div className="milestone-stats">
                      <span>{milestoneAnsweredCount} répondue(s)</span>
                      <span>{milestoneCorrectCount} correcte(s)</span>
                      <span>{milestoneRemainingCount} restante(s)</span>
                    </div>
                    <div className="milestone-learning-summary">
                      <strong>Conseil pour le prochain bloc</strong>
                      <span>{milestoneTip}</span>
                    </div>
                    <div className="milestone-study-plan">
                      <div>
                        <p className="section-kicker">Bloc suivant</p>
                        <h3>Ce que tu vas travailler</h3>
                        <p>
                          Les thèmes du prochain bloc sont annoncés pour t’aider à reprendre avec
                          un objectif clair.
                        </p>
                      </div>
                      <div className="milestone-theme-chips">
                        {milestoneUpcomingThemes.map((theme) => (
                          <span key={theme}>{theme}</span>
                        ))}
                      </div>
                      <div className="milestone-progress-note">
                        <strong>{milestoneAccuracy}%</strong>
                        <span>de réussite sur les réponses données dans les blocs terminés.</span>
                      </div>
                    </div>
                    <div className="milestone-resume-zone">
                      {!isNativeRuntime() && session?.mode === 'practice' && (
                        <WebAdSenseSlot placement="quizBreak" className="web-ad-pause" />
                      )}
                      <button
                        className="primary-button wide"
                        onClick={continueAfterMilestonePause}
                        disabled={milestoneAdLoading}
                      >
                        {milestoneAdLoading
                          ? 'Préparation de la suite...'
                          : `Continuer vers la question ${activeMilestonePause.nextIndex + 1}`}
                      </button>
                      {mobileAdsReady && (
                        <p className="muted-line">
                          Sur Android, une courte pub peut s&apos;afficher avant la reprise.
                          Le chrono de l&apos;examen ne te pénalise pas pendant cette pause.
                        </p>
                      )}
                    </div>
                  </div>
                </section>
              )}

              <section className="panel quiz-side-panel quiz-session-panel">
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

              <section className="panel quiz-side-panel quiz-actions-panel">
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
                    Ouvrir la banque de questions
                  </button>
                </div>
              </section>

              {quizCompleted && (
                <section
                  ref={completionPanelRef}
                  className={`panel section-span-3 completion-panel result-${quizResultTone}`}
                >
                  <div className="result-dashboard">
                    <div className="result-summary-card">
                  <div className="score-hero">
                    <div
                      className="score-ring"
                      style={{
                        background: `conic-gradient(var(--score-accent) ${quizAccuracy * 3.6}deg, rgba(147, 189, 255, 0.14) 0deg)`,
                      }}
                    >
                      <div>
                        <strong>{quizAccuracy}%</strong>
                        <span>{quizScore} / {session.questions.length}</span>
                      </div>
                    </div>
                    <div className="score-hero-copy">
                      <p className="section-kicker">Résultat</p>
                      <h2>{quizResultTitle}</h2>
                      <p>{quizResultMessage}</p>
                      <span className="score-target">
                        Objectif indicatif : {quizTargetScore} bonnes réponses sur{' '}
                        {session.questions.length}
                      </span>
                    </div>
                  </div>
                  <div className="completion-scoreboard">
                    <div className="completion-score-card primary">
                      <span>Score final</span>
                      <strong>{quizScore} / {session.questions.length}</strong>
                    </div>
                    <div className="completion-score-card">
                      <span>Réussite</span>
                      <strong>{quizAccuracy}%</strong>
                    </div>
                    <div className="completion-score-card">
                      <span>Sans réponse</span>
                      <strong>{unansweredCount}</strong>
                    </div>
                  </div>
                  <div className="result-actions">
                    <button className="primary-button" onClick={launchExam}>
                      <ActionIcon name="exam" tone="blue" />
                      Nouvelle simulation examen
                    </button>
                    <button
                      className="secondary-button"
                      onClick={() => launchPracticeQuiz({ onlyIncorrect: true })}
                    >
                      <ActionIcon name="review" tone="coral" />
                      Réviser mes erreurs
                    </button>
                    <button className="secondary-button" onClick={() => setActiveTab('overview')}>
                      <ActionIcon name="home" tone="cyan" />
                      Retour accueil
                    </button>
                  </div>
                    </div>

                    <div className="result-guidance-card">
                      <p className="section-kicker">Prochaine étape</p>
                      <h3>Transforme ton résultat en plan de révision</h3>
                      <p className="muted-line">
                        Ton score reste visible immédiatement. Consulte les corrections et les
                        résultats par thématique juste dessous.
                      </p>
                    </div>
                  </div>
                  <div className="theme-results-section">
                    <div className="result-review-header theme-results-header">
                      <div>
                        <p className="section-kicker">Analyse par thématique</p>
                        <h3>Ton profil de maîtrise</h3>
                      </div>
                      <span className="badge subtle">{themeResults.length} thème(s) évalué(s)</span>
                    </div>
                    <div className="theme-results-grid">
                      {themeResults.map((result) => {
                        const tone =
                          result.accuracy >= 80
                            ? 'strong'
                            : result.accuracy >= 60
                              ? 'progress'
                              : 'review';
                        const status =
                          tone === 'strong'
                            ? 'Point fort'
                            : tone === 'progress'
                              ? 'En progression'
                              : 'À renforcer';

                        return (
                          <article key={result.key} className={`theme-result-card ${tone}`}>
                            <div className="theme-result-card-top">
                              <span className="theme-result-icon" aria-hidden="true">{result.icon}</span>
                              <span className="theme-result-status">{status}</span>
                            </div>
                            <h4>{result.label}</h4>
                            <div className="theme-result-score">
                              <strong>{result.accuracy}%</strong>
                              <span>{result.correct} / {result.total} correctes</span>
                            </div>
                            <div
                              className="theme-result-progress"
                              role="progressbar"
                              aria-label={`${result.label} : ${result.accuracy}%`}
                              aria-valuemin={0}
                              aria-valuemax={100}
                              aria-valuenow={result.accuracy}
                            >
                              <span style={{ width: `${result.accuracy}%` }} />
                            </div>
                            <small>{result.answered} question(s) répondue(s) sur {result.total}</small>
                          </article>
                        );
                      })}
                    </div>
                  </div>
                  {!isNativeRuntime() && (
                    <section className="result-learning-ad">
                      <div className="result-next-step">
                        <p className="section-kicker">Conseil de révision</p>
                        <h3>Commence par ton thème le plus faible</h3>
                        <p>
                          {weakestThemeResult
                            ? `Priorité : ${weakestThemeResult.label}. Tu as obtenu ${weakestThemeResult.accuracy}% sur ce thème.`
                            : 'Relance une session pour obtenir un plan de révision par thématique.'}
                        </p>
                      </div>
                    </section>
                  )}
                  <div className="result-review-header">
                    <div>
                      <p className="section-kicker">Corrections rapides</p>
                      <h3>{incorrectSessionQuestions.length ? 'Questions a revoir' : 'Session parfaite'}</h3>
                    </div>
                    <span className="badge subtle">
                      {incorrectSessionQuestions.length
                        ? `${Math.min(incorrectSessionQuestions.length, 6)} affichee(s)`
                        : 'Aucune erreur'}
                    </span>
                  </div>
                  <div className="result-list">
                    {incorrectSessionQuestions
                      .slice(0, 6)
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
                <p className="section-kicker">{activeTrackData.questionListTitle}</p>
                <h2>Banque de questions d’entraînement</h2>
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
                const playable = practiceByPrompt.get(normalizeQuestionPrompt(question.prompt));
                const lastAttempt = playable ? getLastAttempt(progress, playable.id) : null;
                const pack = playable ? getStudyPack(playable) : null;
                const playableSources = playable ? getSources(playable.sourceIds) : [];

                return (
                  <article key={question.id} className="question-row">
                    <div className="question-row-top">
                      <span className="badge subtle">{question.theme}</span>
                      <div className="question-row-badges">
                        <span className={`status-badge ${question.hasPlayableTraining ? 'covered' : 'plain'}`}>
                          {question.hasPlayableTraining ? 'QCM disponible' : 'Question publique'}
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
                <p className="section-kicker">{activeTrackData.sourceTitle}</p>
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
                {sourceThemeOptions.map((theme) => (
                  <option key={theme} value={theme}>
                    {theme}
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
          <WebSiteFooter />
        </>
      )}
        </>
      )}
    </div>
  );
}
