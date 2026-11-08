/*
 * Agents. Le menu des agents, ouvert depuis la pastille de l'en-tête. C'est la seule page qui s'ouvre par-dessus les autres : elle n'est
 * dessinée que menu ouvert (`m.ouvert`), et n'a pas de <h1> (le menu se nomme avec `m.titre`, par `aria-label`).
 *
 * Ta vue DOIT : poser `m.panneau` sur l'élément le plus haut et `m.piege` en `onKeyDown` (le focus reste dans le menu), appeler `m.fermer()` au
 * bouton de fermeture. Elle ne pose jamais elle-même la fenêtre qui coupe (éteindre un agent, tout mettre en pause) : elle appelle
 * `m.demanderExtinction(ligne)` et `m.demanderPauseFlotte()`, la page pose la fenêtre avec son maintien. Il n'y a pas de couleur propre à
 * chaque agent : l'agent n'en a pas. Un agent allumé ou occupé a toujours son mot (`lumiereMot`), jamais un point seul.
 */
import type { ModeleAgents } from "../modeles";
import { useTextes } from "./textes";
import { Bouton, Etat, Visage } from "./ui";
import c from "./exemple.module.css";

type LigneAgent = ModeleAgents["lignes"][number];

function Carte({ m, l }: { m: ModeleAgents; l: LigneAgent }) {
  const { t } = useTextes();
  const mots = [l.lumiereMot, l.etat?.mot, l.detail].filter(Boolean).join(" · ");
  return (
    <li className={c.carte} data-ici={l.ici || undefined} data-agent={l.id}>
      <div className={c.agentLigne}>
        {/* Toute la carte passe à cet agent. Le nom accessible commence par le mot affiché. */}
        <button type="button" className={c.ligneBouton} aria-label={l.nomAccessible} aria-current={l.ici ? "true" : undefined} onClick={() => m.choisir(l.id)}>
          <Visage nom={l.nom} photo={l.visage} />
          <span className={c.texte}><b>{l.nom}</b>{mots ? <small>{mots}</small> : null}{l.travail ? <small>{l.travail.texte}{l.travail.attend ? ` · ${l.travail.attend}` : ""}</small> : null}</span>
        </button>
        <span className={c.fin}>
          {l.ici ? <Etat mot={t("ici")} ton="bon" /> : null}
          {l.peutRallumer ? <Bouton onClick={() => m.rallumer(l)} disabled={m.occupe}>{t("rallumer")}</Bouton> : null}
          {l.peutPause ? <Bouton onClick={() => m.mettreEnPause(l)} disabled={m.occupe}>{t("pause")}</Bouton> : null}
          {l.peutReprendre ? <Bouton onClick={() => m.reprendre(l)} disabled={m.occupe}>{t("reprendre")}</Bouton> : null}
          {l.peutEteindre ? <Bouton onClick={() => m.demanderExtinction(l)} disabled={m.occupe}>{t("eteindre")}</Bouton> : null}
          <Bouton onClick={() => m.programmer(l.id)}>{t("fiche")}</Bouton>
        </span>
      </div>
    </li>
  );
}

export function AgentsExemple(m: ModeleAgents) {
  const { t } = useTextes();
  return (
    <div ref={m.panneau} className={c.couche} role="dialog" aria-modal="true" aria-label={m.titre} onKeyDown={m.piege}>
      <div className={c.page}>
        <div className={c.haut}>
          <h2 className={c.titre}>{t("tesAgents")}</h2>
          <button type="button" className={c.retour} data-pm-first onClick={() => m.fermer()}>{t("fermer")}</button>
        </div>
        {m.flotte ? <Bouton onClick={m.flotte.action === "engage" ? m.demanderPauseFlotte : m.reprendreFlotte} disabled={m.occupe}>{m.flotte.libelle}</Bouton> : null}
        {m.noteReinitialisation ? <p className={c.vide}>{t("agentReinitialise")}</p> : null}
        {m.erreurListe ? <p className={c.vide} role="alert">{t("listeIllisible")} <Bouton onClick={m.retenter}>{t("reessayer")}</Bouton></p> : null}
        {m.recherche ? (
          <label className={c.champ}>
            <span>{t("chercherUnAgent")}</span>
            <input type="search" value={m.recherche.valeur} onChange={(event) => m.recherche?.changer(event.target.value)} enterKeyHint="search" autoComplete="off" />
          </label>
        ) : null}
        <ul className={c.liste} aria-label={m.titre}>
          {m.lignes.flatMap((l) => {
            const carte = <Carte key={l.id} m={m} l={l} />;
            return l.intertitre ? [<li key={`t-${l.id}`} role="presentation" className={c.intertitre}>{l.intertitre}</li>, carte] : [carte];
          })}
        </ul>
        {m.aucunResultat ? <p className={c.vide} role="status">{t("personne")}</p> : null}
        {m.voirTous ? <Bouton onClick={m.basculerDeplie}>{m.voirTous.libelle}</Bouton> : null}
        {/* Le menu s'ouvre par-dessus une page qui a déjà son bouton plein : « Nouvel agent » reste discret, comme dans Coffre. */}
        {m.nouvelAgent ? <Bouton onClick={m.nouvelAgent}>{t("nouvelAgent")}</Bouton> : null}
      </div>
    </div>
  );
}
