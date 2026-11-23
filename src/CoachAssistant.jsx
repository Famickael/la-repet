import React, { useEffect, useRef, useState } from "react";
import { T, TY, RAD, GAP, Btn, Chip, Textarea, Fab, Txt, Notice, I, RadioGroup } from "./ui.jsx";
import { DockPanel } from "./Assistant.jsx";
import { coachSuggest, MODES, DIM_LABELS } from "./lib/coachAssistant.js";
import { fmt } from "./lib/analysis.js";

/* Assistant de rédaction du rapport (côté coach), dans le même panneau latéral que l'assistant
   de préparation (DockPanel) : bouton flottant, bordure en dégradé, Échap, focus géré.
   Il propose ; le coach choisit où insérer chaque proposition (mot d'introduction, remarque sur une
   observation, note horodatée au moment courant de la vidéo), puis relit le rapport avant de l'envoyer.
   Toutes les propositions passent par coachCompliant() (src/lib/coachAssistant.js). */

const lcfirst = s => s.charAt(0).toLowerCase() + s.slice(1);
/* Une piste d'atelier (à l'infinitif) devient une phrase adressée à la personne. */
const forWorkshop = t => `Lors de notre prochain atelier, je vous propose ${/^[aeiouyéèêh]/i.test(t) ? "d'" : "de "}${lcfirst(t)}`;

export default function CoachAssistantDock({ prenom, question, poste, dims, intro, comments, getTime, onInsert }) {
  const [open, setOpen] = useState(false);
  const fab = useRef(null);
  /* Fermé quand le panneau « Mon compte » s'ouvre (les deux panneaux ne s'ouvrent jamais ensemble). */
  useEffect(() => { const on = e => { if (e.detail?.action === "close") setOpen(false); }; window.addEventListener("rp-assistant", on); return () => window.removeEventListener("rp-assistant", on); }, []);
  return (<>
    <DockPanel id="coach-asst" title="Assistant de rédaction du rapport" open={open} onClose={() => setOpen(false)} returnFocus={fab}>
      <CoachPanel prenom={prenom} question={question} poste={poste} dims={dims} intro={intro} comments={comments} getTime={getTime} onInsert={onInsert} />
    </DockPanel>
    {!open && <Fab ref={fab} icon={I.sparkle} className="noprint" label="Ouvrir l'assistant de rédaction du rapport" aria-expanded={false} aria-controls="coach-asst" onClick={() => setOpen(true)} />}
  </>);
}

function CoachPanel({ prenom, question, poste, dims, intro, comments, getTime, onInsert }) {
  const [mode, setMode] = useState("tips");
  const usable = dims.filter(d => DIM_LABELS[d.id]);
  const [dimId, setDimId] = useState(usable.find(d => d.type === "explorer")?.id || usable[0]?.id || null);
  const [page, setPage] = useState(0);
  const [draft, setDraft] = useState("");
  const [res, setRes] = useState({ items: [] });
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [, tick] = useState(0);
  const alive = useRef(true);
  useEffect(() => () => { alive.current = false; }, []);
  useEffect(() => { const t = setInterval(() => tick(k => k + 1), 1000); return () => clearInterval(t); }, []); // moment courant de la vidéo

  const run = async (over = {}) => {
    const ctx = { mode, dimId, dims: usable, question, poste, prenom, page, text: draft, ...over };
    if (ctx.mode === "rephrase" && !String(ctx.text).trim()) { setRes({ items: [] }); return; }
    setBusy(true);
    const r = await coachSuggest(ctx);
    if (!alive.current) return;
    setRes(r); setBusy(false);
  };
  useEffect(() => { if (mode !== "rephrase") run(); else setRes({ items: [] }); setStatus(""); }, [mode, dimId, page]); // eslint-disable-line

  const dim = usable.find(d => d.id === dimId);
  const time = getTime();
  const insert = (target, item) => {
    const text = mode === "debrief" ? forWorkshop(item.text) : item.text;
    const where = onInsert(target, text, item.dimId || dimId);
    if (where) setStatus(`Ajouté ${where}. Relisez le rapport avant de l'envoyer.`);
  };
  const reuse = [
    intro.trim() && ["Mon mot d'introduction", intro],
    ...usable.filter(d => (comments[d.id] || "").trim()).map(d => [`Ma remarque : ${d.titre}`, comments[d.id]]),
  ].filter(Boolean);

  return (<>
    <div style={{ flex: 1, minHeight: 0, overflowY: "auto", padding: "16px 16px 8px", display: "grid", gap: 16, alignContent: "start" }}>
      <Txt v="small" color={T.body}>Des propositions à relire et à adapter. Elles s'insèrent dans votre brouillon : rien n'est envoyé à {prenom || "la personne"} sans vous.</Txt>
      <RadioGroup aria-label="Ce que vous voulez rédiger" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
        {MODES.map(([id, l]) => <Chip key={id} role="radio" on={mode === id} onClick={() => { setMode(id); setPage(0); }}>{l}</Chip>)}
      </RadioGroup>

      {(mode === "tips" || mode === "positive") && usable.length > 0 && (
        <div style={{ display: "grid", gap: 8 }}>
          <div id="coach-asst-dim" style={{ ...TY.label, color: T.navy }}>Repère de l'assistant</div>
          <RadioGroup aria-labelledby="coach-asst-dim" style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {usable.map(d => <Chip key={d.id} role="radio" tone="ai" on={dimId === d.id} onClick={() => { setDimId(d.id); setPage(0); }}>{d.titre}</Chip>)}
          </RadioGroup>
        </div>
      )}

      {mode === "rephrase" && (
        <div style={{ display: "grid", gap: 8 }}>
          <label htmlFor="coach-asst-text" style={{ ...TY.label, color: T.navy }}>Votre remarque à reformuler</label>
          {reuse.length > 0 && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Reprendre une saisie du rapport">
              {reuse.map(([l, v]) => <Chip key={l} check={false} onClick={() => setDraft(v)}>{l}</Chip>)}
            </div>
          )}
          <Textarea id="coach-asst-text" value={draft} onChange={e => setDraft(e.target.value)} maxLength={1200} placeholder="Par exemple : tu parles trop vite, il faut ralentir." />
          <Btn kind="ai" disabled={!draft.trim() || busy} onClick={() => run({ mode: "rephrase" })} icon={I.sparkle}>Reformuler</Btn>
        </div>
      )}

      {mode === "debrief" && <Txt v="caption" color={T.muted}>Pistes pour votre atelier. Insérées dans le rapport, elles deviennent une proposition adressée à {prenom || "la personne"}.</Txt>}

      <div role="status" aria-live="polite" style={{ display: "grid", gap: 8 }}>
        {busy && <Txt v="small" color={T.violet}>L'assistant prépare des propositions…</Txt>}
        {!busy && status && <Notice tone="success">{status}</Notice>}
        {!busy && res.note && <Notice tone="ai">{res.note}</Notice>}
      </div>

      {!busy && res.items.length > 0 && (
        <ul aria-label="Propositions de l'assistant" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: GAP.stack }}>
          {res.items.map((it, i) => (
            <li key={`${page}-${i}-${it.text.slice(0, 20)}`} className="rp-coach-sugg" style={{ background: T.violetBg, borderRadius: RAD.sm, padding: 12, display: "grid", gap: 8 }}>
              <p style={{ ...TY.small, color: T.navy, margin: 0 }}>{it.text}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }} role="group" aria-label="Insérer cette proposition">
                <Btn kind="secondary" size="sm" icon={I.plus} onClick={() => insert("intro", it)}>Dans l'introduction</Btn>
                {(it.dimId || dim) && mode !== "debrief" && mode !== "intro" && (
                  <Btn kind="secondary" size="sm" icon={I.plus} onClick={() => insert("comment", it)} aria-label={`Sur le repère : ${(usable.find(d => d.id === (it.dimId || dimId)) || {}).titre || ""}`}>Sur le repère</Btn>
                )}
                <Btn kind="secondary" size="sm" icon={I.plus} onClick={() => insert("note", it)} aria-label={`En remarque à ${fmt(time)} de la vidéo`}>Remarque à {fmt(time)}</Btn>
              </div>
            </li>
          ))}
        </ul>
      )}
      {!busy && mode !== "rephrase" && res.items.length > 0 && <div><Btn kind="ghost" size="sm" icon={I.redo} onClick={() => setPage(p => p + 1)}>Autres propositions</Btn></div>}
    </div>
    <div style={{ padding: "8px 16px 16px", borderTop: `1px solid ${T.lineLt}` }}>
      <Txt v="caption" color={T.muted}>Sans note, sans émotion supposée, sans jugement sur la personne : les propositions qui ne respectent pas ces règles sont écartées.</Txt>
    </div>
  </>);
}
