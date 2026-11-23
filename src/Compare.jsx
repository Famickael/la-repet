import React, { useEffect, useMemo, useState } from "react";
import { T, ON, TY, RAD, SH, PAD, GAP, Card, Tag, Btn, Chip, Icon, I } from "./ui.jsx";
import { Reveal } from "./motion.jsx";
import { Mark, useVideoUrl } from "./Report.jsx";
import { comparable, compareRows, whatChanged, forCoach, rewriteChanges } from "./lib/compare.js";
import { dateDay, dateTime, duration } from "./lib/format.js";
import { llmEnabled } from "./lib/llm.js";
import { hasMedia, isAudio } from "./lib/takes.js";

/* Comparaison de deux entretiens (référentiel 5.10, « Comparaison d'entretiens »). Écran commun à la personne et au
   coach : « Ce qui a changé », puis les indicateurs côte à côte, puis les deux entretiens (enregistrement, points
   d'appui, pistes). Des faits et des écarts, jamais de note, de pourcentage, de jauge ni de courbe ; ni vert ni rouge :
   le neutre et le bleu de structure seulement. */

const stack = (gap = GAP.stack) => ({ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap });

/* « Entretien du 12 mars » ; l'heure s'ajoute quand les deux entretiens sont du même jour. */
export const takeLabel = (t, other) => `Entretien du ${dateDay(t.createdAt) === dateDay(other?.createdAt) ? dateTime(t.createdAt) : dateDay(t.createdAt)}`;

/* ─── Choix de deux entretiens dans une liste (« Mes entretiens », « Entretiens reçus ») ─── */
export function useComparePick(takes) {
  const [on, setOn] = useState(false);
  const [sel, setSel] = useState([]);
  const ok = takes.filter(comparable);
  const ids = sel.filter(id => ok.some(t => t.id === id)); // un entretien supprimé ou repris sort de la sélection
  return {
    on, sel: ids, can: ok.length >= 2,
    start: () => { setSel([]); setOn(true); },
    stop: () => { setSel([]); setOn(false); },
    toggle: id => setSel(s => (s.includes(id) ? s.filter(x => x !== id) : s.length < 2 ? [...s, id] : s)),
  };
}
export function PickBox({ pick, take, label }) {
  if (!pick.on) return null;
  if (!comparable(take)) return <span style={{ ...TY.caption, color: T.muted }}>Sans analyse : ne se compare pas</span>;
  const sel = pick.sel.includes(take.id);
  return <Chip role="checkbox" pressed={sel} disabled={!sel && pick.sel.length >= 2} aria-label={label} onClick={() => pick.toggle(take.id)}>{sel ? "Choisi" : "Choisir"}</Chip>;
}
export function PickBar({ pick, onCompare }) {
  if (!pick.on) return null;
  const n = pick.sel.length;
  return (
    <div className="rp-sel noprint" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
      <div aria-live="polite" style={{ ...TY.label, color: n ? T.navy : T.body }}>
        {n === 2 ? "2 entretiens choisis" : n === 1 ? "1 entretien choisi, choisissez-en un autre" : "Choisissez deux entretiens à comparer"}
      </div>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <Btn kind="ghost" size="sm" onClick={pick.stop}>Annuler</Btn>
        <Btn kind="primary" size="sm" disabled={n !== 2} onClick={() => onCompare(pick.sel[0], pick.sel[1])} iconRight={I.arrow}>Comparer ces entretiens</Btn>
      </div>
    </div>
  );
}

/* ─── Écran de comparaison ─── */
const H2 = ({ children, id }) => <h2 id={id} className="ty-h2" style={{ ...TY.h2, color: T.navy, margin: 0 }}>{children}</h2>;

/* « Ce qui a changé » : phrases calculées sur l'appareil ; reformulées par l'assistant IA si le relais est branché
   et que la personne a accepté l'analyse de l'assistant (ai), avec repli sur les phrases locales. */
function Changes({ before, after, role, poste, ai }) {
  const local = useMemo(() => whatChanged(before, after), [before, after]);
  const [llm, setLlm] = useState(null);
  useEffect(() => {
    let alive = true;
    setLlm(null);
    if (role === "benef" && ai && llmEnabled()) rewriteChanges({ before, after, poste, changes: local.changes }).then(r => { if (alive && r) setLlm(r); });
    return () => { alive = false; };
  }, [before.id, after.id]); // eslint-disable-line
  const list = (llm || local.changes).map(c => (role === "coach" ? { ...c, text: forCoach(c.text) } : c));
  return (
    <Card level={2} as="section" label="Ce qui a changé" style={stack(GAP.stack)}>
      <div style={stack(4)}>
        <H2>Ce qui a changé</H2>
        <p style={{ ...TY.small, color: T.body, margin: 0 }}>Du {dateDay(before.createdAt)} au {dateDay(after.createdAt)}. Des faits, sans note.</p>
      </div>
      {list.length > 0 ? (
        <ul data-testid="cmp-changes" style={{ listStyle: "none", margin: 0, padding: 0, ...stack(8) }}>
          {list.map(c => (
            <li key={c.id} style={{ display: "flex", gap: 12, alignItems: "flex-start", ...TY.bodyLg, color: T.navy }}>
              <span aria-hidden style={{ display: "inline-flex", color: T.primary, marginTop: 4 }}><Icon d={I.arrow} s={16} /></span>
              <span style={{ minWidth: 0 }}>{c.text}</span>
            </li>
          ))}
        </ul>
      ) : <p data-testid="cmp-changes" style={{ ...TY.bodyLg, color: T.navy, margin: 0 }}>Aucun de ces indicateurs n'a changé entre les deux entretiens.</p>}
      {local.same.length > 0 && list.length > 0 && <p style={{ ...TY.small, color: T.body, margin: 0 }}>Sans changement repéré&nbsp;: {local.same.join(", ")}.</p>}
      {llm && <p style={{ ...TY.caption, color: T.muted, margin: 0 }}>Phrases rédigées avec l'aide d'une IA, à partir des écarts calculés sur votre appareil, puis vérifiées par un filtre.</p>}
      <p style={{ ...TY.small, color: T.body, margin: 0, borderTop: `1px solid ${T.lineLt}`, paddingTop: 12 }}>
        {role === "coach" ? "Ces phrases décrivent des écarts, sans les juger. La lecture reste la vôtre, avec la personne." : "Ces phrases décrivent des écarts, sans les juger. C'est vous, avec votre coach, qui en tirez vos conclusions."}
      </p>
    </Card>
  );
}

/* Indicateurs côte à côte : tableau ARIA (indicateur, avant, après), lisible ligne par ligne au lecteur d'écran. */
function Indicators({ before, after }) {
  const rows = compareRows(before, after);
  const cell = { padding: "12px 16px", ...TY.body, color: T.navy };
  const k = t => <span aria-hidden className="rp-cmp-k" style={{ ...TY.caption, color: T.muted }}>{t}</span>;
  return (
    <Card pad="none" as="section" label="Les indicateurs, côte à côte">
      <div className="rp-pad-md" style={{ padding: PAD.md, paddingBottom: 8, ...stack(4) }}>
        <H2 id="cmp-ind">Les indicateurs, côte à côte</H2>
        <p style={{ ...TY.small, color: T.body, margin: 0 }}>Ce que l'assistant a mesuré dans chaque entretien. Ce sont des repères d'usage, pas des règles.</p>
      </div>
      <div role="table" aria-labelledby="cmp-ind" className="rp-cmp" style={{ padding: "0 8px 8px" }}>
        <div role="row">
          <div role="columnheader" style={{ ...cell, ...TY.label, color: T.body }}>Indicateur</div>
          <div role="columnheader" style={{ ...cell, ...TY.label, color: T.body }}>Avant, {dateDay(before.createdAt)}</div>
          <div role="columnheader" style={{ ...cell, ...TY.label, color: T.body }}>Après, {dateDay(after.createdAt)}</div>
        </div>
        {rows.map(r => (
          <div role="row" key={r.id} data-row={r.id}>
            <div role="rowheader" style={{ ...cell, ...TY.bodyStrong }}>{r.label}</div>
            <div role="cell" style={cell}>{k("Avant")}{r.before}</div>
            <div role="cell" style={cell}>{k("Après")}{r.after}</div>
          </div>
        ))}
      </div>
    </Card>
  );
}

/* Un entretien : date, question, durée, enregistrement relisible, points d'appui et pistes de son analyse. */
function Side({ take, other, when, open, openLabel, delay }) {
  const { url, status } = useVideoUrl(take);
  const audio = isAudio(take);
  const dims = take.analysis?.dimensions || [];
  const group = (type, titre) => {
    const list = dims.filter(d => d.type === type);
    return (
      <div style={stack(8)}>
        <h4 style={{ ...TY.h4, color: T.navy, margin: 0 }}>{titre}</h4>
        {list.length === 0 && <p style={{ ...TY.small, color: T.body, margin: 0 }}>Aucun dans cette analyse.</p>}
        {list.length > 0 && (
          <ul style={{ listStyle: "none", margin: 0, padding: 0, ...stack(8) }}>
            {list.map(d => (
              <li key={d.id} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                <span style={{ marginTop: 4 }}><Mark kind={type === "appui" ? "appui" : "explore"} /></span>
                <span style={{ minWidth: 0, ...stack(0) }}>
                  <span style={{ ...TY.bodyStrong, color: T.navy }}>{d.titre}</span>
                  <span style={{ ...TY.small, color: T.body }}>{d.observation}</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  };
  return (
    <Reveal delay={delay} style={{ minWidth: 0 }}>
      <Card as="section" label={`${when} : ${takeLabel(take, other)}`} style={stack(16)}>
        <div style={stack(8)}>
          <div><Tag tone={when === "Avant" ? "muted" : "primary"}>{when}</Tag></div>
          <h3 className="ty-h2" style={{ ...TY.h2, color: T.navy, margin: 0 }}>{takeLabel(take, other)}</h3>
          <p style={{ ...TY.body, color: T.navy, margin: 0 }}>{take.question}</p>
          <p style={{ ...TY.caption, color: T.muted, margin: 0 }}>{dateTime(take.createdAt)} · {duration(take.duration)}</p>
        </div>
        {hasMedia(take) ? (
          <div style={{ background: T.videoBg, borderRadius: RAD.md, overflow: "hidden", aspectRatio: audio ? "auto" : "16/9", display: "grid", placeItems: "center", padding: audio ? PAD.sm : 0 }}>
            {url
              ? (audio
                ? <audio src={url} controls aria-label={`Enregistrement de l'entretien du ${dateDay(take.createdAt)}`} style={{ width: "100%" }} />
                : <video src={url} controls playsInline aria-label={`Vidéo de l'entretien du ${dateDay(take.createdAt)}`} style={{ width: "100%", height: "100%", objectFit: "contain" }} />)
              : <div role={status === "loading" ? "status" : undefined} style={{ ...TY.small, color: ON.text, padding: PAD.sm }}>{status === "loading" ? "Chargement de l'enregistrement…" : audio ? "Enregistrement non disponible sur cet appareil." : "Vidéo non disponible sur cet appareil."}</div>}
          </div>
        ) : <p style={{ ...TY.small, color: T.body, background: T.bg, borderRadius: RAD.sm, padding: "8px 12px", margin: 0 }}>Pas d'enregistrement à relire pour cet entretien. Son texte et son analyse sont gardés.</p>}
        {group("appui", "Points d'appui")}
        {group("explorer", "Pistes à explorer")}
        {open && <div className="rp-wide-m noprint"><Btn kind="secondary" size="sm" onClick={open}>{openLabel}</Btn></div>}
      </Card>
    </Reveal>
  );
}

/* before : l'entretien le plus ancien ; after : le plus récent. open(take) ouvre un entretien (facultatif). */
export function CompareBody({ before, after, role = "benef", poste, ai, open, openLabel = "Ouvrir cet entretien" }) {
  return (
    <div style={stack(GAP.grid)}>
      <Changes before={before} after={after} role={role} poste={poste} ai={ai} />
      <Reveal><Indicators before={before} after={after} /></Reveal>
      <div className="rp-stack" style={{ alignItems: "start" }}>
        <Side take={before} other={after} when="Avant" open={open && (() => open(before))} openLabel={openLabel} delay={0} />
        <Side take={after} other={before} when="Après" open={open && (() => open(after))} openLabel={openLabel} delay={70} />
      </div>
    </div>
  );
}
