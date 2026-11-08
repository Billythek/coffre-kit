# Les pièces : ce que Coffre a déjà fait pour toi

Chaque page reçoit, dans son modèle, un objet `pieces` (ou `modele.pieces`). Ce sont des composants **déjà faits**, les mêmes dans tous les thèmes : ils lisent et écrivent eux-mêmes chez l'agent (une vue, elle, ne lit rien). Tu choisis **où** les poser et **ce qui les entoure** ; tu ne les réécris pas. Une pièce « à placer une fois » doit apparaître exactement une fois dans la page, sinon rien ne s'ouvre (le contrôle le vérifie pour les feuilles).

Les types exacts de leurs propriétés sont dans `modeles*.d.ts` (le champ `pieces`) et `externes.d.ts`. Ci-dessous : le nom, les propriétés, et ce que la pièce fait. « Sans props » = on la pose telle quelle ; `{ modele }` = on lui passe le modèle de la page (`<Feuilles modele={m} />`).

Les trois petites pièces **Reveal**, **Skeleton** et **SkeletonRows** reviennent sur plusieurs pages ; elles sont décrites une fois, ici :

- `Reveal` : `children`, `className?`, `style?`. Fait apparaître son contenu en fondu de 140 ms à la place d'un squelette ; coupé en mouvement réduit.
- `Skeleton` : `lines?`, `width?`, `height?`, `className?`. Des lignes calmes à la place d'un texte qui charge.
- `SkeletonRows` : `rows?`, `label?`, `rowHeight?`. Des lignes calmes à la place d'une liste qui charge (`label` est lu par les lecteurs d'écran).
- `InlineError` : `error`, `onRetry?`, `stale?`, `busy?`, `primary?`, `hint?`, `rows?`, `rowHeight?`, `place?`. « Je n'ai pas pu relire. » avec son geste « Réessayer » ; `stale` garde l'ancien contenu visible dessous.

## Accueil (`ModeleAccueil.pieces`)

| Pièce | Props | Ce qu'elle fait |
|---|---|---|
| `Statut` | `digest`, `agentName`, `onOpenConnexions?` | Le bandeau d'état de l'agent (en ligne, éteint, connexion à refaire). |
| `PourToi` | `digest`, `onOpenModule?` | Les lignes « Pour toi » : ce qui attend la personne. |
| `ErreurDigest` | `error`, `busy`, `onRetry` | L'erreur « résumé illisible », avec « Réessayer ». |
| `Fil` | aucune | Le fil du jour (la version légère sur le hub). |
| `Presence` | `empty?`, `max?` | « Qui travaille sur quoi » : pour chaque tableau où un agent travaille ou attend, la pile des agents, dite avec des mots ; un toucher ouvre Travail sur ce tableau. `empty` : ce qu'on montre quand personne ne travaille ; `max` : 3 tableaux au plus par défaut. |
| `Casiers` | aucune | Le rappel des premiers pas (première visite seulement ; il s'efface seul). |
| `Espace` | `agent`, `onOpen` | La carte « Espace de l'agent » (absente sur le hub, elle ne montre rien alors). |
| `Reveal`, `Skeleton` | voir plus haut | |

## Travail (`ModeleTravail.pieces`)

| Pièce | Props | Ce qu'elle fait |
|---|---|---|
| `Feuilles` | `{ modele }` | La feuille d'une tâche, les réglages du tableau et la création d'une tâche. **À placer une fois.** |
| `BoardPicker` | `boards`, `tasks`, `chosen`, `now`, `onChoose` | Le choix du tableau, avec les comptes. |
| `LiveNow` | `tasks`, `agents`, `now`, `onOpen` | « En ce moment » : les tâches en cours, une carte chacune (qui travaille dessus, depuis quand, l'étape et l'avancement), quatre au plus. |
| `Background` | `items`, `now`, `onTelegram` | Les objectifs que l'agent poursuit dans ses conversations, ceux qui ont bougé dans la journée (lecture seule ; un toucher ouvre la conversation). |
| `Decisions` | `tasks`, `questions?`, `agents`, `now`, `bot`, `answers`, `onOpen`, `onTelegram` | Ce qui attend la décision de la personne (cartes de décision), puis les questions que l'agent a posées en conversation (c'est ici que vit « Oui » / « Répondre »). |
| `KanbanBoard` | `tasks`, `agents`, `now`, `onOpen`, `onAdd?`, `canAct?` | Le tableau de tâches, en colonnes. |
| `TidyOld` | `tasks`, `board`, `now`, `agent` | « Ranger les vieilles tâches » : une liste à cocher, puis une fenêtre et un maintien ; une ligne discrète sous le tableau, dès qu'il y en a. |
| `DispatchNote` | `dispatch`, `estop?` | Une phrase, dite une fois au-dessus des tâches, quand l'agent ne prend aucun travail (en pause ou arrêté). |
| `InlineError`, `SkeletonRows`, `Reveal` | voir plus haut | |

## Catalogue (`ModeleCatalogue.pieces`)

| Pièce | Props | Ce qu'elle fait |
|---|---|---|
| `Feuilles` | `{ modele }` | Les feuilles du catalogue (ajouter un savoir-faire, brancher une connexion, modèle de routine, ajout par adresse). **À placer une fois.** |
| `Detail` | `{ modele }` | La page de détail ouverte. À placer à la place du reste quand `modele.detail` est vrai. |
| `Rayon` | `{ modele }` | Tout ce qui n'est pas l'accueil du catalogue (étagères, listes, quartier). À placer sous le titre quand `modele.accueil` est faux. |
| `InlineError`, `SkeletonRows`, `Reveal` | voir plus haut | |

## Savoir-faire (`ModeleSavoir.pieces`)

| Pièce | Props | Ce qu'elle fait |
|---|---|---|
| `Propositions` | `{ modele }` | Ce que l'agent propose et attend un oui. |
| `Aujourdhui` | `{ modele, Row }` | Ce qui a servi aujourd'hui ; `Row` est ta fonction qui dessine une ligne (`id`, `name`, `line`, `end?`, `onOpen`). |
| `Recherche` | `{ modele, surDeplier }` | La recherche qui se déplie : tu la poses dans ta rangée, `surDeplier(ouvert)` te dit quand elle s'ouvre. |
| `Soin` | aucune | L'entretien de l'agent et les mises à jour des savoir-faire venus d'ailleurs. |
| `SkeletonRows`, `Reveal` | voir plus haut | |

## Personnalité (`ModelePersonnalite.pieces`)

| Pièce | Props | Ce qu'elle fait |
|---|---|---|
| `Feuilles` | `{ modele }` | La feuille de la consigne manuelle, avec sa preuve. **À placer une fois.** |
| `LangueSysteme` | `{ modele }` | Sa langue de messages système (une ligne qui se règle d'elle-même). |
| `Voix` | `{ modele }` | Sa voix : réponse à un vocal, voix, modèle d'écoute. |
| `Contexte` | `{ modele }` | Ce qu'il lit vraiment avant de répondre. |
| `InlineError`, `Reveal`, `Skeleton`, `SkeletonRows` | voir plus haut | |

## Routines (`ModeleRoutines.pieces`)

| Pièce | Props | Ce qu'elle fait |
|---|---|---|
| `Feuilles` | `{ modele }` | « Nouvelle routine » en quatre étapes. **À placer une fois.** |
| `Bande` | `health`, `names`, `failing`, `late?`, `storage`, `onOpenRoutine`, `paused?` | La bande « à revoir » : disque, échecs, retards, et ce que « Vérifier » trouve. |
| `Idees` | `empty`, `onCreated`, `onIdeas?` | Les idées de routines de l'agent. |
| `Recevoir` | aucune | « Recevoir d'une application » (absente quand il n'y en a pas). |
| `Replis` | aucune | Les deux plis du bas : les outils de l'agent, et « Comment ça tourne ». |
| `InlineError`, `SkeletonRows`, `Reveal` | voir plus haut | |

## Programmer (`ModeleProgrammer.pieces`)

| Pièce | Props | Ce qu'elle fait |
|---|---|---|
| `Identite` | `{ modele }` | « Son image », « Son nom », « Son rôle » : trois lignes qui s'ouvrent dans leurs feuilles. À poser dans un groupe de lignes. |
| `Soucis` | `worries` | Ce qui ne va pas chez l'agent. |
| `Dossier` | `agent` | Son dossier de travail. |
| `Lieux` | `places` | Les conversations où il répond. |
| `ExportEnCours` | `flow`, `label?` | Le déroulé d'un export en cours. |
| `Extinction` | `{ modele }` | « Éteindre » (fenêtre + maintien) ou « Rallumer ». À placer une fois si `modele.extinction`. |
| `Retrait` | `{ modele }` | « Supprimer cet agent » et « Agents supprimés » (chacun absent si l'agent ne l'offre pas). À placer une fois. |
| `Hebergee` | aucune | « Supprimer ou recommencer » d'un client hébergé. À placer si `modele.danger`. |
| `PointeurBot` | `entry` | Le renvoi vers le bot du hub. À placer si `modele.pointeurBot`. |
| `FeuilleBot` | `{ modele }` | La feuille de la carte du bot (hub). **À placer une fois.** |
| `InlineError`, `Skeleton` | voir plus haut | |

## Réglages (`ModeleReglages.pieces`)

| Pièce | Props | Ce qu'elle fait |
|---|---|---|
| `Feuille` | `{ modele }` | La feuille d'une tuile (contenu, brouillons, « Appliquer », fenêtre « tout lancer seul »). **À placer une fois** (au singulier, ici). |
| `Age` | `at` | L'âge de ce qui reste affiché quand une relecture a échoué (« il y a 2 min »). |
| `InlineError`, `Skeleton` | voir plus haut | |

## Compte (`ModeleCompte.pieces`)

| Pièce | Props | Ce qu'elle fait |
|---|---|---|
| `Feuilles` | `{ modele }` | Les feuilles Appareils, Traduction, Installations. **À placer une fois.** |
| `Theme` | aucune | La ligne « Thème » de Préférences et sa feuille de quatre vignettes (c'est là qu'on choisit ton thème). |
| `Suppression` | `{ modele }` | La confirmation de suppression du compte (case, mot à recopier, maintien). |

## Agents (`ModeleAgents`)

Le menu des agents n'a **aucune pièce** : tout se dessine à partir du modèle. Il doit poser `m.panneau`, brancher `m.piege` en `onKeyDown` et avoir un bouton qui appelle `m.fermer` (le contrôle le vérifie).

## Quand une page manque

Un thème proposé donne les **dix** pages. Pendant que tu travailles (`--partiel`), une page absente n'est pas une faute : Coffre affiche alors la **page Classique, aux couleurs de ton thème**. Les pages secondaires (`routine`, `connexions`, `nouvel-agent`) ne sont pas dans `Vues` pour l'instant : elles se replient toujours ainsi. L'en-tête reste celui de Coffre : un thème ne le fournit pas.

## `textes.ts` : tes mots

Tous les mots que ton thème écrit vivent dans `textes.ts`, sous la forme `clé: { fr: "…", en: "…", note: "…" }`.

- **Obligatoire** : les clés de l'exemple que ton code utilise ; le français, l'anglais et la note vont toujours ensemble (le contrôle vérifie leur nombre).
- **Libre** : tu peux ajouter autant de clés que tu veux, avec tes propres mots.
- **`note`** : une indication pour la personne qui traduira (où le mot apparaît, ce qu'il désigne, 8 caractères au moins). Elle ne s'affiche jamais.
- Aucun texte écrit dans une vue : ni dans le JSX, ni dans `aria-label`, `placeholder`, `title`, `alt`. On tutoie, sans jargon.
