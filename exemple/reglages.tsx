/*
 * Réglages de l'agent. Des tuiles rangées par groupe ; chacune a une seule maison (un réglage ne vit que dans une tuile).
 *
 * Une tuile n'existe que si l'installation a tout ce qu'il lui faut : ce qui manque n'est pas dessiné. Une tuile « d'attente » garde sa place
 * le temps de la lecture (pas de saut de page quand elle arrive). `tuile.toucher()` ouvre la feuille de la tuile ; la feuille est une pièce
 * de Coffre (`Feuille`, à placer une fois) : ses brouillons, sa preuve et « Appliquer » ne se réécrivent pas.
 * Cette page n'a pas de bouton plein : ouvrir une tuile n'est pas une décision.
 */
import type { ModeleReglages } from "../modeles";
import { useTextes } from "./textes";
import { Etat, Liste, Page } from "./ui";
import c from "./exemple.module.css";

type Tuile = Extract<ModeleReglages["groupes"][number]["tuiles"][number], { toucher(): void }>;

/** Ce qui se dit à droite d'une tuile : un niveau (points), un nombre, ou un remplissage. Toujours écrit en mots aussi. */
function Mini({ tuile, t }: { tuile: Tuile; t: ReturnType<typeof useTextes>["t"] }) {
  const mini = tuile.mini;
  if (!mini) return null;
  if (mini.type === "nombre") return <b>{mini.n}</b>;
  if (mini.type === "barre") return <b>{t("memoireUtilisee", { n: mini.pct })}</b>;
  return <b>{t("niveau", { n: mini.allumes, total: mini.total })}</b>;
}

export function ReglagesExemple(m: ModeleReglages) {
  const { t } = useTextes();
  const { Feuille, InlineError, Age, Skeleton } = m.pieces;
  const { modele, memoire, memoirePleine } = m.etat;
  const dit = modele !== null || memoire !== null || memoirePleine;
  return (
    <Page id="exemple-reglages" titre={m.titre} retour={{ mot: m.retour.label, agir: m.retour.ouvrir }}>
      {/* La carte de l'agent : seulement ce que la lecture a donné (le modèle qui répond, la mémoire utilisée). */}
      {dit ? (
        <p className={c.phrase}>
          {modele !== null ? t("jeTourneSur", { modele }) : null}{" "}
          {memoirePleine ? t("memoirePleine") : memoire !== null ? t("memoireUtilisee", { n: memoire }) : null}
        </p>
      ) : null}
      {m.echec ? <InlineError primary hint={t("relireHint")} error={m.echec.erreur} busy={m.echec.occupe} onRetry={m.echec.reessayer} /> : null}
      {m.garde !== null ? <Age at={m.garde} /> : null}

      <label className={c.champ}>
        <span>{t("chercherUnReglage")}</span>
        <input type="search" value={m.recherche.valeur} onChange={(event) => m.recherche.changer(event.target.value)} enterKeyHint="search" autoComplete="off" />
      </label>

      {m.groupes.map((groupe) => (
        <section key={groupe.id} className={c.groupe} aria-labelledby={`exemple-reglages-${groupe.id}`}>
          <h2 id={`exemple-reglages-${groupe.id}`} className={c.intertitre}>{groupe.titre}</h2>
          <Liste>
            {groupe.tuiles.map((tuile) => "attente" in tuile ? (
              <li key={tuile.id} className={c.ligne} aria-hidden="true"><div className={c.ligneBouton}><Skeleton width="45%" height={14} /></div></li>
            ) : (
              <li key={tuile.id} className={c.ligne} data-tile={tuile.id}>
                <button type="button" className={c.ligneBouton} disabled={tuile.occupe} aria-busy={tuile.enCours || undefined} onClick={tuile.toucher}>
                  <span className={c.texte}><b>{tuile.titre}</b>{tuile.sous ? <small>{tuile.sous}</small> : null}</span>
                  {tuile.issue ? <Etat mot={tuile.issue} /> : null}
                  <span className={c.aller} aria-hidden="true">›</span>
                </button>
                {/* Un réglage posé à côté (le choix du modèle sur « Son cerveau ») : il s'écrit tout seul, on le place tel quel. */}
                <span className={c.fin}><Mini tuile={tuile} t={t} />{tuile.aside}</span>
              </li>
            ))}
          </Liste>
        </section>
      ))}
      {m.aucune ? <p className={c.vide} role="status">{t("aucunReglage")}</p> : null}
      {m.statut ? <p className={c.vide} role={m.statut.erreur ? "alert" : "status"}>{m.statut.texte}</p> : null}
      <Feuille modele={m} />
    </Page>
  );
}
