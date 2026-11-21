/* Transcription dans le navigateur (Whisper, ONNX, via transformers.js).
   Le son ne quitte pas l'appareil. Le modèle est téléchargé une fois puis mis en cache par le navigateur. */
import { pipeline, env } from "@huggingface/transformers";
/* Moteur ONNX Runtime servi par le site lui-même (SEC-04, PERF-01) : le fichier .wasm, déjà publié avec le site,
   est enfin celui qui est chargé (transformers.js va sinon le chercher sur cdn.jsdelivr.net). Même version que
   celle fixée par transformers.js 3.8.1 ; le module .mjs est déjà inclus dans le paquet du worker. */
import ortWasm from "../../node_modules/onnxruntime-web/dist/ort-wasm-simd-threaded.jsep.wasm?url";
env.backends.onnx.wasm.wasmPaths = { wasm: new URL(ortWasm, self.location.href).href };

const MODEL = import.meta.env.VITE_WHISPER_MODEL || "onnx-community/whisper-base";
/* Révision du modèle sur Hugging Face : « main » par défaut (dernière version publiée).
   Pour figer une version précise, renseigner VITE_WHISPER_REVISION (identifiant de commit). */
const REVISION = import.meta.env.VITE_WHISPER_REVISION || "main";
if (import.meta.env.VITE_MODELS_BASE_URL) {
  // modèles auto-hébergés (production) : <base>/<modèle>/...
  env.remoteHost = import.meta.env.VITE_MODELS_BASE_URL;
  env.remotePathTemplate = "{model}/";
}

let asr = null;

/* WebGPU seulement si un adaptateur est vraiment disponible (ARC-04) ; en cas d'échec, second essai en WebAssembly. */
async function load(post) {
  const opts = device => ({
    revision: REVISION,
    dtype: { encoder_model: "fp32", decoder_model_merged: "q8" },
    device,
    progress_callback: p => { if (p.status === "progress") post({ type: "progress", stage: "model", value: Math.round(p.progress || 0) }); },
  });
  const gpu = navigator.gpu ? await navigator.gpu.requestAdapter().catch(() => null) : null;
  if (gpu) {
    try { return await pipeline("automatic-speech-recognition", MODEL, opts("webgpu")); }
    catch (e) { console.warn("[whisper] WebGPU indisponible, repli sur WebAssembly", e); }
  }
  return pipeline("automatic-speech-recognition", MODEL, opts("wasm"));
}

self.onmessage = async ({ data }) => {
  const post = m => self.postMessage({ ...m, id: data.id });
  try {
    if (!asr) asr = await load(post);
    post({ type: "progress", stage: "transcribe", value: 0 });
    /* no_repeat_ngram_size : aucune suite de 3 mots (jetons) ne peut revenir dans une même fenêtre, ce qui coupe les
       boucles de répétition de Whisper (B3). Les boucles qui passeraient d'une fenêtre à l'autre sont retirées ensuite
       par src/lib/repetitions.js. repetition_penalty, essayé aussi, abîme le reste du texte : non retenu. */
    const out = await asr(data.audio, {
      language: "french", task: "transcribe",
      return_timestamps: true, chunk_length_s: 30, stride_length_s: 5,
      no_repeat_ngram_size: 3,
    });
    const segments = (out.chunks || [{ timestamp: [0, data.duration], text: out.text }]).map(c => ({
      start: c.timestamp?.[0] ?? 0,
      end: c.timestamp?.[1] ?? c.timestamp?.[0] ?? 0,
      text: (c.text || "").trim(),
    })).filter(s => s.text);
    post({ type: "done", text: out.text.trim(), segments });
  } catch (e) {
    asr = null;
    post({ type: "error", message: String(e?.message || e) });
  }
};
