/* Test de l'analyse descriptive et du garde-fou (sans navigateur) : npm run test:analysis */
import assert from "assert/strict";
import { localAnalysis, isCompliant, reconcile } from "../src/lib/analysis.js";
import { textCompliant } from "../src/lib/compliance.js";
import { assistantCompliant } from "../src/lib/assistant.js";
import { EYE_KEYS } from "../src/lib/gazeKeys.js";
import { cleanRepetitions } from "../src/lib/repetitions.js";
import { llmBody, LLM_TIMEOUT_MS } from "../src/lib/llm.js";
import { readFileSync } from "fs";
import { parse } from "@babel/parser";

const segments = [
  { start: 0, end: 6, text: "Bonjour, euh, je m'appelle Alex et en fait je postule au poste d'agent d'accueil." },
  { start: 6.5, end: 14, text: "J'ai travaillé deux ans dans un magasin, donc je sais gérer plusieurs clients en même temps." },
  { start: 17, end: 24, text: "Euh, je prépare toujours mes journées, du coup je suis prêt le matin, voilà." },
  { start: 24.5, end: 31, text: "C'est pour ça que ce poste me correspond vraiment." },
];
const gaze = { samples: 60, absentRatio: 0.05, downRatio: 0.3, sideRatio: 0.1, longestAwayAt: 12 };
const a = localAnalysis({ segments, duration: 32, gaze });

assert.ok(isCompliant(a), "le retour local doit être conforme");
assert.ok(a.dimensions.length >= 4);
const firstExplore = a.dimensions.findIndex(d => d.type === "explorer");
assert.ok(a.dimensions.slice(firstExplore).every(d => d.type === "explorer"), "points d'appui d'abord");
assert.ok(isCompliant(localAnalysis({ segments: [{ start: 0, end: 2, text: "Bonjour." }], duration: 5 })), "réponse très courte");

/* SEC-01, TST-03 : phrases interdites dans un retour (au moins 30, accents, élisions, notes en lettres). */
const FORBIDDEN = [
  "Votre émotion est visible.", "Vous semblez à l'aise.", "Vous paraissez calme et serein.", "Vous avez l'air tendu et hésitant.",
  "Vous semblez inquiet.", "Vous manquez d'assurance.", "Vous avez le trac.", "Vous êtes émue.", "Je vous mets 8 sur 10.", "Note de 7.",
  "Réussite : 80 %.", "Excellent, très bonne prestation, niveau B.", "Vous semblez stressée.", "Note : 14/20", "Vous étiez un peu nerveux au début.",
  "Votre stress se voit.", "On sent que vous êtes motivé.", "Vous êtes à l’aise devant la caméra.", "Votre réponse mérite quinze sur vingt.",
  "Vous restez détendu.", "Vous êtes très confiante.", "Vous paraissiez fatigué.", "Vous dégagez de l'enthousiasme.", "Une émotion passe dans votre voix.",
  "Votre score est de 12.", "Trois étoiles pour cette réponse.", "90 % de réussite.", "Bravo, c'est parfait.", "Vous avez eu peur de la question.",
  "Vous sembliez gêné.", "VOUS SEMBLEZ SEREINE.", "Vous êtes sincère.", "Vous souriez beaucoup, votre sourire aide.", "Très bien.", "Le ton est calme.",
  "Vous manquez de confiance en vous.", "Vous etes emue.", "Votre timidité ressort.", "Vous êtes resté calme.", "Je sens que vous hésitez.",
];
for (const t of FORBIDDEN) {
  assert.ok(!textCompliant(t), `devrait être rejeté : ${t}`);
  assert.ok(!isCompliant({ ...a, synthese: t }), `retour devrait être rejeté : ${t}`);
}
/* Phrases permises : sorties réelles de l'analyse locale et formulations factuelles proches des mots surveillés. */
const ALLOWED = [
  ...a.dimensions.flatMap(d => [d.titre, d.observation, d.conseil]), a.synthese,
  "Environ 130 mots par minute sur 0:45 de parole.", "Regard orienté vers l'écran environ 70 % du temps.",
  "Le contenu de la réponse cite deux expériences.", "Vous citez un élément précis : « deux ans en magasin ».",
  "Trois pauses de plus de 2 secondes.", "La réponse se termine par une idée de synthèse.", "Vous pouvez noter deux mots-clés avant de répondre.",
  "Le rythme est posé.", "Une respiration entre deux idées suffit souvent.", "Vous pouvez préparer un ou deux synonymes.",
];
for (const t of ALLOWED) assert.ok(textCompliant(t), `devrait être accepté : ${t}`);

/* L'assistant de préparation peut parler du trac quand la personne en parle, sans jamais la qualifier ni la noter. */
for (const t of ["Le trac est fréquent avant un entretien.", "Si vous avez le trac, respirez sur quatre temps.", "Installez-vous dans un endroit calme.", "La Répét' ne met pas de note."])
  assert.ok(assistantCompliant(t), `assistant, devrait être accepté : ${t}`);
for (const t of ["Vous semblez stressé.", "Votre stress est normal.", "Vous êtes tendu, c'est visible.", "Je vous donne 7 sur 10.", "Vous avez l'air à l'aise."])
  assert.ok(!assistantCompliant(t), `assistant, devrait être rejeté : ${t}`);

/* SEC-02 : sortie du modèle rapprochée de l'analyse locale. */
const llm = { synthese: "Synthèse reformulée.", dimensions: [
  { id: "structure", titre: "Construction", type: "appui", observation: "x".repeat(900), conseil: "Conseil.", t: 999 },
  { id: "structure", titre: "Doublon", type: "explorer", observation: "o", conseil: "c", t: 1 },
  { id: "inconnu", titre: "Inventé", type: "appui", observation: "o", conseil: "c", t: 1 },
  { id: "contenu", titre: "Contenu de la réponse", type: "explorer", observation: "Deux expériences citées.", conseil: "Vous pouvez en ajouter une troisième.", t: 5 },
  ...Array.from({ length: 20 }, (_, i) => ({ id: `x${i}`, titre: "t", type: "appui", observation: "o", conseil: "c", t: 0 })),
] };
const r = reconcile(llm, a);
const ids = r.dimensions.map(d => d.id);
assert.equal(new Set(ids).size, ids.length, "aucun identifiant en double");
assert.ok(!ids.includes("inconnu") && ids.includes("contenu"), "seuls les identifiants connus et « contenu » sont gardés");
assert.ok(r.dimensions.length <= 10, "dix repères au plus");
const st = r.dimensions.find(d => d.id === "structure"), ref = a.dimensions.find(d => d.id === "structure");
assert.equal(st.t, ref.t, "le moment vient de l'analyse locale"); assert.equal(st.type, ref.type, "le type vient de l'analyse locale");
assert.ok(st.observation.length <= 300, "champ tronqué");
for (const d of a.dimensions) assert.ok(ids.includes(d.id), `repère local conservé : ${d.id}`);
const fe = r.dimensions.findIndex(d => d.type === "explorer");
assert.ok(fe === -1 || r.dimensions.slice(fe).every(d => d.type === "explorer"), "points d'appui d'abord après rapprochement");
assert.equal(reconcile({ synthese: "x" }, a), null, "forme invalide refusée");

/* ARC-22 : « bon », « voilà pourquoi », « ce genre de », « chez » seul ne sont pas des repères. */
const m22 = localAnalysis({ segments: [{ start: 0, end: 8, text: "J'ai un bon contact avec les gens, voilà pourquoi je postule chez vous pour ce genre de poste et je reste disponible." }], duration: 8 });
assert.equal(m22.metrics.fillerTotal, 0, "aucun petit mot répété compté");
assert.equal(m22.metrics.concreteAt, null, "« chez » seul n'est pas un exemple concret");
const m22b = localAnalysis({ segments: [{ start: 0, end: 8, text: "Euh, par exemple, j'ai travaillé deux ans en magasin, euh, avec beaucoup de clients chaque jour de la semaine." }], duration: 8 });
assert.equal(m22b.metrics.fillers.euh, 2, "les vrais petits mots restent comptés");
assert.notEqual(m22b.metrics.concreteAt, null, "« par exemple » et « deux ans » restent des exemples concrets");


/* C1 (B1) : chaque branche de texte de l'analyse locale passe le filtre strict. Un texte écrit par le site lui-même ne
   doit jamais être rejeté : sinon le retour reformulé, qui reprend ces textes (reconcile), serait écarté en entier. */
const seg = (start, end, text) => ({ start, end, text });
const CASES = {
  "son très court": { segments: [seg(0, 2, "Bonjour.")], duration: 5 },
  "rythme posé, pauses longues et nombreuses, sans exemple ni conclusion": { segments: [
    seg(0, 4, "Je travaille à l'accueil."), seg(8, 12, "J'aime le contact humain."), seg(16, 20, "Je range bien les dossiers."),
    seg(24, 28, "Je réponds au téléphone."), seg(32, 36, "Je connais les logiciels."),
  ], duration: 40 },
  "rythme rapide, petits mots fréquents, mots qui reviennent": { segments: [seg(0, 10, "Euh alors euh en fait je travaille avec le public, euh du coup le public de la mairie, et le public vient souvent, voilà, je reçois le public et les familles, euh les familles du quartier et les familles des écoles, toutes les familles.")], duration: 10 },
  "rythme dans la norme, petits mots discrets, exemple, conclusion": { segments: [
    seg(0, 10, "Bonjour, je m'appelle Alex et je travaille depuis deux ans dans une mairie, au service de l'accueil du public."),
    seg(10.5, 20, "Par exemple, j'accueille chaque jour une centaine de personnes, euh, je réponds au téléphone et je prends les rendez-vous."),
    seg(20.5, 30, "C'est pour cela que ce poste me correspond, parce que j'aime organiser le travail et informer les gens."),
  ], duration: 30 },
  "conclusion avec phrases très longues": { segments: [
    seg(0, 15, "J'ai travaillé à l'accueil d'une grande mairie où je recevais les habitants qui venaient pour leurs papiers, leurs questions sur les écoles, les cantines, les inscriptions et aussi parfois pour des démarches plus longues"),
    seg(15, 30, "c'est pour ça que je pense que ce poste me correspond puisque je connais bien les attentes du public et la façon dont un service municipal organise ses rendez-vous chaque semaine avec les familles"),
  ], duration: 30 },
  "boucle de répétition": { segments: [seg(0, 6, "Bonjour, je travaille à l'accueil d'une mairie depuis trois ans."), ...Array.from({ length: 11 }, (_, i) => seg(6 + i * 2, 8 + i * 2, "Je suis ma mère et mon tournée.")), seg(30, 34, "C'est pour cela que je postule chez vous aujourd'hui.")], duration: 34 },
  "syllabe en boucle dans un mot": { segments: [seg(0, 12, "Je m'appelle Camille. J'ai travaillé trois ans à l'accueil wanakomakomakomakomakomakomakomakomakom dans une mairie, avec le public.")], duration: 12 },
  "boucle à l'intérieur d'un segment": { segments: [seg(0, 30, "J'ai travaillé dans une mairie de la vie de la vie de la vie de la vie de la vie de la vie pendant deux ans avec le public, donc je connais bien l'accueil.")], duration: 30 },
};
const GAZES = [undefined, { samples: 60, absentRatio: 0.02, downRatio: 0.1, sideRatio: 0.1 }, { samples: 60, absentRatio: 0.1, downRatio: 0.4, sideRatio: 0.2, longestAwayAt: 4 }, { samples: 61, absentRatio: 1, downRatio: 0, sideRatio: 0 }];
const seenBranches = new Set();
for (const [name, c] of Object.entries(CASES)) for (const g of GAZES) {
  const out = localAnalysis({ ...c, gaze: g });
  assert.ok(isCompliant(out), `retour local refusé par le filtre (${name}) : ${JSON.stringify(out.dimensions.map(d => d.conseil))}`);
  for (const t of [out.synthese, ...out.dimensions.flatMap(d => [d.titre, d.observation, d.conseil])]) assert.ok(textCompliant(t, "strict"), `texte du site refusé (${name}) : ${t}`);
  out.dimensions.forEach(d => seenBranches.add(`${d.id}:${d.type}:${d.conseil.slice(0, 24)}`));
  /* Une reformulation qui reprend le texte local tel quel reste conforme (cas de B1) */
  const echo = reconcile({ synthese: out.synthese, dimensions: out.dimensions.map(d => ({ ...d })) }, out);
  assert.ok(isCompliant(echo), `reprise du texte local refusée (${name})`);
}
const branchIds = [...seenBranches].map(b => b.split(":").slice(0, 2).join(":"));
for (const need of ["captation:explorer", "debit:appui", "debit:explorer", "pauses:explorer", "exemples:appui", "exemples:explorer", "petits-mots:appui", "petits-mots:explorer", "structure:appui", "structure:explorer", "repetitions:explorer", "regard:appui", "regard:explorer", "transcription:explorer"])
  assert.ok(branchIds.includes(need), `branche non couverte par le test : ${need}`);
assert.ok([...seenBranches].some(b => b.startsWith("debit:explorer:Le rythme est posé")) && [...seenBranches].some(b => b.startsWith("debit:explorer:En entretien")), "les deux conseils de rythme sont couverts");
assert.ok(new Set([...seenBranches].filter(b => b.startsWith("structure:"))).size >= 3, "les trois conseils de construction sont couverts");
/* La reformulation du conseil « petits mots discrets » ne contient plus « gêne » (B1) */
const discret = localAnalysis(CASES["rythme dans la norme, petits mots discrets, exemple, conclusion"]);
assert.equal(discret.dimensions.find(d => d.id === "petits-mots").type, "appui");
assert.ok(isCompliant(discret), "un « euh » ne fait plus écarter le retour");

/* Tous les textes littéraux d'analysis.js (hors consigne envoyée au modèle) passent le filtre strict. */
const litterals = [];
(function walk(n) {
  if (!n || typeof n !== "object") return; if (Array.isArray(n)) return n.forEach(walk);
  if (n.type === "StringLiteral" && /\s/.test(n.value) && /^[A-ZÀ-Ü]/.test(n.value)) litterals.push(n.value);
  if (n.type === "TemplateLiteral") litterals.push(n.quasis.map(q => q.value.cooked).join(" 3 "));
  for (const k in n) if (!["loc", "start", "end"].includes(k)) walk(n[k]);
})(parse(readFileSync(new URL("../src/lib/analysis.js", import.meta.url), "utf8"), { sourceType: "module" }).program);
for (const t of litterals.filter(t => !/^Tu aides/.test(t))) assert.ok(textCompliant(t, "strict"), `texte d'analysis.js refusé : ${t}`);

/* C5 (B5) : visage non repéré, aucun pourcentage de regard affiché. */
const noFace = localAnalysis({ ...CASES["rythme dans la norme, petits mots discrets, exemple, conclusion"], gaze: GAZES[3] }).dimensions.find(d => d.id === "regard");
assert.match(noFace.observation, /^Visage non repéré/);
assert.ok(!/%/.test(noFace.observation + noFace.conseil), "aucun pourcentage quand le visage n'est pas repéré");

/* C3 (B3) : boucles de répétition retirées avant l'analyse. */
const loop = localAnalysis(CASES["boucle de répétition"]);
assert.ok(!loop.dimensions.some(d => d.id === "repetitions"), "aucun faux « mot qui revient » créé par la boucle");
assert.ok(loop.metrics.wpm < 170, `rythme non gonflé par la boucle : ${loop.metrics.wpm}`);
assert.equal(loop.metrics.loopWords, 70);
const inner = localAnalysis(CASES["boucle à l'intérieur d'un segment"]);
assert.equal(inner.metrics.wpm, null, "segment raccourci : rythme non calculé");
assert.equal(cleanRepetitions([seg(0, 3, "ta wanakomakomakomakomakom")]).text, "ta wanakom", "syllabe en boucle ramenée à une fois");
assert.equal(cleanRepetitions([seg(0, 3, "Non, non, non, je ne crois pas. Très très bien.")]).removedWords, 0, "répétitions naturelles gardées");
assert.equal(cleanRepetitions([seg(0, 2, "Je suis là."), seg(2, 4, "Je suis là.")]).removedWords, 0, "deux fois de suite : gardé");
assert.equal(cleanRepetitions([seg(0, 2, "Je suis là."), seg(2, 4, "Je suis là."), seg(4, 6, "je suis là")]).segments.length, 1, "trois fois de suite : une seule gardée");
const once = cleanRepetitions(CASES["boucle de répétition"].segments);
assert.deepEqual(cleanRepetitions(once.segments).removedWords, 0, "nettoyage idempotent");

/* C6, C7 : la tâche est envoyée au point d'accès ; délais du navigateur par tâche. */
for (const task of ["chat", "feedback", "coach"]) assert.equal(llmBody(task, { messages: [] }).task, task);
assert.deepEqual(LLM_TIMEOUT_MS, { chat: 20000, coach: 20000, feedback: 30000 });

/* SEC-06 : le suivi du regard ne lit que les coefficients de direction des yeux. */
assert.ok(EYE_KEYS.length > 0 && EYE_KEYS.every(k => k.startsWith("eyeLook")), "seuls les coefficients eyeLook* sont lus");

console.log(`analysis.test : OK (${FORBIDDEN.length} phrases rejetées, ${ALLOWED.length} acceptées)`);
a.dimensions.forEach(d => console.log(`  [${d.type}] ${d.titre} : ${d.observation}`));
