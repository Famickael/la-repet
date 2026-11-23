/* Analyse d'un entretien d'entraînement (une question, une réponse enregistrée).
   Entrée : segments horodatés de la transcription [{start, end, text}], durée, poste visé,
   mesures de regard issues de gaze.js (facultatif).
   Sortie : { synthese, dimensions: [{id, titre, type: "appui"|"explorer", observation, conseil, t}], metrics }.

   Règles de conception (AI Act art. 5(1)(f), partis pris pédagogiques) :
   - uniquement des faits observables (rythme de parole, petits mots répétés, pauses, construction, regard) ;
   - aucune note, aucun score, aucune déduction d'émotion ou de trait de personnalité ;
   - points d'appui présentés avant les points à explorer ;
   - repères présentés comme des conventions, avec une formulation positive.

   Un modèle de langage peut rédiger l'analyse à partir de ces mesures (VITE_LLM_ENDPOINT, prompt dans llm.js).
   Sa sortie est rapprochée de l'analyse locale et passe par le même filtre, champ par champ ; en cas d'échec
   ou de rejet, l'analyse locale est utilisée. Le site promet « points d'appui puis pistes » : la synthèse locale
   suit cet ordre et nomme une seule piste pour le prochain essai (PISTE_ORDER). */

/* Garde-fou : src/lib/compliance.js (frontières Unicode, accents, notes, émotions, appréciations). */
import { feedbackCompliant, textCompliant } from "./compliance.js";
import { clock } from "./format.js";
import { llmEnabled, llmComplete, feedbackMessages, LLM_TIMEOUT_MS } from "./llm.js";
import { cleanRepetitions } from "./repetitions.js";
import { typoFr } from "./text.js";

/* Petits mots comptés (ARC-22) : sans « bon » ni « quoi », trop souvent employés au sens plein (« un bon contact »). */
const FILLERS = ["euh", "heu", "hum", "ben", "bah", "en fait", "du coup", "genre", "voilà", "tu vois", "vous voyez"];
/* « voilà pourquoi » conclut, « ce genre de poste » n'est pas un tic : non comptés. */
const FILLER_RE = Object.fromEntries(FILLERS.map(f => [f, f === "voilà" ? "\\svoilà\\s(?!pourquoi)" : f === "genre" ? "\\sgenre\\s(?!de\\s|d')" : `\\s${f}\\s`]));
const CONCRETE = /\b(\d+|un|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|quinze|vingt|trente)\s+(ans?|années?|mois|semaines?|clients?|personnes?|projets?|équipes?)\b|\bpar exemple\b|\bquand j'(ai|étais)\b|\blors de\b/i; // « chez » seul ne suffit plus (ARC-22)
/* L'âge de la personne (« j'ai 46 ans ») n'est pas un exemple, et n'a pas à être cité dans l'analyse ;
   « j'ai 2 ans d'expérience » reste un élément précis. */
const AGE = /\bj'ai\s+[\p{L}\d-]+\s+ans\b(?!\s+d['’e])/giu;
const isConcrete = text => CONCRETE.test(String(text).replace(AGE, " "));
/* Nombre de passages (segments) qui contiennent un exemple concret : sert à la comparaison de deux entretiens
   (src/lib/compare.js). Les mesures gardées avec l'analyse ne changent pas. */
export const countConcrete = segments => cleanRepetitions(segments || []).segments.filter(s => isConcrete(s.text)).length;
const CLOSING = /\b(c'est pour(quoi| ça)|en résumé|pour conclure|voilà pourquoi|c'est la raison|donc je)\b/i;

/* Ordre de priorité des pistes dans la synthèse : le fond avant la forme. */
const PISTE_ORDER = ["captation", "transcription", "exemples", "duree", "structure", "petits-mots", "debit", "pauses", "repetitions", "regard"];

const fmt = clock; // horloge « m:ss » unique (src/lib/format.js)

function words(text) {
  return (text.toLowerCase().match(/[a-zàâäçéèêëîïôöûùüÿœ'’-]+/gi) || []);
}

/* Les boucles de répétition de la transcription (même suite de mots plus de 2 fois de suite) sont retirées avant
   tout calcul (src/lib/repetitions.js) : elles gonfleraient le rythme et créeraient de faux « mots qui reviennent ». */
export function computeMetrics(rawSegments, duration) {
  const { segments, removedWords, loops, partial } = cleanRepetitions(rawSegments);
  const text = segments.map(s => s.text).join(" ").replace(/\s+/g, " ").trim();
  const w = words(text);
  const speakingTime = segments.reduce((a, s) => a + Math.max(0, (s.end ?? s.start) - s.start), 0) || duration;
  /* Un segment raccourci par le retrait d'une boucle garde son temps : le rythme n'est alors pas calculé. */
  const wpm = speakingTime > 5 && !partial ? Math.round((w.length / speakingTime) * 60) : null;

  // petits mots répétés, avec le premier horodatage d'apparition
  const lower = " " + text.toLowerCase().replace(/[.,;!?]/g, " ") + " ";
  const fillers = {};
  for (const f of FILLERS) {
    const n = (lower.match(new RegExp(FILLER_RE[f], "g")) || []).length;
    if (n) fillers[f] = n;
  }
  const fillerTotal = Object.values(fillers).reduce((a, b) => a + b, 0);
  const firstFillerSeg = segments.find(s => FILLERS.some(f => new RegExp(FILLER_RE[f]).test(" " + s.text.toLowerCase().replace(/[.,;!?]/g, " ") + " ")));

  // pauses : silences de plus de 2 s entre segments
  const pauses = [];
  for (let i = 1; i < segments.length; i++) {
    const gap = segments[i].start - (segments[i - 1].end ?? segments[i - 1].start);
    if (gap >= 2) pauses.push({ t: segments[i - 1].end ?? segments[i - 1].start, d: Math.round(gap * 10) / 10 });
  }

  // phrases
  const sentences = text.replace(/([.!?])\s+/g, "$1\n").split("\n").filter(x => words(x).length > 0);
  const avgSentence = sentences.length ? Math.round(w.length / sentences.length) : w.length;

  // répétitions de mots pleins (>= 5 lettres, >= 4 occurrences)
  const freq = {};
  w.filter(x => x.length >= 5).forEach(x => { freq[x] = (freq[x] || 0) + 1; });
  const repeated = Object.entries(freq).filter(([, n]) => n >= 4).sort((a, b) => b[1] - a[1]).slice(0, 3);

  const concreteSeg = segments.find(s => isConcrete(s.text));
  const lastSeg = segments[segments.length - 1];
  const hasClosing = segments.slice(-2).some(s => CLOSING.test(s.text));

  return {
    wordCount: w.length, duration: Math.round(duration), speakingTime: Math.round(speakingTime), wpm,
    fillers, fillerTotal, firstFillerAt: firstFillerSeg?.start ?? null,
    pauses, sentences: sentences.length, avgSentence, repeated,
    concreteAt: concreteSeg ? concreteSeg.start : null, concreteText: concreteSeg?.text?.trim().replace(/[.!?…]+$/, "") || null,
    hasClosing, closingAt: lastSeg ? lastSeg.start : null,
    loops, loopWords: removedWords, // boucles de la transcription retirées, et nombre de mots retirés
  };
}

export function localAnalysis({ segments, duration, gaze }) {
  const m = computeMetrics(segments, duration);
  const dims = [];

  if (m.wordCount < 15) {
    return {
      metrics: m,
      synthese: "Votre entretien est très court, ou le micro vous a peu entendu. Vous pouvez recommencer en vous rapprochant du micro.",
      dimensions: [{ id: "captation", titre: "Son enregistré", type: "explorer", t: 0,
        observation: `${m.wordCount} mots ont été reconnus sur ${fmt(m.duration)}.`,
        conseil: "Vérifiez que le micro est autorisé et parlez à environ 50 cm de l'écran." }],
    };
  }

  // Débit
  if (m.wpm) {
    const inRange = m.wpm >= 110 && m.wpm <= 170;
    dims.push({
      id: "debit", titre: "Rythme de parole", type: inRange ? "appui" : "explorer", t: 0,
      observation: `Environ ${m.wpm} mots par minute sur ${fmt(m.speakingTime)} de parole.`,
      conseil: inRange
        ? "Ce rythme laisse à l'interlocuteur le temps de suivre. Vous pouvez le garder."
        : m.wpm > 170
          ? "En entretien, un rythme autour de 120 à 160 mots par minute est souvent plus facile à suivre. Une respiration entre deux idées suffit souvent."
          : "Le rythme est posé. Si vous le souhaitez, vous pouvez enchaîner un peu plus vite les phrases d'une même idée.",
    });
  }

  // Durée : repère affiché seulement quand l'entretien est très court ou très long (usage : 1 à 2 minutes par question)
  if (m.speakingTime < 30 || m.speakingTime > 180) {
    const court = m.speakingTime < 30;
    dims.push({
      id: "duree", titre: "Durée", type: "explorer", t: court ? m.closingAt ?? 0 : 120,
      observation: `Vous parlez pendant ${fmt(m.speakingTime)}.`,
      conseil: court
        ? "En entretien, une réponse dure souvent entre 1 et 2 minutes. Vous pouvez la développer avec une situation vécue, puis dire ce que vous en retenez pour ce poste."
        : "En entretien, une réponse dure souvent entre 1 et 2 minutes. Vous pouvez garder vos deux idées les plus utiles pour ce poste et laisser le recruteur vous relancer sur le reste.",
    });
  }

  // Pauses
  if (m.pauses.length) {
    const longest = m.pauses.reduce((a, b) => (b.d > a.d ? b : a));
    dims.push({
      id: "pauses", titre: "Pauses", type: m.pauses.length <= 3 ? "appui" : "explorer", t: longest.t,
      observation: `${m.pauses.length} pause${m.pauses.length > 1 ? "s" : ""} de plus de 2 secondes, la plus longue à ${fmt(longest.t)} (${Math.round(longest.d)} s).`,
      conseil: m.pauses.length <= 3
        ? "Quelques pauses donnent du rythme et laissent le temps de réfléchir. Vous pouvez les garder."
        : "Avant de commencer, vous pouvez noter deux ou trois mots-clés pour cette question : ils aident à enchaîner les idées.",
    });
  }

  // Exemples concrets
  if (m.concreteAt != null) {
    dims.push({
      id: "exemples", titre: "Exemples concrets", type: "appui", t: m.concreteAt,
      observation: `Vous citez un élément précis : « ${m.concreteText.slice(0, 90)}${m.concreteText.length > 90 ? "…" : ""} ».`,
      conseil: "Les exemples datés ou chiffrés rendent une réponse plus facile à retenir pour un recruteur.",
    });
  } else {
    dims.push({
      id: "exemples", titre: "Exemples concrets", type: "explorer", t: Math.min(10, m.duration / 2),
      observation: "Aucune situation datée ou chiffrée n'a été repérée dans votre entretien.",
      conseil: "Vous pouvez ajouter une situation vécue : où, quand, ce que vous avez fait, ce que cela a donné.",
    });
  }

  // Petits mots répétés
  /* Discrets : 4 par minute au plus, ou moins de 3 en tout (sur un entretien court, deux petits mots suffiraient
     à dépasser le repère par minute). */
  const perMin = m.speakingTime ? (m.fillerTotal / m.speakingTime) * 60 : 0;
  const discrets = perMin <= 4 || m.fillerTotal < 3;
  if (m.fillerTotal) {
    const top = Object.entries(m.fillers).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([f, n]) => `« ${f} » (${n})`).join(", ");
    dims.push({
      // identifiant « petits-mots » (ancien « appui », encore lu par lib/coachAssistant.js, ARC-19)
      id: "petits-mots", titre: "Petits mots répétés", type: discrets ? "appui" : "explorer", t: m.firstFillerAt ?? 0,
      observation: `${m.fillerTotal} petit${m.fillerTotal > 1 ? "s" : ""} mot${m.fillerTotal > 1 ? "s" : ""} répété${m.fillerTotal > 1 ? "s" : ""} : ${top}.`,
      conseil: discrets
        ? "Leur présence reste discrète et vos phrases restent faciles à suivre."
        : "C'est très courant à l'oral. Au prochain essai, vous pouvez marquer un court silence à la place, surtout en début de phrase.",
    });
  }

  // Structure
  dims.push({
    id: "structure", titre: "Construction de la réponse", type: m.hasClosing && m.avgSentence <= 30 ? "appui" : "explorer", t: m.closingAt ?? 0,
    observation: `${m.sentences} phrase${m.sentences > 1 ? "s" : ""}, ${m.avgSentence} mots en moyenne par phrase${m.hasClosing ? ", avec une phrase de conclusion" : ", sans phrase de conclusion repérée"}.`,
    conseil: m.hasClosing
      ? (m.avgSentence <= 30 ? "La réponse se termine par une idée de synthèse, ce qui facilite la relance du recruteur." : "Des phrases plus courtes rendraient la conclusion encore plus nette.")
      : "Selon le poste, terminer par une phrase de synthèse (« c'est pour cela que ce poste me correspond ») aide à clore la réponse.",
  });

  // Répétitions
  if (m.repeated.length) {
    dims.push({
      id: "repetitions", titre: "Mots qui reviennent", type: "explorer", t: 0,
      observation: `Mots revenus souvent : ${m.repeated.map(([x, n]) => `« ${x} » (${n})`).join(", ")}.`,
      conseil: "Vous pouvez préparer un ou deux autres mots pour varier, si vous le souhaitez.",
    });
  }

  // Regard (faits issus du suivi local du visage, sans interprétation)
  if (gaze && gaze.samples > 10) {
    /* Visage absent la plupart du temps (caméra masquée, mal cadrée) : aucun pourcentage de regard, qui serait
       trompeur (« 0 % vers l'écran »), mais un conseil de cadrage. */
    if (gaze.absentRatio > 0.8) {
      dims.push({
        id: "regard", titre: "Direction du regard", type: "explorer", t: 0,
        observation: "Visage non repéré : la caméra n'a pas vu votre visage pendant la plus grande partie de l'entretien.",
        conseil: "Pour ce repère, placez la caméra à hauteur des yeux, face à vous, avec une lumière devant vous plutôt que derrière.",
      });
    } else {
      const down = Math.round(gaze.downRatio * 100), side = Math.round(gaze.sideRatio * 100), out = Math.round(gaze.absentRatio * 100);
      const toward = Math.max(0, 100 - down - side - out);
      dims.push({
        id: "regard", titre: "Direction du regard", type: toward >= 60 ? "appui" : "explorer", t: gaze.longestAwayAt ?? 0,
        observation: `Regard orienté vers l'écran environ ${toward} % du temps, vers le bas ${down} %, sur le côté ${side} %${out ? `, visage hors champ ${out} %` : ""}.`,
        conseil: toward >= 60
          ? "Le regard est majoritairement tourné vers l'interlocuteur. En visioconférence, regarder la caméra plutôt que l'écran renforce encore ce repère."
          : "Regarder ailleurs pour réfléchir est naturel. Selon le poste visé, vous pouvez choisir de revenir vers la caméra en fin de phrase.",
      });
    }
  }

  // Transcription : passage répété en boucle retiré (le rythme peut alors manquer)
  if (m.loops) {
    dims.push({
      id: "transcription", titre: "Texte de l'entretien", type: "explorer", t: 0,
      observation: m.loopWords
        ? `Une phrase revenait plusieurs fois de suite dans le texte, sans doute une erreur de la mise par écrit : ${m.loopWords} mots répétés ont été retirés avant de préparer ce retour.`
        : "Une syllabe revenait plusieurs fois de suite dans un mot, sans doute une erreur de la mise par écrit : elle a été retirée avant de préparer ce retour.",
      conseil: "Si le texte ne correspond pas à ce que vous avez dit, vous pouvez recommencer, plus près du micro et dans un endroit sans bruit.",
    });
  }

  dims.sort((a, b) => (a.type === b.type ? a.t - b.t : a.type === "appui" ? -1 : 1));
  /* Synthèse : les points d'appui d'abord, puis une seule piste pour le prochain essai (la plus utile selon
     PISTE_ORDER), les autres restant à explorer. */
  const low = d => d.titre.toLowerCase();
  const appuis = dims.filter(d => d.type === "appui").map(low);
  const pistes = dims.filter(d => d.type === "explorer").sort((x, y) => PISTE_ORDER.indexOf(x.id) - PISTE_ORDER.indexOf(y.id));
  const suite = pistes.length
    ? `Une piste pour votre prochain essai : ${low(pistes[0])}.${pistes.length > 1 ? " Les autres pistes sont à explorer si vous le souhaitez." : ""}`
    : "Vous pouvez garder cette façon de faire pour votre prochain essai.";
  const synthese = appuis.length
    ? `Vos points d'appui : ${appuis.join(", ")}. ${suite}`
    : `Les repères ci-dessous analysent votre entretien, sans le noter. ${suite}`;

  return { metrics: m, synthese, dimensions: dims };
}

/* Vérifie qu'un retour (local ou modèle de langage) ne contient ni note ni inférence émotionnelle. */
export const isCompliant = feedbackCompliant;
export { textCompliant };

/* Rapproche la sortie du modèle de l'analyse locale (SEC-02) : seuls les identifiants connus (plus « contenu ») sont
   gardés, le type et le moment viennent de l'analyse locale, chaque champ est borné, les points d'appui passent
   d'abord, dix repères au plus. Ce qui manque est repris de l'analyse locale.
   Filtre champ par champ : un texte du modèle refusé par le filtre strict (note, émotion, appréciation) est remplacé
   par le texte local du même repère, et le repère « contenu », qui n'a pas d'équivalent local, est retiré. Un seul mot
   refusé ne fait donc plus perdre toute l'analyse rédigée. « ecartes » compte les textes ainsi remplacés. */
/* Borne un champ : coupé à la fin de la dernière phrase entière quand c'est possible, sinon avec des points de suspension. */
const clip = (v, n = 300) => {
  const t = typoFr(String(v ?? "").replace(/\u2014/g, ",").replace(/\s+/g, " ").trim());
  if (t.length <= n) return t;
  const head = t.slice(0, n), end = head.search(/[.!?…](?=[^.!?…]*$)/); // dernière fin de phrase
  return end > n / 2 ? head.slice(0, end + 1).trim() : head.slice(0, n - 1).trimEnd() + "…";
};
const ok = t => textCompliant(t, "strict");
export function reconcile(parsed, local) {
  if (!parsed || typeof parsed !== "object" || !Array.isArray(parsed.dimensions)) return null;
  const byId = Object.fromEntries(local.dimensions.map(d => [d.id, d]));
  const seen = new Set();
  const dims = [];
  let ecartes = 0;
  const pick = (text, fallback) => { if (text && ok(text)) return text; if (text) ecartes++; return fallback; };
  for (const d of parsed.dimensions) {
    if (!d || typeof d !== "object") continue;
    const id = String(d.id || "");
    if (seen.has(id) || (!byId[id] && id !== "contenu")) continue;
    const ref = byId[id];
    const type = ref ? ref.type : d.type === "appui" ? "appui" : "explorer";
    const t = ref ? ref.t : Number.isFinite(d.t) ? Math.max(0, Math.min(d.t, local.metrics.duration || 0)) : 0;
    const titre = pick(clip(d.titre, 80), ref?.titre || "Ce que vous dites");
    const observation = pick(clip(d.observation), ref?.observation || "");
    const conseil = pick(clip(d.conseil), ref?.conseil || "");
    if (!ref && (!observation || !conseil)) continue; // repère « contenu » incomplet ou refusé : retiré
    seen.add(id);
    dims.push({ id, type, t, titre, observation, conseil });
  }
  for (const d of local.dimensions) if (!seen.has(d.id)) dims.push(d); // aucun repère local n'est supprimé
  dims.sort((a, b) => (a.type === b.type ? a.t - b.t : a.type === "appui" ? -1 : 1));
  return { synthese: pick(clip(parsed.synthese, 600), local.synthese), dimensions: dims.slice(0, 10), ecartes };
}

/* Analyse rédigée par un modèle de langage, facultative, via le point d'accès unique de src/lib/llm.js
   (proxy « chat completions » qui garde la clé et choisit le fournisseur ; jamais de clé dans le navigateur).
   Le prompt système et la forme de la requête sont dans llm.js (FEEDBACK_SYSTEM_PROMPT, feedbackMessages). */
export async function analyze({ segments, duration, gaze, poste, question }) {
  const local = localAnalysis({ segments, duration, gaze });
  if (!llmEnabled() || local.metrics.wordCount < 15) return { ...local, source: "local" };

  /* Délai de garde (B2) : sans réponse du point d'accès en 30 s, la requête est abandonnée et l'analyse locale
     s'affiche. Le proxy coupe lui-même un peu avant (serveur/llm-proxy, TIMEOUT_MS_FEEDBACK). */
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), LLM_TIMEOUT_MS.feedback);
  try {
    const text = await llmComplete("feedback", {
      messages: feedbackMessages({ poste, question, segments: cleanRepetitions(segments).segments, metrics: local.metrics, dimensions: local.dimensions }),
      response_format: { type: "json_object" },
    }, { signal: ctrl.signal });
    const parsed = reconcile(parseFeedback(text), local);
    if (!parsed || !isCompliant(parsed)) throw new Error("analyse non conforme");
    const { ecartes, ...rest } = parsed;
    if (ecartes) console.warn(`[analyse] ${ecartes} texte(s) du modèle écarté(s) par le filtre, remplacé(s) par le texte local`);
    return { ...rest, metrics: local.metrics, source: "llm" };
  } catch (e) {
    console.warn("[analyse] modèle de langage indisponible ou non conforme, analyse locale utilisée", e);
    return { ...local, source: "local" };
  } finally { clearTimeout(timer); }
}

/* Lit la réponse du modèle : un objet JSON, éventuellement entouré d'une clôture de code. */
export const parseFeedback = text => JSON.parse(String(text).replace(/```json|```/g, "").trim());

export { fmt };
