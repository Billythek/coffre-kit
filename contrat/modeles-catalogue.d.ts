/*
 * La page Catalogue : ce qu'on peut ajouter à l'agent (savoir-faire, connexions, modèles de routine).
 * Ce fichier ne contient que des TYPES. Une vue reçoit ce modèle en propriétés et ne lit ni n'écrit rien elle-même : tout ce qui
 * vient de l'agent arrive par ici, tout geste de la personne repart par ici. Sur chaque champ, la ligne « @origine » dit d'où il vient chez l'agent.
 * Ce que l'agent ne fournit pas n'est pas dans le modèle (null, tableau vide ou champ absent) : la vue le cache, elle n'invente rien.
 */
import type { IconType, InlineError, Reveal, SkeletonRows } from "./externes";
import type { ComponentType, ReactNode, RefObject } from "react";

/** Ce qu'un ajout est en train de faire : retenu 5 secondes (« Annuler »), envoyé, refusé. */
export type PhaseAjout = "retenu" | "envoi" | "echec";

/** Ce que quelque chose te demandera avant d'être ajouté, dit en un mot ; `rien` = il marche tout de suite. */
export type DemandeCatalogue = { sorte: "programme" | "cle" | "scripts" | "controle" | "danger" | "accord" | "rien" | "ailleurs"; mot: string };

/** Une ligne du catalogue : un savoir-faire, une connexion ou un modèle de routine. */
export type EntreeCatalogue =
  | {
      sorte: "savoir"; id: string; nom: string; ligne: string; Icone: IconType;
      /** Ce que le savoir-faire demandera (null : rien à dire, la ligne montre sa phrase). */
      demande: DemandeCatalogue | null;
      /** Un « + » ajoute d'un toucher (rien n'est demandé) ; sinon un chevron ouvre la fiche. */
      plus: boolean;
      phase?: PhaseAjout; echec?: string;
      /** Déjà chez l'agent (ou ajouté à l'instant). */
      installe: boolean;
      /** Ouvre la fiche. */
      ouvrir(): void;
      /** Retient l'ajout 5 secondes (« Annuler »), puis l'envoie à l'agent. */
      ajouter(): void;
    }
  | {
      sorte: "service"; id: string; nom: string;
      /** L'identifiant du vrai logo (BrandLogo). */
      logoId: string;
      demande: DemandeCatalogue | null;
      installe: boolean;
      ouvrir(): void;
    }
  | {
      sorte: "routine"; id: string; nom: string;
      /** L'icône de la routine, et ce qu'elle dit sous son titre (quand, ce qu'elle apporte). */
      logo: ReactNode; meta: ReactNode;
      /** Demande d'abord une connexion : la ligne ne s'ouvre pas. */
      attend: boolean;
      ouvrir: (() => void) | null;
    };

/** Une porte de l'accueil (un « quartier ») et ce qu'elle contient. */
export type PorteCatalogue = {
  id: string; nom: string; ligne: string;
  /** Ce qu'il reste à essayer dedans ; 0 = « Tout y est ». */
  total: number;
  /** Jusqu'à quatre vrais logos de services (jamais d'initiale inventée). */
  logos: { id: string; logoId: string; nom: string }[];
  /** « Il le fait tout de suite » : les savoir-faire qui ne demandent rien. */
  tout: Extract<EntreeCatalogue, { sorte: "savoir" }>[];
  /** « Il s'en occupe tout seul » : les routines prêtes. */
  routines: Extract<EntreeCatalogue, { sorte: "routine" }>[];
  /** « Avec ton accord » : les connexions, puis les savoir-faire qui demandent quelque chose. */
  services: Extract<EntreeCatalogue, { sorte: "service" }>[];
  accord: Extract<EntreeCatalogue, { sorte: "savoir" }>[];
};

/** Une étagère du bas de l'accueil (« Tout le catalogue ») ou la ligne « Déjà chez toi ». */
export type EtagereCatalogue = {
  id: string; nom: string; ligne: string; compte: string; Icone: IconType;
  ouvrir(): void;
};

/** La réponse à une envie tapée : les portes qu'elle évoque, puis ce qui y répond. */
export type ResultatsCatalogue = {
  portes: { id: string; nom: string; ligne: string; total: number; ouvrir(): void }[];
  trouves: EntreeCatalogue[];
  nombre: number;
};

export type ModeleCatalogue = {
  /** @origine à poser dans la vue (rien à lire) */
  page: RefObject<HTMLDivElement | null>;
  /**
   * Le nom de l'agent.
   * @origine profils (la liste des agents)
   */
  agent: string;
  /**
   * L'accueil du Catalogue (la recherche par envie, les portes, les étagères) est la page montrée.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  accueil: boolean;
  /**
   * Une page de détail est ouverte par-dessus (savoir-faire, connexion, extension, agent).
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  detail: boolean;
  /**
   * Un chemin de retour existe (une page de détail, une étagère, ou la page d'où l'on vient).
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  peutRevenir: boolean;
  /**
   * Le nom de la page où le retour mène.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  retourVers: string;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  retour(): void;
  /**
   * Le titre de la page montrée et sa phrase.
   * @origine Coffre (calculé à partir de ce qui est déjà lu)
   */
  titre: string;
  /**
   * Le titre est écrit sous le retour (faux sur la page d'un quartier, qui a le sien).
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  titreVisible: boolean;
  /** @origine Coffre (calculé à partir de ce qui est déjà lu) */
  phrase: string | null;
  /**
   * Une liste (savoir-faire, connexions) est montrée : un bouton de recherche existe.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  recherchable: boolean;
  /** @origine écran (l'état de la page, rien chez l'agent) */
  cherche: boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  basculerRecherche(): void;
  /**
   * La recherche par envie de l'accueil.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  envie: string;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  setEnvie(text: string): void;
  /**
   * Rien n'est encore lu (ni les savoir-faire ni les connexions).
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  chargement: boolean;
  /**
   * Ni les savoir-faire ni les connexions n'ont pu être lus.
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  erreur: unknown;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  relire(): void;
  /** @origine écran (état de la lecture : en cours, échec, ancienneté) */
  relit: boolean;
  /**
   * Le nombre de lignes du squelette.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  rangs: number;
  /** @origine catalogue de Coffre, croisé avec le savoir-faire, les connexions et les routines que l'agent a déjà */
  portes: PorteCatalogue[];
  /**
   * Les étagères du bas de l'accueil ; l'ajout par adresse est l'étagère `adresse`.
   * @origine catalogue de Coffre, croisé avec le savoir-faire, les connexions et les routines que l'agent a déjà
   */
  etageres: EtagereCatalogue[];
  /**
   * « Déjà chez toi » (null : rien d'ajouté).
   * @origine catalogue de Coffre, croisé avec le savoir-faire, les connexions et les routines que l'agent a déjà
   */
  chezToi: EtagereCatalogue | null;
  /**
   * La réponse à l'envie tapée (null : rien de tapé).
   * @origine catalogue de Coffre, croisé avec le savoir-faire, les connexions et les routines que l'agent a déjà
   */
  resultats: ResultatsCatalogue | null;
  /**
   * Ouvre l'ajout d'un service par son adresse (feuille).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  ouvrirAdresse(): void;
  /**
   * Les pièces déjà faites, les mêmes pour tous les thèmes. Elles lisent et écrivent elles-mêmes : on les place, on ne les réécrit pas.
   * Feuilles : les feuilles (savoir-faire à ajouter, connexion à brancher, modèle de routine, ajout par adresse).
   * Detail : la page de détail ouverte. Rayon : tout ce qui n'est pas l'accueil (étagères, listes, quartier).
   * @origine pièces déjà faites par Coffre : on les place, on ne les réécrit pas
   */
  pieces: {
    Feuilles: ComponentType<{ modele: ModeleCatalogue }>;
    Detail: ComponentType<{ modele: ModeleCatalogue }>;
    Rayon: ComponentType<{ modele: ModeleCatalogue }>;
    InlineError: typeof InlineError;
    SkeletonRows: typeof SkeletonRows;
    Reveal: typeof Reveal;
  };
  /**
   * Réservé à la page actuelle : l'état et les gestes qu'elle seule utilise. Une vue de thème n'y touche pas.
   * @origine réservé à la page actuelle de Coffre : une vue de thème n'y touche pas
   */
  actuel: ActuelCatalogue;
};

/** Le détail propre à la page actuelle. */
export type ActuelCatalogue = unknown;
