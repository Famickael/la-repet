/* Garde-fou de conformité, sans dépendance (partageable avec les fonctions serveur, docs/plan-production.md 1.6).
   Règles non négociables : aucune note, aucun score, aucune inférence d'émotion, d'état intérieur ou de
   personnalité (AI Act, art. 5(1)(f)).

   Le texte est d'abord normalisé (NFC, minuscules, apostrophes typographiques unifiées, espaces simples).
   Les motifs utilisent des frontières Unicode, (?<!\p{L}) et (?!\p{L}), et non \b, qui ne reconnaît pas une
   frontière devant une lettre accentuée (« émotion », « à l'aise »). Les accents sont tolérés quand une sortie
   de modèle peut les omettre ([ée]motion).

   Deux niveaux :
   - textCompliant(t, "strict") : retour sur une réponse (analyse locale ou reformulée) et propositions du coach.
     Aucun mot d'émotion ou d'état intérieur, même neutre (« calme », « serein », « le trac »), aucune appréciation
     globale (« excellent », « très bien »), aucune note ;
   - textCompliant(t, "assistant") : assistant de préparation. Il peut parler du trac ou du stress quand la personne
     en parle (conseils pratiques), mais ne qualifie jamais la personne (« vous semblez », « votre stress »,
     « vous êtes tendu ») et ne note jamais. */

export const normText = s => String(s ?? "").normalize("NFC").toLowerCase()
  .replace(/[’‘ʼ`´]/g, "'").replace(/[  ]/g, " ").replace(/\s+/g, " ");

const L = "(?<!\\p{L})"; // début de mot
const E = "(?!\\p{L})"; // fin de mot
const rx = parts => new RegExp(parts.join("|"), "iu");

/* Notes chiffrées, pourcentages de réussite, niveaux, étoiles : interdits partout. */
const NUM = "(?:\\d+(?:[.,]\\d+)?|deux|trois|quatre|cinq|six|sept|huit|neuf|dix|onze|douze|treize|quatorze|quinze|seize|dix-sept|dix-huit|dix-neuf|vingt)";
export const SCORE = rx([
  `${L}${NUM}\\s*(?:\\/|sur)\\s*(?:4|5|10|20|100|cinq|dix|vingt|cent)${E}(?!\\d)`,
  `${L}notes? (?:de |d'|sur |:\\s*|=\\s*)${NUM}`,
  `${L}not[ée]e?s? (?:${NUM}|sur)${E}`,
  `${L}je (?:vous|te) (?:mets|donne|attribue) ${NUM}`,
  `${L}(?:votre|ta|ton) (?:note|score|classement)${E}`,
  `${L}(?:r[ée]ussite|ma[îi]trise|performance|r[ée]sultat)\\s*:?\\s*\\d+\\s*%`,
  `\\d+\\s*%\\s*(?:de |d')(?:r[ée]ussite|ma[îi]trise|bonnes r[ée]ponses|performance)`,
  `${L}niveau [a-e]${E}`,
  `${L}niveau \\d`,
  `${L}[ée]toiles?${E}`,
]);
/* Vocabulaire de la notation (retour et coach seulement : l'assistant peut expliquer qu'il ne note pas). */
export const GRADING = rx([
  `${L}notes?\\s*(?::|=)`,
  `${L}une note${E}`,
  `${L}notes? (?:globale|finale|moyenne)`,
  `${L}scores?${E}`,
  `${L}classement${E}`,
]);

/* Appréciation globale de la réponse ou de la personne (retour et coach seulement). */
export const APPRECIATION = rx([
  `${L}excellent\\p{L}*`,
  `${L}tr[èe]s bien${E}`,
  `${L}tr[èe]s bonne? (?:prestation|r[ée]ponse|performance|pr[ée]sentation|travail|entretien)`,
  `${L}(?:bonne|mauvaise|belle) (?:prestation|performance)`,
  `${L}bravo${E}`,
  `${L}parfait(?:e|s|es)?${E}`,
  `${L}m[ée]diocre`,
  `${L}insuffisan\\p{L}*`,
  `${L}remarquable\\p{L}*`,
  `${L}impeccable\\p{L}*`,
  `${L}brillant\\p{L}*`,
]);

/* Mots d'émotion, d'état intérieur ou de personnalité (retour et coach seulement : même neutres, ils n'ont pas leur place
   dans une description de faits observables). */
export const EMOTION = rx([
  `${L}stress\\p{L}*`, `${L}anxi\\p{L}*`, `${L}angoiss\\p{L}*`, `${L}nerv(?:eux|euse|euses|eusement|osit[ée])${E}`,
  `${L}[ée]motion\\p{L}*`, `${L}[ée]moti(?:f|fs|ve|ves|vit[ée])${E}`, `${L}[ée]mue?s?${E}`,
  `${L}peurs?${E}`, `${L}timid\\p{L}*`, `${L}trac${E}`, `${L}tendue?s?${E}`, `${L}crisp[ée]\\p{L}*`,
  `${L}g[êe]n[ée]e?s?${E}`, `${L}agac[ée]\\p{L}*`, `${L}fatigu[ée]e?s?${E}`, `${L}inqui[eè]t\\p{L}*`, `${L}paniqu\\p{L}*`,
  `${L}calmes?${E}`, `${L}serein\\p{L}*`, `${L}s[ée]r[ée]nit[ée]${E}`, `${L}d[ée]tendue?s?${E}`,
  `${L}(?:mal )?[àa] l'aise${E}`, `${L}aisance${E}`,
  `${L}confiance en (?:soi|vous|toi)`, `${L}manque de confiance`, `${L}confiante?s?${E}`,
  `${L}(?:manque|manquez|manquer|plus|peu|gagner en|davantage|avec|sans) d'assurance`, `${L}avec assurance`,
  `${L}sinc[èe]r\\p{L}*`, `${L}motiv[ée]e?s?${E}`, `${L}motivation apparente`,
  `${L}personnalit[ée]s?${E}`, `${L}introverti\\p{L}*`, `${L}extraverti\\p{L}*`,
  `${L}sourire${E}`, `${L}souriante?s?${E}`, `${L}enthousias\\p{L}*`,
  `${L}triste\\p{L}*`, `${L}joie${E}`, `${L}col[èe]re${E}`, `${L}frustr\\p{L}*`,
  `${L}contente?s?${E}`, `${L}heureu(?:x|se|ses)${E}`, `${L}honte${E}`, `${L}embarras\\p{L}*`, `${L}d[ée]courag\\p{L}*`,
  `${L}h[ée]sitante?s?${E}`,
]);

/* Qualifier la personne : interdit partout, y compris dans l'assistant de préparation. */
const STATE = "(?:stress|anxi|angoiss|nerv|[ée]mue?|tendue?|crisp|calme|serein|d[ée]tendue?|inqui|timide|[àa] l'aise|mal [àa] l'aise|g[êe]n[ée]|agac|fatigu|contente?|heureu|triste|motiv[ée]|sinc[èe]re|confiante?|paniqu|souriante?|enthousias|introverti|extraverti|h[ée]sitante?)";
export const ATTRIBUTION = rx([
  `${L}vous (?:semblez|sembliez|semblerez|paraissez|paraissiez|para[îi]trez|avez l'air|aviez l'air|aurez l'air|d[ée]gagez|d[ée]gagiez)${E}`,
  `${L}tu (?:sembles|semblais|parais|paraissais|as l'air|avais l'air)${E}`,
  `${L}on (?:vous |te )?sent${E}`,
  `${L}je (?:vous |te )?sens (?:que|bien|chez)${E}`,
  `${L}(?:votre|ton|ta|vos|tes) (?:[ée]motions?|stress|trac|nervosit[ée]|anxi[ée]t[ée]|angoisses?|peurs?|timidit[ée]|g[êe]ne|malaise|aisance|assurance|confiance en (?:vous|toi)|enthousiasme|sinc[ée]rit[ée]|s[ée]r[ée]nit[ée]|calme|tension|personnalit[ée]|[ée]tat (?:[ée]motionnel|int[ée]rieur|d'esprit))${E}`,
  `(?<!(?:si|quand|lorsque|m[êe]me si) )${L}(?:vous|tu) (?:[êe]tes|[ée]tiez|avez [ée]t[ée]|restez|restiez|es|[ée]tais|as [ée]t[ée])(?: \\p{L}+){0,2} ${STATE}`,
  `${L}(?:vous manquez|tu manques) (?:de confiance|d'assurance|d'aisance)`,
  `(?<!(?:si|quand|lorsque|m[êe]me si) )${L}(?:vous avez|tu as) (?:eu )?(?:le trac|peur)${E}`,
]);

/* niveau : "strict" (retour, coach) ou "assistant". */
export function textCompliant(text, level = "strict") {
  const t = normText(text);
  if (SCORE.test(t) || ATTRIBUTION.test(t)) return false;
  if (level === "strict" && (GRADING.test(t) || EMOTION.test(t) || APPRECIATION.test(t))) return false;
  return true;
}

/* Comparaison de deux entretiens (« Ce qui a changé », src/lib/compare.js) : en plus du filtre strict, aucun mot qui
   juge l'écart entre deux entretiens (« mieux », « meilleur », « moins bien », « progrès », « amélioré », « régressé »),
   aucun pourcentage, aucune évolution chiffrée. On décrit un changement, on ne le qualifie pas. Ce filtre ne porte que
   sur les phrases de la synthèse : la promesse du site (« mesurer votre progression ») n'y passe pas. */
export const JUDGEMENT = rx([
  `${L}mieux${E}`, `${L}meilleure?s?${E}`, `${L}moins bien${E}`, `${L}moins bon(?:ne)?s?${E}`, `${L}pires?${E}`,
  `${L}progr[èe]s${E}`, `${L}progress\\p{L}*`, `${L}am[ée]lior\\p{L}*`, `${L}r[ée]gress\\p{L}*`, `${L}d[ée]grad\\p{L}*`,
  `${L}r[ée]ussi\\p{L}*`, `${L}rat[ée]e?s?${E}`, `${L}[ée]chou\\p{L}*`, `${L}[ée]chec${E}`,
  `${L}trop${E}`, `${L}pas assez${E}`, `${L}bien jou[ée]${E}`, `${L}f[ée]licit\\p{L}*`, `${L}dommage${E}`,
  `\\d\\s*%`, `${L}pour\\s?cent${E}`, `${L}points? de (?:plus|moins)${E}`, `${L}(?:en hausse|en baisse|en progression)${E}`,
]);
export const changeCompliant = text => textCompliant(text, "strict") && !JUDGEMENT.test(normText(text));

/* Retour structuré (analyse locale ou modèle de langage) : textes conformes et forme attendue. */
export function feedbackCompliant(a) {
  if (!a || typeof a.synthese !== "string" || !Array.isArray(a.dimensions)) return false;
  const all = [a.synthese, ...a.dimensions.flatMap(d => [d.titre, d.observation, d.conseil])].join(" \n ");
  if (!textCompliant(all, "strict")) return false;
  return a.dimensions.every(d => d.id && d.titre && (d.type === "appui" || d.type === "explorer") && typeof d.t === "number");
}
