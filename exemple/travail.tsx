/*
 * Travail. Le tableau des tâches de l'agent : ce qui t'attend, ce qui tourne, ce qui reste à faire.
 *
 * Ce que ta vue DOIT faire : poser `m.page` sur l'élément le plus haut, avoir un <h1>, appeler `m.retour` au bouton « Accueil » et placer
 * `<Feuilles modele={m} />` une fois (la feuille d'une tâche, les réglages du tableau, la création d'une tâche : une seule pièce, la même partout).
 * Ce que tu peux changer : l'ordre et la forme des morceaux. Le tableau lui-même (`KanbanBoard`) est une pièce : on le place, on ne le réécrit pas.
 * Le seul bouton plein de la page est « Nouvelle tâche » (et seulement quand le serveur accepte d'en créer : `m.answers`).
 */
import type { ModeleTravail } from "../modeles";
import { useTextes } from "./textes";
import { Bouton, BoutonPlein, Page } from "./ui";
import c from "./exemple.module.css";

export function TravailExemple(m: ModeleTravail) {
  const { t } = useTextes();
  const { read, tasks, boards, chosen, own, only, agents, bot, answers, now, listRows, lost } = m;
  // Un seul bouton plein : s'il y a une décision à prendre, c'est le « Oui » de la décision (pièce Decisions) ; sinon, « Nouvelle tâche ».
  const decision = own.some((task) => task.humanBlock && task.status !== "archived") || (read.data?.questions?.length ?? 0) > 0;
  const { BoardPicker, LiveNow, Background, Decisions, KanbanBoard, TidyOld, DispatchNote, InlineError, SkeletonRows, Reveal, Feuilles } = m.pieces;
  return (
    <Page
      racine={m.page}
      id="exemple-travail"
      titre={t("travail")}
      retour={{ mot: t("accueil"), agir: m.retour }}
      haut={<>
        {read.data ? <Bouton onClick={() => m.setSettingsOpen(true)}>{t("reglagesTableau")}</Bouton> : null}
        {answers ? (decision ? <Bouton onClick={() => m.setCreating(true)}>{t("nouvelleTache")}</Bouton> : <BoutonPlein onClick={() => m.setCreating(true)}>{t("nouvelleTache")}</BoutonPlein>) : null}
      </>}
    >
      {/* Ce qui ne va pas dans la lecture : une erreur (avec « Réessayer »), et le mot de l'agent s'il ne prend pas de travail. */}
      {read.error || (read.data && read.data.dispatch !== "running") ? (
        <div className={c.bloc}>
          {read.error ? <InlineError error={read.error} onRetry={() => read.refresh(true)} stale={Boolean(read.data)} busy={read.refreshing} rows={read.data ? undefined : listRows} /> : null}
          <DispatchNote dispatch={read.data?.dispatch} estop={read.data?.estop} />
        </div>
      ) : null}
      {!read.data && read.loading && !read.error ? <SkeletonRows rows={listRows} label={t("lecture")} /> : null}
      {lost ? <p className={c.vide} role="status">{t("tacheDisparue")}</p> : null}

      {read.data ? (
        <Reveal>
          {only ? <p className={c.vide} role="status">{t("seulementUn", { nom: agents(only).name })} <Bouton onClick={m.toutMontrer}>{t("toutMontrer")}</Bouton></p> : null}
          {!tasks.length ? (
            <div className={c.vide}>
              <p>{t(answers ? "videAvecNouvelle" : "videTelegram")}</p>
              {bot ? <Bouton onClick={m.telegram}>{t("ouvrirLaConversation")}</Bouton> : null}
            </div>
          ) : null}
          {chosen && boards.length > 1 ? <BoardPicker boards={boards} tasks={tasks} chosen={chosen} now={now} onChoose={m.choisir} /> : null}
          <Decisions tasks={own} questions={read.data.questions} agents={agents} now={now} bot={bot} answers={answers} onOpen={m.ouvrir} onTelegram={m.telegram} />
          <LiveNow tasks={own} agents={agents} now={now} onOpen={m.ouvrir} />
          <Background items={read.data.background ?? []} now={now} onTelegram={bot ? m.telegram : null} />
          {chosen ? <KanbanBoard tasks={own} agents={agents} now={now} onOpen={m.ouvrir} canAct={answers} onAdd={answers ? () => m.setCreating(true) : undefined} /> : null}
          {chosen && answers ? <TidyOld tasks={own} board={chosen.slug} now={now} agent={agents} /> : null}
        </Reveal>
      ) : null}
      <Feuilles modele={m} />
    </Page>
  );
}
