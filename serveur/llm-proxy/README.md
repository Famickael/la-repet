# Proxy IA de La Répét'

Petit service sans état qui garde la clé du fournisseur de modèle de langage et relaie les demandes du site. Sans lui, le site fonctionne entièrement avec ses moteurs locaux (retour, assistant, aide au coach) ; avec lui, ces textes sont rédigés par un modèle de langage, puis vérifiés dans le navigateur.

- **Cible :** Cloudflare Workers (plan gratuit : 100 000 requêtes par jour).
- **Fournisseur actuel :** Anthropic (modèles Claude), choisi par la variable `LLM_PROVIDER`. Un second fournisseur au format compatible OpenAI (Mistral par défaut) a son emplacement prêt.
- **Le site ne nomme pas le fournisseur.** Le nom n'apparaît que dans ce dépôt (et, si le DPO le décide, dans la notice d'information : champ `llmProvider` de `src/content/organisme.js`).

| Fichier | Rôle |
|---|---|
| `worker.js` | le proxy (aucune dépendance) |
| `wrangler.toml` | configuration d'exemple, sans identifiant ni secret |
| `local.mjs` | lancement en local avec Node, sans wrangler (essais) |
| `../../tests/proxy.test.mjs` | test avec un fetch simulé, sans réseau ni clé : `node tests/proxy.test.mjs` |

---

## 1. Contrat avec le site

Le site (`src/lib/assistant.js`, `src/lib/analysis.js`, `src/lib/coachAssistant.js`) envoie à `VITE_LLM_ENDPOINT` une requête au format « chat completions » et lit `choices[0].message.content`. Le proxy respecte exactement ce contrat.

**Requête reçue** (`POST`, `Content-Type: application/json`) :

```json
{
  "model": "mistral-small-latest",
  "messages": [
    { "role": "system", "content": "Tu es l'assistant de « La Répét' »…" },
    { "role": "assistant", "content": "Bonjour…" },
    { "role": "user", "content": "Comment me présenter ?" }
  ],
  "max_tokens": 400,
  "response_format": { "type": "json_object" }
}
```

- `model` et `max_tokens` envoyés par le navigateur sont **ignorés** : le modèle et le plafond de jetons sont choisis côté serveur, par tâche.
- `temperature`, `top_p`, `top_k` sont **ignorés** et jamais transmis.
- Un champ facultatif `task` (`"chat"`, `"feedback"` ou `"coach"`) force la tâche. Sans lui, la tâche est déduite :

| Tâche | Reconnue à | Appelée par | Modèle par défaut | Jetons en sortie |
|---|---|---|---|---|
| `feedback` | `response_format` JSON | `analyze()` (`analysis.js`), une fois par réponse enregistrée | `claude-sonnet-5-5` (`LLM_MODEL_FEEDBACK`) | 4096, sortie structurée (schéma `synthese` + `dimensions`) |
| `coach` | prompt système qui commence par « Tu aides un coach » | `coachSuggest()` (`coachAssistant.js`) | `claude-sonnet-5-5` (`LLM_MODEL_COACH`) | 2048 |
| `chat` | tout le reste | `askAssistant()` (`assistant.js`) | `claude-haiku-5-5` (`LLM_MODEL_CHAT`) | 1024 |

Si le texte du prompt change dans `src/`, la détection peut se tromper : seul le modèle utilisé change, la réponse reste au bon format. Pour une détection sûre, ajouter `task` dans les trois appels du site (voir `docs/etat-fonctionnel.md`, « Corrections à faire »).

**Réponse renvoyée** (200) :

```json
{ "object": "chat.completion", "model": "claude-haiku-5-5",
  "choices": [{ "index": 0, "message": { "role": "assistant", "content": "…" }, "finish_reason": "stop" }] }
```

**Requête d'analyse (`feedback`).** Depuis le 22 novembre 2026, `feedbackRequest` (`src/lib/llm.js`) envoie deux messages : le prompt système (`FEEDBACK_SYSTEM_PROMPT` : ton, structure « points d'appui puis pistes », longueurs, interdits) et un message de données balisées (`<poste>`, `<question>`, `<transcription>` horodatée, `<mesures>`, `<reperes>`), avec `task: "feedback"` et `response_format: json_object`. Le proxy n'a pas changé : le prompt système part dans le champ `system`. Un exemple complet, côté site et côté fournisseur, est gardé dans `docs/essai-analyse/requetes/`.

Toute autre issue renvoie un code d'erreur (`403`, `413`, `429`, `502`, `504`…) avec `{ "error": { "message": "…" } }`. Le site traite tout code autre que 2xx comme une panne et **retombe sur son moteur local** : la personne a toujours une réponse.

**Ce que fait la traduction vers Anthropic** (API Messages, `POST /v1/messages`) :

- en-têtes `x-api-key` (le secret) et `anthropic-version: 2026-10-21` ;
- messages `system` regroupés dans le champ `system` ; message d'accueil de l'assistant retiré en tête (l'API exige que la conversation commence par la personne) ; dernier message toujours celui de la personne ;
- `output_config.effort` (`LLM_EFFORT`, `low` par défaut) ; pour `feedback`, `output_config.format` avec un schéma JSON ;
- aucun paramètre d'échantillonnage (`temperature` est refusé par ces modèles) ;
- lecture des blocs `text` uniquement (un bloc de réflexion peut précéder le texte) ; `stop_reason` `refusal` ou `max_tokens` renvoient une erreur, donc le repli local.

**Filtrage.** Le proxy ne juge pas le contenu. La vérification de conformité (aucune note, aucun score, aucune inférence d'émotion) reste dans le navigateur, `src/lib/compliance.js` : toute sortie refusée est remplacée par le texte du moteur local (pour l'analyse d'un entretien : champ par champ).

**Données.** Le proxy ne garde rien. Il journalise une ligne par appel, **sans contenu** : tâche, modèle, issue (`ok`, `erreur`, `rejet`, `reseau`) et code HTTP. Les journaux de Cloudflare (`npx wrangler tail`) ne montrent donc ni prompt ni réponse.

---

## 2. Déploiement en 5 commandes

Prérequis : un compte Cloudflare (gratuit), Node 20 ou plus, une clé d'API du fournisseur (console Anthropic : créer une clé dans un espace de travail dédié, et y régler un **plafond de dépense mensuel**).

Avant la première commande, ouvrir `wrangler.toml` et vérifier `ALLOWED_ORIGINS` (l'adresse du site, sans chemin : `https://famickael.github.io` pour GitHub Pages, ou le domaine définitif).

```bash
cd serveur/llm-proxy
npx wrangler@4 login                    # ouvre le navigateur pour se connecter à Cloudflare
npx wrangler@4 deploy                   # publie le Worker, affiche son adresse https://la-repet-llm-proxy.<compte>.workers.dev
npx wrangler@4 secret put LLM_API_KEY   # colle la clé quand elle est demandée (elle n'est jamais écrite sur disque)
curl -i -X OPTIONS https://la-repet-llm-proxy.<compte>.workers.dev/ -H "Origin: https://famickael.github.io"   # attendu : 204 et Access-Control-Allow-Origin
```

Essai complet (consomme quelques jetons) :

```bash
curl -s https://la-repet-llm-proxy.<compte>.workers.dev/ -H "Origin: https://famickael.github.io" \
  -H "Content-Type: application/json" -d '{"messages":[{"role":"user","content":"Comment me présenter en entretien ?"}]}'
```

Suivre les appels en direct (sans contenu) : `npx wrangler@4 tail`.

### Essai en local, sans compte Cloudflare

```bash
LLM_API_KEY=... ALLOWED_ORIGINS=http://localhost:5173 node serveur/llm-proxy/local.mjs   # http://localhost:8787/
VITE_LLM_ENDPOINT=http://localhost:8787/ npm run dev
```

`ANTHROPIC_BASE_URL` permet de viser un faux service pour les essais sans clé (c'est ce qu'a fait l'état des lieux, voir `docs/etat-fonctionnel.md`).

---

## 3. Changer la clé (rotation)

1. Créer une nouvelle clé dans la console du fournisseur.
2. `npx wrangler@4 secret put LLM_API_KEY` (dans `serveur/llm-proxy`) et coller la nouvelle clé : elle remplace l'ancienne immédiatement, sans redéploiement.
3. Vérifier avec le `curl` d'essai ci-dessus.
4. Révoquer l'ancienne clé dans la console du fournisseur.

En cas de fuite supposée : révoquer d'abord (le site retombe sur ses moteurs locaux pendant la coupure), puis poser la nouvelle clé.

---

## 4. Changer de modèle ou de fournisseur

**Modèle :** modifier `LLM_MODEL_CHAT`, `LLM_MODEL_FEEDBACK` ou `LLM_MODEL_COACH` dans `wrangler.toml`, puis `npx wrangler@4 deploy`. Exemple : si des mesures sur des réponses réelles montrent que `claude-haiku-5-5` tient aussi bien la reformulation du retour, `LLM_MODEL_FEEDBACK = "claude-haiku-5-5"` divise le coût par vingt. Aucun changement du site.

**Fournisseur compatible OpenAI (Mistral, Scaleway, OVHcloud…) :**

```toml
LLM_PROVIDER = "openai"
OPENAI_BASE_URL = "https://api.mistral.ai/v1"
LLM_MODEL_CHAT = "mistral-small-latest"
LLM_MODEL_FEEDBACK = "mistral-medium-latest"
LLM_MODEL_COACH = "mistral-medium-latest"
```

puis `npx wrangler@4 secret put LLM_API_KEY` (clé du nouveau fournisseur) et `npx wrangler@4 deploy`. La requête envoyée est `POST {OPENAI_BASE_URL}/chat/completions` avec `Authorization: Bearer`, `response_format: json_object` pour le retour. Cet adaptateur n'est testé qu'avec un fetch simulé : le valider avec une vraie clé avant usage, et vérifier les noms de modèles chez le fournisseur.

**Autre fournisseur :** ajouter une entrée à l'objet `PROVIDERS` de `worker.js`, avec trois fonctions : `model(env, task)`, `build(params, env)` qui renvoie `{ url, init }`, et `parse(data)` qui renvoie le texte ou lève une erreur. Ajouter un cas dans `tests/proxy.test.mjs`.

Le changement de fournisseur est aussi une décision RGPD (lieu de traitement, sous-traitant) : voir `docs/plan-production.md`, section 1.6.

---

## 5. Brancher le site

L'adresse du proxy est lue **au moment de la construction** du site (`import.meta.env.VITE_LLM_ENDPOINT`) : il faut reconstruire le site après l'avoir définie. `vite.config.js` ajoute automatiquement l'origine du proxy à la politique de sécurité du contenu (`connect-src`), et `src/content/legal.js` passe les textes d'information en variante « texte envoyé à un service d'IA ».

**En local :** `VITE_LLM_ENDPOINT=https://la-repet-llm-proxy.<compte>.workers.dev/ npm run build`.

**Sur GitHub Pages (proposition, le workflow n'est pas modifié) :** créer une variable de dépôt (Settings, Secrets and variables, Actions, onglet Variables) nommée `VITE_LLM_ENDPOINT`, ou `gh variable set VITE_LLM_ENDPOINT --body "https://la-repet-llm-proxy.<compte>.workers.dev/"`, puis, dans `.github/workflows/pages.yml`, passer la variable à l'étape de construction :

```yaml
      - run: npm run build
        env:
          VITE_LLM_ENDPOINT: ${{ vars.VITE_LLM_ENDPOINT }}
```

Une variable vide laisse le site en mode entièrement local. Ce n'est pas un secret : l'adresse est visible dans le code du site, ce qui est normal (la clé, elle, reste dans le Worker).

`VITE_LLM_MODEL` n'a plus d'effet avec ce proxy (le modèle est choisi côté serveur).

---

## 6. Sécurité et coûts

| Protection | Réglage | Défaut |
|---|---|---|
| Origines autorisées (CORS) | `ALLOWED_ORIGINS` | GitHub Pages et localhost. Liste vide : tout est refusé |
| Taille maximale de la requête | `MAX_BODY_BYTES` | 65 536 octets (le site coupe la transcription à 8 000 caractères : une requête de retour pèse au plus environ 15 000 octets) |
| Nombre de messages transmis | `MAX_MESSAGES` | 20 |
| Plafond de jetons en sortie | `MAX_OUTPUT_TOKENS` (et `MAX_TOKENS_CHAT`, `_COACH`, `_FEEDBACK`) | 4096 (1024, 2048, 4096) |
| Délai du fournisseur | `TIMEOUT_MS_CHAT`, `TIMEOUT_MS_COACH`, `TIMEOUT_MS_FEEDBACK` (plafond `UPSTREAM_TIMEOUT_MS`) | 18 000, 18 000, 28 000 ms (28 000). Le navigateur abandonne 2 s plus tard (20, 20 et 30 s, `src/lib/llm.js`) : le proxy répond toujours avant lui |
| Débit par adresse IP | `RATE_LIMIT_PER_IP_PER_MINUTE`, `RATE_LIMIT_PER_IP_PER_DAY` | 10 par minute, 200 par jour |
| Débit global | `RATE_LIMIT_GLOBAL_PER_DAY` | 1 000 par jour |

**Limites de la protection par origine.** Le CORS empêche un autre site d'utiliser le proxy depuis le navigateur de ses visiteurs. Il n'empêche pas un script hors navigateur d'imiter l'en-tête `Origin`. Le vrai plafond de coût est donc la limitation de débit, plus le plafond de dépense mensuel réglé chez le fournisseur. Sur GitHub Pages, l'origine `https://famickael.github.io` est partagée par tous les sites de ce compte.

**Coût maximal théorique.** Un appel `feedback` coûte au plus environ 0,05 $ (4 096 jetons en sortie à 10 $ le million, plus l'entrée), un appel `chat` moins de 0,001 $. Avec 1 000 appels par jour, tous au plus cher, le plafond est d'environ 50 $ par jour ; l'usage réel attendu est de l'ordre du centime par réponse enregistrée (`docs/plan-production.md`, section 6). Régler en plus un plafond mensuel dans la console du fournisseur.

### Compteurs de débit : mémoire ou KV

| Option | Réglage | Avantages | Limites |
|---|---|---|---|
| Mémoire (défaut) | `RATE_LIMIT_STORE = "memory"` | gratuit, sans configuration, aucune écriture | chaque instance du Worker et chaque centre de données Cloudflare a ses propres compteurs, remis à zéro quand l'instance s'arrête : c'est un frein contre les abus simples, pas une garantie. Le plafond global est approximatif |
| Workers KV | `RATE_LIMIT_STORE = "kv"` et liaison `RATE_KV` (voir `wrangler.toml`) | compteurs partagés par toutes les instances | cohérence différée (jusqu'à 60 s entre centres de données) et lecture puis écriture non atomiques : deux requêtes simultanées peuvent passer. Trois écritures par requête : le plan gratuit (1 000 écritures par jour) ne couvre qu'environ 330 requêtes par jour, au-delà les écritures échouent. À réserver au plan payant |
| Rate Limiting de Cloudflare (complément) | liaison `RATE_LIMITER` (voir `wrangler.toml`) | gratuit, géré par Cloudflare ; remplace le compteur par minute et par adresse IP | compté par centre de données, périodes de 10 ou 60 s seulement |
| Durable Objects (non implémenté) | | compteur exact et atomique | plus de code ; à envisager si le plafond global doit être strict |

L'adresse IP n'est jamais gardée en clair : les compteurs utilisent une empreinte SHA-256 tronquée.

---

## Annexe : porter le proxy vers une autre plateforme

`worker.js` n'utilise que l'API Web standard (`Request`, `Response`, `fetch`, `crypto.subtle`). La fonction `handle(request, env)` se réutilise telle quelle ; seule l'enveloppe change.

**Fonction Supabase (Deno) :** `supabase/functions/llm/index.ts`

```ts
import { handle } from "./worker.js"; // copie de serveur/llm-proxy/worker.js
Deno.serve(req => handle(req, Deno.env.toObject()));
```

Secrets : `supabase secrets set LLM_API_KEY=... ALLOWED_ORIGINS=...`. Déployer sans vérification de jeton si le site n'a pas de session Supabase (`supabase functions deploy llm --no-verify-jwt`). Le compteur en mémoire vit le temps d'une instance : prévoir une table de compteurs pour une limite fiable.

**Fonction Netlify :** `netlify/functions/llm.mjs`

```js
import { handle } from "../../serveur/llm-proxy/worker.js";
export default req => handle(req, process.env);
export const config = { path: "/api/llm" };
```

Variables dans l'interface Netlify (Site configuration, Environment variables). Même remarque sur le compteur en mémoire.

**Serveur Node classique (hébergeur français par exemple) :** `local.mjs` est déjà une enveloppe Node ; le placer derrière un proxy HTTPS (Caddy, Nginx) et un gestionnaire de processus.
