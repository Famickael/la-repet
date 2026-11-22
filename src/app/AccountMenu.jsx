import React, { useEffect, useId, useRef, useState } from "react";
import { T, RAD, GAP, TY, SH, Btn, Bare, Txt, Icon, I, Modal } from "../ui.jsx";
import { openA11y } from "../A11y.jsx";
import { closeAssistant } from "../lib/bus.js";
import { setLastSpace, logoutCounselor, withdrawConsent } from "../lib/store.js";
import { readVignette, toggleVignette } from "../lib/vignette.js";
import { go } from "./router.js";
import { STILL } from "./Nav.jsx";

/* « Mon compte » (session ouverte) : menu déroulant sous le bouton (demande du propriétaire : retour à la
   navigation précédente, plutôt qu'un panneau latéral). Non modal : bouton aria-expanded relié au menu, focus
   envoyé sur la première action, flèches haut et bas, Début, Fin, Échap ferme et rend le focus au bouton, clic
   extérieur ou tabulation hors du menu ferment. Hauteur bornée à l'écran (défilement interne). Sur mobile, dans
   les pages publiques, les mêmes actions sont dans le menu mobile (AccountActions, src/app/Nav.jsx). N'est jamais
   ouvert en même temps que l'assistant : l'ouvrir ferme l'assistant. */

/* Aide adaptée à la session : la page des questions fréquentes, sur la section de la personne connectée.
   Choix documenté dans docs/redaction.md (« Demander de l'aide ») : l'assistant de l'espace répond aux questions
   sur l'entretien, pas aux questions sur le site, et n'existe pas sur toutes les pages. */
export const helpHash = role => (role === "coach" ? "#/ressources/faq/coachs" : "#/ressources/faq/personnes-accompagnees");

export function accountOf(route, s) {
  const coach = route.role === "coach";
  const code = route.code;
  const p = !coach && code ? s.parcours[code] : null;
  const who = coach ? s.counselor?.name || "Coach" : p?.prenom || "Mon espace";
  const items = coach
    ? [["space", "Retour à mon espace", I.user], ["help", "Demander de l'aide", I.info], ["data", "Vos données", I.shield], ["a11y", "Options d'accessibilité", I.a11y], ["logout", "Se déconnecter", I.logout]]
    : [["space", "Retour à mon espace", I.user], ["help", "Demander de l'aide", I.info], ["data", "Vos données", I.shield], ["a11y", "Options d'accessibilité", I.a11y], ["vignette", readVignette() ? "Masquer la vignette d'interlocuteur" : "Afficher la vignette d'interlocuteur", I.video], ["code", "Changer de code", I.redo], ["withdraw", "Retirer mon accord", I.trash], ["logout", "Se déconnecter", I.logout]];
  return { coach, code, who, items };
}

/* Exécute une action du compte. onWithdraw : ouvre la confirmation de retrait de l'accord. */
export function runAccountAction(k, { coach, code, onWithdraw }) {
  if (k === "a11y") openA11y();
  if (k === "space") go(coach ? "#/coach" : `#/s/${code}`);
  if (k === "help") go(helpHash(coach ? "coach" : "benef"));
  if (k === "data") go(coach ? "#/vos-donnees/coachs" : "#/vos-donnees");
  if (k === "code") { setLastSpace(null); go("#/beneficiaire"); }
  if (k === "withdraw") onWithdraw?.();
  if (k === "vignette") toggleVignette(); // vignette d'interlocuteur de l'entraînement (src/beneficiary/Interlocutor.jsx)
  if (k === "logout") { if (coach) logoutCounselor(); setLastSpace(null); go("#/"); }
}

/* En-tête du compte (pastille à initiale, prénom ou nom, rôle) et liste des actions. */
export function AccountActions({ acc, onAction, label = "Mon compte", id }) {
  return (
    <>
      <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 12px 8px" }}>
        <span aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", background: T.primaryBg, color: T.primary, display: "grid", placeItems: "center", flexShrink: 0, ...TY.h3 }}>{acc.who.charAt(0).toUpperCase()}</span>
        <div style={{ display: "grid", gap: 2, minWidth: 0 }}>
          <span style={{ ...TY.h4, color: T.navy }}>{acc.who}</span>
          <span style={{ ...TY.small, color: T.body }}>{acc.coach ? "Espace coach" : "Mon espace"}</span>
        </div>
      </div>
      <nav id={id} aria-label={label} style={{ display: "grid", gap: 2 }}>
        {acc.items.map(([k, l, ic]) => (
          <Bare key={k} onClick={() => onAction(k)} className="rp-menuitem"
            style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 44, padding: "0 12px", borderRadius: RAD.sm, ...TY.bodyStrong, color: k === "withdraw" ? T.errorDk : T.navy, textAlign: "left" }}>
            <Icon d={ic} s={20} />{l}
          </Bare>
        ))}
      </nav>
    </>
  );
}

/* Confirmation du retrait de l'accord (personne accompagnée). */
export function WithdrawDialog({ code, close }) {
  return (
    <Modal close={close} title="Retirer mon accord et tout supprimer ?" footer={
      <div className="rp-actions" style={{ display: "flex", justifyContent: "flex-end", gap: GAP.actions, flexWrap: "wrap" }}>
        <Btn kind="secondary" onClick={close}>Annuler</Btn>
        <Btn kind="dangerSolid" icon={I.trash} onClick={async () => { await withdrawConsent(code); close(); }}>Tout supprimer</Btn>
      </div>}>
      <div style={{ display: "grid", gap: 12 }}>
        <Txt v="bodyLg" color={T.body}>Si vous retirez votre accord, vos réponses et les rapports de votre coach sont effacés de cet appareil. C'est définitif.</Txt>
        <Txt v="body" color={T.body}>Vous pourrez recommencer quand vous voulez. Votre accompagnement continue normalement.</Txt>
      </div>
    </Modal>
  );
}

export function AccountMenu({ route, s, className }) {
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const btn = useRef(null), wrap = useRef(null), list = useRef(null);
  const id = `rp-account-${useId().replace(/:/g, "")}`;
  const acc = accountOf(route, s);
  const items = () => [...(list.current?.querySelectorAll(".rp-menuitem") || [])];
  useEffect(() => {
    if (!open) return;
    closeAssistant();
    requestAnimationFrame(() => items()[0]?.focus());
    const out = e => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    document.addEventListener("pointerdown", out);
    return () => document.removeEventListener("pointerdown", out);
  }, [open]);
  useEffect(() => { const c = () => setOpen(false); window.addEventListener("hashchange", c); return () => window.removeEventListener("hashchange", c); }, []);
  const onKey = e => {
    if (!open) return;
    const its = items(), i = its.indexOf(document.activeElement);
    const to = { ArrowDown: i + 1, ArrowUp: i < 0 ? its.length - 1 : i - 1, Home: 0, End: its.length - 1 }[e.key];
    if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); btn.current?.focus(); }
    else if (to !== undefined && its.length) { e.preventDefault(); its[(to + its.length) % its.length].focus(); }
  };
  const act = k => {
    setOpen(false);
    if (["a11y", "withdraw", "vignette"].includes(k)) btn.current?.focus();
    runAccountAction(k, { ...acc, onWithdraw: () => setConfirm(true) });
  };
  return (
    <div ref={wrap} className={className} style={{ position: "relative" }} onKeyDown={onKey}
      onBlur={e => { if (open && e.relatedTarget && !wrap.current?.contains(e.relatedTarget)) setOpen(false); }}>
      <Btn ref={btn} kind="secondary" size="sm" style={STILL} aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>
        <span className="rp-hide-m" style={{ display: "inline-flex" }}><Icon d={I.user} s={16} /></span>Mon compte
        <span className="rp-acct-chev" style={{ display: "inline-flex" }}><Icon d={I.chevron} s={16} /></span>
      </Btn>
      <div ref={list} id={id} className="rp-account-menu noprint" hidden={!open}
        style={{ boxShadow: SH.lg, borderRadius: RAD.md }}>
        {open && <AccountActions acc={acc} onAction={act} id={`${id}-nav`} />}
      </div>
      {confirm && <WithdrawDialog code={acc.code} close={() => { setConfirm(false); btn.current?.focus(); }} />}
    </div>
  );
}
