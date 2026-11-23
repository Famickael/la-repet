/* Proxy IA sans état de La Répét' (Cloudflare Worker).

   Rôle : recevoir du navigateur une requête au format « chat completions » (celle qu'envoient
   src/lib/analysis.js, src/lib/assistant.js et src/lib/coachAssistant.js vers VITE_LLM_ENDPOINT),
   l'envoyer au fournisseur choisi par LLM_PROVIDER avec la clé gardée en secret (LLM_API_KEY),
   et renvoyer le texte au même format : { choices: [{ message: { content } }] }.

   Ce que le proxy ne fait pas : il ne garde aucune donnée (ni prompt, ni réponse, ni journal de contenu),
   et il ne filtre pas le contenu. La vérification de conformité (aucune note, aucune inférence émotionnelle)
   reste dans le navigateur (src/lib/compliance.js), qui retombe sur le moteur local si la sortie est refusée.

   Variables (wrangler.toml, section [vars]) et secret (wrangler secret put LLM_API_KEY) : voir README.md. */

/* ─── Réglages par défaut (chaque valeur se remplace par une variable du même nom) ─── */
const DEFAULTS = {
  LLM_PROVIDER: "anthropic",
  LLM_MODEL_CHAT: "claude-haiku-5-5",      // assistant de la personne accompagnée
  LLM_MODEL_FEEDBACK: "claude-sonnet-5-5", // reformulation du retour après une réponse
  LLM_MODEL_COACH: "claude-sonnet-5-5",    // aide à la rédaction du rapport du coach
  LLM_EFFORT: "low",                       // profondeur de réflexion du modèle (Anthropic : low, medium, high…)
  MAX_TOKENS_CHAT: 1024,
  MAX_TOKENS_COACH: 2048,
  MAX_TOKENS_FEEDBACK: 4096,
  MAX_OUTPUT_TOKENS: 4096,                 // plafond absolu de jetons en sortie, quelle que soit la tâche
  MAX_BODY_BYTES: 65536,                   // taille maximale de la requête du navigateur
  MAX_MESSAGES: 20,                        // nombre maximal de messages transmis
  /* Délais d'attente du fournisseur, par tâche : 2 s de moins que le navigateur (src/lib/llm.js, LLM_TIMEOUT_MS :
     20 s, 20 s, 30 s), pour que le proxy réponde toujours avant que le navigateur abandonne. */
  TIMEOUT_MS_CHAT: 18000,
  TIMEOUT_MS_COACH: 18000,
  TIMEOUT_MS_FEEDBACK: 28000,
  UPSTREAM_TIMEOUT_MS: 28000,              // plafond absolu, quelle que soit la tâche
  RATE_LIMIT_PER_IP_PER_MINUTE: 10,
  RATE_LIMIT_PER_IP_PER_DAY: 200,
  RATE_LIMIT_GLOBAL_PER_DAY: 1000,
  RATE_LIMIT_STORE: "memory",              // "memory" (défaut) ou "kv" (liaison RATE_KV)
  FEEDBACK_SCHEMA: "on",                   // sortie structurée pour le retour (Anthropic) ; "off" pour la désactiver
  ANTHROPIC_BASE_URL: "https://api.anthropic.com",
  ANTHROPIC_VERSION: "2026-10-21",
  OPENAI_BASE_URL: "https://api.mistral.ai/v1", // fournisseur compatible OpenAI (Mistral par défaut)
};

const cfg = (env, k) => (env && env[k] !== undefined && env[k] !== "" ? env[k] : DEFAULTS[k]);
const num = (env, k) => { const n = Number(cfg(env, k)); return Number.isFinite(n) && n >= 0 ? n : Number(DEFAULTS[k]); };

export const upstreamTimeout = (env, task) =>
  Math.min(num(env, task === "feedback" ? "TIMEOUT_MS_FEEDBACK" : task === "coach" ? "TIMEOUT_MS_COACH" : "TIMEOUT_MS_CHAT"), num(env, "UPSTREAM_TIMEOUT_MS"));

/* Schéma du retour attendu par src/lib/analysis.js (reconcile) : synthèse et dimensions. */
const FEEDBACK_JSON_SCHEMA = {
  type: "object",
  properties: {
    synthese: { type: "string" },
    dimensions: {
      type: "array",
      items: {
        type: "object",
        properties: {
          id: { type: "string" },
          titre: { type: "string" },
          type: { type: "string", enum: ["appui", "explorer"] },
          observation: { type: "string" },
          conseil: { type: "string" },
          t: { type: "number" },
        },
        required: ["id", "titre", "type", "observation", "conseil", "t"],
        additionalProperties: false,
      },
    },
  },
  required: ["synthese", "dimensions"],
  additionalProperties: false,
};

/* ─── Réponses ─── */
function corsHeaders(origin) {
  return origin ? { "Access-Control-Allow-Origin": origin, Vary: "Origin" } : { Vary: "Origin" };
}
function json(body, status, origin, extra = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store", ...corsHeaders(origin), ...extra },
  });
}
const fail = (status, message, origin, extra) => json({ error: { message } }, status, origin, extra);

function allowedOrigins(env) {
  return String(cfg(env, "ALLOWED_ORIGINS") || "").split(",").map(s => s.trim().replace(/\/+$/, "")).filter(Boolean);
}

/* ─── Limitation de débit ───
   Trois compteurs : par adresse IP et par minute, par adresse IP et par jour, global par jour.
   L'adresse IP n'est jamais gardée en clair : seule une empreinte SHA-256 tronquée sert de clé.

   - "memory" : compteurs dans la mémoire de l'instance du Worker. Gratuit et sans configuration, mais chaque
     instance (et chaque centre de données Cloudflare) a ses propres compteurs, remis à zéro au redémarrage :
     c'est un frein, pas une garantie. Le plafond global par jour est donc approximatif.
   - "kv" : compteurs dans Workers KV (liaison RATE_KV). Partagés entre instances, mais KV est « à cohérence
     différée » (jusqu'à 60 s entre centres de données) et deux requêtes simultanées peuvent lire la même valeur.
     Chaque requête fait jusqu'à trois écritures : le plan gratuit (1 000 écritures par jour) ne suffit
     qu'à environ 330 requêtes par jour. À réserver au plan payant.
   - En plus, si une liaison Rate Limiting RATE_LIMITER est déclarée, elle remplace le compteur par minute
     (gratuite, gérée par Cloudflare, comptée par centre de données). */
const memory = new Map(); // clé -> { count, resetAt }
export function _resetMemory() { memory.clear(); } // pour les tests

async function hashIp(ip) {
  const data = new TextEncoder().encode(`la-repet:${ip}`);
  const buf = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(buf)].slice(0, 8).map(b => b.toString(16).padStart(2, "0")).join("");
}

async function bump(env, key, ttlSeconds, now) {
  if (cfg(env, "RATE_LIMIT_STORE") === "kv" && env.RATE_KV) {
    const current = Number(await env.RATE_KV.get(key)) || 0;
    await env.RATE_KV.put(key, String(current + 1), { expirationTtl: Math.max(60, ttlSeconds) });
    return current + 1;
  }
  if (memory.size > 10000) for (const [k, v] of memory) if (v.resetAt <= now) memory.delete(k);
  const e = memory.get(key);
  if (!e || e.resetAt <= now) { memory.set(key, { count: 1, resetAt: now + ttlSeconds * 1000 }); return 1; }
  e.count += 1;
  return e.count;
}

async function rateLimit(env, ip, now = Date.now()) {
  const id = await hashIp(ip || "inconnue");
  const minute = Math.floor(now / 60000), day = Math.floor(now / 86400000);
  const untilMinute = 60 - Math.floor((now % 60000) / 1000);
  const untilDay = 86400 - Math.floor((now % 86400000) / 1000);

  if (env.RATE_LIMITER && typeof env.RATE_LIMITER.limit === "function") {
    const { success } = await env.RATE_LIMITER.limit({ key: id });
    if (!success) return { limited: "ip-minute", retryAfter: untilMinute };
  } else if (await bump(env, `m:${id}:${minute}`, 120, now) > num(env, "RATE_LIMIT_PER_IP_PER_MINUTE")) {
    return { limited: "ip-minute", retryAfter: untilMinute };
  }
  if (await bump(env, `d:${id}:${day}`, 2 * 86400, now) > num(env, "RATE_LIMIT_PER_IP_PER_DAY")) return { limited: "ip-day", retryAfter: untilDay };
  if (await bump(env, `g:${day}`, 2 * 86400, now) > num(env, "RATE_LIMIT_GLOBAL_PER_DAY")) return { limited: "global-day", retryAfter: untilDay };
  return { limited: null };
}

/* ─── Lecture de la requête du navigateur ─── */
const text = c => (typeof c === "string" ? c : Array.isArray(c) ? c.map(p => (typeof p === "string" ? p : p?.text || "")).join("") : "");

/* Tâche : champ « task » explicite s'il est fourni, sinon déduite de la requête.
   - feedback : response_format JSON (src/lib/analysis.js) ;
   - coach : prompt système qui commence par « Tu aides un coach » (src/lib/coachAssistant.js) ;
   - compare : seulement par le champ « task » (src/lib/compare.js, reformulation de « Ce qui a changé ») ; mêmes modèle,
     plafond et délai que « chat » ;
   - chat : tout le reste (src/lib/assistant.js). Une erreur de détection ne change que le modèle utilisé. */
export function detectTask(body) {
  if (["chat", "feedback", "coach", "compare"].includes(body.task)) return body.task;
  if (body.response_format && /json/.test(String(body.response_format.type || ""))) return "feedback";
  const sys = (body.messages || []).filter(m => m?.role === "system").map(m => text(m.content)).join("\n");
  if (/^\s*Tu aides un coach/i.test(sys)) return "coach";
  return "chat";
}

/* Normalise la conversation : prompt système à part, rôles user/assistant uniquement, premier et dernier
   messages côté personne (l'assistant commence par un message d'accueil, que l'API refuse en tête). */
export function normalize(body, maxMessages) {
  const all = Array.isArray(body.messages) ? body.messages : [];
  const system = all.filter(m => m?.role === "system").map(m => text(m.content)).filter(Boolean).join("\n\n");
  let msgs = all
    .filter(m => m && (m.role === "user" || m.role === "assistant"))
    .map(m => ({ role: m.role, content: text(m.content) }))
    .filter(m => m.content.trim());
  msgs = msgs.slice(-maxMessages);
  while (msgs.length && msgs[0].role !== "user") msgs.shift();
  while (msgs.length && msgs[msgs.length - 1].role !== "user") msgs.pop();
  const merged = [];
  for (const m of msgs) {
    const last = merged[merged.length - 1];
    if (last && last.role === m.role) last.content += `\n\n${m.content}`;
    else merged.push({ ...m });
  }
  return { system, messages: merged };
}

/* ─── Fournisseurs ───
   Chaque fournisseur expose build(params, env) -> { url, init } et parse(data) -> texte (ou lève une erreur).
   params : { model, system, messages, maxTokens, task }. Aucun paramètre d'échantillonnage (temperature, top_p)
   n'est transmis : les modèles Claude récents les refusent. */
export const PROVIDERS = {
  anthropic: {
    model: (env, task) => cfg(env, task === "feedback" ? "LLM_MODEL_FEEDBACK" : task === "coach" ? "LLM_MODEL_COACH" : "LLM_MODEL_CHAT"),
    build({ model, system, messages, maxTokens, task }, env) {
      const output_config = { effort: cfg(env, "LLM_EFFORT") };
      if (task === "feedback" && cfg(env, "FEEDBACK_SCHEMA") !== "off") output_config.format = { type: "json_schema", schema: FEEDBACK_JSON_SCHEMA };
      const payload = { model, max_tokens: maxTokens, messages, output_config };
      if (system) payload.system = system;
      return {
        url: `${String(cfg(env, "ANTHROPIC_BASE_URL")).replace(/\/+$/, "")}/v1/messages`,
        init: {
          method: "POST",
          headers: { "content-type": "application/json", "x-api-key": env.LLM_API_KEY, "anthropic-version": cfg(env, "ANTHROPIC_VERSION") },
          body: JSON.stringify(payload),
        },
      };
    },
    parse(data) {
      if (data?.stop_reason === "refusal") throw new UpstreamError("refus du modèle");
      if (data?.stop_reason === "max_tokens") throw new UpstreamError("réponse tronquée (max_tokens)");
      // Les blocs se lisent par leur type : un bloc de réflexion peut précéder le texte.
      const out = (data?.content || []).filter(b => b?.type === "text").map(b => b.text).join("").trim();
      if (!out) throw new UpstreamError("réponse vide");
      return out;
    },
  },

  /* Emplacement du second fournisseur, au format compatible OpenAI (Mistral, Scaleway, OVHcloud, etc.).
     Activer avec LLM_PROVIDER=openai, OPENAI_BASE_URL (par défaut https://api.mistral.ai/v1) et des noms de
     modèles propres au fournisseur dans LLM_MODEL_CHAT, LLM_MODEL_FEEDBACK, LLM_MODEL_COACH.
     Testé seulement avec un fetch simulé : à valider avec une vraie clé avant usage. */
  openai: {
    model: (env, task) => {
      const k = task === "feedback" ? "LLM_MODEL_FEEDBACK" : task === "coach" ? "LLM_MODEL_COACH" : "LLM_MODEL_CHAT";
      const v = env?.[k];
      return v && !/^claude-/.test(v) ? v : "mistral-small-latest";
    },
    build({ model, system, messages, maxTokens, task }, env) {
      const payload = { model, max_tokens: maxTokens, messages: [...(system ? [{ role: "system", content: system }] : []), ...messages] };
      if (task === "feedback") payload.response_format = { type: "json_object" };
      return {
        url: `${String(cfg(env, "OPENAI_BASE_URL")).replace(/\/+$/, "")}/chat/completions`,
        init: { method: "POST", headers: { "content-type": "application/json", authorization: `Bearer ${env.LLM_API_KEY}` }, body: JSON.stringify(payload) },
      };
    },
    parse(data) {
      const choice = data?.choices?.[0];
      if (choice?.finish_reason === "length") throw new UpstreamError("réponse tronquée (length)");
      const out = text(choice?.message?.content).trim();
      if (!out) throw new UpstreamError("réponse vide");
      return out;
    },
  },
};

class UpstreamError extends Error {}

/* ─── Point d'entrée ─── */
export async function handle(request, env = {}) {
  const origin = (request.headers.get("Origin") || "").replace(/\/+$/, "");
  const allowed = origin && allowedOrigins(env).includes(origin);

  if (request.method === "OPTIONS") {
    if (!allowed) return new Response(null, { status: 403, headers: { Vary: "Origin" } });
    return new Response(null, {
      status: 204,
      headers: { ...corsHeaders(origin), "Access-Control-Allow-Methods": "POST, OPTIONS", "Access-Control-Allow-Headers": "Content-Type", "Access-Control-Max-Age": "86400" },
    });
  }
  /* Sans origine autorisée, aucune réponse CORS : un autre site ne peut pas lire la réponse.
     Un client hors navigateur peut imiter l'en-tête Origin : la limitation de débit reste le vrai plafond de coût. */
  if (!allowed) return fail(403, "Origine non autorisée", null);
  if (request.method !== "POST") return fail(405, "Méthode non autorisée", origin, { Allow: "POST, OPTIONS" });

  const provider = PROVIDERS[cfg(env, "LLM_PROVIDER")];
  if (!provider) return fail(500, "Fournisseur inconnu (LLM_PROVIDER)", origin);
  if (!env.LLM_API_KEY) return fail(500, "Clé d'API absente (secret LLM_API_KEY)", origin);

  const maxBody = num(env, "MAX_BODY_BYTES");
  if (Number(request.headers.get("Content-Length") || 0) > maxBody) return fail(413, "Requête trop volumineuse", origin);
  const raw = await request.text();
  if (new TextEncoder().encode(raw).length > maxBody) return fail(413, "Requête trop volumineuse", origin);
  let body;
  try { body = JSON.parse(raw); } catch { return fail(400, "JSON invalide", origin); }
  if (!body || typeof body !== "object") return fail(400, "JSON invalide", origin);

  const task = detectTask(body);
  const { system, messages } = normalize(body, num(env, "MAX_MESSAGES"));
  if (!messages.length) return fail(400, "Aucun message de la personne", origin);

  const limit = await rateLimit(env, request.headers.get("CF-Connecting-IP") || "");
  if (limit.limited) return fail(429, "Trop de demandes, réessayez plus tard", origin, { "Retry-After": String(limit.retryAfter) });

  const taskMax = num(env, task === "feedback" ? "MAX_TOKENS_FEEDBACK" : task === "coach" ? "MAX_TOKENS_COACH" : "MAX_TOKENS_CHAT");
  const maxTokens = Math.max(1, Math.min(taskMax, num(env, "MAX_OUTPUT_TOKENS")));
  const model = provider.model(env, task);
  const { url, init } = provider.build({ model, system, messages, maxTokens, task }, env);

  let res;
  try {
    res = await fetch(url, { ...init, signal: AbortSignal.timeout(upstreamTimeout(env, task)) });
  } catch (e) {
    console.log(JSON.stringify({ task, model, outcome: "reseau", detail: String(e?.name || e) }));
    return fail(504, "Fournisseur injoignable", origin);
  }
  if (!res.ok) {
    // Ni le corps de la réponse ni la requête ne sont renvoyés ou journalisés : seul le code.
    console.log(JSON.stringify({ task, model, outcome: "erreur", status: res.status }));
    return fail(502, `Erreur du fournisseur (${res.status})`, origin);
  }
  let content;
  try {
    content = provider.parse(await res.json());
  } catch (e) {
    console.log(JSON.stringify({ task, model, outcome: "rejet", detail: e instanceof UpstreamError ? e.message : "réponse illisible" }));
    return fail(502, "Réponse du fournisseur inutilisable", origin);
  }
  console.log(JSON.stringify({ task, model, outcome: "ok" })); // journal sans contenu
  return json({
    object: "chat.completion",
    model,
    choices: [{ index: 0, message: { role: "assistant", content }, finish_reason: "stop" }],
  }, 200, origin);
}

export default { fetch: (request, env) => handle(request, env) };
