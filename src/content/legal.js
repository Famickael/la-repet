/* Fonds unique des textes d'information (docs/conformite.md, sections 4 et 5).
   Trois niveaux tirés du même fichier, pour qu'une phrase ne contredise jamais la page :
     phrase  : une ligne, affichée là où la question se pose ;
     summary : 3 à 5 puces, dans une fenêtre et en haut de chaque page ;
     full    : le texte complet de la page (#/vos-donnees/...).
   Mise en forme : **gras** ; icônes par nom (clés de I dans src/ui.jsx).
   Règle : chaque phrase est vraie aujourd'hui comme dans la version finale. Ce qui dépend de l'organisme
   vient de src/content/organisme.js, avec une formulation neutre tant que le champ est vide. */
import { ORG, orgName, OrgName, dpoLine, contactLine, hostLine, THIRD_PARTIES, SELF_HOSTED_MODELS } from "./organisme.js";

const REMOTE_LLM = !!import.meta.env?.VITE_LLM_ENDPOINT;
const REMOTE_STT = !!import.meta.env?.VITE_STT_ENDPOINT;
const BACKEND = !!import.meta.env?.VITE_BACKEND_URL;
export const LEGAL_DATE = "20 novembre 2026";
export const LEGAL_VERSION = ORG.textsVersion;

/* Pages du centre « Vos données » et pages légales : route, titre, libellé de lien. */
export const PAGES = {
  hub: { route: "#/vos-donnees", title: "Vos données, vos choix", label: "Vos données" },
  video: { route: "#/vos-donnees/video", title: "Que devient ma vidéo ?", label: "Que devient ma vidéo ?" },
  assistant: { route: "#/vos-donnees/assistant", title: "Ce que fait l'assistant, et ce qu'il ne fait pas", label: "L'assistant et l'IA" },
  droits: { route: "#/vos-donnees/droits", title: "Vos droits", label: "Vos droits" },
  appareil: { route: "#/vos-donnees/appareil", title: "Ce qui est gardé sur cet appareil", label: "Sur cet appareil" },
  notice: { route: "#/vos-donnees/notice", title: "Information complète sur vos données", label: "Le texte complet" },
  coachs: { route: "#/vos-donnees/coachs", title: "Coachs : vos données", label: "Coachs : vos données" },
  conditions: { route: "#/conditions", title: "Règles d'utilisation", label: "Conditions d'utilisation" },
  mentions: { route: "#/mentions-legales", title: "Mentions légales", label: "Mentions légales" },
  accessibilite: { route: "#/accessibilite", title: "Accessibilité", label: "Accessibilité : non conforme" },
};

/* ─── Niveau 1 : les phrases, au bon moment du parcours ─── */
export const PHRASES = {
  code: "Aucun compte, aucun mot de passe. Votre code suffit.",
  camera: "Votre vidéo reste sur cet appareil tant que vous ne l'envoyez pas à votre coach.",
  warmup: "Rien n'est enregistré pendant l'échauffement.",
  job: "Il sert à adapter les questions. Votre coach le voit.",
  assistantChat: REMOTE_LLM
    ? "Vos questions sont envoyées à un service d'IA pour préparer la réponse. Ni image, ni son."
    : "Vos questions restent sur cet appareil. Elles sont effacées quand vous quittez la page.",
  assistantIsProgram: "L'assistant est un programme, pas une personne.",
  noPersonal: "N'écrivez pas votre nom, votre adresse ou des informations sur votre santé.",
  feedback: "Retour préparé automatiquement par l'assistant. Il décrit, il ne note pas.",
  /* Affichée sous le résumé de l'analyse, côté personne et côté coach, quand le texte vient du service d'IA. */
  feedbackLlm: "Texte rédigé avec l'aide d'une IA, à partir de ce qui a été mesuré dans l'entretien, puis vérifié par un filtre. Le coach peut le nuancer ou le contredire.",
  emotions: "L'assistant ne cherche pas à deviner vos émotions. Il décrit seulement ce qui se voit et ce qui s'entend.",
  download: SELF_HOSTED_MODELS
    ? "La première fois, votre appareil télécharge un outil. Le Wi-Fi est préférable. Votre vidéo, elle, n'est pas envoyée."
    : "La première fois, votre appareil télécharge un outil (environ 130 Mo). Le Wi-Fi est préférable. Votre vidéo, elle, n'est pas envoyée.",
  /* Écran de préparation (B4) : dit ce qui part vraiment. Avec le proxy IA, le texte transcrit (jamais la vidéo ni la
     voix) est envoyé à l'assistant IA pour rédiger le retour ; sans lui, tout reste sur l'appareil. */
  processing: REMOTE_LLM
    ? "Votre réponse est mise par écrit sur votre appareil. Le texte, jamais la vidéo ni la voix, est ensuite envoyé à un service d'IA pour rédiger votre retour. Cela prend en général moins d'une minute, un peu plus la première fois."
    : "Tout se passe sur votre appareil. Cela prend en général moins d'une minute, un peu plus la première fois.",
  processingLocal: "Tout se passe sur votre appareil.",
  /* Case « retour de l'assistant » de l'accord (panel bénéficiaires) et conseil d'appareil, avant tout téléchargement. */
  consentAi: `L'assistant est un programme. Il décrit des faits : rythme de parole, pauses, direction du regard. Pas de note, pas d'émotion devinée.${REMOTE_LLM ? " Pour rédiger le retour, le texte de votre réponse est envoyé à un service d'IA, jamais votre vidéo ni votre voix." : ""} Sans cette case, vous pouvez quand même vous enregistrer et vous revoir.`,
  personalDevice: SELF_HOSTED_MODELS
    ? "Conseil : utilisez de préférence votre téléphone ou votre ordinateur personnel. La première fois, votre appareil télécharge un outil : le Wi-Fi est préférable."
    : "Conseil : utilisez de préférence votre téléphone ou votre ordinateur personnel. La première fois, votre appareil télécharge un outil d'environ 130 Mo : le Wi-Fi est préférable.",
  share: "Seul votre coach verra cette réponse.",
  sent: "Tant que votre coach n'a pas répondu, vous pouvez annuler l'envoi depuis votre espace.",
  /* Sans serveur, l'envoi reste dans ce navigateur (RED-07) : dit là où la personne envoie. */
  sameDevice: BACKEND ? "" : "Sur ce site, votre coach lit votre réponse dans ce même navigateur. Revenez ici avec votre code pour lire son rapport.",
  logout: "Se déconnecter n'efface pas les données de cet appareil.",
  coachLogin: "Vous ne voyez que les réponses que l'on vous envoie.",
  noTracking: "Pas de publicité, aucun suivi.",
  contactInfo: "Vos coordonnées servent seulement à répondre à votre demande. Elles sont destinées uniquement à notre équipe.",
  /* Formulaire « Nous contacter » (BUG-01) : rien n'est envoyé ; ce message s'affiche au clic, après validation.
     Jamais « l'équipe vous recontacte » tant qu'aucun envoi réel n'a eu lieu (contactSent). */
  contactDemo: "Aucune demande envoyée : l'envoi en ligne n'est pas encore ouvert",
  contactSent: "Votre demande est envoyée. Notre équipe vous recontacte pour en parler.",
  refuse: "Vous pouvez refuser. Cela ne change rien à votre accompagnement : vous pouvez préparer votre entretien avec votre coach.",
  changeMind: "Vous pouvez changer d'avis à tout moment, dans « Mon compte ».",
  sharedDevice: "Sur un ordinateur partagé ou professionnel, supprimez vos réponses avant de partir (« Mon compte », puis « Retirer mon accord »).",
};

/* ─── Niveau 2 : les résumés ─── */
export const SUMMARY = {
  video: [
    ["lock", "Votre vidéo est gardée **sur cet appareil** tant que vous ne l'envoyez pas."],
    ["shield", REMOTE_STT ? "Pour préparer votre retour, **seul le son** est envoyé au service de transcription. L'image reste sur cet appareil." : "L'assistant prépare votre retour **sur cet appareil**."],
    ["send", "Vous pouvez l'envoyer à votre coach. **Seulement si vous le voulez**, réponse par réponse."],
    ["user", "Votre coach est **la seule personne** qui voit les réponses que vous lui envoyez."],
    ["trash", "Vous pouvez la **supprimer** quand vous voulez."],
  ],
  assistant: [
    ["chat", "L'assistant est **un programme informatique** (une IA). Ce n'est pas une personne."],
    ["mic", "Il observe **des faits** : votre rythme de parole, vos pauses, vos exemples, la direction de votre regard."],
    ["ban", "Il **ne met pas de note**. Il ne vous compare à personne."],
    ["shield", "Il **ne devine pas vos émotions**. Il ne dit jamais si vous avez l'air à l'aise ou non."],
    ["user", "Votre **coach** peut compléter le retour, ou dire qu'il n'est pas d'accord."],
  ],
  accord: [
    ["lock", "Vos réponses restent **sur cet appareil** tant que vous ne les envoyez pas."],
    ["send", "Vous choisissez **ce que vous envoyez** à votre coach."],
    ["trash", "Vous pouvez **tout supprimer** quand vous voulez."],
  ],
  envoi: [
    ["user", "**Qui la voit ?** Votre coach. Personne d'autre, ni votre employeur ni l'organisme qui finance votre accompagnement."],
    ["send", "**Qu'est-ce qui part ?** Votre vidéo (ou votre voix), le texte de votre réponse, le retour de l'assistant et votre message."],
    ["trash", "**Et si je change d'avis ?** Tant que votre coach n'a pas répondu, vous pouvez annuler l'envoi. Vous pouvez aussi supprimer la réponse, depuis votre espace."],
  ],
  conversation: [
    ["chat", "Vous parlez à **un programme**, pas à une personne."],
    ["lock", REMOTE_LLM ? "Vos questions sont envoyées à un service d'IA, **sans image ni son**." : "Vos questions **ne sont pas gardées**."],
    ["user", "Pour une question sur votre situation, **votre coach** est la bonne personne."],
  ],
  droits: [
    ["trash", "**Supprimer** : une réponse, ou tout, depuis votre espace."],
    ["arrow", "**Récupérer** : téléchargez vos données et vos vidéos (« Mes données », dans votre espace), ou imprimez votre retour."],
    ["note", "**Corriger** : vous changez votre métier vous-même, votre coach corrige votre prénom."],
    ["redo", "**Changer d'avis** : retirez votre accord quand vous voulez, sans explication."],
    ["user", "**Demander de l'aide** : votre coach, ou " + orgName() + ". Réponse en un mois au plus."],
  ],
  appareil: [
    ["lock", "Vos réponses sont gardées **dans ce navigateur, sur cet appareil**."],
    ["ban", "**Pas de publicité. Pas de pistage. Pas de mesure d'audience.**"],
    ["trash", "Vous effacez tout avec « Retirer mon accord », dans « Mon compte »."],
  ],
  conditions: [
    ["mic", "Vous vous entraînez **pour vous**, autant de fois que vous voulez."],
    ["ban", "Pas de note, pas de classement, **aucune conséquence** sur vos droits."],
    ["user", "Filmez **vous seulement**. Pas d'autre personne sans son accord."],
    ["lock", "Votre code est **personnel**. Ne le donnez à personne."],
  ],
  coachs: [
    ["user", "Vous voyez **seulement les réponses que l'on vous envoie**."],
    ["list", "Les chiffres de votre espace portent sur **l'ensemble des parcours**. Aucun ne mesure une personne ni un coach."],
    ["note", "Vos remarques et votre rapport sont lus **par la personne accompagnée**."],
  ],
};

/* Cartes de la page d'entrée « Vos données ». */
export const HUB_CARDS = [
  ["lock", "Que devient ma vidéo ?", "Elle reste sur cet appareil tant que vous ne l'envoyez pas.", "video"],
  ["chat", "L'assistant et l'IA", "Un programme qui décrit des faits. Pas de note, pas d'émotion.", "assistant"],
  ["user", "Qui voit quoi ?", "Votre coach voit seulement ce que vous lui envoyez.", "video"],
  ["trash", "Supprimer", "Une réponse, ou tout. Quand vous voulez.", "droits"],
  ["shield", "Sur cet appareil", "Pas de publicité, pas de pistage.", "appareil"],
  ["mail", "Nous écrire", "Une question ? Parlez-en à votre coach.", "droits"],
];

/* ─── Niveau 3 : textes complets ───
   Bloc : { h: intertitre, p: [paragraphes], list: [puces], table: { head, rows } } */
const toolsFrom = SELF_HOSTED_MODELS
  ? `Les fichiers viennent des serveurs de ${orgName()}.`
  : "Les fichiers viennent des services listés ci-dessous, dans des versions fixées. Comme pour tout site, ces services voient l'adresse internet (IP) de votre appareil.";

export const FULL = {
  video: [
    { h: "1. Vous vous enregistrez.", p: ["Votre vidéo et votre voix sont gardées sur cet appareil, dans votre navigateur."] },
    { h: "2. L'assistant prépare votre retour.", p: [
      REMOTE_STT
        ? "L'assistant est un programme. Pour mettre votre réponse par écrit, le son est envoyé au service de transcription de votre organisme d'accompagnement. La direction de votre regard est calculée sur cet appareil."
        : "L'assistant est un programme. Il transforme votre voix en texte et regarde la direction de votre regard. Tout cela se passe sur cet appareil.",
      ...(REMOTE_LLM ? [`Pour mieux rédiger le retour, le texte de votre réponse est envoyé à un service d'IA${ORG.llmProvider ? ` (${ORG.llmProvider})` : ""}. Jamais votre image. Jamais votre voix.`] : []),
      REMOTE_LLM
        ? "Quand vous comparez deux entretiens, la comparaison est calculée sur cet appareil. Les phrases qui disent ce qui a changé peuvent être envoyées à ce même service d'IA pour être reformulées : du texte seulement, jamais votre image ni votre voix."
        : "Quand vous comparez deux entretiens, tout est calculé sur cet appareil. Rien n'est envoyé.",
    ] },
    { h: "3. Vous gardez votre vidéo pour vous.", p: ["Si vous ne faites rien, votre vidéo reste sur cet appareil. Personne d'autre ne la voit. Vous pouvez la revoir ou la supprimer."] },
    { h: "4. Vous décidez de l'envoyer à votre coach, ou non.", p: ["Vous envoyez une réponse avec le bouton « Envoyer à mon coach ». Seul votre coach peut alors la voir. Vous pouvez annuler l'envoi tant que votre coach ne vous a pas répondu."] },
    { h: "5. Vous pouvez tout arrêter.", p: [
      "Vous pouvez supprimer une réponse. Vous pouvez aussi tout supprimer d'un coup. Vous n'avez pas à expliquer pourquoi.",
      ORG.retention ? `Durées de conservation : ${ORG.retention}.` : "Vos réponses sont gardées le temps de votre accompagnement, et au plus jusqu'à ce que vous les supprimiez.",
    ] },
    { h: "Sur un ordinateur partagé ?", p: ["Supprimez vos réponses avant de partir. Sinon, la personne suivante pourrait les ouvrir. Se déconnecter n'efface pas les données de cet appareil."] },
    { h: "À retenir.", p: ["Rien ne quitte votre appareil sans votre accord."] },
  ],
  assistant: [
    { h: "L'assistant est un programme.", p: ["C'est une intelligence artificielle (IA). Aucune personne ne lit son retour avant vous.", "Votre coach, lui, est une vraie personne. Ses remarques sont toujours signalées par « Votre coach »."] },
    { h: "Ce qu'il observe.", list: ["Votre rythme de parole.", "Vos pauses.", "Les exemples que vous donnez.", "Les petits mots qui reviennent souvent, comme « euh » ou « du coup ».", "L'ordre de vos idées.", "La direction de votre regard, si vous utilisez la caméra."] },
    { h: "Ce qu'il ne fait pas.", list: ["Il ne met pas de note.", "Il ne fait pas de classement.", "Il ne devine pas vos émotions, ni votre caractère.", "Il ne regarde pas les expressions de votre visage.", "Il ne décide de rien. Son retour ne change rien à vos droits ni à votre accompagnement."] },
    { h: "Pourquoi pas les émotions ?", p: ["Nous avons choisi de ne pas le faire. Une machine ne sait pas ce que vous ressentez.", "La loi européenne l'interdit aussi sur le lieu de travail et dans les établissements d'enseignement (règlement européen sur l'IA, article 5)."] },
    { h: "Ses limites.", p: ["L'assistant peut se tromper. Il comprend moins bien quand il y a du bruit, ou certains accents.", "Ses repères sont des habitudes d'entretien en France. Ils ne conviennent pas à tout le monde.", "Si un repère ne vous correspond pas, parlez-en à votre coach. C'est son avis qui compte."] },
    { h: "Vous pouvez vous en passer.", p: ["Vous pouvez vous enregistrer et vous revoir sans le retour de l'assistant. Vous pouvez aussi vous entraîner avec la voix seule, sans caméra."] },
    { h: "L'assistant de préparation d'entretien.", p: [
      "Il répond à vos questions sur la préparation d'un entretien. Pour une question sur le fonctionnement du site, la page « Questions fréquentes » vous répond.",
      REMOTE_LLM
        ? `Vos derniers messages et le métier que vous visez sont envoyés à un service d'IA${ORG.llmProvider ? ` (${ORG.llmProvider})` : ""} pour préparer la réponse. Ni image, ni son, ni nom.`
        : "Ses réponses viennent d'une liste préparée à l'avance, sur cet appareil. Vos questions ne sont envoyées nulle part. Elles ne sont pas enregistrées.",
    ] },
    { h: "La voix du recruteur.", p: ["Pendant l'entraînement, la question peut être lue à voix haute. C'est la voix de synthèse de votre appareil : rien n'est envoyé. Vous pouvez couper le son à tout moment."] },
  ],
  droits: [
    { p: ["Vos données vous appartiennent. Voici ce que vous pouvez faire."] },
    { h: "Voir vos données.", p: ["Tout ce qui vous concerne est dans votre espace : vos réponses, vos retours, les rapports de votre coach."] },
    { h: "Les supprimer.", p: ["Ouvrez une réponse, puis appuyez sur « Supprimer cette réponse ». Pour tout effacer : « Retirer mon accord », dans « Mon compte »."] },
    { h: "Les récupérer.", p: ["Dans votre espace, « Mes données » crée un fichier lisible avec votre parcours, vos réponses, leurs textes, les retours et les rapports de votre coach. Vos vidéos se téléchargent à part. Vous pouvez aussi imprimer un retour."] },
    { h: "Les corriger.", p: ["Vous pouvez changer votre métier dans votre espace. Demandez à votre coach de corriger votre prénom."] },
    { h: "Changer d'avis.", p: ["Vous pouvez retirer votre accord à tout moment. Vos réponses sont alors effacées. Votre accompagnement continue normalement."] },
    { h: "Besoin d'aide ?", p: [`Parlez-en à votre coach. Vous pouvez aussi écrire à ${orgName()}.`, dpoLine(), "Nous vous répondons en un mois au plus."] },
    { h: "Pas d'accord avec la réponse ?", p: ["Vous pouvez écrire à la CNIL, l'autorité qui protège les données en France : cnil.fr/fr/plaintes. C'est gratuit."] },
  ],
  appareil: [
    { p: ["Pour fonctionner, le site garde des informations dans votre navigateur. Elles servent seulement à vous rendre le service."] },
    { table: { head: ["Quoi", "Pourquoi", "Jusqu'à quand"], rows: [
      ["Votre code, votre prénom, votre métier, votre accord", "Pour ouvrir votre espace", "Jusqu'à ce que vous supprimiez tout"],
      ["Vos vidéos et vos enregistrements de voix", "Pour vous revoir", "Jusqu'à ce que vous les supprimiez"],
      ["Le texte de vos réponses et les retours", "Pour afficher vos retours", "Jusqu'à ce que vous les supprimiez"],
      ["Vos réponses au petit questionnaire d'échauffement", "Pour vous les montrer la fois suivante", "Jusqu'à ce que vous supprimiez tout"],
      ["Vos réglages d'accessibilité et de son", "Pour garder l'affichage que vous avez choisi", "Jusqu'à « Réinitialiser » ou l'effacement du navigateur"],
      ["Le choix de ne plus voir la bulle de l'assistant", "Pour ne pas vous la proposer deux fois", "Jusqu'à la fermeture de l'onglet"],
      ["Les outils téléchargés la première fois", "Pour préparer votre retour sans envoyer votre vidéo", "Gardés par le navigateur"],
    ] } },
    { p: ["Nous n'avons pas besoin de votre accord pour cela, car ces informations sont nécessaires au service que vous demandez. Nous vous le disons quand même. Il n'y a ni publicité, ni pistage, ni mesure d'audience."] },
    { h: "Le téléchargement des outils.", p: [PHRASES.download, toolsFrom] },
    ...(SELF_HOSTED_MODELS ? [] : [{ table: { head: ["Service", "Adresse", "Fichiers"], rows: THIRD_PARTIES } }]),
    { h: "Les polices de caractères.", p: ["Elles sont fournies par ce site lui-même. Aucun appel n'est fait à un service de polices extérieur."] },
    { h: "Sur un ordinateur partagé.", p: ["Supprimez vos réponses avant de partir. Se déconnecter n'efface pas les données de cet appareil."] },
    { h: "À savoir.", p: ["Votre navigateur peut effacer vos réponses tout seul si vous ne venez pas pendant plusieurs semaines. Elles sont aussi effacées si vous videz les données de navigation."] },
  ],
  notice: [
    { p: [`Version du ${LEGAL_DATE}.`] },
    { h: "Qui est responsable ?", p: [ORG.name ? `${ORG.name}${ORG.address ? `, ${ORG.address}` : ""}.` : "L'organisme d'accompagnement qui vous a donné votre code d'accès.", contactLine(), dpoLine()] },
    { h: "À quoi servent vos données ?", p: ["À vous entraîner à vos entretiens (embauche, mobilité, entretien professionnel), seul puis avec votre coach. À rien d'autre."] },
    { h: "Sur quelle base ?", p: [ORG.legalBasis || "Votre accord. Vous le donnez au début, et vous pouvez le retirer quand vous voulez.", "Utiliser La Répét' n'est pas obligatoire. Refuser ne change rien à votre accompagnement."] },
    { h: "Quelles données ?", list: ["Votre prénom et l'initiale de votre nom, donnés par votre coach.", "Le métier que vous visez.", "Vos enregistrements (vidéo ou voix), si vous vous enregistrez.", "Le texte de vos réponses et le retour de l'assistant.", "La direction de votre regard pendant la réponse, si vous utilisez la caméra et le retour de l'assistant.", "Le message que vous écrivez à votre coach, et son rapport.", "La date de votre accord."],
      p: ["Nous ne demandons pas votre adresse, votre courriel ni aucun numéro. Évitez de parler de votre santé dans vos réponses."] },
    { h: "Qui voit vos données ?", list: ["Vous.", "Votre coach, seulement pour les réponses que vous lui envoyez.", ...(ORG.host ? [`Notre hébergeur, qui n'a pas le droit de s'en servir : ${ORG.host}.`] : []), "Personne d'autre. Jamais un employeur. Jamais de publicité."] },
    { h: "Où sont vos données ?", p: [`Vos réponses sont gardées sur votre appareil tant que vous ne les envoyez pas. Le site est hébergé par ${hostLine()}. Comme tout hébergeur, il voit l'adresse internet (IP) de votre appareil.`, "Les outils sont téléchargés une fois : voir « Sur cet appareil »."] },
    { h: "Combien de temps ?", p: [ORG.retention || "Vos réponses sont gardées le temps de votre accompagnement, et au plus jusqu'à ce que vous les supprimiez."] },
    { h: "Une machine décide-t-elle pour vous ?", p: ["Non. L'assistant prépare un retour. Il ne décide de rien. Voir « L'assistant et l'IA »."] },
    { h: "Vos droits.", p: ["Voir, supprimer, récupérer, corriger, retirer votre accord. Voir « Vos droits ».", "Réclamation : CNIL, 3 place de Fontenoy, 75007 Paris, cnil.fr."] },
    { h: "Si vous nous contactez pour un projet d'accompagnement.", p: [
      "Votre nom, votre structure et vos coordonnées servent seulement à répondre à votre demande. Seule notre équipe les voit.",
      ORG.demoRetention ? `Durée de conservation : ${ORG.demoRetention}.` : "Ils sont supprimés quand ils ne servent plus à répondre à votre demande.",
    ] },
  ],
  coachs: [
    { p: ["Cette page s'adresse aux coachs qui utilisent l'espace coach."] },
    { h: "Ce que l'outil garde sur vous.", list: ["Votre nom affiché.", "Les parcours que vous créez.", "Vos remarques, vos commentaires et vos rapports.", "Les dates d'envoi, qui servent au délai moyen de relecture."] },
    { h: "Ce que vous voyez.", p: ["Vous voyez seulement les réponses que la personne accompagnée vous envoie. Les autres restent sur son appareil."] },
    { h: "Les chiffres de votre espace.", p: ["Ils portent sur l'ensemble des parcours. Aucun ne mesure la performance d'une personne ou d'un coach."] },
    { h: "Se déconnecter.", p: ["Se déconnecter n'efface pas les données de cet appareil."] },
    { h: "Qui est responsable ?", p: [`${OrgName()}.`, dpoLine().replace("par votre coach", "par votre référent")] },
  ],
  conditions: [
    { p: [`Version du ${LEGAL_DATE}. Proposé par ${orgName()}.`] },
    { h: "1. À quoi sert La Répét' ?", p: ["À vous entraîner à vos entretiens : entretien d'embauche, de mobilité ou professionnel. C'est un outil d'entraînement. Il ne vous évalue pas. Il ne décide de rien. Il ne change rien à vos droits ni à votre accompagnement."] },
    { h: "2. Comment y accéder ?", p: ["Avec le code d'accès que votre coach vous a donné. Il n'y a pas de compte ni de mot de passe. Ce code est personnel : gardez-le pour vous."] },
    { h: "3. Ce que vous faites.", p: ["Vous vous enregistrez pour vous entraîner. Vous décidez seul d'envoyer une réponse à votre coach.", "Enregistrez-vous seulement vous. Ne filmez pas une autre personne sans son accord."] },
    { h: "4. Ce que fait l'assistant.", p: ["L'assistant est un programme. Son retour s'affiche tout de suite, sans relecture par une personne. Il décrit des faits. Il ne met pas de note. Il ne devine pas vos émotions. Il peut se tromper."] },
    { h: "5. Ce que fait votre coach.", p: ["Le retour de l'assistant s'affiche tout de suite. Votre coach ne le voit que si vous le lui envoyez. Il peut alors le compléter ou le contredire. Vos réponses ne sont jamais transmises à un employeur."] },
    { h: "6. Vos données.", p: ["Tout est expliqué dans « Vos données ». Vous pouvez tout supprimer quand vous voulez."] },
    { h: "7. Qui propose cet outil ?", p: [`${OrgName()}${ORG.address ? `, ${ORG.address}` : ""}. Voir les mentions légales.`] },
  ],
  mentions: [
    { h: "Qui publie ce site ?", p: [
      ORG.name ? [ORG.name, ORG.legalForm, ORG.address].filter(Boolean).join(", ") + "." : "L'organisme d'accompagnement qui met La Répét' à votre disposition.",
      ...(ORG.registration ? [`Immatriculation : ${ORG.registration}.`] : []),
      contactLine(),
      ...(ORG.publisher ? [`Responsable de la publication : ${ORG.publisher}.`] : []),
    ] },
    { h: "Qui héberge ce site ?", p: [`${hostLine()}.`] },
    { h: "Exemples.", p: ["Les noms de personnes dans les exemples et les illustrations sont inventés."] },
    { h: "Polices de caractères.", p: ["Manrope, Inter, JetBrains Mono et Atkinson Hyperlegible, sous licence SIL Open Font License 1.1, servies par ce site."] },
    { h: "Photos.", p: ["Photos issues d'Unsplash, sous la licence Unsplash."] },
    { h: "Vos données. Accessibilité.", p: ["Voir « Vos données » et « Accessibilité »."] },
  ],
  accessibilite: [
    { p: [`${OrgName()} veut que La Répét' soit utilisable par tout le monde.`] },
    { h: "Où en sommes-nous ?", p: ["**Accessibilité : non conforme.** Le site n'a pas encore été vérifié par un audit complet selon le référentiel RGAA."] },
    { h: "Ce qui est déjà fait.", list: ["Vous pouvez utiliser le site au clavier.", "Les couleurs sont choisies pour être lisibles, en thème clair et en thème sombre.", "Le bouton « Options d'accessibilité », en haut de chaque page, permet d'agrandir le texte, de changer de thème, de renforcer le contraste, de choisir une police plus lisible, d'espacer le texte, de réduire les animations, de masquer les éléments décoratifs et d'afficher une règle de lecture.", "Les animations s'arrêtent si vous l'avez demandé dans les réglages de votre appareil.", "Vous pouvez vous entraîner avec la voix seule, sans caméra."] },
    { h: "Ce qui n'est pas encore accessible.", p: ["Connu à ce jour : vidéos sans sous-titres en relecture ; test complet au lecteur d'écran non réalisé ; consignes en français facile à lire et à comprendre non rédigées."] },
    { h: "Un problème ?", p: [ORG.a11yContact ? `Écrivez-nous : ${ORG.a11yContact}. Dites-nous la page et ce qui vous bloque.` : "Parlez-en à votre coach : dites la page et ce qui vous bloque. L'équipe cherche une solution avec vous."] },
    { h: "Si vous n'obtenez pas de réponse.", p: ["Vous pouvez écrire au Défenseur des droits : formulaire en ligne sur formulaire.defenseurdesdroits.fr, ou par courrier gratuit, sans timbre : Défenseur des droits, Libre réponse 71120, 75342 Paris CEDEX 07."] },
    ...(ORG.a11yPlanUrl ? [{ h: "Schéma pluriannuel et plan d'actions.", p: [ORG.a11yPlanUrl] }] : []),
  ],
};

/* Intro (chapeau) de chaque page. */
export const LEADS = {
  hub: "L'essentiel en six points. Chaque carte mène à une page plus complète.",
  video: "Rien ne quitte votre appareil sans votre accord.",
  assistant: "Un programme qui décrit des faits. Pas de note, pas d'émotion.",
  droits: "Supprimer, récupérer, corriger, changer d'avis.",
  appareil: PHRASES.noTracking,
  notice: "Le texte complet, au sens de l'article 13 du RGPD.",
  coachs: PHRASES.coachLogin,
  conditions: "La Répét' sert à vous entraîner. Elle ne décide de rien.",
  mentions: "Qui publie ce site, et qui l'héberge.",
  accessibilite: "Accessibilité : non conforme. Aucun audit n'a encore été réalisé.",
};
