import React from "react";
import { T, TY, W, GAP, Card, I, PageHero, Section, Notice, Link } from "./ui.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* « Recherche en accompagnement » (#/solutions/recherche, menu Solutions ; ancienne page « L'IA et la recherche »,
   #/a-propos/ia-et-recherche redirigée) : ce que disent les études sur l'entraînement aux entretiens avec un
   interlocuteur virtuel, leurs limites, et les choix de conception qui en découlent. Ce que fait l'assistant est
   détaillé dans « Usage de l'IA » (src/AiUsage.jsx).
   Règle : ne citer que les sources listées ci-dessous, sans leur faire dire plus qu'elles ne disent, sans chiffre. */

const SOURCES = [
  ["Essai randomisé sur l'entraînement aux entretiens en réalité virtuelle (VR-JIT), Psychiatric Services", "https://psychiatryonline.org/doi/10.1176/appi.ps.202100516"],
  ["Étude sur l'entraînement VR-JIT, Journal of Experimental Criminology (2025)", "https://link.springer.com/article/10.1007/s11292-025-09684-7"],
  ["Étude sur l'entraînement VR-JIT, notice PubMed 38881730", "https://pubmed.ncbi.nlm.nih.gov/38881730/"],
  ["MACH : My Automated Conversation coacH, MIT Media Lab (Hoque et coll., 2013)", "https://www.media.mit.edu/publications/mach-my-automated-conversation-coach/"],
  ["Prépublication arXiv 2305.00077", "https://arxiv.org/pdf/2305.00077"],
  ["Prépublication arXiv 2601.10824", "https://arxiv.org/html/2601.10824v1"],
];
const Ref = ({ n }) => <a href={SOURCES[n - 1][1]} target="_blank" rel="noopener" className="rp-link" style={{ ...TY.link }} aria-label={`Source ${n} : ${SOURCES[n - 1][0]} (nouvel onglet)`}>[{n}]</a>;

export default function Research({ go, openSpace }) {
  return (
    <main>
      <PageHero eyebrow="Solutions" title="Recherche en accompagnement" lead="Ce que disent les études sur l'entraînement aux entretiens avec un interlocuteur virtuel, ce qu'elles ne disent pas, et les choix de conception que nous en tirons.">
        <p style={{ ...TY.body, color: T.body, margin: 0 }}>Ce que fait l'assistant, et ce qu'il ne fait pas : <Link href="#/solutions/usage-de-l-ia">usage de l'IA</Link>.</p>
      </PageHero>
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: "0 24px" }}>
        <Section first eyebrow="Ce que disent les études" title="S'entraîner avec un interlocuteur virtuel" sub="Plusieurs équipes ont étudié l'entraînement aux entretiens d'embauche avec un recruteur simulé. Voici ce que leurs travaux permettent de dire, et ce qu'ils ne permettent pas de dire.">
          <div style={{ display: "grid", gap: GAP.grid, maxWidth: W.read }}>
            <article style={{ display: "grid", gap: 8 }}>
              <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Les essais VR-JIT</h3>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>
                Des essais randomisés menés par Smith et ses collègues ont testé un entraînement aux entretiens avec un recruteur virtuel (VR-JIT), auprès de personnes avec des troubles psychiques, de personnes autistes et de personnes sortant de prison <Ref n={1} /> <Ref n={2} /> <Ref n={3} />. Les participants entraînés ont montré de meilleures compétences d'entretien, et un meilleur accès à l'emploi.
              </p>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>À garder en tête : les échantillons sont petits, et ces essais viennent en grande partie de la même équipe de recherche. Ces résultats sont encourageants, pas définitifs.</p>
            </article>
            <article style={{ display: "grid", gap: 8 }}>
              <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>MACH, au MIT Media Lab</h3>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>
                En 2013, Hoque et ses collègues ont présenté MACH, un agent conversationnel pour s'entraîner aux entretiens <Ref n={4} />. Des conseillers, qui ne savaient pas qui avait été entraîné, ont jugé que les participants avaient progressé.
              </p>
              <Notice tone="ai" icon={I.shield}>MACH analysait les expressions du visage. La Répét' refuse de le faire : l'assistant ne lit jamais les expressions et ne cherche pas à deviner les émotions.</Notice>
            </article>
            <article style={{ display: "grid", gap: 8 }}>
              <h3 style={{ ...TY.h2, color: T.navy, margin: 0 }}>Présence sociale ou pression ?</h3>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>
                Des travaux récents discutent un compromis <Ref n={5} /> <Ref n={6} />. Un interlocuteur incarné rapproche de la situation réelle. Une voix seule intimide moins.
              </p>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>C'est ce qui nous a fait choisir un recruteur oral, sans visage : la question est lue à voix haute, pour se rapprocher d'un vrai entretien, sans ajouter un visage qui observe. Vous pouvez couper le son à tout moment.</p>
            </article>
          </div>
        </Section>

        <Section eyebrow="Précautions" title="Limites et principes de conception">
          <div className="rs-g2">
            <Card style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Ce que la recherche ne dit pas</h3>
              <ul style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <li>Les études portent sur d'autres outils que La Répét', dans d'autres pays.</li>
                <li>Leurs résultats ne se transposent pas automatiquement à notre public ni à nos repères.</li>
                <li>Les repères de l'assistant sont des habitudes d'entretien en France. Ils ne conviennent pas à tout le monde.</li>
              </ul>
            </Card>
            <Card style={{ display: "grid", gap: 12, alignContent: "start" }}>
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Nos principes</h3>
              <ul style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: 20, display: "grid", gap: 8 }}>
                <li>Pas d'inférence émotionnelle : le règlement européen sur l'IA l'interdit sur le lieu de travail et dans les établissements d'enseignement, et nous l'excluons partout.</li>
                <li>L'assistant décrit, il ne note pas. Un humain, votre coach, garde la main.</li>
                <li>La vidéo reste sur votre appareil tant que vous ne l'envoyez pas.</li>
              </ul>
            </Card>
          </div>
        </Section>

        <Section eyebrow="Pour les commanditaires" title="Rendre compte sans surveiller">
          <p style={{ ...TY.bodyLg, color: T.body, margin: 0, maxWidth: W.read }}>
            L'espace coach donne des chiffres d'ensemble, jamais une mesure individuelle : réponses à relire, rapports envoyés, part des personnes qui se réentraînent, délai moyen de relecture. Avec les retours des coachs et des personnes accompagnées, ils nous permettent d'ajuster l'accompagnement et d'en rendre compte à nos commanditaires, sans surveiller personne.
          </p>
        </Section>

        <Section eyebrow="Sources" title="Pour aller plus loin">
          <ol className="rp-sources" style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: 24, display: "grid", gap: 8, maxWidth: W.read }}>
            {SOURCES.map(([t, u]) => <li key={u}><a href={u} target="_blank" rel="noopener" className="rp-link" style={{ ...TY.link, color: T.primary, overflowWrap: "anywhere" }}>{t}</a> <span className="rp-sr">(nouvel onglet)</span></li>)}
          </ol>
        </Section>

        <FinalBand openSpace={openSpace} go={go} />
      </div>
    </main>
  );
}
