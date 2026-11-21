/* Choix de la voix française qui lit les questions (synthèse vocale du navigateur, speechSynthesis).
   Fonctions pures, sans dépendance au DOM : testées par tests/voice.test.mjs.

   Principe : prendre la meilleure voix française installée sur l'appareil plutôt que la première venue.
   - Seules les voix locales (localService !== false) sont retenues par défaut : une voix « réseau »
     (Edge « Online (Natural) », Chrome « Google français ») envoie le texte lu aux serveurs de l'éditeur
     du navigateur, ce qui contredit la règle « tout reste sur l'appareil ». allowNetwork: true les
     autorise, à réserver à un accord explicite de la personne.
   - Ordre : fr-FR avant les autres variantes du français, puis la qualité de la voix, puis la voix
     par défaut du système.
   - Qualité, de la meilleure à la moins bonne : « Premium », « Enhanced / Amélioré » et « Natural »,
     voix standard, voix de synthèse ancienne ou fantaisie (eSpeak, Eloquence, voix « novelty » d'Apple). */

const isFrench = v => /^fr([-_]|$)/i.test(v?.lang || "");
const isFranceFrench = v => /^fr[-_]FR/i.test(v?.lang || "");
export const isNetworkVoice = v => v?.localService === false;

/* Voix anciennes ou fantaisie, très robotiques : à n'utiliser qu'en dernier recours. */
const ROBOTIC = /espeak|eloquence|com\.apple\.speech\.synthesis\.voice\.|\b(jacques|eddy|flo|grandma|grandpa|grand-mère|grand-père|reed|rocko|sandy|shelley|mamie|papi)\b/i;

/* Note de qualité de 0 (robotique) à 3 (premium). */
export function voiceQuality(v) {
  const id = `${v?.name || ""} ${v?.voiceURI || ""}`;
  if (/premium/i.test(id)) return 3;
  if (/enhanced|am[ée]lior[ée]e?|natural|neural/i.test(id)) return 2;
  if (ROBOTIC.test(id)) return 0;
  return 1;
}

/* Meilleure voix française de la liste, ou null s'il n'y en a aucune d'utilisable. */
export function pickFrenchVoice(voices, { allowNetwork = false } = {}) {
  const list = Array.from(voices || []).filter(v => isFrench(v) && (allowNetwork || !isNetworkVoice(v)));
  if (!list.length) return null;
  const key = v => [isFranceFrench(v) ? 1 : 0, voiceQuality(v), isNetworkVoice(v) ? 0 : 1, v.default ? 1 : 0];
  return list
    .map((v, i) => ({ v, k: key(v), i }))
    .sort((a, b) => {
      for (let j = 0; j < a.k.length; j++) if (a.k[j] !== b.k[j]) return b.k[j] - a.k[j];
      return a.i - b.i; // à égalité, l'ordre du navigateur
    })[0].v;
}

/* Débit et hauteur : un débit légèrement inférieur à 1 donne un rythme posé d'entretien ; les voix de
   moindre qualité gagnent en clarté un peu plus lentement. La hauteur reste à 1 : la modifier dégrade
   le timbre sur la plupart des moteurs. */
export function speechSettings(v) {
  const q = voiceQuality(v);
  return { rate: q >= 2 ? 0.95 : 0.9, pitch: 1 };
}
