/*
 * Programmer. La fiche d'un agent : qui il est, comment il fonctionne, où il répond, les autres agents, ce qui coupe ou supprime.
 *
 * Ce qui coupe (éteindre) ou efface (supprimer) est une pièce de Coffre, avec sa fenêtre et son maintien : la vue ne fait que la placer
 * (`Extinction`, `Retrait`, `Hebergee`, `PointeurBot`, `FeuilleBot`). Elle ne retire aucune action. Ce que l'agent ne donne pas est `null`,
 * vide ou absent : on cache la ligne. Le seul bouton plein de la page : « Nouvel agent » (quand l'agent le permet).
 */
import type { ModeleProgrammer } from "../modeles";
import { useTextes } from "./textes";
import { Bouton, BoutonPlein, Etat, Groupe, Liste, Ligne, Page, Visage } from "./ui";
import c from "./exemple.module.css";

export function ProgrammerExemple(m: ModeleProgrammer) {
  const { t } = useTextes();
  const { Identite, Soucis, Dossier, Lieux, ExportEnCours, Extinction, Retrait, Hebergee, PointeurBot, FeuilleBot, InlineError, Skeleton } = m.pieces;
  const { personnalite, bot } = m;
  return (
    <Page
      id="exemple-programmer"
      titre={m.nom}
      phrase={m.role || null}
      retour={{ mot: m.retourLabel, agir: m.retour }}
      haut={m.nouvelAgent ? <BoutonPlein onClick={m.nouvelAgent}>{t("nouvelAgent")}</BoutonPlein> : null}
    >
      <div className={c.identite}>
        <Visage nom={m.nom} photo={m.visage} taille={56} />
        {/* Son état en un mot, quand l'agent le dit : jamais un point de couleur seul. */}
        {m.etat ? <Etat mot={m.etat.mot} ton={m.etat.actif ? "bon" : "attention"} /> : null}
      </div>
      {m.erreur ? <InlineError error={m.erreur.error} busy={m.erreur.occupe} onRetry={m.erreur.retenter} /> : null}
      {m.soucis.length > 0 ? <Soucis worries={m.soucis} /> : null}
      {m.espace ? <Liste><Ligne titre={m.espace.label} ouvrir={m.espace.ouvrir} /></Liste> : null}

      <Groupe id="exemple-programmer-qui" titre={t("quiIlEst")}>
        <Liste>
          <Identite modele={m} />
          <Ligne titre={t("personnalite")} sous={personnalite.ton || personnalite.citation || null} ouvrir={personnalite.ouvrir} />
        </Liste>
        {personnalite.sansTexte ? <p className={c.vide}>{t("pasDeTexte")}</p> : null}
        {personnalite.chargement ? <Skeleton lines={2} /> : null}
      </Groupe>

      {/* Ses six organes, dans l'ordre fixe : cerveau, mémoire, personnalité, savoir-faire, connexions, routines. */}
      <Groupe id="exemple-programmer-comment" titre={t("commentIlFonctionne")}>
        <Liste>
          {m.organes.map((o) => (
            <Ligne
              key={o.id}
              titre={o.name}
              sous={o.pending ? <Skeleton width="55%" height={12} /> : o.sub}
              fin={o.state ? <Etat mot={o.state.word} ton={o.state.tone === "success" ? "bon" : o.state.tone === "warning" ? "attention" : "danger"} /> : null}
              ouvrir={o.pending ? null : o.open}
            />
          ))}
          <Ligne titre={t("tousLesReglages")} ouvrir={m.ouvrirReglages} />
        </Liste>
        {m.cerveau ? <p className={c.vide}>{t("cerveau", { modele: m.cerveau.modele })}</p> : null}
      </Groupe>

      <Dossier agent={m.nom} />

      {bot || m.carteBot || m.lieux.length > 0 ? (
        <Groupe id="exemple-programmer-repond" titre={t("ouIlRepond")}>
          <Liste>
            {bot ? <Ligne titre={bot.nom} fin={bot.connecte === null ? null : <Etat mot={bot.connecte ? t("repond") : t("necoute")} ton={bot.connecte ? "bon" : "attention"} />} ouvrir={bot.ouvrir} /> : null}
            {m.carteBot ? <Ligne titre={t("creerLeBot")} ouvrir={m.carteBot.ouvrir} /> : null}
          </Liste>
          {m.lieux.length > 0 ? <Lieux places={m.lieux} /> : null}
        </Groupe>
      ) : null}

      {m.autres.length > 0 ? (
        <Groupe id="exemple-programmer-autres" titre={m.autresCompte}>
          <Liste>
            {m.autres.map((a) => (
              <Ligne key={a.id} titre={a.nom} sous={a.ligne} fin={a.etat ? <Etat mot={a.etat.mot} ton={a.etat.actif ? "bon" : "attention"} /> : null} ouvrir={() => m.ouvrirAutre(a.id)} />
            ))}
          </Liste>
          {m.libelleVoirAutres ? <Bouton onClick={m.basculerAutres}>{m.libelleVoirAutres}</Bouton> : null}
        </Groupe>
      ) : null}

      {/* L'export de l'agent principal, puis ce qui coupe et ce qui efface. Chaque pièce porte sa fenêtre et son maintien. */}
      {m.exportation ? <ExportEnCours flow={m.exportation.flow} label={t("exporter", { nom: m.exportation.nom })} /> : null}
      {m.extinction ? <Extinction modele={m} /> : null}
      {m.danger ? <Hebergee /> : null}
      <Retrait modele={m} />
      {m.pointeurBot !== null ? <PointeurBot entry={m.pointeurBot} /> : null}
      <FeuilleBot modele={m} />
    </Page>
  );
}
