/*
 * La page Personnalité : qui est l'agent, son style, sa façon de répondre.
 * Ce fichier ne contient que des TYPES. Une vue reçoit ce modèle en propriétés et ne lit ni n'écrit rien elle-même : tout ce qui
 * vient de l'agent arrive par ici, tout geste de la personne repart par ici. Sur chaque champ, la ligne « @origine » dit d'où il vient chez l'agent.
 * Ce que l'agent ne fournit pas n'est pas dans le modèle (null, tableau vide ou champ absent) : la vue le cache, elle n'invente rien.
 */
import type { InlineError, PersonalityExtras, Reveal, Skeleton, SkeletonRows } from "./externes";
import type { ComponentType, RefObject } from "react";

/** Un style de l'agent à choisir : son identifiant ("" = « Aucun »), son nom dans la langue de l'écran, une phrase qui le dit. */
export type ChoixStyle = { id: string; label: string; dit: string };
/** la longueur des réponses : la valeur de l'agent ("" = celle du modèle). */
export type LongueurId = "" | "low" | "medium" | "high";
export type ChoixLongueur = { id: LongueurId; label: string; dit: string };
export type ChoixLangue = { value: string; label: string; disabled?: boolean };
/** Une partie de son texte de fond (« Qui il est »), avec ses premiers mots. */
export type PartieAme = { titre: string; apercu: string };

export type ModelePersonnalite = {
  /**
   * À poser sur l'élément le plus haut : le squelette retient le nombre de lignes de la dernière lecture.
   * @origine à poser dans la vue (rien à lire)
   */
  racine: RefObject<HTMLElement | null>;

  /* --- La lecture ---------------------------------------------------------------------------------------------------- */
  /**
   * Rien de gardé et pas encore de réponse : un squelette de `attente` lignes.
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  chargement: boolean;
  /** @origine écran (état de la lecture : en cours, échec, ancienneté) */
  attente: number;
  /**
   * La lecture a échoué (null sinon). `garde` : une ancienne copie est encore montrée.
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  erreur: unknown;
  /** @origine écran (état de la lecture : en cours, échec, ancienneté) */
  garde: boolean;
  /**
   * Une relecture est en cours.
   * @origine écran (état de la lecture : en cours, échec, ancienneté)
   */
  relit: boolean;
  /**
   * Relit la page (force la relecture).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  relire(): void;

  /* --- Qui il est ---------------------------------------------------------------------------------------------------- */
  /**
   * Le nom de l'agent dans son texte (« # Nom »), null s'il n'en donne pas.
   * @origine config : son texte de personnalité (qui il est), titre et première phrase
   */
  nom: string | null;
  /**
   * Sa première phrase ("" si son texte n'en donne pas).
   * @origine config : son texte de personnalité (qui il est), titre et première phrase
   */
  role: string;
  /**
   * Sa photo (la sienne, sinon celle de son bot), undefined s'il n'en a pas.
   * @origine profils (la liste des agents) : sa photo, sinon celle de son bot
   */
  photo: string | undefined;
  /**
   * Sa dernière conversation avec la personne (Telegram), null si l'agent ne la donne pas.
   * @origine sessions (les conversations de l'agent) : sa dernière conversation avec la personne
   */
  conversation: { live: boolean; text: string } | null;
  /**
   * Sa personnalité est le même fichier qu'un autre agent : elle se lit et se modifie depuis celui-là.
   * @origine config : son texte de personnalité (qui il est), titre et première phrase
   */
  partage: boolean;
  /**
   * Le fichier existe mais ne se lit pas.
   * @origine config : son texte de personnalité (qui il est), titre et première phrase
   */
  illisible: boolean;
  /**
   * Un texte est écrit.
   * @origine config : son texte de personnalité (qui il est), titre et première phrase
   */
  aTexte: boolean;
  /**
   * « Modifier » (ou « Écrire ») est possible ici.
   * @origine config : son texte de personnalité (qui il est), titre et première phrase
   */
  peutModifier: boolean;
  /**
   * Les parties de son texte, dans l'ordre où il les écrit.
   * @origine config : son texte de personnalité (qui il est), titre et première phrase
   */
  parties: PartieAme[];
  /**
   * Ouvre son texte en entier (là où il se lit, se modifie et s'enregistre, avec la preuve).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  ouvrirAme(): void;

  /* --- Son style ----------------------------------------------------------------------------------------------------- */
  /**
   * Les styles de l'agent et ceux de la personne, null quand l'agent n'en offre pas.
   * @origine config : le style choisi et les styles offerts
   */
  style: null | {
    /** Celui qui est choisi ("" = aucun). */
    courant: string;
    choix: ChoixStyle[];
    /** Le nom d'un style choisi que l'agent ne connaît pas (sans effet), null sinon. */
    inconnu: string | null;
  };
  /**
   * Une phrase d'exemple écrite par nous dans la manière de ce style (jamais ses vrais mots : à marquer « Exemple »).
   * @origine Coffre (phrase écrite à partir des faits de la ligne) (jamais ses vrais mots : à marquer « Exemple »)
   */
  phrase(id: string): string;
  /**
   * Choisit un style (ou "" pour aucun) : demande la preuve, écrit, relit. Sans effet pendant une écriture.
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  choisirStyle(id: string): void;

  /* --- Sa façon de répondre ------------------------------------------------------------------------------------------ */
  /**
   * La longueur des réponses, null quand l'agent ne l'envoie pas.
   * @origine config : la longueur de ses réponses
   */
  longueur: null | { valeur: LongueurId; applique: boolean; choix: ChoixLongueur[] };
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  choisirLongueur(id: LongueurId): void;
  /**
   * La langue de ses réponses (une ligne de son texte), null là où le texte ne se lit pas ou ne s'écrit pas.
   * @origine config : la langue de ses réponses
   */
  langue: null | { valeur: string; options: ChoixLangue[]; ecriteAMain: boolean };
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  choisirLangue(valeur: string): void;
  /**
   * La consigne manuelle, null s'il n'y en a pas.
   * @origine config : la consigne écrite à la main
   */
  consigne: null | { active: boolean; texte: string; ouverte: boolean; coupeeParStyle: boolean };
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  ouvrirConsigne(): void;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  fermerConsigne(): void;
  /**
   * Retire la consigne manuelle (la feuille se ferme, puis la preuve est demandée).
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  retirerConsigne(): void;

  /* --- Ce que fait la page -------------------------------------------------------------------------------------------- */
  /**
   * Une écriture est en cours (preuve demandée ou enregistrement).
   * @origine écran (l'état de la page, rien chez l'agent) : une écriture est en cours
   */
  occupe: boolean;
  /**
   * Ce qui se passe ou ce qui a échoué, dit une fois ; `ou` : sous « Son style » ou en bas de page.
   * @origine écran (l'état de la page, rien chez l'agent) : ce qui se passe ou ce qui a échoué, dit une fois
   */
  etat: null | { texte: string; erreur: boolean; ou: "style" | "fin" };

  /* --- Ce que l'agent ajoute (les pièces le lisent et l'écrivent elles-mêmes) ------------------------------------------ */
  /** @origine config : voix, langue des messages système, contexte lu avant de répondre */
  extras: PersonalityExtras | null;
  /**
   * Sa langue de messages système existe.
   * @origine config : voix, langue des messages système, contexte lu avant de répondre
   */
  aLangueSysteme: boolean;
  /**
   * Sa voix (réponse à un vocal, voix, écoute) existe.
   * @origine config : voix, langue des messages système, contexte lu avant de répondre
   */
  aVoix: boolean;
  /**
   * Ce qu'il lit vraiment avant de répondre : l'agent a pu le compter.
   * @origine config : voix, langue des messages système, contexte lu avant de répondre
   */
  aContexte: boolean;
  /**
   * À appeler quand une pièce vient d'écrire : relit la page.
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  apresEcriture(): void;

  /** @origine pièces déjà faites par Coffre : on les place, on ne les réécrit pas */
  pieces: {
    /** La feuille de la consigne manuelle (et sa preuve). À placer une fois. */
    Feuilles: ComponentType<{ modele: ModelePersonnalite }>;
    /** Sa langue de messages système (une ligne qui se règle d'elle-même). */
    LangueSysteme: ComponentType<{ modele: ModelePersonnalite }>;
    /** Sa voix : réponse à un vocal, voix, modèle d'écoute. */
    Voix: ComponentType<{ modele: ModelePersonnalite }>;
    /** Ce qu'il lit vraiment avant de répondre. */
    Contexte: ComponentType<{ modele: ModelePersonnalite }>;
    InlineError: typeof InlineError;
    Reveal: typeof Reveal;
    Skeleton: typeof Skeleton;
    SkeletonRows: typeof SkeletonRows;
  };
};
