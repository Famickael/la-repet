import React, { useEffect, useState } from "react";
import { T, TY, W, Card, Btn, Back, Icon, I, GradHead, Chip, ConfirmDialog, Menu } from "../ui.jsx";
import { openAssistant, nudgeAssistant } from "../lib/bus.js";
import { ReportBody } from "../Report.jsx";
import { unshareTake, deleteTake, takesOf } from "../lib/store.js";
import { PHRASES } from "../content/legal.js";
import { hasMedia, isAudio, noFeedback } from "../lib/takes.js";
import { actions, dateFr, downloadTake, dur, openView, stack, wrap } from "./shared.jsx";
import { counterpartOf, sameQuestion } from "../lib/compare.js";
import { dateDay } from "../lib/format.js";

/* ─── Rapport + actions ─── */
export function TakeReport({ p, take, mode, go, series, nextQuestion, stopSeries, back }) {
  /* Pas de bulle sur la relecture vidéo : elle couvrirait la barre de lecture (UI-07). */
  useEffect(() => { if (series && !series.hasNext && !series.full && mode !== "video") nudgeAssistant("training"); }, []); // eslint-disable-line
  const [confirmDel, setConfirmDel] = useState(false);
  const del = async () => {
    await deleteTake(take.id);
    setConfirmDel(false);
    if (series?.hasNext) nextQuestion(); else go("home", { queue: null });
  };
  const nofb = noFeedback(take);
  /* « Vous recommencez, vous voyez ce qui a changé » : l'autre entretien sur la même question (le précédent, sinon le
     suivant) s'ouvre d'ici, pour relire les deux analyses l'une après l'autre. Aucune comparaison chiffrée, aucune courbe. */
  const same = takesOf(p.code).filter(t => t.question === take.question && t.id !== take.id);
  const other = same.find(t => t.createdAt < take.createdAt) || same[same.length - 1] || null;
  /* « Comparer mes entraînements » : l'entretien précédent sur la même question, sinon sur le même type de question
     (sinon le suivant), se compare d'ici. Des faits côte à côte, aucune note ni courbe. Sans analyse de l'assistant,
     il n'y a rien à comparer : le lien de relecture ci-dessous reste. */
  const twin = counterpartOf(take, takesOf(p.code));
  const earlier = twin && twin.createdAt < take.createdAt;
  const head = (t, d) => <div style={stack(4)}><div style={{ ...TY.h3, color: T.navy }}>{t}</div><div style={{ ...TY.small, color: T.body }}>{d}</div></div>;
  return (
    <div style={{ ...wrap(mode === "video" ? W.wide : W.read), ...stack(16) }}>
      <Card pad="none" level={2}>
        <GradHead tag={take.report ? "Rapport de votre coach" : nofb ? "Votre réponse" : "Votre retour"} title={take.question}
          sub={`${dateFr(take.createdAt)} · ${dur(take.duration)}.${nofb ? " Vous avez choisi de ne pas recevoir le retour de l'assistant." : ` ${PHRASES.feedback}`}`}
          action={hasMedia(take) && !nofb && (
            <Btn kind="ghostDark" size="sm" className="noprint" onClick={() => go("report", { mode: mode === "video" ? "simple" : "video" })}>
              {mode === "video" ? "Lire mon retour" : isAudio(take) ? "Me réécouter" : "Me revoir en vidéo"}
            </Btn>)} />
      </Card>
      <ReportBody take={take} mode={mode} counselorName={p.counselor} />
      {series && (
        <Card style={{ ...actions, gap: 16 }} className="noprint">
          {head(series.hasNext ? `Question ${series.i + 1} sur ${series.n} terminée` : series.full ? "C'était la dernière question de l'entretien" : series.n > 1 ? "C'était la dernière question de votre sélection" : "Entraînement terminé",
            series.hasNext ? (nofb ? "Prenez le temps de revoir votre réponse. Passez à la suite quand vous voulez." : "Prenez le temps de lire ce retour. Passez à la suite quand vous voulez.") : nofb ? "Vous retrouvez toutes vos réponses dans votre espace, et vous pouvez recommencer quand vous voulez." : "Vous retrouvez tous vos retours dans votre espace, et vous pouvez recommencer quand vous voulez.")}
          <div className="rp-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {series.hasNext && <Btn kind="ghost" size="sm" onClick={stopSeries}>Arrêter ici</Btn>}
            {series.hasNext
              ? <Btn kind="objective" onClick={nextQuestion} iconRight={I.arrow}>Question suivante ({series.i + 2} sur {series.n})</Btn>
              : series.full ? <Btn kind="objective" onClick={() => go("recap")} iconRight={I.arrow}>Voir le récapitulatif</Btn>
              : <Btn kind="secondary" size="sm" onClick={stopSeries}>Revenir à mon espace</Btn>}
          </div>
        </Card>
      )}
      {twin && !series?.hasNext && (
        <Card style={{ ...actions, gap: 16 }} className="noprint">
          {head(sameQuestion(twin, take) ? (earlier ? "Vous avez déjà répondu à cette question" : "Vous avez répondu de nouveau à cette question") : (earlier ? "Vous avez déjà travaillé ce type de question" : "Vous avez retravaillé ce type de question"),
            `Comparez cet entretien avec celui du ${dateDay(twin.createdAt)} : des faits côte à côte et ce qui a changé, sans note.`)}
          <Btn kind="secondary" size="sm" icon={I.layers} onClick={() => go("compare", { compare: [twin.id, take.id], cmpFrom: take.id, queue: null })}>
            {earlier ? "Comparer avec l'entretien précédent" : "Comparer avec l'entretien suivant"}
          </Btn>
        </Card>
      )}
      {other && !twin && !series?.hasNext && (
        <Card style={{ ...actions, gap: 16 }} className="noprint">
          {head(other.createdAt < take.createdAt ? "Vous avez déjà répondu à cette question" : "Vous avez répondu de nouveau à cette question",
            `Relisez votre entretien du ${dateFr(other.createdAt)} pour voir ce qui a changé : un exemple ajouté, un autre rythme, une conclusion.`)}
          <Btn kind="secondary" size="sm" onClick={() => { const [v, m] = openView(other); go(v, { takeId: other.id, mode: m, queue: null, from: null }); }}>
            {other.createdAt < take.createdAt ? "Relire l'entretien précédent" : "Relire l'entretien suivant"}
          </Btn>
        </Card>
      )}
      <Card style={{ ...actions, gap: 16 }} className="noprint">
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          {take.shared && <span style={{ color: T.successDk, display: "inline-flex", marginTop: 2 }}><Icon d={I.check} s={20} /></span>}
          {head(take.report ? "Rapport reçu" : take.shared ? "Réponse envoyée à votre coach" : `Envie d'en parler avec ${p.counselor || "votre coach"} ?`,
            take.shared ? (take.report ? "Vous pouvez continuer à vous entraîner et envoyer une nouvelle réponse à tout moment." : `Vous pouvez continuer à vous entraîner. ${PHRASES.sent}`) : "Cette réponse reste sur votre appareil tant que vous ne l'envoyez pas.")}
        </div>
        {/* Deux actions visibles, les autres dans « Autres actions » (UI-02) ; la suppression en dernier, confirmée */}
        <div className="rp-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
          <Menu items={[
            hasMedia(take) && { label: isAudio(take) ? "Télécharger ma voix" : "Télécharger ma vidéo", icon: I.download, onClick: () => downloadTake(take) },
            { label: "Imprimer", icon: I.print, onClick: () => window.print() },
            { label: "Supprimer cette réponse", icon: I.trash, danger: true, onClick: () => setConfirmDel(true) },
          ]} />
          {!series?.hasNext && <Btn kind="secondary" size="sm" onClick={() => go("pick", { queue: null, selection: null, preselect: null })} icon={I.redo}>M'entraîner encore</Btn>}
          {take.shared && !take.report && <Btn kind="secondary" size="sm" onClick={() => unshareTake(take.id)} icon={I.redo}>Annuler l'envoi</Btn>}
          {!take.shared && <Btn kind={series?.hasNext || series?.full ? "secondary" : "objective"} size="sm" onClick={() => go("share")} icon={I.send}>Envoyer à mon coach</Btn>}
        </div>
      </Card>
      {confirmDel && (
        <ConfirmDialog title="Supprimer cette réponse ?" confirmLabel="Supprimer" onCancel={() => setConfirmDel(false)} onConfirm={del}>
          {nofb && !take.report ? "La réponse est effacée de cet appareil." : `La réponse${nofb ? "" : take.report ? ", son retour" : " et son retour"}${take.report ? " et le rapport de votre coach" : ""} sont effacés de cet appareil.`} C'est définitif.
        </ConfirmDialog>
      )}
      <div className="noprint">
        <Chip tone="ai" check={false} onClick={() => openAssistant("feedback")}><Icon d={I.chat} s={16} /> {nofb ? "Une question sur l'entretien ? Demandez à l'assistant" : "Une question sur ce retour ? Demandez à l'assistant"}</Chip>
      </div>
      <div className="noprint"><Back onClick={back} /></div>
    </div>
  );
}
