import CodeForm from "../CodeForm.jsx";
import React, { useState } from "react";
import { T, GAP, W, TY, PageHero, Tag, Btn, Link, Card, Field, Input, Txt, Notice, Icon, I } from "../ui.jsx";
import { PHRASES } from "../content/legal.js";
import { setLastSpace, setCounselor, TRIAL_LOGIN } from "../lib/store.js";
import { go, openSpace } from "./router.js";
import { Reveal } from "../motion.jsx";

/* ─── « Mon espace » : code d'accès ou connexion coach (plus d'écran de connexion séparé) ───
   Première vue sans défilement (demande du propriétaire) : pas d'en-tête de page visible (titre « Mon espace » gardé
   pour les lecteurs d'écran), les deux cartes tiennent dans l'écran à 1280 × 800 et à 390 × 844. Sur mobile, la carte
   coach (préremplie) est repliée sous un lien qui la déplie, pour laisser toute la place à la saisie du code. */
export function Espace() {
  const [email, setEmail] = useState(TRIAL_LOGIN.email);
  const [pwd, setPwd] = useState(TRIAL_LOGIN.password);
  const [forgot, setForgot] = useState(false);
  const [coachOpen, setCoachOpen] = useState(false);
  const ok = /.+@.+\..+/.test(email) && pwd.length >= 4;
  const login = e => {
    e.preventDefault();
    if (!ok) return;
    setCounselor(TRIAL_LOGIN.name); setLastSpace({ role: "coach" }); if (location.hash !== "#/coach") go("#/coach");
  };
  const card = { display: "flex", flexDirection: "column", gap: GAP.grid, height: "100%" };
  return (
    <main>
      <h1 className="rp-sr">Mon espace</h1>
      <div className="rs-pad rp-espace" style={{ maxWidth: W.wide, margin: "0 auto", padding: "32px 24px 0" }}>
        <div className="rp-stack rp-equal" style={{ alignItems: "stretch" }}>
          <Reveal style={{ display: "grid" }}><Card pad="lg" level={2} topbar style={card}>
            <div style={{ display: "grid", gap: 12 }}>
              <div><Tag tone="primary">Je m'entraîne</Tag></div>
              <Txt v="h2" as="h2" color={T.navy}>J'ai un code d'accès</Txt>
            </div>
            <CodeForm id="espace-code" grow hint="Écrivez le code d'accès donné par votre coach ou votre conseiller." onOk={c => go(`#/s/${c}`)}
              footer={<Txt v="caption" color={T.muted}>Votre code suffit : pas de compte, pas de mot de passe. Gardez-le pour vous.</Txt>} />
          </Card></Reveal>
          <div className="rp-coach-toggle">
            <Link onClick={() => setCoachOpen(o => !o)} aria-expanded={coachOpen} aria-controls="espace-coach"
              style={{ ...TY.small, ...TY.link, minHeight: 44, display: "inline-flex", alignItems: "center", gap: 8 }}>
              Vous êtes coach ? Afficher la connexion
              <span aria-hidden style={{ display: "inline-flex", transform: coachOpen ? "rotate(180deg)" : "none" }}><Icon d={I.chevron} s={16} /></span>
            </Link>
          </div>
          <div id="espace-coach" className={`rp-coach-card${coachOpen ? " is-open" : ""}`}>
            <Reveal delay={70} style={{ display: "grid", height: "100%" }}><Card pad="lg" level={2} topbar="coach" style={card}>
              <div style={{ display: "grid", gap: 12 }}>
                <div><Tag tone="primary">Coach</Tag></div>
                <Txt v="h2" as="h2" color={T.navy}>J'ai un compte</Txt>
              </div>
              <form onSubmit={login} style={{ display: "flex", flexDirection: "column", gap: GAP.field, flex: 1 }}>
                <Field id="login-email" label="Adresse électronique professionnelle">
                  <Input id="login-email" type="email" inputMode="email" autoCapitalize="none" autoCorrect="off" autoComplete="username" value={email} onChange={e => setEmail(e.target.value)} />
                </Field>
                <div style={{ display: "grid", gap: 4 }}>
                  <Field id="login-pwd" label="Mot de passe">
                    <Input id="login-pwd" type="password" autoComplete="current-password" value={pwd} onChange={e => setPwd(e.target.value)} />
                  </Field>
                  <div style={{ textAlign: "right" }}>
                    <Link onClick={() => setForgot(true)} style={{ ...TY.small, ...TY.link, minHeight: 44 }}>Mot de passe oublié ?</Link>
                  </div>
                  {forgot && <Notice tone="info" role="status">Contactez votre référent pour réinitialiser votre mot de passe.</Notice>}
                </div>
                <div style={{ marginTop: "auto", display: "grid", gap: 12 }}>
                  <Btn kind="objective" full disabled={!ok}>Se connecter</Btn>
                  <Txt v="caption" color={T.muted}>{PHRASES.coachLogin} <Link href="#/vos-donnees/coachs">Coachs : vos données</Link></Txt>
                </div>
              </form>
            </Card></Reveal>
          </div>
        </div>
      </div>
    </main>
  );
}

/* ─── Ancre inconnue (BUG-16) ─── */
export function NotFound() {
  return (
    <main>
      <PageHero eyebrow="Page introuvable" title="Cette page n'existe pas" lead="L'adresse est peut-être incomplète, ou la page a changé de place." />
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "32px 24px 0", display: "flex", gap: GAP.actions, flexWrap: "wrap" }}>
        <Btn kind="primary" onClick={() => go("#/")}>Revenir à l'accueil</Btn>
        <Btn kind="secondary" onClick={openSpace}>Mon espace</Btn>
      </div>
    </main>
  );
}
