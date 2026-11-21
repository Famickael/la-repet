import React, { useEffect, useRef, useState } from "react";
import { T, TY, RAD, GAP, Btn, Icon, I } from "./ui.jsx";
import { prefersReduced } from "./lib/a11y.js";
import { pickFrenchVoice, speechSettings } from "./lib/voice.js";

/* Recruteur oral, sans visage : la question est lue par la meilleure voix française installée sur
   l'appareil (speechSynthesis, voix locales seulement, aucun service externe ; choix dans lib/voice.js). Indicateur discret pendant la lecture,
   sous-titre mot à mot (événements « boundary », repli minuté sinon), boutons « Réécouter »
   et « Couper le son ». Mouvement réduit : pas d'animation, sous-titre complet d'un coup.
   Aucune voix française : repli silencieux, la question reste affichée. */

const MUTE_KEY = "larepet.voix.coupee";
const readMuted = () => { try { return localStorage.getItem(MUTE_KEY) === "1"; } catch { return false; } };
const writeMuted = v => { try { localStorage.setItem(MUTE_KEY, v ? "1" : "0"); } catch { /* stockage indisponible */ } };
export const reducedMotion = () => prefersReduced();

/* Meilleure voix française locale de l'appareil, ou null. Les voix arrivent parfois après le premier appel (voiceschanged). */
function frenchVoice() {
  const s = typeof window !== "undefined" && window.speechSynthesis;
  if (!s) return null;
  return pickFrenchVoice(s.getVoices() || []);
}
function waitVoice(ms = 800) {
  return new Promise(res => {
    const s = window.speechSynthesis;
    if (!s) return res(null);
    const v = frenchVoice(); if (v) return res(v);
    const t = setTimeout(() => { s.removeEventListener?.("voiceschanged", on); res(frenchVoice()); }, ms);
    function on() { clearTimeout(t); s.removeEventListener?.("voiceschanged", on); res(frenchVoice()); }
    s.addEventListener?.("voiceschanged", on);
  });
}

/* label : surtitre ; text : ce qui est lu et sous-titré ; onSpeaking(bool) : la voix parle (l'enregistrement attend). */
export default function RecruiterVoice({ label = "Question du recruteur", text, onSpeaking, autoPlay = true }) {
  const [muted, setMuted] = useState(readMuted);
  const [speaking, setSpeaking] = useState(false);
  const [shown, setShown] = useState(text); // sous-titre (mot à mot pendant la lecture)
  const [available, setAvailable] = useState(true);
  const timer = useRef(0), run = useRef(0), guard = useRef(0);

  const stop = () => {
    run.current++;
    clearInterval(timer.current); clearTimeout(guard.current);
    try { window.speechSynthesis?.cancel(); } catch { /* rien */ }
    setSpeaking(false); onSpeaking?.(false); setShown(text);
  };

  async function speak() {
    stop();
    const id = ++run.current;
    if (muted || !window.speechSynthesis || typeof SpeechSynthesisUtterance === "undefined") return;
    const voice = await waitVoice();
    if (id !== run.current) return;
    if (!voice) { setAvailable(false); return; } // repli silencieux
    const reduced = reducedMotion();
    const words = text.split(/\s+/);
    const u = new SpeechSynthesisUtterance(text);
    const { rate, pitch } = speechSettings(voice);
    u.voice = voice; u.lang = voice.lang || "fr-FR"; u.rate = rate; u.pitch = pitch;
    let gotBoundary = false;
    setSpeaking(true); onSpeaking?.(true); setShown(reduced ? text : "");
    u.onboundary = e => {
      if (reduced || id !== run.current || e.name === "sentence") return;
      gotBoundary = true; clearInterval(timer.current);
      setShown(text.slice(0, e.charIndex + (e.charLength || (text.slice(e.charIndex).match(/^\S+/) || [""])[0].length)));
    };
    const done = () => { if (id !== run.current) return; clearInterval(timer.current); clearTimeout(guard.current); setSpeaking(false); onSpeaking?.(false); setShown(text); };
    u.onend = done; u.onerror = done;
    /* Minuterie de garde (BUG-10) : certains navigateurs coupent un énoncé sans émettre « end ». */
    guard.current = setTimeout(done, 1500 + words.length * 600);
    window.speechSynthesis.speak(u);
    if (!reduced) { // repli si le navigateur ne fournit pas les événements « boundary »
      let i = 0;
      setTimeout(() => {
        if (gotBoundary || id !== run.current) return;
        timer.current = setInterval(() => { i++; setShown(words.slice(0, i).join(" ")); if (i >= words.length) clearInterval(timer.current); }, 330);
      }, 450);
    }
  }

  useEffect(() => { setShown(text); if (autoPlay) speak(); return stop; }, [text]); // eslint-disable-line
  const toggleMute = () => { const m = !muted; setMuted(m); writeMuted(m); if (m) stop(); };

  return (
    <div style={{ background: T.primaryBg, borderRadius: RAD.md, padding: "16px 20px", display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <span aria-hidden className={`rp-voice ${speaking ? "on" : ""}`}><i /><i /><i /><i /></span>
        <span style={{ ...TY.overline, color: T.primary, flex: 1 }}>{label}{speaking ? " · lecture en cours" : ""}</span>
      </div>
      <div aria-hidden="true" style={{ ...TY.h2, color: T.navy, minHeight: "1.25em" }} data-testid="recruiter-subtitle">« {shown || " "} »</div>
      {/* Sous-titre mot à mot masqué aux lecteurs d'écran (A11Y-04) : il serait annoncé mot par mot par-dessus la voix. Le texte complet est lu d'un bloc, sans attendre la fin de la lecture. */}
      <p className="rp-sr">{label} : {text}</p>
      <div style={{ display: "flex", gap: GAP.actions, flexWrap: "wrap" }} className="noprint">
        <Btn kind="ghost" size="sm" icon={I.redo} onClick={speak} disabled={muted || !available}>Réécouter</Btn>
        <Btn kind="ghost" size="sm" aria-pressed={muted} onClick={toggleMute} icon={muted ? I.volume : I.volumeOff}>{muted ? "Réactiver le son" : "Couper le son"}</Btn>
        {!available && <span style={{ ...TY.caption, color: T.body, alignSelf: "center", display: "inline-flex", gap: 8, alignItems: "center" }}><Icon d={I.info} s={16} />La question s'affiche en texte sur cet appareil.</span>}
      </div>
    </div>
  );
}
