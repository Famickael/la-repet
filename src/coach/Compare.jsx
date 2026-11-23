import React from "react";
import { T, TY, GAP, Card, Back } from "../ui.jsx";
import { CompareBody } from "../Compare.jsx";
import { ordered } from "../lib/compare.js";
import { stack } from "./shared.jsx";

/* Comparaison de deux entretiens, côté coach : seulement des entretiens que la personne lui a envoyés (la vue n'est
   ouverte par coach/index.jsx que si les deux le sont). Mêmes faits que côté personne, aucune note. */
export function Compare({ p, a, b, back, review }) {
  const [before, after] = ordered(a, b);
  return (
    <div style={stack(GAP.grid)}>
      <Card level={2} style={stack(4)}>
        <h1 className="ty-h2" style={{ ...TY.h2, color: T.navy, margin: 0 }}>Comparer deux entretiens de {p.prenom}</h1>
        <div style={{ ...TY.small, color: T.body }}>Deux entretiens que {p.prenom} vous a envoyés, côte à côte : ce que l'assistant a mesuré, et ce qui a changé. Aucune note.</div>
      </Card>
      <CompareBody before={before} after={after} role="coach" poste={p.poste} open={t => review(t.id)} openLabel="Relire cet entretien" />
      <div className="noprint"><Back onClick={back}>Retour au parcours</Back></div>
    </div>
  );
}
