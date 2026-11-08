/*
 * Le point d'entrée « premier écran » du thème : l'Accueil (et, le jour où un thème le voudra, l'en-tête). Coffre le demande dès l'ouverture,
 * avant tout le reste : il ne doit donc importer QUE l'Accueil et son dossier (jamais une autre page). C'est le nom exact du fichier,
 * `style-<nom>.ts`, qui le fait trouver : rien à ajouter ailleurs.
 */
import type { Vues } from "../modeles";
import { AccueilExemple } from "./accueil";

export const VUES: Vues = { accueil: AccueilExemple };
