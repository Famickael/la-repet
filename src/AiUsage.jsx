import React from "react";
import { T, RAD, Btn, Card, Tag, I, TY, W, GAP, Section, PageHero, IconTile, Notice, Link } from "./ui.jsx";
import { Reveal } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* « Usage de l'IA » (#/solutions/usage-de-l-ia, menu Solutions) : ce que fait l'assistant, ce qu'il ne fait pas,
   la mise par écrit et la description sur l'appareil, les garde-fous, le cadre de l'AI Act et du RGPD.
   Le moteur d'IA n'est jamais nommé (docs/redaction.md, 1.2 bis). Aucune affirmation qui dépasse le code :
   filtre isCompliant (src/lib/analysis.js), traitement local (src/lib/whisper*), option de reformulation
   (VITE_LLM_ENDPOINT, texte seulement, voir src/content/legal.js). */

const DOES = [
  [I.mic, "Mettre la réponse par écrit", "La voix devient un texte, sur l'appareil. Ce texte sert à repérer les exemples, les pauses et les petits mots répétés."],
  [I.sparkle, "Décrire la réponse", "L'assistant place des repères au bon moment de la réponse : rythme de parole, pauses, exemples, construction, regard. Il commence par ce qui fonctionne déjà."],
  [I.chat, "Répondre aux questions sur l'entretien", "L'assistant de préparation d'entretien répond aux questions courantes. Il rappelle qu'il est un programme et renvoie vers le coach."],
];

const OBSERVE = [
  ["Rythme de parole", "« Environ 140 mots par minute sur l'ensemble de la réponse. »"],
  ["Pauses", "« 3 pauses de plus de 2 secondes, la plus longue à 0:42. »"],
  ["Exemples concrets", "« Vous citez une expérience précise : deux ans à l'accueil d'une mairie. »"],
  ["Petits mots répétés", "« \"Euh\" revient 4 fois, surtout en début de phrase. »"],
  ["Structure", "« 5 phrases, avec une phrase de conclusion. »"],
  ["Direction du regard", "« Vers l'écran la plupart du temps, vers le bas en début de réponse. »"],
];

const STEPS = [
  ["1", "Enregistrement", "La caméra et le micro enregistrent dans le navigateur. La vidéo est gardée sur l'appareil."],
  ["2", "Mise par écrit", "Un outil téléchargé une fois (environ 130 Mo) met la voix par écrit, sur l'appareil. La voix n'est pas envoyée."],
  ["3", "Repères", "Les repères sont calculés sur l'appareil, à partir du texte, du son et de la position de la tête."],
  ["4", "Envoi, si vous le décidez", "Rien ne part chez le coach sans un envoi volontaire, réponse par réponse."],
];

const GUARDS = [
  [I.ban, "Un filtre sur chaque retour", "Avant d'afficher un retour, un filtre écarte tout texte qui contient une note ou un mot sur les émotions. Le retour décrit alors la réponse sans reformulation."],
  [I.check, "Ce qui fonctionne d'abord", "Les points d'appui sont toujours présentés en premier. Les pistes à explorer viennent ensuite, sans être des erreurs."],
  [I.users, "Le coach a le dernier mot", "Le coach peut confirmer, nuancer ou contredire chaque repère. Son commentaire apparaît à côté, dans le rapport."],
  [I.info, "Transparence", "Chaque écran dit quand un texte vient de l'assistant. L'assistant rappelle qu'il n'est pas une personne."],
  [I.mic, "Voix seule possible", "Sans caméra, l'assistant ne décrit pas le regard. Le reste du retour ne change pas."],
  [I.compass, "Des usages, pas des règles", "Un repère renvoie aux habitudes d'entretien en France. Elles changent selon le poste et l'entreprise."],
];

const LAW = [
  [I.scale, "Règlement européen sur l'IA (AI Act)", "Aucune reconnaissance d'émotion ni inférence de personnalité : l'article 5 du règlement 2024/1689 l'interdit sur le lieu de travail et dans les établissements d'enseignement, et nous l'excluons partout. Transparence sur le rôle de l'assistant et supervision humaine à chaque étape."],
  [I.shield, "RGPD", "Minimisation (prénom et initiale, poste visé), accord donné option par option et retirable, vidéo gardée sur l'appareil tant que la personne ne l'envoie pas. Analyse d'impact menée par notre organisme avant tout démarrage."],
  [I.user, "Aucune décision automatique", "Le retour n'a aucune conséquence sur les droits de la personne ni sur son accompagnement. Il sert à s'entraîner, rien d'autre."],
];

export default function AiUsage({ go }) {
  return (
    <main>
      <PageHero eyebrow="Solutions" title="Usage de l'IA"
        lead="Un assistant IA aide à s'entraîner. Il met la réponse par écrit et la décrit, sur l'appareil de la personne. Il ne note pas, ne devine aucune émotion et ne décide de rien.">
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Tag tone="ai" icon={I.sparkle}>Décrit, ne note pas</Tag>
          <Tag tone="primary" icon={I.lock}>Sur l'appareil</Tag>
          <Tag tone="primary" icon={I.users}>Le coach garde la main</Tag>
        </div>
      </PageHero>

      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Section first eyebrow="Ce qu'il fait" title="Trois tâches, et seulement trois">
          <div className="rs-g3">{DOES.map(([ic, t, d], i) => (
            <Reveal key={t} delay={i * 80} style={{ height: "100%" }}>
              <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}><IconTile icon={ic} c={T.violet} bg={T.violetBg} /><h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3><p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p></Card>
            </Reveal>
          ))}</div>
        </Section>

        <Section id="observe" eyebrow="Ce qu'il observe" title="Ce que l'assistant observe, et ce qu'il n'observe pas" sub="Des faits, situés à un moment précis de la réponse. Jamais une note.">
          <div className="rs-split" style={{ alignItems: "start" }}>
            <div className="rs-g2" style={{ gap: 12 }}>
              {OBSERVE.map(([t, ex], i) => (
                <Reveal key={t} delay={(i % 2) * 70} style={{ height: "100%" }}>
                  <Card pad="sm" style={{ height: "100%", display: "grid", gap: 4, alignContent: "start" }}>
                    <h3 style={{ ...TY.h4, color: T.navy, margin: 0 }}>{t}</h3>
                    <p style={{ ...TY.small, color: T.body, margin: 0 }}>{ex}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
            <Reveal>
              <div style={{ background: T.violetBg, borderRadius: RAD.lg, padding: 32, display: "grid", gap: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12 }}><IconTile icon={I.ban} c={T.violet} bg={T.surface} /><h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Ce que l'assistant n'observe pas</h3></div>
                <ul style={{ margin: 0, paddingLeft: 20, display: "grid", gap: 8, ...TY.body, color: T.navy }}>
                  <li>Les émotions, l'humeur ou le stress supposé.</li>
                  <li>La personnalité, la motivation ou la sincérité.</li>
                  <li>L'apparence, la tenue, l'âge, l'origine.</li>
                  <li>L'accent ou la façon de parler d'une région.</li>
                </ul>
                <p style={{ ...TY.small, color: T.body, margin: 0 }}>Le suivi du regard lit seulement la position de la tête et la direction des yeux, jamais les expressions du visage.</p>
              </div>
            </Reveal>
          </div>
        </Section>

        <Section id="appareil" eyebrow="Sur l'appareil" title="La mise par écrit et la description se font sur l'appareil" sub="La vidéo et la voix restent sur l'appareil de la personne tant qu'elle ne les envoie pas.">
          <ol className="rs-g2" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {STEPS.map(([n, t, d]) => (
              <li key={n} style={{ borderTop: `2px solid ${T.primary}`, paddingTop: 16, display: "flex", gap: 16 }}>
                <span style={{ ...TY.num, color: T.primary }}>{n}</span>
                <div style={{ display: "grid", gap: 8 }}>
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </div>
              </li>
            ))}
          </ol>
          <div style={{ marginTop: GAP.block, maxWidth: W.read }}>
            <Notice tone="ai" icon={I.info}>Notre organisme peut activer une option : un service d'IA reformule alors le retour à partir du texte de la réponse. Il ne reçoit jamais l'image ni la voix, et les mêmes garde-fous s'appliquent. Dans ce cas, « Vos données » le précise.</Notice>
          </div>
        </Section>

        <Section id="garde-fous" eyebrow="Garde-fous" title="Ce qui encadre chaque retour">
          <div className="rs-g3">{GUARDS.map(([ic, t, d], i) => (
            <Reveal key={t} delay={(i % 3) * 70} style={{ height: "100%" }}>
              <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}><IconTile icon={ic} /><h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3><p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p></Card>
            </Reveal>
          ))}</div>
        </Section>

        <Section id="ai-act" eyebrow="Cadre réglementaire" title="Conçu pour l'AI Act et le RGPD dès le départ">
          <div className="rs-g3">{LAW.map(([ic, t, d]) => (
            <Card key={t} topbar style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}><IconTile icon={ic} /><h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3><p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p></Card>
          ))}</div>
          <p style={{ ...TY.body, color: T.body, margin: `${GAP.block}px 0 0`, maxWidth: W.read }}>
            Le détail, écrit pour les personnes accompagnées : <Link href="#/vos-donnees/assistant">ce que fait l'assistant, et ce qu'il ne fait pas</Link>. Les travaux qui ont guidé ces choix : <Link href="#/solutions/recherche">recherche en accompagnement</Link>.
          </p>
        </Section>

        <FinalBand title="Voir l'outil pas à pas" text="De l'échauffement au rapport du coach : toutes les fonctionnalités.">
          <Btn kind="white" size="lg" onClick={() => go("#/solutions/fonctionnalites")} iconRight={I.arrow}>Voir les fonctionnalités</Btn>
        </FinalBand>
      </div>
    </main>
  );
}
