import type { Difficulty, PracticeQuestion, ThemeLabel } from '../../types';

type NaturalisationSeed = {
  id: string;
  theme: ThemeLabel;
  prompt: string;
  correct: string;
  distractors: [string, string, string];
  explanation: string;
  sourceIds?: string[];
  difficulty?: Difficulty;
};

const principlesTheme = 'Principes et valeurs de la République' as const;
const systemTheme = 'Système institutionnel et politique' as const;
const rightsTheme = 'Droits et devoirs' as const;
const historyTheme = 'Histoire, géographie et culture' as const;
const societyTheme = 'Vivre dans la société française' as const;

const naturalisationBaseSources = ['naturalisation-question-list', 'naturalisation-livret'];
const naturalisationRightsSources = [
  'naturalisation-question-list',
  'naturalisation-livret',
  'naturalisation-charte',
];
const naturalisationServiceSources = [
  'naturalisation-question-list',
  'naturalisation-service-public',
];

const seeds: NaturalisationSeed[] = [
  {
    id: 'nat-principles-001',
    theme: principlesTheme,
    prompt: 'Complétez les paroles de la Marseillaise "Allons enfants de la patrie..."',
    correct: 'Le jour de gloire est arrivé',
    distractors: [
      'Le drapeau blanc est levé',
      'La paix du monde est signée',
      'La République est terminée',
    ],
    explanation:
      "La Marseillaise est l'hymne national français. La suite attendue est « Le jour de gloire est arrivé ».",
  },
  {
    id: 'nat-principles-002',
    theme: principlesTheme,
    prompt: "Dans le cadre d'un entretien d'embauche, que peut-on demander au candidat ?",
    correct: 'Ses compétences et son expérience professionnelle',
    distractors: [
      'Sa religion',
      'Son origine ethnique',
      'Son projet d’avoir des enfants',
    ],
    explanation:
      "Un recruteur peut interroger le candidat sur ses capacités professionnelles, mais pas sur des critères discriminatoires.",
  },
  {
    id: 'nat-principles-003',
    theme: principlesTheme,
    prompt: 'Déclarer ses revenus aux services fiscaux est :',
    correct: 'Une obligation légale',
    distractors: ['Une simple option', 'Une démarche réservée aux propriétaires', 'Une obligation seulement pour les étrangers'],
    explanation:
      'La déclaration de revenus permet de calculer les impôts et fait partie des obligations civiques.',
  },
  {
    id: 'nat-principles-004',
    theme: principlesTheme,
    prompt: 'En France, les impôts permettent de financer les dépenses publiques. Quelle proposition est correcte ?',
    correct: 'Ils financent notamment les services publics et la solidarité nationale',
    distractors: [
      'Ils servent uniquement à payer les élus',
      'Ils sont facultatifs si on travaille peu',
      'Ils remplacent le vote aux élections',
    ],
    explanation:
      "Les impôts contribuent au financement de l'école, de la santé, de la sécurité, des infrastructures et de la solidarité.",
  },
  {
    id: 'nat-principles-005',
    theme: principlesTheme,
    prompt: "La liberté d'association est :",
    correct: 'Le droit de créer ou rejoindre une association dans le respect de la loi',
    distractors: [
      'Le droit de créer une police privée',
      'Le droit de ne respecter aucune règle',
      'Le droit réservé aux partis politiques',
    ],
    explanation:
      "La liberté d'association permet de se regrouper autour d'un projet licite, sans autorisation politique préalable.",
  },
  {
    id: 'nat-principles-006',
    theme: principlesTheme,
    prompt: "La liberté d'expression sur les réseaux sociaux en France est :",
    correct: 'Protégée, mais limitée par la loi contre la haine, les menaces et la diffamation',
    distractors: [
      'Illimitée dans tous les cas',
      'Interdite pour les personnes étrangères',
      'Réservée aux journalistes',
    ],
    explanation:
      "Internet n'est pas une zone sans loi : les propos haineux, les menaces et la diffamation peuvent être sanctionnés.",
  },
  {
    id: 'nat-principles-007',
    theme: principlesTheme,
    prompt: 'Lequel de ces prénoms évoque un symbole de la République ?',
    correct: 'Marianne',
    distractors: ['Jeanne', 'Camille', 'Louise'],
    explanation:
      'Marianne est une figure allégorique représentant la République française.',
  },
  {
    id: 'nat-principles-008',
    theme: principlesTheme,
    prompt: 'Lequel de ces symboles représente la République française ?',
    correct: 'Marianne',
    distractors: ['La couronne royale', 'Le dollar', 'Le drapeau britannique'],
    explanation:
      'Marianne représente la République dans les mairies, les documents officiels et certains timbres.',
  },
  {
    id: 'nat-principles-009',
    theme: principlesTheme,
    prompt: 'Où peut-on voir la devise de la République ?',
    correct: 'Sur des bâtiments publics comme les mairies',
    distractors: ['Uniquement dans les stades', 'Seulement sur les factures privées', 'Uniquement dans les restaurants'],
    explanation:
      'La devise « Liberté, Égalité, Fraternité » apparaît notamment sur des bâtiments publics.',
  },
  {
    id: 'nat-principles-010',
    theme: principlesTheme,
    prompt: 'Lesquels sont des symboles officiels de la République française ?',
    correct: 'Le drapeau tricolore, la Marseillaise, la devise et Marianne',
    distractors: [
      'Le dollar, le roi et la couronne',
      'Une marque commerciale et un logo privé',
      'Un hymne régional seulement',
    ],
    explanation:
      'Les symboles républicains les plus connus sont le drapeau bleu-blanc-rouge, la Marseillaise, la devise et Marianne.',
  },
  {
    id: 'nat-principles-011',
    theme: principlesTheme,
    prompt: 'Quand la sécurité sociale a-t-elle été établie en France ?',
    correct: 'En 1945',
    distractors: ['En 1789', 'En 1905', 'En 2002'],
    explanation:
      'La Sécurité sociale française est créée après la Seconde Guerre mondiale, en 1945.',
  },
  {
    id: 'nat-principles-012',
    theme: principlesTheme,
    prompt: 'Que commémore la fête nationale ?',
    correct: 'Le 14 juillet, symbole de la Révolution française et de la fête de la Fédération',
    distractors: [
      "La création de l'euro",
      'La fin de la Première Guerre mondiale',
      'La naissance de la Ve République',
    ],
    explanation:
      'La fête nationale du 14 juillet renvoie à la prise de la Bastille en 1789 et à la fête de la Fédération en 1790.',
  },
  {
    id: 'nat-principles-013',
    theme: principlesTheme,
    prompt: 'Que porte Marianne sur la tête ?',
    correct: 'Un bonnet phrygien',
    distractors: ['Une couronne royale', 'Un casque militaire moderne', 'Une casquette de sport'],
    explanation:
      'Le bonnet phrygien est associé à la liberté et apparaît souvent sur les représentations de Marianne.',
  },
  {
    id: 'nat-principles-014',
    theme: principlesTheme,
    prompt: "Quel symbole de la République peut-on voir sur les maillots de l'équipe de France de football ?",
    correct: 'Le coq',
    distractors: ['La couronne', 'La fleur de lys seule', 'La Tour Eiffel uniquement'],
    explanation:
      "Le coq est un symbole associé à la France et figure sur les maillots de plusieurs équipes nationales.",
  },
  {
    id: 'nat-principles-015',
    theme: principlesTheme,
    prompt: "Qu'est-ce qu'une liberté ?",
    correct: 'Un droit d’agir ou de penser dans les limites prévues par la loi',
    distractors: [
      'Le droit de faire tout ce que l’on veut sans limite',
      'Une autorisation réservée aux élus',
      'Une règle religieuse obligatoire',
    ],
    explanation:
      'Une liberté fondamentale protège la personne, mais elle se concilie avec les droits des autres et l’ordre public.',
  },
  {
    id: 'nat-principles-016',
    theme: principlesTheme,
    prompt: 'Une personne peut-elle changer librement de religion en France ?',
    correct: 'Oui, la liberté de conscience le permet',
    distractors: [
      'Non, une religion est imposée par l’État',
      'Oui, seulement avec une autorisation du maire',
      'Non, c’est réservé aux citoyens français',
    ],
    explanation:
      'La liberté de conscience permet de croire, de ne pas croire ou de changer de religion.',
  },
  {
    id: 'nat-principles-017',
    theme: principlesTheme,
    prompt: "Que dit la loi de 1905 ?",
    correct: 'Elle organise la séparation des Églises et de l’État',
    distractors: [
      'Elle rend le vote obligatoire',
      'Elle crée la Sécurité sociale',
      'Elle fonde l’Union européenne',
    ],
    explanation:
      'La loi du 9 décembre 1905 est un texte central de la laïcité en France.',
  },
  {
    id: 'nat-principles-018',
    theme: principlesTheme,
    prompt: 'Quel jour célèbre-t-on officiellement la laïcité en France ?',
    correct: 'Le 9 décembre',
    distractors: ['Le 14 juillet', 'Le 8 mai', 'Le 11 novembre'],
    explanation:
      'La journée de la laïcité est célébrée le 9 décembre, date anniversaire de la loi de 1905.',
  },
  {
    id: 'nat-principles-019',
    theme: principlesTheme,
    prompt: 'Quel symbole religieux peut être porté dans une école publique dans le respect de la laïcité ?',
    correct: 'Un signe discret',
    distractors: [
      'Un signe manifestement ostensible',
      'Un uniforme religieux imposé à tous',
      'Un signe utilisé pour faire pression sur les autres élèves',
    ],
    explanation:
      "À l'école publique, les signes religieux ostensibles sont interdits, mais un signe discret peut être admis.",
  },
  {
    id: 'nat-principles-020',
    theme: principlesTheme,
    prompt: 'Quel terme désigne précisément la haine ou les préjugés contre les Juifs ?',
    correct: 'L’antisémitisme',
    distractors: ['La xénophilie', 'La laïcité', 'La citoyenneté'],
    explanation:
      'L’antisémitisme désigne la haine, les préjugés ou les discriminations visant les Juifs.',
  },
  {
    id: 'nat-principles-021',
    theme: principlesTheme,
    prompt: 'Quelle institution française doit rester neutre en matière de religion ?',
    correct: 'L’État et les services publics',
    distractors: ['Les familles à leur domicile', 'Les associations privées dans tous les cas', 'Les citoyens dans leur vie personnelle'],
    explanation:
      'La neutralité religieuse s’impose à l’État, aux services publics et à leurs agents.',
  },
  {
    id: 'nat-principles-022',
    theme: principlesTheme,
    prompt: "Qu'est-ce que la laïcité ?",
    correct: 'La neutralité de l’État et la liberté de conscience de chacun',
    distractors: [
      'L’interdiction de toute conviction personnelle',
      'La préférence de l’État pour une religion',
      'Une règle réservée aux écoles privées',
    ],
    explanation:
      'La laïcité protège à la fois la neutralité de l’État et la liberté de croire ou de ne pas croire.',
  },
  {
    id: 'nat-principles-023',
    theme: principlesTheme,
    prompt: "À l'école, la charte de la laïcité permet de :",
    correct: 'Comprendre les droits et devoirs liés à la laïcité',
    distractors: [
      'Remplacer les programmes scolaires',
      'Choisir une religion officielle',
      'Interdire tout débat en classe',
    ],
    explanation:
      'La charte de la laïcité explique aux élèves le sens de la laïcité dans l’école publique.',
  },
  {
    id: 'nat-principles-024',
    theme: principlesTheme,
    prompt: 'Une personne déclare ne croire en aucun dieu. On peut dire :',
    correct: 'Qu’elle est athée',
    distractors: ['Qu’elle est maire', 'Qu’elle est sénatrice', 'Qu’elle est jurée d’assises'],
    explanation:
      'Une personne athée ne croit en aucun dieu. La liberté de conscience protège aussi cette conviction.',
  },
  {
    id: 'nat-system-001',
    theme: systemTheme,
    prompt: 'Comment est désigné le Premier ministre ?',
    correct: 'Il est nommé par le Président de la République',
    distractors: [
      'Il est tiré au sort',
      'Il est nommé par le maire de Paris',
      'Il est élu directement par les députés européens',
    ],
    explanation:
      'Sous la Ve République, le Président de la République nomme le Premier ministre.',
  },
  {
    id: 'nat-system-002',
    theme: systemTheme,
    prompt: 'À qui appartient la souveraineté nationale ?',
    correct: 'Au peuple',
    distractors: ['Au seul gouvernement', 'À une entreprise privée', 'À une autorité religieuse'],
    explanation:
      'La souveraineté nationale appartient au peuple, qui l’exerce par ses représentants et par référendum.',
  },
  {
    id: 'nat-system-003',
    theme: systemTheme,
    prompt: 'Qui est élu lors des élections municipales ?',
    correct: 'Les conseillers municipaux',
    distractors: ['Le Président de la République', 'Les sénateurs directement', 'Les préfets'],
    explanation:
      'Les électeurs choisissent les conseillers municipaux ; le maire est ensuite élu par le conseil municipal.',
  },
  {
    id: 'nat-system-004',
    theme: systemTheme,
    prompt: "L'inscription sur les listes électorales est :",
    correct: 'Nécessaire pour voter',
    distractors: [
      'Interdite aux citoyens français',
      'Automatiquement remplacée par la carte Vitale',
      'Utile seulement pour payer ses impôts',
    ],
    explanation:
      'Pour voter, il faut notamment être inscrit sur les listes électorales.',
  },
  {
    id: 'nat-system-005',
    theme: systemTheme,
    prompt: 'Quelle condition est nécessaire pour voter aux élections présidentielles ?',
    correct: 'Être citoyen français, majeur, inscrit et disposer de ses droits civiques',
    distractors: [
      'Avoir seulement un titre de séjour',
      'Être propriétaire de son logement',
      'Avoir un contrat de travail',
    ],
    explanation:
      'Le vote à l’élection présidentielle est réservé aux citoyens français remplissant les conditions électorales.',
  },
  {
    id: 'nat-system-006',
    theme: systemTheme,
    prompt: 'Une personne, n’ayant pas d’accès à internet, veut s’inscrire sur les listes électorales pour pouvoir voter aux prochaines élections politiques. Où peut-elle s’inscrire ?',
    correct: 'À la mairie',
    distractors: ['À la pharmacie', 'À la banque', 'Dans un magasin privé'],
    explanation:
      'L’inscription sur les listes électorales peut se faire en mairie, notamment pour les personnes sans accès internet.',
  },
  {
    id: 'nat-system-007',
    theme: systemTheme,
    prompt: 'À quel âge peut-on devenir électeur ?',
    correct: 'À 18 ans',
    distractors: ['À 12 ans', 'À 16 ans dans tous les cas', 'À 21 ans uniquement'],
    explanation:
      'La majorité électorale est fixée à 18 ans.',
  },
  {
    id: 'nat-system-008',
    theme: systemTheme,
    prompt: 'En France, est-ce obligatoire de voter ?',
    correct: 'Non, voter est un droit mais pas une obligation générale',
    distractors: [
      'Oui, sous peine de prison à chaque élection',
      'Oui, seulement pour les naturalisés',
      'Non, car les élections n’existent pas',
    ],
    explanation:
      'En France, le vote est un droit civique important, mais il n’est pas obligatoire pour la plupart des élections.',
  },
  {
    id: 'nat-system-009',
    theme: systemTheme,
    prompt: 'Comment sont désignés les députés ?',
    correct: 'Ils sont élus au suffrage universel direct',
    distractors: [
      'Ils sont nommés par les préfets',
      'Ils sont choisis par tirage au sort',
      'Ils héritent de leur mandat',
    ],
    explanation:
      'Les députés de l’Assemblée nationale sont élus directement par les électeurs.',
  },
  {
    id: 'nat-system-010',
    theme: systemTheme,
    prompt: 'Qui vote les lois ?',
    correct: 'Le Parlement',
    distractors: ['La police nationale', 'Les banques', 'Les entreprises privées'],
    explanation:
      'Le Parlement, composé de l’Assemblée nationale et du Sénat, vote la loi.',
  },
  {
    id: 'nat-system-011',
    theme: systemTheme,
    prompt: 'Quelles sont les durées du mandat du conseil municipal et du maire ?',
    correct: '6 ans',
    distractors: ['2 ans', '5 ans', '9 ans'],
    explanation:
      'Les conseillers municipaux et le maire sont élus pour un mandat municipal de 6 ans.',
  },
  {
    id: 'nat-system-012',
    theme: systemTheme,
    prompt: 'Qui est élu lors des élections législatives ?',
    correct: 'Les députés',
    distractors: ['Les maires', 'Les préfets', 'Les juges'],
    explanation:
      'Les élections législatives permettent d’élire les députés à l’Assemblée nationale.',
  },
  {
    id: 'nat-system-013',
    theme: systemTheme,
    prompt: 'Quelle est la durée du mandat du Président de la République française ?',
    correct: '5 ans',
    distractors: ['3 ans', '6 ans', '9 ans'],
    explanation:
      'Le mandat présidentiel dure 5 ans : on parle du quinquennat.',
  },
  {
    id: 'nat-system-014',
    theme: systemTheme,
    prompt: 'Quelle est la durée du mandat des députés ?',
    correct: '5 ans',
    distractors: ['2 ans', '6 ans', '10 ans'],
    explanation:
      'Les députés sont élus pour 5 ans, sauf dissolution de l’Assemblée nationale.',
  },
  {
    id: 'nat-system-015',
    theme: systemTheme,
    prompt: 'Quelle est la durée du mandat des sénateurs ?',
    correct: '6 ans',
    distractors: ['3 ans', '5 ans', '12 ans'],
    explanation:
      'Les sénateurs sont élus pour 6 ans, avec renouvellement partiel du Sénat.',
  },
  {
    id: 'nat-system-016',
    theme: systemTheme,
    prompt: "En France, est-ce possible d'adhérer à un parti politique ?",
    correct: 'Oui, c’est une forme de participation à la vie démocratique',
    distractors: [
      'Non, les partis politiques sont interdits',
      'Oui, mais seulement pour les ministres',
      'Non, sauf autorisation du préfet à chaque réunion',
    ],
    explanation:
      'Le pluralisme politique et la liberté d’adhérer à un parti font partie de la démocratie.',
  },
  {
    id: 'nat-system-017',
    theme: systemTheme,
    prompt: 'Qui gère les collèges publics ?',
    correct: 'Le département',
    distractors: ['La commune', 'La région', 'La Commission européenne'],
    explanation:
      'Les départements sont notamment responsables des collèges publics.',
  },
  {
    id: 'nat-system-018',
    theme: systemTheme,
    prompt: 'Qui gère les écoles primaires et maternelles publiques ?',
    correct: 'La commune',
    distractors: ['Le Sénat', 'La région', 'La Banque centrale européenne'],
    explanation:
      'Les communes ont un rôle important dans la gestion matérielle des écoles maternelles et élémentaires publiques.',
  },
  {
    id: 'nat-system-019',
    theme: systemTheme,
    prompt: 'Comment sont désignés les maires ?',
    correct: 'Ils sont élus par les conseillers municipaux',
    distractors: [
      'Ils sont nommés par le président de la République',
      'Ils sont tirés au sort parmi les habitants',
      'Ils sont choisis par les députés européens',
    ],
    explanation:
      'Après les élections municipales, le conseil municipal élit le maire.',
  },
  {
    id: 'nat-system-020',
    theme: systemTheme,
    prompt: 'Quelle collectivité territoriale est responsable des transports régionaux ?',
    correct: 'La région',
    distractors: ['La commune uniquement', 'Le tribunal judiciaire', 'La gendarmerie'],
    explanation:
      'La région est compétente pour l’organisation de nombreux transports régionaux.',
  },
  {
    id: 'nat-system-021',
    theme: systemTheme,
    prompt: "Quelle est l'une des voies possibles pour modifier la Constitution ?",
    correct: 'Le référendum ou le vote du Parlement réuni en Congrès selon la procédure prévue',
    distractors: [
      'Une simple décision d’une mairie',
      'Un sondage sur internet',
      'Une décision d’une entreprise privée',
    ],
    explanation:
      'La révision constitutionnelle suit une procédure encadrée par la Constitution.',
  },
  {
    id: 'nat-system-022',
    theme: systemTheme,
    prompt: 'Qui assure l’intérim du président de la République en cas de décès ?',
    correct: 'Le président du Sénat',
    distractors: ['Le maire de Paris', 'Le président de la BCE', 'Le Défenseur des droits'],
    explanation:
      'En cas de vacance de la présidence, l’intérim est assuré par le président du Sénat.',
  },
  {
    id: 'nat-system-023',
    theme: systemTheme,
    prompt: 'Quel est le rôle du Conseil constitutionnel ?',
    correct: 'Contrôler notamment la conformité des lois à la Constitution',
    distractors: [
      'Diriger la police',
      'Fixer les prix dans les magasins',
      'Remplacer le gouvernement',
    ],
    explanation:
      'Le Conseil constitutionnel veille notamment au respect de la Constitution.',
  },
  {
    id: 'nat-system-024',
    theme: systemTheme,
    prompt: 'Combien y a-t-il de départements en France ?',
    correct: '101 départements',
    distractors: ['13 départements', '36 départements', '220 départements'],
    explanation:
      'La France compte 101 départements, en incluant les départements d’outre-mer.',
  },
  {
    id: 'nat-system-025',
    theme: systemTheme,
    prompt: 'Comment est organisé le découpage administratif de la France ?',
    correct: 'En communes, départements et régions notamment',
    distractors: [
      'Uniquement en royaumes',
      'Uniquement en quartiers privés',
      'Seulement en zones commerciales',
    ],
    explanation:
      'L’organisation territoriale française repose notamment sur les communes, départements et régions.',
  },
  {
    id: 'nat-system-026',
    theme: systemTheme,
    prompt: "Qui représente l'État dans un département ?",
    correct: 'Le préfet',
    distractors: ['Le notaire', 'Le maire de chaque village', 'Le directeur d’une banque'],
    explanation:
      'Le préfet représente l’État dans le département.',
  },
  {
    id: 'nat-system-027',
    theme: systemTheme,
    prompt: 'En quelle année la citoyenneté européenne a-t-elle été créée ?',
    correct: 'En 1992 avec le traité de Maastricht',
    distractors: ['En 1789', 'En 1905', 'En 2020 avec le Brexit'],
    explanation:
      'Le traité de Maastricht, signé en 1992, crée la citoyenneté européenne.',
  },
  {
    id: 'nat-system-028',
    theme: systemTheme,
    prompt: "Qui a composé l'hymne de l'Union européenne ?",
    correct: 'Ludwig van Beethoven',
    distractors: ['Claude Monet', 'Victor Hugo', 'Marie Curie'],
    explanation:
      'L’hymne européen reprend le thème de l’Ode à la joie de Beethoven.',
  },
  {
    id: 'nat-system-029',
    theme: systemTheme,
    prompt: "Quand est célébrée la journée de l'Europe ?",
    correct: 'Le 9 mai',
    distractors: ['Le 14 juillet', 'Le 11 novembre', 'Le 1er mai'],
    explanation:
      'La journée de l’Europe est célébrée le 9 mai.',
  },
  {
    id: 'nat-system-030',
    theme: systemTheme,
    prompt: 'Où est le siège de la Banque centrale européenne ?',
    correct: 'À Francfort',
    distractors: ['À Marseille', 'À Madrid', 'À Rome'],
    explanation:
      'La Banque centrale européenne siège à Francfort, en Allemagne.',
  },
  {
    id: 'nat-system-031',
    theme: systemTheme,
    prompt: 'Qui siège au Parlement européen ?',
    correct: 'Les députés européens',
    distractors: ['Les préfets français', 'Les maires uniquement', 'Les jurés d’assises'],
    explanation:
      'Le Parlement européen est composé de députés européens élus par les citoyens de l’Union européenne.',
  },
  {
    id: 'nat-system-032',
    theme: systemTheme,
    prompt: "Combien d'États font partie de l'Union européenne au 1er janvier 2025 ?",
    correct: '27 États',
    distractors: ['6 États', '18 États', '35 États'],
    explanation:
      'Depuis le départ du Royaume-Uni, l’Union européenne compte 27 États membres.',
  },
  {
    id: 'nat-system-033',
    theme: systemTheme,
    prompt: "Qui élit les députés européens ?",
    correct: 'Les citoyens européens',
    distractors: ['Les seuls ministres', 'Les préfets', 'Les entreprises'],
    explanation:
      'Les députés européens sont élus au suffrage universel direct par les citoyens de l’Union européenne.',
  },
  {
    id: 'nat-rights-001',
    theme: rightsTheme,
    prompt: 'À quoi sert le droit de grève ?',
    correct: 'À défendre des revendications professionnelles ou sociales',
    distractors: [
      'À supprimer toutes les lois',
      'À empêcher définitivement les élections',
      'À remplacer un contrat de travail',
    ],
    explanation:
      'Le droit de grève permet aux salariés de cesser collectivement le travail pour défendre des revendications.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-002',
    theme: rightsTheme,
    prompt: "Au nom de quoi l'État justifie-t-il la restriction des droits ?",
    correct: 'Au nom de l’ordre public et de la protection des droits d’autrui',
    distractors: [
      'Au nom d’une préférence religieuse',
      'Pour empêcher toute opinion différente',
      'Pour supprimer définitivement les libertés',
    ],
    explanation:
      'Les libertés peuvent être encadrées par la loi pour protéger l’ordre public et les droits des autres.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-003',
    theme: rightsTheme,
    prompt: 'Que garantit la liberté de la presse ?',
    correct: 'Le droit d’informer et de publier dans le respect de la loi',
    distractors: [
      'Le droit de diffamer sans preuve',
      'Le droit de menacer une personne',
      'Le droit de censurer tous les journaux',
    ],
    explanation:
      'La liberté de la presse protège l’information et le débat public, avec des limites comme la diffamation.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-004',
    theme: rightsTheme,
    prompt: 'Que permet la liberté de circulation ?',
    correct: 'Se déplacer librement dans le respect de la loi',
    distractors: [
      'Conduire sans permis',
      'Entrer dans tous les lieux privés sans accord',
      'Ne jamais respecter une décision de justice',
    ],
    explanation:
      'La liberté de circulation est une liberté fondamentale, mais elle s’exerce dans le cadre légal.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-005',
    theme: rightsTheme,
    prompt: "Que signifie être citoyen d'un État ?",
    correct: 'Avoir des droits et des devoirs dans une communauté politique',
    distractors: [
      'Ne dépendre d’aucune loi',
      'Être automatiquement élu',
      'Ne jamais participer à la vie collective',
    ],
    explanation:
      'La citoyenneté associe des droits politiques, des libertés et des devoirs envers la collectivité.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-006',
    theme: rightsTheme,
    prompt: 'Que sont les droits fondamentaux ?',
    correct: 'Des droits essentiels protégés par les textes et les institutions',
    distractors: [
      'Des avantages réservés aux riches',
      'Des règles facultatives',
      'Des droits supprimés à chaque élection',
    ],
    explanation:
      'Les droits fondamentaux protègent la dignité, les libertés et l’égalité des personnes.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-007',
    theme: rightsTheme,
    prompt: 'Quel droit protège une personne contre une arrestation arbitraire ?',
    correct: 'La sûreté et la liberté individuelle',
    distractors: ['La liberté commerciale', 'Le droit de grève uniquement', 'Le droit de propriété seulement'],
    explanation:
      'La sûreté protège contre les arrestations et détentions arbitraires.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-008',
    theme: rightsTheme,
    prompt: 'Quel texte affirme que tous les hommes naissent libres et égaux en droits ?',
    correct: 'La Déclaration des droits de l’homme et du citoyen de 1789',
    distractors: ['Le Code de la route', 'Le traité de Maastricht', 'Le livret de famille'],
    explanation:
      'La Déclaration de 1789 affirme dès son article premier que les hommes naissent et demeurent libres et égaux en droits.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-009',
    theme: rightsTheme,
    prompt: 'Quelle situation est une atteinte à la dignité humaine ?',
    correct: 'Traiter une personne comme un objet ou l’exploiter violemment',
    distractors: [
      'Respecter une personne handicapée',
      'Demander un document administratif',
      'Aider une personne en danger',
    ],
    explanation:
      'La dignité humaine interdit les traitements dégradants, l’exploitation et les violences.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-010',
    theme: rightsTheme,
    prompt: 'Suite à une interpellation par la police, il est possible de :',
    correct: 'Bénéficier des droits prévus par la loi, notamment être informé et demander un avocat',
    distractors: [
      'Être privé de tout droit automatiquement',
      'Choisir soi-même la peine',
      'Refuser l’existence du juge',
    ],
    explanation:
      'Même en cas d’interpellation, la personne bénéficie de garanties légales.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-011',
    theme: rightsTheme,
    prompt: 'À quel âge est la majorité numérique en France ?',
    correct: '15 ans',
    distractors: ['8 ans', '18 ans dans tous les cas', '25 ans'],
    explanation:
      'La majorité numérique est fixée à 15 ans pour l’inscription autonome à certains services numériques.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-012',
    theme: rightsTheme,
    prompt: "En France, la conduite sans permis d'une moto est :",
    correct: 'Interdite et sanctionnée',
    distractors: ['Autorisée le dimanche', 'Autorisée avec une carte Vitale', 'Réservée aux touristes'],
    explanation:
      'Conduire sans le permis nécessaire est une infraction.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-013',
    theme: rightsTheme,
    prompt: 'En quoi consiste le devoir de solidarité ?',
    correct: 'Contribuer et aider les personnes en difficulté selon les règles communes',
    distractors: [
      'Ignorer les personnes vulnérables',
      'Refuser tous les impôts',
      'Aider seulement sa famille et jamais les autres',
    ],
    explanation:
      'La solidarité se traduit notamment par les contributions, la protection sociale et l’aide aux personnes en difficulté.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-014',
    theme: rightsTheme,
    prompt: "Est-ce légal d'être marié à plusieurs personnes en même temps ?",
    correct: 'Non, la polygamie est interdite en France',
    distractors: ['Oui, toujours', 'Oui, uniquement en mairie', 'Oui, si les conjoints habitent loin'],
    explanation:
      'Le droit français interdit d’être marié à plusieurs personnes en même temps.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-015',
    theme: rightsTheme,
    prompt: 'Est-il obligatoire de porter secours à une personne en danger ?',
    correct: 'Oui, si l’on peut agir sans se mettre soi-même en danger',
    distractors: [
      'Non, c’est toujours facultatif',
      'Oui, seulement pour les médecins',
      'Non, si la personne est inconnue',
    ],
    explanation:
      'La non-assistance à personne en danger peut être sanctionnée.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-016',
    theme: rightsTheme,
    prompt: "Être juré d'assises est :",
    correct: 'Un devoir civique lorsque l’on est tiré au sort',
    distractors: [
      'Une activité commerciale',
      'Un loisir facultatif sans convocation',
      'Une fonction réservée aux ministres',
    ],
    explanation:
      'Le jury d’assises permet à des citoyens de participer à la justice pénale pour les crimes.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-017',
    theme: rightsTheme,
    prompt: 'La vente d’alcool en France est interdite aux personnes de moins de :',
    correct: '18 ans',
    distractors: ['12 ans', '15 ans', '21 ans'],
    explanation:
      'La vente d’alcool aux mineurs est interdite en France.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-018',
    theme: rightsTheme,
    prompt: 'Pour obtenir une carte d’identité, il faut :',
    correct: 'Être de nationalité française',
    distractors: [
      'Avoir seulement une carte bancaire',
      'Être propriétaire',
      'Avoir un permis de conduire étranger',
    ],
    explanation:
      'La carte nationale d’identité française est délivrée aux personnes de nationalité française.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-019',
    theme: rightsTheme,
    prompt: "Quel est l'âge de la majorité civile en France ?",
    correct: '18 ans',
    distractors: ['15 ans', '16 ans', '21 ans'],
    explanation:
      'La majorité civile est fixée à 18 ans.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-020',
    theme: rightsTheme,
    prompt: "Quelle est l'infraction la plus grave ?",
    correct: 'Le crime',
    distractors: ['La contravention', 'Le rappel à l’ordre', 'La simple remarque'],
    explanation:
      'En droit pénal français, les infractions sont classées en contraventions, délits et crimes ; le crime est le plus grave.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-021',
    theme: rightsTheme,
    prompt: "Qu'est-ce que la citoyenneté numérique ?",
    correct: 'Utiliser internet de façon responsable en respectant la loi et les autres',
    distractors: [
      'Créer plusieurs identités pour tromper les autres',
      'Publier des menaces anonymes',
      'Éviter toutes les règles en ligne',
    ],
    explanation:
      'La citoyenneté numérique suppose le respect des droits, de la loi et des personnes dans les usages numériques.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-022',
    theme: rightsTheme,
    prompt: "Qu'est-ce que le devoir de mémoire ?",
    correct: 'Se souvenir des événements graves du passé pour transmettre et prévenir leur répétition',
    distractors: [
      'Oublier les crimes de l’histoire',
      'Remplacer l’histoire par des rumeurs',
      'Interdire les commémorations',
    ],
    explanation:
      'Le devoir de mémoire aide à transmettre l’histoire et à prévenir les discriminations, guerres et crimes de masse.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-023',
    theme: rightsTheme,
    prompt: 'Une personne est privée de ses droits civils et politiques pendant 5 ans suite à une condamnation. Parmi ces propositions laquelle est correcte ? Pendant 5 ans,...',
    correct: 'Elle ne peut pas exercer les droits retirés par la décision du juge',
    distractors: [
      'Elle peut voter normalement dans tous les cas',
      'Elle devient automatiquement maire',
      'Elle n’est plus soumise à aucune loi',
    ],
    explanation:
      'La privation de droits civils et politiques peut empêcher de voter ou d’être élu pendant la durée fixée.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-history-001',
    theme: historyTheme,
    prompt: 'Parmi ces textes, lequel a été adopté sous Napoléon Ier ?',
    correct: 'Le Code civil',
    distractors: ['La Charte de la laïcité', 'Le traité de Maastricht', 'La Constitution de 1958 uniquement'],
    explanation:
      'Le Code civil, aussi appelé Code Napoléon, est adopté sous Napoléon Bonaparte.',
  },
  {
    id: 'nat-history-002',
    theme: historyTheme,
    prompt: 'Que signifie la date du 14 juillet pour les Français ?',
    correct: 'La fête nationale liée à la Révolution française',
    distractors: ['La création de la Sécurité sociale', 'La signature du traité de Maastricht', 'La création de l’euro'],
    explanation:
      'Le 14 juillet est la fête nationale française et renvoie aux événements révolutionnaires de 1789 et 1790.',
  },
  {
    id: 'nat-history-003',
    theme: historyTheme,
    prompt: "Lequel de ces pays est un pays fondateur de l'Union Européenne ?",
    correct: 'La France',
    distractors: ['Le Royaume-Uni', 'La Norvège', 'La Suisse'],
    explanation:
      'La France fait partie des six pays fondateurs de la construction européenne.',
  },
  {
    id: 'nat-history-004',
    theme: historyTheme,
    prompt: "Dans quelle région est située une partie des plages du débarquement ayant permis d'engager la libération de la France ?",
    correct: 'En Normandie',
    distractors: ['En Bretagne uniquement', 'En Corse', 'En Alsace'],
    explanation:
      'Le débarquement allié du 6 juin 1944 a eu lieu sur les plages de Normandie.',
  },
  {
    id: 'nat-history-005',
    theme: historyTheme,
    prompt: 'Dans quelle ville les rois de France étaient-ils couronnés ?',
    correct: 'Reims',
    distractors: ['Marseille', 'Nice', 'Bordeaux'],
    explanation:
      'La cathédrale de Reims est le lieu traditionnel du sacre de nombreux rois de France.',
  },
  {
    id: 'nat-history-006',
    theme: historyTheme,
    prompt: 'Quel roi de France a été guillotiné pendant la Révolution française ?',
    correct: 'Louis XVI',
    distractors: ['Louis XIV', 'Henri IV', 'François Ier'],
    explanation:
      'Louis XVI est exécuté pendant la Révolution française en 1793.',
  },
  {
    id: 'nat-history-007',
    theme: historyTheme,
    prompt: 'En quelle année a débuté la Révolution française ?',
    correct: '1789',
    distractors: ['1515', '1804', '1945'],
    explanation:
      'La Révolution française débute en 1789.',
  },
  {
    id: 'nat-history-008',
    theme: historyTheme,
    prompt: 'En quelle année Napoléon Ier est-il devenu empereur ?',
    correct: '1804',
    distractors: ['1789', '1870', '1940'],
    explanation:
      'Napoléon Bonaparte devient empereur des Français en 1804.',
  },
  {
    id: 'nat-history-009',
    theme: historyTheme,
    prompt: "De quand date l'appel à la résistance du général de Gaulle ?",
    correct: 'Du 18 juin 1940',
    distractors: ['Du 14 juillet 1789', 'Du 8 mai 1945', 'Du 9 mai 1950'],
    explanation:
      'L’appel du 18 juin 1940 est un repère majeur de la Résistance française.',
  },
  {
    id: 'nat-history-010',
    theme: historyTheme,
    prompt: "Qu'est-ce que la Shoah ?",
    correct: 'Le génocide des Juifs d’Europe par les nazis',
    distractors: [
      'La création de l’Union européenne',
      'Une loi fiscale',
      'Une fête nationale',
    ],
    explanation:
      'La Shoah désigne l’extermination des Juifs d’Europe par le régime nazi et ses collaborateurs.',
  },
  {
    id: 'nat-history-011',
    theme: historyTheme,
    prompt: 'Depuis quand les Français élisent-ils le président de la République au suffrage universel direct ?',
    correct: 'Depuis 1962',
    distractors: ['Depuis 1789', 'Depuis 1905', 'Depuis 2002'],
    explanation:
      'Depuis la réforme de 1962, le Président de la République est élu au suffrage universel direct.',
  },
  {
    id: 'nat-history-012',
    theme: historyTheme,
    prompt: "En quelle année l'Union européenne a-t-elle été fondée?",
    correct: 'En 1993',
    distractors: ['En 1789', 'En 1945', 'En 2020'],
    explanation:
      'L’Union européenne naît juridiquement avec l’entrée en vigueur du traité de Maastricht en 1993.',
  },
  {
    id: 'nat-history-013',
    theme: historyTheme,
    prompt: 'Quand a eu lieu la Seconde guerre mondiale ?',
    correct: 'De 1939 à 1945',
    distractors: ['De 1914 à 1918', 'De 1789 à 1799', 'De 1951 à 1957'],
    explanation:
      'La Seconde Guerre mondiale se déroule de 1939 à 1945.',
  },
  {
    id: 'nat-history-014',
    theme: historyTheme,
    prompt: 'Quand a eu lieu la Première guerre mondiale ?',
    correct: 'De 1914 à 1918',
    distractors: ['De 1939 à 1945', 'De 1789 à 1792', 'De 1962 à 1968'],
    explanation:
      'La Première Guerre mondiale se déroule de 1914 à 1918.',
  },
  {
    id: 'nat-history-015',
    theme: historyTheme,
    prompt: 'Sous quel président a été abolie la peine de mort en France ?',
    correct: 'François Mitterrand',
    distractors: ['Napoléon Ier', 'Louis XVI', 'Charles X'],
    explanation:
      'La peine de mort est abolie en France en 1981, sous la présidence de François Mitterrand.',
  },
  {
    id: 'nat-history-016',
    theme: historyTheme,
    prompt: 'Que célèbre-t-on le 8 mai ?',
    correct: 'La victoire de 1945 et la fin de la Seconde Guerre mondiale en Europe',
    distractors: ['La prise de la Bastille', 'La fête du travail', 'La journée de la laïcité'],
    explanation:
      'Le 8 mai commémore la victoire des Alliés en Europe en 1945.',
  },
  {
    id: 'nat-history-017',
    theme: historyTheme,
    prompt: 'Quelle est la première étape de la construction européenne en 1951 ?',
    correct: 'La Communauté européenne du charbon et de l’acier',
    distractors: ['L’euro', 'Le Brexit', 'La Révolution française'],
    explanation:
      'La CECA, créée en 1951, est l’une des premières étapes concrètes de la construction européenne.',
  },
  {
    id: 'nat-history-018',
    theme: historyTheme,
    prompt: 'Qui était une figure de la Résistance française pendant la Seconde Guerre mondiale ?',
    correct: 'Jean Moulin',
    distractors: ['Louis XIV', 'Napoléon III', 'Claude Monet'],
    explanation:
      'Jean Moulin est une grande figure de la Résistance française.',
  },
  {
    id: 'nat-history-019',
    theme: historyTheme,
    prompt: 'Le 11 novembre est un jour férié. À quoi correspond cette date ?',
    correct: 'À l’armistice de 1918',
    distractors: ['À la fête nationale', 'À la création de l’euro', 'À la journée de la laïcité'],
    explanation:
      'Le 11 novembre commémore l’armistice mettant fin aux combats de la Première Guerre mondiale.',
  },
  {
    id: 'nat-history-020',
    theme: historyTheme,
    prompt: "Depuis quand l'esclavage a-t-il été aboli en France ?",
    correct: 'Depuis 1848',
    distractors: ['Depuis 1515', 'Depuis 1905', 'Depuis 1981'],
    explanation:
      'L’abolition définitive de l’esclavage dans les colonies françaises date de 1848.',
  },
  {
    id: 'nat-history-021',
    theme: historyTheme,
    prompt: "Qui a aboli l'esclavage en France ?",
    correct: 'Le gouvernement provisoire de 1848, avec l’action de Victor Schœlcher',
    distractors: ['La Banque centrale européenne', 'Louis XVI en 1789', 'La FIFA'],
    explanation:
      'Victor Schœlcher joue un rôle majeur dans le décret d’abolition de l’esclavage de 1848.',
  },
  {
    id: 'nat-history-022',
    theme: historyTheme,
    prompt: "Depuis quelle année l'école publique est-elle gratuite ?",
    correct: 'Depuis 1881',
    distractors: ['Depuis 1789', 'Depuis 1945', 'Depuis 2002'],
    explanation:
      'Les lois scolaires de Jules Ferry rendent notamment l’école primaire publique gratuite en 1881.',
  },
  {
    id: 'nat-history-023',
    theme: historyTheme,
    prompt: "En 1944, qu'est-ce qui a changé pour les femmes ?",
    correct: 'Elles ont obtenu le droit de vote',
    distractors: [
      'Elles ont perdu la nationalité française',
      'Elles ont été exclues de l’école',
      'Elles ont été interdites de travail',
    ],
    explanation:
      'Les femmes obtiennent le droit de vote en France en 1944 et votent pour la première fois en 1945.',
  },
  {
    id: 'nat-history-024',
    theme: historyTheme,
    prompt: 'Quelle organisation a été créée en 1945 après la Seconde Guerre mondiale ?',
    correct: "L'Organisation des Nations unies",
    distractors: ['La CECA', 'La zone euro', 'Le Conseil municipal de Paris'],
    explanation:
      'L’ONU est créée en 1945 pour favoriser la paix et la coopération internationale.',
  },
  {
    id: 'nat-history-025',
    theme: historyTheme,
    prompt: "En quelle année l'euro est-il devenu la monnaie officielle de la France ?",
    correct: 'En 2002 pour les pièces et billets',
    distractors: ['En 1789', 'En 1945', 'En 2020'],
    explanation:
      'Les pièces et billets en euros entrent en circulation en France en 2002.',
  },
  {
    id: 'nat-history-026',
    theme: historyTheme,
    prompt: 'Lors de la seconde guerre mondiale, à quelle date la ville de Paris a-t-elle été libérée ?',
    correct: 'Le 25 août 1944',
    distractors: ['Le 14 juillet 1789', 'Le 11 novembre 1918', 'Le 9 mai 1950'],
    explanation:
      'Paris est libérée le 25 août 1944.',
  },
  {
    id: 'nat-history-027',
    theme: historyTheme,
    prompt: 'Quel célèbre philosophe des Lumières a dénoncé l’esclavage ?',
    correct: 'Montesquieu',
    distractors: ['Molière', 'Auguste Rodin', 'Paul Cézanne'],
    explanation:
      'Montesquieu critique l’esclavage dans l’esprit des Lumières.',
  },
  {
    id: 'nat-history-028',
    theme: historyTheme,
    prompt: 'Qui était Marie Curie ?',
    correct: 'Une scientifique ayant reçu deux prix Nobel',
    distractors: ['Une reine de France', 'Une présidente de région', 'Une exploratrice fictive'],
    explanation:
      'Marie Curie est une scientifique majeure, connue pour ses travaux sur la radioactivité.',
  },
  {
    id: 'nat-history-029',
    theme: historyTheme,
    prompt: 'Qui a peint "La liberté guidant le peuple" ?',
    correct: 'Eugène Delacroix',
    distractors: ['Claude Debussy', 'Victor Schœlcher', 'Jean Moulin'],
    explanation:
      'Eugène Delacroix peint La Liberté guidant le peuple en 1830.',
  },
  {
    id: 'nat-history-030',
    theme: historyTheme,
    prompt: 'Dans quel grand musée parisien est exposée la Joconde ?',
    correct: 'Au musée du Louvre',
    distractors: ['Au château de Versailles', 'Au Mont-Saint-Michel', 'À la mairie de Lyon'],
    explanation:
      'La Joconde de Léonard de Vinci est exposée au musée du Louvre à Paris.',
  },
  {
    id: 'nat-history-031',
    theme: historyTheme,
    prompt: 'Quel château célèbre se trouve près de Paris et symbolise le pouvoir royal de Louis XIV ?',
    correct: 'Le château de Versailles',
    distractors: ['Le château d’If', 'Le Mont-Saint-Michel', 'Le Parlement européen'],
    explanation:
      'Versailles est associé à Louis XIV et à la monarchie absolue.',
  },
  {
    id: 'nat-history-032',
    theme: historyTheme,
    prompt: 'Où peut-on voir des peintures préhistoriques en France ?',
    correct: 'À Lascaux',
    distractors: ['À la Banque centrale européenne', 'Au Sénat', 'À Kourou uniquement'],
    explanation:
      'La grotte de Lascaux est célèbre pour ses peintures préhistoriques.',
  },
  {
    id: 'nat-history-033',
    theme: historyTheme,
    prompt: 'Quel peintre célèbre a peint les Nymphéas ?',
    correct: 'Claude Monet',
    distractors: ['Molière', 'Rouget de Lisle', 'Albert Camus'],
    explanation:
      'Les Nymphéas sont une série célèbre de peintures de Claude Monet.',
  },
  {
    id: 'nat-history-034',
    theme: historyTheme,
    prompt: 'Pendant quelles journées peut-on visiter gratuitement des lieux culturels en France ?',
    correct: 'Les Journées européennes du patrimoine',
    distractors: ['Les élections municipales', 'Les soldes d’hiver', 'La rentrée scolaire uniquement'],
    explanation:
      'Les Journées européennes du patrimoine permettent de découvrir de nombreux lieux culturels.',
  },
  {
    id: 'nat-history-035',
    theme: historyTheme,
    prompt: 'Que symbolise le 1er mai ?',
    correct: 'La fête du Travail',
    distractors: ['La fête nationale', 'La journée de la laïcité', 'La victoire du 8 mai 1945'],
    explanation:
      'Le 1er mai est la fête du Travail.',
  },
  {
    id: 'nat-history-036',
    theme: historyTheme,
    prompt: 'Qui était Monsieur Rouget de Lisle ?',
    correct: 'L’auteur de la Marseillaise',
    distractors: ['Le premier président de la Ve République', 'Le fondateur de la Sécurité sociale', 'Un préfet européen'],
    explanation:
      'Claude Joseph Rouget de Lisle a composé La Marseillaise.',
  },
  {
    id: 'nat-history-037',
    theme: historyTheme,
    prompt: 'À quelle occasion a été construite la Tour Eiffel ?',
    correct: 'L’Exposition universelle de 1889',
    distractors: ['Le traité de Maastricht', 'La Coupe du monde 1998', 'La création de la Sécurité sociale'],
    explanation:
      'La Tour Eiffel est construite pour l’Exposition universelle de Paris en 1889.',
  },
  {
    id: 'nat-history-038',
    theme: historyTheme,
    prompt: 'Quelle chaîne de montagnes est située entre la France et l’Italie ?',
    correct: 'Les Alpes',
    distractors: ['Les Pyrénées', 'Le Massif armoricain', 'Les Vosges uniquement'],
    explanation:
      'Les Alpes marquent une partie de la frontière entre la France et l’Italie.',
  },
  {
    id: 'nat-history-039',
    theme: historyTheme,
    prompt: 'Qui était Molière ?',
    correct: 'Un grand auteur de théâtre français',
    distractors: ['Un président de la République', 'Un navigateur moderne', 'Un juge européen'],
    explanation:
      'Molière est l’un des plus grands dramaturges français.',
  },
  {
    id: 'nat-history-040',
    theme: historyTheme,
    prompt: 'Qui était Charles Baudelaire ?',
    correct: 'Un poète français',
    distractors: ['Un chef militaire romain', 'Un président de région', 'Un astronaute'],
    explanation:
      'Charles Baudelaire est un poète français, auteur des Fleurs du mal.',
  },
  {
    id: 'nat-history-041',
    theme: historyTheme,
    prompt: 'Qui était Simone de Beauvoir ?',
    correct: 'Une écrivaine et philosophe française',
    distractors: ['Une reine de France', 'Une monnaie ancienne', 'Une chaîne de montagnes'],
    explanation:
      'Simone de Beauvoir est une écrivaine et philosophe, figure importante du féminisme.',
  },
  {
    id: 'nat-history-042',
    theme: historyTheme,
    prompt: 'Quel monument historique se trouve sur une île en Normandie ?',
    correct: 'Le Mont-Saint-Michel',
    distractors: ['La Tour Eiffel', 'Le palais de l’Élysée', 'Le Parlement européen'],
    explanation:
      'Le Mont-Saint-Michel est un monument emblématique situé en Normandie.',
  },
  {
    id: 'nat-history-043',
    theme: historyTheme,
    prompt: 'Quelle est la plus haute montagne de France ?',
    correct: 'Le Mont Blanc',
    distractors: ['Le Puy de Dôme', 'Le Ballon d’Alsace', 'La dune du Pilat'],
    explanation:
      'Le Mont Blanc est le plus haut sommet de France métropolitaine et des Alpes.',
  },
  {
    id: 'nat-history-044',
    theme: historyTheme,
    prompt: 'Quel département français a une frontière avec le Brésil ?',
    correct: 'La Guyane',
    distractors: ['La Corse-du-Sud', 'Le Finistère', 'Le Rhône'],
    explanation:
      'La Guyane est un territoire français d’Amérique du Sud frontalier du Brésil.',
  },
  {
    id: 'nat-history-045',
    theme: historyTheme,
    prompt: 'De quelle ville française décolle la fusée Ariane ?',
    correct: 'Kourou',
    distractors: ['Lyon', 'Rennes', 'Nice'],
    explanation:
      'Le centre spatial guyanais est situé à Kourou, en Guyane.',
  },
  {
    id: 'nat-history-046',
    theme: historyTheme,
    prompt: "Qu'est-ce que la France d'outre-mer ?",
    correct: 'Des territoires français situés hors d’Europe',
    distractors: [
      'Des pays étrangers sans lien avec la France',
      'Uniquement des quartiers de Paris',
      'Une ancienne monnaie',
    ],
    explanation:
      'La France d’outre-mer regroupe des territoires français situés dans plusieurs océans et régions du monde.',
  },
  {
    id: 'nat-history-047',
    theme: historyTheme,
    prompt: 'Quel est le principal port maritime de France ?',
    correct: 'Marseille-Fos',
    distractors: ['Rennes', 'Clermont-Ferrand', 'Strasbourg-ville uniquement'],
    explanation:
      'Marseille-Fos est le principal grand port maritime français.',
  },
  {
    id: 'nat-history-048',
    theme: historyTheme,
    prompt: 'Combien y a-t-il de régions en France métropolitaine ?',
    correct: '13 régions',
    distractors: ['5 régions', '27 régions', '101 régions'],
    explanation:
      'La France métropolitaine compte 13 régions administratives.',
  },
  {
    id: 'nat-history-049',
    theme: historyTheme,
    prompt: 'Quel est le chef-lieu de la région Bretagne ?',
    correct: 'Rennes',
    distractors: ['Marseille', 'Lyon', 'Ajaccio'],
    explanation:
      'Rennes est le chef-lieu de la région Bretagne.',
  },
  {
    id: 'nat-history-050',
    theme: historyTheme,
    prompt: "Quel est le 101ème département français depuis 2011 ?",
    correct: 'Mayotte',
    distractors: ['La Martinique', 'Paris', 'La Savoie'],
    explanation:
      'Mayotte est devenue le 101e département français en 2011.',
  },
  {
    id: 'nat-history-051',
    theme: historyTheme,
    prompt: 'Quel fleuve traverse Paris ?',
    correct: 'La Seine',
    distractors: ['La Loire', 'Le Rhône', 'La Garonne'],
    explanation:
      'Paris est traversée par la Seine.',
  },
  {
    id: 'nat-society-001',
    theme: societyTheme,
    prompt: "Où faut-il déclarer la naissance d'un enfant ?",
    correct: 'À la mairie du lieu de naissance',
    distractors: ['À la banque', 'Au supermarché', 'À la préfecture de police dans tous les cas'],
    explanation:
      'La déclaration de naissance se fait auprès de l’officier d’état civil, généralement à la mairie du lieu de naissance.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-002',
    theme: societyTheme,
    prompt: "Quel mariage est reconnu légalement ?",
    correct: 'Le mariage civil célébré en mairie',
    distractors: [
      'Uniquement une cérémonie privée sans officier d’état civil',
      'Un mariage forcé',
      'Un mariage avec plusieurs conjoints',
    ],
    explanation:
      'En France, le mariage reconnu par la loi est le mariage civil.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-003',
    theme: societyTheme,
    prompt: 'Le stationnement sur une place réservée aux personnes handicapées :',
    correct: 'Est interdit sans autorisation et peut être sanctionné',
    distractors: [
      'Est libre si l’on reste moins d’une heure',
      'Est réservé aux voitures neuves',
      'Est obligatoire pour tous les conducteurs',
    ],
    explanation:
      'Les places réservées aux personnes handicapées sont protégées par des règles de stationnement.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-004',
    theme: societyTheme,
    prompt: "Quand faut-il déclarer son enfant au service d'état civil ?",
    correct: 'Dans les jours qui suivent la naissance, selon le délai légal',
    distractors: [
      'À ses 18 ans seulement',
      'Uniquement quand il entre au collège',
      'Jamais si les parents sont mariés',
    ],
    explanation:
      'La naissance doit être déclarée rapidement à l’état civil, dans le délai prévu par la loi.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-005',
    theme: societyTheme,
    prompt: "Quel numéro d'urgence permet d'appeler la police ?",
    correct: '17',
    distractors: ['15', '18 pour toutes les situations de police', '36 46'],
    explanation:
      'Le 17 permet de joindre police secours ou la gendarmerie.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-006',
    theme: societyTheme,
    prompt: "Quel numéro d'urgence permet d'appeler le SAMU ?",
    correct: '15',
    distractors: ['17', '18 uniquement', '112 seulement pour les impôts'],
    explanation:
      'Le 15 permet de joindre le SAMU pour une urgence médicale.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-007',
    theme: societyTheme,
    prompt: "Auprès de quelle institution les parents peuvent inscrire leurs enfants à l'école publique ?",
    correct: 'La mairie',
    distractors: ['La banque', 'Le tribunal pénal', 'La Commission européenne'],
    explanation:
      'L’inscription administrative à l’école publique passe généralement par la mairie.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-008',
    theme: societyTheme,
    prompt: "En cas de divorce, qui exerce l'autorité parentale ?",
    correct: 'Les deux parents en principe, sauf décision contraire du juge',
    distractors: [
      'Uniquement le parent le plus âgé',
      'Toujours les grands-parents',
      'Personne après le divorce',
    ],
    explanation:
      'Le divorce ne supprime pas automatiquement l’autorité parentale conjointe.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-009',
    theme: societyTheme,
    prompt: "Quelle aide permet aux personnes qui ont des difficultés financières d'avoir un avocat ?",
    correct: 'L’aide juridictionnelle',
    distractors: ['La carte Vitale', 'Le permis de conduire', 'La taxe foncière'],
    explanation:
      'L’aide juridictionnelle peut prendre en charge tout ou partie des frais de justice selon les ressources.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-010',
    theme: societyTheme,
    prompt: 'Auprès de quel organisme faut-il demander le remboursement des frais de santé ?',
    correct: 'L’Assurance maladie, notamment la CPAM',
    distractors: ['La mairie pour tous les soins', 'Le Parlement européen', 'Le conseil de prud’hommes'],
    explanation:
      'La CPAM gère l’Assurance maladie pour de nombreux assurés.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-011',
    theme: societyTheme,
    prompt: 'La contraception :',
    correct: 'Est autorisée et fait partie des droits en matière de santé',
    distractors: [
      'Est interdite en France',
      'Est réservée aux personnes mariées',
      'N’existe que pour les hommes',
    ],
    explanation:
      'La contraception est autorisée en France et relève de la liberté et de la santé des personnes.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-012',
    theme: societyTheme,
    prompt: 'À quoi sert la carte Vitale ?',
    correct: 'À faciliter le remboursement des soins par l’Assurance maladie',
    distractors: ['À voter aux élections', 'À prouver la nationalité française', 'À conduire une voiture'],
    explanation:
      'La carte Vitale contient les informations nécessaires au remboursement des soins.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-013',
    theme: societyTheme,
    prompt: 'À quoi sert une mutuelle santé ?',
    correct: 'À compléter les remboursements de l’Assurance maladie',
    distractors: ['À remplacer un passeport', 'À élire les députés', 'À déclarer une naissance'],
    explanation:
      'Une mutuelle peut rembourser une partie des frais restant à charge après l’Assurance maladie.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-014',
    theme: societyTheme,
    prompt: "Qu'est-ce que le tiers payant ?",
    correct: 'Un dispositif qui évite d’avancer certains frais de santé',
    distractors: [
      'Un impôt sur les logements',
      'Une élection locale',
      'Une sanction pénale',
    ],
    explanation:
      'Le tiers payant permet, dans certains cas, de ne pas avancer tout ou partie des frais médicaux.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-015',
    theme: societyTheme,
    prompt: "L'avortement est-il possible en France ?",
    correct: 'Oui, dans le cadre prévu par la loi',
    distractors: ['Non, il est toujours interdit', 'Oui, uniquement avec l’accord du maire', 'Oui, seulement pour les citoyens français'],
    explanation:
      'L’interruption volontaire de grossesse est un droit encadré par la loi française.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-016',
    theme: societyTheme,
    prompt: 'Travailler sans être déclaré est :',
    correct: 'Illégal',
    distractors: ['Obligatoire', 'Réservé aux étudiants', 'Un droit sans limite'],
    explanation:
      'Le travail non déclaré est interdit et peut entraîner des sanctions.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-017',
    theme: societyTheme,
    prompt: "Qu'est-ce que le SMIC ?",
    correct: 'Le salaire minimum légal',
    distractors: ['Une carte de séjour', 'Un impôt local', 'Une chaîne de montagnes'],
    explanation:
      'Le SMIC est le salaire minimum interprofessionnel de croissance.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-018',
    theme: societyTheme,
    prompt: 'Quelle est la durée légale du temps de travail par semaine ?',
    correct: '35 heures',
    distractors: ['12 heures', '60 heures obligatoires', '80 heures'],
    explanation:
      'La durée légale du travail à temps complet est de 35 heures par semaine.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-019',
    theme: societyTheme,
    prompt: 'Qui peut demander un congé parental d’éducation ?',
    correct: 'Le père ou la mère, selon les conditions prévues',
    distractors: ['Uniquement le maire', 'Uniquement l’employeur', 'Uniquement les grands-parents'],
    explanation:
      'Le congé parental d’éducation peut être demandé par un parent remplissant les conditions.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-020',
    theme: societyTheme,
    prompt: 'Une personne étrangère, en situation régulière, peut créer son entreprise :',
    correct: 'Oui, si elle respecte les conditions prévues par la loi',
    distractors: [
      'Non, c’est toujours interdit',
      'Oui, sans aucune règle administrative',
      'Uniquement si elle est déjà maire',
    ],
    explanation:
      'Une personne étrangère en situation régulière peut exercer une activité selon son droit au séjour et les règles applicables.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-021',
    theme: societyTheme,
    prompt: 'Une femme peut-elle créer son entreprise ?',
    correct: 'Oui, les femmes et les hommes ont les mêmes droits pour entreprendre',
    distractors: ['Non, c’est interdit', 'Oui, seulement avec l’accord du maire', 'Non, sauf si elle est fonctionnaire'],
    explanation:
      'L’égalité entre les femmes et les hommes protège aussi l’accès à l’activité professionnelle et entrepreneuriale.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-022',
    theme: societyTheme,
    prompt: 'Quels sont les textes qui définissent les règles au travail ?',
    correct: 'Le Code du travail, le contrat et les conventions collectives applicables',
    distractors: [
      'Uniquement les réseaux sociaux',
      'Le livret de famille seulement',
      'La carte Vitale uniquement',
    ],
    explanation:
      'Les relations de travail sont encadrées par la loi, les contrats et les accords collectifs.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-023',
    theme: societyTheme,
    prompt: "Quelles sont les affaires traitées par le conseil de prud'hommes ?",
    correct: 'Les litiges individuels entre salariés et employeurs',
    distractors: ['Les divorces', 'Les élections présidentielles', 'Les demandes de passeport'],
    explanation:
      'Le conseil de prud’hommes traite les conflits individuels liés au contrat de travail.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-024',
    theme: societyTheme,
    prompt: 'Qui a le droit de se syndiquer ?',
    correct: 'Les salariés, dans le respect de la loi',
    distractors: ['Uniquement les ministres', 'Personne en France', 'Uniquement les chefs d’entreprise étrangers'],
    explanation:
      'La liberté syndicale permet aux travailleurs de défendre leurs intérêts collectifs.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-025',
    theme: societyTheme,
    prompt: 'Est-il possible de licencier une femme enceinte ou en congé maternité, en raison de sa grossesse ?',
    correct: 'Non, ce motif est interdit',
    distractors: ['Oui, toujours', 'Oui, uniquement parce qu’elle est enceinte', 'Oui, sans protection particulière'],
    explanation:
      'La grossesse et le congé maternité bénéficient d’une protection spécifique contre le licenciement discriminatoire.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-026',
    theme: societyTheme,
    prompt: "L'instruction des enfants est obligatoire de :",
    correct: '3 à 16 ans',
    distractors: ['6 à 10 ans', '18 à 25 ans', 'Uniquement après le collège'],
    explanation:
      'L’instruction est obligatoire pour chaque enfant de 3 à 16 ans.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-027',
    theme: societyTheme,
    prompt: "Quelle est la définition de l'autorité parentale ?",
    correct: 'Un ensemble de droits et de devoirs exercés dans l’intérêt de l’enfant',
    distractors: [
      'Le droit de punir sans limite',
      'Une autorisation de ne pas scolariser l’enfant',
      'Un pouvoir réservé à l’État uniquement',
    ],
    explanation:
      'L’autorité parentale vise la protection, l’éducation et le développement de l’enfant.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-028',
    theme: societyTheme,
    prompt: "Jusqu'à quel âge l'école est-elle obligatoire ?",
    correct: 'Jusqu’à 16 ans',
    distractors: ['Jusqu’à 8 ans', 'Jusqu’à 12 ans uniquement', 'Jusqu’à 25 ans'],
    explanation:
      'L’instruction est obligatoire jusqu’à 16 ans.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-029',
    theme: societyTheme,
    prompt: "À quel âge commence l'instruction obligatoire des enfants ?",
    correct: 'À 3 ans',
    distractors: ['À la naissance', 'À 8 ans', 'À 18 ans'],
    explanation:
      'Depuis la loi pour une école de la confiance, l’instruction obligatoire commence à 3 ans.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-030',
    theme: societyTheme,
    prompt: "Comment s'appellent les établissements scolaires que les élèves intègrent après l'école élémentaire ?",
    correct: 'Les collèges',
    distractors: ['Les mairies', 'Les préfectures', 'Les tribunaux'],
    explanation:
      'Après l’école élémentaire, les élèves entrent au collège.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-031',
    theme: societyTheme,
    prompt: "En tant que parent d'élève, il est possible de :",
    correct: 'Participer à la vie de l’école et échanger avec l’équipe éducative',
    distractors: [
      'Supprimer les programmes officiels',
      'Refuser toutes les règles de l’établissement',
      'Remplacer le directeur sans procédure',
    ],
    explanation:
      'Les parents d’élèves peuvent participer à la vie scolaire dans le respect du cadre de l’établissement.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-032',
    theme: societyTheme,
    prompt: 'S’agissant de l’accueil des enfants en situation de handicap à l’école, laquelle des propositions est vraie ?',
    correct: 'L’école doit favoriser leur inclusion avec des adaptations lorsque c’est nécessaire',
    distractors: [
      'Ils sont toujours exclus de l’école',
      'Ils ne peuvent jamais avoir d’aide',
      'Ils doivent obligatoirement arrêter l’instruction',
    ],
    explanation:
      'Le système éducatif français vise l’inclusion des élèves en situation de handicap.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-033',
    theme: societyTheme,
    prompt: 'Depuis le 1er juillet 2021, quelle est la durée du congé paternité ?',
    correct: '25 jours calendaires, ou 32 jours en cas de naissances multiples',
    distractors: ['3 jours seulement dans tous les cas', '6 mois obligatoires', 'Aucun jour'],
    explanation:
      'Depuis juillet 2021, le congé de paternité et d’accueil de l’enfant est allongé à 25 jours calendaires, hors cas particuliers.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-034',
    theme: societyTheme,
    prompt: 'Est-ce possible de punir physiquement ses enfants ?',
    correct: 'Non, les violences éducatives ordinaires sont interdites',
    distractors: ['Oui, sans limite', 'Oui, si l’enfant a moins de 3 ans', 'Oui, uniquement à l’école'],
    explanation:
      'La loi interdit les violences physiques et psychologiques envers les enfants.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-principles-025',
    theme: principlesTheme,
    prompt: 'Quelle est la devise de la République française ?',
    correct: 'Liberté, Égalité, Fraternité',
    distractors: ['Travail, Famille, Patrie', 'Force, Ordre, Silence', 'Justice, Police, Armée'],
    explanation:
      'La devise officielle de la République française est « Liberté, Égalité, Fraternité ».',
  },
  {
    id: 'nat-principles-026',
    theme: principlesTheme,
    prompt: "En France, il est possible pour l'État de financer :",
    correct: 'Des services publics comme l’école, la santé ou la sécurité',
    distractors: [
      'Une religion officielle obligatoire',
      'Les dépenses privées de chaque famille',
      'Le programme d’un parti politique',
    ],
    explanation:
      'L’État finance les services publics et les missions d’intérêt général dans le respect des principes républicains.',
  },
  {
    id: 'nat-principles-027',
    theme: principlesTheme,
    prompt: 'Quel texte est considéré comme le texte fondateur de la laïcité ?',
    correct: 'La loi de séparation des Églises et de l’État de 1905',
    distractors: ['Le traité de Maastricht', 'Le Code de la route', 'La déclaration de naissance'],
    explanation:
      'La loi de 1905 est le texte fondateur de la laïcité française.',
  },
  {
    id: 'nat-principles-028',
    theme: principlesTheme,
    prompt: 'Qui doit respecter et veiller à la neutralité religieuse dans les services publics ?',
    correct: 'Les agents du service public',
    distractors: ['Les seuls usagers dans leur vie privée', 'Les enfants à domicile', 'Les entreprises étrangères uniquement'],
    explanation:
      'Les agents publics doivent respecter et faire vivre la neutralité du service public.',
  },
  {
    id: 'nat-system-034',
    theme: systemTheme,
    prompt: 'Qui peut se présenter aux élections présidentielles ?',
    correct: 'Un citoyen français remplissant les conditions légales, notamment les parrainages requis',
    distractors: [
      'Toute personne étrangère sans condition',
      'Uniquement les maires de grandes villes',
      'Uniquement les députés européens',
    ],
    explanation:
      'La candidature à l’élection présidentielle est encadrée par des conditions légales.',
  },
  {
    id: 'nat-system-035',
    theme: systemTheme,
    prompt: 'Quelle condition faut-il remplir pour être candidat aux élections municipales ?',
    correct: 'Être éligible selon les conditions prévues par la loi',
    distractors: [
      'Être obligatoirement propriétaire',
      'Être nommé par le préfet',
      'Avoir plus de 70 ans',
    ],
    explanation:
      'Pour être candidat, il faut remplir les conditions d’éligibilité prévues par le code électoral.',
  },
  {
    id: 'nat-system-036',
    theme: systemTheme,
    prompt: 'Parmi ces autorités, laquelle est élue ?',
    correct: 'Le maire',
    distractors: ['Le préfet', 'Le procureur de la République', 'Le recteur nommé'],
    explanation:
      'Le maire est élu par le conseil municipal ; le préfet représente l’État et n’est pas élu.',
  },
  {
    id: 'nat-system-037',
    theme: systemTheme,
    prompt: 'Quelles sont les fonctions du maire ?',
    correct: 'Administrer la commune et exercer des missions d’état civil et de police municipale',
    distractors: [
      'Commander l’armée française',
      'Nommer le Premier ministre',
      'Diriger la Banque centrale européenne',
    ],
    explanation:
      'Le maire dirige la commune et exerce aussi certaines fonctions au nom de l’État.',
  },
  {
    id: 'nat-system-038',
    theme: systemTheme,
    prompt: 'A-t-on le droit de ne pas respecter une loi ?',
    correct: 'Non, chacun doit respecter la loi',
    distractors: ['Oui, si elle ne nous plaît pas', 'Oui, seulement sur internet', 'Oui, si personne ne regarde'],
    explanation:
      'Dans un État de droit, la loi s’applique à tous.',
  },
  {
    id: 'nat-system-039',
    theme: systemTheme,
    prompt: "Quelle condition est obligatoire pour se présenter à l'élection présidentielle ?",
    correct: 'Obtenir les parrainages d’élus requis par la loi',
    distractors: [
      'Être propriétaire d’un château',
      'Avoir déjà été ministre',
      'Être maire de Paris obligatoirement',
    ],
    explanation:
      'Les candidats à l’élection présidentielle doivent notamment réunir les parrainages prévus par la loi.',
  },
  {
    id: 'nat-rights-024',
    theme: rightsTheme,
    prompt: 'L’article 4 de la Déclaration des droits de l’homme et du citoyen affirme que "la liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui". Qu’est-ce que cela signifie ?',
    correct: 'La liberté de chacun s’arrête là où commence celle des autres',
    distractors: [
      'La liberté permet de tout faire sans limite',
      'La liberté supprime toutes les lois',
      'La liberté n’existe que pour les élus',
    ],
    explanation:
      'La liberté est protégée, mais elle doit respecter les droits et la sécurité des autres personnes.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-025',
    theme: rightsTheme,
    prompt: 'Quel est le texte fondateur établissant les droits et les devoirs de chaque citoyen ?',
    correct: 'La Charte des droits et devoirs du citoyen français',
    distractors: ['Le permis de conduire', 'Une facture d’électricité', 'Le règlement d’un magasin'],
    explanation:
      'La charte rappelle les droits et les devoirs liés à la citoyenneté française.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-026',
    theme: rightsTheme,
    prompt: "Qu'est-ce que la liberté d'expression ?",
    correct: 'Le droit d’exprimer ses opinions dans les limites prévues par la loi',
    distractors: [
      'Le droit d’insulter ou menacer librement',
      'Le droit d’imposer son opinion par la violence',
      'Une liberté réservée aux journaux',
    ],
    explanation:
      'La liberté d’expression protège le débat, mais pas les abus comme la haine, la menace ou la diffamation.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-027',
    theme: rightsTheme,
    prompt: 'Tous les citoyens français ont-ils une religion ?',
    correct: 'Non, chacun est libre de croire, de ne pas croire ou de changer de conviction',
    distractors: ['Oui, une religion est obligatoire', 'Oui, mais une seule est autorisée', 'Non, les croyances sont interdites'],
    explanation:
      'La liberté de conscience protège aussi les personnes sans religion.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-028',
    theme: rightsTheme,
    prompt: 'Est-ce obligatoire de déclarer ses impôts chaque année en France ?',
    correct: 'Oui, si l’on est concerné par l’obligation déclarative',
    distractors: ['Non, c’est toujours facultatif', 'Oui, seulement pour les propriétaires', 'Non, uniquement les entreprises déclarent'],
    explanation:
      'La déclaration fiscale fait partie des obligations administratives et civiques des personnes concernées.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-029',
    theme: rightsTheme,
    prompt: 'Le non-respect du code de la route est :',
    correct: 'Une infraction pouvant être sanctionnée',
    distractors: ['Un droit individuel', 'Une obligation civique', 'Un acte toujours autorisé'],
    explanation:
      'Le code de la route protège la sécurité de tous les usagers.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-030',
    theme: rightsTheme,
    prompt: "Que doit faire un citoyen s'il est appelé à être juré dans un procès d'assises ?",
    correct: 'Se présenter, sauf motif légitime d’exemption ou de dispense',
    distractors: ['Ignorer la convocation', 'Demander au maire de voter à sa place', 'Choisir lui-même l’accusé'],
    explanation:
      'Être juré d’assises est un devoir civique lorsqu’on est régulièrement convoqué.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-rights-031',
    theme: rightsTheme,
    prompt: "Quel est l'un des devoirs principaux d'un citoyen français ?",
    correct: 'Respecter les lois et contribuer aux charges publiques selon sa situation',
    distractors: [
      'Refuser toutes les règles communes',
      'Ne jamais participer à la vie collective',
      'Remplacer la loi par ses préférences personnelles',
    ],
    explanation:
      'La citoyenneté implique des droits, mais aussi des devoirs comme respecter la loi et contribuer à la solidarité nationale.',
    sourceIds: naturalisationRightsSources,
  },
  {
    id: 'nat-history-052',
    theme: historyTheme,
    prompt: 'Qui a été président de la Ve République ?',
    correct: 'Charles de Gaulle',
    distractors: ['Louis XIV', 'Victor Hugo', 'Claude Monet'],
    explanation:
      'Charles de Gaulle est le premier président de la Ve République.',
  },
  {
    id: 'nat-history-053',
    theme: historyTheme,
    prompt: 'Quel pays a été une colonie française ?',
    correct: 'Le Sénégal',
    distractors: ['La Suisse', 'La Norvège', 'Le Japon'],
    explanation:
      'Le Sénégal a fait partie de l’empire colonial français avant son indépendance.',
  },
  {
    id: 'nat-history-054',
    theme: historyTheme,
    prompt: 'Quel était le principal port français impliqué dans la traite négrière au XVIIIe siècle ?',
    correct: 'Nantes',
    distractors: ['Grenoble', 'Dijon', 'Clermont-Ferrand'],
    explanation:
      'Nantes fut le principal port négrier français au XVIIIe siècle.',
  },
  {
    id: 'nat-history-055',
    theme: historyTheme,
    prompt: 'Quel plat est une spécialité de la cuisine française ?',
    correct: 'Le coq au vin',
    distractors: ['Le sushi', 'Le fish and chips', 'Le tacos mexicain traditionnel'],
    explanation:
      'Le coq au vin est une spécialité traditionnelle de la cuisine française.',
  },
  {
    id: 'nat-history-056',
    theme: historyTheme,
    prompt: 'Qui était George Sand ?',
    correct: 'Une écrivaine française',
    distractors: ['Une reine mérovingienne', 'Une monnaie européenne', 'Une chaîne de montagnes'],
    explanation:
      'George Sand est le nom de plume d’Amantine Aurore Lucile Dupin, écrivaine française.',
  },
  {
    id: 'nat-history-057',
    theme: historyTheme,
    prompt: 'Qui était Albert Camus ?',
    correct: 'Un écrivain et philosophe français',
    distractors: ['Un roi de France', 'Un fleuve', 'Un préfet de police actuel'],
    explanation:
      'Albert Camus est un écrivain et philosophe, prix Nobel de littérature.',
  },
  {
    id: 'nat-history-058',
    theme: historyTheme,
    prompt: 'Qui était Paul Cézanne ?',
    correct: 'Un peintre français',
    distractors: ['Un compositeur allemand', 'Un président de la République', 'Un explorateur spatial'],
    explanation:
      'Paul Cézanne est un peintre français majeur, associé à la Provence.',
  },
  {
    id: 'nat-history-059',
    theme: historyTheme,
    prompt: 'Qui était un célèbre compositeur français ?',
    correct: 'Claude Debussy',
    distractors: ['Eugène Delacroix', 'Molière', 'Jean Moulin'],
    explanation:
      'Claude Debussy est un compositeur français célèbre.',
  },
  {
    id: 'nat-history-060',
    theme: historyTheme,
    prompt: 'Quelle île fait partie des Antilles françaises ?',
    correct: 'La Martinique',
    distractors: ['La Sicile', 'L’Islande', 'La Sardaigne'],
    explanation:
      'La Martinique et la Guadeloupe font partie des Antilles françaises.',
  },
  {
    id: 'nat-history-061',
    theme: historyTheme,
    prompt: 'Quelle île est française ?',
    correct: 'La Corse',
    distractors: ['La Sicile', 'Madère', 'Malte'],
    explanation:
      'La Corse est une île française située en Méditerranée.',
  },
  {
    id: 'nat-history-062',
    theme: historyTheme,
    prompt: "Quelle île française est située dans l'océan indien ?",
    correct: 'La Réunion',
    distractors: ['La Corse', 'Ouessant', 'Belle-Île-en-Mer'],
    explanation:
      'La Réunion est une île française de l’océan Indien.',
  },
  {
    id: 'nat-history-063',
    theme: historyTheme,
    prompt: "Quelle île est un département d'outre-mer français ?",
    correct: 'Mayotte',
    distractors: ['La Sicile', 'Malte', 'Chypre'],
    explanation:
      'Mayotte est un département et région d’outre-mer français.',
  },
  {
    id: 'nat-history-064',
    theme: historyTheme,
    prompt: 'Quelle île française se trouve au sud-est du continent africain ?',
    correct: 'La Réunion',
    distractors: ['La Corse', 'La Guadeloupe', 'Saint-Pierre-et-Miquelon'],
    explanation:
      'La Réunion se situe dans l’océan Indien, à l’est de Madagascar.',
  },
  {
    id: 'nat-history-065',
    theme: historyTheme,
    prompt: 'Quel est le chef-lieu de la région Auvergne-Rhône-Alpes ?',
    correct: 'Lyon',
    distractors: ['Rennes', 'Marseille', 'Bordeaux'],
    explanation:
      'Lyon est le chef-lieu de la région Auvergne-Rhône-Alpes.',
  },
  {
    id: 'nat-history-066',
    theme: historyTheme,
    prompt: "Quel est le chef-lieu de la région Provence-Alpes-Côte d'Azur ?",
    correct: 'Marseille',
    distractors: ['Rennes', 'Lille', 'Rouen'],
    explanation:
      'Marseille est le chef-lieu de la région Provence-Alpes-Côte d’Azur.',
  },
  {
    id: 'nat-history-067',
    theme: historyTheme,
    prompt: 'Quelle région française est réputée pour ses stations de ski ?',
    correct: 'Auvergne-Rhône-Alpes',
    distractors: ['Bretagne', 'Île-de-France uniquement', 'Guyane'],
    explanation:
      'La région Auvergne-Rhône-Alpes est connue pour ses massifs alpins et ses stations de ski.',
  },
  {
    id: 'nat-society-035',
    theme: societyTheme,
    prompt: "Quelle action peut réaliser le locataire d'un logement sans l'autorisation du propriétaire ?",
    correct: 'Faire de petits aménagements ou décorer sans transformer le logement',
    distractors: [
      'Détruire un mur porteur',
      'Vendre le logement',
      'Changer la destination du logement sans règle',
    ],
    explanation:
      'Le locataire peut réaliser des aménagements simples, mais pas transformer le logement sans accord.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-036',
    theme: societyTheme,
    prompt: 'Dans quel cas faut-il déclarer son enfant au service d’état civil ?',
    correct: 'Lors de sa naissance',
    distractors: ['Uniquement à son mariage', 'Seulement à ses 18 ans', 'Jamais si les parents travaillent'],
    explanation:
      'La naissance d’un enfant doit être déclarée à l’état civil.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-037',
    theme: societyTheme,
    prompt: 'Qui peut demander le divorce de personnes mariées ?',
    correct: 'L’un des époux ou les deux époux selon la procédure',
    distractors: ['Uniquement le maire', 'Uniquement les voisins', 'Uniquement l’employeur'],
    explanation:
      'Le divorce relève d’une procédure demandée par l’un ou les deux époux.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-038',
    theme: societyTheme,
    prompt: 'Quelle est la première démarche à réaliser pour chercher un emploi ?',
    correct: 'Préparer sa recherche et s’inscrire auprès de France Travail si nécessaire',
    distractors: [
      'Attendre une convocation sans rien faire',
      'Refuser de rédiger un CV',
      'Demander directement une carte d’identité',
    ],
    explanation:
      'La recherche d’emploi passe notamment par un CV, des candidatures et l’inscription à France Travail selon la situation.',
    sourceIds: naturalisationServiceSources,
  },
  {
    id: 'nat-society-039',
    theme: societyTheme,
    prompt: 'Quelle instruction est prévue pour les enfants qui ne parlent pas français ?',
    correct: 'Un accompagnement spécifique pour apprendre le français et suivre la scolarité',
    distractors: [
      'Aucune scolarisation possible',
      'Une exclusion automatique',
      'Une obligation de rester à domicile',
    ],
    explanation:
      'L’école prévoit des dispositifs d’accueil et d’apprentissage du français pour les élèves allophones.',
    sourceIds: naturalisationServiceSources,
  },
];

export const naturalisationSpecificPracticeQuestions: PracticeQuestion[] = seeds.map((seed) => ({
  id: seed.id,
  theme: seed.theme,
  prompt: seed.prompt,
  options: [seed.correct, ...seed.distractors],
  correctIndex: 0,
  explanation: seed.explanation,
  sourceIds: seed.sourceIds ?? naturalisationBaseSources,
  difficulty: seed.difficulty ?? 'essentiel',
}));
