/*
 * La page Programmer : la fiche d'un agent (son état, ses organes, ses messageries, les autres agents).
 * Ce fichier ne contient que des TYPES. Une vue reçoit ce modèle en propriétés et ne lit ni n'écrit rien elle-même : tout ce qui
 * vient de l'agent arrive par ici, tout geste de la personne repart par ici. Sur chaque champ, la ligne « @origine » dit d'où il vient chez l'agent.
 * Ce que l'agent ne fournit pas n'est pas dans le modèle (null, tableau vide ou champ absent) : la vue le cache, elle n'invente rien.
 */
import type { Agents, Assistant, ClientBotPointer, DossierBlock, ExportControl, InlineError, Organ, PlaceRows, RemovedAgent, RoutePlace, Skeleton, WorriesBlock, useExport } from "./externes";
import type { ComponentType, RefObject } from "react";

/** Un autre agent de la même installation (sa fiche s'ouvre d'un toucher). */
export type AutreAgent = {
  id: string;
  nom: string;
  /** Son image (photo du profil ou de son bot) ; absent : son initiale. */
  visage?: string;
  /** Son rôle quand le profil en a un, puis ce qui demande de l'attention (arrêté, n'a pas pu démarrer…) ; "" quand l'agent n'en dit rien. */
  ligne: string;
  /** Son état en un mot (« en marche », « éteint »…) quand l'agent le dit et qu'il n'est pas déjà dans `ligne`. */
  etat: { mot: string; actif: boolean } | null;
  principal: boolean;
  /** « Passer à Mila, rôle, état » : le nom lu par les lecteurs d'écran. */
  nomAccessible: string;
};

export type ModeleProgrammer = {
  /**
   * L'identifiant du profil montré (« default » pour l'agent principal).
   * @origine profils (la liste des agents) : le profil de cet agent
   */
  id: string;
  /**
   * Son nom (celui de l'agent, sinon le titre de son texte de personnalité, sinon celui du profil).
   * @origine profils (la liste des agents) : le profil de cet agent
   */
  nom: string;
  /** @origine profils (la liste des agents) : le profil de cet agent */
  principal: boolean;
  /**
   * Son profil tel que la liste des agents le donne (pour les pièces qui le changent) ; absent tant que la liste n'est pas lue.
   * @origine profils (la liste des agents) : le profil de cet agent
   */
  agentCourant: Assistant | undefined;
  /**
   * La photo de son bot Telegram, s'il en a une.
   * @origine messageries (là où l'agent répond) : la photo et l'état de son bot Telegram
   */
  photoBot?: string;
  /**
   * Son image : la photo de son profil ou celle de son bot ; absent : son initiale.
   * @origine profils (la liste des agents) : le profil de cet agent
   */
  visage?: string;
  /**
   * Le temps (600 ms au plus) où le disque reste vide en attendant la photo du bot.
   * @origine profils (la liste des agents) : le profil de cet agent
   */
  visageAttente: boolean;
  /**
   * Son état en un mot, quand l'agent le dit ; `actif` : il répond.
   * @origine état de l'agent : en marche, éteint ou en panne
   */
  etat: { mot: string; actif: boolean } | null;
  /**
   * Son rôle tel que le profil le décrit (mots simples) ; "" quand le profil n'en a pas : la vue ne dessine rien.
   * @origine profils (la liste des agents) : le profil de cet agent
   */
  role: string;
  /**
   * Le nom et le rôle se changent ici (sinon la page ne promet pas que chaque ligne s'ouvre).
   * @origine profils (la liste des agents) : le profil de cet agent
   */
  identiteModifiable: boolean;
  /**
   * « ‹ Accueil » ou « ‹ Nom de l'agent » : le mot du retour, et le geste.
   * @origine écran (l'état de la page, rien chez l'agent) : le mot du retour
   */
  retourLabel: string;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  retour(): void;
  /**
   * L'espace de l'agent (ses dossiers) : absent chez un client hébergé. `label` : « Espace de l'agent ».
   * @origine Coffre : l'espace de l'agent (ses dossiers), absent chez un client hébergé
   */
  espace: { label: string; ouvrir(): void } | null;
  /**
   * La liste des agents n'a pas pu être lue (et rien de gardé) : à dire, avec « Réessayer ».
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  erreur: { error: unknown; occupe: boolean; retenter(): void } | null;
  /**
   * Relit la liste des agents (après un changement fait par une pièce).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  actualiser(): void;
  /** @origine config (les réglages de l'agent) : son texte de personnalité */
  personnalite: {
    /** Le texte de personnalité a été lu (l'agent a répondu). */
    lue: boolean;
    chargement: boolean;
    /** Le ton choisi, tel que l'agent le garde ; "" sinon. */
    ton: string;
    /** Les premiers mots de son texte de personnalité (sans guillemets) ; "" sinon. */
    citation: string;
    /** Lue, mais sans texte : l'agent garde son comportement par défaut. */
    sansTexte: boolean;
    ouvrir(): void;
  };
  /**
   * Ce qui ne va pas (vide quand tout va bien), puis ses organes dans l'ordre fixe : cerveau, mémoire, personnalité, savoir-faire, connexions, routines.
   * @origine Coffre : ce qui ne va pas, relevé sur les réglages, les routines, les connexions et les clés
   */
  soucis: Parameters<typeof WorriesBlock>[0]["worries"];
  /** @origine les six organes de l'agent : cerveau, mémoire, personnalité, savoir-faire, connexions, routines */
  organes: Organ[];
  /**
   * Le fournisseur du modèle en service, pour son logo (BrandLogo) ; absent quand l'agent ne le dit pas.
   * @origine config (les réglages de l'agent) : le fournisseur et le modèle en service
   */
  cerveau: { logo: string; fournisseur: string; modele: string } | null;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  ouvrirReglages(): void;
  /**
   * Son bot Telegram : son nom, s'il répond en ce moment (null : inconnu), et l'ouverture dans Telegram.
   * @origine messageries (là où l'agent répond) : la photo et l'état de son bot Telegram
   */
  bot: { nom: string; connecte: boolean | null; ouvrir(): void } | null;
  /**
   * Chez un client hébergé qui n'a pas encore son bot : la carte qui le crée ou le relie.
   * @origine messageries (là où l'agent répond) : la photo et l'état de son bot Telegram
   */
  carteBot: { ouvrir(): void } | null;
  /**
   * Les autres conversations où il répond (hors son bot).
   * @origine messageries (là où l'agent répond) : les conversations où il répond
   */
  lieux: RoutePlace[];
  /** @origine messageries (là où l'agent répond) : la photo et l'état de son bot Telegram */
  feuilleBot: boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  fermerFeuilleBot(): void;
  /**
   * Les autres agents (les premiers, ou tous), et de quoi voir les suivants ou en créer un.
   * @origine profils (la liste des agents) : les autres agents de la même installation
   */
  autres: AutreAgent[];
  /**
   * Le nombre total d'autres agents.
   * @origine profils (la liste des agents) : les autres agents de la même installation
   */
  autresTotal: number;
  /**
   * « 3 agents » : le nombre, écrit en mots.
   * @origine profils (la liste des agents) : les autres agents de la même installation
   */
  autresCompte: string;
  /** @origine profils (la liste des agents) : les autres agents de la même installation */
  tousLesAutres: boolean;
  /**
   * « Voir les 3 autres agents » ou « Voir moins » ; null quand il n'y en a pas plus que ceux montrés.
   * @origine profils (la liste des agents) : les autres agents de la même installation
   */
  libelleVoirAutres: string | null;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  basculerAutres(): void;
  /**
   * À poser sur le conteneur des autres agents (les lignes qui arrivent entrent en fondu).
   * @origine à poser dans la vue (rien à lire)
   */
  autresRef: RefObject<HTMLElement | null>;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  ouvrirAutre(id: string): void;
  /**
   * « Nouvel agent » : absent quand l'agent ne l'offre pas.
   * @origine profils (la liste des agents) : les autres agents de la même installation
   */
  nouvelAgent: (() => void) | null;
  /**
   * L'export de l'agent principal (absent pour un autre agent et sous le bot d'un client).
   * @origine Coffre : l'export de l'agent principal
   */
  exportation: { flow: ReturnType<typeof useExport>; nom: string } | null;
  /**
   * Éteindre ou rallumer cet agent (jamais l'agent principal) quand l'agent le permet.
   * @origine profils (la liste des agents) : éteindre ou rallumer cet agent
   */
  extinction: { action: "stop" | "start"; agent: Pick<Assistant, "id" | "name">; occupe: boolean; enCours: boolean; autresAgents: boolean;
    lancer(route: "l'arrêt et la reprise d'un agent" | "l'arrêt et la reprise d'un agent"): Promise<boolean> } | null;
  /**
   * Supprimer cet agent (jamais le principal) et restaurer ceux de moins de 30 jours.
   * @origine profils (la liste des agents) : supprimer cet agent, et les agents supprimés depuis moins de 30 jours
   */
  retrait: { agent: Pick<Assistant, "id" | "name">; routines: number | undefined; paused: number | undefined; bot: string | null; topics: RoutePlace[];
    mates: Pick<Assistant, "id" | "name">[]; apres(): void } | null;
  /** @origine profils (la liste des agents) : supprimer cet agent, et les agents supprimés depuis moins de 30 jours */
  retires: { items: RemovedAgent[]; apres(): void } | null;
  /**
   * Chez un client hébergé (agent principal) : « Supprimer ou recommencer ».
   * @origine compte (la personne : son Telegram, son abonnement) : chez un client hébergé
   */
  danger: boolean;
  /**
   * Sous le bot d'un client : l'adresse de l'entrée du hub, pour exporter depuis son bot ; null sinon.
   * @origine messageries (là où l'agent répond) : la photo et l'état de son bot Telegram
   */
  pointeurBot: string | null;
  /**
   * Les pièces déjà faites (elles lisent et écrivent elles-mêmes) : une vue les place, ne les réécrit pas.
   * @origine pièces déjà faites par Coffre : on les place, on ne les réécrit pas
   */
  pieces: {
    /** « Son image », puis « Son nom » et « Son rôle » : trois lignes qui s'ouvrent dans leurs feuilles. À placer dans un groupe de lignes. */
    Identite: ComponentType<{ modele: ModeleProgrammer }>;
    /** Ce qui ne va pas (props : worries). */
    Soucis: typeof WorriesBlock;
    /** Son dossier (props : agent). */
    Dossier: typeof DossierBlock;
    /** Les conversations où il répond (props : places). */
    Lieux: typeof PlaceRows;
    /** Le déroulé d'un export en cours (props : flow, label). */
    ExportEnCours: typeof ExportControl;
    /** Le bouton « Éteindre » (fenêtre + maintien) ou « Rallumer ». À placer une fois si `extinction`. */
    Extinction: ComponentType<{ modele: ModeleProgrammer }>;
    /** « Supprimer cet agent » et « Agents supprimés » (chacun absent quand l'agent ne l'offre pas). À placer une fois. */
    Retrait: ComponentType<{ modele: ModeleProgrammer }>;
    /** « Supprimer ou recommencer » du client hébergé. À placer si `danger`. */
    Hebergee: ComponentType;
    /** Le renvoi vers le bot du hub (props : entry). À placer si `pointeurBot`. */
    PointeurBot: typeof ClientBotPointer;
    /** La feuille de la carte du bot (hub). À placer une fois. */
    FeuilleBot: ComponentType<{ modele: ModeleProgrammer }>;
    InlineError: typeof InlineError;
    Skeleton: typeof Skeleton;
  };
};
