import React, { useEffect, useRef, useState } from "react";
import { T, ON, TY, RAD, SH, PAD, GAP, MO, TONE, ringOf, Card, Tag, Bare, Notice, Quote, TimeChip, I } from "./ui.jsx";
import { loadVideoUrl } from "./lib/store.js";
import { fmt } from "./lib/analysis.js";
import { hasMedia, isAudio, noFeedback } from "./lib/takes.js";
import { PHRASES } from "./content/legal.js";

const toneOf = d => (d.type === "appui" ? T.accent : T.violet);

/* Charge l'URL locale de l'enregistrement d'une réponse : { url, status: "loading" | "ready" | "missing" } (UI-10). */
export function useVideoUrl(take) {
  const [st, setSt] = useState({ url: null, status: hasMedia(take) ? "loading" : "missing" });
  useEffect(() => {
    let u = null, alive = true;
    if (!hasMedia(take)) { setSt({ url: null, status: "missing" }); return; }
    setSt({ url: null, status: "loading" });
    loadVideoUrl(take.id)
      .then(x => { if (alive) { u = x; setSt({ url: x, status: x ? "ready" : "missing" }); } else if (x) URL.revokeObjectURL(x); })
      .catch(() => { if (alive) setSt({ url: null, status: "missing" }); });
    return () => { alive = false; if (u) URL.revokeObjectURL(u); };
  }, [take?.id]); // eslint-disable-line
  return st;
}

/* Marqueurs : repères de l'assistant + remarques du coach. */
export function markersOf(take) {
  const dims = (take.analysis?.dimensions || []).map(d => ({ id: d.id, t: d.t, kind: "ia", type: d.type, color: toneOf(d), label: d.titre }));
  const notes = (take.report?.notes || []).map(n => ({ id: n.id, t: n.t, kind: "note", color: T.primary, label: n.text }));
  return [...dims, ...notes].sort((a, b) => a.t - b.t);
}

/* Repère de lecture (référentiel 5.10) : appui rond plein, à explorer rond évidé, note du coach carré.
   La forme distingue autant que la couleur. */
export const Mark = ({ kind, s = 12 }) => (
  <span aria-hidden style={{
    display: "block", width: s, height: s, boxSizing: "border-box", flexShrink: 0,
    borderRadius: kind === "note" ? RAD.xs / 2 : "50%",
    background: kind === "explore" ? T.surface : kind === "note" ? T.primary : T.accent,
    border: kind === "explore" ? `3px solid ${T.violet}` : `2px solid ${T.surface}`, boxShadow: SH.xs,
  }} />
);
const kindOf = m => (m.kind === "note" ? "note" : m.type === "appui" ? "appui" : "explore");

/* Lecteur avec barre de repères cliquables (repère et moment de la vidéo liés). */
export function Player({ take, url, status = url ? "ready" : "missing", markers, active, onActive, playerRef }) {
  const local = useRef(null);
  const ref = playerRef || local;
  const [cur, setCur] = useState(0);
  const dur = Math.max(take.duration || 1, 1);

  useEffect(() => {
    const v = ref.current; if (!v) return;
    const on = () => {
      setCur(v.currentTime);
      const m = [...markers].reverse().find(x => v.currentTime >= x.t - 0.3);
      if (m && onActive && !v.paused) onActive(m.id);
    };
    v.addEventListener("timeupdate", on);
    return () => v.removeEventListener("timeupdate", on);
  }, [markers, url]);

  const seek = (t, id) => {
    if (id && onActive) onActive(id);
    const v = ref.current; if (!v) return;
    v.currentTime = Math.max(0, Math.min(t, dur - 0.1));
    v.play().catch(() => {});
  };

  const audio = isAudio(take);
  return (
    <Card pad="none">
      <div style={{ background: T.videoBg, aspectRatio: audio ? "auto" : "16/9", display: "grid", placeItems: "center", padding: audio ? PAD.md : 0 }}>
        {url
          ? (audio
            ? <audio ref={ref} src={url} controls aria-label="Enregistrement de la réponse" style={{ width: "90%" }} />
            : <video ref={ref} src={url} controls playsInline aria-label="Vidéo de la réponse" style={{ width: "100%", height: "100%", objectFit: "contain" }} />)
          : status === "loading" ? <div role="status" className="rp-pad-lg" style={{ ...TY.small, color: ON.text, padding: PAD.lg }}>Chargement de votre enregistrement…</div>
          : <div className="rp-pad-lg" style={{ ...TY.small, color: ON.text, padding: PAD.lg }}>{audio ? "Enregistrement non disponible sur cet appareil." : "Vidéo non disponible sur cet appareil."}</div>}
      </div>
      <div style={{ padding: PAD.sm, display: "grid", gap: 8 }}>
        <div style={{ position: "relative", height: 44 }}>
          {/* Barre au pointeur seulement (A11Y-09) : au clavier, les commandes natives et les repères suffisent */}
          <Bare tabIndex={-1} aria-hidden="true" onClick={e => { const r = e.currentTarget.getBoundingClientRect(); seek(((e.clientX - r.left) / r.width) * dur); }}
            style={{ position: "absolute", left: 0, right: 0, top: 0, bottom: 0, display: "flex", alignItems: "center" }}>
            <span style={{ position: "relative", display: "block", width: "100%", height: 8, background: T.lineLt, borderRadius: RAD.pill }}>
              <span style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${Math.min(100, (cur / dur) * 100)}%`, background: T.primary, borderRadius: RAD.pill }} />
            </span>
          </Bare>
          {spread(markers, dur).map(({ m, dx }) => (
            <Bare key={m.id} title={`${fmt(m.t)} · ${m.label}`} aria-label={`Aller à ${fmt(m.t)} : ${m.label}`} onClick={() => seek(m.t, m.id)}
              style={{ position: "absolute", left: `${Math.min(100, (m.t / dur) * 100)}%`, top: 0, width: 44, height: 44, transform: `translate(calc(-50% + ${dx}px), ${m.kind === "note" ? -8 : 0}px)`, display: "grid", placeItems: "center" }}>
              <span style={{ borderRadius: m.kind === "note" ? RAD.xs : "50%", boxShadow: active === m.id ? ringOf(m.kind === "note" ? T.primaryBg : m.type === "appui" ? T.accentBg : T.violetBg) : "none" }}>
                <Mark kind={kindOf(m)} s={m.kind === "note" ? 12 : 16} />
              </span>
            </Bare>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", ...TY.time, color: T.muted }}><span>{fmt(cur)}</span><span>{fmt(dur)}</span></div>
        {/* Légende des seuls repères présents (aucune légende « Point d'appui » sans retour de l'assistant) */}
        {markers.length > 0 && (
          <div style={{ display: "flex", gap: 16, flexWrap: "wrap", ...TY.caption, color: T.body, marginTop: 4 }}>
            {[["appui", "Point d'appui"], ["explore", "À explorer"], ["note", "Remarque du coach"]].filter(([k]) => markers.some(m => kindOf(m) === k) || (k !== "note" && markers.some(m => m.kind === "ia"))).map(([k, t]) => <Legend key={k} kind={k} t={t} />)}
          </div>
        )}
      </div>
    </Card>
  );
}
/* Repères à moins de 3 % l'un de l'autre : décalés de 14 px pour rester atteignables au pointeur (A11Y-09). */
function spread(markers, dur) {
  let prev = null, dx = 0;
  return markers.map(m => {
    dx = prev != null && (m.t - prev) / dur < 0.03 ? dx + 14 : 0;
    prev = m.t;
    return { m, dx };
  });
}
const Legend = ({ kind, t }) => <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}><Mark kind={kind} s={12} />{t}</span>;

/* Carte d'un repère de l'assistant (avec le commentaire du coach s'il existe). Cliquable : rendue en bouton. */
export function DimCard({ d, comment, active, onClick }) {
  const ap = d.type === "appui";
  const tone = ap ? TONE.appui : TONE.ai;
  const body = (
    <>
      <span style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
        <TimeChip t={d.t} tone={ap ? "appui" : "ai"} />
        <span style={{ ...TY.h3, color: T.navy, flex: 1, minWidth: 120 }}>{d.titre}</span>
        <Tag tone={ap ? "appui" : "ai"} icon={ap ? I.check : I.search}>{ap ? "Point d'appui" : "À explorer"}</Tag>
      </span>
      <span style={{ display: "block", ...TY.body, color: T.navy }}>{d.observation}</span>
      <span style={{ display: "block", ...TY.small, color: T.body, background: T.bg, borderRadius: RAD.sm, padding: "8px 12px" }}>{d.conseil}</span>
      {comment && <Quote><strong>Votre coach :</strong> {comment}</Quote>}
    </>
  );
  const st = {
    display: "grid", gap: 8, width: "100%", textAlign: "left", background: active ? tone.bg : T.surface, border: `1.5px solid ${active ? tone.fg : T.line}`,
    borderRadius: RAD.md, padding: PAD.sm, transition: `border-color ${MO.fast}, background-color ${MO.fast}`,
  };
  if (onClick) return <Bare onClick={onClick} aria-pressed={!!active} style={st}>{body}</Bare>;
  return <div style={st}>{body}</div>;
}

/* Repères groupés comme le site le promet : les points d'appui d'abord, puis les pistes à explorer, chaque groupe
   sous son titre. render(d) dessine un repère (carte seule, ou carte et champ de remarque côté coach). */
export const DIM_GROUPS = [["appui", "Vos points d'appui", "Ce qui fonctionne déjà. Vous pouvez le garder."], ["explorer", "Vos pistes à explorer", "Des propositions pour le prochain essai. Ce ne sont pas des erreurs."]];
export function DimGroups({ dims, render, as: H = "h2", titles = {} }) {
  return DIM_GROUPS.map(([type, titre, aide]) => {
    const list = dims.filter(d => d.type === type);
    if (!list.length) return null;
    return (
      <section key={type} aria-label={titles[type] || titre} style={{ display: "grid", gap: GAP.stack }}>
        <div style={{ display: "grid", gap: 4, marginTop: 8 }}>
          <H style={{ ...TY.h4, color: T.navy, margin: 0 }}>{titles[type] || titre}</H>
          {!titles[type] && <p style={{ ...TY.caption, color: T.muted, margin: 0 }}>{aide}</p>}
        </div>
        {list.map(render)}
      </section>
    );
  });
}

/* Résumé de l'analyse, avec la mention du texte rédigé avec l'aide d'une IA quand c'est le cas (transparence). */
export function Synthese({ analysis, style }) {
  return (
    <Notice tone="info" icon={I.sparkle} style={style}>
      <strong>En résumé.</strong> {analysis.synthese}
      {analysis.source === "llm" && <span style={{ display: "block", ...TY.caption, color: T.muted, marginTop: 8 }}>{PHRASES.feedbackLlm}</span>}
    </Notice>
  );
}

/* Texte de la réponse, pour la personne comme pour le coach (A11Y-03, référentiel 8 : transcription à côté de la vidéo).
   onSeek : chaque phrase devient un bouton qui place la lecture à ce moment. */
export function Transcript({ take, onSeek }) {
  if (!take.transcript || !take.segments?.length) return null;
  return (
    <details>
      <summary style={{ ...TY.label, color: T.primary, cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>Afficher le texte de la réponse</summary>
      <Card style={{ marginTop: 8, display: "grid", gap: 4 }}>
        <p style={{ ...TY.caption, color: T.muted, margin: "0 0 4px" }}>Ce texte est écrit par un programme, il peut contenir des erreurs.</p>
        {take.segments.map((sg, i) => {
          const row = <><span style={{ ...TY.time, color: T.muted, minWidth: 40, paddingTop: 4 }}>{fmt(sg.start)}</span><span style={{ ...TY.small, color: T.navy }}>{sg.text}</span></>;
          const st = { display: "flex", gap: 12, padding: "4px 0", width: "100%", textAlign: "left", ...(onSeek ? { minHeight: 44, alignItems: "center" } : {}) }; // rangée cliquable : cible de 44 px
          return onSeek ? <Bare key={i} onClick={() => onSeek(sg.start)} style={st}>{row}</Bare> : <div key={i} style={st}>{row}</div>;
        })}
      </Card>
    </details>
  );
}

/* Rapport en lecture : mode "simple" (texte) ou "video" (relecture avec repères). */
export function ReportBody({ take, mode, counselorName }) {
  const A = take.analysis;
  const { url, status } = useVideoUrl(mode === "video" ? take : null);
  const markers = markersOf(take);
  const [active, setActive] = useState(null);
  const playerRef = useRef(null);
  const rep = take.report;
  const seekTo = (t, id) => { setActive(id); const v = playerRef.current; if (v) { v.currentTime = t; v.play().catch(() => {}); } };

  const intro = rep && (
    <Quote size="lg" icon={I.chat}>
      <div style={{ ...TY.label, color: T.primary, marginBottom: 4 }}>Le message de {counselorName || "votre coach"} · votre coach</div>
      <div style={{ whiteSpace: "pre-wrap" }}>{rep.intro || "Votre coach a regardé votre réponse."}</div>
    </Quote>
  );
  const notes = rep?.notes?.length > 0 && (
    <Card>
      <h3 style={{ ...TY.h4, color: T.navy, margin: "0 0 8px" }}>Remarques de votre coach</h3>
      {rep.notes.slice().sort((a, b) => a.t - b.t).map(n => {
        const row = <><TimeChip t={n.t} tone="primary" /><span style={{ ...TY.body, color: T.navy }}>{n.text}</span></>;
        const st = { display: "flex", gap: 12, alignItems: "flex-start", width: "100%", minHeight: 44, padding: "8px 0", borderTop: `1px solid ${T.lineLt}` };
        return mode === "video"
          ? <Bare key={n.id} onClick={() => seekTo(n.t, n.id)} style={st}>{row}</Bare>
          : <div key={n.id} style={st}>{row}</div>;
      })}
    </Card>
  );
  /* Sans retour de l'assistant (BUG-05) : ni synthèse ni repères, seulement la réponse et, s'il existe, le rapport du coach. */
  const synth = noFeedback(take) ? null : <Synthese analysis={A} style={{ ...TY.bodyLg }} />;
  if (mode === "video" && !A.dimensions.length) {
    return (
      <div style={{ display: "grid", gap: GAP.stack }}>
        {intro}
        <Player take={take} url={url} status={status} markers={markers} active={active} onActive={setActive} playerRef={playerRef} />
        {synth}{notes}
        <Transcript take={take} onSeek={t => seekTo(t)} />
      </div>
    );
  }

  if (mode !== "video") {
    return (
      <div style={{ display: "grid", gap: GAP.stack }}>
        {intro}{synth}
        <DimGroups dims={A.dimensions} render={d => <DimCard key={d.id} d={d} comment={rep?.comments?.[d.id]} />} />
        {notes}
        <Transcript take={take} />
      </div>
    );
  }
  return (
    <div style={{ display: "grid", gap: GAP.stack }}>
      {intro}
      <div className="rp-split">
        <div style={{ display: "grid", gap: GAP.stack }}>
          <Player take={take} url={url} status={status} markers={markers} active={active} onActive={setActive} playerRef={playerRef} />
          {synth}
          {notes}
          <Transcript take={take} onSeek={t => seekTo(t)} />
        </div>
        <div style={{ display: "grid", gap: GAP.stack }}>
          <DimGroups dims={A.dimensions} render={d => <DimCard key={d.id} d={d} comment={rep?.comments?.[d.id]} active={active === d.id} onClick={() => seekTo(d.t, d.id)} />} />
        </div>
      </div>
    </div>
  );
}
