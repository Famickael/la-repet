import React, { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { T, TY, RAD, SH, ringOf, Bare, IconBtn, Icon, I } from "../ui.jsx";
import { useVignette } from "../lib/vignette.js";

/* Vignette d'interlocuteur (référentiel 5.9 quinquies) : comme en visioconférence quand l'autre personne a coupé sa
   caméra. Silhouette générique sur fond uni, libellé, icône de caméra coupée, sans photo, sans visage, sans
   expression. Seul signe de vie : des barres « parle » pendant la lecture de la question par la voix de synthèse
   (speaking, fourni par RecruiterVoice). Rien ne réagit à la voix ni à l'image de la personne : la vignette reste
   immobile pendant qu'elle parle (aucune inférence d'émotion, AI Act).
   Décorative pour les lecteurs d'écran (aria-hidden) ; seul le bouton « Masquer la vignette » est atteignable.
   Grand écran (1240 px et plus) : petite fenêtre fixe en bas à droite, dans la marge, au-dessus du bouton de
   l'assistant ; masquée quand l'assistant, le menu ou une fenêtre sont ouverts. En dessous : bandeau dans le flux,
   au-dessus de l'aperçu caméra, qui ne recouvre jamais une commande. Jamais dans la vidéo : l'enregistrement ne
   capture que la caméra. */

const WIDE = "(min-width: 1240px)";
function useWide() {
  const [wide, setWide] = useState(() => typeof window !== "undefined" && !!window.matchMedia?.(WIDE).matches);
  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia(WIDE), on = () => setWide(m.matches);
    on(); m.addEventListener?.("change", on);
    return () => m.removeEventListener?.("change", on);
  }, []);
  return wide;
}

/* Caméra coupée (icône au trait, même grille que src/ui/icons.jsx). */
const CAM_OFF = <><path d="M10.66 6H14a2 2 0 0 1 2 2v2.34l1 1L22 8v8" /><path d="M16 16a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h2" /><path d="M2 2l20 20" /></>;

/* Silhouette générique pleine : tête et épaules, sans trait de visage. */
function Silhouette({ s }) {
  return (
    <svg width={s} height={s} viewBox="0 0 64 64" aria-hidden="true" focusable="false" style={{ display: "block" }}>
      <circle cx="32" cy="24" r="12" fill="currentColor" />
      <path d="M10 60c0-12.2 9.8-20 22-20s22 7.8 22 20z" fill="currentColor" />
    </svg>
  );
}

function Avatar({ s, speaking }) {
  return (
    <span className="rp-vig-disc" style={{ width: s, height: s, borderRadius: "50%", background: T.line, color: T.faint, display: "grid", placeItems: "end center", overflow: "hidden", flexShrink: 0, boxShadow: speaking ? ringOf(T.lineStrong) : "none" }}>
      <Silhouette s={Math.round(s * 0.86)} />
    </span>
  );
}

const Bars = ({ speaking }) => <span className={`rp-vig-voice${speaking ? " on" : ""}`}><i /><i /><i /><i /></span>;

const Name = () => (
  <span style={{ display: "grid", gap: 2, minWidth: 0, flex: 1 }}>
    <span style={{ ...TY.label, color: T.navy }}>Votre interlocuteur</span>
    <span style={{ ...TY.caption, color: T.body, display: "inline-flex", alignItems: "center", gap: 4 }}><Icon d={CAM_OFF} s={16} />Caméra coupée</span>
  </span>
);

export default function Interlocutor({ speaking = false }) {
  const [on, set] = useVignette();
  const wide = useWide();
  if (!on) return null;
  const hide = <IconBtn icon={I.close} label="Masquer la vignette" tone="muted" onClick={() => set(false)} />;

  if (!wide) return (
    <div className="rp-vig rp-vig-inline noprint" data-testid="interlocutor" data-speaking={speaking ? "true" : "false"}
      style={{ display: "flex", alignItems: "center", gap: 12, padding: "4px 4px 4px 12px", borderRadius: RAD.md, background: T.lineLt, border: `1px solid ${T.line}` }}>
      <span aria-hidden="true" style={{ display: "flex", alignItems: "center", gap: 12, flex: 1, minWidth: 0, padding: "4px 0" }}>
        <Avatar s={40} speaking={speaking} />
        <Name />
        <Bars speaking={speaking} />
      </span>
      {hide}
    </div>
  );

  return createPortal(
    <div className="rp-vig rp-vig-float noprint" data-testid="interlocutor" data-speaking={speaking ? "true" : "false"}
      style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, overflow: "hidden" }}>
      <div aria-hidden="true" style={{ position: "relative", height: 120, display: "grid", placeItems: "center", background: T.lineLt }}>
        <Avatar s={72} speaking={speaking} />
        <span style={{ position: "absolute", top: 8, right: 8 }}><Bars speaking={speaking} /></span>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 4, padding: "4px 4px 4px 12px" }}>
        <span aria-hidden="true" style={{ display: "flex", flex: 1, minWidth: 0 }}><Name /></span>
        {hide}
      </div>
    </div>,
    document.body
  );
}

/* Interrupteur de l'option (écran d'entraînement, échauffement). Même rangée que les options d'accessibilité. */
export function VignetteSwitch() {
  const [on, set] = useVignette();
  return (
    <Bare role="switch" aria-checked={on} onClick={() => set(!on)} className="rp-a11y-row noprint" data-testid="vignette-switch">
      <span style={{ display: "grid", gap: 2, minWidth: 0 }}>
        <span style={{ ...TY.label, color: T.navy }}>Afficher une vignette d'interlocuteur</span>
        <span style={{ ...TY.caption, color: T.body }}>Une petite fenêtre neutre, comme en visio quand l'autre personne a coupé sa caméra. Elle n'apparaît pas dans votre vidéo.</span>
      </span>
      <span aria-hidden className="rp-a11y-sw"><i>{on && <Icon d={I.check} s={12} sw={3} />}</i></span>
    </Bare>
  );
}
