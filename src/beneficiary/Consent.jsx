import React, { useState } from "react";
import { T, TY, PAD, GAP, W, Card, Btn, Back, Link, I, GradHead, CheckTile } from "../ui.jsx";
import { updateParcours, requestPersistence } from "../lib/store.js";
import { PHRASES, SUMMARY, PAGES, LEGAL_VERSION } from "../content/legal.js";
import { Summary } from "../Legal.jsx";
import { actions, stack, wrap } from "./shared.jsx";

/* ─── Accord (consentement) : les deux cases décochées au départ (RGPD, art. 4(11) et 7) ─── */
export function Consent({ p, onBack }) {
  const [c, setC] = useState({ local: false, ai: false });
  const box = (k, title, text, required) => (
    <CheckTile on={c[k]} onToggle={() => setC(x => ({ ...x, [k]: !x[k] }))}>
      <span style={{ ...TY.bodyStrong, color: T.navy }}>{title} <span style={{ ...TY.caption, color: T.muted }}>· {required ? "obligatoire pour s'entraîner" : "au choix"}</span></span>
      <span style={{ ...TY.small, color: T.body }}>{text}</span>
    </CheckTile>
  );
  return (
    <Card pad="none" level={2} style={wrap(W.read)}>
      <GradHead tag={`Bonjour ${p.prenom}`} title="Avant de commencer" sub="Cet espace est le vôtre. Rien n'est noté. Rien n'est envoyé sans vous." />
      <div className="rp-pad-lg" style={{ padding: PAD.lg, ...stack(GAP.grid) }}>
        <Summary items={SUMMARY.accord} />
        <div style={stack(GAP.stack)}>
          {box("local", "Je veux m'enregistrer sur cet appareil.", "Ma vidéo et ma voix restent sur cet appareil. Mon coach les voit seulement si je les lui envoie, réponse par réponse.", true)}
          {box("ai", "Je veux recevoir un retour de l'assistant.", PHRASES.consentAi)}
        </div>
        <div style={stack(8)}>
          <p style={{ ...TY.small, color: T.body, margin: 0 }}>{PHRASES.personalDevice}</p>
          <p style={{ ...TY.small, color: T.body, margin: 0 }}>{PHRASES.refuse}</p>
          <p style={{ ...TY.small, color: T.body, margin: 0 }}>{PHRASES.changeMind}</p>
          <p style={{ ...TY.small, color: T.body, margin: 0, display: "flex", flexWrap: "wrap", gap: "4px 16px" }}>
            <Link href={PAGES.hub.route} target="_blank" rel="noopener">Tout lire sur vos données (nouvel onglet)</Link>
            <Link href={PAGES.conditions.route} target="_blank" rel="noopener">Règles d'utilisation (nouvel onglet)</Link>
          </p>
        </div>
        <div className="rp-actions" style={actions}>
          <Back onClick={onBack} />
          <Btn kind="objective" disabled={!c.local} onClick={() => { requestPersistence(); updateParcours(p.code, { consent: { at: new Date().toISOString(), local: true, ai: c.ai, version: LEGAL_VERSION } }); }} iconRight={I.arrow}>Je suis d'accord, je commence</Btn>
        </div>
      </div>
    </Card>
  );
}
