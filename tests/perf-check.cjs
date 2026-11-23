/* Fluidité des animations sous Chromium (moteur d'Edge et de Chrome), processeur ralenti. Hors suite par défaut.
   Lancer :
     CHROMIUM_PATH=/opt/pw-browsers/chromium node tests/perf-check.cjs [adresse]
   Sans adresse : construit le site et le sert sur PERF_PORT (5533 par défaut).
   Réglages (variables d'environnement) :
     PERF_CPU=4                      ralentissement du processeur (Emulation.setCPUThrottlingRate) ; 6 pour un PC très modeste
     PERF_VIEWPORTS=1280x800         une ou plusieurs tailles, séparées par des virgules (1280x800,1920x1080)
     PERF_THEMES=light               light, dark ou light,dark
     PERF_ONLY=defilement            ne rejoue que les scénarios dont le nom contient ce texte (expression régulière)
     PERF_REPEAT=3                   rejoue chaque scénario n fois et garde la médiane (machine partagée, mesures bruitées)
     PERF_TRACE=0                    sans trace DevTools (pas de détail style, mise en page, peinture)
     PERF_CSS='.rs-glow{display:none}' feuille ajoutée à chaque page, pour tester une hypothèse avant de modifier le code
   Pour chaque scénario : part des images livrées à temps (intervalle entre deux images de requestAnimationFrame à
   moins de 16,7 ms, tolérance de 2 ms pour le battement de l'affichage), images perdues (images de 60 Hz manquées),
   tâches longues (PerformanceObserver « longtask », plus de 50 ms), animations simultanées (document.getAnimations),
   calques composités (nombre et surface rapportée à la fenêtre, domaine LayerTree), et, avec la trace, la durée
   moyenne par image du style, de la mise en page, de la peinture (pré-peinture, peinture, découpage en calques) et
   de la composition de l'affichage (viz), plus les animations que Chromium n'a pas pu confier au compositeur.
   Verdict par scénario : FLUIDE (90 % et plus à temps, aucune tâche de plus de 100 ms), À SURVEILLER (75 à 90 %),
   SACCADÉ (moins de 75 %). Sortie en échec si un scénario est SACCADÉ.
   Limite : Chromium sans écran compose en logiciel (pas de carte graphique). Les valeurs absolues ne sont pas celles
   d'un PC sous Windows ; la mesure sert à comparer avant et après une modification, sur la même machine. */
const { chromium } = require("playwright");
const { spawn, execSync } = require("child_process");

const CPU = Number(process.env.PERF_CPU || 4);
const PORT = Number(process.env.PERF_PORT || 5533);
const OUT = process.env.PERF_OUT || "node_modules/.cache/perf-dist";
const VIEWPORTS = (process.env.PERF_VIEWPORTS || "1280x800").split(",").map(s => s.trim().split("x").map(Number));
const THEMES = (process.env.PERF_THEMES || "light").split(",").map(s => s.trim());
const ONLY = process.env.PERF_ONLY ? new RegExp(process.env.PERF_ONLY) : null;
const TRACE = process.env.PERF_TRACE !== "0";
const REPEAT = Math.max(1, Number(process.env.PERF_REPEAT || 1));
const FRAME = 1000 / 60, ON_TIME = FRAME + 2;
const CATS = "devtools.timeline,disabled-by-default-devtools.timeline,viz,benchmark";

/* Injecté avant tout script de la page : tâches longues et relevé des animations en cours. */
function probe() {
  Object.defineProperty(Navigator.prototype, "webdriver", { get: () => false });   // sinon l'écran de chargement est retiré tout de suite
  window.__LT = [];
  try { new PerformanceObserver(l => l.getEntries().forEach(e => window.__LT.push([e.startTime, e.duration]))).observe({ type: "longtask", buffered: true }); } catch { /* non pris en charge */ }
  window.__rec = () => {
    window.__F = []; window.__A = 0; window.__run = true;
    const f = t => { window.__F.push(t); if (window.__run) requestAnimationFrame(f); };
    requestAnimationFrame(f);
    window.__AI = setInterval(() => { try { window.__A = Math.max(window.__A, document.getAnimations().filter(a => a.playState === "running").length); } catch { /* ignoré */ } }, 100);
    window.__T0 = performance.now();
  };
  window.__stop = () => {
    window.__run = false; clearInterval(window.__AI);
    const t0 = window.__T0;
    return { F: window.__F, A: window.__A, LT: window.__LT.filter(([s]) => s >= t0 - 1) };
  };
}

const sleep = ms => new Promise(r => setTimeout(r, ms));

async function wheelTo(p, { from, to, step = 120, pause = 40 }) {
  if (from != null) { await p.evaluate(y => window.scrollTo(0, y), from); await sleep(200); }
  const vh = p.viewportSize().height;
  await p.mouse.move(p.viewportSize().width / 2, vh / 2);
  for (let k = 0; k < 400; k++) {
    const y = await p.evaluate(() => window.scrollY);
    const end = to === "bottom" ? await p.evaluate(() => document.documentElement.scrollHeight - innerHeight) : to;
    if (y >= end - 2) break;
    await p.mouse.wheel(0, Math.min(step, end - y));
    await sleep(pause);
  }
  await sleep(400);
}
const sectionTop = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().top + scrollY : 0; }, sel);
const sectionEnd = (p, sel) => p.evaluate(s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().bottom + scrollY - innerHeight : 0; }, sel);

async function home(p, base) {
  await p.goto(base + "#/"); await p.waitForSelector("h1"); await p.waitForTimeout(1200);
}
async function benef(p, base) {
  await p.goto(base + "#/"); await p.evaluate(() => localStorage.clear());
  await p.goto(base + "?neuf=1#/s/REPETE"); await p.waitForTimeout(800);
  const boxes = p.getByRole("checkbox");
  for (let k = 0; k < await boxes.count(); k++) await boxes.nth(k).check();
  await p.getByRole("button", { name: "Je suis d'accord, je commence" }).click(); await p.waitForTimeout(1500);
  const close = p.getByRole("button", { name: "Fermer la bulle" });
  if (await close.count()) { await close.first().click(); await p.waitForTimeout(400); }
}

/* Scénarios : setup (hors mesure), act (mesuré). */
const SCENARIOS = [
  { name: "chargement", loader: true, act: async p => { await p.waitForFunction(() => !document.getElementById("rp-loader"), null, { timeout: 20000 }); await p.waitForTimeout(500); } },
  { name: "accueil-souris", setup: home, act: async p => { const { width: w, height: h } = p.viewportSize(); for (let k = 0; k < 4; k++) await p.mouse.move(k % 2 ? 30 : w - 30, k % 2 ? h - 30 : 30, { steps: 40 }); await p.waitForTimeout(400); } },
  { name: "accueil-defilement", setup: home, act: p => wheelTo(p, { to: "bottom" }) },
  { name: "accueil-heros-scene", setup: home, act: async p => { await p.hover(".rs-stage"); await p.waitForTimeout(700); await p.locator(".rs-dot").nth(1).click(); await p.waitForTimeout(2600); } },
  { name: "accueil-phrase", setup: async (p, b) => { await home(p, b); await p.evaluate(() => window.scrollTo(0, 0)); }, act: async p => wheelTo(p, { from: await sectionTop(p, ".rs-phrase") - 200, to: await sectionEnd(p, ".rs-phrase"), step: 60 }) },
  { name: "accueil-strate", setup: home, act: async p => wheelTo(p, { from: await sectionTop(p, "#comment-ca-marche") - 100, to: await sectionEnd(p, "#comment-ca-marche"), step: 60 }) },
  ...[["a-propos", "#/a-propos"], ["methode", "#/solutions/methode"], ["ressources", "#/ressources"]].map(([n, h]) => ({
    name: `page-${n}`, setup: async (p, b) => { await p.goto(b + h); await p.waitForSelector("h1"); await p.waitForTimeout(1200); }, act: p => wheelTo(p, { to: "bottom" }),
  })),
  { name: "menus", setup: home, act: async p => {
    if (p.viewportSize().width <= 760) { const m = p.locator(".rs-burger"); await m.click(); await p.waitForTimeout(500); await m.click(); await p.waitForTimeout(500); return; }
    for (const t of [/Solutions/, /Cas d'usage/, /Ressources/]) { await p.locator(".rs-links").getByRole("button", { name: t }).first().hover().catch(() => {}); await p.waitForTimeout(450); }
    await p.mouse.move(p.viewportSize().width / 2, p.viewportSize().height / 2); await p.waitForTimeout(600);
  } },
  { name: "mon-compte", setup: benef, act: async p => {
    const b = p.locator("header button", { hasText: "Mon compte" });
    if (!(await b.isVisible())) return;
    for (let k = 0; k < 2; k++) { await b.click(); await p.waitForTimeout(500); await p.keyboard.press("Escape"); await p.waitForTimeout(400); }
  } },
  { name: "changement-de-page", setup: home, act: async p => {
    for (const h of ["#/a-propos", "#/solutions/methode", "#/"]) { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(1400); }
  } },
  { name: "accessibilite", setup: home, act: async p => { const t = p.locator(".rp-a11y-tab"); await t.click(); await p.waitForTimeout(900); await p.keyboard.press("Escape"); await p.waitForTimeout(900); } },
  { name: "assistant", setup: benef, act: async p => {
    const fab = p.getByRole("button", { name: "Ouvrir l'assistant de préparation d'entretien" });
    await fab.hover(); await p.waitForTimeout(300); await fab.click(); await p.waitForTimeout(1600);
    await p.keyboard.press("Escape"); await p.waitForTimeout(800);
  } },
];

function summarizeTrace(ev, nFrames) {
  const main = new Set(ev.filter(e => e.ph === "M" && e.name === "thread_name" && e.args?.name === "CrRendererMain").map(e => `${e.pid}:${e.tid}`));
  const sum = names => ev.filter(e => e.ph === "X" && names.includes(e.name) && (!main.size || main.has(`${e.pid}:${e.tid}`))).reduce((s, e) => s + (e.dur || 0), 0) / 1000;
  const anyThread = names => ev.filter(e => e.ph === "X" && names.includes(e.name)).reduce((s, e) => s + (e.dur || 0), 0) / 1000;
  const n = Math.max(1, nFrames);
  const failed = {};
  for (const e of ev) {
    const d = e.name === "Animation" && e.args?.data;
    if (d && (d.compositeFailed || d.unsupportedProperties?.length)) for (const pr of d.unsupportedProperties?.length ? d.unsupportedProperties : [`motif ${d.compositeFailed}`]) failed[pr] = (failed[pr] || 0) + 1;
  }
  const pres = ev.filter(e => e.name === "PipelineReporter" && e.ph === "b" && e.args?.frame_reporter);
  const dropped = pres.filter(e => e.args.frame_reporter.state === "STATE_DROPPED").length;
  return {
    style: sum(["UpdateLayoutTree"]) / n, layout: sum(["Layout"]) / n, paint: sum(["PrePaint", "Paint", "Layerize"]) / n,
    viz: anyThread(["Display::DrawAndSwap"]) / n, raster: anyThread(["RasterTask"]) / n, failed, dropped,
  };
}

async function layers(c, vw, vh) {
  const got = new Promise(r => { c.once("LayerTree.layerTreeDidChange", e => r(e.layers || [])); setTimeout(() => r(null), 1500); });
  await c.send("LayerTree.enable");
  const L = await got;
  await c.send("LayerTree.disable").catch(() => {});
  if (!L) return null;
  const drawn = L.filter(l => l.drawsContent && !l.invisible);
  return { n: drawn.length, area: drawn.reduce((s, l) => s + l.width * l.height, 0) / (vw * vh) };
}

async function run(b, base, sc, vw, vh, theme) {
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, colorScheme: theme });
  await ctx.addInitScript(probe);
  if (process.env.PERF_CSS) await ctx.addInitScript(css => document.addEventListener("DOMContentLoaded", () => { const st = document.createElement("style"); st.textContent = css; document.head.appendChild(st); }), process.env.PERF_CSS);
  const p = await ctx.newPage();
  const c = await ctx.newCDPSession(p);
  await c.send("Performance.enable");
  if (!sc.loader) { await sc.setup(p, base); }
  const lay0 = sc.loader ? null : await layers(c, vw, vh);
  const m0 = (await c.send("Performance.getMetrics")).metrics;
  await c.send("Emulation.setCPUThrottlingRate", { rate: CPU });
  let ev = [], traceDone = null;
  if (TRACE) {
    c.on("Tracing.dataCollected", d => ev.push(...d.value));
    traceDone = new Promise(r => c.once("Tracing.tracingComplete", r));
    await c.send("Tracing.start", { categories: CATS, transferMode: "ReportEvents" });
  }
  if (sc.loader) {
    await p.goto(base + "#/", { waitUntil: "commit" });
    await p.evaluate(() => window.__rec()).catch(async () => { await p.waitForLoadState("domcontentloaded"); await p.evaluate(() => window.__rec()); });
  } else await p.evaluate(() => window.__rec());
  let err = null;
  try { await sc.act(p); } catch (e) { err = e.message.split("\n")[0]; }
  const r = await p.evaluate(() => window.__stop());
  if (TRACE) { await c.send("Tracing.end"); await traceDone; }
  await c.send("Emulation.setCPUThrottlingRate", { rate: 1 });
  const m1 = (await c.send("Performance.getMetrics")).metrics;
  const lay1 = await layers(c, vw, vh);
  await ctx.close();
  const dt = r.F.slice(1).map((t, i) => t - r.F[i]);
  const ok = dt.filter(d => d <= ON_TIME).length;
  const lost = dt.reduce((s, d) => s + Math.max(0, Math.round(d / FRAME) - 1), 0);
  const met = (m, k) => (m.find(x => x.name === k) || {}).value || 0;
  const lt = r.LT.map(([, d]) => d);
  const lay = [lay0, lay1].filter(Boolean).sort((a, c) => c.area - a.area)[0] || null;
  return {
    name: sc.name, err, frames: dt.length, pct: dt.length ? (100 * ok) / dt.length : 0, lost,
    worst: dt.length ? Math.max(...dt) : 0, lt: lt.length, ltMax: lt.length ? Math.max(...lt) : 0, ltSum: lt.reduce((s, d) => s + d, 0),
    anims: r.A, lay, recalc: met(m1, "RecalcStyleCount") - met(m0, "RecalcStyleCount"), layoutN: met(m1, "LayoutCount") - met(m0, "LayoutCount"),
    tr: TRACE ? summarizeTrace(ev, dt.length) : null,
  };
}

/* Médiane des passages, champ par champ (le détail de la trace et les calques viennent du passage médian). */
function median(runs) {
  if (runs.length === 1) return runs[0];
  const ok = runs.filter(r => !r.err);
  if (!ok.length) return runs[0];
  const med = k => { const v = ok.map(r => r[k]).sort((a, c) => a - c); return v[Math.floor(v.length / 2)]; };
  const mid = [...ok].sort((a, c) => a.pct - c.pct)[Math.floor(ok.length / 2)];
  return { ...mid, pct: med("pct"), lost: med("lost"), worst: med("worst"), lt: med("lt"), ltMax: med("ltMax"), anims: med("anims"), err: ok.length < runs.length ? `${runs.length - ok.length} passage(s) en erreur` : null };
}

const verdictOf = r => r.err ? "ERREUR" : r.pct >= 90 && r.ltMax <= 100 ? "FLUIDE" : r.pct >= 75 ? "À SURVEILLER" : "SACCADÉ";
const f1 = x => x.toFixed(1).replace(".", ",");

(async () => {
  let base = process.argv[2], srv = null;
  if (!base) {
    execSync(`npx vite build --outDir ${OUT} --emptyOutDir`, { stdio: "ignore" });
    srv = spawn("node", ["node_modules/vite/bin/vite.js", "preview", "--outDir", OUT, "--port", String(PORT), "--strictPort"], { stdio: "ignore" });
    for (let t = 0; t < 60; t++) { try { if ((await fetch(`http://localhost:${PORT}/`)).ok) break; } catch { /* pas encore prêt */ } await sleep(500); }
    base = `http://localhost:${PORT}/`;
  }
  base = base.replace(/#.*$/, "");
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  console.log(`Chromium ${b.version()}, processeur ralenti ×${CPU} : ${base}`);
  let bad = 0;
  for (const [vw, vh] of VIEWPORTS) for (const theme of THEMES) {
    console.log(`\n${vw}×${vh}, thème ${theme === "dark" ? "sombre" : "clair"}`);
    console.log("scénario               à temps  perdues  pire ms  tâches longues (max ms)  anim.  calques (surface)" + (TRACE ? "  style  layout  peinture  viz  ms/image" : ""));
    for (const sc of SCENARIOS.filter(s => !ONLY || ONLY.test(s.name))) {
      const runs = [];
      for (let k = 0; k < REPEAT; k++) {
        try { runs.push(await run(b, base, sc, vw, vh, theme)); } catch (e) { runs.push({ name: sc.name, err: e.message.split("\n")[0], frames: 0, pct: 0, lost: 0, worst: 0, lt: 0, ltMax: 0, anims: 0 }); }
      }
      const r = median(runs);
      const v = verdictOf(r);
      if (v === "SACCADÉ" || v === "ERREUR") bad++;
      const lay = r.lay ? `${r.lay.n} (${f1(r.lay.area)}×)` : "-";
      let line = `${r.name.padEnd(22)} ${(f1(r.pct) + " %").padStart(7)}  ${String(r.lost).padStart(7)}  ${String(Math.round(r.worst)).padStart(7)}  ${`${r.lt} (${Math.round(r.ltMax)})`.padStart(22)}  ${String(r.anims).padStart(5)}  ${lay.padStart(17)}`;
      if (r.tr) line += `  ${f1(r.tr.style).padStart(5)}  ${f1(r.tr.layout).padStart(6)}  ${f1(r.tr.paint).padStart(8)}  ${f1(r.tr.viz).padStart(4)}`;
      console.log(`${line}  ${v}${r.err ? ` (${r.err})` : ""}`);
      const fl = r.tr && Object.entries(r.tr.failed);
      if (fl && fl.length) console.log(`${"".padEnd(23)}animations hors compositeur : ${fl.sort((a, c) => c[1] - a[1]).map(([k, n]) => `${k} ×${n}`).join(", ")}`);
    }
  }
  await b.close(); srv?.kill();
  console.log(bad ? `\nVerdict : ${bad} scénario(s) saccadé(s) ou en erreur sous Chromium, processeur ×${CPU}.` : `\nVerdict : aucun scénario saccadé sous Chromium, processeur ×${CPU} (à confirmer sur un vrai Edge sous Windows).`);
  process.exit(bad ? 1 : 0);
})();
