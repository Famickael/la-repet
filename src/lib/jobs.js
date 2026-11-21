/* Métiers courants de l'accompagnement vers l'emploi (France), pour l'autocomplétion du métier visé.
   La saisie libre reste possible : cette liste ne sert qu'à suggérer. */
import { stripAccents } from "./text.js";

export const JOBS = [
  // Accueil, secrétariat, administration
  "agent(e) d'accueil", "agent(e) d'accueil événementiel", "standardiste", "secrétaire", "secrétaire médical(e)",
  "assistant(e) administratif(ve)", "assistant(e) de direction", "assistant(e) RH", "gestionnaire de paie",
  "comptable", "aide-comptable", "agent(e) administratif(ve)", "employé(e) de bureau", "chargé(e) de clientèle",
  "téléconseiller(ère)", "conseiller(ère) de clientèle", "agent(e) de saisie", "agent(e) de la fonction publique",
  "secrétaire juridique", "assistant(e) de gestion",
  "gestionnaire administratif(ve)", "assistant(e) d'administration des ventes",
  // Commerce, vente
  "vendeur(se) en magasin", "vendeur(se) en prêt-à-porter", "employé(e) de libre-service", "employé(e) de commerce",
  "caissier(ère)", "caissier(ère) de station-service", "conseiller(ère) de vente", "responsable de rayon", "manager de magasin",
  "commercial(e)", "commercial(e) itinérant(e)", "chargé(e) d'affaires", "boulanger(ère) vendeur(se)", "fleuriste",
  "employé(e) de pharmacie", "préparateur(trice) en pharmacie", "opticien(ne)",
  "vendeur(se) en produits frais", "vendeur(se) en articles de sport", "vendeur(se) en bricolage",
  "poissonnier(ère)", "charcutier(ère)-traiteur(se)", "marchandiseur(se)",
  // Logistique, transport
  "préparateur(trice) de commandes", "magasinier(ère)", "cariste", "agent(e) logistique", "manutentionnaire",
  "agent(e) de quai", "réceptionnaire", "gestionnaire de stocks", "chauffeur(se) livreur(se)", "livreur(se)",
  "conducteur(trice) de poids lourd", "conducteur(trice) de bus", "conducteur(trice) de VTC", "chauffeur(se) de taxi",
  "agent(e) de tri de colis", "facteur(trice)", "déménageur(se)",
  "emballeur(se)", "conditionneur(se)", "affréteur(se)", "exploitant(e) transport routier de marchandises",
  "conducteur(trice) de tramway", "conducteur(trice) d'autocar", "conducteur(trice) de métro",
  "contrôleur(se) des transports en commun",
  // Hôtellerie, restauration
  "serveur(se)", "commis(e) de cuisine", "cuisinier(ère)", "plongeur(se)", "employé(e) polyvalent(e) de restauration",
  "serveur(se) de bar", "pâtissier(ère)", "boulanger(ère)", "boucher(ère)", "agent(e) de restauration collective", "aide de cuisine de collectivité",
  "réceptionniste d'hôtel", "employé(e) d'étage", "gouvernant(e) d'hôtel", "chef(fe) de rang", "équipier(ère) en restauration rapide",
  "second(e) de cuisine", "pizzaïolo(a)", "crêpier(ère)", "sommelier(ère)",
  "agent(e) de réservation en hôtellerie", "veilleur(se) de nuit en hôtellerie",
  // Propreté, sécurité, services
  "agent(e) d'entretien", "agent(e) de propreté", "agent(e) de nettoyage industriel", "laveur(se) de vitres", "agent(e) de sécurité",
  "gardien(ne) d'immeuble", "concierge", "agent(e) de stationnement",
  "agent(e) d'entretien des espaces verts", "jardinier(ère) paysagiste", "agent(e) de maintenance des bâtiments",
  "agent(e) machiniste en propreté",
  "employé(e) de blanchisserie", "repasseur(se)", "agent(e) de nettoyage de véhicules",
  // Aide à la personne, santé, social
  "aide à domicile", "auxiliaire de vie", "aide-soignant(e)", "agent(e) de service hospitalier", "infirmier(ère)",
  "brancardier(ère)", "ambulancier(ère)", "auxiliaire de puériculture", "assistant(e) maternel(le)", "garde d'enfants",
  "accompagnant(e) éducatif(ve) et social(e)", "moniteur(trice)-éducateur(trice)", "éducateur(trice) spécialisé(e)",
  "animateur(trice)", "animateur(trice) périscolaire", "agent(e) territorial(e) spécialisé(e) des écoles maternelles", "accompagnant(e) d'élèves en situation de handicap",
  "médiateur(trice) social(e)", "conseiller(ère) en insertion professionnelle", "agent(e) de médiation",
  "assistant(e) de vie aux familles", "employé(e) de maison", "aide ménager(ère) à domicile",
  "technicien(ne) de l'intervention sociale et familiale", "éducateur(trice) de jeunes enfants",
  "assistant(e) dentaire", "assistant(e) de service social", "assistant(e) médical(e)",
  "agent(e) de soins", "agent(e) de stérilisation", "moniteur(trice) d'atelier",
  // Bâtiment, industrie
  "maçon(ne)", "électricien(ne)", "plombier(ère)", "chauffagiste", "peintre en bâtiment", "plaquiste", "carreleur(se)",
  "menuisier(ère)", "charpentier(ère)", "couvreur(se)", "manœuvre", "ouvrier(ère) du BTP", "chef(fe) d'équipe du BTP",
  "conducteur(trice) d'engins", "agent(e) de production", "opérateur(trice) de production", "conducteur(trice) de ligne",
  "soudeur(se)", "mécanicien(ne) automobile", "carrossier(ère)", "technicien(ne) de maintenance", "électromécanicien(ne)",
  "agent(e) de fabrication en plasturgie", "monteur(se)-câbleur(se)", "contrôleur(se) qualité", "usineur(se)", "tourneur(se)-fraiseur(se)",
  "façadier(ère)", "étancheur(se)", "solier(ère)-moquettiste", "serrurier(ère)-métallier(ère)",
  "coffreur(se)-bancheur(se)", "canalisateur(trice)", "monteur(se) d'échafaudages",
  "grutier(ère)", "installateur(trice) de panneaux photovoltaïques",
  "opérateur(trice) sur commande numérique", "ajusteur(se)-monteur(se)", "chaudronnier(ère)",
  "peintre industriel(le)", "conducteur(trice) de machine de conditionnement",
  "opérateur(trice) de production alimentaire", "monteur(se)-assembleur(se)",
  // Numérique, communication
  "développeur(se) web", "technicien(ne) informatique", "administrateur(trice) systèmes et réseaux",
  "community manager", "chargé(e) de communication", "graphiste", "webmestre", "analyste de données", "chef(fe) de projet",
  "technicien(ne) d'assistance informatique", "médiateur(trice) numérique",
  "réparateur(trice) de téléphones mobiles", "installateur(trice) de fibre optique",
  // Agriculture, environnement
  "ouvrier(ère) agricole", "agent(e) viticole", "saisonnier(ère) agricole", "agent(e) de déchetterie", "ripeur(se)",
  "maraîcher(ère)", "vendangeur(se)", "cueilleur(se) de fruits",
  "ouvrier(ère) horticole", "agent(e) d'élevage laitier", "conducteur(trice) de machines agricoles",
  "palefrenier(ère)-soigneur(se)", "agent(e) de tri des déchets",
  // Éducation, formation, culture, sport
  "formateur(trice)", "professeur(e)", "surveillant(e) d'établissement", "bibliothécaire", "agent(e) d'accueil en musée",
  "éducateur(trice) sportif(ve)",
  // Beauté, bien-être
  "coiffeur(se)", "esthéticien(ne)", "prothésiste ongulaire",
  // Immobilier, banque
  "agent(e) immobilier(ère)", "conseiller(ère) bancaire", "gestionnaire de biens locatifs", "assistant(e) commercial(e)",
];

/* Normalise pour la recherche : minuscules, sans accents ni ponctuation. */
export const norm = s => stripAccents(s)
  .replace(/œ/g, "oe").replace(/[^a-z0-9]+/g, " ").trim();

const INDEX = [...new Set(JOBS)].map(j => ({ label: j, n: norm(j) }));

/* Recherche insensible aux accents et à la casse. Les débuts de libellé passent en premier,
   puis les débuts de mot, puis les correspondances au milieu d'un mot. */
export function searchJobs(query, limit = 8) {
  const q = norm(query);
  if (!q) return INDEX.slice(0, limit).map(x => x.label);
  const parts = q.split(" ");
  const scored = [];
  for (const x of INDEX) {
    if (!parts.every(p => x.n.includes(p))) continue;
    const score = x.n.startsWith(q) ? 0 : (" " + x.n).includes(" " + parts[0]) ? 1 : 2;
    scored.push([score, x.n.length, x.label]);
  }
  scored.sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  return scored.slice(0, limit).map(x => x[2]);
}
