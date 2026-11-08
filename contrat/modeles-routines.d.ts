/*
 * La page Routines : ce que l'agent fait tout seul, à heure fixe.
 * Ce fichier ne contient que des TYPES. Une vue reçoit ce modèle en propriétés et ne lit ni n'écrit rien elle-même : tout ce qui
 * vient de l'agent arrive par ici, tout geste de la personne repart par ici. Sur chaque champ, la ligne « @origine » dit d'où il vient chez l'agent.
 * Ce que l'agent ne fournit pas n'est pas dans le modèle (null, tableau vide ou champ absent) : la vue le cache, elle n'invente rien.
 */
import type { Filter, InlineError, Lang, Reveal, RoutineCheckBand, RoutineFacts, RoutineHealth, RoutineIdeasCard, RoutineLeadData, RoutineProblem, SkeletonRows } from "./externes";
import type { ComponentType } from "react";

/** Une routine, telle que l'agent la donne, avec ce que la page en dit. Les passages récents sont dans `facts.recentRuns` (14 au plus, le plus récent d'abord). */
export type LigneRoutine = {
  id: string;
  /** Son nom, déjà en français si la personne l'a choisi. */
  name: string;
  health: RoutineHealth;
  /** L'expression d'horaire de l'agent (jamais montrée telle quelle : `lead.sentence` la dit en mots). */
  schedule: string;
  /** Son rythme en mots : « Du lundi au vendredi à 8 h ». */
  quand: string;
  facts: RoutineFacts | undefined;
  problem: RoutineProblem | null;
  /** La ligne d'état de la page actuelle : « Réussie à 14:02 · Chaque jour à 8 h · Telegram », « Échec à 12:47 · … », « En pause depuis… ». */
  ligne: string;
  /** « dans 12 min » ; vide quand il n'y a pas de prochain passage (en pause, terminée). */
  prochain: string;
  /** En pause alors que le filtre « Actives » est mis : elle reste à sa place, atténuée, le temps d'« Annuler » (routines-07). */
  tenue: boolean;
  /** Met en pause / relance (retour tactile, pas de question, « Annuler » 5 s). null : l'agent refuse ici (terminée, une fois passée, illisible). */
  interrupteur: (() => void) | null;
  /** Une écriture est en cours : l'interrupteur est grisé (`aria-disabled`), pas retiré. */
  occupe: boolean;
  telegram: boolean;
  /** L'heure est passée de plus de deux minutes. */
  enRetard: boolean;
  /** La phrase, les marques, le compte à rebours et la bande des sept jours : les mêmes que dans la fiche. */
  lead: RoutineLeadData;
};

/** Un point de la frise du jour : un passage d'aujourd'hui (le dernier réussi, ou le prochain), à l'heure de l'agent. */
export type PointDeFrise = {
  id: string; routine: string; nom: string;
  /** « 8:30 » ou « 8 h 30 » selon la langue. */
  heure: string;
  /** Heures décimales de la journée (8,5), pour placer le point sur l'axe. */
  h: number;
  etat: "fait" | "prochain" | "plus-tard";
};

/**
 * Ce que la vue de Routines reçoit. Elle DOIT : avoir un <h1> ; poser `data-routine-row={ligne.id}` sur chaque ligne de routine qui
 * ouvre la fiche (le retour de la fiche y remet la page et le focus) ; ouvrir la fiche par `modele.ouvrir(id)` ; placer
 * `<modele.pieces.Feuilles modele={modele} />` une fois (« Nouvelle routine »). Elle ne retire aucune action : « Nouvelle routine »,
 * l'interrupteur, les filtres, la bande de vérification, les idées, « Recevoir d'une application », les outils et « Comment ça tourne ».
 */
export type ModeleRoutines = {
  /** @origine écran (état de la lecture : en cours, échec, ancienneté) */
  read: {
    /** La liste lue (null tant qu'elle n'est pas là). */
    data: { items: unknown[] } | null;
    loading: boolean;
    error: unknown;
    refreshing: boolean;
    refresh(force?: boolean): Promise<unknown>;
  };
  /** @origine écran (l'état de la page, rien chez l'agent) */
  lang: Lang;
  /**
   * Le nom de l'agent.
   * @origine profils (la liste des agents)
   */
  agent: string;
  /**
   * « maintenant » (ms), qui avance toutes les minutes.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  now: number;
  /**
   * La phrase posée par la fiche quand on en revient (« cette routine n'existe plus »), vide sinon.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  notice: string;
  /**
   * Le nombre de lignes du squelette (celui de la dernière fois).
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  attente: number;
  /**
   * Toutes les routines.
   * @origine cron (les routines de l'agent) : toutes les routines, avec leur état et leurs passages récents
   */
  lignes: LigneRoutine[];
  /**
   * Celles qui ont échoué et ne sont pas en pause : la ligne « À revoir ».
   * @origine cron (les routines de l'agent) : toutes les routines, avec leur état et leurs passages récents
   */
  aRevoir: LigneRoutine[];
  /**
   * Celles qui tournent (échouées comprises), la plus proche d'abord.
   * @origine cron (les routines de l'agent) : toutes les routines, avec leur état et leurs passages récents
   */
  prochaines: LigneRoutine[];
  /** @origine cron (les routines de l'agent) : toutes les routines, avec leur état et leurs passages récents */
  enPause: LigneRoutine[];
  /** @origine cron (les routines de l'agent) : toutes les routines, avec leur état et leurs passages récents */
  terminees: LigneRoutine[];
  /**
   * Celles que la page actuelle montre dans sa carte : le filtre appliqué, plus celles qui sont tenues.
   * @origine cron (les routines de l'agent) : toutes les routines, avec leur état et leurs passages récents
   */
  montrees: LigneRoutine[];
  /**
   * Le filtre choisi, et celui qui s'applique vraiment (sans pastilles, tout est montré).
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  filtre: Filter;
  /** @origine écran (l'état de la page, rien chez l'agent) */
  filtreMontre: Filter;
  /**
   * Les pastilles de filtre et leurs comptes ; null quand rien n'est en pause ou que rien ne tourne (pas de pastilles).
   * @origine cron (les routines de l'agent) : les comptes des pastilles de filtre
   */
  filtres: { tous: number; actives: number; enPause: number } | null;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  choisirFiltre(valeur: Filter): void;
  /**
   * La journée : un point par passage réussi d'aujourd'hui et par prochain passage d'aujourd'hui. null quand l'agent n'en donne aucun.
   * @origine cron (les routines de l'agent) : les passages d'aujourd'hui, placés sur l'heure
   */
  frise: { maintenant: string; h: number; points: PointDeFrise[] } | null;
  /**
   * Ce que la bande de vérification reçoit (`pieces.Bande`) : elle n'a rien à dire quand tout va bien.
   * @origine cron (les routines de l'agent) : la santé du planificateur, des envois et des échecs
   */
  verification: Omit<Parameters<typeof RoutineCheckBand>[0], "onOpenRoutine">;
  /**
   * L'agent n'a aucune idée à proposer (la page vide le dit).
   * @origine Coffre : l'agent n'a aucune idée de routine à proposer
   */
  aucuneIdee: boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  noterIdees(aucune: boolean | null): void;
  /** @origine écran (l'état de la page, rien chez l'agent) */
  creating: boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  setCreating(on: boolean): void;
  /**
   * Ouvre la fiche d'une routine (retour tactile).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  ouvrir(id: string): void;
  /**
   * Ouvre la fiche sans retour tactile (les lignes « terminées »).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  ouvrirSansVibration(id: string): void;
  /**
   * Relit la liste.
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  relire(): void;
  /**
   * Ouvre « Nouvelle routine » (retour tactile).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  nouvelle(): void;
  /** @origine pièces déjà faites par Coffre : on les place, on ne les réécrit pas */
  pieces: {
    /** « Nouvelle routine » en quatre étapes. À placer une fois : `<Feuilles modele={modele} />`. */
    Feuilles: ComponentType<{ modele: ModeleRoutines }>;
    /** La bande « à revoir » : disque, échecs, retards, et ce que « Vérifier » trouve. Props : `modele.verification` + onOpenRoutine. */
    Bande: typeof RoutineCheckBand;
    /** Les idées de l'agent. Props : empty, onCreated, onIdeas. */
    Idees: typeof RoutineIdeasCard;
    /** « Recevoir d'une application » (absente quand il n'y en a pas). Sans props. */
    Recevoir: ComponentType;
    /** Les deux plis du bas : les outils de l'agent, et « Comment ça tourne ». Sans props. */
    Replis: ComponentType;
    InlineError: typeof InlineError;
    SkeletonRows: typeof SkeletonRows;
    Reveal: typeof Reveal;
  };
};
