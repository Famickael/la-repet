/* Étape 4 de l'essai : fait passer chaque réponse du modèle par le même chemin que le navigateur
   (parseFeedback, reconcile, isCompliant dans src/lib/analysis.js ; filtre de src/lib/compliance.js),
   et écrit le résultat : verdict du filtre texte par texte, puis l'analyse telle que le site l'affiche.
   Usage : node docs/essai-analyse/scripts/filtrer.mjs */
import { readFileSync, writeFileSync, readdirSync, existsSync } from "fs";
import { localAnalysis, reconcile, isCompliant, parseFeedback, textCompliant } from "../../../src/lib/analysis.js";
import { FEEDBACK_LIMITS } from "../../../src/lib/llm.js";

const dir = new URL("..", import.meta.url).pathname;
function pass(c, raw) {
  const local = localAnalysis({ segments: c.segments, duration: c.duration, gaze: c.gaze || undefined });
  const brut = parseFeedback(raw);
  const textes = [["synthese", brut.synthese, FEEDBACK_LIMITS.synthese], ...brut.dimensions.flatMap(d => [[`${d.id}.titre`, d.titre, 80], [`${d.id}.observation`, d.observation, FEEDBACK_LIMITS.observation], [`${d.id}.conseil`, d.conseil, FEEDBACK_LIMITS.conseil]])];
  const verdicts = textes.map(([champ, texte, max]) => ({ champ, accepte: textCompliant(texte, "strict"), caracteres: String(texte).length, limiteDemandee: max, dansLaLimite: String(texte).length <= max }));
  const r = reconcile(brut, local);
  const conforme = !!r && isCompliant(r);
  const { ecartes, ...analyse } = r || {};
  return {
    cas: c.cas, avertissement: c.avertissement,
    filtre: { textesVerifies: verdicts.length, textesRefuses: verdicts.filter(v => !v.accepte).map(v => v.champ), textesRemplacesParLeTexteLocal: ecartes ?? null, analyseFinaleConforme: conforme, horsLimiteDeLongueur: verdicts.filter(v => !v.dansLaLimite).map(v => v.champ) },
    verdicts,
    analyseAffichee: conforme ? { ...analyse, metrics: local.metrics, source: "llm" } : { ...local, source: "local" },
  };
}
for (const f of readdirSync(`${dir}transcriptions`).filter(x => x.endsWith(".json")).sort()) {
  const c = JSON.parse(readFileSync(`${dir}transcriptions/${f}`, "utf8"));
  const out = pass(c, readFileSync(`${dir}reponses-modele/${f}`, "utf8"));
  writeFileSync(`${dir}resultat-filtre/${f}`, JSON.stringify(out, null, 2) + "\n");
  console.log(c.cas, JSON.stringify(out.filtre));
}
/* Essai du filtre : une réponse écrite exprès pour enfreindre les consignes (ce n'est pas une réponse du modèle). */
const bad = `${dir}essai-du-filtre/reponse-non-conforme.json`;
if (existsSync(bad)) {
  const c = JSON.parse(readFileSync(`${dir}transcriptions/2-preparateur-commandes.json`, "utf8"));
  const out = pass(c, readFileSync(bad, "utf8"));
  writeFileSync(`${dir}essai-du-filtre/resultat.json`, JSON.stringify(out, null, 2) + "\n");
  console.log("essai du filtre", JSON.stringify(out.filtre));
}
