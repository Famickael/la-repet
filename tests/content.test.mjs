/* Contenus et formats (sans navigateur) : node tests/content.test.mjs */
import assert from "assert/strict";
import { fill, fillPhrase, fullInterview, situationFor, QUESTIONS, WARMUP_PHRASES, questionsFor, topicsFor, questionsForTopics, interviewType } from "../src/lib/questions.js";
import { searchJobs } from "../src/lib/jobs.js";
import { CATEGORIES } from "../src/content/categories.js";
import { readFileSync, readdirSync, existsSync } from "fs";
import { dePoste, fillPoste } from "../src/lib/text.js";
import { clock, duration } from "../src/lib/format.js";

/* BUG-12 : élision devant voyelle ou h muet. */
assert.equal(dePoste("agent d'accueil"), "d'agent d'accueil");
assert.equal(dePoste("électricien"), "d'électricien");
assert.equal(dePoste("hôtesse de caisse"), "d'hôtesse de caisse");
assert.equal(dePoste("serveur"), "de serveur");
assert.equal(fill("Pourquoi ce poste de {poste} vous intéresse-t-il ?", "agent d'accueil"), "Pourquoi ce poste d'agent d'accueil vous intéresse-t-il ?");
assert.equal(fill("Pourquoi ce poste de {poste} vous intéresse-t-il ?", ""), "Pourquoi ce poste vous intéresse-t-il ?");
assert.equal(fill("Pourquoi ce poste de {poste} vous intéresse-t-il ?", "serveur(se)"), "Pourquoi ce poste de serveur vous intéresse-t-il ?");
assert.equal(fillPoste("Pour un poste de {poste}, préparez-vous.", "", "le poste visé"), "Pour un poste, préparez-vous.");
for (const job of ["agent d'accueil", "électricien", "aide-soignant(e)", "", "serveur(se)"]) {
  const all = [...QUESTIONS.map(q => fill(q.text, job)), ...WARMUP_PHRASES.map(t => fillPhrase(t, { poste: job, prenom: "Lou" })), ...fullInterview(job).map(x => x.text), ...fullInterview(job, "mobilite").map(x => x.text)];
  for (const t of all) {
    assert.ok(!/\bde [aeiouyhàâéèêîôû]/i.test(t.replace(/de (?:la|le|les)\b/gi, "")), `élision manquante : ${t}`);
    assert.ok(!/ce poste de ce poste|\{poste\}|\{prenom\}/.test(t), `gabarit mal rempli : ${t}`);
  }
}

/* BUG-17 : horloge arrondie avant le découpage. */
assert.equal(clock(59.6), "1:00");
assert.equal(clock(119.7), "2:00");
assert.equal(clock(5), "0:05");
assert.equal(duration(42), "42 s");
assert.equal(duration(95), "1 min 35");

console.log("content.test : OK");

/* BUG-01 : la confirmation de la demande ne promet un rappel que si un envoi réel a eu lieu. */
const { PHRASES } = await import("../src/content/legal.js");
for (const k of ["contactDemo", "contactInfo"]) assert.ok(!/recontact|enregistrée/i.test(PHRASES[k]), `${k} promet un envoi : ${PHRASES[k]}`);
/* Formulaire de contact : aucun envoi, message exact demandé par le propriétaire. */
assert.equal(PHRASES.contactDemo, "Aucune demande envoyée, version de démonstration");
assert.match(PHRASES.contactSent, /recontacte/);
/* Décision du 22 novembre 2026 : le site se présente comme pleinement fonctionnel, plus de phrase « même navigateur ». */
assert.equal(PHRASES.sameDevice, undefined);
/* Panel bénéficiaires : textes de l'espace réécrits (vocabulaire simple, annulation explicite, employeur nommé). */
const { SUMMARY } = await import("../src/content/legal.js");
assert.match(PHRASES.sent, /annuler l'envoi/);
assert.ok(!/reprendre/i.test(PHRASES.sent + SUMMARY.envoi.map(x => x[1]).join(" ")), "plus de « reprendre votre envoi »");
assert.match(SUMMARY.envoi[0][1], /employeur/);
assert.ok(!/cookie/i.test(PHRASES.noTracking) && /professionnel/.test(PHRASES.sharedDevice) && /Retirer mon accord/.test(PHRASES.sharedDevice));
assert.ok(!/modèle de langage/.test(PHRASES.feedbackLlm), "pas de jargon dans la mention du texte rédigé par l'IA");
assert.ok(!/analyse/.test(PHRASES.download) && /130\u00a0Mo/.test(PHRASES.download + PHRASES.personalDevice));
assert.match(PHRASES.personalDevice, /personnel/);
/* C4 (B4) : sans proxy IA, la préparation se fait sur l'appareil et rien ne part. */
assert.match(PHRASES.processing, /^Tout se passe sur votre appareil/);
assert.ok(!/envoy/.test(PHRASES.processing) && !/envoy/.test(PHRASES.consentAi), "rien n'est annoncé comme envoyé sans proxy IA");
for (const [k, v] of Object.entries(PHRASES)) assert.ok(!/\u2014/.test(v), `tiret cadratin dans PHRASES.${k}`);
console.log("content.test : textes de la démo OK");

/* TST-09 : une mise en situation propre à chaque famille de métiers, repli générique sinon. */
const generic = situationFor("astronaute");
for (const job of ["agent d'accueil", "vendeur", "serveur(se)", "aide-soignant(e)", "électricien", "cariste"]) {
  const sit = situationFor(job);
  assert.ok(sit && sit.endsWith("?"), `mise en situation pour ${job}`);
}
assert.notEqual(situationFor("serveur(se)"), generic, "famille restauration reconnue");
assert.ok(searchJobs("serv", 8).some(j => /serveur/.test(j)), "recherche de métier");
assert.ok(searchJobs("élec", 8).length > 0, "recherche sans tenir compte des accents");

/* TST-09 : chaque article a un titre, une catégorie connue, une image présente dans public/img/. */
const dir = new URL("../src/content/resources/", import.meta.url);
const cats = new Set(CATEGORIES.map(c => c.id));
for (const f of readdirSync(dir).filter(f => f.endsWith(".md"))) {
  const front = (readFileSync(new URL(f, dir), "utf8").match(/^---\n([\s\S]*?)\n---/) || [])[1] || "";
  const val = k => (front.match(new RegExp(`^${k}:\\s*(.+)$`, "m")) || [])[1]?.trim();
  assert.ok(val("title"), `${f} : titre`);
  assert.ok(cats.has(val("category")), `${f} : catégorie inconnue ${val("category")}`);
  const img = val("image");
  assert.ok(img && existsSync(new URL(`../public/img/${img}`, import.meta.url)), `${f} : image absente ${img}`);
}
console.log("content.test : métiers et articles OK");

/* Repositionnement : type d'entretien « mobilité ou évolution » (collaborateurs d'entreprise), sans casser l'embauche. */
assert.equal(interviewType({}), "embauche");
assert.equal(interviewType({ type: "mobilite" }), "mobilite");
const emb = questionsFor("embauche").map(q => q.id), mob = questionsFor("mobilite").map(q => q.id);
assert.ok(emb.includes("motivation") && !emb.some(id => id.startsWith("mob-")), "questions d'embauche");
assert.ok(mob[0].startsWith("mob-") && !mob.includes("motivation") && mob.includes("presentation"), "questions de mobilité");
assert.equal(fullInterview("comptable", "mobilite").length, 7);
assert.notDeepEqual(fullInterview("comptable", "mobilite"), fullInterview("comptable"));
for (const type of ["embauche", "mobilite"]) {
  const ids = new Set(questionsFor(type).map(q => q.id));
  for (const t of topicsFor(type)) for (const id of questionsForTopics([t.id])) assert.ok(ids.has(id), `${type} : le sujet ${t.id} renvoie à une question absente (${id})`);
}
/* Le fournisseur du modèle d'IA n'est jamais nommé dans le site (on dit « assistant IA »). */
const walk = d => readdirSync(d, { withFileTypes: true }).flatMap(e => e.isDirectory() ? walk(`${d}/${e.name}`) : [`${d}/${e.name}`]);
for (const f of walk(new URL("../src", import.meta.url).pathname).filter(f => /\.(jsx?|md)$/.test(f))) {
  assert.ok(!/\bClaude\b|Anthropic/.test(readFileSync(f, "utf8")), `${f} nomme le fournisseur du modèle d'IA`);
}
/* Code client agnostique (AGENTS.md, section 8) : aucun nom de fournisseur ni de modèle dans src/lib ; la tâche est
   envoyée au proxy, le modèle seulement si VITE_LLM_MODEL est défini. */
for (const f of walk(new URL("../src/lib", import.meta.url).pathname)) {
  assert.ok(!/mistral|claude-|gpt-|anthropic/i.test(readFileSync(f, "utf8")), `${f} nomme un fournisseur ou un modèle d'IA`);
}
const { llmBody, llmEnabled } = await import("../src/lib/llm.js");
assert.equal(llmEnabled(), false);
assert.deepEqual(llmBody("feedback", { messages: [] }), { task: "feedback", messages: [] });
console.log("content.test : types d'entretien et fournisseur d'IA OK");

/* Positionnement précisé (docs/redaction.md, 1.2 ter) : « entraînement » et « s'entraîner » pour l'activité, « répéter »
   seulement au sens propre ; une question sur l'avatar dans la FAQ ; la progression se dit sans note ni mesure. */
const { FAQ } = await import("../src/content/faq.js");
const faqText = JSON.stringify(FAQ);
assert.ok(FAQ[0].items.some(([q]) => /avatar/.test(q)) && FAQ[1].items.some(([q]) => /avatar/.test(q)), "FAQ : une question sur l'avatar pour les personnes accompagnées et pour les coachs");
assert.ok(!/plus efficace/.test(faqText), "FAQ : on n'affirme pas que l'entraînement sans avatar est plus efficace");
const REPET_OK = /La Répét['’]|[Pp]etits? mots? répétés?|mots répétés|répétition générale|répéter (?:la|une|« gérer »)|de répéter\b|répété(?:e|es|s)? (?:en boucle|plus|\d)|Boucles? de répétition|boucles de répétition|sans répétition|entièrement répété|phrase répétée|passage répété|syllabe répétée/g;
for (const f of walk(new URL("../src", import.meta.url).pathname).filter(f => /\.(jsx|md)$/.test(f) || /src\/(content|home)\/.*\.js$/.test(f) || /src\/lib\/seo\.js$/.test(f))) {
  const left = readFileSync(f, "utf8").replace(REPET_OK, "").match(/.{0,40}(?<![\w.\/-])[Rr]épét(?:e[zr]?|ition|itions|ons|é|ée|és|ées)(?![\w-]).{0,20}/);
  assert.ok(!left, `${f.replace(/.*\/src\//, "src/")} : « répéter » ou « répétition » pour l'activité (écrire « entraînement », « s'entraîner ») : ${left}`);
}
const heroSrc = readFileSync(new URL("../src/home/Hero.jsx", import.meta.url), "utf8");
for (const t of ["Assisté par IA", "Sans avatar", "Avec votre coach", "Entraînez-vous pour votre entretien,", "Je lance mon premier entraînement"]) assert.ok(heroSrc.includes(t), `accueil : « ${t} » attendu`);
assert.ok(!/\bjauge|\bcourbe|\bscore/i.test(heroSrc.replace(/\/\*[\s\S]*?\*\//g, "")), "accueil : la progression se dit sans jauge, courbe ni score");
console.log("content.test : vocabulaire de l'entraînement et question sur l'avatar OK");

/* RED-11 : typographie française des textes visibles (docs/redaction.md, 1.3). Aucune espace ordinaire avant
   ; ? ! : % » ni après «, et une insécable entre un nombre et son unité. Code, URL, expressions régulières et clés
   ne sont pas lus (tests/lib/typo-fr.mjs). */
const { jsTextSpans, mdTextSpans, badSpots } = await import("./lib/typo-fr.mjs");
const TYPO_SKIP = /src\/(tokens\.js|ui\/GStyle\.jsx|ui\/icons\.jsx|lib\/whisper\.worker\.js|lib\/gazeKeys\.js)$/;
const typoErrors = [];
for (const f of walk(new URL("../src", import.meta.url).pathname).filter(f => /\.(jsx?|md)$/.test(f) && !TYPO_SKIP.test(f))) {
  const src = readFileSync(f, "utf8");
  for (const s of f.endsWith(".md") ? mdTextSpans(src) : jsTextSpans(src)) for (const spot of badSpots(s.text)) typoErrors.push(`${f.replace(/.*\/src\//, "src/")} : « ${spot.replace(/\n/g, " ")} »`);
}
assert.equal(typoErrors.length, 0, `espaces ordinaires à remplacer par des insécables :\n${typoErrors.slice(0, 40).join("\n")}`);
console.log("content.test : typographie française OK");

/* Décisions du propriétaire du 22 novembre 2026 (CLAUDE.md, docs/redaction.md 1.2 quater) : le site se présente comme
   pleinement fonctionnel, et ce que l'on enregistre, envoie, garde ou supprime s'appelle « entretien ». Textes visibles
   seulement (chaînes, JSX, articles, page d'accueil statique et image d'aperçu), pas les commentaires. */
const visibleSpans = [];
for (const f of walk(new URL("../src", import.meta.url).pathname).filter(f => /\.(jsx?|md)$/.test(f) && !TYPO_SKIP.test(f))) {
  const src = readFileSync(f, "utf8");
  for (const s of f.endsWith(".md") ? mdTextSpans(src) : jsTextSpans(src)) visibleSpans.push([f.replace(/.*\/src\//, "src/"), s.text]);
}
for (const f of ["../index.html", "../scripts/og-image.html"]) {
  const html = readFileSync(new URL(f, import.meta.url), "utf8").replace(/<!--[\s\S]*?-->/g, "").replace(/<(script|style)\b[^>]*>[\s\S]*?<\/\1>/g, m => /ld\+json/.test(m) ? m : "");
  visibleSpans.push([f.slice(3), html.replace(/<[^>]+>/g, " ")]);
}
const TRIAL = /version d['’]essai|prototype|(?:dans )?ce même navigateur|même navigateur/i;
const trialLeft = visibleSpans.filter(([, t]) => TRIAL.test(t)).map(([f, t]) => `${f} : « ${t.match(new RegExp(`.{0,40}${TRIAL.source}.{0,20}`, "i"))[0]} »`);
assert.equal(trialLeft.length, 0, `mention d'une version d'essai visible :\n${trialLeft.join("\n")}`);
const ACTION = /\b(?:Supprimer|Envoyer|Garder|Annuler l['’]envoi(?: de)?|Relire|Ouvrir|Télécharger|Recommencer|Revoir|Réécouter)\s+(?:cette|ma|la|votre|une|vos|mes|les)\s+réponses?\b|\bMes réponses\b|\bRéponses? (?:envoyée|gardée|à relire|reçues?)\b/;
const actionLeft = visibleSpans.filter(([, t]) => ACTION.test(t)).map(([f, t]) => `${f} : « ${t.match(ACTION)[0]} »`);
assert.equal(actionLeft.length, 0, `« réponse » dans un libellé d'action sur un entretien (écrire « entretien ») :\n${actionLeft.join("\n")}`);
console.log("content.test : « entretien », aucune mention de version d'essai OK");
