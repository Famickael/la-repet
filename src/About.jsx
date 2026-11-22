import React from "react";
import { T, RAD, SH, Btn, Card, I, TY, W, GAP, img, Section, PageHero, IconTile, Notice, Tag, Link, PAD } from "./ui.jsx";
import { Reveal, scrollToTarget, stagger } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* Page « À propos » (#/a-propos) : l'organisme d'accompagnement à qui appartient La Répét'.
   TEXTE D'EXEMPLE, demandé par le propriétaire : un organisme imaginaire et un peu drôle (il accompagne des
   super-héros), pour qu'on voie tout de suite que le texte est provisoire. L'humour reste dans cette seule page,
   et seulement dans quelques intitulés et exemples : l'approche, la méthode et les références sont sérieuses.
   Cette page montre l'expertise d'accompagnement de l'organisme, pas les arguments de l'outil : ce que l'outil
   apporte à la méthode est détaillé dans Solutions, « Méthode » (src/Methode.jsx, #/solutions/methode).
   À remplacer par la présentation de l'organisme réel (nom, histoire, équipe, commanditaires).
   Aucun nom de personne de l'équipe, aucun chiffre, aucun témoignage. Les auteurs cités le sont pour situer les
   pratiques, sans citation entre guillemets et sans leur faire dire plus que leurs travaux. */

const ORG_NAME = "Capes & Carrières";

const TOC = [["approche", "Approche"], ["methode", "Méthode"], ["accompagnements", "Accompagnements"], ["references", "Références"], ["equipe", "Équipe"], ["commanditaires", "Commanditaires"], ["outil", "Notre outil"]];

export default function About({ go }) {
  return (
    <main>
      <PageHero eyebrow="À propos" title={<>{ORG_NAME}, l'accompagnement des <span style={{ whiteSpace: "nowrap" }}>super-héros</span></>}
        lead="Un organisme d'accompagnement vers l'emploi et dans les transitions professionnelles. Nos psychologues du travail et nos coachs aident chacun à reconnaître ce qu'il sait faire, et à le dire en entretien. Cape comprise."
        aside={<AboutAside />}>
        <Notice tone="info" icon={I.info}>
          <strong>Texte d'exemple.</strong> Cette page présente un organisme imaginaire. Elle sera remplacée par la présentation de l'organisme réel qui porte La Répét'.
        </Notice>
        <nav aria-label="Sections de la page" className="rs-chips" style={{ marginTop: 8 }}>
          {TOC.map(([id, t]) => <a key={id} href={`#${id}`} onClick={e => { e.preventDefault(); scrollToTarget(id); }} className="rs-chip" style={{ textDecoration: "none" }}>{t}</a>)}
        </nav>
      </PageHero>

      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: PAD.wrap }}>
        <Section first id="approche" eyebrow="Notre approche" title="Accompagner, c'est travailler avec la personne, pas à sa place"
          sub="Sauver une ville, nos héros savent faire. Dire en deux minutes ce qu'ils ont appris en le faisant, c'est un autre travail. C'est le nôtre.">
          <div className="rs-g3">
            {APPROACH.map(([ic, t, d], i) => (
              <Reveal key={t} delay={stagger(i)} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
                  <IconTile icon={ic} />
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </Card>
              </Reveal>
            ))}
          </div>
        </Section>

        <Section id="methode" eyebrow="Notre méthode" title="Sept étapes, de l'accueil au suivi après l'entretien"
          sub="Le même cadre pour tous, qu'on porte une cape ou une veste de chantier. Pour chaque étape : ce que fait le coach, ce que fait la personne, et ce qui en sort.">
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: GAP.grid }}>
            {STEPS.map((s, i) => (
              <li key={s.t}><Reveal>
                <Card style={{ display: "grid", gap: 16 }}>
                  <div style={{ display: "flex", gap: 16, alignItems: "baseline" }}>
                    <span aria-hidden style={{ ...TY.num, color: T.primary, flexShrink: 0 }}>{String(i + 1).padStart(2, "0")}</span>
                    <div style={{ display: "grid", gap: 4 }}>
                      <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}><span className="rp-sr">Étape {i + 1} : </span>{s.t}</h3>
                      <p style={{ ...TY.body, color: T.body, margin: 0 }}>{s.why}</p>
                    </div>
                  </div>
                  <div className="rs-g3" style={{ gap: 16 }}>
                    {[["Le coach", s.coach], ["La personne", s.person], ["Ce qu'on produit", s.out]].map(([k, v], j) => (
                      <Reveal key={k} delay={stagger(j, 4)} style={{ display: "grid", gap: 4, alignContent: "start", background: T.bg, borderRadius: RAD.md, padding: 16 }}>
                        <span style={{ ...TY.overline, color: T.body }}>{k}</span>
                        <p style={{ ...TY.body, color: T.body, margin: 0 }}>{v}</p>
                      </Reveal>
                    ))}
                  </div>
                  {s.ex && <Reveal delay={210}><p style={{ ...TY.small, color: T.body, margin: 0 }}><Tag tone="muted">Exemple imaginaire</Tag> {s.ex}</p></Reveal>}
                </Card>
              </Reveal></li>
            ))}
          </ol>
        </Section>

        <Section id="accompagnements" eyebrow="Nos accompagnements" title="Cinq façons d'accompagner, ajustées à chaque situation"
          sub="La durée et le rythme se décident au cadrage, selon le besoin de la personne et la demande du commanditaire. Nous n'affichons pas de durée type.">
          <div className="rs-g3">
            {OFFERS.map(([ic, t, d, modes, ex], i) => (
              <Reveal key={t} delay={stagger(i)} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
                  <IconTile icon={ic} />
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>{modes.map(m => <Tag key={m} tone="primary">{m}</Tag>)}</div>
                  <p style={{ ...TY.small, color: T.body, margin: 0 }}><strong>Exemple imaginaire.</strong> {ex}</p>
                </Card>
              </Reveal>
            ))}
            <Reveal delay={140} style={{ height: "100%" }}>
              <div className="rp-pad-md" style={{ height: "100%", display: "grid", gap: 12, alignContent: "start", background: T.primaryBg, borderRadius: RAD.lg, padding: PAD.md }}>
                <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Modalités</h3>
                <ul style={{ ...TY.body, color: T.navy, margin: 0, paddingLeft: PAD.list, display: "grid", gap: 8 }}>
                  {MODES.map((m, j) => <Reveal as="li" key={m} delay={stagger(j, 4)}>{m}</Reveal>)}
                </ul>
              </div>
            </Reveal>
          </div>
        </Section>

        <Section id="references" eyebrow="Nos références" title="Les travaux sur lesquels s'appuient nos pratiques"
          sub="Nous citons ces auteurs pour situer notre façon de travailler. Ils n'ont ni conçu ni validé notre méthode.">
          <div className="rs-g2">
            {REFS.map(([who, t, d], i) => (
              <Reveal key={t} delay={stagger(i, 2)} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "grid", gap: 8, alignContent: "start" }}>
                  <span style={{ ...TY.overline, color: T.muted }}>{who}</span>
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </Card>
              </Reveal>
            ))}
          </div>
          <div style={{ marginTop: GAP.block, display: "grid", gap: 12, maxWidth: W.read }}>
            <Reveal><h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Pour aller plus loin</h3></Reveal>
            <ul className="rp-sources" style={{ ...TY.small, color: T.body, margin: 0, paddingLeft: PAD.list, display: "grid", gap: 8 }}>
              {BIBLIO.map((b, i) => <Reveal as="li" key={b} delay={stagger(i, 4)}>{b}</Reveal>)}
            </ul>
            <Reveal><p style={{ ...TY.small, color: T.body, margin: 0 }}>Ce que la recherche dit de l'entraînement, du retour et de la pratique réflexive : <Link href="#/solutions/recherche">recherche en accompagnement</Link>.</p></Reveal>
          </div>
        </Section>

        <Section id="equipe" eyebrow="Notre équipe" title="Des métiers de l'accompagnement, pas des pouvoirs magiques"
          sub="Aucun de nos coachs ne vole. Tous ont été formés à écouter, à questionner et à accompagner un projet professionnel.">
          <div className="rs-split" style={{ alignItems: "start" }}>
            <ul style={{ margin: 0, padding: 0, listStyle: "none", display: "grid", gap: 16 }}>
              {TEAM.map(([ic, t, d], i) => (
                <li key={t}><Reveal delay={stagger(i, 4)} style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>
                  <IconTile icon={ic} />
                  <div style={{ display: "grid", gap: 4 }}>
                    <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                    <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                  </div>
                </Reveal></li>
              ))}
            </ul>
            <div style={{ display: "grid", gap: 16 }}>
              {FRAME.map(([t, d], i) => (
                <Reveal key={t} delay={stagger(i, 4)}><Card level={2} style={{ display: "grid", gap: 8 }}>
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </Card></Reveal>
              ))}
            </div>
          </div>
        </Section>

        <Section id="commanditaires" eyebrow="Avec les commanditaires" title="Rendre compte d'un accompagnement sans exposer les personnes"
          sub="Acteurs publics de l'emploi et entreprises nous confient l'accompagnement de leurs publics. Le travail avec eux suit trois temps.">
          <ol className="rs-g3" style={{ listStyle: "none", margin: 0, padding: 0 }}>
            {SPONSOR.map(([t, d], i) => (
              <Reveal as="li" key={t} delay={stagger(i, 4)} style={{ height: "100%" }}>
                <Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
                  <span aria-hidden style={{ ...TY.num, color: T.primary }}>{String(i + 1).padStart(2, "0")}</span>
                  <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>{t}</h3>
                  <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
                </Card>
              </Reveal>
            ))}
          </ol>
          <div className="rs-g2" style={{ marginTop: GAP.grid }}>
            <Reveal style={{ height: "100%" }}><Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
              <div><Tag tone="muted">Commanditaire public imaginaire</Tag></div>
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>La Ligue des cités protégées</h3>
              <p style={{ ...TY.body, color: T.body, margin: 0 }}>Elle nous confie des héros en recherche d'emploi, après une longue carrière de patrouilles nocturnes. Au comité de suivi, on parle d'horaires d'ateliers et de transports, jamais de tel ou tel héros.</p>
            </Card></Reveal>
            <Reveal delay={70} style={{ height: "100%" }}><Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
              <div><Tag tone="muted">Entreprise imaginaire</Tag></div>
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Les sociétés de sauvetage et de secours</h3>
              <p style={{ ...TY.body, color: T.body, margin: 0 }}>Elles nous confient des collaborateurs qui passent de l'intervention sur le terrain au bureau d'études. Le bilan parle du dispositif de mobilité, pas des personnes.</p>
            </Card></Reveal>
          </div>
        </Section>

        <Section id="outil" eyebrow="Notre outil" title="La Répét', au service de la méthode">
          <div className="rs-split" style={{ alignItems: "center" }}>
            <Reveal style={{ display: "grid", gap: 16, ...TY.bodyLg, color: T.body }}>
              <p style={{ margin: 0 }}>Nous avons conçu La Répét' pour prolonger l'étape de simulation entre deux rendez-vous, et pour nourrir le débriefing. L'outil ne remplace aucune des sept étapes, ni aucun rendez-vous.</p>
              <p style={{ margin: 0 }}>Comment il s'articule avec l'entraînement en solo, l'auto-observation, le débriefing et le transfert vers l'entretien réel : c'est expliqué dans Solutions.</p>
            </Reveal>
            <Reveal delay={70} style={{ display: "grid", gap: 12, justifyItems: "start" }}>
              <Btn kind="secondary" size="lg" onClick={() => go("#/solutions/methode")} iconRight={I.arrow}>Lire la méthode outillée</Btn>
              <Link solo href="#/solutions/fonctionnalites">Voir les fonctionnalités</Link>
            </Reveal>
          </div>
        </Section>

        <FinalBand title="Et pour de vrai ?" text="Publics, modalités, calendrier : parlons de votre projet d'accompagnement.">
          <Btn kind="white" size="lg" onClick={() => go("#/demo")} iconRight={I.arrow}>Parler de votre projet</Btn>
          <Btn kind="ghostDark" size="lg" onClick={() => go("#/cas-d-usage")}>Voir les cas d'usage</Btn>
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

const APPROACH = [
  [I.chat, "Une posture d'accompagnement", "Le coach écoute, questionne et reformule avant de conseiller. La personne reste l'experte de son parcours. Le coach est expert du cadre et de la démarche."],
  [I.users, "Une alliance de travail", "Les objectifs et la façon d'y travailler se décident à deux, et se revoient en chemin. Le lien de travail se construit dès le premier rendez-vous."],
  [I.compass, "Le pouvoir d'agir", "Nous partons de ce que la personne veut changer et des leviers dont elle dispose vraiment. Elle décide des pas à faire, et de leur rythme."],
  [I.user, "La personne et ses ressources", "Nous cherchons d'abord ce qui marche déjà : savoir-faire, réseau, expériences hors travail. Même un point faible légendaire n'efface pas le reste."],
  [I.building, "Le contexte compte", "Une difficulté d'accès à l'emploi n'est jamais seulement individuelle. Nous tenons compte du marché local, de l'organisation du travail chez l'employeur visé et des freins périphériques : mobilité, garde d'enfants, logement."],
  [I.lock, "Éthique et confidentialité", "Ce qui se dit en accompagnement reste entre la personne et son coach. Rien n'est transmis sans son accord. Les identités secrètes aussi sont bien gardées."],
];

const STEPS = [
  { t: "Accueil et diagnostic partagé", why: "Poser le cadre et comprendre la situation avant de proposer quoi que ce soit.",
    coach: "Présente le cadre, la confidentialité et les limites de l'accompagnement. Explore le projet, le parcours, le contexte et les freins périphériques.",
    person: "Dit ce qu'elle attend, ce qu'elle a déjà essayé, et ce qu'elle préfère garder pour elle.",
    out: "Un diagnostic écrit à deux et des objectifs convenus ensemble." },
  { t: "Explicitation de l'expérience", why: "Revenir à ce qui a été réellement fait, plutôt qu'à ce qu'on croit savoir faire.",
    coach: "Conduit des entretiens d'explicitation, fait décrire une situation précise pas à pas. S'appuie sur l'analyse de l'activité et sur des récits de pratique.",
    person: "Revient sur des moments vécus et raconte ce qu'elle a fait, dans l'ordre, avec les détails.",
    out: "Une réserve de situations concrètes : contexte, actions, résultat.",
    ex: "« Le jour où l'alarme a sonné dans la tour, qu'avez-vous fait en premier ? » La réponse parle de consignes, de priorités et de coordination. Pas de super-pouvoir." },
  { t: "Mise en mots des compétences et des réalisations", why: "Passer du récit à des compétences que le recruteur reconnaît.",
    coach: "Aide à nommer les compétences avec le vocabulaire du métier visé et des offres d'emploi. Vérifie que chaque compétence s'appuie sur un exemple.",
    person: "Choisit ses exemples et les reformule avec ses propres mots.",
    out: "Un répertoire de réalisations et une présentation qui lui ressemble." },
  { t: "Simulation et entraînement", why: "S'essayer en situation proche de l'entretien, autant de fois que nécessaire.",
    coach: "Construit des mises en situation fidèles à l'entretien visé : type de questions, interlocuteurs, format sur place ou en visio. En rendez-vous ou en atelier.",
    person: "Répond à voix haute, recommence, essaie une autre formulation. Entre deux rendez-vous, elle peut s'entraîner seule.",
    out: "Des réponses travaillées, prêtes à être reprises en débriefing." },
  { t: "Débriefing réflexif", why: "Apprendre de sa propre façon de faire, plutôt que recevoir un verdict.",
    coach: "Part de ce que la personne a remarqué elle-même. Décrit ce qu'il a vu et entendu, questionne les choix, sans juger la personne.",
    person: "Analyse sa réponse, repère ce qu'elle garde et ce qu'elle veut essayer autrement.",
    out: "Quelques pistes de travail, formulées par la personne elle-même." },
  { t: "Transfert vers l'entretien réel", why: "Relier ce qui a été travaillé à un entretien précis, avec un vrai recruteur.",
    coach: "Aide à préparer l'entretien : l'entreprise, le poste, les interlocuteurs, l'organisation du jour même, les questions à poser.",
    person: "Adapte ses exemples au poste, prépare ses questions et sa logistique.",
    out: "Une fiche de préparation personnelle pour cet entretien." },
  { t: "Suivi après l'entretien", why: "Tirer parti de chaque entretien, quelle qu'en soit l'issue.",
    coach: "Propose un temps d'échange après l'entretien. Aide à en tirer des enseignements, à relancer si besoin, à préparer la prise de poste.",
    person: "Raconte ce qui a été demandé et comment elle a répondu.",
    out: "Un plan d'action et des exemples mis à jour, pour l'entretien suivant ou les premières semaines en poste." },
];

const OFFERS = [
  [I.user, "Accompagnement individuel", "Des rendez-vous réguliers avec un coach attitré, de l'accueil au suivi après l'entretien.", ["Présentiel", "À distance"],
    "Une héroïne invisible prépare un entretien en visio. Nous travaillons le cadrage, la lumière et le regard vers la caméra, pour rester bien visible."],
  [I.users, "Ateliers collectifs", "Des ateliers en petit groupe pour s'entraîner devant des pairs et apprendre des réponses des autres. Une ligue, en somme, sans uniforme.", ["Présentiel", "À distance"],
    "Un atelier où chacun simule l'entretien d'un autre. Le colosse au grand cœur découvre qu'il est un recruteur très bienveillant."],
  [I.compass, "Mobilité interne", "Pour les collaborateurs qui changent de poste dans leur entreprise : bilan des acquis, projet, préparation de l'entretien de mobilité.", ["Présentiel", "À distance"],
    "Un héros de terrain vise le bureau d'études. Il apprend à décrire son expérience de l'intervention comme une connaissance des besoins réels."],
  [I.redo, "Reconversion", "Pour changer de métier : explorer les métiers proches, identifier les compétences transférables, préparer les entretiens d'un nouveau secteur.", ["Présentiel", "À distance"],
    "Un héros volant vise un poste de contrôleur aérien. Il connaît le ciel, il apprend le vocabulaire des procédures et du travail en équipe."],
  [I.heart, "Publics éloignés de l'emploi", "Un accompagnement plus long et plus global : freins périphériques, reprise de rythme, premières démarches, en lien avec les autres professionnels qui suivent la personne.", ["Présentiel", "Mixte"],
    "Un acolyte, longtemps dans l'ombre d'un autre, cherche son premier poste en son nom propre. Il s'entraîne à dire « j'ai fait » plutôt que « nous avons fait »."],
];

const MODES = [
  "En présentiel, dans nos locaux ou chez le commanditaire.",
  "À distance, en visio ou par téléphone.",
  "En alternant les deux, selon les contraintes de chacun.",
  "Durée et fréquence des rendez-vous : selon le besoin, revues en cours de route.",
];

const REFS = [
  ["Carl Rogers", "Approche centrée sur la personne", "L'empathie, la considération positive et l'authenticité du praticien comme conditions de l'accompagnement. Nous en tirons notre posture d'écoute."],
  ["Edward Bordin", "Alliance de travail", "Un accord sur les objectifs, un accord sur les tâches, et un lien entre la personne et le praticien. C'est le socle de notre diagnostic partagé."],
  ["Yann Le Bossé", "Développement du pouvoir d'agir", "Partir des changements que la personne juge importants et des leviers concrets dont elle dispose, en tenant compte des obstacles de son environnement."],
  ["Pierre Vermersch", "Entretien d'explicitation", "Faire décrire le déroulement d'une action vécue et singulière, plutôt que des généralités. Nous l'utilisons pour retrouver la matière des exemples."],
  ["Yves Clot", "Clinique de l'activité", "Le travail réel déborde la tâche prescrite. Commenter ses propres traces d'activité, comme dans l'autoconfrontation, aide à en prendre conscience et à le développer."],
  ["Albert Bandura", "Sentiment d'efficacité personnelle", "La croyance d'une personne en sa capacité à mener une action précise. Elle se nourrit surtout des réussites vécues, mais aussi de l'observation de pairs et des encouragements reçus."],
  ["Donald Schön", "Pratique réflexive", "La réflexion dans l'action et sur l'action. Elle inspire nos débriefings : la personne analyse sa propre façon de faire, avec le coach."],
  ["John Hattie et Helen Timperley", "Le retour qui fait apprendre", "Un retour utile dit où l'on va, où l'on en est et quelle est la suite. Il porte sur la tâche et la démarche, plutôt que sur la personne."],
];

const BIBLIO = [
  "Bandura, A. (1997). Self-efficacy: The exercise of control. New York, W. H. Freeman.",
  "Bordin, E. S. (1979). The generalizability of the psychoanalytic concept of the working alliance. Psychotherapy: Theory, Research and Practice, 16(3).",
  "Clot, Y. (1999). La fonction psychologique du travail. Paris, Presses universitaires de France.",
  "Hattie, J. et Timperley, H. (2007). The power of feedback. Review of Educational Research, 77(1).",
  "Le Bossé, Y. (2012). Sortir de l'impuissance. Québec, Ardis.",
  "Rogers, C. R. (1951). Client-centered therapy. Boston, Houghton Mifflin.",
  "Schön, D. A. (1983). The reflective practitioner. New York, Basic Books.",
  "Vermersch, P. (1994). L'entretien d'explicitation. Paris, ESF.",
];

const TEAM = [
  [I.book, "Psychologues du travail", "Titulaires du titre de psychologue. Diagnostic, explicitation de l'expérience, situations complexes, supervision des pratiques."],
  [I.compass, "Conseillers en insertion professionnelle", "Connaissance des dispositifs, des freins périphériques et des partenaires de l'emploi et de l'insertion."],
  [I.target, "Coachs certifiés", "Préparation des entretiens, simulation, débriefing, accompagnement des mobilités et des reconversions."],
  [I.users, "Animateurs d'ateliers", "Conduite de groupes, mises en situation collectives, apprentissage entre pairs."],
  [I.building, "Chargés de relation entreprises", "Connaissance des métiers, des pratiques de recrutement et du marché local de l'emploi."],
];

const FRAME = [
  ["Un code de déontologie", "Nos psychologues suivent le code de déontologie de leur profession. Toute l'équipe s'engage sur une charte commune : confidentialité, accord de la personne, absence de jugement, limites de l'intervention, orientation vers d'autres professionnels quand la situation le demande."],
  ["Une supervision des pratiques", "Les coachs analysent régulièrement leurs situations d'accompagnement avec un superviseur extérieur à l'équipe, sans jamais nommer les personnes."],
  ["Une formation continue", "Techniques d'entretien, évolutions du marché du travail, accessibilité, usage de l'IA en accompagnement : chacun suit un plan de formation revu chaque année."],
];

const SPONSOR = [
  ["Cadrage", "Nous définissons ensemble les publics, les objectifs, les modalités, le calendrier, les règles de confidentialité et les indicateurs d'ensemble qui figureront au bilan."],
  ["Comité de suivi", "Des points réguliers avec le commanditaire pour parler d'organisation, de freins observés collectivement et d'ajustements. Jamais d'une personne en particulier."],
  ["Bilan d'ensemble", "Une synthèse de l'activité et des enseignements, avec des chiffres agrégés. Aucune donnée individuelle. Quand un groupe est trop petit pour garantir l'anonymat, les chiffres sont regroupés."],
];
