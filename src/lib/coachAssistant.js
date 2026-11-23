/* Assistant de rédaction du rapport (côté coach).

   Il aide le coach à écrire le rapport qu'il renverra à la personne accompagnée : astuces concrètes liées
   aux observations de la réponse relue, au métier visé et à la question posée ; formulations de remarques
   positives et non évaluatives ; reformulation d'une remarque dans le ton de la charte ; idées de mot
   d'introduction et pistes pour le débriefing en atelier. Le coach garde la main : chaque proposition
   s'insère dans le brouillon, qu'il relit avant envoi.

   Deux modes, comme l'assistant de préparation (src/lib/assistant.js) :
   - moteur local, base propre au coach (au moins 40 entrées par observation et par situation) ;
   - modèle de langage si VITE_LLM_ENDPOINT est défini, avec un prompt système propre au coach.
   Toute sortie passe par coachCompliant() (textCompliant strict + refus des jugements sur la personne) :
   ce qui ne passe pas est écarté. Les textes s'adressent à la personne, au vouvoiement. */

import { textCompliant } from "./compliance.js";
import { dePoste } from "./text.js";
import { stripAccents } from "./text.js";
import { llmEnabled, llmComplete, LLM_TIMEOUT_MS } from "./llm.js";

/* ─── Garde-fou ─── */
/* Jugement sur la personne ou appréciation chiffrée ou globale : refusé, en plus des règles d'isCompliant. */
const JUDGE = /\b(nul|nulle|nuls|mauvais|mauvaise|médiocre|insuffisan\w*|faible|faibles|raté|ratée|incapable|paresseu\w*|bravo|excellent\w*|parfait\w*|génial\w*|catastroph\w*|horrible|lamentable|décevant\w*|brillant\w*|doué\w*|talentueu\w*|vous êtes (?:trop|très|un|une|quelqu|vraiment|plutôt|assez|si)|tu es|t'es|il faut absolument|niveau \d|sur dix|sur vingt)\b/i;
export function coachCompliant(text) {
  const t = String(text || "").trim();
  if (!t || t.length > 900) return false;
  if (/\u2014/.test(t)) return false;
  if (JUDGE.test(t)) return false;
  return textCompliant(t, "strict");
}
const keep = list => list.filter(coachCompliant);

/* ─── Situations : catégorie de la question posée et famille du métier visé ─── */
const norm = stripAccents;
export const QUESTION_KINDS = {
  presentation: { label: "présentation", keys: ["presenter", "presentez", "parlez-moi de vous", "parlez moi de vous", "votre parcours"] },
  motivation: { label: "motivation", keys: ["pourquoi ce poste", "pourquoi notre", "interesse", "motivation", "envie de postuler", "pourquoi vous"] },
  experience: { label: "expérience", keys: ["experience", "racontez", "exemple", "situation ou", "avez-vous deja", "avez vous deja"] },
  qualites: { label: "qualités et axes de progrès", keys: ["qualite", "defaut", "point fort", "progresser", "axe de progres", "point faible"] },
  situation: { label: "mise en situation", keys: ["que feriez-vous", "que faites-vous", "comment reagiriez", "client", "difficile", "commande", "patient", "si un"] },
  parcours: { label: "parcours", keys: ["quitte", "dernier emploi", "trou", "periode sans", "interruption", "reconversion"] },
  questions: { label: "questions au recruteur", keys: ["des questions", "questions a nous poser", "question a nous poser"] },
  accueil: { label: "accueil", keys: ["entendu parler", "comment avez-vous connu", "pour commencer"] },
};
export function questionKind(q) {
  const n = norm(q);
  for (const [id, k] of Object.entries(QUESTION_KINDS)) if (k.keys.some(x => n.includes(norm(x)))) return id;
  return "generique";
}
const JOB_FAMILIES = [
  ["accueil", ["accueil", "hote", "standard", "receptionn", "secretaire", "assistant administratif"], "Dans un métier d'accueil, le recruteur imagine déjà vos échanges avec le public : une réponse posée et claire l'aide à vous y projeter."],
  ["vente", ["vend", "caiss", "commerc", "conseill", "magasin", "employe libre"], "Dans la vente, une réponse claire et appuyée sur une situation de clientèle parle directement au recruteur."],
  ["soin", ["soign", "infirm", "auxiliaire", "aide a domicile", "aide-soignant", "puericult", "accompagnant"], "Dans les métiers du soin et de l'aide, les situations vécues auprès des personnes sont les exemples que le recruteur retient le mieux."],
  ["restauration", ["serveu", "cuisin", "restaur", "plonge", "barman", "commis"], "En restauration, le recruteur cherche des exemples de service, de rythme et de travail en équipe : ce sont de bons appuis pour vos réponses."],
  ["logistique", ["prepar", "magasinier", "cariste", "logisti", "manutention", "chauffeur", "livreu"], "En logistique, les exemples précis (volumes, consignes, sécurité) rendent une réponse concrète et facile à retenir."],
  ["batiment", ["macon", "electric", "plomb", "peintre", "batiment", "menuisi", "agent d'entretien", "jardin"], "Dans le bâtiment et l'entretien, décrire un chantier ou une tâche précise montre concrètement ce que vous savez faire."],
  ["bureau", ["comptab", "gestion", "informati", "developpeu", "administr", "assistant", "chargé", "charge"], "Dans un métier de bureau, une réponse structurée en quelques étapes reflète la façon dont vous organisez votre travail."],
];
export function jobFamily(poste) {
  const n = norm(poste);
  const hit = JOB_FAMILIES.find(([, keys]) => keys.some(k => n.includes(norm(k))));
  return hit ? hit[0] : "generique";
}
const jobHook = poste => { const f = JOB_FAMILIES.find(([id]) => id === jobFamily(poste)); return f ? f[2] : poste ? `Pour un poste ${dePoste(poste)}, des exemples tirés de situations proches du métier rendent la réponse facile à retenir.` : ""; };

/* Phrases de liaison selon la question posée : pourquoi l'astuce compte pour cette question-là (3 par catégorie). */
const KIND_HOOKS = {
  presentation: ["Sur une présentation, cela aide le recruteur à retenir les étapes de votre parcours.", "La présentation ouvre souvent l'entretien : c'est un bon moment pour poser ce repère.", "En deux minutes de présentation, ce point fait gagner en clarté."],
  motivation: ["Sur la motivation, cela rend votre intérêt pour le poste concret et vérifiable.", "Quand on parle de son intérêt pour un poste, ce repère aide le recruteur à suivre votre raisonnement.", "Pour une question de motivation, ce point relie votre projet au poste proposé."],
  experience: ["Quand on raconte une expérience, cela aide le recruteur à visualiser la situation.", "Pour un récit d'expérience, ce repère met en valeur ce que vous avez fait, vous.", "Sur une question d'expérience, ce point rend le récit facile à suivre du début à la fin."],
  qualites: ["Sur les qualités, cela transforme une qualité annoncée en qualité démontrée.", "Pour parler d'un axe de progrès, ce repère montre comment vous avancez concrètement.", "Quand on parle de ses qualités, ce point donne au recruteur une preuve à retenir."],
  situation: ["En mise en situation, cela montre au recruteur comment vous agiriez, étape par étape.", "Pour une mise en situation, ce repère rend votre réponse opérationnelle.", "Face à un cas pratique, ce point aide le recruteur à se projeter avec vous dans le poste."],
  parcours: ["Pour expliquer un moment de parcours, cela permet de vite revenir à ce que vous en retirez.", "Sur une question de parcours, ce repère garde la réponse courte et tournée vers la suite.", "Quand on parle d'une période particulière, ce point aide à présenter les faits simplement."],
  questions: ["Pour les questions au recruteur, cela montre que vous vous projetez déjà dans le poste.", "En fin d'entretien, ce repère laisse une dernière impression claire.", "Quand vient votre tour de poser des questions, ce point rend l'échange naturel."],
  accueil: ["Dès les premières phrases, ce repère donne le ton de l'échange.", "En début d'entretien, ce point installe une conversation simple.", "Sur une question d'accueil, ce repère prépare bien la suite de l'entretien."],
  generique: ["Ce repère aide le recruteur à suivre et à retenir votre réponse.", "C'est une convention répandue en entretien, qui varie selon les secteurs.", "Ce point se travaille bien à l'entraînement, en refaisant la même question."],
};

/* ─── Base locale : astuces par observation (dimension de l'analyse) et par situation (appui ou à explorer) ───
   appui : formulations positives et descriptives, à reprendre telles quelles ou à adapter ;
   explorer : astuces concrètes à proposer, présentées comme des pistes. */
export const DIM_LABELS = {
  debit: "Rythme de parole", pauses: "Pauses", exemples: "Exemples concrets", "petits-mots": "Petits mots répétés", appui: "Petits mots répétés",
  structure: "Construction de la réponse", regard: "Direction du regard", repetitions: "Mots qui reviennent", captation: "Son enregistré",
};
export const TIPS = {
  debit: {
    appui: [
      "Votre rythme laisse au recruteur le temps de suivre chaque idée.",
      "Vous parlez à un rythme régulier du début à la fin de la réponse.",
      "Votre rythme reste posé, même quand la réponse se prolonge.",
      "Le rythme de votre réponse permet de bien entendre les informations importantes.",
      "Vous prenez le temps de terminer vos phrases, ce qui rend la réponse facile à suivre.",
      "Votre rythme correspond à ce que l'on observe souvent dans un échange d'entretien.",
      "Vous ralentissez sur les informations clés : elles ressortent bien.",
      "Le rythme choisi donne de la place à chaque exemple.",
      "Votre réponse se déroule sans précipitation, phrase après phrase.",
      "Vous gardez le même rythme en début et en fin de réponse : l'ensemble est homogène.",
    ],
    explorer: [
      "Vous pouvez ralentir légèrement sur les chiffres, les dates et les noms : ce sont les informations que le recruteur retient.",
      "Une piste : marquer un temps après chaque idée importante, le temps d'une respiration.",
      "Essayez de lire votre première phrase à voix haute deux fois, la seconde un peu plus lentement, puis enregistrez-vous.",
      "Vous pouvez viser des phrases plus courtes : une idée par phrase aide à poser le rythme.",
      "Une astuce : imaginer que vous expliquez votre réponse à quelqu'un qui prend des notes.",
      "Vous pouvez repérer dans le texte de la réponse le passage le plus rapide et le refaire seul, plus posément.",
      "Essayez de commencer la réponse un peu plus lentement que d'habitude : le reste suit souvent ce premier rythme.",
      "Une piste : souligner trois mots clés avant de répondre et les dire en ralentissant.",
      "Vous pouvez vous chronométrer : une présentation de deux minutes laisse le temps de poser chaque étape.",
      "Une astuce simple : terminer chaque phrase par un vrai point, à l'oral, avant de commencer la suivante.",
      "Vous pouvez refaire la même question en visant une phrase de moins, dite plus lentement.",
      "Si le rythme accélère en fin de réponse, préparer sa phrase de conclusion à l'avance aide à le garder.",
    ],
  },
  pauses: {
    appui: [
      "Vos pauses découpent la réponse en étapes faciles à suivre.",
      "Vous marquez un temps avant les informations importantes, ce qui les met en valeur.",
      "Les silences de votre réponse restent courts et laissent respirer le propos.",
      "Vous prenez un temps de réflexion avant de répondre, ce qui est courant et bienvenu en entretien.",
      "Vos pauses tombent entre les idées, pas au milieu des phrases.",
      "La réponse alterne parole et courts silences de façon régulière.",
      "Vous reprenez le fil après chaque pause sans perdre votre idée.",
      "Les temps de pause donnent au recruteur l'occasion d'enregistrer ce que vous dites.",
      "Vous utilisez les pauses pour passer d'une étape à l'autre de la réponse.",
      "Votre réponse garde un déroulé continu, avec des respirations bien placées.",
    ],
    explorer: [
      "Un silence de quelques secondes est courant en entretien : vous pouvez le présenter avec une phrase comme « Laissez-moi réfléchir un instant ».",
      "Une piste : préparer deux ou trois mots repères par question pour retrouver le fil après une pause.",
      "Vous pouvez noter sur une feuille les étapes de votre réponse et les garder sous les yeux pendant l'entraînement.",
      "Une astuce : reformuler la question à voix haute laisse le temps de rassembler ses idées.",
      "Vous pouvez essayer de placer les pauses entre deux idées plutôt qu'au milieu d'une phrase.",
      "Une piste : terminer une idée, respirer, puis annoncer la suivante (« Ensuite… »).",
      "Vous pouvez revoir le moment de la plus longue pause et préparer une phrase de reprise pour ce passage.",
      "Une astuce : s'entraîner avec la même question trois fois de suite, les pauses se raccourcissent souvent d'elles-mêmes.",
      "Vous pouvez boire une gorgée d'eau avant de répondre : c'est accepté en entretien et cela laisse un temps de préparation.",
      "Une piste : préparer une phrase d'ouverture fixe pour chaque question fréquente, le reste vient plus facilement.",
      "Si une pause vient d'un oubli, vous pouvez dire simplement « Je reviens à mon exemple » et reprendre.",
      "Vous pouvez vous enregistrer en voix seule pour vous concentrer sur l'enchaînement des idées.",
    ],
  },
  exemples: {
    appui: [
      "Vous citez une situation précise, que le recruteur peut facilement retenir.",
      "Votre exemple contient un détail concret (un lieu, une durée, un chiffre) qui rend la réponse vivante.",
      "Vous décrivez ce que vous avez fait, vous, dans la situation : c'est ce que le recruteur cherche à entendre.",
      "Votre réponse s'appuie sur une expérience vécue, pas seulement sur des qualités annoncées.",
      "Vous expliquez le résultat de votre action : l'exemple va jusqu'au bout.",
      "L'exemple choisi est en lien direct avec le poste visé.",
      "Vous datez votre expérience, ce qui la rend vérifiable et concrète.",
      "Votre exemple illustre bien la qualité dont vous parlez.",
      "Vous racontez la situation dans l'ordre, ce qui la rend facile à suivre.",
      "Le détail chiffré de votre exemple donne une idée claire de votre expérience.",
    ],
    explorer: [
      "Vous pouvez ajouter un exemple vécu : une situation, ce que vous avez fait, et ce qui en est ressorti.",
      "Une piste : la méthode « situation, action, résultat » aide à construire un exemple en trois phrases.",
      "Vous pouvez préparer à l'avance trois exemples tirés de vos expériences, à réutiliser selon les questions.",
      "Une astuce : ajouter un chiffre ou une durée (« pendant deux ans », « une vingtaine de clients par jour ») rend l'exemple concret.",
      "Vous pouvez remplacer une qualité annoncée par une situation où elle s'est vue.",
      "Une piste : un exemple peut venir d'une expérience bénévole, d'un stage ou de la vie quotidienne.",
      "Vous pouvez préciser votre rôle dans l'exemple : ce que vous avez fait, vous, plutôt que l'équipe.",
      "Une astuce : terminer l'exemple par ce que vous en avez retiré pour le poste visé.",
      "Vous pouvez choisir un exemple récent, plus facile à raconter avec des détails.",
      "Une piste : noter pour chaque expérience passée une réussite et une difficulté surmontée.",
      "Vous pouvez relier explicitement l'exemple à la question posée (« C'est pour cela que ce poste m'intéresse »).",
      "Une astuce : un exemple court et précis vaut souvent mieux qu'une longue liste d'expériences.",
    ],
  },
  "petits-mots": {
    appui: [
      "Les petits mots de liaison restent rares : la réponse est fluide.",
      "Votre réponse va droit au but, sans mots de remplissage.",
      "Vous enchaînez vos phrases sans hésitation marquée.",
      "Les quelques petits mots présents ne gênent pas la compréhension.",
      "Vous remplacez les hésitations par de courts silences, ce qui rend la réponse plus nette.",
      "Les transitions entre vos idées sont claires et directes.",
      "Votre réponse garde un fil continu, avec très peu de petits mots répétés.",
      "Vous commencez vos phrases directement par l'idée principale.",
      "Le texte de votre réponse se lit facilement : les mots de remplissage sont peu nombreux.",
      "Vous passez d'une idée à l'autre avec des mots de liaison utiles (« ensuite », « par exemple »).",
    ],
    explorer: [
      "Vous pouvez remplacer un « euh » par un court silence : à l'oral, il passe presque toujours inaperçu.",
      "Une piste : relire le texte de la réponse et entourer les petits mots qui reviennent, pour les repérer à l'oreille.",
      "Vous pouvez préparer quelques mots de liaison utiles (« ensuite », « par exemple », « pour finir ») qui remplacent les hésitations.",
      "Une astuce : s'enregistrer sur une seule phrase et la redire jusqu'à ce qu'elle sorte sans petit mot.",
      "Vous pouvez ralentir légèrement : les petits mots apparaissent souvent quand le rythme accélère.",
      "Une piste : préparer la première phrase de chaque réponse mot pour mot, c'est là que les hésitations sont les plus fréquentes.",
      "Vous pouvez vous entraîner avec un proche qui lève la main à chaque « du coup » : le repère devient vite naturel.",
      "Une astuce : marquer une pause plutôt que de dire « voilà » en fin de phrase.",
      "Vous pouvez travailler une seule expression à la fois, celle qui revient le plus souvent.",
      "Une piste : terminer la réponse par une phrase de conclusion préparée évite les « voilà, euh » de fin.",
      "Vous pouvez réécouter la réponse en ne suivant que les petits mots : les repérer est déjà la moitié du travail.",
      "Une astuce : respirer avant de commencer une nouvelle idée laisse moins de place aux mots d'attente.",
    ],
  },
  structure: {
    appui: [
      "Votre réponse a un début, un développement et une conclusion.",
      "Vous annoncez votre idée principale dès la première phrase.",
      "Votre réponse se termine par une phrase qui résume votre propos.",
      "Les étapes de votre réponse s'enchaînent dans un ordre logique.",
      "Vos phrases ont une longueur qui permet de bien suivre le raisonnement.",
      "Vous revenez à la question posée en fin de réponse : le lien est clair.",
      "Vous organisez votre réponse dans le temps, du passé vers le projet.",
      "Chaque partie de la réponse apporte une information nouvelle.",
      "Votre réponse tient en quelques idées bien distinctes.",
      "Vous concluez en reliant votre propos au poste visé.",
    ],
    explorer: [
      "Vous pouvez annoncer le plan en une phrase (« Je vais vous parler de mon parcours, puis de ce qui m'amène ici »).",
      "Une piste : préparer une phrase de conclusion qui revient au poste visé.",
      "Vous pouvez découper la réponse en trois temps : hier, aujourd'hui, demain.",
      "Une astuce : une idée par phrase rend la réponse plus facile à suivre.",
      "Vous pouvez raccourcir les phrases les plus longues repérées dans le texte de la réponse.",
      "Une piste : commencer par la réponse directe à la question, puis donner les détails.",
      "Vous pouvez utiliser des mots repères (« d'abord », « ensuite », « enfin ») pour signaler les étapes.",
      "Une astuce : relire la question avant de conclure, pour vérifier que la réponse y répond bien.",
      "Vous pouvez préparer une trame courte pour les questions les plus fréquentes et vous y tenir à l'entraînement.",
      "Une piste : terminer par une phrase tournée vers la suite (« C'est ce que j'aimerais apporter dans ce poste »).",
      "Vous pouvez viser deux minutes pour une présentation : cela oblige à choisir l'essentiel.",
      "Une astuce : écrire les trois idées principales sur un papier, puis répondre sans regarder.",
    ],
  },
  regard: {
    appui: [
      "Votre regard reste orienté vers l'écran la plupart du temps, comme face à un interlocuteur.",
      "Vous revenez vers l'écran après chaque moment de réflexion.",
      "Votre visage reste bien dans le cadre tout au long de la réponse.",
      "Votre regard accompagne les moments importants de la réponse.",
      "Vous gardez la caméra à hauteur des yeux : le cadrage est stable.",
      "Les moments où le regard s'éloigne restent courts.",
      "Vous regardez vers l'écran au début et à la fin de la réponse, deux moments que le recruteur remarque.",
      "Votre installation (lumière, cadrage) permet de bien voir votre visage.",
      "Votre regard reste dirigé vers l'interlocuteur pendant vos exemples.",
      "Le cadrage choisi correspond à ce qui est attendu dans un entretien en visio.",
    ],
    explorer: [
      "Vous pouvez placer la caméra à hauteur des yeux, en surélevant l'ordinateur ou le téléphone.",
      "Une piste : coller un petit repère à côté de la caméra pour y revenir naturellement.",
      "Vous pouvez garder vos notes en haut de l'écran, près de la caméra, plutôt que sur la table.",
      "Une astuce : regarder la caméra au début et à la fin de chaque réponse, c'est ce que le recruteur remarque le plus.",
      "Vous pouvez vérifier la lumière : face à une fenêtre plutôt que dos à elle.",
      "Une piste : regarder ailleurs pour réfléchir est courant ; l'essentiel est de revenir vers l'écran pour la suite.",
      "Vous pouvez vous entraîner en visio avec un proche pour vous habituer à parler à la caméra.",
      "Une astuce : réduire la fenêtre de votre propre image évite de la regarder pendant la réponse.",
      "Vous pouvez reculer légèrement pour que le visage et les épaules soient dans le cadre.",
      "Une piste : pendant un entretien en présentiel, regarder chaque recruteur à tour de rôle si plusieurs personnes sont présentes.",
      "Vous pouvez stabiliser le téléphone sur un support pour garder le même cadrage.",
      "Une astuce : relire la question sur une feuille posée derrière l'écran, à hauteur des yeux.",
    ],
  },
  repetitions: {
    appui: [
      "Votre vocabulaire est varié tout au long de la réponse.",
      "Vous reformulez vos idées avec des mots différents.",
      "Les mots du métier que vous employez sont justes.",
      "Vous utilisez des mots précis pour décrire vos tâches.",
      "Vous reprenez les mots de l'annonce, ce qui montre que vous l'avez lue.",
    ],
    explorer: [
      "Vous pouvez préparer deux ou trois synonymes pour les mots qui reviennent souvent.",
      "Une piste : reprendre quelques mots de l'annonce, qui sont aussi ceux du recruteur.",
      "Vous pouvez remplacer un mot général (« faire », « chose ») par un verbe d'action précis (« organiser », « accueillir »).",
      "Une astuce : relire le texte de la réponse et surligner le mot le plus fréquent.",
      "Vous pouvez lister les tâches du métier visé avec leurs mots exacts avant de vous entraîner.",
    ],
  },
  captation: {
    appui: ["Le son est clair et permet de bien comprendre la réponse."],
    explorer: [
      "Vous pouvez vous rapprocher du micro ou choisir une pièce moins bruyante pour la prochaine réponse.",
      "Une piste : faire un court essai de son avant de répondre, puis réécouter.",
      "Vous pouvez couper les sources de bruit (télévision, fenêtre) le temps de l'enregistrement.",
    ],
  },
};

/* Astuces liées à la question posée (indépendantes de l'observation). */
export const KIND_TIPS = {
  presentation: ["Une présentation peut suivre trois temps : votre parcours, ce que vous savez faire, ce qui vous amène vers ce poste.", "Vous pouvez terminer la présentation par une phrase qui relie votre parcours au poste visé.", "Une astuce : préparer la première phrase de la présentation mot pour mot."],
  motivation: ["Vous pouvez citer un élément précis de l'annonce ou de l'entreprise qui vous intéresse.", "Une piste : relier votre intérêt pour le poste à une expérience que vous avez vécue.", "Vous pouvez expliquer ce que vous aimeriez apporter, en plus de ce que le poste vous apporte."],
  experience: ["La méthode « situation, action, résultat » aide à raconter une expérience en trois phrases.", "Vous pouvez préciser ce que vous avez fait, vous, dans la situation racontée.", "Une astuce : terminer le récit par ce que l'expérience vous a appris pour le poste."],
  qualites: ["Vous pouvez illustrer chaque qualité par un exemple vécu.", "Pour un axe de progrès, une piste : dire ce que vous mettez déjà en place pour avancer.", "Vous pouvez choisir des qualités en lien direct avec les missions du poste."],
  situation: ["En mise en situation, vous pouvez décrire les étapes dans l'ordre : ce que vous faites d'abord, puis ensuite.", "Une piste : dire à qui vous feriez appel si la situation dépasse votre rôle.", "Vous pouvez vous appuyer sur une situation proche déjà vécue."],
  parcours: ["Vous pouvez présenter les faits en une ou deux phrases, puis parler de ce que vous en retirez.", "Une piste : préparer une phrase de transition vers votre projet actuel.", "Vous pouvez citer ce que vous avez fait pendant la période (formation, bénévolat, démarches)."],
  questions: ["Vous pouvez préparer deux questions sur le poste ou l'équipe.", "Une piste : demander comment se passe une journée type dans le poste.", "Vous pouvez demander quelles sont les prochaines étapes du recrutement."],
  accueil: ["Vous pouvez préparer une réponse courte sur la façon dont vous avez connu l'offre.", "Une piste : remercier le recruteur en une phrase avant de commencer.", "Vous pouvez enchaîner sur ce qui vous a donné envie de répondre à l'annonce."],
  generique: ["Vous pouvez reprendre la même question à l'entraînement en visant une seule piste à la fois.", "Une piste : réécouter la réponse le lendemain, avec un regard neuf.", "Vous pouvez noter les questions qui vous semblent les plus difficiles et les travailler en premier."],
};

/* Repère « Petits mots répétés » : identifiant « petits-mots », ancien « appui » encore lu (ARC-19). */
export const dimKey = id => (id === "appui" ? "petits-mots" : id);

/* Entrées d'une observation dans une situation donnée : formulations de base, puis variantes reliées
   à la question posée et au métier visé. Au moins 40 entrées par observation principale et par situation. */
export function entriesFor(dimId0, type, { question, poste } = {}) {
  const dimId = dimKey(dimId0);
  const base = TIPS[dimId]?.[type === "appui" ? "appui" : "explorer"] || [];
  const kind = questionKind(question);
  const hooks = [...KIND_HOOKS[kind], ...KIND_HOOKS.generique];
  const out = [...base];
  for (const h of hooks) for (const b of base) out.push(`${b} ${h}`);
  const jh = jobHook(poste);
  if (jh) for (const b of base) out.push(`${b} ${jh}`);
  return keep([...new Set(out)]);
}

/* ─── Formulations positives non évaluatives (en plus de celles des observations « appui ») ─── */
const POSITIVE_GENERIC = [
  "Vous répondez directement à la question posée.",
  "Vous avez pris le temps de vous entraîner sur cette question : c'est la meilleure façon de progresser.",
  "Votre réponse contient plusieurs éléments que l'on peut garder pour le prochain entretien.",
  "Vous parlez de votre expérience avec des mots précis.",
  "On comprend bien ce que vous avez fait dans votre parcours.",
  "Vous reliez votre réponse au poste visé.",
  "Vous avez choisi de m'envoyer cet entretien : c'est une bonne base pour en parler ensemble.",
  "Votre réponse donne envie d'en savoir plus sur votre expérience.",
];

/* ─── Mot d'introduction ─── */
export function introIdeas({ prenom, question, poste, dims = [] }) {
  const p = prenom ? prenom.split(" ")[0] : "";
  const hi = p ? `${p}, ` : "";
  const ap = dims.find(d => d.type === "appui");
  const ex = dims.find(d => d.type === "explorer");
  const q = question ? `« ${question} »` : "cette question";
  const job = poste ? ` pour le poste ${dePoste(poste)}` : "";
  return keep([
    `${hi}merci de m'avoir envoyé votre entretien sur ${q}. Je l'ai regardé avec attention et je vous propose quelques repères pour la suite.`,
    `${hi}j'ai relu votre entretien sur ${q}. ${ap ? `Je retiens d'abord un point d'appui : ${ap.titre.toLowerCase()}. ` : ""}Vous trouverez mes remarques à côté de chaque repère.`,
    `${hi}merci pour cet entraînement${job}. ${ex ? `Je vous propose de travailler en priorité sur un point : ${ex.titre.toLowerCase()}. ` : ""}Nous pourrons en reparler ensemble lors de notre prochain rendez-vous.`,
    `${hi}vous avez fait la démarche de vous entraîner et de m'envoyer votre entretien : c'est précieux. Voici ce que j'ai observé, avec une ou deux pistes concrètes.`,
    `${hi}voici mes remarques sur votre réponse à ${q}. Les repères de l'assistant sont complétés par mes remarques : prenez ce qui vous est utile.`,
    `${hi}j'ai regardé votre vidéo. J'ai ajouté des remarques à certains moments précis : cliquez sur un repère pour revoir le passage.`,
    `${hi}merci pour votre envoi. Mon conseil pour la prochaine fois tient en une phrase, vous la trouverez plus bas. Le reste est déjà une bonne base.`,
    `${hi}votre réponse${job} nous donne de quoi travailler ensemble. Je vous propose de la refaire après avoir lu mes remarques, puis de me renvoyer la nouvelle version si vous le souhaitez.`,
  ]);
}

/* ─── Pistes pour le débriefing en atelier ─── */
export function debriefIdeas({ question, poste, dims = [] }) {
  const kind = questionKind(question);
  const ex = dims.filter(d => d.type === "explorer").map(d => d.titre.toLowerCase());
  const out = [
    "Commencer l'atelier par ce que la personne retient elle-même de sa réponse, avant tout retour.",
    "Revoir ensemble le premier moment de la vidéo et demander ce que la personne referait de la même façon.",
    "Proposer de refaire la même question en direct, en visant une seule piste à la fois.",
    "Inviter le groupe à relever un point d'appui chez chaque participant avant de parler des pistes.",
    "Construire ensemble un exemple avec la méthode « situation, action, résultat » à partir de l'expérience de la personne.",
    "Faire un jeu de rôle court : un participant joue le recruteur et pose la question, un autre observe un seul repère.",
    "Comparer deux versions de la même réponse (avant et après l'atelier) en réécoutant seulement la première phrase.",
    "Terminer l'atelier en demandant à chacun la piste qu'il travaillera avant le prochain entraînement.",
    `Préparer en binôme les deux questions que la personne pourrait poser au recruteur${poste ? ` pour un poste ${dePoste(poste)}` : ""}.`,
    "Afficher les repères de l'assistant et demander au groupe de les formuler avec ses propres mots.",
  ];
  if (ex.length) out.unshift(`Choisir avec la personne une seule piste parmi celles repérées (${ex.slice(0, 3).join(", ")}) et la travailler pendant l'atelier.`);
  if (kind !== "generique") out.unshift(`Travailler en groupe d'autres questions de ${QUESTION_KINDS[kind].label} pour réutiliser les mêmes repères.`);
  return keep(out);
}

/* ─── Reformulation d'une remarque dans le ton de la charte ───
   Règles locales : vouvoiement, formulation en piste (« vous pouvez »), sans jugement sur la personne,
   sans note ni émotion supposée. Les phrases qui décrivent un ressenti ou jugent la personne sont retirées. */
/* Mot entier, en tenant compte des lettres accentuées (\b ne les reconnaît pas). */
const w = (pat, flags = "giu") => new RegExp(`(?<![\\p{L}])(?:${pat})(?![\\p{L}])`, flags);
const SUBS = [
  [w("tu es"), "vous êtes"], [w("tu"), "vous"], [/(?<![\p{L}])t'(?=\p{L})/giu, "vous "], [w("ton"), "votre"], [w("ta"), "votre"], [w("tes"), "vos"], [w("toi"), "vous"],
  [w("garde"), "gardez"], [w("continue"), "continuez"], [w("essaie"), "essayez"], [w("pense à"), "pensez à"], [w("fais"), "faites"], [w("dis"), "dites"], [w("regarde"), "regardez"], [w("ralentis"), "ralentissez"],
  [w("il faut que vous"), "vous pouvez"], [w("il faut"), "vous pouvez"], [w("vous devez"), "vous pouvez"], [w("vous devriez"), "vous pouvez"], [w("il ne faut pas"), "mieux vaut éviter de"],
  [w("c'est (?:bien|très bien|bon|super|top)"), "ce point fonctionne"], [w("pas assez"), "un peu plus"],
  [w("trop vite"), "à un rythme rapide"], [w("trop lentement"), "à un rythme lent"], [w("trop longue?"), "un peu long"], [w("trop courte?"), "un peu court"],
  [w("vous n'avez pas"), "vous pouvez ajouter"], [w("manque de"), "place pour davantage de"],
  [/!+/g, "."], [/\s{2,}/g, " "],
];
/* Accord du verbe après le passage au vouvoiement : « vous parles » → « vous parlez », « vous pouvez ralentisses » → « vous pouvez ralentir ». */
const agree = s => s
  .replace(/(?<![\p{L}])vous pouvez (\p{L}+?)(?:isses|issiez)(?![\p{L}])/giu, "vous pouvez $1ir")
  .replace(/(?<![\p{L}])vous pouvez (\p{L}+?)(?:es|iez)(?![\p{L}])/giu, "vous pouvez $1er")
  .replace(/(?<![\p{L}])vous (?!êtes|pouvez)(\p{L}+?)es(?![\p{L}])/giu, "vous $1ez");
export function rephrase(text) {
  const raw = String(text || "").trim();
  if (!raw) return { text: "", removed: [] };
  const sentences = raw.replace(/\s+/g, " ").split(/(?<=[.?!])\s+/).filter(Boolean);
  const kept = [], removed = [];
  for (let s of sentences) {
    for (const [re, to] of SUBS) s = s.replace(re, to);
    s = agree(s).replace(/\s+([.,;:?])/g, "$1").trim();
    s = s.charAt(0).toUpperCase() + s.slice(1);
    if (!/[.?]$/.test(s)) s += ".";
    if (coachCompliant(s)) kept.push(s); else removed.push(s);
  }
  return { text: kept.join(" "), removed };
}

/* ─── Suggestions affichées dans le panneau ─── */
export const MODES = [
  ["tips", "Astuces"], ["positive", "Remarques positives"], ["rephrase", "Reformuler"], ["intro", "Introduction"], ["debrief", "Débriefing"],
];

/* Tirage stable et sans répétition (page = 0, 1, 2…) : quelques propositions à la fois. */
const pick = (list, n, page = 0) => {
  if (!list.length) return [];
  const start = (page * n) % list.length;
  return [...list.slice(start), ...list.slice(0, start)].slice(0, n);
};
/* ctx : { mode, dimId, dims, question, poste, prenom, page } → { items: [{ text, kind, dimId }], note } */
export function localSuggestions(ctx) {
  const { mode, dims = [], question, poste, prenom, page = 0 } = ctx;
  const dim = dims.find(d => d.id === ctx.dimId) || dims[0] || null;
  const N = 4;
  if (mode === "tips") {
    if (!dim) return { items: pick(keep([...KIND_TIPS[questionKind(question)], ...KIND_TIPS.generique]), N, page).map(text => ({ text })) };
    const pool = [...KIND_TIPS[questionKind(question)].slice(0, 1), ...entriesFor(dim.id, "explorer", { question, poste })];
    return { items: pick(pool, N, page).map(text => ({ text, dimId: dim.id })) };
  }
  if (mode === "positive") {
    const pool = dim && dim.type === "appui" ? entriesFor(dim.id, "appui", { question, poste }) : [...(dim ? keep(TIPS[dimKey(dim.id)]?.appui || []) : []), ...keep(POSITIVE_GENERIC)];
    return { items: pick(pool, N, page).map(text => ({ text, dimId: dim?.id })) };
  }
  if (mode === "intro") return { items: pick(introIdeas({ prenom, question, poste, dims }), N, page).map(text => ({ text })) };
  if (mode === "debrief") return { items: pick(debriefIdeas({ question, poste, dims }), N, page).map(text => ({ text, internal: true })) };
  return { items: [] };
}

/* ─── Modèle de langage facultatif ─── */
export const COACH_SYSTEM_PROMPT = `Tu aides un coach en insertion professionnelle à rédiger le rapport qu'il renverra à une personne qui s'est entraînée seule à l'entretien d'embauche avec l'outil « La Répét' ».
Tu proposes des formulations que le coach relira et adaptera : il garde toujours la main.
Règles strictes :
- Écris en français, au vouvoiement, en t'adressant à la personne accompagnée, avec un ton positif, concret et non évaluatif. N'utilise pas de tiret cadratin.
- Décris des faits observables (rythme, pauses, exemples concrets, petits mots répétés, structure, direction du regard) et propose des pistes présentées comme des conventions qui varient selon les secteurs (« vous pouvez… »).
- Aucune note, aucun score, aucun classement, aucune appréciation globale (« bien », « excellent », « insuffisant »).
- Ne déduis et ne commente jamais l'état émotionnel, l'attitude ou la personnalité de la personne (interdit par l'article 5(1)(f) du règlement européen sur l'IA). Aucun jugement sur la personne.
- N'invente aucun fait sur la personne : appuie-toi seulement sur les observations, la question et le métier fournis.
- Réponds par une liste de 2 à 4 propositions, une par ligne, chacune commençant par « - », de une à trois phrases.`;

const MODE_ASK = {
  tips: "Propose des astuces concrètes à ajouter au rapport, en lien avec l'observation choisie, la question et le métier.",
  positive: "Propose des formulations de remarques positives et non évaluatives sur l'observation choisie.",
  rephrase: "Reformule la remarque du coach ci-dessous dans le ton décrit, sans en changer le sens. Retire tout jugement sur la personne et toute émotion supposée.",
  intro: "Propose des idées de mot d'introduction pour le rapport.",
  debrief: "Propose des pistes d'activités pour le débriefing en atelier collectif (texte destiné au coach, pas à la personne).",
};

/* Suggestions : modèle de langage si configuré (sortie filtrée ligne par ligne), sinon ou en cas d'écart, moteur local. */
export async function coachSuggest(ctx) {
  const local = ctx.mode === "rephrase" ? rephraseResult(ctx.text) : { ...localSuggestions(ctx), source: "local" };
  if (!llmEnabled() || (ctx.mode === "rephrase" && !String(ctx.text || "").trim())) return { ...local, source: "local" };
  const dim = (ctx.dims || []).find(d => d.id === ctx.dimId);
  const facts = (ctx.dims || []).map(d => `- ${d.titre} (${d.type === "appui" ? "point d'appui" : "à explorer"}) : ${d.observation || ""}`).join("\n");
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), LLM_TIMEOUT_MS.coach);
  try {
    const content = await llmComplete("coach", {
        messages: [
          { role: "system", content: COACH_SYSTEM_PROMPT },
          { role: "user", content: `${MODE_ASK[ctx.mode]}\nQuestion posée : ${ctx.question || "non précisée"}\nMétier visé : ${ctx.poste || "non précisé"}\nObservations de l'assistant :\n${facts || "aucune"}${dim ? `\nObservation choisie : ${dim.titre}` : ""}${ctx.mode === "rephrase" ? `\nRemarque du coach : ${String(ctx.text).slice(0, 1200)}` : ""}` },
        ],
        max_tokens: 500,
    }, { signal: ctrl.signal });
    const raw = content.replace(/\u2014/g, ",");
    const lines = raw.split(/\n+/).map(l => l.replace(/^\s*(?:[-*•]|\d+[.)])\s*/, "").trim()).filter(Boolean);
    const items = lines.filter(coachCompliant).slice(0, 4).map(text => ({ text, dimId: ctx.dimId, internal: ctx.mode === "debrief" }));
    if (!items.length) throw new Error("aucune proposition conforme");
    return { items, source: "llm", dropped: lines.length - items.length };
  } catch (e) {
    console.warn("[assistant coach] modèle de langage indisponible ou réponse non conforme, propositions locales utilisées", e);
    return { ...local, source: "local" };
  } finally {
    clearTimeout(timer);
  }
}
function rephraseResult(text) {
  const r = rephrase(text);
  const items = r.text ? [{ text: r.text }] : [];
  const note = r.removed.length
    ? `${r.removed.length === 1 ? "Une phrase a été écartée" : `${r.removed.length} phrases ont été écartées`} : elle${r.removed.length > 1 ? "s" : ""} portai${r.removed.length > 1 ? "ent" : "t"} un jugement sur la personne, une note ou un ressenti supposé. Vous pouvez la réécrire en décrivant un fait observable.`
    : "";
  return { items, note };
}
