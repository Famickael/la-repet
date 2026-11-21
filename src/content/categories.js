/* Catégories et types des ressources, séparés des articles (PERF-02) : l'en-tête du site les affiche sans charger
   les articles. */
/* Catégories : identifiant (utilisé dans l'en-tête des articles et dans l'adresse), titre, description,
   icône (clé de I) et image d'illustration (public/img/categories/<id>.webp). */
export const CATEGORIES = [
  { id: "preparer", title: "Préparer son entretien", desc: "Se présenter, parler de ses expériences, gérer le trac, préparer sa venue.", icon: "target" },
  { id: "questions", title: "Questions de recruteurs", desc: "Les questions fréquentes, comment y répondre, et celles à poser à votre tour.", icon: "chat" },
  { id: "visio", title: "Entretien en visio", desc: "Matériel, cadre, regard et attitude pour un entretien à distance.", icon: "monitor" },
  { id: "guides", title: "Guides La Répét'", desc: "Utiliser La Répét' pas à pas, quand on s'entraîne.", icon: "book" },
  { id: "coachs", title: "Pour les coachs", desc: "Créer des parcours, relire les réponses, animer un débriefing.", icon: "users" },
  { id: "commanditaires", title: "Pour les commanditaires", desc: "Confier un accompagnement : acteurs publics de l'emploi et entreprises.", icon: "building" },
];

export const TYPES = { guide: "Guide", cas: "Scénario d'usage" };

