import React, { useState } from "react";
import { T, TY, RAD, GAP, W, Card, Tag, Btn, Back, Link, IconBtn, Icon, I, Txt, Modal } from "../ui.jsx";
import WarmupStage from "../WarmupStage.jsx";
import { updateParcours } from "../lib/store.js";
import { WARMUP_PHRASES, WARMUP_PROMPTS, fillPhrase, randomPhraseIndex } from "../lib/questions.js";
import { actions, stack, wrap } from "./shared.jsx";
import { WarmupDebrief } from "./WarmupDebrief.jsx";

/* ─── Échauffement (ni enregistré, ni analysé) ─── */
export const WARMUP_TIPS = [
  ["Respirez avant de parler", "Inspirez par le nez sur quatre temps, expirez sur six. La voix se pose plus facilement."],
  ["Prenez votre temps", "À l'oral, on parle souvent plus vite qu'on ne le pense. Une courte pause entre deux idées aide l'autre à suivre."],
  ["Articulez les fins de phrase", "C'est là que les mots se perdent le plus souvent."],
  ["Regardez la caméra, pas votre image", "L'objectif donne à votre interlocuteur l'impression que vous le regardez."],
  ["Sourire n'est pas obligatoire", "Parlez simplement, avec votre façon d'être. Il n'y a pas d'attitude attendue."],
  ["Installez-vous", "Le dos droit, assis ou debout, les pieds à plat. La respiration est plus libre et la voix porte mieux."],
  ["Si vous butez sur un mot, continuez", "Tout le monde hésite à l'oral. Reprendre simplement la phrase suffit."],
  ["Gardez un verre d'eau à portée de main", "Boire une gorgée laisse aussi un instant pour réfléchir."],
];

export function Warmup({ p, go, setModal }) {
  const [stage, setStage] = useState("practice"); // practice | debrief
  const [pi, setPi] = useState(() => randomPhraseIndex());
  const [prompt, setPrompt] = useState(0);
  const [tips, setTips] = useState(false);
  const phrase = fillPhrase(WARMUP_PHRASES[pi], p);
  const shuffle = () => { setPi(i => randomPhraseIndex(i)); setPrompt(0); };
  const finish = () => { updateParcours(p.code, { warmupDone: true }); setStage("debrief"); window.scrollTo({ top: 0 }); };

  if (stage === "debrief") return <WarmupDebrief p={p} go={go} again={() => { setStage("practice"); shuffle(); window.scrollTo({ top: 0 }); }} />;

  return (
    <div style={{ ...wrap(W.read), ...stack(GAP.grid) }}>
      <Card pad="lg" level={2} style={stack(16)}>
        <div><Tag tone="primary">Échauffement · rien n'est enregistré</Tag></div>
        <div style={stack(8)}>
          <Txt v="h1" as="h1" color={T.navy}>Échauffez votre voix</Txt>
          <Txt v="body" color={T.body} style={{ maxWidth: W.form }}>
            Dites la phrase à voix haute. Redites-la en suivant la consigne. Changez de phrase quand vous voulez.
          </Txt>
        </div>

        <div><Link onClick={() => setTips(true)} style={{ display: "inline-flex", alignItems: "center", gap: 8, minHeight: 44 }}><Icon d={I.bulb} s={16} />Voir les astuces pour bien démarrer</Link></div>
        <div style={{ background: T.primaryBg, borderRadius: RAD.md, padding: "16px 20px", ...stack(12) }}>
          <div style={{ ...TY.overline, color: T.primary }}>Votre phrase</div>
          <div style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
            <p aria-live="polite" data-testid="warmup-phrase" style={{ ...TY.h2, color: T.navy, margin: 0, flex: 1, minWidth: 0 }}>« {phrase} »</p>
            <IconBtn icon={I.shuffle} label="Changer de phrase" variant="outline" onClick={shuffle} />
          </div>
          <div style={{ paddingTop: 12, borderTop: `1px solid ${T.line}`, display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
            <div style={{ flex: 1, minWidth: 200, ...TY.small, color: T.navy }} aria-live="polite">
              <strong>Consigne {prompt + 1} sur {WARMUP_PROMPTS.length} :</strong> {WARMUP_PROMPTS[prompt]}
            </div>
            <Btn kind="ghost" size="sm" onClick={() => setPrompt(i => (i + 1) % WARMUP_PROMPTS.length)} icon={I.redo}>Consigne suivante</Btn>
          </div>
        </div>

        <WarmupStage setModal={setModal} />
      </Card>

      {tips && (
        <Modal close={() => setTips(false)} title="Astuces pour bien démarrer" icon={I.bulb} footer={<div style={{ display: "flex", justifyContent: "flex-end" }}><Btn kind="primary" size="sm" onClick={() => setTips(false)}>Fermer</Btn></div>}>
          <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
            {WARMUP_TIPS.map(([t, d]) => (
              <li key={t} style={{ display: "flex", gap: 8, alignItems: "flex-start" }}>
                <span style={{ marginTop: 2, display: "inline-flex", color: T.primary }}><Icon d={I.check} s={16} /></span>
                <span style={{ ...TY.body, color: T.body }}><strong style={{ color: T.navy }}>{t}.</strong> {d}</span>
              </li>
            ))}
          </ul>
        </Modal>
      )}

      <div className="rp-actions" style={actions}>
        <Back onClick={() => go("home")} />
        <Btn kind="objective" onClick={finish} iconRight={I.arrow}>Terminer l'échauffement</Btn>
      </div>
    </div>
  );
}
