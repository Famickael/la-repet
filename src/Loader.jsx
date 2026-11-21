import { prefersReduced } from "./lib/a11y.js";

/* Écran de chargement : le balisage et les styles sont dans index.html (visibles avant le JavaScript).
   Cette fonction le retire au montage de React, après une durée minimale (2,5 s, décision du propriétaire ;
   0,6 s si « réduire les animations »), comptée depuis le début de la navigation : si le JavaScript arrive tard,
   aucune attente supplémentaire. Sous navigateur piloté (tests automatisés), retrait immédiat.

   Sortie (référentiel, section 7) : la barre violette se complète, puis, dans le même mouvement de 0,8 s
   (courbe douce MO.soft), les deux bulles du logo s'écartent pendant que le calque passe en fondu.
   Le site est déjà rendu dessous ; on attend qu'aucun écran d'attente de page (Suspense) ne soit affiché,
   pour éviter un double rendu (logo animé du calque, puis logo d'attente de la page). Mouvement réduit :
   fondu simple de 0,4 s, sans déplacement. */
const MIN_MS = 2500;          // animation complète : bulles qui se rejoignent (1,3 s), puis trois points
const MIN_MS_REDUCED = 600;   // « réduire les animations » : écran statique, plus bref
const OUT_MS = 800;           // sortie : fondu du calque et écart des bulles (index.html, .rpl-out)
const OUT_MS_REDUCED = 400;   // sortie en mouvement réduit : fondu simple
const BAR_MS = 250;           // fin de la barre de chargement
const MAX_WAIT_MS = 8000;     // au-delà, on retire quand même (retrait CSS de secours à 10 s)
let done = false;

/* Barre : reprend sa valeur actuelle (animation CSS jusqu'à 90 %) puis va jusqu'au bout, sans saut. */
function completeBar(el) {
  const fill = el.querySelector(".rpl-bar i");
  if (!fill) return;
  const now = getComputedStyle(fill).transform;
  fill.style.animation = "none";
  fill.style.transform = now && now !== "none" ? now : "scaleX(.9)";
  void fill.offsetWidth; // valeur figée avant la transition
  fill.style.transition = `transform ${BAR_MS}ms cubic-bezier(.2,.7,.3,1)`;
  fill.style.transform = "scaleX(1)";
}

/* Écran d'attente d'une page chargée à la demande (BrandLoader dans #root) encore affiché ? */
const pagePending = () => !!document.querySelector("#root .rp-bl-r");

export function dismissLoader() {
  if (done || typeof document === "undefined") return;
  done = true;
  const el = document.getElementById("rp-loader");
  if (!el) return;
  const auto = typeof navigator !== "undefined" && navigator.webdriver;
  if (auto) { el.remove(); return; }
  const reduced = prefersReduced();
  const start = performance.now();
  const wait = Math.max(0, (reduced ? MIN_MS_REDUCED : MIN_MS) - start);
  const leave = () => {
    let gone = false;
    const remove = () => { if (gone) return; gone = true; el.remove(); };
    el.addEventListener("transitionend", e => { if (e.target === el && e.propertyName === "opacity") remove(); });
    setTimeout(remove, (reduced ? OUT_MS_REDUCED : OUT_MS) + 400);
    if (!reduced) completeBar(el);
    requestAnimationFrame(() => el.classList.add("rpl-out"));
  };
  const tick = () => {
    if (pagePending() && performance.now() - start < MAX_WAIT_MS) { setTimeout(tick, 100); return; }
    leave();
  };
  setTimeout(tick, wait);
}
