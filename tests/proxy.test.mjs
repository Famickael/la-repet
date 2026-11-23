/* Test du proxy IA (serveur/llm-proxy/worker.js), sans réseau ni vraie clé : node tests/proxy.test.mjs
   fetch est remplacé par un faux fournisseur qui enregistre la requête reçue et renvoie une réponse type. */
import assert from "assert/strict";
import worker, { _resetMemory, detectTask, normalize, upstreamTimeout } from "../serveur/llm-proxy/worker.js";
import { LLM_TIMEOUT_MS, FEEDBACK_SYSTEM_PROMPT, feedbackRequest } from "../src/lib/llm.js";

const ORIGIN = "https://famickael.github.io";
const ENV = { ALLOWED_ORIGINS: `${ORIGIN}, http://localhost:5173`, LLM_API_KEY: "cle-de-test", LLM_PROVIDER: "anthropic" };

let calls = [];
let reply = () => ({ status: 200, body: { type: "message", role: "assistant", stop_reason: "end_turn", content: [{ type: "thinking", thinking: "" }, { type: "text", text: "Réponse de test." }] } });
globalThis.fetch = async (url, init) => {
  calls.push({ url: String(url), init, body: JSON.parse(init.body) });
  const r = reply();
  return new Response(JSON.stringify(r.body), { status: r.status, headers: { "content-type": "application/json" } });
};
console.log = () => {}; // journal du Worker masqué pendant le test

const req = (body, { origin = ORIGIN, method = "POST", ip = "203.0.113.7", headers = {} } = {}) =>
  new Request("https://proxy.exemple.workers.dev/", {
    method,
    headers: { "Content-Type": "application/json", ...(origin ? { Origin: origin } : {}), "CF-Connecting-IP": ip, ...headers },
    body: method === "POST" ? (typeof body === "string" ? body : JSON.stringify(body)) : undefined,
  });

/* Requêtes identiques à celles du site (src/lib/assistant.js, analysis.js, coachAssistant.js) */
const CHAT = {
  model: "mistral-small-latest",
  messages: [
    { role: "system", content: "Tu es l'assistant de « La Répét' »… Contexte de l'écran : échauffement. Métier visé : agent d'accueil." },
    { role: "assistant", content: "Bonjour, je peux vous aider à préparer votre entretien." },
    { role: "user", content: "Comment me présenter ?" },
  ],
  max_tokens: 400,
  temperature: 0.3,
};
/* Requête d'analyse telle que la construit src/lib/llm.js (feedbackRequest) : prompt système, puis données balisées. */
const FEEDBACK = feedbackRequest({ poste: "agent d'accueil", question: "Parlez-moi de vous.", segments: [{ start: 0, end: 5, text: "Bonjour, je m'appelle Alex." }], metrics: { wordCount: 5 }, dimensions: [] });
const COACH = { model: "mistral-small-latest", messages: [{ role: "system", content: "Tu aides un coach en insertion professionnelle à rédiger le rapport…" }, { role: "user", content: "Propose des idées de mot d'introduction." }], max_tokens: 500 };

let n = 0;
const test = async (name, fn) => { _resetMemory(); calls = []; await fn(); n++; process.stdout.write(`ok - ${name}\n`); };

await test("CORS : prévol accepté pour une origine autorisée", async () => {
  const r = await worker.fetch(req(null, { method: "OPTIONS" }), ENV);
  assert.equal(r.status, 204);
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  assert.match(r.headers.get("Access-Control-Allow-Methods"), /POST/);
  assert.match(r.headers.get("Access-Control-Allow-Headers"), /Content-Type/i);
  const ok = await worker.fetch(req(CHAT), ENV);
  assert.equal(ok.status, 200);
  assert.equal(ok.headers.get("Access-Control-Allow-Origin"), ORIGIN);
  assert.equal((await worker.fetch(req(CHAT, { origin: "http://localhost:5173/" }), ENV)).status, 200, "barre finale tolérée");
});

await test("CORS : origine refusée, sans en-tête d'autorisation ni appel au fournisseur", async () => {
  const pre = await worker.fetch(req(null, { method: "OPTIONS", origin: "https://autre-site.exemple" }), ENV);
  assert.equal(pre.status, 403);
  assert.equal(pre.headers.get("Access-Control-Allow-Origin"), null);
  const r = await worker.fetch(req(CHAT, { origin: "https://autre-site.exemple" }), ENV);
  assert.equal(r.status, 403);
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), null);
  assert.equal((await worker.fetch(req(CHAT, { origin: null }), ENV)).status, 403, "sans en-tête Origin");
  assert.equal((await worker.fetch(req(CHAT, { origin: "https://famickael.github.io.pirate.exemple" }), ENV)).status, 403, "préfixe trompeur");
  assert.equal((await worker.fetch(req(CHAT), { ...ENV, ALLOWED_ORIGINS: "" })).status, 403, "liste vide : tout est refusé");
  assert.equal(calls.length, 0);
});

await test("limite de débit par adresse IP et par minute", async () => {
  const env = { ...ENV, RATE_LIMIT_PER_IP_PER_MINUTE: "3" };
  for (let i = 0; i < 3; i++) assert.equal((await worker.fetch(req(CHAT), env)).status, 200);
  const r = await worker.fetch(req(CHAT), env);
  assert.equal(r.status, 429);
  assert.ok(Number(r.headers.get("Retry-After")) > 0);
  assert.equal(r.headers.get("Access-Control-Allow-Origin"), ORIGIN, "le site peut lire le refus");
  assert.equal((await worker.fetch(req(CHAT, { ip: "198.51.100.9" }), env)).status, 200, "une autre adresse n'est pas bloquée");
  assert.equal(calls.length, 4);
});

await test("limite de débit globale par jour", async () => {
  const env = { ...ENV, RATE_LIMIT_GLOBAL_PER_DAY: "2" };
  assert.equal((await worker.fetch(req(CHAT, { ip: "192.0.2.1" }), env)).status, 200);
  assert.equal((await worker.fetch(req(CHAT, { ip: "192.0.2.2" }), env)).status, 200);
  assert.equal((await worker.fetch(req(CHAT, { ip: "192.0.2.3" }), env)).status, 429);
});

await test("limite de débit avec Workers KV (liaison simulée)", async () => {
  const kv = new Map(), puts = [];
  const RATE_KV = { get: async k => kv.get(k) ?? null, put: async (k, v, o) => { kv.set(k, v); puts.push(o); } };
  const env = { ...ENV, RATE_LIMIT_STORE: "kv", RATE_KV, RATE_LIMIT_PER_IP_PER_DAY: "2" };
  assert.equal((await worker.fetch(req(CHAT), env)).status, 200);
  assert.equal((await worker.fetch(req(CHAT), env)).status, 200);
  assert.equal((await worker.fetch(req(CHAT), env)).status, 429);
  assert.ok(puts.every(o => o.expirationTtl >= 60), "durée de vie KV d'au moins 60 s");
  assert.ok([...kv.keys()].every(k => !k.includes("203.0.113.7")), "l'adresse IP n'est pas gardée en clair");
});

await test("forme de la requête envoyée à Anthropic (assistant)", async () => {
  const r = await worker.fetch(req(CHAT), ENV);
  assert.equal(r.status, 200);
  assert.equal(calls.length, 1);
  const { url, init, body } = calls[0];
  assert.equal(url, "https://api.anthropic.com/v1/messages");
  assert.equal(init.method, "POST");
  assert.equal(init.headers["x-api-key"], "cle-de-test");
  assert.equal(init.headers["anthropic-version"], "2026-10-21");
  assert.equal(init.headers["content-type"], "application/json");
  assert.equal(init.headers.authorization, undefined);
  assert.equal(body.model, "claude-haiku-5-5", "modèle de l'assistant, le modèle demandé par le navigateur est ignoré");
  assert.match(body.system, /^Tu es l'assistant/);
  assert.deepEqual(body.messages, [{ role: "user", content: "Comment me présenter ?" }], "système à part, accueil de l'assistant retiré");
  assert.equal(body.max_tokens, 1024);
  assert.deepEqual(body.output_config, { effort: "low" });
});

await test("absence de temperature, top_p et top_k", async () => {
  await worker.fetch(req({ ...CHAT, temperature: 0.2, top_p: 0.9, top_k: 5 }), ENV);
  await worker.fetch(req(FEEDBACK), ENV);
  await worker.fetch(req(COACH), ENV);
  assert.equal(calls.length, 3);
  for (const c of calls) for (const k of ["temperature", "top_p", "top_k"]) assert.ok(!(k in c.body), `${k} transmis`);
});

await test("modèle et réglages selon la tâche (retour, coach)", async () => {
  await worker.fetch(req(FEEDBACK), ENV);
  assert.equal(calls[0].body.model, "claude-sonnet-5-5");
  assert.equal(calls[0].body.max_tokens, 4096);
  assert.equal(calls[0].body.output_config.format.type, "json_schema");
  assert.deepEqual(calls[0].body.output_config.format.schema.required, ["synthese", "dimensions"]);
  /* Contrat de l'analyse : le prompt système du site part dans le champ « system », les données dans le seul message. */
  assert.equal(calls[0].body.system, FEEDBACK_SYSTEM_PROMPT);
  assert.equal(calls[0].body.messages.length, 1);
  assert.equal(calls[0].body.messages[0].role, "user");
  assert.match(calls[0].body.messages[0].content, /^<poste>agent d'accueil<\/poste>\n<question>Parlez-moi de vous\.<\/question>\n<transcription>\n\[0:00\] Bonjour/);
  assert.equal(detectTask({ messages: FEEDBACK.messages, response_format: FEEDBACK.response_format }), "feedback", "tâche reconnue même sans le champ task");
  await worker.fetch(req(COACH), ENV);
  assert.equal(calls[1].body.model, "claude-sonnet-5-5");
  assert.equal(calls[1].body.max_tokens, 2048);
  await worker.fetch(req(FEEDBACK), { ...ENV, LLM_MODEL_FEEDBACK: "claude-haiku-5-5", MAX_OUTPUT_TOKENS: "1500", FEEDBACK_SCHEMA: "off" });
  assert.equal(calls[2].body.model, "claude-haiku-5-5");
  assert.equal(calls[2].body.max_tokens, 1500, "plafond de jetons en sortie");
  assert.equal(calls[2].body.output_config.format, undefined);
  assert.equal(detectTask({ task: "coach", messages: [] }), "coach", "champ task explicite prioritaire");
});

await test("réponse renvoyée au format attendu par le site", async () => {
  const r = await worker.fetch(req(CHAT), ENV);
  const data = await r.json();
  assert.equal(r.headers.get("Content-Type"), "application/json; charset=utf-8");
  // Lecture exacte faite par src/lib/assistant.js, analysis.js et coachAssistant.js
  assert.equal(data.choices?.[0]?.message?.content ?? "", "Réponse de test.", "le bloc de réflexion est ignoré");
  // Retour JSON : la chaîne renvoyée est relue par JSON.parse dans analysis.js
  const fb = { synthese: "Vos points d'appui : exemples concrets.", dimensions: [{ id: "exemples", titre: "Exemples concrets", type: "appui", observation: "…", conseil: "…", t: 3 }] };
  reply = () => ({ status: 200, body: { stop_reason: "end_turn", content: [{ type: "text", text: JSON.stringify(fb) }] } });
  const r2 = await worker.fetch(req(FEEDBACK), ENV);
  assert.deepEqual(JSON.parse((await r2.json()).choices[0].message.content), fb);
});

await test("erreurs du fournisseur : réponse non 2xx pour que le site retombe sur le moteur local", async () => {
  reply = () => ({ status: 200, body: { stop_reason: "refusal", content: [] } });
  assert.equal((await worker.fetch(req(CHAT), ENV)).status, 502);
  reply = () => ({ status: 200, body: { stop_reason: "max_tokens", content: [{ type: "text", text: "tronq" }] } });
  assert.equal((await worker.fetch(req(CHAT), ENV)).status, 502);
  reply = () => ({ status: 401, body: { type: "error", error: { message: "invalid x-api-key cle-de-test" } } });
  const r = await worker.fetch(req(CHAT), ENV);
  assert.equal(r.status, 502);
  assert.ok(!(await r.text()).includes("cle-de-test"), "rien du fournisseur n'est renvoyé");
  reply = () => ({ status: 200, body: { stop_reason: "end_turn", content: [{ type: "text", text: "ok" }] } });
});

await test("taille maximale, JSON invalide, méthode, clé absente", async () => {
  const big = { ...CHAT, messages: [{ role: "user", content: "é".repeat(40000) }] }; // 80 000 octets en UTF-8
  assert.equal((await worker.fetch(req(big), ENV)).status, 413);
  assert.equal((await worker.fetch(req("{pas du json"), ENV)).status, 400);
  assert.equal((await worker.fetch(req({ messages: [{ role: "system", content: "x" }] }), ENV)).status, 400);
  assert.equal((await worker.fetch(req(null, { method: "GET" }), ENV)).status, 405);
  assert.equal((await worker.fetch(req(CHAT), { ...ENV, LLM_API_KEY: "" })).status, 500);
  assert.equal(calls.length, 0);
});

await test("second fournisseur au format compatible OpenAI (emplacement prévu)", async () => {
  reply = () => ({ status: 200, body: { choices: [{ message: { content: "Bonjour." }, finish_reason: "stop" }] } });
  const r = await worker.fetch(req({ ...CHAT, temperature: 0.4 }), { ...ENV, LLM_PROVIDER: "openai" });
  assert.equal((await r.json()).choices[0].message.content, "Bonjour.");
  assert.equal(calls[0].url, "https://api.mistral.ai/v1/chat/completions");
  assert.equal(calls[0].init.headers.authorization, "Bearer cle-de-test");
  assert.equal(calls[0].body.model, "mistral-small-latest");
  assert.equal(calls[0].body.messages[0].role, "system");
  assert.ok(!("temperature" in calls[0].body));
});

await test("normalisation de la conversation", async () => {
  const { system, messages } = normalize({ messages: [
    { role: "system", content: "A" }, { role: "assistant", content: "accueil" }, { role: "user", content: "q1" },
    { role: "user", content: "q1 bis" }, { role: "assistant", content: "r1" }, { role: "user", content: "q2" }, { role: "assistant", content: "brouillon" },
  ] }, 20);
  assert.equal(system, "A");
  assert.deepEqual(messages.map(m => m.role), ["user", "assistant", "user"]);
  assert.equal(messages[0].content, "q1\n\nq1 bis");
});

await test("délais alignés : le proxy coupe avant le navigateur, pour chaque tâche", async () => {
  assert.equal(detectTask({ task: "compare", messages: [] }), "compare", "tâche « compare » (comparaison de deux entretiens) acceptée");
  assert.equal(upstreamTimeout({}, "compare"), upstreamTimeout({}, "chat"), "« compare » suit les réglages de « chat »");
  for (const task of ["chat", "coach", "feedback", "compare"]) {
    const t = upstreamTimeout({}, task);
    assert.ok(t < LLM_TIMEOUT_MS[task], `${task} : proxy ${t} ms, navigateur ${LLM_TIMEOUT_MS[task]} ms`);
    assert.ok(LLM_TIMEOUT_MS[task] - t <= 5000, `${task} : écart raisonnable`);
  }
  assert.equal(upstreamTimeout({ UPSTREAM_TIMEOUT_MS: "5000" }, "feedback"), 5000, "plafond absolu respecté");
});

console.info(`proxy : ${n} tests réussis`);
