import React, { useEffect, useRef, useState } from "react";
import { T, TY, GAP, Btn, Back, I, Notice } from "../ui.jsx";
import { dateTime } from "../lib/format.js";

export const dateFr = dateTime; // même format que côté personne (src/lib/format.js)

export const linkFor = code => `${location.origin}${location.pathname}#/s/${code}`;

/* Pile verticale : colonne minmax(0, 1fr), un enfant trop large ne peut pas élargir la page (défilement horizontal à 320 px). */
export const stack = (gap = GAP.stack) => ({ display: "grid", gridTemplateColumns: "minmax(0, 1fr)", gap });

export const actions = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: GAP.actions, flexWrap: "wrap" };

/* Copie dans le presse-papiers (BUG-26) : résultat annoncé aux lecteurs d'écran, repli si la copie est refusée. */
export function CopyBtn({ text, label }) {
  const [st, setSt] = useState(""); // "" | "ok" | "fail"
  const t = useRef(0);
  useEffect(() => () => clearTimeout(t.current), []);
  const copy = async () => {
    clearTimeout(t.current);
    try { await navigator.clipboard.writeText(text); setSt("ok"); t.current = setTimeout(() => setSt(""), 1600); }
    catch { setSt("fail"); }
  };
  return (
    <span style={{ display: "inline-grid", gap: 4, justifyItems: "center" }}>
      <Btn kind="secondary" size="sm" onClick={copy} icon={st === "ok" ? I.check : I.copy}>{st === "ok" ? "Copié" : label}</Btn>
      <span role="status" className={st === "fail" ? undefined : "rp-sr"} style={{ ...TY.caption, color: T.body }}>
        {st === "ok" ? "Copié dans le presse-papiers." : st === "fail" ? `La copie automatique n'a pas fonctionné. Sélectionnez puis copiez : ${text}` : ""}
      </span>
    </span>
  );
}

export const nid = () => Math.random().toString(36).slice(2, 9);

/* La personne a repris son envoi pendant la relecture (BUG-02) : la réponse n'est plus visible, aucun rapport ne part. */
export function Withdrawn({ back }) {
  return (
    <div style={stack(GAP.stack)}>
      <Notice tone="info" role="status">La personne a repris cette réponse. Vous ne la voyez plus, et aucun rapport ne lui est envoyé.</Notice>
      <div><Back onClick={back}>Retour au parcours</Back></div>
    </div>
  );
}
