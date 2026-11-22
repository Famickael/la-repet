/* Titres d'onglets, descriptions et aperçus de lien, page par page (docs/seo.md).
   Branché dans src/App.jsx : applySeo(route) à chaque changement de route ; les articles de Ressources affinent le
   titre et la description (seoArticle). Rien ici ne s'exécute à l'import.

   Règles :
   - titre d'onglet : « Page · La Répét' », le mot utile en premier (un onglet tronqué garde le début) ;
     l'accueil a un titre propre qui dit ce que fait le site ;
   - description : 140 à 160 caractères, vraie, sans chiffre, sans promesse, sans nom de moteur d'IA, sans note ni
     score ; vérifiable avec checkSeo() ;
   - routage par ancre (#/...) : les robots ignorent l'ancre et n'exécutent pas le JavaScript. L'adresse canonique
     reste donc la racine du site tant que les routes ne sont pas de vraies adresses (HASH_ROUTING, docs/seo.md, 3). */

export const SITE_NAME = "La Répét'";
export const SITE_URL = "https://famickael.github.io/la-repet/"; // à changer avec le nom de domaine (docs/seo.md, 2)
export const OG_IMAGE = `${SITE_URL}og-image.png`;
export const HASH_ROUTING = true; // false quand chaque page aura sa vraie adresse (pré-rendu ou History API)
const SEP = " · ";

const t = page => `${page}${SEP}${SITE_NAME}`;

/* Clé de route (l'ancre, sans paramètre propre à une personne) → titre et description. */
export const SEO = {
  /* Routes actuelles (src/App.jsx, src/app/router.js) */
  "#/": {
    title: `S'entraîner aux entretiens avec un coach${SEP}${SITE_NAME}`,
    description: "Entretien d'embauche ou de mobilité : entraînez-vous à voix haute, sans avatar. Un retour décrit votre réponse sans la noter, et votre coach vous soutient.",
  },
  "#/a-propos": {
    title: t("Qui sommes-nous"),
    description: "L'organisme derrière La Répét' : approche, méthode d'accompagnement en sept étapes, équipe, références et travail avec les commanditaires publics et privés.",
  },
  "#/solutions": {
    title: t("Solutions"),
    description: "Ce qui nourrit La Répét' : un assistant IA qui décrit sans noter, des choix fondés sur la recherche en accompagnement, des fonctions pensées avec les coachs.",
  },
  "#/ressources": {
    title: t("Conseils pour l'entretien"),
    description: "Articles et fiches pratiques pour préparer un entretien : se présenter, parler de ses expériences, réussir une visio, questions à poser au recruteur.",
  },
  "#/demo": {
    title: t("Nous contacter"),
    description: "Vous financez ou organisez un accompagnement vers l'emploi ou la mobilité ? Décrivez votre projet à l'organisme : publics concernés, calendrier, attentes.",
  },
  "#/espace": {
    title: t("Accéder à mon espace"),
    description: "Entrez le code d'accès remis par votre coach pour retrouver votre entraînement, ou connectez-vous à l'espace coach pour suivre vos parcours en cours.",
  },
  "#/beneficiaire": {
    title: t("Saisir mon code d'accès"),
    description: "Saisissez le code d'accès que votre coach vous a remis pour ouvrir votre espace d'entraînement. Vos vidéos restent sur cet appareil tant que vous le voulez.",
  },
  "#/s": {
    title: t("Mon espace"),
    description: "Votre espace d'entraînement personnel : questions choisies avec votre coach, réponses enregistrées sur cet appareil, retours qui décrivent sans noter.",
  },
  "#/coach": {
    title: t("Espace coach"),
    description: "L'espace des coachs : parcours d'entraînement des personnes accompagnées, réponses reçues à relire et rapports de retour à rédiger puis à envoyer.",
  },
  "#/vos-donnees": {
    title: t("Vos données, vos choix"),
    description: "Ce que La Répét' garde, où et pour combien de temps : la vidéo reste sur votre appareil, et rien ne part chez votre coach sans votre accord explicite.",
  },
  "#/vos-donnees/video": {
    title: t("Que devient ma vidéo"),
    description: "Votre vidéo est enregistrée et analysée sur votre appareil. Elle n'est envoyée à votre coach que si vous le décidez, et vous pouvez la supprimer à tout moment.",
  },
  "#/vos-donnees/assistant": {
    title: t("Ce que fait l'assistant"),
    description: "Ce que fait l'assistant de La Répét', et ce qu'il ne fait pas : il décrit votre réponse, ne la note pas, ne devine aucune émotion et ne décide jamais pour vous.",
  },
  "#/vos-donnees/droits": {
    title: t("Vos droits sur vos données"),
    description: "Accès, rectification, effacement, retrait de votre accord : comment exercer vos droits sur vos données personnelles, et qui contacter pour le faire.",
  },
  "#/vos-donnees/appareil": {
    title: t("Données gardées sur cet appareil"),
    description: "La liste de ce que La Répét' garde dans le navigateur de cet appareil (vidéos, réponses, réglages), et la façon de tout effacer quand vous le souhaitez.",
  },
  "#/vos-donnees/notice": {
    title: t("Information complète sur vos données"),
    description: "Le texte complet d'information sur le traitement de vos données : responsable, finalités, base légale, durées de conservation, destinataires et droits.",
  },
  "#/vos-donnees/coachs": {
    title: t("Données des coachs"),
    description: "Pour les coachs : quelles données de votre compte et de vos parcours sont gardées, pourquoi, combien de temps, et comment exercer vos droits dessus.",
  },
  "#/conditions": {
    title: t("Règles d'utilisation"),
    description: "Les règles d'utilisation de La Répét' : à quoi sert l'outil, ce que chacun s'engage à faire, et les limites de l'assistant automatique d'entraînement.",
  },
  "#/mentions-legales": {
    title: t("Mentions légales"),
    description: "Mentions légales de La Répét' : éditeur du site, responsable de la publication, hébergeur et contacts, conformément à la loi pour la confiance numérique.",
  },
  "#/accessibilite": {
    title: t("Accessibilité du site"),
    description: "Déclaration d'accessibilité de La Répét' : état de conformité, contenus non accessibles, options d'affichage proposées et contact pour signaler un problème.",
  },
  notfound: {
    title: t("Page introuvable"),
    description: "Cette adresse ne correspond à aucune page de La Répét'. Revenez à l'accueil, aux conseils pour l'entretien ou à votre espace d'entraînement pour continuer.",
  },

  /* Menus Solutions, Cas d'usage et Ressources (src/app/router.js) */
  "#/solutions/usage-de-l-ia": {
    title: t("Notre usage de l'IA"),
    description: "Comment l'assistant aide à s'entraîner : il met la voix par écrit et décrit la réponse, sans note ni lecture des émotions. Le coach garde toujours la main.",
  },
  "#/solutions/recherche": {
    title: t("Ce que dit la recherche"),
    description: "Les travaux sur la préparation aux entretiens qui ont guidé La Répét' : entraînement, retour descriptif et rôle de l'accompagnant, avec leurs références.",
  },
  "#/solutions/fonctionnalites": {
    title: t("Fonctionnalités"),
    description: "Questions d'entretien choisies avec le coach, enregistrement vidéo sur l'appareil, retour descriptif, relecture par le coach et rapport : l'outil pas à pas.",
  },
  "#/solutions/methode": {
    title: t("Méthode d'accompagnement"),
    description: "Comment La Répét' sert l'accompagnement : s'entraîner, se revoir, lire un retour qui décrit sans noter, débriefer avec le coach et transférer vers l'entretien.",
  },
  "#/cas-d-usage": {
    title: t("Cas d'usage"),
    description: "Personnes accompagnées, coachs, commanditaires : ce que l'accompagnement outillé par La Répét' change pour chacun, avec des exemples concrets d'usage.",
  },
  "#/cas-d-usage/beneficiaires": {
    title: t("Personnes accompagnées"),
    description: "Demandeurs d'emploi, salariés en mobilité ou en évolution : comment une personne accompagnée prépare son entretien avec La Répét' et avec son coach.",
  },
  "#/cas-d-usage/coachs": {
    title: t("Coachs et conseillers"),
    description: "Comment un coach prépare un parcours, suit l'entraînement entre deux rendez-vous et rédige un retour à partir des réponses que la personne choisit d'envoyer.",
  },
  "#/cas-d-usage/commanditaires": {
    title: t("Commanditaires publics et privés"),
    description: "Financeurs de l'emploi et entreprises : comment l'organisme prépare aux entretiens les personnes que vous lui confiez, avec ses coachs et La Répét'.",
  },
  "#/ressources/faq": {
    title: t("Questions fréquentes"),
    description: "Les réponses aux questions courantes sur La Répét' : déroulé de l'entraînement, devenir de la vidéo, rôle du coach, limites de l'assistant et accès au site.",
  },
};

/* Pages dynamiques : catégorie et article de Ressources (titre et résumé fournis par le contenu). */
export const seoCategory = name => ({ title: `${name}${SEP}Ressources${SEP}${SITE_NAME}`, description: null });
export const seoArticle = (title, summary) => ({ title: t(title), description: summary || null });

/* Route (objet de routeFromHash, src/app/router.js) ou ancre → clé de SEO. Les codes et identifiants propres à une
   personne ne font jamais partie de la clé. */
const LEGAL_KEY = { hub: "#/vos-donnees", conditions: "#/conditions", mentions: "#/mentions-legales", accessibilite: "#/accessibilite" };
export function seoKey(route) {
  if (typeof route === "string") {
    const h = route.replace(/^#?\/?/, "#/").replace(/\/$/, "") || "#/";
    if (h === "#" || h === "#/") return "#/";
    if (/^#\/s\//.test(h)) return "#/s";
    if (/^#\/coach(\/|$)/.test(h)) return "#/coach";
    return SEO[h] ? h : "notfound";
  }
  switch (route?.role) {
    case "home": return "#/";
    case "about": return "#/a-propos";
    case "solutions": return route.page ? `#/solutions/${route.page}` : "#/solutions";
    case "usecases": return route.page ? `#/cas-d-usage/${route.page}` : "#/cas-d-usage";
    case "faq": return "#/ressources/faq";
    case "resources": return "#/ressources";
    case "demo": return "#/demo";
    case "espace": return "#/espace";
    case "benef": return route.code ? "#/s" : "#/beneficiaire";
    case "coach": return route.counselor === false ? "#/espace" : "#/coach";
    case "legal": return LEGAL_KEY[route.page] || `#/vos-donnees/${route.page}`;
    default: return "notfound";
  }
}

export const seoFor = (route, extra) => ({ ...SEO["#/"], ...SEO[seoKey(route)], ...(extra?.title ? extra : {}) });

/* Adresse canonique : la racine tant que le routage passe par l'ancre (Google n'accepte pas d'ancre en canonique). */
export const canonicalFor = route => {
  if (HASH_ROUTING) return SITE_URL;
  const k = seoKey(route);
  return k === "#/" || k === "notfound" ? SITE_URL : `${SITE_URL}${k.slice(2)}`;
};

function setMeta(attr, key, value) {
  if (value == null) return;
  let el = document.head.querySelector(`meta[${attr}="${key}"]`);
  if (!el) { el = document.createElement("meta"); el.setAttribute(attr, key); document.head.appendChild(el); }
  el.setAttribute("content", value);
}

/* Met à jour l'onglet et les balises de la page affichée. extra : { title, description } pour un article ou une
   catégorie (seoArticle, seoCategory). Utile pour l'onglet, l'historique, les favoris et les lecteurs d'écran ; sans
   effet sur les aperçus de lien, que les robots tirent d'index.html (docs/seo.md, 3). */
export function applySeo(route, extra) {
  if (typeof document === "undefined") return;
  const { title, description } = seoFor(route, extra);
  document.title = title;
  setMeta("name", "description", description);
  setMeta("property", "og:title", title);
  setMeta("property", "og:description", description);
  let link = document.head.querySelector('link[rel="canonical"]');
  if (!link) { link = document.createElement("link"); link.rel = "canonical"; document.head.appendChild(link); }
  link.href = canonicalFor(route);
}

/* Contrôle des règles ci-dessus (titre au bon format, description de 140 à 160 caractères, pas de tiret cadratin). */
export function checkSeo() {
  const errors = [];
  for (const [k, { title, description }] of Object.entries(SEO)) {
    if (!title.endsWith(`${SEP}${SITE_NAME}`)) errors.push(`${k} : titre sans « ${SEP}${SITE_NAME} »`);
    if (description.length < 140 || description.length > 160) errors.push(`${k} : description de ${description.length} caractères`);
    if ((title + description).includes(String.fromCharCode(0x2014))) errors.push(`${k} : tiret cadratin`);
  }
  return errors;
}
