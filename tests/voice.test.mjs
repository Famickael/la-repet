/* Choix de la voix qui lit les questions (sans navigateur) : node tests/voice.test.mjs
   Les listes ci-dessous imitent getVoices() sur chaque plateforme (noms et voiceURI usuels). */
import assert from "assert/strict";
import { pickFrenchVoice, voiceQuality, speechSettings, isNetworkVoice } from "../src/lib/voice.js";

const V = (name, lang, extra = {}) => ({ name, lang, voiceURI: extra.voiceURI || name, localService: extra.localService ?? true, default: !!extra.default });
let n = 0;
const t = (label, fn) => { fn(); n++; console.log("ok  " + label); };

t("macOS Safari : la voix Premium passe avant la voix compacte", () => {
  const voices = [
    V("Samantha", "en-US", { default: true }),
    V("Thomas", "fr-FR", { voiceURI: "com.apple.voice.compact.fr-FR.Thomas" }),
    V("Jacques", "fr-FR", { voiceURI: "com.apple.eloquence.fr-FR.Jacques" }),
    V("Amélie", "fr-CA", { voiceURI: "com.apple.voice.compact.fr-CA.Amelie" }),
    V("Audrey (Premium)", "fr-FR", { voiceURI: "com.apple.voice.premium.fr-FR.Audrey" }),
    V("Thomas (amélioré)", "fr-FR", { voiceURI: "com.apple.voice.enhanced.fr-FR.Thomas" }),
  ];
  assert.equal(pickFrenchVoice(voices).name, "Audrey (Premium)");
  assert.equal(pickFrenchVoice(voices.slice(0, 4)).name, "Thomas", "sans voix téléchargée, la voix standard plutôt qu'Eloquence");
});

t("fr-FR passe avant fr-CA, même de meilleure qualité", () => {
  const voices = [V("Amélie (Enhanced)", "fr-CA", { voiceURI: "com.apple.voice.enhanced.fr-CA.Amelie" }), V("Thomas", "fr-FR")];
  assert.equal(pickFrenchVoice(voices).name, "Thomas");
});

t("Edge Windows : les voix « Online (Natural) » sont réseau, écartées par défaut", () => {
  const voices = [
    V("Microsoft Hortense - French (France)", "fr-FR"),
    V("Microsoft Denise Online (Natural) - French (France)", "fr-FR", { localService: false }),
    V("Microsoft Henri Online (Natural) - French (France)", "fr-FR", { localService: false }),
  ];
  assert.equal(pickFrenchVoice(voices).name, "Microsoft Hortense - French (France)");
  assert.equal(pickFrenchVoice(voices, { allowNetwork: true }).name, "Microsoft Denise Online (Natural) - French (France)");
  assert.ok(isNetworkVoice(voices[1]));
});

t("Chrome : « Google français » (réseau) n'est jamais choisi sans accord", () => {
  const voices = [V("Google US English", "en-US", { localService: false }), V("Google français", "fr-FR", { localService: false })];
  assert.equal(pickFrenchVoice(voices), null);
  assert.equal(pickFrenchVoice(voices, { allowNetwork: true }).name, "Google français");
});

t("à qualité égale, une voix locale passe avant une voix réseau", () => {
  const voices = [V("Google français", "fr-FR", { localService: false }), V("Thomas", "fr-FR")];
  assert.equal(pickFrenchVoice(voices, { allowNetwork: true }).name, "Thomas");
});

t("Android : la voix française locale du moteur Google est retenue", () => {
  const voices = [V("English United States", "en-US", { default: true }), V("Français France", "fr_FR"), V("Français Canada", "fr_CA")];
  assert.equal(pickFrenchVoice(voices).name, "Français France");
});

t("à égalité, la voix par défaut du système, puis l'ordre du navigateur", () => {
  assert.equal(pickFrenchVoice([V("A", "fr-FR"), V("B", "fr-FR", { default: true })]).name, "B");
  assert.equal(pickFrenchVoice([V("A", "fr-FR"), V("B", "fr-FR")]).name, "A");
});

t("Linux : eSpeak seul reste utilisable ; aucune voix française : null", () => {
  assert.equal(pickFrenchVoice([V("eSpeak French", "fr")]).name, "eSpeak French");
  assert.equal(pickFrenchVoice([V("English", "en-GB")]), null);
  assert.equal(pickFrenchVoice([]), null);
  assert.equal(pickFrenchVoice(undefined), null);
  assert.equal(pickFrenchVoice([V("Frisian", "fy-NL"), V("Franglais", "")]), null, "« fr » doit être une langue, pas un préfixe quelconque");
});

t("qualité et réglages", () => {
  assert.equal(voiceQuality(V("Audrey (Premium)", "fr-FR")), 3);
  assert.equal(voiceQuality(V("Thomas", "fr-FR", { voiceURI: "com.apple.voice.enhanced.fr-FR.Thomas" })), 2);
  assert.equal(voiceQuality(V("Thomas", "fr-FR")), 1);
  assert.equal(voiceQuality(V("Grandma", "fr-FR", { voiceURI: "com.apple.eloquence.fr-FR.Grandma" })), 0);
  for (const v of [V("Audrey (Premium)", "fr-FR"), V("Thomas", "fr-FR")]) {
    const s = speechSettings(v);
    assert.ok(s.rate < 1 && s.rate >= 0.85, "débit légèrement inférieur à 1");
    assert.equal(s.pitch, 1);
  }
});

console.log(`\n${n} vérifications du choix de voix : toutes passent.`);
