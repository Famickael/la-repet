/* Assistant conversationnel de La Répét'.

   Deux modes :
   - si VITE_LLM_ENDPOINT est défini, appel « chat completions » (compatible OpenAI, même convention
     que analysis.js) avec un prompt système cadré et tout l'historique de la conversation ;
     la sortie passe par assistantCompliant() et l'on se replie sur la réponse locale en cas d'écart ou d'erreur ;
   - sinon (site statique, sans serveur), un moteur local dans le navigateur : base de connaissances,
     correspondance par mots-clés normalisés et gestion des relances (« un exemple ? », « pourquoi ? »,
     « et pour… ? », « plus de détails », « merci »).

   Règles : périmètre limité à la préparation d'entretien (questions sur le site : renvoi vers la FAQ) ;
   vouvoiement ; aucune note ; aucune déduction d'émotion ou de trait de personnalité
   (AI Act, art. 5(1)(f)) ; aucune donnée personnelle demandée ; renvoi vers le coach au-delà. */

import { textCompliant } from "./compliance.js";
import { fillPoste } from "./text.js";
import { stripAccents } from "./text.js";
import { llmEnabled, llmComplete, LLM_TIMEOUT_MS } from "./llm.js";

/* Garde-fou de l'assistant : il peut parler du trac quand la personne en parle, jamais qualifier la personne ni noter. */
export const assistantCompliant = t => textCompliant(t, "assistant") && !/\u2014/.test(t);

/* ─── Base de connaissances ───
   q : formulation proposée en suggestion (doit renvoyer vers l'entrée elle-même) ;
   keys : mots-clés ou expressions (racines acceptées : « present » couvre « présenter », « présentation ») ;
   more, example, why : réponses aux relances ; related : sujets voisins. {poste} est remplacé par le métier visé. */
export const KB = [
  /* ── Fonctionnement du site ── */
  {
    id: "fonctionnement", q: "Comment fonctionne La Répét' ?",
    keys: ["fonctionne", "fonctionnement", "comment ca marche", "marche comment", "utiliser le site", "a quoi sert", "sert a quoi le site", "repet", "mode d emploi", "comment on fait"],
    answer: "La Répét' vous permet de vous entraîner seul à l'entretien, à votre rythme. Vous choisissez une ou plusieurs questions, vous vous enregistrez, puis l'assistant vous fait un retour qui décrit des faits (rythme, pauses, exemples, structure). Vous décidez ensuite, réponse par réponse, de l'envoyer ou non à votre coach.",
    more: "Le déroulé type : un échauffement facultatif pour vous mettre en voix, puis un entraînement sur les questions de votre choix. Après chaque réponse, vous choisissez de lire un rapport écrit ou de vous revoir en vidéo avec des repères. Vous pouvez recommencer autant de fois que vous le souhaitez.",
    example: "Par exemple : vous sélectionnez « Pouvez-vous vous présenter ? » et « Pourquoi ce poste ? », vous répondez à la première, vous lisez le retour, puis vous passez à la seconde. À la fin, vous envoyez à votre coach seulement la réponse qui vous semble la plus utile à travailler ensemble.",
    related: ["echauffement", "entrainement", "confidentialite"],
  },
  {
    id: "echauffement", q: "Quelle différence entre l'échauffement et l'entraînement ?",
    keys: ["echauffement", "echauffer", "difference", "mise en voix", "se mettre en voix", "s echauffer", "phrase a dire"],
    answer: "L'échauffement sert à vous mettre en voix : vous dites une phrase à voix haute, plusieurs fois, sans pression. Il n'est ni enregistré ni analysé. L'entraînement, lui, est enregistré sur votre appareil et reçoit un retour de l'assistant.",
    more: "Pendant l'échauffement, l'exercice se concentre sur une seule phrase à la fois. Vous pouvez la redire en suivant les relances (plus lentement, en regardant la caméra…) ou tirer une autre phrase au hasard. À la fin, un court questionnaire vous aide à choisir quoi travailler ensuite.",
    example: "Par exemple, vous dites « Bonjour, je vous remercie de me recevoir » trois fois : une fois tranquillement, une fois plus lentement, une fois en regardant la caméra sur les derniers mots. Ensuite, vous passez à l'entraînement.",
    why: "L'échauffement permet de vous habituer à parler face à la caméra et d'entendre votre voix avant de répondre à une vraie question. Comme rien n'est gardé, vous pouvez essayer librement.",
    related: ["entrainement", "fond-video", "respiration"],
  },
  {
    id: "entrainement", q: "Comment se passe un entraînement ?",
    keys: ["entrainement", "entrainer", "plusieurs questions", "choisir les questions", "choisir une question", "selectionner", "enchainer", "question suivante", "serie"],
    answer: "Vous sélectionnez une ou plusieurs questions dans la liste, ou vous ajoutez les vôtres, puis vous appuyez sur « Commencer ». Pour chaque question : vous vous enregistrez, l'assistant prépare un retour, puis vous passez à la question suivante. Vous pouvez vous arrêter à tout moment.",
    more: "Avant d'enregistrer, vous pouvez activer la caméra ou choisir le son seulement. Vous pouvez réécouter votre réponse et la refaire autant de fois que vous voulez avant de la valider. Une réponse dure au maximum trois minutes.",
    example: "Par exemple, pour un entretien de {poste}, vous pouvez choisir la présentation, la motivation et une mise en situation : trois questions, trois retours, en une quinzaine de minutes.",
    related: ["questions-perso", "retour-assistant", "refaire"],
  },
  {
    id: "questions-perso", q: "Puis-je ajouter mes propres questions ?",
    keys: ["ma propre question", "mes propres questions", "ajouter une question", "ajouter question", "question personnalisee", "autre question", "question qui n est pas", "ecrire ma question"],
    answer: "Oui. Sur l'écran de choix des questions, écrivez votre question dans le champ « Ajouter ma question » puis appuyez sur « Ajouter ». Elle rejoint votre sélection, avec les questions de la liste.",
    more: "C'est utile pour une question que vous redoutez, ou une question entendue lors d'un précédent entretien. Vous pouvez en ajouter plusieurs et en retirer une à tout moment avant de commencer.",
    example: "Par exemple : « Pourquoi avez-vous quitté votre dernier emploi ? » ou « Êtes-vous disponible le week-end ? ».",
    related: ["entrainement", "questions-difficiles"],
  },
  {
    id: "retour-assistant", q: "Que contient le retour de l'assistant ?",
    keys: ["retour", "analyse", "feedback", "rapport de l assistant", "que regarde", "qu est ce qui est analyse", "observation", "point d appui", "a explorer"],
    answer: "Le retour décrit des faits observables : votre rythme de parole, les pauses, les petits mots répétés, la présence d'exemples concrets, la structure de la réponse et, si la caméra est active, la direction du regard. Il commence par vos points d'appui, puis propose des pistes à explorer.",
    more: "Chaque observation est accompagnée d'un conseil pratique, présenté comme une convention qui varie selon les secteurs. Le retour ne note pas et ne déduit rien sur ce que vous ressentez. Votre coach peut le compléter, le nuancer ou le contredire.",
    example: "Par exemple : « Environ 140 mots par minute : ce rythme laisse à l'interlocuteur le temps de suivre » ou « Aucune situation datée n'a été repérée : vous pouvez ajouter un exemple vécu ».",
    related: ["pas-de-note", "rapport-ecrit-video", "debit"],
  },
  {
    id: "pas-de-note", q: "Pourquoi n'y a-t-il pas de note ?",
    keys: ["note", "noter", "score", "evaluation", "evalue", "juge", "jugement", "classement", "suis je bon", "est ce que c etait bien", "c etait bien", "bonne reponse"],
    answer: "La Répét' décrit sans noter. Une note dit peu de choses sur ce que vous pouvez faire concrètement, alors qu'une observation précise vous donne une piste. Les repères sont des conventions, pas des règles : ce qui fonctionne dépend du poste et du recruteur.",
    more: "C'est un choix pédagogique et réglementaire : l'outil ne produit ni note chiffrée, ni classement, ni jauge. Votre coach, lui, peut vous dire ce qui lui semble prioritaire pour votre projet.",
    example: "Plutôt qu'une note chiffrée, vous lirez par exemple : « Vous citez un élément précis : deux ans en magasin. Les exemples chiffrés rendent une réponse facile à retenir. »",
    related: ["retour-assistant", "emotions", "coach-partage"],
  },
  {
    id: "emotions", q: "L'assistant voit-il si je suis tendu ?",
    keys: ["emotion", "stress", "stresse", "nerveux", "nerveuse", "tendu", "angoisse", "detecte", "lire mon visage", "visage", "expression", "air", "avais l air", "sentiment", "ressens", "je me sens", "sourire"],
    answer: "Non. L'assistant ne cherche pas à deviner ce que vous ressentez et ne commente pas votre attitude : c'est interdit par le règlement européen sur l'IA, et ce ne serait pas fiable. Il décrit uniquement des faits, comme le rythme ou les pauses.",
    more: "Le suivi du visage sert seulement à savoir si votre regard est tourné vers l'écran, vers le bas ou sur le côté. Les expressions du visage ne sont jamais lues. Si vous souhaitez parler de votre ressenti, votre coach est là pour cela.",
    example: "Par exemple, l'assistant peut écrire « 3 pauses de plus de 2 secondes », mais jamais une phrase qui devine ce que vous ressentez.",
    related: ["respiration", "pas-de-note", "confidentialite"],
  },
  {
    id: "confidentialite", q: "Qui peut voir mes enregistrements ?",
    keys: ["confidentialite", "confidentiel", "donnees", "donnee", "qui voit", "qui peut voir", "prive", "vie privee", "rgpd", "securite", "partage", "stocke", "stockage", "ou sont"],
    answer: "Personne d'autre que vous, tant que vous ne décidez pas d'envoyer. Vos enregistrements restent sur votre appareil. C'est vous qui choisissez, réponse par réponse, ce qui est envoyé à votre coach.",
    more: "Seul le texte de votre réponse peut être utilisé pour préparer le retour ; la vidéo ne quitte pas l'appareil sans envoi explicite. Vous pouvez supprimer une réponse, ou retirer votre consentement et effacer toutes vos données depuis votre espace.",
    example: "Par exemple, si vous enregistrez cinq réponses et n'en envoyez qu'une, votre coach ne verra que celle-là. Les quatre autres restent sur votre appareil.",
    related: ["video-devenir", "supprimer", "coach-partage"],
  },
  {
    id: "video-devenir", q: "Que devient ma vidéo ?",
    keys: ["video", "que devient", "enregistrement", "film", "camera enregistre", "garde", "conserve", "conservation"],
    answer: "Votre vidéo est enregistrée uniquement sur cet appareil. Elle n'est envoyée à votre coach que si vous appuyez sur « Envoyer à mon coach » pour cette réponse précise. Vous pouvez la supprimer à tout moment.",
    more: "Pendant l'échauffement, rien n'est enregistré : l'image de la caméra s'affiche seulement en direct. Pendant l'entraînement, la vidéo est gardée sur l'appareil pour que vous puissiez vous revoir.",
    example: "Le bouton « Que devient ma vidéo ? », sous la caméra, résume le cycle de vie complet de vos enregistrements.",
    related: ["confidentialite", "supprimer", "voix-seule"],
  },
  {
    id: "coach-partage", q: "Comment envoyer une réponse à mon coach ?",
    keys: ["envoyer", "coach", "partager", "conseiller", "conseillere", "transmettre", "accompagnateur", "referent"],
    answer: "Après le retour de l'assistant, appuyez sur « Envoyer à mon coach ». Vous pouvez ajouter un petit mot, par exemple ce sur quoi vous aimeriez son avis. Seule cette réponse est envoyée.",
    more: "Votre coach relit la réponse, peut ajouter des remarques à des moments précis de la vidéo et commenter les repères de l'assistant. Son rapport apparaît ensuite dans votre espace, avec le même code.",
    example: "Par exemple, un mot comme : « J'ai l'impression de parler vite au début, qu'en pensez-vous ? » aide votre coach à cibler sa relecture.",
    related: ["coach-rapport", "confidentialite", "hors-sujet"],
  },
  {
    id: "coach-rapport", q: "Quand vais-je recevoir le rapport de mon coach ?",
    keys: ["rapport du coach", "rapport de mon coach", "reponse du coach", "quand", "delai", "recevoir", "relecture", "relire"],
    answer: "Le délai dépend de votre coach et de son organisation. Dès qu'il a relu votre réponse, son rapport apparaît dans votre espace : un message vous l'indique en haut de la page.",
    more: "Le rapport reprend le retour de l'assistant, avec les remarques de votre coach à des moments précis. Il sert de base pour en parler ensemble en atelier ou en rendez-vous.",
    example: "Dans la liste de vos entraînements, la mention « Rapport reçu » apparaît à côté de la réponse concernée.",
    related: ["coach-partage", "refaire"],
  },
  {
    id: "rapport-ecrit-video", q: "Puis-je lire le retour sans me revoir ?",
    keys: ["sans me revoir", "rapport ecrit", "revoir", "me voir", "pas envie de me voir", "lire le retour", "mode video", "reperes"],
    answer: "Oui. Après chaque réponse, vous choisissez entre un rapport écrit, sans vous revoir, et une relecture vidéo avec les repères placés au bon moment. Les deux contiennent le même retour, et vous pouvez changer d'avis.",
    more: "En mode vidéo, chaque observation est placée sur la barre de lecture : un clic sur un repère vous amène au moment concerné.",
    example: "Beaucoup de personnes commencent par le rapport écrit, puis se revoient une fois plus habituées.",
    related: ["retour-assistant", "voix-seule"],
  },
  {
    id: "camera", q: "Ma caméra ne fonctionne pas, que faire ?",
    keys: ["camera ne marche", "camera ne fonctionne", "pas de camera", "camera noire", "ecran noir", "autoriser", "autorisation", "permission", "micro ne marche", "micro ne fonctionne", "pas de son", "pas de micro", "on ne m entend pas", "acces refuse", "bloque", "webcam"],
    answer: "Vérifiez d'abord que le navigateur a le droit d'utiliser la caméra et le micro : une icône apparaît en général dans la barre d'adresse. Fermez les autres applications qui pourraient utiliser la caméra, puis rechargez la page.",
    more: "Sur iPhone, ouvrez Réglages, puis Safari, puis Caméra et Microphone, et choisissez « Autoriser ». Sur ordinateur, essayez un autre navigateur récent. Si la caméra reste indisponible, vous pouvez enregistrer uniquement votre voix.",
    example: "Par exemple, si une visioconférence est ouverte dans un autre onglet, elle peut garder la caméra pour elle : fermez-la et réessayez.",
    related: ["voix-seule", "visio"],
  },
  {
    id: "voix-seule", q: "Puis-je m'entraîner sans caméra ?",
    keys: ["sans camera", "voix seule", "son seul", "son seulement", "audio", "que la voix", "pas de video", "couper la camera"],
    answer: "Oui. Choisissez « Son seulement » avant d'enregistrer, ou « Passer en voix seule » pendant l'échauffement. Le retour porte alors sur la voix et le contenu : rythme, pauses, exemples, structure.",
    more: "Sans caméra, le repère sur la direction du regard n'est simplement pas calculé. C'est aussi une bonne préparation pour un entretien téléphonique.",
    example: "Par exemple, vous pouvez commencer en voix seule pour travailler le contenu, puis activer la caméra une fois la réponse plus fluide.",
    related: ["telephone", "camera", "fond-video"],
  },
  {
    id: "fond-video", q: "Puis-je flouter ou changer le fond ?",
    keys: ["fond", "flou", "flouter", "arriere plan", "decor", "couleur unie", "cacher ma chambre", "cacher derriere"],
    answer: "Pendant l'échauffement en vidéo, vous pouvez choisir le fond derrière vous : aucun changement, flou ou couleur unie. Le calcul se fait uniquement sur votre appareil, et rien n'est enregistré.",
    more: "Si votre appareil ne parvient pas à charger le modèle de détection, l'option se désactive avec un court message. En visioconférence réelle, la plupart des logiciels proposent aussi un fond flou.",
    example: "Par exemple, le flou est pratique si vous vous entraînez dans une pièce encombrée et que cela vous distrait.",
    related: ["visio", "voix-seule"],
  },
  {
    id: "supprimer", q: "Comment supprimer mes données ?",
    keys: ["supprimer", "effacer", "suppression", "retirer mon consentement", "retirer mon accord", "consentement", "enlever", "detruire"],
    answer: "Ouvrez une réponse et appuyez sur « Supprimer » pour l'effacer. Pour tout effacer, ouvrez « Mon compte », puis « Retirer mon accord ». Aucune justification n'est demandée.",
    more: "La suppression efface la vidéo et le retour de cet appareil. Si une réponse a déjà été envoyée à votre coach, vous pouvez lui demander de la supprimer de son côté.",
    example: "Par exemple, vous pouvez garder uniquement vos meilleures réponses et supprimer les essais.",
    related: ["confidentialite", "video-devenir"],
  },
  {
    id: "refaire", q: "Combien de fois puis-je recommencer ?",
    keys: ["recommencer", "refaire", "combien de fois", "illimite", "encore", "reessayer", "limite"],
    answer: "Autant de fois que vous le souhaitez. Vous pouvez refaire une réponse avant de la valider, et relancer un entraînement à tout moment, y compris après avoir reçu le rapport de votre coach.",
    more: "S'entraîner plusieurs fois sur la même question est très efficace : à chaque essai, la réponse devient plus claire et plus naturelle.",
    example: "Par exemple : un premier essai pour trouver les idées, un deuxième pour ajouter un exemple concret, un troisième pour soigner la conclusion.",
    related: ["entrainement", "duree"],
  },
  {
    id: "duree", q: "Combien de temps dure une réponse ?",
    keys: ["duree", "combien de temps", "trop long", "trop court", "minutes", "temps maximum", "longueur"],
    answer: "Chaque enregistrement dure au maximum trois minutes. En entretien, une réponse d'une à deux minutes est souvent un bon repère : assez pour donner un exemple, assez court pour laisser le recruteur rebondir.",
    more: "La présentation de soi peut aller jusqu'à deux ou trois minutes. Pour une question simple, quelques phrases suffisent. Le recruteur vous relancera s'il veut en savoir plus.",
    example: "Par exemple : une phrase pour répondre directement, un exemple vécu, une phrase de conclusion. Cela tient en une minute environ.",
    related: ["structure", "se-presenter"],
  },
  {
    id: "metier", q: "Comment changer le métier visé ?",
    keys: ["metier", "changer de metier", "changer le poste", "poste vise", "modifier le poste", "autre metier", "domaine"],
    answer: "Dans votre espace, utilisez le champ « Métier visé » : commencez à taper, choisissez dans la liste ou écrivez librement votre métier. Les questions d'entraînement s'adaptent alors à ce métier.",
    more: "Vous pouvez le changer quand vous voulez, par exemple si vous préparez plusieurs candidatures. Votre coach voit le métier indiqué dans votre parcours.",
    example: "Par exemple, avec « agent d'accueil », la question devient « Pourquoi ce poste d'agent d'accueil vous intéresse-t-il ? ».",
    related: ["motivation", "entrainement"],
  },
  {
    id: "transcription", q: "Pourquoi le premier retour est-il long ?",
    keys: ["long", "lent", "chargement", "telechargement", "modele", "transcription", "attendre", "patienter", "bloque sur"],
    answer: "Au premier entraînement, votre navigateur télécharge un modèle de transcription qui fonctionne sur votre appareil. Ce téléchargement n'a lieu qu'une fois ; les retours suivants sont plus rapides.",
    more: "La transcription se fait localement, ce qui évite d'envoyer votre voix ailleurs. Une connexion stable aide pour ce premier téléchargement. Si cela échoue, le bouton « Réessayer » relance l'opération.",
    example: "Sur un téléphone, le premier retour peut prendre une à deux minutes ; ensuite, quelques secondes.",
    related: ["confidentialite", "camera"],
  },
  {
    id: "assistant", q: "Qui êtes-vous ?",
    keys: ["qui es tu", "qui etes vous", "tu es qui", "vous etes qui", "assistant", "robot", "humain", "intelligence artificielle", "ia", "chatgpt"],
    answer: "Je suis l'assistant de préparation d'entretien de La Répét'. Je suis un programme, pas une personne. Je réponds à vos questions pour préparer un entretien d'embauche. Je ne remplace pas votre coach, qui connaît votre parcours.",
    more: "Je ne note rien, je ne cherche pas à deviner ce que vous ressentez et je ne vous demande aucune information personnelle. Pour une question sur votre situation, votre contrat ou vos démarches, votre coach est la bonne personne.",
    example: "Vous pouvez par exemple me demander comment vous présenter, comment parler d'un trou dans votre CV ou quelles questions poser au recruteur.",
    related: ["se-presenter", "reussir", "hors-sujet"],
  },
  {
    id: "hors-sujet", q: "Pour quelles questions voir mon coach ?",
    keys: ["voir mon coach", "demander au coach", "rendez vous", "droits", "allocation", "indemnisation", "france travail", "pole emploi", "contrat", "aide financiere", "formation financee", "inscription", "dossier", "administratif"],
    answer: "Pour tout ce qui concerne votre situation personnelle (droits, démarches, contrat, formation, financement), votre coach est la bonne personne : il connaît votre parcours et les dispositifs. De mon côté, je réponds sur l'entraînement et la préparation d'entretien.",
    more: "Vous pouvez noter vos questions et les apporter à votre prochain rendez-vous, ou les écrire dans le petit mot qui accompagne une réponse envoyée.",
    example: "Par exemple : « Ai-je droit à une formation ? » est une question pour votre coach ; « Comment parler de ma formation en entretien ? » est une question pour moi.",
    related: ["coach-partage", "assistant"],
  },

  /* ── Retours de l'assistant : repères ── */
  {
    id: "debit", q: "Je parle trop vite, que faire ?",
    keys: ["debit", "parle trop vite", "trop vite", "vitesse", "rythme", "mots par minute", "ralentir", "parle lentement", "trop lent", "articuler", "articulation"],
    answer: "En entretien, un rythme autour de 120 à 160 mots par minute est souvent facile à suivre. Pour ralentir, le plus simple est de marquer une respiration entre deux idées, et d'articuler les fins de phrase.",
    more: "Trois gestes pratiques : préparer deux ou trois mots-clés par réponse pour ne pas chercher vos idées en parlant ; poser votre voix sur le premier mot de chaque phrase ; laisser une seconde de silence après une information importante.",
    example: "Par exemple : « J'ai travaillé deux ans en magasin. (pause) J'y ai appris à gérer plusieurs clients à la fois. (pause) C'est ce que je souhaite apporter à votre équipe. »",
    why: "Le recruteur découvre votre parcours en même temps que vous le racontez. Un rythme posé lui laisse le temps de retenir les informations importantes et de préparer sa relance.",
    related: ["pauses", "respiration", "mots-appui"],
  },
  {
    id: "pauses", q: "Les silences, est-ce grave ?",
    keys: ["pause", "silence", "blanc", "trou de memoire", "je bloque", "je cherche mes mots", "perdre le fil", "perdu le fil", "oublier"],
    answer: "Non. Quelques pauses rythment le propos et montrent que vous prenez le temps de réfléchir. Si un blanc s'installe, vous pouvez simplement dire « Je prends un instant pour réfléchir » ou reformuler la question.",
    more: "Pour éviter les longs blancs, préparez pour chaque question classique deux ou trois mots-clés plutôt qu'un texte appris par cœur. Si vous perdez le fil, revenez au dernier mot-clé ou concluez simplement votre idée.",
    example: "Par exemple : « C'est une bonne question. (pause) Je dirais que ma principale qualité est la rigueur, et je peux vous donner un exemple. »",
    why: "Un silence paraît toujours plus long à la personne qui parle qu'à celle qui écoute. Le recruteur, lui, y voit souvent une réponse réfléchie.",
    related: ["debit", "questions-difficiles", "respiration"],
  },
  {
    id: "mots-appui", q: "Comment dire moins de « euh » ?",
    keys: ["euh", "petits mots", "mots repetes", "mots d appui", "mot d appui", "tic de langage", "tics", "du coup", "en fait", "voila", "genre", "hesitation", "heu"],
    answer: "Les petits mots répétés (« euh », « du coup », « en fait ») sont très courants à l'oral. Le plus efficace est de les remplacer par un court silence, surtout en début de phrase.",
    more: "Repérez le mot qui revient le plus chez vous en vous réécoutant, sans chercher à tout supprimer. Ralentir légèrement et préparer la première phrase de chaque réponse réduit beaucoup les hésitations.",
    example: "Au lieu de « Euh, du coup, j'ai travaillé chez… », essayez : « (silence d'une seconde) J'ai travaillé chez… ».",
    why: "Quelques petits mots répétés ne gênent pas. Quand ils deviennent fréquents, ils détournent l'attention de ce que vous dites, alors qu'un silence met au contraire votre propos en valeur.",
    related: ["debit", "pauses"],
  },
  {
    id: "exemples", q: "Comment donner un exemple concret ?",
    keys: ["exemple concret", "exemples concrets", "concret", "situation vecue", "star", "anecdote", "illustrer", "prouver", "chiffre"],
    answer: "Un bon exemple répond à quatre questions : la situation (où, quand), ce qu'il fallait faire, ce que vous avez fait, et le résultat. On parle souvent de méthode STAR : Situation, Tâche, Action, Résultat.",
    more: "Choisissez des exemples récents et précis, avec un chiffre si possible (une durée, un nombre de clients, une équipe). Préparez trois ou quatre exemples qui pourront servir à plusieurs questions : qualités, difficulté, travail en équipe.",
    example: "« Dans le magasin où j'ai travaillé deux ans (situation), il fallait gérer la caisse pendant les soldes (tâche). J'ai organisé la file et prévenu mon responsable dès qu'elle s'allongeait (action). Nous avons évité les longues attentes tout le week-end (résultat). »",
    why: "Un exemple vécu rend votre réponse crédible et facile à retenir. Le recruteur se souvient mieux d'une situation précise que d'une qualité affirmée.",
    related: ["experiences", "qualites", "structure"],
  },
  {
    id: "structure", q: "Comment bien structurer une réponse ?",
    keys: ["structure", "structurer", "organiser ma reponse", "plan", "conclusion", "conclure", "terminer", "finir ma reponse", "clair", "brouillon", "je pars dans tous les sens"],
    answer: "Une structure simple fonctionne très bien : une phrase qui répond directement, un exemple concret, puis une phrase de conclusion qui fait le lien avec le poste.",
    more: "La phrase de conclusion aide le recruteur à savoir que vous avez terminé. Elle peut commencer par « C'est pour cela que… » ou « C'est ce que je souhaite apporter… ». Des phrases courtes rendent l'ensemble plus clair.",
    example: "« Ma principale qualité est l'organisation. Dans mon dernier emploi, je préparais chaque matin le planning des livraisons. C'est une qualité utile pour un poste de {poste}. »",
    why: "À l'oral, le recruteur ne peut pas relire. Une structure prévisible l'aide à suivre et à retenir vos idées principales.",
    related: ["exemples", "duree", "se-presenter"],
  },
  {
    id: "regard", q: "Faut-il regarder la caméra ou l'écran ?",
    keys: ["regard", "regarder", "yeux", "camera ou l ecran", "objectif", "contact visuel", "regarde en bas", "baisser les yeux"],
    answer: "En visioconférence, regarder l'objectif de la caméra donne à votre interlocuteur l'impression que vous le regardez. Il est naturel de regarder ailleurs pour réfléchir : vous pouvez simplement revenir vers la caméra en fin de phrase.",
    more: "Placez la caméra à hauteur des yeux (sur une pile de livres pour un ordinateur portable) et la fenêtre de la visioconférence juste sous la caméra. En face à face, regardez la personne qui pose la question, puis les autres membres du jury.",
    example: "Un petit repère collé à côté de la caméra peut aider à y revenir pendant les premiers entraînements.",
    related: ["visio", "debit"],
  },
  {
    id: "vocabulaire", q: "Je répète souvent les mêmes mots, est-ce un problème ?",
    keys: ["vocabulaire", "repete", "repetition", "memes mots", "synonyme", "mots qui reviennent", "langage", "registre", "familier"],
    answer: "Ce n'est pas un problème en soi, surtout pour les mots du métier. Si un mot revient très souvent, vous pouvez préparer un ou deux synonymes, ou reformuler l'idée autrement.",
    more: "En entretien, un langage simple et correct suffit. Évitez seulement le registre trop familier et les abréviations que le recruteur pourrait ne pas connaître.",
    example: "Par exemple, à la place de répéter « gérer », vous pouvez dire « organiser », « m'occuper de », « prendre en charge ».",
    related: ["structure", "francais"],
  },

  /* ── Préparer et réussir un entretien ── */
  {
    id: "se-presenter", q: "Comment me présenter en entretien ?",
    keys: ["present", "presentez vous", "parlez moi de vous", "parlez nous de vous", "me presenter", "presentation", "pitch", "debut d entretien"],
    answer: "Une présentation efficace tient en deux minutes environ et suit trois temps : qui vous êtes aujourd'hui, ce que vous avez fait d'utile pour le poste (expériences, formation), et pourquoi ce poste vous intéresse.",
    more: "Concentrez-vous sur ce qui a un lien avec le poste de {poste}, sans tout raconter de votre vie. Préparez la première et la dernière phrase : elles donnent le ton et facilitent la suite. Inutile de réciter votre CV, le recruteur l'a déjà lu.",
    example: "« Je m'appelle Camille, j'ai travaillé trois ans dans la vente, où j'ai appris à accueillir et conseiller des clients. Je me suis formée à l'accueil l'an dernier. Aujourd'hui, je souhaite mettre ce sens du service au profit de votre structure. »",
    why: "C'est souvent la première question, et elle donne le fil de l'entretien : le recruteur rebondit ensuite sur ce que vous avez choisi de mettre en avant.",
    related: ["experiences", "motivation", "structure"],
  },
  {
    id: "experiences", q: "Comment parler de mes expériences ?",
    keys: ["experience", "parler de mes experiences", "ancien emploi", "dernier emploi", "dernier poste", "missions", "parcours professionnel", "ce que j ai fait", "benevolat", "stage"],
    answer: "Choisissez deux ou trois expériences en lien avec le poste et, pour chacune, dites ce que vous faisiez et ce que vous en avez retiré. Toutes les expériences comptent : emplois, stages, bénévolat, vie associative ou familiale.",
    more: "Pour chaque expérience, préparez une situation concrète (méthode STAR). Parlez au « je » pour ce que vous avez fait vous-même. Faites le lien avec le poste visé : « Cela m'a appris à… », « C'est utile pour… ».",
    example: "« Pendant deux ans, j'ai été bénévole dans une association d'aide alimentaire. J'accueillais les familles et je tenais le planning des distributions. Cela m'a appris à rester organisée quand il y a du monde. »",
    related: ["exemples", "trous-cv", "reconversion"],
  },
  {
    id: "qualites", q: "Comment parler de mes qualités ?",
    keys: ["qualite", "qualites", "point fort", "points forts", "atout", "atouts", "competence", "competences", "savoir etre", "trois qualites"],
    answer: "Choisissez deux ou trois qualités utiles pour le poste et illustrez chacune par un exemple vécu. Une qualité prouvée par une situation est bien plus convaincante qu'une liste d'adjectifs.",
    more: "Regardez l'offre d'emploi : les qualités demandées y sont souvent écrites. Pour un poste de {poste}, demandez-vous ce qui est attendu au quotidien (ponctualité, sens du contact, rigueur, travail en équipe…) et ce que vous avez déjà montré.",
    example: "« Je suis ponctuelle : pendant mes deux ans en restauration, je n'ai jamais manqué une ouverture du matin, et c'est souvent moi qui préparais la salle. »",
    related: ["points-a-travailler", "exemples", "experiences"],
  },
  {
    id: "points-a-travailler", q: "Que répondre sur mes défauts ?",
    keys: ["defaut", "defauts", "point faible", "points faibles", "faiblesse", "points a travailler", "point a ameliorer", "ameliorer", "progresser"],
    answer: "Présentez un vrai point que vous travaillez, sans lien direct avec le cœur du poste, et surtout ce que vous faites pour progresser. C'est cette démarche qui intéresse le recruteur.",
    more: "Évitez les fausses réponses (« je suis trop perfectionniste ») et les points rédhibitoires pour le poste. Une structure simple : le point, un exemple court, ce que vous mettez en place, et où vous en êtes aujourd'hui.",
    example: "« J'avais du mal à prendre la parole en réunion. Je me suis inscrite à un atelier d'expression orale et je prépare maintenant mes interventions à l'avance. Je participe beaucoup plus qu'avant. »",
    why: "Le recruteur ne cherche pas une personne sans défaut : il veut voir que vous savez prendre du recul et progresser.",
    related: ["qualites", "questions-difficiles"],
  },
  {
    id: "trous-cv", q: "Comment expliquer un trou dans mon CV ?",
    keys: ["trou", "trou dans mon cv", "trous dans le cv", "periode sans emploi", "periode d inactivite", "inactivite", "chomage long", "arret", "pause dans ma carriere", "longtemps sans travailler", "chomage", "cv", "parcours"],
    answer: "Restez simple et honnête : une phrase pour expliquer la période, sans entrer dans les détails personnels, puis ce que vous avez fait ou appris pendant ce temps, et pourquoi ce poste vous convient aujourd'hui.",
    more: "Vous n'avez pas à justifier votre vie privée. « Pour des raisons familiales » ou « pour raisons de santé, aujourd'hui derrière moi » suffit. Mettez l'accent sur la suite : formation, bénévolat, démarches, projet clarifié avec votre accompagnement.",
    example: "« Entre 2022 et 2024, je me suis occupée de ma famille. Pendant cette période, j'ai suivi une formation en ligne en bureautique, et aujourd'hui je suis pleinement disponible pour reprendre un poste. »",
    why: "Le recruteur veut surtout savoir si vous êtes disponible. Une réponse courte et tournée vers l'avenir le rassure davantage qu'une longue justification.",
    related: ["reconversion", "experiences", "questions-personnelles"],
  },
  {
    id: "questions-recruteur", q: "Quelles questions poser au recruteur ?",
    keys: ["questions a poser au recruteur", "poser des questions au recruteur", "question au recruteur", "questions pour le recruteur", "avez vous des questions", "fin de l entretien", "quoi poser comme question", "poser des questions a la fin"],
    answer: "Préparez deux ou trois questions sur le poste et l'équipe. Elles montrent votre intérêt et vous aident à savoir si le poste vous convient.",
    more: "Bonnes pistes : le déroulé d'une journée type, l'équipe, les premières missions, la formation à l'arrivée, la suite du processus de recrutement. Gardez les questions sur les congés ou les avantages pour plus tard, sauf si le recruteur aborde le sujet.",
    example: "« Comment se déroule une journée type sur ce poste ? », « Avec qui travaillerais-je au quotidien ? », « Quelles sont les prochaines étapes du recrutement ? ».",
    why: "« Avez-vous des questions ? » arrive presque toujours en fin d'entretien. Répondre « non » laisse passer une occasion de montrer votre intérêt.",
    related: ["fin-entretien", "entreprise", "salaire"],
  },
  {
    id: "respiration", q: "Comment gérer le trac avant un entretien ?",
    keys: ["trac", "stress", "stresse", "angoisse", "angoisser", "nerveux", "nerveuse", "panique", "calme", "calmer", "respir", "respiration", "detendre", "tendu", "tremble", "gerer"],
    answer: "Le trac avant un entretien est très courant. Quelques gestes pratiques aident : une respiration lente (inspirer sur quatre temps, expirer sur six), arriver en avance, et préparer votre première phrase pour bien démarrer.",
    more: "La veille, préparez vos affaires et votre trajet. Juste avant, respirez lentement trois fois, posez vos pieds bien à plat et relâchez les épaules. Pendant l'entretien, un verre d'eau ou une courte pause pour réfléchir sont tout à fait acceptés.",
    example: "Exercice simple : inspirez par le nez en comptant jusqu'à quatre, expirez par la bouche en comptant jusqu'à six. Recommencez trois fois avant d'entrer.",
    why: "Une expiration plus longue que l'inspiration ralentit naturellement le rythme et aide à poser la voix. S'entraîner plusieurs fois rend aussi la situation plus familière.",
    related: ["pauses", "echauffement", "ponctualite"],
  },
  {
    id: "tenue", q: "Comment m'habiller pour un entretien ?",
    keys: ["tenue", "habiller", "vetement", "vetements", "porter", "costume", "habit", "dress code", "apparence", "maquillage", "coiffure"],
    answer: "Choisissez une tenue propre, dans laquelle vous vous sentez bien, et adaptée au métier : un peu plus soignée que la tenue de travail habituelle du poste. Renseignez-vous sur les usages de l'entreprise.",
    more: "Pour un poste en bureau ou à l'accueil, une tenue simple et soignée convient. Pour un poste sur le terrain (chantier, logistique, restauration), une tenue correcte et pratique suffit. Préparez-la la veille pour ne pas y penser le jour même.",
    example: "Par exemple, pour un poste de {poste}, regardez comment s'habillent les personnes déjà en poste (sur le site de l'entreprise ou en passant devant) et choisissez un cran au-dessus.",
    related: ["ponctualite", "visio"],
  },
  {
    id: "ponctualite", q: "Que faire si je suis en retard ?",
    keys: ["ponctualite", "ponctuel", "retard", "en retard", "heure", "arriver", "avance", "en avance", "trajet", "transport"],
    answer: "Prévoyez d'arriver dix minutes en avance et repérez le trajet la veille. En cas de retard, prévenez dès que possible par téléphone, excusez-vous simplement et indiquez votre heure d'arrivée.",
    more: "Gardez le numéro du recruteur à portée de main. À l'arrivée, inutile de vous justifier longuement : une phrase d'excuse suffit, puis concentrez-vous sur l'entretien.",
    example: "« Bonjour, c'est Camille, j'ai rendez-vous à 10 h. Mon bus a du retard, je serai là vers 10 h 15. Je vous prie de m'excuser. »",
    related: ["tenue", "documents"],
  },
  {
    id: "visio", q: "Comment réussir un entretien en visio ?",
    keys: ["visio", "visioconference", "a distance", "en ligne", "zoom", "teams", "skype", "meet", "webcam", "connexion internet"],
    answer: "Testez la veille le lien, le son et la caméra. Placez-vous face à une source de lumière, caméra à hauteur des yeux, dans un endroit calme. Regardez l'objectif quand vous parlez.",
    more: "Fermez les autres applications et coupez les notifications. Gardez votre CV et quelques notes à côté de l'écran, sans les lire. Si la connexion coupe, rappelez ou reconnectez-vous et reprenez simplement là où vous en étiez.",
    example: "Connectez-vous cinq minutes avant l'heure prévue. Si le recruteur ne vous entend pas, vous pouvez l'écrire dans la discussion : « Je ne vous entends plus, je me reconnecte. »",
    related: ["regard", "fond-video", "telephone"],
  },
  {
    id: "telephone", q: "Comment se préparer à un entretien téléphonique ?",
    keys: ["telephone", "telephonique", "appel", "au telephone", "premier appel", "preselection"],
    answer: "Installez-vous au calme, avec votre CV, l'offre d'emploi et de quoi noter. Comme le recruteur ne vous voit pas, votre voix porte tout : parlez clairement et un peu plus lentement que d'habitude.",
    more: "Rester debout aide parfois à mieux poser la voix. Notez le nom de votre interlocuteur au début de l'appel. À la fin, demandez quelle est la prochaine étape.",
    example: "Pour vous préparer, entraînez-vous en mode « Son seulement » : le retour portera sur votre voix et le contenu.",
    related: ["voix-seule", "visio", "debit"],
  },
  {
    id: "salaire", q: "Comment parler de salaire ?",
    keys: ["salaire", "remuneration", "paye", "paie", "combien je veux", "pretentions salariales", "pretention", "argent", "smic", "negocier", "combien demander", "combien gagner"],
    answer: "Renseignez-vous avant sur les salaires habituels du métier et de la région, pour avoir une fourchette en tête. Si la question vient, donnez cette fourchette simplement, sans vous excuser.",
    more: "Vous pouvez aussi retourner la question poliment : « Quelle est la fourchette prévue pour ce poste ? ». Pour beaucoup de postes, le salaire est fixé par une grille ou une convention collective : c'est une information légitime à demander.",
    example: "« D'après mes recherches, pour un poste de {poste} dans la région, je vise entre … et … euros brut par mois, selon les horaires et les missions. »",
    related: ["questions-recruteur", "hors-sujet"],
  },
  {
    id: "motivation", q: "Comment expliquer ma motivation pour le poste ?",
    keys: ["motivation", "pourquoi ce poste", "pourquoi ce metier", "pourquoi postuler", "envie", "interesse", "choisir ce metier"],
    answer: "Reliez trois éléments : ce qui vous plaît dans le métier, ce que vous savez de l'entreprise, et ce que vous pouvez apporter. Une motivation est plus convaincante quand elle s'appuie sur une expérience vécue.",
    more: "Évitez les raisons uniquement pratiques (proximité, horaires), même si elles comptent : gardez-les en complément. Pour un poste de {poste}, dites ce qui vous attire concrètement dans les missions du quotidien.",
    example: "« J'aime le contact avec le public : pendant mon stage en mairie, c'est la partie que je préférais. Votre structure accueille beaucoup de familles, et j'aimerais mettre ce goût de l'accueil à leur service. »",
    related: ["entreprise", "se-presenter", "metier"],
  },
  {
    id: "entreprise", q: "Comment me renseigner sur l'entreprise ?",
    keys: ["entreprise", "renseigner", "se renseigner", "recherche sur l entreprise", "que savez vous de nous", "societe", "employeur", "structure", "secteur"],
    answer: "Consultez le site de l'entreprise, ses réseaux et l'offre d'emploi. Retenez trois choses : ce qu'elle fait, une information récente ou un projet, et ce qui vous intéresse chez elle.",
    more: "Si c'est possible, passez devant le lieu de travail ou parlez à quelqu'un qui y travaille. Notez une ou deux questions qui vous viennent pendant vos recherches : elles serviront en fin d'entretien.",
    example: "« J'ai vu que vous avez ouvert un deuxième magasin l'an dernier ; j'imagine que l'équipe s'agrandit, c'est ce qui m'a donné envie de postuler. »",
    related: ["motivation", "questions-recruteur"],
  },
  {
    id: "fin-entretien", q: "Que faire après l'entretien ?",
    keys: ["apres l entretien", "relancer", "relance", "remercier", "remerciement", "mail de remerciement", "pas de nouvelles", "reponse du recruteur", "attendre la reponse", "refus"],
    answer: "Le jour même ou le lendemain, vous pouvez envoyer un court message de remerciement. Si vous n'avez pas de nouvelles après le délai annoncé, une relance polie est tout à fait acceptée.",
    more: "Notez juste après l'entretien les questions posées et ce que vous aimeriez améliorer : c'est une excellente base pour votre prochain entraînement. En cas de réponse négative, vous pouvez demander poliment un retour pour progresser.",
    example: "« Bonjour Madame Martin, je vous remercie pour notre échange de ce matin. Le poste correspond tout à fait à ce que je recherche et je reste disponible pour toute information complémentaire. »",
    related: ["questions-recruteur", "coach-partage"],
  },
  {
    id: "questions-difficiles", q: "Que faire si je ne sais pas répondre ?",
    keys: ["ne sais pas repondre", "sais pas quoi repondre", "question piege", "pieges", "question difficile", "questions difficiles", "dechausse", "deroute", "je ne comprends pas la question", "mise en situation"],
    answer: "Prenez un temps pour réfléchir, c'est accepté. Vous pouvez reformuler la question pour vous assurer de l'avoir comprise, ou demander une précision. Si vous ne savez vraiment pas, dites-le simplement et proposez ce que vous feriez.",
    more: "Pour une mise en situation, décrivez étape par étape comment vous agiriez : écouter, comprendre le problème, proposer une solution, demander de l'aide si besoin. Il n'y a souvent pas une seule bonne réponse.",
    example: "« Si je comprends bien, vous me demandez comment je réagirais face à un client mécontent ? (pause) D'abord, je l'écouterais jusqu'au bout sans l'interrompre… »",
    related: ["pauses", "exemples", "questions-perso"],
  },
  {
    id: "reconversion", q: "Comment parler d'une reconversion ?",
    keys: ["reconversion", "changer de voie", "nouveau metier", "pas d experience", "aucune experience", "sans experience", "debutant", "premier emploi", "jeune diplome", "manque d experience"],
    answer: "Mettez en avant ce que vous apportez déjà : les compétences acquises ailleurs qui servent dans le nouveau métier, et ce que vous avez fait pour vous préparer (formation, stage, immersion, bénévolat).",
    more: "Expliquez le déclic de façon positive, tourné vers le nouveau métier plutôt que contre l'ancien. Montrez que votre projet est réfléchi : vous avez découvert le métier, vous en connaissez les contraintes.",
    example: "« Après dix ans dans la restauration, je me suis tournée vers l'aide à domicile. J'y retrouve le service aux personnes et l'organisation. J'ai fait une immersion de deux semaines qui m'a confirmé ce choix. »",
    related: ["experiences", "trous-cv", "motivation"],
  },
  {
    id: "questions-personnelles", q: "Le recruteur peut-il me demander si j'ai des enfants ?",
    keys: ["enfants", "enceinte", "grossesse", "marie", "situation familiale", "religion", "origine", "age", "question personnelle", "questions personnelles", "discrimination", "illegale", "interdite", "sante", "handicap"],
    answer: "Un recruteur ne doit pas fonder sa décision sur votre vie privée (situation familiale, grossesse, origine, religion, santé…). Vous pouvez répondre de façon courte et neutre, en ramenant l'échange vers le poste.",
    more: "Par exemple, sans entrer dans les détails, vous pouvez rassurer sur votre disponibilité. Si une question vous semble discriminatoire, parlez-en à votre coach, qui pourra vous orienter.",
    example: "« Ma situation personnelle me permet tout à fait de respecter les horaires du poste. »",
    related: ["hors-sujet", "trous-cv"],
  },
  {
    id: "documents", q: "Que faut-il apporter à l'entretien ?",
    keys: ["apporter", "documents", "papiers", "emporter", "prendre avec moi", "cv imprime", "lettre de motivation", "diplomes", "carte d identite", "sac"],
    answer: "Apportez deux exemplaires de votre CV, l'offre d'emploi, de quoi noter et, si c'est demandé, vos diplômes ou certificats. Gardez aussi le nom de la personne à demander et son numéro.",
    more: "Relisez votre CV avant l'entretien : le recruteur peut vous interroger sur n'importe quelle ligne. Préparez une petite fiche avec vos exemples et vos questions, à consulter avant d'entrer.",
    example: "Une pochette simple avec CV, offre, carnet et stylo suffit largement.",
    related: ["ponctualite", "tenue"],
  },
  {
    id: "francais", q: "Le français n'est pas ma langue maternelle, comment faire ?",
    keys: ["francais", "langue maternelle", "accent", "mal parler", "je parle mal", "mon niveau de francais", "langue etrangere", "fle"],
    answer: "C'est une richesse, et un accent n'empêche pas d'être bien compris. Préparez des phrases simples et courtes pour les questions classiques, et parlez à un rythme posé. Vous pouvez demander de répéter une question, c'est normal.",
    more: "Entraînez-vous plusieurs fois sur la même question : la répétition rend les phrases plus naturelles. Si vous parlez d'autres langues, mentionnez-le : c'est souvent un atout, selon le poste.",
    example: "« Excusez-moi, pouvez-vous répéter la question, s'il vous plaît ? » est une phrase utile à préparer.",
    related: ["debit", "vocabulaire", "refaire"],
  },
  {
    id: "disponibilite", q: "Que répondre sur ma disponibilité ou ma mobilité ?",
    keys: ["disponibilite", "disponible", "quand pouvez vous commencer", "mobilite", "permis", "voiture", "deplacer", "horaires", "week end", "temps partiel", "temps plein"],
    answer: "Préparez une réponse claire et honnête : à partir de quand vous pouvez commencer, les horaires possibles et vos moyens de déplacement. Mieux vaut être précis que promettre ce que vous ne pourrez pas tenir.",
    more: "Si vous avez une contrainte, présentez aussi la solution que vous avez prévue (transport, garde, organisation). Si vous n'avez pas le permis, indiquez les transports que vous utilisez et le temps de trajet.",
    example: "« Je suis disponible dès le 1er du mois prochain. Je n'ai pas le permis, mais le bus me dépose à dix minutes du site, y compris pour les horaires du matin. »",
    related: ["questions-personnelles", "ponctualite"],
  },
  {
    id: "reussir", q: "Comment bien préparer mon entretien ?",
    keys: ["reussir", "reussite", "conseil", "astuce", "preparer", "preparation", "se preparer", "bien preparer", "entretien d embauche", "par ou commencer", "commencer"],
    answer: "Quatre étapes simples : relire l'offre et votre CV, vous renseigner sur l'entreprise, préparer trois ou quatre exemples vécus, et vous entraîner à voix haute sur les questions classiques. Le jour J, prévoyez votre trajet et arrivez en avance.",
    more: "Préparez aussi deux questions à poser au recruteur et une réponse claire sur votre disponibilité. S'entraîner à voix haute fait une vraie différence : les idées viennent plus facilement quand on les a déjà formulées.",
    example: "Par exemple, pour un poste de {poste} : la veille, relisez l'offre et soulignez trois missions ; pour chacune, notez une expérience qui s'en rapproche. Entraînez-vous ensuite ici sur la présentation et la motivation.",
    related: ["questions-frequentes", "se-presenter", "entreprise"],
  },
  {
    id: "questions-frequentes", q: "Quelles questions pose-t-on souvent en entretien ?",
    keys: ["questions frequentes", "questions classiques", "questions habituelles", "on va me poser", "va me demander", "quelles questions", "type de questions", "genre de questions", "questions courantes"],
    answer: "Les questions qui reviennent le plus : « Présentez-vous », « Pourquoi ce poste ? », « Parlez-moi d'une expérience », « Quelles sont vos qualités et vos points à travailler ? », « Que savez-vous de nous ? » et « Avez-vous des questions ? ».",
    more: "S'y ajoutent souvent une mise en situation propre au métier (« Que feriez-vous si… ? »), une question sur votre parcours et une sur votre disponibilité. Toutes ces questions sont dans la liste de l'entraînement, et vous pouvez ajouter les vôtres.",
    example: "Pour un poste de {poste}, une mise en situation fréquente ressemble à : « Que faites-vous si plusieurs personnes ont besoin de vous en même temps ? ».",
    related: ["se-presenter", "questions-difficiles", "entrainement"],
  },
  {
    id: "recommencer-courage", q: "Je n'y arrive pas, que faire ?",
    keys: ["nul", "nulle", "n arrive pas", "j y arrive pas", "y arrive pas", "decourage", "rate", "echec", "echoue", "pas a la hauteur", "pas capable", "trop dur", "difficile pour moi", "honte"],
    answer: "S'entraîner, c'est justement essayer, se tromper et recommencer : rien n'est noté et rien n'est envoyé sans votre accord. Reprenez une question courte, par exemple la présentation, et faites-la deux ou trois fois.",
    more: "Choisissez un seul point à travailler à la fois : une première phrase claire, ou un exemple concret. Votre coach peut aussi vous aider à choisir par où commencer.",
    example: "Par exemple : un premier essai pour trouver vos idées, un deuxième en ajoutant un exemple, un troisième en soignant la dernière phrase.",
    related: ["refaire", "echauffement", "coach-partage"],
  },
];

/* ─── Normalisation ─── */
const STOP = new Set(("a ai au aux avec c ca ce cela ces cet cette d de des du elle en est et etre il ils j je l la le les leur lui m ma me mes moi mon n ne nous on ou par pour qu que quel quelle quelles quels qui quoi s sa se ses si son sur t ta te tes toi ton tu un une vos votre vous y comment est-ce faut il dois doit peux peut puis-je puis faire fait bien tres plus moins quand meme alors donc mais pourquoi avoir aller dire veux voudrais aimerais savoir comme").split(" "));
const SYN = {
  curriculum: "cv", cvs: "cv", visioconference: "visio", visios: "visio", webcam: "camera", cam: "camera",
  remuneration: "salaire", paye: "salaire", paie: "salaire", entretiens: "entretien", recruteuse: "recruteur", recruteurs: "recruteur",
  employeur: "recruteur", rh: "recruteur", tel: "telephone", phone: "telephone", conseillere: "coach", conseiller: "coach",
  accompagnatrice: "coach", accompagnateur: "coach", referente: "coach", referent: "coach", trous: "trou",
  flouter: "flou", floute: "flou", stressee: "stresse", stressant: "stress", angoissee: "angoisse",
};
export const normalize = s => stripAccents(s)
  .replace(/œ/g, "oe").replace(/[’'`]/g, " ").replace(/[^a-z0-9?]+/g, " ").replace(/\s+/g, " ").trim();
const stem = w => (w.length > 4 && /[sx]$/.test(w) ? w.slice(0, -1) : w);
const tokens = s => normalize(s).replace(/\?/g, " ").split(" ").filter(Boolean).map(w => SYN[w] || w).map(stem).filter(w => !STOP.has(w));

const tokMatch = (kt, it) => it === kt || (kt.length >= 4 && it.startsWith(kt)) || (it.length >= 5 && kt.startsWith(it) && kt.length - it.length <= 2);
const INDEX = KB.map(e => {
  const seen = new Set();
  const keys = e.keys.map(k => tokens(k)).filter(k => k.some(t => t !== "pas") && !seen.has(k.join(" ")) && seen.add(k.join(" ")));
  return { e, keys, qt: tokens(e.q) };
});
const byId = Object.fromEntries(KB.map(e => [e.id, e]));

function scoreAll(toks, lastId) {
  const res = [];
  for (const { e, keys, qt } of INDEX) {
    let sc = 0;
    for (const k of keys) {
      if (k.every(kt => toks.some(it => tokMatch(kt, it)))) sc += 1 + k.length;
    }
    // départage : proximité avec la formulation type de l'entrée
    if (sc) sc += 0.4 * qt.filter(kt => toks.some(it => tokMatch(kt, it))).length;
    if (sc && lastId) {
      if (byId[lastId]?.related.includes(e.id)) sc += 0.75; // on rebondit volontiers sur un sujet voisin
      if (e.id === lastId) sc += 0.5;
    }
    if (sc) res.push([sc, e]);
  }
  return res.sort((a, b) => b[0] - a[0]);
}

const fillText = (t, poste) => fillPoste(t, poste, "le poste visé");

/* ─── Suggestions par contexte ─── */
/* Suggestions : uniquement la préparation d'entretien (les questions sur le site renvoient vers la FAQ). */
export const CONTEXT_SUGGESTIONS = {
  general: ["Comment bien préparer mon entretien ?", "Comment me présenter en entretien ?", "Quelles questions pose-t-on souvent en entretien ?", "Comment gérer le trac avant un entretien ?"],
  warmup: ["Comment gérer le trac avant un entretien ?", "Comment me présenter en entretien ?", "Comment bien structurer une réponse ?", "Je parle trop vite, que faire ?"],
  debrief: ["Comment me présenter en entretien ?", "Comment expliquer un trou dans mon CV ?", "Quelles questions poser au recruteur ?", "Comment expliquer ma motivation pour le poste ?"],
  record: ["Comment donner un exemple concret ?", "Comment bien structurer une réponse ?", "Que faire si je ne sais pas répondre ?", "Faut-il regarder la caméra ou l'écran ?"],
  feedback: ["Je parle trop vite, que faire ?", "Comment dire moins de « euh » ?", "Comment donner un exemple concret ?", "Les silences, est-ce grave ?"],
};

/* Sujets sur le fonctionnement du site : réponse courte, puis renvoi vers les questions fréquentes. */
export const SITE_TOPICS = new Set(["fonctionnement", "echauffement", "entrainement", "questions-perso", "retour-assistant", "confidentialite", "video-devenir", "coach-partage", "coach-rapport", "rapport-ecrit-video", "camera", "voix-seule", "fond-video", "supprimer", "refaire", "duree", "metier", "transcription"]);
export const FAQ_HINT = "Pour les autres questions sur le site, consultez les questions fréquentes (page À propos).";

function topicSuggestions(e, given) {
  const out = [];
  if (e.example && !given.includes("example")) out.push("Un exemple ?");
  if (e.more && !given.includes("more")) out.push("Plus de détails");
  else if (e.why && !given.includes("why")) out.push("Pourquoi ?");
  for (const r of e.related) if (out.length < 3 && byId[r] && !SITE_TOPICS.has(r)) out.push(byId[r].q);
  return out.slice(0, 3);
}

/* ─── Relances ─── */
const RX = {
  thanks: /\b(merci|thanks|parfait|genial|top|super)\b/,
  greet: /^(bonjour|bonsoir|salut|hello|coucou|bjr)\b/,
  example: /\b(exemple|exemples|illustr\w*|concretement)\b/,
  why: /^(et )?(pourquoi|pour quelle raison|ca sert a quoi|a quoi ca sert|c est important)\b/,
  more: /(plus de detail|plus de precision|en dire plus|dites m en plus|developp|detaill|precisez|expliquez mieux|expliquer davantage|encore un conseil|d autres conseils|un autre conseil|autre chose|et ensuite|et apres|continuez|\bencore\b|^plus$|^et$)/,
  yes: /^(oui|ok|okay|d accord|daccord|volontiers|je veux bien|vas y|allez y|oui merci|oui svp|oui s il vous plait|carrement)$/,
  no: /^(non|non merci|pas besoin|ca ira|c est bon|rien)$/,
  andFor: /^(et |mais )(pour|si|en|dans|avec|quand|sur|le|la|les|un|une|au|a)\b\s*/,
};
const FOLLOW_FILLER = new Set(["exemple", "donner", "donnez", "avoir", "autre", "moi", "svp", "plait", "pourriez", "pouvez", "voudrais", "veux", "aimerai", "aimerais", "precis", "concret", "concretement", "illustrer", "pourquoi", "detail", "plus", "dire", "encore", "merci", "oui", "ok", "okay", "accord", "daccord", "volontier", "vas", "allez", "carrement", "non", "bon", "tres", "bien", "parfait", "super"]);

/* Réponse locale. memory = { topic, given: [] } ; renvoie { text, memory, suggestions, topic }. */
export function localReply(input, memory = {}, { context = "warmup", poste } = {}) {
  const n = normalize(input).replace(/\?/g, "").trim();
  const toks = tokens(input);
  const content = toks.filter(t => !FOLLOW_FILLER.has(t));
  const last = memory.topic ? byId[memory.topic] : null;
  const given = memory.given || [];
  const out = (text, e, g) => ({
    text: fillText(e && SITE_TOPICS.has(e.id) && g && g.length === 1 ? `${text} ${FAQ_HINT}` : text, poste),
    topic: e ? e.id : memory.topic || null,
    memory: e ? { topic: e.id, given: g } : memory,
    suggestions: e ? topicSuggestions(e, g) : (CONTEXT_SUGGESTIONS[context] || CONTEXT_SUGGESTIONS.general).slice(0, 3),
  });

  if (!n) return out("Je vous écoute. Posez votre question sur la préparation de votre entretien.", null);

  // Salutations et remerciements courts
  if (RX.greet.test(n) && content.length <= 1) return out("Bonjour ! Je réponds à vos questions pour préparer votre entretien d'embauche. Que souhaitez-vous savoir ?", null);
  if (RX.no.test(n)) return out("Très bien. Je reste disponible si une autre question vous vient.", null);
  if (RX.thanks.test(n) && content.length <= 1) {
    const r = last ? `Avec plaisir. Si vous le souhaitez, nous pouvons aussi parler de : « ${byId[last.related[0]]?.q} »` : "Avec plaisir. N'hésitez pas si une autre question vous vient.";
    return { ...out(r, null), suggestions: last ? last.related.filter(r => !SITE_TOPICS.has(r)).map(r => byId[r]?.q).filter(Boolean).slice(0, 3) : (CONTEXT_SUGGESTIONS[context] || CONTEXT_SUGGESTIONS.general).slice(0, 3) };
  }

  // Relances sur le sujet précédent
  if (last && content.length === 0) {
    let kind = RX.example.test(n) ? "example" : RX.why.test(n) ? "why" : RX.more.test(n) ? "more" : RX.yes.test(n) ? (last.example && !given.includes("example") ? "example" : "more") : null;
    if (kind === "why" && !last.why) kind = "more";
    if (kind) {
      if (given.includes(kind)) {
        const rel = last.related.map(r => byId[r]).filter(Boolean)[0];
        return out(`Je vous ai donné l'essentiel sur ce sujet. ${rel ? `Nous pouvons continuer avec une question voisine : « ${rel.q} »` : "Votre coach pourra aller plus loin avec vous."}`, last, given);
      }
      const text = last[kind] || last.more;
      return out(text, last, [...given, kind]);
    }
  }

  // « Et pour… ? » : nouveau sujet, en restant proche du précédent
  const query = RX.andFor.test(n) ? n.replace(RX.andFor, "") : n;
  const qToks = query === n ? toks : tokens(query);
  const ranked = scoreAll(qToks, memory.topic);
  if (ranked.length && ranked[0][0] >= 2) {
    const e = ranked[0][1];
    // Demande d'exemple ou de détails formulée avec le sujet (« un exemple de présentation ? »)
    if (RX.example.test(n) && e.example && e.id !== "exemples") return out(e.example, e, ["answer", "example"]);
    if (e.id === memory.topic && RX.more.test(n) && e.more) return out(e.more, e, [...given, "more"]);
    return out(e.answer, e, ["answer"]);
  }

  // Relance sans contenu reconnu mais avec un sujet en cours
  if (last && (RX.example.test(n) || RX.more.test(n) || RX.why.test(n))) {
    const kind = RX.example.test(n) ? "example" : RX.why.test(n) && last.why ? "why" : "more";
    if (!given.includes(kind) && last[kind]) return out(last[kind], last, [...given, kind]);
  }

  // Repli honnête
  const sugg = (CONTEXT_SUGGESTIONS[context] || CONTEXT_SUGGESTIONS.general).slice(0, 3);
  return {
    text: "Je n'ai pas de réponse à cette question. Je peux vous aider à préparer un entretien. Pour une question sur le site, consultez les questions fréquentes. Pour votre situation personnelle, votre coach est la bonne personne. Vous pouvez par exemple me demander :",
    topic: memory.topic || null, memory, suggestions: sugg, fallback: true,
  };
}

/* Réponse neutre à un ressenti déclaré par la personne (auto-déclaration, jamais déduit).
   Pas de commentaire ni de diagnostic : un accusé de réception et des conseils pratiques. */
export const FEELINGS = [
  { id: "bien", label: "Bien" },
  { id: "pret", label: "Envie de continuer" },
  { id: "mitige", label: "Entre les deux" },
  { id: "tendu", label: "Un peu de tension" },
  { id: "nsp", label: "Je ne sais pas" },
];
export function feelingAck(id) {
  const base = "Merci pour votre réponse. Elle reste sur cet appareil.";
  const tips = {
    bien: "Vous pouvez enchaîner avec un entraînement sur une ou deux questions.",
    pret: "Vous pouvez enchaîner avec un entraînement sur une ou deux questions.",
    mitige: "Si vous le souhaitez, refaites un échauffement avec une autre phrase, ou commencez l'entraînement par une question courte.",
    tendu: "Si cela peut aider, voici un conseil pratique : inspirez sur quatre temps, expirez sur six, trois fois de suite, puis commencez par une question que vous connaissez bien.",
    nsp: "Vous pouvez avancer à votre rythme : un autre échauffement ou une première question, comme vous préférez.",
  };
  return `${base} ${tips[id] || tips.nsp}`;
}

/* ─── Modèle de langage facultatif ─── */
const SYSTEM_PROMPT = `Tu es l'assistant de « La Répét' », un outil d'entraînement à l'entretien d'embauche utilisé dans des prestations d'accompagnement vers l'emploi en France.
Périmètre : la préparation d'un entretien d'embauche (présentation, expériences, qualités, points à travailler, trous dans le CV, questions au recruteur, préparation pratique, tenue, ponctualité, visio, téléphone, salaire, disponibilité).
Règles strictes :
- Réponds en français, au vouvoiement, avec un ton positif, simple et non évaluatif, en 2 à 5 phrases courtes. N'utilise pas de tiret cadratin.
- Ne donne aucune note, aucun score, aucun classement.
- Ne déduis et ne commentes jamais l'état émotionnel, l'attitude ou la personnalité de la personne (interdit par l'article 5(1)(f) du règlement européen sur l'IA). Si la personne évoque son ressenti, donne seulement des conseils pratiques (respiration, préparation), sans diagnostic.
- Ne demande aucune donnée personnelle (nom, adresse, téléphone, situation).
- Pour une question sur le fonctionnement du site, renvoie vers la page « Questions fréquentes » (À propos). Pour ce qui dépasse ce périmètre (droits, démarches, contrat, situation personnelle), renvoie poliment vers le coach.
- Rappelle si on te le demande que tu es un programme, pas une personne.
- Appuie-toi sur l'historique de la conversation pour répondre aux relances (« un exemple ? », « pourquoi ? », « et pour… ? »).`;

/* history : [{ role: "user" | "assistant", content }] (dernier message = question de la personne). */
export async function askAssistant(history, { context = "warmup", poste, memory } = {}) {
  const lastUser = [...history].reverse().find(m => m.role === "user")?.content || "";
  const local = localReply(lastUser, memory, { context, poste });
  if (!llmEnabled()) return { ...local, source: "local" };

  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), LLM_TIMEOUT_MS.chat);
  try {
    const content = await llmComplete("chat", {
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\nContexte de l'écran : ${context === "feedback" ? "retour de l'assistant après une réponse enregistrée" : context === "debrief" ? "questionnaire de fin d'échauffement" : "échauffement"}. Métier visé : ${poste || "non précisé"}.` },
          ...history.slice(-16).map(m => ({ role: m.role === "assistant" ? "assistant" : "user", content: String(m.content).slice(0, 2000) })),
        ],
        max_tokens: 400,
    }, { signal: ctrl.signal });
    const text = content.replace(/\u2014/g, ",").trim();
    if (!text || text.length > 1800 || !assistantCompliant(text)) throw new Error("réponse non conforme");
    return { ...local, text, source: "llm", fallback: false };
  } catch (e) {
    console.warn("[assistant] modèle de langage indisponible ou réponse non conforme, réponse locale utilisée", e);
    return { ...local, source: "local" };
  } finally {
    clearTimeout(timer);
  }
}
