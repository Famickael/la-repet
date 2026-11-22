# Instructions pour les agents IA (Codex, Claude et autres)

Ce dépôt est travaillé par plusieurs assistants IA. Ce fichier est leur point d'entrée commun ; `CLAUDE.md` renvoie ici.

## 1. À lire avant toute modification

1. `README.md` : sections « Règles de conception à respecter », « Passage en production », « Reprise du travail ».
2. `docs/design-system.md` : référentiel UI/UX (couleurs, typographie, espacements, composants). Toute interface s'y conforme ; toute nouvelle règle s'y ajoute.
3. Les briefs de la mission dans `docs/briefs/` quand l'issue y renvoie.

## 2. Règles non négociables

- Aucune note, score, classement, jauge ni courbe de progression ; aucune inférence d'émotion ou de personnalité (AI Act, art. 5(1)(f)). Voir `isCompliant` dans `src/lib/analysis.js`.
- Aucun chiffre, résultat, témoignage, nom de personne ou d'organisme inventé présenté comme réel.
- Textes en français, vouvoiement côté bénéficiaire, ton positif et non évaluatif, **pas de tiret cadratin**.
- La vidéo reste sur l'appareil tant que la personne ne décide pas de l'envoyer.
- Aucun secret (clé d'API, mot de passe) dans le dépôt.
- Décisions de vocabulaire et de présentation du propriétaire (version fonctionnelle sans mention d'essai, « entretien », « analyse ») : voir `CLAUDE.md`, elles s'appliquent à tous les agents.

## 3. Répartition des rôles

| Agent | Rôle |
|---|---|
| Claude (Claude Code) | Développement de l'application, relecture, rédaction des missions, fusion après accord du propriétaire |
| Codex | Exécution des missions confiées par issue : images, recherche d'information, rédaction de contenus (articles de `src/content/resources/`), petites corrections ciblées |
| Le propriétaire | Décide, valide, fusionne ou demande la fusion |

## 4. File de missions (issues GitHub)

- Une mission = une issue ouverte par Claude, dont le titre commence par `[Codex]`.
- Le corps de l'issue contient : contexte, résultat attendu, fichiers concernés, critères de validation, hors périmètre.
- L'agent exécutant lit le corps **et** les commentaires avant d'agir. Si la provenance, le résultat ou la validation restent ambigus, il pose la question **une seule fois** en commentaire de l'issue et s'arrête.
- Une piste dans le README, un brief ou une pull request ne suffit pas à lancer une mission : seule une issue `[Codex]` ouverte le fait.

## 5. Branches et pull requests

- Ne jamais pousser sur `main`. Une branche par mission : `codex/<numéro-issue>-<sujet-court>` (Codex) ou `claude/<sujet>` (Claude).
- Une pull request par mission, qui référence l'issue (`Closes #<numéro>`), décrit ce qui a été fait et coche chaque critère de validation.
- Ne modifier que les fichiers du périmètre de la mission. Ne pas reformater ni « améliorer » le reste.
- Ne jamais fusionner sa propre pull request : la fusion revient au propriétaire (ou à Claude sur sa demande).

## 6. Vérifications avant pull request

```bash
npm ci
npm run build
npm run test:analysis
node tests/assistant.test.mjs
npm run test:store    # données locales (stockage simulé)
npm run test:voice    # choix de la voix qui lit les questions (voix locales seulement)
npm run test:content  # élision, formats, articles, textes de la démo
npm run test:design   # référentiel UI/UX (docs/design-system.md, section 11), bloquant
npm run test:site     # pages publiques et passe axe-core, si Chromium est disponible
# si Chromium est disponible :
npm run test:e2e
E2E_VIEWPORT=390x844 npm run test:e2e
npm run test:cas      # cas limites (deux onglets, retrait de l'accord, voix seule, navigation par l'adresse…)
```

Hors suite, moteur de Safari : `PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-webkit node tests/webkit-check.cjs [adresse]` mesure sous WebKit la continuité de l'écran de chargement et la fluidité du fond de l'accueil, puis donne un verdict (installation de WebKit en tête du fichier).

Chromium : `playwright` est figé en 1.65.1 (Chromium 1255). Dans les sessions distantes où le Chromium fourni est
plus ancien, ne pas lancer `playwright install` : passer son chemin, `CHROMIUM_PATH=/opt/pw-browsers/chromium`.
Les pull requests sont vérifiées par `.github/workflows/verifier.yml` (mêmes commandes).

## 7. Où se trouvent les contenus

| Contenu | Emplacement | Format |
|---|---|---|
| Articles et scénarios d'usage (Ressources) | `src/content/resources/` | voir `docs/briefs/chatgpt-ressources.md` |
| Images du site | `public/img/` | voir `docs/briefs/chatgpt-images.md` (noms de fichiers imposés) |
| Questions d'entraînement | `src/lib/questions.js` | |
| Base de connaissances de l'assistant | `src/lib/assistant.js` | |
| Métiers proposés | `src/lib/jobs.js` | |

Les images : formats web (webp ou jpg), largeur 1200 px maximum, 150 Ko maximum chacune, sans texte ni logo incrusté, licences permettant l'usage libre (indiquer la provenance dans la pull request et dans le README, section crédits).

## 8. Fournisseur d'IA et clé d'API

Le cœur du site fonctionne **sans serveur** : transcription (Whisper dans le navigateur), analyse descriptive, retours et assistants (moteurs locaux) tournent sur l'appareil. Un modèle de langage est une option qui reformule ou enrichit ces textes ; sans lui, rien ne casse.

- **Un point d'accès unique, sans fournisseur.** Le code client (`src/lib/llm.js`, utilisé par `analysis.js`, `assistant.js` et `coachAssistant.js`) envoie une requête au format « chat completions » à `VITE_LLM_ENDPOINT`. Il ne contient aucun nom de fournisseur ni de modèle : le champ `model` n'est envoyé que si `VITE_LLM_MODEL` est défini, ce qui reste facultatif.
- **Le fournisseur se choisit derrière ce point d'accès**, dans un petit proxy sans état qui garde la clé : Cloudflare Worker, Netlify Function ou fonction Supabase, au choix (aucune n'est imposée). Le proxy lit ses réglages dans ses propres secrets : `LLM_PROVIDER` (par exemple `anthropic`, `mistral`), `LLM_MODEL_CHAT`, `LLM_MODEL_FEEDBACK`, `LLM_MODEL_COACH`, et la clé du fournisseur dans le secret générique `LLM_API_KEY` (aujourd'hui une clé Anthropic, l'équivalent de `ANTHROPIC_API_KEY` ; demain la clé d'un autre fournisseur, sans renommer quoi que ce soit). Modèle de proxy : `serveur/`. État des lieux de ce qui marche avec ou sans serveur : `docs/etat-fonctionnel.md`.
- **Le site public ne nomme jamais le moteur** : on écrit « assistant IA » (`docs/redaction.md`, 1.2 bis).

### Changer la clé (développement et production)

- **Jamais dans le dépôt**, jamais dans un fichier `.env` dont les variables commencent par `VITE_` : tout ce qui est `VITE_*` est copié dans le JavaScript envoyé au navigateur, donc public.
- **En local** : la clé va dans l'environnement du proxy lancé sur votre poste : `LLM_API_KEY=... node serveur/llm-proxy/local.mjs`, ou un fichier de secrets local ignoré par git (`.dev.vars` pour `wrangler dev`, `.env` du proxy pour `netlify dev`, `supabase/functions/.env` pour `supabase functions serve`). Ces fichiers sont ignorés par git ; vérifier avec `git check-ignore <fichier>` avant le premier lancement.
- **En production** : dans le gestionnaire de secrets de l'hébergeur du proxy (`npx wrangler secret put LLM_API_KEY`, variables d'environnement du site Netlify, ou tableau de bord Supabase, Edge Functions, Secrets / `supabase secrets set LLM_API_KEY=...`).
- **Rotation** : créer une nouvelle clé dans la console du fournisseur, la remplacer dans les secrets du proxy, vérifier qu'une requête passe, puis révoquer l'ancienne clé. En cas de fuite, révoquer d'abord.

### Changer de fournisseur

Seul le proxy change : il traduit la requête « chat completions » reçue vers l'API du nouveau fournisseur et renvoie la même réponse (`choices[0].message.content`, texte ou JSON selon la tâche). Le contrat de réponse reste identique, donc aucun fichier de `src/` ne bouge : on modifie `LLM_PROVIDER`, les `LLM_MODEL_*` et la valeur de `LLM_API_KEY` dans la configuration et les secrets du proxy. Les garde-fous du navigateur (`isCompliant`, `assistantCompliant`, `coachCompliant`, rapprochement avec l'analyse locale) s'appliquent quel que soit le fournisseur.
