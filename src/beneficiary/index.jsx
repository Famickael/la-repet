import React, { useEffect, useRef, useState } from "react";
import { T, GAP, W, Card, Tag, Rail, Txt, Notice } from "../ui.jsx";
import Recorder from "../Recorder.jsx";
import AssistantDock from "../Assistant.jsx";
import { useStore, getState, findParcours, updateParcours, takesOf } from "../lib/store.js";
import { FULL_INTRO } from "../lib/questions.js";
import RecruiterVoice from "../RecruiterVoice.jsx";
import { useTitle, useFocusOnChange } from "../lib/hooks.js";
import { writeHash, benefSub, parseBenefSub, TAKE_VIEWS } from "../lib/viewHash.js";
import { EmotionNote, PAGE, stack, wrap } from "./shared.jsx";
import { CodeEntry } from "./CodeEntry.jsx";
import { Consent } from "./Consent.jsx";
import { Home } from "./SpaceHome.jsx";
import { Warmup } from "./Warmup.jsx";
import { Pick } from "./Pick.jsx";
import { Processing } from "./Processing.jsx";
import { Choose } from "./Choose.jsx";
import { TakeReport } from "./TakeReport.jsx";
import { Sent, Share } from "./Share.jsx";
import { Recap } from "./Recap.jsx";
import Interlocutor, { VignetteSwitch } from "./Interlocutor.jsx";

/* Écran demandé par l'ancre : rouvert s'il ne dépend d'aucun état gardé en mémoire (BUG-07). Un enregistrement en
   cours, une série ou une préparation ne survivent pas à un rechargement : retour à l'accueil de l'espace. */
function restorable(t, ctx, takes) {
  if (TAKE_VIEWS.includes(t.view)) return !!takes[t.takeId];
  if (t.view === "record") return !!ctx.question;
  if (t.view === "processing") return !!ctx.recording;
  if (t.view === "recap") return !!ctx.queue?.length;
  return true;
}
const LOST = "La page a été rechargée : la réponse en cours n'a pas été gardée. Vos réponses déjà enregistrées sont dans « Mes réponses ».";

export default function Beneficiary({ initialCode, sub = "", setModal, onCode }) {
  const s = useStore();
  const [code, setCode] = useState(() => (initialCode && findParcours(initialCode) ? initialCode.toUpperCase() : null));
  const [boot] = useState(() => { const t = parseBenefSub(sub); return restorable(t, {}, getState().takes) ? t : { view: "home", lost: !!sub }; });
  const [view, setView] = useState(boot.view);
  const [lost, setLost] = useState(boot.lost ? LOST : "");
  const [speaking, setSpeaking] = useState(false); // le recruteur lit la question : l'enregistrement attend
  const [ctx, setCtx] = useState(() => (boot.takeId ? { takeId: boot.takeId, mode: boot.mode } : {})); // question, recording, takeId, mode ; série : queue (textes), qi (rang), selection, preselect
  const hashFor = (v, c) => { const sb = benefSub(v, c); return `#/s/${code}${sb ? `/${sb}` : ""}`; };
  const p0 = code ? s.parcours[code] || getState().parcours[code] : null; // instantané éventuellement antérieur à la création du parcours d'essai
  const p = p0 && { ...p0, counselor: p0.counselor || s.counselor?.name || "" }; // nom du coach affiché

  useEffect(() => { if (p && !p.openedAt) updateParcours(p.code, { openedAt: new Date().toISOString() }); }, [p?.code]);
  useEffect(() => { if (code && !p && !findParcours(code)) setCode(null); }, [p, code]); // parcours supprimé par le coach
  /* Mémorise l'espace ouvert (bouton « Mon espace »). L'oubli (onCode(null)) n'a lieu que sur une sortie explicite,
     pas à l'ouverture d'un lien avec un code inconnu (BUG-14) : la session d'un autre espace reste mémorisée. */
  const prevCode = useRef(code);
  useEffect(() => { if (code || prevCode.current) onCode && onCode(code); prevCode.current = code; }, [code]);
  /* Accord retiré (ici ou dans un autre onglet) : retour à l'accueil de l'espace, contexte vidé (BUG-03). */
  useEffect(() => { if (p && !p.consent) { setView("home"); setCtx({}); if (code) writeHash(hashFor("home", {}), true); } }, [p?.consent]); // eslint-disable-line
  const take = ctx.takeId ? s.takes[ctx.takeId] : null;
  /* Réponse supprimée (autre onglet, retrait de l'accord) alors qu'un écran l'affichait : retour à l'accueil (BUG-03). */
  const orphan = ["choose", "report", "share"].includes(view) && !take;
  useEffect(() => { if (orphan) { setView("home"); setCtx(c => ({ ...c, takeId: null })); writeHash(hashFor("home", {}), true); } }, [orphan]); // eslint-disable-line
  /* Précédent, Suivant ou adresse modifiée : l'écran suit l'ancre (BUG-07). */
  useEffect(() => {
    if (!p?.consent) return;
    const t = parseBenefSub(sub);
    const same = t.view === view && (!TAKE_VIEWS.includes(t.view) || (t.takeId === ctx.takeId && (t.view !== "report" || t.mode === (ctx.mode || "simple"))));
    if (same) return;
    if (!restorable(t, ctx, s.takes)) { setLost(LOST); setView("home"); writeHash(hashFor("home", ctx), true); return; }
    setLost("");
    if (TAKE_VIEWS.includes(t.view)) setCtx(c => ({ ...c, takeId: t.takeId, mode: t.mode }));
    setView(t.view);
    window.scrollTo({ top: 0 });
  }, [sub]); // eslint-disable-line
  /* Titre du document et focus propres à chaque écran (A11Y-02, A11Y-06) ; après un retrait de l'accord, le focus
     va sur « Avant de commencer » (BUG-03). */
  const screen = !p ? "code" : !p.consent ? "consent" : view;
  useTitle({ code: "Code d'accès", consent: "Avant de commencer", home: "Mon espace", warmup: "Échauffement", pick: "Choix des questions", record: "Votre réponse", processing: "Préparation", choose: "Lire ou revoir", report: take?.report ? "Rapport de votre coach" : "Votre retour", share: "Envoyer à mon coach", sent: "Réponse envoyée", recap: "Récapitulatif" }[screen]);
  useFocusOnChange(`${screen}-${ctx.qi || 0}-${ctx.takeId || ""}-${ctx.mode || ""}`);

  if (!p) return <main className="rp-page" style={PAGE}><CodeEntry initial={initialCode} invalid={!!initialCode && !findParcours(initialCode)} onOk={c => { setCode(c); setView("home"); }} /></main>;
  if (!p.consent) return <main className="rp-page" style={PAGE}><Consent p={p} onBack={() => setCode(null)} /></main>;

  /* Changement d'écran : l'ancre suit (entrée d'historique), sauf en quittant un écran de passage (préparation, envoi),
     qui est remplacé : Précédent n'y ramène pas. */
  const go = (v, patch) => {
    const next = patch ? { ...ctx, ...patch } : ctx;
    if (patch) setCtx(next);
    setView(v); setLost("");
    writeHash(hashFor(v, next), view === "processing" || view === "share");
    window.scrollTo({ top: 0 });
  };
  /* Sans retour de l'assistant (BUG-05) : trois étapes, pas de « Préparation » ni de « Retour ». */
  const flowSteps = p.consent.ai ? ["Questions", "Réponse", "Préparation", "Retour"] : ["Questions", "Réponse", "Réponse gardée"];
  const flowIdx = (p.consent.ai ? { pick: 0, record: 1, processing: 2, choose: 3, report: 3 } : { pick: 0, record: 1, processing: 2, choose: 2, report: 2 })[view];
  const total = ctx.from === "recap" ? 0 : ctx.queue?.length || 0; // réponse rouverte depuis le récapitulatif : pas de suite de série
  const series = total ? { i: ctx.qi || 0, n: total, hasNext: (ctx.qi || 0) < total - 1, full: !!ctx.full, step: ctx.steps?.[ctx.qi || 0] } : null;
  const nextQuestion = () => go("record", { qi: series.i + 1, question: ctx.queue[series.i + 1], takeId: null, recording: null });
  /* « Retour » depuis une réponse rouverte du récapitulatif : retour au récapitulatif, série conservée (BUG-22). */
  const back = () => (ctx.from === "recap" ? go("recap", { takeId: null }) : go("home", { queue: null }));
  const stopSeries = () => (series?.full ? go("recap") : go("home", { queue: null, qi: 0 }));

  const asstCtx = { warmup: "warmup", record: "record", processing: "record", choose: "feedback", report: "feedback", share: "feedback" }[view] || "general";
  return (
    <main className="rp-page rp-has-fab" style={PAGE}>
      <AssistantDock poste={p.poste} context={asstCtx} />
      {flowIdx !== undefined && <div style={{ ...wrap(view === "report" && ctx.mode === "video" ? W.wide : W.read), marginBottom: GAP.block }} className="noprint"><Rail step={flowIdx} steps={flowSteps} /></div>}
      <div key={view} className="up">
        {view === "home" && lost && <div style={{ ...wrap(W.read), marginBottom: GAP.stack }}><Notice tone="info" role="status">{lost}</Notice></div>}
        {view === "home" && <Home p={p} takes={takesOf(p.code, s)} go={go} counselor={p.counselor} />}
        {view === "warmup" && <Warmup p={p} go={go} setModal={setModal} />}
        {view === "pick" && <Pick p={p} ctx={ctx} go={go} />}
        {view === "record" && (
          <Card pad="lg" level={2} style={{ ...wrap(W.read), ...stack(16) }}>
            <div><Tag tone="primary">{series?.full ? `Entraînement complet · question ${series.i + 1} sur ${series.n}` : series && series.n > 1 ? `Entraînement · question ${series.i + 1} sur ${series.n}` : "Entraînement"}</Tag></div>
            <div style={stack(8)}>
              <Txt v="h1" as="h1" color={T.navy}>À vous de répondre</Txt>
              <Txt v="body" color={T.body}>Rien ne vous interrompt pendant que vous parlez. Vous pouvez recommencer autant de fois que vous voulez.</Txt>
            </div>
            <RecruiterVoice key={`${ctx.qi || 0}-${ctx.question}`} label={series?.full ? `Le recruteur · ${series.step}` : "Question du recruteur"} text={series?.full && series.i === 0 ? `${FULL_INTRO} ${ctx.question}` : ctx.question} onSpeaking={setSpeaking} />
            <Interlocutor speaking={speaking} />
            <Recorder speaking={speaking} beforeStart={() => { try { window.speechSynthesis?.cancel(); } catch { /* rien */ } }} setModal={setModal} onCancel={() => go("pick")}
              trackGaze={!!p.consent.ai} validateLabel={p.consent.ai ? "Voir mon retour" : "Garder cette réponse"}
              onDone={rec => go("processing", { recording: rec })} />
            <VignetteSwitch />
            {/* Sous la caméra (UI-13) : la caméra reste au-dessus de la ligne de flottaison sur téléphone */}
            <EmotionNote setModal={setModal} />
          </Card>
        )}
        {view === "processing" && <Processing p={p} ctx={ctx} go={go} />}
        {view === "choose" && take && <Choose take={take} go={go} series={series} back={back} />}
        {view === "report" && take && <TakeReport p={p} take={take} mode={ctx.mode} go={go} series={series} nextQuestion={nextQuestion} stopSeries={stopSeries} back={back} />}
        {view === "share" && take && <Share p={p} take={take} go={go} setModal={setModal} />}
        {view === "sent" && <Sent p={p} go={go} series={series} nextQuestion={nextQuestion} />}
        {view === "recap" && <Recap p={p} ctx={ctx} s={s} go={go} />}
      </div>
    </main>
  );
}
