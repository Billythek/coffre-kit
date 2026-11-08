/*
 * Le contrat des vues de thème : l'Accueil, Travail, et la liste des vues qu'un thème peut donner (`Vues`).
 * Ce fichier ne contient que des TYPES. Une vue reçoit ce modèle en propriétés et ne lit ni n'écrit rien elle-même : tout ce qui
 * vient de l'agent arrive par ici, tout geste de la personne repart par ici. Sur chaque champ, la ligne « @origine » dit d'où il vient chez l'agent.
 * Ce que l'agent ne fournit pas n'est pas dans le modèle (null, tableau vide ou champ absent) : la vue le cache, elle n'invente rien.
 */
import type { Agents, Background, BoardCounts, BoardPicker, Decisions, DispatchNote, EspaceCard, HomeDigest, HomeDigestError, HomeStatus, InlineError, KanbanBoard, LiveNow, LiveQuestion, MissionsTarget, ModuleId, OpenTask, PourToi, ProjetsPresence, Reveal, Skeleton, SkeletonRows, TidyOld, TravailList, TravailTask } from "./externes";
import type { ComponentType, ReactNode, RefObject } from "react";
import type { ModeleCatalogue } from "./modeles-catalogue";
import type { ModeleSavoir } from "./modeles-savoir";
import type { ModelePersonnalite } from "./modeles-personnalite";
import type { ModeleRoutines } from "./modeles-routines";
import type { ModeleProgrammer } from "./modeles-programmer";
import type { ModeleReglages } from "./modeles-reglages";
import type { ModeleAgents } from "./modeles-agents";
import type { ModeleCompte } from "./modeles-compte";
export type { ModeleCatalogue } from "./modeles-catalogue";
export type { ModeleSavoir } from "./modeles-savoir";
export type { ModelePersonnalite } from "./modeles-personnalite";
export type { ModeleRoutines } from "./modeles-routines";
export type { ModeleProgrammer } from "./modeles-programmer";
export type { ModeleReglages } from "./modeles-reglages";
export type { ModeleAgents } from "./modeles-agents";
export type { ModeleCompte } from "./modeles-compte";

/** Les quatre thèmes. « classique » n'a aucune vue : la page actuelle s'affiche (avec ses couleurs). */
export type StyleId = "classique" | "point" | "carte" | "bureau";

/** Les pages dont un thème peut changer la structure (l'en-tête et l'Accueil sont dans le premier écran, les autres dans `screens`). */
export type PageId = "entete" | "accueil" | "travail" | "catalogue" | "savoir" | "personnalite" | "routines" | "routine"
  | "programmer" | "reglages" | "connexions" | "agents" | "nouvel-agent" | "compte";

/* --- Accueil -------------------------------------------------------------------------------------------------------- */

/**
 * Ce que la vue de l'Accueil reçoit. Elle DOIT :
 *  - poser `racine` sur son élément le plus haut et `titre` sur son <h1> (tabIndex -1, aria-live="polite") : la relecture
 *    automatique ne tourne que si `racine` est à l'écran, et le focus revient sur `titre` après « Réessayer » ;
 *  - mettre `modele.headline` dans ce <h1> (écrit, ou lisible seulement par les lecteurs d'écran) ;
 *  - garder l'élément `[data-opening-title]` vers lequel le nuage de points forme le titre à l'ouverture ;
 *  - n'avoir qu'un seul bouton plein.
 */
export type ModeleAccueil = {
  /** @origine à poser dans la vue (rien à lire) */
  racine: RefObject<HTMLDivElement | null>;
  /** @origine à poser dans la vue (rien à lire) */
  titre: RefObject<HTMLHeadingElement | null>;
  /**
   * Le nom de l'agent s'il en a un, sinon null (jamais le libellé par défaut du profil).
   * @origine profils (la liste des agents)
   */
  agentName: string | null;
  /**
   * Le résumé lu (null tant qu'il n'est pas là).
   * @origine résumé du jour : Kanban, sessions, cron et état de l'agent, réunis par Coffre
   */
  digest: HomeDigest | null;
  /**
   * Rien de gardé et pas encore de réponse : la place du résumé montre un squelette.
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  loading: boolean;
  /**
   * Le résumé n'a pas pu être lu du tout : la place du résumé le dit, avec « Réessayer » (`retenter`).
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  failed: boolean;
  /** @origine écran (état de la lecture : en cours, échec, ancienneté) */
  error: unknown;
  /**
   * Le nombre de lignes de « Pour toi » qui attendent la personne.
   * @origine Kanban (le tableau de tâches de l'agent) et sessions : ce qui attend la personne
   */
  waiting: number;
  /**
   * La phrase du <h1> : le fait principal du résumé.
   * @origine Coffre (calculé à partir de ce qui est déjà lu)
   */
  headline: string;
  /**
   * Quand l'Accueil a été lu pour la dernière fois (ms), null avant la première lecture.
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  at: number | null;
  /**
   * L'appareil est hors ligne.
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  offline: boolean;
  /**
   * Une relecture voulue par la personne est en cours (pas la relecture silencieuse de 15 s).
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  refreshing: boolean;
  /**
   * « maintenant » (ms), qui avance toutes les 30 s : pour « il y a 2 min ».
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  now: number;
  /**
   * Le Coffre d'un client hébergé (le hub) : le fil est alors la version légère.
   * @origine compte (la personne : son Telegram, son abonnement) : le Coffre d'un client hébergé
   */
  surLeHub: boolean;
  /**
   * Relit l'Accueil (geste de la personne : retour tactile + relecture forcée).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  relire(): void;
  /**
   * « Réessayer » après un échec : relit, puis remet le focus sur `titre` une fois le résumé là.
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  retenter(): void;
  /**
   * Ouvre une rubrique ; null quand la page n'en a pas le moyen (certaines pages d'essai).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  ouvrir: ((id: ModuleId) => void) | null;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  ouvrirTravail(cible?: MissionsTarget): void;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  ouvrirEspace(): void;
  /**
   * Le bloc posé sous la liste (le modèle de réponse de l'Accueil), s'il y en a un.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  extra: ReactNode;
  /**
   * Les pièces déjà faites (elles lisent et écrivent elles-mêmes) : une vue les place, ne les réécrit pas.
   * @origine pièces déjà faites par Coffre : on les place, on ne les réécrit pas
   */
  pieces: {
    /** Bandeau d'état de l'agent (connexion, alertes). Props : digest, agentName, onOpenConnexions. */
    Statut: typeof HomeStatus;
    /** Les lignes « Pour toi ». Props : digest, onOpenModule. */
    PourToi: typeof PourToi;
    /** L'erreur « résumé illisible ». Props : error, busy, onRetry. */
    ErreurDigest: typeof HomeDigestError;
    /** Le fil du jour (« Le fil » chez la personne, la version légère sur le hub). Sans props. */
    Fil: ComponentType;
    /** Qui travaille sur quel tableau. Props : empty (ce qu'on montre quand personne ne travaille), max. */
    Presence: typeof ProjetsPresence;
    /** Le rappel des premiers pas (première visite seulement). Sans props. */
    Casiers: ComponentType;
    /** La carte « Espace de {nom} » (absente sur le hub). Props : agent, onOpen. */
    Espace: typeof EspaceCard;
    Reveal: typeof Reveal;
    Skeleton: typeof Skeleton;
  };
};

/* --- Travail -------------------------------------------------------------------------------------------------------- */

/** Une tâche ouverte dans la feuille : son tableau, son numéro, et au besoin un fichier à montrer d'abord. */
export type TacheOuverte = { board: string; id: string; file?: { path: string; title: string } };

/**
 * Ce que la vue de Travail reçoit. Elle DOIT poser `page` sur son élément le plus haut, avoir un <h1> (la page le focalise),
 * appeler `modele.retour` au bouton « Accueil », et placer `<modele.pieces.Feuilles modele={modele} />` une fois (la feuille d'une
 * tâche, les réglages du tableau, la création d'une tâche : une seule pièce, la même dans tous les thèmes).
 */
export type ModeleTravail = {
  /** @origine à poser dans la vue (rien à lire) */
  page: RefObject<HTMLElement | null>;
  /** @origine écran (état de la lecture : en cours, échec, ancienneté) */
  read: {
    data: TravailList | null;
    loading: boolean;
    error: unknown;
    refreshing: boolean;
    refresh(force?: boolean): Promise<unknown>;
  };
  /**
   * Les tâches à montrer (celles d'un seul agent quand `only` est posé).
   * @origine Kanban (le tableau de tâches de l'agent) : les tâches à montrer
   */
  tasks: TravailTask[];
  /** @origine Kanban (le tableau de tâches de l'agent) : les tableaux et leurs comptes */
  boards: BoardCounts[];
  /**
   * Le tableau montré, s'il y en a un.
   * @origine Kanban (le tableau de tâches de l'agent) : les tableaux et leurs comptes
   */
  chosen: BoardCounts | undefined;
  /**
   * Les tâches du tableau montré.
   * @origine Kanban (le tableau de tâches de l'agent) : les tâches à montrer
   */
  own: TravailTask[];
  /**
   * Les questions que l'agent pose en direct (l'agent).
   * @origine Kanban : les questions que l'agent pose en direct
   */
  questions: LiveQuestion[];
  /**
   * Le travail d'un seul agent (« Voir son travail »), jusqu'à `toutMontrer`.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  only: string | null;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  toutMontrer(): void;
  /**
   * Le nom et la photo d'un agent par son identifiant.
   * @origine profils (la liste des agents) : nom et photo d'un agent par son identifiant
   */
  agents: Agents;
  /**
   * Le nom du bot Telegram de l'agent, s'il est connu.
   * @origine messageries (là où l'agent répond) : le bot Telegram de l'agent
   */
  bot: string | null;
  /**
   * Le nom de l'agent affiché.
   * @origine profils (la liste des agents) : nom et photo d'un agent par son identifiant
   */
  owner: string;
  /**
   * Le serveur prend les réponses et la création de tâches ; sinon on renvoie vers Telegram.
   * @origine Coffre : le serveur accepte les réponses et la création de tâches (sinon on renvoie vers Telegram)
   */
  answers: boolean;
  /** @origine écran (état de la lecture : en cours, échec, ancienneté) */
  now: number;
  /**
   * Le nombre de lignes du squelette (celui de la dernière fois).
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  listRows: number;
  /**
   * Les parties de la page arrivent en cascade courte à la toute première arrivée de la session.
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  cascade: boolean;
  /**
   * Une tâche demandée par un lien n'existe plus.
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  lost: boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  choisir(slug: string): void;
  /**
   * Ouvre la feuille d'une tâche.
   * @origine geste de la personne : ouvre la feuille d'une tâche
   */
  ouvrir: OpenTask;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  fermerTache(): void;
  /** @origine Kanban (le tableau de tâches de l'agent) : les tâches à montrer */
  opened: TacheOuverte | null;
  /** @origine écran (l'état de la page, rien chez l'agent) */
  creating: boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  setCreating(on: boolean): void;
  /** @origine écran (l'état de la page, rien chez l'agent) */
  settingsOpen: boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  setSettingsOpen(on: boolean): void;
  /**
   * Ouvre la conversation Telegram de l'agent (sans effet si le bot est inconnu).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  telegram(): void;
  /**
   * « ‹ Accueil ».
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  retour(): void;
  /** @origine pièces déjà faites par Coffre : on les place, on ne les réécrit pas */
  pieces: {
    BoardPicker: typeof BoardPicker;
    LiveNow: typeof LiveNow;
    Background: typeof Background;
    Decisions: typeof Decisions;
    KanbanBoard: typeof KanbanBoard;
    TidyOld: typeof TidyOld;
    DispatchNote: typeof DispatchNote;
    InlineError: typeof InlineError;
    SkeletonRows: typeof SkeletonRows;
    Reveal: typeof Reveal;
    /** La feuille d'une tâche + les réglages du tableau + la création d'une tâche. À placer une fois. */
    Feuilles: ComponentType<{ modele: ModeleTravail }>;
  };
};

/* --- Le registre ---------------------------------------------------------------------------------------------------- */

/** Un type de vue par page. Une page absente d'un thème n'y figure pas : la page actuelle s'affiche. */
export type Vues = Partial<{
  accueil: ComponentType<ModeleAccueil>;
  travail: ComponentType<ModeleTravail>;
  catalogue: ComponentType<ModeleCatalogue>;
  savoir: ComponentType<ModeleSavoir>;
  personnalite: ComponentType<ModelePersonnalite>;
  routines: ComponentType<ModeleRoutines>;
  programmer: ComponentType<ModeleProgrammer>;
  reglages: ComponentType<ModeleReglages>;
  agents: ComponentType<ModeleAgents>;
  compte: ComponentType<ModeleCompte>;
}>;

/** Les modèles par page (pour typer `useVue` et `VueSure`). */
export type ModelesParPage = {
  accueil: ModeleAccueil;
  travail: ModeleTravail;
  catalogue: ModeleCatalogue;
  savoir: ModeleSavoir;
  personnalite: ModelePersonnalite;
  routines: ModeleRoutines;
  programmer: ModeleProgrammer;
  reglages: ModeleReglages;
  agents: ModeleAgents;
  compte: ModeleCompte;
};
