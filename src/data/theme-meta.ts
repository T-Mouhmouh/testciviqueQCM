import type { ThemeMeta } from '../types';

export const themeMeta: ThemeMeta[] = [
  {
    key: 'principles',
    label: 'Principes et valeurs de la République',
    shortLabel: 'Principes',
    gradient: 'linear-gradient(135deg, #0f265c 0%, #1d4c9a 100%)',
    surface: 'rgba(18, 49, 108, 0.1)',
    icon: '△',
    blurb: 'Liberté, égalité, fraternité, laïcité et symboles républicains.',
  },
  {
    key: 'system',
    label: 'Système institutionnel et politique',
    shortLabel: 'Institutions',
    gradient: 'linear-gradient(135deg, #0f4d48 0%, #1f857b 100%)',
    surface: 'rgba(20, 113, 102, 0.1)',
    icon: '◇',
    blurb: "Président, Gouvernement, Parlement, collectivités et Union européenne.",
  },
  {
    key: 'rights',
    label: 'Droits et devoirs',
    shortLabel: 'Droits',
    gradient: 'linear-gradient(135deg, #7a1f1f 0%, #c54b3c 100%)',
    surface: 'rgba(197, 75, 60, 0.1)',
    icon: '○',
    blurb: 'Libertés fondamentales, respect de la loi et protection des personnes.',
  },
  {
    key: 'history',
    label: 'Histoire, géographie et culture',
    shortLabel: 'Culture',
    gradient: 'linear-gradient(135deg, #775017 0%, #d89b2d 100%)',
    surface: 'rgba(216, 155, 45, 0.14)',
    icon: '✦',
    blurb: 'Repères historiques, géographie française et patrimoine culturel.',
  },
  {
    key: 'society',
    label: 'Vivre dans la société française',
    shortLabel: 'Société',
    gradient: 'linear-gradient(135deg, #5a264a 0%, #b75189 100%)',
    surface: 'rgba(183, 81, 137, 0.12)',
    icon: '⬢',
    blurb: 'École, santé, travail, famille, logement et vie quotidienne.',
  },
];
