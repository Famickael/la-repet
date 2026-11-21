import { prefersReduced } from "../lib/a11y.js";
import React, { useEffect, useState } from "react";
import { IconBtn, I } from "../ui.jsx";

/* « Revenir en haut » : apparaît après un défilement, remonte en douceur (saut direct en mouvement réduit),
   puis place le focus sur le titre de la page. Empilé au-dessus du bouton de l'assistant dans l'espace.
   Apparition et disparition en fondu (classe is-in, GStyle : opacité et léger déplacement ; opacité seule en
   mouvement réduit). Masqué : hors de la tabulation et des lecteurs d'écran. */
export function ToTop({ lift }) {
  const [show, setShow] = useState(false);
  useEffect(() => {
    let raf = 0;
    const on = () => { if (!raf) raf = requestAnimationFrame(() => { raf = 0; setShow(window.scrollY > 600); }); };
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => { window.removeEventListener("scroll", on); cancelAnimationFrame(raf); };
  }, []);
  const up = () => {
    const reduced = prefersReduced();
    window.scrollTo({ top: 0, behavior: reduced ? "auto" : "smooth" });
    const h = document.querySelector("main h1");
    if (h) { h.setAttribute("tabindex", "-1"); h.focus({ preventScroll: true }); }
  };
  return <IconBtn icon={I.arrowUp} label="Revenir en haut" variant="outline" className={`rp-totop noprint${show ? " is-in" : ""}`} onClick={up}
    tabIndex={show ? 0 : -1} aria-hidden={show ? undefined : "true"} style={{ bottom: lift ? 88 : 16 }} />;
}
