/*
 * Mon compte. Seulement la personne : son abonnement, ses préférences, la suppression de son compte. Rien de ce que dit son agent n'est ici.
 *
 * Ta vue DOIT : avoir un <h1> ; placer `<Theme />` (la ligne « Thème » et sa feuille de choix : on ne la réécrit pas) et `<Feuilles modele={m} />`
 * une fois (appareils, traduction, installations) ; placer `<Suppression modele={m} />` quand `m.suppressionDuCompte` n'est pas null.
 * Elle ne retire aucune action. Quand le compte est en cours de suppression (`m.fermeture`), seul son état reste, et « Récupérer » s'il existe :
 * c'est l'unique bouton plein de la page dans ce cas.
 */
import type { ModeleCompte } from "../modeles";
import { useTextes } from "./textes";
import { Bouton, BoutonPlein, Choix, Groupe, Liste, Ligne, Page, Visage } from "./ui";
import c from "./exemple.module.css";

export function CompteExemple(m: ModeleCompte) {
  const { t } = useTextes();
  const { Theme, Feuilles, Suppression } = m.pieces;
  const nom = m.moi?.nom || (m.moi?.pseudo ? `@${m.moi.pseudo}` : "");

  // Le compte dont la suppression est demandée (ou faite) : seul son état reste, et, avant la date, sa récupération.
  if (m.fermeture) {
    return (
      <Page id="exemple-compte" titre={t("monCompte")} phrase={m.fermeture.le ? t("effacementLe", { jour: m.fermeture.le }) : t("effacementEnCours")}>
        {m.fermeture.recuperable ? <BoutonPlein onClick={m.fermeture.recuperer}>{t("recuperer")}</BoutonPlein> : null}
      </Page>
    );
  }
  return (
    <Page id="exemple-compte" titre={t("monCompte")} phrase={m.abonnement.texte}>
      {/* Ta photo et ton nom, tels que Telegram les donne (rien d'autre). Hors de Telegram, `m.moi` est null : rien à montrer. */}
      {m.moi ? (
        <div className={c.identite}>
          <Visage nom={nom || t("toi")} photo={m.moi.photo} taille={56} />
          <span className={c.texte}><b>{nom}</b>{m.identite ? <small>{m.identite}</small> : null}</span>
        </div>
      ) : null}
      {m.abonnement.gerer || m.installations ? (
        <div className={c.rang}>
          {m.abonnement.gerer ? <Bouton onClick={m.abonnement.gerer}>{t("gererAbonnement")}</Bouton> : null}
          {m.installations ? <Bouton onClick={m.installations}>{t("mesInstallations")}</Bouton> : null}
        </div>
      ) : null}

      <Groupe id="exemple-compte-preferences" titre={t("preferences")}>
        {/* La langue de Coffre : un choix appliqué à l'instant (« Annuler » 5 s, Coffre le tient). */}
        <Choix label={t("langue")} valeur={m.langue.choix} choisir={m.langue.choisir} options={m.langue.options.map((o) => ({ id: o.valeur, mot: o.valeur === "auto" ? t("auto") : o.nom }))} />
        <Liste>
          {m.traduites !== null ? <Ligne titre={t("descriptionsTraduites")} fin={m.traduites ? t("sur3", { n: m.traduites }) : t("non")} ouvrir={m.ouvrirTraduction} /> : null}
          <Theme />
          <Ligne titre={t("appareils")} fin={m.appareils === null ? null : String(m.appareils)} ouvrir={m.ouvrirAppareils} />
          <Ligne titre={t("premiersPas")} ouvrir={m.premiersPas} />
          {m.ecranAccueil === "absent" ? <Ligne titre={t("ecranAccueil")} ouvrir={m.ajouterEcranAccueil} /> : null}
          {m.ecranAccueil === "ajoute" ? <Ligne titre={t("ecranAccueil")} fin={t("fait")} /> : null}
        </Liste>
      </Groupe>

      {/* Supprimer le compte : seulement pour un agent que nous hébergeons. La confirmation (case, mot à recopier, maintien) est une pièce. */}
      {m.suppressionDuCompte ? <details className={c.danger}><summary>{t("zoneDanger")}</summary><Suppression modele={m} /></details> : null}
      <Feuilles modele={m} />
    </Page>
  );
}
