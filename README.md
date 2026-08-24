# Test Civique QCM

Application React pour s'entrainer au test civique francais, avec deux parcours: carte de sejour / residence et naturalisation francaise.

## Fonctionnalites

- Parcours carte de sejour / residence et parcours naturalisation francaise.
- Banque de QCM jouables avec questions officielles disponibles et questions bonus d'entrainement.
- Reponses melangees aleatoirement a chaque session.
- Mode entrainement par theme et mode examen 40 questions / 45 minutes.
- Suivi de progression, favoris, historique d'examen et revision intelligente.
- Export PDF, import/export du profil local et fonctionnement PWA hors ligne.
- Version Android Capacitor avec integration AdMob pour une monetisation par publicites.

## Sources

Les questions publiques sont recuperees depuis le site officiel du ministere de l'Interieur :

- https://formation-civique.interieur.gouv.fr/examen-civique/liste-officielle-des-questions-de-connaissance-cr/
- https://formation-civique.interieur.gouv.fr/examen-civique/informations-g%C3%A9n%C3%A9rales-sur-lexamen-civique/

Les mises en situation officielles ne sont pas publiques. L'application s'entraine donc sur la banque publique de connaissance CR.

## Lancer le projet

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```

## Mobile iOS

Le projet est prepare avec Capacitor.

```bash
npm run ios:add
npm run ios:sync
npm run ios:open
```

La compilation et la publication iOS demandent macOS avec Xcode, ou un service de build cloud.

## Mobile Android + publicites

Le projet Android est prepare avec Capacitor et AdMob.

```bash
npm run android:sync
npm run android:open
npm run android:build:debug
npm run android:build:release
```

`mobile:build`, `android:sync` et `android:build:debug` utilisent le mode Vite `development` et les annonces de test Google. `android:build:release` utilise explicitement le mode `production` et les IDs AdMob reels, comme explique dans `docs/android-publication-and-ads.md`.

## Publication Google Play

Les textes et documents prets pour Google Play sont dans `docs/google-play/`.
