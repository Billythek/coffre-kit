/*
 * Les quelques pièces de dessin du thème d'exemple, partagées par ses dix pages. C'est ici qu'un créateur change le plus de choses :
 * la forme d'une page, d'une ligne, d'un bouton. Les pages n'écrivent presque aucun style elles-mêmes.
 * Rien ici ne lit ni n'écrit chez l'agent : ce sont de simples boîtes qui reçoivent des mots et des gestes.
 */
import type { ReactNode, Ref } from "react";
import c from "./exemple.module.css";

/**
 * La page : un seul <h1> (obligatoire : la page le met au premier plan quand elle s'ouvre), au plus une phrase dessous (règle de Coffre),
 * un bouton de retour quand la page en a un. `racine` est la ref que le modèle demande de poser sur l'élément le plus haut.
 */
export function Page({ racine, id, titre, phrase, retour, titreRef, titreVisible = true, haut, children }: {
  racine?: Ref<HTMLElement>;
  id: string;
  /** Le titre de la page ; `null` quand une pièce déjà faite porte elle-même le titre (le détail du Catalogue). */
  titre: ReactNode | null;
  phrase?: string | null;
  retour?: { mot: string; agir(): void } | null;
  titreRef?: Ref<HTMLHeadingElement>;
  /** Faux : le titre reste lu par les lecteurs d'écran, sans se voir (une page qui a déjà son titre dessiné ailleurs). */
  titreVisible?: boolean;
  /** Un geste ou deux, à droite du retour (jamais plus d'un bouton plein dans toute la page). */
  haut?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section ref={racine} className={c.page} aria-labelledby={titre === null ? undefined : id}>
      {(retour || haut) && (
        <div className={c.haut}>
          {retour ? <button type="button" className={c.retour} onClick={retour.agir}><span aria-hidden="true">‹ </span>{retour.mot}</button> : <span />}
          {haut}
        </div>
      )}
      {titre === null ? null : <h1 id={id} ref={titreRef} tabIndex={-1} className={titreVisible ? c.titre : c.cache}>{titre}</h1>}
      {phrase ? <p className={c.phrase}>{phrase}</p> : null}
      {children}
    </section>
  );
}

/** Un groupe : un intertitre en petites capitales, puis ses lignes. */
export function Groupe({ id, titre, children }: { id: string; titre: string; children: ReactNode }) {
  return (
    <section className={c.groupe} aria-labelledby={id}>
      <h2 id={id} className={c.intertitre}>{titre}</h2>
      {children}
    </section>
  );
}

/** Une liste de lignes dans une même carte. */
export function Liste({ children, label }: { children: ReactNode; label?: string }) {
  return <ul className={c.liste} aria-label={label}>{children}</ul>;
}

/**
 * Une ligne : un titre, une phrase dessous si elle a quelque chose à dire, un mot à droite. Avec `ouvrir`, toute la ligne est un bouton
 * (le nom accessible commence par le mot affiché : on ne le remplace jamais par un autre texte).
 */
export function Ligne({ titre, sous, fin, ouvrir, donnees, attenuee }: {
  titre: ReactNode;
  sous?: ReactNode;
  fin?: ReactNode;
  ouvrir?: (() => void) | null;
  /** Un attribut que la page appelante demande de poser (par exemple `data-routine-row`). */
  donnees?: Record<string, string>;
  attenuee?: boolean;
}) {
  // `fin` est à côté du bouton, pas dedans : on peut y mettre un autre bouton (un interrupteur) sans imbriquer deux boutons.
  const corps = (
    <>
      <span className={c.texte}><b>{titre}</b>{sous ? <small>{sous}</small> : null}</span>
      {ouvrir ? <span className={c.aller} aria-hidden="true">›</span> : null}
    </>
  );
  return (
    <li className={c.ligne} data-attenuee={attenuee || undefined} {...donnees}>
      {ouvrir ? <button type="button" className={c.ligneBouton} onClick={ouvrir}>{corps}</button> : <div className={c.ligneBouton}>{corps}</div>}
      {fin ? <span className={c.fin}>{fin}</span> : null}
    </li>
  );
}

/** Un état, toujours avec son mot (jamais un point de couleur seul). `ton` : calme, bon, attention, danger. */
export function Etat({ mot, ton = "calme" }: { mot: string; ton?: "calme" | "bon" | "attention" | "danger" }) {
  return <span className={c.etat} data-ton={ton}><i aria-hidden="true" />{mot}</span>;
}

/** LE bouton plein de la page (un seul par page). */
export function BoutonPlein({ children, onClick, disabled }: { children: ReactNode; onClick?: () => void; disabled?: boolean }) {
  return <button type="button" className={c.plein} onClick={onClick} disabled={disabled}>{children}</button>;
}

/** Tous les autres boutons : contour fin, sans remplissage. */
export function Bouton({ children, onClick, disabled, label }: { children: ReactNode; onClick?: () => void; disabled?: boolean; label?: string }) {
  return <button type="button" className={c.bouton} onClick={onClick} disabled={disabled} aria-label={label}>{children}</button>;
}

/** Un choix parmi quelques-uns (filtre, style, langue) : des boutons radio dessinés en pastilles. */
export function Choix<T extends string>({ label, valeur, options, choisir }: {
  label: string;
  valeur: T;
  options: { id: T; mot: string; compte?: number }[];
  choisir(id: T): void;
}) {
  return (
    <div className={c.choix} role="radiogroup" aria-label={label}>
      {options.map((o) => (
        <button key={o.id} type="button" role="radio" aria-checked={o.id === valeur} tabIndex={o.id === valeur ? 0 : -1} onClick={() => choisir(o.id)}>
          {o.mot}{o.compte !== undefined ? <small> {o.compte}</small> : null}
        </button>
      ))}
    </div>
  );
}

/** Un visage : la photo si l'agent en a une (elle vient du modèle), sinon son initiale. */
export function Visage({ nom, photo, taille = 44 }: { nom: string; photo?: string | null; taille?: number }) {
  const initiale = ([...nom.trim()][0] ?? "?").toLocaleUpperCase();
  return (
    <span className={c.visage} style={{ width: taille, height: taille }} aria-hidden="true">
      {photo ? <img src={photo} alt="" referrerPolicy="no-referrer" /> : initiale}
    </span>
  );
}
