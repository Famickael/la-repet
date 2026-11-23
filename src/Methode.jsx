import React from "react";
import { T, RAD, Btn, Card, I, TY, W, GAP, Section, PageHero, IconTile, Notice, Tag, Link, PAD } from "./ui.jsx";
import { Reveal, stagger } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* « Méthode » (#/solutions/methode, menu Solutions) : comment l'outil sert l'accompagnement. L'entraînement,
   l'auto-observation, le retour descriptif, le débriefing avec le coach et le transfert vers l'entretien réel ;
   pourquoi le retour décrit au lieu de noter ; le rôle du coach ; la place de l'outil dans la méthode en sept étapes
   de l'organisme (src/About.jsx, #methode). Ton sérieux, sans humour (l'humour reste sur À propos).
   Règles : aucun mot d'émotion, aucune note, aucun chiffre de résultat. Les auteurs cités ne le sont que pour ce que
   leurs travaux disent, sans citation entre guillemets ; l'outil n'a pas été évalué par eux. */

const LOOP = [
  { ic: I.mic, who: "La personne", t: "S'entraîner",
    what: "La personne répond seule, à voix haute et sans avatar, aux questions choisies avec son coach. Elle recommence autant de fois qu'elle veut, entre deux rendez-vous.",
    why: "Dire sa réponse n'est pas la même activité que la penser. S'entraîner rend les exemples disponibles le jour de l'entretien. Les travaux sur la pratique délibérée le précisent : on progresse quand chaque essai vise un point précis, puis reçoit un retour." },
  { ic: I.video, who: "La personne", t: "Se revoir",
    what: "La personne revoit sa vidéo ou relit son entretien mis par écrit, avant de décider si elle le garde.",
    why: "Se revoir fait passer de la position d'acteur à celle d'observateur de sa propre activité. La démarche s'inspire de l'autoconfrontation en clinique de l'activité : commenter ses propres traces aide à voir ce qu'on fait réellement." },
  { ic: I.sparkle, who: "L'assistant", t: "Lire le retour de l'assistant",
    what: "L'assistant analyse l'entretien, sans le noter. Il place des repères factuels au bon moment de la réponse : rythme de parole, pauses, exemples, petits mots répétés. Les points d'appui viennent en premier.",
    why: "Un repère porte sur la tâche et sur la démarche, jamais sur la personne. Il donne une prise sur l'essai suivant : la personne recommence, puis compare ses deux entretiens, côte à côte, pour voir ce qui a changé. L'interprétation reste à elle et à son coach." },
  { ic: I.users, who: "Le coach et la personne", t: "Débriefer avec le coach",
    what: "La personne envoie les entretiens qu'elle choisit. Le coach les relit, confirme ou nuance chaque repère, ajoute ses remarques, puis en parle avec elle en rendez-vous ou en atelier. Ensemble, ils comparent les différents entraînements pour mesurer la progression : des indicateurs factuels (durée, rythme de parole, pauses, exemples) et ce qui a changé, jamais une note.",
    why: "C'est la réflexion sur l'action décrite par Schön. Le coach relie la réponse au projet, au poste et au contexte, ce que l'outil ne connaît pas. La personne formule elle-même ses pistes." },
  { ic: I.target, who: "La personne, avec son coach", t: "Transférer vers l'entretien réel",
    what: "La personne adapte ses exemples au poste visé, s'entraîne sur les questions propres à cet entretien et peut refaire un entraînement complet, dans l'ordre d'un vrai entretien.",
    why: "Ce qui est appris en simulation ne se transfère pas tout seul. Il faut le relier explicitement à la situation réelle : l'entreprise, le recruteur, le format. Après l'entretien, le coach aide à en tirer parti." },
];

const LEVELS = [
  ["La tâche", "Ce qui a été dit : un exemple précis, une conclusion, une question laissée sans réponse."],
  ["La démarche", "Comment la réponse est construite : l'ordre des idées, le passage du contexte au résultat."],
  ["L'autorégulation", "Ce que la personne remarque elle-même et décide de travailler à l'essai suivant."],
  ["La personne", "Un jugement global sur elle. C'est le niveau le moins utile pour apprendre : l'outil ne s'y place jamais."],
];

const COACH = [
  [I.compass, "Il fixe le cadre et les objectifs", "Il choisit avec la personne les questions, le type d'entretien et le moment où l'outil a sa place dans l'accompagnement. L'outil est proposé, jamais imposé."],
  [I.chat, "Il interprète en contexte", "L'assistant ne connaît ni le parcours, ni le poste visé, ni le marché local. Le coach confirme, nuance ou contredit chaque repère. Sa lecture prime."],
  [I.redo, "Il conduit le débriefing", "Il questionne plutôt qu'il ne corrige. Il aide la personne à analyser sa propre réponse et à décider de la suite."],
  [I.building, "Il travaille ce que l'outil ne voit pas", "Les freins périphériques, l'orientation, les démarches auprès des employeurs, le suivi après l'entretien et la prise de poste."],
  [I.lock, "Il porte l'éthique de l'accompagnement", "Confidentialité, accord de la personne, respect de ce qu'elle choisit d'envoyer ou de garder pour elle."],
  [I.users, "Il crée le lien", "L'alliance de travail se construit entre deux personnes. Aucun outil ne la remplace."],
];

/* Place de l'outil dans les sept étapes de l'organisme (src/About.jsx, STEPS). */
const MAP = [
  ["Accueil et diagnostic partagé", "Sans l'outil", "coach", "Un temps d'échange entre la personne et son coach."],
  ["Explicitation de l'expérience", "Sans l'outil", "coach", "Des entretiens menés par le coach, sur des situations vécues."],
  ["Mise en mots des compétences", "En appui", "muted", "L'entretien mis par écrit aide à retrouver ses propres formulations."],
  ["Simulation et entraînement", "Avec l'outil", "primary", "Échauffement, questions adaptées au poste, réponses à voix haute, analyse sans note."],
  ["Débriefing réflexif", "Avec l'outil", "primary", "Les entretiens envoyés, les repères et les remarques du coach servent de support."],
  ["Transfert vers l'entretien réel", "Avec l'outil", "primary", "Questions propres au poste, entraînement complet dans l'ordre d'un vrai entretien."],
  ["Suivi après l'entretien", "Sans l'outil", "coach", "Un échange avec le coach. La personne peut reprendre l'entraînement si elle le souhaite."],
];

const SOURCES = [
  "Bandura, A. (1997). Self-efficacy: The exercise of control. New York, W. H. Freeman.",
  "Clot, Y. (1999). La fonction psychologique du travail. Paris, Presses universitaires de France.",
  "Ericsson, K. A., Krampe, R. T. et Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. Psychological Review, 100(3).",
  "Hattie, J. et Timperley, H. (2007). The power of feedback. Review of Educational Research, 77(1).",
  "Schön, D. A. (1983). The reflective practitioner. New York, Basic Books.",
];

export default function Methode({ go }) {
  return (
    <main>
      <PageHero eyebrow="Solutions" title="Méthode : comment l'outil sert l'accompagnement"
        lead="La Répét' prolonge le travail fait avec le coach. S'entraîner seul et à voix haute, se revoir, lire le retour de l'assistant, qui analyse sans noter, en parler avec son coach, puis transférer vers l'entretien réel : chaque temps a sa fonction, et le coach garde la main.">
        <p style={{ ...TY.body, color: T.body, margin: 0 }}>La méthode d'accompagnement de l'organisme, en sept étapes : <Link href="#/a-propos">À propos</Link>. Ce que fait l'assistant : <Link href="#/solutions/usage-de-l-ia">usage de l'IA</Link>.</p>
      </PageHero>

      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: PAD.wrap }}>
        <Section first eyebrow="L'articulation" title="Cinq temps qui s'enchaînent" sub="Pour chaque temps : ce qui se passe, et ce qu'il apporte à l'apprentissage.">
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: GAP.grid }}>
            {LOOP.map((s, i) => (
              <li key={s.t}>
                <Reveal>
                  <Card style={{ display: "grid", gap: 16 }}>
                    <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
                      <IconTile icon={s.ic} />
                      <div style={{ display: "grid", gap: 4 }}>
                        <span style={{ ...TY.overline, color: T.muted }}>Temps {i + 1} · {s.who}</span>
                        <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>{s.t}</h3>
                      </div>
                    </div>
                    <div className="rs-g2" style={{ gap: 16 }}>
                      {[["Ce qui se passe", s.what], ["Ce que cela apporte", s.why]].map(([k, v], j) => (
                        <Reveal key={k} delay={stagger(j, 4)} style={{ display: "grid", gap: 4, alignContent: "start" }}>
                          <span style={{ ...TY.label, color: T.navy }}>{k}</span>
                          <p style={{ ...TY.body, color: T.body, margin: 0 }}>{v}</p>
                        </Reveal>
                      ))}
                    </div>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ol>
        </Section>

        <Section eyebrow="Le retour" title="Pourquoi l'assistant analyse sans noter"
          sub="Une note rend un verdict global, sans dire quoi faire ensuite. Un repère situé dans la réponse donne une prise sur l'essai suivant.">
          <div className="rs-split" style={{ alignItems: "start" }}>
            <div style={{ display: "grid", gap: 16, ...TY.bodyLg, color: T.body }}>
              <Reveal><p style={{ margin: 0 }}>Dans leur synthèse sur le feedback, Hattie et Timperley proposent qu'un retour utile réponde à trois questions. Où vais-je ? Où en suis-je ? Quelle est la suite ? Dans l'accompagnement, l'objectif est convenu avec le coach, les repères disent où en est la réponse, les pistes à explorer et le débriefing ouvrent la suite.</p></Reveal>
              <Reveal delay={70}><p style={{ margin: 0 }}>Les mêmes auteurs distinguent quatre niveaux de retour. Ceux qui portent sur la tâche, la démarche et l'autorégulation aident à apprendre. Selon eux, ceux qui portent sur la personne elle-même aident peu. Une note globale ne dit rien de la tâche ni de la suite, et elle est souvent reçue comme un jugement sur soi.</p></Reveal>
              <Reveal delay={140}><p style={{ margin: 0 }}>Pour Bandura, le sentiment d'efficacité personnelle se nourrit d'abord de réussites vécues. C'est pourquoi le retour présente en premier les points d'appui : ce qui fonctionne déjà devient visible, et sert de base à l'essai suivant.</p></Reveal>
              <Reveal delay={210}><p style={{ margin: 0 }}>Le retour ne cherche jamais à interpréter l'état intérieur de la personne. L'assistant analyse et décrit ce qu'il observe, ce qui se voit et s'entend, et rien d'autre.</p></Reveal>
            </div>
            <Reveal delay={70}>
              <div className="rp-pad-md" style={{ background: T.primaryBg, borderRadius: RAD.lg, padding: PAD.md, display: "grid", gap: 16 }}>
                <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Les quatre niveaux de retour</h3>
                <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 12 }}>
                  {LEVELS.map(([t, d], i) => (
                    <li key={t}><Reveal delay={stagger(i, 4)} style={{ display: "grid", gap: 4 }}>
                      <span style={{ ...TY.label, color: T.navy }}>{t}{i === 3 && <span className="rp-sr"> (niveau que l'outil évite)</span>}</span>
                      <span style={{ ...TY.small, color: T.navy }}>{d}</span>
                    </Reveal></li>
                  ))}
                </ul>
                <p style={{ ...TY.small, color: T.navy, margin: 0 }}>D'après Hattie et Timperley (2007).</p>
              </div>
            </Reveal>
          </div>
        </Section>

        <Section eyebrow="Le coach" title="Le rôle irremplaçable du coach"
          sub="L'outil prolonge le travail entre deux rendez-vous. Il ne remplace aucun rendez-vous, et ne décide de rien.">
          <div className="rs-g3">
            {COACH.map(([ic, t, d], i) => (
              <Reveal key={t} delay={stagger(i)} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
                  <IconTile icon={ic} c={T.coach} bg={T.coachBg} />
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section eyebrow="Dans la méthode" title="La place de l'outil, étape par étape"
          sub="La méthode d'accompagnement compte sept étapes. L'outil intervient dans trois d'entre elles, et en appui dans une quatrième.">
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 12, maxWidth: W.wide }}>
            {MAP.map(([t, tag, tone, d], i) => (
              <li key={t}><Reveal delay={stagger(i, 4)} style={{ display: "flex", gap: 16, alignItems: "flex-start", background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, padding: 16, flexWrap: "wrap" }}>
                <span aria-hidden style={{ ...TY.time, color: T.muted, minWidth: 24, marginTop: 4 }}>{String(i + 1).padStart(2, "0")}</span>
                <div style={{ display: "grid", gap: 4, flex: "1 1 280px", minWidth: 0 }}>
                  <span style={{ ...TY.h3, color: T.navy }}>{t}</span>
                  <span style={{ ...TY.body, color: T.body }}>{d}</span>
                </div>
                <Tag tone={tone}>{tag}</Tag>
              </Reveal></li>
            ))}
          </ol>
          <Reveal><Notice tone="info" icon={I.info} style={{ marginTop: GAP.grid, maxWidth: W.read }}>
            Certaines personnes préfèrent s'entraîner en rendez-vous plutôt que seules. La méthode reste la même : l'outil est une option, que la personne et son coach choisissent ensemble.
          </Notice></Reveal>
          <Reveal><Notice tone="info" icon={I.mic} style={{ marginTop: GAP.grid, maxWidth: W.read }}>
            Une voix, pas d'avatar : la question est lue à voix haute, sans visage à l'écran. La personne se concentre sur l'exercice, s'observe, puis recommence. C'est un choix de conception assumé, pas un résultat prouvé : nos raisons et leurs limites sont sur la page <Link href="#/solutions/recherche">Recherche en accompagnement</Link>.
          </Notice></Reveal>
        </Section>

        <Section eyebrow="Sources" title="Pour aller plus loin">
          <ul className="rp-sources" style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: PAD.list, display: "grid", gap: 8, maxWidth: W.read }}>
            {SOURCES.map((s, i) => <Reveal as="li" key={s} delay={stagger(i, 4)}>{s}</Reveal>)}
          </ul>
          <Reveal><p style={{ ...TY.body, color: T.body, margin: 0, marginTop: GAP.grid, maxWidth: W.read }}>Ce que ces travaux établissent, et leurs limites : <Link href="#/solutions/recherche">recherche en accompagnement</Link>.</p></Reveal>
        </Section>

        <FinalBand title="Voir l'outil en détail" text="Échauffement, questions, retour, envoi au coach, relecture et rapport : l'outil pas à pas.">
          <Btn kind="white" size="lg" onClick={() => go("#/solutions/fonctionnalites")} iconRight={I.arrow}>Voir les fonctionnalités</Btn>
          <Btn kind="ghostDark" size="lg" onClick={() => go("#/demo")}>Parler de votre projet</Btn>
        </FinalBand>
      </div>
    </main>
  );
}
