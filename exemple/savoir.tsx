/*
 * Savoir-faire. Ce que l'agent sait faire : ce qui sert, ce qui est nouveau, ce qu'il a rangé.
 *
 * Les faits sont ceux de l'agent (combien de fois un savoir-faire a servi, quand, s'il est rangé). Ce qu'il ne donne pas n'est pas dans le
 * modèle : on ne l'invente pas (pas de « temps gagné », pas de note). Les phrases sous chaque ligne sont déjà écrites par Coffre : `m.ligne(...)`.
 * Pièces à placer : `Propositions` (ce que l'agent propose et attend un oui), `Soin` (l'entretien de l'agent). Le seul bouton plein : « Ajouter ».
 */
import type { ModeleSavoir } from "../modeles";
import { useTextes } from "./textes";
import { Bouton, BoutonPlein, Choix, Etat, Groupe, Liste, Ligne, Page } from "./ui";
import c from "./exemple.module.css";

/* Les types des morceaux du modèle se prennent sur le modèle lui-même : un seul import suffit. */
type LigneSavoir = ModeleSavoir["top"][number];

export function SavoirExemple(m: ModeleSavoir) {
  const { t } = useTextes();
  const { Propositions, Soin, SkeletonRows, Reveal } = m.pieces;
  const rang = (lignes: LigneSavoir[], etagere: Parameters<ModeleSavoir["ligne"]>[1]) => (
    <Liste>
      {lignes.map((l) => (
        <Ligne key={l.id} titre={l.name} sous={m.ligne(l, etagere)} fin={l.paused ? <Etat mot={t("enPause")} ton="attention" /> : null} ouvrir={() => m.ouvrir(l.id)} />
      ))}
    </Liste>
  );
  const phrase = m.enService === null ? t("savoirTotal", { total: m.total }) : t("savoirEnService", { n: m.enService, total: m.total });
  return (
    <Page id="exemple-savoir" titre={t("savoirFaire")} phrase={m.pret ? phrase : null} haut={<BoutonPlein onClick={m.ouvrirBoutique}>{t("ajouter")}</BoutonPlein>}>
      {!m.pret ? <SkeletonRows rows={5} label={t("lecture")} /> : (
        <Reveal>
          <Propositions modele={m} />
          {m.traductionProposee ? <p className={c.vide}>{t("nomsEnAnglais")} <Bouton onClick={m.traduire}>{t("traduire")}</Bouton></p> : null}
          <Choix
            label={t("savoirFaire")}
            valeur={m.filtre}
            choisir={m.choisirFiltre}
            options={[
              { id: "used", mot: t("utilises"), compte: m.comptes.utilises },
              { id: "fresh", mot: t("nouveaux"), compte: m.comptes.nouveaux },
              { id: "archived", mot: t("ranges"), compte: m.comptes.ranges },
            ]}
          />
          {m.filtre === "used" ? (
            <>
              {rang(m.top, "used")}
              {m.autres.length > 0 ? (
                <>
                  <Bouton onClick={m.basculerAutres}>{m.autresOuverts ? t("voirMoins") : t("voirLesAutres", { n: m.autres.length })}</Bouton>
                  {m.autresOuverts ? rang(m.autres, "used") : null}
                </>
              ) : null}
              {m.endormis.length > 0 ? (
                <Groupe id="exemple-savoir-endormis" titre={t("endormis")}>
                  {rang(m.endormis, "sleeping")}
                  {m.rangement.rangeables > 0 ? <Bouton onClick={m.rangement.ranger} disabled={m.rangement.enCours}>{t("rangerLes", { n: m.rangement.rangeables })}</Bouton> : null}
                  {/* Un rangement se défait : « Annuler » arrive quand l'agent a répondu. */}
                  {m.rangement.annulation ? (
                    <p className={c.vide} role="status">{m.rangement.annulation.texte}{" "}
                      {m.rangement.annulation.confirme ? <Bouton onClick={m.rangement.annulation.annuler} disabled={m.rangement.annulation.enCours}>{t("annuler")}</Bouton> : null}
                    </p>
                  ) : null}
                </Groupe>
              ) : null}
            </>
          ) : null}
          {m.filtre === "fresh" ? (
            <>
              {rang(m.nouveaux.slice(0, m.visibles), "fresh")}
              {m.nouveaux.length > m.visibles ? <Bouton onClick={m.voirPlus}>{t("voirPlus", { n: m.nouveaux.length - m.visibles })}</Bouton> : null}
            </>
          ) : null}
          {m.filtre === "archived" ? rang(m.ranges, "archived") : null}
          <Soin />
        </Reveal>
      )}
    </Page>
  );
}
