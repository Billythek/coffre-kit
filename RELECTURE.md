# Relecture d'un thème venu de dehors

La liste que **l'équipe Coffre** applique à chaque thème proposé. Rien ne paraît sans que tout soit coché. Le créateur peut l'utiliser comme sa propre liste.

Un thème est relu **sur le commit exact** que le créateur a indiqué, jamais sur un lien qui peut changer. On note l'empreinte du commit, la date et le nom de la personne qui a relu dans l'issue. Un seul refus suffit à refuser (avec les raisons, une par ligne). Aucun thème n'est relu avec la donnée de quelqu'un : les captures se font sur la donnée de démonstration.

## 0. Avant de lire une ligne

- [ ] Le dépôt du créateur est cloné dans un **dossier à part, jamais lancé** : on lit, on ne lance rien du dépôt (pas de `npm install` du créateur, pas de script).
- [ ] L'empreinte du commit est celle de l'issue (40 caractères). Une branche qui avance ne compte pas.
- [ ] Le dossier du thème ne contient que : `.ts`, `.tsx`, `.css`, `theme.json`, `apercu.webp`, des captures `.webp` ou `.png`, des polices `.woff`/`.woff2` déclarées. Rien d'autre (pas de `.js`, `.json` de données, `.html`, `.wasm`, `.svg` séparé).
- [ ] Rien dans le dépôt qui ressemble à une clé, un jeton, une adresse de serveur, un identifiant, une donnée de personne (chercher aussi dans l'historique des commits du thème).

## 1. Sécurité des données

Le contrôle du kit fait la première passe : `node outils/controler-theme.mjs <dossier>` doit finir à **0 faute**. On relit ensuite à la main ce qu'un contrôle de forme ne voit pas.

- [ ] **La vue ne touche jamais l'agent** : aucun `useCachedRead`, `personalRead`, `personalWrite`, `personalRequest`, aucune écriture que le modèle ne donne pas. Tout geste appelle une fonction du modèle.
- [ ] **Aucun `fetch`**, `XMLHttpRequest`, `WebSocket`, `EventSource`, `sendBeacon`, aucun travailleur, y compris dans un fichier `.css` (`url()`, `@import`) et dans une chaîne composée (`"ht" + "tp"`).
- [ ] **Aucune adresse extérieure**, dans le code, les textes, le CSS, les polices, `theme.json`, **ni dans une image** (`<img src>` vient du modèle, jamais d'une chaîne écrite).
- [ ] **Aucun script tiers** : `<script>`, `<iframe>`, `<object>`, `<link>`, import dynamique, `eval`, `new Function`, HTML écrit à la main (`dangerouslySetInnerHTML`, `innerHTML`).
- [ ] **Aucun stockage caché** : `localStorage`, `sessionStorage`, `indexedDB`, cookie, cache, `navigator`. Un thème ne garde rien lui-même, ne lit pas le presse-papier, ne vibre pas.
- [ ] **Rien ne sort de la page** : ni `window`, ni `location`, ni `history`, ni `postMessage`, ni accès à Telegram. Seul `document.documentElement` (pour la langue) est permis.
- [ ] **Aucune dépendance de plus** : les imports sont `react`, `motion/react`, le dossier du thème, et des `import type` de `../modeles`. Pas de nouveau paquet dans `package.json` du dépôt de Coffre.
- [ ] **Les pièces sont placées, pas réécrites** : les confirmations (éteindre, supprimer, preuve), les feuilles, le maintien, la ligne « Thème » sont celles de `modele.pieces`. Aucune confirmation refaite dans la vue ; aucun bouton « supprimer » qui agit sans passer par la pièce.
- [ ] **Aucune action retirée** : chaque geste que la page classique offre est là (le commentaire de chaque page du kit dit lesquels).
- [ ] **Une vue qui plante ne casse rien** : la page classique la remplace (c'est le registre de Coffre qui le garantit) ; on vérifie qu'une donnée absente (`null`, vide) ne fait pas planter.

## 2. Vocabulaire et règles de Coffre

- [ ] **Une page = une intention.** Chaque page fait une chose.
- [ ] **Une phrase au plus sous un titre.**
- [ ] **Pas de jargon** : aucun nom technique visible (ni le nom du logiciel de l'agent, ni `cron`, `kanban`, `gateway`, `token`, `API`, `yaml`…) ; on dit le nom de l'agent. Le contrôle lit `textes.ts` ; on lit aussi ce qui vient du modèle.
- [ ] **Tutoiement** partout.
- [ ] **Les mots de Coffre** : « Agent » ; Supprimer / Débrancher / Retirer ; « Nouvelle… » pour créer, « Ajouter » pour prendre dans le Catalogue ; « Éteindre / Rallumer » un agent ; « Messageries ».
- [ ] **Chaque texte** a un `fr`, un `en` et une `note` ; aucun texte écrit dans une vue.
- [ ] **Un seul bouton plein par écran**, vérifié sur chaque page, dans tous ses états (chargement, erreur, vide, plein).
- [ ] **Un état se dit avec son mot**, jamais une couleur seule.
- [ ] **Rien d'inventé** : ce que l'agent ne donne pas est caché ; une donnée de démonstration est marquée « Exemple ».
- [ ] **Les dix pages sont là** et se comportent comme la page classique : l'Accueil garde `[data-opening-title]`, `m.titre`, `m.racine` ; chaque page a son `<h1>` ; le menu des agents garde le piège de focus ; chaque pièce de feuilles est placée une fois.
- [ ] **Aucune marque, aucune personne reconnaissable, aucun logo** qui n'est pas à son auteur ; pas de ressemblance voulue avec une autre application.

## 3. Mouvement, clair et sombre, contrastes

- [ ] **Mouvement réduit** : avec « réduire les animations » (réglage du téléphone), plus rien ne bouge (transitions, animations, ressorts, défilements animés). Contrôle du kit + essai à la main.
- [ ] **Durées** : 140, 200 ou 240 ms, rien d'autre, ni en CSS ni en code. Les conseils des outils d'animation passent après nos règles.
- [ ] **Animations revues avec `/review-animations`, données du pire cas passées avec `/break-ui`** (noms interminables, zéro élément, des centaines, texte non latin, émojis) : le créateur l'indique dans son issue, nous le refaisons sur les pages à risque.
- [ ] **Clair et sombre** : les deux existent, sur la page **et** sur la vignette du choix de thème, avec **tous** les jetons de `contrat/jetons.txt` et les mêmes valeurs.
- [ ] **Contrastes** : texte 4,5:1, grand texte et repères 3:1, mesurés (le kit calcule les paires principales ; le banc des couleurs de Coffre les calcule toutes, dans la cascade réelle). Un état est lisible sans la couleur.
- [ ] **Au pouce, sur un téléphone** : cibles de 44 px, rien sous l'encoche ni sous la barre du bas, texte lisible sans zoom, aucun défilement horizontal, les champs ne zooment pas la page.
- [ ] **Lecteur d'écran** : l'ordre de lecture a un sens, les boutons ont un nom qui commence par leur mot affiché, la phrase de l'Accueil est lue.
- [ ] **Polices** : celles de Coffre, ou une police déclarée avec sa licence (OFL ou équivalente) et son fichier de licence ; jamais chargée d'ailleurs.

## 4. Bancs, construction, poids

On met le dossier dans Coffre à côté des autres thèmes, sur une copie à part, puis on fait passer **nos bancs, un à la fois** (tu ne peux pas les lancer toi-même : ils tournent dans Coffre) :

- [ ] La vérification des types : aucune erreur, contre les **vrais** types de Coffre (pas seulement le contrat du kit).
- [ ] Le banc des vues et des couleurs de Coffre : aucune lecture ni écriture dans la vue, imports permis, `h1`, `data-opening-title`, jetons, contrastes, mouvement réduit, durées.
- [ ] Tous les autres bancs de Coffre : le reste ne bouge pas.
- [ ] La construction de Coffre : la construction passe, et **le thème n'ajoute aucun fichier partagé** au premier écran (le banc de construction le vérifie).
- [ ] **Poids** : la taille ajoutée au build (le fichier d'entrée du thème, celui des pages, les feuilles de style) est notée dans l'issue. Seuils : le fichier du premier écran reste petit (à peine plus que l'Accueil) ; le total du thème sous 120 Ko compressés ; polices comprises. Au-delà, on demande de l'alléger.
- [ ] **Captures** des dix pages, clair et sombre, sur la donnée de démonstration, regardées une à une à côté de la page classique : rien ne manque, rien ne déborde, aucune donnée réelle visible.
- [ ] **Essai sur un téléphone** (dans Telegram) avant toute mise sur le Coffre de quelqu'un.

## 5. Décision

- [ ] Tout est coché, ou les points restants sont écrits et acceptés dans l'issue.
- [ ] `theme.json` complété **par nous** : `origine` (dépôt et commit relu), `empreinteRelue` (sha256 de chaque fichier du dossier), `dateRelecture`, `versionCoffre` à l'intégration. Les polices, l'aperçu et les captures sont ceux que nous avons relus et refaits.
- [ ] La réponse à l'issue : « accepté » avec la version de Coffre, ou « refusé » avec les raisons, une par ligne.
- [ ] Un thème dont le code change après relecture est un **nouveau** thème à relire (nouvelle empreinte) : on ne republie jamais du code non relu.
