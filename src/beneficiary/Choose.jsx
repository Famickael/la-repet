import React from "react";
import { T, TY, GAP, W, Card, Tag, Btn, Back, Txt } from "../ui.jsx";
import { isAudio } from "../lib/takes.js";
import { stack, wrap } from "./shared.jsx";

/* ─── Choix du mode de restitution ─── */
export function Choose({ take, go, series, back }) {
  const opt = (mode, title, sub, body, btn, ai) => (
    <Card hover onClick={() => go("report", { mode })} style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <span style={{ ...TY.h2, color: T.navy }}>{title}</span>
      <span style={{ ...TY.label, color: ai ? T.violet : T.primary }}>{sub}</span>
      <span style={{ ...TY.body, color: T.body, flex: 1, marginBottom: 8 }}>{body}</span>
      <Btn as="span" kind={ai ? "ai" : "secondary"} full size="sm">{btn}</Btn>
    </Card>
  );
  return (
    <div style={{ ...wrap(W.read), ...stack(GAP.grid) }}>
      <div style={{ textAlign: "center", display: "grid", gap: 12, justifyItems: "center" }}>
        <Tag tone="success">{series && series.n > 1 ? `Question ${series.i + 1} sur ${series.n} · votre retour est prêt` : "Votre retour est prêt"}</Tag>
        <Txt v="h1" as="h1" color={T.navy}>Comment voulez-vous voir votre retour ?</Txt>
        <Txt v="bodyLg" color={T.body}>Les deux contiennent le même retour. Vous pourrez changer d'avis.</Txt>
      </div>
      <div className="rp-stack" style={{ alignItems: "stretch" }}>
        {opt("simple", "Lire mon retour", "Sans me revoir", "Vous lisez ce que l'assistant a remarqué. Pratique si vous n'aimez pas vous revoir.", "Lire")}
        {isAudio(take)
          ? opt("video", "Me réécouter", "Avec les repères au bon moment", "Vous réécoutez votre entretien. Chaque repère est placé au bon moment : touchez-le pour y aller.", "Me réécouter", true)
          : opt("video", "Me revoir en vidéo", "Avec les repères au bon moment", "Vous revoyez votre entretien. Chaque repère est placé au bon moment : touchez-le pour y aller.", "Me revoir", true)}
      </div>
      <div><Back onClick={back} /></div>
    </div>
  );
}
