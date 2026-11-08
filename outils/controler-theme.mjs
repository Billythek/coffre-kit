#!/usr/bin/env node
/*
 * Le contrôle du kit : il lit le dossier d'un thème (sans rien lancer, sans réseau) et dit si les règles de Coffre sont tenues.
 *
 *     node outils/controler-theme.mjs <dossier-du-theme>            les dix pages sont exigées
 *     node outils/controler-theme.mjs <dossier-du-theme> --partiel  tu avances page par page : seules celles que le thème donne sont vérifiées
 *
 * Il sert deux fois : le créateur le lance avant d'envoyer son thème, et nous le relançons à la relecture (RELECTURE.md). Il ne remplace
 * ni `tsc` (les types du contrat), ni nos bancs (qui tournent dans Coffre), ni un regard humain : c'est le filet de la sécurité des données
 * et des règles qui se lisent dans le code. Il a besoin du paquet `typescript` (celui de ton `tsc`), de rien d'autre.
 *
 * Sortie : une ligne par faute (« FAUTE fichier:ligne [règle] détail »). Code de sortie 1 s'il y en a une. Les « AVERTISSEMENT » se lisent
 * mais ne bloquent pas : un humain tranche.
 */
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";
import { fileURLToPath } from "node:url";

const ici = path.dirname(fileURLToPath(import.meta.url));
const require = createRequire(path.join(process.cwd(), "noop.js"));
let ts;
try { ts = require("typescript"); } catch { try { ts = createRequire(import.meta.url)("typescript"); } catch { console.error("Il faut le paquet « typescript » (npm i -D typescript)."); process.exit(2); } }

const args = process.argv.slice(2);
const partiel = args.includes("--partiel");
const dossier = args.find((a) => !a.startsWith("--"));
if (!dossier || !fs.existsSync(dossier) || !fs.statSync(dossier).isDirectory()) { console.error("Usage : node outils/controler-theme.mjs <dossier-du-theme> [--partiel]"); process.exit(2); }
const racine = path.resolve(dossier);

const fautes = [];
const avertissements = [];
const faute = (fichier, ligne, regle, detail) => fautes.push(`FAUTE ${path.relative(racine, fichier) || fichier}${ligne ? ":" + ligne : ""} [${regle}] ${detail}`);
const avert = (fichier, ligne, regle, detail) => avertissements.push(`AVERTISSEMENT ${path.relative(racine, fichier)}${ligne ? ":" + ligne : ""} [${regle}] ${detail}`);

/* ---------- les fichiers ---------- */
function lister(d) {
  return fs.readdirSync(d, { withFileTypes: true }).flatMap((e) => (e.isDirectory() ? (e.name.startsWith(".") || e.name === "node_modules" ? [] : lister(path.join(d, e.name))) : [path.join(d, e.name)]));
}
const tous = lister(racine);
const codes = tous.filter((f) => /\.(ts|tsx)$/.test(f));
const feuilles = tous.filter((f) => f.endsWith(".css"));
const relatif = (f) => path.relative(racine, f).split(path.sep).join("/");
for (const f of tous) {
  const r = relatif(f);
  if (/\.(ts|tsx|css)$/.test(f) || r === "theme.json") continue;
  if (/(^|\/)(README|LISEZ-MOI)\.md$/i.test(f)) continue;
  if (/^polices\/[a-z0-9._-]+\.(woff|woff2)$/.test(r)) { avert(f, 0, "polices", "police apportée : nous relisons sa licence (OFL ou équivalent) avant de la servir"); continue; }
  if (/^(apercu\.webp|captures\/[a-z0-9._-]+\.(webp|png))$/.test(r)) continue;
  faute(f, 0, "fichiers", "seuls .ts, .tsx, .css, theme.json, apercu.webp, captures/*.webp|png et polices/*.woff2 entrent dans un thème (pas de script, de JSON de données, d'autre image)");
}
const lire = (f) => fs.readFileSync(f, "utf8");
/** Le texte sans ses commentaires, avec le même nombre de lignes (pour dire la bonne ligne). */
const sansCommentaires = (t) => t.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " ")).replace(/(^|[^:"'`\\])\/\/[^\n]*/g, (m, avant) => avant + " ".repeat(m.length - avant.length));
const ligneDe = (texte, index) => texte.slice(0, index).split("\n").length;

/* ---------- le code : ce qui ne s'écrit jamais ---------- */
const INTERDITS_CODE = [
  // lire ou écrire chez l'agent, sortir du téléphone
  [/\buseCachedRead\b|\bpersonalRead\b|\bpersonalWrite\b|\bpersonalRequest\b|\bsharedFetch\b|\bstartPersonalReads\b/, "lecture", "une vue ne lit et n'écrit jamais : tout vient du modèle"],
  // (sans \b : « fetch » écrit dans un autre mot, ou découpé dans une chaîne qui le contient en entier, est vu aussi)
  [/fetch|XMLHttpRequest|sendBeacon|EventSource|WebSocket|BroadcastChannel|importScripts|\bnew\s+(?:Shared)?Worker\b|serviceWorker/, "réseau", "aucun appel réseau, aucun travailleur"],
  [/\bnew\s+(?:Image|Audio|Request|URL|Option)\b|\bImage\s*\(|createObjectURL/, "réseau", "pas de `new Image`, `new Audio`, `new Request`, `new URL` : ils chargent des adresses"],
  [/\bnavigator\s*\./, "appareil", "pas d'accès à l'appareil (le retour tactile, le presse-papier, la position passent par Coffre)"],
  // garder quelque chose en cachette
  [/\blocalStorage\b|\bsessionStorage\b|\bindexedDB\b|\bcookieStore\b|\bdocument\s*\.\s*cookie\b|\bcaches\s*\.|\bopenDatabase\b/, "stockage", "aucun stockage caché : un thème ne garde rien lui-même"],
  // exécuter du texte, écrire du HTML
  [/\beval\b|\bFunction\b|\bdangerouslySetInnerHTML\b|\binnerHTML\b|\bouterHTML\b|\binsertAdjacentHTML\b|\bdocument\s*\.\s*write\b|\bsrcDoc\b|\bsrcdoc\b/, "exécution", "ni texte exécuté, ni HTML écrit à la main"],
  [/\b(?:setTimeout|setInterval)\s*\(\s*["'`]/, "exécution", "un minuteur ne reçoit pas du texte à exécuter"],
  [/constructor|__proto__|getPrototypeOf|\bReflect\b/, "exécution", "pas de `constructor`, de prototype ni de `Reflect` : c'est la porte vers `Function` et vers la fenêtre"],
  // sortir de la page
  [/(?<![-\w])window(?![-\w])|\bglobalThis\b|(?<![-\w'])self(?![-\w])|\btop\s*\.|\bparent\s*\.|\blocation\b|\bhistory\s*\.|\bpostMessage\b|\bTelegram\s*\.\s*WebApp\b|\bWebApp\b/, "page", "un thème ne touche ni la fenêtre, ni l'adresse, ni Telegram"],
  [/\bdocument\s*\.\s*(?!documentElement\b)|\bdocument\s*\[/, "page", "seul `document.documentElement` est permis (pour lire la langue)"],
  [/\bdocument\s*\.\s*documentElement\b(?<!observe\(\s*document\s*\.\s*documentElement)(?!\s*\.\s*(?:lang|dir)\b)/, "page", "`document.documentElement` ne sert qu'à lire `.lang` (ou à l'observer) : rien d'autre"],
  [/ownerDocument|defaultView|contentWindow|contentDocument|getRootNode|parentNode|parentElement|\.closest\s*\(|\bframes\b/, "page", "pas de chemin de l'élément vers la fenêtre ou le document"],
  [/<\s*(script|iframe|frame|frameset|portal|object|embed|applet|link|meta|base|style|form|a|video|audio|source|track|picture|image)\b/i, "balises", "pas de <script>, <iframe>, <object>, <embed>, <link>, <meta>, <base>, <style>, <form>, <a>, <video>, <audio>, <source>, <track>, <picture>, <image> : un thème ne charge rien et ne navigue pas"],
  [/\bimport\s*\(|\bimport\s*\.\s*meta|\brequire\s*\(/, "imports", "pas d'import dynamique, de `import.meta` ni de require : tout est écrit en toutes lettres en haut du fichier"],
  [/\bsetAttribute(?:NS)?\b|\.\s*(?:src|href|srcset|action|poster)\s*=(?!=)/, "page", "un thème n'écrit pas les attributs d'un élément à la main (`setAttribute`, `.src =`) : tout passe par le JSX"],
  // les chaînes assemblées pour cacher un mot interdit
  [/["'`]\s*\+\s*["'`]|\$\{\s*["'`]|\.join\s*\(\s*(["'`])\1\s*\)|fromCharCode|fromCodePoint|\batob\b|\bunescape\b|\bdecodeURI(?:Component)?\b|\.reverse\s*\(/, "obfuscation", "pas de mot assemblé en morceaux (chaînes mises bout à bout, `join(\"\")`, codes de caractères…) : écris-le en entier"],
  [/\burl\s*\(|image-set\s*\(/i, "adresse", "pas de `url(` ni d'`image-set(` dans le code (un style en ligne charge une adresse)"],
  // adresses
  [/\\u[0-9a-fA-F{]|\\x[0-9a-fA-F]{2}/, "obfuscation", "pas d'échappement \\u ou \\x dans le code (hors textes.ts) : écris le caractère", "sauf-textes"],
  [/["'`]\s*(?:https?:|wss?:|ftp:|data:|blob:|javascript:|mailto:|tel:|\/\/)/i, "adresse", "aucune adresse extérieure dans le code"],
  [/\bhttps?:\/\/[^\s"'`)]*/i, "adresse", "aucune adresse extérieure dans le code"],
];
const AVERT_CODE = [
  [/\bsetInterval\b|\bsetTimeout\b|\brequestAnimationFrame\b/, "minuteur", "un minuteur dans une vue : les minuteurs vivent dans le modèle ; à justifier (animation seulement ?)"],
  [/\bMath\.random\b|\bDate\.now\b|\bnew\s+Date\b/, "temps", "l'heure et le hasard viennent du modèle (`now`) : la vue reste la même à chaque rendu"],
];
/** Les imports permis hors de son dossier : très peu. */
const SPECS_PERMIS = [/^react$/, /^react\/jsx-runtime$/, /^motion\/react$/];

function controlerCode(f) {
  const brut = lire(f);
  let t = sansCommentaires(brut);
  // les notes pour le traducteur sont de la prose qui ne s'exécute jamais : on ne les lit pas comme du code
  if (/(^|\/)textes[^/]*\.tsx?$/.test(f)) t = t.replace(/\bnote\s*:\s*"(?:[^"\\]|\\.)*"/g, (m) => 'note: ""' + " ".repeat(Math.max(0, m.length - 9)));
  for (const [re, regle, detail, option] of INTERDITS_CODE) {
    if (option === "sauf-textes" && /(^|\/)textes[^/]*\.tsx?$/.test(f)) continue;
    const g = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
    for (const m of t.matchAll(g)) faute(f, ligneDe(t, m.index), regle, `« ${m[0].trim().slice(0, 40)} » : ${detail}`);
  }
  for (const [re, regle, detail] of AVERT_CODE) {
    const g = new RegExp(re.source, "g");
    for (const m of t.matchAll(g)) avert(f, ligneDe(t, m.index), regle, `« ${m[0]} » : ${detail}`);
  }
  // les imports, avec le vrai analyseur
  const arbre = ts.createSourceFile(f, brut, ts.ScriptTarget.ES2022, true, f.endsWith("x") ? ts.ScriptKind.TSX : ts.ScriptKind.TS);
  const ligne = (n) => arbre.getLineAndCharacterOfPosition(n.getStart()).line + 1;
  const visiter = (n) => {
    if ((ts.isImportDeclaration(n) || ts.isExportDeclaration(n)) && n.moduleSpecifier && ts.isStringLiteral(n.moduleSpecifier)) {
      const spec = n.moduleSpecifier.text;
      const typeSeul = ts.isImportDeclaration(n) ? Boolean(n.importClause?.isTypeOnly) : Boolean(n.isTypeOnly);
      if (/^\.\/[^.]/.test(spec) || spec === ".") {
        // son propre dossier : permis
      } else if (/^\.\.\/modeles(-[a-z]+)?$/.test(spec)) {
        if (!typeSeul) faute(f, ligne(n), "imports", `« ${spec} » ne s'importe qu'en \`import type\` : le contrat ne contient que des types`);
      } else if (spec.startsWith(".")) {
        faute(f, ligne(n), "imports", `« ${spec} » sort du dossier du thème : un thème n'importe que son dossier, les types de ../modeles, react et motion/react`);
      } else if (!SPECS_PERMIS.some((re) => re.test(spec))) {
        faute(f, ligne(n), "imports", `« ${spec} » : aucune dépendance de plus (react et motion/react seulement)`);
      }
    }
    // les mots que la vue écrit elle-même : tout texte vient de textes.ts (JSX) ; pas de texte en dur
    if (!/(^|\/)textes[^/]*\.tsx?$/.test(f)) {
      if (ts.isJsxText(n) && /[A-Za-zÀ-ÿ]{3,}/.test(n.text)) faute(f, ligne(n), "textes", `texte en dur « ${n.text.trim().slice(0, 40)} » : le mot va dans textes.ts (fr, en, note)`);
      if (ts.isJsxAttribute(n) && n.initializer && ts.isStringLiteral(n.initializer) && /^(aria-label|aria-description|aria-roledescription|placeholder|title|alt|label|titre|sous|mot)$/.test(n.name.getText()) && /[A-Za-zÀ-ÿ]{3,}/.test(n.initializer.text)) {
        faute(f, ligne(n), "textes", `texte en dur « ${n.initializer.text.slice(0, 40)} » dans ${n.name.getText()} : le mot va dans textes.ts`);
      }
    }
    if (ts.isJsxAttribute(n) && /^(href|xlinkHref|formAction|action|srcSet|poster|ping)$/.test(n.name.getText())) faute(f, ligne(n), "adresse", `l'attribut « ${n.name.getText()} » est une adresse : un thème ne navigue pas et ne charge rien`);
    if (ts.isJsxOpeningLikeElement(n) && n.tagName.getText() === "img") {
      const src = n.attributes.properties.find((p) => ts.isJsxAttribute(p) && p.name.getText() === "src");
      if (src && src.initializer && ts.isStringLiteral(src.initializer)) faute(f, ligne(n), "adresse", "une image ne s'écrit jamais avec une adresse : elle vient du modèle (`src={photo}`)");
      else if (src && src.initializer && ts.isJsxExpression(src.initializer) && src.initializer.expression && !ts.isIdentifier(src.initializer.expression) && !ts.isPropertyAccessExpression(src.initializer.expression)) faute(f, ligne(n), "adresse", "`src` d'une image : seulement une valeur du modèle (`src={photo}` ou `src={m.photo}`), jamais un texte composé");
    }
    ts.forEachChild(n, visiter);
  };
  visiter(arbre);
}
for (const f of codes) controlerCode(f);

/* ---------- les mots du thème (textes.ts) ---------- */
const JARGON = /\b(bots?|herm[eè]s|kanban|cron|gateway|passerelle|soul|config(?:uration)?\.ya?ml|yaml|json|token|jeton|api|mcp|llm|prompt|slug|endpoint|webhook|backend|frontend|profile|dashboard)\b/i;
for (const f of codes.filter((c) => /(^|\/)textes[^/]*\.tsx?$/.test(c))) {
  const t = lire(f);
  const sans = sansCommentaires(t);
  let compte = 0;
  for (const m of sans.matchAll(/(?:\b|^)(fr|en)\s*:\s*"((?:[^"\\]|\\.)*)"/g)) {
    compte += 1;
    if (JARGON.test(m[2])) faute(f, ligneDe(sans, m.index), "vocabulaire", `« ${m[2].slice(0, 50)} » : pas de jargon, jamais un nom technique ; on dit le nom de l'agent`);
    if (m[1] === "fr" && /\b(vous|votre|vos)\b/i.test(m[2])) faute(f, ligneDe(sans, m.index), "vocabulaire", `« ${m[2].slice(0, 50)} » : on tutoie dans Coffre`);
    if (/\s{2,}|^\s|\s$/.test(m[2])) avert(f, ligneDe(sans, m.index), "vocabulaire", `« ${m[2].slice(0, 30)} » : espaces en trop`);
  }
  const notes = [...sans.matchAll(/\bnote\s*:\s*"((?:[^"\\]|\\.)*)"/g)];
  const fr = [...sans.matchAll(/\bfr\s*:\s*"/g)].length, en = [...sans.matchAll(/\ben\s*:\s*"/g)].length;
  if (compte === 0) avert(f, 0, "textes", "aucun texte trouvé (forme attendue : clé: { fr: \"…\", en: \"…\", note: \"…\" })");
  if (fr !== en || notes.length !== fr || notes.some((n) => n[1].trim().length < 8)) faute(f, 0, "textes", `chaque texte a un « fr », un « en » et une « note » d'au moins 8 caractères (fr ${fr}, en ${en}, notes ${notes.length})`);
}

/* ---------- les feuilles de style ---------- */
const DUREES_PERMISES = new Set([0, 0.01, 140, 200, 240]);
const duree = (valeur) => [...valeur.matchAll(/(?<![\w.#-])(\d*\.?\d+)(ms|s)\b/g)].map((m) => parseFloat(m[1]) * (m[2] === "s" ? 1000 : 1));
function controlerCss(f) {
  const brut = lire(f);
  const t = brut.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, " "));
  if (/\burl\s*\(/i.test(t)) for (const m of t.matchAll(/\burl\s*\(/gi)) faute(f, ligneDe(t, m.index), "adresse", "url() : aucune adresse, aucune image ni police à soi (les polices sont celles de Coffre)");
  for (const [re, regle, detail] of [[/@import\b/g, "adresse", "@import : rien ne se charge d'ailleurs"], [/@font-face\b/g, "polices", "@font-face : les polices sont servies par Coffre"], [/\bexpression\s*\(|\bbehavior\s*:|-moz-binding/gi, "exécution", "du CSS qui exécute"], [/\bhttps?:\/\//g, "adresse", "aucune adresse"]]) {
    for (const m of t.matchAll(re)) faute(f, ligneDe(t, m.index), regle, detail);
  }
  // les échappements (u\72l( écrit sans « url ») et les fonctions qui chargent une image
  const nu = t.replace(/"(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'/g, '""');
  for (const m of nu.matchAll(/\\/g)) faute(f, ligneDe(nu, m.index), "adresse", "un antislash dans le CSS (un échappement peut cacher `url(`) : écris le mot en entier");
  for (const m of nu.matchAll(/(?:-webkit-)?(?:image-set|cross-fade|image|element|paint|src)\s*\(/gi)) faute(f, ligneDe(nu, m.index), "adresse", `« ${m[0]} » charge une image ou du code : aucune image à soi`);
  for (const m of nu.matchAll(/@(?:namespace|document|-moz-document|charset)\b|:global\b/g)) faute(f, ligneDe(nu, m.index), "css", `« ${m[0]} » n'est pas permis`);
  // portée : chaque règle vise une classe du thème (un module CSS est limité à ses classes) ; jamais body, html, :root, * seuls
  if (!/(^|\/)(palette|jetons)[^/]*\.css$/.test(relatif(f))) {
    for (const m of nu.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
      const prelude = m[1].trim();
      if (!prelude || prelude.startsWith("@") || /^(?:from|to|\d+(?:\.\d+)?%)(?:\s*,\s*(?:from|to|\d+(?:\.\d+)?%))*$/.test(prelude)) continue;
      for (const sel of prelude.split(",")) {
        const sans = sel.replace(/:(?:not|is|where|has)\((?:[^()]|\([^()]*\))*\)/g, "");
        if (!/\.[A-Za-z_-]/.test(sans)) faute(f, ligneDe(nu, m.index), "css", `« ${sel.trim().slice(0, 40)} » ne vise aucune classe du thème : un thème ne style que ses propres classes (pas body, html, un élément seul, un id)`);
      }
    }
  }
  // [data-style devant html:root ; jamais « classique »
  for (const m of t.matchAll(/(.{0,9})\[data-style(?![\w-])/g)) if (m[1] !== "html:root") faute(f, ligneDe(t, m.index), "css", "`[data-style` doit être précédé de `html:root`");
  for (const m of t.matchAll(/classique/gi)) faute(f, ligneDe(t, m.index), "css", "aucune règle ne vise « classique »");
  // les durées : 140, 200 ou 240 ms
  for (const m of t.matchAll(/\b(transition|animation)(?:-duration|-delay)?\s*:\s*([^;}]*)/g)) {
    for (const d of duree(m[2])) if (!DUREES_PERMISES.has(d)) faute(f, ligneDe(t, m.index), "mouvement", `durée de ${d} ms : seules 140, 200 ou 240 ms sont permises`);
  }
  // le mouvement réduit
  const anime = /\b(transition|animation)\s*:/.test(t) || /@keyframes\b/.test(t);
  const coupe = /@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/.test(t);
  if (anime && !coupe) faute(f, 0, "mouvement", "ce fichier anime quelque chose et ne le coupe pas en mouvement réduit : ajoute un bloc `@media (prefers-reduced-motion: reduce)` qui met transition et animation à none");
  if (anime && coupe) {
    const bloc = t.slice(t.search(/@media\s*\(\s*prefers-reduced-motion\s*:\s*reduce\s*\)/));
    if (!/(transition|animation)\s*:\s*none|animation-duration\s*:\s*0/.test(bloc)) faute(f, 0, "mouvement", "le bloc `prefers-reduced-motion: reduce` existe mais ne coupe ni les transitions ni les animations");
  }
}
for (const f of feuilles) controlerCss(f);

/* ---------- theme.json : la fiche du thème, lue contre contrat/theme.schema.json ---------- */
const DIX_PAGES = ["accueil", "travail", "catalogue", "savoir", "personnalite", "routines", "programmer", "reglages", "agents", "compte"];
const RESERVES = ["classique", "point", "carte", "bureau", "exemple"];
/** Les champs que NOUS posons à la relecture : le créateur ne les écrit pas. */
const POSES_PAR_NOUS = ["origine", "empreinteRelue", "dateRelecture", "versionCoffre"];
const PLACEHOLDERS = /^À (écrire|remplir)/;
/** Une validation simple contre le schéma : type, requis, pattern, enum, longueurs, items, champs inconnus. Pas de dépendance. */
function valider(valeur, schema, chemin, dit) {
  const nom = chemin || "theme.json";
  const type = schema.type;
  if (type === "string") {
    if (typeof valeur !== "string") return dit(`« ${nom} » : du texte attendu`);
    if (schema.minLength !== undefined && valeur.trim().length < schema.minLength) return dit(`« ${nom} » manque`);
    if (schema.maxLength !== undefined && valeur.length > schema.maxLength) dit(`« ${nom} » : ${schema.maxLength} caractères au plus`);
    if (schema.enum && !schema.enum.includes(valeur)) dit(`« ${nom} » : ${schema.enum.join(", ")}`);
    if (schema.pattern && !new RegExp(schema.pattern).test(valeur)) dit(`« ${nom} » : « ${valeur} » ne respecte pas le format ${schema.pattern}${schema.description ? " (" + schema.description + ")" : ""}`);
  } else if (type === "array") {
    if (!Array.isArray(valeur)) return dit(`« ${nom} » : une liste attendue`);
    if (schema.minItems !== undefined && valeur.length < schema.minItems) dit(`« ${nom} » : ${schema.minItems} éléments au moins`);
    if (schema.items) valeur.forEach((v, i) => valider(v, schema.items, `${nom}[${i}]`, dit));
  } else if (type === "object") {
    if (!valeur || typeof valeur !== "object" || Array.isArray(valeur)) return dit(`« ${nom} » : un objet attendu`);
    for (const k of schema.required ?? []) if (valeur[k] === undefined) dit(`« ${chemin ? chemin + "." : ""}${k} » manque`);
    for (const [k, v] of Object.entries(valeur)) {
      if (schema.properties?.[k]) valider(v, schema.properties[k], `${chemin ? chemin + "." : ""}${k}`, dit);
      else if (schema.additionalProperties === false) dit(`« ${chemin ? chemin + "." : ""}${k} » : champ inconnu${POSES_PAR_NOUS.includes(k) ? " (posé par nous à la relecture, pas par toi)" : ""}`);
    }
  }
}
/** La largeur et la hauteur d'un WebP, lues dans son en-tête (VP8, VP8L ou VP8X). */
function tailleWebp(octets) {
  if (octets.length < 30 || octets.toString("ascii", 0, 4) !== "RIFF" || octets.toString("ascii", 8, 12) !== "WEBP") return null;
  const type = octets.toString("ascii", 12, 16);
  if (type === "VP8X") return { l: 1 + octets.readUIntLE(24, 3), h: 1 + octets.readUIntLE(27, 3) };
  if (type === "VP8L") { const b = octets.readUInt32LE(21); return { l: 1 + (b & 0x3fff), h: 1 + ((b >> 14) & 0x3fff) }; }
  if (type === "VP8 ") return { l: octets.readUInt16LE(26) & 0x3fff, h: octets.readUInt16LE(28) & 0x3fff };
  return null;
}
let fiche = null;
{
  const f = path.join(racine, "theme.json");
  if (!fs.existsSync(f)) { if (!partiel) faute(f, 0, "theme.json", "theme.json manque (la fiche du thème : nom, auteur, licence, version, pages…)"); }
  else {
    try { fiche = JSON.parse(lire(f)); } catch (e) { faute(f, 0, "theme.json", "JSON illisible : " + e.message); }
  }
  if (fiche) {
    const dit = (m) => faute(f, 0, "theme.json", m);
    const fichierSchema = path.join(ici, "../contrat/theme.schema.json");
    if (!fs.existsSync(fichierSchema)) dit("contrat/theme.schema.json manque : le kit est incomplet");
    else {
      const schema = JSON.parse(fs.readFileSync(fichierSchema, "utf8"));
      // la part du créateur : on retire ce que nous posons, et on exige la description (une phrase, 120 caractères au plus)
      const sien = { ...schema, required: [...new Set([...schema.required.filter((k) => !POSES_PAR_NOUS.includes(k) && k !== "captures"), "description"])] };
      sien.properties = { ...schema.properties, pages: { ...schema.properties.pages, items: { ...schema.properties.pages.items, enum: [...schema.properties.pages.items.enum] } } };
      for (const k of POSES_PAR_NOUS) delete sien.properties[k];
      if (Array.isArray(fiche.pages) && fiche.pages.includes("entete")) dit("« pages » : « entete » est refusé, l'en-tête reste celui de Coffre ; un thème donne exactement les dix pages");
      else valider(fiche, sien, "", dit);
      if (typeof fiche.id === "string" && RESERVES.includes(fiche.id) && fiche.id !== "exemple") dit(`« id » : « ${fiche.id} » est le nom d'un de nos thèmes`);
      if (Array.isArray(fiche.pages)) {
        const manque = DIX_PAGES.filter((p) => !fiche.pages.includes(p));
        if (manque.length && !partiel) dit(`« pages » : il manque ${manque.join(", ")} (un thème proposé donne les dix pages)`);
      }
    }
    for (const champ of ["description", "auteur"]) { const v = champ === "auteur" ? fiche.auteur?.nom : fiche.description; if (typeof v === "string" && PLACEHOLDERS.test(v)) avert(f, 0, "theme.json", `« ${champ} » est encore le texte de départ : écris le tien`); }
    const versionContrat = fs.existsSync(path.join(ici, "../contrat/version.txt")) ? fs.readFileSync(path.join(ici, "../contrat/version.txt"), "utf8").trim() : null;
    if (typeof fiche.contrat === "string" && versionContrat && fiche.contrat.split(".")[0] !== versionContrat.split(".")[0]) dit(`« contrat » ${fiche.contrat} : le kit est en ${versionContrat} (le premier chiffre doit être le même)`);
    if (Array.isArray(fiche.polices) && fiche.polices.some((p) => typeof p === "string" && !fs.existsSync(path.join(racine, p)))) dit("« polices » : chaque police listée doit exister dans polices/");
    if (typeof fiche.apercu === "string" && /\.webp$/.test(fiche.apercu)) {
      const v = path.join(racine, fiche.apercu);
      if (!fs.existsSync(v)) dit("« apercu » : la vignette n'existe pas");
      else {
        const taille = tailleWebp(fs.readFileSync(v));
        if (!taille) dit("« apercu » : ce n'est pas un fichier WebP lisible");
        else if (taille.l !== 320 || taille.h !== 200) dit(`« apercu » : la vignette fait ${taille.l} × ${taille.h}, il faut 320 × 200`);
      }
    }
    for (const c of fiche.captures ?? []) if (!/^[a-z0-9._/-]+\.(webp|png)$/.test(c) || !fs.existsSync(path.join(racine, c))) dit(`« captures » : ${c} n'existe pas`);
  }
}

/* ---------- la palette : tous les jetons, clair et sombre, page et vignette, et les contrastes ---------- */
const jetonsFerme = fs.existsSync(path.join(ici, "../contrat/jetons.txt")) ? fs.readFileSync(path.join(ici, "../contrat/jetons.txt"), "utf8").split("\n").filter((l) => l && !l.startsWith("#")) : [];
function declarations(corps) { return new Map([...corps.matchAll(/(--[a-z0-9-]+)\s*:\s*([^;]+);/g)].map((m) => [m[1], m[2].trim()])); }
function couleur(valeur) {
  const v = valeur.trim();
  let m = /^#([0-9a-f]{6})$/i.exec(v);
  if (m) return { r: parseInt(m[1].slice(0, 2), 16) / 255, g: parseInt(m[1].slice(2, 4), 16) / 255, b: parseInt(m[1].slice(4, 6), 16) / 255, a: 1 };
  m = /^#([0-9a-f]{3})$/i.exec(v);
  if (m) return { r: parseInt(m[1][0] + m[1][0], 16) / 255, g: parseInt(m[1][1] + m[1][1], 16) / 255, b: parseInt(m[1][2] + m[1][2], 16) / 255, a: 1 };
  m = /^rgba?\(\s*(\d+)[\s,]+(\d+)[\s,]+(\d+)(?:\s*[/,]\s*([.\d]+))?\s*\)$/i.exec(v);
  if (m) return { r: +m[1] / 255, g: +m[2] / 255, b: +m[3] / 255, a: m[4] === undefined ? 1 : +m[4] };
  return null;
}
const lum = ({ r, g, b }) => { const c = (x) => (x <= 0.03928 ? x / 12.92 : ((x + 0.055) / 1.055) ** 2.4); return 0.2126 * c(r) + 0.7152 * c(g) + 0.0722 * c(b); };
const sur = (encre, fond) => ({ r: encre.r * encre.a + fond.r * (1 - encre.a), g: encre.g * encre.a + fond.g * (1 - encre.a), b: encre.b * encre.a + fond.b * (1 - encre.a), a: 1 });
const contraste = (encre, fond) => { const e = sur(encre, fond); const a = lum(e), b = lum(fond); return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05); };
const PAIRES = [
  ["--foreground", "--background", 4.5], ["--foreground", "--surface", 4.5], ["--text-soft", "--surface", 4.5], ["--text-secondary", "--surface", 4.5],
  ["--text-muted", "--surface", 4.5], ["--text-muted", "--background", 4.5], ["--text-faint", "--background", 4.5], ["--text-faint", "--surface", 4.5],
  ["--accent-text", "--background", 4.5], ["--accent-text", "--surface", 4.5], ["--accent-foreground", "--accent", 4.5],
  ["--btn-main-ink", "--btn-main", 4.5], ["--btn-main-ink", "--btn-main-press", 4.5], ["--btn-ink", "--btn-face", 4.5], ["--field-hint", "--field-face", 4.5],
  ["--send-ink", "--send", 4.5], ["--danger-foreground", "--danger", 4.5], ["--success", "--surface", 4.5], ["--warning", "--surface", 4.5], ["--danger", "--surface", 4.5], ["--info", "--surface", 4.5],
  ["--switch-thumb-on", "--switch-on", 3], ["--border-strong", "--background", 3], ["--border-strong", "--surface", 3], ["--control-track", "--surface", 3], ["--control-track", "--background", 3],
];
const palette = feuilles.filter((f) => /(^|\/)(palette|jetons)[^/]*\.css$/.test(f));
if (!palette.length) { if (!partiel) faute(racine, 0, "palette", "aucune palette (palette.css ou jetons.css) : un thème pose ses couleurs, en clair et en sombre"); }
for (const f of palette) {
  const t = lire(f).replace(/\/\*[\s\S]*?\*\//g, "");
  const noms = new Set([...t.matchAll(/html:root\[data-style="([a-z0-9-]+)"\]/g)].map((m) => m[1]));
  if (noms.size !== 1) { faute(f, 0, "palette", `le thème doit avoir un seul nom (data-style) dans sa palette ; trouvé : ${[...noms].join(", ") || "aucun"}`); continue; }
  const [nom] = [...noms];
  if (fiche && fiche.id !== nom) faute(f, 0, "palette", `le nom de la palette (« ${nom} ») doit être l'« id » de theme.json (« ${fiche.id} »)`);
  if (["classique", "point", "carte", "bureau"].includes(nom)) faute(f, 0, "palette", `« ${nom} » est le nom d'un de nos thèmes : choisis le tien`);
  // la palette ne contient que les quatre blocs de jetons : rien d'autre, aucune propriété hors `--…`
  for (const m of t.matchAll(/([^{}]+)\{([^{}]*)\}/g)) {
    const sel = m[1].trim();
    if (!new RegExp(`^(?:html:root\\[data-style="${nom}"\\]\\[data-theme="(?:light|dark)"\\]|\\[data-style-apercu="${nom}"\\]\\[data-scheme="(?:light|dark)"\\])$`).test(sel)) faute(f, 0, "palette", `« ${sel.slice(0, 50)} » : la palette ne contient que les quatre blocs html:root[data-style="${nom}"][data-theme] et [data-style-apercu="${nom}"][data-scheme]`);
    for (const d of m[2].split(";")) { const prop = d.split(":")[0].trim(); if (prop && !prop.startsWith("--")) faute(f, 0, "palette", `« ${prop} » : la palette ne déclare que des jetons (--…)`); }
  }
  const bloc = (selecteur) => { const m = new RegExp(selecteur.replace(/[[\]"=.]/g, "\\$&") + "\\s*\\{([^}]*)\\}").exec(t); return m ? declarations(m[1]) : null; };
  for (const mode of ["light", "dark"]) {
    const page = bloc(`html:root[data-style="${nom}"][data-theme="${mode}"]`);
    const vignette = bloc(`[data-style-apercu="${nom}"][data-scheme="${mode}"]`);
    if (!page) { faute(f, 0, "palette", `bloc manquant : html:root[data-style="${nom}"][data-theme="${mode}"]`); continue; }
    if (!vignette) faute(f, 0, "palette", `bloc manquant : [data-style-apercu="${nom}"][data-scheme="${mode}"] (la vignette du choix de thème)`);
    const manque = jetonsFerme.filter((j) => !page.has(j));
    if (manque.length) faute(f, 0, "palette", `${mode} : jetons manquants (${manque.length}) : ${manque.join(", ")}`);
    const inconnus = [...page.keys()].filter((j) => jetonsFerme.length && !jetonsFerme.includes(j));
    if (inconnus.length) faute(f, 0, "palette", `${mode} : jetons hors de la liste fermée : ${inconnus.join(", ")}`);
    if (vignette) {
      const manqueV = jetonsFerme.filter((j) => !vignette.has(j));
      if (manqueV.length) faute(f, 0, "palette", `${mode} (vignette) : jetons manquants : ${manqueV.join(", ")}`);
      const autres = [...page].filter(([k, v]) => vignette.has(k) && vignette.get(k).replace(/\s+/g, " ") !== v.replace(/\s+/g, " ")).map(([k]) => k);
      if (autres.length) faute(f, 0, "palette", `${mode} : la vignette montrerait un autre thème que la page (${autres.join(", ")})`);
    }
    const lireC = (j) => { const v = page.get(j); return v ? couleur(v) : null; };
    for (const [a, b, seuil] of PAIRES) {
      const ea = lireC(a), fb = lireC(b);
      if (!ea || !fb) { if (page.has(a) && page.has(b)) avert(f, 0, "contraste", `${mode} ${a} / ${b} : couleur non lisible par le contrôle (écris-la en #rrggbb ou rgb())`); continue; }
      const r = contraste(ea, fb);
      if (r < seuil) faute(f, 0, "contraste", `${mode} : ${a} sur ${b} fait ${r.toFixed(2)}:1, il en faut ${seuil}:1`);
    }
    for (const j of ["--font-display-title", "--type-caps", "--font-voix", "--font-mono"]) {
      const servies = /google sans flex|roboto flex|geist|inter|bricolage grotesque|geist mono|-apple-system|blinkmacsystemfont|sf pro|sf mono|sfmono-regular|system-ui|ui-sans-serif|ui-monospace|menlo|consolas|monospace|sans-serif|serif|var\(/i;
      for (const famille of (page.get(j) ?? "").matchAll(/"([^"]+)"/g)) if (!servies.test(famille[1])) (fiche?.polices?.length ? avert : faute)(f, 0, "polices", `${j} : « ${famille[1]} » n'est servie par personne (Coffre sert Google Sans Flex, Inter, Geist, Bricolage Grotesque, Geist Mono)`);
    }
  }
}

/* ---------- les pages ---------- */
const PAGES = ["accueil", "travail", "catalogue", "savoir", "personnalite", "routines", "programmer", "reglages", "agents", "compte"];
const AVEC_FEUILLES = { travail: /<Feuilles\s+modele=/, catalogue: /<Feuilles\s+modele=/, personnalite: /<Feuilles\s+modele=/, routines: /<Feuilles\s+modele=/, compte: /<Feuilles\s+modele=/, reglages: /<Feuille\s+modele=/, programmer: /<FeuilleBot\s+modele=/ };
const entrees = codes.filter((f) => /(^|\/)style-[a-z0-9-]+(-pages)?\.tsx?$/.test(f));
const declarees = new Map(); // page -> composant
for (const f of entrees) {
  const t = sansCommentaires(lire(f));
  const m = /VUES\s*:\s*Vues\s*=\s*\{([\s\S]*?)\}\s*;?/.exec(t);
  if (!m) { faute(f, 0, "pages", "ce fichier doit exporter `export const VUES: Vues = { … }`"); continue; }
  for (const e of (m[1] + "\n").matchAll(/(\w+)\s*(?::\s*(\w+))?\s*[,}\n]/g)) if (PAGES.includes(e[1])) declarees.set(e[1], { composant: e[2] ?? e[1], fichier: f });
}
const nomsEntrees = [...new Set(entrees.map((f) => path.basename(f).replace(/^style-/, "").replace(/-pages\.tsx?$|\.tsx?$/, "")))];
if (nomsEntrees.length !== 1) faute(racine, 0, "pages", `il faut exactement deux fichiers d'entrée, style-<nom>.ts et style-<nom>-pages.ts (trouvé : ${entrees.map((f) => path.basename(f)).join(", ") || "aucun"})`);
else {
  const nom = nomsEntrees[0];
  if (fiche && fiche.id !== nom) faute(racine, 0, "theme.json", `« id » ${fiche.id} : les fichiers d'entrée s'appellent style-${nom}.ts (ils doivent porter le même nom)`);
  const baseOk = entrees.some((f) => path.basename(f) === `style-${nom}.ts`), pagesOk = entrees.some((f) => path.basename(f) === `style-${nom}-pages.ts`);
  if (!baseOk || !pagesOk) faute(racine, 0, "pages", `il faut style-${nom}.ts (l'Accueil) ET style-${nom}-pages.ts (les neuf autres pages)`);
  const entree = entrees.find((f) => path.basename(f) === `style-${nom}.ts`);
  if (entree && [...declarees].some(([p, d]) => d.fichier === entree && p !== "accueil" && p !== "entete")) faute(entree, 0, "pages", "le fichier d'entrée du premier écran ne donne que l'Accueil (les autres pages vont dans le fichier -pages)");
  const fp = entrees.find((f) => path.basename(f) === `style-${nom}-pages.ts`);
  if (fp && declarees.get("accueil")?.fichier === fp) faute(fp, 0, "pages", "l'Accueil va dans le fichier d'entrée, pas dans le fichier -pages");
}
if (fiche && Array.isArray(fiche.pages)) {
  for (const [page, d] of declarees) if (!fiche.pages.includes(page)) faute(d.fichier, 0, "theme.json", `la page « ${page} » est donnée par le thème mais absente de « pages » dans theme.json`);
  for (const page of fiche.pages) if (DIX_PAGES.includes(page) && !declarees.has(page) && !partiel) faute(path.join(racine, "theme.json"), 0, "theme.json", `« ${page} » est annoncée dans « pages » mais aucune vue ne la donne`);
}
const fichiersAvecH1 = new Set(codes.filter((f) => /<h1\b/.test(sansCommentaires(lire(f)))));
function fichierDuComposant(entree, composant) {
  const t = sansCommentaires(lire(entree));
  const m = new RegExp(`import\\s*\\{[^}]*\\b${composant}\\b[^}]*\\}\\s*from\\s*["'](\\.[^"']+)["']`).exec(t);
  if (!m) return null;
  const base = path.resolve(path.dirname(entree), m[1]);
  return [".tsx", ".ts", "/index.tsx"].map((e) => base + e).find((p) => fs.existsSync(p)) ?? null;
}
for (const page of PAGES) {
  const d = declarees.get(page);
  if (!d) { if (!partiel) faute(racine, 0, "pages", `la page « ${page} » manque (VUES.${page}) : un thème proposé donne les dix pages`); continue; }
  const fichier = fichierDuComposant(d.fichier, d.composant);
  if (!fichier) { faute(d.fichier, 0, "pages", `je ne trouve pas le fichier de ${d.composant} (page ${page}) : un import écrit en toutes lettres, « ./… »`); continue; }
  const t = sansCommentaires(lire(fichier));
  if (page !== "agents") {
    const aH1 = fichiersAvecH1.has(fichier) || [...t.matchAll(/import\s*\{[^}]*\}\s*from\s*["'](\.[^"']+)["']/g)].some((m) => {
      const base = path.resolve(path.dirname(fichier), m[1]);
      const f2 = [".tsx", ".ts"].map((e) => base + e).find((p) => fs.existsSync(p));
      return f2 && fichiersAvecH1.has(f2) && /<\s*(Page|Titre)\b/.test(t);
    });
    if (!aH1) faute(fichier, 0, "pages", `la page « ${page} » doit avoir un <h1> (la page le met au premier plan à son ouverture)`);
  }
  if (page === "accueil") {
    for (const [re, detail] of [[/data-opening-title/, "l'élément [data-opening-title] vers lequel le nuage de points forme le titre"], [/aria-live\s*=\s*["']polite["']/, "aria-live=\"polite\" sur le <h1>"], [/tabIndex\s*=\s*\{-1\}/, "tabIndex={-1} sur le <h1>"], [/\.racine\b/, "la ref `m.racine` sur l'élément le plus haut"], [/\.titre\b/, "la ref `m.titre` sur le <h1>"]]) if (!re.test(t)) faute(fichier, 0, "pages", `Accueil : il manque ${detail}`);
  }
  if (page === "agents") for (const [re, detail] of [[/\.panneau\b/, "la ref `m.panneau` sur l'élément le plus haut"], [/\.piege\b/, "`m.piege` en onKeyDown (le focus reste dans le menu)"], [/\.fermer\b/, "un bouton qui appelle `m.fermer`"]]) if (!re.test(t)) faute(fichier, 0, "pages", `Agents : il manque ${detail}`);
  if (AVEC_FEUILLES[page] && !AVEC_FEUILLES[page].test(t)) faute(fichier, 0, "pages", `la page « ${page} » doit placer sa pièce de feuilles une fois (sinon rien ne s'ouvre)`);
  if (page === "travail" && !/\.retour\b/.test(t)) faute(fichier, 0, "pages", "Travail : le bouton « Accueil » doit appeler `m.retour`");
  if (page === "routines" && !/data-routine-row/.test(t)) faute(fichier, 0, "pages", "Routines : chaque ligne qui ouvre la fiche porte `data-routine-row={id}`");
  const pleins = [...t.matchAll(/<BoutonPlein\b|variant\s*=\s*["']primary["']/g)].length;
  if (pleins > 1) avert(fichier, 0, "bouton", `${pleins} boutons pleins écrits dans « ${page} » : un seul par écran (vérifie qu'ils ne s'affichent pas ensemble)`);
}

/* ---------- le poids ---------- */
const octets = [...codes, ...feuilles].reduce((s, f) => s + fs.statSync(f).size, 0);
if (octets > 250_000) faute(racine, 0, "poids", `${(octets / 1024).toFixed(0)} Ko de sources : trop lourd pour un thème (250 Ko au plus ; le poids ajouté au build est mesuré à la relecture)`);
else if (octets > 120_000) avert(racine, 0, "poids", `${(octets / 1024).toFixed(0)} Ko de sources : lourd`);

for (const l of [...avertissements, ...fautes]) console.log(l);
console.log(`\n${codes.length} fichiers de code, ${feuilles.length} feuilles de style, ${(octets / 1024).toFixed(0)} Ko. ${fautes.length} faute(s), ${avertissements.length} avertissement(s).`);
if (!fautes.length) console.log(partiel ? "Rien à reprendre sur les pages données." : "Le thème passe le contrôle du kit. Reste la relecture (RELECTURE.md).");
process.exit(fautes.length ? 1 : 0);
