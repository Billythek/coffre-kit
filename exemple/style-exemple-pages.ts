/*
 * Le point d'entrée « autres pages » du thème : les neuf pages qui ne sont pas l'Accueil. Coffre les demande à la première ouverture d'une
 * de ces pages, pas avant. Nom exact : `style-<nom>-pages.ts`.
 *
 * Une page que ton thème ne donne pas (une ligne retirée ici) garde la page classique de Coffre, avec les couleurs de ton thème : tu peux donc
 * livrer page après page. Mais un thème proposé à la communauté doit donner les dix (règle de Coffre : un thème complet).
 */
import type { Vues } from "../modeles";
import { AgentsExemple } from "./agents";
import { CatalogueExemple } from "./catalogue";
import { CompteExemple } from "./compte";
import { PersonnaliteExemple } from "./personnalite";
import { ProgrammerExemple } from "./programmer";
import { ReglagesExemple } from "./reglages";
import { RoutinesExemple } from "./routines";
import { SavoirExemple } from "./savoir";
import { TravailExemple } from "./travail";

export const VUES: Vues = {
  travail: TravailExemple,
  catalogue: CatalogueExemple,
  savoir: SavoirExemple,
  personnalite: PersonnaliteExemple,
  routines: RoutinesExemple,
  programmer: ProgrammerExemple,
  reglages: ReglagesExemple,
  agents: AgentsExemple,
  compte: CompteExemple,
};
