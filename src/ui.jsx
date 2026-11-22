import React, { useEffect, useId, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  GAP_MOBILE, T, ON, GLOW, GRAD, GRAD_MAIN, GRAD_COACH, GRAD_AI, GRAD_SOFT, GRAD_PAGE, FD, FB, FM, TY, PAD, PAD_MOBILE, GAP, W, RAD, SH, MO, Z,
  TONE, HEADER_H, HEADER_H_M, TY_MOBILE, GRAD_AI_BORDER, FONT_STACKS, MASK, GRAD_LOGO, FADE_FOOT, GRAD_CTA, GRAD_CTA_HOVER,
} from "./tokens.js";
import { Reveal, stagger } from "./motion.jsx";
import { GStyle } from "./ui/GStyle.jsx";
import { clock } from "./lib/format.js";

/* Composants de base de La Répét' (référentiel UI/UX v4, docs/design-system.md).
   Les jetons viennent de src/tokens.js et sont réexportés ici : les écrans n'importent que depuis ui.jsx.
   Aucune valeur de couleur n'est écrite dans ce fichier (règle X2 de tests/design-lint.mjs). */
export * from "./tokens.js";

/* ─── LOGOS ───
   Logo officiel découpé en masques (canal alpha des images fournies : tracé, anticrénelage et barre du « t » conservés).
   Les couleurs viennent des jetons : symbole en GRAD_LOGO (bleu clair vers violet), points et mot-symbole en navy,
   accents des « é » en violet. En thème sombre, les mêmes jetons donnent la variante claire, sans image à part. */
/* Chemin d'une image du dossier public/ (le site est servi sous un sous-dossier). */
const img = p => `${import.meta.env.BASE_URL}img/${p}`;
/* Masques du logo : fichiers de public/img/logo/, mis en cache et préchargés par index.html (PERF-07). */
const LOGO_BUBBLES = img("logo/bulles.png");
const LOGO_DOTS = img("logo/points.png");
const LOGO_ACCENTS = img("logo/accents.png");
const LOGO_LETTERS = img("logo/lettres.png");
const LOGO_SYM_RATIO = "200 / 171", LOGO_WORD_RATIO = "380 / 189";

/* Une couche du logo : la forme vient du masque, la couleur du fond (jeton ou dégradé). */
function LogoLayer({ src, bg }) {
  const m = `url("${src}")`;
  return <span aria-hidden className="rp-logo-layer" style={{ position: "absolute", inset: 0, background: bg, WebkitMaskImage: m, maskImage: m, WebkitMaskSize: "100% 100%", maskSize: "100% 100%", WebkitMaskRepeat: "no-repeat", maskRepeat: "no-repeat" }} />;
}

/* Symbole bulles La Répét'. white : tout en blanc, sur un dégradé de marque sombre. */
function RepetMark({ s = 36, white = false, height }) {
  return (
    <span aria-hidden className="rp-logo-sym" style={{ position: "relative", display: "block", flexShrink: 0, aspectRatio: LOGO_SYM_RATIO, ...(height ? { height } : { width: s }) }}>
      <LogoLayer src={LOGO_BUBBLES} bg={white ? ON.text : GRAD_LOGO} />
      <LogoLayer src={LOGO_DOTS} bg={white ? ON.text : T.navy} />
    </span>
  );
}

/* Mot-symbole « La Répét' » : lettres en navy, accents en violet (blanc sur un dégradé de marque sombre). */
function RepetWord({ height, dark = false }) {
  return (
    <span role="img" aria-label="La Répét'" className="rp-logo-word" style={{ position: "relative", display: "block", flexShrink: 0, height, aspectRatio: LOGO_WORD_RATIO }}>
      <LogoLayer src={LOGO_LETTERS} bg={dark ? ON.text : T.navy} />
      <LogoLayer src={LOGO_ACCENTS} bg={dark ? ON.text : T.violet} />
    </span>
  );
}

/* Logo complet La Répét' : symbole + mot-symbole. Tailles calculées à partir de s (exception X1). */
function RepetLogo({ s = 22, dark = false, tagline = true }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: s * 0.5 }}>
      <RepetMark height={s * 2.1} white={dark} />
      <div style={{ display: "flex", flexDirection: "column", gap: tagline ? 2 : 0 }}>
        <RepetWord height={s * 2.0} dark={dark} />
        {tagline && <div style={{ font: `400 ${s * 0.44}px ${FB}`, color: dark ? ON.text : T.muted }}>S'entraîner à l'entretien</div>}
      </div>
    </div>
  );
}

/* Emplacement du logo de l'organisme qui déploie l'outil (marque blanche).
   Tant qu'aucune image n'est fournie (ORG_LOGO_URL), un nom dans un cadre en pointillés
   signale l'emplacement (rendu validé par le propriétaire). */
const ORG_NAME = "Famickael";
const ORG_LOGO_URL = null;
function OrgLogo({ s = 10, dark = false }) {
  if (ORG_LOGO_URL) return <img src={ORG_LOGO_URL} alt={ORG_NAME} style={{ height: s * 3.2, width: "auto", display: "block" }} />;
  return (
    <div aria-label={ORG_NAME} role="img" style={{ height: s * 3.2, padding: "0 12px", border: `1.5px dashed ${dark ? ON.line : T.faint}`, borderRadius: RAD.sm, display: "inline-flex", alignItems: "center", flexShrink: 0 }}>
      <span aria-hidden style={{ font: `700 ${s * 1.4}px ${FD}`, color: dark ? ON.text : T.primary, letterSpacing: "-.01em" }}>{ORG_NAME}</span>
    </div>
  );
}

/* Halo lumineux décoratif. Dégradé radial plutôt qu'un flou (filter: blur coûte cher au défilement sur iPhone). */
function Halo({ style }) {
  const { background, ...rest } = style || {};
  return <div aria-hidden className="rp-deco" style={{ position: "absolute", borderRadius: "50%", pointerEvents: "none", background: `radial-gradient(closest-side, ${background}, transparent)`, ...rest }} />;
}

/* Blocage du défilement de la page (menu mobile, fenêtres) : html porte overflow-y:scroll, donc bloquer
   seulement body ne suffit pas. Compteur pour les ouvertures imbriquées ; renvoie la fonction de déblocage. */
let scrollLocks = 0;
function lockScroll() {
  scrollLocks += 1;
  document.documentElement.classList.add("rp-lock");
  let done = false;
  return () => { if (done) return; done = true; scrollLocks = Math.max(0, scrollLocks - 1); if (!scrollLocks) document.documentElement.classList.remove("rp-lock"); };
}


import { Icon, I } from "./ui/icons.jsx";

/* ─── TEXTE ─── */

/* Texte typé : <Txt v="h1" as="h2">. Le style vient de TY[v], la balise de as ; la classe ty-{v} applique la taille mobile. */
function Txt({ v = "body", as: As = "p", color, style, className, children, ...rest }) {
  return <As className={[`ty-${v}`, className].filter(Boolean).join(" ")} style={{ ...TY[v], color, margin: 0, ...style }} {...rest}>{children}</As>;
}

/* Surtitre (TY.overline), 4 mots au plus. mark : précédé du filet de marque (dégradé du logo, décor), pour les en-têtes
   de page et de section des pages publiques (charte v4). */
const Eyebrow = ({ children, c = T.primary, style, mark }) => (
  <div style={{ ...TY.overline, color: c, ...(mark ? { display: "flex", alignItems: "center", gap: 8 } : {}), ...style }}>
    {mark && <span aria-hidden className="rp-filet" />}{children}
  </div>
);

/* ─── BOUTONS ─── */

/* Bouton nu : un vrai <button> sans style, pour les éléments cliquables qui ne sont pas des boutons visuels
   (option, repère, onglet, case). Les écrans n'écrivent jamais <button> eux-mêmes (règle K1). */
const Bare = React.forwardRef(function Bare({ type = "button", style, children, ...rest }, ref) {
  return <button ref={ref} type={type} style={{ background: "none", border: "none", padding: 0, margin: 0, cursor: "pointer", color: "inherit", ...TY.inherit, textAlign: "inherit", ...style }} {...rest}>{children}</button>;
});

const BTN_SIZE = {
  sm: { h: 40, px: 16, ty: TY.btnSm, ic: 16 },
  md: { h: 48, px: 24, ty: TY.btn, ic: 16 },
  lg: { h: 56, px: 32, ty: TY.btnLg, ic: 20 },
};
/* Bouton (référentiel 5.1). kind : objective (une seule action principale par écran, dégradé du logo GRAD_CTA), ai, primary, secondary,
   ghost, danger, white, ghostDark. Icônes par icon (à gauche) et iconRight (flèche de progression). as="span" :
   aspect de bouton sans interaction (à l'intérieur d'une carte cliquable). */
const Btn = React.forwardRef(function Btn({ children, onClick, kind = "primary", size = "md", disabled, full, icon, iconRight, as, type, className, style, ...rest }, ref) {
  const [hov, setHov] = useState(false);
  const h = hov && !disabled;
  const sh = SH.btn[kind];
  const k = {
    primary: { background: h ? T.primaryDk : T.primary, color: T.surface, border: "none" },
    objective: { background: h ? GRAD_CTA_HOVER : GRAD_CTA, color: T.surface, border: "none" },
    ai: { background: GRAD_AI, color: T.surface, border: "none" },
    white: { background: T.surface, color: h ? T.primaryDk : T.primary, border: "none" },
    secondary: { background: T.surface, color: T.primary, border: `1.5px solid ${h ? T.primary : T.primaryLt}` },
    ghost: { background: h ? T.primaryBg : "transparent", color: T.primary, border: "none" },
    danger: { background: h ? T.errorBg : "transparent", color: T.errorDk, border: "none" },
    dangerSolid: { background: T.errorDk, color: T.surface, border: "none" }, // confirmation d'une suppression (A11Y-17)
    ghostDark: { background: ON.chip, color: ON.text, border: `1px solid ${ON.line}` },
  }[kind] || {};
  const sz = BTN_SIZE[size] || BTN_SIZE.md;
  const st = {
    ...sz.ty, lineHeight: 1.25, minHeight: sz.h, padding: `8px ${sz.px}px`, borderRadius: RAD.md, cursor: disabled ? "not-allowed" : "pointer",
    transition: `background-color ${MO.fast} ${MO.ease}, border-color ${MO.fast} ${MO.ease}, color ${MO.fast} ${MO.ease}, box-shadow ${MO.base} ${MO.ease}, transform ${MO.base} ${MO.ease}`,
    width: full ? "100%" : "auto", transform: h && sh ? "translateY(-1px)" : "none", boxShadow: sh ? sh[h ? 1 : 0] : "none",
    display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, textAlign: "center", flexShrink: 0, maxWidth: "100%", textDecoration: "none",
    ...k, ...(disabled ? { background: T.line, color: T.muted, border: "none", boxShadow: "none", transform: "none" } : {}), ...style,
  };
  const content = <>{icon && <Icon d={icon} s={sz.ic} />}{children}{iconRight && <Icon d={iconRight} s={sz.ic} />}</>;
  const cls = [`rp-btn rp-btn-${size}`, className].filter(Boolean).join(" ");
  if (as === "span") return <span className={cls} style={st} aria-hidden={rest["aria-hidden"]}>{content}</span>;
  return (
    <button ref={ref} type={type} onClick={disabled ? undefined : onClick} disabled={disabled} className={cls}
      onMouseEnter={() => !disabled && setHov(true)} onMouseLeave={() => setHov(false)} style={st} {...rest}>
      {content}
    </button>
  );
});

/* Bouton icône seul (référentiel 5.1) : 44 × 44, rond, aria-label obligatoire.
   variant : outline (bordure, fond blanc), plain (transparent), dark (sur fond sombre). */
const IconBtn = React.forwardRef(function IconBtn({ icon, label, onClick, variant = "plain", tone = "primary", size = 20, className, style, ...rest }, ref) {
  const color = variant === "dark" ? ON.text : tone === "muted" ? T.muted : T.primary;
  return (
    <button ref={ref} type="button" aria-label={label} title={label} onClick={onClick}
      className={[`rp-icbtn rp-icbtn-${variant}`, className].filter(Boolean).join(" ")} style={{ color, ...style }} {...rest}>
      <Icon d={icon} s={size} />
    </button>
  );
});

/* Bouton flottant de l'assistant (56 × 56, dégradé IA) : aria-label obligatoire. */
const Fab = React.forwardRef(function Fab({ icon, label, className, ...rest }, ref) {
  return <button ref={ref} type="button" aria-label={label} title={label} className={["rp-ai-fab", className].filter(Boolean).join(" ")} {...rest}><Icon d={icon} s={24} /></button>;
});

/* Lien (référentiel 5.2) : souligné, primary, taille héritée. href → <a>, sinon bouton. solo : lien seul sur sa ligne
   (hors d'une phrase), zone tactile de 44 px de haut (référentiel 8). */
function Link({ href, onClick, onDark, solo, children, style, className, ...rest }) {
  const st = { ...TY.link, color: onDark ? ON.text : T.primary, ...(solo ? { display: "inline-flex", alignItems: "center", minHeight: 44 } : {}), ...style };
  const cls = ["rp-link", className].filter(Boolean).join(" ");
  if (href) return <a href={href} onClick={onClick} className={cls} style={st} {...rest}>{children}</a>;
  return <Bare onClick={onClick} className={cls} style={st} {...rest}>{children}</Bare>;
}

/* Retour (référentiel 5.2) : TY.body en muted, flèche à gauche, zone tactile 44. */
const Back = ({ onClick, children = "Retour" }) => (
  <Bare onClick={onClick} className="rp-back" style={{ ...TY.body, color: T.muted, minHeight: 44, display: "inline-flex", alignItems: "center", gap: 8 }}>
    <Icon d={I.arrowL} s={16} />{children}
  </Bare>
);

/* ─── ÉTIQUETTES, CARTES, MESSAGES ─── */

/* Étiquette (référentiel 5.4) : hauteur 24, non cliquable. */
function Tag({ children, tone = "primary", icon }) {
  const t = TONE[tone] || TONE.primary;
  return (
    <span style={{ ...TY.tag, color: t.fg, background: t.bg, minHeight: 24, padding: "2px 12px", borderRadius: RAD.pill, display: "inline-flex", alignItems: "center", gap: 4, whiteSpace: "normal", maxWidth: "100%" }}>
      {icon && <Icon d={icon} s={12} />}{children}
    </span>
  );
}

/* Carte (référentiel 5.5). pad : none | sm | md | lg (mobile : classes rp-pad-*). level 2 : carte principale.
   topbar : true (bénéficiaire), "coach", "ai". Cliquable (onClick) : rendue en <button>. */
function Card({ children, style, pad = "md", level = 1, hover, onClick, topbar, className, label, as }) {
  const [h, setH] = useState(false);
  const lift = (hover || onClick) && h;
  const st = {
    position: "relative", display: "block", width: onClick ? "100%" : undefined, textAlign: onClick ? "left" : undefined,
    background: T.surface, border: `1px solid ${T.line}`, borderRadius: pad === "sm" ? RAD.md : RAD.lg, padding: PAD[pad] ?? 0,
    boxShadow: lift ? SH.lg : level === 2 ? SH.sm : SH.xs, transition: `box-shadow ${MO.base} ${MO.ease}, transform ${MO.base} ${MO.ease}, border-color ${MO.fast}`,
    transform: lift ? "translateY(-2px)" : "none", cursor: onClick ? "pointer" : undefined,
    overflow: pad === "none" ? "hidden" : undefined, color: "inherit", ...TY.inherit, ...style,
  };
  /* Bordure haute en dégradé : pseudo-élément qui épouse l'arrondi (référentiel 5.5). */
  const tb = topbar && `rp-tb rp-tb-${topbar === "coach" ? "coach" : topbar === "ai" ? "ai" : "main"}`;
  const cls = [pad !== "none" && `rp-pad-${pad}`, tb, className].filter(Boolean).join(" ");
  const hv = { onMouseEnter: () => setH(true), onMouseLeave: () => setH(false) };
  if (onClick) return <button type="button" onClick={onClick} aria-label={label} className={cls} style={st} {...hv}>{children}</button>;
  const As = as || "div";
  return <As className={cls || undefined} style={st} {...(hover ? hv : {})}>{children}</As>;
}

/* Message (référentiel 5.8). tone : info, success, warning, error, ai. */
const NOTICE = {
  info: { bg: T.primaryBg, ic: T.primary, fg: T.navy, icon: I.info },
  success: { bg: T.successBg, ic: T.successDk, fg: T.navy, icon: I.check, role: "status" },
  warning: { bg: T.warningBg, ic: T.warningDk, fg: T.warningDk, icon: I.info, role: "status" },
  error: { bg: T.errorBg, ic: T.errorDk, fg: T.errorDk, icon: I.ban, role: "alert" },
  ai: { bg: T.violetBg, ic: T.violet, fg: T.navy, icon: I.sparkle },
};
function Notice({ tone = "info", icon, children, style, role, ...rest }) {
  const n = NOTICE[tone] || NOTICE.info;
  return (
    <div role={role === undefined ? n.role : role || undefined} style={{ display: "flex", gap: 12, alignItems: "flex-start", background: n.bg, borderRadius: RAD.md, padding: PAD.notice, ...TY.small, color: n.fg, ...style }} {...rest}>
      <span style={{ display: "inline-flex", marginTop: 2, color: n.ic }}><Icon d={icon || n.icon} s={16} /></span>
      <div style={{ minWidth: 0, flex: 1 }}>{children}</div>
    </div>
  );
}

/* Commentaire du coach (référentiel 5.8, cas nommé) : fond primaryBg, filet gauche 3 px primary.
   size="lg" : message d'introduction du coach en tête du rapport (UI-08). */
const Quote = ({ children, icon = I.note, style, size }) => (
  <div style={{ display: "flex", gap: 8, alignItems: "flex-start", background: T.primaryBg, borderLeft: `3px solid ${T.primary}`, borderRadius: RAD.xs, padding: size === "lg" ? "16px 20px" : "8px 12px", ...(size === "lg" ? TY.bodyLg : TY.small), color: T.navy, ...style }}>
    {icon && <span style={{ display: "inline-flex", marginTop: 2, color: T.primary }}><Icon d={icon} s={16} /></span>}
    <div style={{ minWidth: 0, flex: 1 }}>{children}</div>
  </div>
);

/* Pastille d'icône (référentiel 5.10) : 40, RAD.sm, fond primaryBg. */
/* Pastille d'icône. Sans couleur imposée : neutre (primary sur primaryBg) dans les écrans d'application, et tuile de
   marque (dégradé du logo, icône T.surface) dans une section éditoriale des pages publiques (.rs-sec, charte v4).
   Les tons de rôle (violet de l'assistant, vert du coach) y deviennent pleins de la même façon, sans changer de rôle. */
const IconTile = ({ icon, c, bg, s = 40, round }) => (
  <div aria-hidden className={!c && !bg ? "rp-itile" : c === T.violet && bg === T.violetBg ? "rp-itile rp-itile-ai" : c === T.coach && bg === T.coachBg ? "rp-itile rp-itile-coach" : undefined}
    style={{ width: s, height: s, borderRadius: round ? "50%" : RAD.sm, background: bg || T.primaryBg, display: "grid", placeItems: "center", flexShrink: 0, color: c || T.primary }}>
    <Icon d={icon} s={s >= 48 ? 24 : 20} />
  </div>
);

/* État vide (référentiel 5.9). */
const Empty = ({ icon = I.info, title, text, action }) => (
  <Card pad="lg" style={{ textAlign: "center", display: "grid", justifyItems: "center", gap: 8 }}>
    <IconTile icon={icon} s={48} />
    {title && <Txt v="h3" as="h3" color={T.navy} style={{ marginTop: 8 }}>{title}</Txt>}
    {text && <Txt v="body" color={T.body} style={{ maxWidth: 480 }}>{text}</Txt>}
    {action && <div style={{ marginTop: 8 }}>{action}</div>}
  </Card>
);

/* Rond de confirmation (référentiel 5.10) : 56, fond successBg, coche 28 successDk. */
const ConfirmMark = () => (
  <div aria-hidden style={{ width: 56, height: 56, borderRadius: "50%", background: T.successBg, display: "grid", placeItems: "center", color: T.successDk, flexShrink: 0 }}><Icon d={I.check} s={28} /></div>
);
/* Écran de confirmation : rond, titre, texte, actions, centrés. */
function Confirm({ title, as = "h1", children, actions, width = W.form, level = 2 }) {
  return (
    <Card pad="lg" level={level} style={{ maxWidth: width, margin: "0 auto", textAlign: "center", display: "grid", justifyItems: "center", gap: 16 }}>
      <ConfirmMark />
      <div style={{ display: "grid", gap: 8, justifyItems: "center" }}>
        <Txt v="h1" as={as} color={T.navy}>{title}</Txt>
        {children && <div style={{ ...TY.body, color: T.body, maxWidth: 440 }}>{children}</div>}
      </div>
      {actions && <div className="rp-actions" style={{ display: "flex", gap: GAP.actions, justifyContent: "center", flexWrap: "wrap", marginTop: 8 }}>{actions}</div>}
    </Card>
  );
}

/* Pastille horaire (référentiel 5.10) : hauteur 24, TY.time, fond de la couleur du rôle, texte blanc.
   Cliquable : zone tactile 44 par un padding transparent. */
const fmtTime = clock; // src/lib/format.js
const TIME_BG = { appui: T.accent, ai: T.violet, primary: T.primary };
function TimeChip({ t, tone = "primary", onClick, label }) {
  const chip = (
    <span style={{ ...TY.time, height: 24, minWidth: 40, padding: "0 8px", borderRadius: RAD.pill, background: TIME_BG[tone] || T.primary, color: T.surface, display: "inline-grid", placeItems: "center", flexShrink: 0, fontVariantNumeric: "tabular-nums" }}>
      {typeof t === "number" ? fmtTime(t) : t}
    </span>
  );
  if (!onClick) return chip;
  return <Bare onClick={onClick} aria-label={label} style={{ minHeight: 44, display: "inline-flex", alignItems: "center", flexShrink: 0 }}>{chip}</Bare>;
}

/* ─── CHAMPS ─── */

/* Champ (référentiel 5.3) : libellé, aide reliée, message d'erreur annoncé. */
function Field({ id, label, hint, error, children, srLabel }) {
  return (
    <div style={{ display: "grid", gap: 8 }}>
      <div style={{ display: "grid", gap: 4 }}>
        <label htmlFor={id} className={srLabel ? "rp-sr" : undefined} style={{ ...TY.label, color: T.navy }}>{label}</label>
        {hint && <span id={`${id}-h`} style={{ ...TY.caption, color: T.muted }}>{hint}</span>}
      </div>
      {children}
      {error && <span id={`${id}-e`} role="alert" style={{ ...TY.small, color: T.errorDk, display: "flex", gap: 8, alignItems: "flex-start" }}><span style={{ display: "inline-flex", marginTop: 2 }}><Icon d={I.ban} s={16} /></span>{error}</span>}
    </div>
  );
}
const describedBy = (id, hint, error, extra) => [hint && `${id}-h`, error && `${id}-e`, extra].filter(Boolean).join(" ") || undefined;
/* Champ de saisie : variant="code" (code d'accès), icon (loupe à gauche), invalid. */
const Input = React.forwardRef(function Input({ id, hint, error, invalid, variant, icon, className, style, "aria-describedby": db, ...rest }, ref) {
  const cls = ["rs-input", variant === "code" && "rs-input-code", icon && "rs-input-icon", className].filter(Boolean).join(" ");
  const el = <input ref={ref} id={id} className={cls} aria-invalid={error || invalid ? "true" : undefined} aria-describedby={describedBy(id, hint, error, db)} style={icon ? undefined : style} {...rest} />;
  if (!icon) return el;
  return (
    <div style={{ position: "relative", ...style }}>
      <span aria-hidden style={{ position: "absolute", left: 16, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none", color: T.muted }}><Icon d={icon} s={16} /></span>
      {el}
    </div>
  );
});
const Textarea = ({ id, hint, error, invalid, className, ...rest }) => (
  <textarea id={id} className={["rs-input", className].filter(Boolean).join(" ")} aria-invalid={error || invalid ? "true" : undefined} aria-describedby={describedBy(id, hint, error)} {...rest} />
);
/* Liste déroulante : flèche en icône (couleur primary, suit le thème sombre, UI-12). */
const Select = ({ id, hint, error, options, placeholder, ...rest }) => (
  <div style={{ position: "relative" }}>
    <select id={id} className="rs-input" aria-invalid={error ? "true" : undefined} aria-describedby={describedBy(id, hint, error)} {...rest}>
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => <option key={o} value={o}>{o}</option>)}
    </select>
    <span aria-hidden style={{ position: "absolute", right: 16, top: 0, bottom: 0, display: "flex", alignItems: "center", pointerEvents: "none", color: T.primary }}><Icon d={I.chevron} s={16} /></span>
  </div>
);

/* Case de choix en tuile (consentement, sélection de questions) : role="checkbox", état sélectionné de 1.6.
   mark : contenu de la case (coche par défaut, ou numéro d'ordre). */
function CheckTile({ on, onToggle, children, mark, label, after, style }) {
  return (
    <div className={`rp-tile ${on ? "on" : ""}`} style={{ position: "relative", minWidth: 0, ...style }}>
      <Bare role="checkbox" aria-checked={on} aria-label={label} onClick={onToggle} className="rp-tile-btn"
        style={{ display: "flex", gap: 12, alignItems: "flex-start", width: "100%", padding: after ? "16px 48px 16px 16px" : 16, borderRadius: RAD.md, textAlign: "left" }}>
        <span aria-hidden className="rp-tile-box" style={{ ...TY.label, width: 24, height: 24, borderRadius: RAD.xs, flexShrink: 0, display: "grid", placeItems: "center" }}>
          {on && (mark ?? <Icon d={I.check} s={16} />)}
        </span>
        <span style={{ flex: 1, minWidth: 0, display: "grid", gap: 4 }}>{children}</span>
      </Bare>
      {after && <span style={{ position: "absolute", top: 4, right: 4 }}>{after}</span>}
    </div>
  );
}

/* Puce (filtre, choix) : aria-pressed par défaut, ou role radio / checkbox (aria-checked) avec coche.
   tone="ai" : suggestion de l'assistant. */
function Chip({ pressed, on, onClick, role, tone, children, disabled, check, ...rest }) {
  const sel = !!(pressed ?? on);
  const aria = role ? { role, "aria-checked": sel } : { "aria-pressed": sel ? "true" : "false" };
  return (
    <button type="button" className={`rs-chip${tone === "ai" ? " rs-chip-ai" : ""}`} onClick={onClick} disabled={disabled} {...aria} {...rest}>
      {(check ?? !!role) && sel && <Icon d={I.check} s={16} />}{children}
    </button>
  );
}

/* Choix exclusif en ligne (référentiel 5.3) : hauteur 48, role="radio" dans un role="radiogroup". */
const Toggle = ({ on, onClick, children }) => (
  <button type="button" role="radio" aria-checked={on} onClick={onClick} className="rp-toggle">{children}</button>
);

/* ─── STRUCTURE ─── */

/* Rail d'étapes (référentiel 5.10). Mobile : seul le libellé de l'étape en cours, précédé de « Étape n sur N ». */
function Rail({ step, steps }) {
  return (
    <ol aria-label="Étapes" style={{ display: "flex", alignItems: "center", flexWrap: "wrap", gap: 8, listStyle: "none", margin: 0, padding: 0 }}>
      {steps.map((s, i) => {
        const done = i < step, now = i === step;
        return (
          <li key={i} aria-current={now ? "step" : undefined} className={now ? undefined : "rp-rail-other"} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <span aria-hidden style={{ ...TY.time, width: 28, height: 28, borderRadius: "50%", flexShrink: 0, display: "grid", placeItems: "center",
              background: done ? T.successDk : now ? T.accent : T.surface, border: done || now ? "none" : `1.5px solid ${T.lineStrong}`, color: done || now ? T.surface : T.muted }}>
              {done ? <Icon d={I.check} s={16} sw={3} /> : i + 1}
            </span>
            <span style={{ ...(now ? TY.label : TY.small), ...(now ? TY.strong : {}), color: now ? T.accent : done ? T.successDk : T.muted }}>
              {now && <span className="rp-show-m">{`Étape ${i + 1} sur ${steps.length} · `}</span>}{s}{done && <span className="rp-sr"> (terminée)</span>}
            </span>
            {i < steps.length - 1 && <span aria-hidden className="rp-hide-m" style={{ width: 24, height: 2, background: done ? T.successDk : T.line, marginLeft: 4 }} />}
          </li>
        );
      })}
    </ol>
  );
}

/* En-tête dégradé (référentiel 5.7) : en haut de la carte principale (Card pad="none"). */
function GradHead({ tag, title, sub, action, soft, as: As = "h1" }) {
  return (
    <div className="rp-pad-lg" style={{ position: "relative", overflow: "hidden", padding: PAD.lg, background: soft ? GRAD_SOFT : GRAD }}>
      {!soft && <Halo style={{ width: 220, height: 220, background: ON.glow, bottom: -120, right: -32 }} />}
      <div style={{ position: "relative", display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 16, flexWrap: "wrap" }}>
        <div style={{ display: "grid", gap: 8, minWidth: 0 }}>
          {tag && <div style={{ marginBottom: 4 }}><span style={{ ...TY.tag, color: soft ? T.primary : ON.text, background: soft ? T.surface : ON.chip, height: 24, padding: "0 12px", borderRadius: RAD.pill, display: "inline-flex", alignItems: "center" }}>{tag}</span></div>}
          <As className="ty-h1" style={{ ...TY.h1, color: soft ? T.navy : ON.text, margin: 0, overflowWrap: "anywhere" }}>{title}</As>
          {sub && <p style={{ ...TY.body, color: soft ? T.body : ON.text, margin: 0, maxWidth: 520 }}>{sub}</p>}
        </div>
        {action}
      </div>
    </div>
  );
}

/* Fenêtre modale (référentiel 5.6), implémentation unique.
   head : "grad" | "soft" | "none" ; width : "form" | "read". Focus envoyé dans la modale, retenu, rendu à la fermeture. */
function Modal({ open = true, close, title, sub, icon, head = "none", width = "form", footer, children, label }) {
  const panel = useRef(null);
  const tid = useId().replace(/:/g, "");
  useEffect(() => {
    if (!open) return;
    const prevFocus = document.activeElement;
    const unlock = lockScroll();
    /* Fond inerte (A11Y-16) : page et en-tête ne reçoivent ni clic ni focus tant que la fenêtre est ouverte. */
    const behind = [...document.querySelectorAll(".rp-view, header.rp-header")].filter(el => !el.inert);
    behind.forEach(el => { el.inert = true; });
    const focusables = () => [...(panel.current?.querySelectorAll("a[href],button:not([disabled]),input,textarea,select,[tabindex]:not([tabindex='-1'])") || [])];
    const first = focusables().find(el => !el.classList.contains("rp-modal-close")) || focusables()[0];
    first?.focus();
    const key = e => {
      if (e.key === "Escape") { e.stopPropagation(); close(); }
      if (e.key === "Tab") {
        const f = focusables(); if (!f.length) return;
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    document.addEventListener("keydown", key);
    return () => { document.removeEventListener("keydown", key); behind.forEach(el => { el.inert = false; }); unlock(); prevFocus?.focus?.(); };
  }, [open]); // eslint-disable-line
  if (!open) return null;
  const dark = head === "grad";
  /* Rendue dans <body> : jamais prise dans un parent qui crée un contexte (en-tête collant avec flou), donc toujours centrée. */
  return createPortal(
    <div className="rp-modal" onClick={e => { if (e.target === e.currentTarget) close(); }}
      style={{ position: "fixed", inset: 0, zIndex: Z.modal, background: T.overlay, backdropFilter: "blur(4px)", WebkitBackdropFilter: "blur(4px)", display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
      <div ref={panel} role="dialog" aria-modal="true" aria-labelledby={title ? tid : undefined} aria-label={title ? undefined : label} className="up"
        style={{ background: T.surface, borderRadius: RAD.lg, boxShadow: SH.lg, width: "100%", maxWidth: W[width] || W.form, display: "flex", flexDirection: "column", overflow: "hidden" }}>
        <div className={dark ? "rp-pad-lg rs-on-dark" : "rp-pad-lg"} style={{ position: "relative", overflow: "hidden", padding: title ? PAD.lg : `${PAD.sm}px ${PAD.sm}px 0`, background: head === "grad" ? GRAD : head === "soft" ? GRAD_SOFT : T.surface, flexShrink: 0, borderBottom: title && head === "none" ? `1px solid ${T.line}` : "none" }}>
          {dark && <Halo style={{ width: 200, height: 200, background: ON.glow, bottom: -112, right: -20 }} />}
          <div style={{ position: "relative", display: "flex", alignItems: "center", justifyContent: title ? "space-between" : "flex-end", gap: 12 }}>
            {title && (
              <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 0 }}>
                {icon && <IconTile icon={icon} c={dark ? ON.text : T.primary} bg={dark ? ON.chip : T.surface} />}
                <div style={{ display: "grid", gap: 4, minWidth: 0 }}>
                  <h2 id={tid} style={{ ...TY.h2, color: dark ? ON.text : T.navy, margin: 0 }}>{title}</h2>
                  {sub && <div style={{ ...TY.small, color: dark ? ON.text : T.body }}>{sub}</div>}
                </div>
              </div>
            )}
            <IconBtn icon={I.close} label="Fermer" onClick={close} variant={dark ? "dark" : "plain"} tone="muted" className="rp-modal-close" />
          </div>
        </div>
        <div className="rp-pad-lg" style={{ padding: PAD.lg, overflowY: "auto" }}>{children}</div>
        {footer && <div className="rp-pad-lg" style={{ padding: `${PAD.sm}px ${PAD.lg}px`, borderTop: `1px solid ${T.line}`, flexShrink: 0 }}>{footer}</div>}
      </div>
    </div>,
    document.body
  );
}

/* Confirmation d'une action destructive (A11Y-17) : fenêtre du site, bouton destructif plein, à la place de window.confirm. */
function ConfirmDialog({ title, children, confirmLabel = "Supprimer", onConfirm, onCancel }) {
  const [busy, setBusy] = useState(false);
  return (
    <Modal close={onCancel} title={title} footer={
      <div className="rp-actions" style={{ display: "flex", justifyContent: "flex-end", gap: GAP.actions, flexWrap: "wrap" }}>
        <Btn kind="secondary" onClick={onCancel}>Annuler</Btn>
        <Btn kind="dangerSolid" icon={I.trash} disabled={busy} onClick={async () => { setBusy(true); try { await onConfirm(); } finally { setBusy(false); } }}>{confirmLabel}</Btn>
      </div>}>
      <div style={{ ...TY.bodyLg, color: T.body, display: "grid", gap: 12 }}>{children}</div>
    </Modal>
  );
}

/* Groupe de choix exclusifs (A11Y-10, motif ARIA radiogroup) : un seul arrêt de tabulation (le choix courant, sinon le
   premier), flèches, Début et Fin pour se déplacer et choisir. Les enfants sont des Chip ou Toggle de rôle radio. */
function RadioGroup({ children, style, className, ...rest }) {
  const ref = useRef(null);
  const radios = () => [...(ref.current?.querySelectorAll('[role="radio"]:not([disabled])') || [])];
  useEffect(() => {
    const rs = radios();
    const cur = rs.find(r => r.getAttribute("aria-checked") === "true") || rs[0];
    rs.forEach(r => { r.tabIndex = r === cur ? 0 : -1; });
  });
  const onKeyDown = e => {
    const rs = radios(), i = rs.indexOf(document.activeElement);
    if (i < 0) return;
    const to = { ArrowRight: i + 1, ArrowDown: i + 1, ArrowLeft: i - 1, ArrowUp: i - 1, Home: 0, End: rs.length - 1 }[e.key];
    if (to === undefined) return;
    e.preventDefault();
    const r = rs[(to + rs.length) % rs.length];
    r.focus(); r.click();
  };
  return <div ref={ref} role="radiogroup" className={className} style={style} onKeyDown={onKeyDown} {...rest}>{children}</div>;
}

/* Menu d'actions secondaires (UI-02) : bouton « Autres actions » qui ouvre une liste de boutons ; Échap ou un clic
   ailleurs ferme, le focus revient au bouton. items : [{ label, icon, onClick, danger }]. */
function Menu({ label = "Autres actions", items }) {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null), btn = useRef(null);
  const id = useId().replace(/:/g, "");
  useEffect(() => {
    if (!open) return;
    const out = e => { if (!wrapRef.current?.contains(e.target)) setOpen(false); };
    const key = e => { if (e.key === "Escape") { setOpen(false); btn.current?.focus(); } };
    document.addEventListener("pointerdown", out); document.addEventListener("keydown", key);
    requestAnimationFrame(() => wrapRef.current?.querySelector(".rp-menuitem")?.focus());
    return () => { document.removeEventListener("pointerdown", out); document.removeEventListener("keydown", key); };
  }, [open]);
  return (
    <div ref={wrapRef} style={{ position: "relative", display: "inline-block" }}>
      <Btn ref={btn} kind="ghost" size="sm" icon={I.more} aria-expanded={open} aria-controls={id} onClick={() => setOpen(o => !o)}>{label}</Btn>
      {open && (
        <div id={id} style={{ position: "absolute", left: 0, bottom: "calc(100% + 8px)", zIndex: 30, minWidth: 240, background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, padding: 4, display: "grid", gap: 2 }}>
          {items.filter(Boolean).map(it => (
            <Bare key={it.label} className="rp-menuitem" onClick={() => { setOpen(false); btn.current?.focus(); it.onClick(); }}
              style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 44, padding: "0 12px", borderRadius: RAD.sm, ...TY.bodyStrong, color: it.danger ? T.errorDk : T.navy, textAlign: "left" }}>
              {it.icon && <Icon d={it.icon} s={16} />}{it.label}
            </Bare>
          ))}
        </div>
      )}
    </div>
  );
}

/* Logo animé d'attente (bulles qui se rapprochent, points qui « tapent ») avec un libellé d'état.
   full : plein écran (connexion à un espace) ; sinon dans le bloc. role="status", aria-live ; statique en mouvement réduit. */
function BrandLoader({ label, full = false, size = 72 }) {
  const gid = useId().replace(/:/g, "");
  const box = (
    <div role="status" aria-live="polite" style={{ display: "grid", justifyItems: "center", gap: 16, textAlign: "center" }}>
      <svg viewBox="0 0 204 172" width={size} aria-hidden="true" focusable="false" style={{ overflow: "visible" }}>
        <defs>
          <linearGradient id={`${gid}g`} gradientUnits="userSpaceOnUse" x1="0" y1="172" x2="204" y2="0"><stop offset="0" style={{ stopColor: T.blue }} /><stop offset="1" style={{ stopColor: T.violet }} /></linearGradient>
        </defs>
        <g className="rp-bl-r"><path fill={`url(#${gid}g)`} d="M88 16H150A50 50 0 0 1 200 66V86A50 50 0 0 1 150 136H122V122H134A30 30 0 0 0 134 62H88Z" /></g>
        <g className="rp-bl-l"><path fill={`url(#${gid}g)`} d="M88 44H54A50 50 0 0 0 38 141.4L40 166L67 144H112A6 6 0 0 0 118 138V122H82A30 30 0 0 1 82 62H88Z" /></g>
        {[88, 108, 128].map((cx, k) => <circle key={cx} className={`rp-bl-d rp-bl-d${k + 1}`} cx={cx} cy="92" r="6.5" fill={T.navy} />)}
      </svg>
      {label && <div style={{ ...TY.h3, color: T.navy }}>{label}</div>}
    </div>
  );
  if (!full) return box;
  return createPortal(<div className="rp-bl-full">{box}</div>, document.body);
}

/* ─── PAGES PUBLIQUES ─── */

/* Section éditoriale : surtitre avec filet de marque, titre TY.xl, chapeau, contenu. Sur une page secondaire (après
   PageHero), une section sur deux est posée sur une bande teintée pleine largeur (.rs-sec, GStyle, charte v4). */
const Section = ({ id, eyebrow, title, sub, children, first }) => (
  <section id={id} className={first ? "rs-section rs-sec rs-first" : "rs-section rs-sec"} style={{ paddingTop: first ? GAP.head : GAP.section, scrollMarginTop: GAP.section }}>
    <Reveal>
      <div style={{ display: "grid", gap: 12, maxWidth: W.read }}>
        {eyebrow && <Eyebrow mark>{eyebrow}</Eyebrow>}
        <h2 className="ty-xl" style={{ ...TY.xl, color: T.navy, margin: 0 }}>{title}</h2>
        {sub && <p className="ty-lead" style={{ ...TY.lead, color: T.body, margin: 0 }}>{sub}</p>}
      </div>
    </Reveal>
    <div style={{ marginTop: GAP.block }}>{children}</div>
  </section>
);
/* En-tête des pages secondaires : surtitre, titre, chapeau, visuel facultatif. Charte v4 : fond du bleu teinté au violet
   teinté (GRAD_PAGE), filet de marque dessous, et symbole du logo en filigrane à droite quand il n'y a pas de visuel
   (décor, grand écran seulement, jamais sous le texte). */
function PageHero({ eyebrow, title, lead, children, aside }) {
  return (
    <section className="rs-phero" style={{ position: "relative", overflow: "hidden", background: GRAD_PAGE }}>
      {!aside && <div aria-hidden className="rs-phero-mark rp-deco"><RepetMark s={280} /></div>}
      <div className="rs-pad" style={{ position: "relative", maxWidth: W.page, margin: "0 auto", padding: `${GAP.band}px ${PAD.x}px` }}>
        <div className={aside ? "rs-split" : undefined} style={aside ? { alignItems: "start" } : undefined}>
          <div className="up" style={{ display: "grid", gap: 16, maxWidth: W.read }}>
            {eyebrow && <Eyebrow mark>{eyebrow}</Eyebrow>}
            <h1 className="ty-pageTitle" style={{ ...TY.pageTitle, color: T.navy, margin: 0 }}>{title}</h1>
            {lead && <p className="ty-lead" style={{ ...TY.lead, color: T.body, margin: 0 }}>{lead}</p>}
            {children}
          </div>
          {aside}
        </div>
      </div>
      <div aria-hidden className="rs-phero-filet" />
    </section>
  );
}

/* Accordéon : bouton aria-expanded relié à son panneau, ouvrable au clavier (Entrée, Espace). */
function Accordion({ items, idPrefix }) {
  const [open, setOpen] = useState(null);
  const base = useId().replace(/:/g, "");
  return (
    <div style={{ borderTop: `1px solid ${T.line}` }}>
      {items.map(([q, a], i) => {
        const id = `${idPrefix || base}-${i}`, on = open === i;
        return (
          <Reveal key={q} className="rs-acc" delay={stagger(i, 4)}>
            <h3 style={{ margin: 0 }}>
              <button type="button" id={`${id}-b`} className="rs-acc-btn" aria-expanded={on} aria-controls={`${id}-p`} onClick={() => setOpen(on ? null : i)}>
                <span>{q}</span><Icon d={I.chevron} s={20} c={T.primary} />
              </button>
            </h3>
            <div id={`${id}-p`} role="region" aria-labelledby={`${id}-b`} hidden={!on} className="rs-acc-panel">
              {(Array.isArray(a) ? a : [a]).map((p, k) => <p key={k}>{p}</p>)}
            </div>
          </Reveal>
        );
      })}
    </div>
  );
}

/* Onglets accessibles : flèches gauche et droite, Début et Fin ; un seul onglet dans l'ordre de tabulation. */
function Tabs({ tabs, label, idPrefix = "tab" }) {
  const [cur, setCur] = useState(0);
  const refs = useRef([]);
  const key = e => {
    const n = tabs.length;
    const k = { ArrowRight: (cur + 1) % n, ArrowLeft: (cur - 1 + n) % n, Home: 0, End: n - 1 }[e.key];
    if (k === undefined) return;
    e.preventDefault(); setCur(k); refs.current[k]?.focus();
  };
  return (
    <div>
      <div role="tablist" aria-label={label} className="rs-chips rs-scroll" onKeyDown={key}>
        {tabs.map(([t], i) => (
          <button key={t} ref={el => (refs.current[i] = el)} type="button" role="tab" id={`${idPrefix}-t${i}`} aria-controls={`${idPrefix}-p${i}`}
            aria-selected={cur === i} tabIndex={cur === i ? 0 : -1} className="rs-chip" onClick={() => setCur(i)}>{t}</button>
        ))}
      </div>
      {tabs.map(([t, panel], i) => (
        <div key={t} role="tabpanel" id={`${idPrefix}-p${i}`} aria-labelledby={`${idPrefix}-t${i}`} hidden={cur !== i} tabIndex={0} style={{ marginTop: GAP.grid }}>{panel}</div>
      ))}
    </div>
  );
}

/* Barre de progression de lecture : un seul écouteur passif, mise à jour par requestAnimationFrame. */
function ScrollProgress() {
  const ref = useRef(null);
  useEffect(() => {
    let raf = 0;
    const upd = () => {
      raf = 0;
      const d = document.documentElement, max = d.scrollHeight - window.innerHeight;
      const p = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
      if (ref.current) ref.current.style.transform = `scaleX(${p})`;
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, []);
  return <div ref={ref} className="rs-progress" aria-hidden />;
}


export {
  ORG_NAME, lockScroll, RepetMark, RepetWord, RepetLogo, OrgLogo, Halo, img, Icon, I, Txt, Eyebrow, Bare, Btn, IconBtn, Fab, Link, Back,
  Tag, Card, Notice, Quote, IconTile, Empty, Confirm, ConfirmMark, TimeChip, fmtTime, Field, Input, Textarea, Select, CheckTile,
  Chip, Toggle, Rail, GradHead, Modal, ConfirmDialog, RadioGroup, Menu, BrandLoader, Section, PageHero, Accordion, Tabs, ScrollProgress, GStyle,
};
