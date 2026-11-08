/*
 * Personnalité. Qui est l'agent, son style, sa façon de répondre.
 *
 * Tout ce qui change la personnalité de l'agent demande une preuve (empreinte ou code) : ta vue appelle seulement `m.choisirStyle(id)`
 * (et ses frères), Coffre pose la question et écrit. Elle ne réécrit jamais une confirmation. Ce que l'agent ne donne pas est `null` :
 * on cache la ligne. Les phrases d'exemple de chaque style (`m.phrase`) sont écrites par nous : on les marque « Exemple ».
 * Pièces à placer : `Feuilles` (une fois), et `LangueSysteme`, `Voix`, `Contexte` quand les drapeaux `aLangueSysteme`, `aVoix`, `aContexte` sont vrais.
 */
import type { ModelePersonnalite } from "../modeles";
import { useTextes } from "./textes";
import { Bouton, Choix, Groupe, Liste, Ligne, Page, Visage } from "./ui";
import c from "./exemple.module.css";

export function PersonnaliteExemple(m: ModelePersonnalite) {
  const { t } = useTextes();
  const { Feuilles, LangueSysteme, Voix, Contexte, InlineError, SkeletonRows, Reveal } = m.pieces;
  const nom = m.nom ?? t("tonAgent");
  return (
    <Page racine={m.racine} id="exemple-personnalite" titre={t("personnalite")} phrase={m.role || null}>
      {m.chargement ? (
        m.erreur ? <InlineError error={m.erreur} onRetry={m.relire} busy={m.relit} rows={m.attente} /> : <SkeletonRows rows={m.attente} label={t("lecture")} />
      ) : (
        <Reveal>
          {m.erreur ? <InlineError error={m.erreur} onRetry={m.relire} stale={m.garde} busy={m.relit} /> : null}
          <div className={c.identite}>
            <Visage nom={nom} photo={m.photo} taille={56} />
            <span className={c.texte}><b>{nom}</b>{m.conversation ? <small>{m.conversation.text}</small> : null}</span>
          </div>
          {m.illisible ? <p className={c.vide} role="status">{t("illisible")}</p> : null}
          {m.partage ? <p className={c.vide} role="status">{t("partage")}</p> : null}

          {/* Qui il est : les parties de son texte, avec leurs premiers mots. */}
          {m.parties.length > 0 ? (
            <Groupe id="exemple-perso-ame" titre={t("quiIlEst")}>
              <Liste>{m.parties.map((p) => <Ligne key={p.titre} titre={p.titre} sous={p.apercu} ouvrir={m.ouvrirAme} />)}</Liste>
            </Groupe>
          ) : null}
          {m.peutModifier ? <Bouton onClick={m.ouvrirAme}>{m.aTexte ? t("modifier") : t("ecrire")}</Bouton> : null}

          {/* Son style : un choix parmi ceux de l'agent. « Aucun » est un choix comme les autres (son identifiant est vide). */}
          {m.style ? (
            <Groupe id="exemple-perso-style" titre={t("sonStyle")}>
              <Choix label={t("sonStyle")} valeur={m.style.courant} choisir={m.choisirStyle} options={m.style.choix.map((s) => ({ id: s.id, mot: s.label }))} />
              <p className={c.vide}>{m.style.choix.find((s) => s.id === m.style?.courant)?.dit}</p>
              <p className={c.exemple}><small>{t("exemple")}</small>{m.phrase(m.style.courant)}</p>
              {m.style.inconnu ? <p className={c.vide} role="status">{t("styleInconnu", { nom: m.style.inconnu })}</p> : null}
            </Groupe>
          ) : null}

          {/* Sa façon de répondre : la longueur et la langue. */}
          {m.longueur || m.langue ? (
            <Groupe id="exemple-perso-reponses" titre={t("saFacon")}>
              {m.longueur ? <Choix label={t("longueur")} valeur={m.longueur.valeur} choisir={m.choisirLongueur} options={m.longueur.choix.map((l) => ({ id: l.id, mot: l.label }))} /> : null}
              {m.langue ? (
                <label className={c.champ}>
                  <span>{t("langueReponses")}</span>
                  <select value={m.langue.valeur} onChange={(event) => m.choisirLangue(event.target.value)}>
                    {m.langue.options.map((o) => <option key={o.value} value={o.value} disabled={o.disabled}>{o.label}</option>)}
                  </select>
                </label>
              ) : null}
            </Groupe>
          ) : null}
          {m.consigne ? <Liste><Ligne titre={t("consigne")} sous={m.consigne.active ? m.consigne.texte : t("consigneInactive")} ouvrir={m.ouvrirConsigne} /></Liste> : null}

          {m.etat ? <p className={c.vide} role={m.etat.erreur ? "alert" : "status"}>{m.etat.texte}</p> : null}
          {m.aLangueSysteme ? <LangueSysteme modele={m} /> : null}
          {m.aVoix ? <Voix modele={m} /> : null}
          {m.aContexte ? <Contexte modele={m} /> : null}
        </Reveal>
      )}
      <Feuilles modele={m} />
    </Page>
  );
}
