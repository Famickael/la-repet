/* Étape 5 de l'essai : affiche les trois analyses dans le vrai site (construit avec VITE_LLM_ENDPOINT) et prend les captures.
   Chaque entretien est inséré dans le stockage du navigateur sous le code REPETE, avec l'analyse du dossier
   resultat-filtre/ (celle que le navigateur obtient après rapprochement et filtre), puis les écrans sont ouverts :
   analyse côté personne (lecture, puis relecture avec l'enregistrement), relecture côté coach, rapport reçu.
   L'image de la vidéo est une carte « personne fictive » dessinée pour l'essai ; le son est un silence.
   Usage : ESSAI_BASE=http://localhost:5515/ CHROMIUM_PATH=/opt/pw-browsers/chromium node docs/essai-analyse/scripts/captures.mjs */
import { chromium } from "playwright";
import { readFileSync, readdirSync, mkdirSync } from "fs";
import { ORG } from "../../../src/content/organisme.js";

const dir = new URL("..", import.meta.url).pathname;
const BASE = process.env.ESSAI_BASE || "http://localhost:5515/";
const OUT = `${dir}captures`;
mkdirSync(OUT, { recursive: true });
const coach = JSON.parse(readFileSync(`${dir}rapports-coach.json`, "utf8"));
const cases = readdirSync(`${dir}transcriptions`).filter(f => f.endsWith(".json")).sort().map(f => ({
  ...JSON.parse(readFileSync(`${dir}transcriptions/${f}`, "utf8")),
  analysis: JSON.parse(readFileSync(`${dir}resultat-filtre/${f}`, "utf8")).analyseAffichee,
}));

const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--autoplay-policy=no-user-gesture-required"] });

/* Enregistrements de synthèse, fabriqués une fois : carte « personne fictive » filmée depuis un canevas (vidéo), silence (voix seule). */
const media = {};
{
  const p = await (await b.newContext()).newPage();
  await p.goto(BASE);
  const made = await p.evaluate(async list => {
    const b64 = blob => new Promise(r => { const f = new FileReader(); f.onload = () => r(f.result.split(",")[1]); f.readAsDataURL(blob); });
    const video = (label, seconds) => new Promise(resolve => {
      const c = document.createElement("canvas"); c.width = 640; c.height = 360;
      const g = c.getContext("2d");
      const draw = t => {
        g.fillStyle = "#1B2A4A"; g.fillRect(0, 0, 640, 360);
        g.fillStyle = "#fff"; g.textAlign = "center"; g.font = "600 28px sans-serif"; g.fillText(label, 320, 160);
        g.font = "18px sans-serif"; g.fillText("Personne fictive · image de synthèse pour l'essai", 320, 200);
        g.fillText(`${Math.floor(t / 60)}:${String(Math.floor(t % 60)).padStart(2, "0")}`, 320, 240);
      };
      const rec = new MediaRecorder(c.captureStream(4), { mimeType: "video/webm", videoBitsPerSecond: 60000 });
      const parts = []; rec.ondataavailable = e => parts.push(e.data);
      rec.onstop = async () => resolve({ mime: "video/webm", data: await b64(new Blob(parts, { type: "video/webm" })) });
      const t0 = performance.now(); draw(0); rec.start();
      const iv = setInterval(() => { const t = (performance.now() - t0) / 1000; draw(t); if (t >= seconds) { clearInterval(iv); rec.stop(); } }, 250);
    });
    const silence = async seconds => {
      const n = 8000 * seconds, buf = new ArrayBuffer(44 + n), v = new DataView(buf), w = (o, s) => [...s].forEach((ch, i) => v.setUint8(o + i, ch.charCodeAt(0)));
      w(0, "RIFF"); v.setUint32(4, 36 + n, true); w(8, "WAVEfmt "); v.setUint32(16, 16, true); v.setUint16(20, 1, true); v.setUint16(22, 1, true);
      v.setUint32(24, 8000, true); v.setUint32(28, 8000, true); v.setUint16(32, 1, true); v.setUint16(34, 8, true); w(36, "data"); v.setUint32(40, n, true);
      new Uint8Array(buf, 44).fill(128);
      return { mime: "audio/wav", data: await b64(new Blob([buf], { type: "audio/wav" })) };
    };
    const out = await Promise.all(list.map(c => (c.mode === "vidéo" ? video(c.personne.split(" (")[0], c.duration) : silence(c.duration))));
    return Object.fromEntries(list.map((c, i) => [c.cas, out[i]]));
  }, cases.map(c => ({ cas: c.cas, mode: c.mode, duration: c.duration, personne: c.personne })));
  Object.assign(media, made);
  await p.context().close();
}

const now = Date.now();
const iso = minutesAgo => new Date(now - minutesAgo * 60000).toISOString();
const problems = [];
for (const [vw, vh] of [[1280, 900], [390, 844]]) {
  for (const c of cases) {
    const ctx = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: vw < 600, hasTouch: vw < 600, locale: "fr-FR" });
    const p = await ctx.newPage();
    p.on("pageerror", e => problems.push(`${c.cas} ${vw} : ${e.message}`));
    const id = `essai-${c.cas.slice(0, 1)}`;
    const take = {
      id, code: "REPETE", question: c.question, duration: c.duration, transcript: c.segments.map(s => s.text.trim()).join(" "),
      segments: c.segments.map(s => ({ ...s, text: s.text.trim() })), gaze: c.gaze, analysis: c.analysis,
      hasMedia: true, mime: media[c.cas].mime, createdAt: iso(90), shared: false, sharedAt: null, note: "", report: null,
    };
    const parcours = { code: "REPETE", prenom: c.personne.split(" (")[0], poste: c.poste, warmup: true, counselor: "Sophie M.", trial: true, createdAt: iso(600), openedAt: iso(120), consent: { at: iso(120), local: true, ai: true, version: ORG.textsVersion } };
    const put = async patch => {
      await p.evaluate(({ parcours, take, patch }) => {
        const t = { ...take, ...patch };
        localStorage.setItem("larepet.v1", JSON.stringify({ v: 1, counselor: { name: "Sophie M.", since: new Date().toISOString() }, parcours: { REPETE: parcours }, takes: { [t.id]: t }, lastSpace: null }));
      }, { parcours, take, patch });
    };
    await p.goto(BASE);
    await put({});
    await p.evaluate(async ({ id, m }) => {
      const bin = atob(m.data), u8 = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
      await new Promise((res, rej) => {
        const req = indexedDB.open("larepet", 1);
        req.onupgradeneeded = () => req.result.createObjectStore("videos");
        req.onsuccess = () => { const tx = req.result.transaction("videos", "readwrite"); tx.objectStore("videos").put(new Blob([u8], { type: m.mime }), id); tx.oncomplete = res; tx.onerror = () => rej(tx.error); };
        req.onerror = () => rej(req.error);
      });
    }, { id, m: media[c.cas] });
    const shot = async (name, hash) => {
      await p.goto(BASE + hash); await p.reload(); await p.waitForTimeout(1800);
      const close = p.getByRole("button", { name: "Fermer la bulle" }); if (await close.count()) await close.first().click().catch(() => {});
      const txt = await p.locator("main").innerText();
      if (!txt.includes(c.analysis.synthese.slice(0, 40))) problems.push(`${c.cas} ${vw} ${name} : le résumé de l'analyse n'est pas affiché`);
      const w = await p.evaluate(() => document.documentElement.scrollWidth); if (w > vw + 1) problems.push(`${c.cas} ${vw} ${name} : débordement ${w}px`);
      await p.screenshot({ path: `${OUT}/${c.cas}-${name}-${vw}.jpg`, type: "jpeg", quality: 58, fullPage: true });
    };
    await shot("1-personne-analyse", `#/s/REPETE/retour/${id}`);
    await shot("2-personne-relecture", `#/s/REPETE/retour/${id}/video`);
    await put({ shared: true, sharedAt: iso(60), note: "Est-ce que ma fin est assez claire ?", draft: coach[c.cas] });
    await shot("3-coach-relecture", `#/coach/relecture/REPETE/${id}`);
    await put({ shared: true, sharedAt: iso(60), note: "Est-ce que ma fin est assez claire ?", report: { ...coach[c.cas], sentAt: iso(10), by: "Sophie M." } });
    await shot("4-personne-rapport-coach", `#/s/REPETE/retour/${id}`);
    await ctx.close();
    console.log("captures :", c.cas, vw);
  }
}
await b.close();
if (problems.length) { console.error("problèmes :", problems); process.exit(1); }
