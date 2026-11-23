/* Vue d'un espace dans l'ancre de l'adresse (BUG-07) : Précédent et Suivant suivent les écrans, un rechargement
   rouvre le même écran quand c'est possible. replace : remplace l'entrée courante (écran de passage).
   Notifier le routeur dans la même mise à jour que le changement de vue : un hashchange natif différé
   peut arriver après un retour navigateur et le routeur ne verrait alors jamais l'adresse intermédiaire. */
export function writeHash(hash, replace = false) {
  if (location.hash === hash) return;
  const oldURL = location.href;
  if (replace) history.replaceState(null, "", hash);
  else history.pushState(null, "", hash);
  window.dispatchEvent(new HashChangeEvent("hashchange", { oldURL, newURL: location.href }));
}

/* Espace de la personne : #/s/CODE/<écran>[/<réponse>[/video]] ; comparaison : #/s/CODE/comparaison/<avant>/<après> */
const B_SUB = { home: "", warmup: "echauffement", pick: "questions", record: "reponse", processing: "preparation", choose: "lecture", report: "retour", share: "envoi", sent: "envoye", recap: "recapitulatif", compare: "comparaison" };
const B_VIEW = Object.fromEntries(Object.entries(B_SUB).map(([v, k]) => [k, v]));
export const TAKE_VIEWS = ["choose", "report", "share"];
export function benefSub(view, ctx = {}) {
  let sub = B_SUB[view] ?? "";
  if (view === "compare" && ctx.compare?.length === 2) sub += `/${ctx.compare[0]}/${ctx.compare[1]}`;
  if (TAKE_VIEWS.includes(view) && ctx.takeId) sub += `/${ctx.takeId}${view === "report" && ctx.mode === "video" ? "/video" : ""}`;
  return sub;
}
export function parseBenefSub(sub = "") {
  const [k = "", takeId = null, mode] = sub.split("/");
  if (B_VIEW[k] === "compare") return { view: "compare", takeId: null, mode: "simple", compare: takeId && mode ? [takeId, mode] : null };
  return { view: B_VIEW[k] ?? "home", takeId: takeId || null, mode: mode === "video" ? "video" : "simple" };
}

/* Espace coach : #/coach, #/coach/parcours/CODE, #/coach/relecture/CODE/RÉPONSE, #/coach/comparaison/CODE/AVANT/APRÈS */
export function coachSub(view) {
  if (view.name === "parcours") return `parcours/${view.code}`;
  if (view.name === "review") return `relecture/${view.code}/${view.takeId}`;
  if (view.name === "compare") return `comparaison/${view.code}/${view.a}/${view.b}`;
  return "";
}
export function parseCoachSub(sub = "") {
  const [k, code, takeId, other] = sub.split("/");
  if (k === "comparaison" && code && takeId && other) return { name: "compare", code, a: takeId, b: other };
  if (k === "parcours" && code) return { name: "parcours", code };
  if (k === "relecture" && code && takeId) return { name: "review", code, takeId };
  return { name: "list" };
}
