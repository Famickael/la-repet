/* Étapes 1 et 2 de l'essai : pour chaque transcription, lance l'analyse locale du site (src/lib/analysis.js) et
   construit la requête exacte que le site envoie au modèle (src/lib/llm.js, feedbackRequest).
   Usage : node docs/essai-analyse/scripts/preparer.mjs */
import { readFileSync, writeFileSync, readdirSync } from "fs";
import { localAnalysis } from "../../../src/lib/analysis.js";
import { feedbackRequest } from "../../../src/lib/llm.js";
import { cleanRepetitions } from "../../../src/lib/repetitions.js";

const dir = new URL("..", import.meta.url).pathname;
for (const f of readdirSync(`${dir}transcriptions`).filter(x => x.endsWith(".json")).sort()) {
  const c = JSON.parse(readFileSync(`${dir}transcriptions/${f}`, "utf8"));
  const local = localAnalysis({ segments: c.segments, duration: c.duration, gaze: c.gaze || undefined });
  writeFileSync(`${dir}analyse-locale/${f}`, JSON.stringify(local, null, 2) + "\n");
  const req = feedbackRequest({ poste: c.poste, question: c.question, segments: cleanRepetitions(c.segments).segments, metrics: local.metrics, dimensions: local.dimensions });
  writeFileSync(`${dir}requetes/${f}`, JSON.stringify(req, null, 2) + "\n");
  writeFileSync(`${dir}requetes/${f.replace(".json", ".message.txt")}`, req.messages[1].content + "\n");
  console.log(`\n== ${c.cas} ==\n${local.synthese}`);
  for (const d of local.dimensions) console.log(`  [${d.type}] ${d.id} (${d.t}) ${d.observation}\n      ${d.conseil}`);
}
