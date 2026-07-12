export const THEME_LABELS = [
  'Principes et valeurs de la République',
  'Système institutionnel et politique',
  'Droits et devoirs',
  'Histoire, géographie et culture',
  'Vivre dans la société française',
] as const;

export type ThemeLabel = (typeof THEME_LABELS)[number];

export type ThemeKey =
  | 'principles'
  | 'system'
  | 'rights'
  | 'history'
  | 'society';

export type Difficulty = 'essentiel' | 'avance';
export type SessionMode = 'practice' | 'exam';

export type OfficialQuestion = {
  id: string;
  order: number;
  theme: ThemeLabel;
  prompt: string;
};

export type OfficialDocument = {
  id: string;
  title: string;
  theme: string;
  url: string;
  lastmod?: string;
};

export type PracticeQuestion = {
  id: string;
  theme: ThemeLabel;
  prompt: string;
  options: [string, string, string, string];
  correctIndex: number;
  explanation: string;
  sourceIds: string[];
  difficulty: Difficulty;
};

export type ThemeMeta = {
  key: ThemeKey;
  label: ThemeLabel;
  shortLabel: string;
  gradient: string;
  surface: string;
  icon: string;
  blurb: string;
};

export type QuizSettings = {
  count: number;
  theme: ThemeLabel | 'all';
  onlyIncorrect: boolean;
  mode: SessionMode;
  durationSeconds?: number;
};

export type QuizAttempt = {
  questionId: string;
  isCorrect: boolean;
  selectedIndex: number | null;
  answeredAt: string;
  mode: SessionMode;
};

export type ExamHistoryEntry = {
  id: string;
  startedAt: string;
  finishedAt: string;
  score: number;
  total: number;
  accuracy: number;
  passed: boolean;
  unansweredCount: number;
  elapsedSeconds: number;
};

export type ProgressStats = {
  attemptsByQuestion: Record<string, QuizAttempt[]>;
  bookmarks: string[];
  examHistory: ExamHistoryEntry[];
};

export type QuizSession = {
  questions: PracticeQuestion[];
  answers: Record<string, number>;
  note?: string;
  mode: SessionMode;
  startedAt: string;
  durationSeconds?: number;
  finishedAt?: string;
};

export type StudyPack = {
  correctLetter: string;
  correctOption: string;
  frSimple: string;
  frDetailed: string;
  arSummary: string;
  memoryTip: string;
};
