import React from "react";
import { GRAD, RAD, SH, GAP, Halo, Btn, I, ON, TY } from "../ui.jsx";
import { Reveal } from "../motion.jsx";

/* ─── Bandeau final (partagé par les pages publiques) ─── */
export function FinalBand({ title = "Votre premier entraînement vous attend", text = "Il vous faut votre code d'accès et quelques minutes.", children, openSpace, go }) {
  return (
    <section style={{ paddingTop: GAP.section }} className="rs-section">
      <Reveal>
        <div className="rp-cta rs-band rs-on-dark" style={{ position: "relative", borderRadius: RAD.xl, overflow: "hidden", background: GRAD, boxShadow: SH.glowAi }}>
          <Halo style={{ width: 300, height: 300, background: ON.glow, bottom: -120, right: -40 }} />
          <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "center", flexWrap: "wrap", gap: GAP.grid }}>
            <div style={{ display: "grid", gap: 8 }}>
              <h2 className="ty-xl" style={{ ...TY.xl, color: ON.text, margin: 0 }}>{title}</h2>
              <p style={{ ...TY.bodyLg, color: ON.text, margin: 0 }}>{text}</p>
            </div>
            <div className="rp-wide-m" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {children || <>
                <Btn kind="white" size="lg" onClick={openSpace} iconRight={I.arrow}>Ouvrir mon espace</Btn>
              </>}
            </div>
          </div>
        </div>
      </Reveal>
    </section>
  );
}
