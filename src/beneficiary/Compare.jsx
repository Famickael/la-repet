import React from "react";
import { W, GAP, Card, Btn, Back, GradHead } from "../ui.jsx";
import { CompareBody } from "../Compare.jsx";
import { ordered, sameQuestion } from "../lib/compare.js";
import { openView, stack, wrap } from "./shared.jsx";

/* ─── Comparer mes entraînements : deux entretiens côte à côte, des faits et ce qui a changé, sans note ─── */
export function Compare({ p, a, b, go, from }) {
  const [before, after] = ordered(a, b);
  const open = t => { const [v, mode] = openView(t); go(v, { takeId: t.id, mode, queue: null, from: null }); };
  const back = () => (from && (from === a.id || from === b.id) ? open(from === a.id ? a : b) : go("home", { queue: null }));
  return (
    <div style={{ ...wrap(W.wide), ...stack(GAP.grid) }}>
      <Card pad="none" level={2}>
        <GradHead tag={sameQuestion(before, after) ? "Même question, deux entretiens" : "Même type de question, deux entretiens"} title="Comparer mes entraînements"
          sub="Vos deux entretiens côte à côte : ce que l'assistant a mesuré, et ce qui a changé. Aucune note."
          action={<Btn kind="ghostDark" size="sm" className="noprint" onClick={() => go("home", { queue: null })}>Choisir d'autres entretiens</Btn>} />
      </Card>
      <CompareBody before={before} after={after} role="benef" poste={p.poste} ai={!!p.consent?.ai} open={open} />
      <div className="noprint"><Back onClick={back} /></div>
    </div>
  );
}
