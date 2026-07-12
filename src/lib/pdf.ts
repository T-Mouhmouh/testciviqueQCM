import { getLastAttempt, getStudyPack, percentage } from './study';
import type { PracticeQuestion, ProgressStats } from '../types';

type ExportPdfInput = {
  progress: ProgressStats;
  questions: PracticeQuestion[];
};

function scoreQuestion(progress: ProgressStats, question: PracticeQuestion) {
  const attempts = progress.attemptsByQuestion[question.id] ?? [];
  const lastAttempt = getLastAttempt(progress, question.id);
  if (!lastAttempt) {
    return 3;
  }
  if (!lastAttempt.isCorrect) {
    return 2;
  }
  return attempts.length < 2 ? 1 : 0;
}

export async function exportRevisionPdf({ progress, questions }: ExportPdfInput) {
  const { jsPDF } = await import('jspdf');
  const document = new jsPDF({
    unit: 'mm',
    format: 'a4',
  });

  const margin = 16;
  const maxWidth = 178;
  let cursorY = 18;

  const addTextBlock = (
    text: string,
    fontSize = 11,
    spacing = 6,
    fontStyle: 'normal' | 'bold' = 'normal',
  ) => {
    document.setFont('helvetica', fontStyle);
    document.setFontSize(fontSize);
    const lines = document.splitTextToSize(text, maxWidth);
    const height = lines.length * spacing;
    if (cursorY + height > 280) {
      document.addPage();
      cursorY = 18;
    }
    document.text(lines, margin, cursorY);
    cursorY += height + 2;
  };

  const totalAttempts = Object.values(progress.attemptsByQuestion).reduce(
    (sum, attempts) => sum + attempts.length,
    0,
  );
  const totalCorrect = Object.values(progress.attemptsByQuestion).reduce(
    (sum, attempts) => sum + attempts.filter((attempt) => attempt.isCorrect).length,
    0,
  );

  const themeStats = Array.from(
    new Set(questions.map((question) => question.theme)),
  ).map((theme) => {
    const byTheme = questions.filter((question) => question.theme === theme);
    const mastered = byTheme.filter(
      (question) => getLastAttempt(progress, question.id)?.isCorrect,
    ).length;
    return {
      theme,
      total: byTheme.length,
      mastered,
    };
  });

  const revisionList = [...questions]
    .sort((left, right) => scoreQuestion(progress, right) - scoreQuestion(progress, left))
    .slice(0, 12);

  addTextBlock('Fiche de revision - Carte de resident 10 ans', 18, 8, 'bold');
  addTextBlock(
    `Generee le ${new Intl.DateTimeFormat('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date())}`,
    10,
  );
  addTextBlock(
    "Cette fiche est une synthese d'entrainement. L'examen officiel comprend 40 questions en 45 minutes, dont des mises en situation non publiques.",
    11,
  );
  addTextBlock(
    `Progression globale : ${percentage(totalCorrect, totalAttempts)}% de bonnes reponses sur ${totalAttempts} tentative(s).`,
    11,
    6,
    'bold',
  );

  addTextBlock('Themes a suivre', 14, 7, 'bold');
  themeStats.forEach((stat) => {
    addTextBlock(
      `${stat.theme} : ${stat.mastered}/${stat.total} questions maitrisees.`,
      11,
    );
  });

  addTextBlock('Questions a revoir en priorite', 14, 7, 'bold');
  revisionList.forEach((question, index) => {
    const pack = getStudyPack(question);
    addTextBlock(`${index + 1}. ${question.prompt}`, 12, 6, 'bold');
    addTextBlock(`Bonne reponse : ${pack.correctLetter}. ${pack.correctOption}`);
    addTextBlock(`Francais simple : ${pack.frSimple}`);
    addTextBlock(`Memo : ${pack.memoryTip}`);
  });

  document.save('fiche-revision-carte-resident.pdf');
}
