import type {
  OfficialDocument,
  PracticeQuestion,
  ProgressStats,
  QuizAttempt,
  QuizSession,
  QuizSettings,
  SessionMode,
  StudyPack,
  ThemeLabel,
} from '../types';

const ARABIC_THEME_GUIDE: Record<ThemeLabel, string> = {
  'Principes et valeurs de la République':
    'هذا المحور يركز على قيم الجمهورية الفرنسية مثل الحرية والمساواة والعلمانية ورموز الدولة.',
  'Système institutionnel et politique':
    'هذا المحور يشرح مؤسسات الدولة الفرنسية مثل الرئيس والحكومة والبرلمان والاتحاد الأوروبي.',
  'Droits et devoirs':
    'هذا المحور يتعلق بالحقوق الأساسية والواجبات واحترام القانون وحماية الأشخاص.',
  'Histoire, géographie et culture':
    'هذا المحور يجمع التواريخ الأساسية والجغرافيا الفرنسية والمعالم الثقافية التي يجب حفظها.',
  'Vivre dans la société française':
    'هذا المحور يشرح الحياة اليومية في فرنسا مثل المدرسة والصحة والعمل والأسرة والسكن.',
};

const FRENCH_THEME_GUIDE: Record<ThemeLabel, string> = {
  'Principes et valeurs de la République':
    'Retenir les principes qui protègent la liberté de chacun et les symboles officiels de la République.',
  'Système institutionnel et politique':
    "Retenir qui décide, qui gouverne, qui vote la loi et comment s'organisent l'État et l'Union européenne.",
  'Droits et devoirs':
    'Retenir les libertés garanties, les limites prévues par la loi et les obligations à respecter.',
  'Histoire, géographie et culture':
    'Retenir les grandes dates, les personnages connus et les repères géographiques et culturels.',
  'Vivre dans la société française':
    'Retenir les règles concrètes de la vie en France : école, santé, emploi, famille et logement.',
};

const KEYWORD_GUIDES = [
  {
    pattern: /laïcit|religion|neutralit|charte de la laïcité/i,
    fr: "Ici, le mot-clé est la laïcité : l'État est neutre et chacun garde sa liberté de conscience.",
    ar: 'الفكرة الأساسية هنا هي العلمانية: الدولة محايدة دينيا، وكل شخص حر في معتقده.',
    tip: 'Quand tu vois laïcité, pense toujours à neutralité de l’État + liberté de conscience.',
  },
  {
    pattern: /marseillaise|drapeau|marianne|devise|symbole/i,
    fr: 'Cette question porte sur les symboles républicains. Ce sont des repères à apprendre par cœur.',
    ar: 'هذا السؤال يتعلق برموز الجمهورية الفرنسية، وهي عناصر يجب حفظها بشكل مباشر.',
    tip: 'Les symboles de la République doivent être mémorisés mot pour mot.',
  },
  {
    pattern: /président|premier ministre|parlement|assemblée|sénat|préfet|maire|gouvernement/i,
    fr: 'Cette question demande surtout de savoir quelle institution fait quoi.',
    ar: 'هذا السؤال يطلب منك معرفة وظيفة كل مؤسسة أو مسؤول في النظام الفرنسي.',
    tip: 'Pour les institutions, retiens toujours une fonction claire par acteur.',
  },
  {
    pattern: /euro|union européenne|commission|parlement européen|maastricht|europe/i,
    fr: "Cette question porte sur l'Union européenne : symboles, institutions ou étapes de construction.",
    ar: 'هذا السؤال يتعلق بالاتحاد الأوروبي: الرموز أو المؤسسات أو المراحل التاريخية للبناء الأوروبي.',
    tip: "Pour l'Europe, retiens les lieux, les dates et les symboles les plus connus.",
  },
  {
    pattern: /liberté|égalité|fraternité|discrimination/i,
    fr: 'Le cœur du sujet est ici la protection de chaque personne et l’égalité devant la loi.',
    ar: 'الفكرة هنا هي حماية كل شخص والمساواة أمام القانون دون تمييز.',
    tip: 'Si la question parle d’égalité, élimine les réponses qui créent une différence injustifiée.',
  },
  {
    pattern: /crime|délit|police|gendarme|ordre public|violence/i,
    fr: 'Le point à retenir est le respect de la loi, la protection des victimes et le rôle des autorités.',
    ar: 'النقطة الأساسية هي احترام القانون وحماية الضحايا ودور السلطات الأمنية والقضائية.',
    tip: 'Quand la sécurité ou la violence apparaissent, pense protection + signalement + loi.',
  },
  {
    pattern: /école|collège|cantine|instruction|handicap|parents d'élève/i,
    fr: "Ici, on parle du fonctionnement de l'école en France et de l'intérêt de l'enfant.",
    ar: 'هنا يتعلق الأمر بقواعد المدرسة في فرنسا وبمصلحة الطفل وحقه في التعليم.',
    tip: "Pour l'école, pense toujours à l'obligation d'instruction, l'égalité et l'inclusion.",
  },
  {
    pattern: /travail|prud'hommes|allocations chômage|france travail|syndical|grève/i,
    fr: 'Cette question concerne les droits du salarié et les règles du travail déclaré.',
    ar: 'هذا السؤال يتعلق بحقوق العامل والقواعد القانونية للعمل المصرح به.',
    tip: 'En matière de travail, les réponses correctes protègent le salarié dans un cadre légal.',
  },
  {
    pattern: /1944|1945|1905|1789|1962|1981|1914|1951|1992|2002/i,
    fr: 'Ici, il faut surtout retenir une date-clé associée à un événement précis.',
    ar: 'هنا يجب حفظ تاريخ أساسي وربطه مباشرة بالحدث الصحيح.',
    tip: 'Quand une date apparaît, mémorise-la avec un seul événement clair.',
  },
];

export function shuffle<T>(items: T[]) {
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

export function percentage(value: number, total: number) {
  if (!total) {
    return 0;
  }
  return Math.round((value / total) * 100);
}

export function formatLastmod(lastmod?: string) {
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

export function getLastAttempt(progress: ProgressStats, questionId: string) {
  const attempts = progress.attemptsByQuestion[questionId] ?? [];
  return attempts.at(-1);
}

export function getAttemptCount(progress: ProgressStats, questionId: string) {
  return progress.attemptsByQuestion[questionId]?.length ?? 0;
}

export function appendAttempt(
  progress: ProgressStats,
  questionId: string,
  selectedIndex: number | null,
  isCorrect: boolean,
  mode: SessionMode,
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

export function appendSessionAttempts(progress: ProgressStats, session: QuizSession) {
  let nextProgress = progress;

  for (const question of session.questions) {
    const selectedIndex = session.answers[question.id] ?? null;
    nextProgress = appendAttempt(
      nextProgress,
      question.id,
      selectedIndex,
      selectedIndex === question.correctIndex,
      session.mode,
    );
  }

  return nextProgress;
}

export function buildQuizSession(
  allQuestions: PracticeQuestion[],
  settings: QuizSettings,
  progress: ProgressStats,
) {
  if (settings.mode === 'exam') {
    return {
      questions: shuffle(allQuestions).slice(0, 40).map(randomizeQuestionOptions),
      answers: {},
      note:
        "Simulation 45 minutes : l'examen officiel contient aussi des mises en situation non publiques. Ici, tu t'entraînes sur la base publique de connaissance.",
      mode: 'exam' as const,
      startedAt: new Date().toISOString(),
      durationSeconds: settings.durationSeconds ?? 45 * 60,
    };
  }

  let candidates = allQuestions.filter(
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

  return {
    questions: shuffle(candidates)
      .slice(0, Math.min(settings.count, candidates.length))
      .map(randomizeQuestionOptions),
    answers: {},
    note,
    mode: 'practice' as const,
    startedAt: new Date().toISOString(),
  };
}

export function formatCountdown(totalSeconds: number) {
  const safeValue = Math.max(0, totalSeconds);
  const minutes = Math.floor(safeValue / 60);
  const seconds = safeValue % 60;
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

export function getSources(
  sourceIds: string[],
  sourceLookup: Map<string, OfficialDocument>,
) {
  return sourceIds
    .map((sourceId) => sourceLookup.get(sourceId))
    .filter(Boolean) as OfficialDocument[];
}

function getKeywordGuide(question: PracticeQuestion) {
  return (
    KEYWORD_GUIDES.find((guide) => guide.pattern.test(question.prompt)) ?? {
      fr: FRENCH_THEME_GUIDE[question.theme],
      ar: ARABIC_THEME_GUIDE[question.theme],
      tip: FRENCH_THEME_GUIDE[question.theme],
    }
  );
}

export function getStudyPack(question: PracticeQuestion): StudyPack {
  const guide = getKeywordGuide(question);
  const correctOption = question.options[question.correctIndex];
  const correctLetter = String.fromCharCode(65 + question.correctIndex);

  return {
    correctLetter,
    correctOption,
    frSimple: `Bonne réponse : ${correctOption}. ${question.explanation}`,
    frDetailed: `${question.explanation} ${guide.fr}`,
    arSummary: `الإجابة الصحيحة هي ${correctLetter}: ${correctOption}. ${guide.ar}`,
    memoryTip: guide.tip,
  };
}
