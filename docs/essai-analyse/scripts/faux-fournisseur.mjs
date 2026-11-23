/* Faux service du fournisseur pour l'essai, sans clé d'API (port 5514 par défaut).
   - POST /v1/messages : reçoit ce que le proxy (serveur/llm-proxy/local.mjs) envoie au fournisseur, retrouve le cas
     d'après la question, et renvoie la réponse gardée dans reponses-modele/ (écrite par un Claude jouant le rôle du
     modèle), au format de l'API Messages. Avec ESSAI_TRACE=1, garde la requête reçue dans requetes/recue-<cas>.json.
   - POST /stt : faux service de mise par écrit, renvoie les segments du cas ESSAI_STT (2-preparateur-commandes par défaut).
   Usage : node docs/essai-analyse/scripts/faux-fournisseur.mjs */
import { createServer } from "http";
import { readFileSync, writeFileSync, readdirSync } from "fs";

const dir = new URL("..", import.meta.url).pathname;
const cases = readdirSync(`${dir}transcriptions`).filter(f => f.endsWith(".json")).map(f => ({ f, ...JSON.parse(readFileSync(`${dir}transcriptions/${f}`, "utf8")) }));
const send = (res, status, body) => { res.writeHead(status, { "content-type": "application/json", "access-control-allow-origin": "*", "access-control-allow-headers": "*" }); res.end(JSON.stringify(body)); };

createServer(async (req, res) => {
  if (req.method === "OPTIONS") return send(res, 200, {});
  const chunks = []; for await (const c of req) chunks.push(c);
  if (req.url.startsWith("/stt")) {
    const c = cases.find(x => x.cas === (process.env.ESSAI_STT || "2-preparateur-commandes"));
    console.log("mise par écrit simulée :", c.cas);
    return send(res, 200, { text: c.segments.map(s => s.text.trim()).join(" "), duration: c.duration, segments: c.segments });
  }
  if (req.url.startsWith("/v1/messages")) {
    const body = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    const user = String(body.messages?.[0]?.content || "");
    const c = cases.find(x => user.includes(`<question>${x.question}</question>`));
    if (!c) { console.log("requête sans cas connu"); return send(res, 400, { error: { message: "cas inconnu" } }); }
    console.log(`analyse demandée : ${c.cas} (modèle ${body.model}, clé ${req.headers["x-api-key"] ? "présente" : "absente"}, version ${req.headers["anthropic-version"]})`);
    if (process.env.ESSAI_TRACE) writeFileSync(`${dir}requetes/recue-par-le-fournisseur-${c.cas}.json`, JSON.stringify(body, null, 2) + "\n");
    return send(res, 200, { type: "message", role: "assistant", model: body.model, stop_reason: "end_turn", content: [{ type: "text", text: readFileSync(`${dir}reponses-modele/${c.f}`, "utf8") }] });
  }
  send(res, 404, { error: { message: "inconnu" } });
}).listen(Number(process.env.PORT || 5514), () => console.log("faux fournisseur : http://localhost:" + (process.env.PORT || 5514)));
