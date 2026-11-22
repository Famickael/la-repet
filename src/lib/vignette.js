/* Vignette d'interlocuteur (espace de la personne accompagnée) : préférence locale, désactivée par défaut.
   Lecture et écriture sous try/catch, comme les autres préférences (RecruiterVoice, lib/a11y.js). Un événement
   « rp-vignette » prévient les écrans ouverts (interrupteur de l'entraînement, menu « Mon compte »). Rien d'autre
   n'est mémorisé : la vignette n'est jamais enregistrée, l'enregistrement ne capture que la caméra. */
import { useEffect, useState } from "react";

export const VIGNETTE_KEY = "larepet.vignette";
export const VIGNETTE_EVENT = "rp-vignette";

export const readVignette = () => { try { return localStorage.getItem(VIGNETTE_KEY) === "1"; } catch { return false; } };
export function writeVignette(on) {
  try { localStorage.setItem(VIGNETTE_KEY, on ? "1" : "0"); } catch { /* stockage indisponible */ }
  if (typeof window !== "undefined") window.dispatchEvent(new CustomEvent(VIGNETTE_EVENT, { detail: !!on }));
}
export const toggleVignette = () => writeVignette(!readVignette());

/* État partagé : suit les changements faits ailleurs dans la page et dans un autre onglet. */
export function useVignette() {
  const [on, setOn] = useState(readVignette);
  useEffect(() => {
    const sync = () => setOn(readVignette());
    const storage = e => { if (e.key === VIGNETTE_KEY) sync(); };
    window.addEventListener(VIGNETTE_EVENT, sync);
    window.addEventListener("storage", storage);
    return () => { window.removeEventListener(VIGNETTE_EVENT, sync); window.removeEventListener("storage", storage); };
  }, []);
  return [on, writeVignette];
}
