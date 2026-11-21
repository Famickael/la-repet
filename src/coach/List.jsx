import React from "react";
import { T, TY, PAD, GAP, Card, Tag, Btn, I, Txt, Empty } from "../ui.jsx";
import { takesOf, parcoursStatus } from "../lib/store.js";
import { dateFr, stack } from "./shared.jsx";

/* Indicateur agrégé (aucune mesure individuelle, règle 7) : en dessous de MIN_AGG parcours, un pourcentage décrirait
   une personne précise (SEC-03). */
export const MIN_AGG = 5;

export function Stat({ n, l, c = T.primary }) {
  return (
    <Card style={{ display: "flex", alignItems: "center", gap: 16 }}>
      <div style={{ ...TY.num, color: c, whiteSpace: typeof n === "object" ? "normal" : "nowrap" }}>{n}</div>
      <div style={{ ...TY.small, color: T.body }}>{l}</div>
    </Card>
  );
}

export function List({ s, open, create }) {
  const rows = Object.values(s.parcours).sort((a, b) => (b.createdAt || "").localeCompare(a.createdAt || "")).map(p => ({ p, st: parcoursStatus(p, s), takes: takesOf(p.code, s) }));
  const all = Object.values(s.takes);
  const shared = all.filter(t => t.shared);
  const reviewed = shared.filter(t => t.report);
  const delays = reviewed.map(t => (new Date(t.report.sentAt) - new Date(t.sharedAt)) / 3.6e6).filter(x => x >= 0);
  const avgDelay = delays.length ? Math.round(delays.reduce((a, b) => a + b, 0) / delays.length) : null;
  const benefWithTakes = rows.filter(r => r.takes.length).length;
  const retrain = rows.filter(r => r.takes.length > 1).length;

  return (
    <div style={stack(GAP.grid)}>
      <div style={stack(12)}>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(200px,1fr))", gap: GAP.stack }}>
          <Stat n={rows.filter(r => r.st.key === "toreview").length} l="Entretiens à relire" c={T.accent} />
          <Stat n={rows.length} l="Parcours en cours" />
          <Stat n={reviewed.length} l="Rapports envoyés" c={T.successDk} />
          <Stat n={benefWithTakes >= MIN_AGG ? `${Math.round((retrain / benefWithTakes) * 100)}\u00a0%` : <span style={{ ...TY.h4, color: T.muted }}>Pas assez de parcours pour un chiffre</span>} l="Personnes qui se réentraînent" />
        </div>
        <Txt v="caption" color={T.muted}>
          Ces chiffres portent sur l'ensemble de vos parcours. Aucun ne mesure une personne : le pourcentage s'affiche à partir de {MIN_AGG} parcours avec au moins une réponse.{avgDelay != null && ` Votre délai moyen de relecture, pour vous seul : ${avgDelay} h.`}
        </Txt>
      </div>
      {rows.length === 0 ? (
        <Empty icon={I.users} title="Aucun parcours pour l'instant" text="Créez un parcours pour obtenir le code d'accès et le lien à transmettre à la personne accompagnée."
          action={<Btn kind="primary" onClick={create} icon={I.plus}>Créer un parcours</Btn>} />
      ) : (
        <Card pad="none" level={2}>
          {rows.map(({ p, st, takes }, i) => (
            <div key={p.code} className="rp-row" style={{ display: "flex", alignItems: "center", gap: 16, padding: PAD.row, borderTop: i ? `1px solid ${T.lineLt}` : "none", background: st.key === "toreview" ? T.accentBg : T.surface, flexWrap: "wrap" }}>
              <div aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", background: T.primaryBg, display: "grid", placeItems: "center", ...TY.h4, color: T.primary, flexShrink: 0 }}>{(p.prenom || "?")[0]?.toUpperCase()}</div>
              <div style={{ flex: 1, minWidth: 200, ...stack(4) }}>
                <div style={{ display: "flex", alignItems: "baseline", gap: 8, flexWrap: "wrap" }}><span style={{ ...TY.h4, color: T.navy }}>{p.prenom}</span><span style={{ ...TY.mono, color: st.key === "toreview" ? T.body : T.muted }}>{p.code}</span></div>
                <div style={{ ...TY.small, color: T.body }}>{p.poste || "Poste non précisé"} · {takes.length} entretien{takes.length > 1 ? "s" : ""} · créé le {dateFr(p.createdAt)}</div>
              </div>
              <Tag tone={st.tone}>{st.label}</Tag>
              <Btn kind={st.key === "toreview" ? "objective" : "secondary"} size="sm" onClick={() => open(p.code)}>{st.key === "toreview" ? "Relire" : "Ouvrir"}</Btn>
            </div>
          ))}
        </Card>
      )}
    </div>
  );
}
