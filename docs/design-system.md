# Référentiel UI/UX de La Répét'

Source unique de vérité pour l'interface. Version 3.1 (20 novembre 2026). Remplace le paragraphe « Couleurs (design system v2) » du README, qui doit désormais renvoyer ici.

## 0. Mode d'emploi (à lire en premier)

1. **Avant toute modification d'interface, lire ce document.** Aucune valeur visuelle (couleur, taille, graisse, rayon, ombre, espacement, durée) ne s'écrit à la main dans un écran : elle vient d'un jeton ou d'un composant de base.
2. **Toute nouvelle règle s'ajoute ici d'abord**, dans la section concernée, sous la forme « règle + pourquoi + jeton », puis dans `src/tokens.js`, puis dans le code. Jamais l'inverse.
3. **Un besoin non couvert ne justifie pas une valeur hors échelle.** On choisit la valeur existante la plus proche ; si elle ne convient vraiment pas, on modifie l'échelle ici (une ligne dans le journal, section 13) et partout à la fois.
4. **Vérification** : `npm run test:design` (section 11) doit passer, en plus de `npm run build`, `npm run test:analysis` et `npm run test:e2e`.
5. Les règles non négociables du README (ni note, ni score, ni émotion déduite, appui avant exploration, textes en français sans tiret cadratin) priment sur ce document.

Emplacement des jetons : `src/tokens.js` (JavaScript pur, sans JSX, importable par le script de vérification), réexporté par `src/ui.jsx`. Les écrans n'importent que depuis `src/ui.jsx`.

Statut des jetons cités : **existant** (déjà dans `ui.jsx`), **modifié**, **nouveau** (à créer, voir section 12).

---

## 1. Couleurs

### 1.1 Un rôle par couleur

| Rôle | Jeton | Valeur | Où l'utiliser | Où ne jamais l'utiliser |
|---|---|---|---|---|
| Structure et marque (dominante) | `T.primary` | `#386097` | Navigation, liens, bouton neutre fort, bordure du bouton secondaire, icônes d'interface, notes du coach, barre de lecture, focus | Action principale de l'écran, points d'appui, contenu de l'assistant |
| Structure, survol et texte sur fond teinté | `T.primaryDk` | `#2C4D7C` | Survol de `primary`, lien survolé | Fond de grande surface |
| Bordure du bouton secondaire | `T.primaryLt` | `#4A72A8` | Bordure au repos du bouton secondaire uniquement | Texte |
| Secondaire décoratif | `T.blue` | `#3893CD` | Dégradés, halos, icônes décoratives de 16 px et plus, illustrations | Texte, fond de bouton, bordure de champ (3,4:1 sur blanc) |
| Secondaire sous texte blanc | `T.blueDk` | `#2E7CB0` | Milieu des dégradés qui portent du texte blanc | Texte sur fond clair (4,5:1 de justesse, 4,3:1 sur `bg`) |
| Action principale et points d'appui | `T.accent` | `#0B7A75` | Bouton `objective` (un seul par écran), étape en cours du rail, étiquette et repère « Point d'appui », ligne « à traiter » | Liens, titres, décor, état « validé » (c'est le rôle du vert) |
| Action principale, survol | `T.accentDk` | `#0A6663` | Survol du bouton `objective` | Ailleurs |
| Sarcelle sur fond sombre | `T.accentLt` | `#7FD6CF` | Texte ou icône d'appui posé sur `navy` ou sur la vidéo | Sur fond clair |
| Assistant (IA) et points à explorer | `T.violet` | `#5C4BB9` | Bouton `ai`, étiquette `ai`, repère « À explorer », encart « ce que fait l'assistant », chargement de l'analyse | Liens, actions sans IA, icônes génériques, statut |
| Assistant, dégradé seulement | `T.lavender` | `#736BDE` | Sélection de texte, illustrations | Texte, fond sous texte blanc (4,3:1) |
| Coach et accompagnement | `T.coach` **nouveau** | `#13795A` | Tout ce qui signale le côté coach ou l'accompagnement humain : pastille « Avec votre coach », ton `coach` des étiquettes et des cartes de liens (« Coachs », scénarios d'accompagnement), encart « Conseil » des articles, dégradé `GRAD_COACH` | Action, point d'appui, validation |
| Coach, fin de dégradé | `T.coachDk` **nouveau** | `#0F5E46` | Fin de `GRAD_COACH` (texte blanc 7,8:1) | Texte sur fond clair hors dégradé |
| Validation (décor) | `T.success` | `#41C77A` | Pastille pleine décorative, point « en ligne », illustration | Texte, icône porteuse de sens sur fond clair (2,2:1) |
| Validation (lisible) | `T.successDk` **nouveau** | `#1E7A4A` | Texte, icône et coche de validation, étape terminée du rail | Bouton |
| Attention, en attente | `T.warningDk` **nouveau** | `#8A5A0A` | Texte et icône des messages et étiquettes d'attente | Fond |
| Attention (décor) | `T.warning` | `#FFB547` | Pastille décorative | Texte (1,8:1) |
| Erreur, destruction (lisible) | `T.errorDk` | `#C62F47` | Texte d'erreur, bordure de champ en erreur, action destructive, fond du bouton de confirmation destructive | Décor |
| Enregistrement en cours (décor) | `T.error` | `#FF5A72` | Point rouge d'enregistrement, trait barré | Texte, fond de bouton (3,0:1) |
| Titres et texte fort | `T.navy` | `#1B3A66` | Titres, texte de contenu à lire, valeur des champs | Fond de bouton |
| Texte courant | `T.body` | `#4A5568` | Paragraphes, descriptions | Titres |
| Texte secondaire | `T.muted` | `#64748B` | Légendes, aides, métadonnées, espace réservé des champs, lien « Retour » | Texte de moins de 12 px, texte sur `lineLt` ou `line` |
| Décor neutre | `T.faint` | `#A4AFBF` | Icônes décoratives, flèches entre étapes, pointillés | Texte, bordure de champ (2,2:1) |
| Bordure des contrôles | `T.lineStrong` **nouveau** | `#7C8AA0` | Bordure des champs, cases à cocher, pastille d'étape à venir | Séparateurs |
| Bordure et séparateur | `T.line` | `#E7EBF2` | Contour des cartes, séparateurs de section, fond du bouton désactivé | Bordure de champ |
| Séparateur interne | `T.lineLt` | `#F0F3F8` | Lignes entre rangées d'une même carte, piste de la barre de lecture, fond d'étiquette neutre | |
| Fond de page | `T.bg` | `#F8FAFC` | Fond de l'application, bloc « conseil » dans une carte | Fond de champ |
| Surface | `T.surface` | `#FFFFFF` | Cartes, champs, modales, pied de page, texte sur fond plein | |
| Voile de modale | `T.overlay` **nouveau** | `rgba(27,58,102,.45)` | Fond assombri des modales | |
| Fond vidéo | `T.videoBg` **nouveau** | `#000000` | Derrière un lecteur vidéo | Ailleurs |
| En-tête translucide | `T.glass` **nouveau** | `rgba(248,250,252,.9)` | Fond de l'en-tête collant (avec flou d'arrière-plan) | Ailleurs |
| Fond uni de la caméra | `T.studio` **nouveau** | `#DCE6F2` | Couleur de remplacement du fond de l'aperçu caméra (échauffement) | Interface |

#### Les verts : un rôle chacun (v3.5, demande du propriétaire)

| Vert | Jetons | Rôle unique | Exemples |
|---|---|---|---|
| Sarcelle | `accent`, `accentDk`, `accentLt`, `accentBg` | Action principale (`objective`) et points d'appui de l'analyse | « Je lance mon premier entraînement », repère « Point d'appui », étape en cours du rail et de la strate, « Entretiens à relire » |
| Émeraude | `coach`, `coachDk`, `coachBg`, `GRAD_COACH` (= `GRAD_DOOR_GREEN`) | Coach et accompagnement humain | Pastille « Avec votre coach », barre `topbar="coach"`, porte « Vous êtes coach », carte « Coachs », scénarios d'accompagnement, encart « Conseil » |
| Vert de validation | `success` (décor), `successDk` (lisible), `successBg` | Fait, reçu, envoyé, prêt | Étiquettes `success`, `Notice tone="success"`, étapes terminées du rail, rond de confirmation, « Rapports envoyés » |

Aucun autre vert. Le dégradé coach ne mélange plus la sarcelle et le vert de validation. Seule exception : les icônes du bandeau d'engagements du pied de page (section 1.5, validée par le propriétaire). Un cadenas ou une icône de confidentialité n'est pas une validation : il prend `primary`.

**Pourquoi** : une couleur qui a deux rôles n'en signale plus aucun. Aujourd'hui « Se connecter » est bleu, « Accéder à mon espace » sarcelle, « Démarrer l'enregistrement » bleu clair : la personne ne peut pas apprendre où est la suite.

`T.ink` (doublon de `navy`) est supprimé. Le blanc s'écrit `T.surface`, jamais `"#fff"`.

### 1.2 Fonds teintés (un seul par teinte, opaque)

| Jeton | Valeur | Emploi unique |
|---|---|---|
| `T.primaryBg` **nouveau** | `#EEF2F8` | Message d'information, état sélectionné (bascule, case de consentement), bloc « code d'accès », commentaire du coach, avatar à initiale, pastille d'icône neutre |
| `T.accentBg` | `#ECF5F4` | Étiquette et pastille « Point d'appui », rangée « à traiter », observation d'appui active |
| `T.violetBg` **nouveau** | `#F2F1F9` | Étiquette `ai`, encart sur l'assistant, observation « à explorer » active |
| `T.successBg` | `#E9F8F0` | Message de succès, rond de confirmation |
| `T.coachBg` **nouveau** | `#E7F4EE` | Étiquette `coach`, pastille d'icône des cartes « coach », encart « Conseil » |
| `T.warningBg` | `#FFF6E8` | Message d'attention, étiquette d'attente |
| `T.errorBg` | `#FFECEF` | Message d'erreur |

**Règle** : la concaténation d'opacité (`${T.primary}0D`, `${c}10`, `${T.accent}08`…) est interdite hors de `tokens.js`. **Pourquoi** : on compte aujourd'hui huit teintes de bleu, sarcelle et violet différentes pour le même usage.

### 1.3 Dégradés

| Jeton | Composition | Emploi unique |
|---|---|---|
| `GRAD` (= `GRAD_PREMIUM`) **modifié** | `primary` 0 %, `blueDk` 50 %, `violet` 100 % | `GradHead`, en-tête de modale, bandeau d'appel final. Milieu en `blueDk` et non `blue` : le texte blanc y passe de 3,4:1 à 4,5:1 |
| `GRAD_MAIN` | `blue` vers `violet` | Barre supérieure de 4 px des cartes côté bénéficiaire (`topbar`) |
| `GRAD_COACH` **modifié** | `coach` vers `coachDk` | Barre supérieure des cartes côté coach (`topbar="coach"`) et porte « Vous êtes coach » de l'accueil : le seul dégradé vert |
| `GRAD_AI` **modifié** | `blueDk` vers `violet` | Bouton `ai`, barre `topbar="ai"`, indicateur de chargement de l'analyse |
| `GRAD_SOFT` | `primary` 8 % vers `violet` 7 % | `GradHead soft` et en-tête de modale `soft` uniquement |
| `GRAD_NIGHT` **nouveau** | `navy`, `primaryDk` 60 %, `violet` | Fond de scène vidéo simulée (accueil) et fond d'attente de l'enregistreur |
| `GRAD_DOOR_BLUE`, `GRAD_DOOR_GREEN`, `GRAD_DOOR_VIOLET` **nouveau** | `primary` vers `primaryDk` ; `GRAD_DOOR_GREEN` = `GRAD_COACH` ; `violet` vers `primaryDk` | Portes d'entrée de l'accueil (« Par où commencer ? ») : bleu pour la personne accompagnée, vert pour le coach, violet pour le commanditaire. Carte entièrement cliquable, sans bouton bordé, texte blanc (AA sur tout le dégradé), flèche dans une pastille `ON.chip` |

#### Profondeur et marque (v3.1, pages publiques)

Demande du propriétaire : plus de profondeur et de présence de la marque sur l'accueil, sans surcharger.

| Jeton | Composition | Emploi unique |
|---|---|---|
| `GRAD_ACCROCHE` | `blueDk` vers `violet` | Fin d'accroche qui change et mots-clés de la phrase qui se colore (texte de 32 px et plus, seuil 3:1 vérifié par `PAIRS`) |
| `GRAD_HERO` | `surface` vers `primaryBg` | Fond du héros de l'accueil |
| `GRAD_SECTION` | `bg`, `primaryBg` au milieu, `bg` | Fond de la strate épinglée (section clé) |
| `GRAD_PAGE` | `primaryBg` vers `bg` | Fond de `PageHero` (pages secondaires) |
| `GLOW.blue`, `GLOW.violet` | bleu clair 22 %, violet 20 % | Halos (`Halo`) derrière les photos et le héros : décor, jamais sous du texte |
| `FADE_FOOT` | masque opaque puis transparent sur 160 px avant le pied de page | Fond de l'accueil (deux masses qui se déplacent en sens opposés) : il s'efface avant le pied de page |
| `HL.appui`, `HL.ai`, `HL.primary` | teintes de fond des rôles | Surlignage progressif d'un passage (cartes animées, strate) |

Début du titre d'accroche (« Entraînez-vous pour votre entretien, ») : couleur pleine `navy` dans les deux thèmes (presque blanc en sombre), sans dégradé ; seule la fin d'accroche qui change garde `GRAD_ACCROCHE`.

**Fond de l'accueil.** Un seul calque fixe (`.rs-glow`, `src/home/Background.jsx`) derrière toutes les sections de l'accueil, qui n'ont aucun fond propre (ni halo de section, ni `GRAD_HERO`, ni `GRAD_SECTION`) : aucune rupture entre le héros, la phrase et la strate. Il porte deux masses de couleur, le violet en haut à droite (`GLOW.violet`) et le bleu en bas à gauche (`GLOW.blue`). Souris : **rien ne suit le pointeur**, ni halo ni point clair ; les deux masses reçoivent toujours des décalages **opposés** (`opposed`). Sur la diagonale qui les relie, elles s'écartent l'une de l'autre dès que le pointeur s'approche de l'une d'elles (souris en haut à droite : le violet recule vers le haut, le bleu vers le bas ; souris en bas à gauche : de même) ; sur l'autre diagonale, elles glissent en sens contraires (souris vers la droite : le violet glisse à droite, le bleu à gauche). La zone claire du milieu reste ainsi autour du pointeur, et la souris au centre redonne la composition d'origine. Course maximale : environ 15 % de la fenêtre par masse, souris dans un coin. Mouvement amorti (constante de temps de 220 ms), `transform` seulement, écrit dans le style à chaque image par `requestAnimationFrame`, sans rendu React ; la boucle s'arrête dès que les masses ont rejoint leur cible. Sur tactile, le calque dérive lentement seul (`rsDrift`, 26 s, aller-retour, `transform` seulement) et glisse un peu au défilement et au doigt (`touchmove`), avec le même amorti, sans capteur d'orientation. Il s'efface avant le pied de page (`FADE_FOOT`, variable `--fy`), et le pied de page garde son fond opaque au-dessus. Fixe en mouvement réduit, masqué en mode concentration.

Le bleu et le violet de ces dégradés et halos relèvent de l'exception « dégradé de la marque » ci-dessous : ils ne signalent ni l'assistant ni une action.

Interdits : dégradé au survol d'un bouton non IA (le bouton `primary` devient `primaryDk` uni), `GRAD_AI` sur un élément sans rapport avec l'assistant (ex. vignette d'une prise), `GRAD_AI_SOFT` (supprimé).

Le violet présent dans `GRAD` et `GRAD_MAIN` est la seule exception à « violet = IA » : c'est le dégradé de la marque (logo).

#### Logo (v3.3)

Le logo s'adapte aux couleurs du site, et non l'inverse. Il est rendu en couches masquées (canal alpha des images officielles : tracé, anticrénelage et barre du « t » redressée conservés), dont la couleur vient des jetons :

| Partie | Jeton | Clair | Sombre |
|---|---|---|---|
| Symbole (bulles) | `GRAD_LOGO` (`blue` vers `violet`, 45°) | `#3893CD` vers `#5C4BB9` | `#5AAEE0` vers `#B4A9F5` |
| Points de la bulle | `T.navy` | `#1B3A66` | `#E8EEF8` |
| Mot-symbole | `T.navy` | `#1B3A66` | `#E8EEF8` |
| Accents des « é » | `T.violet` | `#5C4BB9` | `#B4A9F5` |
| Sur un dégradé de marque sombre (`white`, `dark`) | `ON.text` | blanc | blanc |

Composants : `RepetMark`, `RepetWord`, `RepetLogo` (`src/ui.jsx`). La variante claire du thème sombre vient des mêmes jetons : plus de filtre d'inversion. Le logo animé d'attente (`BrandLoader`), l'écran de chargement d'`index.html` (valeurs recopiées des jetons, clair et sombre) et l'icône du site (`public/favicon.svg`, qui suit le thème du système) prennent les mêmes couleurs.

### 1.4 Texte sur fond sombre ou dégradé

| Jeton **nouveau** | Valeur | Emploi |
|---|---|---|
| `ON.text` | `#FFFFFF` | Tout texte sur `GRAD`, `GRAD_NIGHT`, vidéo. Pas de blanc à 85 % ou 70 % pour du texte de moins de 18 px |
| `ON.chip` | `rgba(255,255,255,.2)` | Fond d'étiquette, de bouton rond, de bouton `ghostDark` |
| `ON.line` | `rgba(255,255,255,.3)` | Bordure sur fond sombre |
| `ON.glow` | `rgba(255,255,255,.16)` | Halo décoratif |
| `ON.scrim` | `rgba(0,0,0,.5)` | Fond de pastille posée sur la vidéo (minuteur) |

### 1.5 Combinaisons texte/fond autorisées (ratios calculés, WCAG 2.1)

Seuils : 4,5:1 pour le texte, 3:1 pour le texte de 24 px et plus (ou 19 px gras), les icônes porteuses de sens et les bordures de contrôle.

**Exception validée par le propriétaire : engagements du pied de page.** Les quatre icônes du bandeau d'engagements gardent chacune leur couleur (demande explicite du propriétaire, qui préfère ce rendu) : « La vidéo reste sur votre appareil » en `T.successDk`, « Envoi au coach seulement si vous le décidez » en `T.blue`, « Sans note ni classement » en `T.violet`, « Aucune émotion déduite » en `T.accent`. Le texte reste en `T.body`. C'est le seul endroit où ces couleurs servent de décor d'icône ; la règle « une couleur, un rôle » s'applique partout ailleurs.

| Texte | sur `surface` | sur `bg` | Autres fonds vérifiés | Verdict |
|---|---|---|---|---|
| `navy` | 11,4 | 10,9 | `primaryBg` 10,1 · `accentBg` 10,3 · `violetBg` 10,2 · `successBg` 10,4 · `warningBg` 10,6 · `errorBg` 10,0 | Partout |
| `body` | 7,5 | 7,2 | `primaryBg` 6,7 · `accentBg` 6,8 · `successBg` 6,9 · `lineLt` 6,8 | Partout |
| `muted` | 4,8 | 4,6 | `lineLt` 4,3 · `line` 4,0 | Sur `surface` et `bg` seulement |
| `primary` | 6,4 | 6,1 | `primaryBg` 5,7 | OK |
| `primaryDk` | 8,5 | 8,2 | `primaryBg` 7,6 | OK |
| `accent` | 5,2 | 5,0 | `accentBg` 4,7 | OK |
| `violet` | 6,6 | 6,4 | `violetBg` 5,9 | OK |
| `successDk` | 5,3 | | `successBg` 4,9 | OK |
| `coach` | 5,4 | 5,1 | `coachBg` 4,8 | OK |
| `warningDk` | 5,9 | | `warningBg` 5,5 | OK |
| `errorDk` | 5,4 | 5,2 | `errorBg` 4,7 | OK |
| `surface` (blanc) | | | sur `primary` 6,4 · `primaryDk` 8,5 · `accent` 5,2 · `accentDk` 6,8 · `violet` 6,6 · `errorDk` 5,4 · `successDk` 5,3 · `blueDk` 4,5 · `navy` 11,4 | OK |
| `accentLt` | | | sur `navy` 6,7 | OK sur `navy` seulement (3,8 sur `primary`) |
| `lineStrong` (bordure) | 3,5 | 3,4 | | OK pour une bordure |

Combinaisons **interdites** (mesurées dans le code actuel) : blanc sur `blue` 3,4 (bouton `blue`, milieu de `GRAD`), blanc sur `lavender` 4,3 (fin de `GRAD_AI`), blanc sur `error` 3,0 (bouton `danger`), blanc sur `success` 2,2 (coche du rail), `success` en texte 2,2 (rail), `faint` en texte 2,2 (rail), `#B5791A` sur `warningBg` 3,4 (étiquette `warning`), `blueDk` sur bleu teinté 4,2 (étiquette `blue`), `muted` sur `lineLt` 4,3 (étiquette `muted`), blanc à 85 % sur `blue` 2,9 (sous-titre de `GradHead`), bordure `line` sur blanc 1,2 (champs).

### 1.6 États

| État | Règle | Jeton |
|---|---|---|
| Survol d'un bouton plein | Fond de la variante « Dk » (`primaryDk`, `accentDk`), ombre du niveau supérieur, déplacement de 1 px vers le haut | section 5.1 |
| Survol d'un bouton secondaire ou d'une carte cliquable | Bordure `primary` (bouton), ombre `SH.lg` et déplacement de 2 px (carte) | |
| Focus clavier | Contour 2 px `primary`, décalage 2 px, sur tout élément interactif (`button`, `a`, `summary`, `[role=button]`, `[tabindex]`). Sur fond sombre : contour `ON.text` | `FOCUS` **nouveau** |
| Focus d'un champ | Bordure `primary` 1,5 px + halo `SH.ring` (`0 0 0 4px` `primaryBg`) | `SH.ring` **nouveau** |
| Sélectionné | Fond `primaryBg`, bordure 1,5 px `primary`, texte `primary` | |
| Désactivé | Fond `line`, texte `muted`, aucune ombre, curseur `not-allowed`. Pas d'opacité | |
| Erreur de champ | Bordure `errorDk`, message `TY.small` en `errorDk` avec `role="alert"`, précédé de l'icône `I.ban` | |
| Chargement | Indicateur rotatif 2 couleurs (`lineLt` + couleur du rôle), libellé visible | |

---

## 2. Typographie

Trois familles, sans exception : **Manrope** (`FD`) pour les titres (`h1` à `h4`, `display`, `xl`, `pageTitle`, `quote`, intertitres des articles), **Inter** (`FB`) pour le texte et l'interface, **JetBrains Mono** (`FM`) pour les chiffres, codes et horodatages.

**Règle** : hors de `tokens.js`, il est interdit d'écrire `font:`, `fontSize`, `fontWeight`, `fontFamily`, `lineHeight` ou `letterSpacing`. On écrit `style={{ ...TY.h2, color: T.navy }}` ou `<Txt v="h2">`. **Pourquoi** : le code actuel contient 91 combinaisons taille/graisse/interlignage différentes, dont sept tailles de titre de page (24, 26, 27, 28, 30, 32, 34) et des demi-pixels (10,5 · 11,5 · 12,5 · 13,5 · 14,5 · 15,5).

### 2.1 Échelle unique (`TY`, **nouveau**)

| Niveau | Jeton | Famille | Graisse | Taille / interligne | Espacement | Mobile (≤ 760 px) | Usage unique |
|---|---|---|---|---|---|---|---|
| Titre d'accroche | `TY.display` | Manrope | 800 | 54 / 1,05 | -0,035em | 38 | Titre du héros de l'accueil, une fois dans le site |
| Titre de section éditoriale | `TY.xl` | Manrope | 800 | 32 / 1,15 | -0,03em | 26 | `h2` des pages Accueil et Fonctionnement, bandeau d'appel final |
| Titre de page | `TY.h1` | Manrope | 800 | 28 / 1,15 | -0,02em | 24 | Le `h1` de chaque écran d'application, titre de `GradHead`, titre d'étape du défilement de l'accueil |
| Titre de section | `TY.h2` | Manrope | 800 | 20 / 1,25 | -0,01em | 20 | Sections d'un écran (« Mes prises »), titre de modale, titre d'une carte vedette |
| Titre de carte | `TY.h3` | Manrope | 700 | 16 / 1,3 | 0 | 16 | Cartes de grille, observation, nom dans une liste, état vide |
| Titre de bloc | `TY.h4` | Manrope | 700 | 14 / 1,4 | 0 | 14 | Intitulé d'un bloc dans une carte, question d'une prise dans une liste |
| Surtitre | `TY.overline` | Inter | 700 | 11 / 1,3 | 0,08em, capitales | 11 | Au-dessus d'un titre ou d'une valeur ; jamais plus de 4 mots |
| Chapeau | `TY.lead` | Inter | 400 | 18 / 1,6 | 0 | 16 | Paragraphe sous `display` ou `xl` |
| Corps de lecture | `TY.bodyLg` | Inter | 400 | 16 / 1,6 | 0 | 16 | Ce que la personne doit lire attentivement : mot du coach, synthèse, phrase sous un `h1` |
| Corps | `TY.body` | Inter | 400 | 14 / 1,6 | 0 | 14 | Texte par défaut de l'interface et des cartes |
| Corps fort | `TY.bodyStrong` | Inter | 600 | 14 / 1,5 | 0 | 14 | Texte d'une tuile cliquable, intitulé d'option |
| Petit | `TY.small` | Inter | 400 | 13 / 1,5 | 0 | 13 | Métadonnées, conseil, message de champ, contenu de message |
| Légende | `TY.caption` | Inter | 400 | 12 / 1,5 | 0 | 12 | Aide de champ, mention, pied de page. Taille plancher du texte |
| Libellé de champ | `TY.label` | Inter | 600 | 13 / 1,3 | 0 | 13 | `label` de formulaire, sous-titre coloré d'une carte |
| Bouton | `TY.btnSm` · `TY.btn` · `TY.btnLg` | Inter | 600 | 13 / 1 · 14 / 1 · 16 / 1 | 0 | idem | Texte des boutons selon la taille |
| Lien | `TY.link` | Inter | 600 | taille héritée | 0 | idem | Souligné, voir 5.2 |
| Champ | `TY.input` | Inter | 400 | 16 / 1,5 | 0 | 16 | Valeur et espace réservé. 16 px obligatoire : en dessous, iOS zoome à la saisie |
| Étiquette | `TY.tag` | Inter | 600 | 12 / 1 | 0,02em | 12 | Composant `Tag` |
| Chiffre | `TY.num` | JetBrains Mono | 700 | 28 / 1 | 0 | 28 | Indicateurs agrégés, code d'accès affiché |
| Code saisi | `TY.code` | JetBrains Mono | 700 | 24 / 1 | 0,25em | 24 | Champ du code à 6 caractères |
| Horodatage | `TY.time` | JetBrains Mono | 700 | 11 / 1 | 0 | 11 | Pastille « 0:03 », numéro d'étape |
| Mono | `TY.mono` | JetBrains Mono | 500 | 12 / 1,5 | 0 | 12 | Code dans une liste, durée, lien affiché, message technique |
| Titre de page secondaire | `TY.pageTitle` | Manrope | 800 | 38 / 1,1 | -0,03em | 26 | `h1` de `PageHero` et titre d'article (rendu validé) |
| Citation | `TY.quote` | Manrope | 700 | 20 / 1,45 | 0 | 18 | Citation d'article |
| Mise en avant | `TY.strong` | | 700 | | | | `<strong>` dans un paragraphe |

Tailles autorisées (px) : **11, 12, 13, 14, 16, 18, 20, 24, 26, 28, 32, 38, 54**. Graisses autorisées : Manrope 700 et 800 ; Inter 400, 600, 700 ; JetBrains Mono 500 et 700. Toute autre valeur est une erreur (Inter 500 disparaît : `body` ou `bodyStrong`).

Règles d'emploi :
- Un seul `h1` par écran, et l'ordre des niveaux HTML suit l'ordre visuel (le composant `Txt` sépare la balise `as` du style `v`).
- Mise en avant dans un paragraphe : `<strong>` (Inter 700, couleur `navy`). Pas d'italique sauf citation de la personne.
- Couleurs de texte : titres `navy` ; corps `body` ; lecture attentive `navy` ; secondaire `muted`. Le titre `display` est le seul titre en `primary`.
- Longueur de ligne : 75 caractères maximum (`maxWidth: 640` sur un paragraphe isolé).

---

## 3. Espacement

Base 4. `sp(n) = 4n`. **Échelle autorisée (px) : 0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80.** La valeur 2 est réservée aux micro-ajustements optiques. Les valeurs 6, 7, 9, 10, 11, 13, 14, 15, 18, 22, 26, 28, 30, 36, 52, 84 présentes aujourd'hui disparaissent.

### 3.1 Paddings (`PAD`, **nouveau**)

| Élément | Jeton | Ordinateur | Mobile | Remarque |
|---|---|---|---|---|
| Carte standard | `pad="md"` | 24 | 20 | Valeur par défaut de `Card` |
| Carte de focalisation (formulaire, confirmation, modale, `GradHead`) | `pad="lg"` | 32 | 24 | Remplace 26, 28, 32, 36, 40, 48 |
| Tuile compacte (question, observation, bloc interne) | `pad="sm"` | 16 | 16 | Remplace 14, 16, 18 |
| Carte à contenu bord à bord (liste, lecteur, en-tête dégradé) | `pad="none"` | 0 | 0 | Les rangées internes prennent `PAD.row` |
| Rangée de liste | `PAD.row` | 16 × 24 | 16 × 20 | |
| Message (`Notice`) | `PAD.notice` | 12 × 16 | 12 × 16 | |
| Page d'application (`main`) | `PAD.page` | 40 haut, 24 côtés, 64 bas | 24 haut, 16 côtés, 48 bas | Remplace 36/48 en haut |
| En-tête et pied de page | | 0 × 24, hauteur 64 | 0 × 16, hauteur 56 | |
| Bandeau d'appel final | | 48 | 32 × 24 | |

### 3.2 Espacements verticaux et gouttières (`GAP`, **nouveau**)

| Situation | Valeur | Jeton |
|---|---|---|
| Entre deux sections éditoriales (Accueil, Fonctionnement) | 80 (mobile 48) | `GAP.section` |
| Héros : haut et bas | 80 (mobile 40) | `GAP.section` |
| Entre deux blocs d'un écran d'application (carte puis titre de section) | 32 | `GAP.block` |
| Gouttière d'une grille de cartes | 24 (mobile 16) | `GAP.grid` |
| Gouttière d'une grille de tuiles ou cartes empilées d'une liste | 12 | `GAP.stack` |
| Deux colonnes de travail (lecteur + observations) | 24 | `GAP.grid` |
| Surtitre ou étiquette vers titre | 12 | |
| Titre vers sous-titre | 8 | |
| Sous-titre ou paragraphe vers contenu | 24 | |
| Titre de section (`h2`) vers son contenu | 16 | |
| Entre boutons d'un même groupe | 12 (8 en taille `sm`) | `GAP.actions` |
| Icône vers texte | 8 | |
| Formulaire : libellé vers aide | 4 | |
| Formulaire : libellé ou aide vers champ | 8 | |
| Formulaire : champ vers message d'erreur | 8 | |
| Formulaire : entre deux champs | 20 | `GAP.field` |
| Formulaire : dernier champ vers actions | 24 | |

**Règle** : les composants de base n'ont pas de marge externe. L'espacement est porté par le parent (`display: grid` ou `flex` avec `gap`). **Pourquoi** : les `marginBottom` de 10, 12, 14, 16 et 18 dispersés aujourd'hui produisent des rythmes différents d'un écran à l'autre.

---

## 4. Formes

### 4.1 Rayons (`RAD`, existant)

| Jeton | Valeur | Éléments |
|---|---|---|
| `RAD.xs` | 6 | Case à cocher, repère carré, coin d'un commentaire à filet |
| `RAD.sm` | 10 | Bloc interne d'une carte (conseil), pastille d'icône |
| `RAD.md` | 16 | Boutons, champs, zones de texte, bascules, tuiles (`pad="sm"`), observations, messages |
| `RAD.lg` | 24 | Cartes, modales, zone vidéo |
| `RAD.xl` | 32 | Carte de démonstration du héros et bandeau d'appel final, rien d'autre |
| `RAD.pill` | 999 | Étiquettes, pastilles horaires, capsule de session, puces |
| `"50%"` | | Avatars, ronds de confirmation, boutons icône, repères ronds |

Les valeurs littérales de 0 à 4 restent permises pour les micro-éléments de moins de 12 px (curseur, trait). Tout autre nombre (3 sur un repère de note, 5, 13, 20) est remplacé par un jeton.

### 4.2 Ombres (`SH`, existant + `ring`)

| Niveau | Jeton | Emploi |
|---|---|---|
| 1, repos | `SH.xs` | Toute carte (valeur par défaut) |
| 2, focalisation | `SH.sm` | La carte principale de l'écran : `level={2}` sur `Card`. Une par écran au plus |
| 3, flottant | `SH.lg` | Modale, carte survolée, élément flottant du héros, bandeau d'appel final |
| Halo de champ | `SH.ring` **nouveau** | Focus d'un champ |
| Repère actif | `ringOf(couleur)` **nouveau** | `0 0 0 4px` de la teinte de fond associée |
| Lueur colorée (v3.1) | `SH.glow` | Ombre diffuse teintée bleu (large flou, faible opacité) : photos des pages publiques, scènes et cartes flottantes du héros, visuel de la strate, carte animée survolée |
| Lueur assistant (v3.1) | `SH.glowAi` | Même ombre teintée violet : carte « Repères de l'assistant » du héros, bandeau d'appel final (dégradé de marque) |
| Ombres des boutons | `SH.btn.*` | `[repos, survol]` des boutons pleins, utilisées par `Btn` uniquement |

Les ombres colorées des boutons sont définies dans `Btn` et nulle part ailleurs. Hors de `tokens.js` et `ui.jsx`, `boxShadow` ne prend que `SH.*`, `ringOf()` ou `"none"`.

### 4.3 Bordures

| Emploi | Règle |
|---|---|
| Carte, séparateur de section | 1 px `line` |
| Séparateur entre rangées d'une carte | 1 px `lineLt` |
| Contrôle (champ, bouton secondaire, bascule, tuile sélectionnable) | 1,5 px (`lineStrong` au repos pour les champs, `primaryLt` pour le bouton secondaire) |
| Filet d'accent d'un commentaire ou d'un encart | 3 px à gauche, couleur du rôle, sans autre bordure |
| Élément sur fond sombre | 1 px `ON.line` |

---

## 5. Composants

### 5.1 Boutons (`Btn`)

| Variante `kind` | Aspect | Emploi unique |
|---|---|---|
| `objective` | Fond `accent`, texte blanc | **L'action qui fait avancer** : une seule par écran (et par modale) |
| `ai` | Fond `GRAD_AI`, texte blanc | L'action lance ou relance l'assistant. Elle tient alors lieu d'action principale de l'écran |
| `primary` | Fond `primary`, texte blanc | Action neutre forte hors parcours : « Mon espace » dans l'en-tête, fermeture d'une modale d'information, onglet actif |
| `secondary` | Fond blanc, bordure 1,5 px `primaryLt`, texte `primary` | Toute autre action |
| `ghost` | Transparent, texte `primary` | Action tertiaire, utilitaire (imprimer, copier) |
| `danger` | Transparent, texte `errorDk` | Suppression, retrait du consentement. Fond plein `errorDk` uniquement dans la fenêtre de confirmation |
| `dangerSolid` | Fond plein `errorDk`, texte `surface` | Bouton de confirmation d'une suppression, dans `ConfirmDialog` seulement (A11Y-17) |
| `white` | Fond blanc, texte `primary` | Action principale sur `GRAD` |
| `ghostDark` | Fond `ON.chip`, bordure `ON.line`, texte blanc | Action secondaire sur `GRAD` ou sur la vidéo |

Variantes supprimées : `blue` (contraste 3,4:1), `dark` (doublon de `primary`).

| Taille | Hauteur | Padding horizontal | Texte | Icône | Emploi |
|---|---|---|---|---|---|
| `sm` | 40 (zone tactile 44 sur mobile) | 16 | `TY.btnSm` | 16 | Dans une rangée de liste, une barre d'outils, l'en-tête |
| `md` | 48 | 24 | `TY.btn` | 16 | Valeur par défaut |
| `lg` | 56 | 32 | `TY.btnLg` | 20 | Héros et bandeau d'appel final uniquement |

Règles :
- **Une seule action pleine colorée par écran.** Si deux actions semblent principales, l'une est `secondary`.
- **Ordre** : action de retour ou d'annulation à gauche (lien `Back`), puis `secondary`, puis l'action principale à droite. Sur mobile, les boutons d'un groupe passent en pleine largeur, l'action principale en premier.
- **Icônes** : passées par les propriétés `icon` (à gauche) et `iconRight` (flèche de progression uniquement), couleur `currentColor`, écart 8. Plus de `&nbsp;` ni de couleur d'icône écrite à la main.
- Libellé : verbe à l'infinitif ou à la première personne, 4 mots au plus, sans point.
- Rayon `RAD.md`, transition `MO.base`, survol et désactivé selon 1.6.
- Bouton icône seul : composant `IconBtn`, 44 × 44, rond, `aria-label` obligatoire.

### 5.2 Liens (`Link`, **nouveau**)

Un seul style : `TY.link` (Inter 600, taille héritée), couleur `primary`, souligné, décalage du soulignement 3 px, survol `primaryDk`. Sur fond sombre : blanc souligné. Jamais de lien violet, jamais de lien non souligné dans un texte.

Deux exceptions nommées : `navlink` (en-tête, non souligné au repos, souligné quand actif) et `Back` (retour, `TY.body` en `muted`, icône flèche à gauche, zone tactile 44). Tous les « Retour », « Annuler » et « Changer de code » utilisent `Back`.

### 5.3 Champs (`Field`, `Input`, `Textarea`, **nouveaux**)

Un seul style, défini par `INPUT` :

| Propriété | Valeur |
|---|---|
| Hauteur | 48 (zone de texte : 96 minimum, padding 12 × 16, redimensionnable verticalement) |
| Padding | 0 × 16 |
| Rayon | `RAD.md` |
| Bordure | 1,5 px `lineStrong` |
| Fond | `surface` (jamais `bg`) |
| Texte | `TY.input`, couleur `navy` ; espace réservé `muted` |
| Focus, erreur, désactivé | Voir 1.6 (désactivé : fond `lineLt`) |

Seule variante : `variant="code"` (hauteur 56, `TY.code`, centré). Les hauteurs 40, 42, 54 et les tailles de texte 13, 13,5 et 15 disparaissent.

`Field` porte le libellé (`TY.label`, `navy`, lié par `htmlFor`), l'aide facultative (`TY.caption`, `muted`, sous le libellé, reliée par `aria-describedby`) et le message d'erreur. Un champ sans libellé visible reçoit un `aria-label`. La mention « facultatif » s'écrit dans le libellé ; on ne marque pas les champs obligatoires par une couleur.

`Toggle` (choix exclusif en ligne) : hauteur 48, `RAD.md`, `TY.label`, états repos et sélectionné selon 1.6, `role="radio"` dans un `role="radiogroup"`.

### 5.4 Étiquettes (`Tag`)

Hauteur 24, padding 0 × 12, `RAD.pill`, `TY.tag`, icône 12 facultative. Non cliquable.

| `tone` | Texte / fond | Signification unique |
|---|---|---|
| `primary` | `primary` / `primaryBg` | Contexte, rôle, étape (« Coach », « Entraînement », « S'entraîne ») |
| `appui` | `accent` / `accentBg` | « Point d'appui » uniquement |
| `coach` | `coach` / `coachBg` | Côté coach, accompagnement humain (« Avec votre coach ») |
| `ai` | `violet` / `violetBg` | Assistant, « À explorer » |
| `success` | `successDk` / `successBg` | Fait, reçu, envoyé |
| `warning` | `warningDk` / `warningBg` | En attente d'une action (« À relire ») |
| `error` | `errorDk` / `errorBg` | Échec |
| `muted` | `body` / `lineLt` | État neutre, inactif |

Tons supprimés : `blue`, `indigo`, `violet`, `lavender`. Un même statut porte le même ton des deux côtés : « Rapport reçu » (bénéficiaire) et « Rapport envoyé » (coach) sont tous deux `success`.

### 5.5 Cartes (`Card`)

`<Card pad="md" level={1}>` : fond `surface`, bordure 1 px `line`, `RAD.lg`, ombre selon `level`. Propriétés : `pad` (`none`, `sm`, `md`, `lg`, plus de nombre), `level` (1 ou 2), `topbar` (`true`, `"coach"`, `"ai"`), `hover`, `onClick`.

- Une carte cliquable est rendue en `button` (ou reçoit `role="button"`, `tabIndex={0}` et la gestion de Entrée et Espace). Pas de `div` cliquable.
- `pad="sm"` entraîne `RAD.md` (tuile).
- Pas de carte dans une carte : à l'intérieur, on utilise un bloc `bg` en `RAD.sm` ou un `Notice`.
- Variante teintée interdite sauf par `Notice`.

### 5.6 Fenêtres modales (`Modal`, **nouveau**, une seule implémentation)

Voile `T.overlay` avec flou de 4 px ; panneau `surface`, `RAD.lg`, `SH.lg`, largeur `W.form` (600) ou `W.read` (760), hauteur maximale 86 % de l'écran, corps défilant. Trois zones au padding `lg` : en-tête (titre `TY.h2`, bouton de fermeture `IconBtn` 44), corps, pied (action principale à droite). En-tête dégradé facultatif (`head="grad"` ou `"soft"`).

Comportement obligatoire : `role="dialog"`, `aria-modal="true"`, `aria-labelledby`, fermeture par Échap et par clic sur le voile, défilement de la page bloqué, focus envoyé dans la modale à l'ouverture, retenu à l'intérieur, rendu à l'élément d'origine à la fermeture. Sur mobile : marge extérieure 16, padding 24.

### 5.7 En-tête dégradé (`GradHead`)

Un seul par écran, toujours en haut de la carte principale (`pad="none"`). Padding `lg` (32, mobile 24 × 20). Contenu : étiquette facultative (fond `ON.chip`), titre `TY.h1` blanc, sous-titre `TY.body` blanc plein, action facultative en `ghostDark` taille `sm`. Propriété `as` pour la balise du titre. Version `soft` : réservée aux contenus d'information (modale « émotions »).

### 5.8 Messages (`Notice`, **nouveau**)

`RAD.md`, `PAD.notice`, icône 16 à gauche (écart 12), texte `TY.small`, pas de bordure, pas d'emoji.

| `tone` | Fond | Icône | Texte | Emploi | Rôle ARIA |
|---|---|---|---|---|---|
| `info` | `primaryBg` | `primary` | `navy` | Explication, cadre légal, synthèse | aucun |
| `success` | `successBg` | `successDk` | `navy` | Confirmation, nouveauté reçue | `status` |
| `warning` | `warningBg` | `warningDk` | `warningDk` | Texte provisoire, point d'attention | `status` |
| `error` | `errorBg` | `errorDk` | `errorDk` | Échec, avec la marche à suivre | `alert` |
| `ai` | `violetBg` | `violet` | `navy` | Ce que fait ou ne fait pas l'assistant | aucun |

Le commentaire du coach est un cas nommé (`Quote`) : fond `primaryBg`, filet gauche 3 px `primary`, `RAD.xs`, texte `navy`.

### 5.9 État vide (`Empty`, **nouveau**)

`Card pad="lg"`, contenu centré : pastille d'icône 48 (`primaryBg`, icône 24 `primary`), titre `TY.h3`, une phrase `TY.body` (ce qui apparaîtra ici et comment), une action au plus. Même gabarit pour « Aucun parcours », « Aucune prise partagée », « Pas encore de prise ».

### 5.9 bis Assistant de préparation d'entretien (`AssistantDock`, `src/Assistant.jsx`)

Panneau latéral non modal (`role="dialog"`, `aria-modal="false"`), ouvert depuis le bouton flottant `Fab` (56 × 56, `GRAD_AI`, en bas à droite) ou par `openAssistant(contexte)` depuis un écran. Ordinateur : à droite, sous l'en-tête, largeur 400 au plus. Mobile (≤ 760) : feuille en bas de 62 % de la hauteur, la page reçoit un espace équivalent en bas pour que rien ne reste caché dessous. Bordure de 2 px en dégradé `GRAD_AI_BORDER` (bleu vers violet), animée une fois à l'apparition (neutralisée par « réduire les animations »). En-tête sans icône : titre « Assistant de préparation d'entretien », mention « Assistant automatique · ce n'est pas une personne ». Focus envoyé dans le champ à l'ouverture, rendu au bouton flottant à la fermeture, Échap ferme, réponses dans un `role="log"` `aria-live="polite"`. Bouton flottant et bulle masqués tant que la caméra ou le micro de l'enregistreur est ouvert. Bulle d'invitation (« Une question pour préparer votre entretien ? ») : à l'ouverture de la page, à la fin d'un enregistrement ou d'un entraînement, une fois par raison et par session ; « Fermer la bulle » la coupe pour la session.

### 5.9 ter Menu « Mon compte » (`AccountMenu`, `src/app/AccountMenu.jsx`)

Bouton « Mon compte » dans l'en-tête, sur toutes les pages. Déconnecté : il mène à la page « Mon espace » (code d'accès ou connexion coach). Connecté (coach ou personne accompagnée) : il ouvre un **menu déroulant sous le bouton** (demande du propriétaire, 21 novembre 2026, à la place du panneau latéral), non modal : bouton `secondary` avec chevron qui pivote, `aria-expanded` et `aria-controls` ; menu aligné à droite du bouton, 320 px (au plus la largeur de l'écran moins 32), fond `surface`, bordure `line`, `RAD.md`, `SH.lg`, hauteur bornée à l'écran avec défilement interne. Contenu : en-tête du compte (pastille à initiale, prénom ou nom, rôle), puis Retour à mon espace, Demander de l'aide, Vos données, Options d'accessibilité, Changer de code et Retirer mon accord (personne accompagnée, en `errorDk`), Se déconnecter ; rangées `Bare` de 44 px (`rp-menuitem`). Clavier : focus sur la première action à l'ouverture, flèches haut et bas, Début, Fin ; Échap ferme et rend le focus au bouton ; clic extérieur ou tabulation hors du menu ferment. Ni blocage du défilement ni page inerte (menu non modal). Jamais ouvert en même temps que l'assistant (`closeAssistant`). Sur les pages publiques, quand le menu mobile est affiché (1023 px et moins), « Mon compte » passe dans le menu mobile : même en-tête, mêmes actions (`AccountActions`). La confirmation du retrait de l'accord reste une `Modal`.

**« Nous contacter » et « Demander de l'aide ».** Dans l'en-tête, « Nous contacter » est un bouton au style de lien d'en-tête (`navlink` : sans fond ni bordure, zone de 44 px, focus visible ; v3.5, demande du propriétaire). Session ouverte : il devient « Demander de l'aide » et mène aux questions fréquentes, sur la section de la personne connectée (`#/ressources/faq/personnes-accompagnees` ou `#/ressources/faq/coachs`). Même entrée dans « Mon compte » et dans le menu mobile.

**Sous-menus de l'en-tête.** Un seul sous-menu visible à la fois (état tenu par `Nav`). Survol : délai d'intention de 120 ms avant d'ouvrir un premier sous-menu, puis bascule immédiate de l'un à l'autre dans la même image (classe `rp-swap` : pas d'animation d'entrée, l'ancien est masqué aussitôt), délai de grâce de 250 ms à la sortie. Clic extérieur, Échap et changement de page ferment. Entrées de troisième niveau (« Demandeurs d'emploi », « Collaborateurs en mobilité ») en retrait (`rp-subitem3`). Le bouton d'accessibilité ne figure plus dans l'en-tête (languette, `src/A11y.jsx`) ; ses entrées restent dans le menu mobile et dans « Mon compte ».

### 5.9 quater Assistant de rédaction du rapport (`CoachAssistantDock`, `src/CoachAssistant.jsx`)

Même panneau que 5.9 bis (`DockPanel`, bouton flottant `Fab`, bordure `GRAD_AI_BORDER`), dans la relecture coach. Titre « Assistant de rédaction du rapport ». Cinq choix (puces `role="radio"`) : Astuces, Remarques positives, Reformuler, Introduction, Débriefing ; puces `tone="ai"` pour l'observation concernée. Chaque proposition (fond `violetBg`, `RAD.sm`) porte ses insertions en boutons `secondary` taille `sm` : « Dans l'introduction », « Sur l'observation », « Note à 0:12 » (moment courant de la vidéo). Confirmation dans un `Notice tone="success"` (`role="status"`) qui rappelle de relire avant d'envoyer. Grand écran (1180 px et plus) : le contenu se décale de 432 px pour rester visible à côté du panneau.

### 5.9 quinquies Vignette d'interlocuteur (`Interlocutor`, `src/beneficiary/Interlocutor.jsx`)

Option de l'espace de la personne accompagnée (demande du propriétaire, 22 novembre 2026) : comme en visioconférence quand l'autre personne a coupé sa caméra, une petite fenêtre neutre donne le sentiment de parler à quelqu'un, sans avatar animé ni visage. Affichée pendant l'entraînement (écran « À vous de répondre ») et l'échauffement.

| Point | Règle |
|---|---|
| Option | Désactivée par défaut. Interrupteur « Afficher une vignette d'interlocuteur » (`VignetteSwitch`, rangée `Bare role="switch"` de 48 px, même interrupteur visible que les options d'accessibilité, `rp-a11y-row`) sous l'aperçu caméra de l'entraînement et de l'échauffement ; même réglage dans « Mon compte » et le menu mobile (« Afficher » ou « Masquer la vignette d'interlocuteur »). Mémorisé dans `localStorage`, clé `larepet.vignette` (`"1"` ou `"0"`), sous `try/catch` (`src/lib/vignette.js`, événement `rp-vignette` pour les écrans ouverts) |
| Contenu | Silhouette générique pleine (tête et épaules, sans trait de visage) dans un disque `T.line`, silhouette `T.faint` ; libellé « Votre interlocuteur » (`TY.label`, `T.navy`) ; « Caméra coupée » avec icône de caméra barrée (`TY.caption`, `T.body`). Jamais de photo, de visage, d'initiales d'une vraie personne ni d'expression |
| Teinte | Neutre : fond `T.lineLt`, bordure `T.line`. Ni le violet de l'assistant, ni le vert du coach, ni la sarcelle de l'action principale |
| Indicateur « parle » | Quatre barres (`.rp-vig-voice`, `T.lineStrong` au repos, `T.navy` actives, animation `rpVoice` déjà comptée parmi les boucles de la section 7) et liseré `ringOf(T.lineStrong)` autour du disque, **uniquement pendant la lecture de la question** par la voix de synthèse (`onSpeaking` de `RecruiterVoice`). Démarrer l'enregistrement coupe la voix : pendant que la personne parle, la vignette est immobile. Rien ne réagit à sa voix ni à son image (aucune inférence d'émotion, AI Act, art. 5(1)(f)) ; échauffement : barres toujours au repos. Mouvement réduit : barres fixes, sans animation |
| Grand écran (1240 px et plus) | Fenêtre fixe en bas à droite (`.rp-vig-float`) : 208 px, à 16 px du bord et 88 px du bas (au-dessus du bouton de l'assistant), fond `surface`, bordure `line`, `RAD.md`, `SH.lg`, zone de 120 px `lineLt` avec disque de 72, puis rangée nom et bouton. Elle tient dans la marge de la colonne `W.read` : elle ne recouvre ni le sous-titre de la question ni les commandes. Rendue dans `document.body` (portail). Masquée sous l'assistant ouvert, le menu mobile, « Mon compte » et une fenêtre (`html.rp-lock`) |
| Sous 1240 px | Bandeau dans le flux, entre la question et l'aperçu caméra (disque de 40, nom, barres, bouton), fond `lineLt`, bordure `line`, `RAD.md` : il ne se superpose à rien, à 390 comme à 320 px |
| Masquer | Bouton icône « Masquer la vignette » (`IconBtn`, 44 × 44, ton `muted`) : désactive l'option, que l'interrupteur rétablit |
| Accessibilité | Visuel décoratif (`aria-hidden`) ; seuls l'interrupteur et le bouton « Masquer la vignette » sont atteignables. Classe `noprint` |
| Données | Rien n'est enregistré : la vignette est un élément de la page, l'enregistrement ne capture que la caméra et le micro |

### 5.10 Autres éléments normalisés

| Élément | Règle |
|---|---|
| Rond de confirmation | 56, fond `successBg`, coche 28 `successDk` |
| Pastille d'icône, avatar | 40, `RAD.sm` (icône) ou rond (avatar), fond `primaryBg`, contenu `primary` |
| Pastille horaire | Hauteur 24, padding 0 × 8, `RAD.pill`, `TY.time`, fond de la couleur du rôle, texte blanc. Si cliquable : zone tactile 44 |
| Rail d'étapes (`Rail`) | Pastille 28. Terminée : fond `successDk`, coche blanche, libellé `successDk`. En cours : fond `accent`, libellé `accent` gras, `aria-current="step"`. À venir : fond blanc, bordure `lineStrong`, libellé `muted`. Mobile : seul le libellé de l'étape en cours est affiché, précédé de « Étape 2 sur 4 » |
| Repères de lecture | Appui : rond plein `accent`. À explorer : rond `violet` évidé. Note du coach : carré `primary` (`RAD.xs`). La forme distingue autant que la couleur |
| Icônes (`Icon`) | Tailles 12 (dans `Tag`), 16 (bouton, ligne), 20 (défaut), 24 (pastille), 40 (illustration). Trait 2. `aria-hidden` par défaut |
| Bouton flottant de l'assistant (`Fab`) | 56 × 56, rond, dégradé `GRAD_AI`, `aria-label` obligatoire ; masqué pendant un enregistrement et sous un panneau ouvert ; bulle d'invitation à sa gauche, 240 px au plus |
| Bulle d'information (`InfoTip`, `beneficiary/SpaceHome.jsx`) | Bouton icône `info` 44 ; contenu `role="note"`, fond `surface`, `SH.lg` ; survol, toucher et clavier (Échap ferme) |
| Tuile de choix (`ChoiceTile`, `beneficiary/SpaceHome.jsx`) | Bloc interne sur fond `bg`, `RAD.md`, pastille d'icône sur `surface`, titre `h3`, une action |
| Indicateur agrégé (`Stat`, `coach/List.jsx`) | Carte, valeur `TY.num` insécable, libellé `TY.small` ; aucun chiffre qui décrit une personne (moins de 5 parcours : texte) |
| Logo d'attente (`BrandLoader`) | Bulles et points animés, libellé d'état `role="status"` ; statique en mouvement réduit ; plein écran (`full`) ou dans le bloc |
| Confirmation (`ConfirmDialog`) | Construite sur `Modal` ; « Annuler » en `secondary`, action en `dangerSolid` ; remplace toute boîte native |
| Groupe de choix (`RadioGroup`) | `role="radiogroup"` ; un seul arrêt de tabulation, flèches, Début, Fin ; enfants `Chip` ou `Toggle` de rôle `radio` |
| Menu d'actions (`Menu`) | Bouton `ghost` « Autres actions » ; liste de `Bare` 44, destructive en `errorDk` et en dernier ; Échap et clic extérieur ferment |
| Écran d'attente du cadre caméra (`StageIdle`) | Sur `GRAD_NIGHT` : titre `h3` et texte en `ON.text`, « Activer la caméra » en `white`, voix seule en `ghostDark` |
| Texte de la réponse (`Transcript`, `Report.jsx`) | `details` « Afficher le texte de la réponse », mention « écrit par un programme », lignes horodatées, cliquables avec un lecteur |

---

## 6. Mise en page

| Type de page | Largeur maximale | Jeton `W` **nouveau** | Écrans |
|---|---|---|---|
| Éditoriale, en-tête, pied de page | 1200 | `W.page` | Accueil, Fonctionnement |
| Travail en deux colonnes | 1120 | `W.wide` | Espace coach, relecture, rapport avec vidéo |
| Lecture et parcours | 760 | `W.read` | Espace bénéficiaire, choix de question, enregistrement, rapport écrit, consentement, choix du mode, « Mon espace », modale large |
| Formulaire et confirmation | 600 | `W.form` | Partage, envoi confirmé, analyse en cours, modale |
| Accès | 440 | `W.narrow` | Saisie du code, connexion |

Remplace 1000, 920, 820, 720, 680, 640, 580, 560, 460.

- Le contenu est centré dans la page ; le texte est aligné à gauche. Le centrage du texte est réservé aux écrans de confirmation, d'accès et aux états vides.
- Grilles : 2 ou 3 colonnes égales, gouttière `GAP.grid`. Les proportions libres (1,2fr / 1fr, 1,15fr / 1fr, 1,3fr / 1fr) sont ramenées à deux : égales, ou 3/2 pour lecteur + panneau.
- Point de rupture principal : 760 px (autres seuils de `GStyle` : 1023 px pour le menu repliable, 360 px pour les très petits écrans, hauteur 520 px en paysage). Sous 760 px : une colonne, gouttière latérale 16, cartes en `pad` mobile, groupes de boutons en pleine largeur, titres en taille mobile. Aucun défilement horizontal de page.
- En-tête collant de 64 (mobile 56), `z-index` 50 ; modale 100 (`Z.nav`, `Z.modal`).
- Impression : en-tête, pied et éléments `.noprint` masqués, fond blanc.
- **Première vue sans défilement** (demande du propriétaire) : un écran qui propose un choix à la personne (« Mon espace », `#/espace` et `#/coach` sans connexion) le montre entièrement dans la première vue, à 1280 × 800 comme à 390 × 844. « Mon espace » n'a donc pas d'en-tête de page visible : son `h1` « Mon espace » est masqué visuellement (`.rp-sr`), les deux cartes (code d'accès, connexion coach) suivent directement l'en-tête du site. Sous 760 px, la carte coach, préremplie, est repliée sous le lien « Vous êtes coach ? Afficher la connexion » (`aria-expanded`, `aria-controls`) pour laisser la place à la saisie du code. Vérifié par `test:site`.
- **Pied de page complet** (`src/app/Footer.jsx`) : engagements (icônes colorées, exception de la section 1.5) sur une ligne en haut, répartis sur la largeur ; dessous, une seule rangée de quatre blocs, la présentation (logo et brief) à gauche, à côté des groupes « Vos données », « Le site », « Informations légales ». Colonnes 3/2/2/2 (`.rp-fgrid`), gouttières 24 × 40 ; 1023 px et moins : deux colonnes (la présentation à côté de « Vos données ») ; 560 px et moins : présentation sur toute la largeur, groupes sur deux colonnes ; sous 760 px, 64 px d'espace sous le pied pour que les boutons flottants ne masquent pas les derniers liens. Pied réduit des espaces inchangé.

---

## 7. Mouvement (`MO`, **nouveau**)

| Jeton | Valeur | Emploi |
|---|---|---|
| `MO.fast` | 120 ms | Changement de couleur au survol |
| `MO.base` | 200 ms | Survol avec déplacement, bascule, sélection |
| `MO.enter` | 450 ms | Apparition d'un écran ou d'un bloc (`.up`, `.rv`) |
| `MO.ease` | `cubic-bezier(.2,.7,.3,1)` | Courbe de l'interface (survol, sélection, apparition d'écran) |
| `MO.reveal` (v3.1) | 700 ms | Apparition au défilement (`.rv`), éléments qui entrent dans une scène (`.rs-pop`, `.rs-in`), phrase qui se colore |
| `MO.slow` (v3.1) | 900 ms | Fin d'accroche qui change, étapes et visuels de la strate épinglée |
| `MO.fade` (v3.1) | 1,1 s | Fondu entre deux scènes du héros |
| `MO.soft` (v3.1) | `cubic-bezier(.45,0,.55,1)` | Courbe douce (ease-in-out) des transitions lentes ci-dessus |
| `PACE.scene` (v3.2) | 11 500 ms | Durée d'une scène du héros (laisse le temps de lire la scène à côté du titre). Pause au survol, au focus et par le bouton pause |
| `PACE.accroche` (v3.2) | 11 500 ms | Fin d'accroche synchronisée avec sa scène : même cadence, même fondu (`MO.fade`) |
| Écran de chargement (v3.5) | 2,5 s minimum (décision du propriétaire : rapprochement des bulles 1,3 s, puis les points), barre de chargement de 3 px sous le logo, sortie en trois temps : écart des bulles 0,6 s, pause 0,3 s, fondu 0,6 s (`MO.soft`) | Durée comptée depuis le début de la navigation. **Barre** : 112 × 3 px, `RAD` 2, remplissage `T.violet` sur piste `T.line` (valeurs recopiées dans `index.html`, clair et sombre), progresse jusqu'à 90 % pendant la durée minimale (`transform: scaleX`), puis se complète en 250 ms en repartant de sa valeur affichée. **Sortie** (demande du propriétaire : « qu'on voie bien la séparation ») : 1. les deux bulles du logo s'écartent (`.rpl-split`, `transform` sur une boîte intérieure, distincte de l'animation d'entrée : aucun saut), points et barre en fondu court ; 2. pause, bulles écartées ; 3. le calque passe en fondu (`.rpl-out`, `opacity`). **Page immobile avant la sortie** (`pageSettled`, `src/Loader.jsx`) : la sortie ne commence que lorsque les polices sont chargées, les images visibles décodées et qu'aucune animation ou transition finie (entrée du héros, lignes de la scène) ne tourne dans `#root` ; les boucles infinies (dérive du fond, point d'enregistrement) ne comptent pas. Attente bornée à 8 s. Le retrait attend aussi qu'aucun écran d'attente de page (`BrandLoader` de `Suspense`) ne soit affiché : pas de double rendu. **Logo animé sur le compositeur** : chaque bulle et chaque point est une boîte HTML (et non un groupe SVG), animée par `transform` et `opacity` seulement, déplacements en pourcentage de la boîte : l'assemblage, les points et l'écart restent fluides même quand le démarrage de React occupe le fil principal (Firefox et Safari animent les groupes SVG sur le fil principal : gel puis saut). Calque de `100vw` et barre de défilement réservée dès `index.html` (`overflow-y: scroll`, `scrollbar-gutter: stable`) : rien ne se décale quand le site arrive. « Réduire les animations » : écran statique sans barre, 0,6 s, puis fondu simple de 0,4 s. Navigateur piloté : retrait immédiat. Retrait de secours en CSS à 10 s, y compris en mouvement réduit (`index.html`, `src/Loader.jsx`) |
| « Revenir en haut » (v3.4) | 300 ms, `MO.ease` | Apparaît et disparaît en fondu (`opacity`, déplacement de 8 px vers le haut), jamais d'apparition sèche ; masqué, il reste dans la page sans être atteignable (`tabIndex` -1, `aria-hidden`, `pointer-events: none`). Mouvement réduit : opacité seule, même durée (prioritaire sur la règle globale) |

Les pages publiques (accueil, à propos, solutions, ressources) utilisent les durées lentes ; l'application (espaces bénéficiaire et coach) garde `MO.fast`, `MO.base` et `MO.enter` pour rester réactive.

- `transition: all` est interdit : on nomme les propriétés (`background-color`, `border-color`, `box-shadow`, `transform`, `opacity`).
- Amplitudes : bouton 1 px vers le haut, carte cliquable 2 px, apparition 12 px. On n'anime que `transform` et `opacity`.
- **Apparition au défilement, partout sur les pages publiques** (v3.5, demande du propriétaire : « parfois tu oublies l'animation d'apparition ») : le titre de section (`Section`) apparaît, **et aussi chaque bloc de son contenu** : carte, élément de grille, question de FAQ (`Accordion`), encadré, élément de liste, tableau, notice, carte d'article, paragraphe d'article. Composant unique : `Reveal` (`src/motion.jsx`, classe `.rv` : fondu et 12 px, `MO.reveal`, `MO.soft`), avec `as` pour garder la balise (`li`, `p`, `section`, `figure`). Décalage dans une série : `stagger(i, n)`, 70 ms par élément, remis à zéro à chaque rangée de `n` (3 pour une grille de cartes, 2 pour deux colonnes, 4 pour une liste ou un accordéon), donc 210 ms au plus. Corps d'article : blocs de premier niveau sans délai (lecture continue). Mouvement réduit : apparition immédiate (règle globale). Impression : tout est visible (`@media print`). Le focus clavier n'est jamais retardé : un bloc atteint au clavier défile dans l'écran et apparaît aussitôt. Exceptions : héros et `PageHero` (classe `.up`), strate épinglée, phrase qui se colore, scènes du héros (leurs propres animations), messages d'état (`role="status"`). Contrôle : `test:site` vérifie que chaque carte, question de FAQ, encadré, porte d'entrée, élément de grille et bloc d'article des pages publiques est dans un `.rv`.
- Animations en boucle limitées à quatre : point d'enregistrement (`blink`), indicateur de chargement (`spin`), indicateur du recruteur oral pendant la lecture (`rpVoice`, barres qui pulsent, immobiles dès que la voix se tait) et lente dérive du fond de l'accueil (`rsDrift`, 26 s, pages publiques seulement, demande du propriétaire).
- `prefers-reduced-motion: reduce` neutralise toutes les animations et transitions (règle globale de `GStyle`, à conserver). Le contenu doit rester complet sans animation : rien n'est révélé uniquement par le mouvement.
- Aucune animation pendant l'enregistrement autre que le point rouge.

---

## 8. Accessibilité

| Sujet | Règle |
|---|---|
| Contraste | Seules les combinaisons de 1.5 sont permises |
| Cibles tactiles | 44 × 44 au minimum sur mobile pour tout élément interactif ; 8 d'écart entre deux cibles. Un visuel plus petit (repère, pastille horaire) étend sa zone par un padding transparent |
| Focus | Toujours visible (1.6). Interdit de retirer un contour sans le remplacer |
| Clavier | Tout ce qui se clique s'atteint à la tabulation et s'active par Entrée ou Espace. Ordre de tabulation égal à l'ordre visuel |
| Sémantique | `button` pour une action, `a` pour une navigation, un `h1` par écran, `main`, `nav`, `header`, `footer` |
| Textes alternatifs | Icône décorative : `aria-hidden`. Bouton icône : `aria-label`. Logo cliquable : libellé « La Répét', accueil ». Vidéo : transcription accessible à côté |
| Couleur seule | Jamais porteuse unique de sens : appui et exploration diffèrent par le libellé, la forme du repère et l'icône |
| Formulaires | Libellé lié, aide reliée, erreur annoncée (`role="alert"`) et formulée avec la marche à suivre |
| Messages d'état | `role="status"` pour une confirmation, `role="alert"` pour une erreur |
| Zoom | La page reste utilisable à 200 % ; tailles en px mais aucun conteneur à hauteur fixe pour du texte |
| Langue et ton | Français, vouvoiement, écriture inclusive au point médian déjà en place, pas de tiret cadratin, pas d'emoji en guise d'icône |

### 8 bis. Options d'accessibilité et thèmes

**Où (v3.4).** Languette en demi-cercle collée au **bord gauche** de l'écran (`src/A11y.jsx`, classes `.rp-a11y-*` de `GStyle`), conteneur placé juste après `#root` : le lien d'évitement reste le premier arrêt de tabulation (A11Y-01), la languette est le dernier (une tabulation arrière depuis la barre d'adresse). Fond `T.primary`, icône `I.a11y` en `T.surface`, 32 × 52 au milieu de la hauteur sur ordinateur, 28 × 48 en bas à gauche (16 px du bas) sous 760 px. Au survol (pointeur fin) et au focus clavier, elle s'allonge pour afficher « Accessibilité » (le libellé glisse de sous le demi-cercle, `transform` seul, 300 ms, `MO.ease`) ; survol en `T.primaryDk`. Nom accessible « Options d'accessibilité » (contient le libellé visible), `aria-expanded`, `aria-controls`. Le bouton icône de l'en-tête est masqué (`.rp-head-a11y`) ; les entrées « Options d'accessibilité » du menu mobile et du panneau « Mon compte » restent et ouvrent le même panneau (`openA11y()`).

**Panneau.** Au clic, la forme de la languette s'agrandit jusqu'au panneau (`clip-path` de la languette au rectangle arrondi, 450 ms, `MO.soft` ; contenu en fondu décalé de 120 ms) : pas de voile ni de fenêtre centrée. `role="dialog"`, `aria-modal="true"`, titre « Options d'accessibilité » ; focus envoyé sur le premier réglage et retenu dans le panneau, Échap et clic ou toucher en dehors ferment, focus rendu à l'élément d'origine (sinon à la languette). Fermé, il reste dans la page, inerte (`inert`) et invisible. Largeur 640 au plus (2 colonnes), hauteur limitée à l'écran avec défilement interne ; sous 760 px : pleine largeur moins 16, une colonne, ancré en bas à gauche. Ombre portée par `filter: drop-shadow(SH.lg)` sur le parent (une `box-shadow` serait coupée par le `clip-path`). Quatre groupes (surtitre `TY.overline` `T.muted`) : **Texte** (taille, police lisible, texte espacé), **Couleurs** (thème, contraste élevé), **Lecture et attention** (règle de lecture, mode concentration, réduire les animations), **Repères** (liens soulignés, focus renforcé). Choix exclusifs en `Toggle` dans un `RadioGroup` ; options en rangées de 48 px (`Bare role="switch"`, `aria-checked`) avec un interrupteur visible (piste `lineStrong` puis `primary`, pastille qui se déplace et porte une coche : l'état ne repose pas sur la couleur seule). Pied : état (« Réglages par défaut » ou « N réglages modifiés », `role="status"`) et « Réinitialiser ». La languette se masque sous le menu mobile, le panneau « Mon compte », une fenêtre (`html.rp-lock`) et, sur mobile, sous l'assistant ouvert ; elle ne chevauche ni « Revenir en haut » ni le bouton de l'assistant (à droite). **Exception documentée** : la languette fait 32 (mobile 28) de large pour ne pas masquer le contenu ; sa hauteur est de 52 (mobile 48) et la cible dépasse le minimum WCAG 2.5.8 (24 × 24). `clip-path` est la seule propriété animée hors `transform` et `opacity` (pas de recalcul de mise en page).

**Réglages** (mémorisés dans `localStorage`, clé `larepet.a11y`, lecture et écriture sous `try/catch` ; `src/lib/a11y.js`) :

| Réglage | Effet | Mise en œuvre |
|---|---|---|
| Taille du texte | 4 niveaux : 100, 112,5, 125, 150 % | variable `--fs` : chaque taille de `TY` vaut `calc(Npx * var(--fs, 1))` |
| Thème | Automatique (suit le système), clair, sombre | `html[data-theme]` ; variables `--c-*` |
| Contraste élevé (« contraste renforcé ») | Textes secondaires et bordures plus marqués | `html[data-contrast=more]` ; palettes `HC_LIGHT`, `HC_DARK` |
| Police lisible | Atkinson Hyperlegible (auto-hébergée) pour titres et texte | `html[data-font=lisible]` change `--ff-d` et `--ff-b` |
| Texte espacé | Lettres 0,12 em, mots 0,16 em, lignes 1,8, texte aligné à gauche (WCAG 1.4.12) | `html[data-spacing=on]` |
| Réduire les animations | Mêmes règles que `prefers-reduced-motion` | `html[data-motion=reduce]`, `useReducedMotion()` |
| Mode concentration | Masque halos (`.rp-deco`), cartes animées (`.rs-fvis`), arrête les défilements automatiques | `html[data-focusmode=on]` |
| Règle de lecture | Bande de 48 px qui suit le pointeur, le doigt ou le focus ; le reste est voilé (`T.overlay`) | `.rp-ruler` |
| Liens toujours soulignés | Tous les liens et la navigation | `html[data-links=on]` |
| Focus renforcé | Contour 3 px `navy`, décalage 3 px, halo `SH.ring` | `html[data-focusring=on]` |
| Réinitialiser | Revient aux réglages par défaut et aux préférences du système | `resetA11y()` |

**Sans flash.** Un script en ligne d'`index.html` pose `data-theme` (et la classe `rp-boot-dark` pour l'écran de chargement) avant tout affichage ; `src/main.jsx` injecte la feuille des variables (`themeCSS()`) et applique tous les réglages avant le premier rendu React. Au premier passage : thème automatique, contraste renforcé si `prefers-contrast: more`, animations selon `prefers-reduced-motion`.

**Couleurs en variables.** Les valeurs ne sont définies qu'une fois dans `src/tokens.js` : `LIGHT` (référence de la section 1), `DARK`, `HC_LIGHT`, `HC_DARK`. `T.x` vaut `var(--c-x)` ; les écrans n'utilisent que `T`. `FIX` (valeurs claires, fixes) sert seulement aux éléments posés sur une vidéo ou sur un dégradé de marque sombre (`GRAD`, `GRAD_AI`, `GRAD_NIGHT`, pastilles sur la vidéo), dont le texte reste blanc dans les deux thèmes. La règle A1 de `test:design` vérifie chaque paire de `PAIRS` dans les quatre thèmes (clair, sombre, et leurs versions à contraste renforcé). Seule exception déclarée : `accentLt` sur `navy`, vérifiée en thème clair uniquement (`navy` y est un fond sombre, il devient une couleur de texte en thème sombre).

Palette sombre (rôles identiques à la section 1.1) : `bg` `#0E141E`, `surface` `#161F2E`, `navy` (titres) `#E8EEF8`, `body` `#C5CEDC`, `muted` `#9DA9BB`, `primary` `#8DB4EA`, `accent` `#4ECBC1`, `violet` `#B4A9F5`, `successDk` `#6FD69B`, `warningDk` `#F3C46C`, `errorDk` `#FF8D9E`, fonds teintés de `#1D2A3F` à `#3A1B23`. Sur un fond plein coloré, le texte reste `T.surface` : il devient foncé en thème sombre, avec un contraste vérifié.

---

## 9. Voix de l'interface (rappel)

Décrire, ne jamais noter. Formulation positive, appui avant exploration. Un bouton dit ce qui va se passer (« Envoyer à mon coach », pas « Valider »). Une erreur dit quoi faire. Les mentions rassurantes (« reste sur votre appareil ») s'écrivent en `TY.caption` sous l'action concernée.

---

## 10. Ce qui est interdit (résumé)

1. Couleur écrite à la main (`#…`, `rgb`, `rgba`, `hsl`, concaténation d'opacité) hors de `tokens.js`.
2. `font`, `fontSize`, `fontWeight`, `fontFamily`, `lineHeight`, `letterSpacing` hors de `tokens.js`.
3. Padding, marge ou écart hors de l'échelle de la section 3.
4. Rayon ou ombre hors des jetons `RAD` et `SH`.
5. `input`, `textarea`, `select` ou `button` natif hors de `ui.jsx`.
6. Deux actions pleines colorées sur le même écran.
7. Violet sans rapport avec l'assistant ; sarcelle hors action principale et points d'appui ; vert `coach` hors côté coach et accompagnement ; vert `success` ou rouge `error` en texte.
8. `div` cliquable, `transition: all`, emoji utilisé comme icône, `&nbsp;` pour espacer une icône.

---

## 11. Vérification automatique : `tests/design-lint.mjs`

À implémenter par le développeur. Script Node sans dépendance, lancé par `npm run test:design` (à ajouter dans `package.json` et dans la liste de vérifications de `CLAUDE.md`). Il sort avec le code 1 à la première règle violée, après avoir listé toutes les violations au format `fichier:ligne  règle  extrait  correction attendue`.

**Entrées** : tous les fichiers `src/**/*.{js,jsx}`. Le script importe `src/tokens.js` pour lire les échelles (aucune valeur dupliquée dans le script).

**Préparation de chaque fichier** : retirer les commentaires (`/* */`, `//`), les URI `data:` et les chemins SVG (`d="…"`, `points="…"`), en conservant les numéros de ligne.

**Fichiers sources de jetons** (exemptés des règles C, T, S, R, O, M) : `src/tokens.js` et `src/ui.jsx`. Ils sont soumis à la règle X.

| Code | Le script échoue si, hors fichiers de jetons… | Motif de recherche indicatif | Exceptions |
|---|---|---|---|
| C1 | une couleur hexadécimale est présente | `#[0-9a-fA-F]{3,8}\b` dans une chaîne | Les routes `#/…` ne correspondent pas au motif |
| C2 | une fonction de couleur est présente | `\b(rgba?\|hsla?)\(` | aucune |
| C3 | une opacité est concaténée à un jeton | `\$\{[^}]+\}[0-9a-fA-F]{2}(?![0-9a-zA-Z])` | aucune |
| C4 | un nom de couleur CSS est utilisé | `:\s*"(white\|black\|red\|green\|blue\|gray\|grey)"` | `"transparent"`, `"currentColor"`, `"inherit"`, `"none"` |
| T1 | une propriété typographique est écrite | `\b(font\|fontSize\|fontWeight\|fontFamily\|lineHeight\|letterSpacing)\s*:` dans un objet de style | `fontStyle`, `font: "inherit"` |
| T2 | une famille est nommée | `Outfit\|Manrope\|Inter\|JetBrains\|Segoe\|sans-serif\|monospace` | textes de contenu de `src/content/` (mentions légales qui citent les polices) |
| S1 | `padding*`, `margin*`, `gap`, `rowGap`, `columnGap` contient un nombre de px hors de l'échelle `SPACE` | tout nombre, isolé ou dans une chaîne `"12px 16px"` ; signe négatif admis | `auto`, `%`, `vh`, `svh`, `em`, `calc()` ; les valeurs `PAD.*`, `GAP.*`, `sp(n)` |
| S2 | `sp(n)` est appelé avec un `n` tel que `4n` est hors échelle | `sp\(([\d.]+)\)` | aucune |
| S3 | `<Card pad=` reçoit autre chose que `"none"`, `"sm"`, `"md"`, `"lg"` | `<Card[^>]*\bpad=\{` | aucune |
| S4 | `maxWidth` vaut un nombre de 600 ou plus | `maxWidth:\s*(\d+)` | utiliser `W.*` |
| R1 | `borderRadius` (et variantes par coin) reçoit autre chose que `RAD.*`, `"50%"` ou un nombre de 0 à 4 | `border\w*Radius:\s*([^,}]+)` | expressions composées uniquement de `RAD.*` et de 0 |
| O1 | `boxShadow` reçoit autre chose que `SH.*`, `ringOf(…)` ou `"none"` | `boxShadow:\s*([^,}]+)` | ternaire dont les deux branches sont permises |
| M1 | une transition est écrite à la main | `transition:\s*["'\`]` sans `MO.` ; tout `transition` contenant `all` | aucune |
| K1 | un élément natif de formulaire ou un bouton natif est utilisé | `<(input\|textarea\|select\|button)\b` | `<input type="file">` s'il apparaît un jour |
| K2 | `<Btn kind=` vaut autre chose que `objective`, `ai`, `primary`, `secondary`, `ghost`, `danger`, `white`, `ghostDark`, `dangerSolid` ; `size` autre que `sm`, `md`, `lg` | valeur littérale ou branches d'un ternaire | aucune |
| K3 | `<Tag tone=` vaut autre chose que `primary`, `appui`, `coach`, `ai`, `success`, `warning`, `error`, `muted` | idem, y compris les tons renvoyés par `lib/store.js` (`tone: "…"`) | aucune |
| K4 | un élément non interactif porte `onClick` | `<(div\|span\|p\|li)\b[^>]*\bonClick=` | voile de modale dans `ui.jsx` |
| K5 | une icône est espacée à la main | `&nbsp;\s*<Icon` ou `<Icon[^>]*/>\s*&nbsp;` | aucune |
| L1 | un tiret cadratin ou un emoji figure dans une chaîne | le caractère U+2014 ; `\p{Extended_Pictographic}` (drapeau `u`) | aucune ; s'applique aussi à `docs/*.md` pour le tiret |
| X1 | dans `tokens.js`, `ui.jsx` et `src/ui/` : une taille de police hors de `SIZES`, une graisse hors de `WEIGHTS` | `(\d+(?:\.\d+)?)px` dans les valeurs `font`, `font-size` ; `\b[1-9]00\b` en tête de `font` | logos (`RepetLogo`, `OrgLogo`) dont la taille est calculée à partir de `s` ; les valeurs non littérales (`${TY.h3.font}`) ne sont pas contrôlées |
| X2 | dans `ui.jsx` et `src/ui/` : une couleur hexadécimale ou `rgba` hors de l'import de `tokens.js` | motifs C1 et C2 | ombres colorées de `Btn`, à déplacer dans `tokens.js` (`SH.btn*`) pour ramener l'exception à zéro |
| A1 | une paire texte/fond déclarée dans `tokens.js` (`PAIRS`) a un contraste inférieur à son seuil | calcul WCAG de la luminance relative | aucune |
| A2 | un objet de style en ligne pose `background: T.*Bg` et `color: T.muted` (contraste sous 4,5:1, section 1.5) | `style={{…}}` d'un seul niveau | aucune ; passer le texte en `T.body` |
| L3 | lexique côté personne accompagnée (`docs/redaction.md`, 1.2) : « Bénéficiaire », « consentement », « mots d'appui », « Analyse de votre réponse » | chaînes et textes JSX de `src/beneficiary/`, `Recorder`, `WarmupStage`, `Report`, `Assistant`, `RecruiterVoice`, `Demo`, `CodeForm`, `StageIdle`, `app/AccountMenu`, `app/Espace` (commentaires exclus) | les textes légaux (`content/legal.js`) et les pages destinées aux organismes |
| U1 | un lien d'article (`src/content/resources/*.md`) utilise un autre schéma que `https:`, `http:`, `mailto:` ou `#/` | `\]\(([^)\s]+)\)` | aucune |

Dans les motifs du tableau, `\|` se lit `|` (échappement imposé par le format du tableau).

**Dérogation ponctuelle** : commentaire `// design-lint-disable-next-line CODE -- raison` sur la ligne précédente. La raison est obligatoire. Le script affiche le nombre de dérogations et échoue au-delà de `MAX_WAIVERS = 5`.

**Règle A1** : `tokens.js` exporte `PAIRS`, la liste des combinaisons de la section 1.5 sous la forme `[texte, fond, seuil]`. Le script recalcule chaque ratio : modifier une couleur sans vérifier ses contrastes devient impossible.

**Sortie attendue en cas de succès** : `design-lint : 0 violation, N fichiers, D dérogation(s)`.

**Limites connues** : le script ne voit pas « une seule action principale par écran », la hiérarchie des titres ni les cibles tactiles réelles. Ces trois points se contrôlent en revue, sur les captures de `tests/screenshots/` (ordinateur et 390 × 844).

---

## 12. Implémentation : jetons et composants

### 12.1 `src/tokens.js` (nouveau fichier, JavaScript pur)

```js
export const T = { /* jetons existants */
  successDk: "#1E7A4A", warningDk: "#8A5A0A", lineStrong: "#7C8AA0",
  primaryBg: "#EEF2F8", violetBg: "#F2F1F9",
  overlay: "rgba(27,58,102,.45)", videoBg: "#000000",
};                                  // supprimer T.ink
export const ON = { text: "#FFFFFF", chip: "rgba(255,255,255,.2)", line: "rgba(255,255,255,.3)", glow: "rgba(255,255,255,.16)", scrim: "rgba(0,0,0,.5)" };
export const FD = "'Manrope', 'Segoe UI', sans-serif", FB = "'Inter', 'Segoe UI', sans-serif", FM = "'JetBrains Mono', monospace";
export const SIZES = [11, 12, 13, 14, 16, 18, 20, 24, 26, 28, 32, 38, 54];
export const WEIGHTS = { [FD]: [700, 800], [FB]: [400, 600, 700], [FM]: [500, 700] };
export const TY = {
  display:  { font: `800 54px/1.05 ${FD}`, letterSpacing: "-.035em" },
  xl:       { font: `800 32px/1.15 ${FD}`, letterSpacing: "-.03em" },
  h1:       { font: `800 28px/1.15 ${FD}`, letterSpacing: "-.02em" },
  h2:       { font: `800 20px/1.25 ${FD}`, letterSpacing: "-.01em" },
  h3:       { font: `700 16px/1.3 ${FD}` },
  h4:       { font: `700 14px/1.4 ${FD}` },
  overline: { font: `700 11px/1.3 ${FB}`, letterSpacing: ".08em", textTransform: "uppercase" },
  lead:     { font: `400 18px/1.6 ${FB}` },
  bodyLg:   { font: `400 16px/1.6 ${FB}` },
  body:     { font: `400 14px/1.6 ${FB}` },
  bodyStrong: { font: `600 14px/1.5 ${FB}` },
  small:    { font: `400 13px/1.5 ${FB}` },
  caption:  { font: `400 12px/1.5 ${FB}` },
  label:    { font: `600 13px/1.3 ${FB}` },
  btnSm:    { font: `600 13px/1 ${FB}` }, btn: { font: `600 14px/1 ${FB}` }, btnLg: { font: `600 16px/1 ${FB}` },
  link:     { fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 },
  input:    { font: `400 16px/1.5 ${FB}` },
  tag:      { font: `600 12px/1 ${FB}`, letterSpacing: ".02em" },
  num:      { font: `700 28px/1 ${FM}` },
  code:     { font: `700 24px/1 ${FM}`, letterSpacing: ".25em" },
  time:     { font: `700 11px/1 ${FM}` },
  mono:     { font: `500 12px/1.5 ${FM}` },
};
export const TY_MOBILE = { display: 38, xl: 26, h1: 24, lead: 16 };   // appliqué par les classes .ty-* de GStyle
export const SPACE = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80];
export const sp = n => n * 4;
export const PAD = { sm: 16, md: 24, lg: 32, row: "16px 24px", notice: "12px 16px", page: "40px 24px 64px" };
export const PAD_MOBILE = { sm: 16, md: 20, lg: 24, row: "16px 20px", page: "24px 16px 48px" };
export const GAP = { section: 80, block: 32, grid: 24, stack: 12, field: 20, actions: 12 };
export const W = { page: 1200, wide: 1120, read: 760, form: 600, narrow: 440 };
export const RAD = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };
export const SH = { /* xs, sm, lg existants */ ring: `0 0 0 4px ${T.primaryBg}` };
export const ringOf = bg => `0 0 0 4px ${bg}`;
export const MO = { fast: ".12s", base: ".2s", enter: ".45s", ease: "cubic-bezier(.2,.7,.3,1)" };
export const Z = { nav: 50, modal: 100 };
export const INPUT = { width: "100%", height: 48, padding: "0 16px", borderRadius: RAD.md, border: `1.5px solid ${T.lineStrong}`, background: T.surface, color: T.navy, ...TY.input };
export const TONE = {              // rôle → couleurs, pour Tag, Notice, repères, observations
  primary: { fg: T.primary, bg: T.primaryBg }, appui: { fg: T.accent, bg: T.accentBg }, ai: { fg: T.violet, bg: T.violetBg },
  success: { fg: T.successDk, bg: T.successBg }, warning: { fg: T.warningDk, bg: T.warningBg }, error: { fg: T.errorDk, bg: T.errorBg }, muted: { fg: T.body, bg: T.lineLt },
};
export const PAIRS = [ /* [T.navy, T.surface, 4.5], … toutes les lignes de la section 1.5 */ ];
```

Dégradés : `GRAD` et `GRAD_AI` recomposés selon 1.3, `GRAD_NIGHT` ajouté, `GRAD_AI_SOFT` supprimé.

### 12.2 `src/ui.jsx`

| Composant | Action | Signature |
|---|---|---|
| `Txt` | créer | `<Txt v="h1" as="h2" color={T.navy} style>` : applique `TY[v]` et la classe `ty-{v}` (tailles mobiles) |
| `Btn` | modifier | `kind`, `size`, `icon`, `iconRight`, `full`, `disabled`, `type`, `aria-label` ; variantes et tailles de 5.1 ; survol uni ; désactivé sans opacité ; `transition` nommée ; classe `rp-btn-sm` (hauteur 44 sur mobile) |
| `IconBtn` | créer | `<IconBtn icon={I.trash} label="Supprimer la note" tone="muted" onDark>` : 44 × 44 |
| `Link`, `Back` | créer / modifier | `<Link onClick\|href onDark>` ; `Back` reçoit `children` (défaut « Retour »), icône flèche, zone 44 |
| `Field`, `Input`, `Textarea`, `Toggle` | créer | `<Field label hint error id>` ; `<Input variant="code" invalid>` ; styles `INPUT` |
| `Tag` | modifier | tons de 5.4 via `TONE`, `TY.tag`, hauteur 24 |
| `Card` | modifier | `pad` nommé (classes `rp-pad-sm\|md\|lg` pour le mobile), `level`, rendu `button` si `onClick`, `transition` nommée, déplacement 2 px |
| `Modal` | créer (fusion de `Counselor.Modal` et `legal.LegalModal`) | `<Modal title sub icon head="grad\|soft\|none" width="form\|read" footer close>` |
| `Notice`, `Quote` | créer | `<Notice tone="info" icon={I.shield}>` |
| `Empty` | créer | `<Empty icon title text action>` |
| `Confirm` | créer | Rond de confirmation 56 + titre + texte + actions (écrans « envoyé », « parcours prêt ») |
| `TimeChip` | créer | `<TimeChip t={12.3} tone="appui\|ai\|primary" onClick>` |
| `Rail` | modifier | couleurs de 5.10, `aria-current`, libellés mobiles |
| `GradHead` | modifier | padding `lg`, `TY.h1`, sous-titre blanc plein, propriété `as` |
| `Icon` | modifier | `aria-hidden` par défaut, propriété `title` facultative |
| `GStyle` | modifier | focus global (`:focus-visible` sur tous les interactifs, couleur `primary`), classes `.ty-display`, `.ty-xl`, `.ty-h1`, `.ty-lead`, `.rp-pad-*`, `.rp-page`, `.rp-actions` (boutons en colonne sur mobile) ; suppression de `.rp-h1`, `.rp-h2`, `.rp-h3`, `.rp-head`, `.rp-card-pad`, `.rp-cta` devenues inutiles ; focus des champs en `primary` |

---

## 13. Journal des décisions

| Date | Décision | Pourquoi |
|---|---|---|
| 2026-11-20 | Création du référentiel (v3.0) à partir de l'audit du code | Harmoniser couleurs, typographie, espacements |
| 2026-11-20 | Action principale toujours sarcelle (`objective`) ; bleu plein réservé aux actions neutres hors parcours | Le bleu et la sarcelle se disputaient le rôle |
| 2026-11-20 | Texte de validation en `successDk`, d'attention en `warningDk` ; `success`, `warning`, `error` clairs réservés au décor | Contrastes de 1,8 à 3,0:1 |
| 2026-11-20 | Milieu de `GRAD` en `blueDk`, `GRAD_AI` de `blueDk` à `violet` | Texte blanc à 3,4:1 sur `blue` |
| 2026-11-20 | Bordure des champs en `lineStrong` | Bordure `line` à 1,2:1, invisible pour une partie du public |
| 2026-11-20 | Texte des champs à 16 px | Zoom automatique d'iOS en dessous |
| 2026-11-20 | Échelle typographique à 13 tailles, Inter 500 supprimé | 91 combinaisons relevées |
| 2026-11-20 | Trois paddings de carte (16, 24, 32), cinq largeurs de page | 9 paddings et 12 largeurs relevés |

| 2026-11-20 | Icônes du pied de page en couleur (exception documentée en section 1) | Préférence explicite du propriétaire |
| 2026-11-20 | Implémentation : jetons dans `src/tokens.js`, composants dans `src/ui.jsx` ; `site.jsx` supprimé (plus de doublon `TT`, `TY`, `W`, `MO`, `Field`…) | Une seule définition par jeton et par composant |
| 2026-11-20 | `tests/design-lint.mjs` (`npm run test:design`) bloquant, ajouté à `CLAUDE.md` et `AGENTS.md` | Garantie automatique |
| 2026-11-20 | Nouveaux jetons : `T.glass` (en-tête), `T.studio` (fond uni caméra), `HL.*`, `GRAD_PAGE`, `TY.pageTitle`, `TY.quote`, `TY.strong`, `TY.inherit`, `SH.btn.*`, `PACE`, `HEADER_H` | Valeurs présentes dans des rendus validés, désormais nommées |
| 2026-11-20 | Composants ajoutés : `Bare` (bouton nu pour options, repères, onglets), `CheckTile` (tuile à cocher), `Chip` (`role` radio ou checkbox, `tone="ai"` pour les suggestions de l'assistant) | Supprimer tout `button` natif des écrans (règle K1) |
| 2026-11-20 | Bouton « Arrêter » : le glyphe ■ devient l'icône `I.stop` ; boutons d'envoi : icône à gauche (seule la flèche de progression va à droite) | Section 5.1, pas de glyphe en guise d'icône |
| 2026-11-20 | Pied de page : bloc de liens de navigation retiré (pages déjà dans l'en-tête) ; FAQ et liens légaux conservés | Demande du propriétaire |
| 2026-11-20 | Emplacement du logo d'organisme (« Famickael », cadre pointillé) retiré de l'en-tête, du menu mobile et du pied de page ; `OrgLogo` reste dans `ui.jsx` pour un usage futur | Demande du propriétaire |
| 2026-11-20 | v3.1 : profondeur et marque (`GRAD_TITLE`, `GRAD_ACCROCHE`, `GRAD_HERO`, `GRAD_SECTION`, `GLOW`, `SH.glow`, `SH.glowAi`) et transitions plus calmes (`MO.reveal`, `MO.slow`, `MO.fade`, `MO.soft`, `PACE`) sur les pages publiques | Demande du propriétaire : plus de dégradés et d'effets, fondus plus lents |
| 2026-11-20 | Titres d'étape de la strate épinglée en `TY.h1` (28, mobile 24) au lieu de 24 ; chiffres de la carte de chronologie en `TY.num` ; chapeau de la phrase en `TY.lead` | Une seule échelle |
| 2026-11-20 | « Se connecter » (coach) et « Générer le code » en `objective` ; « Échauffement · ni enregistré, ni analysé » et « Partage · vous décidez » en étiquette `primary` (contexte), « Rapport reçu » en `success` | Rôles des couleurs (1.1, 5.4) |
| 2026-11-20 | Page « Mon espace » ramenée à `W.read` ; liste déroulante des métiers : seule dérogation (K4, option de combobox ARIA) | Largeurs et sémantique |
| 2026-11-20 | Écran de chargement : 1,9 s minimum, fondu 0,6 s ; 0,6 s si « réduire les animations » | Demande du propriétaire : laisser voir l'animation |

| 2026-11-20 | Polices auto-hébergées (`public/fonts/`, `@font-face` générés dans `GStyle`), plus aucun appel à Google Fonts ; Atkinson Hyperlegible ajoutée pour l'option « police lisible » | Conformité (docs/conformite.md, T1) |
| 2026-11-20 | Règle T2 : exception pour `src/content/` (textes qui citent une police) | Mentions légales |
| 2026-11-20 | `PACE.scene` 11 500 ms, `PACE.accroche` 5 000 ms | Demande du propriétaire : laisser le temps de lire les scènes |
| 2026-11-20 | En-tête des espaces : lien « Vos données » et menu « Mes paramètres » (bouton `aria-expanded`, `role="menu"`, flèches, Début, Fin, Échap) à la place de la pastille d'espace | Conformité et demande du propriétaire |
| 2026-11-20 | Pied de page en trois groupes de liens (Vos données, Le site, Informations légales) ; engagements cliquables | docs/conformite.md, 4.3 |

| 2026-11-20 | Assistant en panneau latéral (5.9 bis), composant `Fab`, jeton `GRAD_AI_BORDER` ; plus d'encart d'assistant dans les écrans | Demande du propriétaire |
| 2026-11-20 | Astuces de l'échauffement dans une fenêtre `Modal`, ouverte par un lien au-dessus de la phrase | Demande du propriétaire |

| 2026-11-20 | Entraînement complet (7 questions dans l'ordre réel, mise en situation selon le métier) et écran récapitulatif sans score ; recruteur oral sans visage (`RecruiterVoice` : synthèse vocale de l'appareil, sous-titre mot à mot, « Réécouter », « Couper le son », enregistrement possible seulement quand la voix a fini) | Demandes du propriétaire |

| 2026-11-20 | Couleurs en variables CSS (`T` → `var(--c-*)`), palettes `LIGHT`, `DARK`, `HC_LIGHT`, `HC_DARK`, `FIX` ; tailles de texte multipliées par `--fs` ; familles en variables (`--ff-d`, `--ff-b`) ; règle A1 étendue aux quatre thèmes ; options d'accessibilité (8 bis) | Demande du propriétaire : thème sombre, contraste, police lisible, taille du texte |

| 2026-11-20 | Changement de page en fondu (`MO.pageOut` 300 ms, `MO.pageIn` 450 ms, View Transitions avec repli), en-tête immobile ; lien interne : défilement doux sous l'en-tête puis focus sur la cible (`scrollToTarget`) ; mouvement réduit : saut direct | Demande du propriétaire |
| 2026-11-20 | Navigation à deux niveaux (sous-menus au survol avec délai de fermeture, au clic et au clavier ; accordéons sur mobile) ; page « L'IA et la recherche » | Demande du propriétaire |
| 2026-11-20 | Bordure haute des cartes : pseudo-élément masqué qui épouse l'arrondi. Convention : bleu vers violet (`GRAD_MAIN`) côté personne accompagnée, vert (`GRAD_COACH`, sarcelle vers vert) côté coach, `GRAD_AI` pour l'assistant | Demande du propriétaire |
| 2026-11-20 | Un seul en-tête de page (`PageHero`, surtitre obligatoire) : titre au même endroit sur toutes les pages, vérifié par `test:site` | Demande du propriétaire |
| 2026-11-20 | Modales rendues dans `<body>` (portail) : toujours centrées | Demande du propriétaire |
| 2026-11-20 | « Revenir en haut » (44 px, empilé au-dessus du bouton de l'assistant), boutons de l'en-tête sans déplacement au survol | Demande du propriétaire |
| 2026-11-20 | Logo animé d'attente réutilisable (`BrandLoader`) : connexion à un espace, analyse d'une réponse, fin d'enregistrement ; plein écran ou dans le bloc, `role="status"`, statique en mouvement réduit | Demande du propriétaire |
| 2026-11-20 | Accueil : fins d'accroche et scènes synchronisées (4 scènes), minuteurs en direct, lignes d'encart du bas vers le haut, fond en dégradé qui suit la souris sur toute la page, strate en pile de cartes | Demande du propriétaire |

| 2026-11-21 | Logo aligné sur les couleurs du site : couches masquées colorées par `GRAD_LOGO`, `T.navy`, `T.violet` ; variante claire automatique en thème sombre ; `LOGO_GRAD` (indigo saturé) supprimé ; chargement et icône du site aux mêmes couleurs | Demande du propriétaire : adapter le logo au site, logo invisible en thème sombre |
| 2026-11-21 | Titre de l'accueil en couleur pleine `navy` jusqu'à la virgule, dans les deux thèmes ; `GRAD_TITLE` supprimé | Demande du propriétaire (« blanc jusqu'à la virgule » en sombre) |
| 2026-11-21 | Fond de l'accueil : calque fixe unique, halos du héros retirés, dérive autonome sur tactile, fondu avant le pied de page (`FADE_FOOT`), pied de page opaque au-dessus | Demande du propriétaire : coupure visible sous le héros, fond derrière le pied de page |

| 2026-11-21 | « Mes paramètres » devient « Mon compte » : bouton présent sur toutes les pages (déconnecté : vers « Mon espace » ; connecté : panneau latéral modal, plein écran sur mobile, 5.9 ter), jamais ouvert avec l'assistant | Demande du propriétaire |
| 2026-11-21 | Responsive : défilement réellement bloqué sous le menu et les fenêtres (`html.rp-lock`, `html` portant `overflow-y:scroll`), fond inerte et boutons flottants masqués sous le menu, en-tête resserré sous 420 et 360 px, texte des boutons d'en-tête plafonné à 115 % sur mobile, menu repliable jusqu'à 1279 px quand le texte est agrandi ou espacé (`data-textsize`), mots longs coupés dans les titres, cibles de 44 px sur mobile et écrans tactiles (puces, onglets, sommaire, fil d'Ariane, sources, bulle de l'assistant, logo) | Demande du propriétaire, audit à 11 largeurs |
| 2026-11-21 | Assistant de rédaction du rapport côté coach (5.9 quater), panneau commun `DockPanel` | Demande du propriétaire |
| 2026-11-21 | « Mon espace » : deux formulaires indépendants, donc une action `objective` chacun (« Ouvrir mon espace », « Se connecter ») ; étiquettes « Je m'entraîne » et « Coach » en `primary` (le ton `appui` reste réservé à « Point d'appui ») | Audit UI-04, RED-03 |

| 2026-11-21 | Nouveaux composants de `ui.jsx` : `ConfirmDialog` (suppression confirmée, bouton `dangerSolid`), `RadioGroup` (motif ARIA : un arrêt de tabulation, flèches), `Menu` (« Autres actions »), `Quote size="lg"` (message d'introduction du coach), icônes `volume`, `volumeOff`, `download`, `more` ; `Tag` en hauteur minimale 24 et texte qui passe à la ligne ; flèche du `Select` en icône `primary` | Audit A11Y-10, A11Y-17, UI-02, UI-08, UI-11, UI-12, UI-15 |
| 2026-11-21 | Bulle d'invitation de l'assistant à gauche du bouton flottant, 240 px au plus, jamais sur la relecture vidéo ; mots éteints de la phrase d'accueil en `lineStrong` (3:1 sur `bg`, texte de 32 px et plus) | Audit UI-07, A11Y-12 |

| 2026-11-21 | Mise à jour des valeurs en vigueur (ARC-21) : écran de chargement 2,5 s minimum, fondu 0,7 s (section 7, `Loader.jsx`) ; `PACE.accroche` 11 500 ms ; points de rupture listés en section 6. Les lignes plus anciennes du journal gardent les valeurs de leur date | Audit ARC-21 |

| 2026-11-21 | Titres en **Outfit** (police du logo) à la place de Manrope : `FONT_STACKS.display`, donc `FD` et tous les styles de titre de `TY` ; Outfit 700 et 800 auto-hébergées (`public/fonts/outfit-latin-{700,800}-normal.woff2`, sous-ensemble latin, Fontsource 5.3.0, licence OFL), Manrope retirée ; préchargement d'Outfit 800 dans `index.html` | Demande du propriétaire : titres dans la police du logo |
| 2026-11-21 | Typographie française : espace fine insécable (U+202F) avant `;` `?` `!` et à l'intérieur des guillemets, espace insécable (U+00A0) avant `:` et `%` et entre un nombre et son unité ; contrôlée par `npm run test:content` (`tests/lib/typo-fr.mjs`) | Audit RED-11, demande du propriétaire |

| 2026-11-21 | Fond de l'accueil inversé : le violet et le bleu s'écartent du pointeur au lieu de le suivre, zone claire au fond du thème sous la souris ; tactile inchangé (dérive), rien ne bouge en mouvement réduit ; contrôlé par `test:site` | Demande du propriétaire : la zone pointée devenait illisible |
| 2026-11-21 | Fond de l'accueil : zone claire sous le pointeur retirée ; retour aux deux masses d'origine, qui reçoivent des décalages opposés au mouvement de la souris (elles s'écartent du pointeur sur leur diagonale et glissent en sens contraires sur l'autre ; amorti, `transform` seulement), extrait dans `src/home/Background.jsx` ; tactile inchangé (dérive), rien ne bouge en mouvement réduit ; contrôlé par `test:site` | Demande du propriétaire : pas de point blanc qui suit la souris, ce sont les couleurs autour qui doivent bouger |
| 2026-11-21 | Écran de chargement (v3.4) : barre violette de 3 px sous le logo ; sortie en un seul mouvement de 0,8 s (fondu du calque et écart des deux bulles) ; calque de `100vw` (plus de décalage à l'apparition de la barre de défilement) ; retrait après l'écran d'attente de page éventuel ; fondu simple en mouvement réduit, retrait de secours rétabli en mouvement réduit ; durée minimale inchangée (2,5 s). Vérifié image par image (valeurs relevées à chaque image) | Demande du propriétaire : sursaut à la fin du chargement, barre de progression |
| 2026-11-21 | Options d'accessibilité (v3.4) : languette en demi-cercle au bord gauche (bas à gauche sur mobile) qui s'allonge au survol et au focus, panneau qui se déploie depuis elle par `clip-path` (plus de `Modal`), menu refait en quatre groupes avec interrupteurs visibles et état, focus retenu, Échap et clic extérieur ; bouton de l'en-tête masqué ; exception de taille de cible documentée (8 bis) | Demande du propriétaire |
| 2026-11-21 | Pied de page : logo et brief passent sous les engagements, à côté des groupes de liens, sur une rangée de quatre blocs (3/2/2/2), deux colonnes en tablette ; espace réservé sous le pied sur mobile | Demande du propriétaire : moins d'espace vide, brief à côté de « Vos données » |
| 2026-11-21 | « Revenir en haut » en fondu (opacité et 8 px ; opacité seule en mouvement réduit) | Demande du propriétaire : pas d'apparition sèche |
| 2026-11-21 | « Mon espace » : première vue sans défilement, en-tête de page retiré (`h1` masqué visuellement), carte coach repliée sous un lien sur mobile ; textes « Écrivez le code d'accès donné par votre coach ou votre conseiller. » et « Votre code suffit : pas de compte, pas de mot de passe. Gardez-le pour vous. » | Demande du propriétaire, panel bénéficiaire |
| 2026-11-21 | Nouveaux menus : À propos (sans sous-menu), Solutions, Cas d'usage, Ressources ; un seul sous-menu visible, délai d'intention et bascule sans chevauchement ; « Mon compte » en menu déroulant sous le bouton (dans le menu mobile sur les pages publiques) ; « Demander de l'aide » en session ; bouton d'accessibilité retiré de l'en-tête | Demande du propriétaire |
| 2026-11-21 | Accueil : phrase « Un entretien, ça se prépare à voix haute » remontée juste sous le héros et le bandeau ; bandeau en quatre engagements (« Sans frais pour vous », « Démarrage rapide », « Sécurisé », « Confidentiel », icônes `gift`, `zap`, `shield`, `eyeOff`, chacun précisé en une ligne) ; mini FAQ retirée ; héros sans « Voir comment ça marche » ni ligne sur le compte ; pastille « Sans jugement » ; « Nous contacter » et « Demander de l'aide » de l'en-tête au style `navlink` | Demande du propriétaire |
| 2026-11-21 | Verts (v3.5) : un rôle par vert. Nouveau rôle « coach et accompagnement » (`coach`, `coachDk`, `coachBg`, ton `coach` de `Tag`) ; `GRAD_COACH` recomposé (`coach` vers `coachDk`) et `GRAD_DOOR_GREEN` = `GRAD_COACH` ; pastille « Avec votre coach », carte « Coachs », scénarios d'accompagnement et encart « Conseil » en vert coach ; cadenas de la scène du héros en `primary` ; aside « Commanditaires » de « Nous contacter » en barre de marque | Demande du propriétaire : un seul rôle par vert, même vert partout côté coach |
| 2026-11-21 | Titres : retour à la police précédente à la demande du propriétaire. **Manrope** 700 et 800 (`FONT_STACKS.display`, donc `FD`), mêmes graisses et mêmes interlettrages qu'avant (`display` -0,035em, `xl` et `pageTitle` -0,03em, `h1` -0,02em, `h2` -0,01em) ; fichiers `public/fonts/manrope-latin-{700,800}-normal.woff2` restaurés, préchargement de Manrope 800 dans `index.html` ; Outfit retirée du site (fichier 700 supprimé, `@font-face` et préchargement retirés), Outfit 800 gardée pour l'image d'aperçu de lien (`scripts/og-image.html`) ; crédits des mentions légales et `public/fonts/LICENCES.txt` mis à jour | Demande du propriétaire : titres en Outfit gras non retenus |
| 2026-11-21 | Apparition au défilement étendue à tous les blocs des pages publiques (questions de FAQ, cartes, listes, encadrés, onglets, tableaux et sections des pages légales, cartes et corps des articles, formulaire et encart de « Nous contacter », cartes de « Mon espace », cartes animées de l'accueil) ; `stagger(i, n)` (70 ms, remis à zéro par rangée) et `Reveal as` ; contenu visible à l'impression ; contrôle ajouté dans `test:site` | Demande du propriétaire : animation d'apparition oubliée (FAQ) |
| 2026-11-21 | Accueil : pastilles « Avec votre coach » (ton `appui`, sarcelle de `GRAD_COACH`, et non le vert de validation), « Assistant IA » (ton `ai`), « Sans note » ; bandeau de réassurance (trois puces) sous le héros ; « Ce que La Répét' ne fait pas » sur quatre cartes (`rs-g4`) | Demande du propriétaire, panel bénéficiaires |

| 2026-11-21 | Écran de chargement (v3.5) : sortie en trois temps (écart des bulles 0,6 s, pause 0,3 s, fondu 0,6 s) ; la sortie attend une page immobile (polices, images visibles, animations d'entrée terminées) ; barre de défilement réservée dès `index.html`. Cause du sursaut : quand le JavaScript arrivait tard, l'animation d'entrée du héros et des lignes de la scène se jouait pendant le fondu. Vérifié image par image à 1280 et 390 px, clair et sombre, réseau ralenti | Demande du propriétaire : sursaut à la fin du chargement, voir la séparation du logo |
| 2026-11-22 | Écran de chargement : bulles et points du logo en boîtes HTML animées sur le compositeur (`transform`, `opacity`), au lieu de groupes SVG animés sur le fil principal dans Firefox et Safari ; rendu identique (captures comparées au pixel près, hors anticrénelage) | Demande du propriétaire : sursaut à la fin du chargement du logo |
| 2026-11-22 | Vignette d'interlocuteur (5.9 quinquies) : option désactivée par défaut, silhouette neutre sans visage, barres « parle » liées à la seule voix de synthèse, fenêtre fixe dans la marge sur grand écran, bandeau dans le flux en dessous de 1240 px | Demande du propriétaire ; aucune réaction à la personne (AI Act), ne masque aucune commande |

Ajouter une ligne à chaque évolution d'une règle ou d'une échelle.
