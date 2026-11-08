# Coffre — le kit des créateurs de thèmes

Coffre est une mini-app Telegram qui permet de **piloter un agent et de le voir travailler** : un Accueil, le travail de l'agent (un tableau de tâches), un catalogue, ses savoir-faire, sa personnalité, ses routines, sa fiche, ses réglages, le menu de ses agents, et le compte de la personne.

Ce kit te permet de dessiner **un thème complet** pour Coffre : ta façon de montrer ces dix pages. Ton thème paraît ensuite, gratuitement, dans la **Communauté Coffre** (https://mcp.nexaura.si/communaute/), à côté des nôtres, après relecture. La personne qui l'installe voit les mêmes données de son agent, avec ton dessin.

Tu n'as besoin de rien connaître de Coffre ni de l'agent : tu sais faire du React et du CSS, c'est tout.

## Ce qu'il y a dans ce dépôt

| Dossier ou fichier | À quoi il sert |
|---|---|
| `contrat/` | Les types de **toutes les données** que ton thème reçoit, page par page. Chaque champ dit d'où il vient chez l'agent (ligne `@origine`). `jetons.txt` est la liste fermée des couleurs à définir ; `JETONS.md` dit le rôle de chacune et les paires de contraste mesurées ; `PIECES.md` liste les pièces déjà faites (`modele.pieces`) avec leurs props, dit ce qui se passe quand une page manque, et explique `textes.ts`. Ce contrat est **généré par l'équipe Coffre depuis le code de Coffre**, à une version datée (`contrat/version.txt`, 1.0 le 8 nov. 2026) : ne le modifie pas, il est remplacé à chaque nouvelle version. `contrat/theme.schema.json` décrit la fiche `theme.json` attendue par la Communauté Coffre ; le contrôle y valide ta fiche. |
| `exemple/` | Un thème d'exemple **complet** (les dix pages), petit et sobre, qui passe nos contrôles. Copie-le, change-le. |
| `outils/creer-theme.mjs` | `node outils/creer-theme.mjs <id>` : copie l'exemple en `<id>/` et renomme tout. |
| `outils/controler-theme.mjs` | Le contrôle : sécurité des données et règles de Coffre, lu dans ton code. Le même que nous. Il valide aussi `theme.json` contre `contrat/theme.schema.json`. |
| `MARCHE-A-SUIVRE.md` | Du dossier vide au thème proposé, étape par étape, avec les commandes. |
| `RELECTURE.md` | Ce que nous cochons avant de publier un thème. Lis-le : tu sauras d'avance ce qu'on regarde. |
| `.github/ISSUE_TEMPLATE/` | Le formulaire pour proposer ton thème. |

Pour commencer :

```sh
git clone https://github.com/Billythek/coffre-kit
cd coffre-kit
npm install
```

puis `MARCHE-A-SUIVRE.md`.

## Comment ça marche, en trois phrases

Chaque page de Coffre est coupée en deux. Un **modèle** (fait par Coffre) lit l'agent, garde les minuteurs, fait les écritures. Une **vue** (la tienne) reçoit ce modèle en propriétés et dessine. Ta vue **ne lit rien et n'écrit rien** : tout ce qu'elle montre arrive par le modèle, tout geste de la personne repart par une fonction du modèle.

Un thème, ce sont donc : dix composants React (un par page), un fichier de couleurs (clair et sombre), un fichier de mots (français et anglais), et une fiche `theme.json`.

## Les règles de Coffre qu'un thème doit tenir

Elles viennent des choix du fondateur de Coffre. `outils/controler-theme.mjs` attrape les fautes **simples et les erreurs de bonne foi** ; les autres, nous les regardons à la relecture. **Le contrôle n'est pas une barrière de sécurité** (voir plus bas).

**Le fond**
1. **Une page = une intention.** Une page fait une chose et la fait bien.
2. **Une phrase au plus sous un titre.** Pas de paragraphe d'explication.
3. **Pas de jargon.** On ne montre jamais un nom technique, et on dit le nom de l'agent (ou « ton agent »), pas le nom du logiciel qui le fait tourner. On tutoie.
4. **Un seul bouton plein par écran.** Les autres boutons sont discrets (contour fin). Sur une décision : « Oui » pour un oui/non, « Répondre » pour une question ouverte.
5. **Un état se dit avec son mot.** Un point de couleur seul ne suffit jamais (« En ligne », « Éteint », « Échec »…).
6. **Ce que l'agent ne donne pas se cache.** Aucune donnée inventée, aucun chiffre fabriqué. Une donnée de démonstration est marquée « Exemple ».
7. **Ce qui coupe ou efface a sa pièce.** Éteindre un agent, supprimer : une fenêtre et un maintien, déjà faits par Coffre (`modele.pieces`). Tu les places, tu ne les réécris pas.

**La forme**
8. **Clair et sombre.** Tes couleurs existent dans les deux modes ; texte 4,5:1 sur son fond, grand texte et repères 3:1.
9. **Mouvement réduit respecté.** Tout ce qui bouge est coupé quand la personne demande moins de mouvement. Durées permises : 140, 200 ou 240 ms.
10. **Se toucher au pouce.** Cibles de 44 px au moins. Un titre `<h1>` par page. Le nom accessible d'un bouton commence par le mot affiché.
11. **Les effets sont libres** : halos, dégradés, ombres, couleurs. La sobriété de l'exemple est un choix de l'exemple, pas une règle.

**La sécurité des données**
12. **Une vue ne lit ni n'écrit rien** : pas de `fetch`, pas de `XMLHttpRequest`, pas de `WebSocket`.
13. **Aucune adresse extérieure** : pas de `https://…` dans le code ni dans le CSS, pas de `url()`, pas de `@import`.
14. **Aucun script tiers**, aucune balise `<script>`, `<iframe>`, `<link>`, aucun import dynamique.
15. **Aucun stockage caché** : ni `localStorage`, ni cookie, ni base locale. Un thème ne garde rien lui-même.
16. **Aucune dépendance de plus** : React, `motion/react` (facultatif), et ton propre dossier.

**Ce que le contrôle est, et n'est pas.** C'est un filet pour toi : il te dit tout de suite si tu as écrit un `fetch`, une adresse, un `localStorage`, un texte en dur, une couleur oubliée. Il lit ton code sans le lancer, et il refuse aussi les ruses les plus courantes (mots assemblés en morceaux, chemin vers la fenêtre par un élément, échappement CSS qui cache `url(`, règle de style qui sort de tes classes). **Un code décidé à tricher passera toujours** : en JavaScript, on ne peut pas prouver par la lecture qu'un programme n'ira nulle part. Par exemple, il ne voit pas un nom de propriété fabriqué à l'exécution à partir de pièces qui ne sont pas des chaînes écrites bout à bout, ni ce qu'un accès calculé `objet[clé]` va chercher. **La vraie barrière, c'est la relecture humaine** (voir `RELECTURE.md`), suivie de nos bancs dans Coffre : un thème ne paraît que si une personne a lu son code en entier. Ne compte donc pas sur le contrôle pour te protéger, ni pour nous convaincre : il te fait gagner du temps.

## Ce que Coffre te donne, et ce qu'il ne te donne pas

- Les **pièces** déjà faites (`modele.pieces`) : le tableau de tâches, le fil du jour, les feuilles de confirmation, la ligne « Thème »… Elles lisent et écrivent elles-mêmes, les mêmes dans tous les thèmes. Tu choisis où les poser et comment les entourer.
- Les **jetons** : tes couleurs sont des variables CSS (`--background`, `--surface`, `--accent`…). Tes feuilles de style les lisent ; ta palette les définit.
- Les **polices** : celles de Coffre (Google Sans Flex, Inter, Geist, Bricolage Grotesque, Geist Mono) ou celles du téléphone. Si tu en apportes une, déclare-la dans `theme.json` : nous relisons sa licence.
- Les **vrais logos** de services (`logoId`) et les icônes du kit de Coffre ne sont **pas** dans ce dépôt : la vue reçoit l'identifiant, pas le dessin. Pour l'instant, écris le nom du service. Nous prévoyons une pièce `Logo` dans le contrat.

## Licence et publication

- Ce kit (le contrat, l'exemple, les outils, les textes) est publié sous **licence MIT** : voir `LICENCE`. Le copyright est au nom du titulaire du compte GitHub du kit. La licence te laisse faire de l'exemple le point de départ de ton thème, avec la licence de ton choix pour ton propre dessin.
- Ton thème est **gratuit** dans la Communauté Coffre. Tu gardes ton code ; tu nous autorises à le publier et à le garder tant qu'il paraît (licence MIT, Apache-2.0 ou BSD-3-Clause, ou une autre que tu expliques).
- Tu **proposes** ton thème par le formulaire GitHub de ce dépôt (onglet *Issues*, « Proposer un thème pour Coffre ») : tu nous donnes le lien de ton dépôt et l'empreinte du commit à relire. Nous relisons, sur la donnée de démonstration, jamais sur celle de quelqu'un. Nous ne publions que le code exact relu.
- Après relecture, il paraît sur **Communauté Coffre** (https://mcp.nexaura.si/communaute/) et dans le choix du thème de Coffre.

Aucune donnée de personne n'est dans ce dépôt, et il n'en faut aucune pour travailler : tout se fait sur les types.
