/* Lance le proxy en local, sans wrangler, avec Node 20 ou plus (développement et essais seulement).
   LLM_API_KEY=... ALLOWED_ORIGINS=http://localhost:5173 node serveur/llm-proxy/local.mjs
   Toutes les variables du Worker (voir README.md) se passent par l'environnement. Port : PORT (8787 par défaut).
   Puis : VITE_LLM_ENDPOINT=http://localhost:8787/ npm run dev */
import { createServer } from "http";
import { handle } from "./worker.js";

const PORT = Number(process.env.PORT || 8787);
createServer(async (req, res) => {
  const chunks = [];
  for await (const c of req) chunks.push(c);
  const headers = new Headers();
  for (const [k, v] of Object.entries(req.headers)) if (typeof v === "string") headers.set(k, v);
  if (!headers.has("CF-Connecting-IP")) headers.set("CF-Connecting-IP", req.socket.remoteAddress || "local");
  const body = ["GET", "HEAD"].includes(req.method) ? undefined : Buffer.concat(chunks);
  const out = await handle(new Request(`http://localhost:${PORT}${req.url}`, { method: req.method, headers, body }), process.env);
  res.writeHead(out.status, Object.fromEntries(out.headers));
  res.end(Buffer.from(await out.arrayBuffer()));
}).listen(PORT, () => console.info(`proxy IA local : http://localhost:${PORT}/ (fournisseur ${process.env.LLM_PROVIDER || "anthropic"})`));
