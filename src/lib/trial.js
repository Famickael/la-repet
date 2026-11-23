/* Entretiens du parcours d'essai (code REPETE, src/lib/store.js) : deux entretiens de Camille sur la même question,
   à une semaine d'écart, pour ouvrir tout de suite l'analyse et la comparaison. Le texte est écrit pour l'essai,
   au format des segments horodatés de la mise par écrit ; l'analyse est celle du site (localAnalysis), calculée
   à la création. Aucun enregistrement n'est fourni : seuls le texte et l'analyse existent. */
import { localAnalysis } from "./analysis.js";

const QUESTION = "Pouvez-vous vous présenter en deux minutes ?";
const SAMPLES = [
  { id: "essai-12-mars", day: "03-12T10:05:00", duration: 58, segments: [
    [0, 6, "Bonjour, euh, je m'appelle Camille et, euh, je cherche un poste d'agent d'accueil."],
    [9, 16, "En fait, j'ai travaillé dans la vente, et du coup j'ai l'habitude du contact avec les gens."],
    [19.5, 27, "Euh, j'aime bien renseigner les personnes, les orienter, et, euh, répondre au téléphone."],
    [30, 38, "Du coup, je pense que l'accueil me correspond, en fait, parce que j'aime quand les choses sont bien organisées."],
    [41, 49, "Euh, je suis disponible rapidement et, voilà, je peux travailler le samedi."],
    [52, 56, "Je crois que c'est tout."],
  ] },
  { id: "essai-19-mars", day: "03-19T18:40:00", duration: 68, segments: [
    [0, 7, "Bonjour, je m'appelle Camille et je cherche un poste d'agent d'accueil."],
    [7.5, 17, "J'ai travaillé trois ans dans la vente, dans un magasin de sport, où j'accueillais chaque jour les clients et je répondais à leurs questions."],
    [19.5, 31, "Par exemple, lors de la période des soldes, j'ai organisé la file d'attente et, euh, renseigné les personnes une par une, ce qui a réduit l'attente à la caisse."],
    [31.5, 41, "J'aime renseigner, orienter et répondre au téléphone, et du coup je garde toujours un carnet pour noter les demandes."],
    [44, 53, "Je suis disponible rapidement, je peux travailler le samedi et je connais bien les logiciels de bureau."],
    [53.5, 64, "C'est pour ça que ce poste d'agent d'accueil me correspond : euh, il réunit le contact et l'organisation."],
  ] },
];

/* Les deux entretiens, datés de mars de l'année en cours (de l'année précédente avant le 19 mars). */
export function trialTakes(code, now = new Date()) {
  const y = now.getFullYear() - (now.getMonth() < 2 || (now.getMonth() === 2 && now.getDate() < 20) ? 1 : 0);
  return SAMPLES.map(s => {
    const segments = s.segments.map(([start, end, text]) => ({ start, end, text }));
    return {
      id: `${code.toLowerCase()}-${s.id}`, code, // minuscules : l'identifiant passe dans l'adresse (src/app/router.js)
      question: QUESTION, duration: s.duration,
      transcript: segments.map(x => x.text).join(" "), segments, gaze: null,
      analysis: { ...localAnalysis({ segments, duration: s.duration, gaze: null }), source: "local" },
      hasMedia: false, mime: null, createdAt: new Date(`${y}-${s.day}`).toISOString(),
      shared: false, sharedAt: null, note: "", report: null,
    };
  });
}
