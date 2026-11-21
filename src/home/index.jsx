/* Page d'accueil (ARC-10). Ordre recommandé par le panel bénéficiaires (21 novembre 2026, section 5) : héros,
   bandeau de réassurance, strate des quatre étapes, ce que La Répét' ne fait pas, phrase, outils, mini FAQ,
   portes d'entrée (le bandeau final est retiré à la demande du propriétaire). Un fichier par section dans ce dossier. */
import React, { useEffect, useRef } from "react";
import { W } from "../ui.jsx";
import { useReducedMotion } from "../motion.jsx";
import { Hero } from "./Hero.jsx";
import { Strate } from "./Strate.jsx";
import { Phrase } from "./Phrase.jsx";
import { Features, ForWho, NotDo, Reassurance, MiniFaq } from "./Features.jsx";

/* Le détail par public est dans « Cas d'usage », le détail de l'outil dans « Solutions ». */

const wrap = { maxWidth: W.page, margin: "0 auto", padding: "0 24px" };

export default function Home({ go, openSpace }) {
  return (
    <main className="rs-home" style={{ position: "relative", isolation: "isolate" }}>
      <MouseGlow />
      <Hero openSpace={openSpace} />
      <div className="rs-pad" style={wrap}><Reassurance /></div>
      <Strate />
      <div className="rs-pad" style={wrap}><NotDo /></div>
      <Phrase />
      <div className="rs-pad" style={wrap}>
        <Features />
        <MiniFaq go={go} />
        <ForWho go={go} openSpace={openSpace} />
      </div>
    </main>
  );
}

/* Fond de l'accueil : un seul calque fixe derrière toutes les sections (aucun fond de section), donc sans rupture
   entre le héros, la phrase et la strate. Souris : le pointeur repousse le violet et le bleu, chacun de son côté, et
   dégage sous lui une zone claire au fond du thème (le texte pointé reste lisible). Tactile : lente dérive autonome
   (CSS), léger déplacement au défilement et au doigt, avec lissage. Il s'efface en douceur avant le pied de page (--fy).
   Fixe en mouvement réduit, masqué en mode concentration. Aucun capteur d'orientation. */
const REST = { v: [0.72, 0.18], b: [0.28, 0.82] }; // positions de repos du violet et du bleu
const PUSH = 0.32, REACH = 0.38;                     // force et portée de la poussée du pointeur
/* Une couleur s'écarte du pointeur, d'autant plus qu'il est proche. */
export function pushed([cx, cy], x, y) {
  const dx = cx - x, dy = cy - y, d = Math.hypot(dx, dy) || 0.001, f = PUSH * Math.exp(-d / REACH);
  return [Math.min(1.25, Math.max(-0.25, cx + (dx / d) * f)), Math.min(1.25, Math.max(-0.25, cy + (dy / d) * f))];
}

export function MouseGlow() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    /* (px, py) : cible ; (x, y) : position lissée. mouse : le pointeur est une souris (poussée et zone claire). */
    let px = 0.72, py = 0.18, x = px, y = py, sy = 0, raf = 0, mouse = false;
    /* Position du pied de page mémorisée (PERF-05) : relue au redimensionnement seulement, pas à chaque image. */
    let footTop = null;
    const measure = () => { const f = document.querySelector("footer"); footTop = f ? f.getBoundingClientRect().top + window.scrollY : null; };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { measure(); paint(); }) : null;
    ro?.observe(document.body);
    const paint = () => {
      el.style.setProperty("--fy", `${Math.round(footTop != null ? footTop - window.scrollY : window.innerHeight * 2)}px`);
      const pc = v => `${(v * 100).toFixed(2)}%`, set = (k, v) => el.style.setProperty(k, pc(v));
      if (mouse) {
        /* Souris : chaque couleur est repoussée depuis sa position de repos ; zone claire sous le pointeur. */
        const [vx, vy] = pushed(REST.v, x, y), [bx, by] = pushed(REST.b, x, y);
        set("--vx", vx); set("--vy", vy + sy); set("--bx", bx); set("--by", by + sy); set("--px", x); set("--py", y);
      } else {
        /* Tactile et repos : le violet suit la position lissée, le bleu lui fait face (dérive d'origine). */
        set("--vx", x); set("--vy", y + sy); set("--bx", 1 - x); set("--by", 1 - (y + sy));
      }
    };
    const target = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
      return reduced ? 0 : (window.scrollY / max - 0.5) * 0.24;   // défilement : le dégradé glisse doucement
    };
    let ts = target(); sy = ts;
    const tick = () => {
      x += (px - x) * 0.08; y += (py - y) * 0.08; sy += (ts - sy) * 0.08;
      paint();
      raf = Math.abs(px - x) + Math.abs(py - y) + Math.abs(ts - sy) > 0.001 ? requestAnimationFrame(tick) : 0;
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    paint();
    const onScroll = () => { ts = target(); if (reduced) paint(); else kick(); };
    const onResize = () => { measure(); paint(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize);
    if (reduced) return () => { ro?.disconnect(); window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize); };
    const mv = e => {
      if (e.pointerType !== "mouse") return;
      if (!mouse) { mouse = true; x = px = e.clientX / window.innerWidth; y = py = e.clientY / window.innerHeight; }
      el.style.setProperty("--clear", "1");
      px = e.clientX / window.innerWidth; py = e.clientY / window.innerHeight; kick();
    };
    /* Doigt : amplitude réduite de moitié autour de la position de repos. */
    const tm = e => {
      const t = e.touches[0]; if (!t) return;
      px = 0.72 + (t.clientX / window.innerWidth - 0.72) * 0.5; py = 0.18 + (t.clientY / window.innerHeight - 0.18) * 0.5; kick();
    };
    window.addEventListener("pointermove", mv, { passive: true });
    /* Souris sortie de la fenêtre : la zone claire s'efface, les couleurs restent où elles sont. */
    const out = e => { if (!e.relatedTarget) el.style.setProperty("--clear", "0"); };
    document.addEventListener("mouseout", out);
    /* Téléphone (sous 760 px) : pas de suivi du doigt, seule la dérive au défilement reste (PERF-05). */
    if (window.innerWidth > 760) window.addEventListener("touchmove", tm, { passive: true });
    return () => {
      ro?.disconnect();
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", mv); window.removeEventListener("touchmove", tm); document.removeEventListener("mouseout", out); cancelAnimationFrame(raf);
    };
  }, [reduced]);
  return <div ref={ref} aria-hidden className="rs-glow rp-deco"><i /><b /></div>;
}
