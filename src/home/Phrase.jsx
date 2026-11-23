import React, { useEffect, useRef, useState } from "react";
import { T, GRAD_ACCROCHE, TY, W, HEADER_H, HEADER_H_M, PAD, GAP } from "../ui.jsx";
import { useReducedMotion } from "../motion.jsx";

/* ─── Grande phrase qui se colore mot par mot au fil du défilement ─── */
/* Deux phrases, une ou deux lignes à l'écran : la mécanique de coloration reste la même (mots-clés en dégradé). */
export const PHRASE = [["Un"], ["entretien,"], ["ça"], ["se"], ["prépare"], ["à", 1], ["voix", 1], ["haute.", 1], ["Entraînez-vous"], ["ici,"], ["en", 1], ["toute", 1], ["confiance.", 1]];

export const PHRASE_SHORT = 8; // « Un entretien, ça se prépare à voix haute. »

export const PHRASE_SUB = "Entraînez-vous, lisez votre retour, recommencez. Vous voyez ce qui change, et votre coach vous soutient.";

/* Sur téléphone (760 px et moins), la phrase est plus courte (première phrase seulement) et la section défile moins
   (110vh au lieu de 180vh) : le concret arrive plus vite (rapport du panel bénéficiaires, section 5). */
const useSmall = () => {
  const q = "(max-width: 760px)";
  const [m, setM] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.(q).matches);
  useEffect(() => {
    if (!window.matchMedia) return;
    const mq = window.matchMedia(q), on = () => setM(mq.matches);
    on(); mq.addEventListener ? mq.addEventListener("change", on) : mq.addListener(on);
    return () => (mq.removeEventListener ? mq.removeEventListener("change", on) : mq.removeListener(on));
  }, []);
  return m;
};

export function Phrase() {
  const reduced = useReducedMotion();
  const small = useSmall();
  const words = small ? PHRASE.slice(0, PHRASE_SHORT) : PHRASE;
  const sec = useRef(null);
  const [lit, setLit] = useState(reduced ? words.length + 1 : 0);
  const litRef = useRef(lit);
  useEffect(() => {
    if (reduced) { setLit(words.length + 1); return; }
    let raf = 0;
    const upd = () => {
      raf = 0;
      const el = sec.current; if (!el) return;
      const hh = window.innerWidth <= 760 ? HEADER_H_M : HEADER_H;
      const r = el.getBoundingClientRect(), range = r.height - (window.innerHeight - hh);
      // la coloration commence quand la phrase arrive au centre et finit avant la fin de la section
      const p = range > 0 ? Math.min(1, Math.max(0, (hh - r.top + window.innerHeight * 0.35) / (range + window.innerHeight * 0.1))) : 1;
      const n = Math.round(p * (words.length + 1));
      if (n !== litRef.current) { litRef.current = n; setLit(n); } // nouveau rendu seulement au changement de mot (PERF-06)
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [reduced, words.length]);

  const text = (
    <div className="rs-pad" style={{ maxWidth: W.page, width: "100%", margin: "0 auto", padding: PAD.wrap }}>
      <p className="rs-sr">{words.map(w => w[0]).join(" ")} {PHRASE_SUB}</p>
      <div aria-hidden style={{ maxWidth: W.wide, display: "grid", gap: GAP.grid }}>
        <div className="rs-phrase-t" style={{ ...TY.display, color: T.navy }}>
          {words.map(([w, key], i) => {
            const on = i < lit;
            return (
              <React.Fragment key={i}>
                <span className="rs-w" style={on && key
                  ? { background: GRAD_ACCROCHE, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text", paddingBottom: ".08em" }
                  : { color: on ? T.navy : T.lineStrong }}>{w}</span>{i < words.length - 1 ? " " : ""}
              </React.Fragment>
            );
          })}
        </div>
        <div className="ty-lead rs-w" style={{ ...TY.lead, color: lit > words.length ? T.body : T.lineStrong, maxWidth: 560 }}>{PHRASE_SUB}</div>
      </div>
    </div>
  );
  if (reduced) return <section className="rs-section rs-phrase-r" style={{ paddingTop: GAP.section }}>{text}</section>;
  return (
    <section ref={sec} className="rs-phrase" style={{ height: small ? "110vh" : "180vh" }}>
      <div className="rs-phrase-in">{text}</div>
    </section>
  );
}
