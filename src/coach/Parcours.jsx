import React, { useState } from "react";
import { T, TY, GAP, Card, Tag, Btn, Back, I, Txt, Empty, ConfirmDialog } from "../ui.jsx";
import { deleteParcours, takesOf } from "../lib/store.js";
import { duration } from "../lib/format.js";
import { CopyBtn, actions, dateFr, linkFor, stack } from "./shared.jsx";

export function Parcours({ s, p, back, review }) {
  const takes = takesOf(p.code, s);
  const shared = takes.filter(t => t.shared);
  const [confirmDel, setConfirmDel] = useState(false);
  const del = async () => { await deleteParcours(p.code); setConfirmDel(false); back(); };
  const priv = takes.length - shared.length;
  return (
    <div style={stack(GAP.block)}>
      <Card level={2} style={actions}>
        <div style={stack(4)}>
          <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><h1 className="ty-h2" style={{ ...TY.h2, color: T.navy, margin: 0 }}>{p.prenom}</h1><span style={{ ...TY.mono, color: T.muted }}>{p.code}</span></div>
          <div style={{ ...TY.small, color: T.body }}>
            {p.poste || "Poste non précisé"}{p.type === "mobilite" ? " · mobilité ou évolution" : ""} · {p.consent ? `accord donné le ${dateFr(p.consent.at)}${p.consent.ai ? "" : ", sans retour de l'assistant"}` : p.consentWithdrawnAt ? `accord retiré le ${dateFr(p.consentWithdrawnAt)}` : p.openedAt ? "espace ouvert, accord pas encore donné" : "espace pas encore ouvert"}
          </div>
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <CopyBtn text={linkFor(p.code)} label="Copier le lien" />
          <Btn kind="danger" size="sm" onClick={() => setConfirmDel(true)} icon={I.trash}>Supprimer</Btn>
        </div>
      </Card>
      <section style={stack(16)}>
        <div style={stack(4)}>
          <Txt v="h2" as="h2" color={T.navy}>Entretiens reçus</Txt>
          <Txt v="small" color={T.muted}>
            {priv > 0 ? (priv > 1 ? `${priv} autres entretiens n'ont pas été envoyés : vous ne les voyez pas.` : "1 autre entretien n'a pas été envoyé : vous ne le voyez pas.") : "Vous voyez ici seulement les entretiens que la personne vous a envoyés."}
          </Txt>
        </div>
        {shared.length === 0 && <Empty icon={I.send} text="Aucun entretien reçu pour le moment." />}
        {shared.length > 0 && (
          <div style={stack(GAP.stack)}>
            {shared.map(t => (
              <Card key={t.id} pad="sm" style={{ display: "flex", alignItems: "center", gap: 16, flexWrap: "wrap" }}>
                <div style={{ flex: 1, minWidth: 220, ...stack(4) }}>
                  <div style={{ ...TY.h4, color: T.navy }}>{t.question}</div>
                  <div style={{ ...TY.caption, color: T.muted }}>Envoyée le {dateFr(t.sharedAt)} · {duration(t.duration)}{t.report ? ` · rapport envoyé le ${dateFr(t.report.sentAt)}` : ""}</div>
                </div>
                <Tag tone={t.report ? "success" : "warning"}>{t.report ? "Rapport envoyé" : "À relire"}</Tag>
                <Btn kind={t.report ? "secondary" : "objective"} size="sm" onClick={() => review(t.id)}>{t.report ? "Modifier le rapport" : "Relire et annoter"}</Btn>
              </Card>
            ))}
          </div>
        )}
      </section>
      <div><Back onClick={back} /></div>
      {confirmDel && (
        <ConfirmDialog title={`Supprimer le parcours de ${p.prenom} ?`} confirmLabel="Supprimer le parcours" onCancel={() => setConfirmDel(false)} onConfirm={del}>
          Le parcours, ses entretiens et ses rapports sont effacés de cet appareil. C'est définitif.
        </ConfirmDialog>
      )}
    </div>
  );
}
