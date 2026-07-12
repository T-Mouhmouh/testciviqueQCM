import type { PracticeQuestion } from '../../types';

const principlesTheme = 'Principes et valeurs de la République' as const;
const systemTheme = 'Système institutionnel et politique' as const;
const rightsTheme = 'Droits et devoirs' as const;
const historyTheme = 'Histoire, géographie et culture' as const;
const societyTheme = 'Vivre dans la société française' as const;

const principlesSources = ['question-list-cr', 'theme-principles'];
const systemSources = ['question-list-cr', 'theme-system'];
const rightsSources = ['question-list-cr', 'theme-rights'];
const historySources = ['question-list-cr', 'theme-history'];
const societySources = ['question-list-cr', 'theme-society'];

export const officialExtraPracticeQuestions: PracticeQuestion[] = [
  {
    id: 'official-extra-cr-008',
    theme: principlesTheme,
    prompt: 'En application de la liberté individuelle, quelle proposition est correcte ? Une personne peut :',
    options: [
      'Choisir sa vie personnelle dans le respect de la loi',
      'Imposer ses choix aux autres',
      'Refuser toutes les règles communes',
      'Priver une autre personne de sa liberté',
    ],
    correctIndex: 0,
    explanation:
      "La liberté individuelle permet de faire ses choix personnels, mais elle s'arrête quand elle porte atteinte aux droits d'autrui ou à la loi.",
    sourceIds: principlesSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-014',
    theme: principlesTheme,
    prompt: 'Peut-on brûler publiquement un drapeau français ?',
    options: [
      "Non, l'outrage public au drapeau français peut être sanctionné",
      'Oui, dans toutes les situations',
      'Oui, si le drapeau est ancien',
      'Oui, uniquement pendant une manifestation',
    ],
    correctIndex: 0,
    explanation:
      'Le drapeau tricolore est un symbole de la République. Le dégrader publiquement peut constituer un outrage sanctionné par la loi.',
    sourceIds: principlesSources,
    difficulty: 'avance',
  },
  {
    id: 'official-extra-cr-018',
    theme: principlesTheme,
    prompt: "Qu'est-ce que la liberté ?",
    options: [
      "Pouvoir faire ce qui ne nuit pas à autrui",
      'Pouvoir faire tout ce que l’on veut sans limite',
      'Pouvoir refuser les lois',
      'Pouvoir supprimer les droits des autres',
    ],
    correctIndex: 0,
    explanation:
      "La Déclaration des droits de l'homme et du citoyen explique que la liberté consiste à pouvoir faire tout ce qui ne nuit pas à autrui.",
    sourceIds: principlesSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-020',
    theme: principlesTheme,
    prompt: 'Sur quel document peut-on voir Marianne ?',
    options: [
      'Sur des timbres-poste et des documents officiels',
      'Sur les factures privées',
      'Sur les billets de train uniquement',
      'Sur les contrats entre particuliers uniquement',
    ],
    correctIndex: 0,
    explanation:
      'Marianne représente la République française et peut apparaître sur des supports officiels, notamment des timbres-poste.',
    sourceIds: principlesSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-021',
    theme: principlesTheme,
    prompt: 'Un employeur refuse d’embaucher des femmes dans son entreprise. Que dit la loi ?',
    options: [
      "C'est une discrimination interdite par la loi",
      "C'est autorisé si l'entreprise le décide",
      "C'est autorisé pour tous les métiers",
      "C'est seulement une règle interne sans conséquence",
    ],
    correctIndex: 0,
    explanation:
      "Refuser une embauche en raison du sexe est une discrimination. La loi protège l'égalité entre les femmes et les hommes.",
    sourceIds: principlesSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-024',
    theme: principlesTheme,
    prompt: 'Quels sont des symboles officiels de la République française ?',
    options: [
      'Le drapeau tricolore, Marianne, la Marseillaise et la devise',
      'Une marque commerciale, un club sportif et une ville',
      'Un logo privé, une chanson récente et une application',
      'Un seul symbole : la monnaie',
    ],
    correctIndex: 0,
    explanation:
      'Les principaux symboles républicains sont notamment le drapeau bleu-blanc-rouge, Marianne, la Marseillaise et la devise Liberté, Égalité, Fraternité.',
    sourceIds: principlesSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-025',
    theme: principlesTheme,
    prompt: "A-t-on le droit d'insulter publiquement quelqu’un parce qu’il est différent (handicap, apparence physique, sexe…) ?",
    options: [
      "Non, les injures et propos discriminatoires peuvent être sanctionnés",
      'Oui, si la personne est inconnue',
      'Oui, si cela se passe sur internet',
      'Oui, si plusieurs personnes le font',
    ],
    correctIndex: 0,
    explanation:
      "La liberté d'expression ne protège pas les injures, la haine ou la discrimination visant une personne ou un groupe.",
    sourceIds: principlesSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-026',
    theme: principlesTheme,
    prompt: 'Le régime de la France est :',
    options: [
      'Une République démocratique',
      'Une monarchie absolue',
      'Une dictature militaire',
      'Un empire héréditaire',
    ],
    correctIndex: 0,
    explanation:
      'La France est une République démocratique : les citoyens participent à la vie politique, notamment par les élections.',
    sourceIds: principlesSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-030',
    theme: principlesTheme,
    prompt: 'Quel droit est garanti par la laïcité ?',
    options: [
      'La liberté de conscience',
      'Le droit d’imposer une religion',
      'Le droit de refuser les lois communes',
      'Le droit de supprimer les autres croyances',
    ],
    correctIndex: 0,
    explanation:
      'La laïcité garantit la liberté de conscience : chacun peut croire, ne pas croire ou changer de conviction.',
    sourceIds: principlesSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-031',
    theme: principlesTheme,
    prompt: "À l'école publique, qui peut porter des signes religieux très visibles ?",
    options: [
      'Personne parmi les élèves et les agents publics',
      'Tous les élèves pendant les cours',
      'Les enseignants uniquement',
      'Les directeurs uniquement',
    ],
    correctIndex: 0,
    explanation:
      "À l'école publique, les élèves ne doivent pas porter de signes religieux ostensibles et les agents publics doivent respecter la neutralité.",
    sourceIds: principlesSources,
    difficulty: 'avance',
  },
  {
    id: 'official-extra-cr-033',
    theme: principlesTheme,
    prompt: 'Que peut faire un usager du service public dans une mairie ?',
    options: [
      'Porter un signe religieux s’il ne trouble pas le service',
      'Obliger un agent public à parler de religion',
      'Refuser les règles de la mairie',
      'Exiger un traitement différent pour sa religion',
    ],
    correctIndex: 0,
    explanation:
      "Un usager du service public n'est pas soumis à la même obligation de neutralité qu'un agent, tant qu'il respecte l'ordre public et le fonctionnement du service.",
    sourceIds: principlesSources,
    difficulty: 'avance',
  },
  {
    id: 'official-extra-cr-036',
    theme: principlesTheme,
    prompt: 'Que garantit le principe de laïcité ?',
    options: [
      "La liberté de conscience et la neutralité de l'État",
      "La préférence de l'État pour une religion",
      'La disparition des convictions personnelles',
      'Le financement obligatoire de tous les cultes',
    ],
    correctIndex: 0,
    explanation:
      "La laïcité garantit la liberté de conscience, l'égalité des citoyens et la neutralité religieuse de l'État.",
    sourceIds: principlesSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-038',
    theme: principlesTheme,
    prompt: 'Que représente la laïcité ?',
    options: [
      "La séparation des religions et de l'État",
      "L'obligation d'avoir une religion",
      "Le pouvoir d'une religion sur la loi",
      "L'interdiction de toute opinion personnelle",
    ],
    correctIndex: 0,
    explanation:
      "La laïcité organise la neutralité de l'État et protège la liberté de croire ou de ne pas croire.",
    sourceIds: principlesSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-039',
    theme: principlesTheme,
    prompt: "Qu'est ce qui est interdit par la Charte de la laïcité à l'école ?",
    options: [
      'Les pressions ou violences au nom de convictions religieuses',
      'Le respect des autres élèves',
      'Le fait d’apprendre ensemble',
      'La liberté de conscience',
    ],
    correctIndex: 0,
    explanation:
      "La Charte de la laïcité à l'école rappelle que personne ne peut faire pression sur un élève ou un personnel au nom d'une conviction religieuse.",
    sourceIds: principlesSources,
    difficulty: 'avance',
  },
  {
    id: 'official-extra-cr-042',
    theme: systemTheme,
    prompt: 'Le président de la République a commis un crime. Quelle proposition est correcte ?',
    options: [
      'Il peut être jugé selon les procédures prévues par la loi',
      'Il ne peut jamais être responsable',
      'Il peut se juger lui-même',
      'Le crime devient automatiquement légal',
    ],
    correctIndex: 0,
    explanation:
      "Dans un État de droit, personne n'est au-dessus de la loi. Des procédures particulières existent pour le chef de l'État.",
    sourceIds: systemSources,
    difficulty: 'avance',
  },
  {
    id: 'official-extra-cr-044',
    theme: systemTheme,
    prompt: 'Quelle est la durée du mandat du conseil municipal et du maire ?',
    options: ['6 ans', '2 ans', '4 ans', '9 ans'],
    correctIndex: 0,
    explanation:
      'Le conseil municipal est élu pour 6 ans. Le maire est ensuite élu par le conseil municipal.',
    sourceIds: systemSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-055',
    theme: systemTheme,
    prompt: 'Quel est le rôle du gouvernement ?',
    options: [
      'Déterminer et conduire la politique de la Nation',
      'Remplacer tous les juges',
      'Voter seul les lois sans Parlement',
      'Organiser uniquement les élections municipales',
    ],
    correctIndex: 0,
    explanation:
      'Le Gouvernement conduit la politique de la Nation et met en œuvre les décisions publiques dans le cadre de la Constitution.',
    sourceIds: systemSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-058',
    theme: systemTheme,
    prompt: 'Qui peut voter aux élections en France ?',
    options: [
      'Les citoyens inscrits qui remplissent les conditions légales',
      'Toute personne présente le jour du vote',
      'Uniquement les propriétaires',
      'Uniquement les personnes de plus de 25 ans',
    ],
    correctIndex: 0,
    explanation:
      "Pour voter, il faut remplir les conditions prévues par la loi, notamment l'âge, la nationalité selon l'élection et l'inscription sur les listes électorales.",
    sourceIds: systemSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-065',
    theme: systemTheme,
    prompt: "Quel est le régime politique de la France aujourd'hui ?",
    options: [
      'Une République démocratique',
      'Une monarchie absolue',
      'Un régime sans élections',
      'Un empire héréditaire',
    ],
    correctIndex: 0,
    explanation:
      "La France est une République démocratique organisée par la Constitution de la Ve République.",
    sourceIds: systemSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-077',
    theme: systemTheme,
    prompt: "Quel traité concerne la construction de l'Union européenne ?",
    options: [
      'Le traité de Maastricht',
      'Le traité de Versailles de 1919',
      'Le traité de Rome antique',
      'Le traité de Tordesillas',
    ],
    correctIndex: 0,
    explanation:
      "Le traité de Maastricht, signé en 1992, marque une étape majeure de la construction de l'Union européenne.",
    sourceIds: systemSources,
    difficulty: 'avance',
  },
  {
    id: 'official-extra-cr-089',
    theme: systemTheme,
    prompt: 'Quelle condition est nécessaire pour voter aux élections européennes ?',
    options: [
      'Être citoyen de l’Union européenne et inscrit sur les listes électorales',
      'Être né dans la commune du bureau de vote',
      'Avoir plus de 25 ans',
      'Posséder un passeport diplomatique',
    ],
    correctIndex: 0,
    explanation:
      "Les élections européennes sont ouvertes aux citoyens de l'Union européenne qui remplissent les conditions de vote et sont inscrits.",
    sourceIds: systemSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-107',
    theme: rightsTheme,
    prompt: "Qu'est-ce que la Constitution ?",
    options: [
      'Le texte fondamental qui organise les pouvoirs publics et garantit des droits',
      'Un règlement intérieur d’entreprise',
      'Une simple affiche administrative',
      'Un contrat privé entre deux personnes',
    ],
    correctIndex: 0,
    explanation:
      "La Constitution est le texte juridique le plus important de l'État : elle organise les institutions et protège les principes fondamentaux.",
    sourceIds: rightsSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-121',
    theme: rightsTheme,
    prompt: "Quel exemple illustre une limitation de liberté pour protéger l'intérêt général ?",
    options: [
      'Limiter la vitesse sur la route pour protéger la sécurité de tous',
      'Empêcher une personne de penser librement',
      'Supprimer le droit de se défendre',
      'Interdire toute opinion personnelle',
    ],
    correctIndex: 0,
    explanation:
      "Certaines libertés peuvent être encadrées par la loi pour protéger l'ordre public, la sécurité ou la santé de tous.",
    sourceIds: rightsSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-128',
    theme: rightsTheme,
    prompt: "S'agissant des déchets, quelle proposition est correcte ?",
    options: [
      'Il faut les trier ou les déposer dans les lieux prévus',
      'On peut les jeter dans la rue',
      'On peut toujours les brûler chez soi',
      'Le tri ne concerne personne',
    ],
    correctIndex: 0,
    explanation:
      "Le tri et les dépôts en déchetterie participent à la protection de l'environnement et évitent les dépôts sauvages.",
    sourceIds: rightsSources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-131',
    theme: historyTheme,
    prompt: 'En quelle année Napoléon Ier est-il devenu empereur ?',
    options: ['1804', '1789', '1914', '1958'],
    correctIndex: 0,
    explanation:
      'Napoléon Bonaparte devient empereur des Français en 1804.',
    sourceIds: historySources,
    difficulty: 'avance',
  },
  {
    id: 'official-extra-cr-132',
    theme: historyTheme,
    prompt: 'Lequel de ces personnages a un lien avec la République française ?',
    options: ['Marianne', 'Sherlock Holmes', 'Don Quichotte', 'Robin des Bois'],
    correctIndex: 0,
    explanation:
      'Marianne est une figure symbolique de la République française.',
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-143',
    theme: historyTheme,
    prompt: 'Quelle peine a été supprimée en 1981 ?',
    options: [
      'La peine de mort',
      'La peine de prison',
      'Les amendes',
      'Les travaux d’intérêt général',
    ],
    correctIndex: 0,
    explanation:
      'La peine de mort a été abolie en France en 1981.',
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-150',
    theme: historyTheme,
    prompt: 'Quel pays a une frontière terrestre avec la France métropolitaine ?',
    options: ['L’Espagne', 'Le Canada', 'La Suède', 'Le Portugal'],
    correctIndex: 0,
    explanation:
      "La France métropolitaine a des frontières terrestres avec plusieurs pays européens, dont l'Espagne.",
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-151',
    theme: historyTheme,
    prompt: 'Quelle ville française est un port maritime ?',
    options: ['Marseille', 'Dijon', 'Limoges', 'Clermont-Ferrand'],
    correctIndex: 0,
    explanation:
      'Marseille est une grande ville portuaire située sur la mer Méditerranée.',
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-154',
    theme: historyTheme,
    prompt: 'Quelle chaîne de montagnes est située entre la France et l’Espagne ?',
    options: ['Les Pyrénées', 'Les Vosges', 'Le Jura', 'Le Massif central'],
    correctIndex: 0,
    explanation:
      "Les Pyrénées forment une frontière naturelle entre la France et l'Espagne.",
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-155',
    theme: historyTheme,
    prompt: "Quelle île française se trouve dans l'océan Indien ?",
    options: ['La Réunion', 'La Corse', 'Belle-Île-en-Mer', 'L’île de Ré'],
    correctIndex: 0,
    explanation:
      "La Réunion est une île française située dans l'océan Indien.",
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-158',
    theme: historyTheme,
    prompt: 'Lequel de ces pays partage des frontières terrestres avec la France ?',
    options: ['L’Allemagne', 'La Grèce', 'La Suède', 'Le Portugal'],
    correctIndex: 0,
    explanation:
      "L'Allemagne partage une frontière terrestre avec la France métropolitaine.",
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-159',
    theme: historyTheme,
    prompt: 'Quel pays a une frontière avec la France métropolitaine au nord-est ?',
    options: ['L’Allemagne', 'L’Espagne', 'L’Italie', 'Le Portugal'],
    correctIndex: 0,
    explanation:
      "Au nord-est, la France métropolitaine est notamment frontalière de l'Allemagne.",
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-160',
    theme: historyTheme,
    prompt: 'Où se trouvent les principales activités économiques en France ?',
    options: [
      'Dans les grandes villes et les métropoles',
      'Uniquement dans les montagnes',
      'Uniquement dans les îles',
      'Seulement dans les zones sans habitants',
    ],
    correctIndex: 0,
    explanation:
      "Les activités économiques se concentrent fortement dans les grandes aires urbaines et les métropoles.",
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-164',
    theme: historyTheme,
    prompt: 'Quelle ville française fait partie des 10 plus grandes métropoles du pays ?',
    options: ['Lyon', 'Vichy', 'Albi', 'Dieppe'],
    correctIndex: 0,
    explanation:
      'Lyon fait partie des grandes métropoles françaises.',
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-165',
    theme: historyTheme,
    prompt: 'Lequel de ces départements de France est le plus touristique ?',
    options: ['Paris', 'La Creuse', 'Les Ardennes', 'La Lozère'],
    correctIndex: 0,
    explanation:
      'Paris est un département très touristique, notamment grâce à ses monuments, musées et événements culturels.',
    sourceIds: historySources,
    difficulty: 'avance',
  },
  {
    id: 'official-extra-cr-169',
    theme: historyTheme,
    prompt: 'Quel peintre est français ?',
    options: ['Claude Monet', 'Pablo Picasso', 'Vincent van Gogh', 'Salvador Dalí'],
    correctIndex: 0,
    explanation:
      "Claude Monet est un peintre français, célèbre notamment pour l'impressionnisme.",
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-174',
    theme: historyTheme,
    prompt: 'Qui était une écrivaine française célèbre ?',
    options: ['Simone de Beauvoir', 'Agatha Christie', 'Jane Austen', 'Virginia Woolf'],
    correctIndex: 0,
    explanation:
      'Simone de Beauvoir était une écrivaine et philosophe française.',
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-175',
    theme: historyTheme,
    prompt: 'Qui était un célèbre musicien français ?',
    options: ['Claude Debussy', 'Wolfgang Amadeus Mozart', 'Ludwig van Beethoven', 'Giuseppe Verdi'],
    correctIndex: 0,
    explanation:
      'Claude Debussy était un compositeur français célèbre.',
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-176',
    theme: historyTheme,
    prompt: 'Qui était Auguste Renoir ?',
    options: [
      'Un peintre français',
      'Un président de la République',
      'Un navigateur espagnol',
      'Un général romain',
    ],
    correctIndex: 0,
    explanation:
      'Auguste Renoir était un peintre français associé au mouvement impressionniste.',
    sourceIds: historySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-187',
    theme: societyTheme,
    prompt: "Concernant l'accès aux soins, quelle proposition est correcte ?",
    options: [
      "L'accès aux soins est protégé par des dispositifs selon la situation de la personne",
      'Les soins sont réservés uniquement aux personnes riches',
      'Les mineurs ne peuvent jamais être soignés',
      'Aucun dispositif n’existe pour les personnes en difficulté',
    ],
    correctIndex: 0,
    explanation:
      "En France, l'accès aux soins est organisé par l'Assurance maladie et par d'autres dispositifs selon la situation administrative et sociale.",
    sourceIds: societySources,
    difficulty: 'avance',
  },
  {
    id: 'official-extra-cr-190',
    theme: societyTheme,
    prompt: "L'inscription à l'Assurance maladie est :",
    options: [
      'Nécessaire pour ouvrir ses droits et être remboursé',
      'Réservée uniquement aux retraités',
      'Interdite aux salariés',
      'Sans lien avec les soins',
    ],
    correctIndex: 0,
    explanation:
      "L'inscription à l'Assurance maladie permet d'ouvrir des droits et d'obtenir une prise en charge des frais de santé selon sa situation.",
    sourceIds: societySources,
    difficulty: 'essentiel',
  },
  {
    id: 'official-extra-cr-207',
    theme: societyTheme,
    prompt: "Des parents ne respectent pas l'obligation d'instruction pour leurs enfants. Quelle sanction maximale risquent-ils ?",
    options: [
      "Jusqu'à 6 mois de prison et 7 500 euros d'amende en cas de non-respect d'une mise en demeure",
      'Uniquement un rappel oral sans sanction possible',
      'La suppression automatique de tous leurs droits civiques',
      'Une interdiction définitive de travailler',
    ],
    correctIndex: 0,
    explanation:
      "Le non-respect de l'obligation d'instruction peut entraîner des sanctions. Après mise en demeure non respectée, la sanction peut aller jusqu'à 6 mois de prison et 7 500 euros d'amende.",
    sourceIds: societySources,
    difficulty: 'avance',
  },
];
