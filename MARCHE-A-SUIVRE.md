# Marche à suivre : du dossier vide au thème proposé

Tu as besoin de **Node 20 ou plus** et de **git**. Rien d'autre : ni Coffre, ni agent, ni compte.
Dans les commandes ci-dessous, « le kit » est la racine de ce dépôt.

## 0. Prends le kit

Tu travailles **dans ta propre copie du kit** : ton thème est un dossier à côté de `exemple/`, dans cette copie.

```sh
git clone https://github.com/Billythek/coffre-kit
cd coffre-kit
npm install
```

`npm install` met `typescript`, `react` et les types de React, rien de plus. Vérifie que tout marche avant de toucher à quoi que ce soit :

```sh
npm run types      # les types de l'exemple contre le contrat : doit finir sans rien dire
npm run controler  # le contrôle sur l'exemple : « 0 faute(s) »
npm test           # le banc du kit (le contrôle n'est pas aveugle)
```

## 1. Lis l'exemple, dans cet ordre

1. `exemple/style-exemple.ts` et `exemple/style-exemple-pages.ts` : les deux **points d'entrée**. L'un donne l'Accueil (demandé dès l'ouverture), l'autre les neuf autres pages. Le **nom des fichiers** est ce qui les fait trouver (`style-<id>.ts`, `style-<id>-pages.ts`).
2. `exemple/accueil.tsx`, puis `travail.tsx` : chaque page commence par un commentaire qui dit **ce que ta vue doit faire** (la ref à poser, le `<h1>`, la pièce à placer une fois) et **ce que tu peux changer**.
3. `exemple/ui.tsx` : les cinq ou six petites pièces de dessin partagées (page, groupe, ligne, bouton, état). C'est là que ton style se joue le plus.
4. `exemple/textes.ts` : tous les mots que le thème écrit, en français et en anglais, avec une note pour le traducteur.
5. `exemple/palette.css` : les couleurs, clair et sombre. `exemple/exemple.module.css` : les formes.
6. `exemple/theme.json` : la fiche du thème.

Puis le **contrat** : `contrat/modeles.d.ts` (l'Accueil et Travail), `contrat/modeles-<page>.d.ts` (une page chacun). Sur chaque champ, la ligne `@origine` dit d'où il vient chez l'agent : le tableau de tâches (Kanban), les conversations (sessions), les réglages (config), les routines (cron), les savoir-faire, la mémoire, les profils, les messageries, le compte de la personne, ou « calculé par Coffre ». `contrat/externes.d.ts` décrit les types détaillés (une tâche, une routine, le résumé du jour…). `contrat/PIECES.md` liste les pièces déjà faites que tu places (et leurs props), `contrat/JETONS.md` le rôle de chaque couleur.

## 2. Outils de l'œil (facultatif, très utile)

Pour le dessin et le mouvement, nous te conseillons les *skills* d'Emil Kowalski (licence MIT) : https://github.com/emilkowalski/skills

```sh
npx skills@latest add emilkowalski/skills
```

Puis, dans ton assistant de code :
- lis **`emil-design-eng`** avant de dessiner : c'est la philosophie des détails qui font qu'une interface paraît soignée ;
- pour le mouvement, **`/animate`** (une animation, pas à pas) et **`/choreograph`** (plusieurs éléments qui bougent ensemble) ;
- avant de proposer ton thème : **`/review-animations`** (critique de tes animations) et **`/break-ui`** (tes écrans avec des données du pire cas : noms interminables, zéro élément, mille éléments, texte non latin…) ;
- **`/mobile-native`** : Coffre est une mini-app de téléphone, ces réglages font la différence.

Ces outils **conseillent** ; **nos règles passent avant** : les durées permises (140, 200 ou 240 ms), le mouvement réduit, un seul bouton plein, les mots (voir `README.md` et `RELECTURE.md`). Si un conseil les contredit, c'est la règle de Coffre qui gagne.

## 3. Crée ton thème

Choisis ton **identifiant** : minuscules, chiffres et tirets, 2 à 25 caractères, qui commence par une lettre (ici `aurore`). Pas `classique`, `point`, `carte`, `bureau` ni `exemple` : l'outil les refuse.

```sh
node outils/creer-theme.mjs aurore
```

L'outil copie `exemple/` en `aurore/` et renomme tout : les fichiers (`style-aurore.ts`, `style-aurore-pages.ts`, `aurore.module.css`), les composants (`AccueilAurore`…), les identifiants de page (`aurore-accueil`…), le nom de la palette, `theme.json` (`id`, `nom`), et ajoute le dossier à `include` dans `tsconfig.json`. Il ne laisse aucun « exemple » à renommer à la main.

Puis remplis `aurore/theme.json` :

- `nom` : le nom **public**, court (40 caractères au plus), celui qui s'affiche dans le choix du thème ;
- `description` : **une phrase**, 120 caractères au plus, qui dit ce que ton thème a de particulier ;
- `auteur` : `{ "nom": "…" }` (60 caractères au plus), et si tu veux `"lien": "https://…"` (une page à toi, en https) ;
- `licence` : `MIT`, `Apache-2.0`, `BSD-3-Clause` ou `autre` (dans ce cas, explique-la dans l'issue) ;
- `couleurs` : `{ "clair": "#rrggbb", "sombre": "#rrggbb" }`, les fonds de ta palette (`--background`), montrés pendant le chargement ;
- `version` : `1.0.0` pour commencer (x.y.z) ; `contrat` et `pages` ne changent pas ; `id` est déjà posé.

Le contrôle vérifie que ces champs sont là et bien formés.

Remplace `aurore/apercu.webp` par la **vignette** de ton thème : un `.webp` de **320 × 200** pixels (le contrôle lit la taille), qui montre **le haut de l'Accueil de ton thème** : le titre, le début de la liste, tes couleurs. Pas de texte minuscule : à cette taille, il doit se lire d'un coup d'œil.

Laisse les imports tels quels : `import type { … } from "../modeles"` est la porte du contrat (`tsconfig.json` la fait pointer sur `contrat/modeles.d.ts`, le seul exemplaire). Dans Coffre, `../modeles` est le même fichier, à la même place : ton dossier n'aura rien à changer.

## 4. Dessine, une page après l'autre

Tu peux avancer page par page : `node outils/controler-theme.mjs aurore --partiel` ne vérifie que les pages que ton thème donne déjà. Une page absente garde la page classique de Coffre, aux couleurs de ton thème. Un thème **proposé** doit donner les dix.

À chaque page :

```sh
npm run types                              # les types, contre le contrat
node outils/controler-theme.mjs aurore     # les règles de Coffre lues dans ton code
```

Les types disent si tu utilises mal une donnée ; le contrôle dit si tu as enfreint une règle (réseau, adresse, stockage, texte en dur, jeton oublié, contraste, mouvement, `<h1>` manquant…). Chaque faute a un fichier, une ligne, une règle et une raison.

**Tes mots**, tous dans `textes.ts` (`fr`, `en`, `note`) : aucun texte écrit dans une vue. Le modèle donne déjà beaucoup de phrases toutes faites (le titre de l'Accueil, la ligne sous un savoir-faire…) : utilise-les.

**Tes couleurs**, toutes dans `palette.css`, avec **tous** les jetons de `contrat/jetons.txt`, clair et sombre, sur la page **et** sur la vignette (le contrôle compare les deux). Écris `--background` en hexadécimal (`#rrggbb`) : la barre de Telegram prend cette couleur et n'accepte que ça ; reporte ses deux valeurs dans `couleurs` de `theme.json`. Les formes (`.module.css`) lisent ces jetons, jamais une couleur écrite en dur : ainsi ton thème suit le mode clair ou sombre.

**Voir ton thème.** Ce dépôt ne fait pas tourner Coffre : tu travailles sur les types et les contrôles. Quand tu proposes ton thème (étape 6), **nous le faisons tourner** sur notre donnée de démonstration et nous te renvoyons les captures des dix pages, en clair et en sombre. (Un bac à sable pour voir ton thème chez toi serait la suite logique de ce kit.)

## 5. Avant de proposer

Dans cet ordre :

```sh
npm run types
node outils/controler-theme.mjs aurore       # sans --partiel : 0 faute(s)
```

Puis relis `RELECTURE.md` : c'est la liste que nous cochons. Prends-la comme ta propre liste. Les cases que le contrôle ne voit pas, tu les vérifies à l'œil : un seul bouton plein par écran, une phrase au plus sous un titre, la lecture avec un lecteur d'écran, le thème sombre et le clair, le poids.

Le contrôle doit finir à « 0 faute(s), 0 avertissement(s) » (un avertissement de polices est normal si tu en apportes une : nous relisons sa licence).

## 6. Propose ton thème

1. Mets ton thème dans **ton propre dépôt** (public, ou dis-nous comment y accéder en lecture) : le dossier de ton thème (`style-<id>.ts`, `style-<id>-pages.ts`, tes vues, `palette.css`, `textes.ts`, `theme.json`, `apercu.webp`, tes éventuelles polices).
2. Note l'**empreinte du commit** à relire (40 caractères : `git rev-parse HEAD`). Nous relisons ce commit et seulement lui.
3. Ouvre une *issue* dans ce dépôt avec le formulaire **« Proposer un thème pour Coffre »**. Il te demande le nom, ton nom d'auteur, l'adresse de ton dépôt, l'empreinte, la version du contrat (`contrat/version.txt`), la licence, des captures de tes dix pages en clair et en sombre, et deux phrases sur ce qui rend ton thème unique. Tu confirmes quatre engagements (dix pages, une vue ne lit rien, aucun secret dans le dépôt, tu as le droit de proposer ce code).

Ce que tu ne mets **jamais** dans ton dépôt : une clé, un identifiant, une adresse de serveur, une donnée de quelqu'un. Il n'y en a pas besoin.

## 7. Ce que nous relisons chez nous

Nous suivons `RELECTURE.md`, point par point : lecture de ton code (rien ne sort de la page, rien n'est gardé), mots et règles de Coffre, mouvement réduit, clair et sombre, contrastes. Puis nous mettons ton dossier dans Coffre à côté des nôtres, et nous faisons passer **nos bancs** (types complets, bancs des vues et des couleurs, construction), mesurons ce que ton thème ajoute au poids de l'app, et refaisons les captures sur la donnée de démonstration.

Tu as une réponse dans l'issue, sous quelques semaines : **en relecture**, puis **accepté** (avec la version de Coffre où il paraît) ou **refusé** (avec les raisons, une par ligne). Un thème accepté paraît gratuitement sur Communauté Coffre (https://mcp.nexaura.si/communaute/). Pour le mettre à jour, tu proposes une nouvelle version (nouvelle empreinte) par une nouvelle issue.

## Si le contrat change

`contrat/version.txt` dit la version du contrat. Un champ qui s'ajoute monte le deuxième chiffre (ton thème marche toujours) ; un champ qui change de sens ou disparaît monte le premier (ton thème est à refaire, nous te le disons). Ton `theme.json` dit la version du contrat que tu as utilisée.
