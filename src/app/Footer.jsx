import React from "react";
import { T, GAP, W, TY, RepetLogo, Link, Icon, I, PAD } from "../ui.jsx";

/* ─── Pied de page (non collant) ─── */

/* compact : dans les espaces (entraînement, coach), pied réduit aux engagements et aux liens essentiels (UI-14). */
export function Footer({ compact = false }) {
  /* Exception documentée (référentiel 1.5) : chaque engagement garde sa couleur d'icône. */
  const trust = [
    [I.lock, "Votre vidéo reste sur votre appareil", T.successDk, "#/vos-donnees/video"],
    [I.send, "Votre coach voit seulement ce que vous lui envoyez", T.blue, "#/vos-donnees/video"],
    [I.ban, "Ni note ni classement", T.violet, "#/vos-donnees/assistant"],
    [I.shield, "Aucune émotion devinée", T.accent, "#/vos-donnees/assistant"],
  ];
  const groups = [
    ["Vos données", [["#/vos-donnees", "Vos données"], ["#/vos-donnees/video", "Que devient ma vidéo ?"], ["#/vos-donnees/assistant", "L'assistant et l'IA"], ["#/vos-donnees/droits", "Vos droits"]]],
    ["Le site", [["#/a-propos", "À propos"], ["#/solutions", "Solutions"], ["#/ressources", "Ressources"], ["#/ressources/faq", "Questions fréquentes"], ["#/demo", "Nous contacter"]]],
    ["Informations légales", [["#/conditions", "Conditions d'utilisation"], ["#/mentions-legales", "Mentions légales"], ["#/accessibilite", "Accessibilité : non conforme"]]],
  ];
  const lk = { ...TY.caption, ...TY.link, minHeight: 44, display: "inline-flex", alignItems: "center" };
  const trustList = (
    <ul className="rp-trust" style={{ display: "flex", gap: 20, ...TY.caption, color: T.body, flexWrap: "wrap", listStyle: "none", margin: 0, padding: 0 }}>
      {trust.map(([ic, l, c, h]) => <li key={l}><a href={h} className="rp-trustlink" style={{ display: "inline-flex", alignItems: "center", gap: 8, color: T.body, textDecoration: "none", minHeight: 44 }}><Icon d={ic} s={16} c={c} /> {l}</a></li>)}
    </ul>
  );
  if (compact) return (
    <footer className="noprint rp-foot" style={{ position: "relative", zIndex: 1, borderTop: `1px solid ${T.line}`, background: T.surface, marginTop: GAP.section / 2 }}>
      <div className="rp-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: `12px ${PAD.x}px`, display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: `4px ${GAP.grid}px` }}>
        {trustList}
        <nav aria-label="Informations" style={{ display: "flex", gap: 16, flexWrap: "wrap" }}>
          {[["#/vos-donnees", "Vos données"], ["#/mentions-legales", "Mentions légales"], ["#/accessibilite", "Accessibilité : non conforme"]].map(([h, l]) => <Link key={h} href={h} style={lk}>{l}</Link>)}
        </nav>
      </div>
    </footer>
  );
  /* Pied complet (référentiel 6) : engagements en haut, puis une rangée de quatre blocs, présentation (logo et brief)
     à gauche des trois groupes de liens. Colonnes 3/2/2/2 ; tablette (1023 px et moins) : deux colonnes, la présentation
     à côté de « Vos données » ; petit mobile (560 px et moins) : présentation, puis groupes sur deux colonnes. */
  return (
    <footer className="noprint rp-foot rp-foot-full" style={{ position: "relative", zIndex: 1, borderTop: `1px solid ${T.line}`, background: T.surface, marginTop: GAP.section }}>
      <div className="rp-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: `12px ${PAD.x}px` }}>
        {trustList}
      </div>
      <div style={{ borderTop: `1px solid ${T.lineLt}` }}>
        <div className="rp-pad rp-fgrid" style={{ maxWidth: W.page, margin: "0 auto", padding: `${PAD.md}px ${PAD.x}px ${PAD.lg}px` }}>
          <div className="rp-fbrief" style={{ display: "grid", gap: 12, alignContent: "start", maxWidth: 360 }}>
            <RepetLogo s={14} tagline={false} />
            <p style={{ ...TY.caption, color: T.body, margin: 0 }}>La Répét' est l'outil d'entraînement de notre organisme d'accompagnement. On s'entraîne à voix haute pour son entretien, l'assistant décrit sans noter, votre coach vous accompagne.</p>
          </div>
          {groups.map(([t, links]) => (
            <nav key={t} aria-label={t}>
              <h2 style={{ ...TY.overline, color: T.muted, margin: "0 0 4px" }}>{t}</h2>
              <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                {links.map(([h, l]) => <li key={h}><Link href={h} style={lk}>{l}</Link></li>)}
              </ul>
            </nav>
          ))}
        </div>
      </div>
    </footer>
  );
}
