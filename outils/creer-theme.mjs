#!/usr/bin/env node
/*
 * Crée ton thème à partir de l'exemple, en une commande :
 *
 *     node outils/creer-theme.mjs <id>        ex. : node outils/creer-theme.mjs brume
 *
 * Il copie `exemple/` en `<id>/` et renomme TOUT : les fichiers (style-<id>.ts, style-<id>-pages.ts, <id>.module.css), les composants
 * (AccueilExemple → AccueilBrume…), les identifiants de page (exemple-accueil → brume-accueil), le nom de la palette, la fiche
 * theme.json (id, nom), et ajoute le dossier à `include` dans tsconfig.json. Il ne touche à rien d'autre et n'a besoin d'aucune dépendance.
 *
 * L'id : minuscules, chiffres et tirets, 2 à 25 caractères, commence par une lettre. Refusés : classique, point, carte, bureau (nos thèmes)
 * et exemple (le modèle).
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const kit = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const id = process.argv[2];
const RESERVES = ["classique", "point", "carte", "bureau", "exemple"];
const PAGES = ["Accueil", "Travail", "Catalogue", "Savoir", "Personnalite", "Routines", "Programmer", "Reglages", "Agents", "Compte"];

function arreter(message) { console.error(message); process.exit(1); }
if (!id) arreter("Usage : node outils/creer-theme.mjs <id>   (ex. brume : minuscules, chiffres et tirets, 2 à 25 caractères, commence par une lettre)");
if (!/^[a-z][a-z0-9-]{1,24}$/.test(id)) arreter(`« ${id} » ne va pas : minuscules, chiffres et tirets, 2 à 25 caractères, commence par une lettre.`);
if (RESERVES.includes(id)) arreter(`« ${id} » est réservé (${RESERVES.join(", ")}) : choisis un autre nom.`);
const cible = path.join(kit, id);
if (fs.existsSync(cible)) arreter(`Le dossier « ${id} » existe déjà : rien n'a été touché.`);
if (!fs.existsSync(path.join(kit, "exemple"))) arreter("Le dossier « exemple » manque : lance cette commande depuis le kit.");

const Id = id.split("-").map((m) => m[0].toUpperCase() + m.slice(1)).join("");
const Nom = Id.replace(/([a-z0-9])([A-Z])/g, "$1 $2");
const remplacer = (texte) => {
  let t = texte;
  for (const p of PAGES) t = t.replace(new RegExp(`\\b${p}Exemple\\b`, "g"), `${p}${Id}`);
  return t
    .replace(/(["'`])exemple-/g, `$1${id}-`)
    .replace(/exemple\.module\.css/g, `${id}.module.css`)
    .replace(/style-exemple/g, `style-${id}`)
    .replace(/(data-style(?:-apercu)?=")exemple"/g, `$1${id}"`)
    .replace(/« exemple » est le nom du thème : le tien remplace ce mot partout dans ce fichier\./g, `« ${id} » est le nom du thème : il doit être l'« id » de theme.json.`)
    .replace(/thème d'exemple/g, `thème ${id}`);
};

fs.cpSync(path.join(kit, "exemple"), cible, { recursive: true });
for (const nom of fs.readdirSync(cible)) {
  const f = path.join(cible, nom);
  const nouveau = nom.replace(/exemple/g, id);
  if (/\.(ts|tsx|css)$/.test(nom)) fs.writeFileSync(f, remplacer(fs.readFileSync(f, "utf8")));
  if (nouveau !== nom) fs.renameSync(f, path.join(cible, nouveau));
}
const fiche = path.join(cible, "theme.json");
const j = JSON.parse(fs.readFileSync(fiche, "utf8"));
fs.writeFileSync(fiche, JSON.stringify({
  ...j, id, nom: Nom,
  description: "À écrire : une phrase qui dit ce que ton thème a de particulier (120 caractères au plus).",
  auteur: { nom: "À remplir" },
}, null, 2) + "\n");

const tsconfig = path.join(kit, "tsconfig.json");
if (fs.existsSync(tsconfig)) {
  const c = JSON.parse(fs.readFileSync(tsconfig, "utf8"));
  if (Array.isArray(c.include) && !c.include.includes(id)) { c.include.push(id); fs.writeFileSync(tsconfig, JSON.stringify(c, null, 2) + "\n"); }
}
console.log(`Thème « ${id} » créé dans ${id}/ (composants ${PAGES[0]}${Id}…, ${id}.module.css, style-${id}.ts).`);
console.log("À faire : theme.json (nom, description, auteur, licence), apercu.webp, puis tes couleurs et tes vues. Ensuite : npm run types && node outils/controler-theme.mjs " + id);
