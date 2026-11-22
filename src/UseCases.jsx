import React from "react";
import { T, Btn, Card, I, TY, W, GAP, Section, PageHero, IconTile, Tabs, Notice, Link } from "./ui.jsx";
import { Reveal, stagger, useSectionScroll } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";
import { LinkCards, LinkChips } from "./LinkCards.jsx";

/* Menu « Cas d'usage » : une page par public (contenu repris des anciennes sections de la page Solutions).
     #/cas-d-usage                                        page d'entrée
     #/cas-d-usage/beneficiaires(/demandeurs-emploi|collaborateurs)   personnes accompagnées
     #/cas-d-usage/coachs                                 coachs de l'organisme
     #/cas-d-usage/commanditaires                         acteurs publics et entreprises
   Côté personne accompagnée : vouvoiement. Les boutons d'accès ouvrent l'espace de la personne connectée
   (openSpace("benef") ou openSpace("coach"), src/app/router.js), jamais la connexion quand une session est ouverte. */

export const USECASES = [
  { href: "#/cas-d-usage/beneficiaires", icon: I.user, title: "Personnes accompagnées", short: "Personnes accompagnées",
    text: "Demandeurs d'emploi et collaborateurs en mobilité : s'entraîner à voix haute, quand on veut, et décider de ce que voit son coach." },
  { href: "#/cas-d-usage/coachs", icon: I.users, tone: "coach", title: "Coachs", short: "Coachs",
    text: "Créer un parcours, relire les entretiens reçus, nuancer l'assistant et préparer le débriefing." },
  { href: "#/cas-d-usage/commanditaires", icon: I.building, title: "Commanditaires", short: "Commanditaires",
    text: "Acteurs publics de l'emploi et entreprises : nous confier un accompagnement, recevoir un bilan d'ensemble." },
];

export default function UseCases({ go, openSpace, page, section }) {
  useSectionScroll(section);
  if (page === "beneficiaires") return <Beneficiaires go={go} openSpace={openSpace} />;
  if (page === "coachs") return <Coachs go={go} openSpace={openSpace} />;
  if (page === "commanditaires") return <Commanditaires go={go} />;
  return <Hub go={go} />;
}

const wrap = { maxWidth: W.page, margin: "0 auto", padding: "0 24px" };

function Hub({ go }) {
  return (
    <main>
      <PageHero eyebrow="Cas d'usage" title="Un accompagnement outillé, pour chaque public"
        lead="Nos coachs accompagnent des demandeurs d'emploi et des collaborateurs d'entreprise. Entre deux rendez-vous, chacun s'entraîne avec La Répét'. Acteurs publics et entreprises nous confient cet accompagnement.">
        <LinkChips items={USECASES} label="Publics" />
      </PageHero>
      <div className="rs-pad" style={wrap}>
        <Section first eyebrow="Par public" title="Choisissez votre situation">
          <LinkCards items={USECASES} />
        </Section>
        <Section eyebrow="Exemples" title="Deux scénarios d'usage" sub="Des situations types, décrites dans le centre de ressources. Aucun résultat n'a été mesuré.">
          <LinkCards cols={2} items={[
            { href: "#/ressources/scenario-atelier-collectif", icon: I.users, tag: "Scénario d'usage", tone: "coach", title: "Un atelier collectif", text: "Un atelier hebdomadaire qui s'appuie sur les entraînements faits à la maison pour parler de moments concrets.", cta: "Lire le scénario" },
            { href: "#/ressources/scenario-accompagnement-a-distance", icon: I.monitor, tag: "Scénario d'usage", tone: "coach", title: "Un accompagnement à distance", text: "Garder le fil entre deux rendez-vous espacés, quand la personne accompagnée habite loin de l'agence.", cta: "Lire le scénario" },
          ]} />
        </Section>
        <FinalBand title="Un projet d'accompagnement ?" text="Acteur public de l'emploi ou entreprise : parlons de vos besoins.">
          <Btn kind="white" size="lg" onClick={() => go("#/demo")} iconRight={I.arrow}>Nous contacter</Btn>
        </FinalBand>
      </div>
    </main>
  );
}

function FeatureGrid({ features }) {
  return (
    <div className="rs-g3">
      {features.map(([ic, t, d], i) => (
        <Reveal key={t} delay={(i % 3) * 70} style={{ height: "100%" }}>
          <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
            <IconTile icon={ic} />
            <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
            <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
          </Card>
        </Reveal>
      ))}
    </div>
  );
}

const BENEF = [
  [I.lock, "Accès par code, sans compte", "Un code d'accès de 6 caractères donné par votre coach. Ni adresse électronique, ni mot de passe."],
  [I.mic, "Échauffement sans enregistrement", "Des phrases à dire à voix haute, avec une consigne, pour vous lancer. Rien n'est enregistré."],
  [I.target, "Questions adaptées au métier", "Des questions selon le poste que vous visez. Vous pouvez aussi ajouter les vôtres."],
  [I.video, "Caméra ou voix seule", "3 minutes au plus par réponse. Vous vous revoyez avant de garder l'entretien. Vous recommencez autant que vous voulez, et vous voyez ce qui a changé."],
  [I.sparkle, "Un assistant qui analyse, sans noter", "Rythme de parole, pauses, exemples, petits mots répétés, regard. Ce qui fonctionne déjà est présenté en premier."],
  [I.layers, "Un retour à lire ou à regarder", "Lisez le retour, ou revoyez-vous avec les repères placés au bon moment de la vidéo."],
  [I.chat, "Un assistant de préparation d'entretien", "Il répond à vos questions sur l'entretien, sans remplacer votre coach. Un entraînement complet suit l'ordre d'un vrai entretien."],
  [I.send, "Envoi volontaire", "Chaque entretien reste sur votre appareil tant que vous ne l'envoyez pas."],
  [I.trash, "Tout supprimer à tout moment", "Vous pouvez supprimer un entretien, ou retirer votre accord : tout est alors effacé."],
];

const COLLAB = [
  [I.compass, "Mobilité interne ou externe", "Préparez un entretien pour un autre poste dans l'entreprise, ou pour un projet ailleurs."],
  [I.chat, "Entretien professionnel ou annuel", "Entraînez-vous à parler de votre parcours, de vos compétences et de vos souhaits d'évolution."],
  [I.redo, "Reconversion", "Mettez des mots sur un nouveau projet. Expliquez ce que vous apportez d'un métier à l'autre."],
  [I.target, "Des questions adaptées", "Des questions propres aux entretiens de mobilité et d'évolution. Vous pouvez aussi ajouter les vôtres."],
  [I.sparkle, "La même analyse, sans note", "Rythme de parole, pauses, exemples, regard. Jamais de note, jamais d'émotion devinée."],
  [I.lock, "Confidentiel vis-à-vis de l'employeur", "Votre employeur ne voit pas vos entretiens. Seul votre coach voit ce que vous choisissez de lui envoyer."],
];

function Beneficiaires({ go, openSpace }) {
  return (
    <main>
      <PageHero eyebrow="Cas d'usage" title="Personnes accompagnées"
        lead="Vous suivez un accompagnement vers l'emploi, ou votre entreprise vous en propose un. Avec le code de votre coach, vous vous entraînez à voix haute, sans avatar, autant de fois que vous voulez.">
        <div className="rp-wide-m" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn kind="objective" size="lg" onClick={() => openSpace("benef")} iconRight={I.arrow}>Je lance mon premier entraînement</Btn>
        </div>
        <LinkChips label="Sections de la page" items={[
          { href: "#/cas-d-usage/beneficiaires/demandeurs-emploi", icon: I.user, title: "Demandeurs d'emploi" },
          { href: "#/cas-d-usage/beneficiaires/collaborateurs", icon: I.compass, title: "Collaborateurs en mobilité" },
        ]} />
      </PageHero>
      <div className="rs-pad" style={wrap}>
        <Section first id="demandeurs-emploi" eyebrow="Demandeurs d'emploi" title="Préparer vos entretiens d'embauche, sans jugement"
          sub="Dans votre accompagnement vers l'emploi, vous vous entraînez avec le code de votre coach, autant que nécessaire avant le jour J.">
          <FeatureGrid features={BENEF} />
        </Section>
        <Section id="collaborateurs" eyebrow="Collaborateurs en mobilité" title="Préparer un entretien de mobilité ou d'évolution"
          sub="Votre entreprise vous propose un accompagnement. Vous vous entraînez avec votre coach, en toute confidentialité vis-à-vis de votre employeur.">
          <FeatureGrid features={COLLAB} />
          <Reveal style={{ marginTop: GAP.block, maxWidth: W.read }}>
            <Notice tone="info" icon={I.lock}>Conseil : entraînez-vous de préférence sur votre téléphone ou votre ordinateur personnel, plutôt que sur un ordinateur professionnel.</Notice>
          </Reveal>
        </Section>
        <FinalBand title="Une question avant de commencer ?" text="Durée, matériel, confidentialité : les réponses sont dans les questions fréquentes.">
          <Btn kind="white" size="lg" onClick={() => go("#/ressources/faq/personnes-accompagnees")} iconRight={I.arrow}>Lire les questions fréquentes</Btn>
        </FinalBand>
      </div>
    </main>
  );
}

const COACH = [
  [I.plus, "Un parcours vite créé", "Prénom et initiale, métier visé : le code et le lien sont prêts à transmettre."],
  [I.list, "Entretiens à relire", "Une liste claire des entretiens reçus, avec le message de la personne."],
  [I.note, "Remarques placées dans la vidéo", "Mettez en pause, écrivez : votre remarque se place à ce moment de la vidéo."],
  [I.chat, "Nuancer l'assistant", "Confirmez, nuancez ou contredisez chaque repère. Votre lecture prime."],
  [I.send, "Rien ne part sans vous", "Votre brouillon s'enregistre tout seul. Vous envoyez le rapport quand il est prêt. Vous pouvez le corriger et le renvoyer."],
  [I.print, "Support de débriefing", "Rapport imprimable ou exportable en PDF pour l'atelier ou le rendez-vous."],
];

function Coachs({ go, openSpace }) {
  return (
    <main>
      <PageHero eyebrow="Cas d'usage" title="Coachs"
        lead="Les coachs de notre organisme mènent l'accompagnement. Ils voient seulement ce que la personne choisit de leur envoyer, relisent, nuancent l'assistant et préparent le débriefing.">
        <div className="rp-wide-m" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn kind="secondary" size="lg" onClick={() => openSpace("coach")} iconRight={I.arrow}>Me connecter à l'espace coach</Btn>
        </div>
      </PageHero>
      <div className="rs-pad" style={wrap}>
        <Section first id="relire" eyebrow="Au quotidien" title="Relire, nuancer, préparer le débriefing">
          <FeatureGrid features={COACH} />
          <Reveal as="p" style={{ ...TY.body, color: T.body, margin: `${GAP.block}px 0 0`, maxWidth: W.read }}>
            Pas à pas : <Link href="#/ressources/relire-une-reponse-et-preparer-le-debriefing">relire un entretien et préparer le débriefing</Link>. Un exemple en groupe : <Link href="#/ressources/scenario-atelier-collectif">le scénario de l'atelier collectif</Link>.
          </Reveal>
        </Section>
        <FinalBand title="Une question sur l'espace coach ?" text="Relecture, atelier collectif, indicateurs : les réponses sont dans les questions fréquentes.">
          <Btn kind="white" size="lg" onClick={() => go("#/ressources/faq/coachs")} iconRight={I.arrow}>Lire les questions fréquentes</Btn>
        </FinalBand>
      </div>
    </main>
  );
}

const ORG = [
  {
    tab: "Acteurs publics", icon: I.compass, title: "Accompagner le retour à l'emploi et l'insertion",
    points: [
      ["Pour qui", "Services publics de l'emploi, collectivités, départements, structures d'insertion : vous accompagnez des demandeurs d'emploi et vous cherchez un appui pour la préparation aux entretiens."],
      ["Ce que nous faisons", "Nos coachs mènent les rendez-vous et les ateliers. Entre deux rendez-vous, les personnes s'entraînent avec La Répét' et arrivent avec des moments concrets à discuter."],
      ["Un suivi sans surveillance", "Nous rendons compte de l'accompagnement avec des éléments d'ensemble : entretiens relus, rapports envoyés, délai de relecture. Jamais une mesure individuelle."],
      ["Un cadre clair", "Aucune note, aucune émotion devinée, une vidéo qui reste sur l'appareil tant que la personne ne l'envoie pas. Le cadre est détaillé dans l'onglet « Cadre et données »."],
    ],
  },
  {
    tab: "Entreprises", icon: I.building, title: "Accompagner la mobilité de vos collaborateurs",
    points: [
      ["Pour qui", "Les entreprises qui font accompagner leurs collaborateurs : mobilité interne ou externe, préparation d'un entretien de mobilité, entretien annuel ou professionnel, reconversion."],
      ["Ce que nous faisons", "Nos coachs accompagnent chaque collaborateur, en rendez-vous individuels ou en ateliers. La Répét' lui permet de s'entraîner seul, à son rythme, entre deux rendez-vous."],
      ["La confidentialité", "Les entretiens restent entre le collaborateur et son coach. L'entreprise ne voit ni les vidéos, ni les retours, ni les rapports."],
      ["Ce que vous recevez", "Un bilan d'ensemble de l'accompagnement, défini avec vous avant le démarrage, sans information sur une personne en particulier."],
    ],
  },
  {
    tab: "Cadre et données", icon: I.scale, title: "Conçu pour l'AI Act et le RGPD",
    points: [
      ["Aucune inférence d'émotion", "L'article 5 du règlement (UE) 2024/1689 interdit la reconnaissance des émotions sur le lieu de travail et dans les établissements d'enseignement. L'outil ne lit jamais les expressions du visage."],
      ["Transparence et supervision humaine", "La personne sait qu'un assistant IA produit le retour. Le coach peut le contredire, et rien ne parvient à la personne sans envoi explicite."],
      ["Minimisation et consentement", "Prénom et initiale, métier visé. Consentement donné option par option, daté et retirable. Le retrait supprime les entretiens."],
      ["Avant tout démarrage", "Notre organisme, responsable du traitement, mène l'analyse d'impact (AIPD) et la qualification au regard de l'AI Act, et fixe les durées de conservation avec son délégué à la protection des données."],
    ],
  },
];

const OrgPanel = ({ o }) => (
  <div className="rs-split" style={{ alignItems: "start", gridTemplateColumns: "minmax(0,2fr) minmax(0,3fr)" }}>
    <div style={{ display: "grid", gap: 16 }}>
      <IconTile icon={o.icon} s={48} />
      <h3 className="ty-h1" style={{ ...TY.h1, color: T.navy, margin: 0 }}>{o.title}</h3>
    </div>
    <div className="rs-g2" style={{ gap: 16 }}>
      {o.points.map(([t, d], i) => (
        <Reveal key={t} delay={stagger(i, 2)} style={{ borderTop: `2px solid ${T.primary}`, paddingTop: 16, display: "grid", gap: 8 }}>
          <h4 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h4>
          <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
        </Reveal>
      ))}
    </div>
  </div>
);

function Commanditaires({ go }) {
  return (
    <main>
      <PageHero eyebrow="Cas d'usage" title="Commanditaires"
        lead="Acteurs publics de l'emploi ou entreprises : vous nous confiez des personnes à accompagner. Nos coachs mènent l'accompagnement, La Répét' l'outille. Vous recevez un bilan d'ensemble, jamais une mesure individuelle.">
        <div className="rp-wide-m" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
          <Btn kind="objective" size="lg" onClick={() => go("#/demo")} iconRight={I.arrow}>Parler de votre projet</Btn>
        </div>
      </PageHero>
      <div className="rs-pad" style={wrap}>
        <Section first id="confier" eyebrow="Commanditaires" title="Nous confier un accompagnement">
          <Reveal><Tabs label="Commanditaires" idPrefix="org" tabs={ORG.map(o => [o.tab, <OrgPanel key={o.tab} o={o} />])} /></Reveal>
          <Reveal as="p" style={{ ...TY.body, color: T.body, margin: `${GAP.block}px 0 0`, maxWidth: W.read }}>
            Le détail du cadre : <Link href="#/solutions/usage-de-l-ia">usage de l'IA</Link>. Un exemple : <Link href="#/ressources/confier-un-accompagnement">confier un accompagnement</Link>.
          </Reveal>
        </Section>
        <FinalBand title="Une question sur notre accompagnement ?" text="Données, AI Act, analyse d'impact, démarrage : les réponses sont dans les questions fréquentes.">
          <Btn kind="white" size="lg" onClick={() => go("#/ressources/faq/commanditaires")} iconRight={I.arrow}>Lire les questions fréquentes</Btn>
        </FinalBand>
      </div>
    </main>
  );
}
