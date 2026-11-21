import React, { useEffect, useRef, useState } from "react";
import { T, TY, GAP, W, Card, Tag, Btn, I, Txt, Notice, Input, Chip, RadioGroup } from "../ui.jsx";
import { openAssistant, nudgeAssistant } from "../lib/bus.js";
import { saveWarmupDebrief, loadWarmupDebrief } from "../lib/store.js";
import { topicsFor, interviewType, questionsForTopics } from "../lib/questions.js";
import { FEELINGS, feelingAck } from "../lib/assistant.js";
import { actions, stack, wrap } from "./shared.jsx";

export const OPINIONS = ["Utile", "Rassurant", "Trop court", "Pas assez guidé", "Je ne sais pas encore"];

/* Questionnaire de fin d'échauffement : réponses gardées sur l'appareil, jamais envoyées au coach. */
export function WarmupDebrief({ p, go, again }) {
  /* Réponses précédentes rechargées en entier (BUG-13) ; écriture seulement après un changement de la personne :
     au clic d'une puce, et à la sortie du champ de commentaire (pas à chaque frappe, pas à l'ouverture). */
  const [prev] = useState(() => loadWarmupDebrief(p.code) || {});
  const [feeling, setFeeling] = useState(prev.feeling ?? null);
  const [opinion, setOpinion] = useState(prev.opinion ?? null);
  const [comment, setComment] = useState(prev.comment || "");
  const [work, setWork] = useState(prev.work || []);
  const first = useRef(true);
  const save = () => saveWarmupDebrief(p.code, { feeling, opinion, comment: comment.trim(), work });
  useEffect(() => { if (first.current) { first.current = false; return; } save(); }, [feeling, opinion, work]); // eslint-disable-line
  const toggleWork = id => setWork(w => (w.includes(id) ? w.filter(x => x !== id) : [...w, id]));
  const q = (n, t, id) => <h2 id={id} style={{ ...TY.h3, color: T.navy, margin: 0 }}>{n}. {t}</h2>;
  const pre = questionsForTopics(work);
  useEffect(() => { nudgeAssistant("warmup"); }, []);

  return (
    <div style={wrap(W.read)}>
      <Card pad="lg" level={2} style={stack(GAP.grid)}>
        <div style={stack(12)}>
          <div><Tag tone="success">Échauffement terminé</Tag></div>
          <Txt v="h1" as="h1" color={T.navy}>Quatre questions rapides</Txt>
          <Txt v="body" color={T.body}>Répondez si vous voulez. Vos réponses restent sur cet appareil : votre coach ne les voit pas.</Txt>
        </div>

        <section style={stack(12)}>
          {q(1, "Comment vous sentez-vous après cet échauffement ?", "dq1")}
          <RadioGroup aria-labelledby="dq1" className="rs-chips">
            {FEELINGS.map(f => <Chip key={f.id} role="radio" on={feeling === f.id} onClick={() => setFeeling(v => (v === f.id ? null : f.id))}>{f.label}</Chip>)}
          </RadioGroup>
          <div aria-live="polite">
            {feeling && <Notice tone="ai" icon={I.chat}><strong style={{ color: T.violet }}>Assistant :</strong> {feelingAck(feeling)}</Notice>}
          </div>
        </section>

        <section style={stack(12)}>
          {q(2, "Qu'avez-vous pensé de cet échauffement ?", "dq2")}
          <RadioGroup aria-labelledby="dq2" className="rs-chips">
            {OPINIONS.map(o => <Chip key={o} role="radio" on={opinion === o} onClick={() => setOpinion(v => (v === o ? null : o))}>{o}</Chip>)}
          </RadioGroup>
          <label htmlFor="dq2-text" className="rp-sr">Un commentaire sur l'échauffement (facultatif)</label>
          <Input id="dq2-text" value={comment} onChange={e => setComment(e.target.value)} onBlur={save} maxLength={300} placeholder="Un commentaire, si vous le souhaitez (facultatif)" />
        </section>

        <section style={stack(12)}>
          {q(3, "Qu'aimeriez-vous travailler ensuite ?", "dq3")}
          <div role="group" aria-labelledby="dq3" className="rs-chips">
            {topicsFor(interviewType(p)).map(t => <Chip key={t.id} role="checkbox" on={work.includes(t.id)} onClick={() => toggleWork(t.id)}>{t.label}</Chip>)}
          </div>
          <p style={{ ...TY.caption, color: T.muted, margin: 0 }}>
            {pre.length ? `${pre.length > 1 ? `${pre.length} questions seront déjà choisies` : "1 question sera déjà choisie"} pour votre entraînement. Vous pourrez changer.` : "Vos choix serviront à vous proposer des questions pour l'entraînement."}
          </p>
        </section>

        <section style={stack(8)}>
          <h2 style={{ ...TY.h3, color: T.navy, margin: 0 }}>4. Avez-vous une question ?</h2>
          <div><Btn kind="secondary" size="sm" icon={I.chat} onClick={() => openAssistant("debrief")}>Poser ma question à l'assistant</Btn></div>
        </section>

        <div className="rp-actions" style={actions}>
          <div className="rp-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Btn kind="ghost" size="sm" onClick={again} icon={I.redo}>Refaire un échauffement</Btn>
            <Btn kind="ghost" size="sm" onClick={() => go("home")}>Revenir à mon espace</Btn>
          </div>
          <Btn kind="objective" onClick={() => go("pick", { preselect: pre, selection: null, queue: null })} iconRight={I.arrow}>Commencer l'entraînement</Btn>
        </div>
      </Card>
    </div>
  );
}
