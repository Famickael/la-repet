import React from "react";
import { T, RAD, SH, Btn, Card, I, TY, W, img, Section, PageHero, IconTile, Notice, Tag } from "./ui.jsx";
import { Reveal } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* Page « À propos » (#/a-propos) : la description de l'organisme d'accompagnement à qui appartient La Répét'.
   TEXTE D'EXEMPLE, demandé par le propriétaire : un organisme imaginaire et un peu drôle (il accompagne des
   super-héros), pour qu'on voie tout de suite que le texte est provisoire. L'humour reste dans cette seule page.
   À remplacer entièrement par la présentation de l'organisme réel (nom, histoire, équipe, commanditaires).
   Aucun nom de personne, aucun chiffre, aucun témoignage : les situations sont présentées comme imaginaires. */

const ORG_NAME = "Capes & Carrières";

export default function About({ go }) {
  return (
    <main>
      <PageHero eyebrow="À propos" title={`${ORG_NAME}, l'accompagnement des super-héros`}
        lead="Sauver le monde, ils savent faire. Parler de soi pendant deux minutes devant un recruteur, c'est une autre affaire. Nos coachs aident les super-héros à préparer leurs entretiens."
        aside={<AboutAside />}>
        <Notice tone="info" icon={I.info}>
          <strong>Texte d'exemple.</strong> Cette page présente un organisme imaginaire. Elle sera remplacée par la présentation de l'organisme réel qui porte La Répét'.
        </Notice>
      </PageHero>

      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Section first eyebrow="Qui nous sommes" title="Un organisme d'accompagnement pour celles et ceux qui portent une cape">
          <div className="rs-split" style={{ alignItems: "start" }}>
            <div style={{ display: "grid", gap: 16, ...TY.bodyLg, color: T.body }}>
              <p style={{ margin: 0 }}>{ORG_NAME} accompagne des héros en reconversion, des acolytes qui cherchent leur premier poste et des justiciers qui rêvent d'un emploi plus calme, avec des horaires fixes.</p>
              <p style={{ margin: 0 }}>Tous ont des compétences rares, et du mal à les raconter. « Résistance au feu » ne rentre pas toujours dans la case « Qualités » d'un formulaire. Notre travail : les aider à mettre des mots simples sur ce qu'ils savent faire.</p>
              <p style={{ margin: 0 }}>Entre deux rendez-vous, ils s'entraînent avec La Répét', chez eux, la cape au vestiaire. Personne ne les note. Leur coach les aide quand ils le décident.</p>
            </div>
            <Reveal>
              <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.lg, padding: 32, display: "grid", gap: 16, boxShadow: SH.sm }}>
                <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Notre conviction</h3>
                <p style={{ ...TY.bodyLg, color: T.navy, margin: 0 }}>Chacun a des super-pouvoirs, et ils sont souvent ordinaires : écouter, organiser, rassurer, tenir bon. Un entretien sert à les montrer.</p>
              </div>
            </Reveal>
          </div>
        </Section>

        <Section eyebrow="Ce que nous faisons" title="Traduire des exploits en expériences">
          <div className="rs-g3">
            {DO.map(([ic, t, d], i) => (
              <Reveal key={t} delay={i * 80} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
                  <IconTile icon={ic} />
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section eyebrow="Situations imaginaires" title="Quelques parcours que nous accompagnons" sub="Des exemples inventés pour illustrer notre métier. Ce ne sont pas des témoignages.">
          <div className="rs-g2">
            {CASES.map(([ic, t, d], i) => (
              <Reveal key={t} delay={(i % 2) * 80} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <IconTile icon={ic} />
                  <div style={{ display: "grid", gap: 8 }}>
                    <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                    <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section eyebrow="Nos valeurs" title="Ce qui guide nos coachs">
          <div className="rs-g2">
            {VALUES.map(([n, t, d], i) => (
              <Reveal key={n} delay={(i % 2) * 80} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "flex", gap: 16 }}>
                  <div style={{ ...TY.num, color: T.primary, flexShrink: 0 }}>{n}</div>
                  <div style={{ display: "grid", gap: 8 }}>
                    <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>{t}</h3>
                    <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                  </div>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section eyebrow="Pour qui nous travaillons" title="Des commanditaires publics et privés">
          <div className="rs-g2">
            <Card style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <div><Tag tone="muted">Commanditaire public imaginaire</Tag></div>
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>La Ligue des cités protégées</h3>
              <p style={{ ...TY.body, color: T.body, margin: 0 }}>Elle nous confie des héros en recherche d'emploi, après une longue carrière de patrouilles nocturnes. Elle reçoit un bilan d'ensemble, jamais une réponse ni un retour individuel.</p>
            </Card>
            <Card style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <div><Tag tone="muted">Entreprise imaginaire</Tag></div>
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Les sociétés de sauvetage et de secours</h3>
              <p style={{ ...TY.body, color: T.body, margin: 0 }}>Elles nous confient leurs collaborateurs qui changent de poste : de l'intervention sur le terrain au bureau d'études, par exemple. Les réponses restent entre le collaborateur et son coach.</p>
            </Card>
          </div>
        </Section>

        <FinalBand title="Et pour de vrai ?" text="Découvrez comment nos coachs utilisent La Répét' avec chaque public.">
          <Btn kind="white" size="lg" onClick={() => go("#/cas-d-usage")} iconRight={I.arrow}>Voir les cas d'usage</Btn>
          <Btn kind="ghostDark" size="lg" onClick={() => go("#/demo")}>Nous contacter</Btn>
        </FinalBand>
      </div>
    </main>
  );
}

const AboutAside = () => (
  <div className="rp-hide-m" style={{ borderRadius: RAD.xl, overflow: "hidden", boxShadow: SH.glow, aspectRatio: "3 / 2", background: T.primaryBg }}>
    <img src={img("a-propos.webp")} alt="Deux femmes échangent autour d'une table ronde, dans un bureau lumineux." width={1200} height={800} loading="lazy" decoding="async" style={{ display: "block", width: "100%", height: "100%", objectFit: "cover" }} />
  </div>
);

const DO = [
  [I.target, "Préparer l'entretien d'embauche", "« Coordonner l'évacuation d'un quartier » se raconte très bien en entretien. Nous aidons à le dire avec des mots que le recruteur connaît."],
  [I.compass, "Accompagner la mobilité", "Pour les héros salariés qui changent de poste, ou de planète. Nous préparons l'entretien de mobilité comme l'entretien annuel."],
  [I.redo, "Répéter sans être jugé", "Avec La Répét', chacun s'entraîne à voix haute, autant de fois qu'il le veut. L'assistant décrit la réponse, il ne la note pas."],
];

const CASES = [
  [I.send, "Un héros volant qui vise un poste de contrôleur aérien", "Il connaît le ciel mieux que personne. Il s'entraîne à parler de procédures, de consignes et de travail en équipe."],
  [I.video, "Une héroïne invisible qui prépare un entretien en visio", "Nous travaillons le cadrage, la lumière et le regard vers la caméra. L'objectif : rester bien visible à l'écran."],
  [I.users, "Un colosse au grand cœur qui se tourne vers la petite enfance", "Il prépare des exemples concrets de patience et d'attention. Il en a beaucoup, il apprend à les raconter."],
  [I.user, "Un acolyte qui cherche son premier poste en son nom propre", "Après des années dans l'ombre d'un autre, il s'entraîne à dire « j'ai fait » plutôt que « nous avons fait »."],
];

const VALUES = [
  ["01", "Décrire plutôt que juger", "Personne ne reçoit de note, même pour un sauvetage. Nos coachs et l'assistant décrivent ce qui se voit et ce qui s'entend."],
  ["02", "L'humain garde la main", "La personne choisit ce qu'elle envoie. Le coach nuance ce que dit l'assistant et décide de ce qu'il renvoie."],
  ["03", "La discrétion avant tout", "Les identités secrètes sont bien gardées. Les réponses aussi : la vidéo reste sur l'appareil tant que la personne ne l'envoie pas."],
  ["04", "Chacun à son rythme", "Certains s'entraînent entre deux missions, d'autres le dimanche matin. Les deux conviennent très bien."],
];
