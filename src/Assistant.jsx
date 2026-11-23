import React, { useEffect, useRef, useState } from "react";
import { T, TY, RAD, Btn, Chip, Input, IconBtn, Fab, Link, I } from "./ui.jsx";
import { askAssistant, CONTEXT_SUGGESTIONS } from "./lib/assistant.js";
import { PHRASES } from "./content/legal.js";

/* Assistant de préparation d'entretien : panneau latéral ouvert depuis le bord de l'écran,
   disponible partout dans l'espace bénéficiaire. Bouton flottant, petite bulle d'invitation
   (à l'ouverture de la page, à la fin d'un enregistrement ou d'un échauffement), qu'on peut fermer
   et qui ne revient pas en boucle. Aucune note, aucune déduction émotionnelle.

   Commandes depuis n'importe quel écran : src/lib/bus.js (openAssistant, closeAssistant, nudgeAssistant, setRecording). */
import { ASSISTANT_EVENT as EV } from "./lib/bus.js";
export { openAssistant, nudgeAssistant, closeAssistant, setRecording } from "./lib/bus.js";

const NUDGE_KEY = "larepet.nudges";
const readNudges = () => { try { return JSON.parse(sessionStorage.getItem(NUDGE_KEY) || "null") || { off: false, seen: [] }; } catch { return { off: false, seen: [] }; } };
const writeNudges = v => { try { sessionStorage.setItem(NUDGE_KEY, JSON.stringify(v)); } catch { /* stockage indisponible */ } };

const INTRO = "Bonjour ! Je suis l'assistant de préparation d'entretien. Je suis un programme, pas une personne. Posez-moi une question, puis demandez-moi un exemple si vous voulez.";

export default function AssistantDock({ poste, context = "general" }) {
  const [open, setOpen] = useState(false);
  const [ctx, setCtx] = useState(context);
  const [bubble, setBubble] = useState(false);
  const [recording, setRec] = useState(false);
  const [ctxKey, setCtxKey] = useState(0); // change à chaque ouverture depuis un écran : les suggestions suivent l'écran
  const fab = useRef(null), openRef = useRef(false), recRef = useRef(false), pending = useRef(false);
  openRef.current = open; recRef.current = recording;
  useEffect(() => { setCtx(context); }, [context]);

  const nudge = reason => {
    if (openRef.current) return;
    const n = readNudges();
    if (n.off || n.seen.includes(reason)) return;
    writeNudges({ ...n, seen: [...n.seen, reason] });
    if (recRef.current) { pending.current = true; return; } // affichée à la sortie de l'enregistreur
    setBubble(true);
  };
  useEffect(() => {
    const on = e => {
      const d = e.detail || {};
      if (d.action === "open") { if (d.context) setCtx(d.context); setCtxKey(k => k + 1); setBubble(false); setOpen(true); }
      if (d.action === "close") { setOpen(false); setBubble(false); }
      if (d.action === "nudge") nudge(d.reason);
      if (d.action === "recording") { setRec(!!d.on); if (!d.on && pending.current) { pending.current = false; setBubble(true); } }
    };
    window.addEventListener(EV, on);
    const t = setTimeout(() => nudge("open"), 1200);
    return () => { window.removeEventListener(EV, on); clearTimeout(t); };
  }, []); // eslint-disable-line
  useEffect(() => { if (!bubble) return; const t = setTimeout(() => setBubble(false), 15000); return () => clearTimeout(t); }, [bubble]);

  const close = () => setOpen(false);
  const dismissBubble = () => { setBubble(false); writeNudges({ ...readNudges(), off: true }); };

  return (<>
    <DockPanel id="asst-panel" title="Assistant de préparation d'entretien" open={open} onClose={close} focusId="asst-panel-input" returnFocus={fab}>
      <Conversation poste={poste} context={ctx} ctxKey={ctxKey} />
    </DockPanel>
    {!open && !recording && bubble && (
      <div className="rp-ai-bubble noprint" role="status">
        <Link onClick={() => { setBubble(false); setOpen(true); }} style={{ ...TY.small, ...TY.link, color: T.navy, textDecoration: "none", textAlign: "left" }}>Une question pour préparer votre entretien ?</Link>
        <IconBtn icon={I.close} label="Fermer la bulle" tone="muted" size={16} onClick={dismissBubble} />
      </div>
    )}
    {!open && !recording && (
      <Fab ref={fab} icon={I.chat} className="noprint" label="Ouvrir l'assistant de préparation d'entretien" aria-expanded={open} aria-controls="asst-panel"
        onClick={() => { setBubble(false); setOpen(true); }} />
    )}
  </>);
}

/* Panneau latéral commun aux deux assistants (préparation côté bénéficiaire, rédaction du rapport côté coach) :
   non modal, bordure en dégradé, Échap ferme, focus envoyé dans le panneau à l'ouverture et rendu au bouton
   flottant à la fermeture ; sur mobile, feuille en bas de l'écran et espace équivalent réservé sous la page. */
export function DockPanel({ id, title, mention = "Assistant IA · ce n'est pas une personne", open, onClose, focusId, returnFocus, children }) {
  const refocus = useRef(false);
  useEffect(() => {
    document.documentElement.classList.toggle("rp-asst-open", open);
    if (!open) return;
    requestAnimationFrame(() => (focusId ? document.getElementById(focusId) : document.querySelector(`#${id} button`))?.focus());
    return () => document.documentElement.classList.remove("rp-asst-open");
  }, [open]); // eslint-disable-line
  useEffect(() => { if (!open && refocus.current) { refocus.current = false; returnFocus?.current?.focus(); } }, [open]); // eslint-disable-line
  const close = () => { refocus.current = true; onClose(); };
  return (
    <div id={id} role="dialog" aria-modal="false" aria-labelledby={`${id}-title`} hidden={!open}
      className={`rp-ai-panel noprint ${open ? "is-in" : ""}`} onKeyDown={e => { if (e.key === "Escape") { e.stopPropagation(); close(); } }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", gap: 8, padding: "16px 12px 12px 20px", borderBottom: `1px solid ${T.line}` }}>
        <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
          <h2 id={`${id}-title`} style={{ ...TY.h3, color: T.navy, margin: 0 }}>{title}</h2>
          <div style={{ ...TY.caption, color: T.violet }}>{mention}</div>
        </div>
        <IconBtn icon={I.close} label="Fermer l'assistant" tone="muted" onClick={close} />
      </div>
      {children}
    </div>
  );
}

/* Fil de conversation : messages, suggestions cliquables, relances (« un exemple ? », « pourquoi ? »). */
function Conversation({ poste, context, ctxKey }) {
  const [msgs, setMsgs] = useState([{ role: "assistant", content: INTRO, suggestions: [] }]);
  const [text, setText] = useState("");
  const [typing, setTyping] = useState(false);
  const [fresh, setFresh] = useState(false);
  useEffect(() => { if (ctxKey) setFresh(true); }, [ctxKey]);
  const memory = useRef({});
  const threadRef = useRef(null);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  useEffect(() => { const el = threadRef.current; if (el) el.scrollTop = el.scrollHeight; }, [msgs, typing]);

  async function send(q) {
    const question = (q ?? text).trim();
    if (!question || typing) return;
    setText(""); setFresh(false);
    const history = [...msgs.map(({ role, content }) => ({ role, content })), { role: "user", content: question }];
    setMsgs(m => [...m, { role: "user", content: question }]);
    setTyping(true);
    /* Le champ n'est jamais bloqué, même si la réponse échoue (ARC-17). */
    try {
      const t0 = performance.now();
      const r = await askAssistant(history, { context, poste, memory: memory.current });
      const wait = Math.max(0, 450 - (performance.now() - t0)); // laisse le temps de voir l'indicateur
      await new Promise(res => setTimeout(res, wait));
      if (!alive.current) return;
      memory.current = r.memory || memory.current;
      setMsgs(m => [...m, { role: "assistant", content: r.text, suggestions: r.suggestions || [] }]);
    } catch (e) {
      console.error("[assistant]", e);
      if (alive.current) setMsgs(m => [...m, { role: "assistant", content: "Je n'ai pas pu répondre. Vous pouvez reposer votre question.", suggestions: [] }]);
    } finally {
      if (alive.current) setTyping(false);
    }
  }

  const last = msgs[msgs.length - 1];
  const chips = typing ? [] : msgs.length === 1 || fresh ? (CONTEXT_SUGGESTIONS[context] || CONTEXT_SUGGESTIONS.general) : last.role === "assistant" ? last.suggestions || [] : [];
  const bubble = mine => ({
    maxWidth: "88%", padding: "8px 12px", ...TY.body, whiteSpace: "pre-line", overflowWrap: "anywhere",
    borderRadius: mine ? `${RAD.md}px ${RAD.md}px ${RAD.xs}px ${RAD.md}px` : `${RAD.md}px ${RAD.md}px ${RAD.md}px ${RAD.xs}px`,
    background: mine ? T.primary : T.violetBg, color: mine ? T.surface : T.navy,
  });
  return (<>
    {/* Zone défilante : le journal (annoncé) ne contient que les messages ; les suggestions sont à côté, non relues
        à chaque réponse (A11Y-19). */}
    <div ref={threadRef} style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 16px 4px", display: "flex", flexDirection: "column", gap: 8 }}>
      <div role="log" aria-live="polite" aria-relevant="additions" aria-label="Conversation avec l'assistant" style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {msgs.map((m, i) => (
          <div key={i} style={{ display: "flex", justifyContent: m.role === "user" ? "flex-end" : "flex-start" }}>
            <div style={bubble(m.role === "user")}><span className="rp-sr">{m.role === "user" ? "Vous : " : "Assistant : "}</span>{m.content}</div>
          </div>
        ))}
        {typing && (
          <div style={{ display: "flex" }}>
            <div style={{ ...bubble(false), display: "inline-flex", alignItems: "center", gap: 8, ...TY.small, color: T.violet }}>
              <span className="rp-dots" aria-hidden><i /><i /><i /></span> L'assistant écrit…
            </div>
          </div>
        )}
      </div>
      {chips.length > 0 && (
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, paddingTop: 4 }} role="group" aria-label="Suggestions de questions">
          {chips.map(c => <Chip key={c} tone="ai" check={false} onClick={() => send(c)}>{c}</Chip>)}
        </div>
      )}
    </div>
    <div style={{ padding: "8px 16px 16px", borderTop: `1px solid ${T.lineLt}`, display: "grid", gap: 8 }}>
      <div style={{ ...TY.caption, color: T.body }}>{PHRASES.assistantChat} {PHRASES.noPersonal}</div>
      <form onSubmit={e => { e.preventDefault(); send(); }} style={{ display: "flex", gap: 8 }}>
        <label htmlFor="asst-panel-input" className="rp-sr">Votre question à l'assistant</label>
        <Input id="asst-panel-input" value={text} onChange={e => setText(e.target.value)} placeholder="Par exemple : comment parler de mes qualités ?" autoComplete="off" maxLength={400} style={{ flex: 1, minWidth: 0 }} />
        <Btn kind="ai" type="submit" disabled={!text.trim() || typing} aria-label="Envoyer la question" icon={I.send} style={{ width: 48, padding: 0 }} />
      </form>
      <div style={{ ...TY.caption, color: T.muted }}>Une question sur le site ? <Link href="#/ressources/faq" target="_blank" rel="noopener">Questions fréquentes (nouvel onglet)</Link></div>
    </div>
  </>);
}
