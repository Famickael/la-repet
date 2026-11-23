/* Test de la couche de données locale (sans navigateur) : node tests/store.test.mjs
   localStorage et indexedDB sont simulés par deux petits objets en mémoire. */
import assert from "assert/strict";

const mem = new Map();
let failWrites = false;
globalThis.localStorage = {
  getItem: k => (mem.has(k) ? mem.get(k) : null),
  setItem: (k, v) => { if (failWrites) { const e = new Error("quota"); e.name = "QuotaExceededError"; throw e; } mem.set(k, String(v)); },
  removeItem: k => mem.delete(k),
};
const blobs = new Map();
globalThis.indexedDB = {
  open() {
    const req = {};
    const store = {
      put: (v, k) => { blobs.set(k, v); return {}; },
      delete: k => { blobs.delete(k); return {}; },
      get: k => ({ result: blobs.get(k) }),
    };
    const db = {
      transaction() { const t = { objectStore: () => store }; setTimeout(() => t.oncomplete?.(), 0); return t; },
      close() {}, objectStoreNames: { contains: () => true },
    };
    setTimeout(() => { req.result = db; req.onsuccess?.(); }, 0);
    return req;
  },
};
globalThis.window = globalThis.window || { addEventListener() {}, removeEventListener() {} };

const S = await import("../src/lib/store.js");

// Parcours, réponse, envoi
S.setCounselor("Sophie M.");
const code = S.createParcours({ prenom: "Alex D.", poste: "agent d'accueil", warmup: true });
assert.match(code, /^[A-HJ-NP-Z2-9]{6}$/);
S.updateParcours(code, { consent: { at: new Date().toISOString(), local: true, ai: true } });
const id = await S.createTake({ code, question: "Q ?", duration: 12, blob: { type: "video/webm" }, transcript: "", segments: [], gaze: null, analysis: { synthese: "", dimensions: [] } });
assert.ok(blobs.has(id), "vidéo enregistrée dans IndexedDB");
S.updateTake(id, { shared: true, sharedAt: new Date().toISOString(), note: "" });
assert.equal(S.getState().takes[id].shared, true);

// BUG-02 : reprise de l'envoi pendant la relecture, le rapport est refusé
assert.equal(S.saveDraft(id, { intro: "brouillon" }), true);
S.unshareTake(id);
assert.equal(S.getState().takes[id].draft, null, "la reprise efface le brouillon du coach");
assert.equal(S.saveDraft(id, { intro: "x" }), false, "brouillon refusé après reprise");
assert.equal(S.sendReport(id, { intro: "Bonjour", notes: [], comments: {} }), false, "rapport refusé après reprise");
assert.equal(S.getState().takes[id].report, null);
S.updateTake(id, { shared: true, sharedAt: new Date().toISOString() });
assert.equal(S.sendReport(id, { intro: "Bonjour", notes: [], comments: {} }), true);
assert.equal(S.getState().takes[id].report.intro, "Bonjour");


// Retrait de l'accord : réponses, vidéos et questionnaire d'échauffement supprimés, historique gardé (BUG-20)
const id2 = await S.createTake({ code, question: "Q2 ?", duration: 5, blob: { type: "audio/webm" }, transcript: "", segments: [], gaze: null, analysis: { synthese: "", dimensions: [] } });
assert.equal(S.getState().takes[id2].hasMedia, true, "hasMedia enregistré");
S.saveWarmupDebrief(code, { feeling: "bien" });
assert.ok(mem.has(`larepet.warmup.${code}`));
await S.withdrawConsent(code);
assert.equal(S.takesOf(code).length, 0, "réponses supprimées");
assert.ok(!blobs.has(id2), "vidéo supprimée");
assert.ok(!mem.has(`larepet.warmup.${code}`), "questionnaire d'échauffement supprimé avec l'accord");
const p = S.getState().parcours[code];
assert.equal(p.consent, null); assert.ok(p.consentWithdrawnAt); assert.equal(p.consentHistory.length, 1);

// BUG-21 : pas de parcours fantôme
await S.withdrawConsent("ZZZZZZ");
assert.ok(!S.getState().parcours.ZZZZZZ, "aucun parcours fantôme créé");

// Suppression du parcours : clés nettoyées (BUG-20)
S.saveWarmupDebrief(code, { feeling: "bien" });
await S.deleteParcours(code);
assert.ok(!S.getState().parcours[code]);
assert.ok(!mem.has(`larepet.warmup.${code}`), "questionnaire d'échauffement supprimé avec le parcours");

// ARC-01 : écriture qui échoue, la création rejette et la vidéo posée est retirée
const code2 = S.createParcours({ prenom: "Lou", poste: "", warmup: false });
failWrites = true;
await assert.rejects(S.createTake({ code: code2, question: "Q ?", duration: 3, blob: { type: "video/webm" }, transcript: "", segments: [], gaze: null, analysis: { synthese: "", dimensions: [] } }), /Stockage/);
assert.equal(S.getStorageError(), true, "erreur de stockage signalée");
assert.equal(S.takesOf(code2).length, 0, "aucune réponse fantôme en mémoire");
assert.equal(blobs.size, 0, "vidéo retirée après l'échec");
failWrites = false;
S.updateParcours(code2, { poste: "x" });
assert.equal(S.getStorageError(), false, "l'erreur disparaît quand l'écriture refonctionne");


// ARC-08 : un autre onglet écrit entre deux écritures de cet onglet, rien n'est écrasé
const KEY = "larepet.v1";
const other = JSON.parse(mem.get(KEY));
other.parcours.AUTRE1 = { code: "AUTRE1", prenom: "Sam", poste: "", createdAt: new Date().toISOString(), consent: null };
mem.set(KEY, JSON.stringify(other)); // écrit par un autre onglet, sans passer par ce module
S.updateParcours(code2, { poste: "électricien" });
const disk = JSON.parse(mem.get(KEY));
assert.ok(disk.parcours.AUTRE1, "le parcours créé dans l'autre onglet est gardé");
assert.equal(disk.parcours[code2].poste, "électricien", "la modification de cet onglet est écrite");
assert.equal(disk.v, 1, "version du schéma enregistrée");
// BUG-02 renforcé : la reprise faite dans un autre onglet (copie en mémoire périmée) bloque aussi le rapport
const id3 = await S.createTake({ code: code2, question: "Q3 ?", duration: 4, blob: null, transcript: "", segments: [], gaze: null, analysis: { synthese: "", dimensions: [] } });
S.updateTake(id3, { shared: true, sharedAt: new Date().toISOString() });
const d2 = JSON.parse(mem.get(KEY)); d2.takes[id3].shared = false; mem.set(KEY, JSON.stringify(d2));
assert.equal(S.sendReport(id3, { intro: "x", notes: [], comments: {} }), false, "rapport refusé d'après l'état du stockage");

// C9 (B7) : export lisible des données de la personne, vidéos à part
const code4 = S.createParcours({ prenom: "Lou", poste: "cariste", warmup: false, type: "mobilite" });
S.updateParcours(code4, { consent: { at: "2026-11-21T10:00:00.000Z", local: true, ai: true, version: "3" } });
const id4 = await S.createTake({ code: code4, question: "Présentez-vous.", duration: 31.6, blob: { type: "audio/webm" }, transcript: "Bonjour, je suis cariste.",
  segments: [{ start: 0, end: 3.2, text: "Bonjour, je suis cariste." }], gaze: null,
  analysis: { source: "llm", synthese: "Vos points d'appui : exemples concrets.", dimensions: [{ id: "exemples", titre: "Exemples concrets", type: "appui", t: 65, observation: "o", conseil: "c" }] } });
S.updateTake(id4, { shared: true, sharedAt: "2026-11-21T11:00:00.000Z", note: "Merci" });
assert.equal(S.sendReport(id4, { intro: "Bonjour Lou", comments: { exemples: "Très concret." }, notes: [{ id: "n1", t: 75, text: "Bon exemple" }], sentAt: "2026-11-22T09:00:00.000Z", by: "Sophie M." }), true);
const ex = S.exportData(code4);
assert.equal(ex.parcours.prenom, "Lou"); assert.equal(ex.parcours.typeEntretien, "mobilité"); assert.equal(ex.parcours.accord.retourDeLAssistant, true);
assert.equal(ex.reponses.length, 1);
const r4 = ex.reponses[0];
assert.equal(r4.texteDeLaReponse, "Bonjour, je suis cariste."); assert.equal(r4.texteHorodate[0].fin, "0:03");
assert.equal(r4.enregistrement, "voix"); assert.match(r4.fichierEnregistrement, /\.webm$/);
assert.equal(r4.retourDeLAssistant.reperes[0].moment, "1:05"); assert.equal(r4.retourDeLAssistant.reperes[0].nature, "point d'appui");
assert.equal(r4.rapportDuCoach.introduction, "Bonjour Lou"); assert.equal(r4.rapportDuCoach.remarquesSurLesReperes[0].repere, "Exemples concrets");
assert.equal(r4.rapportDuCoach.notesHorodatees[0].moment, "1:15"); assert.equal(r4.messageAuCoach, "Merci");
assert.ok(!JSON.stringify(ex).includes(id3), "seules les réponses de ce parcours sont exportées");
assert.ok(await S.loadMediaBlob(id4), "l'enregistrement se télécharge à part");
assert.equal(S.exportData("INCONNU"), null);

/* Parcours d'essai (code REPETE) : deux entretiens sur la même question, ajoutés une seule fois. */
const trial = S.findParcours("repete");
assert.equal(trial.prenom, "Camille");
const tt = S.takesOf("REPETE");
assert.equal(tt.length, 2, "deux entretiens d'essai");
assert.equal(tt[0].question, tt[1].question, "même question");
assert.ok(tt.every(t => /^[a-z0-9-]+$/.test(t.id) && !t.shared && t.analysis.dimensions.length > 0), "identifiants compatibles avec l'adresse, rien d'envoyé au coach");
assert.match(new Date(tt[1].createdAt).toLocaleDateString("fr-FR", { day: "numeric", month: "long" }), /^12 mars$/, "« Entretien du 12 mars »");
await S.deleteTake(tt[0].id); S.findParcours("REPETE");
assert.equal(S.takesOf("REPETE").length, 1, "un entretien d'essai supprimé ne revient pas");

console.log("store.test : OK");
