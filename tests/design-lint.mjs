/* Vérification automatique du référentiel UI/UX (docs/design-system.md, section 11).
   Script Node sans dépendance : node tests/design-lint.mjs (npm run test:design).
   Lit les échelles dans src/tokens.js (aucune valeur dupliquée ici), parcourt src/**\/*.{js,jsx},
   contrôle la charte v4 (dégradés de marque G1 à G5 : couleurs du logo pour l'action et les bandeaux, violet seul pour l'IA),
   liste toutes les violations au format « fichier:ligne  règle  extrait  correction attendue »
   et sort avec le code 1 s'il y en a, ou si les dérogations dépassent MAX_WAIVERS. */
import { readFileSync, readdirSync, statSync } from "fs";
import { join, relative, dirname } from "path";
import { fileURLToPath, pathToFileURL } from "url";

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..");
const tokens = await import(pathToFileURL(join(ROOT, "src/tokens.js")).href);
const { SPACE, SIZES, WEIGHTS, PAIRS, FD, FB, FM } = tokens;
const MAX_WAIVERS = 5;
const TOKEN_FILES = new Set(["src/tokens.js", "src/ui.jsx", "src/ui/GStyle.jsx", "src/ui/icons.jsx"]);
const BTN_KINDS = ["objective", "ai", "primary", "secondary", "ghost", "danger", "white", "ghostDark", "dangerSolid"];
const BTN_SIZES = ["sm", "md", "lg"];
const TAG_TONES = ["primary", "appui", "coach", "ai", "success", "warning", "error", "muted"];
const CARD_PADS = ["none", "sm", "md", "lg"];
/* S5 : au-delà de cette valeur, un espacement écrit en dur est refusé (0 à 20 : réglages internes d'un composant). */
const S5_MAX = 20;
/* Dérogations motivées aux règles S5 et S6 : [règle, fichier, extrait (expression régulière), raison]. Une dérogation
   sans effet fait échouer le contrôle (W3), pour que la liste reste à jour. */
const EXEMPT = [
  // exemple : ["S5", "src/home/Strate.jsx", /gap: 56/, "maquette d'écran dessinée à l'échelle de la photo"],
];
const exemptUsed = new Set();
const exempt = (rule, file, ext) => {
  const i = EXEMPT.findIndex(([r, f, re]) => r === rule && f === file && re.test(ext));
  if (i < 0) return false;
  exemptUsed.add(i); return true;
};

/* ─── Fichiers ─── */
const walk = d => readdirSync(d).flatMap(f => {
  const p = join(d, f);
  return statSync(p).isDirectory() ? walk(p) : [p];
});
const srcFiles = walk(join(ROOT, "src")).filter(f => /\.(js|jsx)$/.test(f)).map(f => relative(ROOT, f).split("\\").join("/")).sort();
const docFiles = readdirSync(join(ROOT, "docs")).filter(f => f.endsWith(".md")).map(f => `docs/${f}`);

/* ─── Préparation : commentaires, URI data:, chemins SVG retirés, numéros de ligne conservés ─── */
const blank = s => s.replace(/[^\n]/g, " ");
function strip(src) {
  let out = "", i = 0, q = null;
  while (i < src.length) {
    const c = src[i], n = src[i + 1];
    if (q) {
      out += c;
      if (c === "\\") { out += n ?? ""; i += 2; continue; }
      if (c === q) q = null;
      else if (q === "`" && c === "$" && n === "{") { /* interpolation : gardée telle quelle */ }
      i++; continue;
    }
    if (c === "/" && n === "*") { const e = src.indexOf("*/", i + 2); const end = e < 0 ? src.length : e + 2; out += blank(src.slice(i, end)); i = end; continue; }
    if (c === "/" && n === "/" && src[i - 1] !== ":" ) { const e = src.indexOf("\n", i); const end = e < 0 ? src.length : e; out += blank(src.slice(i, end)); i = end; continue; }
    if (c === '"' || c === "'" || c === "`") {
      // apostrophe dans un texte JSX (« l'accueil ») : pas une chaîne si précédée d'une lettre
      if (c === "'" && /[\p{L}]/u.test(src[i - 1] || "")) { out += c; i++; continue; }
      q = c;
    }
    out += c; i++;
  }
  return out
    .replace(/data:[a-z]+\/[a-z0-9.+-]+[;,][^"'`)\s]*/gi, m => blank(m))
    .replace(/\b(d|points)="[^"]*"/g, m => blank(m));
}

/* Valeur d'une propriété de style : depuis le « : » jusqu'à « , » « } » « ; » ou fin de ligne, hors parenthèses et chaînes. */
function valueAt(text, start) {
  let depth = 0, q = null, v = "";
  for (let i = start; i < text.length; i++) {
    const c = text[i];
    if (q) { v += c; if (c === q) q = null; continue; }
    if (c === '"' || c === "'" || c === "`") { q = c; v += c; continue; }
    if ("([{".includes(c)) depth++;
    if (")]}".includes(c)) { if (depth === 0) break; depth--; v += c; continue; }
    if (depth === 0 && (c === "," || c === ";" || c === "\n")) break;
    v += c;
  }
  return v;
}

/* ─── Dérogations ─── */
function waiversOf(raw) {
  const w = new Map(), bad = [];
  raw.split("\n").forEach((l, i) => {
    const m = l.match(/design-lint-disable-next-line\s+([A-Z]\d)(?:\s+--\s+(.+?))?\s*(\*\/|\}|$)/);
    if (!m) return;
    if (!m[2] || !m[2].trim()) bad.push(i + 1);
    else w.set(i + 2, m[1]);
  });
  return { w, bad };
}

/* ─── Règles ─── */
const violations = [];
let waiverCount = 0;
const lineOf = (text, idx) => text.slice(0, idx).split("\n").length;
const excerpt = s => s.trim().replace(/\s+/g, " ").slice(0, 70);

function checkFile(file) {
  const raw = readFileSync(join(ROOT, file), "utf8");
  const text = strip(raw);
  const { w, bad } = waiversOf(raw);
  const isTok = TOKEN_FILES.has(file);
  const report = (idx, rule, ext, fix) => {
    const line = typeof idx === "number" && idx < 0 ? -idx : lineOf(text, idx);
    if (w.get(line) === rule) { waiverCount++; w.set(line, "used"); return; }
    violations.push(`${file}:${line}  ${rule}  ${excerpt(ext)}  → ${fix}`);
  };
  bad.forEach(l => report(-l, "W0", "dérogation sans raison", "ajouter « -- raison »"));
  const each = (re, fn) => { for (const m of text.matchAll(re)) fn(m); };

  // L1 : tiret cadratin, emoji (commentaires exclus)
  text.split("\n").forEach((l, i) => {
    if (l.includes("\u2014")) report(-(i + 1), "L1", l, "remplacer le tiret cadratin");
    const e = l.match(/\p{Extended_Pictographic}/u);
    if (e && !/[©®™]/.test(e[0])) report(-(i + 1), "L1", l, "retirer l'emoji, utiliser <Icon>");
  });

  if (!isTok) {
    // C1 couleur hexadécimale ; C2 fonction de couleur ; C3 opacité concaténée ; C4 nom de couleur
    each(/(?<![&\w])#[0-9a-fA-F]{3,8}\b/g, m => report(m.index, "C1", text.slice(m.index - 10, m.index + 12), "jeton T.* ou ON.*"));
    each(/\b(rgba?|hsla?)\(/g, m => report(m.index, "C2", text.slice(m.index, m.index + 30), "jeton T.* ou ON.*"));
    each(/\$\{[^}]+\}[0-9a-fA-F]{2}(?![0-9a-zA-Z])/g, m => report(m.index, "C3", m[0], "fond teinté T.*Bg"));
    each(/:\s*["'](white|black|red|green|blue|gray|grey)["']/g, m => report(m.index, "C4", m[0], "jeton T.*"));
    // G2 dégradé écrit à la main (charte v4) ; G3 dégradé d'action réservé au bouton objective
    each(/\b(linear|radial|conic)-gradient\(/g, m => report(m.index, "G2", text.slice(m.index, m.index + 40), "jeton GRAD_* de tokens.js"));
    each(/\bGRAD_CTA(_HOVER)?\b/g, m => report(m.index, "G3", m[0], "<Btn kind=\"objective\"> : le dégradé d'action n'habille que ce bouton"));
    // T1 propriété typographique ; T2 famille nommée
    each(/\b(font|fontSize|fontWeight|fontFamily|lineHeight|letterSpacing|font-size|font-weight|font-family|line-height|letter-spacing)\s*:/g, m => {
      const v = valueAt(text, m.index + m[0].length).trim();
      if (m[1] === "font" && /^["']inherit["']$/.test(v)) return;
      report(m.index, "T1", m[0] + " " + v, "...TY.* ou <Txt v>");
    });
    // T2 ne vise pas les textes de contenu (src/content/), qui peuvent citer une police par son nom (mentions légales)
    if (!file.startsWith("src/content/")) each(/\b(Outfit|Manrope|Inter|JetBrains|Segoe)\b|sans-serif|monospace/g, m => report(m.index, "T2", m[0], "FD, FB, FM via TY.*"));
    // S1 espacement hors échelle
    each(/\b(padding|margin)([A-Z][A-Za-z]*|-[a-z-]+)?\s*:|\b(gap|rowGap|columnGap|row-gap|column-gap)\s*:/g, m => {
      const v = valueAt(text, m.index + m[0].length);
      const clean = v.replace(/calc\([^)]*\)/g, "").replace(/\b(PAD|GAP|W)\.\w+/g, "").replace(/\bsp\([^)]*\)/g, "");
      for (const n of clean.matchAll(/(?<![\w.$#])(-?\d*\.?\d+)(px|%|vh|svh|dvh|vw|em|rem|fr|ch|s|ms)?(?![\w.])/g)) {
        if (n[2] && n[2] !== "px") continue;
        const x = Math.abs(parseFloat(n[1]));
        if (!SPACE.includes(x)) { report(m.index, "S1", m[0] + v, `échelle ${SPACE.join(", ")}`); break; }
      }
    });
    // S5 espacement de mise en page écrit en dur : au-delà de 20 px, padding, margin et gap viennent d'un jeton
    // (PAD.*, GAP.*, W.* ou sp()), pour que le rythme vertical et les gouttières restent les mêmes d'une page à l'autre.
    each(/\b(padding|margin)([A-Z][A-Za-z]*)?\s*:|\b(gap|rowGap|columnGap)\s*:/g, m => {
      const v = valueAt(text, m.index + m[0].length);
      const clean = v.replace(/calc\([^)]*\)/g, "").replace(/\b(PAD|GAP|GAP_MOBILE|PAD_MOBILE|W)\.\w+/g, "").replace(/\bsp\([^)]*\)/g, "");
      for (const n of clean.matchAll(/(?<![\w.$#])(-?\d*\.?\d+)(px)?(?![\w.%])/g)) {
        if (Math.abs(parseFloat(n[1])) > S5_MAX && !exempt("S5", file, m[0] + v)) { report(m.index, "S5", m[0] + v, "PAD.*, GAP.* (au-delà de " + S5_MAX + " px)"); break; }
      }
    });
    // S6 marge intérieure de carte sans sa valeur mobile : PAD.md ou PAD.lg posé à la main sur une surface sans la classe
    // rp-pad-md ou rp-pad-lg (24 → 20 et 32 → 24 sous 760 px, comme Card). Préférer <Card pad>.
    each(/<([A-Za-z.]+)\b((?:=>|[^>])*?)\bstyle=\{\{((?:=>|[^>])*?)\}\}/g, m => {
      const pad = m[3].match(/(?<![\w-])padding:\s*PAD\.(md|lg)\b/);
      if (pad && !new RegExp(`rp-pad-${pad[1]}`).test(m[2] + m[3]) && !exempt("S6", file, m[0])) report(m.index, "S6", m[0].slice(0, 60), `className="rp-pad-${pad[1]}" ou <Card pad="${pad[1]}">`);
    });
    // S2 sp(n) hors échelle
    each(/\bsp\(([\d.]+)\)/g, m => { if (!SPACE.includes(4 * parseFloat(m[1]))) report(m.index, "S2", m[0], "sp(n) avec 4n dans l'échelle"); });
    // S3 pad de Card
    each(/<Card\b[^>]*?\bpad=(\{[^}]*\}|"[^"]*")/g, m => {
      const v = m[1].replace(/^\{|\}$/g, "");
      const lits = [...v.matchAll(/["']([^"']*)["']/g)].map(x => x[1]);
      if (/^\s*\d/.test(v) || !lits.length || lits.some(l => !CARD_PADS.includes(l))) report(m.index, "S3", m[0], `pad="${CARD_PADS.join("|")}"`);
    });
    // S4 maxWidth numérique de 600 ou plus
    each(/\bmaxWidth:\s*(\d+)\b/g, m => { if (+m[1] >= 600) report(m.index, "S4", m[0], "W.*"); });
    // R1 rayon
    each(/\bborder\w*Radius\s*:|\bborder(-[a-z]+)?-radius\s*:/g, m => {
      const v = valueAt(text, m.index + m[0].length).replace(/\bRAD\.\w+/g, "").replace(/["']?50%["']?/g, "");
      for (const n of v.matchAll(/(?<![\w.$])(\d*\.?\d+)(px|%)?(?![\w.])/g)) if (parseFloat(n[1]) > 4) { report(m.index, "R1", m[0] + v, "RAD.*, \"50%\" ou 0 à 4"); break; }
    });
    // O1 ombre
    each(/\bboxShadow\s*:|\bbox-shadow\s*:/g, m => {
      const v = valueAt(text, m.index + m[0].length);
      const rest = v.replace(/\bSH\.\w+(\.\w+)?(\[\d\])?/g, "").replace(/\bringOf\([^)]*\)/g, "").replace(/["']none["']/g, "");
      if (/["'`]|\dpx|rgba?\(/.test(rest)) report(m.index, "O1", m[0] + v, "SH.*, ringOf() ou \"none\"");
    });
    // M1 transition
    each(/\btransition\s*:/g, m => {
      const v = valueAt(text, m.index + m[0].length);
      if (/\ball\b/.test(v)) report(m.index, "M1", m[0] + v, "nommer les propriétés, durées MO.*");
      else if (/^\s*["'`]/.test(v) && !/MO\./.test(v)) report(m.index, "M1", m[0] + v, "durées MO.*");
    });
    // K1 élément natif
    each(/<(input|textarea|select|button)\b([^>]*)/g, m => { if (m[1] === "input" && /type="file"/.test(m[2])) return; report(m.index, "K1", m[0], "Btn, Bare, Input, Textarea, Select de ui.jsx"); });
    // K4 onClick sur élément non interactif
    each(/<(div|span|p|li)\b(?:=>|[^>])*?\bonClick=/g, m => report(m.index, "K4", m[0].slice(0, 60), "button (Bare) ou Card cliquable"));
    // K5 icône espacée à la main
    each(/&nbsp;\s*<Icon|<Icon[^>]*\/>\s*&nbsp;/g, m => report(m.index, "K5", m[0], "propriété icon / iconRight de Btn"));
  }
  // K2 Btn kind et size ; K3 Tag tone (tous fichiers, y compris lib/store.js)
  const litsOf = v => [...v.replace(/^\{|\}$/g, "").trim().matchAll(/(?:^|[?:]\s*)["']([^"']*)["']/g)].map(x => x[1]); // valeur littérale ou branches d'un ternaire
  each(/<Btn\b[^>]*?\bkind=(\{[^}]*\}|"[^"]*")/g, m => litsOf(m[1]).forEach(l => { if (!BTN_KINDS.includes(l)) report(m.index, "K2", m[0], BTN_KINDS.join("|")); }));
  each(/<Btn\b[^>]*?\bsize=(\{[^}]*\}|"[^"]*")/g, m => litsOf(m[1]).forEach(l => { if (!BTN_SIZES.includes(l)) report(m.index, "K2", m[0], BTN_SIZES.join("|")); }));
  each(/<Tag\b[^>]*?\btone=(\{[^}]*\}|"[^"]*")/g, m => litsOf(m[1]).forEach(l => { if (!TAG_TONES.includes(l)) report(m.index, "K3", m[0], TAG_TONES.join("|")); }));
  each(/\btone:\s*["']([^"']+)["']/g, m => { if (!TAG_TONES.includes(m[1])) report(m.index, "K3", m[0], TAG_TONES.join("|")); });

  if (isTok) {
    // X1 tailles et graisses de police
    const famOf = v => (v.includes("${FD}") || v.includes("Outfit") || v.includes("Manrope") ? FD : v.includes("${FM}") || v.includes("JetBrains") ? FM : v.includes("${FB}") || v.includes("Inter") ? FB : null);
    each(/\bfont\s*:\s*/g, m => {
      const v = valueAt(text, m.index + m[0].length).replace(/^["'`]/, "");
      const s = v.match(/(\d+(?:\.\d+)?)px/), wgt = v.match(/^\s*([1-9]00)\b/), fam = famOf(v);
      if (s && !SIZES.includes(+s[1])) report(m.index, "X1", "font: " + v, `taille dans ${SIZES.join(", ")}`);
      if (wgt) {
        const ok = fam ? WEIGHTS[fam] : [...new Set(Object.values(WEIGHTS).flat())];
        if (!ok.includes(+wgt[1])) report(m.index, "X1", "font: " + v, "graisse autorisée pour la famille");
      }
    });
    each(/\bfont-size\s*:\s*(\d+(?:\.\d+)?)px/g, m => { if (!SIZES.includes(+m[1])) report(m.index, "X1", m[0], `taille dans ${SIZES.join(", ")}`); });
    // X3 (feuilles de styles des fichiers de jetons) : niveau typographique écrit à la main au lieu de TY (F("…") dans GStyle)
    if (file !== "src/tokens.js") each(/\bfont\s*:\s*[1-9]00\s+(calc\()?\d/g, m => report(m.index, "X3", m[0], "${F(\"niveau\")} ou ...TY.niveau (ajouter le niveau à TY s'il manque)"));
    each(/\b(fontWeight|font-weight)\s*:\s*["']?(\d+)/g, m => { if (![...new Set(Object.values(WEIGHTS).flat())].includes(+m[2])) report(m.index, "X1", m[0], "graisse autorisée"); });
    // X2 couleur littérale dans ui.jsx
    if (file === "src/ui.jsx" || file.startsWith("src/ui/")) {
      each(/(?<![&\w])#[0-9a-fA-F]{3,8}\b/g, m => report(m.index, "X2", text.slice(m.index - 10, m.index + 12), "jeton de tokens.js"));
      each(/\b(rgba?|hsla?)\(/g, m => report(m.index, "X2", text.slice(m.index, m.index + 30), "jeton de tokens.js"));
    }
  }
  for (const [line, code] of w) if (code !== "used") violations.push(`${file}:${line - 1}  W1  dérogation ${code} sans effet  → la retirer`);
}

srcFiles.forEach(checkFile);

/* U1 : liens des articles (src/content/resources/*.md) limités à https, http, mailto et aux pages du site (SEC-05). */
const mdDir = join(ROOT, "src/content/resources");
readdirSync(mdDir).filter(f => f.endsWith(".md")).forEach(f => readFileSync(join(mdDir, f), "utf8").split("\n").forEach((l, i) => {
  for (const m of l.matchAll(/\]\(([^)\s]+)\)/g)) if (!/^(https?:|mailto:|#\/)/.test(m[1])) violations.push(`src/content/resources/${f}:${i + 1}  U1  lien « ${m[1]} »  → https:, mailto: ou #/`);
}));

/* L3 : lexique côté personne accompagnée (docs/redaction.md, 1.2), hors commentaires. A2 : texte muted sur un fond
   teinté (*Bg), interdit par le référentiel 1.5 (A11Y-13). */
const PERSON_FILES = f => /^src\/(beneficiary\/|Recorder|WarmupStage|Report|Assistant|RecruiterVoice|Demo|CodeForm|StageIdle|app\/(AccountMenu|Espace))/.test(f);
const LEXIQUE = [[/Bénéficiaire/, "« Je m'entraîne », « la personne »"], [/consentement/i, "« accord » (hors textes légaux)"], [/mots d'appui/i, "« petits mots répétés »"], [/Analyse de votre réponse/i, "« Préparation de votre retour »"]];
for (const f of srcFiles) {
  const text = strip(readFileSync(join(ROOT, f), "utf8"));
  if (PERSON_FILES(f)) text.split("\n").forEach((l, i) => LEXIQUE.forEach(([re, fix]) => { if (re.test(l)) violations.push(`${f}:${i + 1}  L3  ${excerpt(l)}  → ${fix}`); }));
  for (const m of text.matchAll(/style=\{\{([^{}]*)\}\}/g)) {
    if (/background:\s*T\.\w+Bg\b/.test(m[1]) && /(?<!\w)color:\s*T\.muted\b/.test(m[1])) violations.push(`${f}:${lineOf(text, m.index)}  A2  ${excerpt(m[0])}  → T.body sur un fond teinté`);
  }
}
docFiles.forEach(f => readFileSync(join(ROOT, f), "utf8").split("\n").forEach((l, i) => {
  if (l.includes("\u2014")) violations.push(`${f}:${i + 1}  L1  ${excerpt(l)}  → remplacer le tiret cadratin`);
}));

/* G1 (charte v4) : composition des dégradés de marque. Le logo va du bleu au violet ; l'action principale et le bandeau
   de marque prennent ce même dégradé dans sa version lisible (blueDk vers violet) ; l'assistant reste en violet seul.
   G4 : le bouton objective porte GRAD_CTA, plus la sarcelle. G5 : l'icône du site et l'écran de chargement recopient
   les couleurs du logo des jetons (clair et sombre). */
{
  const { LIGHT, DARK, GRAD_LOGO, GRAD_CTA, GRAD_CTA_HOVER, GRAD, GRAD_AI, GRAD_AI_BORDER } = tokens;
  const g1 = (ok, msg) => { if (!ok) violations.push(`src/tokens.js  G1  ${msg}`); };
  const varsOf = g => [...String(g).matchAll(/var\(--c-(\w+)\)/g)].map(m => m[1]);
  const hexOf = g => [...String(g).matchAll(/#[0-9a-f]{6}/gi)].map(m => m[0].toUpperCase());
  g1(String(varsOf(GRAD_LOGO)) === "blue,violet", "GRAD_LOGO doit aller de T.blue à T.violet (couleurs du logo)");
  g1(String(varsOf(GRAD_CTA)) === "blueDk,violet", "GRAD_CTA doit aller de T.blueDk à T.violet (dégradé du logo, version lisible)");
  g1(String(varsOf(GRAD_CTA_HOVER)) === "primary,violetDk", "GRAD_CTA_HOVER doit aller de T.primary à T.violetDk");
  g1(String(hexOf(GRAD)) === String([LIGHT.blueDk, LIGHT.violet].map(x => x.toUpperCase())), "GRAD (bandeau de marque) doit aller de blueDk à violet, valeurs claires fixes");
  for (const [n, g] of [["GRAD_LOGO", GRAD_LOGO], ["GRAD_CTA", GRAD_CTA], ["GRAD", GRAD]]) g1(/^linear-gradient\(45deg,/.test(g), `${n} : même sens que le logo (45deg)`);
  for (const [n, g] of [["GRAD_AI", GRAD_AI], ["GRAD_AI_BORDER", GRAD_AI_BORDER]]) g1(varsOf(g).length > 0 && varsOf(g).every(v => /^(violet|violetDk|lavender)$/.test(v)) && !hexOf(g).length, `${n} : violet seul, sans bleu (rôle IA)`);
  const ui = strip(readFileSync(join(ROOT, "src/ui.jsx"), "utf8"));
  const obj = ui.match(/\bobjective:\s*\{[^}]*\}/);
  if (!obj || !/GRAD_CTA_HOVER\s*:\s*GRAD_CTA\b/.test(obj[0]) || /T\.accent/.test(obj[0])) violations.push("src/ui.jsx  G4  le bouton objective doit porter GRAD_CTA (survol GRAD_CTA_HOVER), jamais la sarcelle");
  for (const f of ["public/favicon.svg", "index.html"]) {
    const t = readFileSync(join(ROOT, f), "utf8").toUpperCase();
    for (const [k, pal, nom] of [["blue", LIGHT, "clair"], ["violet", LIGHT, "clair"], ["navy", LIGHT, "clair"], ["blue", DARK, "sombre"], ["violet", DARK, "sombre"], ["navy", DARK, "sombre"]]) {
      if (!t.includes(pal[k].toUpperCase())) violations.push(`${f}  G5  couleur du logo ${k} (${pal[k]}, thème ${nom}) absente  → recopier la valeur du jeton`);
    }
  }
}

/* A1 : contrastes déclarés dans PAIRS, recalculés dans chaque thème (clair, sombre, contraste renforcé) */
const lum = hex => {
  const h = hex.replace("#", "");
  const [r, g, b] = [0, 2, 4].map(i => parseInt(h.slice(i, i + 2), 16) / 255).map(v => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
};
const THEMES = tokens.THEMES || { clair: tokens.T };
let pairChecks = 0;
for (const [name, pal] of Object.entries(THEMES)) {
  for (const [fgK, bgK, min, only] of PAIRS) {
    if (only && !name.startsWith(only)) continue;
    const fg = pal[fgK] ?? fgK, bg = pal[bgK] ?? bgK;
    if (!/^#[0-9a-f]{6}$/i.test(fg) || !/^#[0-9a-f]{6}$/i.test(bg)) { violations.push(`src/tokens.js  A1  paire ${fgK} / ${bgK} : couleur inconnue dans le thème ${name}`); continue; }
    const [a, b] = [lum(fg), lum(bg)].sort((x, y) => y - x);
    const ratio = (a + 0.05) / (b + 0.05);
    pairChecks++;
    if (ratio < min) violations.push(`src/tokens.js  A1  thème ${name} : ${fgK} (${fg}) sur ${bgK} (${bg}) : ${ratio.toFixed(2)}:1  → au moins ${min}:1`);
  }
}
EXEMPT.forEach(([r, f, , why], i) => { if (!exemptUsed.has(i)) violations.push(`${f}  W3  dérogation ${r} sans effet (${why})  → la retirer de EXEMPT`); });
if (waiverCount > MAX_WAIVERS) violations.push(`(global)  W2  ${waiverCount} dérogations  → ${MAX_WAIVERS} au plus`);
violations.forEach(v => console.log(v));
const files = srcFiles.length + docFiles.length;
if (violations.length) {
  console.log(`\ndesign-lint : ${violations.length} violation(s), ${files} fichiers, ${waiverCount} dérogation(s)`);
  process.exit(1);
}
console.log(`design-lint : 0 violation, ${files} fichiers, ${waiverCount} dérogation(s), ${pairChecks} contrastes vérifiés dans ${Object.keys(THEMES).length} thèmes`);
