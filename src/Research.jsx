import React from "react";
import { T, TY, W, GAP, Card, I, PageHero, Section, Notice, Link } from "./ui.jsx";
import { Reveal, stagger } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* « Recherche en accompagnement » (#/solutions/recherche, menu Solutions ; ancienne page « L'IA et la recherche »,
   #/a-propos/ia-et-recherche redirigée). Deux parties :
   1. ce que disent les études sur l'entraînement aux entretiens avec un interlocuteur virtuel, leurs limites ;
   2. ce que la recherche dit de l'apprentissage en accompagnement : répétition, auto-observation, retour descriptif,
      sentiment d'efficacité personnelle, pratique réflexive et transfert.
   Répartition entre les pages, pour éviter les redites : les auteurs de référence de l'organisme sont présentés sur
   À propos (src/About.jsx, #references) ; leur traduction dans l'outil sur Méthode (src/Methode.jsx) ; ici, ce que
   les études permettent d'affirmer, et leurs limites. Ce que fait l'assistant : « Usage de l'IA » (src/AiUsage.jsx).
   Règle : ne citer que les sources listées ci-dessous, sans leur faire dire plus qu'elles ne disent, sans chiffre,
   sans citation entre guillemets. Aucun de ces travaux n'a évalué La Répét'. */

const SOURCES = [
  ["Essai randomisé sur l'entraînement aux entretiens en réalité virtuelle (VR-JIT), Psychiatric Services", "https://psychiatryonline.org/doi/10.1176/appi.ps.202100516"],
  ["Étude sur l'entraînement VR-JIT, Journal of Experimental Criminology (2025)", "https://link.springer.com/article/10.1007/s11292-025-09684-7"],
  ["Étude sur l'entraînement VR-JIT, notice PubMed 38881730", "https://pubmed.ncbi.nlm.nih.gov/38881730/"],
  ["MACH : My Automated Conversation coacH, MIT Media Lab (Hoque et coll., 2013)", "https://www.media.mit.edu/publications/mach-my-automated-conversation-coach/"],
  ["Prépublication arXiv 2305.00077", "https://arxiv.org/pdf/2305.00077"],
  ["Prépublication arXiv 2601.10824", "https://arxiv.org/html/2601.10824v1"],
];
const Ref = ({ n }) => <a href={SOURCES[n - 1][1]} target="_blank" rel="noopener" className="rp-link" style={{ ...TY.link }} aria-label={`Source ${n} : ${SOURCES[n - 1][0]} (nouvel onglet)`}>[{n}]</a>;

/* Travaux sur l'apprentissage et l'accompagnement (références bibliographiques, sans lien). */
const WORKS = [
  "Baldwin, T. T. et Ford, J. K. (1988). Transfer of training: A review and directions for future research. Personnel Psychology, 41(1).",
  "Bandura, A. (1997). Self-efficacy: The exercise of control. New York, W. H. Freeman.",
  "Clot, Y., Faïta, D., Fernandez, G. et Scheller, L. (2000). Entretiens en autoconfrontation croisée : une méthode en clinique de l'activité. Pistes, 2(1).",
  "Dowrick, P. W. (1999). A review of self modeling and related interventions. Applied and Preventive Psychology, 8(1).",
  "Ericsson, K. A., Krampe, R. T. et Tesch-Römer, C. (1993). The role of deliberate practice in the acquisition of expert performance. Psychological Review, 100(3).",
  "Hattie, J. et Timperley, H. (2007). The power of feedback. Review of Educational Research, 77(1).",
  "Kanfer, R., Wanberg, C. R. et Kantrowitz, T. M. (2001). Job search and employment: A personality-motivational analysis and meta-analytic review. Journal of Applied Psychology, 86(5).",
  "Kluger, A. N. et DeNisi, A. (1996). The effects of feedback interventions on performance. Psychological Bulletin, 119(2).",
  "Kolb, D. A. (1984). Experiential learning. Englewood Cliffs, Prentice Hall.",
  "Liu, S., Huang, J. L. et Wang, M. (2014). Effectiveness of job search interventions: A meta-analytic review. Psychological Bulletin, 140(4).",
  "Schön, D. A. (1983). The reflective practitioner. New York, Basic Books.",
  "Shute, V. J. (2008). Focus on formative feedback. Review of Educational Research, 78(1).",
];

const THEMES = [
  { t: "Répéter, mais avec un but", authors: "Ericsson et coll.",
    says: "Les travaux sur la pratique délibérée montrent que répéter ne suffit pas : on progresse quand chaque essai vise un point précis, qu'il reçoit un retour et qu'on recommence en tenant compte de ce retour. L'expertise se construit par ces boucles, plus que par le simple volume d'essais.",
    limit: "Ces travaux portent sur des domaines comme la musique ou le sport, avec un entraîneur. Répéter sans retour peut installer une habitude autant que la corriger." },
  { t: "Se revoir pour voir ce qu'on fait", authors: "Dowrick ; Clot et coll.",
    says: "Les interventions par auto-observation vidéo ont fait l'objet de nombreuses études, en éducation comme en rééducation. En clinique de l'activité, l'autoconfrontation fait commenter ses propres traces de travail : l'écart entre ce qu'on pense faire et ce qu'on fait devient un objet d'analyse.",
    limit: "Se revoir sans repère peut ramener l'attention sur soi plutôt que sur la tâche. L'auto-observation gagne à être guidée, puis reprise avec un tiers." },
  { t: "Un retour qui porte sur la tâche", authors: "Kluger et DeNisi ; Hattie et Timperley ; Shute",
    says: "La méta-analyse de Kluger et DeNisi montre que le feedback améliore en moyenne la performance, mais qu'il la dégrade dans une part non négligeable des cas, surtout quand il oriente l'attention vers la personne plutôt que vers la tâche. Les synthèses de Hattie et Timperley, puis de Shute, vont dans le même sens : un retour utile est précis, situé, et dit quoi faire ensuite.",
    limit: "Ces travaux portent surtout sur l'école et l'entreprise. Ils éclairent nos choix sans les valider directement pour la préparation aux entretiens." },
  { t: "Le sentiment d'efficacité personnelle", authors: "Bandura ; Kanfer et coll. ; Liu et coll.",
    says: "Pour Bandura, le sentiment d'efficacité personnelle est la croyance en sa capacité à mener une action précise. Il se nourrit de quatre sources : les réussites vécues, la plus forte ; l'observation de personnes comparables ; les encouragements ; la façon dont on interprète ses réactions physiques. Dans la recherche d'emploi, la méta-analyse de Kanfer, Wanberg et Kantrowitz relie ce sentiment à l'intensité des démarches. Celle de Liu, Huang et Wang associe l'efficacité des programmes d'aide à plusieurs composantes : apprendre les techniques de recherche, travailler sa présentation de soi, renforcer le sentiment d'efficacité, se fixer des objectifs, s'appuyer sur un soutien.",
    limit: "Ce sentiment porte sur une tâche précise : il ne se généralise pas d'un coup. Les résultats sur l'emploi portent sur des programmes complets, conduits par des professionnels, jamais sur un outil utilisé seul." },
  { t: "Réfléchir sur l'action, puis transférer", authors: "Schön ; Kolb ; Baldwin et Ford",
    says: "Schön décrit la réflexion dans l'action et sur l'action. Kolb fait de l'apprentissage un cycle : vivre une expérience, l'observer, en tirer des idées, les essayer à nouveau. Baldwin et Ford montrent que le transfert d'une formation vers la situation réelle dépend de la personne, de la conception de la formation et de l'environnement.",
    limit: "Le transfert n'est jamais automatique. C'est pourquoi le débriefing et la préparation de l'entretien réel restent des temps menés avec le coach." },
];

export default function Research({ go, openSpace }) {
  return (
    <main>
      <PageHero eyebrow="Solutions" title="Recherche en accompagnement" lead="Ce que disent les études sur l'entraînement aux entretiens et sur l'apprentissage en accompagnement, ce qu'elles ne disent pas, et les choix que nous en tirons.">
        <p style={{ ...TY.body, color: T.body, margin: 0 }}>Ce que fait l'assistant : <Link href="#/solutions/usage-de-l-ia">usage de l'IA</Link>. Comment ces travaux se traduisent dans l'outil : <Link href="#/solutions/methode">méthode</Link>.</p>
      </PageHero>
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Section first eyebrow="Ce que disent les études" title="S'entraîner avec un interlocuteur virtuel" sub="Plusieurs équipes ont étudié l'entraînement aux entretiens d'embauche avec un recruteur simulé. Voici ce que leurs travaux permettent de dire, et ce qu'ils ne permettent pas de dire.">
          <div style={{ display: "grid", gap: GAP.grid, maxWidth: W.read }}>
            <Reveal style={{ display: "grid", gap: 8 }}>
              <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Les essais VR-JIT</h3>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>
                Des essais randomisés menés par Smith et ses collègues ont testé un entraînement aux entretiens avec un recruteur virtuel (VR-JIT), auprès de personnes avec des troubles psychiques, de personnes autistes et de personnes sortant de prison <Ref n={1} /> <Ref n={2} /> <Ref n={3} />. Les participants entraînés ont montré de meilleures compétences d'entretien, et un meilleur accès à l'emploi.
              </p>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>À garder en tête : les échantillons sont petits, et ces essais viennent en grande partie de la même équipe de recherche. Ces résultats sont encourageants, pas définitifs.</p>
            </Reveal>
            <Reveal style={{ display: "grid", gap: 8 }}>
              <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>MACH, au MIT Media Lab</h3>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>
                En 2013, Hoque et ses collègues ont présenté MACH, un agent conversationnel pour s'entraîner aux entretiens <Ref n={4} />. Des conseillers, qui ne savaient pas qui avait été entraîné, ont jugé que les participants avaient progressé.
              </p>
              <Notice tone="ai" icon={I.shield}>MACH analysait les expressions du visage. La Répét' refuse de le faire : l'assistant ne lit jamais les expressions et ne cherche pas à deviner les émotions.</Notice>
            </Reveal>
            <Reveal style={{ display: "grid", gap: 8 }}>
              <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Présence sociale ou pression ?</h3>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>
                Des travaux récents discutent un compromis <Ref n={5} /> <Ref n={6} />. Un interlocuteur incarné rapproche de la situation réelle. Une voix seule intimide moins.
              </p>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>C'est ce qui nous a fait choisir un recruteur oral, sans visage : la question est lue à voix haute, pour se rapprocher d'un vrai entretien, sans ajouter un visage qui observe. Vous pouvez couper le son à tout moment.</p>
            </Reveal>
          </div>
        </Section>

        <Section eyebrow="Apprendre en accompagnement" title="Ce que la recherche dit de la répétition, du retour et de la réflexion"
          sub="Au-delà des outils, des décennies de travaux en psychologie et en sciences de l'éducation éclairent la façon dont on apprend un savoir-faire comme l'entretien. Pour chaque thème : ce qu'ils établissent, et leur limite.">
          <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: GAP.grid }}>
            {THEMES.map((x, i) => (
              <li key={x.t}>
                <Reveal>
                  <Card style={{ display: "grid", gap: 16 }}>
                    <div style={{ display: "grid", gap: 4 }}>
                      <span style={{ ...TY.overline, color: T.muted }}>{x.authors}</span>
                      <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>{x.t}</h3>
                    </div>
                    <div className="rs-split" style={{ alignItems: "start", gap: GAP.grid }}>
                      <Reveal><p style={{ ...TY.body, color: T.body, margin: 0 }}>{x.says}</p></Reveal>
                      <Reveal delay={70} style={{ display: "grid", gap: 4, borderLeft: `3px solid ${T.line}`, paddingLeft: 16 }}>
                        <span style={{ ...TY.label, color: T.navy }}>Limite</span>
                        <p style={{ ...TY.body, color: T.body, margin: 0 }}>{x.limit}</p>
                      </Reveal>
                    </div>
                  </Card>
                </Reveal>
              </li>
            ))}
          </ol>
          <Reveal><p style={{ ...TY.body, color: T.body, margin: 0, marginTop: GAP.grid, maxWidth: W.read }}>
            Les auteurs qui fondent nos pratiques d'accompagnement sont présentés sur la page <Link href="#/a-propos">À propos</Link>. La façon dont l'outil s'appuie sur ces travaux, du retour descriptif au rôle du coach, est détaillée sur la page <Link href="#/solutions/methode">Méthode</Link>.
          </p></Reveal>
        </Section>

        <Section eyebrow="Précautions" title="Limites et principes de conception">
          <div className="rs-g2">
            <Reveal style={{ height: "100%" }}><Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Ce que la recherche ne dit pas</h3>
              <ul style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <Reveal as="li">Aucun des travaux cités n'a évalué La Répét'. Ils portent sur d'autres outils ou d'autres situations, souvent dans d'autres pays.</Reveal>
                <Reveal as="li" delay={70}>Leurs résultats ne se transposent pas automatiquement à notre public ni à nos repères.</Reveal>
                <Reveal as="li" delay={140}>Les repères de l'assistant sont des habitudes d'entretien en France. Ils ne conviennent pas à tout le monde.</Reveal>
              </ul>
            </Card></Reveal>
            <Reveal delay={70} style={{ height: "100%" }}><Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Nos principes</h3>
              <ul style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <Reveal as="li">Pas d'inférence émotionnelle : le règlement européen sur l'IA l'interdit sur le lieu de travail et dans les établissements d'enseignement, et nous l'excluons partout.</Reveal>
                <Reveal as="li" delay={70}>L'assistant décrit, il ne note pas. Un humain, votre coach, garde la main.</Reveal>
                <Reveal as="li" delay={140}>La vidéo reste sur votre appareil tant que vous ne l'envoyez pas.</Reveal>
              </ul>
            </Card></Reveal>
          </div>
        </Section>

        <Section eyebrow="Pour les commanditaires" title="Rendre compte sans surveiller">
          <Reveal><p style={{ ...TY.bodyLg, color: T.body, margin: 0, maxWidth: W.read }}>
            L'espace coach donne des chiffres d'ensemble, jamais une mesure individuelle : réponses à relire, rapports envoyés, part des personnes qui se réentraînent, délai moyen de relecture. Avec les retours des coachs et des personnes accompagnées, ils nous permettent d'ajuster l'accompagnement et d'en rendre compte à nos commanditaires, sans surveiller personne.
          </p></Reveal>
        </Section>

        <Section eyebrow="Sources" title="Pour aller plus loin">
          <div style={{ display: "grid", gap: GAP.block, maxWidth: W.read }}>
            <div style={{ display: "grid", gap: 12 }}>
              <Reveal><h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Entraînement aux entretiens avec un interlocuteur virtuel</h3></Reveal>
              <ol className="rp-sources" style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: 24, display: "grid", gap: 8 }}>
                {SOURCES.map(([t, u], i) => <Reveal as="li" key={u} delay={stagger(i, 4)}><a href={u} target="_blank" rel="noopener" className="rp-link" style={{ ...TY.link, color: T.primary, overflowWrap: "anywhere" }}>{t}</a> <span className="rp-sr">(nouvel onglet)</span></Reveal>)}
              </ol>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <Reveal><h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Apprentissage et accompagnement</h3></Reveal>
              <ul className="rp-sources" style={{ ...TY.small, color: T.body, margin: 0, paddingLeft: 24, display: "grid", gap: 8 }}>
                {WORKS.map((w, i) => <Reveal as="li" key={w} delay={stagger(i, 4)}>{w}</Reveal>)}
              </ul>
            </div>
          </div>
        </Section>

        <FinalBand openSpace={openSpace} go={go} />
      </div>
    </main>
  );
}
