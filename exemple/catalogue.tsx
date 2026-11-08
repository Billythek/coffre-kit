/*
 * Catalogue. Ce qu'on peut ajouter à l'agent : des savoir-faire, des connexions, des modèles de routine.
 *
 * C'est un petit parcours : un accueil (la recherche par envie, les « portes », les étagères), puis des pages de détail et des feuilles.
 * Ta vue dessine l'accueil, l'en-tête et les portes ; le reste arrive en pièces, les mêmes dans tous les thèmes :
 *  - `Detail` : la page de détail ouverte (à placer À LA PLACE du reste quand `m.detail` est vrai) ;
 *  - `Rayon` : tout ce qui n'est pas l'accueil (étagères, listes, quartier), à placer sous le titre quand `m.accueil` est faux ;
 *  - `Feuilles` : les feuilles (ajouter, brancher, créer). À placer une fois.
 * Elle DOIT aussi poser `m.page`, avoir un <h1> (caché si `m.titreVisible` est faux) et appeler `m.retour` quand `m.peutRevenir`.
 * Le seul bouton plein de la page : aucun (ajouter se fait ligne par ligne, par un bouton fin).
 */
import type { ModeleCatalogue } from "../modeles";
import { useTextes } from "./textes";
import { Bouton, Etat, Groupe, Liste, Ligne, Page } from "./ui";
import c from "./exemple.module.css";

type Dire = ReturnType<typeof useTextes>["t"];
/* Les types des morceaux du modèle se prennent sur le modèle lui-même : un seul import suffit. */
type PorteCatalogue = ModeleCatalogue["portes"][number];
type EntreeCatalogue = NonNullable<ModeleCatalogue["resultats"]>["trouves"][number];

/** Une ligne du catalogue : un savoir-faire, une connexion ou une routine toute prête. Le `switch` couvre les trois sortes. */
function LigneEntree({ e, t }: { e: EntreeCatalogue; t: Dire }) {
  switch (e.sorte) {
    case "savoir":
      return (
        <Ligne
          titre={e.nom}
          sous={e.echec ?? e.demande?.mot ?? e.ligne}
          // Un savoir-faire qui ne demande rien s'ajoute d'un toucher ; sinon la ligne ouvre sa fiche. « Annuler » dure 5 s : c'est Coffre qui le tient.
          fin={e.installe ? <Etat mot={t("ajoute")} ton="bon" /> : e.plus ? <Bouton onClick={e.ajouter} disabled={e.phase === "envoi"}>{e.phase === "retenu" ? t("annuler") : t("ajouter")}</Bouton> : null}
          ouvrir={e.plus ? null : e.ouvrir}
        />
      );
    case "service":
      // Le vrai logo du service n'est pas dessiné ici : il vient d'une pièce de Coffre. `e.logoId` est son identifiant.
      return <Ligne titre={e.nom} sous={e.demande?.mot} fin={e.installe ? <Etat mot={t("ajoute")} ton="bon" /> : null} ouvrir={e.ouvrir} />;
    case "routine":
      return <Ligne titre={e.nom} sous={e.meta} ouvrir={e.attend ? null : e.ouvrir} />;
  }
}

/** Une porte : un quartier du catalogue. Elle s'ouvre sur ce qu'on peut y faire, rangé par ce que ça demande. */
function Porte({ p, t }: { p: PorteCatalogue; t: Dire }) {
  const compte = p.total ? t("aEssayer", { n: p.total }) : t("toutEstLa");
  return (
    <li className={c.carte}>
      <details>
        <summary><b>{p.nom}</b><small>{p.ligne}</small><span className={c.fin}>{compte}</span></summary>
        {p.tout.length > 0 ? <Groupe id={`porte-${p.id}-tout`} titre={t("ilLeFaitTout")}><Liste>{p.tout.map((e) => <LigneEntree key={e.id} e={e} t={t} />)}</Liste></Groupe> : null}
        {p.routines.length > 0 ? <Groupe id={`porte-${p.id}-routines`} titre={t("ilSenOccupe")}><Liste>{p.routines.map((e) => <LigneEntree key={e.id} e={e} t={t} />)}</Liste></Groupe> : null}
        {p.services.length + p.accord.length > 0 ? (
          <Groupe id={`porte-${p.id}-accord`} titre={t("avecTonAccord")}>
            <Liste>{[...p.services, ...p.accord].map((e) => <LigneEntree key={`${e.sorte}:${e.id}`} e={e} t={t} />)}</Liste>
          </Groupe>
        ) : null}
      </details>
    </li>
  );
}

export function CatalogueExemple(m: ModeleCatalogue) {
  const { t } = useTextes();
  const { Feuilles, Detail, Rayon, InlineError, SkeletonRows } = m.pieces;
  const r = m.resultats;
  return (
    <Page
      racine={m.page}
      id="exemple-catalogue"
      titre={m.detail ? null : m.titre}
      titreVisible={m.titreVisible}
      phrase={m.detail ? null : m.phrase}
      retour={m.peutRevenir ? { mot: m.retourVers, agir: m.retour } : null}
      haut={m.recherchable ? <Bouton onClick={m.basculerRecherche}>{m.cherche ? t("fermer") : t("chercher")}</Bouton> : null}
    >
      {m.detail ? <Detail modele={m} /> : m.accueil ? (
        m.chargement ? (
          m.erreur ? <InlineError error={m.erreur} onRetry={m.relire} busy={m.relit} rows={4} /> : <SkeletonRows rows={m.rangs} label={t("lecture")} />
        ) : (
          <>
            <label className={c.champ}>
              <span>{t("tuVeux")}</span>
              <input type="search" value={m.envie} placeholder={t("tuVeuxExemple")} onChange={(event) => m.setEnvie(event.target.value)} enterKeyHint="search" autoComplete="off" />
            </label>
            {r ? (
              <Groupe id="exemple-catalogue-trouve" titre={t("trouve", { n: r.nombre })}>
                <Liste>
                  {r.portes.map((p) => <Ligne key={p.id} titre={p.nom} sous={p.ligne} fin={t("aEssayer", { n: p.total })} ouvrir={p.ouvrir} />)}
                  {r.trouves.map((e) => <LigneEntree key={`${e.sorte}:${e.id}`} e={e} t={t} />)}
                </Liste>
              </Groupe>
            ) : (
              <>
                <ul className={c.liste}>{m.portes.map((p) => <Porte key={p.id} p={p} t={t} />)}</ul>
                {m.chezToi ? <Liste><Ligne titre={m.chezToi.nom} sous={m.chezToi.ligne} fin={m.chezToi.compte} ouvrir={m.chezToi.ouvrir} /></Liste> : null}
                <Groupe id="exemple-catalogue-tout" titre={t("toutLeCatalogue")}>
                  <Liste>{m.etageres.map((e) => <Ligne key={e.id} titre={e.nom} sous={e.ligne} fin={e.compte} ouvrir={e.ouvrir} />)}</Liste>
                </Groupe>
                <Bouton onClick={m.ouvrirAdresse}>{t("ajouterParAdresse")}</Bouton>
              </>
            )}
          </>
        )
      ) : <Rayon modele={m} />}
      <Feuilles modele={m} />
    </Page>
  );
}
