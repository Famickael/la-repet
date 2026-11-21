/* Transcription d'une prise.
   - Par défaut : Whisper exécuté dans le navigateur (whisper.worker.js), aucun envoi du son.
   - Si VITE_STT_ENDPOINT est défini : envoi du fichier audio à un service de transcription
     hébergé en France, compatible avec le format OpenAI « audio/transcriptions » (verbose_json). */

async function decodeTo16k(blob) {
  const buf = await blob.arrayBuffer();
  const ctx = new (window.AudioContext || window.webkitAudioContext)({ sampleRate: 16000 });
  try {
    const audio = await ctx.decodeAudioData(buf);
    const ch = audio.numberOfChannels > 1
      ? audio.getChannelData(0).map((v, i) => (v + audio.getChannelData(1)[i]) / 2)
      : audio.getChannelData(0);
    return { audio: new Float32Array(ch), duration: audio.duration };
  } finally { ctx.close(); }
}

/* Nom du fichier envoyé selon le format réel (ARC-03) : Safari enregistre en mp4. */
const fileName = blob => {
  const t = blob?.type || "";
  return t.includes("mp4") ? (t.startsWith("audio") ? "reponse.m4a" : "reponse.mp4") : t.includes("ogg") ? "reponse.ogg" : "reponse.webm";
};

async function remote(blob, onProgress) {
  onProgress?.({ stage: "transcribe", value: 0 });
  const form = new FormData();
  form.append("file", blob, fileName(blob));
  form.append("model", import.meta.env.VITE_STT_MODEL || "whisper-1");
  form.append("language", "fr");
  form.append("response_format", "verbose_json");
  form.append("timestamp_granularities[]", "segment");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(import.meta.env.VITE_STT_ENDPOINT, { method: "POST", body: form, signal: ctrl.signal });
    if (!res.ok) throw new Error(`Service de transcription : erreur ${res.status}`);
    const d = await res.json();
    const segments = (d.segments || [{ start: 0, end: d.duration || 0, text: d.text }]).map(s => ({ start: s.start, end: s.end, text: s.text.trim() }));
    return { text: d.text.trim(), segments };
  } finally { clearTimeout(timer); }
}

/* Délai de garde : sans nouvelle du travail (ni progression, ni résultat) pendant 5 minutes, la transcription échoue
   au lieu de tourner sans fin (ARC-03). Chaque message de progression remet le délai à zéro. */
const TIMEOUT_MS = 5 * 60 * 1000;
let worker = null, seq = 0;
const pending = new Map(); // id -> { resolve, reject, onProgress, timer }

function arm(id) {
  const p = pending.get(id); if (!p) return;
  clearTimeout(p.timer);
  p.timer = setTimeout(() => settle(id, null, new Error("La transcription ne répond plus (délai dépassé).")), TIMEOUT_MS);
}
function settle(id, value, error) {
  const p = pending.get(id); if (!p) return;
  clearTimeout(p.timer); pending.delete(id);
  if (error) p.reject(error); else p.resolve(value);
}
function failAll(error) {
  for (const id of [...pending.keys()]) settle(id, null, error);
  worker?.terminate(); worker = null; // un nouveau travail sera créé au prochain essai
}
function getWorker() {
  if (worker) return worker;
  worker = new Worker(new URL("./whisper.worker.js", import.meta.url), { type: "module" });
  worker.onmessage = ({ data }) => {
    const p = pending.get(data.id); if (!p) return;
    if (data.type === "progress") { arm(data.id); p.onProgress?.(data); }
    else if (data.type === "done") settle(data.id, { text: data.text, segments: data.segments });
    else if (data.type === "error") settle(data.id, null, new Error(data.message));
  };
  worker.onerror = e => { e.preventDefault?.(); failAll(new Error(`L'outil de transcription n'a pas pu démarrer${e.message ? ` : ${e.message}` : ""}.`)); };
  worker.onmessageerror = () => failAll(new Error("Message illisible de l'outil de transcription."));
  return worker;
}

export async function transcribe(blob, onProgress) {
  if (import.meta.env.VITE_STT_ENDPOINT) return remote(blob, onProgress);
  const { audio, duration } = await decodeTo16k(blob);
  const w = getWorker();
  const id = ++seq;
  return new Promise((resolve, reject) => {
    pending.set(id, { resolve, reject, onProgress, timer: 0 });
    arm(id);
    w.postMessage({ id, audio, duration }, [audio.buffer]);
  });
}
