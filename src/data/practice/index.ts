import officialDocuments from '../generated/official-documents.json';
import officialQuestionBank from '../generated/official-question-bank.json';
import { historyPracticeQuestions } from './history';
import { officialExtraPracticeQuestions } from './official-extra';
import { principlesPracticeQuestions } from './principles';
import { rightsPracticeQuestions } from './rights';
import { societyPracticeQuestions } from './society';
import { systemPracticeQuestions } from './system';
import type { OfficialDocument, OfficialQuestion, PracticeQuestion } from '../../types';

export const practiceQuestions: PracticeQuestion[] = [
  ...principlesPracticeQuestions,
  ...systemPracticeQuestions,
  ...rightsPracticeQuestions,
  ...historyPracticeQuestions,
  ...societyPracticeQuestions,
  ...officialExtraPracticeQuestions,
];

export const officialQuestions = officialQuestionBank as OfficialQuestion[];
export const officialDocumentsLibrary = officialDocuments as OfficialDocument[];

const playablePromptSet = new Set(practiceQuestions.map((question) => question.prompt));

export const officialQuestionsWithCoverage = officialQuestions.map((question) => ({
  ...question,
  hasPlayableTraining: playablePromptSet.has(question.prompt),
}));

export const sourceLookup = new Map(
  officialDocumentsLibrary.map((document) => [document.id, document] as const),
);
