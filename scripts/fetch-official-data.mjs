import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { load } from 'cheerio';
import { XMLParser } from 'fast-xml-parser';

const ROOT_DIR = process.cwd();
const GENERATED_DIR = path.join(ROOT_DIR, 'src', 'data', 'generated');

const CR_QUESTION_URL =
  'https://formation-civique.interieur.gouv.fr/examen-civique/liste-officielle-des-questions-de-connaissance-cr/';
const CSP_QUESTION_URL =
  'https://formation-civique.interieur.gouv.fr/examen-civique/liste-officielle-des-questions-de-connaissance-csp/';
const SITEMAP_URL = 'https://formation-civique.interieur.gouv.fr/sitemap.xml';
const OFFICIAL_HOST = 'https://formation-civique.interieur.gouv.fr';

const THEME_MAP = {
  'principes-et-valeurs-de-la-republique': 'Principes et valeurs de la République',
  'systeme-institutionnel-et-politique': 'Système institutionnel et politique',
  'droits-et-devoirs': 'Droits et devoirs',
  'histoire-geographie-et-culture': 'Histoire, géographie et culture',
  'vivre-dans-la-societe-francaise': 'Vivre dans la société française',
};

const GLOBAL_SOURCES = [
  {
    id: 'exam-info',
    title: "Informations générales sur l'examen civique",
    theme: 'Examen civique',
    url: 'https://formation-civique.interieur.gouv.fr/examen-civique/informations-g%C3%A9n%C3%A9rales-sur-lexamen-civique/',
  },
  {
    id: 'question-list-cr',
    title: 'Liste officielle des questions de connaissance - CR',
    theme: 'Examen civique',
    url: CR_QUESTION_URL,
  },
  {
    id: 'question-list-csp',
    title: 'Liste officielle des questions de connaissance - CSP',
    theme: 'Examen civique',
    url: CSP_QUESTION_URL,
  },
  {
    id: 'theme-principles',
    title: 'Principes et valeurs de la République',
    theme: 'Principes et valeurs de la République',
    url: 'https://formation-civique.interieur.gouv.fr/fiches-par-thematiques/principes-et-valeurs-de-la-republique/',
  },
  {
    id: 'theme-system',
    title: 'Système institutionnel et politique',
    theme: 'Système institutionnel et politique',
    url: 'https://formation-civique.interieur.gouv.fr/fiches-par-thematiques/systeme-institutionnel-et-politique/',
  },
  {
    id: 'theme-rights',
    title: 'Droits et devoirs',
    theme: 'Droits et devoirs',
    url: 'https://formation-civique.interieur.gouv.fr/fiches-par-thematiques/droits-et-devoirs/',
  },
  {
    id: 'theme-history',
    title: 'Histoire, géographie et culture',
    theme: 'Histoire, géographie et culture',
    url: 'https://formation-civique.interieur.gouv.fr/fiches-par-thematiques/histoire-geographie-et-culture/',
  },
  {
    id: 'theme-society',
    title: 'Vivre dans la société française',
    theme: 'Vivre dans la société française',
    url: 'https://formation-civique.interieur.gouv.fr/fiches-par-thematiques/vivre-dans-la-societe-fran%C3%A7aise/',
  },
  {
    id: 'law-2025-program',
    title: "Arrêté du 10 octobre 2025 relatif au programme et aux modalités de l'examen civique",
    theme: 'Examen civique',
    url: 'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000051214417',
  },
  {
    id: 'population-france',
    title: 'Bilan démographique 2025',
    theme: 'Histoire, géographie et culture',
    url: 'https://www.insee.fr/fr/statistiques/8719824',
  },
  {
    id: 'communes-france',
    title: 'Structures territoriales au 1er janvier 2025',
    theme: 'Système institutionnel et politique',
    url: 'https://www.collectivites-locales.gouv.fr/bis-ndeg195-les-structures-territoriales-au-1er-janvier-2025',
  },
  {
    id: 'francophonie',
    title: 'Qui parle français dans le monde',
    theme: 'Histoire, géographie et culture',
    url: 'https://observatoire.francophonie.org/qui-parle-francais-dans-le-monde/',
  },
  {
    id: 'service-public-exam',
    title: "Service-Public - Un nouvel examen civique pour les étrangers souhaitant s'installer en France",
    theme: 'Examen civique',
    url: 'https://www.service-public.gouv.fr/particuliers/actualites/A18713',
  },
  {
    id: 'service-public-elections',
    title: 'Service-Public - Élections',
    theme: 'Système institutionnel et politique',
    url: 'https://www.service-public.fr/particuliers/vosdroits/N47',
  },
  {
    id: 'service-public-eu-vote',
    title: "Service-Public - Droit de vote d'un citoyen européen en France",
    theme: 'Système institutionnel et politique',
    url: 'https://www.service-public.fr/particuliers/vosdroits/F1937',
  },
  {
    id: 'education-school-principles',
    title: "Ministère de l'Éducation nationale - Les grands principes du système éducatif",
    theme: 'Vivre dans la société française',
    url: 'https://www.education.gouv.fr/les-grands-principes-du-systeme-educatif-9842',
  },
  {
    id: 'education-ecole-maternelle',
    title: "Ministère de l'Éducation nationale - L'école maternelle en pratique",
    theme: 'Vivre dans la société française',
    url: 'https://www.education.gouv.fr/l-ecole-maternelle-en-pratique-1010',
  },
  {
    id: 'ameli-puma',
    title: 'Ameli - La protection universelle maladie',
    theme: 'Vivre dans la société française',
    url: 'https://www.ameli.fr/assure/droits-demarches/principes/protection-universelle-maladie',
  },
  {
    id: 'vie-publique-constitution',
    title: "Vie Publique - Qu'est-ce qu'une Constitution ?",
    theme: 'Système institutionnel et politique',
    url: 'https://www.vie-publique.fr/fiches/19545-quest-ce-quune-constitution-definition-dune-constitution',
  },
  {
    id: 'vie-publique-revisions-constitution',
    title: 'Vie Publique - Les révisions de la Constitution sous la Ve République',
    theme: 'Système institutionnel et politique',
    url: 'https://www.vie-publique.fr/dossier/267859-les-revisions-de-la-constitution-sous-la-ve-republique',
  },
];

const cleanText = (value) =>
  value
    .replace(/\u00a0/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const normalizeThemeLabel = (value) =>
  cleanText(value)
    .replace(/:$/, '')
    .replace(/\s+/g, ' ')
    .replace('Histoire géographie et culture', 'Histoire, géographie et culture')
    .trim();

const slugifyThemeLabel = (value) =>
  normalizeThemeLabel(value)
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');

const slugToTitle = (slug) =>
  decodeURIComponent(slug)
    .replace(/-/g, ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

const normalizeOfficialUrl = (value) =>
  value
    .replace('http://', 'https://')
    .replace('https://localhost:8383', OFFICIAL_HOST)
    .replace('http://localhost:8383', OFFICIAL_HOST);

const fetchText = async (url) => {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`Request failed for ${url} (${response.status})`);
  }
  const buffer = await response.arrayBuffer();
  return new TextDecoder('utf-8').decode(buffer);
};

const fetchTitle = async (url) => {
  const html = await fetchText(url);
  const $ = load(html);
  const title = cleanText($('main h1').first().text() || $('title').first().text());
  return title || slugToTitle(url.split('/').filter(Boolean).at(-1));
};

const mapThemeLabel = (url) => {
  const parts = new URL(url).pathname.split('/').filter(Boolean);
  const themeSlug = slugifyThemeLabel(decodeURIComponent(parts[1] || ''));
  return THEME_MAP[themeSlug] || 'Autres ressources officielles';
};

const chunk = (items, size) => {
  const result = [];
  for (let index = 0; index < items.length; index += size) {
    result.push(items.slice(index, index + size));
  }
  return result;
};

const buildOfficialQuestionBank = async (questionUrl, idPrefix) => {
  const html = await fetchText(questionUrl);
  const $ = load(html);
  const items = [];
  let order = 0;

  $('main')
    .children()
    .slice(3)
    .each((_, element) => {
      const section = $(element);
      const themeSlug = slugifyThemeLabel(section.find('p').first().text());
      const theme = THEME_MAP[themeSlug];
      if (!theme) {
        return;
      }

      section.find('li').each((__, listItem) => {
        const prompt = cleanText($(listItem).text());
        if (!prompt) {
          return;
        }
        order += 1;
        items.push({
          id: `${idPrefix}-${String(order).padStart(3, '0')}`,
          order,
          theme,
          prompt,
        });
      });
    });

  return items;
};

const buildOfficialDocumentLibrary = async () => {
  const xml = await fetchText(SITEMAP_URL);
  const parser = new XMLParser();
  const parsed = parser.parse(xml);
  const urlEntries = parsed.urlset.url.map((entry) => ({
    url: normalizeOfficialUrl(entry.loc),
    lastmod: entry.lastmod,
  }));

  const relevantEntries = urlEntries.filter(({ url }) => {
    const pathname = new URL(url).pathname;
    return (
      pathname.includes('/fiches-par-thematiques/') ||
      pathname.includes('/examen-civique/')
    );
  });

  const titleMap = new Map();
  for (const group of chunk(relevantEntries, 8)) {
    const settled = await Promise.allSettled(
      group.map(async ({ url }) => ({
        url,
        title: await fetchTitle(url),
      })),
    );
    for (const entry of settled) {
      if (entry.status === 'fulfilled') {
        titleMap.set(entry.value.url, entry.value.title);
      }
    }
  }

  const documents = relevantEntries.map(({ url, lastmod }, index) => ({
    id: `doc-${String(index + 1).padStart(3, '0')}`,
    title: titleMap.get(url) || slugToTitle(url.split('/').filter(Boolean).at(-1)),
    theme: mapThemeLabel(url),
    url,
    lastmod,
  }));

  const deduped = [];
  const seen = new Set();
  for (const document of documents) {
    if (seen.has(document.url)) {
      continue;
    }
    seen.add(document.url);
    deduped.push(document);
  }

  const combined = [...GLOBAL_SOURCES, ...deduped];
  const seenCombinedUrls = new Set();

  return combined.filter((document) => {
    if (seenCombinedUrls.has(document.url)) {
      return false;
    }

    seenCombinedUrls.add(document.url);
    return true;
  });
};

await mkdir(GENERATED_DIR, { recursive: true });

const [crQuestions, cspQuestions, documents] = await Promise.all([
  buildOfficialQuestionBank(CR_QUESTION_URL, 'cr'),
  buildOfficialQuestionBank(CSP_QUESTION_URL, 'csp'),
  buildOfficialDocumentLibrary(),
]);

await writeFile(
  path.join(GENERATED_DIR, 'official-question-bank.json'),
  `${JSON.stringify(crQuestions, null, 2)}\n`,
);

await writeFile(
  path.join(GENERATED_DIR, 'csp-question-bank.json'),
  `${JSON.stringify(cspQuestions, null, 2)}\n`,
);

await writeFile(
  path.join(GENERATED_DIR, 'official-documents.json'),
  `${JSON.stringify(documents, null, 2)}\n`,
);

console.log(`Generated ${crQuestions.length} official CR questions.`);
console.log(`Generated ${cspQuestions.length} official CSP questions.`);
console.log(`Generated ${documents.length} official official-source entries.`);
