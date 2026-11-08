/*
 * La page Réglages : les réglages de l'agent, en tuiles.
 * Ce fichier ne contient que des TYPES. Une vue reçoit ce modèle en propriétés et ne lit ni n'écrit rien elle-même : tout ce qui
 * vient de l'agent arrive par ici, tout geste de la personne repart par ici. Sur chaque champ, la ligne « @origine » dit d'où il vient chez l'agent.
 * Ce que l'agent ne fournit pas n'est pas dans le modèle (null, tableau vide ou champ absent) : la vue le cache, elle n'invente rien.
 */
import type { InlineError, Lang, PathName, Skeleton, useDraftLeave, useDraftScope } from "./externes";
import type { ComponentType, ReactNode } from "react";

/** Les tuiles de la page : chacune a sa place fixe et sa seule maison. */
export type IdTuile = "hooks" | "autonomy" | "limits" | "brain" | "connections" | "memory" | "privacy" | "chat" | "advanced" | "usage" | "install" | "backup";

/** Ce qui se dit à droite d'une tuile : des points (niveau), un nombre, ou une barre de remplissage (en %). */
export type MiniReglages =
  | { type: "points"; total: number; allumes: number }
  | { type: "nombre"; n: number }
  | { type: "barre"; pct: number };

/** Une tuile lue : ses mots, sa mini-valeur, et le geste qui l'ouvre. */
export type TuileReglages = {
  id: IdTuile;
  icone: PathName;
  titre: string;
  /** La phrase dessous (peut être vide). */
  sous: string;
  mini?: MiniReglages;
  /** Un réglage à elle, posé à côté (le choix du modèle sur « Son cerveau ») : à placer tel quel, il écrit lui-même. */
  aside?: ReactNode;
  /** La tuile ouvre une page à elle (Sa mémoire, Ses connexions) au lieu d'une feuille. */
  vaAilleurs: boolean;
  /** Une écriture est en cours ; et si elle vient de cette tuile, comment elle s'est passée. */
  occupe: boolean;
  enCours: boolean;
  issue?: string;
  toucher(): void;
};
/** La place gardée d'une tuile dont la lecture n'est pas revenue (pas de saut de page à son arrivée). */
export type TuileAttendue = { id: IdTuile; attente: true };

export type GroupeReglages = { id: string; titre: string; tuiles: (TuileReglages | TuileAttendue)[] };

/** La feuille qui s'ouvre sous une tuile : son contenu, ses brouillons, sa preuve. Elle est dessinée par la pièce `Feuille`. */
export type FeuilleReglages = {
  ouverte: boolean;
  titre: string;
  corps(): ReactNode;
  brouillons: ReturnType<typeof useDraftScope>;
  sortie: ReturnType<typeof useDraftLeave>;
  occupe: boolean;
  erreur: string;
  fermer(): void;
  appliquer(): void;
  arret: { ouvert: boolean; fermer(): void; confirmer(): void };
};

export type ModeleReglages = {
  /**
   * Le nom de l'agent (ou « ton agent »), la langue à l'écran.
   * @origine profils (la liste des agents)
   */
  agent: string;
  /** @origine écran (l'état de la page, rien chez l'agent) */
  lang: Lang;
  /**
   * Le titre de la page et le chemin de retour.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  titre: string;
  /** @origine écran (l'état de la page, rien chez l'agent) */
  retour: { label: string; ouvrir(): void };
  /**
   * Ce que la carte de l'agent dit de lui : le modèle qui répond (null : on ne sait pas) et la mémoire utilisée en % (null : l'agent ne la mesure pas).
   * @origine config (les réglages de l'agent) : le modèle qui répond, et la part de mémoire utilisée
   */
  etat: { modele: string | null; memoire: number | null; memoirePleine: boolean };
  /** @origine écran (l'état de la page, rien chez l'agent) */
  recherche: { valeur: string; changer(valeur: string): void; active: boolean };
  /**
   * Les groupes dans leur ordre, déjà filtrés par la recherche (elle ne filtre que ce qui est affiché).
   * @origine config (les réglages de l'agent) : les tuiles de réglages, par groupe (autonomie, limites, cerveau, connexions, mémoire, vie privée, conversation, avancé, usage, installation, sauvegarde)
   */
  groupes: GroupeReglages[];
  /**
   * La recherche n'a rien trouvé.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  aucune: boolean;
  /**
   * Une lecture n'a pas pu se faire : son erreur, et le geste pour la refaire ; `garde` : l'âge de la plus vieille réponse gardée à l'écran.
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  echec: { erreur: unknown; occupe: boolean; reessayer(): void } | null;
  /** @origine écran (état de la lecture : en cours, échec, ancienneté) */
  garde: number | null;
  /**
   * L'écriture en cours (« Enregistrement… ») ou son erreur.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  statut: { texte: string; erreur: boolean } | null;
  /** @origine écran (l'état de la page, rien chez l'agent) */
  feuille: FeuilleReglages;
  /**
   * Les pièces déjà faites, les mêmes dans tous les thèmes. Elles lisent et écrivent elles-mêmes : on les place, on ne les réécrit pas.
   * @origine pièces déjà faites par Coffre : on les place, on ne les réécrit pas
   */
  pieces: {
    /** La feuille d'une tuile (contenu, brouillons, « Appliquer », fenêtre « tout lancer seul »). À placer une fois. */
    Feuille: ComponentType<{ modele: ModeleReglages }>;
    /** « Je n'ai pas pu relire. » avec son geste. */
    InlineError: typeof InlineError;
    /** L'âge de ce qui reste affiché quand une relecture a échoué. */
    Age: ComponentType<{ at: number }>;
    Skeleton: typeof Skeleton;
  };
};
