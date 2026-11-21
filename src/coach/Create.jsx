import React, { useState } from "react";
import { T, TY, RAD, PAD, GAP, Btn, Back, I, Txt, ConfirmMark, Field, Input, Toggle, RadioGroup } from "../ui.jsx";
import { createParcours } from "../lib/store.js";
import { INTERVIEW_TYPES } from "../lib/questions.js";
import { CopyBtn, actions, linkFor, stack } from "./shared.jsx";

export function Create({ done, cancel }) {
  const [prenom, setPrenom] = useState(""), [poste, setPoste] = useState(""), [warmup, setWarmup] = useState(true), [type, setType] = useState("embauche");
  return (
    <form onSubmit={e => { e.preventDefault(); if (prenom.trim()) done(createParcours({ prenom, poste, warmup, type })); }} style={stack(GAP.field)}>
      <Field id="new-prenom" label="Prénom et initiale" hint="Par exemple : Alex D. N'indiquez ni nom complet, ni numéro de dossier, ni adresse électronique.">
        <Input id="new-prenom" hint value={prenom} onChange={e => setPrenom(e.target.value)} placeholder="Prénom et initiale" />
      </Field>
      <div style={stack(8)}>
        <span id="new-type" style={{ ...TY.label, color: T.navy }}>Type d'entretien</span>
        <RadioGroup aria-labelledby="new-type" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {INTERVIEW_TYPES.map(t => <Toggle key={t.id} on={type === t.id} onClick={() => setType(t.id)}>{t.label}</Toggle>)}
        </RadioGroup>
      </div>
      <Field id="new-poste" label="Métier ou poste visé" hint="Les questions en tiennent compte. La personne peut le modifier.">
        <Input id="new-poste" hint value={poste} onChange={e => setPoste(e.target.value)} placeholder="Par exemple : agent d'accueil" />
      </Field>
      <div style={stack(8)}>
        <span id="new-first" style={{ ...TY.label, color: T.navy }}>Pour commencer</span>
        <RadioGroup aria-labelledby="new-first" style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Toggle on={warmup} onClick={() => setWarmup(true)}>Proposer d'abord un échauffement</Toggle>
          <Toggle on={!warmup} onClick={() => setWarmup(false)}>Aller directement à l'entraînement</Toggle>
        </RadioGroup>
      </div>
      <div className="rp-actions" style={{ ...actions, marginTop: 4 }}>
        <Back onClick={cancel}>Annuler</Back>
        <Btn kind="objective" disabled={!prenom.trim()} iconRight={I.arrow}>Créer le parcours</Btn>
      </div>
    </form>
  );
}

export function Created({ p, back, openAsBenef }) {
  if (!p) return null;
  const link = linkFor(p.code);
  return (
    <div style={{ textAlign: "center", display: "grid", justifyItems: "center", gap: 16 }}>
      <ConfirmMark />
      <div style={stack(8)}>
        <h2 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Le parcours de {p.prenom} est prêt</h2>
        <Txt v="body" color={T.body}>{`Transmettez le code d'accès ou le lien à ${p.prenom}. Il lui sert à s'entraîner, à vous envoyer un entretien et à lire votre rapport.`}</Txt>
      </div>
      <div style={{ background: T.primaryBg, borderRadius: RAD.md, padding: PAD.sm, width: "100%", ...stack(8) }}>
        <div style={{ ...TY.overline, color: T.body }}>Code d'accès</div>
        <div style={{ ...TY.code, color: T.primary }}>{p.code}</div>
      </div>
      <div style={{ ...TY.mono, color: T.body, wordBreak: "break-all" }}>{link}</div>
      <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
        <CopyBtn text={p.code} label="Copier le code" />
        <CopyBtn text={link} label="Copier le lien" />
        <Btn kind="secondary" size="sm" icon={I.mail} onClick={() => { location.href = `mailto:?subject=${encodeURIComponent("Votre accès La Répét'")}&body=${encodeURIComponent(`Bonjour ${p.prenom},\n\nVoici votre accès personnel pour vous entraîner à l'entretien : ${link}\nCode : ${p.code}\n\nÀ bientôt.`)}`; }}>Préparer un courriel</Btn>
      </div>
      <div className="rp-actions" style={{ display: "flex", gap: GAP.actions, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>
        <Btn kind="ghost" size="sm" onClick={back}>Retour à la liste</Btn>
        <Btn kind="primary" size="sm" onClick={openAsBenef}>Ouvrir son espace sur cet appareil</Btn>
      </div>
    </div>
  );
}
