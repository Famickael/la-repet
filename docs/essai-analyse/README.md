# Essai d'analyse de trois entretiens (22 novembre 2026)

Cet essai montre ce que le site affiche quand l'analyse d'un entretien est rédigée par un modèle de langage, de la transcription jusqu'aux écrans de la personne et du coach.

**À savoir avant de lire.**

- **Aucune clé d'API n'a été utilisée.** Les trois réponses du dossier `reponses-modele/` ont été écrites par un Claude (l'agent Claude Code de cette session) qui **joue le rôle du modèle** : il a reçu la requête exacte que le site envoie, et il a répondu dans le format attendu. Ce ne sont pas des réponses de l'API en production. Le modèle configuré dans le proxy, sa vitesse, son taux de textes refusés par le filtre et son coût restent à mesurer avec une vraie clé.
- **Les trois personnes sont fictives.** Les transcriptions ont été écrites pour l'essai, au format des segments horodatés que produit Whisper. Personne n'a été enregistré. La coach « Sophie M. » et ses remarques sont fictives aussi.
- Les réponses ont été écrites **avant** de passer le filtre, et n'ont pas été retouchées ensuite.

## Les trois cas

| Cas | Personne (fictive) | Question | Particularités |
|---|---|---|---|
| 1 | Nadia B., en reconversion vers l'accueil | « Parlez-moi de vous. » | vidéo, 1 min 04, des « euh », fin faible (« Je crois que c'est tout ») |
| 2 | Yanis T., préparateur de commandes | « Pourquoi ce poste ? » | voix seule, 21 s, sans exemple |
| 3 | Claire R., mobilité interne | « Pourquoi souhaitez-vous ce poste ? » | vidéo, 1 min 26, longue et structurée |

## Ce que contient le dossier

| Dossier ou fichier | Contenu |
|---|---|
| `transcriptions/` | les trois transcriptions : poste, question, durée, segments horodatés, résumé du regard pour les deux vidéos |
| `analyse-locale/` | ce que calcule le site sans modèle de langage (`localAnalysis`, `src/lib/analysis.js`) : mesures, repères, résumé |
| `requetes/*.json` | la requête exacte envoyée par le site (`feedbackRequest`, `src/lib/llm.js`) : tâche `feedback`, prompt système, données balisées, sortie JSON |
| `requetes/*.message.txt` | le seul message de données, plus facile à lire |
| `requetes/recue-par-le-fournisseur-*.json` | la même requête, telle que le proxy (`serveur/llm-proxy`) la traduit pour le fournisseur : modèle, plafond de jetons, schéma de sortie |
| `reponses-modele/` | les réponses du Claude qui joue le modèle, telles quelles (un objet JSON) |
| `resultat-filtre/` | le verdict du filtre texte par texte (`src/lib/compliance.js`), les longueurs, puis l'analyse affichée par le site |
| `essai-du-filtre/` | une réponse **écrite exprès pour enfreindre les consignes** (ce n'est pas une réponse du modèle) et ce qu'en fait le filtre : 4 textes refusés, remplacés par le texte local ou retirés |
| `rapports-coach.json` | les remarques de la coach fictive, pour montrer la relecture : confirmer, nuancer, contredire |
| `captures/` | les écrans du vrai site, à 1280 et 390 px de large |
| `scripts/` | les scripts de l'essai |

## Comment l'essai a été fait

1. **Analyse locale et requête.** `node docs/essai-analyse/scripts/preparer.mjs` lance l'analyse locale du site sur chaque transcription, puis construit la requête avec la fonction du site. `npm run test:analysis` vérifie que les requêtes gardées ici sont toujours celles que le site construit.
2. **Réponse du modèle.** Le Claude de la session a lu chaque requête (prompt système et données) et a écrit sa réponse dans `reponses-modele/`, en suivant les consignes du prompt.
3. **Filtre.** `node docs/essai-analyse/scripts/filtrer.mjs` fait suivre à chaque réponse le chemin du navigateur : lecture du JSON, rapprochement avec l'analyse locale (`reconcile`), filtre strict champ par champ, vérification finale (`isCompliant`).
4. **Affichage dans le vrai site.**
   - `node docs/essai-analyse/scripts/faux-fournisseur.mjs` (port 5514) tient la place du fournisseur : il renvoie les réponses gardées, au format de l'API.
   - Le proxy du dépôt tourne sans modification : `PORT=5513 LLM_API_KEY=essai-sans-cle ALLOWED_ORIGINS=http://localhost:5515 ANTHROPIC_BASE_URL=http://localhost:5514 node serveur/llm-proxy/local.mjs`.
   - Le site est construit avec `VITE_LLM_ENDPOINT=http://localhost:5513/` et servi sur le port 5515.
   - `scripts/captures.mjs` insère chaque entretien dans le stockage du navigateur sous le code `REPETE`, avec l'analyse de `resultat-filtre/`, puis ouvre les écrans. L'injection donne des durées et un regard exacts, ce qu'un enregistrement simulé ne permet pas. La vidéo est une carte « personne fictive » dessinée pour l'essai.
   - `scripts/parcours-reel.mjs` joue en plus le parcours complet pour le cas 2 (code `REPETE`, enregistrement avec le micro simulé de Chromium, mise par écrit simulée) : c'est alors le navigateur lui-même qui appelle le proxy. Résultat constaté : une seule requête `feedback`, rôles `system` puis `user`, aucun modèle imposé par le navigateur, analyse gardée avec `source: "llm"`.

## Résultat du filtre

| Cas | Textes vérifiés | Refusés | Remplacés par le texte local | Hors longueur demandée |
|---|---|---|---|---|
| 1 | 22 | 0 | 0 | 0 |
| 2 | 19 | 0 | 0 | 0 |
| 3 | 19 | 0 | 0 | 0 |
| Essai du filtre (réponse fautive écrite exprès) | 13 | 4 | 4 | 0 |

Dans le cas 2, la personne dit « je suis motivé ». Le prompt interdit ce mot au modèle, même en citation : la réponse ne le reprend pas. Si un modèle le citait, le filtre remplacerait ce seul texte par le repère local (voir `essai-du-filtre/`).

## Les captures

Pour chaque cas, à 1280 et 390 px (`captures/<cas>-<écran>-<largeur>.jpg`) :

1. `1-personne-analyse` : l'analyse lue par la personne (résumé, points d'appui, pistes à explorer) ;
2. `2-personne-relecture` : la relecture avec l'enregistrement et les repères placés dans le temps ;
3. `3-coach-relecture` : l'écran de relecture du coach, avec son brouillon ;
4. `4-personne-rapport-coach` : le rapport reçu par la personne, avec les remarques du coach à côté des repères.

`parcours-reel-cas-2-analyse-1280.jpg` : l'analyse obtenue par le parcours complet joué dans le navigateur.

## Limites de l'essai

- Un Claude qui joue le modèle connaît le dépôt et les règles du site : un modèle appelé par l'API ne lit que le prompt. Le taux de textes refusés sera sans doute plus élevé en conditions réelles.
- Whisper retire souvent les « euh » du texte : sur un vrai enregistrement, le repère « Petits mots répétés » en compte en général moins que dans la transcription du cas 1.
- Le délai de réponse du modèle (30 s au plus avant repli sur l'analyse locale) n'a pas été mesuré.
