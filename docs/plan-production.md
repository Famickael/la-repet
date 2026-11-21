# Plan de passage en production de La Répét'

Document de travail du 21 novembre 2026, rédigé à partir de l'état du dépôt à cette date (branche `claude/hopeful-heisenberg-oil2aj`). Il ne modifie aucun fichier de `src/`. Il complète `README.md` (section « Passage en production »), `docs/conformite.md` (exigences RGPD et AI Act) et `docs/audit-complet.md` (constats techniques).

**Ce que ce document est.** Un plan d'architecture et de travail, avec des briques nommées, des lots ordonnés et des ordres de grandeur de coût.

**Ce qu'il n'est pas.** Un avis juridique. Chaque point marqué « décision DPO » ou « décision propriétaire » reste à trancher par la personne compétente. Les prix et les caractéristiques des prestataires changent : la section 8 liste ce qui a été vérifié sur la documentation officielle le 21 novembre 2026 et ce qui ne l'a pas été.

## Sommaire

0. Fournisseur d'IA et clé d'API (décision du propriétaire)
1. Architecture cible (option avec Supabase)
2. Schéma de données
3. De `store.js` à Supabase : correspondance et migration
4. Comptes et clés à créer
5. Plan de travail par lots
6. Coûts mensuels
7. Risques et décisions à prendre
8. Vérifications faites et non faites

---

## 0. Fournisseur d'IA et clé d'API (décision du propriétaire, 21 novembre 2026)

**Pas de Supabase imposé.** Le cœur du site fonctionne sans serveur : transcription, analyse, retours et assistants tournent dans le navigateur. Le formulaire de contact et le nom de domaine sont annexes et peuvent rester factices. Les sections 1 à 8 ci-dessous décrivent une option complète avec Supabase (stockage partagé entre coach et personne, comptes) : elles restent une piste, pas l'architecture cible.

- **Point d'accès générique.** Le navigateur ne parle qu'à `VITE_LLM_ENDPOINT` (format « chat completions », avec un champ `task` : `chat`, `feedback` ou `coach`, `src/lib/llm.js`), sans nom de fournisseur ni de modèle. Derrière, un petit proxy sans état garde la clé et choisit le fournisseur : Cloudflare Worker, Netlify Function ou fonction Supabase, au choix. Réglages du proxy : `LLM_PROVIDER`, `LLM_MODEL_CHAT`, `LLM_MODEL_FEEDBACK`, `LLM_MODEL_COACH`, et la clé du fournisseur dans le secret générique `LLM_API_KEY` (aujourd'hui une clé Anthropic, l'équivalent de `ANTHROPIC_API_KEY`). Modèle de proxy : `serveur/` ; état des lieux : `docs/etat-fonctionnel.md`.
- **Changer la clé** : jamais dans le dépôt ni dans une variable `VITE_*` (copiée dans le JavaScript public). En local, dans le fichier de secrets du proxy ignoré par git (`.dev.vars`, `.env` du proxy, `supabase/functions/.env`) ; en production, dans les secrets de l'hébergeur du proxy (`npx wrangler secret put LLM_API_KEY`, variables Netlify, tableau de bord Supabase > Edge Functions > Secrets ou `supabase secrets set LLM_API_KEY=...`). Rotation : nouvelle clé dans la console du fournisseur, remplacement dans les secrets, vérification, révocation de l'ancienne.
- **Changer de fournisseur** : seul le proxy change ; il renvoie toujours la même réponse (`choices[0].message.content`). Aucun fichier de `src/` ne bouge. La section 1.6 détaille le cas du moteur actuel ; ses noms de modèles sont des réglages du proxy, jamais du navigateur.
- **Le site ne nomme pas le moteur** : « assistant IA » (`docs/redaction.md`, 1.2 bis).

Détail complet : `AGENTS.md`, section 8.

---

## 1. Architecture cible

### 1.1 Principes qui ne bougent pas

| Principe | Traduction technique |
|---|---|
| La vidéo ne quitte l'appareil qu'au moment où la personne choisit de l'envoyer | Tant qu'une réponse n'est pas envoyée, **rien** n'existe côté serveur pour elle : ni vidéo, ni transcription, ni retour. La ligne en base et le fichier sont créés au moment de l'envoi, pas avant. |
| Aucune clé secrète dans le navigateur | Le navigateur ne connaît que l'adresse du projet Supabase et sa clé publique. La clé Anthropic, la clé secrète Supabase et la clé du service d'e-mails vivent dans les secrets des fonctions serveur. |
| Aucune note, aucune inférence émotionnelle | Le garde-fou `isCompliant` s'applique deux fois : dans la fonction serveur avant de répondre, puis dans le navigateur avant d'afficher. En cas d'écart, repli sur le moteur local. |
| Supervision humaine | Un brouillon de coach n'est jamais lisible par la personne. Seul un rapport envoyé l'est. Cela se garantit en base (tables séparées), pas seulement à l'écran. |
| Minimisation | Pas d'adresse électronique ni d'identifiant administratif pour la personne accompagnée : accès par code, session anonyme. |
| Hébergement dans l'Union européenne | Projet Supabase en région `eu-west-3` (Paris), fonctions forcées dans cette région, e-mails par un prestataire français, modèles d'analyse servis par le site lui-même. |

### 1.2 Schéma

```
                        APPAREIL DE LA PERSONNE OU DU COACH
 ┌──────────────────────────────────────────────────────────────────────────┐
 │  Front statique (React, Vite)            https://<domaine>               │
 │  ├─ Whisper (transformers.js, worker)    modèles servis par /models/     │
 │  ├─ MediaPipe (regard, fond)             fichiers servis par /mediapipe/ │
 │  ├─ Analyse locale + garde-fou isCompliant                               │
 │  ├─ IndexedDB : vidéos et réponses NON envoyées (restent ici)            │
 │  └─ Client supabase-js (clé publique uniquement)                         │
 └───────┬──────────────────┬───────────────────┬───────────────────┬───────┘
         │ HTTPS            │ HTTPS             │ HTTPS (TUS)       │ HTTPS
         ▼                  ▼                   ▼                   ▼
 ┌───────────────┐  ┌───────────────┐  ┌────────────────┐  ┌────────────────────┐
 │ Hébergeur du  │  │ Supabase Auth │  │ Supabase       │  │ Supabase Edge      │
 │ site statique │  │ coachs :      │  │ Storage        │  │ Functions (Deno)   │
 │ (UE, en-têtes │  │ mot de passe  │  │ seau privé     │  │ région eu-west-3   │
 │ de sécurité)  │  │ + TOTP (aal2) │  │ « videos »     │  │                    │
 └───────────────┘  │ personnes :   │  │ envoi repris   │  │ llm                │
                    │ session       │  │ sur coupure    │  │ video-url          │
                    │ anonyme +     │  │ lecture par    │  │ demande            │
                    │ code d'accès  │  │ URL signée     │  │ inviter-coach      │
                    └───────┬───────┘  │ (5 minutes)    │  │ purge              │
                            │          └───────┬────────┘  └───┬────────┬───────┘
                            ▼                  ▼               │        │
                    ┌──────────────────────────────────────┐   │        │
                    │ Supabase Postgres (eu-west-3, Paris) │◄──┘        │
                    │ RLS par organisme, par coach et par  │            │
                    │ parcours ; journal des accès ;       │            │
                    │ pg_cron : purge quotidienne          │            │
                    └──────────────────────────────────────┘            │
                                                                        │
                        ┌───────────────────────────────────────────────┤
                        │ fonction « llm »                              │ fonction « demande »
                        ▼                                               ▼
              ┌────────────────────────────┐      ┌────────────────────────┐
              │ API Anthropic (Claude)     │      │ service d'e-mails      │
              │ texte uniquement, jamais   │      │ transactionnels (FR) : │
              │ l'image ni le son          │      │ invitations, demandes  │
              │ HORS Union (voir 1.6)      │      │ Union européenne       │
              └────────────────────────────┘      └────────────────────────┘
```

### 1.3 Front statique

Le front reste un site statique produit par `npm run build`. Deux points changent.

**Hébergement.** GitHub Pages convient pour la démonstration, pas pour la production :

- GitHub (groupe Microsoft, États-Unis) reçoit les adresses IP des visiteurs (écart T4 de `docs/conformite.md`) ;
- GitHub Pages ne permet pas de définir d'en-têtes HTTP. Une politique de sécurité du contenu ne peut y être posée que par une balise `<meta>`, ce qui exclut `frame-ancestors`, `Permissions-Policy`, le réglage de HSTS et l'isolation d'origine (`COOP`, `COEP`) dont Whisper a besoin pour utiliser plusieurs fils d'exécution en WebAssembly.

Recommandation : un hébergeur de fichiers statiques dans l'Union, qui permet de régler les en-têtes. Options à comparer par le propriétaire (non vérifiées en détail, voir section 8) :

| Option | Intérêt | Limite |
|---|---|---|
| OVHcloud, hébergement web mutualisé (France) | Simple, peu cher, en-têtes par fichier `.htaccess`, certificat inclus, déploiement par SFTP depuis GitHub Actions | Offre « à l'ancienne », pas de prévisualisation par branche |
| Scaleway, conteneur sans serveur avec un serveur Caddy ou nginx (France) | Maîtrise complète des en-têtes, même fournisseur que d'autres briques possibles | Un peu plus de configuration |
| Clever Cloud, application statique (France) | Déploiement par `git push`, en-têtes configurables | Coût mensuel un peu plus élevé |
| GitHub Pages conservé pour le site vitrine seulement | Gratuit, déjà en place | À réserver aux pages sans donnée personnelle, et à déclarer dans les mentions légales |

Le dépôt de code peut rester sur GitHub : il ne contient aucune donnée personnelle.

**Nom de domaine.** Un domaine en `.fr` acheté par l'organisme responsable (ou par l'éditeur), chez un bureau d'enregistrement français (OVHcloud, Gandi, Scaleway). Trois noms suffisent :

| Nom | Usage |
|---|---|
| `www.<domaine>` (ou `app.<domaine>`) | le site |
| `api.<domaine>` (facultatif) | domaine personnalisé Supabase, pour que le navigateur ne parle qu'au domaine de l'organisme (option payante, voir section 6) |
| `mail.<domaine>` | sous-domaine d'envoi des e-mails, avec SPF, DKIM et DMARC |

Le routage par ancre (`#/coach`, `#/s/CODE`) et `base: "./"` dans `vite.config.js` fonctionnent sur n'importe quel hébergeur statique : aucune règle de réécriture n'est nécessaire.

### 1.4 Supabase (région `eu-west-3`, Paris)

Un seul projet de production, plus un projet de recette. À la création, choisir une **région précise** (`eu-west-3`) et non le groupe général « Europe », qui peut placer le projet à Londres ou à Zurich, hors Union.

| Service | Rôle dans La Répét' |
|---|---|
| **Auth** | Coachs : adresse professionnelle, mot de passe et second facteur TOTP obligatoire (niveau `aal2`). Inscription libre désactivée : on entre sur invitation d'un administrateur. Personnes accompagnées : session anonyme (`signInAnonymously`), rattachée à un parcours par la saisie du code. |
| **Postgres** | Toutes les métadonnées. Cloisonnement par organisme, par site, par coach et par parcours avec des politiques RLS. Journal des accès. Tâches planifiées (`pg_cron`). |
| **Storage** | Un seau privé `videos`. Envoi par protocole TUS (reprise après coupure, utile sur réseau mobile). Lecture uniquement par URL signée de courte durée, délivrée par une fonction qui journalise l'accès. |
| **Edge Functions** | Tout ce qui demande un secret ou un contrôle que le navigateur ne peut pas faire : appel au modèle de langage, URL signées, demandes de prise en main, invitations, purge des fichiers. |

Points d'attention propres à Supabase :

- **Région des fonctions.** Par défaut, une fonction s'exécute dans la région la plus proche de l'appelant. Pour garantir l'exécution à Paris, forcer la région à chaque appel (option `region` du client, ou en-tête `x-region: eu-west-3`, ou paramètre `forceFunctionRegion`).
- **Offre gratuite inadaptée à la production.** Un projet gratuit est mis en pause après une semaine sans activité, n'a pas de sauvegarde et limite les fichiers à 50 Mo. L'offre Pro est le minimum.
- **Sauvegardes.** Sauvegarde quotidienne conservée 7 jours en offre Pro. Une donnée supprimée subsiste donc jusqu'à 7 jours dans les sauvegardes : à écrire dans la notice et dans l'AIPD.
- **Clés.** Utiliser les nouvelles clés `sb_publishable_...` (navigateur) et `sb_secret_...` (fonctions), qui se révoquent une par une, plutôt que les anciennes clés `anon` et `service_role`.
- **Question RGPD.** Supabase est une société américaine et s'appuie sur AWS. Les données sont localisées à Paris, mais le prestataire et son sous-traitant relèvent du droit américain. Voir 1.6.

### 1.5 Les fonctions serveur

| Fonction | Appelée par | Ce qu'elle fait | Secrets utilisés |
|---|---|---|---|
| `llm` | personne (accord « retour de l'assistant » donné) ou coach (`aal2`) | Reçoit une **tâche** (`chat`, `feedback`, `coach`) et des données bornées. Construit elle-même le prompt système, choisit le modèle, appelle Claude, filtre la sortie, compte l'usage. Ne conserve aucun contenu. | `ANTHROPIC_API_KEY` |
| `video-url` | personne ou coach | Vérifie le droit d'accès à la réponse, écrit une ligne dans le journal, renvoie une URL signée valable 5 minutes. | clé secrète Supabase |
| `demande` | visiteur du site (sans session) | Enregistre une demande de prise en main, limite le débit, prévient l'équipe par e-mail. | clé du service d'e-mails |
| `inviter-coach` | administrateur d'un organisme (`aal2`) | Crée le compte, l'inscrit dans `membres`, envoie l'invitation. | clé secrète Supabase |
| `purge` | tâche planifiée uniquement | Supprime les fichiers dont la durée est échue, puis les lignes ; écrit le compte rendu de purge. | clé secrète Supabase, secret de tâche |

Règles communes : vérification du jeton à l'entrée, `Access-Control-Allow-Origin` limité au domaine de production, aucune journalisation du contenu des requêtes, erreurs renvoyées avec un code stable (`quota`, `non_autorise`, `indisponible`) que le front traduit en français.

L'ouverture d'un parcours par code, l'envoi d'une réponse, la reprise d'un envoi et le retrait de l'accord sont des **fonctions SQL** (`security definer`) appelées par `supabase.rpc(...)` : elles n'ont besoin d'aucun secret et s'exécutent dans la base.

### 1.6 Assistants : proxy vers l'API Anthropic

> Cas du moteur actuel. Le proxy peut être une fonction Supabase comme ci-dessous, ou un Cloudflare Worker ou une Netlify Function (section 0). Le contrat côté navigateur ne change pas.

**Pourquoi une fonction dédiée et non un simple relais.** Aujourd'hui, `analysis.js`, `assistant.js` et `coachAssistant.js` envoient à `VITE_LLM_ENDPOINT` une requête au format « chat completions », avec le prompt système et le nom du modèle choisis par le navigateur. Derrière un relais transparent, n'importe qui pourrait utiliser la clé de l'organisme pour autre chose. La fonction `llm` reçoit donc une tâche, pas un prompt :

```
POST /functions/v1/llm
{ "task": "chat",     "context": "warmup", "poste": "...", "history": [ ...16 messages au plus ] }
{ "task": "feedback", "poste": "...", "question": "...", "transcript": "...", "local": { metrics, dimensions } }
{ "task": "coach",    "mode": "intro|comment|rephrase|debrief", "question": "...", "poste": "...", "dims": [...], "text": "..." }
```

Les prompts système (`SYSTEM_PROMPT`, `COACH_SYSTEM_PROMPT`, consigne de reformulation) quittent le navigateur pour `supabase/functions/_shared/prompts.ts`. Le prénom n'est jamais transmis.

**Choix du modèle par usage.**

| Usage | Volume et attente | Modèle recommandé | Réglages | Coût indicatif par appel |
|---|---|---|---|---|
| Assistant de la personne (questions pendant l'échauffement et après le retour) | Le plus fréquent ; réponse de 2 à 5 phrases ; la personne attend devant l'écran | `claude-haiku-5-5` | effort `low`, `max_tokens` 1024, réponse diffusée au fil de l'eau | moins de 0,001 $ |
| Reformulation du retour après une réponse | Un appel par réponse ; sortie JSON stricte ; texte lu par une personne vulnérable ; la personne attend déjà la transcription | `claude-sonnet-5-5` | effort `low`, sortie structurée (`output_config.format` avec le schéma `synthese` + `dimensions`), `max_tokens` 4096 | environ 0,01 à 0,02 $ |
| Aide à la rédaction du coach (introduction, commentaire, reformulation, pistes de débriefing) | Faible volume ; qualité rédactionnelle et respect des règles prioritaires | `claude-sonnet-5-5` | effort `low` ou `medium`, `max_tokens` 2048 | environ 0,01 $ |
| Hors production : audit de biais, jeux d'essai de conformité, relecture de la base de connaissances | Ponctuel, hors ligne | `claude-opus-5-5` | effort `high` ; uniquement sur des textes fictifs ou anonymisés | quelques dollars par campagne |

Raisonnement : `claude-haiku-5-5` (0,10 $ et 0,50 $ par million de jetons en entrée et en sortie) est de loin le plus rapide et le moins cher, et suffit pour une conversation courte et cadrée. La reformulation du retour est le texte le plus sensible du produit : son volume est faible, donc le surcoût de `claude-sonnet-5-5` (2 $ et 10 $) reste de l'ordre du centime par réponse, pour une meilleure tenue des consignes en français. `claude-opus-5-5` (4 $ et 20 $) n'apporte rien de visible sur ces tâches courtes et allonge l'attente : il n'a pas sa place dans le parcours en ligne. Si une mesure sur des réponses réelles montre que `claude-haiku-5-5` tient aussi bien la reformulation, basculer est un changement d'une ligne côté serveur.

**Particularités de l'API à respecter dans la fonction** (vérifiées, voir section 8) :

- ne pas transmettre `temperature` : sur ces modèles, une valeur autre que celle par défaut est refusée (erreur 400). Le code actuel envoie `0.2`, `0.3` et `0.4` ;
- la réflexion du modèle est activée par défaut et compte dans `max_tokens` : garder de la marge et régler la profondeur avec `output_config.effort` ;
- lire les blocs de la réponse par leur type (`text`), pas par leur position : un bloc de réflexion peut précéder le texte ;
- tester `stop_reason` : `refusal` ou `max_tokens` déclenchent le repli sur le moteur local, comme une erreur réseau ;
- pour le JSON du retour, utiliser la sortie structurée plutôt qu'un appel d'outil forcé (refusé sur `claude-sonnet-5-5`). Ne mettre aucune donnée personnelle dans le schéma ;
- utiliser le SDK officiel `@anthropic-ai/sdk` ;
- ne pas compter sur le cache de prompt : les prompts système sont plus courts que le seuil minimal de mise en cache ;
- ne pas utiliser le traitement par lots (Batch) pour des données de personnes : il conserve les requêtes 29 jours.

**Garde-fous côté serveur.**

1. Session exigée ; pour une personne, accord « retour de l'assistant » actif sur son parcours.
2. Tailles bornées (transcription, historique, remarque du coach), comme dans le code actuel.
3. Quotas par session et par organisme (table `llm_usage`), et plafond de dépense mensuel réglé dans la console Anthropic.
4. Filtre de conformité sur la sortie avant de répondre. Le filtre est aujourd'hui dans `src/lib/analysis.js` (`FORBIDDEN`, `isCompliant`) et `src/lib/coachAssistant.js` (`coachCompliant`) : l'extraire dans un module sans dépendance, partagé entre le front et les fonctions, avec un test qui échoue si les deux copies divergent.
5. Journal d'usage sans contenu : date, tâche, modèle, jetons, issue (`llm`, `repli`, `refus`).

**Question RGPD : Anthropic (décision DPO).** Faits vérifiés dans la documentation d'Anthropic le 21 novembre 2026 :

- l'API directe ne propose **aucune région d'inférence européenne**. Le paramètre `inference_geo` n'accepte que `global` (par défaut) ou `us`, et les espaces de travail ne peuvent être créés qu'en zone `us`. Le texte envoyé est donc traité hors de l'Union ;
- le contenu des échanges n'est pas conservé par défaut après la réponse pour ces trois modèles, et n'est pas utilisé pour l'entraînement sans permission expresse. Exception : un contenu signalé par les systèmes de sécurité d'Anthropic peut être conservé jusqu'à deux ans. Un engagement contractuel « zéro conservation » se demande au service commercial ;
- ce qui part : la transcription de la réponse, la question, le métier visé, les mesures (débit, pauses), les messages tapés dans l'assistant. Jamais l'image ni le son. Une transcription peut contenir des informations sensibles dites spontanément (santé, situation familiale, origine).

Ce que le DPO doit donc examiner : l'existence d'un transfert hors Union (chapitre V du RGPD), son fondement (décision d'adéquation pour les États-Unis et certification du prestataire, ou clauses contractuelles types), l'accord de sous-traitance (article 28), la mention du prestataire et du pays dans la notice (champ `llmProvider` de `src/content/organisme.js`), et le traitement de ce point dans l'AIPD. L'accord « Recevoir un retour de l'assistant », déjà distinct et décoché par défaut, doit dire clairement que le texte est envoyé à un prestataire situé hors de l'Union si c'est le choix retenu.

**Alternatives à présenter au DPO**, sans trancher ici :

| Option | Lieu de traitement | Ce que cela change |
|---|---|---|
| A. API Anthropic directe | hors Union (monde ou États-Unis) | Le plus simple ; modèles demandés par le propriétaire ; transfert à encadrer |
| B. Claude par Amazon Bedrock, point d'accès régional européen | Union européenne (région AWS) | Mêmes modèles ; le sous-traitant devient AWS (groupe américain, données localisées dans l'Union) ; majoration de 10 % sur les points d'accès régionaux ; disponibilité des modèles 5.5 dans les régions européennes à vérifier |
| C. Mistral (France) | Union européenne | Prestataire européen ; le code actuel est déjà au format attendu (`mistral-small-latest` est la valeur par défaut) ; qualité à mesurer sur la reformulation |
| D. Modèles ouverts hébergés par Scaleway ou OVHcloud (France) | France | Prestataires français ; modèles moins capables ; qualité à mesurer |
| E. Pas de modèle de langage | sur l'appareil | Le moteur local actuel suffit à faire fonctionner tout le produit ; aucun transfert |

La fonction `llm` doit isoler le fournisseur derrière une interface (`provider.complete(task, input)`), pour que passer de A à B, C ou D soit un changement de configuration (`LLM_PROVIDER`) et non une réécriture. L'option E doit rester un mode de fonctionnement complet : c'est déjà le cas, et c'est le repli en cas de panne.

### 1.7 Transcription : dans le navigateur ou côté serveur

| | Dans le navigateur (actuel) | Côté serveur |
|---|---|---|
| Promesse « le son ne quitte pas l'appareil » | Tenue | Rompue : texte de l'accord et du « cycle de vie » à modifier (écart T5) |
| Sous-traitant supplémentaire | Aucun | Oui (Mistral Voxtral, ou Whisper hébergé chez Scaleway ou OVHcloud). Anthropic ne propose pas de transcription |
| Coût | Nul | À l'usage |
| Qualité | Whisper base : correcte, imparfaite sur prises courtes ou bruitées | Meilleure avec un grand modèle |
| Appareils modestes | Premier téléchargement d'environ 80 Mo ; calcul lent sans WebGPU | Rapide partout |

**Recommandation : rester dans le navigateur pour la mise en production**, parce que c'est l'argument de confiance le plus fort du produit et qu'il ne coûte rien. Deux conditions :

1. mesurer dès le lot 10 le temps de transcription d'une réponse de 3 minutes sur un téléphone Android d'entrée de gamme et sur un iPhone ; au-delà d'un seuil à fixer (par exemple une minute et demie), le parcours n'est pas tenable pour une partie du public ;
2. si la mesure est mauvaise, proposer la transcription serveur comme **option explicite par organisme**, avec un prestataire français, un accord distinct et les textes « production » correspondants. Le code est déjà prêt (`VITE_STT_ENDPOINT` dans `src/lib/transcribe.js`) ; il faudrait alors passer par une fonction `stt` qui garde la clé et ne conserve pas le son.

### 1.8 Auto-hébergement de Whisper et de MediaPipe

Aujourd'hui le navigateur va chercher Whisper sur `huggingface.co`, les moteurs sur `cdn.jsdelivr.net` et les modèles MediaPipe sur `storage.googleapis.com` (écart T2). Cible : tout est servi par le site lui-même, sous `/models/` et `/mediapipe/`.

| Fichiers | Taille | Variable déjà prévue |
|---|---|---|
| Whisper base (ONNX, encodeur fp32 et décodeur q8, fichiers de configuration) | environ 80 Mo | `VITE_MODELS_BASE_URL`, `VITE_WHISPER_MODEL`, `VITE_WHISPER_REVISION` |
| Moteur ONNX Runtime Web (fichiers `.wasm` et `.mjs` de la version fixée par transformers.js 3.8.1) | environ 20 Mo | **aucune** : à ajouter (`env.backends.onnx.wasm.wasmPaths` dans `whisper.worker.js`) |
| Moteur MediaPipe `tasks-vision` 1.2.3 (dossier `wasm`) | environ 20 Mo | `VITE_MEDIAPIPE_WASM` |
| Modèles `face_landmarker.task` et `selfie_segmenter.tflite` | environ 4 Mo | `VITE_FACE_MODEL`, `VITE_SEGMENTER_MODEL` |

Mise en œuvre : un script `scripts/fetch-models.mjs` exécuté par l'intégration continue télécharge chaque fichier à une **révision figée**, vérifie son empreinte SHA-256 contre une liste versionnée dans le dépôt, et le place dans `dist/`. Les fichiers ne sont pas ajoutés à Git. Le script copie aussi les licences des modèles. Un test échoue si le site construit contient encore une adresse `huggingface.co`, `jsdelivr.net` ou `googleapis.com`.

Les polices sont déjà servies par le site (`public/fonts/`).

### 1.9 E-mails

Deux flux, tous deux vers des professionnels (jamais vers les personnes accompagnées, qui n'ont pas d'adresse dans le système) :

1. **E-mails d'authentification des coachs** (invitation, réinitialisation, changement d'adresse), envoyés par Supabase Auth. Le serveur d'envoi intégré de Supabase est limité à 2 messages par heure et aux adresses de l'équipe du projet : un **serveur SMTP personnalisé est obligatoire** en production.
2. **Notification d'une demande de prise en main**, envoyée par la fonction `demande` par l'API HTTP du prestataire (les fonctions Supabase ne peuvent pas ouvrir de connexion sortante sur les ports 25 et 587).

Prestataire : un service transactionnel français, par exemple Scaleway Transactional Email ou Brevo, avec SMTP et API HTTP, et un accord de sous-traitance. Configurer SPF, DKIM et DMARC sur `mail.<domaine>`.

Recommandation de conception : **aucune notification par e-mail ne contient de donnée d'une personne accompagnée**. Un éventuel message « une réponse vous attend » adressé au coach ne cite ni prénom ni contenu.

Piège technique : les liens envoyés par Supabase Auth placent par défaut les jetons dans l'ancre de l'adresse (`#access_token=...`), ce qui entre en conflit avec le routage par ancre de l'application. Utiliser le flux PKCE (code dans la chaîne de requête) ou des codes à saisir (`verifyOtp`), et le tester dès le lot 4.

---

## 2. Schéma de données

### 2.1 Vue d'ensemble

```
organismes ─┬─ sites
            ├─ membres (coach, référent, administrateur)  ── auth.users
            └─ parcours ─┬─ parcours_acces (session anonyme ↔ parcours) ── auth.users
                         ├─ consentements (historique, jamais modifié)
                         └─ takes (réponses ENVOYÉES uniquement) ─┬─ brouillons (coach seul)
                                                                  ├─ rapports (visibles une fois envoyés)
                                                                  └─ fichier dans le seau « videos »
demandes_prise_en_main      journal_acces      purges      llm_usage      tentatives_code
```

Les noms reprennent le vocabulaire du code (`parcours`, `takes`) pour faciliter la correspondance de la section 3.

### 2.2 Tables

Toutes les tables ont RLS activé. Le rôle `anon` (requête sans session) n'a aucun droit sur aucune table. Types : `uuid` pour les identifiants, `timestamptz` pour les dates.

**`organismes`**

| Colonne | Type | Remarque |
|---|---|---|
| `id` | uuid, clé primaire | |
| `nom` | text | |
| `durees` | jsonb | durées de conservation validées par le DPO (voir 2.5) ; valeurs par défaut prudentes |
| `llm_actif`, `llm_fournisseur` | boolean, text | permet à un organisme de fonctionner sans modèle de langage |
| `created_at` | timestamptz | |

**`sites`** : `id`, `org_id`, `nom`. Sert au cloisonnement par site demandé dans le README.

**`membres`** (les coachs)

| Colonne | Type | Remarque |
|---|---|---|
| `user_id` | uuid, clé primaire, référence `auth.users` | |
| `org_id`, `site_id` | uuid | |
| `role` | `coach`, `referent` ou `admin` | |
| `nom_affiche` | text | par exemple « Sophie M. », montré à la personne |
| `actif` | boolean | désactivation au départ du coach, sans perte de l'historique |
| `created_at`, `desactive_at` | timestamptz | |

**`parcours`**

| Colonne | Type | Remarque |
|---|---|---|
| `id` | uuid, clé primaire | identifiant interne ; le code n'est plus la clé |
| `org_id`, `site_id`, `coach_id` | uuid | `coach_id` référence `membres` |
| `code` | text, unique | 8 caractères de l'alphabet actuel (6 aujourd'hui) ; voir la décision D7 |
| `prenom`, `poste` | text | prénom et initiale, métier visé |
| `warmup` | boolean | |
| `created_at`, `opened_at`, `warmup_done_at`, `last_activity_at` | timestamptz | |
| `expires_at` | timestamptz | expiration du code |
| `revoked_at` | timestamptz | révocation par le coach |
| `fin_accompagnement_at` | timestamptz | saisie par le coach ; déclenche le compte à rebours de la purge |

**`parcours_acces`** : lie une session anonyme à un parcours après saisie du code.

| Colonne | Type |
|---|---|
| `parcours_id`, `user_id` | uuid, clé primaire composée |
| `created_at`, `last_seen_at`, `revoked_at` | timestamptz |

**`tentatives_code`** : `id`, `user_id`, `ip_hash`, `at`, `ok`. Sert à limiter les essais de code. Purgée après 24 heures.

**`consentements`** : une ligne par événement, jamais modifiée (preuve, RGPD art. 7(1)).

| Colonne | Type | Remarque |
|---|---|---|
| `id` | uuid | |
| `parcours_id`, `user_id` | uuid | |
| `at` | timestamptz | |
| `evenement` | `accord` ou `retrait` | |
| `local`, `ai` | boolean | reprend `consent.local` et `consent.ai` |
| `textes_version` | text | reprend `ORG.textsVersion` |

**`takes`** : une ligne **par réponse envoyée**. Une réponse non envoyée n'a pas de ligne.

| Colonne | Type | Remarque |
|---|---|---|
| `id` | uuid, clé primaire | généré sur l'appareil (`crypto.randomUUID()`), ce qui rend l'envoi rejouable sans doublon |
| `parcours_id`, `org_id` | uuid | `org_id` recopié pour simplifier les politiques |
| `question`, `duration` | text, numeric | |
| `transcript`, `segments`, `gaze`, `analysis` | text, jsonb | calculés sur l'appareil, transmis à l'envoi |
| `note` | text | le mot de la personne à son coach |
| `has_video`, `mime`, `video_path`, `video_bytes` | | chemin dans le seau |
| `status` | `uploading`, `shared` ou `reported` | le coach ne voit que `shared` et `reported` |
| `recorded_at`, `shared_at` | timestamptz | date d'enregistrement sur l'appareil, date d'envoi |

**`brouillons`** : `take_id` (clé primaire), `coach_id`, `intro`, `comments` (jsonb), `notes` (jsonb), `updated_at`. Lisible par le coach seulement.

**`rapports`** : `take_id` (clé primaire), `intro`, `comments`, `notes`, `sent_at`, `sent_by`, `updated_at`. Lisible par la personne dès que `sent_at` est renseigné.

Séparer `brouillons` et `rapports` de `takes` est nécessaire : RLS filtre des lignes, pas des colonnes, et un brouillon ne doit jamais atteindre la personne.

**`demandes_prise_en_main`** : `id`, `prenom`, `structure`, `contact`, `message`, `created_at`, `statut`, `traitee_par`, `purge_at`. Insertion par la fonction `demande` seulement.

**`journal_acces`** : en ajout seul.

| Colonne | Type | Remarque |
|---|---|---|
| `id` | bigint | |
| `at` | timestamptz | |
| `acteur_id`, `acteur_role` | uuid, text | `personne`, `coach`, `referent`, `admin`, `systeme` |
| `org_id`, `parcours_id`, `take_id` | uuid | |
| `action` | text | `parcours.ouvrir`, `take.envoyer`, `take.reprendre`, `take.consulter`, `video.lire`, `rapport.envoyer`, `take.supprimer`, `accord.retirer`, `parcours.creer`, `parcours.supprimer`, `code.echec`, `membre.inviter`, `export.donnees` |
| `meta` | jsonb | jamais de contenu de réponse |

**`purges`** : `id`, `at`, `motif`, `nombre`, `detail`. Preuve que la purge a tourné.

**`llm_usage`** : `id`, `at`, `org_id`, `user_id`, `tache`, `modele`, `jetons_entree`, `jetons_sortie`, `issue`. Aucun contenu.

### 2.3 Stockage des vidéos

- Seau privé `videos`. Taille maximale par fichier : 30 Mo (une réponse de 3 minutes pèse environ 15 Mo avec les débits réglés dans `Recorder.jsx` : 600 kbit/s pour l'image, 64 kbit/s pour le son). Types acceptés : `video/webm`, `video/mp4`, `audio/webm`, `audio/mp4`.
- Chemin : `<org_id>/<parcours_id>/<take_id>.<extension>`.
- Écriture : par la personne, avec sa session, si elle a accès au parcours et si son accord est actif.
- Lecture : **aucune politique de lecture directe**. Toute lecture passe par la fonction `video-url`, qui vérifie le droit, journalise et renvoie une URL signée de 5 minutes.
- Suppression : par la personne (reprise d'envoi, suppression, retrait de l'accord) et par la purge. Toujours par l'API de stockage, jamais par une requête SQL sur les tables internes du stockage (qui laisserait le fichier en place).

### 2.4 Politiques RLS

Fonctions d'appui, dans un schéma non exposé (`private`), en `security definer`, appelées sous la forme `(select private.f(...))` pour être évaluées une fois par requête :

| Fonction | Renvoie vrai si |
|---|---|
| `private.a_acces(parcours_id)` | la session courante est une session de personne liée à ce parcours (`parcours_acces` non révoqué), et le parcours n'est ni expiré ni révoqué |
| `private.suit(parcours_id)` | la session est celle du coach du parcours, ou d'un référent du même site, ou d'un administrateur du même organisme, et le membre est actif |
| `private.role(org_id)` | renvoie le rôle du membre courant dans l'organisme |
| `private.accord_actif(parcours_id)` | le dernier événement de `consentements` est un accord |

**Second facteur obligatoire pour les coachs**, sur chaque table, par une politique restrictive (elle s'ajoute à toutes les autres) :

```sql
create policy mfa_obligatoire on public.takes
  as restrictive to authenticated
  using (
    (select coalesce((auth.jwt()->>'is_anonymous')::boolean, false))
    or (select auth.jwt()->>'aal') = 'aal2'
  );
```

Une session de coach sans second facteur ne lit donc rien, même si l'écran était contourné.

| Table | Personne (session anonyme liée) | Coach | Référent, administrateur |
|---|---|---|---|
| `organismes`, `sites` | aucune lecture directe | lecture de son organisme | administrateur : modification |
| `membres` | aucune (le nom affiché du coach est renvoyé par `ouvrir_parcours`) | lecture des membres de son organisme | administrateur : gestion par la fonction `inviter-coach` |
| `parcours` | lecture si `a_acces` ; modification limitée (`poste`, `opened_at`, `warmup_done_at`) par RPC | lecture et modification si `suit` ; création avec `coach_id = auth.uid()` | lecture selon le périmètre ; réaffectation |
| `parcours_acces` | lecture de ses propres lignes | lecture (nombre d'appareils liés) et révocation si `suit` | idem |
| `consentements` | lecture et ajout si `a_acces` ; ni modification ni suppression | lecture de l'état si `suit` | idem |
| `takes` | lecture, création (si `accord_actif`), suppression si `a_acces` | lecture si `suit` et `status` dans (`shared`, `reported`) ; aucune modification | idem coach |
| `brouillons` | **aucun accès** | lecture et écriture si `suit` | lecture |
| `rapports` | lecture si `a_acces` et `sent_at` renseigné | lecture et écriture si `suit` | lecture |
| `demandes_prise_en_main` | aucun | aucun | administrateur de l'organisme destinataire |
| `journal_acces` | aucun accès direct (droit d'accès : export sur demande) | aucun | administrateur : lecture de son organisme ; personne ne modifie ni ne supprime |
| `llm_usage`, `purges` | aucun | aucun | administrateur : lecture |
| `tentatives_code` | aucun | aucun | aucun (fonctions internes) |

Les indicateurs agrégés de l'espace coach (prises à relire, parcours, rapports, taux de réentraînement, délai moyen) sont renvoyés par une fonction `indicateurs()` qui ne produit que des agrégats par organisme ou par site, jamais par coach ni par personne (règle 7 du README).

**Opérations sensibles par fonction SQL** plutôt que par écriture directe, pour contrôler les transitions d'état et journaliser dans la même transaction :

| Fonction | Rôle |
|---|---|
| `ouvrir_parcours(code)` | vérifie le quota d'essais, le code, l'expiration, la révocation ; crée `parcours_acces` ; renvoie le parcours et le nom affiché du coach |
| `enregistrer_accord(parcours_id, local, ai, version)` | ajoute une ligne à `consentements` |
| `retirer_accord(parcours_id)` | ajoute le retrait, marque les réponses et leurs fichiers pour suppression immédiate |
| `envoyer_prise(take jsonb)` et `confirmer_envoi(take_id)` | création en `uploading`, puis passage en `shared` une fois le fichier arrivé |
| `reprendre_envoi(take_id)` | refuse si un rapport est envoyé ; supprime ligne, brouillon et fichier |
| `consulter_prise(take_id)` | renvoie la réponse au coach et écrit `take.consulter` dans le journal |
| `envoyer_rapport(take_id, rapport jsonb)` | écrit `rapports`, passe la réponse en `reported`, supprime le brouillon |
| `supprimer_mes_donnees(parcours_id)` | tout supprimer côté serveur pour la personne |
| `exporter_mes_donnees(parcours_id)` | portabilité : renvoie un JSON des réponses, rapports et accords |

### 2.5 Purge automatique

Les durées ci-dessous reprennent la proposition de `docs/conformite.md` (section 2.8). **Ce sont des hypothèses de travail à valider par le DPO**, stockées par organisme dans `organismes.durees`.

| Donnée | Règle proposée | Mise en œuvre |
|---|---|---|
| Réponses envoyées, vidéos, brouillons, rapports | fin de l'accompagnement + 3 mois ; au plus 12 mois après l'envoi | tâche quotidienne |
| Parcours et code | expiration à la fin de l'accompagnement ; au plus 6 mois sans activité | `expires_at`, puis suppression |
| Liens appareil ↔ parcours et sessions anonymes | supprimés avec le parcours ; sessions anonymes sans parcours supprimées après 24 heures | tâche quotidienne |
| Preuves d'accord et de retrait | durée de l'accompagnement + durée de prescription retenue par le juridique | conservées après la purge des réponses, rattachées à un identifiant de parcours sans prénom |
| Journal des accès | 6 mois à 1 an | tâche mensuelle |
| Demandes de prise en main | 3 ans après le dernier contact au plus | `purge_at` |
| Essais de code | 24 heures | tâche quotidienne |
| Envois inachevés (`uploading`) | 24 heures | tâche quotidienne |
| Comptes de coachs désactivés | à fixer (par exemple 12 mois après la désactivation) | tâche mensuelle |
| Données restées sur l'appareil | suppression proposée après 3 mois sans visite | dans le front, à l'ouverture |

Mécanisme : `pg_cron` lance chaque nuit une fonction SQL qui dresse la liste de ce qui est échu, puis appelle la fonction `purge` (par `pg_net`, avec un secret conservé dans le coffre de la base). La fonction supprime d'abord les fichiers par l'API de stockage, puis les lignes, puis écrit une ligne dans `purges`. Si la purge n'a pas tourné depuis 48 heures, la supervision alerte (lot 13).

Rappel : les sauvegardes quotidiennes gardent 7 jours de recul. La durée réelle d'effacement est donc « durée annoncée + 7 jours au plus ».

### 2.6 Journalisation des accès

- **Écritures** : déclencheurs sur `parcours`, `takes`, `rapports`, `consentements`, `membres`.
- **Lectures sensibles** : une lecture simple ne déclenche rien en base. C'est pourquoi la consultation d'une réponse par un coach passe par `consulter_prise` et la lecture d'une vidéo par `video-url`, qui journalisent toutes deux. Les listes (tableau de bord) ne sont pas journalisées ligne à ligne.
- **Connexions des coachs** : journal d'authentification de Supabase (conservé 7 jours en offre Pro) ; pour une conservation plus longue, recopier les événements utiles dans `journal_acces` par un point d'accroche d'authentification.
- **Échecs de code** : `code.echec`, pour détecter une recherche systématique.
- Le journal ne contient ni transcription, ni texte de rapport, ni adresse IP en clair (empreinte salée, pour la limitation de débit seulement).

---

## 3. De `store.js` à Supabase

### 3.1 Ce qui change de nature

1. **`store.js` devient une façade.** Les écrans (`App.jsx`, `Beneficiary.jsx`, `Counselor.jsx`, `Legal.jsx`, `Report.jsx`) continuent d'importer `./lib/store.js`. Derrière, deux adaptateurs : `local` (le code actuel, inchangé) et `supabase`.
2. **Le serveur ne voit que ce qui est envoyé.** Côté personne, l'état reste d'abord local : parcours ouvert, réponses, vidéos, analyses. L'adaptateur `supabase` ajoute la synchronisation de ce qui est partagé.
3. **Les fonctions qui touchent le serveur deviennent asynchrones.** Aujourd'hui `createParcours`, `findParcours`, `updateTake` sont synchrones. Leurs appels dans les écrans doivent passer à `await`, avec un état d'attente et un état d'erreur.
4. **Le code n'est plus l'identifiant.** Les réponses référencent `parcours_id`. Le champ `code` reste disponible dans l'objet parcours pour ne pas réécrire les écrans.
5. **`useStore()` reste la source de vérité des écrans.** L'adaptateur remplit le même objet `state` en mémoire (cache), puis prévient les abonnés. Les écrans ne lisent jamais Supabase directement.

### 3.2 Correspondance fonction par fonction

| Fonction actuelle | Aujourd'hui | Cible avec Supabase | Signature |
|---|---|---|---|
| `getState()`, `useStore()` | lecture de `localStorage` | inchangé : cache en mémoire, alimenté par l'adaptateur ; rafraîchi au retour sur l'onglet et toutes les 60 secondes côté coach (temps réel possible plus tard) | inchangée |
| `setLastSpace(ls)` | `localStorage` | reste local (préférence d'appareil) | inchangée |
| `setCounselor(name)` | enregistre un nom, sans vérification | remplacée par `signIn(email, motDePasse)` → `auth.signInWithPassword`, puis `auth.mfa.challenge` et `auth.mfa.verify` ; le profil vient de `membres` | **nouvelle**, asynchrone |
| `logoutCounselor()` | efface le nom | `auth.signOut()` et vidage du cache | asynchrone |
| `createParcours({prenom, poste, warmup})` | génère un code, écrit en local | `insert` dans `parcours` (le code est généré en base, unicité garantie) ; renvoie le code | asynchrone |
| `findParcours(code)` | lecture locale ; crée le parcours d'essai `REPETE` | `auth.signInAnonymously()` si aucune session, puis `rpc('ouvrir_parcours', {code})` ; erreurs distinctes : code inconnu, expiré, révoqué, trop d'essais | asynchrone |
| `updateParcours(code, patch)` | écrit en local | personne : `rpc` limitée à `poste`, `opened_at`, `warmup_done_at` ; accord : `rpc('enregistrer_accord')` ; coach : `update` sur `parcours` | asynchrone |
| `deleteParcours(code)` | supprime parcours, réponses, vidéos | coach : `rpc('supprimer_parcours')` ; la fonction `purge` retire les fichiers | asynchrone (l'est déjà) |
| `withdrawConsent(code)` | supprime réponses et vidéos, garde l'historique | suppression locale immédiate, puis `rpc('retirer_accord')` ; si hors ligne, le retrait est mis en file et rejoué, et l'écran le dit | asynchrone (l'est déjà) |
| `takesOf(code)` | filtre le cache | inchangé : fusion des réponses locales et des réponses envoyées (avec leur rapport) dans le cache | inchangée |
| `createTake({...})` | vidéo en IndexedDB, métadonnées en local | **inchangé : reste local.** Seul changement : identifiant en `crypto.randomUUID()` | inchangée |
| `updateTake(id, {shared: true, note})` | marque la réponse comme envoyée | nouvelle fonction `shareTake(id, note)` : `rpc('envoyer_prise')`, envoi TUS vers `videos/<org>/<parcours>/<id>.<ext>`, `rpc('confirmer_envoi')` ; progression affichée | **nouvelle**, asynchrone |
| `unshareTake(id)` | repasse en non envoyée | `rpc('reprendre_envoi')` ; la copie locale reste | asynchrone |
| `updateTake(id, {draft})` | brouillon du coach | `upsert` dans `brouillons`, différé de 2 secondes ; copie locale de secours | asynchrone |
| `updateTake(id, {report})` | rapport envoyé | `rpc('envoyer_rapport')` | asynchrone |
| `updateTake(id, patch)` autres cas (par exemple `analysis` recalculée) | écrit en local | reste local tant que la réponse n'est pas envoyée ; refusé après envoi | inchangée |
| `deleteTake(id)` | supprime vidéo et métadonnées | suppression locale, puis `delete` sur `takes` et retrait du fichier si la réponse était envoyée | asynchrone (l'est déjà) |
| `parcoursStatus(p)` | calcul local | inchangé ; pour la liste du coach, le statut peut venir d'une vue pour éviter de charger toutes les réponses | inchangée |
| `saveVideo(id, blob)`, `deleteVideo(id)` | IndexedDB | inchangé (copie locale de la personne) | inchangée |
| `loadVideoUrl(id)` | URL d'objet depuis IndexedDB | d'abord IndexedDB ; sinon appel à la fonction `video-url`, qui renvoie une URL signée de 5 minutes. Prévoir le renouvellement si la lecture dure plus longtemps | asynchrone (l'est déjà) |
| `saveWarmupDebrief`, `loadWarmupDebrief`, `clearWarmupDebrief` | `localStorage`, clé séparée | **restent locales**, comme le prévoit le commentaire du code : ces réponses ne remontent jamais | inchangées |
| `TRIAL_CODE`, `TRIAL_COACH`, `ensureTrial()` | parcours d'essai `REPETE` | conservé sur le site public en mode démonstration, **toujours avec l'adaptateur local** : rien de l'essai n'atteint le serveur. Décision D10 | inchangées |
| `TRIAL_LOGIN` | identifiants fictifs pré-remplis | supprimé du parcours de production ; conservé seulement en mode démonstration, clairement étiqueté | à retirer en production |

Nouvelles fonctions de la façade : `signIn`, `enrollMfa`, `verifyMfa`, `resetPassword`, `shareTake`, `exportMyData`, `deleteMyServerData`, `endAccompagnement(parcoursId)`, `revokeCode(parcoursId)`, `renewCode(parcoursId)`.

### 3.3 Stratégie de migration du code

**Étape A : isoler sans rien changer (lot 2).**

```
src/lib/store.js              façade : mêmes exports qu'aujourd'hui, choisit l'adaptateur
src/lib/data/local.js         le code actuel, déplacé tel quel
src/lib/data/supabase.js      nouvel adaptateur
src/lib/data/client.js        création du client supabase-js (clé publique)
src/lib/data/outbox.js        file des opérations en attente (IndexedDB)
src/lib/data/errors.js        erreurs typées et messages en français
```

Le choix se fait à la construction : sans `VITE_SUPABASE_URL`, l'adaptateur local est utilisé et l'application se comporte exactement comme aujourd'hui (démonstration, tests existants). `VITE_BACKEND_URL`, qui bascule déjà les textes en variante « production », prend la même valeur.

**Étape B : rendre les appels asynchrones (lot 2).** Passer à `await` les appels de `createParcours`, `findParcours`, `updateParcours`, `updateTake`, `unshareTake` dans les écrans, avec l'adaptateur local qui renvoie des promesses déjà résolues. Les tests de bout en bout existants doivent continuer à passer sans modification du parcours.

**Étape C : brancher l'adaptateur Supabase, fonction par fonction** (lots 4 à 6), derrière la même façade.

**Fonctionnement hors ligne.**

| Situation | Comportement attendu |
|---|---|
| Personne sans réseau, modèles déjà en cache | Échauffement, enregistrement, transcription, analyse locale et relecture fonctionnent. L'assistant répond avec le moteur local. |
| Envoi d'une réponse sans réseau ou coupé en cours | L'opération entre dans la file d'attente (`outbox`), l'écran indique « Envoi en attente », l'envoi TUS reprend là où il s'était arrêté au retour du réseau. La réponse n'est visible du coach qu'une fois le fichier complet (`confirmer_envoi`). |
| Retrait de l'accord ou suppression sans réseau | Effet local immédiat ; l'opération serveur est mise en file et rejouée ; un message dit clairement que la copie chez le coach sera supprimée dès le retour du réseau. |
| Coach sans réseau | Lecture impossible (rien n'est stocké durablement sur son appareil). Le brouillon en cours est gardé en mémoire et en local, puis renvoyé. Bandeau « Connexion interrompue ». |
| Première ouverture d'un code sans réseau | Impossible : message explicite. |

Pas de service worker dans un premier temps : la mise en cache des modèles est déjà assurée par le navigateur. Une version installable (PWA) peut venir après la mise en production.

**Gestion des erreurs.**

- Une seule classe `StoreError` avec un `code` stable : `hors_ligne`, `session_expiree`, `second_facteur_requis`, `non_autorise`, `code_inconnu`, `code_expire`, `trop_d_essais`, `quota`, `fichier_trop_lourd`, `conflit`, `serveur`.
- Chaque code a un message en français, au vouvoiement, sans jargon et sans tiret cadratin, rédigé selon `docs/redaction.md` et affiché avec les composants `Notice` existants.
- Règle d'or : **une erreur serveur ne fait jamais perdre une donnée locale**. La vidéo reste en IndexedDB tant que l'envoi n'est pas confirmé.
- Opérations rejouables sans doublon : identifiants générés sur l'appareil, `upsert` côté serveur.
- Nouvelles tentatives automatiques avec délai croissant pour les erreurs réseau et 5xx ; jamais pour 401, 403 et 4xx de validation.
- Session coach expirée : retour à l'écran de connexion en conservant le brouillon.
- Les écritures du coach sont « prudentes » (attente de la confirmation du serveur avant d'afficher « Rapport envoyé ») ; les écritures locales de la personne restent immédiates.

---

## 4. Comptes et clés à créer

Dans l'ordre. « Propriétaire » désigne la personne qui engage juridiquement l'organisme ou l'éditeur ; « développeur » désigne la personne ou l'agent qui intègre.

| # | Quoi | Où | Qui | Où la ranger | Exposition |
|---|---|---|---|---|---|
| 1 | Boîte de messagerie d'exploitation partagée (par exemple `technique@<domaine>`) et gestionnaire de mots de passe | messagerie de l'organisme | propriétaire | | Tous les comptes ci-dessous sont créés avec cette adresse, pas avec une adresse personnelle. Second facteur activé partout. |
| 2 | Nom de domaine | bureau d'enregistrement français | propriétaire | | public |
| 3 | Organisation Supabase, offre Pro, moyen de paiement, accord de sous-traitance (DPA) | supabase.com | propriétaire, puis invite le développeur | | |
| 4 | Projet Supabase de production, région `eu-west-3`, et projet de recette | tableau de bord Supabase | développeur | | |
| 5 | Adresse du projet et clé publique `sb_publishable_...` | Supabase, réglages API | développeur | variables GitHub Actions `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BACKEND_URL` | **publiques par nature** : elles sont dans le site livré. La sécurité repose sur RLS, pas sur leur secret. |
| 6 | Clé secrète `sb_secret_...` (une par usage : fonctions, purge) | Supabase, réglages API | développeur | secrets des fonctions Supabase uniquement | **jamais** dans le dépôt, dans une variable `VITE_`, ni dans GitHub Actions. Elle contourne RLS. |
| 7 | Mot de passe de la base | Supabase | développeur | secret GitHub Actions `SUPABASE_DB_PASSWORD` et gestionnaire de mots de passe | jamais exposé |
| 8 | Jeton d'accès Supabase pour le déploiement (`supabase db push`, `supabase functions deploy`) | Supabase, compte, jetons d'accès | développeur | secret GitHub Actions `SUPABASE_ACCESS_TOKEN` ; `SUPABASE_PROJECT_REF` en simple variable | jamais exposé ; à rattacher à un compte de service, pas à une personne |
| 9 | Compte Anthropic (console), organisation, moyen de paiement, lecture des conditions commerciales et de l'accord de sous-traitance | platform.claude.com | propriétaire | | |
| 10 | Espace de travail `la-repet-prod` (et `la-repet-recette`), plafond de dépense mensuel, clé d'API limitée à cet espace | console Anthropic | propriétaire crée l'espace et le plafond ; développeur crée la clé | secret de fonction Supabase `ANTHROPIC_API_KEY` | **jamais** dans le navigateur, le dépôt ou GitHub Actions. Une clé par environnement. |
| 11 | Compte du service d'e-mails transactionnels, accord de sous-traitance, domaine d'envoi vérifié (SPF, DKIM, DMARC) | prestataire français | propriétaire ; développeur pour le DNS | identifiants SMTP : réglages Auth de Supabase ; clé d'API : secret de fonction `EMAIL_API_KEY` | jamais exposé |
| 12 | Secrets internes : `CRON_SECRET` (appel de la purge), `IP_HASH_SALT` (empreinte des adresses IP) | générés par le développeur (`openssl rand -hex 32`) | développeur | secrets des fonctions et coffre de la base (Vault) | jamais exposé |
| 13 | Compte chez l'hébergeur du site statique, accord de sous-traitance, accès de déploiement | hébergeur retenu | propriétaire ; développeur pour l'accès | secrets GitHub Actions (`DEPLOY_HOST`, `DEPLOY_USER`, `DEPLOY_KEY`) | jamais exposé |
| 14 | Environnements GitHub `recette` et `production` avec validation manuelle pour la production | GitHub, réglages du dépôt | propriétaire | | |
| 15 | Supervision : surveillance de disponibilité et, si retenu, suivi des erreurs | prestataire retenu (voir lot 13) | développeur | l'adresse de collecte des erreurs est publique ; les jetons d'administration sont des secrets | |
| 16 | Premier compte administrateur de l'organisme dans l'application, avec second facteur | l'application elle-même (script d'amorçage) | développeur avec le propriétaire | | |

**Récapitulatif des variables.**

| Emplacement | Contenu | Visible dans le navigateur |
|---|---|---|
| Variables `VITE_` (construction) | `VITE_SUPABASE_URL`, `VITE_SUPABASE_PUBLISHABLE_KEY`, `VITE_BACKEND_URL`, `VITE_LLM_ENDPOINT` (adresse de la fonction `llm`), `VITE_MODELS_BASE_URL`, `VITE_WHISPER_MODEL`, `VITE_WHISPER_REVISION`, `VITE_MEDIAPIPE_WASM`, `VITE_FACE_MODEL`, `VITE_SEGMENTER_MODEL`, `VITE_CONTACT_EMAIL` | **oui, toutes.** Tout ce qui commence par `VITE_` est écrit dans le site livré. |
| Secrets des fonctions Supabase | `ANTHROPIC_API_KEY`, clé secrète Supabase, `EMAIL_API_KEY`, `CRON_SECRET`, `IP_HASH_SALT`, `LLM_PROVIDER`, `ALLOWED_ORIGIN` | non |
| Secrets GitHub Actions | `SUPABASE_ACCESS_TOKEN`, `SUPABASE_DB_PASSWORD`, accès de déploiement du site | non |
| Dépôt Git | aucun secret ; `.env.example` documente les noms, sans valeur | |

**Ne doivent jamais être exposés** : la clé Anthropic, toute clé `sb_secret_` ou `service_role`, le mot de passe de la base, le secret de signature des jetons, les identifiants SMTP, le jeton d'accès Supabase, les accès de déploiement. Activer l'analyse des secrets sur le dépôt et prévoir la procédure de rotation (lot 13).

---

## 5. Plan de travail par lots

Unité d'effort : jour de développement d'une personne expérimentée assistée par les agents. Les lots juridiques se comptent en temps du propriétaire et du DPO. Après chaque lot : `npm run build`, `npm run test:analysis`, `node tests/assistant.test.mjs`, `npm run test:design`, `npm run test:e2e` (aussi avec `E2E_VIEWPORT=390x844`), plus les tests ajoutés par le lot.

Ordre et dépendances :

```
Lot 0 (juridique) ─────────────────────────────────────────────────────────────┐
Lot 1 socle ─► Lot 3 schéma ─► Lot 4 coachs ─► Lot 5 personnes ─► Lot 6 envoi ─┤
Lot 2 façade ──────────────────┘                    │                          ├─► Lot 14 recette
                                                    ├─► Lot 7 assistants       │
                                                    ├─► Lot 8 demandes         │
                               Lot 6 ─► Lot 9 purge et journal                 │
Lot 10 modèles (indépendant) ─► Lot 11 déploiement et sécurité ─► Lot 13 ──────┘
Lot 12 tests : transversal, alimenté par chaque lot
```

### Lot 0. Décisions juridiques préalables

| | |
|---|---|
| **Objectif** | Disposer des décisions sans lesquelles aucune donnée réelle ne peut être traitée. |
| **Tâches** | 1. Désigner le responsable de traitement et le DPO. 2. Réaliser l'**AIPD** (obligatoire, écart R9), en y décrivant l'architecture de ce document. 3. Rédiger et faire signer la **note de qualification AI Act** (annexe III points 3(b) et 4, dérogation de l'article 6(3), question du profilage, voir `docs/conformite.md` 2.5). 4. Choisir la base légale (écart R6) et l'âge minimal (R13). 5. Valider les durées de conservation (2.5). 6. Choisir les sous-traitants : hébergement de la base (Supabase ou alternative), modèle de langage (options A à E de 1.6), e-mails, hébergeur du site, supervision. 7. Signer un **accord de sous-traitance (article 28) avec chacun**, et documenter les transferts hors Union s'il y en a. 8. Ouvrir la fiche de registre. 9. Compléter `src/content/organisme.js` et faire valider les textes « production » de `src/content/legal.js`. 10. Préparer la fiche et la formation des coachs (AI Act, article 4). |
| **Fichiers** | `src/content/organisme.js`, `src/content/legal.js` (modifiés par un autre lot de code, sur la base des décisions), `docs/conformite.md` (mise à jour des écarts) |
| **Validation** | AIPD signée ; note de qualification signée ; tableau des sous-traitants avec DPA signés ; durées validées par écrit ; `missing` vide dans `organisme.js` |
| **Effort** | 5 à 10 jours de travail pour le propriétaire et le DPO, étalés sur 3 à 6 semaines |
| **Dépendances** | Aucune. À lancer tout de suite, en parallèle des lots techniques. **Bloque le lot 14.** Les choix de prestataires du point 6 conditionnent les lots 1, 7, 8 et 11. |

### Lot 1. Socle technique

| | |
|---|---|
| **Objectif** | Un projet Supabase de recette et un de production, reproductibles depuis le dépôt. |
| **Tâches** | Créer les comptes 1 à 8 de la section 4. Initialiser `supabase/` (CLI, `config.toml`). Faire tourner Supabase en local pour le développement et les tests. Réglages Auth : inscription libre désactivée, sessions anonymes activées, second facteur TOTP activé, longueur minimale du mot de passe, durée de session. Ajouter `@supabase/supabase-js` aux dépendances. Compléter `.env.example`. |
| **Fichiers** | `supabase/config.toml`, `supabase/migrations/`, `supabase/functions/_shared/`, `.env.example`, `package.json`, `README.md` (section configuration) |
| **Validation** | `supabase start` puis `supabase db reset` fonctionnent en local ; le projet de recette est en `eu-west-3` ; aucune clé dans le dépôt ; la construction du site sans variable se comporte comme aujourd'hui |
| **Effort** | 1,5 jour |
| **Dépendances** | Choix de l'hébergement de la base (lot 0, point 6) |

### Lot 2. Façade de données

| | |
|---|---|
| **Objectif** | Préparer le code à recevoir un backend sans changer son comportement. |
| **Tâches** | Étapes A et B de la section 3.3 : déplacer le code actuel dans `data/local.js`, faire de `store.js` une façade, rendre asynchrones les appels concernés dans les écrans, introduire `StoreError` et les messages, remplacer `uid()` par `crypto.randomUUID()`, ajouter les états d'attente et d'erreur aux écrans touchés. |
| **Fichiers** | `src/lib/store.js`, `src/lib/data/local.js`, `src/lib/data/errors.js`, `src/App.jsx`, `src/Beneficiary.jsx`, `src/Counselor.jsx`, `src/Legal.jsx`, `src/Report.jsx`, `tests/e2e.cjs` |
| **Validation** | Tous les tests existants passent sans changement de parcours ; aucun import direct de `data/` depuis un écran ; un test unitaire de la façade avec un adaptateur factice qui échoue vérifie qu'aucune donnée locale n'est perdue |
| **Effort** | 3 jours |
| **Dépendances** | Aucune (peut commencer avant le lot 1). À coordonner avec les agents qui modifient `src/` en ce moment. |

### Lot 3. Schéma, politiques et tests d'accès

| | |
|---|---|
| **Objectif** | La base décrite en section 2, avec la preuve automatisée que le cloisonnement tient. |
| **Tâches** | Migrations : tables, index, types, fonctions d'appui `private.*`, politiques RLS, politique restrictive de second facteur, seau `videos` et ses politiques, retrait de tous les droits du rôle `anon`. Fonctions SQL de 2.4. Jeu de données d'essai (deux organismes, deux sites, trois coachs, quatre parcours). Tests pgTAP : pour chaque table et chaque rôle, ce qui est permis et ce qui est refusé. |
| **Fichiers** | `supabase/migrations/*.sql`, `supabase/seed.sql`, `supabase/tests/*.sql` |
| **Validation** | `supabase test db` vert ; cas refusés prouvés : coach de l'organisme A sur un parcours de B ; coach sans second facteur ; personne sur un autre parcours ; personne sur un brouillon ; personne sur un rapport non envoyé ; session anonyme non liée ; requête sans session ; le contrôle de sécurité de Supabase (advisors) ne signale aucune table sans RLS |
| **Effort** | 4 jours |
| **Dépendances** | Lot 1 |

### Lot 4. Authentification des coachs

| | |
|---|---|
| **Objectif** | Remplacer la connexion simulée par une authentification forte. |
| **Tâches** | Écran de connexion réel (adresse, mot de passe), enrôlement TOTP à la première connexion, saisie du code à chaque connexion, réinitialisation du mot de passe, déconnexion, expiration de session. Fonction `inviter-coach`. Écran d'administration minimal : inviter, désactiver, changer de rôle ou de site. Flux PKCE ou code à saisir pour les liens d'e-mail (voir 1.9). SMTP personnalisé. Retirer `TRIAL_LOGIN` du parcours de production. Notice « Coachs » déjà prévue (écart R12). |
| **Fichiers** | `src/App.jsx` (écran de connexion), `src/Counselor.jsx`, `src/lib/data/supabase.js`, `src/lib/data/client.js`, `src/lib/store.js`, `supabase/functions/inviter-coach/`, modèles d'e-mails |
| **Validation** | Impossible d'atteindre `#/coach` sans session `aal2` ; une session `aal1` ne lit aucune ligne (test RLS) ; invitation, première connexion et enrôlement réussis de bout en bout en recette ; cinq mots de passe faux déclenchent la limitation ; aucun identifiant pré-rempli en production ; textes d'interface relus (`npm run test:design`) |
| **Effort** | 3 jours |
| **Dépendances** | Lots 2 et 3 ; compte d'e-mails (section 4, ligne 11) |

### Lot 5. Accès de la personne par code

| | |
|---|---|
| **Objectif** | Un code ouvre un parcours depuis n'importe quel appareil, avec expiration, révocation et limitation des essais. |
| **Tâches** | Session anonyme à la saisie du code (pas au chargement de la page : rien n'est créé avant une action de la personne). `ouvrir_parcours`, limitation (par exemple 5 essais par quart d'heure et par session, 20 par heure et par adresse), code à 8 caractères, expiration, révocation et renouvellement par le coach, écran « ce code n'est plus valable ». Accord tracé côté serveur avec la version des textes. Création de parcours par le coach en base. Mode démonstration `REPETE` conservé en local. Protection contre l'abus des sessions anonymes : voir risque R6. |
| **Fichiers** | `src/Beneficiary.jsx`, `src/Counselor.jsx`, `src/App.jsx`, `src/lib/data/supabase.js`, `supabase/migrations/` (fonctions), `tests/e2e.cjs` |
| **Validation** | Un parcours créé sur l'ordinateur du coach s'ouvre sur un téléphone ; le sixième essai faux est refusé avec un message clair ; un code révoqué ou expiré ne s'ouvre plus ; le retrait de l'accord est horodaté en base ; le parcours d'essai ne crée aucune ligne sur le serveur |
| **Effort** | 3 jours |
| **Dépendances** | Lots 3 et 4 |

### Lot 6. Stockage vidéo et envoi au coach

| | |
|---|---|
| **Objectif** | L'envoi d'une réponse fonctionne entre deux appareils, et seulement à la demande de la personne. |
| **Tâches** | `shareTake` : création de la ligne, envoi TUS avec progression et reprise, confirmation. File d'attente hors ligne. `reprendre_envoi`. Fonction `video-url` et adaptation de `loadVideoUrl`. Côté coach : liste « À relire », `consulter_prise`, brouillon synchronisé, `envoyer_rapport`. Côté personne : réception du rapport. Rafraîchissement au retour sur l'onglet. Suppression d'une réponse et retrait de l'accord répercutés sur le serveur. |
| **Fichiers** | `src/Beneficiary.jsx` (écran `Share`), `src/Counselor.jsx` (`List`, `Review`), `src/Report.jsx` (`Player`), `src/lib/data/supabase.js`, `src/lib/data/outbox.js`, `supabase/functions/video-url/`, `supabase/migrations/` |
| **Validation** | Test de bout en bout à deux navigateurs : la personne envoie, le coach voit, annote, renvoie, la personne lit le rapport. **Test de non-régression de la promesse centrale : avant le clic sur « Envoyer », aucune requête ne part vers le stockage ni vers la table `takes`** (vérifié par interception réseau dans Playwright). Coupure réseau au milieu de l'envoi : reprise sans doublon. Une URL signée expire bien après 5 minutes. La reprise d'envoi supprime la ligne et le fichier. |
| **Effort** | 5 jours |
| **Dépendances** | Lot 5 |

### Lot 7. Assistants par Claude

| | |
|---|---|
| **Objectif** | Les trois usages du modèle de langage passent par la fonction `llm`, sans clé dans le navigateur. |
| **Tâches** | Fonction `llm` (1.6) : contrat par tâche, prompts côté serveur, modèles par usage, sortie structurée pour le retour, filtre de conformité partagé, quotas, `llm_usage`, interface de fournisseur. Adapter les trois appels du front au nouveau contrat (jeton de session, suppression de `temperature` et du nom de modèle). Extraire le garde-fou dans un module partagé. Mention « Texte reformulé par un programme » déjà prévue (écart A3). Jeu d'essai de conformité : une centaine de transcriptions fictives, dont des cas piégeux (personne qui parle de son stress, demande de note, tentative de détournement de consigne), rejoué à chaque changement de prompt ou de modèle. |
| **Fichiers** | `supabase/functions/llm/`, `supabase/functions/_shared/prompts.ts`, `supabase/functions/_shared/compliance.ts`, `src/lib/analysis.js`, `src/lib/assistant.js`, `src/lib/coachAssistant.js`, `tests/analysis.test.mjs`, `tests/assistant.test.mjs`, `tests/llm-conformite.test.mjs` (nouveau) |
| **Validation** | Aucune chaîne `sk-ant` ni adresse `api.anthropic.com` dans `dist/` ; la fonction refuse une requête sans session, sans accord, hors quota ; elle refuse un `task` inconnu ; une sortie non conforme simulée déclenche le repli local ; coupure du service : l'application reste entièrement utilisable ; jeu d'essai : zéro note et zéro vocabulaire émotionnel en sortie ; temps de réponse médian mesuré et consigné (cible : moins de 2 secondes pour le premier mot de l'assistant, moins de 8 secondes pour la reformulation) |
| **Effort** | 3 jours |
| **Dépendances** | Lot 5 ; décision sur le fournisseur (lot 0) ; compte et clé (section 4, lignes 9 et 10) |

### Lot 8. Demandes de prise en main et e-mails

| | |
|---|---|
| **Objectif** | Le formulaire « Demander une prise en main » arrive réellement à l'équipe. |
| **Tâches** | Fonction `demande` : validation, champ piège contre les robots, limitation par adresse, insertion, e-mail de notification sans donnée superflue. Adapter `Demo.jsx` (remplacer le `mailto:`, garder le repli si la fonction échoue). Texte d'information 5.7 de `docs/conformite.md`, suppression de la case de consentement obligatoire (écart D2). Écran de suivi pour l'administrateur (liste, « traitée »). Purge à l'échéance. |
| **Fichiers** | `src/Demo.jsx`, `supabase/functions/demande/`, `supabase/migrations/`, `src/content/legal.js` |
| **Validation** | Une demande faite en recette arrive par e-mail et apparaît dans la liste ; dix demandes en une minute depuis la même adresse sont limitées ; l'e-mail passe SPF, DKIM et DMARC ; `npm run test:site` adapté et vert |
| **Effort** | 2 jours |
| **Dépendances** | Lot 3 ; compte d'e-mails |

### Lot 9. Purge, durées, journal et droits des personnes

| | |
|---|---|
| **Objectif** | Les durées annoncées sont tenues par la machine, et les accès sont traçables. |
| **Tâches** | Tâches `pg_cron`, fonction `purge`, table `purges`. Bouton « Fin de l'accompagnement » côté coach. Déclencheurs de journal. Écran de consultation du journal pour l'administrateur. « Télécharger mes données » et « Tout supprimer » côté personne, branchés sur le serveur. Proposition de suppression locale après 3 mois sans visite. Mise à jour des textes de durée. |
| **Fichiers** | `supabase/migrations/` (purge, journal), `supabase/functions/purge/`, `src/Counselor.jsx`, `src/Beneficiary.jsx`, `src/Legal.jsx`, `src/content/legal.js` |
| **Validation** | Test avec horloge avancée : une réponse échue disparaît de la base **et** du stockage, et une ligne apparaît dans `purges` ; aucun fichier orphelin après purge (comparaison des deux listes) ; chaque action de la liste 2.2 produit une ligne de journal ; personne ne peut modifier le journal (test RLS) ; l'export contient réponses, rapports et accords |
| **Effort** | 3 jours |
| **Dépendances** | Lot 6 ; durées validées (lot 0) |

### Lot 10. Modèles servis par le site et décision sur la transcription

| | |
|---|---|
| **Objectif** | Plus aucun appel à Hugging Face, jsDelivr ou Google, et une décision chiffrée sur la transcription. |
| **Tâches** | `scripts/fetch-models.mjs` avec révisions figées et empreintes. Régler le chemin du moteur ONNX dans `whisper.worker.js`. Renseigner les variables. Mettre à jour `THIRD_PARTIES` et `SELF_HOSTED_MODELS`. **Premier essai réel de Whisper et de MediaPipe** (jamais fait d'après le README) sur ordinateur, Android d'entrée de gamme, iPhone et Safari. Mesurer le temps de transcription et consigner les résultats. |
| **Fichiers** | `scripts/fetch-models.mjs`, `scripts/models.lock.json`, `src/lib/whisper.worker.js`, `src/lib/gaze.js`, `src/lib/background.js`, `src/content/organisme.js`, `.github/workflows/`, `.env.example` |
| **Validation** | Parcours complet avec le réseau filtré pour ne laisser passer que le domaine du site et Supabase ; test automatique : aucune adresse tierce dans `dist/` ; tableau des temps mesurés par appareil ; décision écrite sur la transcription (1.7) |
| **Effort** | 2 jours, plus une demi-journée d'essais sur appareils |
| **Dépendances** | Aucune. Peut démarrer tout de suite. |

### Lot 11. Déploiement, intégration continue et sécurité

| | |
|---|---|
| **Objectif** | Une mise en production reproductible, sur le domaine de l'organisme, avec des en-têtes de sécurité stricts. |
| **Tâches** | **Intégration continue** : étendre `.github/workflows/pages.yml` ou créer `ci.yml` pour lancer sur chaque demande de fusion la construction, `test:analysis`, `tests/assistant.test.mjs`, `test:design`, `test:site`, `test:e2e` aux deux tailles, les tests RLS et l'analyse des secrets (aujourd'hui seul `test:analysis` tourne). **Déploiement** : `deploy.yml` avec deux environnements ; ordre : migrations, fonctions, site ; validation manuelle pour la production ; retour arrière documenté. **Domaine** : DNS, certificat, redirection HTTPS. **En-têtes** : voir ci-dessous. **Durcissement** : CORS des fonctions, limites de débit d'Auth, vérification des mots de passe compromis si l'offre le permet, restriction des adresses de redirection, revue des politiques avec le contrôle de sécurité de Supabase. |
| **Fichiers** | `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`, `.github/workflows/pages.yml`, fichier d'en-têtes de l'hébergeur (`public/.htaccess` ou configuration du serveur), `index.html`, `vite.config.js`, `supabase/functions/_shared/cors.ts` |
| **Validation** | Une fusion sur `main` déploie en recette sans intervention ; la production demande une validation ; les en-têtes sont présents (vérification par `curl -I` dans la CI) ; aucune erreur de politique de contenu pendant le parcours complet ; note A sur un outil d'analyse d'en-têtes ; HTTPS forcé |
| **Effort** | 3 jours |
| **Dépendances** | Lots 1 et 10 ; choix de l'hébergeur et du domaine (lot 0) |

En-têtes à poser (à ajuster après essai) :

```
Content-Security-Policy:
  default-src 'self';
  script-src 'self' 'wasm-unsafe-eval' 'sha256-<empreinte du script en ligne de index.html>';
  style-src 'self' 'unsafe-inline';
  img-src 'self' data: blob:;
  media-src 'self' blob: https://<projet>.supabase.co;
  connect-src 'self' https://<projet>.supabase.co https://<projet>.storage.supabase.co;
  worker-src 'self' blob:;
  font-src 'self';
  object-src 'none'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'
Strict-Transport-Security: max-age=63072000; includeSubDomains
X-Content-Type-Options: nosniff
Referrer-Policy: no-referrer
Permissions-Policy: camera=(self), microphone=(self), geolocation=(), payment=()
Cross-Origin-Opener-Policy: same-origin
```

Remarques : `style-src 'unsafe-inline'` est imposé par les styles en ligne du projet (attributs `style`), ce qui est acceptable tant que `script-src` reste strict. `'wasm-unsafe-eval'` est nécessaire à Whisper et à MediaPipe. `index.html` contient un script et un style en ligne (écran de chargement) : les autoriser par empreinte, ou les sortir dans des fichiers. `Cross-Origin-Embedder-Policy` (utile au calcul WebAssembly sur plusieurs fils) est à essayer séparément, car il peut bloquer la lecture des vidéos servies par Supabase.

### Lot 12. Tests (transversal)

| | |
|---|---|
| **Objectif** | Chaque promesse du produit a un test qui échoue si elle est rompue. |
| **Tâches** | Tests RLS (lot 3). Tests des fonctions (Deno) : `llm`, `video-url`, `demande`, `purge`. Tests de bout en bout contre un Supabase local, à deux navigateurs, aux deux tailles d'écran. Test « rien ne part avant l'envoi » (lot 6). Test « aucun secret ni domaine tiers dans `dist/` ». Test de conformité des sorties du modèle (lot 7). Test de charge léger (20 envois simultanés). Essais manuels sur appareils réels, lecteur d'écran compris. Revue de sécurité par une personne extérieure avant ouverture (voir risque R9). |
| **Fichiers** | `tests/`, `supabase/tests/`, `supabase/functions/*/test.ts`, `tests/run-e2e.mjs`, `package.json` (scripts `test:rls`, `test:functions`, `test:backend`) |
| **Validation** | Tous les tests tournent dans la CI en moins de 15 minutes ; le mode sans backend reste couvert par les tests actuels |
| **Effort** | 4 jours, répartis sur les lots 3 à 11 |
| **Dépendances** | Suit chaque lot |

### Lot 13. Supervision et exploitation

| | |
|---|---|
| **Objectif** | Savoir que le service fonctionne, et savoir quoi faire quand il ne fonctionne pas. |
| **Tâches** | Surveillance de disponibilité du site et d'une fonction de santé, avec alerte par e-mail. Alerte si la purge n'a pas tourné depuis 48 heures. Alerte de dépense (plafond Anthropic, alerte de facturation Supabase). Suivi des erreurs du front **sans donnée personnelle** : soit un outil auto-hébergé ou hébergé dans l'Union, soit une fonction `log-erreur` minimale qui n'enregistre que le message technique, l'écran et la version. Tableau de bord d'usage à partir de `llm_usage` et des agrégats. Essai de restauration d'une sauvegarde. Document d'exploitation : rotation des clés, départ d'un coach, demande d'exercice de droits, **procédure de violation de données** (notification à la CNIL sous 72 heures, RGPD art. 33), contacts. |
| **Fichiers** | `docs/exploitation.md` (nouveau), `supabase/functions/sante/`, `supabase/functions/log-erreur/`, `src/main.jsx` (capture des erreurs) |
| **Validation** | Une panne simulée déclenche une alerte en moins de 10 minutes ; une restauration a été réalisée en recette ; la rotation de la clé Anthropic a été faite une fois ; le document d'exploitation a été relu par le propriétaire |
| **Effort** | 1,5 jour |
| **Dépendances** | Lot 11 |

Vigilance : les outils de supervision les plus répandus sont américains. Aucun ne doit recevoir de transcription, de prénom ni de code d'accès. Désactiver l'enregistrement de session et la capture du contenu des pages.

### Lot 14. Recette, pilote et ouverture

| | |
|---|---|
| **Objectif** | Ouvrir à de vraies personnes, d'abord à petite échelle. |
| **Tâches** | Liste de contrôle d'ouverture (ci-dessous). Recette complète par le propriétaire et deux coachs. Formation des coachs. Pilote de 2 à 4 semaines avec un site, quelques coachs et des personnes volontaires. Recueil des retours, des temps de transcription réels et des incidents. Validation des seuils de `analysis.js` et `gaze.js` sur des prises réelles consenties, puis audit de biais (README, point 6). Audit d'accessibilité RGAA (README, point 7). |
| **Fichiers** | `docs/recette.md` (nouveau), `README.md` (mise à jour de « Passage en production ») |
| **Validation** | Toutes les cases de la liste cochées et signées par le propriétaire |
| **Effort** | 3 jours de développement, plus la durée du pilote |
| **Dépendances** | Tous les lots, dont le lot 0 |

Liste de contrôle d'ouverture :

- [ ] AIPD signée ; note de qualification AI Act signée
- [ ] Accord de sous-traitance signé avec chaque prestataire ; transferts hors Union documentés ou absents
- [ ] `src/content/organisme.js` complet ; textes « production » validés par le DPO
- [ ] Durées validées et purge vérifiée en recette
- [ ] Tests RLS verts ; revue de sécurité extérieure faite ; contrôle de sécurité Supabase sans alerte
- [ ] Aucun service tiers appelé par le navigateur en dehors du site et de Supabase
- [ ] Connexion de démonstration absente de la production
- [ ] Second facteur actif pour tous les comptes de coach et pour tous les comptes d'administration des prestataires
- [ ] Sauvegarde restaurée une fois ; procédure de violation de données connue
- [ ] Coachs formés ; alternative sans l'outil proposée aux personnes (écart R6)
- [ ] Plafonds de dépense réglés

**Total indicatif : environ 41 jours de développement**, soit 8 à 10 semaines pour une personne, moins avec plusieurs agents en parallèle sur les lots indépendants (2, 10, 8). Le chemin critique est le lot 0 : commencer par lui.

---

## 6. Coûts mensuels

**Hypothèses** (petit organisme, à ajuster) : 10 coachs ; 60 personnes actives par mois ; 8 réponses enregistrées par personne et par mois, dont 3 envoyées au coach ; 10 Mo par vidéo en moyenne (15 Mo au plus) ; 30 messages à l'assistant par personne ; 4 demandes d'aide à la rédaction par relecture. Soit par mois : 480 retours reformulés, 1 800 messages d'assistant, 180 réponses envoyées (1,8 Go), 720 aides au coach. Prix relevés le 21 novembre 2026 pour Supabase et Anthropic ; les autres sont des ordres de grandeur non vérifiés. Un dollar est compté pour environ un euro.

| Brique | Détail | Ordre de grandeur mensuel |
|---|---|---|
| Supabase, offre Pro (production) | 25 $ par mois, calcul « Micro » inclus ; 8 Go de base, 100 Go de fichiers, 250 Go de trafic sortant, 100 000 utilisateurs actifs et 2 millions d'appels de fonctions inclus. Les volumes ci-dessus tiennent largement dans l'inclus : même avec 12 mois de conservation, le stock de vidéos reste autour de 20 Go. | 25 $ |
| Supabase, projet de recette | Dans la même organisation, un second projet coûte son calcul (environ 10 $) ; ou projet gratuit, qui se met en pause après une semaine d'inactivité | 0 à 10 $ |
| Supabase, domaine personnalisé (facultatif) | 10 $ par mois | 0 ou 10 $ |
| Supabase, restauration à un instant donné (facultatif) | 100 $ par mois pour 7 jours ; non nécessaire au départ | 0 $ |
| Anthropic, retours reformulés (`claude-sonnet-5-5`) | 480 × (environ 2 000 jetons en entrée et 1 000 en sortie, réflexion comprise) ≈ 480 × 0,014 $ | environ 7 $ |
| Anthropic, assistant (`claude-haiku-5-5`) | 1 800 × (environ 1 500 en entrée et 400 en sortie) ≈ 1 800 × 0,00035 $ | moins de 1 $ |
| Anthropic, aide au coach (`claude-sonnet-5-5`) | 720 × (environ 1 500 en entrée et 600 en sortie) ≈ 720 × 0,009 $ | environ 7 $ |
| **Total Anthropic** | Avec une marge de sécurité d'un facteur 2 (le français et le nouveau découpage en jetons pèsent plus lourd que l'anglais) | **15 à 30 $** ; plafond conseillé : 50 $ |
| E-mails transactionnels | Quelques dizaines de messages par mois ; les offres d'entrée des prestataires français sont gratuites ou de quelques euros | 0 à 10 € |
| Hébergement du site statique | Selon l'option de 1.3 | 0 à 10 € |
| Nom de domaine `.fr` | Environ 10 € par an | environ 1 € |
| Supervision | Surveillance de disponibilité simple ; suivi d'erreurs par fonction maison | 0 à 10 € |
| Transcription | Dans le navigateur | 0 € |
| **Total récurrent** | | **environ 45 à 100 € par mois** |

Si le volume décuple (600 personnes actives), le poste Anthropic passe à 150 à 300 $ et le stockage commence à dépasser l'inclus au bout de quelques mois (environ 0,02 $ par Go supplémentaire) : le coût reste dominé par le modèle de langage, d'où l'intérêt de mesurer si `claude-haiku-5-5` suffit pour la reformulation.

**Coûts ponctuels à prévoir, hors de ce tableau** : accompagnement juridique pour l'AIPD et la note AI Act, revue de sécurité extérieure, audit d'accessibilité RGAA, formation des coachs, temps de développement (section 5).

---

## 7. Risques et décisions à prendre

### 7.1 Décisions du propriétaire (et du DPO quand c'est indiqué)

| # | Décision | Options | Qui | Bloque |
|---|---|---|---|---|
| D1 | Qui est responsable de traitement : un organisme unique, ou un éditeur qui sert plusieurs organismes (qui seraient alors chacun responsable, l'éditeur sous-traitant) ? | Organisme unique ; marque blanche multi-organismes | Propriétaire, juriste | Lot 0 ; le schéma supporte les deux |
| D2 | Hébergement de la base et des vidéos | Supabase hébergé à Paris (société américaine sur AWS, non qualifié SecNumCloud) ; Supabase auto-hébergé chez Scaleway ou OVHcloud (plus d'exploitation) ; Postgres géré français avec une API à écrire | DPO | Lot 1 |
| D3 | Fournisseur du modèle de langage | Options A à E de 1.6 | DPO, propriétaire | Lot 7 |
| D4 | Engagement « zéro conservation » auprès d'Anthropic si l'option A est retenue | Le demander au service commercial ; s'en tenir au fonctionnement par défaut | Propriétaire | Lot 7 |
| D5 | Transcription | Navigateur (recommandé) ; option serveur par organisme | DPO, après mesures du lot 10 | Lot 10 |
| D6 | Hébergeur du site et nom de domaine | Voir 1.3 | Propriétaire | Lot 11 |
| D7 | Stockage et vie du code d'accès | Code lisible par le coach, réaffichable (simple, recommandé) ; ou empreinte seule, avec renouvellement si la personne le perd (plus strict). Longueur 8 caractères. Un code peut-il lier plusieurs appareils sans action du coach ? | Propriétaire | Lot 5 |
| D8 | Durées de conservation | Proposition de 2.5 | DPO | Lot 9 |
| D9 | Périmètre des rôles | Le référent voit-il toutes les réponses de son site ou seulement des agrégats ? L'administrateur voit-il les vidéos ? Recommandation : le moins possible, et toute consultation journalisée | Propriétaire, DPO | Lot 3 |
| D10 | Site public de démonstration | Garder le parcours d'essai en local sur le même domaine ; ou séparer vitrine et application sur deux sous-domaines | Propriétaire | Lot 11 |
| D11 | Base légale, âge minimal, alternative sans l'outil | Voir `docs/conformite.md`, écarts R6 et R13 | DPO | Lot 0 |
| D12 | Notifications au coach par e-mail quand une réponse arrive | Oui, sans aucune donnée de la personne ; non | Propriétaire | Lot 8 |
| D13 | Budget et plafond mensuel pour le modèle de langage ; comportement au plafond (repli silencieux sur le moteur local, recommandé) | | Propriétaire | Lot 7 |

### 7.2 Risques

| # | Risque | Gravité | Parade |
|---|---|---|---|
| R1 | **Le juridique arrive après le code.** Sans AIPD ni accords de sous-traitance, l'ouverture est bloquée alors que tout est prêt. | Élevée | Lancer le lot 0 en premier ; point d'étape toutes les deux semaines |
| R2 | **Transfert hors Union par le modèle de langage.** L'API Anthropic directe traite le texte hors de l'Union ; une transcription peut contenir des informations sensibles. | Élevée | Décision D3 documentée dans l'AIPD ; accord distinct et clair ; interface de fournisseur pour pouvoir changer ; mode sans modèle toujours fonctionnel |
| R3 | **Prestataires de droit américain pour l'hébergement** (Supabase, AWS, éventuellement GitHub). Localisation à Paris, mais exposition aux lois extraterritoriales. | Moyenne à élevée selon l'analyse du DPO | Décision D2 ; chiffrement en transit et au repos ; minimisation ; pas de donnée avant envoi ; plan de sortie (Supabase est libre et auto-hébergeable, le schéma est du Postgres standard) |
| R4 | **Erreur de politique RLS** : un coach voit les données d'un autre organisme, ou une personne celles d'une autre. C'est le risque technique le plus grave. | Élevée | Tests RLS exhaustifs et bloquants dans la CI ; politique restrictive de second facteur ; lectures sensibles par fonctions ; revue extérieure avant ouverture |
| R5 | **Devinette du code d'accès.** Six caractères sur un alphabet de 31 signes : environ 900 millions de combinaisons, ce qui ne résiste que grâce à la limitation des essais. | Moyenne | 8 caractères ; limitation par session et par adresse ; expiration ; révocation ; journal des échecs et alerte |
| R6 | **Abus des sessions anonymes** (création en masse). Supabase recommande un CAPTCHA, dont les fournisseurs proposés sont américains. | Moyenne | Session créée seulement à la saisie d'un code ; limite par adresse (30 par heure par défaut) ; purge des sessions sans parcours ; n'ajouter un CAPTCHA que si un abus est constaté, après avis du DPO |
| R7 | **Transcription trop lente ou impossible sur les téléphones modestes**, jamais essayée en conditions réelles. | Élevée pour l'usage | Lot 10 dès le début ; mesure par appareil ; option serveur encadrée en réserve |
| R8 | **Sortie du modèle non conforme** (note, émotion) malgré les consignes. Le filtre est lexical : ce n'est pas une garantie. | Élevée (AI Act, art. 5(1)(f)) | Double filtre serveur et navigateur ; repli local ; jeu d'essai rejoué à chaque changement ; possibilité de couper le modèle par organisme (`llm_actif`) |
| R9 | **Faille applicative** (fonction mal protégée, clé exposée, URL signée trop longue). | Élevée | Liste de contrôle du lot 11 ; analyse des secrets ; revue extérieure ; rotation des clés éprouvée |
| R10 | **Perte d'une réponse non envoyée** (changement d'appareil, nettoyage du navigateur, Safari qui purge le stockage après 7 jours sans visite). C'est la contrepartie du choix « rien sur le serveur avant l'envoi ». | Moyenne | Le dire clairement à la personne ; demander le stockage persistant au navigateur (`navigator.storage.persist()`) ; ne pas « corriger » en envoyant tout au serveur |
| R11 | **Purge incomplète** (fichier orphelin, sauvegarde de 7 jours). | Moyenne | Suppression par l'API de stockage ; contrôle d'orphelins ; alerte si la purge ne tourne pas ; mention des 7 jours dans la notice |
| R12 | **Dépendance à un prestataire** et évolution de ses prix ou de ses conditions. | Faible à moyenne | Postgres standard, fonctions en TypeScript, interface de fournisseur pour le modèle, façade `store.js` : chaque brique peut être remplacée seule |
| R13 | **Conflits avec les autres agents qui modifient `src/`** pendant le lot 2, qui touche presque tous les écrans. | Moyenne | Faire le lot 2 en une seule demande de fusion courte, annoncée, sur une branche à jour ; geler les écrans concernés pendant un ou deux jours |
| R14 | **Dérive des coûts du modèle** en cas d'abus ou de boucle. | Faible | Quotas par session, plafond dans la console, alerte, repli local au plafond |
| R15 | **Compte de coach compromis ou coach parti.** | Moyenne | Second facteur obligatoire ; désactivation immédiate par l'administrateur ; réaffectation des parcours ; journal |
| R16 | **Qualification AI Act en « haut risque »** si le juriste retient l'annexe III point 3(b). Obligations lourdes à partir du 2 décembre 2027. | Élevée, mais non technique | Note de qualification ; concevoir « comme si » (journal, contrôle humain, audit de biais), ce que ce plan fait déjà |

---

## 8. Vérifications faites et non faites

### Vérifié sur la documentation officielle le 21 novembre 2026

**Supabase** (supabase.com/docs et supabase.com/pricing) :

- régions de l'Union : `eu-west-1` (Irlande), `eu-west-3` (Paris), `eu-central-1` (Francfort), `eu-north-1` (Stockholm) ; le groupe général « Europe » inclut Londres et Zurich ; la base, l'authentification et les fichiers d'un projet sont hébergés dans sa région ; les sauvegardes, les journaux et l'exécution des fonctions peuvent influer sur l'analyse de résidence ; un accord de sous-traitance (DPA) est proposé ;
- fonctions : exécution dans la région la plus proche par défaut, région forcée par l'option `region`, l'en-tête `x-region` ou le paramètre `forceFunctionRegion` ; limites de 150 secondes (gratuit) et 400 secondes (payant) de durée, 2 secondes de calcul, 256 Mo de mémoire ; ports sortants 25 et 587 fermés ;
- authentification : sessions anonymes par `signInAnonymously()`, rôle `authenticated`, revendication `is_anonymous` dans le jeton, limite par défaut de 30 créations par heure et par adresse, CAPTCHA recommandé ; niveaux `aal1` et `aal2`, politique RLS restrictive sur `auth.jwt()->>'aal'` ; second facteur TOTP inclus dans toutes les offres ; serveur d'e-mails intégré limité à 2 messages par heure et aux adresses de l'équipe, SMTP personnalisé requis en production (30 messages par heure par défaut ensuite, réglable) ;
- clés : `sb_publishable_...` et `sb_secret_...` remplacent `anon` et `service_role` ; une clé secrète contourne RLS et est refusée depuis un navigateur ;
- fichiers : envoi repris sur coupure par le protocole TUS, par morceaux de 6 Mo, adresse d'envoi valable 24 heures ; `createSignedUploadUrl` valable 2 heures ; taille maximale de fichier de 50 Mo en offre gratuite ;
- planification : `pg_cron` avec `pg_net` et secrets dans le coffre de la base ;
- prix : offre Pro à partir de 25 $ par mois avec les volumes inclus cités en section 6 ; projet gratuit mis en pause après une semaine ; sauvegardes quotidiennes sur 7 jours et journaux sur 7 jours en offre Pro ; domaine personnalisé à 10 $ par mois ; restauration à un instant donné à 100 $ par mois.

**Anthropic** (platform.claude.com/docs) :

- prix par million de jetons, entrée puis sortie : `claude-opus-5-5` 4 $ et 20 $ ; `claude-sonnet-5-5` 2 $ et 10 $ ; `claude-haiku-5-5` 0,10 $ et 0,50 $ (jusqu'à 100 000 jetons de prompt) ; traitement par lots à moitié prix ;
- résidence : `inference_geo` n'accepte que `global` et `us` ; seule la zone `us` existe pour les espaces de travail ; sur Amazon Bedrock et Google Cloud (géré par Google), la région est fixée par le point d'accès, avec une majoration de 10 % pour les points d'accès régionaux ;
- conservation : contenu des échanges non conservé par défaut hors modèles « couverts » (Fable et Mythos, non utilisés ici) ; pas d'entraînement sans permission expresse ; conservation jusqu'à 2 ans d'un contenu signalé par les systèmes de sécurité ; « zéro conservation » sur demande au service commercial ; traitement par lots conservé 29 jours ; schéma de sortie structurée mis en cache jusqu'à 24 heures ;
- comportement des modèles (référence d'API fournie avec l'outil de développement, datée du 3 novembre 2026) : réflexion adaptative activée par défaut et comptée dans `max_tokens` ; paramètres d'échantillonnage non par défaut refusés sur `claude-sonnet-5-5` et `claude-haiku-5-5` ; appel d'outil forcé refusé sur `claude-sonnet-5-5` ; `stop_reason: "refusal"` possible ; sortie structurée par `output_config.format`.

### Non vérifié, à confirmer avant de s'y fier

- le contenu exact de l'accord de sous-traitance d'Anthropic, son mode de conclusion, la certification du prestataire au cadre de protection des données entre l'Union et les États-Unis, la liste de ses sous-traitants ;
- la disponibilité de `claude-sonnet-5-5` et `claude-haiku-5-5` dans les régions européennes d'Amazon Bedrock, et leurs prix ;
- les offres, prix et accords de sous-traitance de Mistral, Scaleway, OVHcloud, Clever Cloud, Brevo et des outils de supervision cités ; la capacité de chaque hébergeur statique à poser tous les en-têtes de 5 (lot 11) ;
- l'offre Supabase requise pour signer l'accord de sous-traitance ; la liste de ses sous-traitants ; le statut juridique exact de la société ; la disponibilité en offre Pro de la vérification des mots de passe compromis et des durées de session ; le décompte des sessions anonymes dans les utilisateurs actifs ; le fait qu'une suppression SQL dans les tables internes du stockage laisse le fichier en place (comportement connu, non relu ce jour) ;
- la possibilité, pour une fonction Supabase, d'importer directement un module situé dans `src/` (d'où la recommandation d'une copie contrôlée par un test) ;
- l'effet de `Cross-Origin-Embedder-Policy` sur la lecture des vidéos signées, et le gain réel du calcul sur plusieurs fils pour Whisper ;
- le temps de transcription réel de Whisper sur téléphone (jamais essayé, d'après le README) ;
- les références juridiques : elles sont reprises de `docs/conformite.md`, qui indique lui-même ce qui a été vérifié à la source ; elles n'ont pas été revérifiées ici ;
- les estimations de jetons par appel : ce sont des approximations, à remplacer par les valeurs de `llm_usage` après une semaine de recette.
