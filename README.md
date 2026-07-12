# Test Civique QCM

Application React pour s'entrainer au test civique francais, avec une banque de QCM basee sur la liste officielle des questions de connaissance CR.

## Fonctionnalites

- 209 QCM jouables couvrant les 209 questions publiques CR.
- Reponses melangees aleatoirement a chaque session.
- Mode entrainement par theme et mode examen 40 questions / 45 minutes.
- Suivi de progression, favoris, historique d'examen et revision intelligente.
- Export PDF, import/export du profil local et fonctionnement PWA hors ligne.

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
