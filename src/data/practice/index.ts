import officialDocuments from '../generated/official-documents.json';
import cspQuestionBank from '../generated/csp-question-bank.json';
import naturalisationQuestionBank from '../generated/naturalisation-question-bank.json';
import officialQuestionBank from '../generated/official-question-bank.json';
import { historyPracticeQuestions } from './history';
import { naturalisationSpecificPracticeQuestions } from './naturalisation';
import { officialExtraPracticeQuestions } from './official-extra';
import { principlesPracticeQuestions } from './principles';
import { rightsPracticeQuestions } from './rights';
import { societyPracticeQuestions } from './society';
import { supplementalPracticeQuestions } from './supplemental';
import { systemPracticeQuestions } from './system';
import type {
  ExamTrackKey,
  OfficialDocument,
  OfficialQuestion,
  PracticeQuestion,
} from '../../types';

type OfficialQuestionWithCoverage = OfficialQuestion & {
  hasPlayableTraining: boolean;
};

type ExamTrackCatalogEntry = {
  key: ExamTrackKey;
  title: string;
  shortTitle: string;
  badge: string;
  heroTitle: string;
  heroText: string;
  officialHint: string;
  coverageLabel: string;
  questionListTitle: string;
  sourceTitle: string;
  primarySourceId: string;
  examNote: string;
  practiceQuestions: PracticeQuestion[];
  officialQuestions: OfficialQuestion[];
  officialPracticeQuestions: PracticeQuestion[];
  supplementalTrainingQuestions: PracticeQuestion[];
  officialQuestionsWithCoverage: OfficialQuestionWithCoverage[];
  officialDocumentsLibrary: OfficialDocument[];
};

const naturalisationDocuments: OfficialDocument[] = [
  {
    id: 'naturalisation-service-public',
    title: "Service-Public - Naturalisation française : comment passer l'examen civique ?",
    theme: 'Examen civique naturalisation',
    url: 'https://www.service-public.gouv.fr/particuliers/vosdroits/F39426',
  },
  {
    id: 'naturalisation-question-list',
    title: 'Liste officielle des questions de connaissance - Nationalité française',
    theme: 'Examen civique naturalisation',
    url: 'https://www.immigration.interieur.gouv.fr/documentation/guides-textes-et-brochures/questions-de-connaissance-pour-lexamen-civique-nationalite-francaise.html',
  },
  {
    id: 'naturalisation-question-pdf',
    title: 'PDF officiel - Questions de connaissance naturalisation',
    theme: 'Examen civique naturalisation',
    url: 'https://www.immigration.interieur.gouv.fr/sites/dgef/files/medias/documents/2026-01/examen-civique-naturalisation-questions-de-connaissance-20251212.pdf',
  },
  {
    id: 'naturalisation-livret',
    title: 'Livret du citoyen - Ministère de l’Intérieur',
    theme: 'Nationalité française',
    url: 'https://www.immigration.interieur.gouv.fr/documentation/guides-textes-et-brochures/livret-du-citoyen.html',
    lastmod: '2026-07-16',
  },
  {
    id: 'naturalisation-charte',
    title: 'Charte des droits et devoirs du citoyen français',
    theme: 'Nationalité française',
    url: 'https://www.immigration.interieur.gouv.fr/documentation/guides-textes-et-brochures/charte-des-droits-et-devoirs-du-citoyen-francais.html',
  },
  {
    id: 'naturalisation-code-civil',
    title: 'Code civil - Article 21-24',
    theme: 'Nationalité française',
    url: 'https://www.legifrance.gouv.fr/codes/article_lc/LEGIARTI000049052351',
  },
];

const buildCoverage = (
  questions: OfficialQuestion[],
  playableQuestions: PracticeQuestion[],
) => {
  const playablePromptSet = new Set(
    playableQuestions.map((question) => normalizeQuestionPrompt(question.prompt)),
  );
  return questions.map((question) => ({
    ...question,
    hasPlayableTraining: playablePromptSet.has(normalizeQuestionPrompt(question.prompt)),
  }));
};

export const normalizeQuestionPrompt = (value: string) =>
  value
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .replace(/[’‘`]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, ' ')
    .trim()
    .toLowerCase();

const dedupePracticeByPrompt = (questions: PracticeQuestion[]) => {
  const seen = new Set<string>();
  const deduped: PracticeQuestion[] = [];

  for (const question of questions) {
    if (seen.has(question.prompt)) {
      continue;
    }

    seen.add(question.prompt);
    deduped.push(question);
  }

  return deduped;
};

const uniqueValues = (values: string[]) => [...new Set(values)];

export const residencePracticeQuestions: PracticeQuestion[] = [
  ...principlesPracticeQuestions,
  ...systemPracticeQuestions,
  ...rightsPracticeQuestions,
  ...historyPracticeQuestions,
  ...societyPracticeQuestions,
  ...officialExtraPracticeQuestions,
  ...supplementalPracticeQuestions,
];

export const residentOfficialQuestions = officialQuestionBank as OfficialQuestion[];
export const residenceOfficialQuestions = residentOfficialQuestions;
export const pluriannuelleOfficialQuestions = cspQuestionBank as OfficialQuestion[];
export const naturalisationOfficialQuestions = naturalisationQuestionBank as OfficialQuestion[];
export const residenceDocumentsLibrary = officialDocuments as OfficialDocument[];
export const pluriannuelleDocumentsLibrary = residenceDocumentsLibrary;
export const naturalisationDocumentsLibrary = [
  ...naturalisationDocuments,
  ...residenceDocumentsLibrary.filter((document) =>
    [
      'theme-principles',
      'theme-system',
      'theme-rights',
      'theme-history',
      'theme-society',
      'law-2025-program',
      'service-public-elections',
      'service-public-eu-vote',
      'education-school-principles',
      'education-ecole-maternelle',
      'ameli-puma',
      'vie-publique-constitution',
      'population-france',
      'communes-france',
    ].includes(document.id),
  ),
];

const residenceOfficialPromptSet = new Set(
  residenceOfficialQuestions.map((question) => normalizeQuestionPrompt(question.prompt)),
);
const pluriannuelleOfficialPromptSet = new Set(
  pluriannuelleOfficialQuestions.map((question) => normalizeQuestionPrompt(question.prompt)),
);
const naturalisationOfficialPromptSet = new Set(
  naturalisationOfficialQuestions.map((question) => normalizeQuestionPrompt(question.prompt)),
);

export const residenceOfficialPracticeQuestions = residencePracticeQuestions.filter((question) =>
  residenceOfficialPromptSet.has(normalizeQuestionPrompt(question.prompt)),
);

export const pluriannuellePracticeQuestions = residencePracticeQuestions.map((question) => ({
  ...question,
  id: `csp-${question.id}`,
  sourceIds: pluriannuelleOfficialPromptSet.has(normalizeQuestionPrompt(question.prompt))
    ? uniqueValues(['question-list-csp', ...question.sourceIds])
    : question.sourceIds,
}));

export const pluriannuelleOfficialPracticeQuestions = pluriannuellePracticeQuestions.filter(
  (question) => pluriannuelleOfficialPromptSet.has(normalizeQuestionPrompt(question.prompt)),
);

export const naturalisationPracticeQuestions = dedupePracticeByPrompt([
  ...naturalisationSpecificPracticeQuestions,
  ...residencePracticeQuestions
    .filter((question) => naturalisationOfficialPromptSet.has(normalizeQuestionPrompt(question.prompt)))
    .map((question) => ({
      ...question,
      id: `nat-overlap-${question.id}`,
      sourceIds: uniqueValues([
        'naturalisation-question-list',
        'naturalisation-livret',
        ...question.sourceIds,
      ]),
    })),
]);

export const naturalisationOfficialPracticeQuestions = naturalisationPracticeQuestions.filter(
  (question) => naturalisationOfficialPromptSet.has(normalizeQuestionPrompt(question.prompt)),
);

export const residenceSupplementalTrainingQuestions = residencePracticeQuestions.filter(
  (question) => !residenceOfficialPromptSet.has(normalizeQuestionPrompt(question.prompt)),
);

export const pluriannuelleSupplementalTrainingQuestions = pluriannuellePracticeQuestions.filter(
  (question) => !pluriannuelleOfficialPromptSet.has(normalizeQuestionPrompt(question.prompt)),
);

export const naturalisationSupplementalTrainingQuestions = naturalisationPracticeQuestions.filter(
  (question) => !naturalisationOfficialPromptSet.has(normalizeQuestionPrompt(question.prompt)),
);

export const residenceQuestionsWithCoverage = buildCoverage(
  residenceOfficialQuestions,
  residencePracticeQuestions,
);
export const pluriannuelleQuestionsWithCoverage = buildCoverage(
  pluriannuelleOfficialQuestions,
  pluriannuellePracticeQuestions,
);
export const naturalisationQuestionsWithCoverage = buildCoverage(
  naturalisationOfficialQuestions,
  naturalisationPracticeQuestions,
);

export const examTrackCatalog: Record<ExamTrackKey, ExamTrackCatalogEntry> = {
  residence: {
    key: 'residence',
    title: 'Carte de résident',
    shortTitle: 'Carte de résident',
    badge: 'Carte de résident',
    heroTitle: 'Prépare ton examen civique pour la carte de résident.',
    heroText:
      "Parcours pour les personnes qui préparent l'examen civique demandé pour une carte de résident. La simulation garde le format 40 questions, 45 minutes, objectif 32 bonnes réponses.",
    officialHint: 'Questions CR publiques',
    coverageLabel: 'Couverture CR',
    questionListTitle: 'Référentiel public CR',
    sourceTitle: 'Sources carte de résident',
    primarySourceId: 'question-list-cr',
    examNote:
      'Simulation 45 minutes : rotation intelligente sur les questions de connaissance publiées par le ministère. Les mises en situation de l’examen ne sont pas publiques.',
    practiceQuestions: residencePracticeQuestions,
    officialQuestions: residenceOfficialQuestions,
    officialPracticeQuestions: residenceOfficialPracticeQuestions,
    supplementalTrainingQuestions: residenceSupplementalTrainingQuestions,
    officialQuestionsWithCoverage: residenceQuestionsWithCoverage,
    officialDocumentsLibrary: residenceDocumentsLibrary,
  },
  pluriannuelle: {
    key: 'pluriannuelle',
    title: 'Carte de séjour pluriannuelle',
    shortTitle: 'Séjour pluriannuel',
    badge: 'Séjour pluriannuel',
    heroTitle: 'Prépare ton examen civique pour la carte de séjour pluriannuelle.',
    heroText:
      "Parcours dédié aux personnes qui préparent l'examen civique demandé pour une première carte de séjour pluriannuelle. La simulation garde le format 40 questions, 45 minutes, objectif 32 bonnes réponses.",
    officialHint: 'Questions CSP publiques',
    coverageLabel: 'Couverture CSP',
    questionListTitle: 'Référentiel public CSP',
    sourceTitle: 'Sources carte pluriannuelle',
    primarySourceId: 'question-list-csp',
    examNote:
      'Simulation 45 minutes : rotation intelligente sur les questions de connaissance publiées par le ministère. Les mises en situation de l’examen ne sont pas publiques.',
    practiceQuestions: pluriannuellePracticeQuestions,
    officialQuestions: pluriannuelleOfficialQuestions,
    officialPracticeQuestions: pluriannuelleOfficialPracticeQuestions,
    supplementalTrainingQuestions: pluriannuelleSupplementalTrainingQuestions,
    officialQuestionsWithCoverage: pluriannuelleQuestionsWithCoverage,
    officialDocumentsLibrary: pluriannuelleDocumentsLibrary,
  },
  naturalisation: {
    key: 'naturalisation',
    title: 'Naturalisation française',
    shortTitle: 'Naturalisation',
    badge: 'Nationalité française',
    heroTitle: 'Prépare ton examen civique pour la naturalisation française.',
    heroText:
      "Parcours pour les personnes qui demandent la nationalité française par décret ou réintégration. La banque s’appuie sur la liste publique des questions de connaissance du ministère et propose des QCM d’entraînement avec réponses pédagogiques.",
    officialHint: 'Questions nationalité publiques',
    coverageLabel: 'Couverture naturalisation',
    questionListTitle: 'Référentiel public naturalisation',
    sourceTitle: 'Sources naturalisation',
    primarySourceId: 'naturalisation-service-public',
    examNote:
      "Simulation 45 minutes : rotation intelligente sur les questions de connaissance publiées par le ministère. L’examen contient aussi des mises en situation non publiques.",
    practiceQuestions: naturalisationPracticeQuestions,
    officialQuestions: naturalisationOfficialQuestions,
    officialPracticeQuestions: naturalisationOfficialPracticeQuestions,
    supplementalTrainingQuestions: naturalisationSupplementalTrainingQuestions,
    officialQuestionsWithCoverage: naturalisationQuestionsWithCoverage,
    officialDocumentsLibrary: naturalisationDocumentsLibrary,
  },
};

export const practiceQuestions = residencePracticeQuestions;
export const officialQuestions = residenceOfficialQuestions;
export const officialDocumentsLibrary = residenceDocumentsLibrary;
export const officialPracticeQuestions = residenceOfficialPracticeQuestions;
export const supplementalTrainingQuestions = residenceSupplementalTrainingQuestions;
export const officialQuestionsWithCoverage = residenceQuestionsWithCoverage;

export const sourceLookup = new Map(
  [
    ...residenceDocumentsLibrary,
    ...pluriannuelleDocumentsLibrary,
    ...naturalisationDocumentsLibrary,
  ].map((document) => [document.id, document] as const),
);
