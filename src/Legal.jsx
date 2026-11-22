import React from "react";
import { T, TY, GAP, W, RAD, PAD, Card, Btn, Link, Icon, IconTile, I, Notice, PageHero, Modal, Txt } from "./ui.jsx";
import { PAGES, SUMMARY, FULL, LEADS, HUB_CARDS, PHRASES, LEGAL_DATE } from "./content/legal.js";
import { getState, findParcours } from "./lib/store.js";
import { Reveal, stagger } from "./motion.jsx";

/* Pages « Vos données », conditions, mentions légales et accessibilité (niveau 3),
   et fenêtre de résumé (niveau 2). Tous les textes viennent de src/content/legal.js. */

/* Texte avec **gras**. */
export function Rich({ text }) {
  const parts = String(text).split(/(\*\*[^*]+\*\*)/g);
  return parts.map((s, i) => /^\*\*.*\*\*$/.test(s)
    ? <strong key={i} style={{ ...TY.strong, color: T.navy }}>{s.slice(2, -2)}</strong>
    : <React.Fragment key={i}>{s}</React.Fragment>);
}

/* Résumé en puces (niveau 2). */
export function Summary({ items, style }) {
  return (
    <ul style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12, ...style }}>
      {items.map(([ic, t]) => (
        <li key={t} style={{ display: "flex", gap: 12, alignItems: "flex-start", ...TY.bodyLg, color: T.body }}>
          <span style={{ color: T.primary, display: "inline-flex", marginTop: 4 }}><Icon d={I[ic] || I.info} s={20} /></span>
          <span><Rich text={t} /></span>
        </li>
      ))}
    </ul>
  );
}

function Blocks({ blocks }) {
  return blocks.map((b, i) => (
    <Reveal as="section" key={i} style={{ display: "grid", gap: 12 }}>
      {b.h && <h2 style={{ ...TY.h2, color: T.navy, margin: 0 }}>{b.h}</h2>}
      {(b.p || []).map((p, k) => <p key={k} style={{ ...TY.bodyLg, color: T.body, margin: 0, maxWidth: "70ch" }}><Rich text={p} /></p>)}
      {b.list && <ul style={{ ...TY.bodyLg, color: T.body, margin: 0, paddingLeft: PAD.list, display: "grid", gap: 8 }}>{b.list.map(l => <li key={l}><Rich text={l} /></li>)}</ul>}
      {b.table && (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", ...TY.body, color: T.body }}>
            <thead><tr>{b.table.head.map(h => <th key={h} scope="col" style={{ textAlign: "left", ...TY.label, color: T.navy, padding: "8px 12px 8px 0", borderBottom: `1px solid ${T.line}` }}>{h}</th>)}</tr></thead>
            <tbody>{b.table.rows.map(r => <tr key={r[0]}>{r.map((c, k) => k === 0
              ? <th key={k} scope="row" style={{ textAlign: "left", ...TY.bodyStrong, color: T.navy, padding: "8px 12px 8px 0", borderBottom: `1px solid ${T.lineLt}`, verticalAlign: "top" }}>{c}</th>
              : <td key={k} style={{ padding: "8px 12px 8px 0", borderBottom: `1px solid ${T.lineLt}`, verticalAlign: "top" }}>{c}</td>)}</tr>)}</tbody>
          </table>
        </div>
      )}
    </Reveal>
  ));
}

/* Lien de retour vers l'espace, si une personne arrive depuis son espace. */
function BackToSpace() {
  const ls = getState().lastSpace;
  if (ls?.role === "benef" && findParcours(ls.code)) return <Link href={`#/s/${ls.code}`} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>Retour à mon espace</Link>;
  if (ls?.role === "coach") return <Link href="#/coach" style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>Retour à l'espace coach</Link>;
  return null;
}

const RELATED = ["hub", "video", "assistant", "droits", "appareil", "notice", "coachs", "conditions", "mentions", "accessibilite"];

export default function LegalPage({ page = "hub" }) {
  const meta = PAGES[page] || PAGES.hub;
  const inData = meta.route.startsWith("#/vos-donnees");
  return (
    <main id="contenu">
      <PageHero eyebrow={inData ? "Vos données" : "Informations légales"} title={meta.title} lead={LEADS[page]}>
        <div className="noprint" style={{ display: "flex", gap: 16, flexWrap: "wrap", alignItems: "center" }}><BackToSpace /></div>
      </PageHero>
      <div className="rs-pad" style={{ maxWidth: W.read, margin: "0 auto", padding: `${GAP.head}px ${PAD.x}px 0`, display: "grid", gap: GAP.block }}>
        {page === "hub" ? <Hub /> : (<>
          {SUMMARY[page] && (
            <Reveal><Card pad="lg" level={2} style={{ display: "grid", gap: 16 }}>
              <h2 style={{ ...TY.overline, color: T.primary, margin: 0 }}>L'essentiel</h2>
              <Summary items={SUMMARY[page]} />
            </Card></Reveal>
          )}
          <div style={{ display: "grid", gap: GAP.block }}><Blocks blocks={FULL[page] || []} /></div>
        </>)}
        <Txt v="caption" color={T.muted}>Textes en vigueur le {LEGAL_DATE}.</Txt>
        <div className="noprint" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn kind="ghost" size="sm" icon={I.print} onClick={() => window.print()}>Imprimer cette page</Btn>
        </div>
        <nav aria-label="Autres pages d'information" className="noprint" style={{ borderTop: `1px solid ${T.line}`, paddingTop: GAP.grid, display: "flex", flexWrap: "wrap", gap: `8px ${GAP.grid}px` }}>
          {RELATED.filter(k => k !== page).map(k => <Link key={k} href={PAGES[k].route} style={{ minHeight: 44, display: "inline-flex", alignItems: "center" }}>{PAGES[k].label}</Link>)}
        </nav>
      </div>
    </main>
  );
}

function Hub() {
  return (<>
    <div className="rs-g2">
      {HUB_CARDS.map(([ic, t, d, to], i) => (
        <Reveal key={t} delay={stagger(i, 2)} style={{ display: "grid" }}><a href={PAGES[to].route} className="rs-card-btn rp-pad-md" style={{ padding: PAD.md, display: "grid", gap: 12, textDecoration: "none", borderRadius: RAD.lg }}>
          <IconTile icon={I[ic]} />
          <span style={{ ...TY.h3, color: T.navy }}>{t}</span>
          <span style={{ ...TY.body, color: T.body }}>{d}</span>
          <span style={{ ...TY.link, ...TY.small, color: T.primary }}>{PAGES[to].label}</span>
        </a></Reveal>
      ))}
    </div>
    <Reveal><Notice tone="info" icon={I.trash}>
      Pour supprimer une réponse, ouvrez-la dans votre espace. Pour tout supprimer, ouvrez « Mon compte » dans votre espace, puis « Retirer mon accord ».
    </Notice></Reveal>
    <Reveal delay={70}><Notice tone="info" icon={I.shield}>{PHRASES.noTracking}</Notice></Reveal>
  </>);
}

/* Fenêtre de résumé (niveau 2), ouverte depuis un parcours : « Tout lire » ouvre la page dans un nouvel onglet,
   pour ne pas perdre l'entraînement en cours. */
const MODALS = { lifecycle: "video", video: "video", emotion: "assistant", assistant: "assistant", envoi: "video", rgpd: "notice", cgu: "conditions" };
export function LegalModal({ modal, close }) {
  if (!modal) return null;
  const page = MODALS[modal] || modal;
  const meta = PAGES[page];
  if (!meta) return null;
  const items = SUMMARY[page] || SUMMARY.video;
  return (
    <Modal close={close} title={meta.title} icon={I.shield} head="soft" width="form"
      footer={
        <div className="rp-actions" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
          <Link href={meta.route} target="_blank" rel="noopener">Tout lire (nouvel onglet)</Link>
          <Btn kind="primary" size="sm" onClick={close}>Fermer</Btn>
        </div>
      }>
      <Summary items={items} />
    </Modal>
  );
}
