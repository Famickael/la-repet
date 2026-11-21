# Reprendre le projet et le mettre en ligne

Guide pour une équipe de développement qui reprend La Répét'. Il complète :

- [`etat-fonctionnel.md`](etat-fonctionnel.md) : ce qui marche vraiment, ce qui est factice, les bugs et les corrections à faire ;
- [`plan-production.md`](plan-production.md) : la cible complète (données, comptes, conformité, lots, coûts) ;
- [`../serveur/llm-proxy/README.md`](../serveur/llm-proxy/README.md) : le proxy IA ;
- [`../README.md`](../README.md) et [`../AGENTS.md`](../AGENTS.md) : règles de conception et de travail, à lire avant toute modification.

---

## 1. Où en est le projet

| | État |
|---|---|
| Site public (accueil, solutions, ressources, pages légales) | En ligne sur GitHub Pages : https://famickael.github.io/la-repet/ |
| Cœur de l'outil (enregistrement, transcription, analyse, retour, assistants, relecture coach, rapport) | Fonctionne dans **un seul navigateur** ; rien ne circule entre appareils |
| Retour et assistants rédigés par un modèle de langage | Prêt (proxy de `serveur/llm-proxy/`), non branché sur le site publié |
| Serveur de données, comptes coach, envoi réel au coach | Absent |
| Formulaire de contact, e-mails, nom de domaine | Factices ou absents |

Le détail, avec les preuves, est dans `etat-fonctionnel.md`.

---

## 2. Prérequis

- Node 22 (version de l'intégration continue ; Node 20 suffit pour le proxy) et npm.
- Git, et un accès au dépôt GitHub.
- Pour les tests de bout en bout : Chromium par Playwright 1.65.1 (`npx playwright install chromium`, ou un Chromium existant via `CHROMIUM_PATH`).
- Pour le proxy IA : un compte Cloudflare (gratuit) et une clé d'API du fournisseur de modèle de langage.
- Pour essayer Whisper et MediaPipe : un accès à `huggingface.co` et `storage.googleapis.com` (premier chargement, environ 130 Mo).

---

## 3. Installation et commandes

```bash
git clone https://github.com/Famickael/coaching-ia-embauche.git && cd coaching-ia-embauche
npm ci            # .npmrc désactive les scripts d'installation (inutiles côté navigateur)
npm run dev       # http://localhost:5173
npm run build     # site statique dans dist/ (chemins relatifs)
npm run preview   # sert dist/ sur http://localhost:4173
```

Vérifications (les mêmes que `.github/workflows/verifier.yml`, sur chaque pull request) :

```bash
npm run build
npm run test:analysis            # analyse et garde-fou de conformité
node tests/assistant.test.mjs    # assistant local
npm run test:store               # données locales (stockage simulé)
npm run test:content             # textes, formats, articles
npm run test:design              # référentiel UI/UX, bloquant
node tests/proxy.test.mjs        # proxy IA, sans réseau ni clé
# avec Chromium :
npm run test:site
npm run test:e2e
E2E_VIEWPORT=390x844 npm run test:e2e
npm run test:cas
# essai réel des modèles (réseau requis), sur un site construit sans VITE_STT_ENDPOINT :
npm run build && npm run preview      # dans un premier terminal
node tests/whisper-real.cjs http://localhost:4173/   # dans un second
```

Script npm proposé pour le proxy (à ajouter dans `package.json`) : `"test:proxy": "node tests/proxy.test.mjs"`, et la même ligne dans `verifier.yml` et `pages.yml`.

---

## 4. Architecture en une page

```
┌──────────────────────────── Navigateur de la personne ou du coach ────────────────────────────┐
│ Site statique React + Vite (GitHub Pages aujourd'hui)                                         │
│                                                                                               │
│  Caméra, micro ──► MediaRecorder ──► vidéo ou voix ──► IndexedDB « larepet »                  │
│                         │                                                                     │
│                         ├─► MediaPipe Face Landmarker (regard, 2 images/s)                    │
│                         └─► Whisper base (Web Worker, ONNX Runtime) ──► texte horodaté        │
│                                                     │                                         │
│                              analyse locale (analysis.js) ──► retour décrit, sans note        │
│                                                     │                                         │
│  Parcours, réponses, retours, rapports ──► localStorage « larepet.v1 »                        │
│  Assistants (assistant.js, coachAssistant.js) : bases locales                                 │
│  Garde-fou de conformité (compliance.js) sur toute sortie                                     │
└─────────────────────────────────────┬─────────────────────────────────────────────────────────┘
                                      │ facultatif : texte seulement (jamais image ni son)
                                      ▼
                     Proxy IA sans état (serveur/llm-proxy, Cloudflare Worker)
                     clé en secret, CORS, plafonds, limitation de débit
                                      │
                                      ▼
                     Fournisseur de modèle de langage (aujourd'hui Anthropic)

Fichiers chargés depuis l'extérieur au premier usage : modèle Whisper (Hugging Face),
modèles MediaPipe (Google). Moteurs ONNX et MediaPipe, polices : servis par le site.
```

- **Sans proxy**, tout fonctionne dans le navigateur, avec les moteurs locaux. C'est le mode du site publié.
- **Avec le proxy**, seul du texte part : question, transcription, mesures, messages tapés dans l'assistant. Le prénom n'est pas envoyé par le retour ; il peut l'être s'il figure dans ce que la personne dit ou tape.
- **Aucun serveur de données** : c'est la limite principale (section 7).

Code : écrans dans `src/beneficiary/` et `src/coach/`, logique dans `src/lib/`, textes juridiques dans `src/content/legal.js` et `src/content/organisme.js`. Détail dans le README, section « Architecture ».

---

## 5. Déploiement actuel : GitHub Pages par Actions

- `.github/workflows/pages.yml` : à chaque envoi sur `main`, tests sans navigateur, référentiel UI/UX, `npm run build`, publication de `dist/`.
- Réglage du dépôt : Settings, Pages, source **GitHub Actions** (avec « Deploy from a branch », la page est blanche).
- Contraintes de GitHub Pages : pas d'en-têtes HTTP personnalisés (la politique de sécurité du contenu est posée par une balise `meta`, voir `vite.config.js`), pas d'isolation inter-origines (Whisper tourne sur un seul cœur ou sur WebGPU), pas de code serveur.

---

## 6. Mise en production pas à pas

Les étapes 1 à 4 donnent un site **utilisable en démonstration ou sur un poste partagé**, avec les textes rédigés par un modèle de langage. L'étape 5 est nécessaire pour un usage réel coach et personne sur deux appareils.

### Étape 1. Corriger les bugs bloquants

Appliquer au moins C1 (reformulation écartée), C2 (délai de garde), C3 (boucles de Whisper) et C4 (texte « tout se passe sur votre appareil ») de `etat-fonctionnel.md`, section 8. Sans C1, le proxy coûte sans servir dans la plupart des retours.

### Étape 2. Décisions préalables

- Le DPO choisit le fournisseur de modèle de langage (transfert hors de l'Union avec Anthropic : `plan-production.md`, 1.6) et la mention dans la notice (`llmProvider` de `src/content/organisme.js`). Le site ne nomme pas le fournisseur dans ses pages ; le dépôt le documente.
- L'organisme remplit `src/content/organisme.js` (responsable, DPO, hébergeur, durées).

### Étape 3. Proxy IA

Suivre `serveur/llm-proxy/README.md` (5 commandes) :

1. renseigner `ALLOWED_ORIGINS` dans `serveur/llm-proxy/wrangler.toml` (origine du site, sans chemin) ;
2. `npx wrangler@4 login`, `npx wrangler@4 deploy`, `npx wrangler@4 secret put LLM_API_KEY` ;
3. régler un plafond de dépense mensuel dans la console du fournisseur ;
4. vérifier avec `curl` (prévol CORS, puis un appel).

### Étape 4. Variables du site et construction

| Variable (lue au build) | Rôle | Valeur |
|---|---|---|
| `VITE_LLM_ENDPOINT` | adresse du proxy IA | `https://la-repet-llm-proxy.<compte>.workers.dev/` |
| `VITE_WHISPER_REVISION` | figer la version du modèle Whisper | identifiant de commit Hugging Face |
| `VITE_MODELS_BASE_URL`, `VITE_MEDIAPIPE_WASM`, `VITE_FACE_MODEL`, `VITE_SEGMENTER_MODEL` | modèles auto-hébergés (recommandé en production) | voir `.env.example` et `plan-production.md`, 1.8 |
| `VITE_STT_ENDPOINT`, `VITE_STT_MODEL` | transcription côté serveur (le son quitte alors l'appareil) | à éviter tant que la mesure sur téléphone est bonne |
| `VITE_BACKEND_URL` | textes d'information en variante « production » | seulement avec un vrai serveur de données (étape 5) |

Sur GitHub Pages : variables de dépôt (Settings, Secrets and variables, Actions, Variables), puis dans `pages.yml` (proposition, non appliquée) :

```yaml
      - run: npm run build
        env:
          VITE_LLM_ENDPOINT: ${{ vars.VITE_LLM_ENDPOINT }}
```

L'origine du proxy est ajoutée automatiquement à la politique de sécurité du contenu par `vite.config.js`.

### Étape 5. Serveur de données (indispensable pour deux appareils)

Voir `etat-fonctionnel.md`, section 9 : base, stockage des vidéos envoyées, authentification des coachs, accès par code, API qui remplace `src/lib/store.js`. Supabase (plan détaillé dans `plan-production.md`) n'est qu'une option : Cloudflare D1 et R2 sur le même compte que le proxy, ou une API Node chez un hébergeur français conviennent aussi. Retirer alors le parcours d'essai `REPETE` et la connexion de démonstration (`TRIAL_CODE`, `TRIAL_LOGIN` dans `src/lib/store.js`).

### Étape 6. Hébergeur et nom de domaine

GitHub Pages suffit pour un site statique. Pour un domaine propre et des en-têtes HTTP (politique de sécurité en en-tête, isolation inter-origines qui accélère Whisper) :

| Hébergeur | Intérêt |
|---|---|
| GitHub Pages + domaine personnalisé | aucun changement ; fichier `CNAME`, enregistrement DNS, HTTPS automatique ; pas d'en-têtes |
| Cloudflare Pages | même compte que le proxy ; fichier `_headers` pour COOP/COEP et la politique de sécurité |
| Hébergeur français (Scaleway, OVHcloud, Clever Cloud) | localisation en France ; à combiner avec le serveur de données |

Avec un nouveau domaine : l'ajouter à `ALLOWED_ORIGINS` du proxy et redéployer le proxy.

### Étape 7. Avant l'ouverture

Mesure de la transcription sur téléphone, audit de biais, audit RGAA, AIPD : `plan-production.md`, lots 10 à 14.

---

## 7. Ce qui reste factice et comment l'activer

| Élément | Aujourd'hui | Pour l'activer |
|---|---|---|
| Formulaire « Nous contacter » (`src/Demo.jsx`) | rien n'est envoyé ; message « Aucune demande envoyée, version de démonstration » | une petite fonction serveur qui reçoit la demande et l'envoie par e-mail via l'API d'un prestataire transactionnel (même modèle que le proxy : Worker, secret, CORS, limitation de débit, aucune donnée gardée), puis brancher l'appel dans `submit` et afficher `PHRASES.contactSent` seulement après un envoi réussi |
| Connexion coach (`src/app/Espace.jsx`) | identifiants de démonstration, aucune vérification | authentification réelle avec le serveur de données |
| Code d'essai `REPETE` | parcours fictif recréé à la demande | à retirer en production |
| Envoi au coach, rapport | drapeau dans le navigateur | serveur de données (étape 5) |
| E-mails | aucun | prestataire transactionnel, SPF, DKIM, DMARC (`plan-production.md`, 1.9) |
| Logo de l'organisme | « Famickael » en pointillés | `ORG_LOGO_URL` dans `src/ui.jsx` |
| Textes juridiques | valeurs d'exemple | `src/content/organisme.js`, validation juridique |

---

## 8. Moteur d'IA : ce qu'il faut savoir

- Fournisseur actuel : **Anthropic**. Modèles par défaut : `claude-haiku-5-5` (assistant de la personne), `claude-sonnet-5-5` (retour après une réponse, aide au coach). Réglables par variables du proxy, sans toucher au site.
- Changement de fournisseur : variable `LLM_PROVIDER` du proxy ; un adaptateur au format compatible OpenAI (Mistral par défaut) est prévu (`serveur/llm-proxy/README.md`, section 4).
- Le site ne mentionne pas le fournisseur. Seule la notice d'information peut avoir à le faire, sur décision du DPO.
- La conformité (aucune note, aucune inférence émotionnelle) est vérifiée dans le navigateur sur toute sortie du modèle ; le proxy ne renvoie que le texte.
