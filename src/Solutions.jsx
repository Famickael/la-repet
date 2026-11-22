import React from "react";
import { T, Btn, I, TY, W, Section, PageHero, IconTile } from "./ui.jsx";
import { FinalBand } from "./home/FinalBand.jsx";
import { LinkCards, LinkChips } from "./LinkCards.jsx";
import { Reveal, stagger } from "./motion.jsx";

/* Page d'entrée « Solutions » (#/solutions) : ce qui nourrit la solution. Une sous-page par sujet :
   usage de l'IA, recherche en accompagnement, fonctionnalités, méthode. Les pages par public sont dans « Cas d'usage ». */

export const SOLUTIONS = [
  { href: "#/solutions/usage-de-l-ia", icon: I.sparkle, tone: "ai", tag: "Assistant IA", title: "Usage de l'IA", short: "Usage de l'IA",
    text: "Ce que fait l'assistant, ce qu'il ne fait pas. La mise par écrit et l'analyse de l'entretien sur l'appareil. Les garde-fous et l'AI Act." },
  { href: "#/solutions/recherche", icon: I.book, title: "Recherche en accompagnement", short: "Recherche",
    text: "Ce que disent les études sur l'entraînement aux entretiens, ce qu'elles ne disent pas, et les choix de conception qui en découlent." },
  { href: "#/solutions/fonctionnalites", icon: I.layers, title: "Fonctionnalités", short: "Fonctionnalités",
    text: "L'outil pas à pas : échauffement, questions adaptées, caméra ou voix seule, analyse sans note, envoi au coach, relecture et rapport." },
  { href: "#/solutions/methode", icon: I.compass, tone: "coach", title: "Méthode", short: "Méthode",
    text: "Comment l'outil sert l'accompagnement : entraînement en solo, auto-observation, analyse sans note, débriefing avec le coach et transfert vers l'entretien réel." },
];

export default function Solutions({ go }) {
  return (
    <main>
      <PageHero eyebrow="Solutions" title="Ce qui nourrit La Répét'"
        lead="Un assistant IA qui analyse sans noter. Des choix appuyés sur la recherche en accompagnement. Des fonctions pensées avec nos coachs, au service d'une méthode d'accompagnement. Une page pour chaque sujet.">
        <LinkChips items={SOLUTIONS} label="Pages de Solutions" />
      </PageHero>

      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Section first eyebrow="Quatre sujets" title="Comprendre la solution, sujet par sujet">
          <LinkCards cols={2} items={SOLUTIONS} />
        </Section>

        <Section eyebrow="Notre modèle" title="Un organisme d'accompagnement, outillé par La Répét'">
          <div className="rs-split" style={{ alignItems: "start" }}>
            <Reveal style={{ display: "grid", gap: 16, ...TY.bodyLg, color: T.body }}>
              <p style={{ margin: 0 }}>Notre métier, c'est l'accompagnement. La Répét' nous appartient : c'est l'outil que nos coachs utilisent avec les personnes qu'ils accompagnent. Nous ne la vendons pas comme un logiciel.</p>
              <p style={{ margin: 0 }}>Des commanditaires nous confient l'accompagnement de leurs publics. Les acteurs publics de l'emploi et de l'insertion peuvent nous confier des demandeurs d'emploi. Les entreprises peuvent nous confier des collaborateurs qui préparent une mobilité, un entretien professionnel ou une reconversion.</p>
              <p style={{ margin: 0 }}>Nos coachs mènent les rendez-vous et les ateliers. Entre deux rendez-vous, chaque personne s'entraîne seule avec La Répét', à son rythme.</p>
            </Reveal>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
              {MODEL.map(([ic, t, d, h], i) => (
                <Reveal as="li" key={t} delay={stagger(i, 4)} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                  <IconTile icon={ic} />
                  <span style={{ ...TY.body, color: T.body }}><a href={h} className="rp-link" style={{ ...TY.link, color: T.primary }}>{t}</a> {d}</span>
                </Reveal>
              ))}
            </ul>
          </div>
        </Section>

        <FinalBand title="Voir l'accompagnement par public" text="Personnes accompagnées, coachs, commanditaires : ce que La Répét' change pour chacun.">
          <Btn kind="white" size="lg" onClick={() => go("#/cas-d-usage")} iconRight={I.arrow}>Voir les cas d'usage</Btn>
        </FinalBand>
      </div>
    </main>
  );
}

const MODEL = [
  [I.building, "Les commanditaires,", "acteurs publics de l'emploi ou entreprises, qui nous confient un accompagnement et reçoivent un bilan d'ensemble, jamais une mesure individuelle.", "#/cas-d-usage/commanditaires"],
  [I.users, "Nos coachs,", "qui accompagnent chaque personne, relisent ce qu'elle leur envoie et préparent le débriefing.", "#/cas-d-usage/coachs"],
  [I.user, "Les demandeurs d'emploi,", "qui préparent leurs entretiens d'embauche, dans un accompagnement vers l'emploi ou un parcours d'insertion.", "#/cas-d-usage/beneficiaires/demandeurs-emploi"],
  [I.compass, "Les collaborateurs d'entreprise,", "qui préparent un entretien de mobilité, un entretien annuel ou professionnel, ou une reconversion.", "#/cas-d-usage/beneficiaires/collaborateurs"],
];
