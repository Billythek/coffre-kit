/*
 * Les types dont les modèles ont besoin et qui vivent à l'intérieur de Coffre, recopiés tels quels, et les « pièces » (composants déjà
 * faits) décrites par leurs propriétés. Fichier généré par l'équipe Coffre à partir de Coffre (contrat 1.0) : ne pas le modifier, il est remplacé à chaque version du contrat.
 */
import type { CSSProperties, ComponentType, JSX, KeyboardEvent, ReactNode, Ref, RefObject, SVGProps } from "react";

export type AccountState = "active" | "paused" | "repair" | "credit";

/** One answer to an action: `id` changes with each answer (0 is none yet). */
export interface ActionResult { id: number; ok: boolean; label?: ReactNode; key?: string }

export type ActivityKind = "conversation" | "routine" | "task";

/**
 * The agents the agent knows (the list of agents), by profile id: the name and picture a task's assignee is shown with. When
 * the list cannot be read, never the raw id: « Ton agent » for the main profile, the profile's own label otherwise.
 */
export type Agents = (id: string | null) => { name: string; avatar: string };

/** Qui a vraiment répondu en dernier : ce que l'agent a noté ; `account` est null quand il ne l'a pas noté. */
export type Answered = { provider: string; providerName: string; model: string; at: string; account: string | null };

/** One assistant of the installation: its profile, and who it is when the server could read it. */
export type Assistant = { id: string; name: string; role: string; line: string; model: string; avatar: string; serving?: Serving; resetRetired?: true;
  /** When it last did something, natively (the list of agents → lastActivityAt: its sessions, its routines' runs, its Kanban runs). */
  lastActivityAt?: string;
  /** What that was: a conversation, a routine, a task of the Kanban. */
  lastActivityKind?: ActivityKind;
  /** Something of its own runs right now (a conversation that moved in the last two minutes, a routine's run, a claimed task). */
  working?: true;
  /** Its own pause. */
  onPause?: true;
  /** Its Telegram bot's @username, when Coffre knows it (its own file). */
  bot?: string;
  /** Its role was written by its model and not yet validated. */
  roleProposed?: true };

export type Availability = {
  state: "answers" | "relay" | "cannot";
  basis: "observed" | "predicted";
  /** `account` vaut "" quand le compte n'est pas connu (l'état vient de ce que l'agent a noté, sans le compte). */
  via: { provider: string; providerName: string; model: string; account: string; main: boolean } | null;
  returnAt: string | null;
  chain: ChainStep[];
  answered: Answered | null;
};

/**
 * Les objectifs que l'agent poursuit dans ses conversations (/goal), seulement ceux qui ont bougé dans la journée.
 * Pour l'arrêter, on passe par la conversation (comme /stop) : Coffre n'écrit pas ce que l'agent tient en mémoire.
 */
export declare const Background: ({ items, now, onTelegram }: { items: BackgroundItem[]; now: number; onTelegram: (() => void) | null; }) => JSX.Element | null;

/** « En fond » (lot 3): a goal the agent pursues in a conversation (/goal), moved in the last day. */
export type BackgroundItem = { kind: "goal"; text: string; at: string | null; turns: number; maxTurns: number | null };

export type Band = { mode: "days" | "passes"; dots: Dot[]; counts: Record<RunKind, number> };

type Block<T> = ({ status: "available" } & T) | { status: "unavailable" | "unknown" | "stale" };

/** A native board and its counts: open tasks, tasks in review, tasks blocked for a person. */
export type BoardCounts = MissionBoard & { open: number; review: number; humanBlock: number };

/**
 * The native boards in a pill that opens in place, as the agent picker of Accueil: each board
 * with what it holds (« 1 attend ton avis », « 1 en cours », « tout est fait »). Choosing one is a preference of this
 * device; nothing is written in the agent.
 */
export declare const BoardPicker: ({ boards, tasks, chosen, now, onChoose }: { boards: BoardCounts[]; tasks: TravailTask[]; chosen: BoardCounts; now: number; onChoose: (slug: string) => void; }) => JSX.Element;

export type ChainAccount = { name: string; state: AccountState; until: string | null; model: "not_in_plan" | "paused" | null; modelUntil: string | null; usable: boolean };

export type ChainStep = { provider: string; providerName: string; model: string; main: boolean; accounts: ChainAccount[]; known: boolean; usable: boolean; answered: boolean };

/** Opened from the client's own bot: the hub's main entry manages the agent, even once its bot is stopped. */
export declare const ClientBotPointer: ({ entry }: { entry: string; }) => JSX.Element;

/**
 * What waits for the owner's decision (blocked for a person by the agent), newest first, each as a decision sheet
 *; then the questions the agent asked in the conversation (native clarify), answered on Telegram.
 * A task in review waits in the board's « À relire » column. `answers`: the server takes the owner's answer
 * (missions/answer); without it, the card leads to the agent's conversation, where the owner answers.
 */
export declare const Decisions: ({ tasks, questions, agents, now, bot, answers, onOpen, onTelegram }: { tasks: TravailTask[]; questions?: LiveQuestion[]; agents: Agents; now: number; bot: string | null; answers: boolean; onOpen: OpenTask; onTelegram: () => void; }) => JSX.Element | null;

/** Whether the agent takes up work at all: `paused` (its ESTOP file), `stopped` (the connection does not run). */
export type Dispatch = "running" | "paused" | "stopped";

/** the agent takes up no work at all: said once, above the tasks, so that « Prête à démarrer » does not wait in silence. */
export declare const DispatchNote: ({ dispatch, estop }: { dispatch: Dispatch | undefined; estop?: Estop | null; }) => JSX.Element | null;

/** « Son dossier »: how much room it takes (from the disk space), what fills it, the server's disk; a quota only when the hub gives one. */
export declare const DossierBlock: ({ agent }: { agent: string; }) => JSX.Element | null;

export type Dot = { key: string; letter: string; at: number; state: RunKind | "none"; runs: { at: number; state: RunKind }[]; today: boolean };

/** Ce qui sera écrit, figé au moment d'appliquer : la feuille s'efface ensuite, et ses parties avec elle. */
export type DraftRun = { count: number; run: () => Promise<void> };

export type DraftScope = ReturnType<typeof useDraftScope>;

/**
 * Le brouillon avant la preuve.
 * Les petits gestes d'une feuille (monter, descendre, ajouter, retirer, cocher, choisir) ne s'écrivent pas un à un :
 * chacun s'ajoute au brouillon de sa partie (`useDraft`), rien n'est écrit. La feuille (`useDraftScope`) compte les
 * changements de toutes ses parties, les dit (« 3 changements pas encore appliqués ») et porte le seul bouton plein,
 * « Appliquer » : la feuille s'efface, une seule preuve est demandée, puis chaque partie
 * écrit son tour, une écriture par partie (la chaîne de secours en une fois : autonomy/chain). Quitter la feuille avec
 * un brouillon demande « Appliquer tes 3 changements ? » : Appliquer, ou Laisser tomber.
 * Ce qui n'a pas besoin de preuve (réversible avec « Annuler ») reste immédiat et n'entre pas ici.
 */
/** Une partie de la feuille qui a un brouillon : combien de changements, ce qui empêche d'appliquer, et comment écrire. */
type Entry = { count: number; problem: string; apply: () => Promise<unknown>; discard: () => void };

/** The Accueil card (lot 2): one line, one tap; absent when nothing is under way and nothing was made today. */
export declare const EspaceCard: ({ agent, onOpen }: { agent: string; onOpen: () => void; }) => JSX.Element | null;

/** the agent's own emergency stop: its reason and when it was set. */
export type Estop = { reason: string | null; engagedAt: string | null };

export declare const ExportControl: ({ flow, label }: { flow: ExportFlow; label?: string; }) => JSX.Element;

type ExportFlow = ReturnType<typeof useExport>;

/** Where the export is prepared: l'agent's own server or the hub for its hosted agent (farm/export). */
export type ExportPlace = "personal" | "hub";

type ExportState = { kind: "idle" } | { kind: "starting" } | { kind: "preparing"; id: string } | { kind: "used" }
  | { kind: "ready"; url: string; expiresAt: number; size: number } | { kind: "failed"; text: string };

export type FailureKind = "credits" | "key" | "rate" | "model" | "timeout" | "tool" | "messaging" | "unknown";

export type Filter = "all" | "active" | "paused";

export type HealthKind = "echec" | "envoi" | "retard" | "horaire" | "programme" | "dossier" | "cle" | "savoir" | "messagerie" | "autre";

/** `id` is opaque, sent back as it is to agent/approval; `command` is already masked by the server. */
export type HomeApprovals = { count: number; items: { id: string; command: string; reason: string | null; since: string | null; platform: string | null }[] };

export type HomeDigest = {
  observedAt: string | null;
  routines: Block<{ total: number; enabled: number; ranToday: number; next: (RoutineRef & { at: string }) | null; failing: (RoutineRef & { kind: "run" | "delivery"; streak: number; failure?: RoutineFailure })[]; failingCount: number }>;
  activity: Block<{ today: Window; week: Window }>;
  /** pendingWrites: what the agent could still apply (natively checked when pendingChecked); pendingStale: proposals it no
   *  longer can (B2, 18 Oct.); approvalEnabled: whether the agent asks for approval at all, null when unread. */
  memory: Block<{ agent: MemoryPart; user: MemoryPart; pendingWrites: number; pendingStale: number; approvalEnabled: boolean | null }>;
  // `learned`: savoir-faire the assistant wrote at the owner's request (the agent « learn »), apart from the curator's.
  skills: Block<{ changedCount: number; createdCount: number; changed: SkillChange[]; learnedCount: number; learned: SkillChange[] }>;
  platforms: { status: string; items: { name: string; state: string; attention: boolean }[] };
  model: { name: string | null; provider: string | null };
  // each one optional: absent from an older server, and then nothing new is shown (never « inconnu »).
  /** The connection's last stored snapshot (not a ping): state, when it was written, a retry under way, a restart awaited. */
  connexion?: HomeGateway;
  /** How the latest conversations ended, by opaque identifier; no content. */
  recentSessions?: HomeSessionOutcome[];
  /** Telegram messages held after a restart: `count` admissions over `conversations` sessions; `truncated` past 100. */
  pendingConversations?: { count: number; conversations: number; truncated: boolean; lost?: number };
  /** The main provider's local limits, as the list of models's providers[].limit. */
  providerLimit?: HomeProviderLimit;
  /** La seule réponse à « peut-il répondre ? », chaîne de secours comprise. */
  availability?: Availability;
  // Les 5 alertes de l'Accueil (CONTRAT-ALERTES-ACCUEIL.md, 31 oct.), lues par home-alertes.ts parseHomeAlerts.
  /** Commandes risquées qui attendent l'accord du propriétaire (natif : /approve, /deny). */
  approvals?: HomeApprovals;
  /** Ses derniers essais échouent d'une erreur que l'agent ne réessaie pas, sans réponse réussie depuis. */
  replyFailure?: HomeReplyFailure;
  /** Un seul fournisseur, aucun secours. */
  fallbackEmpty?: boolean;
  /** « Ce qui a raté » : une seule liste des erreurs que l'agent note lui-même, sur 7 jours, 20 au plus. */
  failures?: HomeFailure[];
  /** Ce que l'agent dit tourner à cet instant ; absent quand elle ne répond pas. */
  live?: { reachable: boolean; running: number; helpers?: number };
};

/** In place of the summary when nothing of it could be read: the reason, and Réessayer on the spot (D59). */
export declare const HomeDigestError: ({ error, busy, onRetry }: { error: unknown; busy: boolean; onRetry: () => void; }) => JSX.Element;

/** `word` : la clé de la phrase ; `gesture` : le geste qui existe déjà pour y remédier, absent sinon ;
 *  `count` : les échecs d'une même rafale ; `name` : celui d'une routine ou d'une messagerie, tel que l'agent le garde. */
export type HomeFailure = { at: string; kind: "answer" | "task" | "routine" | "messaging"; word: string; count: number; name?: string; id?: string;
  gesture?: "model" | "accounts" | "connections" | "work" | "routine" };

/** platformsDown: the messaging platforms the connection could not connect, by their readable name (absent from an older
 *  server); a « degraded » connection still runs the others. */
export type HomeGateway = { state: "starting" | "running" | "draining" | "degraded" | "startup_failed" | "stopped"; updatedAt: string | null; retryingSince: string | null; restartPending?: boolean;
  /** 31 oct. : « running » mais son battement a plus de 120 s, ou le canal de contrôle ne répond pas : elle ne répond plus. */
  silent?: boolean;
  platformsDown?: { id: string; name: string; state: "fatal" | "retrying" | "disconnected" | null; paused?: boolean; resumable?: boolean }[] };

/** `accountUntil`: with « partial » (one of its accounts blocked, another one not), when the blocked one comes back:
 *  the latest end among the observations still active (R87). */
export type HomeProviderLimit = { state: "reauth_required" | "out_of_plan" | "limited" | "partial" | "unknown"; until: string | null; accountUntil?: string | null };

export type HomeReplyFailure = { since: string | null; kind: "model_refused" | "auth" | "credit" | "other"; model: string | null; provider: string | null; failures: number };

export type HomeSessionOutcome = { id: string; status: "complete" | "interrupted" | "failed" | "unconfirmed" | "unknown" };

export declare const HomeStatus: ({ digest, agentName, onOpenConnexions }: { digest: HomeDigest; agentName: string | null; onOpenConnexions?: () => void; }) => JSX.Element | null;

/**
 * Coffre's interface icons, drawn by Hugeicons (free set, stroke rounded). They replace lucide:
 * each keeps the lucide name its callers already use, so a screen reads the same and only this file knows the drawing.
 * Same props as before: `size` (24), `strokeWidth` (2, lucide's default, so every line keeps its weight), `color`,
 * `className` (the svg also carries lucide's « lucide lucide-<name> » classes, which the button's CSS and the benches
 * read). No Pro icon: la personne doesn't buy Pro.
 */
export type IconProps = Omit<SVGProps<SVGSVGElement>, "ref"> & {
  size?: number | string;
  strokeWidth?: number | string;
  absoluteStrokeWidth?: boolean;
  ref?: Ref<SVGSVGElement>;
};

export type IconType = ComponentType<IconProps>;

/**
 * An error in place of the content, with its own retry. When older content is still shown, it says so.
 * No retry after the end of the session: the same refused proof would be sent again.
 */
export declare const InlineError: ({ error, onRetry, stale, busy, primary, hint, rows, rowHeight, place }: { error: unknown; onRetry?: () => unknown; stale?: boolean; busy?: boolean; primary?: boolean; hint?: string; rows?: number; rowHeight?: number; place?: number; }) => JSX.Element;

/**
 * The chosen board in four columns that slide sideways (scroll snap), on the board la personne chose on 24 Oct. (affectUI's
 * Task Board, a Pro block: its look only, rebuilt with Coffre's pieces): a column's head says its count, « À faire » has
 * its « + »; a search, the agents to filter by (the agent has no labels: its assignees are its only filter) and a compact
 * view; a card held and dragged goes aside or into the archive, with « Annuler ». A card shows only what the agent gives.
 */
export declare const KanbanBoard: ({ tasks, agents, now, onOpen, onAdd, canAct }: { tasks: TravailTask[]; agents: Agents; now: number; onOpen: OpenTask; onAdd?: () => void; canAct?: boolean; }) => JSX.Element;

/**
 * Coffre's languages. English is the base; French follows, with « tu » and the
 * words la personne validated.
 *
 * Every text of a page lives in one file of this folder, as { en, fr, note }: the note says where the text appears and
 * what it means, so that a translator never guesses.
 * A value may hold {name}-style blanks, filled by `fill`; both languages must hold the same blanks
 *. No import here: the test reads this file alone.
 */
export type Lang = "en" | "fr";

/** « auto »: Coffre follows the language of the person's Telegram. */
export type LangChoice = Lang | "auto";

/** The tasks under way, one card each: who works on what, for how long, its current step and how far it is. */
export declare const LiveNow: ({ tasks, agents, now, onOpen }: { tasks: TravailTask[]; agents: Agents; now: number; onOpen: OpenTask; }) => JSX.Element | null;

/**
 * A question the agent asked in the owner's Telegram conversation (the agent's native `clarify`), unanswered: `waiting` while
 * the agent still waits (until `expiresAt`), `expired` when it went on without an answer. the agent keeps a pending question in
 * its connection's memory: it is answered on Telegram only, its choices are shown here, never sent from here.
 */
export type LiveQuestion = { id: string; at: string; question: string; choices: string[]; multiSelect: boolean; state: "waiting" | "expired"; expiresAt: string | null };

export type MemoryPart = { chars: number; limit: number; entries: number; updatedAt: string | null; linked?: boolean; shared?: boolean };

/** The native board a task belongs to: its slug and the name the agent gives it. */
export type MissionBoard = { slug: string; name: string };

export type MissionEvent = { kind: string; at: string; reason: string | null };

/** answers: the server takes the owner's answers and new tasks (missions/answer, missions/create); false from an older one. */
export type MissionsList = { observedAt: string; dispatch: Dispatch; estop: Estop | null; truncated: boolean; answers: boolean; missions: MissionSummary[]; background: BackgroundItem[] };

/** `assignee`: only the work of one agent (the agents menu's « Voir son travail »), by its native Kanban assignee. */
export type MissionsTarget = { board?: string; id?: string; assignee?: string };

export type MissionSummary = {
  id: string;
  board: MissionBoard;
  /** Blocked for a person: native `block_kind` « needs_input » (« needs a human decision ») or none (« generic human blocker »). */
  humanBlock: boolean;
  title: string;
  /** The native status, as the agent keeps it (todo, ready, running, blocked, review, triage, done, archived…). */
  status: string;
  assignee: string | null;
  blockKind: string | null;
  lastEvent: MissionEvent | null;
  consecutiveFailures: number;
  lastFailure: string | null;
  lastHeartbeatAt: string | null;
  createdAt: string;
  updatedAt: string;
  deliverables: number;
  verified: number;
  /** The task's newest native event id: an answer names the state it was given on (missions/answer, 409 when it moved). */
  revision: number;
  /** the agent's priority (tasks.priority), only when it is not the usual 0 (« Normale »); absent from an older server. */
  priority?: number;
  /** Its sub-tasks (the agent's task_links, archived ones left out): how many are done of how many; only when it has some. */
  subtasks?: { done: number; total: number };
  /**
   * W12: in review only, who reads it again (the agent's review phase, kanban_db.request_review: its `reviewer` profile);
   * null: no agent named, it waits for the owner. Absent for another status or from an older server. Shown only.
   */
  reviewer?: string | null;
  /** When it began to run (the agent's started_at), for the timer of « En cours » (X09); absent when the agent has none. */
  startedAt?: string | null;
};

/**
 * « catalogue »: the Catalogue as a tab of the bar, in the place Connexions left. « connections » is
 * no longer a tab: it opens as a page of the agent's settings.
 */
export type ModuleId = "connections" | "knowledge" | "personality" | "routines" | "voice" | "catalogue";

export type OpenTask = (task: { board: string; id: string; file?: { path: string; title: string } }) => void;

export type Organ = { id: string; icon: "brain" | "memory" | "personality" | "knowledge" | "connections" | "routines"; name: string; sub?: string; state?: { word: string; tone: "success" | "warning" | "danger" }; bar?: { value: number; tone?: "warning" | "danger"; label: string }; open: () => void;
  /** The place of an organ whose read is on its way (programmer-15): its name and a pale bar, nothing to touch; the value fades in when the read answers. */ pending?: boolean };

export type PathName = keyof typeof PATHS;

/** The board's icons (24 × 24, stroke 1.8), for what the app's Glyph set has no drawing of. */
export declare const PATHS: { readonly assistant: "M7 4h10l4 8-4 8H7l-4-8zM8 10h8m-6 5h4M9 10v1m6-1v1"; readonly personality: "M6 6.5A9 9 0 0 1 20.5 13M18 17.5A9 9 0 0 1 3.5 11M6.5 3.5 6 6.5l3 .5m8.5 13.5.5-3-3-.5M9 10h.1M15 10h.1m-6.6 4c2.2 2 4.8 2 7 0"; readonly spark: "M12 3l1.8 4.6L18.5 9l-4.7 1.4L12 15l-1.8-4.6L5.5 9l4.7-1.4z"; readonly knowledge: "M5 5h9a3 3 0 0 1 3 3v11H8a3 3 0 0 1-3-3zM17 8h3v11h-3M8 9h5m-5 4h3m-6 3h12"; readonly routines: "M5 9a7.5 7.5 0 0 1 14-1M19 15a7.5 7.5 0 0 1-14 1M16 8h3V5M8 16H5v3m7-12v5l3 2"; readonly connections: "M7 4v5m-3 0h6v4a3 3 0 0 1-3 3v4M17 20v-5m-3 0h6v-4a3 3 0 0 0-3-3V4M10 12h4"; readonly settings: "M4 7h10M18 7h2M4 17h4M12 17h8M14 4v6M8 14v6"; readonly bot: "M21 4 3 11l6 2 2 6 3-4 5 4z"; readonly box: "M4 8l8-4 8 4v8l-8 4-8-4zM4 8l8 4 8-4M12 12v8"; readonly brain: "M9 4a3 3 0 0 0-3 3v1a3 3 0 0 0-2 5 3 3 0 0 0 2 5v0a3 3 0 0 0 6 0V4.5A2.5 2.5 0 0 0 9 4zM15 4a3 3 0 0 1 3 3v1a3 3 0 0 1 2 5 3 3 0 0 1-2 5 3 3 0 0 1-6 0"; readonly memory: "M6 4h12v16H6zM9 8h6M9 12h6M9 16h3"; readonly mic: "M9 5a3 3 0 0 1 6 0v6a3 3 0 0 1-6 0zM5 11a7 7 0 0 0 14 0M12 18v3"; readonly chat: "M4 5h16v12H9l-5 4zM8 9h8m-8 4h5"; readonly lock: "M6 10h12v10H6zM8 10V7a4 4 0 0 1 8 0v3m-4 4v2"; readonly code: "m8 6-5 6 5 6m8-12 5 6-5 6"; readonly add: "M12 5v14M5 12h14"; readonly edit: "m5 14 10-10 5 5-10 10-6 1zM12 7l5 5"; readonly gauge: "M4 17a8 8 0 1 1 16 0M12 17l4-5M6 17h1m10 0h1M12 9v1"; readonly image: "M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15.5 9h.1"; };

export type PersonalityExtras = {
  revision: string | null;
  style: { available: StyleEntry[]; current: string; editable: boolean } | null;
  language: Setting<string> | null;
  telegram: { show_reasoning?: Setting<boolean>; tool_progress?: Setting<string>; interim_assistant_messages?: Setting<boolean>; cleanup_progress?: Setting<boolean> } | null;
  voice: { provider?: Setting<string>; voice?: Setting<string>; stt_language?: Setting<string> } | null;
  context: { id: string; tokens: number }[] | null;
  /** the agent could not count every layer (on l'agent, a memory module such as de mémoire): no total is said then. */
  contextPartial: boolean;
};

/** An agent's places, one row each: its service's mark, the place in plain words, how it answers there. */
export declare const PlaceRows: ({ places }: { places: RoutePlace[]; }) => JSX.Element;

export declare const PourToi: ({ digest, onOpenModule }: { digest: HomeDigest | null; onOpenModule?: (id: ModuleId) => void; }) => JSX.Element | null;

/**
 * « Qui travaille sur quoi » on Accueil: for each of the agent's boards where an agent works or waits
 * for a person, the pile of those agents, said in words, and a touch opens Travail on that board. The Kanban's own data
 * (the task board, shared with the rest of the page); a board where nobody works or waits is not drawn, and nothing is
 * drawn at all while the Kanban is not read.
 */
export declare const ProjetsPresence: ({ empty, max }: { empty?: ReactNode; max?: number; }) => JSX.Element | null;

type Registry = { put: (id: string, entry: Entry | null) => void };

/** An agent removed less than 30 days ago: its copy, until when it is kept. */
export type RemovedAgent = { copy: string; id: string; name: string; until: number };

/** What takes the place of a skeleton: when a skeleton had been seen, it fades in over 140 ms (K19, grammar 2.12); otherwise it is simply there. */
export declare const Reveal: ({ children, className, style }: { children?: ReactNode; className?: string; style?: CSSProperties; }) => JSX.Element;

export type RouteKind = "dm" | "topic" | "rest" | "group" | "channel" | "server";

export type RoutePlace = {
  platform: RoutePlatform; kind: RouteKind;
  /** The profile that answers there. */
  agent: string;
  /** « rule »: a route names it; « default »: no route, so the main agent; « own_bot »: it is its own bot's. */
  how: "rule" | "default" | "own_bot";
  /** False when a route names an agent the connection does not run: nobody answers there. */
  served: boolean;
  /** The receiving bot's profile, when it is a dedicated bot; absent for the main bot. */
  bot?: string; botName?: string;
  group?: string; name?: string;
  people?: { all?: "group" | "everyone"; count?: number; roles?: boolean };
  link?: string; mine?: boolean; mention?: boolean; state?: string;
};

/**
 * Which agent answers where: the connection's own rules, read on the server.
 * The places carry names (a group, a topic, a Discord channel), never an identifier; who may write is a count. The
 * only addresses are Telegram's own links (t.me), opened as they are.
 */
export type RoutePlatform = "telegram" | "discord" | "sms";

export declare const RoutineCheckBand: ({ health, names, failing, late, storage, onOpenRoutine, paused }: { health: RoutineChecks | null | undefined; names: Map<string, string>; failing: string[]; late?: string[]; storage: { lowSpace?: boolean; directoryWritable?: boolean; } | undefined; onOpenRoutine: (id: string) => void; paused?: ReadonlySet<string>; }) => JSX.Element | null;

export type RoutineChecks = { scheduler: "running" | "stopped" | "unknown"; routines: { id: string; kinds: HealthKind[] }[] };

/** What the server says about a routine besides its name (personal_admin_worker.routine_facts). */
export type RoutineFacts = {
  mode: "script" | "agent"; deliver: string; watch: boolean;
  nextRunAt: string | null; lastRunAt: string | null; lastStatus: "ok" | "error" | null; failures: number;
  /** Every place the result goes, when the agent sends it to more than one (« telegram,discord »). */
  delivers?: string[];
  /** When the agent paused it (its own file paused_at): « En pause depuis le 12 oct. ». */
  pausedAt?: string;
  /** Paused past a run of its schedule: the agent's resume_job keeps that passed slot due, so resuming may run it at once (1.7). */
  resumeMayRunImmediately?: true;
  /** the agent can no longer compute its next run (state error): it will not start again by itself. */
  stalled?: boolean;
  /** Who works: a script alone, a script then the assistant, or the assistant (routines-14). */
  executionMode?: "script_only" | "script_then_agent" | "agent";
  /** The last run apart from its sending: it may have worked while its result was not delivered (routines-11). */
  lastExecutionStatus?: "ok" | "error" | "unknown";
  /** `queued` while the agent still sends the result (300 s at most), then `unconfirmed`. */
  lastDeliveryStatus?: "failed" | "unknown" | "queued" | "unconfirmed";
  /** the agent holds the routine because of a setting. */
  problem?: "blocked_config";
  /** What its last failure was, classed by the server; absent when it did not fail or the cause is not readable. */
  failure?: RoutineFailure;
  /** Its last runs, newest first (at most 14): what the card's ticks show. */
  recentRuns?: ("ok" | "error" | "undelivered" | "running")[];
  /** When each of those runs happened, in UTC and in the same order. */
  recentRunTimes?: string[];
  /** The model the agent pins for it, and the skills attached to it. */
  model?: string; skills?: string[];
};

export type RoutineFailure = { kind: FailureKind; provider: string | null; retryMinutes: number | null };

export type RoutineHealth = "failing" | "active" | "paused" | "done";

/**
 * The ideas card: on an empty page, the agent's ideas (five, then « Voir les N autres ») and what the agent proposes;
 * on a page with routines, only what the agent proposes (V4-1). Nothing when there is nothing to show.
 */
/** `onEmpty`: told once the ideas are read whether there is any to pick (the page words its lead after it; audit G3-07). */
export declare const RoutineIdeasCard: ({ empty, onCreated, onIdeas }: { empty: boolean; onCreated: () => void; onIdeas?: (any: boolean) => void; }) => JSX.Element | null;

/**
 * What a routine says about itself, in one place: its sentence, what it uses, where its result goes, when it passes next and how its last runs went. The
 * list's row and the fiche's top (RoutineSheet) both read this and draw it with RoutineLead, so
 * they cannot say a thing differently. Nothing here is guessed: a field the agent does not give is absent, not invented.
 */
export type RoutineLeadData = {
  sentence: string;
  /** The sentence names who works (it is the generated one, not the agent's plain line): the fiche's « Qui travaille » is then not said twice. */
  saysWho: boolean; skills: string[]; model?: string; delivers: string[];
  /** Its state or its next passage, in the same words on the line and in the fiche. */
  status: string; failing: boolean; late: boolean; health: RoutineHealth;
  /** The seven dots of its last days (or passages), from the runs the agent dated; absent when it gave none. */
  band: Band | null;
};

/** What deserves a look, beyond its group: unreadable by Coffre, stopped by the agent, or failing (routines-19, -C5). */
export type RoutineProblem = "unreadable" | "blocked_config" | "stalled" | "failing" | "delivery";

type RoutineRef = { id?: string; name: string };

export type RunKind = "ok" | "failed" | "undelivered" | "running";

/**
 * Which agents the agent's connection really runs (`the list of agents` → `serving`). The state
 * comes from the agent's own state file, which the connection rewrites itself at each change: a snapshot, not a ping, with no
 * guaranteed age. So it is said in the present only while the connection itself says it is running (`home.connection`,
 * same snapshot); otherwise nothing is said, the Accueil already tells that the assistant no longer runs.
 * A field the server does not send is a capability it lacks: nothing is shown for it.
 */
export type Serving = "served" | "paused" | "not_served" | "failed" | "standalone" | "unknown";

type Setting<T> = { value: T; source: "set" | "default"; editable: boolean; allowed?: T[]; note?: string; overridden?: boolean };

/** Grey placeholders shaped like the content that is coming, so nothing jumps when it arrives. */
export declare const Skeleton: ({ lines, width, height, className }: { lines?: number; width?: string; height?: number; className?: string; }) => JSX.Element;

/** Rows of a list while it loads: an icon and two lines each. */
export declare const SkeletonRows: ({ rows, label, rowHeight }: { rows?: number; label?: string; rowHeight?: number; }) => JSX.Element;

type SkillChange = { name: string; kind: "created" | "updated"; at: string | null };

export type StyleEntry = { name: string; builtin: boolean; text: string };

/**
 * « Ranger les vieilles tâches » : une liste à cocher (tout coché au départ), puis une fenêtre et un maintien (on en
 * range plusieurs d'un coup). Une ligne discrète sous le tableau, dès qu'il y en a une.
 */
export declare const TidyOld: ({ tasks, board, now, agent }: { tasks: TravailTask[]; board: string; now: number; agent: (id: string | null) => { name: string; }; }) => JSX.Element | null;

export type TodayRow = (row: { id: string; name: string; line: string; end?: ReactNode; onOpen: () => void }) => ReactNode;

export type TravailList = Omit<MissionsList, "missions"> & { missions: TravailTask[]; boards: BoardCounts[]; questions: LiveQuestion[] };

export type TravailTask = MissionSummary & { startedAt: string | null; completedAt: string | null };

/**
 * À la sortie d'une feuille avec un brouillon : `leave()` rend true quand la feuille peut partir tout de suite, sinon
 * il ouvre la petite demande (rendue par `prompt`). Appliquer garde la feuille partie et écrit ; Laisser tomber oublie.
 */
export declare const useDraftLeave: (scope: DraftScope, { onApply, onLeave }: { onApply: () => void; onLeave: () => void; }) => { leave: () => boolean; prompt: JSX.Element; asking: boolean; };

/** La feuille qui rassemble les brouillons de ses parties. */
export declare const useDraftScope: () => { count: number; problem: string; take: () => DraftRun; discard: () => void; registry: Registry; };

export declare const useExport: (place: ExportPlace) => { state: ExportState; start: () => Promise<void>; result: ActionResult; used: () => void; };

type Window = { sessions: number; conversations: number; automated: number; lastActivityAt: string | null; days: { date: string; conversations: number }[] };

export declare const WorriesBlock: ({ worries }: { worries: Worry[]; }) => JSX.Element | null;

type Worry = { id: string; sentence: string; detail?: string; button: string; open: () => void };
