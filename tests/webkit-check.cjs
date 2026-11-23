/* Mesure sous WebKit (le moteur de Safari) de l'écran de chargement et du fond de l'accueil. Hors suite par défaut.
   Installation, une fois (sans toucher au Chromium fourni) :
     PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-webkit npx playwright install webkit
     npx playwright install-deps webkit        (dépendances système, ou les paquets apt indiqués par l'erreur)
   Lancer :
     PLAYWRIGHT_BROWSERS_PATH=$HOME/pw-webkit node tests/webkit-check.cjs [adresse]
   Sans adresse : construit le site et le sert sur WEBKIT_PORT (5473 par défaut). Bureau 1280 × 800 et iPhone 15,
   thèmes clair et sombre.
   1. Chargement : relevé à chaque image (opacité du calque, transform des bulles, position du logo et de la page
      dessous). Échec si la page bouge sous le calque, si le logo saute (plus de 1,5 px par image de 16,7 ms), si
      l'opacité remonte, ou si la pause entre l'écart et le fondu sort de 0,85 à 1,05 s (aussi fil principal chargé).
   2. Fond : composition (images pré-rendues, ni masque, ni filtre, ni mélange), amplitude à l'écran (souris de
      gauche à droite au bureau, dérive sur iPhone) et coût : images par seconde fond visible, rapportées à la même
      mesure fond masqué. Le moteur WebKit de Linux compose en logiciel : les valeurs absolues ne sont pas celles
      d'un Mac ou d'un iPhone, et le rapport varie d'un passage à l'autre (0,55 à 0,96 au bureau) : il est donné à
      titre indicatif (« À VOIR » sous 0,6), sans faire échouer le verdict. */
const { webkit, devices } = require("playwright");
const { spawn, execSync } = require("child_process");
const { decodePng } = require("./lib/png.cjs");

const PORT = Number(process.env.WEBKIT_PORT || 5473);
const OUT = process.env.WEBKIT_OUT || "node_modules/.cache/webkit-dist";
const lines = [];
let failed = 0;
const verdict = (ok, msg, info = false) => { lines.push(`${ok ? "OK      " : info ? "À VOIR  " : "ÉCHEC   "}${msg}`); if (!ok && !info) failed++; };

/* Relevé injecté avant tout script de la page : une ligne par image tant que le calque existe, puis 800 ms. */
function sampler({ busy }) {
  Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false });   // sinon le calque est retiré tout de suite
  const S = (window.__S = []);
  let gone = 0;
  const q = s => document.querySelector(s);
  const tr = e => { if (!e) return null; const cs = getComputedStyle(e); const M = new DOMMatrix(cs.transform === "none" ? undefined : cs.transform); return [M.m41, M.m42, +cs.opacity]; };
  const rect = e => { if (!e) return null; const r = e.getBoundingClientRect(); return [+r.x.toFixed(2), +r.y.toFixed(2), +r.width.toFixed(2), +r.height.toFixed(2)].join(","); };
  const f = t => {
    try {
      const L = document.getElementById("rp-loader");
      if (!L && !gone && document.getElementById("root")?.firstChild) gone = t;
      S.push({ t, L: L ? +getComputedStyle(L).opacity : -1, cls: L ? L.className : "", l: tr(q(".rpl-l")), lx: tr(q(".rpl-lx")), logo: rect(q(".rpl-logo")),
        page: [rect(q("#root h1")), rect(q("#root header")), rect([...document.querySelectorAll("#root main img")].find(i => !i.closest(".rs-glow")))].join("|") });
    } catch (e) { S.push({ t, err: String(e) }); }
    if (!gone || t - gone < 800) requestAnimationFrame(f);
  };
  requestAnimationFrame(f);
  setInterval(() => {}, 250);   // garde la boucle d'événements active pendant le chargement
  if (busy) { const end = performance.now() + 6000; const id = setInterval(() => { const s = performance.now(); while (performance.now() - s < 60); if (performance.now() > end) clearInterval(id); }, 80); }
}

async function loader(b, url, name, ctxOpts, busy) {
  const ctx = await b.newContext(ctxOpts);
  await ctx.addInitScript(sampler, { busy });
  const p = await ctx.newPage();
  await p.goto(url, { waitUntil: "commit" });
  await p.waitForSelector("#rp-loader", { state: "attached" });
  await p.waitForFunction(() => !document.getElementById("rp-loader"), null, { timeout: 20000 });
  await p.waitForTimeout(1000);
  const S = (await p.evaluate(() => window.__S)).filter(s => !s.err);
  await ctx.close();
  const tag = `[chargement ${name}${busy ? ", fil principal chargé" : ""}]`;
  const exitI = S.findIndex(s => /rpl-out/.test(s.cls));
  if (exitI < 0) { verdict(false, `${tag} sortie non observée (${S.length} images relevées)`); return; }
  const exit = S.slice(exitI);
  const ref = exit[0].page;
  const moved = exit.filter(s => s.L >= 0 && s.page !== ref);
  verdict(!moved.length, `${tag} page immobile sous le calque pendant la sortie${moved.length ? ` : ${moved[0].page} au lieu de ${ref}` : ""}`);
  const logos = new Set(S.filter(s => s.logo).map(s => s.logo));
  verdict(logos.size === 1, `${tag} boîte du logo immobile (${logos.size} position(s))`);
  let step = 0, up = 0;
  for (let i = 1; i < S.length; i++) {
    const a = S[i - 1], c = S[i], dt = Math.max(16.7, c.t - a.t);
    if (a.l && c.l && a.lx && c.lx) step = Math.max(step, Math.abs(c.l[0] + c.lx[0] - a.l[0] - a.lx[0]) / dt * 16.7);
    if (a.L >= 0 && c.L >= 0 && i > exitI) up = Math.max(up, c.L - a.L);
  }
  verdict(step <= 1.5, `${tag} bulles continues : pas maximal ${step.toFixed(2)} px par image (seuil 1,5)`);
  verdict(up <= 0.01, `${tag} fondu sans remontée d'opacité (${up.toFixed(3)})`);
  const mv = S.find(s => s.lx && s.lx[0] < -0.01), fd = S.find(s => s.L >= 0 && s.L < 0.995);
  const gap = mv && fd ? fd.t - mv.t : NaN;
  /* Résolution du relevé : un intervalle d'image ; fil principal chargé : jusqu'à 140 ms entre deux relevés. */
  const tol = busy ? 160 : 60;
  verdict(gap >= 900 - tol && gap <= 1000 + tol, `${tag} pause entre l'écart des bulles et le fondu : ${Math.round(gap)} ms (attendu 900)`);
  const dts = exit.slice(1).map((s, i) => s.t - exit[i].t);
  lines.push(`        ${tag} fil principal pendant la sortie : intervalle maximal ${Math.round(Math.max(...dts))} ms, ${dts.filter(d => d > 50).length} intervalle(s) au-delà de 50 ms`);
}

async function rafStats(p, act) {
  await p.evaluate(() => { window.__F = []; window.__run = true; const f = t => { window.__F.push(t); if (window.__run) requestAnimationFrame(f); }; requestAnimationFrame(f); });
  await act();
  const F = await p.evaluate(() => { window.__run = false; return window.__F; });
  const dt = F.slice(1).map((t, i) => t - F[i]).sort((a, c) => a - c);
  return { fps: (F.length - 1) / ((F[F.length - 1] - F[0]) / 1000), p95: dt[Math.floor(dt.length * 0.95)] || 0 };
}

async function background(b, url, name, ctxOpts, mobile) {
  const ctx = await b.newContext(ctxOpts);
  const p = await ctx.newPage();
  await p.goto(url); await p.waitForSelector(".rs-glow", { state: "attached" }); await p.waitForTimeout(1500);
  const tag = `[fond ${name}]`;
  const { width: vw, height: vh } = p.viewportSize();
  const comp = await p.evaluate(() => {
    const g = document.querySelector(".rs-glow"), all = [g, ...g.querySelectorAll("*")];
    const bad = all.map(e => { const cs = getComputedStyle(e); return [cs.webkitMaskImage, cs.maskImage, cs.filter, cs.backdropFilter || cs.webkitBackdropFilter, cs.mixBlendMode, cs.backgroundImage].filter(v => v && v !== "none" && v !== "normal"); }).flat();
    const imgs = [...g.querySelectorAll("img")].map(i => i.complete && i.naturalWidth > 0 && i.naturalWidth <= 512 && i.src.startsWith("data:image/png"));
    return { bad, imgs };
  });
  verdict(!comp.bad.length && comp.imgs.length === 2 && comp.imgs.every(Boolean), `${tag} composition : deux images pré-rendues, ni masque, ni filtre, ni dégradé CSS${comp.bad.length ? ` (${comp.bad.join(", ")})` : ""}`);
  const glowOnly = async () => {
    const st = await p.addStyleTag({ content: "body *{visibility:hidden!important}.rs-glow,.rs-glow *{visibility:visible!important}" });
    const img = decodePng(await p.screenshot()); await st.evaluate(s => s.remove()); return img;
  };
  const diff = (A, B) => { let s = 0, n = 0; for (let i = 0; i < A.data.length; i += A.channels * 5) { let d = 0; for (let c = 0; c < 3; c++) d += Math.abs(A.data[i + c] - B.data[i + c]); s += d / 3; n++; } return s / n; };
  const sweep = async () => { for (let k = 0; k < 4; k++) await p.mouse.move(k % 2 ? 20 : vw - 20, k % 2 ? vh - 20 : 20, { steps: 45 }); };
  const act = mobile ? () => p.waitForTimeout(3000) : sweep;
  const on = await rafStats(p, act);
  const hide = await p.addStyleTag({ content: ".rs-glow{display:none!important}" });
  const off = await rafStats(p, act);
  await hide.evaluate(s => s.remove());
  const ratio = Math.min(60, on.fps) / Math.min(60, off.fps);   // sans affichage synchronisé, WebKit peut dépasser 60 i/s à vide
  verdict(ratio >= 0.6, `${tag} coût du fond : ${on.fps.toFixed(1)} i/s fond visible (p95 ${on.p95.toFixed(0)} ms), ${off.fps.toFixed(1)} i/s fond masqué, rapport ${ratio.toFixed(2)} (repère 0,6)`, true);
  if (mobile) {
    const A = await glowOnly(); await p.waitForTimeout(4000); const B = await glowOnly();
    const e = diff(A, B);
    verdict(e >= 1.5, `${tag} dérive visible : écart moyen ${e.toFixed(2)} niveaux sur 255 en 4 s (seuil 1,5)`);
  } else {
    await p.mouse.move(vw * 0.1, vh / 2, { steps: 8 }); await p.waitForTimeout(1500); const A = await glowOnly();
    await p.mouse.move(vw * 0.9, vh / 2, { steps: 8 }); await p.waitForTimeout(1500); const B = await glowOnly();
    const e = diff(A, B);
    verdict(e >= 5, `${tag} amplitude à l'écran, souris de gauche à droite : écart moyen ${e.toFixed(2)} niveaux sur 255 (seuil 5)`);
  }
  await ctx.close();
}

(async () => {
  let url = process.argv[2], srv = null;
  if (!url) {
    execSync(`npx vite build --outDir ${OUT} --emptyOutDir`, { stdio: "ignore" });
    srv = spawn("node", ["node_modules/vite/bin/vite.js", "preview", "--outDir", OUT, "--port", String(PORT), "--strictPort"], { stdio: "ignore" });
    for (let t = 0; t < 60; t++) { try { if ((await fetch(`http://localhost:${PORT}/`)).ok) break; } catch { /* pas encore prêt */ } await new Promise(r => setTimeout(r, 500)); }
    url = `http://localhost:${PORT}/`;
  }
  let b;
  try { b = await webkit.launch(); } catch (e) {
    console.error("WebKit ne démarre pas. Installer le moteur et ses dépendances (voir l'en-tête de ce fichier).\n" + e.message.split("\n")[0]);
    srv?.kill(); process.exit(2);
  }
  console.log(`WebKit ${b.version()} : ${url}`);
  const configs = [["bureau 1280", { viewport: { width: 1280, height: 800 } }, false], ["iPhone 15", { ...devices["iPhone 15"] }, true]];
  for (const [name, opts, mobile] of configs) for (const theme of ["light", "dark"]) {
    const label = `${name}, ${theme === "light" ? "clair" : "sombre"}`, ctxOpts = { ...opts, colorScheme: theme };
    await loader(b, url, label, ctxOpts, false);
    await background(b, url, label, ctxOpts, mobile);
  }
  await loader(b, url, "bureau 1280, clair", { viewport: { width: 1280, height: 800 } }, true);
  await b.close(); srv?.kill();
  console.log(lines.join("\n"));
  console.log(failed ? `\nVerdict : ${failed} échec(s) sous WebKit.` : "\nVerdict : chargement continu et fond composité sous WebKit (à confirmer sur un vrai Safari et un vrai iPhone pour la fluidité).");
  process.exit(failed ? 1 : 0);
})();
