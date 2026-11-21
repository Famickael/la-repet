/* Cas limites de bout en bout (TST-02) : chaque scénario part d'un état préparé dans le stockage local,
   pour rester court. Lancer : npm run test:cas (CHROMIUM_PATH facultatif). Captures dans tests/screenshots/cas-limites/. */
const { chromium } = require("playwright");
const SC = process.argv[2] || "tests/screenshots/cas-limites";
require("fs").mkdirSync(SC, { recursive: true });
const BASE = process.env.E2E_BASE || "http://localhost:5098/";
const KEY = "larepet.v1";
const now = () => new Date().toISOString();

/* État de départ : un coach connecté, un parcours avec accord, éventuellement des réponses. */
function seed({ code = "CASAAA", ai = true, takes = {}, consent = true } = {}) {
  return {
    counselor: { name: "Sophie M.", since: now() }, lastSpace: null,
    parcours: { [code]: { code, prenom: "Lou", poste: "électricien", warmup: true, counselor: "Sophie M.", createdAt: now(), openedAt: now(), consent: consent ? { at: now(), local: true, ai, version: "1" } : null } },
    takes,
  };
}
const dims = [
  { id: "debit", titre: "Rythme de parole", type: "appui", observation: "Environ 130 mots par minute.", conseil: "Vous pouvez le garder.", t: 0 },
  { id: "exemples", titre: "Exemples concrets", type: "explorer", observation: "Aucune situation datée.", conseil: "Ajoutez une situation vécue.", t: 2 },
];
const take = (id, code, extra = {}) => ({ id, code, question: "Pouvez-vous vous présenter ?", duration: 42, transcript: "Bonjour je m'appelle Lou.", segments: [{ start: 0, end: 3, text: "Bonjour je m'appelle Lou." }], gaze: null,
  analysis: { synthese: "Vos points d'appui : rythme de parole.", dimensions: dims, source: "local" }, hasVideo: false, mime: null, createdAt: now(), shared: false, sharedAt: null, note: "", report: null, ...extra });

(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
  const [vw, vh] = (process.env.E2E_VIEWPORT || "1280x900").split("x").map(Number);
  const mobile = vw < 600;
  const fails = [], errors = [];
  const check = (ok, msg) => { if (!ok) fails.push(msg); };
  /* Nouveau contexte (stockage vierge), état préparé avant le premier script de la page. */
  async function fresh(state, perms = ["camera", "microphone"]) {
    const ctx = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: mobile, hasTouch: mobile, permissions: perms });
    if (state) await ctx.addInitScript(([k, v]) => { try { if (!localStorage.getItem("e2e.seeded")) { localStorage.setItem(k, v); localStorage.setItem("e2e.seeded", "1"); } } catch { /* about:blank */ } }, [KEY, JSON.stringify(state)]);
    const watch = p => { p.on("pageerror", e => errors.push(`${p.url()} : ${e.message}`)); p.on("console", m => { if (m.type() === "error" && !/Failed to load resource|ERR_|jsdelivr|googleapis|huggingface|TensorFlow Lite|XNNPACK/.test(m.text())) errors.push(`${p.url()} : ${m.text().slice(0, 160)}`); }); };
    ctx.on("page", watch);
    const p = await ctx.newPage();
    return { ctx, p };
  }
  const shot = (p, n) => p.screenshot({ path: `${SC}/${n}.png`, fullPage: true });
  const scenario = async (name, fn) => {
    try { await fn(); console.log(`  ok  ${name}`); }
    catch (e) { fails.push(`${name} : ${e.message.split("\n").slice(0, 3).join(" ")}`); console.log(`  ÉCHEC ${name}`); }
  };

  /* BUG-02 : la personne reprend son envoi pendant que le coach relit, dans un autre onglet. */
  await scenario("reprise de l'envoi pendant la relecture", async () => {
    const { ctx, p } = await fresh(seed({ takes: { t1: take("t1", "CASAAA", { shared: true, sharedAt: now() }) } }));
    await p.goto(BASE + "#/coach");
    await p.getByRole("button", { name: "Relire" }).first().click();
    await p.getByRole("button", { name: "Relire et annoter" }).click();
    await p.locator("#review-intro").fill("Lou, voici mes remarques.");
    const q = await ctx.newPage();
    await q.goto(BASE + "#/s/CASAAA");
    await q.getByRole("button", { name: "Ouvrir", exact: true }).first().click();
    await q.getByRole("button", { name: "Annuler l'envoi" }).click();
    await p.getByText("La personne a repris cette réponse").waitFor({ timeout: 5000 });
    check(await p.getByRole("button", { name: /Envoyer le rapport/ }).count() === 0, "BUG-02 : le bouton d'envoi du rapport reste affiché après la reprise");
    const st = await p.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
    check(!st.takes.t1.report, "BUG-02 : un rapport a été enregistré sur une réponse reprise");
    await shot(p, "01-reprise-pendant-relecture");
    await ctx.close();
  });

  /* BUG-18 : un rapport vide ne part pas. */
  await scenario("rapport vide refusé", async () => {
    const { ctx, p } = await fresh(seed({ takes: { t1: take("t1", "CASAAA", { shared: true, sharedAt: now() }) } }));
    await p.goto(BASE + "#/coach");
    await p.getByRole("button", { name: "Relire" }).first().click();
    await p.getByRole("button", { name: "Relire et annoter" }).click();
    check(await p.getByRole("button", { name: "Envoyer le rapport" }).isDisabled(), "BUG-18 : « Envoyer le rapport » actif sans aucun texte");
    await p.locator("#review-intro").fill("Lou, merci.");
    check(!(await p.getByRole("button", { name: "Envoyer le rapport" }).isDisabled()), "BUG-18 : « Envoyer le rapport » reste inactif après saisie");
    await ctx.close();
  });

  /* BUG-19 : la fiche du parcours indique le retrait de l'accord. */
  await scenario("accord retiré affiché au coach", async () => {
    const st = seed({ consent: false });
    st.parcours.CASAAA.consentWithdrawnAt = now();
    const { ctx, p } = await fresh(st);
    await p.goto(BASE + "#/coach");
    await p.getByRole("button", { name: "Ouvrir" }).first().click();
    await p.getByText(/accord retiré le/).waitFor({ timeout: 5000 });
    await ctx.close();
  });

  /* BUG-03 : retrait de l'accord depuis un retour ouvert, puis nouvel accord : accueil de l'espace, pas d'écran vide. */
  await scenario("retrait de l'accord puis nouvel accord", async () => {
    const { ctx, p } = await fresh(seed({ takes: { t1: take("t1", "CASAAA") } }));
    await p.goto(BASE + "#/s/CASAAA");
    await p.getByRole("button", { name: "Ouvrir", exact: true }).first().click();
    await p.getByRole("button", { name: "Mon compte" }).click();
    await p.getByRole("navigation", { name: "Mon compte" }).getByRole("button", { name: /Retirer mon/ }).click();
    await p.getByRole("button", { name: "Tout supprimer" }).click();
    await p.getByRole("heading", { name: "Avant de commencer" }).waitFor({ timeout: 5000 });
    await p.getByRole("checkbox").first().click();
    await p.getByRole("button", { name: "Je suis d'accord, je commence" }).click();
    await p.getByRole("heading", { name: /Bonjour Lou/ }).waitFor({ timeout: 5000 });
    await shot(p, "02-nouvel-accord");
    await ctx.close();
  });

  /* BUG-04 : arrivée par lien, « Retour » depuis l'accord : pas de message d'erreur sur un code valide. */
  await scenario("retour depuis l'accord sans erreur", async () => {
    const { ctx, p } = await fresh(seed({ consent: false }));
    await p.goto(BASE + "#/s/CASAAA");
    await p.getByRole("heading", { name: "Avant de commencer" }).waitFor({ timeout: 5000 });
    await p.getByRole("button", { name: "Retour" }).click();
    await p.getByRole("heading", { name: "Bienvenue sur La Répét'" }).waitFor({ timeout: 5000 });
    check(await p.getByText("Ce code ne fonctionne pas").count() === 0, "BUG-04 : erreur affichée à tort après « Retour »");
    await ctx.close();
  });

  /* BUG-14 et BUG-16 : lien avec un code inconnu, ancre inconnue. */
  await scenario("code inconnu et ancre inconnue", async () => {
    const st = seed(); st.lastSpace = { role: "benef", code: "CASAAA" };
    const { ctx, p } = await fresh(st);
    await p.goto(BASE + "#/s/ZZZZZZ");
    await p.getByText("Ce code ne fonctionne pas").first().waitFor({ timeout: 5000 });
    const ls = await p.evaluate(k => JSON.parse(localStorage.getItem(k)).lastSpace, KEY);
    check(ls && ls.code === "CASAAA", "BUG-14 : un code inconnu efface la session d'un autre espace");
    await p.goto(BASE + "#/page-qui-n-existe-pas");
    await p.getByRole("heading", { name: "Cette page n'existe pas" }).waitFor({ timeout: 5000 });
    await p.goto(BASE + "#/s/CASAAAXX");
    await p.getByRole("heading", { name: "Cette page n'existe pas" }).waitFor({ timeout: 5000 });
    /* BUG-11 : deux navigations rapprochées, aucune erreur JavaScript (vérifiée à la fin). */
    await p.goto(BASE + "#/");
    await p.evaluate(() => { location.hash = "#/a-propos"; location.hash = "#/solutions"; location.hash = "#/ressources"; });
    await p.waitForTimeout(800);
    await ctx.close();
  });

  /* BUG-09 : la réponse relue disparaît (retrait de l'accord dans un autre onglet) : message, pas de vue vide. */
  await scenario("réponse disparue pendant la relecture", async () => {
    const { ctx, p } = await fresh(seed({ takes: { t1: take("t1", "CASAAA", { shared: true, sharedAt: now() }) } }));
    await p.goto(BASE + "#/coach");
    await p.getByRole("button", { name: "Relire" }).first().click();
    await p.getByRole("button", { name: "Relire et annoter" }).click();
    await p.evaluate(k => { const st = JSON.parse(localStorage.getItem(k)); delete st.takes.t1; st.parcours.CASAAA.consent = null; localStorage.setItem(k, JSON.stringify(st)); }, KEY);
    const q = await ctx.newPage(); await q.goto(BASE + "#/"); // un autre onglet écrit : l'événement « storage » parvient au premier
    await q.evaluate(k => { const st = JSON.parse(localStorage.getItem(k)); st.touched = Date.now(); localStorage.setItem(k, JSON.stringify(st)); }, KEY);
    await p.getByText("Cette réponse n'existe plus.").waitFor({ timeout: 5000 });
    await ctx.close();
  });

  /* Enregistre une réponse en voix seule à la première question proposée. */
  async function recordVoice(p, validate) {
    await p.getByRole("button", { name: "Commencer l'entraînement" }).click();
    await p.getByRole("button", { name: "Tout retirer" }).click().catch(() => {});
    await p.getByRole("checkbox", { name: /Pouvez-vous vous présenter/ }).click();
    await p.getByRole("button", { name: "Commencer (1 question)" }).click();
    await p.getByRole("button", { name: "Voix seule" }).click();
    const start = p.getByRole("button", { name: "Démarrer l'enregistrement" });
    await start.waitFor(); await p.waitForFunction(() => { const b = [...document.querySelectorAll("button")].find(x => x.textContent.includes("Démarrer l'enregistrement")); return b && !b.disabled; }, null, { timeout: 15000 });
    await start.click(); await p.waitForTimeout(2500);
    await p.getByRole("button", { name: "Arrêter l'enregistrement" }).click();
    await p.getByRole("button", { name: validate }).click();
  }

  /* BUG-05 et BUG-06 : parcours sans retour de l'assistant, en voix seule : aucun texte du parcours avec assistant ou vidéo. */
  await scenario("sans assistant, voix seule", async () => {
    const { ctx, p } = await fresh(seed({ ai: false }));
    await p.goto(BASE + "#/s/CASAAA");
    await recordVoice(p, "Garder cette réponse");
    await p.getByText("Votre réponse", { exact: true }).first().waitFor({ timeout: 15000 });
    const txt = await p.locator("main").innerText();
    for (const bad of [/votre retour est prêt/i, /vous lisez ce que l'assistant/i, /retour préparé automatiquement/i, /vidéo/i, /En résumé/]) check(!bad.test(txt), `BUG-05/06 : texte inattendu sans assistant en voix seule : ${bad}`);
    check(/Réponse gardée/.test(txt), "BUG-05 : rail à trois étapes attendu");
    check(await p.locator("main").getByRole("button", { name: /vidéo/i }).count() === 0, "BUG-06 : bouton nommé « vidéo » en voix seule");
    check(await p.getByLabel("Enregistrement de la réponse").count() === 1, "BUG-06 : lecteur audio non nommé « Enregistrement »");
    await shot(p, "03-sans-assistant-voix");
    await ctx.close();
  });

  /* BUG-06 : voix seule avec le retour de l'assistant : « Me réécouter », jamais « vidéo ». */
  await scenario("voix seule avec assistant", async () => {
    const { ctx, p } = await fresh(seed({ ai: true }));
    await p.goto(BASE + "#/s/CASAAA");
    await recordVoice(p, "Voir mon retour");
    await p.getByText("Comment voulez-vous voir votre retour ?").waitFor({ timeout: 30000 });
    const txt = await p.locator("main").innerText();
    check(!/vidéo/i.test(txt), "BUG-06 : le choix du mode parle de vidéo en voix seule");
    check(/Me réécouter/.test(txt), "BUG-06 : option « Me réécouter » absente");
    await shot(p, "04-voix-avec-assistant");
    await ctx.close();
  });

  /* BUG-24 : accès à la caméra refusé : message adapté, voix seule proposée. */
  await scenario("caméra refusée", async () => {
    const { ctx, p } = await fresh(seed({ ai: false }));
    await ctx.addInitScript(() => { navigator.mediaDevices.getUserMedia = () => Promise.reject(Object.assign(new Error("refus"), { name: "NotAllowedError" })); });
    await p.goto(BASE + "#/s/CASAAA");
    await p.getByRole("button", { name: "Commencer l'entraînement" }).click();
    await p.getByRole("checkbox", { name: /Pouvez-vous vous présenter/ }).click();
    await p.getByRole("button", { name: "Commencer (1 question)" }).click();
    await p.getByRole("button", { name: "Activer la caméra" }).click();
    await p.getByText("Accès refusé").waitFor({ timeout: 5000 });
    check(await p.getByText("Caméra ou micro introuvable").count() === 0, "BUG-24 : titre « introuvable » pour un accès refusé");
    await shot(p, "05-camera-refusee");
    await ctx.close();
  });

  /* A11Y-01, 02, 03, 06 et A11Y-17, UI-02 : focus sur le titre, titre de page propre, lien d'évitement, texte de la
     réponse pour la personne, suppression par le menu « Autres actions » et une fenêtre du site. */
  await scenario("accessibilité structurelle et suppression confirmée", async () => {
    const { ctx, p } = await fresh(seed({ takes: { t1: take("t1", "CASAAA") } }));
    await p.goto(BASE + "#/s/CASAAA");
    await p.getByRole("heading", { name: /Bonjour Lou/ }).waitFor({ timeout: 5000 });
    check(/Mon espace/.test(await p.title()), "A11Y-06 : titre de l'accueil de l'espace");
    await p.keyboard.press("Tab");
    check(await p.evaluate(() => document.activeElement?.textContent) === "Aller au contenu", "A11Y-01 : le lien d'évitement n'est pas le premier arrêt");
    await p.getByRole("button", { name: "Commencer l'entraînement" }).click();
    await p.waitForTimeout(300);
    check(await p.evaluate(() => document.activeElement?.tagName) === "H1", "A11Y-02 : focus sur le titre après un changement d'écran");
    check(/Choix des questions/.test(await p.title()), "A11Y-06 : titre du choix des questions");
    await p.getByRole("button", { name: "Retour" }).click();
    await p.getByRole("button", { name: "Ouvrir", exact: true }).first().click();
    await p.getByText("Lire mon retour").first().click().catch(() => {});
    await p.getByText("Afficher le texte de la réponse").click();
    await p.getByText("Ce texte est écrit par un programme").waitFor({ timeout: 3000 });
    await p.getByRole("button", { name: "Autres actions" }).click();
    await p.getByRole("button", { name: "Supprimer cette réponse" }).click();
    const dlg = p.getByRole("dialog", { name: "Supprimer cette réponse ?" });
    await dlg.waitFor({ timeout: 3000 });
    await shot(p, "06-suppression-confirmee");
    await dlg.getByRole("button", { name: "Supprimer" }).click();
    await p.getByText("Vous n'avez pas encore de réponse enregistrée").waitFor({ timeout: 5000 });
    await ctx.close();
  });

  /* BUG-07 : Précédent et Suivant suivent les écrans de l'espace ; un rechargement sur un retour le rouvre. */
  await scenario("navigation par l'adresse", async () => {
    const { ctx, p } = await fresh(seed({ takes: { t1: take("t1", "CASAAA") } }));
    await p.goto(BASE + "#/s/CASAAA");
    await p.getByRole("button", { name: "Commencer l'entraînement" }).click();
    await p.getByRole("heading", { name: /Sur quelles questions/ }).waitFor({ timeout: 5000 });
    check(p.url().endsWith("#/s/CASAAA/questions"), `BUG-07 : adresse du choix des questions (${p.url()})`);
    await p.goBack();
    await p.getByRole("heading", { name: /Bonjour Lou/ }).waitFor({ timeout: 5000 });
    await p.goForward();
    await p.getByRole("heading", { name: /Sur quelles questions/ }).waitFor({ timeout: 5000 });
    await p.goBack();
    await p.getByRole("button", { name: "Ouvrir", exact: true }).first().click();
    await p.getByText("Lire mon retour").first().click().catch(() => {});
    await p.getByText("En résumé.").waitFor({ timeout: 5000 });
    const u = p.url();
    check(/#\/s\/CASAAA\/retour\/t1/.test(u), `BUG-07 : adresse du retour (${u})`);
    await p.reload();
    await p.getByText("En résumé.").waitFor({ timeout: 5000 });
    /* Rechargement sur un écran qui dépend d'un état en mémoire : retour à l'espace avec un message. */
    await p.evaluate(() => { history.replaceState(null, "", "#/s/CASAAA/reponse"); location.reload(); });
    await p.getByText("La page a été rechargée").waitFor({ timeout: 8000 });
    /* Côté coach */
    const q = await ctx.newPage();
    await q.goto(BASE + "#/coach");
    await q.getByRole("button", { name: "Ouvrir" }).first().click();
    await q.getByRole("heading", { level: 1, name: "Lou" }).waitFor({ timeout: 5000 });
    check(q.url().endsWith("#/coach/parcours/CASAAA"), `BUG-07 : adresse de la fiche du parcours (${q.url()})`);
    await q.goBack();
    await q.getByRole("heading", { name: "Mes parcours" }).waitFor({ timeout: 5000 });
    await ctx.close();
  });

  /* ARC-08 : deux onglets écrivent l'un après l'autre sans se relire : rien n'est écrasé. */
  await scenario("deux onglets qui écrivent", async () => {
    const { ctx, p } = await fresh(seed());
    await p.goto(BASE + "#/coach");
    await p.getByRole("heading", { name: "Mes parcours" }).waitFor({ timeout: 5000 });
    const q = await ctx.newPage();
    await q.goto(BASE + "#/s/CASAAA");
    await q.getByRole("heading", { name: /Bonjour Lou/ }).waitFor({ timeout: 5000 });
    /* Écriture brute dans le stockage par un troisième acteur, sans événement vers les deux pages */
    await p.evaluate(k => { const st = JSON.parse(localStorage.getItem(k)); st.parcours.CASBBB = { code: "CASBBB", prenom: "Noa", poste: "", createdAt: new Date().toISOString(), consent: null }; localStorage.setItem(k, JSON.stringify(st)); }, KEY);
    await q.getByRole("combobox", { name: "Métier ou poste visé" }).fill("plombier");
    await q.getByRole("combobox", { name: "Métier ou poste visé" }).press("Enter");
    await q.waitForTimeout(300);
    const st = await q.evaluate(k => JSON.parse(localStorage.getItem(k)), KEY);
    check(!!st.parcours.CASBBB, "ARC-08 : le parcours écrit par un autre onglet a été écrasé");
    check(st.parcours.CASAAA.poste === "plombier", "ARC-08 : la modification de l'onglet n'est pas écrite");
    await ctx.close();
  });

  await b.close();
  if (errors.length) fails.push("erreurs JavaScript : " + errors.join(" | "));
  if (fails.length) { console.error("ECHEC\n- " + fails.join("\n- ")); process.exit(1); }
  console.log("e2e-cas-limites : OK");
})().catch(e => { console.error("ECHEC", e.message); process.exit(1); });
