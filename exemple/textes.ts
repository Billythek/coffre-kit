/*
 * Tous les mots que le thème écrit lui-même. RIEN d'autre n'est écrit en dur dans les vues : un texte vient d'ici ou du modèle.
 *
 * Pourquoi : Coffre est en français et en anglais, et un traducteur doit pouvoir tout relire au même endroit. Chaque texte a donc une version
 * « fr », une version « en » et une « note » (où il apparaît, ce qu'il veut dire). Quand ton thème est accepté, on déplace ce fichier dans
 * notre dossier de textes tel quel ; rien à réécrire.
 *
 * Règles de Coffre pour les mots (elles valent pour toi aussi) :
 *  - on tutoie ; on dit « ton agent » ou son nom, jamais un nom technique ;
 *  - « Nouvelle… » pour créer, « Ajouter » pour prendre dans le Catalogue ; « Éteindre / Rallumer » un agent ; « Supprimer » ce qui s'efface ;
 *  - une phrase au plus sous un titre ; pas de jargon.
 * Les `{blancs}` sont remplis par la page et restent les mêmes dans chaque langue.
 */
import { useSyncExternalStore } from "react";

type Texte = { fr: string; en: string; note: string };

export const TEXTES = {
  // Mots communs
  accueil: { fr: "Accueil", en: "Home", note: "Back button of every page: the first page of Coffre." },
  travail: { fr: "Travail", en: "Work", note: "Title of the task board page, and the heading of the work block on Home." },
  lecture: { fr: "Lecture en cours…", en: "Reading…", note: "Spoken name of the calm placeholder shown while a page is being read." },
  fermer: { fr: "Fermer", en: "Close", note: "Closes a menu or a search." },
  annuler: { fr: "Annuler", en: "Undo", note: "Undoes the last gesture; lasts a few seconds." },
  reessayer: { fr: "Réessayer", en: "Try again", note: "After a failed reading." },
  modifier: { fr: "Modifier", en: "Edit", note: "Opens a text to edit." },
  ecrire: { fr: "Écrire", en: "Write", note: "Same button when there is no text yet." },
  fait: { fr: "Fait", en: "Done", note: "A small state word on a line that is finished." },
  non: { fr: "Non", en: "No", note: "Value of a row that is off." },
  toi: { fr: "Toi", en: "You", note: "Fallback name of the person when Telegram gives none." },
  tonAgent: { fr: "ton agent", en: "your agent", note: "Said when the agent has no name of its own." },
  exemple: { fr: "Exemple", en: "Example", note: "Small label before a sentence we wrote to illustrate a style: never the agent's real words." },
  // Accueil
  luMaintenant: { fr: "Lu à l'instant", en: "Read just now", note: "Age of the copy shown on Home." },
  luMinutes: { fr: "Lu il y a {n} min", en: "Read {n} min ago", note: "Age of the copy shown on Home, in minutes." },
  luHeures: { fr: "Lu il y a {n} h", en: "Read {n} h ago", note: "Age of the copy shown on Home, in hours." },
  horsLigne: { fr: "Hors ligne", en: "Offline", note: "Start of the age line when the phone has no network." },
  misAJour: { fr: "Mise à jour…", en: "Updating…", note: "Shown on that button while Home is read again." },
  personneNeTravaille: { fr: "Personne ne travaille en ce moment.", en: "Nobody is working right now.", note: "Home, work block, when no agent is running anything." },
  toutVoir: { fr: "Tout voir", en: "See all", note: "Home, work block: opens the task board." },
  // Travail
  nouvelleTache: { fr: "Nouvelle tâche", en: "New task", note: "The one filled button of the Work page." },
  reglagesTableau: { fr: "Réglages du tableau", en: "Board settings", note: "Opens the settings of the board shown." },
  tacheDisparue: { fr: "Cette tâche n'existe plus.", en: "That task no longer exists.", note: "When a link opens a task that was removed." },
  seulementUn: { fr: "Le travail de {nom} seulement.", en: "{nom}'s work only.", note: "Shown after 'See his work'." },
  toutMontrer: { fr: "Tout montrer", en: "Show everything", note: "Goes back to every agent's work." },
  videAvecNouvelle: { fr: "Rien à faire pour l'instant. Crée une tâche pour commencer.", en: "Nothing to do yet. Create a task to begin.", note: "Empty board, when tasks can be created here." },
  videTelegram: { fr: "Rien à faire pour l'instant. Demande à ton agent dans Telegram.", en: "Nothing to do yet. Ask your agent in Telegram.", note: "Empty board, when tasks are created in Telegram." },
  ouvrirLaConversation: { fr: "Ouvrir la conversation", en: "Open the chat", note: "Opens the agent's chat in Telegram." },
  // Catalogue
  chercher: { fr: "Chercher", en: "Search", note: "Opens the search of a list." },
  tuVeux: { fr: "Qu'est-ce que tu veux que ton agent fasse ?", en: "What do you want your agent to do?", note: "Label of the search by wish on the Catalogue." },
  tuVeuxExemple: { fr: "Par exemple : trier mes mails", en: "For example: sort my emails", note: "Placeholder of that search." },
  trouve: { fr: "{n} trouvés", en: "{n} found", note: "Heading of the answer to a wish." },
  aEssayer: { fr: "{n} à essayer", en: "{n} to try", note: "How many things are left to try in a door of the Catalogue." },
  toutEstLa: { fr: "Tout y est", en: "All there", note: "A door of the Catalogue with nothing left to try." },
  ilLeFaitTout: { fr: "Il le fait tout de suite", en: "Done at once", note: "Group: skills that ask for nothing." },
  ilSenOccupe: { fr: "Il s'en occupe tout seul", en: "Runs by itself", note: "Group: ready-made routines." },
  avecTonAccord: { fr: "Avec ton accord", en: "With your approval", note: "Group: connections and skills that ask for something." },
  toutLeCatalogue: { fr: "Tout le catalogue", en: "The whole catalogue", note: "Heading of the shelves at the bottom of the Catalogue." },
  ajouterParAdresse: { fr: "Ajouter par son adresse", en: "Add by its address", note: "Opens the sheet to add a service from its address." },
  ajouter: { fr: "Ajouter", en: "Add", note: "Takes a skill from the Catalogue; also the one filled button of the Skills page." },
  ajoute: { fr: "Ajouté", en: "Added", note: "State word on a line already added." },
  // Savoir-faire
  savoirFaire: { fr: "Savoir-faire", en: "Skills", note: "Title of the skills page." },
  savoirEnService: { fr: "{n} en service sur {total}", en: "{n} on, out of {total}", note: "One sentence under the title of the skills page." },
  savoirTotal: { fr: "{total} savoir-faire", en: "{total} skills", note: "Same sentence when the agent does not say which ones are on." },
  nomsEnAnglais: { fr: "Certains noms sont en anglais.", en: "Some names are in English.", note: "Offer to translate the names, French screens only." },
  traduire: { fr: "Traduire", en: "Translate", note: "Turns the translation of the names on." },
  utilises: { fr: "Utilisés", en: "Used", note: "Tab: skills that served this month." },
  nouveaux: { fr: "Nouveaux", en: "New", note: "Tab: skills that arrived lately." },
  ranges: { fr: "Rangés", en: "Put away", note: "Tab: skills the agent put away." },
  enPause: { fr: "En pause", en: "Paused", note: "State word of a skill or a routine that is paused." },
  voirLesAutres: { fr: "Voir les {n} autres", en: "See the other {n}", note: "Unfolds the rest of the list." },
  voirMoins: { fr: "Voir moins", en: "See fewer", note: "Folds the list back." },
  voirPlus: { fr: "Voir {n} de plus", en: "See {n} more", note: "Shows more lines of a long list." },
  endormis: { fr: "Endormis", en: "Asleep", note: "Group: skills that have not served for a long time." },
  rangerLes: { fr: "Ranger les {n}", en: "Put the {n} away", note: "Puts the sleeping skills away; nothing is deleted." },
  // Personnalité
  personnalite: { fr: "Personnalité", en: "Personality", note: "Title of the personality page, and name of one of the agent's parts." },
  illisible: { fr: "Son texte existe, mais je n'arrive pas à le lire.", en: "Its text exists, but I cannot read it.", note: "When the personality text cannot be read." },
  partage: { fr: "Cette personnalité est partagée avec un autre agent.", en: "This personality is shared with another agent.", note: "It is read and edited from the other agent." },
  quiIlEst: { fr: "Qui il est", en: "Who it is", note: "Group: the parts of the agent's text." },
  sonStyle: { fr: "Son style", en: "Its style", note: "Group: the style the agent writes in." },
  styleInconnu: { fr: "« {nom} » n'existe pas chez ton agent : ce choix n'a aucun effet.", en: "'{nom}' does not exist for your agent: this choice has no effect.", note: "A chosen style the agent does not know." },
  saFacon: { fr: "Sa façon de répondre", en: "How it answers", note: "Group: length and language of the answers." },
  longueur: { fr: "Longueur des réponses", en: "Length of answers", note: "Spoken name of the choice of length." },
  langueReponses: { fr: "Langue des réponses", en: "Language of answers", note: "Label of the language choice." },
  consigne: { fr: "Consigne écrite à la main", en: "Hand-written instruction", note: "Row that opens the manual instruction." },
  consigneInactive: { fr: "Éteinte", en: "Off", note: "Under that row when the instruction is not used." },
  // Routines
  routines: { fr: "Routines", en: "Routines", note: "Title of the routines page." },
  nouvelleRoutine: { fr: "Nouvelle routine", en: "New routine", note: "The one filled button of the Routines page." },
  toutes: { fr: "Toutes", en: "All", note: "Filter: every routine." },
  actives: { fr: "Actives", en: "Running", note: "Filter: routines that run." },
  active: { fr: "Active", en: "Running", note: "State word of a routine that runs." },
  echec: { fr: "Échec", en: "Failed", note: "State word of a routine whose last run failed." },
  terminee: { fr: "Terminée", en: "Finished", note: "State word of a routine that will not run again." },
  enRetard: { fr: "En retard", en: "Late", note: "State word of a routine whose time has passed." },
  aRevoir: { fr: "{n} à revoir", en: "{n} to check", note: "One line above the list when routines failed." },
  mettreEnPause: { fr: "Mettre en pause", en: "Pause", note: "Pauses one routine." },
  relancer: { fr: "Relancer", en: "Resume", note: "Starts a paused routine again." },
  aujourdhui: { fr: "Aujourd'hui", en: "Today", note: "Group: today's runs of the routines." },
  prochain: { fr: "Prochain passage", en: "Next run", note: "Under a line of today's runs." },
  plusTard: { fr: "Plus tard", en: "Later", note: "Under a line of today's runs that is not next." },
  // Programmer
  nouvelAgent: { fr: "Nouvel agent", en: "New agent", note: "Creates an agent; the one filled button of the agent's page and of the agents menu." },
  pasDeTexte: { fr: "Pas de texte de personnalité : il garde son comportement par défaut.", en: "No personality text: it keeps its default behaviour.", note: "Shown when the personality was read and is empty." },
  commentIlFonctionne: { fr: "Comment il fonctionne", en: "How it works", note: "Group: the agent's six parts." },
  tousLesReglages: { fr: "Tous ses réglages", en: "All its settings", note: "Opens the settings page of the agent." },
  cerveau: { fr: "Il répond avec {modele}.", en: "It answers with {modele}.", note: "The model that answers, under its parts." },
  ouIlRepond: { fr: "Où il répond", en: "Where it answers", note: "Group: messaging apps and conversations." },
  repond: { fr: "Répond", en: "Answering", note: "State word: the agent answers right now." },
  necoute: { fr: "N'écoute pas", en: "Not listening", note: "State word: the agent does not answer right now." },
  creerLeBot: { fr: "Nouvelle messagerie", en: "New messaging app", note: "Opens the card that creates or links the messaging app (Telegram, for now)." },
  exporter: { fr: "Export de {nom}", en: "Export of {nom}", note: "Name of the export in progress." },
  // Réglages
  jeTourneSur: { fr: "Je tourne sur {modele}.", en: "I run on {modele}.", note: "The agent's card: the model that answers." },
  memoirePleine: { fr: "Ma mémoire est pleine.", en: "My memory is full.", note: "The agent's card." },
  memoireUtilisee: { fr: "Mémoire utilisée à {n} %", en: "Memory {n}% used", note: "Share of memory used." },
  niveau: { fr: "{n} sur {total}", en: "{n} of {total}", note: "Level of a setting: how many dots are lit out of how many." },
  chercherUnReglage: { fr: "Chercher un réglage", en: "Search a setting", note: "Label of the search field on the settings page." },
  relireHint: { fr: "Je n'ai pas pu relire. Ce qui est affiché peut dater.", en: "I could not read again. What you see may be old.", note: "Under the error when settings could not be read." },
  aucunReglage: { fr: "Aucun réglage ne correspond.", en: "No setting matches.", note: "Empty answer of the search." },
  // Agents
  tesAgents: { fr: "Tes agents", en: "Your agents", note: "Title of the agents menu." },
  ici: { fr: "Ici", en: "Here", note: "State word: the agent shown right now." },
  rallumer: { fr: "Rallumer", en: "Turn on again", note: "Turns an agent that was off on again." },
  eteindre: { fr: "Éteindre", en: "Turn off", note: "Turns an agent off; a window with a hold asks first." },
  pause: { fr: "Pause", en: "Pause", note: "Pauses an agent." },
  reprendre: { fr: "Reprendre", en: "Resume", note: "Resumes a paused agent." },
  fiche: { fr: "Sa fiche", en: "Its page", note: "Opens the agent's page." },
  agentReinitialise: { fr: "Un agent a été remis à zéro.", en: "An agent was reset.", note: "Note in the agents menu." },
  listeIllisible: { fr: "Je n'ai pas pu lire la liste.", en: "I could not read the list.", note: "Agents menu." },
  chercherUnAgent: { fr: "Chercher un agent", en: "Search an agent", note: "Label of the search field of the agents menu." },
  personne: { fr: "Aucun agent ne correspond.", en: "No agent matches.", note: "Empty answer of that search." },
  // Mon compte
  monCompte: { fr: "Mon compte", en: "My account", note: "Title of the account page." },
  effacementLe: { fr: "Ton compte sera effacé le {jour}.", en: "Your account will be erased on {jour}.", note: "A deletion was asked; the date is already written." },
  effacementEnCours: { fr: "Ton compte est en cours d'effacement.", en: "Your account is being erased.", note: "A deletion is under way." },
  recuperer: { fr: "Récupérer mon compte", en: "Recover my account", note: "Cancels the deletion before its date." },
  gererAbonnement: { fr: "Gérer l'abonnement", en: "Manage the plan", note: "Opens the plan page, after a proof." },
  mesInstallations: { fr: "Mes installations", en: "My installs", note: "Opens the list of installs, hosted clients only." },
  preferences: { fr: "Préférences", en: "Preferences", note: "Group of the account page." },
  langue: { fr: "Langue", en: "Language", note: "Choice of the language of Coffre's screens." },
  auto: { fr: "Auto", en: "Auto", note: "Language choice: follow Telegram." },
  descriptionsTraduites: { fr: "Descriptions traduites", en: "Translated descriptions", note: "Row: translation of the descriptions." },
  sur3: { fr: "{n} sur 3", en: "{n} of 3", note: "How many kinds of descriptions are translated." },
  appareils: { fr: "Appareils", en: "Devices", note: "Row: devices connected to the account." },
  premiersPas: { fr: "Premiers pas", en: "First steps", note: "Row that opens the guided tour again." },
  ecranAccueil: { fr: "Écran d'accueil", en: "Home screen", note: "Row: Coffre on the phone's home screen." },
  zoneDanger: { fr: "Supprimer mon compte", en: "Delete my account", note: "Folded block that holds the account deletion." },
} as const satisfies Record<string, Texte>;

export type CleDeTexte = keyof typeof TEXTES;
type Langue = "fr" | "en";

/** Coffre écrit la langue de l'écran sur <html lang> ; on la lit (et on la suit quand elle change). Rien d'autre n'est lu. */
function langueActuelle(): Langue {
  return (document.documentElement.lang || "fr").toLowerCase().startsWith("en") ? "en" : "fr";
}
function suivre(prevenir: () => void): () => void {
  const guetteur = new MutationObserver(prevenir);
  guetteur.observe(document.documentElement, { attributes: true, attributeFilter: ["lang"] });
  return () => guetteur.disconnect();
}

/** Remplit les {blancs} d'un texte. */
function remplir(texte: string, valeurs?: Record<string, string | number>): string {
  return valeurs ? texte.replace(/\{(\w+)\}/g, (blanc, nom: string) => (nom in valeurs ? String(valeurs[nom]) : blanc)) : texte;
}

/** `const { t } = useTextes(); t("accueil")` ou `t("luMinutes", { n: 3 })`. */
export function useTextes() {
  const lang = useSyncExternalStore(suivre, langueActuelle, (): Langue => "fr");
  const t = (cle: CleDeTexte, valeurs?: Record<string, string | number>): string => remplir(TEXTES[cle][lang], valeurs);
  return { t, lang };
}
