import React, { useEffect, useRef, useState } from "react";
import { T, TY, GAP, W, Card, Btn, Txt, BrandLoader } from "../ui.jsx";
import { createTake } from "../lib/store.js";
import { PHRASES } from "../content/legal.js";
import { transcribe } from "../lib/transcribe.js";
import { analyze } from "../lib/analysis.js";
import { cleanRepetitions } from "../lib/repetitions.js";
import { useLeaveGuard } from "../lib/hooks.js";
import { hasMedia } from "../lib/takes.js";
import { duration } from "../lib/format.js";
import { actions, openView, wrap } from "./shared.jsx";

/* ─── Transcription + analyse, puis enregistrement de la prise ─── */
/* Trois étapes, un message chacune (BUG-25) ; la transcription et l'analyse déjà faites sont gardées :
   « Réessayer » reprend à l'étape qui a échoué. */
export const PROC_ERR = {
  transcribe: ["Votre réponse n'a pas pu être mise par écrit", "La première fois, l'outil d'écriture se télécharge : vérifiez votre connexion à Internet, puis réessayez."],
  analyze: ["Le retour n'a pas pu être préparé", "Votre réponse est mise par écrit. Réessayez : la préparation du retour reprend où elle s'était arrêtée."],
  save: ["Votre réponse n'a pas pu être gardée sur cet appareil", "Il manque peut-être de la place. Libérez de la place ou supprimez d'anciennes réponses, puis réessayez."],
};

export function Processing({ p, ctx, go }) {
  const [stage, setStage] = useState(p.consent.ai ? "Préparation de votre retour…" : "Enregistrement de votre réponse sur cet appareil…");
  const [err, setErr] = useState(null); // { step, detail }
  const [attempt, setAttempt] = useState(0);
  const done = useRef({}); // { tr, analysis } déjà obtenus
  const rec = ctx.recording;
  useLeaveGuard(true); // la réponse n'est gardée qu'à la fin, y compris en cas d'erreur

  useEffect(() => {
    let alive = true, step = "transcribe";
    (async () => {
      try {
        setErr(null);
        if (p.consent.ai) {
          if (!done.current.tr) {
            setStage("Votre appareil met votre réponse par écrit…");
            done.current.tr = await transcribe(rec.blob, pr => {
              if (!alive) return;
              if (pr.stage === "model") setStage(`Téléchargement de l'outil d'écriture (${pr.value} %). C'est seulement la première fois.`);
              else setStage("Votre appareil met votre réponse par écrit…");
            });
          }
          step = "analyze";
          if (!done.current.analysis) {
            setStage("Préparation des repères de votre retour…");
            done.current.analysis = await analyze({ segments: done.current.tr.segments, duration: rec.duration, gaze: rec.gaze, poste: p.poste, question: ctx.question });
          }
        } else {
          done.current.analysis = { synthese: "Vous avez choisi de ne pas recevoir le retour de l'assistant. Vous pouvez revoir votre réponse et l'envoyer à votre coach.", dimensions: [], source: "none" };
        }
        if (!alive) return;
        step = "save";
        const { tr, analysis } = done.current;
        /* Texte gardé sans les boucles de répétition de la transcription (B3), comme celui qu'a lu l'analyse. */
        const clean = tr ? cleanRepetitions(tr.segments || []) : null;
        const id = await createTake({ code: p.code, question: ctx.question, duration: rec.duration, blob: rec.blob, transcript: clean ? (clean.loops ? clean.text : tr.text || "") : "", segments: clean?.segments || [], gaze: rec.gaze, analysis });
        const [v, mode] = openView({ hasMedia: !!rec.blob, analysis });
        if (alive) go(v, { takeId: id, mode, recording: null, seriesTakes: ctx.queue ? { ...(ctx.seriesTakes || {}), [ctx.qi || 0]: id } : null });
      } catch (e) {
        console.error(e);
        if (alive) setErr({ step, detail: String(e?.message || e) });
      }
    })();
    return () => { alive = false; };
  }, [attempt]); // eslint-disable-line

  const [title, text] = err ? PROC_ERR[err.step] : [];
  return (
    <Card pad="lg" level={2} topbar="ai" style={{ ...wrap(W.form), textAlign: "center", display: "grid", justifyItems: "center", gap: 12 }}>
      {!err ? (<>
        <h1 className="rp-sr">{p.consent.ai ? "Préparation de votre retour" : "Enregistrement de votre réponse"}</h1>
        <BrandLoader label={stage} size={88} />
        <Txt v="body" color={T.body}>{p.consent.ai ? PHRASES.processing : PHRASES.processingLocal}</Txt>
        {p.consent.ai && <Txt v="caption" color={T.muted}>{PHRASES.download}</Txt>}
      </>) : (<>
        <Txt v="h2" as="h1" color={T.navy}>{title}</Txt>
        <Txt v="body" color={T.body}>{text}</Txt>
        <details style={{ textAlign: "left" }}>
          <summary style={{ ...TY.label, color: T.primary, cursor: "pointer", minHeight: 44, display: "flex", alignItems: "center" }}>Détail pour le support</summary>
          <p style={{ ...TY.mono, color: T.muted, margin: 0 }}>{err.detail}</p>
        </details>
        <div className="rp-actions" style={{ display: "flex", gap: GAP.actions, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
          <Btn kind="secondary" onClick={() => go("record")}>Recommencer ma réponse</Btn>
          <Btn kind={p.consent.ai ? "ai" : "objective"} onClick={() => setAttempt(a => a + 1)}>Réessayer</Btn>
        </div>
      </>)}
    </Card>
  );
}
