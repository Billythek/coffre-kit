/*
 * Le menu des agents, ouvert depuis la pastille de l'en-tête.
 * Ce fichier ne contient que des TYPES. Une vue reçoit ce modèle en propriétés et ne lit ni n'écrit rien elle-même : tout ce qui
 * vient de l'agent arrive par ici, tout geste de la personne repart par ici. Sur chaque champ, la ligne « @origine » dit d'où il vient chez l'agent.
 * Ce que l'agent ne fournit pas n'est pas dans le modèle (null, tableau vide ou champ absent) : la vue le cache, elle n'invente rien.
 */
import type { Agents, Assistant, RoutePlatform } from "./externes";
import type { KeyboardEvent as ReactKeyboardEvent, RefObject } from "react";

/** Où le menu s'ouvre : la place de la pastille dans la page, et la place qu'il peut prendre. */
export type GeometrieMenu = { left: number; top: number; width: number; height: number; open: number; max: number };

/** Ce que dit un agent de lui en un mot : sa panne, sa pause, son extinction, ou sa dernière activité. */
export type EtatAgent = {
  mot: string;
  ton: "danger" | "muted";
  /** `echec` : n'a pas pu démarrer ; `pause` : en pause ; `eteint` : éteint (l'agent l'a rangé) ; `vu` : sa dernière activité. */
  genre: "echec" | "pause" | "eteint" | "vu";
};

export type LigneAgent = {
  id: string;
  nom: string;
  /** Son image (photo du profil, ou celle de son bot pour l'agent principal) ; absent : son initiale. */
  visage?: string;
  /** Son profil tel que la liste des agents le donne (pour les actions). */
  agent: Assistant;
  /** C'est l'agent affiché en ce moment. */
  ici: boolean;
  principal: boolean;
  /** Allumé (connexion en marche, pas en pause) ; `working` : quelque chose tourne pour lui à l'instant. Jamais sans son mot (`lumiereMot`). */
  lumiere: "online" | "working" | null;
  /** « En ligne » ou « Au travail » : le mot de la lumière ; "" sans lumière. */
  lumiereMot: string;
  etat: EtatAgent | null;
  /** « Principal », ou ce à quoi il sert en mots simples ; "" quand il n'y a rien à dire ou qu'un état suffit. */
  detail: string;
  /** Son travail sur le Kanban (lu depuis l'agent principal seulement) : « 2 en cours » et « 1 t'attend » ; null sinon. */
  travail: { texte: string; attend: string | null } | null;
  /** Des tâches l'attendent, lui, la personne (le Kanban est lu depuis l'agent principal seulement). */
  attend: number;
  /** Où il répond (les logos de ses messageries). */
  lieux: { id: RoutePlatform; nom: string }[];
  /** Un intertitre à placer avant cette ligne : « T'attendent » puis « Les autres » ; null sinon. */
  intertitre: string | null;
  peutPause: boolean;
  peutReprendre: boolean;
  peutEteindre: boolean;
  peutRallumer: boolean;
  /** Le nom lu par les lecteurs d'écran pour passer à lui. */
  nomAccessible: string;
};

export type ModeleAgents = {
  /**
   * Le menu est ouvert. La vue n'est dessinée que menu ouvert.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  ouvert: boolean;
  /**
   * La liste complète est dépliée.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  deplie: boolean;
  /**
   * Où le menu s'ouvre (mesuré à l'ouverture) ; sert à la page actuelle (elle le fait grandir hors de la pastille), une vue pleine page peut l'ignorer.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  geometrie: GeometrieMenu | null;
  /**
   * À poser sur le bouton de la pastille ; le focus y revient à la fermeture.
   * @origine à poser dans la vue (rien à lire)
   */
  declencheur: RefObject<HTMLButtonElement | null>;
  /**
   * À poser sur l'élément le plus haut du menu : il devient inerte à la fermeture, le focus y reste pris.
   * @origine à poser dans la vue (rien à lire)
   */
  panneau: RefObject<HTMLDivElement | null>;
  /**
   * Ouvre le menu (liste dépliée si `deplie`). Le geste de la pastille de l'en-tête : une vue n'en a pas besoin.
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  ouvrir(deplie?: boolean): void;
  /**
   * Ferme le menu ; `rendreLeFocus` à faux quand un autre geste prend la main (passer à un agent, ouvrir une page).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  fermer(rendreLeFocus?: boolean): void;
  /**
   * Garde le focus dans le menu (Tab et Maj+Tab font le tour) : à poser en `onKeyDown` de l'élément le plus haut.
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  piege(event: ReactKeyboardEvent<HTMLElement>): void;
  /**
   * Le nom du menu pour les lecteurs d'écran : « Tes agents », ou le nom de l'agent s'il est seul.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  titre: string;
  /**
   * Plusieurs agents (sinon les phrases disent le nom de l'agent, pas « tous »).
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  plusieurs: boolean;

  /**
   * L'agent affiché : sa pastille. `nom` vide tant que la liste n'est pas lue (jamais un nom provisoire).
   * @origine profils (la liste des agents) : l'agent affiché, les visages, la liste, les comptes
   */
  courant: { id: string; nom: string; visage?: string; lumiere: "online" | "working" | null; lumiereMot: string; nomAccessible: string };
  /**
   * Toute la flotte est en pause (l'agent, à la racine).
   * @origine état de l'agent : toute la flotte est en pause
   */
  flottePausee: boolean;

  /**
   * Le nombre d'agents lus, et combien ont bougé aujourd'hui (null quand la liste ne le dit pour aucun).
   * @origine profils (la liste des agents) : l'agent affiché, les visages, la liste, les comptes
   */
  total: number;
  /** @origine profils (la liste des agents) : l'agent affiché, les visages, la liste, les comptes */
  aujourdhui: number | null;
  /**
   * Les premiers visages (trois au plus).
   * @origine profils (la liste des agents) : l'agent affiché, les visages, la liste, les comptes
   */
  visages: { id: string; nom: string; visage?: string }[];
  /**
   * Les agents montrés (les actifs, ou tous une fois dépliée, ou ceux que la recherche garde).
   * @origine profils (la liste des agents) : l'agent affiché, les visages, la liste, les comptes
   */
  lignes: LigneAgent[];
  /**
   * La liste n'a pas pu être lue et rien n'est gardé : à dire, avec `retenter`.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  erreurListe: boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  retenter(): void;
  /**
   * La recherche (à partir de 7 agents, liste dépliée).
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  recherche: { valeur: string; changer(valeur: string): void } | null;
  /**
   * La recherche ne garde personne.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  aucunResultat: boolean;
  /**
   * « Voir les 5 agents » ou « Réduire la liste » ; null quand il n'y a rien de plus à voir.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  voirTous: { libelle: string; deplie: boolean } | null;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  basculerDeplie(): void;
  /**
   * Un agent a été réinitialisé et l'agent le dit : une note à montrer.
   * @origine état de l'agent : un agent a été réinitialisé
   */
  noteReinitialisation: boolean;

  /**
   * Tout mettre en pause / tout reprendre : un seul geste pour la flotte, sur l'agent principal. Null quand l'agent ne l'offre pas.
   * @origine profils (la liste des agents) : tout mettre en pause, tout reprendre
   */
  flotte: { action: "engage" | "lift"; libelle: string } | null;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  demanderPauseFlotte(): void;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  reprendreFlotte(): void;

  /**
   * Une action est en cours (aucune autre ne part en attendant).
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  occupe: boolean;
  /**
   * Passer à cet agent (ferme le menu).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  choisir(id: string): void;
  /**
   * Ouvrir Programmer pour cet agent.
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  programmer(id: string): void;
  /**
   * Ouvrir son travail (le Kanban filtré sur lui).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  ouvrirTravail(id: string): void;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  mettreEnPause(ligne: LigneAgent): void;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  reprendre(ligne: LigneAgent): void;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  rallumer(ligne: LigneAgent): void;
  /**
   * Éteindre : ferme le menu, puis la fenêtre avec son maintien (elle est posée par la page, jamais par la vue).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  demanderExtinction(ligne: LigneAgent): void;
  /**
   * Les deux fenêtres qui coupent (éteindre un agent, tout mettre en pause) : posées par la page (ConfirmCut, avec son maintien), jamais par
   * une vue. La vue ouvre seulement (`demanderExtinction`, `demanderPauseFlotte`).
   * @origine Coffre : les deux fenêtres qui coupent (éteindre, tout mettre en pause), posées par la page
   */
  fenetres: {
    extinction: Assistant | null;
    fermerExtinction(): void;
    confirmerExtinction(): void;
    /** L'agent dont une action est partie (« default » pour la flotte). */
    occupeId: string | null;
    pauseFlotte: boolean;
    fermerPauseFlotte(): void;
    confirmerPauseFlotte(): void;
  };
  /**
   * « Nouvel agent » : absent là où l'agent ne l'ouvre pas.
   * @origine profils (la liste des agents) : créer un agent, absent là où la création est fermée
   */
  nouvelAgent: (() => void) | null;
};
