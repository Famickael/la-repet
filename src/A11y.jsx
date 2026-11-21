import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { T, TY, Bare, Btn, IconBtn, Icon, I, Toggle, RadioGroup } from "./ui.jsx";
import { loadA11y, saveA11y, resetA11y, applyA11y, FONT_LABELS, DEFAULTS } from "./lib/a11y.js";

/* Options d'accessibilité (référentiel, section 8 bis) : languette en demi-cercle collée au bord gauche de l'écran,
   qui s'allonge au survol et au focus pour afficher « Accessibilité » ; au clic, le panneau des réglages se déploie
   depuis la languette elle-même (la forme s'agrandit, sans fenêtre surgissante ni voile). Règle de lecture qui suit
   le pointeur ou le doigt. Ouverture depuis n'importe où (menu mobile, « Mon compte ») : openA11y(). */
const EV = "rp-a11y-open";
export const openA11y = () => window.dispatchEvent(new CustomEvent(EV));

export function useA11y() {
  const [s, setS] = useState(loadA11y);
  useEffect(() => {
    const on = e => setS(e.detail);
    window.addEventListener("rp-a11y", on);
    return () => window.removeEventListener("rp-a11y", on);
  }, []);
  return s;
}

/* Conteneur placé juste après #root : le lien d'évitement reste le premier arrêt de tabulation (A11Y-01) et la
   languette est le dernier (une seule tabulation arrière depuis la barre d'adresse) ; le panneau n'est jamais pris
   dans un parent qui crée un contexte (en-tête, vues en fondu). */
function useHost() {
  const [host, setHost] = useState(null);
  useEffect(() => {
    const el = document.createElement("div");
    el.id = "rp-a11y-host";
    el.className = "noprint";
    const root = document.getElementById("root");
    if (root) root.after(el); else document.body.append(el);
    setHost(el);
    return () => el.remove();
  }, []);
  return host;
}

export default function A11yLayer() {
  const [open, setOpen] = useState(false);
  const s = useA11y();
  const host = useHost();
  useEffect(() => {
    const on = () => setOpen(true);
    window.addEventListener(EV, on);
    return () => window.removeEventListener(EV, on);
  }, []);
  // « auto » suit le système en direct
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia("(prefers-color-scheme: dark)");
    const on = () => applyA11y(loadA11y());
    m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, []);
  return (<>
    {host && createPortal(<A11yDock open={open} setOpen={setOpen} s={s} />, host)}
    {s.ruler && <ReadingRuler />}
  </>);
}

const focusablesIn = el => [...(el?.querySelectorAll("a[href],button:not([disabled]),input,textarea,select,[tabindex]") || [])].filter(n => n.tabIndex >= 0);

function A11yDock({ open, setOpen, s }) {
  const tab = useRef(null), panel = useRef(null), back = useRef(null);
  const close = (refocus = true) => {
    setOpen(false);
    if (!refocus) return;
    const b = back.current;
    (b && b.isConnected && b.offsetParent !== null ? b : tab.current)?.focus({ preventScroll: true });
  };
  const closeRef = useRef(close); closeRef.current = close;

  /* Panneau fermé : inerte (ni focus, ni lecteur d'écran) ; il reste dans la page pour se refermer vers la languette. */
  useEffect(() => { if (panel.current) panel.current.inert = !open; }, [open]);

  useEffect(() => {
    if (!open) return;
    const prev = document.activeElement;
    back.current = prev && prev !== document.body && !panel.current?.contains(prev) ? prev : null;
    const f = focusablesIn(panel.current);
    (f.find(n => !n.classList.contains("rp-a11y-close")) || f[0])?.focus({ preventScroll: true });
    const key = e => {
      if (e.key === "Escape") { e.stopPropagation(); closeRef.current(); return; }
      if (e.key !== "Tab") return;
      const list = focusablesIn(panel.current); if (!list.length) return;
      const i = list.indexOf(document.activeElement);
      if (e.shiftKey && i <= 0) { e.preventDefault(); list[list.length - 1].focus(); }
      else if (!e.shiftKey && (i === list.length - 1 || i < 0)) { e.preventDefault(); list[0].focus(); }
    };
    /* Clic ou toucher en dehors du panneau : il se referme (le focus va là où l'on a cliqué). */
    const down = e => { if (!panel.current?.contains(e.target) && !tab.current?.contains(e.target)) closeRef.current(false); };
    document.addEventListener("keydown", key);
    document.addEventListener("pointerdown", down, true);
    document.documentElement.classList.add("rp-a11y-open");
    return () => {
      document.removeEventListener("keydown", key);
      document.removeEventListener("pointerdown", down, true);
      document.documentElement.classList.remove("rp-a11y-open");
    };
  }, [open]);

  const set = patch => { const n = { ...s, ...patch }; saveA11y(n); applyA11y(n); };
  const changed = Object.keys(DEFAULTS).filter(k => s[k] !== DEFAULTS[k]).length;

  const sw = (k, title, hint) => (
    <Bare role="switch" aria-checked={!!s[k]} onClick={() => set({ [k]: !s[k] })} className="rp-a11y-row">
      <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <span style={{ ...TY.label, color: T.navy }}>{title}</span>
        <span style={{ ...TY.caption, color: T.body }}>{hint}</span>
      </span>
      <span aria-hidden className="rp-a11y-sw"><i>{s[k] && <Icon d={I.check} s={12} sw={3} />}</i></span>
    </Bare>
  );
  const group = (id, title, children) => (
    <section aria-labelledby={id} style={{ display: "grid", gap: 4, alignContent: "start", minWidth: 0 }}>
      <h3 id={id} style={{ ...TY.overline, color: T.muted, margin: "0 0 4px" }}>{title}</h3>
      {children}
    </section>
  );
  const radios = (id, label, cls, items) => (
    <div style={{ display: "grid", gap: 8, padding: "4px 8px 8px" }}>
      <span id={id} style={{ ...TY.label, color: T.navy }}>{label}</span>
      <RadioGroup aria-labelledby={id} className={cls}>{items}</RadioGroup>
    </div>
  );

  return (
    <div className={`rp-a11y${open ? " is-open" : ""}`}>
      <Bare ref={tab} className="rp-a11y-tab" aria-label="Options d'accessibilité" aria-expanded={open} aria-controls="rp-a11y-panel"
        onClick={() => (open ? close() : setOpen(true))}>
        <span aria-hidden className="rp-a11y-label">Accessibilité</span>
        <span aria-hidden className="rp-a11y-knob"><Icon d={I.a11y} s={20} /></span>
      </Bare>
      <div className="rp-a11y-panel">
        <div ref={panel} id="rp-a11y-panel" role="dialog" aria-modal="true" aria-labelledby="rp-a11y-title" className="rp-a11y-shape">
          <div className="rp-a11y-head">
            <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
              <h2 id="rp-a11y-title" style={{ ...TY.h3, color: T.navy, margin: 0 }}>Options d'accessibilité</h2>
              <span style={{ ...TY.caption, color: T.body }}>Vos réglages restent sur cet appareil.</span>
            </div>
            <IconBtn icon={I.close} label="Fermer les options d'accessibilité" tone="muted" className="rp-a11y-close" onClick={() => close()} />
          </div>
          <div className="rp-a11y-body">
            <div className="rp-a11y-cols">
              <div style={{ display: "grid", gap: 16, alignContent: "start", minWidth: 0 }}>
                {group("a11y-g-text", "Texte", <>
                  {radios("a11y-size", "Taille du texte", "rp-a11y-seg rp-a11y-seg-2",
                    FONT_LABELS.map((l, i) => <Toggle key={l} on={s.size === i} onClick={() => set({ size: i })}>{l}</Toggle>))}
                  {sw("readable", "Police lisible", "Conçue pour faciliter la lecture (dyslexie).")}
                  {sw("spacing", "Texte espacé", "Lettres, mots et lignes plus espacés.")}
                </>)}
                {group("a11y-g-color", "Couleurs", <>
                  {radios("a11y-theme", "Thème", "rp-a11y-seg",
                    [["auto", "Automatique"], ["light", "Clair"], ["dark", "Sombre"]].map(([v, l]) => <Toggle key={v} on={s.theme === v} onClick={() => set({ theme: v })}>{l}</Toggle>))}
                  {sw("contrast", "Contraste élevé", "Textes et bordures plus marqués.")}
                </>)}
              </div>
              <div style={{ display: "grid", gap: 16, alignContent: "start", minWidth: 0 }}>
                {group("a11y-g-focus", "Lecture et attention", <>
                  {sw("ruler", "Règle de lecture", "Une bande suit le pointeur ou le doigt.")}
                  {sw("focus", "Mode concentration", "Masque les décors et les défilements automatiques.")}
                  {sw("motion", "Réduire les animations", "Plus de transition ni de défilement animé.")}
                </>)}
                {group("a11y-g-nav", "Repères", <>
                  {sw("links", "Liens toujours soulignés", "Les liens se repèrent sans la couleur.")}
                  {sw("focusRing", "Focus renforcé", "Contour épais autour de l'élément sélectionné.")}
                </>)}
              </div>
            </div>
          </div>
          <div className="rp-a11y-foot">
            <span role="status" style={{ ...TY.caption, color: T.body }}>{changed ? `${changed} réglage${changed > 1 ? "s" : ""} modifié${changed > 1 ? "s" : ""}` : "Réglages par défaut"}</span>
            <Btn kind="ghost" size="sm" icon={I.redo} onClick={() => applyA11y(resetA11y())}>Réinitialiser</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

/* Règle de lecture : une bande claire, le reste de l'écran légèrement voilé. Suit la souris, le doigt ou le focus. */
function ReadingRuler() {
  const top = useRef(null), bottom = useRef(null);
  useEffect(() => {
    const place = y => {
      const h = 48;
      if (top.current) top.current.style.height = `${Math.max(0, y - h / 2)}px`;
      if (bottom.current) bottom.current.style.top = `${y + h / 2}px`;
    };
    place(window.innerHeight / 2);
    const mv = e => place(e.touches ? e.touches[0].clientY : e.clientY);
    const fc = e => { const r = e.target?.getBoundingClientRect?.(); if (r) place(r.top + r.height / 2); };
    window.addEventListener("pointermove", mv, { passive: true });
    window.addEventListener("touchmove", mv, { passive: true });
    document.addEventListener("focusin", fc);
    return () => { window.removeEventListener("pointermove", mv); window.removeEventListener("touchmove", mv); document.removeEventListener("focusin", fc); };
  }, []);
  return (<>
    <div ref={top} aria-hidden className="rp-ruler" style={{ top: 0 }} />
    <div ref={bottom} aria-hidden className="rp-ruler" style={{ bottom: 0 }} />
  </>);
}
