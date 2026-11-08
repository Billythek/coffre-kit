# Les jetons : tes couleurs, leur rôle, leurs jumeaux

`jetons.txt` est la **liste fermée** : ta palette pose les 56, ni plus ni moins, en clair **et** en sombre. Tes feuilles de style les lisent avec `var(--nom)` ; elles n'écrivent jamais une couleur en dur.

## Les quatre blocs de palette

`palette.css` contient quatre blocs aux **mêmes valeurs deux à deux** :

| Bloc | Sert à |
|---|---|
| `html:root[data-style="<id>"][data-theme="light"]` | la page, en clair |
| `html:root[data-style="<id>"][data-theme="dark"]` | la page, en sombre |
| `[data-style-apercu="<id>"][data-scheme="light"]` | la vignette du choix de thème, en clair |
| `[data-style-apercu="<id>"][data-scheme="dark"]` | la vignette du choix de thème, en sombre |

Le bloc « vignette » doit dire la même chose que le bloc « page » du même mode (sinon la vignette montrerait un autre thème que la page : le contrôle le refuse). **Quand tu changes une couleur, change-la dans les deux blocs du même mode.** (Astuce : fais ton changement dans le bloc page, puis recopie le bloc entier dans le bloc vignette.) `<id>` est l'`id` de ton `theme.json` ; `creer-theme.mjs` le pose pour toi.

## Les paires mesurées

Le contrôle mesure le contraste de ces paires, en clair et en sombre, sur la page. Un jeton à demi transparent (`rgb(… / .5)`) est mesuré posé sur son fond. Les couleurs doivent s'écrire en `#rrggbb`, `#rgb` ou `rgb()` pour être lues.

- **4,5:1** (texte) : `--foreground` sur `--background` et `--surface` · `--text-soft`, `--text-secondary` sur `--surface` · `--text-muted`, `--text-faint` sur `--background` et `--surface` · `--accent-text` sur `--background` et `--surface` · `--accent-foreground` sur `--accent` · `--btn-main-ink` sur `--btn-main` et `--btn-main-press` · `--btn-ink` sur `--btn-face` · `--field-hint` sur `--field-face` · `--send-ink` sur `--send` · `--danger-foreground` sur `--danger` · `--success`, `--warning`, `--danger`, `--info` sur `--surface`.
- **3:1** (repères, grands éléments) : `--switch-thumb-on` sur `--switch-on` · `--border-strong` sur `--background` et `--surface` · `--control-track` sur `--surface` et `--background`.

Quand tu changes fort (un fond sombre en clair, un accent très pâle), refais ces paires une à une : c'est là que les fautes arrivent.

## Les jetons

Les **jumeaux** sont les jetons à garder cohérents entre eux : si tu changes l'un, regarde l'autre.

### Fonds
| Jeton | Rôle | Jumeau / à garder cohérent |
|---|---|---|
| `--background` | Le fond de la page. | `--sheet` (même famille), `--switch-thumb-on` |
| `--surface` | Le fond des cartes et des groupes de lignes. | `--surface-raised`, `--surface-muted` |
| `--surface-raised` | Une carte posée plus haut que les autres (menus, éléments qui flottent). | `--surface` |
| `--surface-muted` | Un fond discret : champs, puces, encadrés. | `--surface` |
| `--sheet` | Le fond des feuilles qui montent du bas de l'écran. | `--background` |

### Textes
| Jeton | Rôle | Jumeau / à garder cohérent |
|---|---|---|
| `--foreground` | Le texte principal. | `--background`, `--surface` (4,5:1) |
| `--text-soft` | Un texte un cran plus doux (descriptions). | échelle `--text-*` |
| `--text-secondary` | Les intertitres et textes secondaires. | échelle `--text-*` |
| `--text-muted` | Les mentions discrètes (heure, source). | échelle `--text-*` |
| `--text-faint` | Le texte le plus discret qui doit rester lisible. | échelle `--text-*` |

L'échelle `--foreground` → `--text-soft` → `--text-secondary` → `--text-muted` → `--text-faint` va du plus marqué au plus discret ; **tous** gardent 4,5:1.

### Traits et voile
| Jeton | Rôle | Jumeau / à garder cohérent |
|---|---|---|
| `--border` | Le trait courant des cartes et des lignes. | `--border-subtle`, `--border-strong` |
| `--border-subtle` | Un trait presque invisible (séparateurs). | `--border` |
| `--border-strong` | Un trait qui doit se voir (cases, contours de champs) : 3:1. | `--control-track` |
| `--scrim` | Le voile derrière une feuille ou une fenêtre (une couleur à demi transparente). | |

### Accent
| Jeton | Rôle | Jumeau / à garder cohérent |
|---|---|---|
| `--accent` | La couleur d'accent : sélection, repère. | `--accent-strong`, `--accent-foreground` |
| `--accent-strong` | L'accent appuyé ou survolé. | `--accent` |
| `--accent-subtle` | Un fond très léger teinté d'accent (case remplie, halo). | `--accent-soft` |
| `--accent-soft` | Un fond teinté d'accent un peu plus présent (option choisie, pastille). | `--accent-subtle` |
| `--accent-text` | Du texte en couleur d'accent, sur `--background` ou `--surface`. | `--accent` |
| `--accent-foreground` | Le texte posé sur `--accent`. | `--accent` |

### Interrupteurs et commandes
| Jeton | Rôle | Jumeau / à garder cohérent |
|---|---|---|
| `--switch-on` | Le fond d'un interrupteur allumé. | `--switch-thumb-on` |
| `--switch-thumb-on` | La poignée d'un interrupteur allumé, et le texte d'un choix sélectionné. | `--switch-on`, `--control-on` |
| `--control-on` | Le fond d'un choix sélectionné (groupe de boutons à choix). | `--switch-thumb-on` |
| `--control-track` | Le rail d'un interrupteur éteint : 3:1. | `--control-track-hover` |
| `--control-track-hover` | Le même rail au survol (souvent calculé avec `color-mix`). | `--control-track` |

### États
| Jeton | Rôle | Jumeau / à garder cohérent |
|---|---|---|
| `--success` | Le texte et l'icône de ce qui a réussi, sur `--surface`. | |
| `--warning` | Ce qui demande attention, sur `--surface`. | |
| `--danger` | Ce qui a échoué ou qui efface (aussi le fond du bouton qui efface). | `--danger-foreground` |
| `--danger-foreground` | Le texte posé sur `--danger`. | `--danger` |
| `--info` | Une information neutre, sur `--surface`. | |

Un état se dit toujours avec son mot : la couleur seule ne suffit pas (règle 5 du `README.md`).

### Ombres
| Jeton | Rôle | Jumeau / à garder cohérent |
|---|---|---|
| `--shadow-resting` | L'ombre d'un élément posé (carte, poignée). | |
| `--shadow-raised` | L'ombre d'un élément soulevé (menu). | |
| `--shadow-floating` | L'ombre d'un élément qui flotte (feuille, fenêtre). | |

Les ombres sont des valeurs complètes de `box-shadow` (une ou plusieurs ombres), pas des couleurs seules ; elles ne sont pas mesurées.

### Boutons en relief
| Jeton | Rôle | Jumeau / à garder cohérent |
|---|---|---|
| `--btn-face` | La face du bouton discret (le bas de son dégradé). | `--btn-face-top`, `--btn-press` |
| `--btn-face-top` | Le haut de ce dégradé ; identique à `--btn-face` pour un bouton plat. | `--btn-face` |
| `--btn-press` | Le bouton discret enfoncé. | `--btn-face` |
| `--btn-line` | Le trait du bouton discret. | `--btn-line-lit` |
| `--btn-line-lit` | Le bord haut du bouton, côté lumière : un trait plus clair qui donne le relief. | `--btn-line` |
| `--btn-ink` | Le texte et l'icône du bouton discret (4,5:1 sur `--btn-face`). | `--btn-ink-soft` |
| `--btn-ink-soft` | Le même texte, en plus doux (sous-libellé). | `--btn-ink` |
| `--btn-main` | La face du bouton plein, **le seul par écran** (le bas de son dégradé). | `--btn-main-top`, `--btn-main-press` |
| `--btn-main-top` | Le haut du dégradé du bouton plein ; identique à `--btn-main` pour un bouton plat. | `--btn-main` |
| `--btn-main-ink` | Le texte du bouton plein (4,5:1 sur `--btn-main` et `--btn-main-press`). | `--btn-main` |
| `--btn-main-press` | Le bouton plein enfoncé. | `--btn-main` |
| `--btn-outline` | Le contour fin des boutons discrets sans fond. | `--foreground` |
| `--chip-count-opacity` | Un **nombre** entre 0 et 1 (pas une couleur) : l'opacité du chiffre dans une puce (« Tout 12 »). Mets 1 pour un chiffre aussi lisible que le mot. | |

### Champs et envoi
| Jeton | Rôle | Jumeau / à garder cohérent |
|---|---|---|
| `--field-face` | Le fond d'un champ de saisie. | `--field-hint` |
| `--field-hint` | Le texte d'indication d'un champ vide (4,5:1 sur `--field-face`). | `--field-face` |
| `--send` | Le fond du bouton d'envoi d'un message. | `--send-ink`, `--send-press` |
| `--send-ink` | La flèche ou le texte sur `--send`. | `--send` |
| `--send-press` | Le bouton d'envoi enfoncé. | `--send` |

### Polices
| Jeton | Rôle | Jumeau / à garder cohérent |
|---|---|---|
| `--font-display-title` | La police des titres de page (le `<h1>`). | `--font-voix` |
| `--type-caps` | La police **complète** des intertitres en petites capitales (`font` : graisse, taille, interligne, famille). | |
| `--font-voix` | La police de la phrase que l'agent dit (le titre de l'Accueil, les phrases mises en avant). | `--font-display-title` |
| `--font-mono` | La police des chiffres et des codes. | |

Seules sont servies : Google Sans Flex, Inter, Geist, Bricolage Grotesque, Geist Mono, et celles du téléphone. Une autre famille nommée entre guillemets fait échouer le contrôle (sauf police apportée et déclarée dans `theme.json`, relue par nous).
