/* Comparaison de deux entretiens d'entraînement (« Comparer mes entraînements »).
   Entrée : deux entretiens gardés sur l'appareil, avec leur analyse. Sortie : des faits côte à côte (compareRows)
   et la liste « Ce qui a changé » (whatChanged), calculée ici à partir des écarts entre indicateurs et repères.

   Règles (AGENTS.md, section 2 ; docs/design-system.md, 5.10 « Comparaison d'entretiens ») :
   - uniquement les indicateurs factuels déjà calculés par analysis.js : durée, rythme de parole, pauses, petits mots
     répétés, exemples concrets, construction, regard ;
   - aucune note, aucun score, aucun pourcentage, aucune jauge, aucune courbe, aucun « mieux » ni « moins bien » :
     on écrit « plus court », « plus long », « au lieu de », « vous avez ajouté », et la personne conclut avec son coach ;
   - chaque phrase passe par le filtre (changeCompliant, src/lib/compliance.js) : une phrase refusée n'est pas affichée ;
   - tout est calculé sur l'appareil. Si le relais IA est branché et que la personne a accepté l'analyse de l'assistant,
     les phrases (du texte, jamais la vidéo ni la voix) peuvent être reformulées (rewriteChanges), avec repli local. */
import { computeMetrics, countConcrete } from "./analysis.js";
import { changeCompliant } from "./compliance.js";
import { duration as durFr } from "./format.js";
import { llmEnabled, llmComplete, compareMessages, LLM_TIMEOUT_MS } from "./llm.js";
import { QUESTIONS } from "./questions.js";
import { noFeedback } from "./takes.js";
import { typoFr } from "./text.js";

const NB = "\u00A0"; // espace insécable entre un nombre et son mot
const pl = (n, one, many = `${one}s`) => `${n}${NB}${n > 1 ? many : one}`;
const norm = s => String(s || "").toLowerCase().normalize("NFC").replace(/[\s\u00A0\u202F]+/g, " ").replace(/[’‘]/g, "'").trim();

/* Un entretien se compare s'il a une analyse de l'assistant (la personne peut l'avoir refusée). */
export const comparable = t => !!t && !noFeedback(t) && Array.isArray(t.analysis?.dimensions) && t.analysis.dimensions.length > 0;

/* Type de question : le thème de la banque de questions (« Présentation de soi », « Motivation »…), quel que soit le
   poste inséré dans la phrase. Une question écrite par la personne n'a pas de thème : seule la même question compte. */
const THEME_RE = QUESTIONS.map(q => [new RegExp("^" + norm(q.text).replace(/[.*+?^${}()|[\]\\]/g, "\\$&").replace(/(?:de |d')?\\\{poste\\\}/g, ".*?").replace(/ +/g, " *") + "$"), q.theme]);
export function questionTheme(question) {
  const n = norm(question);
  return THEME_RE.find(([re]) => re.test(n))?.[1] || null;
}
export const sameQuestion = (a, b) => norm(a?.question) === norm(b?.question);
export const sameKind = (a, b) => sameQuestion(a, b) || (!!questionTheme(a?.question) && questionTheme(a?.question) === questionTheme(b?.question));

/* L'entretien à comparer avec celui-ci : le précédent sur la même question, sinon le précédent sur le même type de
   question, sinon le suivant (même ordre de préférence). null s'il n'y en a pas. */
export function counterpartOf(take, takes) {
  if (!comparable(take)) return null;
  const others = (takes || []).filter(t => t.id !== take.id && t.code === take.code && comparable(t));
  const before = others.filter(t => t.createdAt < take.createdAt).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  const after = others.filter(t => t.createdAt >= take.createdAt).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  for (const list of [before, after]) {
    const hit = list.find(t => sameQuestion(t, take)) || list.find(t => sameKind(t, take));
    if (hit) return hit;
  }
  return null;
}

/* Range deux entretiens du plus ancien (avant) au plus récent (après). */
export const ordered = (a, b) => (String(a.createdAt) <= String(b.createdAt) ? [a, b] : [b, a]);

/* Mesures d'un entretien : celles gardées avec l'analyse, sinon recalculées à partir du texte horodaté. */
export const metricsOf = t => t.analysis?.metrics || computeMetrics(t.segments || [], t.duration || 0);

/* Regard : une tranche en mots, jamais un pourcentage (rien qui ressemble à une note sur l'écran de comparaison). */
function gazeFact(g) {
  if (!g || !(g.samples > 10)) return null;
  if (g.absentRatio > 0.8) return { k: "absent", text: "visage non repéré par la caméra" };
  const toward = Math.max(0, 1 - (g.downRatio || 0) - (g.sideRatio || 0) - (g.absentRatio || 0));
  if (toward >= 0.75) return { k: 3, text: "vers l'écran la plus grande partie du temps" };
  if (toward >= 0.6) return { k: 2, text: "vers l'écran plus de la moitié du temps" };
  if (toward >= 0.4) return { k: 1, text: "vers l'écran environ la moitié du temps" };
  return { k: 0, text: "vers l'écran moins de la moitié du temps" };
}

/* Citation courte, coupée à la fin d'un mot. */
const quote = (s, n = 70) => {
  const t = String(s || "").trim().replace(/[.!?…,;:]+$/, "");
  const cutAt = t.length > n ? t.slice(0, n).replace(/\s+\S*$/, "").replace(/[,;:]+$/, "") + "…" : t;
  return `«\u202F${cutAt}\u202F»`;
};

/* Faits d'un entretien, un par indicateur : { id, label, value (texte affiché), n (valeur comparée) }. */
export function facts(t) {
  const m = metricsOf(t);
  const segs = t.segments || [];
  const nEx = segs.length ? countConcrete(segs) : m.concreteAt != null ? 1 : 0;
  const top = Object.entries(m.fillers || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f, n]) => `«\u202F${f}\u202F»${NB}(${n})`).join(", ");
  const first = (segs[0]?.text || "").trim().split(/\s+/).slice(0, 8).join(" ");
  const g = gazeFact(t.gaze);
  const nP = (m.pauses || []).length;
  return [
    { id: "duree", label: "Durée", n: Math.round(t.duration || m.duration || 0), value: durFr(t.duration || m.duration || 0) },
    { id: "debit", label: "Rythme de parole", n: m.wpm ?? null, value: m.wpm ? `environ ${m.wpm}${NB}mots par minute` : "non calculé" },
    { id: "pauses", label: "Pauses", n: nP, value: nP ? `${pl(nP, "pause")} de plus de 2${NB}secondes` : "aucune pause de plus de 2\u00A0secondes" },
    { id: "petits-mots", label: "Petits mots répétés", n: m.fillerTotal || 0, value: m.fillerTotal ? `${m.fillerTotal}${NB}: ${top}` : "aucun repéré" },
    { id: "exemples", label: "Exemples concrets", n: nEx, ex: m.concreteText || null, value: nEx ? `${pl(nEx, "passage")} ${nEx > 1 ? "repérés" : "repéré"}` : "aucun repéré" },
    { id: "debut", label: "Construction : début", n: norm(first), value: first ? quote(first, 60) : "non repéré" },
    { id: "developpement", label: "Construction : développement", n: m.avgSentence || 0, s: m.sentences || 0, value: `${pl(m.sentences || 0, "phrase")}, ${m.avgSentence || 0}${NB}mots en moyenne par phrase` },
    { id: "conclusion", label: "Construction : conclusion", n: m.hasClosing ? 1 : 0, value: m.hasClosing ? "phrase de conclusion repérée" : "pas de phrase de conclusion repérée" },
    { id: "regard", label: "Regard", n: g ? g.k : null, value: g ? g.text : "non mesuré (voix seule ou caméra coupée)" },
  ];
}

/* Lignes du tableau : un indicateur, sa valeur avant, sa valeur après. Le regard n'apparaît que s'il a été mesuré
   dans au moins un des deux entretiens. */
export function compareRows(before, after) {
  const a = facts(before), b = facts(after);
  return a.map((x, i) => ({ id: x.id, label: x.label, before: x.value, after: b[i].value }))
    .filter(r => r.id !== "regard" || a.find(x => x.id === "regard").n != null || b.find(x => x.id === "regard").n != null);
}

/* « Ce qui a changé » : phrases descriptives, de l'entretien le plus ancien (before) au plus récent (after).
   Renvoie { changes: [{ id, text }], same: [libellés inchangés] }. Seuils : un écart trop petit pour être entendu
   (moins de 5 secondes, moins de 10 mots par minute, moins de 5 mots par phrase) n'est pas présenté comme un changement. */
export function whatChanged(before, after) {
  const A = Object.fromEntries(facts(before).map(f => [f.id, f])), B = Object.fromEntries(facts(after).map(f => [f.id, f]));
  const out = [], same = [];
  const add = (id, text) => out.push({ id, text });
  const keep = id => same.push(A[id].label.replace(/^Construction[\s\u00A0]: /, "").toLowerCase());

  // Exemples concrets
  if (!A.exemples.n && B.exemples.n) {
    /* La citation vient de ce que la personne a dit : si elle contient un mot que le filtre refuse, la phrase est gardée sans elle. */
    const base = `Vous avez ajouté ${B.exemples.n > 1 ? `${B.exemples.n}${NB}passages avec un exemple concret` : "un exemple concret"}`;
    const cited = B.exemples.ex ? typoFr(`${base}${NB}: ${quote(B.exemples.ex)}.`) : "";
    add("exemples", cited && changeCompliant(cited) ? cited : `${base}.`);
  }
  else if (A.exemples.n && !B.exemples.n) add("exemples", `Aucun exemple concret n'est repéré dans cet entretien. ${A.exemples.n > 1 ? `${A.exemples.n}${NB}passages l'étaient` : "Un passage l'était"} dans l'entretien précédent.`);
  else if (A.exemples.n !== B.exemples.n) add("exemples", `Vous citez ${pl(B.exemples.n, "passage")} avec un exemple concret, au lieu de ${A.exemples.n}.`);
  else keep("exemples");

  // Conclusion
  if (!A.conclusion.n && B.conclusion.n) add("conclusion", "Vous terminez maintenant par une phrase de conclusion.");
  else if (A.conclusion.n && !B.conclusion.n) add("conclusion", "Aucune phrase de conclusion n'est repérée dans cet entretien. Une l'était dans l'entretien précédent.");
  else keep("conclusion");

  // Petits mots répétés
  if (A["petits-mots"].n !== B["petits-mots"].n) {
    const n = B["petits-mots"].n, o = A["petits-mots"].n;
    add("petits-mots", n ? `Vous avez dit ${pl(n, "petit mot répété", "petits mots répétés")}, au lieu de ${o || "aucun"}.` : `Aucun petit mot répété n'est repéré dans cet entretien, au lieu de ${o}.`);
  } else keep("petits-mots");

  // Pauses
  if (A.pauses.n !== B.pauses.n) {
    const n = B.pauses.n, o = A.pauses.n;
    add("pauses", n ? `Vous avez fait ${pl(n, "pause")} de plus de 2${NB}secondes, au lieu de ${o || "aucune"}.` : `Vous n'avez fait aucune pause de plus de 2${NB}secondes, au lieu de ${o}.`);
  } else keep("pauses");

  // Rythme de parole
  if (A.debit.n && B.debit.n && Math.abs(A.debit.n - B.debit.n) >= 10) add("debit", `Votre rythme de parole est plus ${B.debit.n > A.debit.n ? "rapide" : "lent"}${NB}: environ ${B.debit.n}${NB}mots par minute, au lieu de ${A.debit.n}.`);
  else if (A.debit.n && B.debit.n) keep("debit");

  // Durée
  if (Math.abs(A.duree.n - B.duree.n) >= 5) add("duree", `Votre entretien est plus ${B.duree.n > A.duree.n ? "long" : "court"}${NB}: ${B.duree.value}, au lieu de ${A.duree.value}.`);
  else keep("duree");

  // Phrases
  if (A.developpement.n && B.developpement.n && Math.abs(A.developpement.n - B.developpement.n) >= 5) add("developpement", `Vos phrases sont plus ${B.developpement.n > A.developpement.n ? "longues" : "courtes"}${NB}: ${B.developpement.n}${NB}mots en moyenne, au lieu de ${A.developpement.n}.`);

  // Regard (seulement s'il a été mesuré les deux fois)
  if (A.regard.n != null && B.regard.n != null) {
    if (A.regard.n !== B.regard.n) add("regard", `Regard${NB}: ${B.regard.value}. Dans l'entretien précédent${NB}: ${A.regard.value}.`);
    else keep("regard");
  }

  // Repères passés d'un groupe à l'autre (points d'appui, pistes à explorer)
  const typeOf = t => Object.fromEntries((t.analysis?.dimensions || []).map(d => [d.id, d]));
  const da = typeOf(before), db = typeOf(after);
  const moved = type => Object.keys(db).filter(id => da[id] && da[id].type !== db[id].type && db[id].type === type).map(id => `«\u202F${db[id].titre}\u202F»`);
  const toAppui = moved("appui"), toExplorer = moved("explorer");
  const list = l => (l.length > 1 ? `${l.slice(0, -1).join(", ")} et ${l[l.length - 1]}` : l[0]);
  if (toAppui.length) add("reperes-appui", `${list(toAppui)} ${toAppui.length > 1 ? "figurent" : "figure"} maintenant parmi vos points d'appui.`);
  if (toExplorer.length) add("reperes-explorer", `${list(toExplorer)} ${toExplorer.length > 1 ? "figurent" : "figure"} maintenant parmi vos pistes à explorer.`);

  return { changes: out.map(c => ({ ...c, text: typoFr(c.text) })).filter(c => changeCompliant(c.text)), same };
}

/* Version adressée au coach : mêmes faits, à la troisième personne (« La personne a ajouté… »). */
const COACH = [
  [/^Vous avez /, "La personne a "], [/^Vous n'avez /, "La personne n'a "], [/^Vous citez /, "La personne cite "], [/^Vous terminez /, "La personne termine "],
  [/^Votre /, "Son "], [/^Vos phrases /, "Ses phrases "], [/vos points d'appui/, "ses points d'appui"], [/vos pistes à explorer/, "ses pistes à explorer"],
];
export const forCoach = text => COACH.reduce((t, [re, to]) => t.replace(re, to), text);

/* ─── Reformulation par l'assistant IA (facultative) ───
   Le relais reçoit seulement du texte : la question, le poste et les phrases calculées ici. Chaque phrase rendue est
   rapprochée de la phrase locale de même identifiant : elle n'est gardée que si elle passe le filtre et si elle
   contient exactement les mêmes nombres (aucun chiffre inventé ni modifié). Sinon la phrase locale reste. */
const numbers = s => (String(s).match(/\d+/g) || []).sort().join(",");
export function reconcileChanges(parsed, local) {
  const list = Array.isArray(parsed?.changements) ? parsed.changements : null;
  if (!list) return null;
  const byId = Object.fromEntries(list.filter(x => x && typeof x === "object").map(x => [String(x.id || ""), x]));
  let kept = 0;
  const changes = local.map(c => {
    const t = typoFr(String(byId[c.id]?.texte ?? "").replace(/\u2014/g, ",").replace(/\s+/g, " ").trim());
    if (t && t.length <= 260 && changeCompliant(t) && numbers(t) === numbers(c.text)) { kept++; return { ...c, text: t }; }
    return c;
  });
  return kept ? { changes, kept } : null;
}

const memo = new Map(); // une seule demande par paire d'entretiens et par page
export async function rewriteChanges({ before, after, poste, changes }) {
  if (!llmEnabled() || !changes.length) return null;
  const key = `${before.id}|${after.id}`;
  if (memo.has(key)) return memo.get(key);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), LLM_TIMEOUT_MS.compare);
  const job = (async () => {
    try {
      const text = await llmComplete("compare", { messages: compareMessages({ poste, questionBefore: before.question, questionAfter: after.question, changes }) }, { signal: ctrl.signal });
      const r = reconcileChanges(JSON.parse(String(text).replace(/```json|```/g, "").trim()), changes);
      return r ? r.changes : null;
    } catch (e) {
      console.warn("[comparaison] reformulation indisponible ou non conforme, phrases locales utilisées", e);
      return null;
    } finally { clearTimeout(timer); }
  })();
  memo.set(key, job);
  return job;
}
