/* Boucles de répétition de la transcription (docs/etat-fonctionnel.md, B3 et C3).
   Whisper répète parfois la même phrase en boucle sur un passage peu net (« Je suis ma mère et mon tournée. » 11 fois).
   Ces mots inventés faussent le rythme de parole et créent de faux « mots qui reviennent ».

   cleanRepetitions(segments) ramène d'abord à une seule fois une syllabe répétée en boucle dans un même mot
   (« wanakomakomakomako… » devient « wanakoma… » : 4 fois de suite ou plus), puis retire une suite de mots répétée plus de 2 fois de suite (3 fois ou plus) et n'en garde
   qu'une. Un mot seul doit revenir 4 fois de suite (« non, non, non » reste). La recherche porte sur tout le texte,
   à travers les segments : une boucle découpée en plusieurs segments est retirée de la même façon.
   Un segment vidé est supprimé avec son temps ; un segment raccourci garde son horodatage, ce qui rend le rythme
   de parole incertain (partial). Sans dépendance, idempotente. */

const MAX_N = 24; // longueur maximale, en mots, d'une phrase répétée
const SYLLABLE_LOOP = /(\p{L}{2,12}?)\1{3,}/giu;
const key = w => w.toLowerCase().normalize("NFC").replace(/[’‘]/g, "'").replace(/[^\p{L}\p{N}']+/gu, "");

export function cleanRepetitions(segments = []) {
  const toks = [];
  let loops = 0;
  const touched = new Set();
  segments.forEach((s, si) => String(s.text || "").split(/\s+/).filter(Boolean).forEach(w0 => {
    const w = w0.replace(SYLLABLE_LOOP, "$1");
    if (w !== w0) { loops++; touched.add(si); }
    toks.push({ w, k: key(w), si });
  }));
  const keep = new Array(toks.length).fill(true);
  const same = (a, b, n) => { for (let j = 0; j < n; j++) if (toks[a + j].k !== toks[b + j].k) return false; return true; };
  let removed = 0;
  for (let i = 0; i < toks.length;) {
    let done = false;
    if (toks[i].k) {
      for (let n = 1; n <= MAX_N && i + 3 * n <= toks.length && !done; n++) { // plus courte période d'abord
        let k = 1;
        while (i + (k + 1) * n <= toks.length && same(i, i + k * n, n)) k++;
        if (k >= (n === 1 ? 4 : 3)) {
          for (let j = i + n; j < i + k * n; j++) keep[j] = false;
          removed += (k - 1) * n; loops++;
          i += k * n; done = true;
        }
      }
    }
    if (!done) i++;
  }
  if (!loops) return { segments, text: segments.map(s => s.text).join(" ").replace(/\s+/g, " ").trim(), removedWords: 0, loops: 0, partial: false };

  let partial = false;
  const out = [];
  segments.forEach((s, si) => {
    const mine = toks.map((t, j) => [t, keep[j]]).filter(([t]) => t.si === si);
    const kept = mine.filter(([, k]) => k).map(([t]) => t.w);
    if (kept.length === mine.length && !touched.has(si)) { out.push(s); return; }
    if (!kept.length) return; // segment entièrement répété : retiré avec son temps
    if (kept.length < mine.length) partial = true;
    out.push({ ...s, text: kept.join(" ") });
  });
  return { segments: out, text: out.map(s => s.text).join(" ").replace(/\s+/g, " ").trim(), removedWords: removed, loops, partial };
}
