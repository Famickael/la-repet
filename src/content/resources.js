/* Centre de ressources : chargement des articles (fichiers Markdown de src/content/resources/),
   lecture de l'en-tête et découpage en blocs. Aucun composant ici : le rendu est dans src/Resources.jsx.
   Pour ajouter un article : déposer un fichier <slug>.md dans src/content/resources/ (format décrit
   dans docs/briefs/chatgpt-ressources.md). Rien d'autre à modifier. */

import { CATEGORIES, TYPES } from "./categories.js";
import { stripAccents, slugify } from "../lib/text.js";
export { CATEGORIES, TYPES };

const files = import.meta.glob("./resources/*.md", { query: "?raw", import: "default", eager: true });

/* En-tête entre deux lignes « --- » : une paire « clé: valeur » par ligne. */
function parseFront(raw) {
  const m = raw.replace(/\r\n/g, "\n").match(/^---\n([\s\S]*?)\n---\n?([\s\S]*)$/);
  if (!m) return { meta: {}, body: raw };
  const meta = {};
  for (const line of m[1].split("\n")) {
    const i = line.indexOf(":");
    if (i < 1 || line.trim().startsWith("#")) continue;
    const k = line.slice(0, i).trim();
    /* Guillemets retirés seulement s'ils encadrent la valeur : « Équipe La Répét' » garde son apostrophe. */
    let v = line.slice(i + 1).trim().replace(/^(["'])(.*)\1$/, "$2");
    if (v === "true") v = true; else if (v === "false") v = false;
    meta[k] = v;
  }
  return { meta, body: m[2] };
}

export { slugify };

/* Blocs : h2, h3, p, ul, ol, quote, callout. Le texte reste brut : la mise en forme en ligne
   (gras, italique, liens) est appliquée au rendu. */
export function parseBlocks(body) {
  const lines = body.replace(/\r\n/g, "\n").split("\n");
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const l = lines[i];
    if (!l.trim()) { i++; continue; }
    let m;
    if ((m = l.match(/^(#{2,3})\s+(.*)$/))) { out.push({ t: m[1].length === 2 ? "h2" : "h3", text: m[2].trim(), id: slugify(m[2]) }); i++; continue; }
    if (/^\s*[-*]\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*[-*]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*[-*]\s+/, "")); i++; }
      out.push({ t: "ul", items }); continue;
    }
    if (/^\s*\d+[.)]\s+/.test(l)) {
      const items = [];
      while (i < lines.length && /^\s*\d+[.)]\s+/.test(lines[i])) { items.push(lines[i].replace(/^\s*\d+[.)]\s+/, "")); i++; }
      out.push({ t: "ol", items }); continue;
    }
    if (/^>/.test(l)) {
      const q = [];
      while (i < lines.length && /^>/.test(lines[i])) { q.push(lines[i].replace(/^>\s?/, "")); i++; }
      const head = q[0].match(/^\[!([a-z-]+)\]\s*(.*)$/i);
      if (head) out.push({ t: "callout", kind: head[1].toLowerCase(), title: head[2], blocks: parseBlocks(q.slice(1).join("\n")) });
      else out.push({ t: "quote", blocks: parseBlocks(q.join("\n")) });
      continue;
    }
    const p = [];
    while (i < lines.length && lines[i].trim() && !/^(#{2,3}\s|>|\s*[-*]\s+|\s*\d+[.)]\s+)/.test(lines[i])) { p.push(lines[i].trim()); i++; }
    out.push({ t: "p", text: p.join(" ") });
  }
  return out;
}

const words = s => (s.match(/\S+/g) || []).length;

export const ARTICLES = Object.entries(files).map(([path, raw]) => {
  const slug = path.split("/").pop().replace(/\.md$/, "");
  const { meta, body } = parseFront(raw);
  const blocks = parseBlocks(body);
  return {
    slug,
    title: meta.title || slug,
    category: meta.category || "preparer",
    type: meta.type === "cas" ? "cas" : "guide",
    summary: meta.summary || "",
    image: meta.image || `ressources/${slug}.webp`,
    imageAlt: meta.imageAlt || "",
    date: meta.date || "",
    readingTime: Number(meta.readingTime) || Math.max(1, Math.round(words(body) / 200)),
    author: meta.author || "Équipe La Répét'",
    featured: meta.featured === true,
    order: Number(meta.order) || 100,
    facts: { context: meta.context, audience: meta.audience, duration: meta.duration, setup: meta.setup },
    blocks,
    text: `${meta.title} ${meta.summary} ${body}`.toLowerCase(),
  };
}).sort((a, b) => a.order - b.order || (b.date || "").localeCompare(a.date || "") || a.title.localeCompare(b.title));

export const findArticle = slug => ARTICLES.find(a => a.slug === slug);
export const findCategory = id => CATEGORIES.find(c => c.id === id);

/* Recherche sans accents ni casse. */
export const norm = stripAccents;
export function search(q) {
  const t = norm(q).split(/\s+/).filter(Boolean);
  if (!t.length) return ARTICLES;
  return ARTICLES.filter(a => { const h = norm(a.text); return t.every(w => h.includes(w)); });
}
