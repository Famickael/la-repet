import React, { useEffect, useRef, useState } from "react";
import { T, W, Z, TY, MO, HEADER_H, RepetLogo, Btn, Bare, IconBtn, Link, Icon, I, ScrollProgress, lockScroll, PAD, GAP } from "../ui.jsx";
import { openA11y } from "../A11y.jsx";
import { PUBLIC, go, openSpace } from "./router.js";
import { AccountMenu, AccountActions, WithdrawDialog, accountOf, runAccountAction, helpHash } from "./AccountMenu.jsx";

/* ─── En-tête ─── */
/* Boutons de l'en-tête : aucun déplacement au survol (rien ne bouge dans la barre). */
export const STILL = { transform: "none" };

/* Menus (carte complète et redirections : src/app/router.js). « À propos » n'a pas de sous-menu. */
export const LINKS = [["#/a-propos", "À propos", "about"], ["#/solutions", "Solutions", "solutions"], ["#/cas-d-usage", "Cas d'usage", "usecases"], ["#/ressources", "Ressources", "resources"]];

/* Sous-menus (deuxième niveau) : le clic sur l'intitulé mène toujours à la page principale. Troisième élément à
   true : entrée de troisième niveau (retrait), sous l'entrée qui la précède. */
export const SUBS = {
  solutions: [["#/solutions/usage-de-l-ia", "Usage de l'IA"], ["#/solutions/recherche", "Recherche en accompagnement"], ["#/solutions/fonctionnalites", "Fonctionnalités"], ["#/solutions/methode", "Méthode"]],
  usecases: [["#/cas-d-usage/beneficiaires", "Personnes accompagnées"], ["#/cas-d-usage/beneficiaires/demandeurs-emploi", "Demandeurs d'emploi", true], ["#/cas-d-usage/beneficiaires/collaborateurs", "Collaborateurs en mobilité", true], ["#/cas-d-usage/coachs", "Coachs"], ["#/cas-d-usage/commanditaires", "Commanditaires"]],
  resources: [["#/ressources", "Conseils et guides"], ["#/ressources/faq", "Questions fréquentes"]],
};

export const activeOf = role => (role === "faq" ? "resources" : role);

export const DATA_LINKS = [["#/vos-donnees", "Vos données"], ["#/vos-donnees/video", "Que devient ma vidéo ?"], ["#/mentions-legales", "Mentions légales"], ["#/accessibilite", "Accessibilité : non conforme"]];

/* Délais du survol (souris) : intention avant d'ouvrir un premier sous-menu, puis bascule immédiate de l'un à
   l'autre (un seul sous-menu visible, sans fondu croisé ni chevauchement) ; délai de grâce avant de fermer. */
const INTENT_MS = 120, CLOSE_MS = 250;

/* Styles propres à l'en-tête (menu déroulant « Mon compte », bascule des sous-menus), à côté du composant pour ne
   pas toucher la feuille commune (src/ui/GStyle.jsx). Valeurs issues des jetons uniquement. */
const NAV_CSS = `
.rp-account-menu{position:absolute;right:0;top:calc(100% + 8px);width:320px;max-width:calc(100vw - 32px);max-height:calc(100vh - ${HEADER_H + 16}px);max-height:calc(100dvh - ${HEADER_H + 16}px);overflow-y:auto;overscroll-behavior:contain;background:${T.surface};border:1px solid ${T.line};padding:4px 4px 8px;z-index:${Z.nav + 1};animation:rsMenu ${MO.base} ${MO.ease} both}
.rp-account-menu[hidden]{display:none}
.rp-acct-chev svg{transition:transform ${MO.base} ${MO.ease}}
[aria-expanded=true] .rp-acct-chev svg{transform:rotate(180deg)}
.rp-submenu.rp-swap{animation:none}
.rp-subitem.rp-subitem3{padding-left:24px;min-height:40px}
.rs-macct .rp-menuitem{min-height:48px}
`;

export function Nav({ route, s }) {
  /* Session : coach connecté, ou dernier espace bénéficiaire ouvert, tant qu'on ne s'est pas déconnecté.
     Elle ne dépend pas de la route : sur toutes les pages, l'en-tête garde « Mon compte ». */
  const ls = s.lastSpace;
  const session = ls?.role === "coach" && s.counselor ? { role: "coach" } : ls?.role === "benef" && s.parcours[ls.code] ? { role: "benef", code: ls.code } : null;
  const here = (route.role === "benef" && route.code && s.parcours[route.code]) ? { role: "benef", code: route.code } : (route.role === "coach" && s.counselor) ? { role: "coach" } : null;
  const spaceRoute = here || session;
  const inSpace = !!spaceRoute;
  const isPublic = PUBLIC.includes(route.role);
  /* Menu mobile : sur les pages publiques, et partout tant qu'aucune session n'est ouverte. Dans un espace, la
     navigation passe par « Mon compte ». */
  const withBurger = isPublic || !inSpace;
  const [menu, setMenu] = useState(false);
  const [confirm, setConfirm] = useState(false);
  const burger = useRef(null), panel = useRef(null);

  /* Un seul sous-menu ouvert à la fois, piloté ici. swap : on passe d'un sous-menu à l'autre (pas d'animation
     d'entrée, l'ancien disparaît dans la même image). */
  const [sub, setSub] = useState(null);
  const [swap, setSwap] = useState(false);
  const subRef = useRef(null), timer = useRef(0);
  const apply = id => { setSwap(!!subRef.current && !!id && subRef.current !== id); subRef.current = id; setSub(id); };
  const subs = {
    hoverIn: id => { clearTimeout(timer.current); if (subRef.current) apply(id); else timer.current = setTimeout(() => apply(id), INTENT_MS); },
    hoverOut: () => { clearTimeout(timer.current); timer.current = setTimeout(() => apply(null), CLOSE_MS); },
    set: id => { clearTimeout(timer.current); apply(id); },
  };
  useEffect(() => () => clearTimeout(timer.current), []);
  useEffect(() => {
    if (!sub) return;
    const out = e => { if (!e.target.closest?.(".rs-links")) subs.set(null); };
    document.addEventListener("pointerdown", out);
    return () => document.removeEventListener("pointerdown", out);
  }, [sub]); // eslint-disable-line

  useEffect(() => { setMenu(false); subs.set(null); }, [route]); // eslint-disable-line
  useEffect(() => {
    if (!menu) return;
    const unlock = lockScroll();
    /* Fond inerte (A11Y-16) : la page et le pied de page ne reçoivent ni clic ni focus tant que le menu est ouvert */
    const view = document.querySelector(".rp-view");
    if (view) view.inert = true;
    document.documentElement.classList.add("rp-menu-open");
    panel.current?.querySelector("a,button")?.focus();
    const key = e => {
      if (e.key === "Escape") { setMenu(false); burger.current?.focus(); }
      if (e.key === "Tab" && panel.current) { // focus retenu dans le panneau et le bouton menu
        const f = [burger.current, ...panel.current.querySelectorAll("a,button")];
        const i = f.indexOf(document.activeElement);
        if (e.shiftKey && i <= 0) { e.preventDefault(); f[f.length - 1].focus(); }
        else if (!e.shiftKey && i === f.length - 1) { e.preventDefault(); f[0].focus(); }
      }
    };
    const close = () => { if (burger.current && getComputedStyle(burger.current).display === "none") setMenu(false); };
    document.addEventListener("keydown", key);
    window.addEventListener("resize", close);
    return () => { unlock(); if (view) view.inert = false; document.documentElement.classList.remove("rp-menu-open"); document.removeEventListener("keydown", key); window.removeEventListener("resize", close); };
  }, [menu]);

  /* « Nous contacter » devient « Demander de l'aide » quand une session est ouverte : il mène aux questions
     fréquentes, sur la section de la personne connectée (helpHash, src/app/AccountMenu.jsx). */
  const contact = inSpace ? ["Demander de l'aide", () => go(helpHash(spaceRoute.role))] : ["Nous contacter", () => go("#/demo")];
  const acc = inSpace ? accountOf(spaceRoute, s) : null;

  return (<>
    <style>{NAV_CSS}</style>
    <header className="noprint rp-header" style={{ position: "sticky", top: 0, zIndex: Z.nav, background: menu ? T.bg : T.glass, backdropFilter: "blur(14px)", WebkitBackdropFilter: "blur(14px)", borderBottom: `1px solid ${T.line}` }}>
      <div className="rp-nav" style={{ maxWidth: W.page, margin: "0 auto", padding: PAD.wrap, height: HEADER_H, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 20, minWidth: 0 }}>
          <a href="#/" onClick={e => { e.preventDefault(); go("#/"); }} aria-label="La Répét', accueil" className="rp-head-logo" style={{ display: "flex", alignItems: "center", minHeight: 44, flexShrink: 0 }}>
            <RepetLogo s={17} tagline={false} />
          </a>
          <nav aria-label="Navigation principale" className="rs-links" style={{ display: "flex", alignItems: "center", gap: 20, marginLeft: 12 }}>
            {LINKS.map(([h, l, r]) => <NavItem key={h} href={h} label={l} id={r} on={activeOf(route.role) === r} open={sub === r} swap={swap} subs={subs} />)}
          </nav>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexShrink: 0 }}>
          {/* Style de lien d'en-tête (navlink) : sans fond ni bordure, zone de 44 px, focus visible (règle globale de GStyle) */}
          <span className="rs-demo"><Bare className="navlink" onClick={contact[1]} style={{ ...TY.bodyStrong, color: undefined, minHeight: 44, padding: "0 8px", display: "inline-flex", alignItems: "center" }}>{contact[0]}</Bare></span>
          {inSpace
            ? <AccountMenu route={spaceRoute} s={s} className={withBurger ? "rs-demo" : undefined} />
            : <Btn kind="primary" size="sm" style={STILL} onClick={openSpace}><span className="rp-hide-m" style={{ display: "inline-flex" }}><Icon d={I.user} s={16} /></span>Mon compte</Btn>}
          {withBurger && <IconBtn ref={burger} variant="outline" className="rs-burger" aria-expanded={menu} aria-controls="rs-menu" label={menu ? "Fermer le menu" : "Ouvrir le menu"} icon={menu ? I.close : I.menu} onClick={() => setMenu(m => !m)} />}
        </div>
      </div>
      {isPublic && <ScrollProgress />}
    </header>
      {menu && (
        <div id="rs-menu" ref={panel} className="rs-menu" role="dialog" aria-modal="true" aria-label="Menu">
          <nav aria-label="Menu principal" onClick={e => { if (e.target.closest("a")) setMenu(false); }}>
            <a href="#/" className="rs-mlink" aria-current={route.role === "home" ? "page" : undefined}>Accueil<Icon d={I.chevronR} s={20} c={T.faint} /></a>
            {LINKS.map(([h, l, r]) => <MobileItem key={h} href={h} label={l} id={r} on={activeOf(route.role) === r} />)}
          </nav>
          {acc && (
            <div className="rs-macct" style={{ marginTop: GAP.grid, display: "grid", gap: 4 }}>
              <div style={{ ...TY.overline, color: T.muted }}>Mon compte</div>
              <AccountActions acc={acc} label="Mon compte" onAction={k => { setMenu(false); runAccountAction(k, { ...acc, onWithdraw: () => setConfirm(true) }); }} />
            </div>
          )}
          <div style={{ display: "grid", gap: 12, marginTop: GAP.grid }}>
            <Btn kind="secondary" full onClick={() => { setMenu(false); contact[1](); }}>{contact[0]}</Btn>
            <Btn kind="ghost" full icon={I.a11y} onClick={() => { setMenu(false); openA11y(); }}>Options d'accessibilité</Btn>
          </div>
          <nav aria-label="Vos données" onClick={() => setMenu(false)} style={{ marginTop: GAP.grid, display: "grid", gap: 4 }}>
            <div style={{ ...TY.overline, color: T.muted }}>Vos données</div>
            {DATA_LINKS.map(([h, l]) => <Link key={h} href={h} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>{l}</Link>)}
          </nav>
        </div>
      )}
      {confirm && acc && <WithdrawDialog code={acc.code} close={() => setConfirm(false)} />}
  </>);
}

/* Entrée de navigation à deux niveaux : lien vers la page principale + bouton qui ouvre le sous-menu.
   Survol avec délai d'intention, clic, clavier (Entrée, Espace, flèches, Début, Fin, Échap). L'état ouvert est
   tenu par Nav : ouvrir une entrée ferme les autres. */
export function NavItem({ href, label, id, on, open, swap, subs }) {
  const btn = useRef(null), list = useRef(null);
  const items = SUBS[id] || [];
  const hoverAt = useRef(0);
  if (!items.length) return <a href={href} className={`navlink ${on ? "on" : ""}`} aria-current={on ? "page" : undefined} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>{label}</a>;
  const links = () => [...(list.current?.querySelectorAll("a") || [])];
  const onKey = e => {
    const ls = links(), i = ls.indexOf(document.activeElement);
    if (e.key === "Escape" && open) { e.preventDefault(); subs.set(null); btn.current?.focus(); }
    else if (e.key === "ArrowDown") { e.preventDefault(); if (!open) { subs.set(id); requestAnimationFrame(() => links()[0]?.focus()); } else ls[(i + 1) % ls.length]?.focus(); }
    else if (e.key === "ArrowUp" && open) { e.preventDefault(); ls[(i - 1 + ls.length) % ls.length]?.focus(); }
    else if (e.key === "Home" && open && i >= 0) { e.preventDefault(); ls[0]?.focus(); }
    else if (e.key === "End" && open && i >= 0) { e.preventDefault(); ls[ls.length - 1]?.focus(); }
  };
  return (
    <div className="rp-navitem" onPointerEnter={e => { if (e.pointerType === "mouse") { hoverAt.current = Date.now(); subs.hoverIn(id); } }} onPointerLeave={e => e.pointerType === "mouse" && subs.hoverOut()} onKeyDown={onKey}
      onBlur={e => { if (open && e.relatedTarget && !e.currentTarget.closest(".rs-links")?.contains(e.relatedTarget)) subs.set(null); }}>
      <a href={href} className={`navlink ${on ? "on" : ""}`} aria-current={on ? "page" : undefined}>{label}</a>
      <Bare ref={btn} className="rp-subbtn" aria-expanded={open} aria-controls={`sub-${id}`} aria-label={`Sous-menu ${label}`}
        onClick={() => { const next = open && Date.now() - hoverAt.current < 600 ? true : !open; subs.set(next ? id : null); if (next) requestAnimationFrame(() => links()[0]?.focus()); }}>
        <Icon d={I.chevron} s={16} />
      </Bare>
      <div ref={list} id={`sub-${id}`} className={`rp-submenu${swap ? " rp-swap" : ""}`} hidden={!open}>
        <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 2 }}>
          {items.map(([h, l, lvl3]) => <li key={h}><a href={h} className={`rp-subitem${lvl3 ? " rp-subitem3" : ""}`}>{l}</a></li>)}
        </ul>
      </div>
    </div>
  );
}

/* Menu mobile : chaque entrée à sous-menu est un accordéon (page principale + sous-pages). */
export function MobileItem({ href, label, id, on }) {
  const [open, setOpen] = useState(false);
  const items = SUBS[id] || [];
  if (!items.length) return <a href={href} className="rs-mlink" aria-current={on ? "page" : undefined}>{label}<Icon d={I.chevronR} s={20} c={T.faint} /></a>;
  return (
    <div style={{ borderBottom: `1px solid ${T.line}` }}>
      <div style={{ display: "flex", alignItems: "center" }}>
        <a href={href} className="rs-mlink" style={{ flex: 1, borderBottom: "none" }} aria-current={on ? "page" : undefined}>{label}</a>
        <IconBtn icon={I.chevron} label={`Sous-menu ${label}`} aria-expanded={open} aria-controls={`msub-${id}`} onClick={e => { e.stopPropagation(); setOpen(o => !o); }} className={open ? "rp-rot" : undefined} />
      </div>
      <ul id={`msub-${id}`} hidden={!open} style={{ listStyle: "none", margin: 0, padding: "0 0 12px 12px", display: open ? "grid" : "none", gap: 4 }}>
        {items.map(([h, l, lvl3]) => <li key={h}><a href={h} className={`rp-subitem${lvl3 ? " rp-subitem3" : ""}`}>{l}</a></li>)}
      </ul>
    </div>
  );
}
