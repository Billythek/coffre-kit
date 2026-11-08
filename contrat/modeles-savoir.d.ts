/*
 * La page Savoir-faire : ce que l'agent sait faire, ce qui a servi, ce qu'il range.
 * Ce fichier ne contient que des TYPES. Une vue reçoit ce modèle en propriétés et ne lit ni n'écrit rien elle-même : tout ce qui
 * vient de l'agent arrive par ici, tout geste de la personne repart par ici. Sur chaque champ, la ligne « @origine » dit d'où il vient chez l'agent.
 * Ce que l'agent ne fournit pas n'est pas dans le modèle (null, tableau vide ou champ absent) : la vue le cache, elle n'invente rien.
 */
import type { ActionResult, IconType, Lang, Reveal, SkeletonRows, TodayRow } from "./externes";
import type { ComponentType } from "react";

/** Les trois onglets de la page. */
export type FiltreSavoir = "used" | "fresh" | "archived";
/** Où une ligne est posée : dit comment sa phrase est écrite (« Souvent · hier », « Pas servi depuis 32 jours », « Rangé le 12 oct. »…). */
export type EtagereSavoir = "used" | "sleeping" | "fresh" | "archived";

/** Une ligne telle que la page la montre : les faits de l'agent sur un savoir-faire. */
export type LigneSavoir = {
  id: string;
  /** Le nom lisible (français si la personne l'a demandé). */
  name: string;
  /** Le nom technique de l'agent (sert à trouver le logo du service). */
  tech: string;
  category?: string | null;
  /** Combien de fois il a servi depuis le début (le compteur de l'agent). Absent : l'agent n'en donne pas. */
  uses?: number;
  /** Date ISO de son dernier service, de son arrivée ou de son rangement selon l'étagère ; null si l'agent ne la donne pas. */
  at?: string | null;
  paused?: boolean;
  arrival?: "added" | "learned" | "improved";
  provenance?: string;
  shipped?: boolean;
  search?: string;
  archivedAt?: string;
  archivedBy?: string;
  /** L'agent sait le remettre en service. */
  restorable?: boolean;
};

/** L'image d'un savoir-faire : la vraie marque du service, sinon l'icône choisie, sinon le dessin de sa famille. */
export type VisuelSavoir =
  | { type: "marque"; id: string }
  | { type: "icone"; corps: string }
  | { type: "famille"; id: string; icone: IconType };

/** Les lignes d'une famille (les dossiers de l'agent, regroupés en quelques familles). */
export type FamilleSavoir = { id: string; nom: string; icone: IconType; cle: string; lignes: LigneSavoir[] };

/** Le geste « Annuler » qui suit un rangement (un seul ou tous les endormis). */
export type AnnulationSavoir = {
  /** « « X » rangé, rien n'est supprimé. » ou « Rangement… ». */
  texte: string;
  /** L'agent a répondu : « Annuler » est là. */
  confirme: boolean;
  enCours: boolean;
  annuler(): void;
  /** Le mot posé sur le bouton (data-outcome) : comment l'écriture s'est passée. */
  sortie?: string;
};

export type ModeleSavoir = {
  /**
   * Le nom de l'agent (ou « ton agent »), la langue à l'écran.
   * @origine profils (la liste des agents)
   */
  agent: string;
  /** @origine écran (l'état de la page, rien chez l'agent) */
  lang: Lang;
  /**
   * Le nom de l'agent est un vrai nom (pas le mot par défaut « ton agent »), et sa photo si le profil en a une.
   * @origine profils (la liste des agents)
   */
  nomme: boolean;
  /** @origine profils (la liste des agents) */
  photo?: string;
  /**
   * La liste est lue : sinon la page montre son titre et cinq lignes calmes.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  pret: boolean;

  /**
   * « Certains noms sont en anglais » : proposé seulement sur un écran français, tant que la traduction est éteinte.
   * @origine config (les réglages de l'agent) : la traduction des noms, éteinte ou allumée
   */
  traductionProposee: boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  traduire(): void;

  /**
   * Combien sont allumés (null : l'agent ne dit pas l'état de chacun) sur le total des savoir-faire en service ou en pause.
   * @origine savoir-faire (ceux que l'agent a) : combien sont en service, combien au total
   */
  enService: number | null;
  /** @origine savoir-faire (ceux que l'agent a) : combien sont en service, combien au total */
  total: number;
  /**
   * Les « Utilisés » : ceux qui servent et ont servi dans le mois (même nombre que la puce).
   * @origine savoir-faire (ceux que l'agent a) : combien sont en service, combien au total
   */
  servis: number;
  /**
   * La progression de l'agent : prête (le chiffre mène à sa page), en lecture, ou absente (serveur plus ancien).
   * @origine savoir-faire (ceux que l'agent a) : la progression que l'agent tient depuis le début
   */
  progression: "prete" | "attente" | "absente";
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  ouvrirProgression(): void;

  /** @origine écran (l'état de la page, rien chez l'agent) */
  filtre: FiltreSavoir;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  choisirFiltre(filtre: FiltreSavoir): void;
  /** @origine savoir-faire (ceux que l'agent a) : la progression que l'agent tient depuis le début */
  comptes: { utilises: number; nouveaux: number; ranges: number };

  /**
   * Les cinq qui servent le plus ; les autres en service ou en pause ; les endormis du conservateur ; les nouveaux ; les rangés.
   * @origine savoir-faire (ceux que l'agent a) : classés par usage (les plus servis, les autres, les endormis, les nouveaux, les rangés)
   */
  top: LigneSavoir[];
  /** @origine savoir-faire (ceux que l'agent a) : classés par usage (les plus servis, les autres, les endormis, les nouveaux, les rangés) */
  autres: LigneSavoir[];
  /** @origine savoir-faire (ceux que l'agent a) : classés par usage (les plus servis, les autres, les endormis, les nouveaux, les rangés) */
  endormis: LigneSavoir[];
  /** @origine savoir-faire (ceux que l'agent a) : classés par usage (les plus servis, les autres, les endormis, les nouveaux, les rangés) */
  nouveaux: LigneSavoir[];
  /** @origine savoir-faire (ceux que l'agent a) : classés par usage (les plus servis, les autres, les endormis, les nouveaux, les rangés) */
  ranges: LigneSavoir[];
  /**
   * « Voir les N autres » : déplié ou non, et le geste qui le bascule.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  autresOuverts: boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  basculerAutres(): void;
  /**
   * Nombre de lignes montrées dans une liste à plat (nouveaux), et « Voir N de plus ».
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  visibles: number;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  voirPlus(): void;

  /**
   * Les nouveautés pas encore vues (3 au plus) avec leur total ; null s'il n'y en a pas.
   * @origine savoir-faire (ceux que l'agent a) : la progression que l'agent tient depuis le début
   */
  nouveautes: { lignes: LigneSavoir[]; total: number; arrivees: boolean; titre: string; voirTout(): void } | null;

  /**
   * Les endormis de l'agent (son conservateur) : combien l'agent sait ranger, depuis combien de temps, et le rangement.
   * @origine savoir-faire (ceux que l'agent a) : l'entretien que l'agent fait de lui-même
   */
  rangement: {
    /** L'agent est en train de lire sa progression : la bande des endormis garde sa place. */
    attente: boolean;
    /** La dernière fois, la bande était là : sa place est gardée pendant la lecture. */
    etaitLa: boolean;
    /** « 30 jours », « 4 semaines » ou « longtemps » : le délai du conservateur de l'agent, dit tel qu'il le donne. */
    delai: string;
    /** Combien l'agent sait ranger d'un coup. */
    rangeables: number;
    /** « Ranger les N » : en cours, et comment la dernière écriture s'est passée. */
    enCours: boolean;
    resultat?: ActionResult;
    ranger(): void;
    /** Un seul : le bouton de la ligne, sa lecture en cours, son résultat. */
    peutRanger(ligne: LigneSavoir): boolean;
    rangerUne(ligne: LigneSavoir): void;
    peutRetablir(ligne: LigneSavoir): boolean;
    retablir(ligne: LigneSavoir): void;
    /** L'id de la ligne dont l'écriture est en cours (« » sinon). */
    occupe: string;
    resultatDe(id: string): ActionResult | undefined;
    annulation: AnnulationSavoir | null;
  };

  /**
   * Les phrases d'une ligne : sa ligne dite pour l'étagère où elle est, sa lecture à voix haute, son visuel, sa famille.
   * @origine Coffre (phrase écrite à partir des faits de la ligne)
   */
  ligne(ligne: LigneSavoir, etagere: EtagereSavoir): string;
  /** @origine Coffre (phrase écrite à partir des faits de la ligne) */
  dit(ligne: LigneSavoir, ...morceaux: (string | false | undefined)[]): string;
  /** @origine Coffre (phrase écrite à partir des faits de la ligne) */
  visuel(ligne: LigneSavoir): VisuelSavoir;
  /** @origine Coffre (phrase écrite à partir des faits de la ligne) */
  nomFamille(ligne: LigneSavoir): string;
  /**
   * Les lignes regroupées par famille. `etagere` donne la clé de pliage (la famille ouverte est gardée pour le retour d'une fiche).
   * @origine Coffre (phrase écrite à partir des faits de la ligne)
   */
  familles(lignes: LigneSavoir[], etagere: EtagereSavoir): FamilleSavoir[];
  /** @origine Coffre (phrase écrite à partir des faits de la ligne) */
  ouverte(cle: string): boolean;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  plier(cle: string, ouvert: boolean): void;
  /**
   * Une ligne minimale pour un id (les lignes d'« Aujourd'hui » : nom, dossier, pause).
   * @origine Coffre (phrase écrite à partir des faits de la ligne)
   */
  minimale(id: string, nom: string): LigneSavoir;
  /** @origine Coffre (phrase écrite à partir des faits de la ligne) */
  nom(id: string, repli: string): string;
  /**
   * Le nom lisible d'un savoir-faire à partir de son nom technique (les propositions de l'agent).
   * @origine Coffre (phrase écrite à partir des faits de la ligne)
   */
  nomTech(nom: string): string;

  /**
   * Ce qu'il faut à la recherche : tous les savoir-faire en service ou en pause, les quatre servis le plus récemment, et pour chacun son groupe et sa mention.
   * @origine savoir-faire (ceux que l'agent a) : tous, pour la recherche
   */
  recherche: { tous: LigneSavoir[]; recents: LigneSavoir[]; groupe(ligne: LigneSavoir): string; meta(ligne: LigneSavoir): string };

  /**
   * Ouvrir la fiche d'un savoir-faire ; ouvrir le Catalogue (Ajouter).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  ouvrir(id: string): void;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  ouvrirBoutique(): void;

  /**
   * Les pièces déjà faites, les mêmes dans tous les thèmes. Elles lisent et écrivent elles-mêmes : on les place, on ne les réécrit pas.
   *  - `Propositions` : ce que l'agent propose et attend un oui ;
   *  - `Aujourdhui` : ce qui a servi aujourd'hui (la vue donne sa ligne, `Row`) ;
   *  - `Recherche` : la recherche qui se déplie (la vue la pose dans sa rangée, `surDeplier` dit quand elle s'ouvre) ;
   *  - `Soin` : l'entretien de l'agent et les mises à jour des savoir-faire venus d'ailleurs.
   * @origine pièces déjà faites par Coffre : on les place, on ne les réécrit pas
   */
  pieces: {
    Propositions: ComponentType<{ modele: ModeleSavoir }>;
    Aujourdhui: ComponentType<{ modele: ModeleSavoir; Row: TodayRow }>;
    Recherche: ComponentType<{ modele: ModeleSavoir; surDeplier: (ouvert: boolean) => void }>;
    Soin: ComponentType<Record<string, never>>;
    /** Les lignes calmes de la première lecture, et ce qui les remplace (un fondu de 140 ms si on les a vues). */
    SkeletonRows: typeof SkeletonRows;
    Reveal: typeof Reveal;
  };
};
