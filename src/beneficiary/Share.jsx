import React, { useState } from "react";
import { T, GAP, W, Card, Tag, Btn, Back, Link, I, Txt, Confirm, Field, Textarea } from "../ui.jsx";
import { updateTake } from "../lib/store.js";
import { PHRASES, SUMMARY } from "../content/legal.js";
import { Summary } from "../Legal.jsx";
import { actions, stack, wrap } from "./shared.jsx";

export function Share({ p, take, go, setModal }) {
  const [note, setNote] = useState("");
  return (
    <Card pad="lg" level={2} style={{ ...wrap(W.form), ...stack(GAP.grid) }}>
      <div style={stack(12)}>
        <div><Tag tone="primary">Envoi · vous décidez</Tag></div>
        <Txt v="h1" as="h1" color={T.navy}>Envoyer cet entretien à {p.counselor || "votre coach"}</Txt>
        <Txt v="body" color={T.body}>{PHRASES.share}</Txt>
      </div>
      <Summary items={SUMMARY.envoi} style={{ gap: 8 }} />
      <div><Link onClick={() => setModal("video")}>Que devient ma vidéo ?</Link></div>
      <Field id="note" label="Un message pour votre coach (facultatif)">
        <Textarea id="note" value={note} onChange={e => setNote(e.target.value)} placeholder="Par exemple : j'ai l'impression de parler trop vite, qu'en pensez-vous ?" />
      </Field>
      <div className="rp-actions" style={actions}>
        <Back onClick={() => go("report")}>Je le garde pour moi</Back>
        <Btn kind="objective" onClick={() => { updateTake(take.id, { shared: true, sharedAt: new Date().toISOString(), note: note.trim() }); go("sent"); }} icon={I.send}>Envoyer à mon coach</Btn>
      </div>
    </Card>
  );
}

export function Sent({ p, go, series, nextQuestion }) {
  return (
    <Confirm title="Entretien envoyé" actions={<>
      <Btn kind="secondary" onClick={() => go("home", { queue: null })}>Revenir à mon espace</Btn>
      {series?.full && !series.hasNext
        ? <Btn kind="objective" onClick={() => go("recap")} iconRight={I.arrow}>Voir le récapitulatif</Btn>
        : series?.hasNext
        ? <Btn kind="objective" onClick={nextQuestion} iconRight={I.arrow}>Question suivante ({series.i + 2} sur {series.n})</Btn>
        : <Btn kind="objective" onClick={() => go("pick", { queue: null, selection: null, preselect: null })} icon={I.redo}>M'entraîner encore</Btn>}
    </>}>
      {p.counselor || "Votre coach"} va regarder votre entretien et ajouter ses remarques. Son rapport arrivera dans votre espace. Vous en parlerez aussi lors de votre prochain rendez-vous. Vous y revenez avec le même code. {PHRASES.sent}
    </Confirm>
  );
}
