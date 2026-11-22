import React from "react";
import { T, TY, Icon, I, IconTile, Tag } from "./ui.jsx";
import { Reveal } from "./motion.jsx";

/* Cartes de navigation des pages d'entrée (Solutions, Cas d'usage) : chaque carte est un lien vers une sous-page.
   items : [{ href, icon, title, text, tag?, tone? }]. Puces de raccourci (LinkChips) pour la première vue. */
export function LinkCards({ items, cols = 3 }) {
  return (
    <div className={cols === 2 ? "rs-g2" : "rs-g3"}>
      {items.map((x, i) => (
        <Reveal key={x.href} delay={(i % 3) * 70} style={{ height: "100%" }}>
          <a href={x.href} className="rs-card-btn" style={{ height: "100%", textDecoration: "none", display: "flex", flexDirection: "column", gap: 12, padding: 24 }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12 }}>
              <IconTile icon={x.icon} c={x.tone === "ai" ? T.violet : x.tone === "coach" ? T.coach : undefined} bg={x.tone === "ai" ? T.violetBg : x.tone === "coach" ? T.coachBg : undefined} />
              {x.tag && <Tag tone={x.tone || "primary"}>{x.tag}</Tag>}
            </div>
            <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>{x.title}</h3>
            <p style={{ ...TY.body, color: T.body, margin: 0, flex: 1 }}>{x.text}</p>
            <span style={{ ...TY.label, color: T.primary, display: "inline-flex", alignItems: "center", gap: 8 }}>{x.cta || "Lire la page"} <Icon d={I.arrow} s={16} /></span>
          </a>
        </Reveal>
      ))}
    </div>
  );
}

export const LinkChips = ({ items, label }) => (
  <nav aria-label={label} className="rs-chips" style={{ marginTop: 8 }}>
    {items.map(x => <a key={x.href} href={x.href} className="rs-chip" style={{ textDecoration: "none" }}><Icon d={x.icon} s={16} /> {x.short || x.title}</a>)}
  </nav>
);
