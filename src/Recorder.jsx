import React, { useEffect, useRef, useState } from "react";
import { T, FIX, ON, TY, RAD, W, GAP, GRAD_NIGHT, Btn, Back, Icon, I, BrandLoader, Notice } from "./ui.jsx";
import { PHRASES } from "./content/legal.js";
import StageIdle from "./StageIdle.jsx";
import { setRecording, nudgeAssistant } from "./lib/bus.js";
import { useLeaveGuard } from "./lib/hooks.js";
import { openStream, mediaError, watchEnded } from "./lib/media.js";
import { freeSpace } from "./lib/store.js";

const MAX_SEC = 180;

/* Suivi du regard chargé au premier enregistrement vidéo (PERF-02) : MediaPipe n'est téléchargé que s'il sert. */
function lazyGaze(video, t0) {
  const g = { inner: null, stopped: false, stop() { this.stopped = true; const r = this.inner ? this.inner.stop() : null; this.inner = null; return r; } };
  import("./lib/gaze.js").then(m => { if (!g.stopped) g.inner = m.startGaze(video, t0); }).catch(e => console.warn("[regard] suivi indisponible", e));
  return g;
}

function pickMime(audioOnly) {
  const list = audioOnly
    ? ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]
    : ["video/webm;codecs=vp8,opus", "video/webm", "video/mp4"];
  return list.find(m => window.MediaRecorder && MediaRecorder.isTypeSupported(m)) || "";
}

/* Enregistreur : caméra + micro, ou micro seul.
   onDone({ blob, duration, gaze, audioOnly }) est appelé quand la personne valide sa prise.
   beforeStart : appelé au démarrage (le recruteur oral se tait, BUG-10) ; speaking : la question est en cours de lecture. */
export default function Recorder({ onDone, onCancel, trackGaze = true, setModal, validateLabel = "Garder cette réponse", speaking = false, beforeStart }) {
  const liveRef = useRef(null), streamRef = useRef(null), recRef = useRef(null), chunks = useRef([]);
  const gazeRef = useRef(null), t0 = useRef(0), urlRef = useRef(null), alive = useRef(true), unwatch = useRef(null);
  const [phase, setPhase] = useState("idle"); // idle | live | recording | stopping | done | error
  const [audioOnly, setAudioOnly] = useState(false);
  const [sec, setSec] = useState(0);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null); // { title, text }
  const [lowSpace, setLowSpace] = useState(false);
  useLeaveGuard(phase === "recording" || phase === "stopping" || phase === "done");

  /* Démontage (ARC-05) : enregistrement interrompu sans rappel, URL de la vidéo libérée, suivi du regard arrêté. */
  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
      const rec = recRef.current;
      if (rec) { rec.ondataavailable = null; rec.onstop = null; if (rec.state === "recording") try { rec.stop(); } catch { /* déjà arrêté */ } }
      gazeRef.current?.stop(); gazeRef.current = null;
      stopStream(); setRecording(false);
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    };
  }, []); // eslint-disable-line

  function stopStream() { unwatch.current?.(); unwatch.current = null; streamRef.current?.getTracks().forEach(t => t.stop()); streamRef.current = null; }
  function fail(e) { setError(mediaError(e)); setPhase("error"); }

  async function open(audio) {
    setError(null);
    try {
      const stream = await openStream(audio);
      if (!alive.current) { stream.getTracks().forEach(t => t.stop()); return; }
      streamRef.current = stream;
      /* Piste arrêtée en cours de route (autorisation retirée, appareil débranché) : arrêt propre (BUG-24). */
      unwatch.current = watchEnded(stream, () => { if (recRef.current?.state === "recording") stop(); else { stopStream(); fail({ name: "ended" }); } });
      setAudioOnly(audio);
      setPhase("live");
      setRecording(true); // bouton flottant masqué tant que la caméra ou le micro est ouvert : il ne couvre aucune commande
      setTimeout(() => { if (liveRef.current && !audio) { liveRef.current.srcObject = stream; liveRef.current.play().catch(() => {}); } }, 0);
      /* Moins de 50 Mo libres (ARC-02) : prévenir, une vidéo de 3 minutes pèse environ 15 Mo. */
      const free = await freeSpace();
      if (alive.current) setLowSpace(free != null && free < 50e6 && !audio);
    } catch (e) {
      fail(e);
    }
  }

  function start() {
    beforeStart?.();
    chunks.current = [];
    const mimeType = pickMime(audioOnly);
    let rec;
    try {
      rec = new MediaRecorder(streamRef.current, { mimeType: mimeType || undefined, videoBitsPerSecond: 600_000, audioBitsPerSecond: 64_000 });
    } catch (e) {
      console.error(e); stopStream(); fail({ name: "NotSupportedError" }); return;
    }
    rec.ondataavailable = e => e.data.size && chunks.current.push(e.data);
    rec.onstop = () => {
      if (!alive.current) return;
      const duration = (performance.now() - t0.current) / 1000;
      const blob = new Blob(chunks.current, { type: rec.mimeType || mimeType || (audioOnly ? "audio/webm" : "video/webm") });
      const gaze = gazeRef.current ? gazeRef.current.stop() : null;
      gazeRef.current = null;
      if (urlRef.current) URL.revokeObjectURL(urlRef.current);
      urlRef.current = URL.createObjectURL(blob);
      setResult({ blob, duration, gaze, url: urlRef.current });
      setPhase("done");
      stopStream();
      nudgeAssistant("record"); // la bulle apparaît quand on quitte l'enregistreur
    };
    try { rec.start(1000); } catch (e) { console.error(e); stopStream(); fail({ name: "NotSupportedError" }); return; }
    recRef.current = rec;
    t0.current = performance.now();
    setSec(0);
    if (trackGaze && !audioOnly && liveRef.current) gazeRef.current = lazyGaze(liveRef.current, t0.current);
    setPhase("recording");
    setRecording(true);
  }

  function stop() { if (recRef.current?.state === "recording") { setPhase("stopping"); recRef.current.stop(); } }

  /* Minuterie fondée sur l'horloge (BUG-23) : juste même si l'onglet passe en arrière-plan ; arrêt à 3 minutes. */
  useEffect(() => {
    if (phase !== "recording") return;
    const i = setInterval(() => {
      const n = Math.floor((performance.now() - t0.current) / 1000);
      setSec(Math.min(n, MAX_SEC));
      if (n >= MAX_SEC) stop();
    }, 500);
    return () => clearInterval(i);
  }, [phase]); // eslint-disable-line

  function redo() {
    if (urlRef.current) { URL.revokeObjectURL(urlRef.current); urlRef.current = null; }
    setResult(null);
    open(audioOnly);
  }

  /* Annonces pour les lecteurs d'écran (A11Y-08) : début, 30 dernières secondes, fin de l'enregistrement. */
  const said = phase === "recording" ? (sec >= MAX_SEC - 30 ? "Il reste 30 secondes." : "Enregistrement en cours.")
    : phase === "done" ? "Enregistrement terminé. Vous pouvez l'écouter, recommencer ou continuer." : "";
  const mm = String(Math.floor(sec / 60)).padStart(2, "0"), ss = String(sec % 60).padStart(2, "0");

  const pill = { position: "absolute", top: 12, display: "flex", alignItems: "center", gap: 8, height: 32, padding: "0 12px", borderRadius: RAD.pill, color: ON.text };
  return (
    <div style={{ display: "grid", gap: 16 }}>
      <div role="status" className="rp-sr">{said}</div>

      <div style={{ position: "relative", borderRadius: RAD.lg, overflow: "hidden", aspectRatio: "16/9", background: GRAD_NIGHT }}>
        <video ref={liveRef} muted playsInline aria-label="Aperçu de votre caméra" style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scaleX(-1)", display: (phase === "live" || phase === "recording") && !audioOnly ? "block" : "none" }} />

        {phase === "stopping" && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", background: T.surface }}>
            <BrandLoader label="Préparation de votre enregistrement…" size={64} />
          </div>
        )}
        {phase === "done" && result && (audioOnly
          ? <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center" }}><audio src={result.url} controls aria-label="Votre enregistrement, avant de le garder" style={{ width: "80%" }} /></div>
          : <video src={result.url} controls playsInline aria-label="Votre vidéo, avant de la garder" style={{ width: "100%", height: "100%", objectFit: "contain", background: T.videoBg }} />)}

        {(phase === "idle" || phase === "error") && (
          <StageIdle title={phase === "error" ? error?.title : "Quand vous voulez"} text={phase === "error" ? error?.text : "L'image reste sur votre appareil. Vous pouvez aussi répondre en voix seule."} onCamera={() => open(false)} onVoice={() => open(true)} voiceLabel="Voix seule" pad={24} />
        )}

        {(phase === "live" || phase === "recording") && audioOnly && (
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", color: ON.text }}>
            <div style={{ textAlign: "center", display: "grid", justifyItems: "center", gap: 8 }}><Icon d={I.mic} s={40} /><div style={{ ...TY.label }}>Voix seule</div></div>
          </div>
        )}

        {phase === "recording" && (
          <div style={{ ...pill, left: 12, background: ON.scrim }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, animation: "blink 1.1s infinite" }} />
            <span style={{ ...TY.time, color: ON.text }}>{mm}:{ss}</span>
            <span style={{ ...TY.time, color: ON.text }}>/ 03:00</span>
          </div>
        )}
        {(phase === "live" || phase === "recording") && (
          <div style={{ ...pill, right: 12, background: FIX.successDk, ...TY.tag }}>
            <Icon d={I.lock} s={12} /> Reste sur cet appareil
          </div>
        )}
      </div>

      {lowSpace && phase === "live" && (
        <Notice tone="warning">Il reste peu de place sur cet appareil. Une vidéo de 3 minutes pèse environ 15 Mo : vous pouvez choisir « Voix seule », plus légère.</Notice>
      )}
      {setModal && (
        <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 8, flexWrap: "wrap", ...TY.caption, color: T.muted }}>
          <Icon d={I.lock} s={16} /> {PHRASES.camera}
          <Btn kind="ghost" size="sm" icon={I.shield} onClick={() => setModal("video")}>Que devient ma vidéo ?</Btn>
        </div>
      )}

      <div className="rp-actions" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: GAP.actions }}>
        {onCancel ? <Back onClick={() => { stop(); stopStream(); onCancel(); }} /> : <span />}
        {phase === "live" && (
          <div style={{ display: "grid", gap: 4, justifyItems: "end" }}>
            <Btn kind="objective" onClick={start} icon={I.rec}>Démarrer l'enregistrement</Btn>
            {speaking && <span role="status" style={{ ...TY.caption, color: T.muted }}>La question est en cours de lecture. Démarrer arrête la voix.</span>}
          </div>
        )}
        {phase === "recording" && <Btn kind="secondary" onClick={stop} icon={I.stop}>Arrêter l'enregistrement</Btn>}
        {phase === "done" && (
          <div className="rp-actions" style={{ display: "flex", gap: GAP.actions, flexWrap: "wrap" }}>
            <Btn kind="secondary" onClick={redo} icon={I.redo}>Recommencer</Btn>
            <Btn kind={trackGaze ? "ai" : "objective"} onClick={() => onDone({ ...result, audioOnly })} iconRight={I.arrow}>{validateLabel}</Btn>
          </div>
        )}
      </div>
    </div>
  );
}
