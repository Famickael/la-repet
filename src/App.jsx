import React, { Suspense, lazy, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useFocusOnChange, focusMainHeading } from "./lib/hooks.js";
import { flushSync } from "react-dom";
import { T, W, TY, BrandLoader, Notice, GStyle, PAD } from "./ui.jsx";
import { dismissLoader } from "./Loader.jsx";
import LegalPage, { LegalModal } from "./Legal.jsx";
import Home from "./home/index.jsx";
import A11yLayer from "./A11y.jsx";
import { useStore, getState, setLastSpace, getStorageError } from "./lib/store.js";
import { go, openSpace, reducedMotion, routeFromHash } from "./app/router.js";
import { applySeo, seoFor } from "./lib/seo.js";
import { PAGES } from "./content/legal.js";
import { Nav } from "./app/Nav.jsx";
import { Espace, NotFound } from "./app/Espace.jsx";
import { Footer } from "./app/Footer.jsx";
import { ToTop } from "./app/ToTop.jsx";

/* La Répét' : outil d'entraînement aux entretiens (embauche, mobilité, entretien professionnel) d'un organisme d'accompagnement, avec un assistant IA et un coach.
   Routes (dans l'ancre de l'adresse, pour que le bouton Retour du navigateur fonctionne). Carte complète des menus et
   anciennes adresses redirigées : src/app/router.js.
     #/                                accueil
     #/a-propos                        l'organisme (texte d'exemple, à remplacer par l'organisme réel)
     #/solutions(/page)                usage-de-l-ia, recherche, fonctionnalites, methode
     #/cas-d-usage(/page(/section))    beneficiaires (demandeurs-emploi, collaborateurs), coachs, commanditaires
     #/ressources                      conseils et guides, recherche ; #/ressources/SLUG : une ressource
     #/ressources/faq(/section)        questions fréquentes : personnes-accompagnees, coachs, commanditaires
     #/demo                            « Nous contacter » : projet d'accompagnement d'un commanditaire
     #/espace                          « Mon espace » : code d'accès ou connexion coach
     #/s/CODE(/écran)                  espace de la personne ; l'écran suit l'ancre (src/lib/viewHash.js)
     #/beneficiaire                    saisie du code
     #/coach(/parcours/CODE|relecture/CODE/ID)   espace coach (sans connexion : « Mon espace »)
     #/vos-donnees(/video|assistant|droits|appareil|notice|coachs)   information sur les données
     #/conditions, #/mentions-legales, #/accessibilite                pages légales */

/* Pages chargées à la demande (PERF-02) : l'accueil ne télécharge ni les espaces, ni les articles, ni MediaPipe. */
const Solutions = lazy(() => import("./Solutions.jsx"));
const AiUsage = lazy(() => import("./AiUsage.jsx"));
const Fonctionnalites = lazy(() => import("./Fonctionnalites.jsx"));
const Methode = lazy(() => import("./Methode.jsx"));
const UseCases = lazy(() => import("./UseCases.jsx"));
const Faq = lazy(() => import("./Faq.jsx"));
const About = lazy(() => import("./About.jsx"));
const Resources = lazy(() => import("./Resources.jsx"));
const Demo = lazy(() => import("./Demo.jsx"));
const Research = lazy(() => import("./Research.jsx"));
const Beneficiary = lazy(() => import("./beneficiary/index.jsx"));
const Counselor = lazy(() => import("./coach/index.jsx"));

export default function App() {
  const s = useStore();
  const [route, setRoute] = useState(routeFromHash);
  const [modal, setModal] = useState(null); // clé d'une fenêtre de résumé (src/Legal.jsx) ou null

  const routeRef = useRef(route); routeRef.current = route;
  const [enter, setEnter] = useState(0); // repli sans View Transitions : fondu d'entrée par remontage
  const [leaving, setLeaving] = useState(false);
  useEffect(() => {
    dismissLoader();
    /* Changement de page : la page sortante s'efface, la page entrante apparaît (View Transitions si disponible,
       sinon fondu par état). Le retour en haut se fait pendant le fondu. Même section, autre ancre : défilement
       interne (useSectionScroll), pas de fondu. Mouvement réduit : changement direct. */
    const on = () => {
      const next = routeFromHash(), cur = routeRef.current;
      const inPage = next.role === cur.role && ["usecases", "faq"].includes(next.role) && next.page === cur.page && next.section !== cur.section;
      /* Autre écran du même espace (BUG-07) : l'espace reste monté et suit l'ancre, sans fondu de page. */
      if ((next.role === "benef" && cur.role === "benef" && next.code && next.code === cur.code) || (next.role === "coach" && cur.role === "coach")) { setRoute(next); return; }
      if (inPage) { setRoute(next); if (!next.section) window.scrollTo({ top: 0, behavior: reducedMotion() ? "auto" : "smooth" }); return; }
      const apply = () => { flushSync(() => setRoute(next)); window.scrollTo({ top: 0 }); };
      if (reducedMotion()) return apply();
      if (document.startViewTransition) {
        try { const vt = document.startViewTransition(apply); [vt.ready, vt.finished, vt.updateCallbackDone].forEach(pr => pr?.catch(() => {})); return; } catch { /* repli */ }
      }
      setLeaving(true);
      setTimeout(() => { apply(); setLeaving(false); setEnter(k => k + 1); }, 280);
    };
    window.addEventListener("hashchange", on);
    return () => window.removeEventListener("hashchange", on);
  }, []);
  useEffect(() => { if (route.role === "coach" && s.counselor) setLastSpace({ role: "coach" }); }, [route.role, s.counselor]);
  const routeKey = `${route.role}/${route.section || ""}/${route.slug || ""}/${route.cat || ""}/${route.page || ""}/${route.code || ""}`;
  /* Titre d'onglet, description et balises de la route (src/lib/seo.js, effet de mise en page) ; chaque écran peut
     l'affiner ensuite (useTitle, seoArticle) (A11Y-06). */
  useLayoutEffect(() => {
    const r = { ...route, counselor: !!s.counselor };
    /* Pages « Vos données » et légales : l'onglet reprend le titre de la page (RGAA 8.6, vérifié par test:site). */
    const legal = route.role === "legal" && PAGES[route.page] ? { title: `${PAGES[route.page].title} · La Répét'`, description: seoFor(r).description } : undefined;
    applySeo(r, legal);
  }, [routeKey, s.counselor]); // eslint-disable-line
  /* Changement de page (A11Y-02) : focus sur le titre, annonce discrète du titre de la page. */
  useFocusOnChange(routeKey);
  const [announce, setAnnounce] = useState("");
  const firstRoute = useRef(true);
  useEffect(() => {
    if (firstRoute.current) { firstRoute.current = false; return; }
    const t = setTimeout(() => setAnnounce(document.title.replace(/ · La Répét'$/, "")), 400);
    return () => clearTimeout(t);
  }, [routeKey]);

  const onCode = code => {
    if (code) { setLastSpace({ role: "benef", code }); if (!location.hash.startsWith(`#/s/${code}`)) { history.replaceState(null, "", `#/s/${code}`); window.dispatchEvent(new HashChangeEvent("hashchange")); } }
    else if (getState().lastSpace?.role === "benef") { setLastSpace(null); history.replaceState(null, "", "#/beneficiaire"); }
  };

  return (
    <div className="rp-app" style={{ background: T.bg, ...TY.body, color: T.navy, display: "flex", flexDirection: "column" }}>
      <GStyle />
      {/* Lien d'évitement (A11Y-01) : visible au focus ; ne touche pas à l'ancre de routage */}
      <a href="#contenu" className="rp-skip" onClick={e => { e.preventDefault(); focusMainHeading(); document.querySelector("main")?.scrollIntoView(); }}>Aller au contenu</a>
      <div className="rp-sr" aria-live="polite" role="status">{announce}</div>
      <Nav route={route} s={s} />
      {/* Stockage plein ou indisponible (ARC-01) : jamais de perte silencieuse */}
      {getStorageError() && (
        <div className="noprint" style={{ maxWidth: W.page, margin: "16px auto 0", padding: PAD.wrap, width: "100%" }}>
          <Notice tone="error">Cet appareil ne peut plus enregistrer. Libérez de la place ou téléchargez vos réponses, puis réessayez.</Notice>
        </div>
      )}
      {/* Contenu et pied de page changent ensemble (un seul groupe de transition) : le pied ne passe jamais sur l'ancienne page */}
      <div key={enter} className={`rp-view${leaving ? " rp-leave" : ""}${enter ? " rp-enter" : ""}`} style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ flex: 1 }}>
        <Suspense fallback={<div style={{ minHeight: "60vh", display: "grid", placeItems: "center" }}><BrandLoader label="Chargement…" /></div>}>
        {route.role === "home" && <Home go={go} openSpace={openSpace} />}
        {route.role === "notfound" && <NotFound />}
        {route.role === "about" && <About go={go} />}
        {route.role === "solutions" && !route.page && <Solutions go={go} openSpace={openSpace} />}
        {route.role === "solutions" && route.page === "usage-de-l-ia" && <AiUsage go={go} openSpace={openSpace} />}
        {route.role === "solutions" && route.page === "recherche" && <Research go={go} openSpace={openSpace} />}
        {route.role === "solutions" && route.page === "fonctionnalites" && <Fonctionnalites go={go} openSpace={openSpace} />}
        {route.role === "solutions" && route.page === "methode" && <Methode go={go} />}
        {route.role === "usecases" && <UseCases go={go} openSpace={openSpace} page={route.page} section={route.section} />}
        {route.role === "faq" && <Faq go={go} section={route.section} />}
        {route.role === "resources" && <Resources go={go} openSpace={openSpace} slug={route.slug} cat={route.cat} />}
        {route.role === "demo" && <Demo go={go} />}
        {route.role === "legal" && <LegalPage key={route.page} page={route.page} />}
        {(route.role === "espace" || (route.role === "coach" && !s.counselor)) && <Espace />}
        {route.role === "benef" && <Beneficiary key={route.code || "nocode"} initialCode={route.code} sub={route.sub} setModal={setModal} onCode={onCode} />}
        {route.role === "coach" && s.counselor && <Counselor sub={route.sub} />}
        </Suspense>
        </div>
        <Footer compact={route.role === "benef" || (route.role === "coach" && !!s.counselor)} />
      </div>
      <LegalModal modal={modal} close={() => setModal(null)} />
      <A11yLayer />
      <ToTop lift={route.role === "benef" || (route.role === "coach" && !!s.counselor)} />
    </div>
  );
}
