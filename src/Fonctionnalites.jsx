import React from "react";
import { T, Btn, Card, Icon, I, TY, Section, PageHero, IconTile, W, PAD } from "./ui.jsx";
import { Reveal, scrollToTarget } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* « Fonctionnalités » (#/solutions/fonctionnalites, menu Solutions ; #/fonctionnement y est redirigée) : le déroulé
   en sept étapes, puis les fonctions de l'outil, regroupées par moment. Les pages par public sont dans
   « Cas d'usage » (src/UseCases.jsx). */

const GROUPS = [
  { id: "s-entrainer", title: "Pour s'entraîner", items: [
    [I.mic, "Échauffement sans enregistrement", "Des phrases à dire à voix haute, avec une consigne, pour se lancer. Rien n'est enregistré."],
    [I.target, "Questions adaptées au métier ou au poste", "Une banque de questions d'embauche ou de mobilité, selon le poste visé, et la possibilité d'ajouter les siennes."],
    [I.video, "Caméra ou voix seule", "3 minutes au plus par réponse, revue avant de garder l'entretien, autant d'essais que souhaité."],
    [I.volume, "Une question lue à voix haute", "Le recruteur, une voix sans visage, lit chaque question. Le son se coupe à tout moment."],
    [I.list, "Entraînement complet", "Un entretien du début à la fin : 7 questions, dans l'ordre d'un vrai entretien."],
    [I.chat, "Assistant de préparation d'entretien", "Des réponses aux questions courantes sur l'entretien, sans remplacer le coach."],
  ] },
  { id: "retour", title: "Pour lire son retour", items: [
    [I.sparkle, "Un assistant qui analyse, sans noter", "Rythme de parole, pauses, exemples, petits mots répétés, regard. Ce qui fonctionne déjà est présenté en premier."],
    [I.layers, "À lire ou à regarder", "Lire le retour, ou se revoir avec les repères placés au bon moment de la vidéo."],
    [I.note, "Le texte de l'entretien", "L'entretien mis par écrit, ligne par ligne, avec le moment de chaque phrase."],
  ] },
  { id: "garder-la-main", title: "Pour garder la main", items: [
    [I.lock, "Accès par code, sans compte", "Un code d'accès de 6 caractères remis par le coach. Ni adresse électronique, ni mot de passe."],
    [I.send, "Envoi volontaire", "Chaque entretien reste sur l'appareil tant que la personne ne l'envoie pas à son coach."],
    [I.trash, "Tout supprimer à tout moment", "Un entretien, ou tout, en retirant son accord. Les entretiens sont alors effacés de l'appareil."],
  ] },
  { id: "coach", title: "Pour le coach", items: [
    [I.plus, "Un parcours vite créé", "Prénom et initiale, métier visé : le code et le lien sont prêts à transmettre."],
    [I.list, "Entretiens à relire", "Une liste claire des entretiens reçus, avec le message de la personne."],
    [I.note, "Remarques placées dans la vidéo", "Mettez en pause, écrivez : la remarque se place à ce moment de la vidéo."],
    [I.chat, "Nuancer l'assistant", "Confirmer, nuancer ou contredire chaque repère. La lecture du coach prime."],
    [I.sparkle, "Assistant de rédaction du rapport", "Des propositions de formulation, que le coach relit, modifie ou écarte."],
    [I.print, "Support de débriefing", "Rapport imprimable ou exportable en PDF pour l'atelier ou le rendez-vous."],
  ] },
  { id: "accessibilite", title: "Pour chacun", items: [
    [I.user, "Options d'accessibilité", "Taille du texte, police lisible, espacement, règle de lecture, thème clair ou sombre."],
    [I.monitor, "Téléphone ou ordinateur", "Un téléphone suffit. Le site fonctionne aussi sur ordinateur et sur tablette."],
    [I.shield, "Données minimales", "Prénom et initiale, poste visé. Aucune publicité, aucun suivi."],
  ] },
];

export default function Fonctionnalites({ go }) {
  return (
    <main>
      <PageHero eyebrow="Solutions" title="Fonctionnalités"
        lead="L'outil pas à pas, de l'échauffement au rapport du coach. À chaque étape, une personne décide de la suite.">
        <nav aria-label="Groupes de fonctionnalités" className="rs-chips" style={{ marginTop: 8 }}>
          {GROUPS.map(g => <a key={g.id} href={`#${g.id}`} onClick={e => { e.preventDefault(); scrollToTarget(g.id); }} className="rs-chip" style={{ textDecoration: "none" }}>{g.title}</a>)}
        </nav>
      </PageHero>

      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: PAD.wrap }}>
        <Section first eyebrow="Le déroulé" title="Sept étapes, chacune décidée par une personne" sub="Rien ne passe d'une étape à la suivante sans que quelqu'un le décide.">
          <Reveal><Flow /></Reveal>
        </Section>

        {GROUPS.map(g => (
          <Section key={g.id} id={g.id} eyebrow="Fonctionnalités" title={g.title}>
            <div className="rs-g3">
              {g.items.map(([ic, t, d], i) => (
                <Reveal key={t} delay={(i % 3) * 70} style={{ height: "100%" }}>
                  <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
                    <IconTile icon={ic} />
                    <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                    <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                  </Card>
                </Reveal>
              ))}
            </div>
          </Section>
        ))}

        <FinalBand title="Voir l'accompagnement par public" text="Personnes accompagnées, coachs, commanditaires : ce que La Répét' change pour chacun.">
          <Btn kind="white" size="lg" onClick={() => go("#/cas-d-usage")} iconRight={I.arrow}>Voir les cas d'usage</Btn>
        </FinalBand>
      </div>
    </main>
  );
}

function Flow() {
  const steps = [
    { n: 1, who: "Coach", t: "crée un parcours", d: "et transmet un code" },
    { n: 2, who: "Personne accompagnée", t: "ouvre son espace", d: "et donne son accord" },
    { n: 3, who: "Personne accompagnée", t: "s'entraîne seule", d: "l'assistant analyse son entretien" },
    { n: 4, who: "Personne accompagnée", t: "envoie un entretien", d: "quand elle le décide" },
    { n: 5, who: "Coach", t: "relit", d: "ajoute ses remarques" },
    { n: 6, who: "Ensemble", t: "débriefent", d: "en atelier ou en rendez-vous" },
    { n: 7, who: "Personne accompagnée", t: "recommence", d: "même après le rapport" },
  ];
  return (
    <ol className="rp-flow" style={{ listStyle: "none", margin: 0, padding: "0 0 8px", display: "flex", overflowX: "auto", gap: 0 }}>
      {steps.map((s, i) => (
        <li key={i} className="rp-flow-step" style={{ flex: "1 0 148px", minWidth: 148, display: "flex", gap: 8 }}>
          <div style={{ display: "grid", gap: 8, alignContent: "start" }}>
            <span style={{ width: 28, height: 28, borderRadius: "50%", background: s.who === "Coach" ? T.primary : s.who === "Ensemble" ? T.navy : T.blueDk, color: T.surface, display: "grid", placeItems: "center", ...TY.time }}>{s.n}</span>
            <span style={{ ...TY.overline, color: T.muted }}>{s.who}</span>
            <span style={{ ...TY.h3, color: T.navy }}>{s.t}</span>
            <span style={{ ...TY.small, color: T.body }}>{s.d}</span>
          </div>
          {i < steps.length - 1 && <span className="rp-hide-m" style={{ marginTop: 4, padding: "0 8px" }}><Icon d={I.arrow} s={16} c={T.faint} /></span>}
        </li>
      ))}
    </ol>
  );
}
