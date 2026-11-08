/*
 * Routines. Ce que l'agent fait tout seul, à heure fixe.
 *
 * Ta vue DOIT : avoir un <h1> ; poser `data-routine-row={id}` sur chaque ligne qui ouvre la fiche (au retour de la fiche, Coffre y remet
 * la page et le focus) ; ouvrir la fiche par `m.ouvrir(id)` ; placer `<Feuilles modele={m} />` une fois (« Nouvelle routine »).
 * Elle ne retire aucune action : « Nouvelle routine », l'interrupteur, les filtres, la bande « à revoir », les idées, « Recevoir d'une
 * application », les outils et « Comment ça tourne ». Le seul bouton plein de la page : « Nouvelle routine ».
 */
import type { ModeleRoutines } from "../modeles";
import { useTextes } from "./textes";
import { Bouton, BoutonPlein, Choix, Etat, Groupe, Liste, Ligne, Page } from "./ui";
import c from "./exemple.module.css";

type LigneRoutine = ModeleRoutines["lignes"][number];

/** L'état d'une routine en un mot : la couleur ne suffit jamais, le mot est toujours là. */
function etatDe(l: LigneRoutine, t: ReturnType<typeof useTextes>["t"]) {
  return l.health === "failing" ? <Etat mot={t("echec")} ton="danger" />
    : l.health === "paused" ? <Etat mot={t("enPause")} ton="attention" />
    : l.health === "done" ? <Etat mot={t("terminee")} />
    : <Etat mot={l.enRetard ? t("enRetard") : t("active")} ton={l.enRetard ? "attention" : "bon"} />;
}

export function RoutinesExemple(m: ModeleRoutines) {
  const { t } = useTextes();
  const { Feuilles, Bande, Idees, Recevoir, Replis, InlineError, SkeletonRows, Reveal } = m.pieces;
  const { read } = m;
  const lignes = m.montrees;
  return (
    <Page id="exemple-routines" titre={t("routines")} phrase={m.notice || null} haut={<BoutonPlein onClick={m.nouvelle}>{t("nouvelleRoutine")}</BoutonPlein>}>
      {read.error ? <InlineError error={read.error} onRetry={m.relire} stale={Boolean(read.data)} busy={read.refreshing} rows={read.data ? undefined : m.attente} /> : null}
      {!read.data && read.loading && !read.error ? <SkeletonRows rows={m.attente} label={t("lecture")} /> : null}
      {read.data ? (
        <Reveal>
          <Bande {...m.verification} onOpenRoutine={m.ouvrir} />
          {m.aRevoir.length > 0 ? <p className={c.vide} role="status">{t("aRevoir", { n: m.aRevoir.length })}</p> : null}
          {m.filtres ? (
            <Choix
              label={t("routines")}
              valeur={m.filtre}
              choisir={m.choisirFiltre}
              options={[{ id: "all", mot: t("toutes"), compte: m.filtres.tous }, { id: "active", mot: t("actives"), compte: m.filtres.actives }, { id: "paused", mot: t("enPause"), compte: m.filtres.enPause }]}
            />
          ) : null}
          <Liste label={t("routines")}>
            {lignes.map((l) => (
              <Ligne
                key={l.id}
                titre={l.name}
                sous={l.ligne}
                attenuee={l.tenue}
                donnees={{ "data-routine-row": l.id }}
                // L'interrupteur : `interrupteur` est null quand l'agent refuse (terminée, une fois passée). Pas de question, « Annuler » reste 5 s (Coffre le tient).
                fin={<>{etatDe(l, t)}{l.prochain ? <small>{l.prochain}</small> : null}{l.interrupteur ? <Bouton onClick={l.interrupteur} disabled={l.occupe}>{l.health === "paused" ? t("relancer") : t("mettreEnPause")}</Bouton> : null}</>}
                ouvrir={() => m.ouvrir(l.id)}
              />
            ))}
          </Liste>
          {m.frise && m.frise.points.length > 0 ? (
            <Groupe id="exemple-routines-jour" titre={t("aujourdhui")}>
              <Liste>{m.frise.points.map((p) => <Ligne key={p.id} titre={p.nom} fin={<>{p.heure}</>} sous={p.etat === "fait" ? t("fait") : p.etat === "prochain" ? t("prochain") : t("plusTard")} />)}</Liste>
            </Groupe>
          ) : null}
          {lignes.length > 0 ? <Idees empty={false} onCreated={m.relire} /> : <Idees empty onCreated={m.relire} onIdeas={(any) => m.noterIdees(any)} />}
          {m.lignes.length > 0 ? <Recevoir /> : null}
          <Replis />
        </Reveal>
      ) : null}
      <Feuilles modele={m} />
    </Page>
  );
}
