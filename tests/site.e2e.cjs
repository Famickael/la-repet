/* Pages publiques : navigation, menu mobile, strate épinglée, FAQ, ressources, formulaire de contact.
   Échoue en cas d'erreur JavaScript, de débordement horizontal ou d'élément attendu absent. */
const { chromium } = require("playwright");
const fs = require("fs");
const { pngDiff } = require("./lib/png.cjs");
const BASE = process.argv[2] || "http://localhost:5097/";
const SC = process.argv[3] || "tests/screenshots/site";
fs.mkdirSync(SC, { recursive: true });

const IGNORE = /Failed to load resource|ERR_TUNNEL|ERR_NAME|net::/;
const problems = [];
const check = (ok, msg) => { if (!ok) problems.push(msg); };

async function run(b, vw, vh, opts = {}) {
  const mobile = vw < 600, tag = `${vw}${opts.reduced ? "-reduit" : ""}`;
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: mobile, hasTouch: mobile, reducedMotion: opts.reduced ? "reduce" : "no-preference" });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", e => errors.push("pageerror " + e.message));
  p.on("console", m => { if (m.type() === "error" && !IGNORE.test(m.text())) errors.push("console " + m.text().slice(0, 200)); });
  const overflow = async n => {
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    check(w <= vw + 1, `[${tag}] ${n} : débordement horizontal ${w}px pour ${vw}px`);
  };
  // Pleine page : on parcourt d'abord la page pour déclencher les apparitions et les images différées.
  const revealAll = () => p.evaluate(async () => {
    const y0 = scrollY;
    for (let y = 0; y < document.documentElement.scrollHeight; y += innerHeight * 0.7) { scrollTo(0, y); await new Promise(r => setTimeout(r, 60)); }
    scrollTo(0, y0); await new Promise(r => setTimeout(r, 300));
  });
  const shot = async (n, full = true) => { await overflow(n); if (full) await revealAll(); await p.screenshot({ path: `${SC}/${tag}-${n}.png`, fullPage: full }); };
  const visit = async (hash, n) => { await p.goto(BASE + hash); await p.waitForTimeout(500); await p.evaluate(() => window.scrollTo(0, 0)); };

  // Écran de chargement : visible tant que le JavaScript n'est pas arrivé, retiré ensuite.
  if (!opts.reduced) {
    await p.route(/\/assets\/index-.*\.js$/, async r => { await new Promise(x => setTimeout(x, 1500)); r.continue().catch(() => {}); });
    await p.goto(BASE, { waitUntil: "commit" });
    await p.waitForTimeout(400);
    check(await p.locator("#rp-loader").isVisible(), `[${tag}] écran de chargement non visible avant le JavaScript`);
    await p.screenshot({ path: `${SC}/${tag}-00-chargement.png` });
    await p.waitForSelector("#rp-loader", { state: "detached", timeout: 8000 }).catch(() => check(false, `[${tag}] écran de chargement non retiré`));
    await p.unroute(/\/assets\/index-.*\.js$/);
  }

  // Code d'essai ouvert par lien sur un navigateur neuf (localStorage vide) : écran d'accord de Camille
  await p.goto(BASE + "#/"); await p.evaluate(() => { localStorage.clear(); });
  await p.goto(BASE + "?neuf=1#/s/REPETE"); await p.waitForTimeout(600); // nouveau chargement de page, stockage vide
  check(await p.getByRole("heading", { name: "Avant de commencer" }).count() === 1 && await p.getByText("Bonjour Camille").count() > 0, `[${tag}] #/s/REPETE sur un navigateur neuf : écran d'accord de Camille absent`);
  check(await p.getByText(/Ce code ne fonctionne pas|n'existe pas/).count() === 0, `[${tag}] #/s/REPETE sur un navigateur neuf : message d'erreur de code affiché`);
  await shot("00b-repete-accord", false);
  /* Bug de parcours : connecté côté personne accompagnée, « Je lance mon premier entraînement » mène à son espace,
     jamais à la page de connexion. */
  await visit("#/");
  await p.getByRole("button", { name: "Je lance mon premier entraînement" }).click(); await p.waitForTimeout(900);
  check(p.url().endsWith("#/s/REPETE") || p.url().includes("#/s/REPETE/"), `[${tag}] session de la personne accompagnée : « Je lance mon premier entraînement » ne mène pas à son espace (${p.url()})`);
  await p.evaluate(() => { localStorage.clear(); });
  await p.goto(BASE + "?fin=1#/"); await p.evaluate(() => { localStorage.clear(); }); await p.goto(BASE + "#/"); await p.waitForTimeout(300); // fin de la session gardée en mémoire

  // Accueil
  await visit("#/", "accueil");
  check(await p.locator("#rp-loader").count() === 0, `[${tag}] écran de chargement encore présent`);
  check(await p.getByRole("heading", { level: 1 }).first().textContent().then(t => t.includes("Entraînez-vous pour votre entretien")), `[${tag}] titre du héros absent`);
  await p.getByRole("button", { name: "Je lance mon premier entraînement" }).waitFor();
  /* Accueil (demandes du propriétaire) : héros sans « Voir comment ça marche » ni ligne sur le compte, pastille
     « Sans avatar », bandeau en quatre engagements, phrase juste sous le bandeau, pas de mini FAQ. */
  const homeTxt = (await p.locator("main").innerText()).replace(/[\u00A0\u202F]/g, " ");
  check(await p.getByRole("button", { name: "Voir comment ça marche" }).count() === 0 && !homeTxt.includes("Pas de compte à créer"), `[${tag}] accueil : bouton « Voir comment ça marche » ou ligne « Pas de compte à créer » encore présents`);
  check(["Avec votre coach", "Assisté par IA", "Sans avatar"].every(t => homeTxt.includes(t)) && !/\bSans note\b|Assistant IA\n|Lancer ma première répétition/.test(homeTxt), `[${tag}] accueil : pastilles « Avec votre coach », « Assisté par IA », « Sans avatar » attendues`);
  check(/entraînez-vous autant de fois que vous voulez/.test(homeTxt) && /propose des pistes/.test(homeTxt) && /ce qui a changé/.test(homeTxt) && !/\banalyse votre réponse\b/i.test(homeTxt), `[${tag}] accueil : sous-titre du héros (entraînement sans avatar, pistes, ce qui a changé, sans note) attendu`);
  const reassure = await p.locator(".rs-reassure li").allInnerTexts();
  check(["Sans frais pour vous", "Démarrage rapide", "Sécurisé", "Confidentiel"].every((t, i) => (reassure[i] || "").startsWith(t)), `[${tag}] accueil : bandeau des quatre engagements attendu (${JSON.stringify(reassure)})`);
  check(await p.locator("main").evaluate(m => { const r = m.querySelector(".rs-reassure"), ph = m.querySelector(".rs-phrase, .rs-phrase-r"), st = m.querySelector("#comment-ca-marche"); return !!(r && ph && st && (r.compareDocumentPosition(ph) & 4) && (ph.compareDocumentPosition(st) & 4)); }), `[${tag}] accueil : la phrase doit suivre le bandeau et précéder la strate`);
  check(await p.locator("#home-faq-0, [id^=home-faq]").count() === 0 && !homeTxt.includes("Avant de commencer"), `[${tag}] accueil : la mini FAQ doit être retirée`);
  if (!mobile) {
    const hb = await p.locator("header").getByRole("button", { name: "Nous contacter" }).evaluate(el => { const c = getComputedStyle(el), r = el.getBoundingClientRect(); return { bg: c.backgroundColor, bw: c.borderTopWidth, h: r.height }; });
    check(hb.bg === "rgba(0, 0, 0, 0)" && hb.bw === "0px" && hb.h >= 44, `[${tag}] en-tête : « Nous contacter » doit être un lien d'en-tête sans fond ni bordure, de 44 px (${JSON.stringify(hb)})`);
  }
  await shot("01-accueil", false);
  /* Indicateur des scènes (demande du propriétaire) : masqué sous la photo par défaut ; il apparaît au survol de la
     photo (au toucher sur écran tactile) et au focus clavier, et reste atteignable au clavier. */
  const dot = p.getByRole("button", { name: /Scène 2 sur 4/ });
  const navOp = () => p.locator(".rs-stage-nav").evaluate(n => +getComputedStyle(n).opacity);
  await p.mouse.move(2, vh - 2); await p.waitForTimeout(900);
  check(await navOp() === 0, `[${tag}] indicateur des scènes : il doit être masqué tant que la photo n'est pas survolée`);
  const photo = p.locator(".rs-stage .rs-scene.on img");
  if (mobile) await photo.tap(); else await photo.hover();
  await p.waitForTimeout(900);
  check(await navOp() === 1, `[${tag}] indicateur des scènes : il doit apparaître au ${mobile ? "toucher" : "survol"} de la photo`);
  if (!mobile) {
    await p.mouse.move(2, vh - 2); await p.waitForTimeout(900);
    check(await navOp() === 0, `[${tag}] indicateur des scènes : il doit s'effacer quand le pointeur quitte la photo`);
    await dot.focus(); await p.waitForTimeout(900);
    check(await navOp() === 1, `[${tag}] indicateur des scènes : il doit apparaître au focus clavier`);
  }
  await dot.click(); await p.waitForTimeout(700);
  check(await dot.getAttribute("aria-current") === "true", `[${tag}] le point de navigation des scènes ne change pas la scène`);
  await shot("01a-heros-scene2", false);
  await shot("01z-accueil-complet");
  /* Fond de l'accueil (souris) : rien ne suit le pointeur ; le violet et le bleu reçoivent toujours des décalages
     opposés (transform seulement) : ils glissent en sens contraires quand la souris traverse l'écran et s'écartent
     du pointeur quand il s'approche de l'un d'eux. En mouvement réduit, rien ne bouge. */
  if (!mobile) {
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    const masses = () => p.evaluate(() => ["i", "b"].map(s => { const m = new DOMMatrix(getComputedStyle(document.querySelector(".rs-glow " + s)).transform); return [m.m41, m.m42]; }));
    const at = async (x, y) => { await p.mouse.move(x, y, { steps: 6 }); await p.waitForTimeout(1500); return masses(); };
    check(await p.locator(".rs-glow *").count() === 3, `[${tag}] fond de l'accueil : aucun élément ne doit suivre le pointeur (deux masses dans leur conteneur de dérive)`);
    const pos = { centre: await at(vw / 2, vh / 2), gauche: await at(20, vh / 2), droite: await at(vw - 20, vh / 2), haut: await at(vw / 2, 100), bas: await at(vw / 2, vh - 20) };
    const rel = k => pos[k].map((m, i) => [m[0] - pos.centre[i][0], m[1] - pos.centre[i][1]]);
    if (opts.reduced) check(Object.keys(pos).every(k => rel(k).flat().every(v => v === 0)), `[${tag}] fond de l'accueil : rien ne doit bouger en mouvement réduit (${JSON.stringify(pos)})`);
    else {
      const [g, d, h, bas] = ["gauche", "droite", "haut", "bas"].map(rel);
      check([g, d, h, bas].every(([v, b]) => Math.abs(v[0] + b[0]) < 2 && Math.abs(v[1] + b[1]) < 2), `[${tag}] fond de l'accueil : le violet et le bleu ne reçoivent pas des décalages opposés (${JSON.stringify(pos)})`);
      check(d[0][0] - g[0][0] > 40 && d[1][0] - g[1][0] < -40, `[${tag}] fond de l'accueil : le violet et le bleu ne glissent pas en sens contraires quand la souris va de gauche à droite (${JSON.stringify([g, d])})`);
      check(h[0][1] < -15 && h[1][1] > 15, `[${tag}] fond de l'accueil : souris en haut, le violet doit monter et le bleu descendre (${JSON.stringify(h)})`);
      check(bas[1][0] < -15 && bas[1][1] > 0 && bas[0][0] > 15 && bas[0][1] < 0, `[${tag}] fond de l'accueil : souris en bas, le bleu doit s'écarter vers le bas à gauche et le violet vers le haut à droite (${JSON.stringify(bas)})`);
      check([g, d, h, bas].every(([v]) => Math.abs(v[0]) <= vw * 0.3 && Math.abs(v[1]) <= vh * 0.3), `[${tag}] fond de l'accueil : amplitude trop forte (${JSON.stringify(pos)})`);
      /* Le fond doit bouger nettement (demande du propriétaire : « le fond ne bouge plus ») : de la gauche à la droite
         de l'écran, chaque masse parcourt au moins 18 % de la largeur ; et à l'écran (contenu masqué, fond seul),
         l'image change en moyenne d'au moins 5 niveaux sur 255 (ancien réglage, imperceptible : 3,6). */
      check(Math.abs(d[0][0] - g[0][0]) >= vw * 0.18 && Math.abs(d[1][0] - g[1][0]) >= vw * 0.18, `[${tag}] fond de l'accueil : déplacement trop faible pour se voir (${JSON.stringify([g, d])})`);
      const fondSeul = await p.addStyleTag({ content: "body *{visibility:hidden!important}.rs-glow,.rs-glow *{visibility:visible!important}" });
      await p.mouse.move(20, vh / 2, { steps: 6 }); await p.waitForTimeout(1500); const imgG = await p.screenshot();
      await p.mouse.move(vw - 20, vh / 2, { steps: 6 }); await p.waitForTimeout(1500); const imgD = await p.screenshot();
      await fondSeul.evaluate(s => s.remove());
      const ecart = pngDiff(imgG, imgD);
      check(ecart.moyenne >= 5 && ecart.part >= 0.3, `[${tag}] fond de l'accueil : il ne bouge pas assez à l'écran (écart moyen ${ecart.moyenne.toFixed(2)}, ${(100 * ecart.part).toFixed(0)} % des pixels)`);
      await shot("01y-accueil-souris", false);
    }
    await p.mouse.move(vw / 2, vh / 2);
  }

  if (!opts.reduced) {
    // Phrase qui se colore
    const ph = p.locator("section.rs-phrase");
    const phTop = await ph.evaluate(el => el.getBoundingClientRect().top + scrollY);
    const phH = await ph.evaluate(el => el.offsetHeight);
    await p.evaluate(y => scrollTo(0, y), phTop + phH * 0.15); await p.waitForTimeout(400);
    await shot("02a-phrase-debut", false);
    await p.evaluate(y => scrollTo(0, y), phTop + phH * 0.55); await p.waitForTimeout(400);
    await shot("02b-phrase-fin", false);
    // Strate épinglée : le panneau reste en place, l'étape active change
    const st = p.locator("section.rs-strate");
    const top = await st.evaluate(el => el.getBoundingClientRect().top + scrollY);
    const h = await st.evaluate(el => el.offsetHeight);
    const range = h - vh;
    const seen = [];
    for (const [i, f] of [[1, 0.1], [2, 0.38], [3, 0.63], [4, 0.9]]) {
      await p.evaluate(y => scrollTo(0, y), top + range * f); await p.waitForTimeout(1100);
      const panelTop = await p.locator(".rs-panel").evaluate(el => Math.round(el.getBoundingClientRect().top));
      check(panelTop <= 64 && panelTop >= 50, `[${tag}] strate : panneau non épinglé (top ${panelTop})`);
      seen.push(await p.locator(".rs-vis.on").count());
      const label = mobile ? await p.locator(".rs-tabs-m span").filter({ hasText: /^Étape/ }).first().textContent()
        : await p.locator(".rs-step.on").textContent();
      check(label.includes(["S'entraîner", "Recevoir un retour", "Envoyer", "En parler"][i - 1]), `[${tag}] strate : étape ${i} attendue, lu « ${label.slice(0, 40)} »`);
      await shot(`03-strate-etape${i}`, false);
    }
    // Cartes animées (défilement horizontal sur mobile, sans débordement de page)
    await p.locator(".rs-fcards").scrollIntoViewIfNeeded(); await p.waitForTimeout(800);
    check(await p.locator(".rs-fcard.play").count() > 0, `[${tag}] cartes animées : aucune animation active alors qu'elles sont visibles`);
    await shot("04-cartes", false);
  } else {
    check(await p.locator("section.rs-strate").count() === 0, `[${tag}] mouvement réduit : la strate devrait être remplacée par des sections empilées`);
    check(await p.locator(".rs-fcard.play").count() === 0, `[${tag}] mouvement réduit : cartes animées actives`);
  }

  // Menu mobile
  if (mobile) {
    await visit("#/", "menu");
    await p.getByRole("button", { name: "Mon compte" }).first().waitFor();
    const burger = p.getByRole("button", { name: "Ouvrir le menu" });
    await burger.click();
    const dlg = p.getByRole("dialog", { name: "Menu" });
    await dlg.waitFor(); await p.waitForTimeout(350);
    await shot("05-menu-mobile", false);
    await p.keyboard.press("Escape");
    check(await dlg.count() === 0, `[${tag}] le menu ne se ferme pas avec Échap`);
    await burger.click();
    await dlg.getByRole("link", { name: "Solutions" }).click(); await p.waitForTimeout(400);
    check(p.url().endsWith("#/solutions"), `[${tag}] le lien Solutions du menu ne mène pas à #/solutions`);
    check(await p.getByRole("dialog", { name: "Menu" }).count() === 0, `[${tag}] le menu reste ouvert après navigation`);
  } else {
    await visit("#/", "nav");
    await p.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: "Ressources" }).click(); await p.waitForTimeout(300);
    check(p.url().endsWith("#/ressources"), `[${tag}] lien Ressources de l'en-tête`);
    check(await p.getByRole("button", { name: "Nous contacter" }).first().isVisible(), `[${tag}] bouton « Nous contacter » absent`);
  }

  // Anciennes adresses : toutes redirigées vers la nouvelle carte du site (src/app/router.js, REDIRECTS)
  for (const [from, to] of [["#/fonctionnement", "#/solutions/fonctionnalites"], ["#/solutions/demandeurs-emploi", "#/cas-d-usage/beneficiaires/demandeurs-emploi"],
    ["#/solutions/collaborateurs", "#/cas-d-usage/beneficiaires/collaborateurs"], ["#/solutions/coachs", "#/cas-d-usage/coachs"], ["#/solutions/commanditaires", "#/cas-d-usage/commanditaires"],
    ["#/solutions/organismes", "#/cas-d-usage/commanditaires"], ["#/solutions/beneficiaires", "#/cas-d-usage/beneficiaires/demandeurs-emploi"], ["#/a-propos/faq", "#/ressources/faq"],
    ["#/a-propos/ia-et-recherche", "#/solutions/recherche"], ["#/ressources/c/coachs", "#/ressources"]]) {
    await visit(from);
    check(p.url().endsWith(to), `[${tag}] ${from} ne redirige pas vers ${to} (${p.url()})`);
    check(await p.getByRole("heading", { name: "Page introuvable" }).count() === 0, `[${tag}] ${from} : page introuvable`);
  }
  // Solutions : page d'entrée et sous-pages
  await visit("#/solutions"); await shot("06-solutions");
  for (const [h, t] of [["#/solutions/usage-de-l-ia", "Usage de l'IA"], ["#/solutions/recherche", "Recherche en accompagnement"], ["#/solutions/fonctionnalites", "Fonctionnalités"],
    ["#/solutions/methode", "Méthode : comment l'outil sert l'accompagnement"],
    ["#/cas-d-usage", "Un accompagnement outillé, pour chaque public"], ["#/cas-d-usage/beneficiaires", "Personnes accompagnées"], ["#/cas-d-usage/coachs", "Coachs"], ["#/cas-d-usage/commanditaires", "Commanditaires"], ["#/ressources/faq", "Questions fréquentes"]]) {
    await visit(h);
    const h1 = ((await p.getByRole("heading", { level: 1 }).first().textContent()) || "").replace(/[\u00A0\u202F]/g, " ");
    check(h1.trim() === t, `[${tag}] ${h} : titre « ${t} » attendu, lu « ${h1.trim()} »`);
    check((await p.title()).endsWith("· La Répét'"), `[${tag}] ${h} : titre d'onglet sans « · La Répét' » (${await p.title()})`);
    await shot(`06-${h.replace(/[#/]+/g, "-").replace(/^-|-$/g, "")}`);
  }
  // Cas d'usage : sections par public, onglets des commanditaires
  await visit("#/cas-d-usage/beneficiaires");
  for (const id of ["demandeurs-emploi", "collaborateurs"]) check(await p.locator(`#${id}`).count() === 1, `[${tag}] Personnes accompagnées : section #${id} absente`);
  await visit("#/cas-d-usage/commanditaires");
  const tab = p.getByRole("tab", { name: "Entreprises" });
  await tab.click();
  check(await tab.getAttribute("aria-selected") === "true", `[${tag}] onglet Entreprises non sélectionné`);
  await p.keyboard.press("ArrowRight");
  check(await p.getByRole("tab", { name: "Cadre et données" }).getAttribute("aria-selected") === "true", `[${tag}] onglets : la flèche droite ne change pas d'onglet`);
  /* Repositionnement : publics de l'organisme, aucun discours de logiciel vendu, moteur d'IA jamais nommé. */
  for (const h of ["#/solutions", "#/solutions/usage-de-l-ia", "#/solutions/methode", "#/a-propos", "#/cas-d-usage", "#/cas-d-usage/commanditaires"]) {
    await visit(h);
    check(!/licence|abonnement|tarif|équipez votre structure|Claude|Anthropic/i.test(await p.locator("main").innerText()), `[${tag}] ${h} : discours de logiciel ou nom du fournisseur d'IA`);
  }

  // À propos (organisme d'exemple, signalé comme tel) et FAQ (page dédiée, sections ancrées)
  await visit("#/a-propos"); await shot("07-a-propos");
  check(await p.getByText("Texte d'exemple.").count() === 1, `[${tag}] À propos : encart « Texte d'exemple » absent`);
  check(await p.locator("#faq").count() === 0, `[${tag}] À propos : la FAQ doit être sur sa propre page`);
  /* Page organisme : son expertise d'accompagnement (approche, méthode en sept étapes, références…), et un renvoi vers
     Solutions pour ce qui concerne l'outil. Aucune note ni score dans le texte. */
  for (const id of ["approche", "methode", "accompagnements", "references", "equipe", "commanditaires", "outil"]) check(await p.locator(`main #${id}`).count() === 1, `[${tag}] À propos : section #${id} absente`);
  check(await p.locator("#methode ol > li").count() === 7, `[${tag}] À propos : la méthode doit compter sept étapes`);
  const aboutTxt = await p.locator("main").innerText();
  check(!/\bscore|\/\s?10\b|\bnoté/i.test(aboutTxt), `[${tag}] À propos : vocabulaire de notation`);
  await p.getByRole("button", { name: "Lire la méthode outillée" }).click(); await p.waitForTimeout(600);
  check(p.url().endsWith("#/solutions/methode"), `[${tag}] À propos : le bouton « Lire la méthode outillée » ne mène pas à #/solutions/methode (${p.url()})`);
  check(await p.locator("main ol > li").count() >= 12, `[${tag}] Méthode : les cinq temps et les sept étapes doivent être listés`);
  /* Méthode et Recherche : contenu attendu (retour qui décrit, rôle du coach, références) ; références justes sur
     les trois pages. Apparition au défilement sur À propos, Recherche et Méthode : tous les blocs, éléments de liste
     compris (Reveal as="li"), avec des délais décalés ; en mouvement réduit, tout est visible sans attendre. */
  for (const id of ["Pourquoi le retour décrit au lieu de noter", "Le rôle irremplaçable du coach"]) check(await p.getByRole("heading", { name: id }).count() === 1, `[${tag}] Méthode : section « ${id} » absente`);
  const refs = { "#/a-propos": ["Clot", "Vermersch", "Rogers", "Le Bossé", "Bandura", "Schön", "Hattie"], "#/solutions/recherche": ["Ericsson", "Dowrick", "Kluger", "Hattie", "Bandura", "Kanfer", "Liu", "Schön", "Baldwin"], "#/solutions/methode": ["Bandura", "Clot", "Hattie", "Schön"] };
  for (const [h, names] of Object.entries(refs)) {
    await visit(h);
    const txt = await p.locator("main").innerText();
    names.forEach(n => check(txt.includes(n), `[${tag}] ${h} : référence ${n} absente`));
    check(!/\bscore|\/\s?10\b|\bnoté/i.test(txt), `[${tag}] ${h} : vocabulaire de notation`);
    const rv = await p.evaluate(() => { const els = [...document.querySelectorAll("main .rv")]; return { n: els.length, li: els.filter(e => e.tagName === "LI").length }; });
    check(rv.n >= 20 && rv.li >= 3, `[${tag}] ${h} : blocs ou éléments de liste sans apparition (${JSON.stringify(rv)})`);
    await p.evaluate(async () => { const H = document.documentElement.scrollHeight; for (let y = 0; y <= H; y += innerHeight * 0.4) { scrollTo(0, y); await new Promise(r => setTimeout(r, 120)); } scrollTo(0, H); await new Promise(r => setTimeout(r, 300)); });
    await p.waitForTimeout(opts.reduced ? 300 : 1500);
    const hidden = await p.evaluate(() => [...document.querySelectorAll("main .rv:not(.is-in)")].map(e => (e.textContent || "").trim().slice(0, 30)));
    check(hidden.length === 0, `[${tag}] ${h} : ${hidden.length} bloc(s) jamais apparu(s) après défilement (${hidden.slice(0, 3).join(" | ")})`);
    const delays = await p.evaluate(() => [...new Set([...document.querySelectorAll("main .rv.is-in")].map(e => e.style.transitionDelay))]);
    check(delays.length >= 3, `[${tag}] ${h} : pas de décalage entre les apparitions (${delays.join(", ")})`);
  }
  await p.goto(BASE + "#/ressources/faq/coachs"); await p.waitForTimeout(1600);
  const faqTop = await p.locator("#coachs").evaluate(el => Math.round(el.getBoundingClientRect().top));
  check(faqTop < 200, `[${tag}] #/ressources/faq/coachs ne défile pas jusqu'à la section Coachs (${faqTop})`);
  await visit("#/ressources/faq");
  const q = p.getByRole("button", { name: "Faut-il créer un compte ?" });
  await q.click();
  check(await q.getAttribute("aria-expanded") === "true", `[${tag}] FAQ : le dépliant ne s'ouvre pas`);
  await q.focus(); await p.keyboard.press("Enter");
  check(await q.getAttribute("aria-expanded") === "false", `[${tag}] FAQ : Entrée ne referme pas le dépliant`);
  await p.keyboard.press(" ");
  check(await q.getAttribute("aria-expanded") === "true", `[${tag}] FAQ : Espace n'ouvre pas le dépliant`);
  /* Recherche : section « Une voix, pas d'avatar » (choix assumé, huit raisons avec leur limite), sans affirmer
     qu'une voix seule intimide moins ; la FAQ a une question sur l'avatar. */
  await visit("#/solutions/recherche");
  const voiceTxt = (await p.locator("#sans-avatar").innerText()).replace(/[  ]/g, " ");
  check(/Une voix, pas d'avatar : un choix assumé/.test(voiceTxt) && await p.locator("#sans-avatar ol > li").count() === 8 && (voiceTxt.match(/Limite/g) || []).length === 8, `[${tag}] Recherche : section « Une voix, pas d'avatar » avec huit raisons et leurs limites attendue`);
  const rechTxt = (await p.locator("main").innerText()).replace(/[  ]/g, " ");
  check(!/Une voix seule intimide moins\./.test(rechTxt) && /Aucune étude ne compare/.test(rechTxt) && !/plus efficace/.test(rechTxt), `[${tag}] Recherche : pas d'affirmation non sourcée sur l'avatar`);
  await visit("#/ressources/faq");
  check(await p.getByRole("button", { name: /Pourquoi n'y a-t-il pas d'avatar/ }).count() === 1, `[${tag}] FAQ : question « Pourquoi n'y a-t-il pas d'avatar ? » attendue`);
  await shot("08-faq", false);

  // Ressources : hub, recherche, filtre, catégorie, articles
  await visit("#/ressources"); await shot("09-ressources");
  check(await p.getByText("Les mots de La Répét'").count() === 0, `[${tag}] ressources : le glossaire doit être retiré`);
  check(await p.getByRole("heading", { name: "Par thème" }).count() === 0, `[${tag}] ressources : le titre « Par thème » doit être retiré`);
  check(await p.locator("main a[href^='#/ressources/c/']").count() === 0, `[${tag}] ressources : aucun lien de catégorie ne doit rester`);
  const une = await p.getByRole("heading", { name: "Pour bien commencer" }).boundingBox();
  check(une && une.y < (mobile ? 844 : 900), `[${tag}] ressources : « À la une » doit apparaître sous la recherche, sans défiler (${une && Math.round(une.y)})`);
  const sb = p.getByRole("combobox", { name: "Rechercher une ressource" });
  await sb.fill("visio"); await p.waitForTimeout(200);
  check(await p.getByRole("link", { name: /Réussir un entretien en visio/ }).count() > 0, `[${tag}] recherche « visio » sans résultat`);
  // Suggestions : sans accents, flèches, Échap, Entrée ouvre l'article
  await sb.fill("presenter"); await p.waitForTimeout(200);
  const opt = p.getByRole("listbox", { name: "Ressources suggérées" }).getByRole("option");
  check(await opt.count() > 0, `[${tag}] recherche : aucune suggestion pour « presenter »`);
  await shot("09b-suggestions", false);
  await sb.press("Escape");
  check(await p.getByRole("listbox", { name: "Ressources suggérées" }).count() === 0, `[${tag}] recherche : Échap ne ferme pas les suggestions`);
  await sb.press("ArrowDown"); await sb.press("Enter"); await p.waitForTimeout(400);
  check(/#\/ressources\/[a-z0-9-]+$/.test(p.url()) && !p.url().includes("/c/"), `[${tag}] recherche : Entrée sur une suggestion n'ouvre pas l'article (${p.url()})`);
  await visit("#/ressources");
  await sb.fill("");
  await p.getByRole("group", { name: "Filtrer par thème" }).getByRole("button", { name: "Pour les coachs" }).click();
  check((await p.locator("#toutes a.rs-card-btn").count()) >= 1, `[${tag}] filtre par thème sans résultat`);
  /* Ancienne page de catégorie : la page Ressources, thème présélectionné. */
  await p.goto(BASE + "#/ressources/c/coachs"); await p.waitForTimeout(400);
  check(await p.getByRole("group", { name: "Filtrer par thème" }).getByRole("button", { name: "Pour les coachs" }).getAttribute("aria-pressed") === "true", `[${tag}] #/ressources/c/coachs : thème « Pour les coachs » non présélectionné`);
  await shot("10-categorie");
  await p.locator("#toutes a.rs-card-btn[href='#/ressources/scenario-atelier-collectif']").click(); await p.waitForTimeout(400);
  check(p.url().includes("#/ressources/scenario-atelier-collectif"), `[${tag}] clic sur la carte : article non ouvert`);
  check(await p.getByText("Scénario type").count() > 0, `[${tag}] scénario d'usage : mention « Scénario type » absente`);
  await shot("11-article-cas");
  await visit("#/ressources/se-presenter-en-deux-minutes");
  check(await p.getByRole("navigation", { name: "Sommaire de l'article" }).count() === 1, `[${tag}] article guide : sommaire absent`);
  await shot("12-article-guide");
  await visit("#/ressources/inexistant");
  check(await p.getByRole("heading", { name: "Cette ressource est introuvable" }).count() === 1, `[${tag}] article inconnu : message absent`);

  // Nous contacter (formulaire destiné aux commanditaires : acteurs publics, entreprises)
  await visit("#/demo"); await shot("13-demo");
  const status = p.getByTestId("demo-status");
  const DEMO_MSG = "Aucune demande envoyée, version de démonstration";
  check(await p.getByRole("checkbox").count() === 0, `[${tag}] formulaire : aucune case de recontact ne doit être obligatoire`);
  check(await p.getByRole("radio", { name: "Acteur public" }).count() === 1 && await p.getByRole("radio", { name: "Entreprise" }).count() === 1, `[${tag}] formulaire : type de structure absent`);
  check((await p.locator("main").innerText()).indexOf(DEMO_MSG) < 0, `[${tag}] formulaire : le message de démonstration ne doit pas s'afficher avant l'envoi`);
  await p.getByRole("button", { name: "Envoyer ma demande" }).click();
  check(await p.locator("[role=alert]").count() >= 3, `[${tag}] formulaire : erreurs non signalées`);
  check((await status.textContent()) === "", `[${tag}] formulaire : message de démonstration affiché alors que des champs manquent`);
  await shot("13b-demo-erreurs", false);
  await p.getByLabel("Votre nom", { exact: true }).fill("Alex Martin");
  await p.getByLabel("Nom de votre structure").fill("Structure d'exemple");
  await p.getByLabel("Adresse électronique").fill("alex.martin@exemple.fr");
  await p.getByLabel("Public accompagné").selectOption({ index: 1 });
  await p.getByRole("button", { name: "Envoyer ma demande" }).click(); await p.waitForTimeout(300);
  /* Le formulaire n'envoie rien : au clic, après validation, le message de statut le dit, mot pour mot. */
  check(await status.getAttribute("role") === "status" && (await status.textContent()) === DEMO_MSG, `[${tag}] formulaire : message « ${DEMO_MSG} » absent après l'envoi`);
  check(p.url().endsWith("#/demo"), `[${tag}] formulaire : la page ne doit pas changer`);
  check(!/recontact|enregistrée|est envoyée|Copier ma demande/i.test(await p.locator("main").innerText()), `[${tag}] formulaire : aucun envoi ni copie ne doit être annoncé`);
  await shot("14-demo-confirmation");

  // Pied de page : liens vers les questions fréquentes et les pages « Vos données »
  await visit("#/");
  await p.locator("footer").getByRole("link", { name: "Questions fréquentes" }).click(); await p.waitForTimeout(400);
  check(p.url().endsWith("#/ressources/faq"), `[${tag}] lien « Questions fréquentes » du pied de page (${p.url()})`);
  await visit("#/");
  await p.locator("footer").getByRole("link", { name: "Accessibilité : non conforme" }).click(); await p.waitForTimeout(400);
  check(p.url().endsWith("#/accessibilite"), `[${tag}] lien « Accessibilité : non conforme » du pied de page`);

  // Pages « Vos données » et pages légales : titre, titre du document, pas de valeur inventée
  const LEGAL = [["#/vos-donnees", "Vos données, vos choix"], ["#/vos-donnees/video", "Que devient ma vidéo ?"], ["#/vos-donnees/assistant", "Ce que fait l'assistant, et ce qu'il ne fait pas"],
    ["#/vos-donnees/droits", "Vos droits"], ["#/vos-donnees/appareil", "Ce qui est gardé sur cet appareil"], ["#/vos-donnees/notice", "Information complète sur vos données"],
    ["#/vos-donnees/coachs", "Coachs : vos données"], ["#/conditions", "Règles d'utilisation"], ["#/mentions-legales", "Mentions légales"], ["#/accessibilite", "Accessibilité"]];
  const plain = x => x.replace(/[\u00A0\u202F]/g, " "); // espaces insécables de la typographie française (RED-11)
  for (const [h, t] of LEGAL) {
    await visit(h);
    const h1 = plain((await p.getByRole("heading", { level: 1 }).first().textContent()) || "");
    check(h1.trim() === t, `[${tag}] ${h} : titre « ${t} » attendu, lu « ${h1.trim()} »`);
    check(plain(await p.title()).startsWith(t), `[${tag}] ${h} : titre du document non mis à jour (${await p.title()})`);
    await overflow(h);
    const body = await p.locator("main").innerText();
    check(!/prototype|à compléter|version d'essai/i.test(body), `[${tag}] ${h} : mention de prototype ou de champ à compléter visible`);
  }
  await visit("#/vos-donnees"); await shot("15-vos-donnees");
  await visit("#/vos-donnees/notice"); await shot("16-notice");
  check(await p.getByText("À compléter").count() === 0, `[${tag}] notice : « À compléter » ne doit jamais s'afficher`);
  await visit("#/accessibilite");
  check(await p.getByText(/non conforme/).count() > 0, `[${tag}] déclaration d'accessibilité : mention « non conforme » absente`);
  await shot("17-accessibilite");

  // Un seul en-tête de page : le titre est au même endroit sur À propos, Solutions, Ressources, Démo et Vos données
  const pos = [];
  for (const h of ["#/a-propos", "#/solutions", "#/ressources", "#/demo", "#/vos-donnees"]) {
    await visit(h); await p.waitForTimeout(500);
    const b = await p.getByRole("heading", { level: 1 }).first().boundingBox();
    pos.push([h, Math.round(b.x), Math.round(b.y)]);
  }
  check(pos.every(([, x, y]) => Math.abs(x - pos[0][1]) <= 1 && Math.abs(y - pos[0][2]) <= 1), `[${tag}] titres de page à des positions différentes : ${JSON.stringify(pos)}`);

  // Navigation à deux niveaux : sous-menu au clic et au clavier, accordéons sur mobile
  if (!mobile) {
    await visit("#/");
    const sub = p.getByRole("button", { name: "Sous-menu Solutions" });
    await sub.click();
    check(await sub.getAttribute("aria-expanded") === "true", `[${tag}] sous-menu : aria-expanded non mis à jour`);
    await shot("22-sous-menu", false);
    /* Un seul sous-menu à la fois : ouvrir « Cas d'usage » ferme « Solutions » dans la même image. */
    await p.getByRole("button", { name: "Sous-menu Cas d'usage" }).click();
    check(await p.locator(".rp-submenu:not([hidden])").count() === 1 && await sub.getAttribute("aria-expanded") === "false", `[${tag}] sous-menus : deux sous-menus ouverts en même temps`);
    await p.keyboard.press("Escape");
    check(await p.locator(".rp-submenu:not([hidden])").count() === 0, `[${tag}] sous-menu : Échap ne ferme pas`);
    /* Survol : délai d'intention, puis passage d'un menu à l'autre sans chevauchement. */
    const bx = async n => p.getByRole("navigation", { name: "Navigation principale" }).getByRole("link", { name: n, exact: true }).boundingBox();
    const sol = await bx("Solutions"), cas = await bx("Cas d'usage"), res = await bx("Ressources");
    await p.mouse.move(sol.x + 10, sol.y + sol.height / 2); await p.waitForTimeout(40);
    check(await p.locator(".rp-submenu:not([hidden])").count() === 0, `[${tag}] survol : le sous-menu s'ouvre sans délai d'intention`);
    await p.waitForTimeout(300);
    check(await p.locator("#sub-solutions:not([hidden])").count() === 1, `[${tag}] survol : le sous-menu Solutions ne s'ouvre pas`);
    let maxOpen = 0;
    for (const b of [cas, res, sol]) {
      await p.mouse.move(b.x + 10, b.y + b.height / 2, { steps: 6 });
      for (let k = 0; k < 4; k++) { maxOpen = Math.max(maxOpen, await p.locator(".rp-submenu:not([hidden])").count()); await p.waitForTimeout(30); }
    }
    check(maxOpen === 1, `[${tag}] survol : ${maxOpen} sous-menus visibles en même temps`);
    await p.mouse.move(600, 500); await p.waitForTimeout(500);
    check(await p.locator(".rp-submenu:not([hidden])").count() === 0, `[${tag}] survol : le sous-menu reste ouvert après la sortie de la souris`);
    await sub.focus(); await p.keyboard.press("ArrowDown"); await p.waitForTimeout(100); await p.keyboard.press("ArrowDown");
    await p.keyboard.press("Enter"); await p.waitForTimeout(900);
    check(p.url().endsWith("#/solutions/recherche"), `[${tag}] sous-menu au clavier : « Recherche en accompagnement » non ouverte (${p.url()})`);
    check(((await p.getByRole("heading", { level: 1 }).first().textContent()) || "").includes("Recherche en accompagnement"), `[${tag}] page « Recherche en accompagnement » absente`);
    await shot("23-recherche");
  } else {
    await visit("#/");
    await p.getByRole("button", { name: "Ouvrir le menu" }).click();
    const dlg = p.getByRole("dialog", { name: "Menu" });
    await dlg.getByRole("button", { name: "Sous-menu Solutions" }).click();
    check(await dlg.getByRole("link", { name: "Usage de l'IA" }).isVisible(), `[${tag}] menu mobile : l'accordéon Solutions ne s'ouvre pas`);
    await shot("22-menu-accordeon", false);
    await p.keyboard.press("Escape");
  }

  // Lien interne à la page : défilement doux sous l'en-tête, puis focus sur la cible
  await visit("#/ressources/se-presenter-en-deux-minutes");
  const toc = p.getByRole("navigation", { name: "Sommaire de l'article" }).getByRole("link");
  if (await toc.count() > 1) {
    const target = await toc.nth(1).textContent();
    await toc.nth(1).click(); await p.waitForTimeout(1200);
    const r = await p.evaluate(() => { const el = document.activeElement; const b = el.getBoundingClientRect(); return { top: Math.round(b.top), tag: el.tagName, text: el.textContent }; });
    check(r.top >= 40 && r.top < 200 && r.text.trim() === target.trim(), `[${tag}] sommaire : cible non atteinte ou sans focus (${JSON.stringify(r)})`);
  }

  // Changement de page en fondu : plusieurs navigations et retour arrière sans erreur, haut de page atteint
  for (const h of ["#/solutions", "#/a-propos", "#/ressources"]) { await p.evaluate(x => { location.hash = x; }, h); await p.waitForTimeout(900); }
  await p.goBack(); await p.waitForTimeout(900);
  check(p.url().endsWith("#/a-propos") && await p.evaluate(() => scrollY) === 0, `[${tag}] retour arrière : page ou position inattendue (${p.url()})`);

  // « Revenir en haut »
  await visit("#/a-propos");
  const top = p.getByRole("button", { name: "Revenir en haut" });
  check(await top.count() === 0, `[${tag}] « Revenir en haut » exposé avant tout défilement`);
  /* Apparition en fondu (opacité), jamais sèche ; opacité seule en mouvement réduit */
  const tt = await p.locator(".rp-totop").evaluate(e => { const c = getComputedStyle(e); return { prop: c.transitionProperty, dur: c.transitionDuration, op: c.opacity }; });
  check(tt.op === "0" && /opacity/.test(tt.prop) && parseFloat(tt.dur) >= 0.2, `[${tag}] « Revenir en haut » : pas de fondu (${JSON.stringify(tt)})`);
  await p.evaluate(() => scrollTo(0, 2000)); await p.waitForTimeout(500);
  check(await top.isVisible(), `[${tag}] « Revenir en haut » absent après défilement`);
  await top.click(); await p.waitForTimeout(1500);
  check(await p.evaluate(() => scrollY) < 5, `[${tag}] « Revenir en haut » ne remonte pas`);

  /* Passe axe-core (TST-07) : échec sur les défauts « serious » et « critical », hors mots éteints de la phrase
     d'accueil (.rs-w, effet voulu, A11Y-12). Animations réduites pendant la passe : un élément en cours de fondu
     fausserait le calcul des contrastes. En thème clair ici ; la passe sombre suit plus bas. */
  const AXE = fs.readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");
  const axe = async label => {
    await p.addScriptTag({ content: AXE });
    const res = await p.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"] } })).violations
      .filter(v => ["serious", "critical"].includes(v.impact))
      .map(v => ({ id: v.id, nodes: v.nodes.filter(n => !n.target.join(" ").includes("rs-w")).map(n => n.target.join(" ")) }))
      .filter(v => v.nodes.length));
    res.forEach(v => check(false, `[${tag}] axe ${label} : ${v.id} (${v.nodes.slice(0, 3).join(" | ")})`));
  };
  if (opts.reduced) for (const h of ["#/", "#/a-propos", "#/solutions", "#/solutions/usage-de-l-ia", "#/solutions/recherche", "#/solutions/fonctionnalites", "#/solutions/methode", "#/cas-d-usage", "#/cas-d-usage/beneficiaires", "#/cas-d-usage/coachs", "#/cas-d-usage/commanditaires", "#/ressources", "#/ressources/faq", "#/ressources/se-presenter-en-deux-minutes", "#/demo", "#/espace", "#/vos-donnees"]) { await visit(h); await revealAll(); await axe(h); }

  /* Animation d'apparition (docs/design-system.md, section 7) : sur les pages publiques, chaque carte, question de FAQ,
     encadré, porte d'entrée et élément de grille apparaît au défilement (Reveal, classe .rv, sur lui ou un parent). */
  if (!opts.reduced && !mobile) for (const h of ["#/", "#/a-propos", "#/solutions", "#/solutions/usage-de-l-ia", "#/solutions/recherche", "#/solutions/fonctionnalites", "#/solutions/methode", "#/cas-d-usage", "#/cas-d-usage/beneficiaires", "#/cas-d-usage/coachs", "#/cas-d-usage/commanditaires", "#/ressources", "#/ressources/faq", "#/ressources/se-presenter-en-deux-minutes", "#/demo", "#/espace", "#/vos-donnees", "#/vos-donnees/video", "#/mentions-legales"]) {
    await visit(h);
    const bare = await p.evaluate(() => [...document.querySelectorAll("main .rs-acc, main .rs-card-btn, main .rs-fcard, main .rs-door, main .rs-callout, main .rs-prose > *, main .rs-g2 > *, main .rs-g3 > *, main .rs-g4 > *")]
      .filter(el => !el.closest(".rv") && !el.closest(".rs-hero, .rs-page-hero, header, .rs-strate, .rs-phrase, .rs-stage, .rs-fvis")).map(el => `${el.tagName.toLowerCase()}.${String(el.className).split(" ")[0]} « ${(el.textContent || "").trim().slice(0, 40)} »`));
    check(bare.length === 0, `[${tag}] ${h} : blocs sans animation d'apparition (${bare.slice(0, 4).join(" | ")})`);
  }

  // Options d'accessibilité : thème sombre et grande taille de texte, sans débordement, mémorisées sans flash
  if (!opts.reduced) {
    await visit("#/");
    await p.getByRole("button", { name: "Options d'accessibilité" }).first().click();
    const dlg = p.getByRole("dialog", { name: "Options d'accessibilité" });
    await dlg.waitFor();
    await dlg.getByRole("radio", { name: "Sombre" }).click();
    await dlg.getByRole("radio", { name: mobile ? "Très grande" : "Maximale" }).click();
    await shot("18-options-accessibilite", false);
    /* Languette du bord gauche (référentiel 8 bis) : le panneau se déploie depuis elle, focus retenu, Échap la rend. */
    check(await p.locator(".rp-a11y-tab").getAttribute("aria-expanded") === "true", `[${tag}] accessibilité : la languette n'indique pas le panneau ouvert`);
    for (let k = 0; k < 40; k++) await p.keyboard.press("Tab");
    check(await p.evaluate(() => !!document.activeElement.closest("#rp-a11y-panel")), `[${tag}] accessibilité : le focus sort du panneau ouvert`);
    await p.keyboard.press("Escape");
    check(await p.evaluate(() => document.activeElement.classList.contains("rp-a11y-tab") && document.activeElement.getAttribute("aria-expanded") === "false"), `[${tag}] accessibilité : Échap ne referme pas le panneau ou ne rend pas le focus à la languette`);
    check(await p.evaluate(() => document.documentElement.dataset.theme) === "dark", `[${tag}] accessibilité : thème sombre non appliqué`);
    const bg = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
    check(bg === "rgb(14, 20, 30)", `[${tag}] accessibilité : fond sombre attendu, lu ${bg}`);
    for (const h of ["#/", "#/a-propos", "#/solutions", "#/solutions/usage-de-l-ia", "#/cas-d-usage/commanditaires", "#/ressources", "#/ressources/faq", "#/vos-donnees", "#/demo", "#/espace", "#/accessibilite"]) {
      await visit(h); await overflow(`sombre et grand texte ${h}`);
    }
    for (const h of ["#/a-propos", "#/solutions", "#/solutions/usage-de-l-ia", "#/cas-d-usage/beneficiaires", "#/ressources", "#/ressources/faq"]) { await visit(h); await shot(`19${h.replace(/[#/]+/g, "-").replace(/-$/, "")}-sombre`, false); }
    await visit("#/"); await shot("19-accueil-sombre");
    await visit("#/espace"); await shot("20-mon-espace-sombre");
    await visit("#/vos-donnees"); await shot("21-vos-donnees-sombre");
    await visit("#/demo"); await shot("21b-demo-sombre"); // flèche du choix et champs en thème sombre (UI-12)
    await p.emulateMedia({ reducedMotion: "reduce" });
    for (const h of ["#/", "#/demo", "#/espace"]) { await visit(h); await revealAll(); await axe(`${h} (sombre)`); }
    await p.emulateMedia({ reducedMotion: "no-preference" });
    await p.goto(BASE + "?sombre=1#/a-propos", { waitUntil: "commit" });
    await p.waitForFunction(() => document.documentElement.dataset.theme !== undefined);
    check(await p.evaluate(() => document.documentElement.dataset.theme === "dark" && document.documentElement.classList.contains("rp-boot-dark")), `[${tag}] accessibilité : thème non appliqué avant l'affichage au rechargement`);
    await p.waitForTimeout(500);
    await p.getByRole("button", { name: "Options d'accessibilité" }).first().click();
    await p.getByRole("button", { name: "Réinitialiser" }).click();
    check(await p.evaluate(() => document.documentElement.dataset.theme) === "auto", `[${tag}] accessibilité : « Réinitialiser » ne remet pas le thème automatique`);
    await p.evaluate(() => document.body.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }))); await p.waitForTimeout(600);
    check(await p.locator(".rp-a11y-tab").getAttribute("aria-expanded") === "false", `[${tag}] accessibilité : un clic en dehors ne referme pas le panneau`);
    /* La languette ne chevauche ni « Revenir en haut » ni le bouton de l'assistant */
    await p.evaluate(() => scrollTo(0, 2000)); await p.waitForTimeout(500);
    const boxes = await p.evaluate(() => [".rp-a11y-tab", ".rp-totop", ".rp-ai-fab"].map(s => { const e = document.querySelector(s); return e ? e.getBoundingClientRect().toJSON() : null; }));
    const hit = (a, b) => a && b && a.left < b.right && b.left < a.right && a.top < b.bottom && b.top < a.bottom;
    check(!hit(boxes[0], boxes[1]) && !hit(boxes[0], boxes[2]), `[${tag}] accessibilité : la languette chevauche un bouton flottant`);
  }

  // « Mon compte » déconnecté : mène à la page « Mon espace »
  await visit("#/ressources");
  await p.getByRole("button", { name: "Mon compte" }).first().click(); await p.waitForTimeout(900);
  check(p.url().endsWith("#/espace"), `[${tag}] « Mon compte » déconnecté ne mène pas à « Mon espace » (${p.url()})`);
  // Rester connecté : après connexion, les pages publiques gardent « Mon compte », menu déroulant sous le bouton
  // (sur mobile, ses actions sont dans le menu mobile)
  await visit("#/espace");
  /* « Mon espace » : première vue sans défilement (les cartes tiennent dans l'écran), carte coach repliée sur mobile */
  {
    const fold = await p.evaluate(() => Math.max(...[...document.querySelectorAll("main .rp-stack > *")].filter(e => getComputedStyle(e).display !== "none").map(e => e.getBoundingClientRect().bottom)));
    check(fold <= vh, `[${tag}] « Mon espace » : les cartes dépassent la première vue (${Math.round(fold)} px pour ${vh})`);
    check(await p.getByRole("heading", { level: 1, name: "Mon espace" }).count() === 1, `[${tag}] « Mon espace » : titre h1 absent`);
    const t = p.getByRole("button", { name: /Vous êtes coach/ });
    check((await t.isVisible()) === mobile, `[${tag}] « Mon espace » : lien de la carte coach ${mobile ? "absent sur mobile" : "visible sur grand écran"}`);
    if (mobile) { check(!(await p.locator("#login-email").isVisible()), `[${tag}] « Mon espace » : carte coach dépliée d'office sur mobile`); await t.click(); }
  }
  await p.getByRole("button", { name: "Se connecter" }).click();
  await p.waitForFunction(() => location.hash === "#/coach", null, { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(1000);
  check(((await p.getByRole("heading", { level: 1 }).first().textContent()) || "") === "Mes parcours" && (await p.getByText(/^Bienvenue /).count()) > 0, `[${tag}] connexion coach : titre « Mes parcours » et « Bienvenue » attendus`);
  await shot("24-espace-coach");
  /* Bug de parcours : connecté côté coach, les boutons d'accès mènent à l'espace coach, jamais à la connexion. */
  await visit("#/");
  await p.getByRole("button", { name: "Je lance mon premier entraînement" }).click(); await p.waitForTimeout(900);
  check(p.url().endsWith("#/coach"), `[${tag}] session coach : « Je lance mon premier entraînement » ne mène pas à l'espace coach (${p.url()})`);
  for (const [h, btn] of [["#/", "Me connecter à l'espace coach"], ["#/cas-d-usage/coachs", "Me connecter à l'espace coach"], ["#/cas-d-usage/beneficiaires", "Je lance mon premier entraînement"]]) {
    await visit(h);
    /* Accueil : portes d'entrée entièrement cliquables (liens) ; ailleurs, boutons. */
    await p.locator("button, a.rs-door").filter({ hasText: btn }).first().click(); await p.waitForTimeout(900);
    check(p.url().endsWith("#/coach"), `[${tag}] session coach : « ${btn} » (${h}) ne mène pas à l'espace coach (${p.url()})`);
  }
  await visit("#/ressources");
  if (!mobile) {
    const help = p.getByRole("button", { name: "Demander de l'aide" });
    check(await help.count() === 1 && await p.getByRole("button", { name: "Nous contacter" }).count() === 0, `[${tag}] session : « Nous contacter » doit devenir « Demander de l'aide »`);
    await help.click(); await p.waitForTimeout(1400);
    check(p.url().endsWith("#/ressources/faq/coachs"), `[${tag}] « Demander de l'aide » (coach) : questions fréquentes des coachs attendues (${p.url()})`);
    await visit("#/ressources");
    const account = p.getByRole("button", { name: "Mon compte" });
    check(await account.count() === 1, `[${tag}] session : « Mon compte » absent sur une page publique`);
    await account.click();
    const acc = p.getByRole("navigation", { name: "Mon compte" });
    await acc.waitFor();
    // Le menu peut être visible avant que requestAnimationFrame donne le focus à sa première action.
    await acc.getByRole("button", { name: "Retour à mon espace", exact: true })
      .and(p.locator(":focus")).waitFor({ timeout: 5000 });
    check(await account.getAttribute("aria-expanded") === "true", `[${tag}] menu « Mon compte » : aria-expanded non mis à jour`);
    check(await p.locator(".rp-account-menu").getByText("Sophie M.").count() === 1 && await p.locator(".rp-account-menu").getByText("Espace coach").count() === 1, `[${tag}] menu « Mon compte » : en-tête du compte absent`);
    const st = await p.evaluate(() => {
      const m = document.querySelector(".rp-account-menu").getBoundingClientRect(), b = [...document.querySelectorAll("header button")].find(x => x.textContent.includes("Mon compte")).getBoundingClientRect();
      return { below: m.top >= b.bottom - 1 && m.right <= innerWidth, lock: getComputedStyle(document.documentElement).overflowY === "hidden", inert: !!document.querySelector(".rp-view")?.inert, inMenu: !!document.activeElement?.closest(".rp-account-menu") };
    });
    check(st.below && !st.lock && !st.inert && st.inMenu, `[${tag}] menu « Mon compte » : position sous le bouton, page non bloquée et focus dans le menu attendus ${JSON.stringify(st)}`);
    await p.keyboard.press("ArrowDown");
    check(await p.evaluate(() => document.activeElement?.textContent.includes("Demander de l'aide")), `[${tag}] menu « Mon compte » : la flèche bas ne passe pas à l'action suivante`);
    await shot("25-mon-compte", false);
    await p.keyboard.press("Escape");
    check(await acc.count() === 0 || !(await acc.isVisible()), `[${tag}] menu « Mon compte » : Échap ne ferme pas`);
    check(await p.evaluate(() => document.activeElement?.textContent.includes("Mon compte")), `[${tag}] menu « Mon compte » : focus non rendu au bouton`);
    await account.click(); await acc.waitFor();
    await p.mouse.click(300, 600); await p.waitForTimeout(200);
    check(await acc.count() === 0 || !(await acc.isVisible()), `[${tag}] menu « Mon compte » : un clic à l'extérieur ne ferme pas`);
    await account.click();
    await acc.getByRole("button", { name: "Retour à mon espace" }).click(); await p.waitForTimeout(900);
    check(p.url().endsWith("#/coach"), `[${tag}] session : « Retour à mon espace » ne mène pas à l'espace (${p.url()})`);
    await visit("#/vos-donnees/coachs");
    check(await p.getByRole("button", { name: "Mon compte" }).count() === 1, `[${tag}] « Vos données » depuis l'espace : en-tête d'espace perdu`);
    await p.getByRole("button", { name: "Mon compte" }).click();
    await p.getByRole("navigation", { name: "Mon compte" }).getByRole("button", { name: "Se déconnecter" }).click(); await p.waitForTimeout(900);
  } else {
    /* Mobile : « Mon compte » est dans le menu mobile, avec l'en-tête du compte et ses actions. */
    check(!(await p.getByRole("button", { name: "Mon compte" }).isVisible()), `[${tag}] session mobile : « Mon compte » doit passer dans le menu mobile`);
    await p.getByRole("button", { name: "Ouvrir le menu" }).click();
    const dlg = p.getByRole("dialog", { name: "Menu" });
    await dlg.waitFor();
    const acc = dlg.getByRole("navigation", { name: "Mon compte" });
    check(await acc.count() === 1 && await dlg.getByText("Sophie M.").count() === 1, `[${tag}] menu mobile : section « Mon compte » absente`);
    check(await dlg.getByRole("button", { name: "Demander de l'aide" }).count() >= 1, `[${tag}] menu mobile : « Demander de l'aide » absent`);
    await shot("25-mon-compte-mobile", false);
    await acc.getByRole("button", { name: "Retour à mon espace" }).click(); await p.waitForTimeout(900);
    check(p.url().endsWith("#/coach"), `[${tag}] menu mobile : « Retour à mon espace » ne mène pas à l'espace (${p.url()})`);
    await visit("#/ressources");
    await p.getByRole("button", { name: "Ouvrir le menu" }).click();
    await p.getByRole("dialog", { name: "Menu" }).getByRole("navigation", { name: "Mon compte" }).getByRole("button", { name: "Se déconnecter" }).click(); await p.waitForTimeout(900);
  }
  check(await p.locator(".rp-account-menu:not([hidden])").count() === 0 && p.url().endsWith("#/"), `[${tag}] « Se déconnecter » ne met pas fin à la session`);
  await p.getByRole("button", { name: "Mon compte" }).first().click(); await p.waitForTimeout(900);
  check(p.url().endsWith("#/espace"), `[${tag}] après déconnexion, « Mon compte » doit mener à « Mon espace »`);

  errors.forEach(e => problems.push(`[${tag}] ${e}`));
  await ctx.close();
}

/* Balayage responsive : chaque largeur (et 320 × 568, 844 × 390 en paysage), pages publiques et espaces,
   déconnecté puis connecté (« Mon compte »), menu mobile ouvert avec ses sous-menus.
   Échoue en cas de débordement horizontal, de chevauchement ou de sortie d'écran dans l'en-tête, de menu
   défaillant (fermeture invisible, page qui défile ou cliquable derrière, dernier lien inatteignable) ou d'erreur. */
const WIDTHS = [320, 360, 375, 390, 414, 430, 600, 768, 820, 1024, 1280];
const SWEEP_PAGES = ["#/", "#/a-propos", "#/solutions", "#/solutions/usage-de-l-ia", "#/cas-d-usage/beneficiaires", "#/ressources", "#/ressources/faq", "#/ressources/se-presenter-en-deux-minutes", "#/demo", "#/espace", "#/vos-donnees"];
async function sweep(b) {
  const views = [...WIDTHS.map(w => [w, w < 600 ? 800 : 900]), [320, 568], [844, 390]];
  for (const [vw, vh] of views) for (const logged of [false, true]) {
    const tag = `balayage ${vw}x${vh}${logged ? " connecté" : ""}`;
    const mobile = vw < 760;
    const ctx = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: mobile, hasTouch: mobile, reducedMotion: "reduce" });
    const p = await ctx.newPage();
    const errors = [];
    p.on("pageerror", e => errors.push(e.message));
    await p.goto(BASE + "#/"); await p.evaluate(() => localStorage.clear());
    if (logged) { await p.goto(BASE + "#/espace"); await p.locator("#espace-code").waitFor().catch(() => {}); if (await p.getByRole("button", { name: /Vous êtes coach/ }).isVisible()) await p.getByRole("button", { name: /Vous êtes coach/ }).click(); await p.getByRole("button", { name: "Se connecter" }).click(); await p.waitForFunction(() => location.hash === "#/coach", null, { timeout: 5000 }).catch(() => {}); }
    for (const h of [...SWEEP_PAGES, logged ? "#/coach" : "#/s/REPETE"]) {
      await p.goto(BASE + h); await p.waitForTimeout(250);
      const r = await p.evaluate(() => {
        const vw = document.documentElement.clientWidth, out = [];
        if (document.documentElement.scrollWidth > vw + 1) out.push(`débordement horizontal ${document.documentElement.scrollWidth}px`);
        const nav = document.querySelector("header .rp-nav");
        const els = [...nav.querySelectorAll("a[aria-label], button, .navlink")].map(e => [e.getAttribute("aria-label") || e.textContent.trim(), e.getBoundingClientRect()]).filter(([, b]) => b.width > 0);
        for (const [n, b] of els) if (b.left < -1 || b.right > vw + 1) out.push(`en-tête : « ${n} » hors écran`);
        for (let i = 0; i < els.length; i++) for (let j = i + 1; j < els.length; j++) {
          const [n1, a] = els[i], [n2, c] = els[j];
          if (a.left < c.right - 1 && c.left < a.right - 1 && a.top < c.bottom - 1 && c.top < a.bottom - 1) out.push(`en-tête : « ${n1} » chevauche « ${n2} »`);
        }
        return out;
      });
      r.forEach(m => problems.push(`[${tag}] ${h} : ${m}`));
      const burger = p.getByRole("button", { name: "Ouvrir le menu" });
      const hasBurger = await burger.count() && await burger.isVisible();
      if (vw < 1024 && h === "#/ressources" && !hasBurger) problems.push(`[${tag}] ${h} : bouton du menu absent`);
      if (vw >= 1024 && hasBurger) problems.push(`[${tag}] ${h} : bouton du menu visible sur grand écran`);
      if (hasBurger && (h === "#/" || h === "#/ressources")) {
        await burger.click();
        const dlg = p.getByRole("dialog", { name: "Menu" });
        await dlg.waitFor();
        const subs = dlg.getByRole("button", { name: /^Sous-menu/ });
        for (let i = 0; i < await subs.count(); i++) await subs.nth(i).click();
        const m = await p.evaluate(() => {
          const menu = document.getElementById("rs-menu");
          const close = document.querySelector("header [aria-label='Fermer le menu']").getBoundingClientRect();
          menu.scrollTop = menu.scrollHeight;
          const last = [...menu.querySelectorAll("a")].pop().getBoundingClientRect();
          const mb = menu.getBoundingClientRect();
          const under = document.elementFromPoint(innerWidth / 2, Math.min(innerHeight - 2, mb.bottom - 2));
          return { closeOk: close.top >= 0 && close.bottom <= innerHeight && close.right <= innerWidth, locked: getComputedStyle(document.documentElement).overflowY === "hidden",
            lastOk: last.bottom <= innerHeight + 1 && last.top >= mb.top, inert: !!document.querySelector(".rp-view")?.inert, under: !!under && (menu.contains(under) || !!under.closest("header")), sw: menu.scrollWidth <= menu.clientWidth + 1 };
        });
        // molette au-dessus de l'en-tête : la page ne doit pas défiler derrière le menu
        const y0 = await p.evaluate(() => scrollY);
        await p.mouse.move(Math.round(vw / 2), 20); await p.mouse.wheel(0, 600); await p.waitForTimeout(150);
        if (await p.evaluate(() => scrollY) !== y0) m.locked = false;
        if (!m.closeOk) problems.push(`[${tag}] ${h} menu : bouton de fermeture hors écran`);
        if (!m.locked) problems.push(`[${tag}] ${h} menu : la page défile derrière le menu`);
        if (!m.lastOk) problems.push(`[${tag}] ${h} menu : dernier lien inatteignable`);
        if (!m.inert || !m.under) problems.push(`[${tag}] ${h} menu : la page reste cliquable derrière le panneau`);
        if (!m.sw) problems.push(`[${tag}] ${h} menu : débordement horizontal du panneau`);
        await p.keyboard.press("Escape");
        if (await dlg.count()) problems.push(`[${tag}] ${h} menu : Échap ne ferme pas`);
        if (await p.evaluate(() => document.documentElement.classList.contains("rp-lock"))) problems.push(`[${tag}] ${h} menu : défilement toujours bloqué après fermeture`);
      }
      /* Menu déroulant « Mon compte » (grand écran ou espace sans menu mobile) : dans l'écran, dernière action
         atteignable en faisant défiler le menu lui-même. */
      const accBtn = p.locator("header button", { hasText: "Mon compte" });
      if (logged && (h === "#/ressources" || h === "#/coach") && await accBtn.count() && await accBtn.first().isVisible() && await accBtn.first().getAttribute("aria-expanded") !== null) {
        await accBtn.first().click();
        await p.locator(".rp-account-menu:not([hidden])").waitFor();
        const r = await p.evaluate(() => {
          const m = document.querySelector(".rp-account-menu:not([hidden])"); m.scrollTop = m.scrollHeight;
          const b = m.getBoundingClientRect(), last = [...m.querySelectorAll("button")].pop().getBoundingClientRect();
          return { b: [b.left, b.right, b.bottom].map(Math.round), lastOk: last.bottom <= Math.min(innerHeight, b.bottom) + 1 && last.top >= b.top - 1 };
        });
        if (r.b[0] < 0 || r.b[1] > vw + 1 || r.b[2] > vh + 1) problems.push(`[${tag}] ${h} menu « Mon compte » hors écran ${JSON.stringify(r.b)}`);
        if (!r.lastOk) problems.push(`[${tag}] ${h} menu « Mon compte » : dernière action inatteignable`);
        await p.keyboard.press("Escape");
      }
    }
    errors.forEach(e => problems.push(`[${tag}] erreur ${e}`));
    await ctx.close();
  }
}

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined });
  await sweep(b);
  await run(b, 1280, 900);
  await run(b, 390, 844);
  await run(b, 1280, 900, { reduced: true });
  await b.close();
  if (problems.length) { console.error("ÉCHECS :\n" + problems.join("\n")); process.exit(1); }
  console.log("site : toutes les vérifications passent");
})().catch(e => { console.error("ECHEC", e.message); process.exit(1); });
