/* Pages publiques : navigation, menu mobile, strate épinglée, FAQ, ressources, formulaire de contact.
   Échoue en cas d'erreur JavaScript, de débordement horizontal ou d'élément attendu absent. */
const { chromium } = require("playwright");
const fs = require("fs");
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
  await p.evaluate(() => { localStorage.clear(); });

  // Accueil
  await visit("#/", "accueil");
  check(await p.locator("#rp-loader").count() === 0, `[${tag}] écran de chargement encore présent`);
  check(await p.getByRole("heading", { level: 1 }).first().textContent().then(t => t.includes("Répétez votre entretien")), `[${tag}] titre du héros absent`);
  await p.getByRole("button", { name: "Lancer ma première répétition" }).waitFor();
  await shot("01-accueil", false);
  const dot = p.getByRole("button", { name: /Scène 2 sur 4/ });
  await dot.click(); await p.waitForTimeout(700);
  check(await dot.getAttribute("aria-current") === "true", `[${tag}] le point de navigation des scènes ne change pas la scène`);
  await shot("01a-heros-scene2", false);
  await shot("01z-accueil-complet");
  /* Fond de l'accueil (souris) : le pointeur repousse le violet et le bleu et dégage une zone claire sous lui ;
     en mouvement réduit, rien ne bouge. */
  if (!mobile) {
    await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(300);
    const hb = await p.getByRole("heading", { level: 1 }).first().boundingBox();
    await p.mouse.move(hb.x + 40, hb.y + 40); await p.mouse.move(hb.x + hb.width / 2, hb.y + hb.height / 2, { steps: 10 }); await p.waitForTimeout(1500);
    const g = await p.locator(".rs-glow").evaluate(el => Object.fromEntries(["--clear", "--px", "--vx", "--vy", "--bx", "--by"].map(k => [k, el.style.getPropertyValue(k)])));
    if (opts.reduced) check(!g["--clear"], `[${tag}] fond de l'accueil : la zone claire ne doit pas apparaître en mouvement réduit`);
    else {
      const px = parseFloat(g["--px"]) / 100 * vw, pointer = hb.x + hb.width / 2;
      check(g["--clear"] === "1" && Math.abs(px - pointer) < vw * 0.05, `[${tag}] fond de l'accueil : zone claire absente sous le pointeur (${JSON.stringify(g)})`);
      check(parseFloat(g["--vx"]) > 72 || parseFloat(g["--vy"]) < 18, `[${tag}] fond de l'accueil : le violet n'est pas repoussé par le pointeur (${JSON.stringify(g)})`);
      await shot("01y-accueil-souris", false);
    }
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

  // Redirection de l'ancienne adresse
  await visit("#/fonctionnement");
  check(p.url().endsWith("#/solutions"), `[${tag}] #/fonctionnement ne redirige pas vers #/solutions`);
  await shot("06-solutions");
  const tab = p.getByRole("tab", { name: "Entreprises" });
  await tab.click();
  check(await tab.getAttribute("aria-selected") === "true", `[${tag}] onglet Entreprises non sélectionné`);
  await p.keyboard.press("ArrowRight");
  check(await p.getByRole("tab", { name: "Cadre et données" }).getAttribute("aria-selected") === "true", `[${tag}] onglets : la flèche droite ne change pas d'onglet`);
  /* Repositionnement : publics de l'organisme, aucun discours de logiciel vendu. */
  for (const id of ["demandeurs-emploi", "collaborateurs", "coachs", "commanditaires"]) check(await p.locator(`#${id}`).count() === 1, `[${tag}] Solutions : section #${id} absente`);
  const solText = await p.locator("main").innerText();
  check(!/licence|abonnement|tarif|équipez votre structure|Claude|Anthropic/i.test(solText), `[${tag}] Solutions : discours de logiciel ou nom du fournisseur d'IA`);
  await visit("#/solutions/organismes");
  check(p.url().endsWith("#/solutions/commanditaires"), `[${tag}] #/solutions/organismes ne redirige pas vers #/solutions/commanditaires`);

  // À propos et FAQ
  await visit("#/a-propos"); await shot("07-a-propos");
  await p.goto(BASE + "#/a-propos/faq"); await p.waitForTimeout(1600);
  const faqTop = await p.locator("#faq").evaluate(el => Math.round(el.getBoundingClientRect().top));
  check(faqTop < 200, `[${tag}] #/a-propos/faq ne défile pas jusqu'à la FAQ (${faqTop})`);
  const q = p.getByRole("button", { name: "Faut-il créer un compte ?" });
  await q.click();
  check(await q.getAttribute("aria-expanded") === "true", `[${tag}] FAQ : le dépliant ne s'ouvre pas`);
  await q.focus(); await p.keyboard.press("Enter");
  check(await q.getAttribute("aria-expanded") === "false", `[${tag}] FAQ : Entrée ne referme pas le dépliant`);
  await p.keyboard.press(" ");
  check(await q.getAttribute("aria-expanded") === "true", `[${tag}] FAQ : Espace n'ouvre pas le dépliant`);
  await shot("08-faq", false);

  // Ressources : hub, recherche, filtre, catégorie, articles
  await visit("#/ressources"); await shot("09-ressources");
  check(await p.getByText("Les mots de La Répét'").count() === 0, `[${tag}] ressources : le glossaire doit être retiré`);
  check(await p.getByRole("heading", { name: "Par thème" }).count() === 0, `[${tag}] ressources : le titre « Par thème » doit être retiré`);
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
  await p.goto(BASE + "#/ressources/c/coachs"); await p.waitForTimeout(400);
  await p.getByRole("group", { name: "Filtrer par type" }).getByRole("button", { name: /Scénario/ }).click();
  check((await p.locator("main a.rs-card-btn").count()) === 1, `[${tag}] filtre par type : un scénario attendu dans « Pour les coachs »`);
  await shot("10-categorie");
  await p.locator("main a.rs-card-btn").first().click(); await p.waitForTimeout(400);
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
  check(p.url().endsWith("#/a-propos/faq"), `[${tag}] lien « Questions fréquentes » du pied de page`);
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
    const sub = p.getByRole("button", { name: "Sous-menu À propos" });
    await sub.click();
    check(await sub.getAttribute("aria-expanded") === "true", `[${tag}] sous-menu : aria-expanded non mis à jour`);
    await shot("22-sous-menu", false);
    await p.keyboard.press("Escape");
    check(await sub.getAttribute("aria-expanded") === "false", `[${tag}] sous-menu : Échap ne ferme pas`);
    await sub.focus(); await p.keyboard.press("ArrowDown"); await p.waitForTimeout(100); await p.keyboard.press("ArrowDown");
    await p.keyboard.press("Enter"); await p.waitForTimeout(900);
    check(p.url().endsWith("#/a-propos/ia-et-recherche"), `[${tag}] sous-menu au clavier : « L'IA et la recherche » non ouverte (${p.url()})`);
    check(((await p.getByRole("heading", { level: 1 }).first().textContent()) || "").includes("L'IA et la recherche"), `[${tag}] page « L'IA et la recherche » absente`);
    await shot("23-ia-et-recherche");
  } else {
    await visit("#/");
    await p.getByRole("button", { name: "Ouvrir le menu" }).click();
    const dlg = p.getByRole("dialog", { name: "Menu" });
    await dlg.getByRole("button", { name: "Sous-menu Solutions" }).click();
    check(await dlg.getByRole("link", { name: "Coachs" }).isVisible(), `[${tag}] menu mobile : l'accordéon Solutions ne s'ouvre pas`);
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
  if (opts.reduced) for (const h of ["#/", "#/a-propos", "#/solutions", "#/ressources", "#/ressources/se-presenter-en-deux-minutes", "#/demo", "#/espace", "#/vos-donnees"]) { await visit(h); await revealAll(); await axe(h); }

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
    for (const h of ["#/", "#/a-propos", "#/solutions", "#/ressources", "#/vos-donnees", "#/demo", "#/espace", "#/accessibilite"]) {
      await visit(h); await overflow(`sombre et grand texte ${h}`);
    }
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
  // Rester connecté : après connexion, les pages publiques gardent « Mon compte », qui ouvre un panneau latéral
  await visit("#/espace");
  await p.getByRole("button", { name: "Se connecter" }).click();
  await p.waitForFunction(() => location.hash === "#/coach", null, { timeout: 5000 }).catch(() => {}); await p.waitForTimeout(1000);
  check(((await p.getByRole("heading", { level: 1 }).first().textContent()) || "") === "Mes parcours" && (await p.getByText(/^Bienvenue /).count()) > 0, `[${tag}] connexion coach : titre « Mes parcours » et « Bienvenue » attendus`);
  await shot("24-espace-coach");
  await visit("#/ressources");
  const account = p.getByRole("button", { name: "Mon compte" });
  check(await account.count() === 1, `[${tag}] session : « Mon compte » absent sur une page publique`);
  await account.click();
  const acc = p.getByRole("dialog", { name: "Mon compte" });
  await acc.waitFor();
  check(await acc.getByText(/Sophie M\. · Espace coach/).count() === 1, `[${tag}] panneau « Mon compte » : en-tête du compte absent`);
  const st = await p.evaluate(() => ({ lock: getComputedStyle(document.documentElement).overflowY === "hidden", inert: !!document.querySelector(".rp-view")?.inert, inPanel: !!document.activeElement?.closest("#rp-account") }));
  check(st.lock && st.inert && st.inPanel, `[${tag}] panneau « Mon compte » : défilement, fond inerte ou focus incorrects ${JSON.stringify(st)}`);
  for (let i = 0; i < 12; i++) await p.keyboard.press("Tab");
  check(await p.evaluate(() => !!document.activeElement?.closest("#rp-account")), `[${tag}] panneau « Mon compte » : le focus sort du panneau`);
  await shot("25-mon-compte", false);
  await p.keyboard.press("Escape");
  check(await acc.count() === 0, `[${tag}] panneau « Mon compte » : Échap ne ferme pas`);
  check(await p.evaluate(() => document.activeElement?.textContent.includes("Mon compte")), `[${tag}] panneau « Mon compte » : focus non rendu au bouton`);
  await account.click();
  await acc.getByRole("button", { name: "Retour à mon espace" }).click(); await p.waitForTimeout(900);
  check(p.url().endsWith("#/coach"), `[${tag}] session : « Retour à mon espace » ne mène pas à l'espace (${p.url()})`);
  await visit("#/vos-donnees/coachs");
  check(await p.getByRole("button", { name: "Mon compte" }).count() === 1, `[${tag}] « Vos données » depuis l'espace : en-tête d'espace perdu`);
  await p.getByRole("button", { name: "Mon compte" }).click();
  await p.getByRole("dialog", { name: "Mon compte" }).getByRole("button", { name: "Se déconnecter" }).click(); await p.waitForTimeout(900);
  check(await p.getByRole("dialog", { name: "Mon compte" }).count() === 0 && p.url().endsWith("#/"), `[${tag}] « Se déconnecter » ne met pas fin à la session`);
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
const SWEEP_PAGES = ["#/", "#/a-propos", "#/solutions", "#/ressources", "#/ressources/se-presenter-en-deux-minutes", "#/demo", "#/espace", "#/vos-donnees"];
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
    if (logged) { await p.goto(BASE + "#/espace"); await p.getByRole("button", { name: "Se connecter" }).click(); await p.waitForFunction(() => location.hash === "#/coach", null, { timeout: 5000 }).catch(() => {}); }
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
      if (logged && h === "#/ressources") {
        await p.getByRole("button", { name: "Mon compte" }).click();
        await p.locator("#rp-account").waitFor();
        const r = await p.evaluate(() => { const b = document.getElementById("rp-account").getBoundingClientRect(); const items = [...document.querySelectorAll("#rp-account nav button")].pop().getBoundingClientRect(); return { b: [b.left, b.right, b.bottom].map(Math.round), lastOk: items.bottom <= innerHeight + 1 }; });
        if (r.b[0] < 0 || r.b[1] > vw + 1 || r.b[2] > vh + 1) problems.push(`[${tag}] panneau « Mon compte » hors écran ${JSON.stringify(r.b)}`);
        if (!r.lastOk) problems.push(`[${tag}] panneau « Mon compte » : dernière action inatteignable sans défiler`);
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
