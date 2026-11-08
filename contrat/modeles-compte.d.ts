/*
 * La page Mon compte : seulement la personne (abonnement, préférences, suppression).
 * Ce fichier ne contient que des TYPES. Une vue reçoit ce modèle en propriétés et ne lit ni n'écrit rien elle-même : tout ce qui
 * vient de l'agent arrive par ici, tout geste de la personne repart par ici. Sur chaque champ, la ligne « @origine » dit d'où il vient chez l'agent.
 * Ce que l'agent ne fournit pas n'est pas dans le modèle (null, tableau vide ou champ absent) : la vue le cache, elle n'invente rien.
 */
import type { Lang, LangChoice } from "./externes";
import type { ComponentType } from "react";

/** Les feuilles que Mon compte ouvre : les descriptions traduites, les appareils, les installations. */
export type FeuilleCompte = "words" | "devices" | "installs";

/** Ta photo et ton nom, tels que Telegram les donne (rien d'autre). */
export type Moi = { nom: string; pseudo: string; photo: string };

/**
 * Ce que la vue de Mon compte reçoit. Elle DOIT : avoir un <h1> ; placer `<modele.pieces.Theme />` (la ligne « Thème » et sa feuille de
 * choix : on ne la réécrit pas) et `<modele.pieces.Feuilles modele={modele} />` une fois (les feuilles Appareils, Traduction,
 * Installations) ; placer `<modele.pieces.Suppression modele={modele} />` quand `suppressionDuCompte` n'est pas null (la confirmation de la
 * suppression, avec son maintien). Elle ne retire aucune action : abonnement, installations, langue, descriptions traduites, thème,
 * appareils, Premiers pas, écran d'accueil, suppression du compte, récupération du compte.
 */
export type ModeleCompte = {
  /** @origine écran (la langue de Coffre, gardée sur l'appareil et dans Telegram) */
  lang: Lang;
  /**
   * Ta photo et ton nom, tels que Telegram les donne ; null hors de Telegram.
   * @origine compte (la personne : son Telegram, son abonnement) : sa photo et son nom, tels que Telegram les donne
   */
  moi: Moi | null;
  /**
   * Le numéro de compte du hub, montré seulement à qui n'est pas client hébergé ; null sinon.
   * @origine compte (la personne : son Telegram, son abonnement) : le numéro de compte du hub (pas chez un client hébergé)
   */
  identite: string | null;
  /**
   * Le compte est actif, ou sa suppression est demandée (30 jours), ou il est effacé : l'accès ordinaire est alors fermé.
   * @origine compte (la personne : son Telegram, son abonnement) : actif, suppression demandée (30 jours) ou effacé
   */
  etat: "actif" | "suppression" | "efface";
  /**
   * Quand l'état n'est pas « actif » : la date d'effacement (déjà écrite), et le geste de récupération s'il existe.
   * @origine compte (la personne : son Telegram, son abonnement) : actif, suppression demandée (30 jours) ou effacé
   */
  fermeture: { le: string | null; recuperable: boolean; recuperer(): void } | null;
  /**
   * L'abonnement en une ligne (sans le nom du paiement) ; `gerer` ouvre la page de l'abonnement après la preuve, null si le hub ne peut pas.
   * @origine compte (la personne : son Telegram, son abonnement) : l'abonnement, en une ligne
   */
  abonnement: { texte: string; gerer: (() => void) | null };
  /**
   * « Mes installations » : seulement chez le hub.
   * @origine compte (la personne : son Telegram, son abonnement) : l'abonnement, en une ligne
   */
  installations: (() => void) | null;
  /**
   * La langue de Coffre : le choix (« auto » ou une langue), la langue vue, et les choix possibles. Un choix est appliqué à l'instant, « Annuler » 5 s.
   * @origine écran (la langue de Coffre, gardée sur l'appareil et dans Telegram)
   */
  langue: { choix: LangChoice; courante: Lang; options: { valeur: LangChoice; nom: string }[]; choisir(valeur: LangChoice): void };
  /**
   * Les descriptions traduites : combien de types sur 3 ; null en anglais (la ligne n'existe pas).
   * @origine compte (la personne : son Telegram, son abonnement) : les descriptions traduites (aucune en anglais)
   */
  traduites: number | null;
  /**
   * Les appareils connectés : leur nombre quand la liste est lue, null avant.
   * @origine compte (la personne : son Telegram, son abonnement) : les appareils connectés
   */
  appareils: number | null;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  ouvrirAppareils(): void;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  ouvrirTraduction(): void;
  /**
   * « Premiers pas » : rouvre la visite guidée.
   * @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent
   */
  premiersPas(): void;
  /**
   * Coffre sur l'écran d'accueil du téléphone : « absent » (on peut l'ajouter), « ajoute », ou « inconnu » (Telegram ne le permet pas : pas de ligne).
   * @origine écran (Coffre sur l'écran d'accueil du téléphone)
   */
  ecranAccueil: "absent" | "ajoute" | "inconnu";
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  ajouterEcranAccueil(): void;
  /**
   * La suppression du compte : seulement pour un agent que nous hébergeons ; null sinon.
   * @origine compte (la personne : son Telegram, son abonnement) : actif, suppression demandée (30 jours) ou effacé
   */
  suppressionDuCompte: { identite: string } | null;
  /**
   * La feuille ouverte (ou null) et sa fermeture.
   * @origine écran (l'état de la page, rien chez l'agent)
   */
  ouverte: FeuilleCompte | null;
  /** @origine geste de la personne : la vue l'appelle, Coffre fait le reste chez l'agent */
  fermer(): void;
  /** @origine pièces déjà faites par Coffre : on les place, on ne les réécrit pas */
  pieces: {
    /** La ligne « Thème » de Préférences et sa feuille de quatre vignettes. Sans props. */
    Theme: ComponentType;
    /** Les feuilles Appareils / Traduction / Installations. À placer une fois : `<Feuilles modele={modele} />`. */
    Feuilles: ComponentType<{ modele: ModeleCompte }>;
    /** La confirmation de suppression du compte (case, mot à recopier, maintien). Props : `modele`. */
    Suppression: ComponentType<{ modele: ModeleCompte }>;
  };
};
