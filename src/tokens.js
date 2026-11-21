/* Jetons du référentiel UI/UX v3 (docs/design-system.md, section 12.1).
   JavaScript pur, sans JSX : importé par src/ui.jsx (qui les réexporte pour les écrans)
   et par tests/design-lint.mjs (échelles et contrastes). Toute valeur visuelle vient d'ici. */

/* Palette claire (valeurs de référence, section 1.1). Les écrans n'utilisent jamais ces valeurs brutes :
   ils passent par T, dont chaque couleur est une variable CSS (thèmes clair, sombre, contraste renforcé). */
export const LIGHT = {
  // Structure et marque (dominante)
  primary: "#386097", primaryDk: "#2C4D7C", primaryLt: "#4A72A8",
  // Secondaire décoratif (jamais en texte ni en fond de bouton)
  blue: "#3893CD", blueDk: "#2E7CB0",
  // Action principale et points d'appui
  accent: "#0B7A75", accentDk: "#0A6663", accentLt: "#7FD6CF",
  // Assistant (IA) et points à explorer
  violet: "#5C4BB9", lavender: "#736BDE",
  // Sémantique : les teintes claires servent au décor, les « Dk » au texte
  success: "#41C77A", successDk: "#1E7A4A",
  warning: "#FFB547", warningDk: "#8A5A0A",
  error: "#FF5A72", errorDk: "#C62F47",
  // Texte et neutres
  navy: "#1B3A66", body: "#4A5568", muted: "#64748B", faint: "#A4AFBF",
  lineStrong: "#7C8AA0", line: "#E7EBF2", lineLt: "#F0F3F8",
  bg: "#F8FAFC", surface: "#FFFFFF",
  // Fonds teintés (un par teinte, opaques)
  primaryBg: "#EEF2F8", accentBg: "#ECF5F4", violetBg: "#F2F1F9",
  successBg: "#E9F8F0", warningBg: "#FFF6E8", errorBg: "#FFECEF",
  // Voiles et fonds particuliers
  overlay: "rgba(27,58,102,.45)", videoBg: "#000000",
  glass: "rgba(248,250,252,.9)",
  studio: "#DCE6F2",                      // fond uni de remplacement de l'aperçu caméra (échauffement)
};

/* Palette sombre (section 8 bis) : mêmes rôles, contrastes AA vérifiés par la règle A1 sur PAIRS. */
export const DARK = {
  primary: "#8DB4EA", primaryDk: "#B7D0F3", primaryLt: "#6F98D3",
  blue: "#5AAEE0", blueDk: "#7DC2EC",
  accent: "#4ECBC1", accentDk: "#7FDCD4", accentLt: "#7FD6CF",
  violet: "#B4A9F5", lavender: "#9D93EC",
  success: "#41C77A", successDk: "#6FD69B",
  warning: "#FFB547", warningDk: "#F3C46C",
  error: "#FF5A72", errorDk: "#FF8D9E",
  navy: "#E8EEF8", body: "#C5CEDC", muted: "#9DA9BB", faint: "#5E6A7C",
  lineStrong: "#7F8CA2", line: "#2B3649", lineLt: "#222C3D",
  bg: "#0E141E", surface: "#161F2E",
  primaryBg: "#1D2A3F", accentBg: "#13302F", violetBg: "#252347",
  successBg: "#142E20", warningBg: "#30260F", errorBg: "#3A1B23",
  overlay: "rgba(0,0,0,.6)", videoBg: "#000000",
  glass: "rgba(14,20,30,.9)",
  studio: "#DCE6F2",
};
/* Contraste renforcé : textes secondaires et bordures plus marqués (s'ajoute au thème clair ou sombre). */
export const HC_LIGHT = { body: "#1F2937", muted: "#374151", faint: "#4B5563", lineStrong: "#4B5563", line: "#9AA6B8", lineLt: "#D5DBE5", primary: "#24477A", accent: "#06605B", violet: "#45369E" };
export const HC_DARK = { body: "#E8EEF8", muted: "#D2DAE7", faint: "#AEB9CB", lineStrong: "#AEB9CB", line: "#4B5567", lineLt: "#323D50", primary: "#B7D0F3", accent: "#7FDCD4", violet: "#CFC7FA" };
export const THEMES = {
  clair: LIGHT, sombre: DARK,
  "clair, contraste renforcé": { ...LIGHT, ...HC_LIGHT }, "sombre, contraste renforcé": { ...DARK, ...HC_DARK },
};

/* Jetons de couleur utilisés partout : une variable CSS par rôle (définies une seule fois par themeCSS()). */
export const T = Object.fromEntries(Object.keys(LIGHT).map(k => [k, `var(--c-${k})`]));
/* Couleurs fixes, quel que soit le thème : éléments posés sur une vidéo ou sur un dégradé de marque sombre. */
export const FIX = LIGHT;

const vars = p => Object.entries(p).map(([k, v]) => `--c-${k}:${v}`).join(";");
/* Feuille des variables : clair par défaut, sombre (choisi ou automatique), contraste renforcé.
   Injectée avant le premier rendu (src/main.jsx). */
export function themeCSS() {
  const darkAll = vars(DARK), hcL = vars(HC_LIGHT), hcD = vars(HC_DARK);
  return [
    `:root{${vars(LIGHT)};color-scheme:light}`,
    `html[data-theme=dark]{${darkAll};color-scheme:dark}`,
    `@media (prefers-color-scheme: dark){html:not([data-theme=light]):not([data-theme=dark]){${darkAll};color-scheme:dark}}`,
    `html[data-contrast=more]{${hcL}}`,
    `html[data-theme=dark][data-contrast=more]{${hcD}}`,
    `@media (prefers-color-scheme: dark){html:not([data-theme=light]):not([data-theme=dark])[data-contrast=more]{${hcD}}}`,
  ].join("\n");
}

/* Texte et éléments posés sur fond sombre, dégradé ou vidéo (section 1.4). */
export const ON = {
  text: "#FFFFFF", chip: "rgba(255,255,255,.2)", line: "rgba(255,255,255,.3)",
  glow: "rgba(255,255,255,.16)", scrim: "rgba(0,0,0,.5)",
};

/* Dégradés (section 1.3). */
export const GRAD_PREMIUM = `linear-gradient(135deg, ${FIX.primary} 0%, ${FIX.blueDk} 50%, ${FIX.violet} 100%)`;
export const GRAD = GRAD_PREMIUM;
export const GRAD_MAIN = `linear-gradient(135deg, ${FIX.blue} 0%, ${FIX.violet} 100%)`;
export const GRAD_COACH = `linear-gradient(135deg, ${FIX.accent} 0%, ${FIX.success} 100%)`;   // vert : côté coach
export const GRAD_AI = `linear-gradient(135deg, ${FIX.blueDk} 0%, ${FIX.violet} 100%)`;
export const GRAD_SOFT = `linear-gradient(135deg, rgba(56,96,151,.08), rgba(92,75,185,.07))`;
/* Bordure animée du panneau de l'assistant (bleu vers violet, rôle IA). */
export const GRAD_AI_BORDER = `linear-gradient(120deg, ${FIX.blueDk} 0%, ${FIX.violet} 50%, ${FIX.blueDk} 100%)`;
/* Masque opaque (découpe des bordures en dégradé) : la couleur n'est jamais visible. */
export const MASK = "linear-gradient(#000 0 0)";
/* Fond de l'accueil : opaque jusqu'à 160 px avant le pied de page (--fy, position du pied dans la fenêtre), puis transparent. */
export const FADE_FOOT = "linear-gradient(to bottom, #000 0, #000 calc(var(--fy, 200vh) - 160px), transparent var(--fy, 200vh))";
/* Symbole du logo (bulles) : dégradé de la marque du site, bleu clair vers violet, en variables (variante claire en thème sombre).
   Mêmes couleurs dans le logo animé d'attente (BrandLoader) et l'écran de chargement d'index.html. */
export const GRAD_LOGO = `linear-gradient(45deg, ${T.blue} 0%, ${T.violet} 100%)`;
export const GRAD_NIGHT = `linear-gradient(160deg, ${FIX.navy} 0%, ${FIX.primaryDk} 60%, ${FIX.violet} 100%)`;
/* Profondeur et marque (v3.1, demande du propriétaire) : titre d'accroche et fonds des sections clés. */
export const GRAD_ACCROCHE = `linear-gradient(90deg, ${T.blueDk} 0%, ${T.violet} 100%)`;    // fin d'accroche, mots-clés de la phrase (texte large, AA)
export const GRAD_HERO = `linear-gradient(180deg, ${T.surface} 0%, ${T.primaryBg} 100%)`;   // fond du héros de l'accueil
export const GRAD_SECTION = `linear-gradient(180deg, ${T.bg} 0%, ${T.primaryBg} 50%, ${T.bg} 100%)`; // fond d'une section clé (strate)
/* Lueurs colorées diffuses (halos derrière les photos et les visuels), décor seulement. */
export const GLOW = { blue: "rgba(56,147,205,.22)", violet: "rgba(92,75,185,.20)" };
export const GRAD_PAGE = `linear-gradient(180deg, ${T.primaryBg}, ${T.bg})`;   // fond de PageHero (pages secondaires)
/* Surlignage progressif (strate épinglée, cartes animées) : teintes de fond des rôles. */
export const HL = {
  appui: `linear-gradient(${T.accentBg}, ${T.accentBg})`,
  ai: `linear-gradient(${T.violetBg}, ${T.violetBg})`,
  primary: `linear-gradient(${T.primaryBg}, ${T.primaryBg})`,
};

/* Typographie (section 2). */
/* Familles : variables CSS, pour l'option « police lisible » (Atkinson Hyperlegible). */
export const FONT_STACKS = { display: "'Outfit', 'Segoe UI', sans-serif", body: "'Inter', 'Segoe UI', sans-serif", lisible: "'Atkinson Hyperlegible', 'Inter', 'Segoe UI', sans-serif" };
export const FD = "var(--ff-d)";
export const FB = "var(--ff-b)";
export const FM = "'JetBrains Mono', monospace";
export const SIZES = [11, 12, 13, 14, 16, 18, 20, 24, 26, 28, 32, 38, 54];
export const WEIGHTS = { [FD]: [700, 800], [FB]: [400, 600, 700], [FM]: [500, 700] };
export const TY = {
  display:  { font: `800 calc(54px * var(--fs, 1))/1.05 ${FD}`, letterSpacing: "-.035em" },
  xl:       { font: `800 calc(32px * var(--fs, 1))/1.15 ${FD}`, letterSpacing: "-.03em" },
  h1:       { font: `800 calc(28px * var(--fs, 1))/1.15 ${FD}`, letterSpacing: "-.02em" },
  h2:       { font: `800 calc(20px * var(--fs, 1))/1.25 ${FD}`, letterSpacing: "-.01em" },
  h3:       { font: `700 calc(16px * var(--fs, 1))/1.3 ${FD}` },
  h4:       { font: `700 calc(14px * var(--fs, 1))/1.4 ${FD}` },
  overline: { font: `700 calc(11px * var(--fs, 1))/1.3 ${FB}`, letterSpacing: ".08em", textTransform: "uppercase" },
  lead:     { font: `400 calc(18px * var(--fs, 1))/1.6 ${FB}` },
  bodyLg:   { font: `400 calc(16px * var(--fs, 1))/1.6 ${FB}` },
  body:     { font: `400 calc(14px * var(--fs, 1))/1.6 ${FB}` },
  bodyStrong: { font: `600 calc(14px * var(--fs, 1))/1.5 ${FB}` },
  small:    { font: `400 calc(13px * var(--fs, 1))/1.5 ${FB}` },
  caption:  { font: `400 calc(12px * var(--fs, 1))/1.5 ${FB}` },
  label:    { font: `600 calc(13px * var(--fs, 1))/1.3 ${FB}` },
  btnSm:    { font: `600 calc(13px * var(--fs, 1))/1 ${FB}` }, btn: { font: `600 calc(14px * var(--fs, 1))/1 ${FB}` }, btnLg: { font: `600 calc(16px * var(--fs, 1))/1 ${FB}` },
  link:     { fontWeight: 600, textDecoration: "underline", textUnderlineOffset: 3 },
  strong:   { fontWeight: 700 },                                      // <strong> dans un paragraphe
  input:    { font: `400 calc(16px * var(--fs, 1))/1.5 ${FB}` },
  tag:      { font: `600 calc(12px * var(--fs, 1))/1 ${FB}`, letterSpacing: ".02em" },
  num:      { font: `700 calc(28px * var(--fs, 1))/1 ${FM}` },
  code:     { font: `700 calc(24px * var(--fs, 1))/1 ${FM}`, letterSpacing: ".25em" },
  time:     { font: `700 calc(11px * var(--fs, 1))/1 ${FM}` },
  mono:     { font: `500 calc(12px * var(--fs, 1))/1.5 ${FM}` },
  /* Exceptions nommées : rendus validés (accueil) dont la taille reste dans SIZES */
  quote:    { font: `700 calc(20px * var(--fs, 1))/1.45 ${FD}` },                          // citation d'article, phrase qui se colore (mobile)
  pageTitle: { font: `800 calc(38px * var(--fs, 1))/1.1 ${FD}`, letterSpacing: "-.03em" }, // h1 des pages secondaires (PageHero)
  inherit:  { font: "inherit" },
};
export const TY_MOBILE = { display: 38, xl: 26, h1: 24, lead: 16 };   // appliqué par les classes .ty-* de GStyle

/* Espacement (section 3). */
export const SPACE = [0, 2, 4, 8, 12, 16, 20, 24, 32, 40, 48, 64, 80];
export const sp = n => n * 4;
export const PAD = { sm: 16, md: 24, lg: 32, row: "16px 24px", notice: "12px 16px", page: "40px 24px 64px" };
export const PAD_MOBILE = { sm: 16, md: 20, lg: 24, row: "16px 20px", page: "24px 16px 48px" };
export const GAP = { section: 80, block: 32, grid: 24, stack: 12, field: 20, actions: 12 };
export const W = { page: 1200, wide: 1120, read: 760, form: 600, narrow: 440 };
export const HEADER_H = 64, HEADER_H_M = 56;

/* Formes (section 4). */
export const RAD = { xs: 6, sm: 10, md: 16, lg: 24, xl: 32, pill: 999 };
export const SH = {
  xs: "0 2px 6px rgba(27,58,102,.05)",
  sm: "0 8px 20px rgba(27,58,102,.07)",
  lg: "0 20px 60px rgba(27,58,102,.10)",
  ring: `0 0 0 4px ${T.primaryBg}`,
  /* Ombres colorées diffuses (v3.1) : photos et visuels du héros, visuel de la strate, bandeau d'appel final */
  glow: "0 32px 64px -16px rgba(56,96,151,.30), 0 12px 32px -12px rgba(56,147,205,.22)",
  glowAi: "0 32px 64px -16px rgba(92,75,185,.28), 0 12px 32px -12px rgba(56,96,151,.18)",
  /* Ombres colorées des boutons pleins [repos, survol], utilisées par Btn uniquement */
  btn: {
    primary: ["0 4px 12px rgba(56,96,151,.20)", "0 8px 20px rgba(56,96,151,.30)"],
    objective: ["0 4px 12px rgba(11,122,117,.20)", "0 8px 20px rgba(11,122,117,.30)"],
    ai: ["0 4px 12px rgba(92,75,185,.24)", "0 8px 20px rgba(92,75,185,.34)"],
    white: ["0 4px 12px rgba(27,58,102,.15)", "0 8px 20px rgba(27,58,102,.25)"],
  },
};
export const ringOf = bg => `0 0 0 4px ${bg}`;

/* Mouvement (section 7). */
export const MO = {
  fast: ".12s", base: ".2s", enter: ".45s", ease: "cubic-bezier(.2,.7,.3,1)",   // interface : survol, sélection, apparition d'écran
  reveal: ".7s", slow: ".9s", fade: "1.1s", soft: "cubic-bezier(.45,0,.55,1)",   // pages publiques (v3.1) : apparitions, étapes, fondus de scène
  pageOut: ".3s", pageIn: ".45s",                                                // changement de page : sortie puis entrée en fondu (v3.2)
};
/* Cadence des éléments qui tournent seuls (ms) : scènes du héros, fin d'accroche. */
export const PACE = { scene: 11500, accroche: 11500 };   // fin d'accroche synchronisée avec sa scène (même cadence)
export const Z = { nav: 50, modal: 100 };

/* Champ de saisie (section 5.3). */
export const INPUT = {
  width: "100%", height: 48, padding: "0 16px", borderRadius: RAD.md, border: `1.5px solid ${T.lineStrong}`,
  background: T.surface, color: T.navy, ...TY.input,
};

/* Rôle → couleurs, pour Tag, Notice, repères, observations (section 5.4). */
export const TONE = {
  primary: { fg: T.primary, bg: T.primaryBg }, appui: { fg: T.accent, bg: T.accentBg }, ai: { fg: T.violet, bg: T.violetBg },
  success: { fg: T.successDk, bg: T.successBg }, warning: { fg: T.warningDk, bg: T.warningBg }, error: { fg: T.errorDk, bg: T.errorBg },
  muted: { fg: T.body, bg: T.lineLt },
};

/* Combinaisons texte/fond autorisées (section 1.5) : [texte, fond, seuil], par nom de rôle.
   La règle A1 recalcule chaque ratio dans chacun des THEMES (clair, sombre, contraste renforcé). */
export const PAIRS = [
  ["navy", "surface", 4.5], ["navy", "bg", 4.5], ["navy", "primaryBg", 4.5], ["navy", "accentBg", 4.5], ["navy", "violetBg", 4.5],
  ["navy", "successBg", 4.5], ["navy", "warningBg", 4.5], ["navy", "errorBg", 4.5],
  ["body", "surface", 4.5], ["body", "bg", 4.5], ["body", "primaryBg", 4.5], ["body", "accentBg", 4.5], ["body", "successBg", 4.5], ["body", "lineLt", 4.5],
  ["muted", "surface", 4.5], ["muted", "bg", 4.5],
  ["primary", "surface", 4.5], ["primary", "bg", 4.5], ["primary", "primaryBg", 4.5],
  ["primaryDk", "surface", 4.5], ["primaryDk", "bg", 4.5], ["primaryDk", "primaryBg", 4.5],
  ["accent", "surface", 4.5], ["accent", "bg", 4.5], ["accent", "accentBg", 4.5],
  ["violet", "surface", 4.5], ["violet", "bg", 4.5], ["violet", "violetBg", 4.5],
  ["successDk", "surface", 4.5], ["successDk", "successBg", 4.5],
  ["warningDk", "surface", 4.5], ["warningDk", "warningBg", 4.5],
  ["errorDk", "surface", 4.5], ["errorDk", "bg", 4.5], ["errorDk", "errorBg", 4.5],
  ["surface", "primary", 4.5], ["surface", "primaryDk", 4.5], ["surface", "accent", 4.5], ["surface", "accentDk", 4.5],
  ["surface", "violet", 4.5], ["surface", "errorDk", 4.5], ["surface", "successDk", 4.5], ["surface", "blueDk", 4.5], ["surface", "navy", 4.5],
  ["accentLt", "navy", 4.5, "clair"],
  ["lineStrong", "surface", 3], ["lineStrong", "bg", 3],
  // dégradés de texte de l'accueil (texte de 32 px et plus : seuil 3) 
  ["primary", "primaryBg", 3], ["blueDk", "bg", 3], ["blueDk", "primaryBg", 3], ["violet", "primaryBg", 3],
];
