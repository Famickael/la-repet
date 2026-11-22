/* Fond de l'accueil : un seul calque fixe derrière toutes les sections (aucun fond de section), donc sans rupture
   entre le héros, la phrase et la strate. Deux masses de couleur, le violet en haut à droite et le bleu en bas à gauche,
   aux positions et intensités d'origine. Souris : rien ne suit le pointeur ; les deux masses reçoivent toujours des
   décalages opposés. Sur la diagonale qui les relie, elles s'écartent l'une de l'autre dès que le pointeur s'approche
   de l'une d'elles ; sur l'autre diagonale, elles glissent en sens contraires. La zone claire du milieu reste ainsi
   autour du pointeur. Mouvement amorti (inertie), `transform` seulement, écrit directement dans le style à chaque
   image (aucun rendu React). Tactile : lente dérive autonome (CSS), léger déplacement au défilement et au doigt.
   Il s'efface en douceur avant le pied de page (--fy). Fixe en mouvement réduit, masqué en mode concentration.
   Aucun capteur d'orientation. */
import React, { useEffect, useRef } from "react";
import { useReducedMotion } from "../motion.jsx";

const U = [0.56, -0.83];          // du centre vers le violet (le bleu est à l'opposé) ; W = [0.83, 0.56] lui est perpendiculaire
const SPREAD = 0.26, SLIDE = 0.17; // écartement le long de U et glissement le long de W, en part de la fenêtre (presque doublés le
                                   // 22 novembre 2026 : à 0,14 et 0,09, le mouvement tournait mais ne se voyait presque pas)
const SOFT = 0.35;                // arrondi de l'écartement autour du centre : aucun rebond quand le pointeur le traverse
const TAU = 220;                  // constante de temps de l'amorti, en ms
const REST = [0.72, 0.18];        // repère d'origine du violet, pour le suivi du doigt

/* Décalage du violet pour une souris en (mx, my), repère centré de -1 à 1. Le bleu reçoit l'opposé.
   Souris au centre : aucun décalage (composition d'origine). */
export function opposed(mx, my) {
  const s = mx * U[0] + my * U[1], t = mx * -U[1] + my * U[0];
  const e = (Math.hypot(s, SOFT) - SOFT) * SPREAD, g = t * SLIDE;
  return [U[0] * e - U[1] * g, U[1] * e + U[0] * g];
}

export function Background() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const violet = el.querySelector("i"), blue = el.querySelector("b");
    /* (tx, ty) : décalage visé du violet, en part de la fenêtre ; (x, y) : décalage lissé ; sy : part du défilement. */
    let tx = 0, ty = 0, x = 0, y = 0, sy = 0, raf = 0, last = 0, vw = window.innerWidth, vh = window.innerHeight;
    /* Position du pied de page mémorisée (PERF-05) : relue au redimensionnement seulement, pas à chaque image. */
    let footTop = null;
    const measure = () => {
      const f = document.querySelector("footer"); footTop = f ? f.getBoundingClientRect().top + window.scrollY : null;
      vw = window.innerWidth; vh = window.innerHeight;
    };
    measure();
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { measure(); paint(); }) : null;
    ro?.observe(document.body);
    const paint = () => {
      el.style.setProperty("--fy", `${Math.round(footTop != null ? footTop - window.scrollY : vh * 2)}px`);
      const dx = (x * vw).toFixed(1), dy = ((y + sy) * vh).toFixed(1);
      violet.style.transform = `translate3d(${dx}px,${dy}px,0)`;
      blue.style.transform = `translate3d(${-dx}px,${-dy}px,0)`;
    };
    const target = () => {
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      return reduced ? 0 : (window.scrollY / max - 0.5) * 0.24;   // défilement : les deux masses glissent doucement
    };
    let ts = target(); sy = ts;
    const tick = now => {
      const k = 1 - Math.exp(-Math.min(64, now - (last || now - 16)) / TAU); last = now;
      x += (tx - x) * k; y += (ty - y) * k; sy += (ts - sy) * k;
      paint();
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(ts - sy) > 0.0005) raf = requestAnimationFrame(tick);
      else { raf = 0; last = 0; }
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
      [tx, ty] = opposed(e.clientX / vw * 2 - 1, e.clientY / vh * 2 - 1); kick();
    };
    /* Doigt : le violet fait la moitié du chemin vers le doigt, le bleu l'inverse (dérive d'origine). */
    const tm = e => {
      const t = e.touches[0]; if (!t) return;
      tx = (t.clientX / vw - REST[0]) * 0.5; ty = (t.clientY / vh - REST[1]) * 0.5; kick();
    };
    window.addEventListener("pointermove", mv, { passive: true });
    /* Téléphone (sous 760 px) : pas de suivi du doigt, seule la dérive au défilement reste (PERF-05). */
    if (window.innerWidth > 760) window.addEventListener("touchmove", tm, { passive: true });
    return () => {
      ro?.disconnect();
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", mv); window.removeEventListener("touchmove", tm); cancelAnimationFrame(raf);
    };
  }, [reduced]);
  return <div ref={ref} aria-hidden className="rs-glow rp-deco"><span><i /><b /></span></div>;
}
