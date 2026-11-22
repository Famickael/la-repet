import React, { useEffect } from "react";
import { T, TY, GAP, W, Card, Btn, I, GradHead } from "../ui.jsx";
import { nudgeAssistant } from "../lib/bus.js";
import { FULL_OUTRO } from "../lib/questions.js";
import RecruiterVoice from "../RecruiterVoice.jsx";
import { noFeedback } from "../lib/takes.js";
import { actions, dur, openView, stack, wrap } from "./shared.jsx";

/* Récapitulatif de l'entraînement complet : les réponses dans l'ordre de l'entretien, sans aucun score. */
export function Recap({ p, ctx, s, go }) {
  useEffect(() => { nudgeAssistant("training"); }, []);
  const steps = ctx.steps || [], qs = ctx.queue || [], ids = ctx.seriesTakes || {};
  return (
    <div style={{ ...wrap(W.read), ...stack(GAP.grid) }}>
      <Card pad="none" level={2}>
        <GradHead tag="Entraînement complet" title="Récapitulatif de votre entretien" sub="Vos réponses, dans l'ordre de l'entretien. Ouvrez chaque retour quand vous voulez, et envoyez à votre coach celles que vous choisissez." />
      </Card>
      <RecruiterVoice label="Fin de l'entretien" text={FULL_OUTRO} />
      <ol style={{ listStyle: "none", margin: 0, padding: 0, ...stack(GAP.stack) }} aria-label="Vos réponses">
        {qs.map((q, i) => {
          const t = ids[i] ? s.takes[ids[i]] : null;
          return (
            <li key={i}>
              <Card pad="sm" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <span aria-hidden style={{ ...TY.time, width: 28, height: 28, borderRadius: "50%", background: t ? T.successDk : T.surface, color: t ? T.surface : T.muted, border: t ? "none" : `1.5px solid ${T.lineStrong}`, display: "grid", placeItems: "center", flexShrink: 0 }}>{i + 1}</span>
                <div style={{ flex: 1, minWidth: 200, ...stack(4) }}>
                  <div style={{ ...TY.overline, color: T.primary }}>{steps[i]}</div>
                  <div style={{ ...TY.h4, color: T.navy }}>{q}</div>
                  <div style={{ ...TY.caption, color: T.muted }}>{t ? `${dur(t.duration)} · ${t.shared ? "envoyé à votre coach" : "gardé sur cet appareil"}` : "Pas de réponse enregistrée"}</div>
                </div>
                {t && <Btn kind="secondary" size="sm" onClick={() => { const [v, mode] = openView(t); go(v, { takeId: t.id, mode, from: "recap" }); }}>{noFeedback(t) ? "Ouvrir l'entretien" : "Ouvrir mon retour"}</Btn>}
              </Card>
            </li>
          );
        })}
      </ol>
      <div className="rp-actions" style={actions}>
        <Btn kind="ghost" size="sm" onClick={() => go("home", { queue: null, full: false })}>Revenir à mon espace</Btn>
        <Btn kind="objective" icon={I.redo} onClick={() => go("pick", { queue: null, full: false, selection: null, preselect: null })}>M'entraîner encore</Btn>
      </div>
    </div>
  );
}
