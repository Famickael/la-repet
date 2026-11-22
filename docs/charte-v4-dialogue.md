# Charte v4 : dialogue entre la direction artistique et le design UI/UX

22 novembre 2026. Ce document garde la trace de la discussion qui a mené à la version 4 du référentiel (`docs/design-system.md`). Il ne fait pas foi : en cas d'écart, c'est le référentiel qui s'applique.

Deux rôles, tenus à tour de rôle :

- **DA** : directrice artistique et graphiste. Elle défend la marque, la couleur, le rythme visuel.
- **UX** : designer UI/UX. Il défend la lisibilité, les contrastes, le rôle unique de chaque couleur, le mouvement réduit et la charge cognitive d'un public parfois peu à l'aise avec le numérique.

Les deux sont soumis à la charte. Ils ne peuvent la faire évoluer que d'un commun accord.

## 1. Les retours du propriétaire

1. « Les couleurs que tu choisis (par exemple pour les boutons CTA en bas), je n'ai pas l'impression que ce soient les mêmes couleurs que le logo. »
2. « Je trouve que les autres pages sont un peu fades, elles manquent de couleurs. »
3. Les deux experts sont soumis à la charte du site. S'ils se mettent d'accord, ils peuvent proposer une amélioration de la charte, qui fait évoluer tout le site.

## 2. État des lieux (charte v3.5)

Captures de toutes les pages à 1280 et 390 px, en clair et en sombre : accueil, À propos, Solutions et ses quatre pages, Cas d'usage et ses trois pages, Ressources, un article, FAQ, Nous contacter, Mon espace, espace de la personne (code REPETE), espace coach, Vos données. Planches avant et après : `tests/screenshots/charte-v4/`.

### 2.1 Les couleurs réelles du logo

| Élément | Source | Clair | Sombre |
|---|---|---|---|
| Bulles (dégradé à 45°, du bas gauche vers le haut droit) | `public/favicon.svg`, `GRAD_LOGO`, écran de chargement d'`index.html` | `#3893CD` (bleu, teinte 203°) vers `#5C4BB9` (violet, teinte 249°) | `#5AAEE0` vers `#B4A9F5` |
| Points de la bulle et mot-symbole | `T.navy` | `#1B3A66` | `#E8EEF8` |
| Accents des « é » | `T.violet` | `#5C4BB9` | `#B4A9F5` |

Le logo, c'est donc trois choses : un bleu vif, un violet, et une encre bleu nuit.

### 2.2 Ce que le site montrait

| Élément | Couleur en v3.5 | Est-ce une couleur du logo ? |
|---|---|---|
| Bouton d'action principale (`objective`) : « Lancer… », « Ouvrir mon espace », « Se connecter », « Envoyer ma demande » | sarcelle `#0B7A75` (teinte 177°) | Non. Aucun vert dans le logo |
| Bouton neutre fort (`primary`) : « Mon compte », onglet actif | bleu gris `#386097` (teinte 215°, saturation 46 %) | De loin : même famille que l'encre du logo, mais terne à côté du bleu `#3893CD` (saturation 60 %) |
| Bandeau d'appel en bas de page (`GRAD`) | `#386097` vers `#2E7CB0` vers `#5C4BB9`, à 135° | En partie : il finit sur le violet du logo, mais il part du bleu gris et tourne dans l'autre sens |
| En-tête des pages secondaires (`GRAD_PAGE`) | `#EEF2F8` vers `#F8FAFC` | Non : un gris bleuté presque invisible |
| Pastilles d'icône des cartes | `#386097` sur `#EEF2F8` | Non |
| Liens, surtitres, icônes | `#386097` | Non |
| Fond des pages secondaires | `#F8FAFC` uni, cartes blanches | Sans couleur |

**Constat partagé.** Le propriétaire a raison sur les deux points. Le seul endroit où l'on voit les couleurs du logo, hors du logo lui-même, est l'accueil (titre d'accroche, halos). Sur une page secondaire, la première couleur franche est un bouton vert, la seconde un bandeau bleu gris en bas. Entre les deux : du blanc, du gris clair et du bleu gris.

## 3. Le dialogue

### 3.1 L'action principale

**DA.** Le bouton principal est l'élément le plus regardé du site, et c'est le seul qui ne porte aucune couleur de la marque. Je propose de lui donner le dégradé du logo : bleu `#3893CD` vers violet `#5C4BB9`, dans le même sens que le symbole.

**UX.** Quatre objections.

1. Le texte blanc sur `#3893CD` fait 3,4:1. C'est écrit dans la charte (1.5) : combinaison interdite. Le bouton principal ne peut pas être le moins lisible du site.
2. La charte dit « sarcelle = action ». Le journal du 20 novembre rappelle pourquoi : le bleu et la sarcelle se disputaient le rôle. Si l'action devient bleue, elle se confond avec le bouton `primary`, bleu lui aussi.
3. Un dégradé de `blueDk` à `violet`, c'est exactement `GRAD_AI`, le bouton de l'assistant. Deux rôles, une seule apparence : on perd « violet = IA ».
4. La charte interdit le dégradé au survol d'un bouton non IA, et il faut que le bouton reste lisible dans les quatre thèmes.

**DA.** Sur le contraste : d'accord, on part de la version lisible du bleu du logo, pas du bleu lui-même. `blueDk` existe pour cela. Sur la sarcelle : le propriétaire ne dit pas « je ne comprends pas où cliquer », il dit « ce n'est pas la couleur de mon logo ». Une couleur d'action étrangère à la marque est un défaut de marque. Et le rôle « action » n'a pas besoin d'une teinte à part : il a besoin d'un aspect unique.

**UX.** Alors donnons-lui un aspect unique, et écrivons-le. Voici mes conditions.

- Le bouton `objective` est le **seul** élément plein en dégradé bleu vers violet d'un écran d'application. Le bouton `primary` reste uni, donc les deux ne se confondent pas : l'un est un aplat, l'autre un dégradé avec une ombre colorée.
- L'assistant **perd le bleu** : `GRAD_AI` devient violet seul (`violet` vers un violet plus dense). La règle devient plus simple qu'avant : le dégradé complet du logo, c'est la marque et l'action ; le violet seul, c'est l'IA.
- `blueDk` est assombri d'un cran : 4,5:1 « de justesse » ne convient pas au bouton principal. `#2A78AC` donne 4,8:1 sous du blanc, et le milieu du dégradé 5,6:1.
- Le dégradé est écrit en variables de thème : en sombre, le bouton prend les teintes claires du logo sombre avec un texte foncé (8,5:1 à 7,8:1), comme le faisait déjà le bouton sarcelle.
- Le survol ne fait pas apparaître un dégradé : il densifie le même (`primary` vers `violetDk`), avec l'ombre du niveau supérieur. La règle « pas de dégradé au survol d'un bouton non IA » est reformulée : un bouton uni reste uni au survol.

**DA.** J'accepte tout. Que devient la sarcelle ?

**UX.** Elle garde ce qui la rendait utile dans le retour : les points d'appui et l'étape en cours. Elle perd seulement le bouton. Je note honnêtement ce qu'on perd : une teinte réservée à l'action. On le compense par l'aspect (seul bouton en dégradé, ombre colorée, flèche de progression) et par la place (toujours à droite, toujours unique). C'est un point à faire valider par le propriétaire.

**Accord.** Décisions D1 à D4.

### 3.2 Le bleu de structure

**DA.** `primary` (`#386097`) est partout : liens, surtitres, icônes, « Mon compte ». C'est lui qui donne au site son air gris. Je propose de le resserrer sur la famille du logo, entre son bleu et son violet, avec la saturation du logo : `#2B5CAB` (teinte 217°, saturation 60 %).

**UX.** Je vérifie avant de répondre. Sur blanc 6,5:1 (contre 6,4), sur `bg` 6,2, sur le fond teinté 5,7. Les liens se distinguent mieux du texte `navy` qu'avant, ce qui aide les personnes qui repèrent mal les liens. Les variantes de contraste renforcé ne changent pas. D'accord, à condition que `primaryDk`, `primaryLt`, `primaryBg` et les ombres colorées suivent, et que la règle A1 repasse dans les quatre thèmes.

**Accord.** Décision D5.

### 3.3 L'en-tête des pages secondaires

**DA.** Chaque page secondaire doit s'ouvrir sur la marque. Je propose un en-tête en dégradé du logo plein, titre blanc, comme le bandeau du bas.

**UX.** Non, pour trois raisons. Le titre de page et son chapeau sont le texte le plus important de l'écran : je ne le pose pas en blanc sur une couleur vive alors que tout le reste du site est en `navy` sur clair. Certaines pages portent dans cet en-tête un bouton `objective`, des puces de navigation et un message d'information : tout serait à redessiner « sur fond sombre ». Et deux bandeaux pleins, un en haut et un en bas, écrasent le contenu entre les deux.

**DA.** Alors un fond clair, mais coloré, et pas un gris. Le bleu teinté à gauche, le violet teinté à droite : les deux teintes du logo. Plus un filet de 3 px en dégradé du logo sous l'en-tête, et le symbole du logo en grand, en filigrane, à droite.

**UX.** Le fond : oui, s'il est fait de fonds opaques déjà dans la charte (`primaryBg`, `surface`, `violetBg`), pour que chaque contraste soit vérifiable. J'ajoute les paires manquantes à la règle A1 (`body` et `primary` sur `violetBg`). Le filet : oui, c'est du décor, il remplace une bordure. Le filigrane : oui sous conditions. Jamais sous le texte, donc affiché seulement à partir de 1180 px de large, où la colonne de texte lui laisse la place ; absent quand la page a déjà une photo ; masqué du lecteur d'écran, à l'impression et en mode « concentration » ; immobile.

**DA.** Immobile me va. Le violet teinté à droite ne risque-t-il pas de signifier « IA » ?

**UX.** La charte a déjà l'exception : le violet associé au bleu dans un dégradé est la marque. Un fond qui va du bleu teinté au violet teinté est un dégradé de marque. Je l'écris dans la règle.

**Accord.** Décisions D6 et D7.

### 3.4 Le rythme des sections

**DA.** Entre l'en-tête et le bandeau du bas, les pages sont une longue colonne blanche. Je propose des sections colorées : une bleue, une violette, une verte, pour rythmer.

**UX.** Une violette dirait « assistant », une verte dirait « coach » ou « validé ». Chaque couleur a un rôle, et le public de ce site a besoin que ces rôles ne bougent pas. Je refuse le multicolore. En revanche, l'alternance est une bonne idée : elle aide à voir où une section commence et finit.

**DA.** Une seule teinte alors, mais visible.

**UX.** Une bande teintée bleutée, pleine largeur, une section sur deux, jamais la première, jamais deux de suite. Trois précautions.

- Si la bande prend `primaryBg`, les messages d'information (`Notice`, eux aussi en `primaryBg`) disparaissent dedans. Il faut une teinte à part, plus claire : nouveau jeton `band` (`#F0F4FC`, entre `bg` et `primaryBg`).
- La charte interdit le texte `muted` sur un fond teinté (4,3:1). Avec une section sur deux teintée, cette règle serait violée tôt ou tard. Je préfère corriger la cause : `muted` passe de `#64748B` à `#5B6B82`. Il gagne en contraste partout (5,4:1 sur blanc) et passe à 4,9:1 sur la bande.
- La règle est automatique (elle vient de `Section`), pas décidée page par page : sinon chaque page aura son rythme et la charte ne tiendra pas.

**DA.** En thème sombre, je veux que les cartes restent plus claires que la bande.

**UX.** `band` sombre à `#121A27`, entre `bg` et `surface`. Vérifié sur les captures.

**Accord.** Décisions D8 et D9.

### 3.5 Les cartes et leurs icônes

**DA.** Les grilles de cartes sont le gros du contenu, et leurs pastilles d'icône sont gris bleu sur gris clair. Je propose une couleur par carte.

**UX.** Même réponse : une couleur par carte, c'est neuf couleurs sans signification, et la personne cherchera ce que le vert ou l'orange veulent dire. Mais je suis d'accord sur le fond : ces pastilles sont l'endroit idéal pour la marque, parce qu'elles sont décoratives.

**DA.** Alors la tuile d'icône de marque : le dégradé du logo en fond, l'icône en clair.

**UX.** Contraste de l'icône : blanc sur `blue` 3,4:1, au-dessus du seuil de 3:1 des éléments graphiques, et 6,6:1 côté violet. J'ajoute la paire à A1. Deux limites.

- Les tuiles de rôle gardent leur rôle : violet seul pour l'assistant, vert pour le coach. Elles deviennent pleines elles aussi, pour avoir le même poids que les autres.
- Seulement sur les pages publiques. Dans les espaces (personne, coach), une grille de tuiles vives ferait concurrence au bouton d'action, qui doit rester la seule couleur forte de l'écran. Les espaces gardent la pastille neutre.

**Accord.** Décision D10.

### 3.6 Ce que l'UX a refusé

**DA.** J'avais aussi dans ma liste : des halos animés derrière les en-têtes de page, comme sur l'accueil ; les numéros d'étape (« 01 », « 02 ») en dégradé ; une barre de couleur qui se remplit au fil des sections.

**UX.** Non aux trois.

- Les halos animés : l'accueil en a, et il a fallu trois itérations pour qu'ils ne gênent pas la lecture. Sur des pages de contenu, lues par des personnes parfois stressées avant un entretien, je ne rajoute aucun mouvement. La charte v4 n'ajoute **aucune animation**.
- Les numéros en dégradé : un grand chiffre coloré ressemble à un score. La règle non négociable dit qu'aucun élément ne doit suggérer une évaluation. Les numéros d'étape restent en `navy`.
- La barre qui se remplit : c'est une jauge. Refus net.

**DA.** D'accord sur les trois. Je retire aussi l'idée de colorer les compteurs de l'espace coach.

**Accord.** Décision D11.

### 3.7 Les espaces (personne et coach)

**DA.** Les espaces sont eux aussi pâles.

**UX.** Ils doivent le rester : ce sont des écrans de travail, avec une action à la fois. Ils reçoivent ce qui découle des jetons : le bouton d'action aux couleurs du logo, l'en-tête dégradé des cartes (`GRAD`) aux couleurs exactes du logo, le bleu de structure plus franc, le bouton de l'assistant en violet seul. Rien d'autre.

**DA.** Le côté coach garde son vert ?

**UX.** Oui : barre des cartes, pastilles, étiquettes. Le bouton d'action y est aux couleurs de la marque, comme partout : « action » ne change pas de couleur selon l'espace.

**Accord.** Décision D12.

## 4. Décisions

| N° | Décision | Jetons et composants |
|---|---|---|
| D1 | L'action principale prend le dégradé du logo dans sa version lisible, dans le sens du logo (45°) | `GRAD_CTA` (`blueDk` vers `violet`, en variables), bouton `objective` |
| D2 | Survol du bouton d'action : même dégradé, un cran plus dense, ombre du niveau supérieur | `GRAD_CTA_HOVER` (`primary` vers `violetDk`), `SH.btn.objective` |
| D3 | L'assistant est en violet seul, sans bleu | `GRAD_AI` (`violet` vers `violetDk`), `GRAD_AI_BORDER` (`violet`, `lavender`), nouveau jeton `violetDk` |
| D4 | La sarcelle garde les points d'appui et l'étape en cours ; elle n'habille plus aucun bouton | `accent`, `accentDk`, `accentLt`, `accentBg` |
| D5 | Le bleu de structure se resserre sur la famille du logo | `primary` `#2B5CAB`, `primaryDk` `#234A8C`, `primaryLt` `#4A78C6`, `primaryBg` `#EAF0FB`, `blueDk` `#2A78AC` |
| D6 | Les bandeaux de marque (appel final, en-tête dégradé des cartes et des fenêtres) prennent les couleurs exactes du logo, dans son sens | `GRAD` (`blueDk` vers `violet`, 45°) |
| D7 | En-tête des pages secondaires : fond du bleu teinté au violet teinté, filet de marque, symbole en filigrane sur grand écran | `GRAD_PAGE`, `PageHero`, `Eyebrow mark` |
| D8 | Une section sur deux sur une bande teintée pleine largeur, jamais la première | jeton `band`, `Section` (classe `rs-sec`) |
| D9 | `muted` assombri pour rester lisible sur les fonds teintés | `muted` `#5B6B82` |
| D10 | Tuile d'icône de marque sur les pages publiques ; tuiles de rôle pleines (violet seul, vert coach) ; pastille neutre dans les espaces | `IconTile`, `GRAD_LOGO`, `GRAD_AI`, `GRAD_COACH` |
| D11 | Aucune animation ajoutée ; aucun chiffre, aucune barre, aucun élément coloré qui évoque une note ou une jauge | |
| D12 | Les espaces restent sobres : ils ne reçoivent que ce qui vient des jetons | |

Contrôle automatique : règles G1 à G5 de `tests/design-lint.mjs` et nouvelles paires de la règle A1 (référentiel, section 11).

## 5. Points à valider par le propriétaire

1. **Le bouton d'action n'est plus vert.** C'est la réponse directe au premier retour, mais c'est aussi le changement le plus visible. La sarcelle reste dans le retour de l'assistant (points d'appui) et dans les étapes.
2. **Le bleu du site est plus franc** (`#2B5CAB` au lieu de `#386097`) : liens, surtitres, « Mon compte ».
3. **Le symbole en filigrane** dans l'en-tête des pages (grand écran seulement) : à garder ou à retirer.
4. **La bande teintée une section sur deux** : son intensité (`#F0F4FC`) est volontairement légère.
5. **Les tuiles d'icône en dégradé** sur les pages publiques.
6. **L'image de partage** (`public/og-image.png`) et le brief des images (`docs/briefs/chatgpt-images.md`) citent encore les anciennes teintes : hors du périmètre de cette mission, à reprendre.
