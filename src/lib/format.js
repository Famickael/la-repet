/* Formats d'affichage uniques (ARC-12) : durées, horloges et dates, mêmes formats côté personne et côté coach. */

/* Horloge « m:ss » : arrondi d'abord, pour ne jamais afficher « 0:60 » (BUG-17). */
export function clock(s) {
  const t = Math.max(0, Math.round(Number(s) || 0));
  return `${Math.floor(t / 60)}:${String(t % 60).padStart(2, "0")}`;
}

/* Durée lisible : « 45 s » ou « 1 min 32 ». */
export function duration(s) {
  const n = Math.max(0, Math.round(Number(s) || 0));
  return n < 60 ? `${n} s` : `${Math.floor(n / 60)} min ${String(n % 60).padStart(2, "0")}`;
}

/* Insécable entre le jour et le mois (« 12 mars »), et avant l'année (RED-11) : jamais coupés en fin de ligne. */
const nbspDay = t => t.replace(/^(\d+) (\S+) (?=\d{4}\b)/, "$1\u00A0$2\u00A0").replace(/^(\d+) /, "$1\u00A0");

/* Date et heure : « 21 novembre à 14:05 ». Chaîne vide si la date manque ou n'est pas valide. */
export function dateTime(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : nbspDay(d.toLocaleString("fr-FR", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" }));
}

/* Date seule : « 21 novembre 2026 ». */
export function dateLong(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return isNaN(d) ? "" : nbspDay(d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }));
}
