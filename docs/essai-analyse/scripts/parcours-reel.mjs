/* Preuve de bout en bout, dans le navigateur : code REPETE, enregistrement (caméra et micro simulés par Chromium),
   mise par écrit simulée (les segments du cas 2), puis le vrai appel d'analyse du site : navigateur, proxy local,
   faux fournisseur, rapprochement, filtre, affichage. Le site est construit avec VITE_LLM_ENDPOINT et VITE_STT_ENDPOINT.
   Usage : ESSAI_BASE=http://localhost:5515/ CHROMIUM_PATH=/opt/pw-browsers/chromium node docs/essai-analyse/scripts/parcours-reel.mjs */
import { chromium } from "playwright";
import { ORG } from "../../../src/content/organisme.js";
const BASE = process.env.ESSAI_BASE || "http://localhost:5515/";
const OUT = new URL("../captures/", import.meta.url).pathname;
const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
const ctx = await b.newContext({ viewport: { width: 1280, height: 900 }, permissions: ["camera", "microphone"], locale: "fr-FR" });
const p = await ctx.newPage();
const sent = [];
p.on("request", r => { if (r.method() === "POST" && r.url().includes(":5513")) sent.push(JSON.parse(r.postData())); });
p.on("console", m => { if (/analyse/.test(m.text())) console.log("console :", m.text()); });
const click = t => p.getByRole("button", { name: t }).first().click({ timeout: 15000 });
await p.goto(BASE + "#/s/REPETE"); await p.waitForTimeout(800);
await p.evaluate(v => { const s = JSON.parse(localStorage.getItem("larepet.v1")); s.parcours.REPETE = { ...s.parcours.REPETE, poste: "préparateur de commandes", consent: { at: new Date().toISOString(), local: true, ai: true, version: v } }; localStorage.setItem("larepet.v1", JSON.stringify(s)); }, ORG.textsVersion);
await p.goto(BASE + "#/s/REPETE/questions"); await p.reload(); await p.waitForTimeout(800);
await click("Tout retirer").catch(() => {});
await p.locator("#own").fill("Pourquoi ce poste ?"); await click("Ajouter");
await click(/^Commencer/);
await click("Activer la caméra"); await p.waitForTimeout(800);
await click("Démarrer l'enregistrement"); await p.waitForTimeout(20000);
await click("Arrêter"); await p.waitForTimeout(800);
await p.locator("button.rp-btn, button").filter({ hasText: /Voir mon|Voir l'analyse|analyse/ }).first().click();
await p.waitForFunction(() => /\/(lecture|retour)\//.test(location.hash), null, { timeout: 60000 });
const take = await p.evaluate(() => Object.values(JSON.parse(localStorage.getItem("larepet.v1")).takes)[0]);
console.log("requêtes d'analyse envoyées par le navigateur :", sent.length, sent.map(s => `${s.task}, rôles ${s.messages.map(m => m.role).join("+")}, modèle imposé : ${"model" in s}`));
console.log("source de l'analyse gardée :", take.analysis.source);
console.log("résumé affiché :", take.analysis.synthese);
await p.goto(BASE + `#/s/REPETE/retour/${take.id}`); await p.waitForTimeout(1500);
await p.screenshot({ path: `${OUT}parcours-reel-cas-2-analyse-1280.jpg`, type: "jpeg", quality: 58, fullPage: true });
await b.close();
if (sent.length !== 1 || take.analysis.source !== "llm") process.exit(1);
