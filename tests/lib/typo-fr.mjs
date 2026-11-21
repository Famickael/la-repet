/* Typographie française des textes visibles (docs/redaction.md, 1.3) : repère les morceaux de texte d'un fichier
   source (JSX, chaînes, gabarits, Markdown) sans toucher au code, aux URL, aux expressions régulières ni aux clés.
   Utilisé par tests/content.test.mjs (contrôle) et par la passe de correction (fixTypo). */
import { parse } from "@babel/parser";

export const NNBSP = " ", NBSP = " ";

/* Attributs JSX qui ne portent jamais de texte visible. */
const SKIP_ATTR = /^(className|href|id|src|srcSet|type|role|key|style|htmlFor|autoComplete|inputMode|d|viewBox|points|target|rel|as|kind|tone|size|v|lang|name|value|method|action|loading|decoding|fill|stroke|transform|width|height|idPrefix|topbar|head|icon|iconRight|c|bg|testid|data-[\w-]+|aria-(controls|labelledby|describedby|current|live|hidden|expanded|haspopup|orientation|selected|checked|modal|roledescription))$/;
/* Appels dont les arguments sont du code (sélecteurs, clés de stockage, expressions régulières…). */
const SKIP_CALL = /^(RegExp|require|import|querySelector|querySelectorAll|getElementById|matchMedia|addEventListener|removeEventListener|getItem|setItem|removeItem|setProperty|getPropertyValue|createElement|closest|getAttribute|setAttribute|toLocaleDateString|toLocaleTimeString|DateTimeFormat|NumberFormat|postMessage|fetch|open|getByRole|getByLabel|locator)$/;
const CODEY = /^(https?:|mailto:|tel:|#\/|\.{0,2}\/|data:|[a-z]+\/[a-z0-9.+-]+(;|$))|px\b|\bvar\(|\bcalc\(|\brgba?\(/;

/* Morceaux de texte visibles d'un fichier .js ou .jsx : [{ start, end, text }]. */
export function jsTextSpans(src) {
  const ast = parse(src, { sourceType: "module", plugins: ["jsx"], errorRecovery: true });
  const out = [];
  const visit = (node, parent, key) => {
    if (!node || typeof node.type !== "string") return;
    if (node.type === "JSXText") out.push({ start: node.start, end: node.end, text: node.value });
    else if (node.type === "StringLiteral" && !skipString(node, parent, key)) out.push({ start: node.start + 1, end: node.end - 1, text: src.slice(node.start + 1, node.end - 1) });
    else if (node.type === "TemplateLiteral" && !(parent?.type === "TaggedTemplateExpression")) {
      if (!skipString(node, parent, key) && !node.quasis.some(q => CODEY.test(q.value.raw.trim()))) for (const q of node.quasis) out.push({ start: q.start, end: q.end, text: q.value.raw });
    }
    if (node.type === "RegExpLiteral" || node.type === "ImportDeclaration" || node.type === "ExportAllDeclaration") return;
    for (const k of Object.keys(node)) {
      if (k === "loc" || k === "extra" || k === "leadingComments" || k === "trailingComments" || k === "innerComments") continue;
      const v = node[k];
      if (Array.isArray(v)) v.forEach(c => visit(c, node, k)); else if (v && typeof v === "object") visit(v, node, k);
    }
  };
  visit(ast.program, null, null);
  return out;
}

function skipString(node, parent, key) {
  if (!parent) return false;
  if (node.type === "StringLiteral" && CODEY.test(node.value.trim())) return true;
  if ((parent.type === "ObjectProperty" || parent.type === "ObjectMethod") && key === "key" && !parent.computed) return true;
  if (parent.type === "MemberExpression" && key === "property") return true;
  if (parent.type === "ExportNamedDeclaration" || parent.type === "ExportAllDeclaration") return true;
  if (parent.type === "JSXAttribute" && SKIP_ATTR.test(typeof parent.name.name === "string" ? parent.name.name : `${parent.name.namespace?.name}-${parent.name.name?.name}`)) return true;
  if ((parent.type === "CallExpression" || parent.type === "NewExpression") && key === "arguments") {
    const c = parent.callee, n = c.type === "Identifier" ? c.name : c.type === "MemberExpression" && c.property.type === "Identifier" ? c.property.name : "";
    if (SKIP_CALL.test(n)) return true;
  }
  if (parent.type === "BinaryExpression" && /^[=!]==?$/.test(parent.operator)) return true; // comparaisons : valeurs de code
  return false;
}

/* Morceaux de texte d'un article Markdown : tout sauf les liens (adresse entre parenthèses) et le code. */
export function mdTextSpans(src) {
  const out = [];
  const re = /\]\([^)]*\)|`[^`]*`|^(?:[a-zA-Z]+):(?= )/gm;
  let last = 0, m;
  while ((m = re.exec(src))) { out.push({ start: last, end: m.index, text: src.slice(last, m.index) }); last = m.index + m[0].length; }
  out.push({ start: last, end: src.length, text: src.slice(last) });
  return out;
}

/* Espace ordinaire là où le français demande une espace insécable. */
const UNITS = /(?<![\w.,-])\d+ (?=(?:janvier|février|mars|avril|mai|juin|juillet|août|septembre|octobre|novembre|décembre|minutes?|min|secondes?|s|heures?|h|jours?|semaines?|mois|ans|Mo|Ko|Go|caractères|mots|questions?|pauses?|fois|phrases?|sur|étapes|consignes|répétitions)\b)/;
export const TYPO_BAD = new RegExp(`(?<!\\n[ \\t]*) [;:?!»%]|« |${UNITS.source}`);

export function fixTypo(t) {
  return t
    .replace(/(^|[^\s\n])[  ]([;?!])/g, `$1${NNBSP}$2`)
    .replace(/(^|[^\s\n])[  ]([:%])/g, `$1${NBSP}$2`)
    .replace(/(^|[^\s\n])[  ]»/g, `$1${NNBSP}»`)
    .replace(/«[  ]/g, `«${NNBSP}`)
    .replace(new RegExp(UNITS.source, "g"), m => m.replace(/ $/, NBSP));
}

export const badSpots = text => {
  const res = [];
  const re = new RegExp(TYPO_BAD.source, "g");
  let m;
  while ((m = re.exec(text))) res.push(text.slice(Math.max(0, m.index - 25), m.index + 10));
  return res;
};
