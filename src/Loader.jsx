import { prefersReduced } from "./lib/a11y.js";

/* Écran de chargement : le balisage et les styles sont dans index.html (visibles avant le JavaScript).
   Cette fonction le retire au montage de React, après une durée minimale (2,5 s, décision du propriétaire ;
   0,6 s si « réduire les animations »), comptée depuis le début de la navigation : si le JavaScript arrive tard,
   aucune attente supplémentaire. Sous navigateur piloté (tests automatisés), retrait immédiat.

   Sortie en trois temps (référentiel, section 7, demande du propriétaire : « qu'on voie bien la séparation ») :
   1. la barre violette se complète et les deux bulles du logo s'écartent (0,6 s, courbe douce MO.soft) ;
   2. courte pause, bulles écartées (0,3 s) ;
   3. le calque passe en fondu (0,6 s).
   Mouvement réduit : fondu simple de 0,4 s, sans déplacement.

   Cause du sursaut constaté à la fin du chargement : la page commençait son animation d'entrée au montage de
   React (héros qui monte de 12 px, encarts de la scène qui glissent, lignes qui apparaissent une à une, photo du
   héros encore en cours de chargement), et ce montage tombe d'autant plus tard que le réseau est lent : la fin de
   cette chorégraphie se jouait pendant le fondu, donc la page bougeait sous le calque qui s'effaçait. Le calque
   attend désormais une page immobile (pageSettled) : polices prêtes, images visibles décodées, aucune animation
   ni transition d'entrée en cours dans #root (les boucles infinies, comme le fond qui dérive, ne comptent pas).
   Il attend aussi qu'aucun écran d'attente de page (Suspense) ne soit affiché, pour éviter un double rendu. */
const MIN_MS = 2500;          // animation complète : bulles qui se rejoignent (1,3 s), puis trois points
const MIN_MS_REDUCED = 600;   // « réduire les animations » : écran statique, plus bref
const SPLIT_MS = 600;         // 1. écart des bulles (index.html, .rpl-split)
const PAUSE_MS = 300;         // 2. pause, bulles écartées
const OUT_MS = 600;           // 3. fondu du calque (index.html, .rpl-out)
const OUT_MS_REDUCED = 400;   // sortie en mouvement réduit : fondu simple
const BAR_MS = 250;           // fin de la barre de chargement
const MAX_WAIT_MS = 8000;     // au-delà, on retire quand même (retrait CSS de secours à 10 s) ; reste sous PACE.scene
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

/* Page immobile : rien ne doit changer de place, de taille ni d'aspect pendant et après le fondu. */
export function pageSettled() {
  if (document.fonts && document.fonts.status !== "loaded") return false;
  const vh = window.innerHeight;
  for (const im of document.querySelectorAll("#root img")) {
    if (im.loading === "lazy") continue;
    const r = im.getBoundingClientRect();
    if (r.bottom > 0 && r.top < vh && r.width > 0 && !im.complete) return false;
  }
  if (!document.getAnimations) return true;
  return !document.getAnimations().some(a => {
    if (a.playState !== "running" && a.playState !== "pending") return false;
    const t = a.effect && a.effect.target;
    if (!t || !t.closest || !t.closest("#root")) return false;
    const iter = a.effect.getComputedTiming ? a.effect.getComputedTiming().iterations : 1;
    return iter !== Infinity;
  });
}

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
  const fade = () => {
    let gone = false;
    const remove = () => { if (gone) return; gone = true; el.remove(); };
    el.addEventListener("transitionend", e => { if (e.target === el && e.propertyName === "opacity") remove(); });
    setTimeout(remove, (reduced ? OUT_MS_REDUCED : OUT_MS) + 400);
    el.classList.add("rpl-out");
  };
  const leave = () => {
    if (reduced) { requestAnimationFrame(fade); return; }
    completeBar(el);
    requestAnimationFrame(() => {
      el.classList.add("rpl-split");
      setTimeout(fade, SPLIT_MS + PAUSE_MS);
    });
  };
  const tick = () => {
    if ((pagePending() || !pageSettled()) && performance.now() - start < MAX_WAIT_MS) { setTimeout(tick, 100); return; }
    leave();
  };
  setTimeout(tick, wait);
}
