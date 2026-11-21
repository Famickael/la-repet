/* Régénère l'image d'aperçu de lien et les icônes PNG du site (docs/seo.md, 1).
   Usage : node scripts/og-image.mjs   (CHROMIUM_PATH=/opt/pw-browsers/chromium dans les sessions distantes)
   Sorties :
     public/og-image.png               1200 x 630, à partir de scripts/og-image.html (moins de 300 Ko visé)
     public/icons/apple-touch-icon.png 180 x 180, fond blanc (iOS ne gère pas la transparence)
     public/icons/icon-192.png         192 x 192, fond transparent (manifeste, usage « any »)
     public/icons/icon-512.png         512 x 512, fond transparent (manifeste, usage « any »)
     public/icons/icon-maskable-512.png 512 x 512, fond blanc, symbole dans la zone sûre (manifeste, « maskable »)
   Les icônes reprennent public/favicon.svg dans ses couleurs claires.
   Après une modification de l'image, changer son nom ou ajouter un paramètre dans index.html : Facebook, LinkedIn
   et les autres gardent l'ancienne image en cache par adresse. */
import { chromium } from "playwright";
import { readFileSync, mkdirSync, statSync } from "fs";
import { fileURLToPath } from "url";

const root = fileURLToPath(new URL("..", import.meta.url));
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {});
const page = await browser.newPage({ viewport: { width: 1200, height: 630 }, colorScheme: "light" });

/* Masques et polices intégrés en data: (Chromium refuse les masques CSS chargés depuis file://). */
const inline = html => html.replace(/url\('\.\.\/public\/([^']+)'\)/g, (_, f) =>
  `url('data:${f.endsWith(".png") ? "image/png" : "font/woff2"};base64,${readFileSync(`${root}public/${f}`).toString("base64")}')`);
await page.setContent(inline(readFileSync(`${root}scripts/og-image.html`, "utf8")));
await page.evaluate(() => document.fonts.ready);
await page.screenshot({ path: `${root}public/og-image.png`, clip: { x: 0, y: 0, width: 1200, height: 630 } });

/* Icônes : le SVG de l'icône du site, couleurs claires figées (pas de media query dans une image PNG). */
const svg = readFileSync(`${root}public/favicon.svg`, "utf8").replace(/@media[^{]*\{[^}]*\{[^}]*\}[^}]*\{[^}]*\}[^}]*\{[^}]*\}\s*\}/, "");
mkdirSync(`${root}public/icons`, { recursive: true });
const icons = [
  ["apple-touch-icon.png", 180, "#FFFFFF", 0.78],
  ["icon-192.png", 192, "transparent", 0.92],
  ["icon-512.png", 512, "transparent", 0.92],
  ["icon-maskable-512.png", 512, "#FFFFFF", 0.62],
];
for (const [name, size, bg, ratio] of icons) {
  await page.setViewportSize({ width: size, height: size });
  await page.setContent(`<!doctype html><html><body style="margin:0;width:${size}px;height:${size}px;display:grid;place-items:center;background:${bg}">
    <div style="width:${Math.round(size * ratio)}px">${svg.replace("<svg ", '<svg style="display:block;width:100%;height:auto" ')}</div></body></html>`);
  await page.screenshot({ path: `${root}public/icons/${name}`, omitBackground: bg === "transparent" });
}
await browser.close();

const kb = f => Math.round(statSync(`${root}public/${f}`).size / 1024);
console.log(`og-image.png : ${kb("og-image.png")} Ko`);
for (const [name] of icons) console.log(`icons/${name} : ${kb(`icons/${name}`)} Ko`);
if (kb("og-image.png") >= 300) { console.error("og-image.png dépasse 300 Ko : simplifier le visuel."); process.exitCode = 1; }
