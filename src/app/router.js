import { prefersReduced } from "../lib/a11y.js";
import { PAGES } from "../content/legal.js";
import { getState } from "../lib/store.js";

/* Carte du site (menus de l'en-tête, src/app/Nav.jsx) :
     À propos       #/a-propos                              l'organisme (texte d'exemple à remplacer)
     Solutions      #/solutions                             ce qui nourrit la solution (page d'entrée)
                    #/solutions/usage-de-l-ia               ce que fait l'assistant, garde-fous, AI Act
                    #/solutions/recherche                   recherche en accompagnement
                    #/solutions/fonctionnalites             l'outil pas à pas
                    #/solutions/methode                     comment l'outil sert l'accompagnement
     Cas d'usage    #/cas-d-usage                           page d'entrée par public
                    #/cas-d-usage/beneficiaires(/section)   personnes accompagnées (demandeurs-emploi, collaborateurs)
                    #/cas-d-usage/coachs                    coachs
                    #/cas-d-usage/commanditaires            commanditaires publics et privés
     Ressources     #/ressources                            conseils et guides (une seule page)
                    #/ressources/SLUG                       ressource
                    #/ressources/faq(/section)              questions fréquentes (personnes, coachs, commanditaires)
   Anciennes adresses redirigées (history.replaceState) : voir REDIRECTS et la fonction redirect. */

export const SOLUTION_PAGES = ["usage-de-l-ia", "recherche", "fonctionnalites", "methode"];
export const USECASE_PAGES = ["beneficiaires", "coachs", "commanditaires"];
export const FAQ_SECTIONS = ["personnes-accompagnees", "coachs", "commanditaires"];

/* Anciennes ancres → nouvelles (avant la refonte des menus du 21 novembre 2026). */
export const REDIRECTS = {
  "#/fonctionnement": "#/solutions/fonctionnalites",
  "#/solutions/assistant": "#/solutions/usage-de-l-ia",
  "#/solutions/demandeurs-emploi": "#/cas-d-usage/beneficiaires/demandeurs-emploi",
  "#/solutions/beneficiaires": "#/cas-d-usage/beneficiaires/demandeurs-emploi",
  "#/solutions/collaborateurs": "#/cas-d-usage/beneficiaires/collaborateurs",
  "#/solutions/coachs": "#/cas-d-usage/coachs",
  "#/solutions/commanditaires": "#/cas-d-usage/commanditaires",
  "#/solutions/organismes": "#/cas-d-usage/commanditaires",
  "#/a-propos/faq": "#/ressources/faq",
  "#/a-propos/ia-et-recherche": "#/solutions/recherche",
};

function redirect(to) {
  history.replaceState(null, "", to);
  return parse(to);
}

export function routeFromHash() {
  const h = location.hash;
  if (REDIRECTS[h]) return redirect(REDIRECTS[h]);
  /* Catégories de ressources (supprimées) : la page Ressources, filtrée sur le thème. */
  const c = h.match(/^#\/ressources\/c\/([a-z0-9-]+)$/);
  if (c) { history.replaceState(null, "", "#/ressources"); return { role: "resources", cat: c[1] }; }
  /* Autres sous-pages de À propos (notre démarche…) : la page À propos. */
  if (/^#\/a-propos\/[a-z-]+$/.test(h)) return redirect("#/a-propos");
  return parse(h);
}

function parse(h) {
  /* Espaces : la vue est dans l'ancre (BUG-07), pour que Précédent et Suivant suivent les écrans. */
  const m = h.match(/^#\/s\/([A-Za-z0-9]{6})(?:\/([a-z0-9/-]*))?$/);
  if (m) return { role: "benef", code: m[1].toUpperCase(), sub: m[2] || "" };
  if (h === "#/beneficiaire") return { role: "benef", code: null };
  const c = h.match(/^#\/coach(?:\/([A-Za-z0-9/-]*))?$/);
  if (c) return { role: "coach", sub: c[1] || "" };
  let r = h.match(/^#\/solutions(?:\/([a-z-]+))?$/);
  if (r && !r[1]) return { role: "solutions" };
  if (r && SOLUTION_PAGES.includes(r[1])) return { role: "solutions", page: r[1] };
  r = h.match(/^#\/cas-d-usage(?:\/([a-z-]+))?(?:\/([a-z-]+))?$/);
  if (r && !r[1]) return { role: "usecases" };
  if (r && USECASE_PAGES.includes(r[1])) return { role: "usecases", page: r[1], section: r[2] };
  if (h === "#/a-propos") return { role: "about" };
  r = h.match(/^#\/ressources\/faq(?:\/([a-z-]+))?$/);
  if (r) return { role: "faq", section: FAQ_SECTIONS.includes(r[1]) ? r[1] : undefined };
  r = h.match(/^#\/ressources(?:\/([a-z0-9-]+))?$/);
  if (r) return { role: "resources", slug: r[1] };
  r = h.match(/^#\/vos-donnees(?:\/([a-z-]+))?$/);
  if (r) return { role: "legal", page: PAGES[r[1]] && r[1] !== "hub" ? r[1] : "hub" };
  if (h === "#/conditions") return { role: "legal", page: "conditions" };
  if (h === "#/mentions-legales") return { role: "legal", page: "mentions" };
  if (h === "#/accessibilite") return { role: "legal", page: "accessibilite" };
  if (h === "#/demo") return { role: "demo" };
  if (h === "#/espace") return { role: "espace" };
  if (h === "" || h === "#" || h === "#/") return { role: "home" };
  return { role: "notfound" }; // ancre inconnue (BUG-16)
}

/* Ancre canonique d'une route (pour le menu actif et le référencement). */
export const hashOf = route => {
  switch (route?.role) {
    case "solutions": return route.page ? `#/solutions/${route.page}` : "#/solutions";
    case "usecases": return route.page ? `#/cas-d-usage/${route.page}` : "#/cas-d-usage";
    case "faq": return "#/ressources/faq";
    case "resources": return route.slug ? `#/ressources/${route.slug}` : "#/ressources";
    case "about": return "#/a-propos";
    default: return "";
  }
};

export const reducedMotion = () => prefersReduced();

export const go = hash => { if (location.hash === hash) window.scrollTo({ top: 0 }); else location.hash = hash; };

/* Adresse de l'espace à ouvrir. pref : « benef » (boutons pour la personne accompagnée), « coach » (boutons pour les
   coachs), ou rien (« Mon compte »). Session ouverte côté personne accompagnée (dernier espace utilisé sur cet
   appareil) : son espace ; côté coach : l'espace coach ; sinon la page « Mon espace » (code d'accès ou connexion
   coach). Même définition de la session que l'en-tête (src/app/Nav.jsx). Une personne connectée n'est jamais
   renvoyée vers un formulaire de connexion : un coach connecté qui clique sur un bouton destiné aux personnes
   accompagnées arrive dans l'espace coach. */
export function spaceHash(pref) {
  const s = getState(), ls = s.lastSpace;
  const benef = ls?.role === "benef" && s.parcours[ls.code] ? `#/s/${ls.code}` : null;
  const coach = ls?.role === "coach" && s.counselor ? "#/coach" : null;
  if (pref === "coach") return coach || (s.counselor && !benef ? "#/coach" : null) || "#/espace";
  return benef || coach || "#/espace";
}

/* « Mon espace » : rouvre le dernier espace utilisé sur cet appareil, sinon propose le choix. */
export function openSpace(pref) { go(spaceHash(typeof pref === "string" ? pref : undefined)); }

export const PUBLIC = ["notfound", "home", "about", "solutions", "usecases", "resources", "faq", "demo", "legal"];
