/* Fond de l'accueil : un seul calque fixe derrière toutes les sections (aucun fond de section), donc sans rupture
   entre le héros, la phrase et la strate. Deux masses de couleur, le violet en haut à droite et le bleu en bas à gauche.
   Souris : rien ne suit le pointeur ; les deux masses reçoivent toujours des décalages opposés. Sur la diagonale qui
   les relie, elles s'écartent l'une de l'autre dès que le pointeur s'approche de l'une d'elles ; sur l'autre diagonale,
   elles glissent en sens contraires. La zone claire du milieu reste ainsi autour du pointeur.

   Rendu pensé pour Safari (mesuré sous WebKit, 22 novembre 2026) : chaque masse est une petite image pré-rendue une
   seule fois (dégradé radial de 256 px dessiné dans un canevas aux couleurs GLOW), agrandie par CSS. Safari la pose
   telle quelle sur le compositeur (couche image, sans zone à repeindre), et le mouvement ne touche que `transform`
   et `opacity` : aucun dégradé ni masque recalculé à chaque image. L'ancien masque de fondu (variable --fy réécrite
   à chaque image) et les grands dégradés CSS faisaient repeindre tout l'écran sous WebKit.
   Mouvement amorti (inertie calée sur le temps écoulé, pas sur le nombre d'images), écrit directement dans le style
   et seulement quand la valeur change (aucun rendu React). Dérive lente autonome (CSS, compositeur) : rotation lente du conteneur
   autour du centre, les deux masses glissent en sens contraires ; sur souris comme sur tactile. Il s'efface en douceur à l'approche du pied de page (opacité du calque).
   Immobile en mouvement réduit, masqué en mode concentration. Aucun capteur d'orientation. */
import React, { useEffect, useRef } from "react";
import { GLOW } from "../ui.jsx";
import { useReducedMotion } from "../motion.jsx";

const U = [0.56, -0.83];          // du centre vers le violet (le bleu est à l'opposé) ; W = [0.83, 0.56] lui est perpendiculaire
const SPREAD = 0.42, SLIDE = 0.30; // écartement le long de U et glissement le long de W, en part de la fenêtre (0,26 et 0,17
                                   // jusqu'au 22 novembre 2026 : encore trop peu visible sous Safari, thème clair)
const SOFT = 0.35;                // arrondi de l'écartement autour du centre : aucun rebond quand le pointeur le traverse
const TAU = 220;                  // constante de temps de l'amorti, en ms
const CORE = 0.45;                // part du rayon où la masse garde sa pleine intensité (0,30 jusqu'au 22 novembre 2026) : plus de présence,
                                  // sans dépasser l'intensité maximale fixée par thème (contraste du texte, GStyle)

/* Décalage du violet pour une souris en (mx, my), repère centré de -1 à 1. Le bleu reçoit l'opposé.
   Souris au centre : aucun décalage (composition d'origine). */
export function opposed(mx, my) {
  const s = mx * U[0] + my * U[1], t = mx * -U[1] + my * U[0];
  const e = (Math.hypot(s, SOFT) - SOFT) * SPREAD, g = t * SLIDE;
  return [U[0] * e - U[1] * g, U[1] * e + U[0] * g];
}

/* Profil d'intensité de 0 (centre) à 1 (bord) : plein jusqu'à CORE, puis décroissance douce (smoothstep), sans arête. */
export function profile(r) {
  if (r <= CORE) return 1;
  const x = Math.min(1, (r - CORE) / (1 - CORE));
  return 1 - x * x * (3 - 2 * x);
}

/* Image d'une masse : la couleur du jeton GLOW à pleine opacité au centre ; l'intensité réelle est l'opacité de la
   couche, fixée par thème dans GStyle. Calculée une fois par couleur et gardée en mémoire. */
const cache = {};
function massImage(glow) {
  if (cache[glow]) return cache[glow];
  const N = 256, c = document.createElement("canvas");
  c.width = c.height = N;
  const g = c.getContext && c.getContext("2d");
  if (!g) return "";
  const grad = g.createRadialGradient(N / 2, N / 2, 0, N / 2, N / 2, N / 2);
  for (let k = 0; k <= 24; k++) grad.addColorStop(k / 24, glow.replace(/[\d.]+\)\s*$/, `${profile(k / 24).toFixed(4)})`));
  g.fillStyle = grad;
  g.fillRect(0, 0, N, N);
  return (cache[glow] = c.toDataURL("image/png"));
}

export function Background() {
  const ref = useRef(null);
  const reduced = useReducedMotion();
  useEffect(() => {
    const el = ref.current; if (!el) return;
    const violet = el.querySelector("i"), blue = el.querySelector("b");
    const [iv, ib] = el.querySelectorAll("img");
    if (iv && !iv.getAttribute("src")) iv.src = massImage(GLOW.violet);
    if (ib && !ib.getAttribute("src")) ib.src = massImage(GLOW.blue);
    /* (tx, ty) : décalage visé du violet, en part de la fenêtre ; (x, y) : décalage lissé ; sy : part du défilement. */
    let tx = 0, ty = 0, x = 0, y = 0, sy = 0, raf = 0, last = 0, vw = window.innerWidth, vh = window.innerHeight;
    const fine = !window.matchMedia || window.matchMedia("(pointer: fine)").matches;
    /* Position du pied de page mémorisée (PERF-05) : relue au redimensionnement seulement, pas à chaque image. */
    let footTop = null, lastT = "", lastO = "";
    const measure = () => {
      const f = document.querySelector("footer"); footTop = f ? f.getBoundingClientRect().top + window.scrollY : null;
      vw = window.innerWidth; vh = window.innerHeight;
    };
    measure();
    const paint = () => {
      /* Fondu avant le pied de page : pleine intensité tant que son haut est sous le bas de l'écran, nulle quand il
         atteint le tiers supérieur. Opacité du calque seulement (compositeur). */
      const fy = footTop != null ? footTop - window.scrollY : vh * 2;
      const o = Math.max(0, Math.min(1, (fy - vh * 0.33) / (vh * 0.67))).toFixed(3);
      if (o !== lastO) { el.style.opacity = o; lastO = o; }
      const dx = (x * vw).toFixed(1), dy = ((y + sy) * vh).toFixed(1), t = dx + "," + dy;
      if (t === lastT) return;
      lastT = t;
      violet.style.transform = `translate3d(${dx}px,${dy}px,0)`;
      blue.style.transform = `translate3d(${-dx}px,${-dy}px,0)`;
    };
    const ro = typeof ResizeObserver !== "undefined" ? new ResizeObserver(() => { measure(); paint(); }) : null;
    ro?.observe(document.body);
    /* Défilement : les deux masses glissent doucement (souris seulement ; sur tactile, le défilement est géré hors du
       fil principal par Safari et un décalage écrit en JavaScript y saccaderait : la dérive CSS suffit). */
    const target = () => {
      if (reduced || !fine) return 0;
      const max = Math.max(1, document.documentElement.scrollHeight - vh);
      return (window.scrollY / max - 0.5) * 0.24;
    };
    let ts = target(); sy = ts;
    const tick = now => {
      const k = 1 - Math.exp(-Math.min(64, now - (last || now - 16)) / TAU); last = now;
      x += (tx - x) * k; y += (ty - y) * k; sy += (ts - sy) * k;
      paint();
      if (Math.abs(tx - x) + Math.abs(ty - y) + Math.abs(ts - sy) > 0.0005) raf = requestAnimationFrame(tick);
      else { raf = 0; last = 0; }
    };
    const kick = () => { if (!raf) raf = requestAnimationFrame(tick); };
    paint();
    const onScroll = () => { ts = target(); if (reduced || !fine) paint(); else kick(); };
    const onResize = () => { measure(); paint(); };
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onResize, { passive: true });
    const mv = e => {
      if (e.pointerType !== "mouse") return;
      [tx, ty] = opposed(e.clientX / vw * 2 - 1, e.clientY / vh * 2 - 1); kick();
    };
    if (!reduced) window.addEventListener("pointermove", mv, { passive: true });
    return () => {
      ro?.disconnect(); cancelAnimationFrame(raf);
      window.removeEventListener("scroll", onScroll); window.removeEventListener("resize", onResize);
      window.removeEventListener("pointermove", mv);
    };
  }, [reduced]);
  /* span : dérive lente (CSS) ; i et b : décalages opposés (JavaScript) ; img : intensité du thème (opacité). */
  return (
    <div ref={ref} aria-hidden className="rs-glow rp-deco">
      <span>
        <i><img alt="" draggable="false" decoding="async" /></i>
        <b><img alt="" draggable="false" decoding="async" /></b>
      </span>
    </div>
  );
}
