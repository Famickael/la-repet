import React from "react";
import { T, TY, W, Btn, I, Icon, PageHero, Section, Accordion } from "./ui.jsx";
import { useSectionScroll } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";
import { FAQ } from "./content/faq.js";

/* Questions fréquentes (#/ressources/faq, menu Ressources). Ancres de section : #/ressources/faq/<id>
   (personnes-accompagnees, coachs, commanditaires). « Demander de l'aide » (en-tête, session ouverte) y mène,
   sur la section de la personne connectée. Contenu : src/content/faq.js. */

const ICONS = { "personnes-accompagnees": I.user, coachs: I.users, commanditaires: I.building };

export default function Faq({ go, section }) {
  useSectionScroll(section);
  return (
    <main>
      <PageHero eyebrow="Ressources" title="Questions fréquentes"
        lead="Les réponses aux questions que l'on nous pose le plus souvent. Choisissez votre situation.">
        <nav aria-label="Rubriques des questions fréquentes" className="rs-chips" style={{ marginTop: 8 }}>
          {FAQ.map(g => <a key={g.id} href={`#/ressources/faq/${g.id}`} className="rs-chip" style={{ textDecoration: "none" }}><Icon d={ICONS[g.id]} s={16} /> {g.title}</a>)}
        </nav>
      </PageHero>
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        {FAQ.map((g, i) => (
          <Section key={g.id} id={g.id} first={i === 0} eyebrow="Questions fréquentes" title={g.title}>
            <div style={{ maxWidth: W.read }}><Accordion idPrefix={`faq-${g.id}`} items={g.items} /></div>
          </Section>
        ))}
        <FinalBand title="Une question qui n'est pas dans la liste ?" text="Vous suivez un accompagnement : parlez-en à votre coach. Vous portez un projet d'accompagnement : écrivez-nous.">
          <Btn kind="white" size="lg" onClick={() => go("#/demo")} iconRight={I.arrow}>Nous contacter</Btn>
        </FinalBand>
      </div>
    </main>
  );
}
