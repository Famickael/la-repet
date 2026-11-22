import React, { useEffect, useRef, useState } from "react";
import { T, TY, RAD, SH, PAD, GAP, W, Card, Tag, Btn, Link, IconBtn, IconTile, I, GradHead, Txt, Notice, Empty } from "../ui.jsx";
import { PHRASES, PAGES } from "../content/legal.js";
import { hasMedia, isAudio } from "../lib/takes.js";
import { dateFr, dur, openView, stack, wrap, downloadData, downloadAllMedia } from "./shared.jsx";
import { JobField } from "./JobField.jsx";

/* ─── Espace personnel ─── */
export function Home({ p, takes, go, counselor }) {
  const reports = takes.filter(t => t.report);
  return (
    <div style={{ ...wrap(W.read), ...stack(GAP.block) }}>
      <Card pad="none" level={2}>
        <GradHead tag={counselor ? `Accompagnement avec ${counselor}` : "Votre espace"} title={`Bonjour ${p.prenom}`}
          sub="Indiquez le métier ou le poste que vous visez. Puis choisissez : un échauffement ou un entraînement." />
        <div className="rp-pad-md" style={{ padding: PAD.md, ...stack(GAP.grid) }}>
          <JobField p={p} />
          <div className="rp-stack" style={{ gap: GAP.stack }}>
            <ChoiceTile icon={I.mic} title="Échauffement" tipLabel="En savoir plus sur l'échauffement" tipId="tip-warmup"
              tip="L'échauffement sert à vous lancer. Vous dites une phrase à voix haute, plusieurs fois, en suivant une consigne. Rien n'est enregistré ni gardé."
              text="Quelques minutes pour vous lancer, une phrase à la fois. Rien n'est enregistré.">
              <Btn kind="secondary" onClick={() => go("warmup")}>M'échauffer</Btn>
            </ChoiceTile>
            <ChoiceTile icon={I.play} title="Entraînement" tipLabel="En savoir plus sur l'entraînement" tipId="tip-training"
              tip={p.consent.ai
                ? "Vos entretiens sont enregistrés sur votre appareil. L'assistant les analyse, sans les noter. Vous décidez ensuite, entretien par entretien, de les envoyer ou non à votre coach."
                : "Vos entretiens sont enregistrés sur votre appareil, pour que vous puissiez vous revoir. Vous avez choisi de ne pas recevoir le retour de l'assistant. Vous décidez, entretien par entretien, de les envoyer ou non à votre coach."}
              text={p.consent.ai ? "Vous choisissez vos questions et vous y répondez à voix haute. L'assistant analyse ensuite chaque entretien, sans le noter." : "Vous choisissez vos questions et vous y répondez à voix haute."}>
              <Btn kind="objective" onClick={() => go("pick", { queue: null, selection: null, preselect: null })} iconRight={I.arrow}>Commencer l'entraînement</Btn>
            </ChoiceTile>
          </div>
        </div>
      </Card>

      {reports.length > 0 && (
        <Notice tone="success">
          {counselor || "Votre coach"} vous a envoyé {reports.length > 1 ? `${reports.length} rapports` : "un rapport"}. Ouvrez l'entretien marqué « Rapport reçu » pour le lire.
        </Notice>
      )}

      <section style={stack(16)}>
        <Txt v="h2" as="h2" color={T.navy}>Mes entretiens</Txt>
        {takes.length === 0 && <Empty icon={I.play} text="Vous n'avez pas encore d'entretien enregistré. Commencez quand vous voulez." />}
        {takes.length > 0 && (
          <div style={stack(GAP.stack)}>
            {takes.map(t => {
              const st = t.report ? ["Rapport reçu", "success"] : t.shared ? ["Envoyé à votre coach", "primary"] : ["Gardé sur cet appareil", "muted"];
              return (
                <Card key={t.id} pad="sm" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                  <IconTile icon={hasMedia(t) && !isAudio(t) ? I.play : I.mic} />
                  <div style={{ flex: 1, minWidth: 200, ...stack(4) }}>
                    <div style={{ ...TY.h4, color: T.navy }}>{t.question}</div>
                    <div style={{ ...TY.caption, color: T.muted }}>{dateFr(t.createdAt)} · {dur(t.duration)}</div>
                  </div>
                  <Tag tone={st[1]}>{st[0]}</Tag>
                  <Btn kind="secondary" size="sm" onClick={() => { const [v, mode] = openView(t); go(v, { takeId: t.id, mode, queue: null, from: null }); }}>Ouvrir</Btn>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      <MyData p={p} takes={takes} />

      <Notice tone="info" icon={I.shield}>
        {PHRASES.noTracking} {PHRASES.sharedDevice} <Link href={PAGES.hub.route}>Vos données</Link>
      </Notice>
    </div>
  );
}

/* Mes données (C9) : export JSON lisible, puis vidéos à part. */
function MyData({ p, takes }) {
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const media = takes.filter(hasMedia).length;
  const getMedia = async () => {
    setBusy(true); setStatus("Téléchargement des enregistrements…");
    const n = await downloadAllMedia(takes).catch(() => 0);
    setBusy(false);
    setStatus(n ? `${n} enregistrement${n > 1 ? "s" : ""} enregistré${n > 1 ? "s" : ""} dans vos téléchargements.` : "Aucun enregistrement n'a pu être téléchargé.");
  };
  return (
    <section aria-labelledby="mes-donnees" style={stack(12)}>
      <Txt v="h2" as="h2" id="mes-donnees" color={T.navy}>Mes données</Txt>
      <Txt v="small" color={T.body}>Un fichier lisible avec votre parcours, vos entretiens, leurs textes, les retours de l'assistant et les rapports de votre coach. Il est créé sur cet appareil : rien n'est envoyé. Les vidéos et enregistrements de voix se téléchargent à part.</Txt>
      <div className="rp-actions" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
        <Btn kind="secondary" size="sm" icon={I.download} onClick={() => setStatus(downloadData(p.code) ? "Le fichier de vos données est dans vos téléchargements." : "Le fichier n'a pas pu être créé.")}>Télécharger mes données</Btn>
        {media > 0 && <Btn kind="ghost" size="sm" icon={I.download} disabled={busy} onClick={getMedia}>{media > 1 ? `Télécharger mes ${media} enregistrements` : "Télécharger mon enregistrement"}</Btn>}
      </div>
      <div role="status" aria-live="polite" style={{ ...TY.small, color: T.body }}>{status}</div>
    </section>
  );
}

/* Tuile de choix (échauffement / entraînement) avec bulle d'information : bloc interne, pas une carte dans la carte. */
export function ChoiceTile({ icon, title, text, tip, tipLabel, tipId, children }) {
  return (
    <div style={{ position: "relative", borderRadius: RAD.md, padding: PAD.sm, display: "flex", flexDirection: "column", gap: 12, background: T.bg, minWidth: 0 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
        <IconTile icon={icon} bg={T.surface} />
        <h2 style={{ ...TY.h3, color: T.navy, margin: 0, flex: 1 }}>{title}</h2>
        <InfoTip label={tipLabel} id={tipId}>{tip}</InfoTip>
      </div>
      <p style={{ ...TY.small, color: T.body, margin: 0, flex: 1 }}>{text}</p>
      <div className="rp-wide-m">{children}</div>
    </div>
  );
}

/* Bulle d'information : au survol (souris), au toucher et au clavier (Entrée/Espace, Échap pour fermer). */
export function InfoTip({ label, id, children }) {
  const [hover, setHover] = useState(false);
  const [pinned, setPinned] = useState(false);
  const ref = useRef(null);
  const open = hover || pinned;
  useEffect(() => {
    if (!pinned) return;
    const out = e => { if (ref.current && !ref.current.contains(e.target)) setPinned(false); };
    document.addEventListener("pointerdown", out);
    return () => document.removeEventListener("pointerdown", out);
  }, [pinned]);
  return (
    <span ref={ref} style={{ display: "inline-flex" }}
      onPointerEnter={e => e.pointerType === "mouse" && setHover(true)} onPointerLeave={e => e.pointerType === "mouse" && setHover(false)}
      onKeyDown={e => { if (e.key === "Escape") { setPinned(false); setHover(false); } }}>
      <IconBtn icon={I.info} label={label} aria-expanded={open} aria-controls={id} onClick={() => setPinned(v => !v)} />
      <span id={id} role="note" hidden={!open}
        style={{ position: "absolute", left: 8, right: 8, top: 64, zIndex: 20, background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.sm, boxShadow: SH.lg, padding: "12px 16px", ...TY.small, color: T.navy, display: open ? "block" : "none" }}>
        {children}
      </span>
    </span>
  );
}
