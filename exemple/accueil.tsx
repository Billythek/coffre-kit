/*
 * Accueil. La première page : une phrase qui dit l'essentiel (le titre), ce qui attend la personne, ce qui est en route, le fil du jour.
 *
 * Ce que ta vue DOIT faire (Coffre le vérifie) :
 *  - poser `m.racine` sur l'élément le plus haut et `m.titre` sur le <h1> (tabIndex -1, aria-live="polite") ;
 *  - mettre `m.headline` dans ce <h1> et garder l'élément [data-opening-title] : c'est vers lui que le nuage de points forme le titre à l'ouverture ;
 *  - n'avoir qu'un seul bouton plein (ici : aucun, l'Accueil n'a rien à « valider »).
 * Ce que tu peux changer : tout le reste (l'ordre, la forme, les mots autour), sauf les pièces de `m.pieces` qu'on place et qu'on ne réécrit pas :
 * elles lisent et écrivent elles-mêmes (le fil, « Pour toi », le bandeau d'état…), les mêmes dans tous les thèmes.
 */
import type { ModeleAccueil } from "../modeles";
import { useTextes } from "./textes";
import { Bouton, Groupe } from "./ui";
import c from "./exemple.module.css";

/** « Lu il y a 2 min » : l'âge de la copie affichée, dit en mots. Hors ligne, la ligne commence par « Hors ligne ». */
function age(t: ReturnType<typeof useTextes>["t"], at: number, now: number, horsLigne: boolean): string {
  const minutes = Math.max(0, Math.round((now - at) / 60_000));
  const dit = minutes < 1 ? t("luMaintenant") : minutes < 60 ? t("luMinutes", { n: minutes }) : t("luHeures", { n: Math.round(minutes / 60) });
  return horsLigne ? `${t("horsLigne")} · ${dit}` : dit;
}

export function AccueilExemple(m: ModeleAccueil) {
  const { t } = useTextes();
  const { Statut, PourToi, ErreurDigest, Fil, Presence, Casiers, Espace, Reveal, Skeleton } = m.pieces;
  const { digest, agentName, ouvrir } = m;
  return (
    <section ref={m.racine} className={c.page} aria-labelledby="exemple-accueil">
      {/* Le titre : la phrase du jour. Le span marqué est celui vers lequel le nuage de points forme le titre. */}
      <h1 id="exemple-accueil" ref={m.titre} tabIndex={-1} aria-live="polite" className={c.titre}>
        <span data-opening-title={m.headline}>{m.headline}</span>
      </h1>

      {/* L'état de l'agent (en marche, en panne…) : une pièce, placée telle quelle. */}
      {digest ? <Statut digest={digest} agentName={agentName} onOpenConnexions={ouvrir ? () => ouvrir("connections") : undefined} /> : null}

      {/* Trois cas pour « Pour toi » : on lit encore, la lecture a échoué, ou c'est là. */}
      {m.loading ? (
        <div role="status" aria-label={t("lecture")}><Skeleton height={18} width="62%" /><Skeleton lines={3} height={14} /></div>
      ) : m.failed ? (
        <ErreurDigest error={m.error} busy={m.refreshing} onRetry={m.retenter} />
      ) : (
        <Reveal><PourToi digest={digest} onOpenModule={ouvrir ?? undefined} /></Reveal>
      )}

      {/* L'âge de ce qui est affiché, et le geste pour relire. */}
      {digest && m.at ? (
        <Bouton onClick={() => m.relire()} disabled={m.refreshing}>{m.refreshing ? t("misAJour") : age(t, m.at, m.now, m.offline)}</Bouton>
      ) : null}

      {m.extra ? <div className={c.bloc}>{m.extra}</div> : null}
      {/* L'espace de l'agent n'existe pas chez un client hébergé : la pièce est alors absente de la page. */}
      {!m.surLeHub ? <Espace agent={agentName ?? t("tonAgent")} onOpen={m.ouvrirEspace} /> : null}

      <Groupe id="exemple-accueil-travail" titre={t("travail")}>
        <Presence empty={<p className={c.vide} role="status">{t("personneNeTravaille")}</p>} />
        <Bouton onClick={() => m.ouvrirTravail()}>{t("toutVoir")}</Bouton>
      </Groupe>
      <Fil />
      <Casiers />
    </section>
  );
}
