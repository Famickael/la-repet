/* Outils de mouvement : apparition au défilement et respect de « réduire les animations ».
   IntersectionObserver uniquement, aucun écouteur de défilement. */
import { prefersReduced } from "./lib/a11y.js";
import React, { useEffect, useRef, useState } from "react";

const hasIO = () => typeof window !== "undefined" && "IntersectionObserver" in window;

/* Mouvement réduit : réglage du système, option « Réduire les animations » ou « Mode concentration »
   (qui arrête aussi les défilements automatiques et les cartes animées). */
const reducedNow = () => prefersReduced(true);
export function useReducedMotion() {
  const [r, setR] = useState(reducedNow);
  useEffect(() => {
    const on = () => setR(reducedNow());
    const m = window.matchMedia ? window.matchMedia("(prefers-reduced-motion: reduce)") : null;
    m && (m.addEventListener ? m.addEventListener("change", on) : m.addListener(on));
    window.addEventListener("rp-a11y", on);
    return () => { m && (m.removeEventListener ? m.removeEventListener("change", on) : m.removeListener(on)); window.removeEventListener("rp-a11y", on); };
  }, []);
  return r || !hasIO();
}

/* Renvoie [ref, visible]. Par défaut, ne se déclenche qu'une fois. */
export function useInView({ rootMargin = "0px 0px -10% 0px", threshold = 0.15, once = true } = {}) {
  const ref = useRef(null);
  const [v, setV] = useState(!hasIO());
  useEffect(() => {
    const el = ref.current;
    if (!el || !hasIO()) return;
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setV(true); if (once) io.disconnect(); }
      else if (!once) setV(false);
    }, { rootMargin, threshold });
    io.observe(el);
    return () => io.disconnect();
  }, [rootMargin, threshold, once]);
  return [ref, v];
}

/* Bloc qui apparaît (fondu et léger glissement) quand il entre dans l'écran. `as` : balise rendue (par défaut div ;
   "li" pour qu'un élément de liste apparaisse avec sa puce ou son numéro). */
export function Reveal({ children, delay = 0, style, className = "", as: Tag = "div", ...rest }) {
  const [ref, v] = useInView();
  return <Tag ref={ref} className={`rv ${v ? "is-in" : ""} ${className}`} style={{ transitionDelay: v ? `${delay}ms` : "0ms", ...style }} {...rest}>{children}</Tag>;
}

/* Compteur qui monte de 0 à la valeur cible, une fois, après un délai. */
export function useCount(target, start, delay, reduced) {
  const [n, setN] = useState(reduced ? target : 0);
  useEffect(() => {
    if (!start) return;
    if (reduced) { setN(target); return; }
    let raf, t0;
    const step = t => { t0 = t0 || t; const k = Math.min(1, (t - t0) / 600); setN(Math.round(target * k)); if (k < 1) raf = requestAnimationFrame(step); };
    const to = setTimeout(() => { raf = requestAnimationFrame(step); }, delay);
    return () => { clearTimeout(to); cancelAnimationFrame(raf); };
  }, [start, reduced, target, delay]);
  return n;
}

/* Défile jusqu'à une section de la page (routes du type #/solutions/coachs). */
/* Lien vers une autre partie de la même page : défilement doux (direct en mouvement réduit), sous l'en-tête collant,
   puis focus sur la cible pour le clavier et les lecteurs d'écran. */
export function scrollToTarget(target, { focus = true } = {}) {
  const el = typeof target === "string" ? document.getElementById(target) : target;
  if (!el) return;
  const header = document.querySelector("header");
  const off = (header ? header.getBoundingClientRect().height : 64) + 16;
  const top = Math.max(0, el.getBoundingClientRect().top + window.scrollY - off);
  window.scrollTo({ top, behavior: reducedNow() ? "auto" : "smooth" });
  if (focus) {
    if (!el.hasAttribute("tabindex")) el.setAttribute("tabindex", "-1");
    el.focus({ preventScroll: true });
  }
}
export function useSectionScroll(section) {
  useEffect(() => {
    if (!section) return;
    const t = setTimeout(() => scrollToTarget(section), 80);
    return () => clearTimeout(t);
  }, [section]);
}
