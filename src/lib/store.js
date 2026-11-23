/* Couche de données locale.
   - Métadonnées (parcours, prises, rapports) : localStorage, clé "larepet.v1".
   - Vidéos : IndexedDB, base "larepet", store "videos" (clé = id de prise).
   Tout reste dans le navigateur. Le passage en production remplace ce module
   par des appels à une API (voir README, section "Passage en production"). */

import { useSyncExternalStore } from "react";
import { trialTakes } from "./trial.js";

const KEY = "larepet.v1";
const EMPTY = { counselor: null, parcours: {}, takes: {}, lastSpace: null }; // lastSpace : { role: "benef", code } | { role: "coach" }
const listeners = new Set();

/* Version du schéma (ARC-08) : migrate() met à niveau les données d'une version antérieure à la lecture. */
const SCHEMA = 1;
function migrate(d) {
  // version 0 (sans « v ») → 1 : aucun changement de forme, la version est seulement ajoutée.
  return { ...d, v: SCHEMA };
}
function read() {
  try {
    const raw = localStorage.getItem(KEY);
    return migrate(raw ? { ...EMPTY, ...JSON.parse(raw) } : { ...EMPTY });
  } catch {
    return migrate({ ...EMPTY });
  }
}

/* Deux onglets qui écrivent presque en même temps ne s'écrasent plus (ARC-08) : chaque écriture relit le stockage et
   n'y applique que ce qui a changé ici (par identifiant de parcours et de réponse), au lieu de tout réécrire. */
function merge(old, next, disk) {
  const out = { ...disk };
  for (const k of ["counselor", "lastSpace"]) if (JSON.stringify(old[k] ?? null) !== JSON.stringify(next[k] ?? null)) out[k] = next[k];
  for (const k of ["parcours", "takes"]) {
    const o = old[k] || {}, n = next[k] || {}, d = { ...(disk[k] || {}) };
    for (const id of new Set([...Object.keys(o), ...Object.keys(n)])) {
      if (!(id in n)) delete d[id];            // supprimé ici
      else if (o[id] !== n[id]) d[id] = n[id]; // créé ou modifié ici
    }
    out[k] = d;
  }
  out.v = SCHEMA;
  return out;
}

let state = read();

/* Parcours d'essai : code générique pour découvrir l'outil sans passer par la création d'un parcours.
   Créé au moment où le code est saisi ou ouvert par lien (pas au chargement de la page : rien n'est
   écrit sur l'appareil avant une action de la personne), recréé s'il a été supprimé. À retirer en production (voir README). */
export const TRIAL_CODE = "REPETE";
export const TRIAL_COACH = "Sophie M.";
/* Connexion coach de démonstration : identifiants fictifs pré-remplis (domaine réservé aux exemples), aucune vérification. */
export const TRIAL_LOGIN = { email: "sophie.m@exemple.fr", password: "repet-2026", name: TRIAL_COACH };
function ensureTrial() {
  const cur = state.parcours[TRIAL_CODE];
  if (cur?.samples) return;
  const old = state;
  /* Deux entretiens sur la même question (src/lib/trial.js), pour ouvrir tout de suite l'analyse et la comparaison.
     Ajoutés une seule fois (samples) : supprimés par la personne ou par un retrait de l'accord, ils ne reviennent pas.
     Un parcours d'essai déjà ouvert sur l'appareil les reçoit s'il n'a encore aucun entretien. */
  const add = !cur || !Object.values(state.takes).some(t => t.code === TRIAL_CODE);
  const samples = add ? Object.fromEntries(trialTakes(TRIAL_CODE).map(t => [t.id, t])) : {};
  state = { ...state, takes: { ...state.takes, ...samples }, parcours: { ...state.parcours, [TRIAL_CODE]: cur ? { ...cur, samples: true } : {
    code: TRIAL_CODE, prenom: "Camille", poste: "agent d'accueil", warmup: true, counselor: "",
    trial: true, samples: true, createdAt: new Date().toISOString(), openedAt: null, consent: null,
  } } };
  state = merge(old, state, read());
  persist(state);
  queueMicrotask(notify); // pas de mise à jour pendant un rendu
}

/* Écriture qui peut échouer (stockage plein, mode privé) : jamais en silence (ARC-01). storageError est lu par App,
   qui affiche un bandeau ; les fonctions qui créent une réponse rejettent l'opération. */
let storageError = false;
function persist(next) {
  try { localStorage.setItem(KEY, JSON.stringify(next)); storageError = false; return true; }
  catch (e) { console.error("[stockage] écriture impossible", e); storageError = true; return false; }
}
const notify = () => listeners.forEach(fn => fn());
function write(next) {
  state = merge(state, next, read());
  const ok = persist(state);
  notify();
  return ok;
}
export const getStorageError = () => storageError;

export function getState() { return state; }

/* Abonnement unique au module (ARC-07) : un seul écouteur « storage » synchronise les onglets (personne / coach),
   chaque composant lit l'état par useSyncExternalStore. */
function subscribe(fn) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}
if (typeof window !== "undefined" && window.addEventListener) {
  window.addEventListener("storage", e => { if (e.key === KEY) { state = read(); notify(); } });
}
export function useStore() {
  return useSyncExternalStore(subscribe, getState, getState);
}

const uid = () => Date.now().toString(36) + Math.random().toString(36).slice(2, 8);

/* Code d'accès : 6 caractères sans caractères ambigus (0/O, 1/I/L). */
const ALPHABET = "ABCDEFGHJKMNPQRSTUVWXYZ23456789";
function newCode() {
  let c;
  do {
    /* Tirage par rejet (SEC-09) : un octet n'est gardé que sous 248 (8 × 31), sans biais vers les premières lettres. */
    c = "";
    while (c.length < 6) for (const b of crypto.getRandomValues(new Uint8Array(8))) if (b < 248 && c.length < 6) c += ALPHABET[b % ALPHABET.length];
  } while (state.parcours[c]);
  return c;
}

/* Dernier espace ouvert sur cet appareil, pour que « Mon espace » y ramène directement. */
export function setLastSpace(ls) {
  if (JSON.stringify(state.lastSpace || null) === JSON.stringify(ls || null)) return;
  write({ ...state, lastSpace: ls || null });
}

/* ── Coach ── */
export function setCounselor(name) {
  write({ ...state, counselor: { name: name.trim(), since: new Date().toISOString() } });
}

export function logoutCounselor() {
  write({ ...state, counselor: null, lastSpace: state.lastSpace?.role === "coach" ? null : state.lastSpace });
}

/* ── Parcours ── */
export function createParcours({ prenom, poste, warmup, type }) {
  const code = newCode();
  const p = {
    code, prenom: prenom.trim(), poste: poste.trim(), warmup: !!warmup,
    type: type === "mobilite" ? "mobilite" : "embauche", // type d'entretien (INTERVIEW_TYPES, src/lib/questions.js)
    counselor: state.counselor?.name || "",
    createdAt: new Date().toISOString(), openedAt: null, consent: null,
  };
  write({ ...state, parcours: { ...state.parcours, [code]: p } });
  return code;
}

export function findParcours(code) {
  const c = (code || "").trim().toUpperCase();
  if (c === TRIAL_CODE) ensureTrial();
  return state.parcours[c] || null;
}

export function updateParcours(code, patch) {
  const p = state.parcours[code];
  if (!p) return;
  write({ ...state, parcours: { ...state.parcours, [code]: { ...p, ...patch } } });
}

export async function deleteParcours(code) {
  const takes = Object.values(state.takes).filter(t => t.code === code);
  for (const t of takes) await deleteVideo(t.id);
  clearWarmupDebrief(code); // questionnaire d'échauffement supprimé avec le parcours (BUG-20)
  const nextTakes = { ...state.takes };
  takes.forEach(t => delete nextTakes[t.id]);
  const nextParcours = { ...state.parcours };
  delete nextParcours[code];
  write({ ...state, parcours: nextParcours, takes: nextTakes });
}

/* Retrait du consentement : supprime réponses et vidéos, garde le parcours (accès coach),
   trace la date du retrait et la version des textes acceptés (RGPD, art. 7(1)). */
export async function withdrawConsent(code) {
  if (!state.parcours[code]) return; // pas de parcours fantôme sans code ni prénom (BUG-21)
  clearWarmupDebrief(code); // le ressenti déclaré part avec les réponses (BUG-20)
  const takes = Object.values(state.takes).filter(t => t.code === code);
  for (const t of takes) await deleteVideo(t.id);
  const nextTakes = { ...state.takes };
  takes.forEach(t => delete nextTakes[t.id]);
  const prev = state.parcours[code];
  write({ ...state, takes: nextTakes, parcours: { ...state.parcours, [code]: { ...prev, consent: null, consentWithdrawnAt: new Date().toISOString(), consentHistory: [...(prev?.consentHistory || []), ...(prev?.consent ? [{ ...prev.consent, withdrawnAt: new Date().toISOString() }] : [])] } } });
}

/* ── Prises ── */
export function takesOf(code, s = state) {
  return Object.values(s.takes).filter(t => t.code === code).sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

/* Rejette si la vidéo ou les métadonnées ne peuvent pas être écrites (ARC-01) : la personne ne croit jamais
   sa réponse gardée alors qu'elle disparaîtra au rechargement. La vidéo déjà posée est alors retirée. */
export async function createTake({ code, question, duration, blob, transcript, segments, gaze, analysis }) {
  const id = uid();
  if (blob) await saveVideo(id, blob);
  const t = {
    id, code, question, duration, transcript, segments, gaze, analysis,
    hasMedia: !!blob, mime: blob?.type || null, // hasVideo dans les anciennes données (lib/takes.js)
    createdAt: new Date().toISOString(),
    shared: false, sharedAt: null, note: "", report: null,
  };
  if (!write({ ...state, takes: { ...state.takes, [id]: t } })) {
    const next = { ...state.takes }; delete next[id]; state = { ...state, takes: next }; notify();
    if (blob) await deleteVideo(id);
    const e = new Error("Stockage plein ou indisponible"); e.code = "stockage"; throw e;
  }
  return id;
}

/* Reprendre un envoi : le coach ne voit plus la réponse, la personne la garde (tant qu'aucun rapport n'est envoyé). */
export function unshareTake(id) {
  const t = state.takes[id];
  if (!t || t.report) return;
  write({ ...state, takes: { ...state.takes, [id]: { ...t, shared: false, sharedAt: null, draft: null } } });
}

/* Rapport du coach (BUG-02) : refusé si la personne a repris son envoi entre-temps (deux onglets, deux appareils).
   Renvoie true si le rapport est enregistré. Production : rpc('envoyer_rapport'), qui refuse de la même façon. */
export function sendReport(id, report) {
  const t = read().takes[id]; // état du stockage, pas la copie en mémoire : la reprise a pu venir d'un autre onglet
  if (!t || !t.shared) return false;
  write({ ...state, takes: { ...state.takes, [id]: { ...t, report, draft: null } } });
  return true;
}

/* Brouillon du coach : ignoré si la réponse n'est plus partagée (le brouillon a été effacé par la reprise). */
export function saveDraft(id, draft) {
  const t = read().takes[id];
  if (!t || !t.shared) return false;
  write({ ...state, takes: { ...state.takes, [id]: { ...t, draft } } });
  return true;
}

export function updateTake(id, patch) {
  const t = state.takes[id];
  if (!t) return;
  write({ ...state, takes: { ...state.takes, [id]: { ...t, ...patch } } });
}

export async function deleteTake(id) {
  await deleteVideo(id);
  const next = { ...state.takes };
  delete next[id];
  write({ ...state, takes: next });
}

/* Statut d'un parcours, calculé à partir des prises. */
export function parcoursStatus(p, s = state) {
  const takes = takesOf(p.code, s);
  const shared = takes.filter(t => t.shared);
  if (shared.some(t => !t.report)) return { key: "toreview", label: "À relire", tone: "warning" };
  if (shared.length) return { key: "sent", label: "Rapport envoyé", tone: "success" };
  if (takes.length || p.openedAt) return { key: "training", label: "S'entraîne", tone: "primary" };
  return { key: "new", label: "Pas encore ouvert", tone: "muted" };
}

/* ── IndexedDB (vidéos) ── */
/* Une seule connexion, gardée (ARC-06) ; refermée si une autre version de la base est ouverte ; rouverte au besoin. */
let dbp = null;
function db() {
  if (!dbp) dbp = new Promise((resolve, reject) => {
    const req = indexedDB.open("larepet", 1);
    req.onupgradeneeded = () => req.result.createObjectStore("videos");
    req.onsuccess = () => {
      const d = req.result;
      d.onversionchange = () => { d.close(); dbp = null; };
      d.onclose = () => { dbp = null; };
      resolve(d);
    };
    req.onerror = () => { dbp = null; reject(req.error); };
    req.onblocked = () => { dbp = null; reject(new Error("Base de données bloquée par un autre onglet")); };
  });
  return dbp;
}
async function tx(mode, fn) {
  const d = await db();
  return new Promise((resolve, reject) => {
    const t = d.transaction("videos", mode);
    const r = fn(t.objectStore("videos"));
    t.oncomplete = () => resolve(r?.result);
    t.onerror = () => reject(t.error);
    t.onabort = () => reject(t.error || new Error("Transaction interrompue")); // quota dépassé, par exemple
  });
}

/* Espace de stockage (ARC-02) : demande de persistance à l'accord (le navigateur peut sinon purger les vidéos),
   estimation de la place libre avant un enregistrement. */
export function requestPersistence() {
  try { return navigator.storage?.persist?.().catch(() => false) ?? Promise.resolve(false); } catch { return Promise.resolve(false); }
}
export async function freeSpace() {
  try { const e = await navigator.storage?.estimate?.(); return e && e.quota ? e.quota - (e.usage || 0) : null; } catch { return null; }
}
export const saveVideo = (id, blob) => tx("readwrite", s => s.put(blob, id));
export const deleteVideo = id => tx("readwrite", s => s.delete(id)).catch(() => {});
export async function loadVideoUrl(id) {
  const blob = await tx("readonly", s => s.get(id));
  return blob ? URL.createObjectURL(blob) : null;
}

/* ── Questionnaire de fin d'échauffement ──
   Clé séparée ("larepet.warmup.CODE") : ces réponses restent sur l'appareil, elles ne font pas partie
   des données partagées avec le coach et ne sont pas destinées à remonter vers un serveur. */
const WARMUP_KEY = code => `larepet.warmup.${code}`;
export function saveWarmupDebrief(code, data) {
  try { localStorage.setItem(WARMUP_KEY(code), JSON.stringify({ ...data, at: new Date().toISOString() })); } catch { /* mode privé */ }
}
export function loadWarmupDebrief(code) {
  try { return JSON.parse(localStorage.getItem(WARMUP_KEY(code)) || "null"); } catch { return null; }
}
export function clearWarmupDebrief(code) {
  try { localStorage.removeItem(WARMUP_KEY(code)); } catch { /* mode privé */ }
}

/* ── Portabilité (RGPD, art. 20 ; B7) ──
   Fichier JSON lisible, avec des clés en français : parcours, accord, questionnaire d'échauffement, réponses (texte,
   retour de l'assistant, message et rapport du coach). Les vidéos et enregistrements de voix se téléchargent à part
   (mediaFileName donne le nom de chaque fichier, repris dans le JSON). Rien n'est envoyé : tout est lu sur l'appareil. */
const mmss = t => { const s = Math.max(0, Math.round(t || 0)); return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`; };
const mediaKind = t => (!(t.hasMedia ?? t.hasVideo) ? null : (t.mime || "").startsWith("audio") ? "voix" : "vidéo");
export function mediaFileName(t) {
  const ext = (t.mime || "").includes("mp4") ? (mediaKind(t) === "voix" ? "m4a" : "mp4") : "webm";
  return `la-repet-reponse-${(t.createdAt || "").slice(0, 10)}-${t.id}.${ext}`;
}
export function exportData(code, s = state) {
  const p = s.parcours[code];
  if (!p) return null;
  const takes = takesOf(code, s).slice().reverse(); // de la plus ancienne à la plus récente
  return {
    fichier: "Vos données de La Répét'",
    exporteLe: new Date().toISOString(),
    aSavoir: "Ce fichier a été créé sur votre appareil, à partir des données gardées dans ce navigateur. Les vidéos et enregistrements de voix sont des fichiers à part.",
    parcours: {
      code: p.code, prenom: p.prenom, metierOuPosteVise: p.poste || "", typeEntretien: p.type === "mobilite" ? "mobilité" : "embauche",
      coach: p.counselor || "", creeLe: p.createdAt || null, ouvertLe: p.openedAt || null,
      accord: p.consent ? { donneLe: p.consent.at, enregistrementSurCetAppareil: !!p.consent.local, retourDeLAssistant: !!p.consent.ai, versionDesTextes: p.consent.version || null } : null,
      accordsPrecedents: (p.consentHistory || []).map(c => ({ donneLe: c.at, retireLe: c.withdrawnAt || null, retourDeLAssistant: !!c.ai, versionDesTextes: c.version || null })),
    },
    questionnaireEchauffement: loadWarmupDebrief(code),
    reponses: takes.map(t => ({
      question: t.question, enregistreeLe: t.createdAt, dureeSecondes: Math.round(t.duration || 0),
      enregistrement: mediaKind(t), fichierEnregistrement: mediaKind(t) ? mediaFileName(t) : null,
      texteDeLaReponse: t.transcript || "",
      texteHorodate: (t.segments || []).map(x => ({ debut: mmss(x.start), fin: mmss(x.end), texte: x.text })),
      retourDeLAssistant: t.analysis && t.analysis.source !== "none" ? {
        redigePar: t.analysis.source === "llm" ? "assistant IA, à partir des mesures faites sur l'appareil" : "assistant de l'appareil",
        synthese: t.analysis.synthese,
        reperes: (t.analysis.dimensions || []).map(d => ({ repere: d.titre, nature: d.type === "appui" ? "point d'appui" : "piste à explorer", moment: mmss(d.t), observation: d.observation, conseil: d.conseil })),
      } : null,
      envoyeeAuCoach: !!t.shared, envoyeeLe: t.sharedAt || null, messageAuCoach: t.note || "",
      rapportDuCoach: t.report ? {
        par: t.report.by || "", envoyeLe: t.report.sentAt || null, introduction: t.report.intro || "",
        remarquesSurLesReperes: Object.entries(t.report.comments || {}).filter(([, v]) => (v || "").trim()).map(([id, v]) => ({ repere: (t.analysis?.dimensions || []).find(d => d.id === id)?.titre || id, remarque: v })),
        notesHorodatees: (t.report.notes || []).slice().sort((a, b) => a.t - b.t).map(n => ({ moment: mmss(n.t), note: n.text })),
      } : null,
    })),
  };
}
/* Vidéo ou voix d'une réponse, pour le téléchargement (null si absente). */
export const loadMediaBlob = id => tx("readonly", s => s.get(id)).catch(() => null);
