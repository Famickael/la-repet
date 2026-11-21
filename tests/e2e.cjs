const { chromium } = require("playwright");
const SC = process.argv[2] || "tests/screenshots";
const BASE = process.env.E2E_BASE || "http://localhost:5098/";
require("fs").mkdirSync(SC, { recursive: true });
(async () => {
  const b = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--use-fake-device-for-media-stream", "--use-fake-ui-for-media-stream", "--autoplay-policy=no-user-gesture-required"] });
  const [vw, vh] = (process.env.E2E_VIEWPORT || "1280x900").split("x").map(Number); // ex. 390x844 pour un téléphone
  const mobile = vw < 600;
  const ctx = await b.newContext({ viewport: { width: vw, height: vh }, isMobile: mobile, hasTouch: mobile, permissions: ["camera", "microphone", "clipboard-read", "clipboard-write"] });
  const p = await ctx.newPage();
  const errors = [];
  p.on("pageerror", e => errors.push("pageerror " + e.message));
  p.on("console", m => { if (m.type() === "error") errors.push("console " + m.text().slice(0, 160)); });
  /* Plus aucune boîte native dans le parcours (TST-05, A11Y-17) : seul l'avertissement de sortie (BUG-08) est accepté. */
  p.on("dialog", d => { if (d.type() === "beforeunload") return d.accept(); errors.push(`boîte native inattendue : ${d.message()}`); d.dismiss(); });
  const overflow = [];
  const shot = async n => {
    await p.waitForTimeout(600); // fin d'un éventuel fondu de changement de page
    const w = await p.evaluate(() => document.documentElement.scrollWidth);
    if (w > vw + 1) overflow.push(`${n} : ${w}px pour ${vw}px`);
    await p.screenshot({ path: `${SC}/${n}.png`, fullPage: true });
  };
  const click = async t => {
    try { await p.getByRole("button", { name: t }).first().click({ timeout: 15000 }); }
    catch (e) { await p.screenshot({ path: `${SC}/echec.png`, fullPage: true }).catch(() => {}); throw new Error(`bouton « ${t} » : ${e.message.split("\n")[0]}`); }
  };
  /* « Mon espace » sur mobile : la carte coach est repliée sous un lien qui la déplie (référentiel 6). */
  const coachForm = async () => {
    await p.locator("#espace-code").waitFor({ timeout: 15000 });
    const t = p.getByRole("button", { name: /Vous êtes coach/ });
    if (await t.isVisible()) await t.click();
  };

  await p.goto(BASE); await shot("01-accueil");
  await p.evaluate(() => window.scrollTo(0, document.body.scrollHeight / 3)); await p.waitForTimeout(900); await shot("01b-accueil-defilement");
  await p.goto(BASE + "#/fonctionnement"); await p.waitForTimeout(400); await shot("01c-fonctionnement");
  await p.goto(BASE + "#/"); await click("Mon compte"); await shot("01d-mon-espace");
  await coachForm(); await shot("01e-connexion-coach"); await click("Se connecter");
  await click("Créer un parcours");
  await p.getByPlaceholder("Prénom et initiale").fill("Alex D."); await p.getByPlaceholder(/agent d'accueil/).fill("agent d'accueil");
  await click("Créer le parcours"); await shot("02-code");
  const code = (await p.locator("text=/^[A-Z2-9]{6}$/").first().textContent()).trim(); console.log("code", code);
  await click("Ouvrir son espace sur cet appareil");
  const boxes = p.getByRole("checkbox");
  if (await boxes.nth(1).getAttribute("aria-checked") !== "false") throw new Error("la case du retour de l'assistant doit être décochée par défaut");
  await boxes.nth(0).click(); await boxes.nth(1).click(); await shot("03-consentement");
  await click("Je suis d'accord, je commence");
  const see = (t, timeout = 5000) => p.getByText(t).first().waitFor({ timeout });
  // Assistant de préparation d'entretien : panneau latéral
  const panel = () => p.getByRole("dialog", { name: "Assistant de préparation d'entretien" });
  const fab = () => p.getByRole("button", { name: "Ouvrir l'assistant de préparation d'entretien" });
  const ask = async (q, expected) => { const i = p.locator("#asst-panel-input"); await i.fill(q); await i.press("Enter"); await see(expected); };
  const closePanel = async how => {
    if (how === "escape") await p.keyboard.press("Escape"); else await p.getByRole("button", { name: "Fermer l'assistant" }).click();
    await panel().waitFor({ state: "hidden" });
    if (!(await fab().evaluate(el => el === document.activeElement))) throw new Error("le focus ne revient pas au bouton de l'assistant");
  };
  // Bulle d'invitation à l'ouverture de l'espace, refermable
  await see("Une question pour préparer votre entretien ?", 4000);
  await shot("03a-bulle-assistant");
  await p.getByRole("button", { name: "Fermer la bulle" }).click();

  // Espace : choix du métier (combobox) et bulles d'information
  const job = p.getByRole("combobox", { name: "Métier ou poste visé" });
  await job.fill(""); await job.type("serv");
  await p.getByRole("option", { name: "serveur(se)", exact: true }).waitFor();
  await shot("03b-espace-metier");
  await job.press("ArrowDown"); await job.press("Enter");
  await see(/Métier enregistré/);
  await click("En savoir plus sur l'échauffement"); await see(/Rien n'est enregistré ni gardé/); await shot("03c-info-echauffement");
  await p.keyboard.press("Escape");

  // Échauffement : phrase aléatoire, relance, aperçu caméra, assistant, questionnaire
  await click("M'échauffer");
  const phrase = p.getByTestId("warmup-phrase");
  const ph1 = await phrase.textContent();
  await click("Changer de phrase");
  const ph2 = await phrase.textContent();
  if (ph1 === ph2) throw new Error("la phrase d'échauffement n'a pas changé");
  await click("Consigne suivante"); await see(/Consigne\s2\ssur/);
  await click("Activer la caméra"); await p.waitForTimeout(800);
  await p.getByRole("radio", { name: "Flou" }).click(); await p.waitForTimeout(2500);
  await shot("03d-echauffement");
  await click("Passer en voix seule"); await see("Voix seule · rien n'est enregistré");
  await click("Passer en vidéo"); await p.waitForTimeout(500);
  await click("Voir les astuces pour bien démarrer");
  await p.getByRole("dialog", { name: "Astuces pour bien démarrer" }).waitFor(); await shot("03d2-astuces");
  await p.keyboard.press("Escape");
  await fab().click(); await panel().waitFor();
  if (!(await p.locator("#asst-panel-input").evaluate(el => el === document.activeElement))) throw new Error("le focus n'est pas dans le champ de l'assistant");
  await ask("Comment me présenter en entretien ?", /deux minutes environ/);
  await ask("un exemple ?", /Je m'appelle Camille/);
  if (await p.locator("#asst-panel [role=log][aria-live=polite]").count() !== 1) throw new Error("réponses de l'assistant sans aria-live");
  await shot("03e-echauffement-assistant");
  await closePanel("escape");
  await click("Terminer l'échauffement");
  await p.getByRole("radio", { name: "Un peu de tension" }).click(); await see(/Merci pour votre réponse/);
  await p.getByRole("radio", { name: "Utile" }).click();
  await p.getByRole("checkbox", { name: "Me présenter" }).click();
  await p.getByRole("checkbox", { name: "Expliquer ma motivation" }).click();
  if (await p.getByRole("textbox", { name: "Votre question à l'assistant" }).count() !== 0) throw new Error("le questionnaire ne doit plus contenir d'assistant en ligne");
  await shot("03f-questionnaire");
  await click("Poser ma question à l'assistant"); await panel().waitFor();
  await ask("Comment expliquer un trou dans mon CV ?", /simple et honnête/);
  await ask("et pour le salaire ?", /fourchette/);
  await shot("03f2-questionnaire-assistant");
  await p.getByRole("button", { name: "Fermer l'assistant" }).click(); await panel().waitFor({ state: "hidden" });
  await click("Commencer l'entraînement");

  // Sélection de 2 questions (une de la banque, une personnelle)
  await see(/Questions choisies d'après vos réponses/);
  await click("Tout retirer");
  await p.getByRole("checkbox", { name: /Pouvez-vous vous présenter en deux minutes/ }).click();
  await p.locator("#own").fill("Pourquoi avez-vous quitté votre dernier emploi ?"); await click("Ajouter");
  await shot("03g-selection");
  await click("Commencer (2 questions)");

  const record = async n => {
    await click("Activer la caméra"); await p.waitForTimeout(800);
    await click("Démarrer l'enregistrement"); await p.waitForTimeout(4500); await shot(`04-enregistrement-q${n}`);
    await click("Arrêter"); await p.waitForTimeout(800); await shot(`05-relecture-q${n}`);
    await click("Voir mon retour");
    await p.getByText("Comment voulez-vous voir votre retour ?").waitFor({ timeout: 30000 });
  };
  await see("Entraînement · question 1 sur 2");
  await record(1); await shot("06-choix");
  await p.getByText("Lire mon retour").first().click(); await p.waitForTimeout(500);
  await click("Une question sur ce retour ? Demandez à l'assistant");
  await panel().waitFor();
  await panel().getByRole("button", { name: "Je parle trop vite, que faire ?" }).click(); await see(/120\sà\s160\smots/);
  await shot("06b-rapport-q1");
  await closePanel("button");
  await click("Question suivante (2 sur 2)");
  await see("Entraînement · question 2 sur 2"); await see("« Pourquoi avez-vous quitté votre dernier emploi ? »");
  await record(2);
  await p.getByText("Me revoir en vidéo").first().click(); await p.waitForTimeout(800); await shot("07-rapport-video");
  await see("C'était la dernière question de votre sélection");
  await p.locator("[title*='Exemples concrets']").first().click().catch(() => {});
  await click("Envoyer à mon coach");
  await p.locator("textarea").fill("Je parle peut-être trop vite ?"); await click("Envoyer à mon coach"); await shot("08-envoye");
  await click("Mon compte"); await p.getByRole("navigation", { name: "Mon compte" }).getByRole("button", { name: "Se déconnecter" }).waitFor(); await shot("08b-mon-compte");
  await p.getByRole("navigation", { name: "Mon compte" }).getByRole("button", { name: "Se déconnecter" }).click(); await click("Mon compte"); await coachForm(); await click("Se connecter"); await p.waitForTimeout(300); await shot("09-liste-conseiller");
  await click("Relire"); await click("Relire et annoter"); await p.waitForTimeout(800);
  await p.getByPlaceholder("Votre remarque", { exact: true }).fill("Belle entrée en matière."); await click("Ajouter");
  await p.locator("textarea").fill("Alex, ta présentation est claire. On en parle jeudi.");
  await p.getByPlaceholder("Votre remarque sur ce repère (facultatif)").first().fill("D'accord, garde ce rythme.");
  await shot("10-relecture-conseiller");
  // Assistant de rédaction du rapport : ouvrir, insérer une proposition dans le mot d'introduction et en note horodatée
  await p.getByRole("button", { name: "Ouvrir l'assistant de rédaction du rapport" }).click();
  const coachAsst = p.getByRole("dialog", { name: "Assistant de rédaction du rapport" });
  await coachAsst.waitFor();
  const sugg = coachAsst.locator(".rp-coach-sugg").first();
  await sugg.waitFor();
  const suggText = (await sugg.locator("p").textContent()).trim();
  if (/score|\/ ?20|stress|émotion/i.test(suggText)) throw new Error("proposition de l'assistant coach non conforme : " + suggText);
  await sugg.getByRole("button", { name: "Dans l'introduction" }).click();
  await coachAsst.getByText(/Ajouté dans le mot d'introduction/).waitFor();
  if (!(await p.locator("#review-intro").inputValue()).includes(suggText)) throw new Error("la proposition n'apparaît pas dans le mot d'introduction");
  await coachAsst.getByRole("radio", { name: "Reformuler" }).click();
  await coachAsst.getByLabel("Votre remarque à reformuler").fill("Tu parles trop vite ! Il faut que tu ralentisses.");
  await coachAsst.getByRole("button", { name: "Reformuler", exact: true }).click();
  await coachAsst.getByText("Vous parlez à un rythme rapide. Vous pouvez ralentir.").waitFor();
  await coachAsst.locator(".rp-coach-sugg").first().getByRole("button", { name: /En note à/ }).click();
  await shot("10b-assistant-coach");
  await p.keyboard.press("Escape");
  if (await coachAsst.isVisible()) throw new Error("Échap ne ferme pas l'assistant de rédaction");
  await click("Envoyer le rapport"); await shot("11-rapport-envoye");
  await p.goto(BASE + `#/s/${code}`); await p.waitForTimeout(500); await shot("12-espace-benef");
  await p.getByRole("button", { name: "Ouvrir", exact: true }).first().click(); await p.getByText("Lire mon retour").first().click(); await p.waitForTimeout(500); await shot("13-rapport-final");
  if (!(await p.locator("main").innerText()).includes(suggText.slice(0, 40))) throw new Error("la proposition insérée n'apparaît pas dans le rapport final");
  if (!(await p.locator("main").innerText()).includes("Vous pouvez ralentir.")) throw new Error("la note reformulée n'apparaît pas dans le rapport final");
  // Entraînement complet : 7 questions dans l'ordre réel, contextualisées par le métier, recruteur oral, récapitulatif sans score
  await p.goto(BASE + `?complet=1#/s/${code}`); await p.waitForTimeout(800);
  await click("Commencer l'entraînement");
  await click("Faire un entraînement complet");
  await see("Entraînement complet · question 1 sur 7"); await see(/Le recruteur · Accueil/i);
  await see(/merci d'être là/);
  if (await p.getByRole("button", { name: "Réécouter" }).count() !== 1 || await p.getByRole("button", { name: /Couper le son|Réactiver le son/ }).count() !== 1) throw new Error("boutons du recruteur oral absents");
  await shot("14-complet-q1");
  await record("c1"); await p.getByText("Lire mon retour").first().click(); await p.waitForTimeout(400);
  await click("Question suivante (2 sur 7)");
  await see("Entraînement complet · question 2 sur 7"); await see(/Le recruteur · Présentation/i);
  await record("c2"); await p.getByText("Lire mon retour").first().click(); await p.waitForTimeout(400);
  await click("Arrêter ici");
  await see("Récapitulatif de votre entretien"); await see("Fin de l'entretien");
  await see(/une commande a été oubliée/); // mise en situation liée au métier « serveur(se) »
  const recap = await p.locator("main").innerText();
  if (/score|\/ ?10|\/ ?20|\bnote\b/i.test(recap)) throw new Error("le récapitulatif ne doit contenir aucun score");
  if ((await p.getByRole("button", { name: "Ouvrir mon retour" }).count()) !== 2) throw new Error("récapitulatif : deux réponses attendues");
  await shot("15-recapitulatif");
  const realErrors = errors.filter(e => !/fonts.googleapis|jsdelivr|googleapis|huggingface|Failed to load resource|ERR_TUNNEL|ERR_NAME|net::|TensorFlow Lite|XNNPACK/.test(e)); // MediaPipe journalise ses informations en erreur
  console.log("erreurs:", realErrors);
  if (realErrors.length) process.exitCode = 1;
  if (overflow.length) { console.error("débordement horizontal:", overflow); process.exitCode = 1; }
  await b.close();
})().catch(e => { console.error("ECHEC", e.message); process.exit(1); });
