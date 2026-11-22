import React, { useState } from "react";
import { T, TY, RAD, SH, GAP, W, Card, Btn, Back, IconBtn, IconTile, Icon, I, Txt, Field, Input, CheckTile } from "../ui.jsx";
import { questionsFor, interviewType, fill, fullInterview, posteLabel, dePoste } from "../lib/questions.js";
import { stack, wrap } from "./shared.jsx";

/* ─── Choix des questions (sélection multiple + questions personnelles) ─── */
export function Pick({ p, ctx, go }) {
  const init = ctx.selection || { sel: (ctx.preselect || []).map(id => `q:${id}`), custom: [] };
  const [sel, setSel] = useState(init.sel);
  const [custom, setCustom] = useState(init.custom);
  const [own, setOwn] = useState("");
  const type = interviewType(p);
  const qs = questionsFor(type).map(q => ({ key: `q:${q.id}`, theme: q.theme, text: fill(q.text, p.poste) }));
  const all = [...qs, ...custom];
  const toggle = key => setSel(s => (s.includes(key) ? s.filter(k => k !== key) : [...s, key]));
  const add = e => {
    e?.preventDefault();
    const t = own.trim();
    if (t.length < 5) return;
    const key = `c:${Date.now().toString(36)}`;
    setCustom(c => [...c, { key, theme: "Ma question", text: t }]);
    setSel(s => [...s, key]);
    setOwn("");
  };
  const remove = key => { setCustom(c => c.filter(x => x.key !== key)); setSel(s => s.filter(k => k !== key)); };
  const n = sel.length;
  const start = () => {
    const queue = sel.map(k => all.find(x => x.key === k)?.text).filter(Boolean);
    if (queue.length) go("record", { queue, qi: 0, question: queue[0], selection: { sel, custom }, takeId: null, preselect: null, full: false, steps: null, seriesTakes: {}, from: null });
  };
  const startFull = () => {
    const plan = fullInterview(p.poste, type);
    go("record", { queue: plan.map(x => x.text), steps: plan.map(x => x.step), full: true, qi: 0, question: plan[0].text, selection: null, takeId: null, preselect: null, seriesTakes: {}, from: null });
  };

  const qcard = (q, removable) => {
    const idx = sel.indexOf(q.key), on = idx >= 0;
    return (
      <CheckTile key={q.key} on={on} onToggle={() => toggle(q.key)} mark={idx + 1}
        after={removable && <IconBtn icon={I.close} label={`Retirer la question : ${q.text}`} tone="muted" size={16} onClick={() => remove(q.key)} />}>
        <span style={{ ...TY.overline, color: T.primary }}>{q.theme}</span>
        <span style={{ ...TY.bodyStrong, color: T.navy, overflowWrap: "anywhere" }}>{q.text}</span>
      </CheckTile>
    );
  };

  return (
    <div style={{ ...wrap(W.read), ...stack(GAP.grid) }}>
      <div style={stack(8)}>
        <Txt v="h1" as="h1" color={T.navy}>Sur quelles questions voulez-vous vous entraîner ?</Txt>
        <Txt v="bodyLg" color={T.body}>Choisissez une ou plusieurs questions. Vous y répondrez dans l'ordre où vous les choisissez. Vous pouvez ajouter les vôtres.</Txt>
        {!ctx.selection && ctx.preselect?.length > 0 && (
          <p style={{ ...TY.small, color: T.primary, margin: 0, display: "flex", alignItems: "center", gap: 8 }}><Icon d={I.check} s={16} /> Questions choisies d'après vos réponses à l'échauffement. Vous pouvez changer.</p>
        )}
      </div>
      <Card topbar style={{ display: "grid", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconTile icon={I.users} />
          <h2 style={{ ...TY.h3, color: T.navy, margin: 0, flex: 1 }}>Faire un entraînement complet</h2>
        </div>
        <p style={{ ...TY.body, color: T.body, margin: 0 }}>
          {type === "mobilite"
            ? <>Un entretien de mobilité du début à la fin : 7 questions liées au poste {posteLabel(p.poste) ? dePoste(posteLabel(p.poste)) : "que vous visez"}, dans l'ordre d'un vrai entretien. La personne qui vous reçoit lit chaque question à voix haute. 3 minutes au plus par réponse.</>
            : <>Un entretien du début à la fin : 7 questions liées au métier {posteLabel(p.poste) ? dePoste(posteLabel(p.poste)) : "que vous visez"}, dans l'ordre d'un vrai entretien. Le recruteur lit chaque question à voix haute. 3 minutes au plus par réponse.</>}
        </p>
        <div className="rp-wide-m"><Btn kind="secondary" icon={I.play} onClick={startFull}>Faire un entraînement complet</Btn></div>
      </Card>
      <h2 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Ou choisissez vos questions</h2>
      <div role="group" aria-label="Questions proposées" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(min(100%,240px),1fr))", gap: GAP.stack }}>
        {qs.map(q => qcard(q))}
      </div>

      <Card style={stack(GAP.stack)}>
        <form onSubmit={add}>
          <Field id="own" label="Ajouter ma question">
            <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              <Input id="own" value={own} onChange={e => setOwn(e.target.value)} maxLength={240} placeholder="Par exemple : pourquoi avez-vous quitté votre dernier emploi ?" style={{ flex: "1 1 240px", width: "auto", minWidth: 0 }} />
              <Btn kind="secondary" disabled={own.trim().length < 5} icon={I.plus}>Ajouter</Btn>
            </div>
          </Field>
        </form>
        {custom.length > 0 && (
          <div role="group" aria-label="Mes questions" style={stack(8)}>
            {custom.map(q => qcard(q, true))}
          </div>
        )}
      </Card>

      <div className="rp-sel" style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, padding: "12px 16px", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, flexWrap: "wrap" }}>
        <div aria-live="polite" style={{ ...TY.label, color: n ? T.navy : T.muted }}>
          {n ? `${n} question${n > 1 ? "s" : ""} choisie${n > 1 ? "s" : ""}` : "Aucune question choisie"}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          {n > 0 && <Btn kind="ghost" size="sm" onClick={() => setSel([])}>Tout retirer</Btn>}
          <Btn kind="objective" disabled={!n} onClick={start} iconRight={I.arrow}>{n ? `Commencer (${n} question${n > 1 ? "s" : ""})` : "Commencer"}</Btn>
        </div>
      </div>
      <div><Back onClick={() => go("home")} /></div>
    </div>
  );
}
