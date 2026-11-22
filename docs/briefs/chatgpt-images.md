# Brief ChatGPT : images du site

Chaque image ci-dessous est déjà référencée par le code. Pour la remplacer, il suffit de déposer un fichier **au même chemin et sous le même nom** dans `public/img/`, puis de lancer `npm run build`. Les fichiers actuels sont provisoires : photos libres d'Unsplash (crédits dans le README) ou visuels de remplacement sobres générés en PIL.

## Règles communes à toutes les images

- **Format** : WebP (qualité 75 à 80), 150 Ko maximum, profil sRGB. Dimensions exactes indiquées pour chaque image (le code recadre en `object-fit: cover`, garder le sujet au centre et une marge de 10 % sur les bords).
- **Style** : photographie réaliste, naturelle, en situation, lumière du jour douce, profondeur de champ modérée. Pas d'aspect « banque d'images » figé ni de pose exagérée.
- **Palette cohérente avec la direction artistique** : fonds clairs (blanc cassé, gris très clair `#F8FAFC`), touches de bleu `#386097`, de sarcelle `#0B7A75` et de violet `#5C4BB9` dans les vêtements ou le décor, sans saturation forte.
- **Personnes variées** : âges, genres, origines, morphologies, styles vestimentaires différents d'une image à l'autre ; tenues de travail ordinaires (pas uniquement des costumes). Contexte : France, organismes d'accompagnement vers l'emploi, petites entreprises, services publics.
- **Interdits** : aucun texte lisible, aucun logo ni marque (ordinateurs, tasses, vêtements), aucun écran lisible, aucun visage stéréotypé ni caricatural, aucune expression d'émotion appuyée (larmes, stress mimé, triomphe), aucun graphique, score, jauge ou courbe, aucun enfant, aucune personne réelle identifiable.
- **Texte alternatif** : celui indiqué ci-dessous est déjà dans le code ; si l'image produite diffère, mettre à jour le texte au même endroit.

## Héros de l'accueil (scènes en boucle)

| Fichier | Dimensions | Consigne | Texte alternatif (dans `src/Home.jsx`, `SCENES`) |
|---|---|---|---|
| `public/img/recruteuse.webp` | 900 × 1125 (4:5, portrait) | Une recruteuse de 40 à 55 ans, vue de face légèrement de trois quarts, assise à une table de bureau clair, bloc-notes à la main, écoute attentive et bienveillante, regard vers la caméra ou juste à côté. Espace libre en haut à gauche (une bulle de question s'y superpose) et en bas à droite (une carte d'aperçu). | Une recruteuse écoute la personne en face d'elle, un bloc-notes à la main. |
| `public/img/entrainement.webp` | 900 × 1125 (4:5) | Une personne de 20 à 35 ans s'entraîne seule chez elle ou dans un espace calme, face à un ordinateur portable posé sur une table, écouteurs, carnet ouvert, en train de parler. Écran non visible. Espace libre en haut à gauche et en bas à droite. | Un homme s'entraîne devant son ordinateur portable, écouteurs aux oreilles. (adapter si la personne change) |
| `public/img/coach.webp` | 900 × 1125 (4:5) | Un ou une coach de 35 à 60 ans relit un entretien sur un ordinateur portable (écran non visible) et prend des notes dans un carnet, bureau clair avec plantes. | Un coach relit un entretien sur son ordinateur et prend des notes. |

## Pages À propos et Solutions

| Fichier | Dimensions | Consigne | Texte alternatif |
|---|---|---|---|
| `public/img/a-propos.webp` | 1200 × 800 (3:2) | Deux personnes échangent autour d'une petite table ronde près d'une fenêtre : une conseillère et une personne accompagnée, attitude d'écoute réciproque. | Deux femmes échangent autour d'une table ronde, dans un bureau lumineux. (`src/About.jsx`) |
| `public/img/solutions-equipe.webp` | 1200 × 800 (3:2) | Une coach et une personne accompagnée assises face à face, l'une montre un carnet à l'autre ; lumière de fenêtre latérale. | Une coach et une personne accompagnée échangent autour d'une table ronde. (`src/Solutions.jsx`) |

## Catégories du centre de ressources

Chemin : `public/img/categories/<identifiant>.webp`, **800 × 450 (16:9)**. Image décorative (texte alternatif vide dans le code) : ambiance plus que récit, sujet centré, beaucoup d'air.

| Fichier | Catégorie | Consigne |
|---|---|---|
| `categories/preparer.webp` | Préparer son entretien | Une personne relit ses notes à voix haute à une table, carnet ouvert, lumière du jour. |
| `categories/questions.webp` | Questions de recruteurs | Deux personnes en échange autour d'une table, vue de trois quarts, la recruteuse écoute. |
| `categories/visio.webp` | Entretien en visio | Une personne face à son ordinateur portable, lumière de fenêtre devant elle, intérieur rangé. |
| `categories/guides.webp` | Guides La Répét' | Gros plan sur des mains qui tiennent un téléphone posé sur un support, écran non lisible, carnet à côté. |
| `categories/coachs.webp` | Pour les coachs | Une coach annote un carnet à côté d'un ordinateur, dans un bureau clair. |
| `categories/commanditaires.webp` | Pour les commanditaires | Une petite équipe de trois personnes en réunion autour d'une table, ambiance calme. |

## En-têtes d'articles

Chemin : `public/img/ressources/<slug>.webp`, **1200 × 630** (format de partage). Sujet centré, rien d'important dans les 60 px du haut et du bas. Le texte alternatif est le champ `imageAlt` de l'article (`src/content/resources/<slug>.md`) : produire une image qui lui correspond, ou modifier ce champ. Les images marquées « provisoire PIL » sont des visuels de remplacement à produire en priorité.

| Fichier | Article | Texte alternatif attendu (consigne de scène) | État actuel |
|---|---|---|---|
| `ressources/confier-un-accompagnement.webp` | Confier un accompagnement à notre organisme | Deux femmes échangent autour d'une petite table ronde près d'une fenêtre. | provisoire PIL |
| `ressources/gerer-le-trac-et-preparer-sa-venue.webp` | Gérer le trac et préparer sa venue | Une personne vérifie un itinéraire sur son téléphone avant un rendez-vous. | provisoire PIL |
| `ressources/parler-de-ses-experiences-methode-sar.webp` | Parler de ses expériences avec la méthode situation, action, résultat | Deux personnes échangent autour d'une table de réunion dans un bureau lumineux. | photo Unsplash provisoire |
| `ressources/premiere-repetition-pas-a-pas.webp` | Votre premier entraînement, pas à pas | Un homme avec des écouteurs s'entraîne face à son ordinateur portable, un carnet ouvert devant lui. | photo Unsplash provisoire |
| `ressources/questions-a-poser-et-questions-interdites.webp` | Les questions à poser au recruteur, et celles qu'on ne peut pas vous poser | Un homme et une femme échangent autour d'une table, dans un bureau décoré de dessins encadrés. | photo Unsplash provisoire |
| `ressources/questions-frequentes-des-recruteurs.webp` | Les questions fréquentes des recruteurs, et comment les aborder | Une recruteuse à lunettes pose une question à un candidat assis face à elle. | photo Unsplash provisoire |
| `ressources/relire-une-reponse-et-preparer-le-debriefing.webp` | Relire un entretien et préparer le débriefing | Un coach à lunettes prend des notes dans un carnet devant son ordinateur portable. | photo Unsplash provisoire |
| `ressources/reussir-un-entretien-en-visio.webp` | Réussir un entretien en visio | Une jeune femme salue de la main pendant un appel vidéo sur son ordinateur portable. | photo Unsplash provisoire |
| `ressources/scenario-accompagnement-a-distance.webp` | Un accompagnement individuel à distance | Une personne échange en visio depuis son domicile, un carnet à côté de son ordinateur. | provisoire PIL |
| `ressources/scenario-atelier-collectif.webp` | Un atelier collectif de préparation aux entretiens | Un groupe de personnes échange autour d'une table lors d'un atelier. | provisoire PIL |
| `ressources/se-presenter-en-deux-minutes.webp` | Se présenter en deux minutes, sans réciter son CV | Une femme souriante, assise à une table, présente son parcours à une personne hors champ. | photo Unsplash provisoire |

Pour un nouvel article, suivre la même règle : `public/img/ressources/<slug>.webp`, 1200 × 630, et un `imageAlt` qui décrit l'image.

## Scènes du héros de l'accueil (à fournir)

Chaque scène est liée à une fin d'accroche (`SCENES` dans `src/Home.jsx`). Deux scènes utilisent pour l'instant une photo d'article comme visuel provisoire : déposer le fichier ci-dessous, puis remplacer `src` dans `SCENES`.

| Fichier attendu | Fin d'accroche | Contenu souhaité | Format | Visuel provisoire |
|---|---|---|---|---|
| `heros-echauffement.webp` | « sans jugement. » | Une personne chez elle, détendue, qui parle à voix haute face à son ordinateur ou son téléphone (échauffement). Visage dans le tiers supérieur, sans texte ni logo. | 900 × 1125 (4:5), 150 Ko max | `ressources/se-presenter-en-deux-minutes.webp` |
| `heros-transcription.webp` | « avec vos mots. » | Une personne qui explique quelque chose avec ses mots, gestes naturels, cadrage serré. Visage dans le tiers supérieur. | 900 × 1125 (4:5), 150 Ko max | `ressources/parler-de-ses-experiences-methode-sar.webp` |

## Vérification

1. Déposer les fichiers aux chemins exacts (même nom, même extension `.webp`).
2. `npm run build`, puis `npm run test:site` : les captures de `tests/screenshots/site/` montrent chaque page à 1280 et 390 px.
3. Mettre à jour la section « Crédits photos » du README (retirer les crédits Unsplash des images remplacées, indiquer « image générée » pour les nouvelles).
