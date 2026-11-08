// Le banc du kit : le thème d'exemple passe le contrôle, et le contrôle n'est pas aveugle (chaque faute glissée dans une copie est vue).
//     node --test outils/controles.test.mjs
import test from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const ici = path.dirname(fileURLToPath(import.meta.url));
const kit = path.resolve(ici, "..");
const controle = path.join(ici, "controler-theme.mjs");
const exemple = path.join(kit, "exemple");

function lancer(dossier, ...options) {
  const r = spawnSync(process.execPath, [controle, dossier, ...options], { encoding: "utf8" });
  return { code: r.status, sortie: r.stdout + r.stderr };
}
/** Une copie de l'exemple, modifiée par `abimer(dossier)`. */
function copie(abimer) {
  const d = fs.mkdtempSync(path.join(os.tmpdir(), "kit-theme-"));
  fs.cpSync(exemple, d, { recursive: true });
  abimer(d);
  return d;
}
const reecrire = (d, fichier, f) => { const p = path.join(d, fichier); fs.writeFileSync(p, f(fs.readFileSync(p, "utf8"))); };

test("le thème d'exemple passe le contrôle sans faute ni avertissement", () => {
  const r = lancer(exemple);
  assert.equal(r.code, 0, r.sortie);
  assert.match(r.sortie, /0 faute\(s\), 0 avertissement\(s\)/);
});

test("le contrôle voit les fautes de theme.json : fichier absent, champ inconnu, id d'un de nos thèmes, page annoncée sans vue, contrat d'une autre famille", () => {
  const modif = (f) => lancer(copie((d) => reecrire(d, "theme.json", (t) => JSON.stringify(f(JSON.parse(t)), null, 2))));
  const cas = [
    [(j) => ({ ...j, empreinteRelue: {} }), /champ inconnu/],
    [(j) => ({ ...j, id: "carte" }), /nom d'un de nos thèmes/],
    [(j) => ({ ...j, id: "autre" }), /doivent porter le même nom|doit être l'« id »/],
    [(j) => ({ ...j, version: "1.0" }), /« version »/],
    [(j) => ({ ...j, licence: "GPL" }), /« licence »/],
    [(j) => ({ ...j, contrat: "9.0" }), /le premier chiffre/],
    [(j) => ({ ...j, pages: j.pages.filter((p) => p !== "compte") }), /il manque compte/],
    [(j) => ({ ...j, apercu: "absent.webp" }), /« apercu »/],
    [(j) => ({ ...j, auteur: { nom: "A", lien: "http://x.test" } }), /https/],
    [(j) => ({ ...j, pages: [...j.pages, "entete"] }), /« entete » est refusé/],
    [(j) => { const { description, ...reste } = j; return reste; }, /« description » manque/],
    [(j) => ({ ...j, description: "x".repeat(121) }), /120 caractères au plus/],
    [(j) => ({ ...j, nom: 12 }), /« nom » : du texte attendu/],
    [(j) => ({ ...j, id: "B" }), /« id »/],
    [(j) => ({ ...j, pages: j.pages.concat("inconnue") }), /« pages\[10\] »/],
  ];
  for (const [f, attendu] of cas) { const r = modif(f); assert.equal(r.code, 1, r.sortie); assert.match(r.sortie, attendu); }
  const sans = lancer(copie((d) => fs.rmSync(path.join(d, "theme.json"))));
  assert.equal(sans.code, 1);
  assert.match(sans.sortie, /theme\.json manque/);
});

test("l'exemple donne les dix pages, et le contrôle exige les dix", () => {
  const vues = fs.readFileSync(path.join(exemple, "style-exemple.ts"), "utf8") + fs.readFileSync(path.join(exemple, "style-exemple-pages.ts"), "utf8");
  for (const page of ["accueil", "travail", "catalogue", "savoir", "personnalite", "routines", "programmer", "reglages", "agents", "compte"]) assert.match(vues, new RegExp(`\\b${page}\\s*:`), page);
  const r = lancer(copie((d) => reecrire(d, "style-exemple-pages.ts", (t) => t.replace(/\n\s*compte: CompteExemple,/, ""))));
  assert.equal(r.code, 1);
  assert.match(r.sortie, /la page « compte » manque/);
  assert.equal(lancer(copie((d) => reecrire(d, "style-exemple-pages.ts", (t) => t.replace(/\n\s*compte: CompteExemple,/, ""))), "--partiel").code, 0, "en --partiel, une page absente n'est pas une faute");
});

// Chaque ligne : [ce qu'on glisse dans travail.tsx, la règle attendue].
const FAUTES = [
  ['const r = await fetch("/x");', /\[réseau\]/],
  ["new XMLHttpRequest();", /\[réseau\]/],
  ["window.localStorage.setItem('a', 'b');", /\[(page|stockage)\]/],
  ["localStorage.getItem('a');", /\[stockage\]/],
  ["document.cookie = 'a=b';", /\[stockage\]/],
  ["eval('1');", /\[exécution\]/],
  ["const x = { dangerouslySetInnerHTML: { __html: '' } };", /\[exécution\]/],
  ["const u = 'https://exemple.test/x';", /\[adresse\]/],
  ["const u = '//cdn.exemple.test/x.js';", /\[adresse\]/],
  ["navigator.vibrate(10);", /\[appareil\]/],
  ["const lu = personalRead('x');", /\[lecture\]/],
  ["const lu = useCachedRead('x');", /\[lecture\]/],
  ["window.Telegram.WebApp.close();", /\[page\]/],
  ["document.getElementById('a');", /\[page\]/],
  // les contournements fermés (v1.2)
  ['window["fe"+"tch"]("/x");', /\[(page|obfuscation)\]/],
  ['self["fetch"]("/x");', /\[page\]/],
  ["const w = document.documentElement.ownerDocument.defaultView;", /\[page\]/],
  ["document.documentElement.appendChild(document.documentElement);", /\[page\]/],
  ['[].filter.constructor("return fetch")();', /\[(exécution|réseau)\]/],
  ["(0, eval)('1');", /\[exécution\]/],
  ["const u = import.meta.url;", /\[imports\]/],
  ["const f = fetch;", /\[réseau\]/],
  ['const s = "h" + "ttps://x.test";', /\[obfuscation\]/],
  ["const s = `${'h'}ttps`;", /\[obfuscation\]/],
  ['const s = ["h", "ttps"].join("");', /\[obfuscation\]/],
  ["const s = String.fromCharCode(102, 101);", /\[obfuscation\]/],
  ['const s = "\\u0075rl(";', /\[obfuscation\]/],
  ["const i = new Image();", /\[réseau\]/],
  ["const poser = (e: HTMLElement) => e.setAttribute('src', 'x');", /\[page\]/],
  ["const poser = (e: HTMLImageElement) => { e.src = 'x'; };", /\[page\]/],
  ['setTimeout("a()", 1);', /\[exécution\]/],
  ['const st = { backgroundImage: "url(x)" };', /\[adresse\]/],
];
for (const [code, regle] of FAUTES) {
  test(`le contrôle voit : ${code.slice(0, 50)}`, () => {
    const r = lancer(copie((d) => reecrire(d, "travail.tsx", (t) => t + `\n${code}\n`)));
    assert.equal(r.code, 1, r.sortie);
    assert.match(r.sortie, regle);
  });
}

test("le contrôle voit un import qui sort du dossier, une dépendance de plus, un import de valeur depuis le contrat", () => {
  for (const [ligne, attendu] of [
    ['import { x } from "../../prototype/kit/rows";', /sort du dossier/],
    ['import lodash from "lodash";', /aucune dépendance/],
    ['import { Lang } from "../modeles";', /import type/],
    ['const m = import("./ui");', /\[imports\]/],
  ]) {
    const r = lancer(copie((d) => reecrire(d, "travail.tsx", (t) => ligne + "\n" + t)));
    assert.equal(r.code, 1, ligne);
    assert.match(r.sortie, attendu, ligne);
  }
});

test("le contrôle voit une balise qui charge ou qui navigue, une image avec une adresse, un texte en dur", () => {
  for (const [ajout, attendu] of [
    ["export const A = () => <iframe src={x} />;", /\[balises\]/],
    ["export const A = () => <script>{1}</script>;", /\[balises\]/],
    ["export const A = () => <a href={x}>{x}</a>;", /\[balises\]/],
    ['export const A = () => <img src="/a.png" alt="" />;', /une image ne s'écrit jamais avec une adresse/],
    ["export const A = () => <p>Bonjour tout le monde</p>;", /texte en dur/],
    ['export const A = () => <button aria-label="Fermer la page" />;', /texte en dur/],
  ]) {
    const r = lancer(copie((d) => reecrire(d, "ui.tsx", (t) => t + "\n" + ajout + "\n")));
    assert.equal(r.code, 1, ajout);
    assert.match(r.sortie, attendu, ajout);
  }
});

test("le contrôle voit les balises et attributs qui chargent (vidéo, son, source) et une image à adresse composée", () => {
  for (const [ajout, attendu] of [
    ["export const A = () => <video src={x} />;", /\[balises\]/],
    ["export const A = () => <audio src={x} />;", /\[balises\]/],
    ["export const A = () => <source src={x} />;", /\[balises\]/],
    ['export const A = (m: { p: string }) => <img src={"/a/" + m.p} alt="" />;', /un texte composé/],
    ["export const A = (m: { p: string }) => <img src={`/a/${m.p}`} alt=\"\" />;", /un texte composé/],
    ["export const A = (m: { p: string }) => <button srcSet={m.p} />;", /\[adresse\]/],
    ["export const A = (m: { p: string }) => <button formAction={m.p} />;", /\[adresse\]/],
  ]) {
    const r = lancer(copie((d) => reecrire(d, "ui.tsx", (t) => t + "\n" + ajout + "\n")));
    assert.equal(r.code, 1, ajout + "\n" + r.sortie);
    assert.match(r.sortie, attendu, ajout);
  }
});

test("le contrôle voit un fichier qui n'est pas du code (image, police, JSON)", () => {
  for (const nom of ["logo.png", "police.woff2", "donnees.json", "index.html"]) {
    const r = lancer(copie((d) => fs.writeFileSync(path.join(d, nom), "x")));
    assert.equal(r.code, 1, nom);
    assert.match(r.sortie, /\[fichiers\]/, nom);
  }
});

test("le contrôle voit les fautes de feuille de style : adresse, police apportée, durée libre, mouvement non coupé", () => {
  const r1 = lancer(copie((d) => reecrire(d, "exemple.module.css", (t) => t + "\n.x { background: url(https://exemple.test/a.png); }\n")));
  assert.match(r1.sortie, /\[adresse\]/);
  const r2 = lancer(copie((d) => reecrire(d, "exemple.module.css", (t) => t + '\n@font-face { font-family: "Mienne"; src: local("x"); }\n')));
  assert.match(r2.sortie, /\[polices\]/);
  const r3 = lancer(copie((d) => reecrire(d, "exemple.module.css", (t) => t.replace("background-color 140ms", "background-color 333ms"))));
  assert.match(r3.sortie, /durée de 333 ms/);
  const r4 = lancer(copie((d) => reecrire(d, "exemple.module.css", (t) => t.replace(/@media \(prefers-reduced-motion: reduce\)[\s\S]*$/, ""))));
  assert.match(r4.sortie, /ne le coupe pas en mouvement réduit/);
  const r5 = lancer(copie((d) => reecrire(d, "exemple.module.css", (t) => t + '\n[data-style="exemple"] .a { color: red; }\n')));
  assert.match(r5.sortie, /html:root/);
  for (const r of [r1, r2, r3, r4, r5]) assert.equal(r.code, 1);
});

test("le contrôle voit les contournements CSS : échappement, image-set, règle hors des classes du thème, :global, palette qui sort de ses jetons", () => {
  const css = (ajout) => lancer(copie((d) => reecrire(d, "exemple.module.css", (t) => t + "\n" + ajout + "\n")));
  for (const [ajout, attendu] of [
    [".x { background: u\\72l(a.png); }", /antislash/],
    [".x { background: image-set(a 1x); }", /image-set/],
    [".x { background: -webkit-image-set(a 1x); }", /image-set/],
    [".x { background: cross-fade(a, b); }", /cross-fade/],
    ["body { display: none; }", /ne vise aucune classe/],
    ["html:root { display: none; }", /ne vise aucune classe/],
    [".x, body { display: none; }", /ne vise aucune classe/],
    ["* { display: none; }", /ne vise aucune classe/],
    [":global(body) { display: none; }", /:global/],
    ["@namespace svg url(x);", /@namespace/],
  ]) {
    const r = css(ajout);
    assert.equal(r.code, 1, ajout + "\n" + r.sortie);
    assert.match(r.sortie, attendu, ajout);
  }
  const p1 = lancer(copie((d) => reecrire(d, "palette.css", (t) => t + "\nbody { display: none; }\n")));
  assert.match(p1.sortie, /la palette ne contient que les quatre blocs/);
  const p2 = lancer(copie((d) => reecrire(d, "palette.css", (t) => t.replace("--background: #EEF0F2;", "--background: #EEF0F2; display: none;"))));
  assert.match(p2.sortie, /ne déclare que des jetons/);
  for (const r of [p1, p2]) assert.equal(r.code, 1);
});

test("le contrôle voit les fautes de palette : un jeton oublié, une vignette différente, un contraste trop bas", () => {
  const r1 = lancer(copie((d) => reecrire(d, "palette.css", (t) => t.replace(/\n\s*--border-strong:[^;]*;/g, ""))));
  assert.match(r1.sortie, /jetons manquants[^\n]*--border-strong/);
  const r2 = lancer(copie((d) => reecrire(d, "palette.css", (t) => t.replace(/(\[data-style-apercu="exemple"\]\[data-scheme="light"\] \{[\s\S]*?--accent:) #[0-9A-F]{6}/, "$1 #FF0000"))));
  assert.match(r2.sortie, /la vignette montrerait un autre thème/);
  const r3 = lancer(copie((d) => reecrire(d, "palette.css", (t) => t.replace(/(--text-muted:) #[0-9A-F]{6}/g, "$1 #B0B0B0"))));
  assert.match(r3.sortie, /--text-muted sur --surface fait/);
  const r4 = lancer(copie((d) => reecrire(d, "palette.css", (t) => t.replace(/--font-mono: /g, '--font-mono: "Ma Police", '))));
  assert.match(r4.sortie, /n'est servie par personne/);
  const r5 = lancer(copie((d) => reecrire(d, "palette.css", (t) => t.replace(/--background: #EEF0F2;/g, "--background: oklch(95% 0.005 250);"))));
  assert.match(r5.sortie, /--background doit s'écrire en hexadécimal/);
  const r6 = lancer(copie((d) => reecrire(d, "theme.json", (t) => t.replace(/"clair": "#[0-9A-Fa-f]{6}"/, '"clair": "#123456"'))));
  assert.match(r6.sortie, /couleurs\.clair[^\n]*doit être le --background/);
  const r7 = lancer(copie((d) => reecrire(d, "theme.json", (t) => t.replace(/,\s*"couleurs": \{[^}]*\}/, ""))));
  assert.match(r7.sortie, /couleurs[^\n]*manque/);
  for (const r of [r1, r2, r3, r4, r5, r6, r7]) assert.equal(r.code, 1);
});

test("le contrôle voit le jargon et le vouvoiement dans les mots, et une note manquante", () => {
  const r1 = lancer(copie((d) => reecrire(d, "textes.ts", (t) => t.replace('fr: "Accueil"', 'fr: "Tableau Hermès"'))));
  assert.match(r1.sortie, /\[vocabulaire\][^\n]*Hermès/);
  const r1b = lancer(copie((d) => reecrire(d, "textes.ts", (t) => t.replace('fr: "Nouvelle messagerie"', 'fr: "Créer son bot"'))));
  assert.match(r1b.sortie, /\[vocabulaire\][^\n]*bot/);
  const r2 = lancer(copie((d) => reecrire(d, "textes.ts", (t) => t.replace('fr: "Tes agents"', 'fr: "Vos agents"'))));
  assert.match(r2.sortie, /on tutoie/);
  const r3 = lancer(copie((d) => reecrire(d, "textes.ts", (t) => t.replace('note: "Title of the agents menu."', 'note: ""'))));
  assert.match(r3.sortie, /une « note »/);
  for (const r of [r1, r2, r3]) assert.equal(r.code, 1, r.sortie);
});

test("le contrôle voit une page sans <h1>, un Accueil sans l'élément du nuage de points, une feuille oubliée", () => {
  const r1 = lancer(copie((d) => reecrire(d, "accueil.tsx", (t) => t.replace(/ data-opening-title=\{m\.headline\}/, ""))));
  assert.match(r1.sortie, /data-opening-title/);
  const r2 = lancer(copie((d) => reecrire(d, "routines.tsx", (t) => t.replace(/<Feuilles modele=\{m\} \/>(?![\s\S]*<Feuilles modele)/, ""))));
  assert.match(r2.sortie, /pièce de feuilles/);
  const r3 = lancer(copie((d) => { reecrire(d, "ui.tsx", (t) => t.replace(/<h1 /, "<h2 ")); }));
  assert.match(r3.sortie, /doit avoir un <h1>/);
  for (const r of [r1, r2, r3]) assert.equal(r.code, 1, r.sortie);
});

test("le contrôle voit le nom d'un de nos thèmes et un thème à deux noms", () => {
  const r1 = lancer(copie((d) => reecrire(d, "palette.css", (t) => t.replace(/"exemple"/g, '"carte"'))));
  assert.match(r1.sortie, /nom d'un de nos thèmes/);
  const r2 = lancer(copie((d) => fs.writeFileSync(path.join(d, "style-autre.ts"), "export const VUES = {};\n")));
  assert.match(r2.sortie, /exactement deux fichiers d'entrée/);
});

test("creer-theme copie l'exemple sous un nouvel id, renomme tout, et refuse les ids réservés ou mal formés", () => {
  const racine = fs.mkdtempSync(path.join(os.tmpdir(), "kit-creer-"));
  fs.mkdirSync(path.join(racine, "outils"));
  fs.copyFileSync(path.join(ici, "creer-theme.mjs"), path.join(racine, "outils/creer-theme.mjs"));
  fs.cpSync(exemple, path.join(racine, "exemple"), { recursive: true });
  fs.writeFileSync(path.join(racine, "tsconfig.json"), JSON.stringify({ include: ["contrat", "exemple"] }));
  const creer = (nom) => spawnSync(process.execPath, [path.join(racine, "outils/creer-theme.mjs"), nom], { encoding: "utf8" });
  for (const mauvais of ["point", "classique", "carte", "bureau", "exemple", "Brume", "1brume", "b", "brume_x"]) assert.equal(creer(mauvais).status, 1, mauvais);
  const r = creer("brume");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.equal(creer("brume").status, 1, "un dossier existant n'est pas écrasé");
  const dossier = path.join(racine, "brume");
  for (const f of ["style-brume.ts", "style-brume-pages.ts", "brume.module.css"]) assert.ok(fs.existsSync(path.join(dossier, f)), f);
  const tout = fs.readdirSync(dossier).filter((f) => /\.(ts|tsx|css)$/.test(f)).map((f) => fs.readFileSync(path.join(dossier, f), "utf8")).join("\n");
  assert.doesNotMatch(tout, /\w+Exemple\b(?<!tuVeuxExemple)/, "plus de composant *Exemple");
  assert.doesNotMatch(tout, /["'`]exemple-|data-style(-apercu)?="exemple"|exemple\.module/);
  assert.match(tout, /AccueilBrume/);
  assert.equal(JSON.parse(fs.readFileSync(path.join(dossier, "theme.json"), "utf8")).id, "brume");
  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(racine, "tsconfig.json"), "utf8")).include, ["contrat", "exemple", "brume"]);
  const c = lancer(dossier);
  assert.equal(c.code, 0, c.sortie);
});

test("le contrôle lit la taille de la vignette dans l'en-tête WebP : 320 × 200 exigé", () => {
  const ok = lancer(exemple);
  assert.equal(ok.code, 0, ok.sortie);
  // un WebP sans perte (VP8L) de 100 × 100 : en-tête minimal valide pour la lecture de la taille
  const en = Buffer.alloc(40);
  en.write("RIFF", 0, "ascii"); en.writeUInt32LE(32, 4); en.write("WEBP", 8, "ascii"); en.write("VP8L", 12, "ascii"); en.writeUInt32LE(20, 16);
  en[20] = 0x2f; en.writeUInt32LE(99 | (99 << 14), 21);
  const r = lancer(copie((d) => fs.writeFileSync(path.join(d, "apercu.webp"), en)));
  assert.equal(r.code, 1, r.sortie);
  assert.match(r.sortie, /100 × 100, il faut 320 × 200/);
});
