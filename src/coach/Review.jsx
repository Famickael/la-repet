import React, { useMemo, useRef, useState } from "react";
import { T, TY, GAP, Card, Btn, Back, IconBtn, I, Txt, Confirm, Input, Textarea, TimeChip } from "../ui.jsx";
import { sendReport, saveDraft as storeDraft } from "../lib/store.js";
import { Player, DimCard, markersOf, useVideoUrl, Transcript } from "../Report.jsx";
import { fmt } from "../lib/analysis.js";
import CoachAssistantDock from "../CoachAssistant.jsx";
import { isAudio, noFeedback } from "../lib/takes.js";
import { Withdrawn, actions, dateFr, nid, stack } from "./shared.jsx";

export function Review({ s, p, take, back }) {
  const { url, status } = useVideoUrl(take);
  const playerRef = useRef(null);
  const draft = take.report || take.draft || {};
  const [intro, setIntro] = useState(draft.intro || "");
  const [comments, setComments] = useState(draft.comments || {});
  const [notes, setNotes] = useState(draft.notes || []);
  const [noteText, setNoteText] = useState("");
  const [active, setActive] = useState(null);
  const [sent, setSent] = useState(false);
  const [refused, setRefused] = useState(false);
  const A = take.analysis || { synthese: "", dimensions: [] };
  const virtualTake = useMemo(() => ({ ...take, report: { notes } }), [take, notes]);

  const saveDraft = (patch = {}) => storeDraft(take.id, { intro, comments, notes, ...patch });
  /* Un rapport vide ne part pas (BUG-18) : au moins un mot d'introduction, une remarque ou un commentaire. */
  const empty = !intro.trim() && !notes.length && !Object.values(comments).some(c => (c || "").trim());
  const addNote = () => {
    const t = playerRef.current ? playerRef.current.currentTime : 0;
    if (!noteText.trim()) return;
    const next = [...notes, { id: nid(), t, text: noteText.trim() }];
    setNotes(next); setNoteText(""); saveDraft({ notes: next });
  };
  const seek = (t, id) => { setActive(id); const v = playerRef.current; if (v) { v.currentTime = t; v.play().catch(() => {}); } };
  /* Insertion d'une proposition de l'assistant de rédaction : le coach choisit l'endroit, relit avant envoi. */
  const insertFromAssistant = (target, text, dimId) => {
    if (target === "intro") {
      const next = intro.trim() ? `${intro.trimEnd()}\n\n${text}` : text;
      setIntro(next); saveDraft({ intro: next }); return "dans le mot d'introduction";
    }
    if (target === "comment" && dimId) {
      const next = { ...comments, [dimId]: (comments[dimId] || "").trim() ? `${comments[dimId].trim()} ${text}` : text };
      setComments(next); saveDraft({ comments: next });
      return `en remarque sur « ${(A.dimensions.find(d => d.id === dimId) || {}).titre || "le repère"} »`;
    }
    if (target === "note") {
      const t = playerRef.current ? playerRef.current.currentTime : 0;
      const next = [...notes, { id: nid(), t, text }];
      setNotes(next); saveDraft({ notes: next }); return `en remarque à ${fmt(t)} de ${isAudio(take) ? "l'enregistrement" : "la vidéo"}`;
    }
    return "";
  };
  const send = () => {
    if (empty) return;
    const ok = sendReport(take.id, { intro: intro.trim(), comments, notes, sentAt: new Date().toISOString(), by: s.counselor.name });
    if (ok) setSent(true); else setRefused(true);
  };
  if (refused) return <Withdrawn back={back} />;

  if (sent) return (
    <Confirm as="h1" title={`Rapport envoyé à ${p.prenom}`} actions={<Btn kind="primary" onClick={back}>Retour au parcours</Btn>}>
      {p.prenom} le retrouve dans son espace, avec son code. Vos remarques apparaissent à côté de chaque repère.
    </Confirm>
  );

  return (
    <div style={stack(GAP.grid)}>
      <div style={stack(4)}>
        <Txt v="h1" as="h1" color={T.navy}>{take.question}</Txt>
        <Txt v="small" color={T.muted}>{p.prenom} · envoyé le {dateFr(take.sharedAt)}{take.report ? " · rapport déjà envoyé, vous pouvez le modifier et le renvoyer" : ""}</Txt>
      </div>
      <div className="rp-split">
        <div style={stack(GAP.stack)}>
          <Player take={virtualTake} url={url} status={status} markers={markersOf(virtualTake)} active={active} onActive={setActive} playerRef={playerRef} />
          <Card style={stack(8)}>
            <label htmlFor="review-note" style={{ ...TY.h4, color: T.navy }}>Ajouter une remarque à ce moment {isAudio(take) ? "de l'enregistrement" : "de la vidéo"}</label>
            <Txt v="caption" color={T.muted} id="review-note-h">Mettez {isAudio(take) ? "l'enregistrement" : "la vidéo"} en pause au bon moment, puis écrivez votre remarque.</Txt>
            <div style={{ display: "flex", gap: 8 }}>
              <Input id="review-note" aria-describedby="review-note-h" value={noteText} onChange={e => setNoteText(e.target.value)} onKeyDown={e => e.key === "Enter" && addNote()} placeholder="Votre remarque" style={{ flex: 1, minWidth: 0 }} />
              <Btn kind="primary" onClick={addNote} disabled={!noteText.trim()}>Ajouter</Btn>
            </div>
            {notes.length > 0 && (
              <div>
                {notes.slice().sort((a, b) => a.t - b.t).map(n => (
                  <div key={n.id} style={{ display: "flex", gap: 8, alignItems: "center", borderTop: `1px solid ${T.lineLt}` }}>
                    <TimeChip t={n.t} tone="primary" onClick={() => seek(n.t, n.id)} label={`Aller à ${fmt(n.t)}`} />
                    <span style={{ flex: 1, ...TY.small, color: T.navy }}>{n.text}</span>
                    <IconBtn icon={I.trash} label="Supprimer la remarque" tone="muted" size={16} onClick={() => { const next = notes.filter(x => x.id !== n.id); setNotes(next); saveDraft({ notes: next }); }} />
                  </div>
                ))}
              </div>
            )}
          </Card>
          {take.note && (
            <Card style={stack(8)}>
              <div style={{ ...TY.label, color: T.body }}>Le message de {p.prenom}</div>
              <p style={{ ...TY.body, color: T.navy, margin: 0, fontStyle: "italic" }}>« {take.note} »</p>
            </Card>
          )}
          <Transcript take={take} onSeek={t => seek(t)} />
        </div>

        <div style={stack(GAP.stack)}>
          <Card style={stack(8)}>
            <label htmlFor="review-intro" style={{ ...TY.h3, color: T.navy }}>Votre mot d'introduction</label>
            <Txt v="caption" color={T.muted} id="review-intro-h">La première chose que {p.prenom} lira. Adressez-vous directement à la personne.</Txt>
            <Textarea id="review-intro" aria-describedby="review-intro-h" value={intro} onChange={e => setIntro(e.target.value)} onBlur={() => saveDraft()} placeholder={`${p.prenom}, j'ai regardé votre entretien…`} />
          </Card>
          <div style={{ ...stack(4), marginTop: 8 }}>
            <h2 style={{ ...TY.h4, color: T.navy, margin: 0 }}>Repères de l'assistant</h2>
            <Txt v="caption" color={T.muted}>Confirmez, nuancez ou contredisez : votre lecture prime sur celle de l'assistant.</Txt>
          </div>
          {A.dimensions.length === 0 && <Card><Txt v="small" color={T.body}>{noFeedback(take) ? "La personne a choisi de ne pas recevoir le retour de l'assistant." : A.synthese || "L'assistant n'a pas de repère pour cet entretien."}</Txt></Card>}
          {A.dimensions.map(d => (
            <div key={d.id} style={stack(8)}>
              <DimCard d={d} active={active === d.id} onClick={() => seek(d.t, d.id)} />
              <Input value={comments[d.id] || ""} onChange={e => setComments(c => ({ ...c, [d.id]: e.target.value }))} onBlur={() => saveDraft()} placeholder="Votre remarque sur ce repère (facultatif)" aria-label={`Votre remarque sur le repère : ${d.titre}`} />
            </div>
          ))}
          <Btn kind="objective" full onClick={send} disabled={empty} icon={I.send} aria-describedby="review-send-h">{take.report ? "Renvoyer le rapport" : "Envoyer le rapport"}</Btn>
          <Txt v="caption" color={T.muted} style={{ textAlign: "center" }} id="review-send-h">{empty ? "Écrivez au moins un mot pour la personne : une introduction, une remarque ou un commentaire. " : ""}Rien n'est envoyé à la personne tant que vous n'avez pas envoyé le rapport. Vos saisies sont enregistrées en brouillon.</Txt>
        </div>
      </div>
      <div><Back onClick={back} /></div>
      <CoachAssistantDock prenom={p.prenom} question={take.question} poste={p.poste} dims={A.dimensions} intro={intro} comments={comments}
        getTime={() => (playerRef.current ? playerRef.current.currentTime : 0)} onInsert={insertFromAssistant} />
    </div>
  );
}
