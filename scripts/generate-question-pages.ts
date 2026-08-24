import { mkdir, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { residencePracticeQuestions, sourceLookup } from '../src/data/practice/index';
import type { PracticeQuestion, ThemeLabel } from '../src/types';

const ROOT = process.cwd();
const OUTPUT_DIR = join(ROOT, 'public', 'questions');
const SITE_URL = 'https://prep-testcivique.fr';
const PLAY_URL = 'https://play.google.com/store/apps/details?id=com.prepacivique.qcm';

const themeContext: Record<ThemeLabel, { slug: string; title: string; intro: string; method: string }> = {
  'Principes et valeurs de la République': {
    slug: 'valeurs-republique',
    title: 'Valeurs et principes de la République',
    intro: "Ce thème relie les principes constitutionnels aux situations de la vie quotidienne. Il faut distinguer une valeur, un symbole et une règle juridique, puis identifier les limites prévues par la loi.",
    method: "Repérez d'abord le principe concerné — liberté, égalité, fraternité ou laïcité — puis vérifiez que la réponse respecte aussi les droits des autres.",
  },
  'Système institutionnel et politique': {
    slug: 'institutions-francaises',
    title: 'Institutions et vie démocratique',
    intro: "Les questions institutionnelles demandent de ne pas confondre les rôles du Président, du Gouvernement, du Parlement, de la justice et des collectivités territoriales.",
    method: "Cherchez le verbe principal de la question : voter, exécuter, juger, contrôler ou administrer. Il indique souvent l'institution compétente.",
  },
  'Droits et devoirs': {
    slug: 'droits-et-devoirs',
    title: 'Droits, libertés et devoirs',
    intro: "Les droits reconnus en France s'exercent dans un cadre commun. Une liberté n'autorise pas à porter atteinte à la sécurité, à la dignité ou aux droits d'une autre personne.",
    method: "Écartez les réponses absolues. La bonne proposition associe généralement un droit individuel au respect de la loi et des autres personnes.",
  },
  'Histoire, géographie et culture': {
    slug: 'histoire-geographie-culture',
    title: 'Histoire, géographie et culture françaises',
    intro: "Ce thème rassemble des dates, des lieux, des personnalités et des repères culturels. Leur intérêt est de comprendre la construction de la France contemporaine, pas seulement de mémoriser une liste.",
    method: "Replacez le repère dans une période et associez-le à sa conséquence principale. Une chronologie courte aide à éliminer les anachronismes.",
  },
  'Vivre dans la société française': {
    slug: 'vie-en-france',
    title: 'Vivre dans la société française',
    intro: "Ces questions portent sur des situations concrètes : école, travail, santé, logement, services publics et égalité entre les femmes et les hommes.",
    method: "Identifiez l'interlocuteur compétent et choisissez le comportement qui respecte la loi, l'égalité et les démarches normales du service concerné.",
  },
};

const escapeHtml = (value: string) => value
  .replaceAll('&', '&amp;')
  .replaceAll('<', '&lt;')
  .replaceAll('>', '&gt;')
  .replaceAll('"', '&quot;')
  .replaceAll("'", '&#39;');

const slugify = (value: string) => value
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .toLowerCase()
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/^-|-$/g, '')
  .slice(0, 76);

const selectedQuestions = Object.keys(themeContext).flatMap((theme) =>
  residencePracticeQuestions.filter((question) => question.theme === theme).slice(0, 10),
);

const pages = selectedQuestions.map((question, index) => ({
  question,
  slug: `${slugify(question.prompt)}-${index + 1}`,
}));

const header = (current: 'questions' | 'other' = 'other') => `
<header class="public-header"><nav class="public-nav" aria-label="Navigation principale"><a class="public-logo" href="/"><span>TC</span><strong>Test Civique QCM</strong></a><div class="public-links"><a href="/examen-civique.html">L'examen</a><a href="/questions/"${current === 'questions' ? ' aria-current="page"' : ''}>Questions corrigées</a><a href="/valeurs-republique.html">Valeurs</a><a href="/institutions-francaises.html">Institutions</a></div><a class="public-action" href="/app.html">Simulation</a><a class="public-android-action" href="${PLAY_URL}" rel="noreferrer">Installer l'app Android</a></nav></header>`;

const footer = `
<footer class="public-footer"><div class="footer-inner"><div><strong>Test Civique QCM</strong><p>Préparation indépendante au test civique français. Les questions sont des adaptations pédagogiques.</p></div><nav><strong>Réviser</strong><a href="/questions/">Questions corrigées</a><a href="/guides.html">Méthode</a><a href="/app.html">Examen blanc</a></nav><nav><strong>Informations</strong><a href="/about.html">À propos</a><a href="/privacy-policy.html">Confidentialité</a><a href="${PLAY_URL}" rel="noreferrer">Application Android</a></nav></div></footer>`;

function questionPage(question: PracticeQuestion, index: number, slug: string) {
  const context = themeContext[question.theme];
  const previous = pages[(index - 1 + pages.length) % pages.length];
  const next = pages[(index + 1) % pages.length];
  const correct = question.options[question.correctIndex];
  const sources = question.sourceIds.map((id) => sourceLookup.get(id)).filter(Boolean);
  const sourceList = sources.length
    ? sources.map((source) => `<li><a href="${escapeHtml(source!.url)}" rel="noreferrer">${escapeHtml(source!.title)}</a></li>`).join('')
    : '<li><a href="https://formation-civique.interieur.gouv.fr/examen-civique/" rel="noreferrer">Portail officiel de la formation civique</a></li>';
  const options = question.options.map((option, optionIndex) => `<li><span>${String.fromCharCode(65 + optionIndex)}</span>${escapeHtml(option)}</li>`).join('');
  const canonical = `${SITE_URL}/questions/${slug}.html`;

  return `<!doctype html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="description" content="Question corrigée du test civique : ${escapeHtml(question.prompt)} Explication, réponse et source."/><meta name="google-adsense-account" content="ca-pub-2101066490685216"/><link rel="canonical" href="${canonical}"/><title>${escapeHtml(question.prompt)} | Question test civique</title><link rel="stylesheet" href="/site-pages.css"/><link rel="stylesheet" href="/questions.css"/><script type="application/ld+json">${JSON.stringify({ '@context': 'https://schema.org', '@type': 'Quiz', name: question.prompt, educationalLevel: 'Préparation civique', about: question.theme, inLanguage: 'fr-FR' })}</script></head><body><a class="skip-link" href="#contenu">Aller au contenu</a>${header('questions')}<main class="question-main" id="contenu"><nav class="question-breadcrumb" aria-label="Fil d'Ariane"><a href="/">Accueil</a><span>›</span><a href="/questions/">Questions corrigées</a><span>›</span><span>${escapeHtml(context.title)}</span></nav><article class="question-article"><header><p class="eyebrow">Question corrigée ${index + 1} sur ${pages.length}</p><h1>${escapeHtml(question.prompt)}</h1><p class="question-lead">Une question d'entraînement sur le thème « ${escapeHtml(question.theme)} », accompagnée d'une correction expliquée et de sources à consulter.</p></header><section class="question-context"><h2>Le contexte à connaître</h2><p>${escapeHtml(context.intro)}</p><p>${escapeHtml(context.method)}</p></section><aside class="article-ad" data-editorial-ad data-slot-name="questionTop" aria-label="Emplacement publicitaire"><span>Publicité</span></aside><section class="question-box"><h2>Choisissez une réponse</h2><ol class="question-options">${options}</ol><details class="question-correction"><summary>Afficher la correction expliquée</summary><div><p class="answer-line"><strong>Bonne réponse : ${String.fromCharCode(65 + question.correctIndex)}.</strong> ${escapeHtml(correct)}</p><h3>Pourquoi ?</h3><p>${escapeHtml(question.explanation)}</p><h3>Comment retenir cette notion ?</h3><p>Reformulez la règle avec vos propres mots, puis cherchez un exemple concret. La bonne réponse doit correspondre précisément au rôle, au principe ou à la situation mentionnée dans la question.</p></div></details></section><section><h2>Éviter les erreurs fréquentes</h2><p>Ne retenez pas seulement la lettre de la réponse : l'ordre des propositions peut changer. Comparez chaque choix avec la définition étudiée et vérifiez les mots qui limitent le sens, comme « toujours », « uniquement » ou une négation.</p><p>Cette question est une adaptation pédagogique indépendante. Elle aide à comprendre une connaissance susceptible d'être évaluée, mais ne garantit pas la formulation utilisée le jour de l'examen.</p></section><aside class="article-ad" data-editorial-ad data-slot-name="questionBottom" aria-label="Emplacement publicitaire"><span>Publicité</span></aside><section><h2>Sources et vérification</h2><ul class="source-list">${sourceList}</ul></section><nav class="question-pagination" aria-label="Questions"><a href="/questions/${previous.slug}.html">← Question précédente</a><a href="/questions/${next.slug}.html">Question suivante →</a></nav></article><aside class="question-aside"><strong>Thème</strong><p>${escapeHtml(context.title)}</p><a href="/questions/#${context.slug}">Voir les 10 questions du thème</a><a class="android-card" href="${PLAY_URL}" rel="noreferrer"><span>Application Android</span><strong>Installer Test Civique QCM</strong><small>Quiz, simulations et progression sur mobile.</small></a></aside></main>${footer}<script src="/ads-config.js"></script><script src="/editorial-ads.js"></script></body></html>`;
}

function indexPage() {
  const groups = Object.entries(themeContext).map(([theme, context]) => {
    const items = pages.filter(({ question }) => question.theme === theme).map(({ question, slug }, index) => `<li><a href="/questions/${slug}.html"><span>${index + 1}</span>${escapeHtml(question.prompt)}</a></li>`).join('');
    return `<section class="question-theme" id="${context.slug}"><p class="eyebrow">10 questions corrigées</p><h2>${escapeHtml(context.title)}</h2><p>${escapeHtml(context.intro)}</p><ol>${items}</ol></section>`;
  }).join('');
  return `<!doctype html><html lang="fr"><head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1"/><meta name="description" content="50 questions corrigées pour préparer le test civique français, classées par thème avec explications et sources."/><link rel="canonical" href="${SITE_URL}/questions/"/><title>50 questions corrigées du test civique | Test Civique QCM</title><link rel="stylesheet" href="/site-pages.css"/><link rel="stylesheet" href="/questions.css"/></head><body>${header('questions')}<main class="question-index"><header><p class="eyebrow">Bibliothèque pédagogique</p><h1>50 questions corrigées du test civique</h1><p>Travaillez chaque notion sur une page dédiée, consultez la correction et avancez à votre rythme. Pour une simulation chronométrée, utilisez ensuite l'outil d'entraînement.</p><div class="question-index-actions"><a href="/questions/${pages[0].slug}.html">Commencer la première question</a><a href="${PLAY_URL}" rel="noreferrer">Installer l'application Android</a></div></header>${groups}</main>${footer}</body></html>`;
}

await rm(OUTPUT_DIR, { recursive: true, force: true });
await mkdir(OUTPUT_DIR, { recursive: true });
await Promise.all(pages.map(({ question, slug }, index) => writeFile(join(OUTPUT_DIR, `${slug}.html`), questionPage(question, index, slug), 'utf8')));
await writeFile(join(OUTPUT_DIR, 'index.html'), indexPage(), 'utf8');

const staticUrls = ['/', '/examen-civique.html', '/guides.html', '/valeurs-republique.html', '/institutions-francaises.html', '/questions/', '/about.html', '/privacy-policy.html'];
const sitemapUrls = [...staticUrls, ...pages.map(({ slug }) => `/questions/${slug}.html`)];
const sitemap = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${sitemapUrls.map((url) => `  <url><loc>${SITE_URL}${url}</loc></url>`).join('\n')}\n</urlset>\n`;
await writeFile(join(ROOT, 'public', 'sitemap.xml'), sitemap, 'utf8');
console.log(`Generated ${pages.length} question pages and the question index.`);
