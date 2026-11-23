import React from "react";
import { T, TY, W, GAP, Card, I, PageHero, Section, Notice, Link, PAD } from "./ui.jsx";
import { Reveal, stagger } from "./motion.jsx";
import { FinalBand } from "./home/FinalBand.jsx";

/* « Recherche en accompagnement » (#/solutions/recherche, menu Solutions ; ancienne page « L'IA et la recherche »,
   #/a-propos/ia-et-recherche redirigée). Deux parties :
   1. ce que disent les études sur l'entraînement aux entretiens avec un interlocuteur virtuel, leurs limites ;
   1 bis. « Une voix, pas d'avatar » (#sans-avatar) : huit raisons d'un choix de conception, chacune avec sa limite.
      C'est un choix assumé, pas un résultat prouvé : aucune étude ne compare l'avatar et la voix seule dans un outil
      comme le nôtre. Ne pas écrire qu'une voix seule intimide moins, que l'avatar n'aide pas, qu'une voix de synthèse
      vaut une voix humaine, ni avancer de chiffre (docs/redaction.md, 1.2 ter) ;
   2. ce que la recherche dit de l'apprentissage en accompagnement : entraînement, auto-observation, retour descriptif,
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
  ["Görer et Aydemir, tuteur robotique et tuteur en voix seule pour s'entraîner à mener des entretiens de recueil de besoins, prépublication arXiv 2305.00077", "https://arxiv.org/abs/2305.00077"],
  ["Zhang, He et Santos, étude de conception d'un robot d'entraînement aux entretiens, prépublication arXiv 2601.10824", "https://arxiv.org/abs/2601.10824"],
  /* À partir d'ici : sources de la section « Une voix, pas d'avatar » (numéros 7 et suivants). */
  ["Mayer, R. E. (2023). Research-based principles for designing multimedia instruction, American Psychological Association, Division 2", "https://www.unh.edu/teaching-learning-resource-hub/sites/default/files/media/2023-06/itow-research-based-principles-for-designing-multimedia-instruction-mayer.pdf"],
  ["Bailenson, J. N. (2021). Nonverbal overload: A theoretical argument for the causes of Zoom fatigue, Technology, Mind, and Behavior", "https://doi.org/10.1037/tmb0000030"],
  ["Macnamara, B. N. et Maitra, M. (2019). The role of deliberate practice in expert performance: revisiting Ericsson, Krampe et Tesch-Römer (1993), Royal Society Open Science", "https://pmc.ncbi.nlm.nih.gov/articles/PMC6731745"],
  ["Fukkink, R. G., Trienekens, N. et Kramer, L. J. C. (2011). Video feedback in education and training: Putting learning in the picture, Educational Psychology Review", "https://doi.org/10.1007/s10648-010-9144-5"],
  ["Mori, M. (1970, traduction de 2012). The uncanny valley, IEEE Robotics and Automation Magazine", "https://spectrum.ieee.org/the-uncanny-valley"],
  ["Mathur, M. B. et Reichling, D. B. (2016). Navigating a social world with robot partners: A quantitative cartography of the uncanny valley, Cognition", "https://doi.org/10.1016/j.cognition.2015.09.008"],
  ["Kätsyri, J. et coll. (2015). A review of empirical evidence on different uncanny valley hypotheses, Frontiers in Psychology", "https://doi.org/10.3389/fpsyg.2015.00390"],
  ["Thakkar, J. H. et coll. (2022). Understanding interviewees' perceptions and behaviour towards verbally and non-verbally expressive virtual interviewing agents, International Conference on Multimodal Interaction (ICMI)", "https://doi.org/10.1145/3536220.3558802"],
  ["Apec (2026). Pratiques de recrutement de cadres 2026", "https://www.banquedesterritoires.fr/sites/default/files/2026-05/210526%20-%20Etude%20Apec%20-%20Pratiques%20de%20recrutement%202026.pdf"],
  ["Insee Première n° 1953 (2023), sur l'illectronisme en 2021", "https://insee.fr/fr/statistiques/7633654"],
  ["Arcep, Arcom et ADEME (2024). Référentiel général d'écoconception de services numériques (RGESN)", "https://www.arcep.fr/actualites/actualites-et-communiques/detail/n/environnement-rgesn-170524.html"],
  ["Règlement européen sur l'IA, article 50 (transparence)", "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-50"],
  ["Règlement européen sur l'IA, article 5 (pratiques interdites)", "https://ai-act-service-desk.ec.europa.eu/en/ai-act/article-5"],
];
const FIRST = 6; // les six premières sources : entraînement avec un interlocuteur virtuel
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

/* Une voix, pas d'avatar : la raison, puis sa limite. Aucun chiffre. */
const VOICE = [
  { t: "Toute votre attention sur votre réponse", authors: "Mayer ; Bailenson",
    says: <>Pendant que vous répondez, vous n'avez pas de visage à surveiller ni d'expression à interpréter. Les travaux de Mayer sur l'apprentissage montrent qu'on apprend mieux quand on retire ce qui n'est pas utile à l'exercice <Ref n={7} />. Bailenson avance que recevoir en continu des signaux non verbaux demande un effort <Ref n={8} />.</>,
    limit: "Ces principes viennent de situations où l'on écoute ou lit pour apprendre. Les appliquer à une personne qui parle face à un avatar est une transposition, jamais testée directement. Bailenson présente lui-même ses idées comme des arguments, pas comme des résultats." },
  { t: "Une voix pour poser la question", authors: "Mayer",
    says: <>La question vous est lue à voix haute, comme au téléphone ou face à un recruteur. Dans la synthèse de Mayer, ajouter à l'écran l'image fixe de celui qui parle apporte peu : c'est la voix qui compte le plus <Ref n={7} />.</>,
    limit: "Le même document montre qu'un personnage animé, avec des gestes et un regard humains, aide à apprendre. Ce résultat va contre notre choix, et nous le disons. Il indique aussi qu'une voix humaine est préférable à une voix de synthèse : la voix de votre appareil ne vaut pas celle d'une personne." },
  { t: "Ce qui fait progresser : un retour précis, puis un nouvel essai", authors: "Hoque et coll. ; Macnamara et Maitra",
    says: <>Dans l'essai MACH, les personnes qui s'entraînaient avec l'agent et se revoyaient en vidéo n'ont pas progressé de façon nette. Seules celles qui recevaient en plus un retour détaillé ont progressé <Ref n={4} />. Une reprise récente des travaux sur la pratique délibérée confirme que la pratique compte, dans une mesure plus limitée que ne le disait l'étude d'origine <Ref n={9} />.</>,
    limit: "MACH portait sur des étudiants. Les essais VR-JIT associent un personnage virtuel et plusieurs retours : ils ne permettent pas de séparer l'effet de l'un et des autres. Aucune de ces études ne montre que le visage fait progresser, ni qu'il gêne." },
  { t: "Vous revoir, avec du recul", authors: "Fukkink et coll. ; Hoque et coll.",
    says: <>Une méta-analyse associe le retour vidéo à de meilleures compétences d'échange chez des professionnels, surtout quand on observe des points définis à l'avance <Ref n={10} />. Dans MACH, beaucoup de participants n'aimaient pas se regarder, mais ont jugé l'exercice utile <Ref n={4} />. Sans avatar à l'écran, ce que vous revoyez, c'est vous et votre réponse.</>,
    limit: "Le lien avec l'absence d'avatar est un raisonnement, pas un résultat mesuré. Se revoir ne convient pas à tout le monde : vous pouvez aussi répondre en voix seule et lire votre entretien mis par écrit." },
  { t: "Pas de visage presque humain", authors: "Mori ; Mathur et Reichling ; Kätsyri et coll.",
    says: <>Un visage de synthèse presque humain, mais pas tout à fait, peut créer un trouble : c'est l'hypothèse de la « vallée de l'étrange », formulée par Mori <Ref n={11} />. Une étude sur des visages de robots l'observe dans des jugements de sympathie et de confiance <Ref n={12} />. Nous avons préféré une voix simple, que vous pouvez couper à tout moment.</>,
    limit: <>Une revue juge ces preuves inégales : l'effet n'apparaît que dans certaines conditions <Ref n={13} />. Ces travaux portent sur des robots et des images, pas sur l'entraînement aux entretiens. Une étude va même dans l'autre sens : face à un agent expressif, des candidats ont parlé plus longtemps et se sont dits moins stressés <Ref n={14} />.</> },
  { t: "Proche des entretiens que vous passerez", authors: "Apec",
    says: <>Beaucoup de recrutements commencent par un appel. D'après l'enquête de l'Apec, la présélection par téléphone est devenue une étape courante dans les recrutements de cadres <Ref n={15} />. S'entraîner avec une voix, sans visage, prépare à ce moment où seuls comptent votre voix et ce que vous dites.</>,
    limit: "Cette enquête ne porte que sur les recrutements de cadres, et sur la présélection, pas sur tous les entretiens. Nous n'avons pas trouvé de donnée fiable pour les autres publics. Un entretien en face à face ou en visio se prépare aussi avec votre coach." },
  { t: "Un outil léger, sur le téléphone que vous avez déjà", authors: "Insee ; Arcep, Arcom et ADEME",
    says: <>La question est lue par la voix de votre appareil, sans service extérieur et sans personnage en trois dimensions à afficher. Cela compte pour les personnes peu à l'aise avec le numérique, que l'Insee décrit comme plus nombreuses parmi les revenus modestes et les personnes sans diplôme <Ref n={16} />. Le référentiel public d'écoconception demande des services utilisables sur les appareils anciens <Ref n={17} />.</>,
    limit: "Nous n'avons trouvé aucune mesure publique qui compare le poids ou la consommation d'un avatar et d'une voix lue par l'appareil : nous n'avançons aucun chiffre. La première fois, l'outil demande tout de même un téléchargement, pour la mise par écrit." },
  { t: "Une IA qui dit ce qu'elle est", authors: "Règlement européen sur l'IA",
    says: <>La Répét' ne se fait pas passer pour un recruteur : vous savez à tout moment que la question est lue par une voix de synthèse. Le règlement européen sur l'IA demande d'informer les personnes qu'elles échangent avec une IA <Ref n={18} />. Il interdit aussi de déduire les émotions d'une personne au travail <Ref n={19} />. Un visage qui sourit ou fronce les sourcils pourrait laisser croire que l'outil lit vos émotions. Nous refusons de le faire.</>,
    limit: "Un avatar n'est pas interdit, même quand il réagit sans rien analyser. Notre raison tient à la confusion qu'un tel visage peut créer, pas à la loi. Ceci n'est pas un avis juridique." },
];

const THEMES = [
  { t: "S'entraîner, mais avec un but", authors: "Ericsson et coll.",
    says: "Les travaux sur la pratique délibérée montrent que refaire ne suffit pas : on progresse quand chaque essai vise un point précis, qu'il reçoit un retour et qu'on recommence en tenant compte de ce retour. L'expertise se construit par ces boucles, plus que par le simple volume d'essais.",
    limit: "Ces travaux portent sur des domaines comme la musique ou le sport, avec un entraîneur. S'entraîner sans retour peut installer une habitude autant que la corriger." },
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

/* Liste de thèmes : ce que disent les travaux, puis leur limite. */
function Themes({ items }) {
  return (
    <ol style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: GAP.grid }}>
      {items.map((x, i) => (
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
  );
}

export default function Research({ go, openSpace }) {
  return (
    <main>
      <PageHero eyebrow="Solutions" title="Recherche en accompagnement" lead="Ce que disent les études sur l'entraînement aux entretiens et sur l'apprentissage en accompagnement, ce qu'elles ne disent pas, et les choix que nous en tirons.">
        <p style={{ ...TY.body, color: T.body, margin: 0 }}>Ce que fait l'assistant : <Link href="#/solutions/usage-de-l-ia">usage de l'IA</Link>. Comment ces travaux se traduisent dans l'outil : <Link href="#/solutions/methode">méthode</Link>.</p>
      </PageHero>
      <div className="rs-pad" style={{ maxWidth: W.page, margin: "0 auto", padding: PAD.wrap }}>
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
                Deux prépublications récentes éclairent cette question, sans la trancher. La première compare un robot et un agent en voix seule, auprès d'étudiants qui s'entraînent à mener des entretiens de recueil de besoins : le robot donne un meilleur gain d'apprentissage, la voix seule est jugée plus engageante et plus simple à utiliser <Ref n={5} />. La seconde est une étude de conception d'un robot d'entraînement aux entretiens, menée avec un petit groupe : elle décrit la difficulté à tenir ensemble un cadre rassurant et un retour précis <Ref n={6} />.
              </p>
              <p style={{ ...TY.bodyLg, color: T.body, margin: 0 }}>Aucune de ces études ne mesure si une voix seule intimide moins qu'un visage, et aucune ne compare un avatar et une voix seule pour l'entretien d'embauche. Nous avons choisi une voix, sans avatar : la question est lue à voix haute, sans visage qui observe, et vous pouvez couper le son à tout moment. Les raisons de ce choix, et leurs limites, sont détaillées juste en dessous.</p>
            </Reveal>
          </div>
        </Section>

        <Section id="sans-avatar" eyebrow="Notre choix" title="Une voix, pas d'avatar : un choix assumé"
          sub="Nous ne proposons pas d'avatar, seulement une voix qui lit la question. Vous vous concentrez sur l'exercice, vous vous observez, vous recommencez. Aucune étude ne compare un avatar et une voix seule dans un outil comme le nôtre : c'est un choix de conception, pas un résultat prouvé. Voici nos huit raisons, chacune avec sa limite.">
          <Themes items={VOICE} />
          <Reveal><p style={{ ...TY.body, color: T.body, margin: 0, marginTop: GAP.grid, maxWidth: W.read }}>
            Si vous préférez sentir une présence, vous pouvez afficher une vignette d'interlocuteur dans votre espace : une petite fenêtre neutre, caméra coupée, comme en visio. Elle ne montre ni photo ni avatar. La relation humaine, elle, se construit avec votre coach : il relit ce que vous choisissez d'envoyer, et vous regardez ensemble ce qui a changé d'un entretien à l'autre. Son rôle est décrit sur la page <Link href="#/solutions/methode">Méthode</Link>.
          </p></Reveal>
        </Section>

        <Section eyebrow="Apprendre en accompagnement" title="Ce que la recherche dit de l'entraînement, du retour et de la réflexion"
          sub="Au-delà des outils, des décennies de travaux en psychologie et en sciences de l'éducation éclairent la façon dont on apprend un savoir-faire comme l'entretien. Pour chaque thème : ce qu'ils établissent, et leur limite.">
          <Themes items={THEMES} />
          <Reveal><p style={{ ...TY.body, color: T.body, margin: 0, marginTop: GAP.grid, maxWidth: W.read }}>
            Les auteurs qui fondent nos pratiques d'accompagnement sont présentés sur la page <Link href="#/a-propos">À propos</Link>. La façon dont l'outil s'appuie sur ces travaux, de l'analyse sans note au rôle du coach, est détaillée sur la page <Link href="#/solutions/methode">Méthode</Link>.
          </p></Reveal>
        </Section>

        <Section eyebrow="Précautions" title="Limites et principes de conception">
          <div className="rs-g2">
            <Reveal style={{ height: "100%" }}><Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Ce que la recherche ne dit pas</h3>
              <ul style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: PAD.list, display: "grid", gap: 8 }}>
                <Reveal as="li">Aucun des travaux cités n'a évalué La Répét'. Ils portent sur d'autres outils ou d'autres situations, souvent dans d'autres pays.</Reveal>
                <Reveal as="li" delay={70}>Leurs résultats ne se transposent pas automatiquement à notre public ni à nos repères.</Reveal>
                <Reveal as="li" delay={140}>Les repères de l'assistant sont des habitudes d'entretien en France. Ils ne conviennent pas à tout le monde.</Reveal>
              </ul>
            </Card></Reveal>
            <Reveal delay={70} style={{ height: "100%" }}><Card style={{ height: "100%", display: "grid", gap: 12, alignContent: "start" }}>
              <h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Nos principes</h3>
              <ul style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: PAD.list, display: "grid", gap: 8 }}>
                <Reveal as="li">Pas d'inférence émotionnelle : le règlement européen sur l'IA l'interdit sur le lieu de travail et dans les établissements d'enseignement, et nous l'excluons partout.</Reveal>
                <Reveal as="li" delay={70}>L'assistant analyse et décrit ce qu'il observe, sans noter. Un humain, votre coach, garde la main.</Reveal>
                <Reveal as="li" delay={140}>La vidéo reste sur votre appareil tant que vous ne l'envoyez pas.</Reveal>
              </ul>
            </Card></Reveal>
          </div>
        </Section>

        <Section eyebrow="Pour les commanditaires" title="Rendre compte sans surveiller">
          <Reveal><p style={{ ...TY.bodyLg, color: T.body, margin: 0, maxWidth: W.read }}>
            L'espace coach donne des chiffres d'ensemble, jamais une mesure individuelle : entretiens à relire, rapports envoyés, part des personnes qui se réentraînent, délai moyen de relecture. Avec les retours des coachs et des personnes accompagnées, ils nous permettent d'ajuster l'accompagnement et d'en rendre compte à nos commanditaires, sans surveiller personne.
          </p></Reveal>
        </Section>

        <Section eyebrow="Sources" title="Pour aller plus loin">
          <div style={{ display: "grid", gap: GAP.block, maxWidth: W.read }}>
            <div style={{ display: "grid", gap: 12 }}>
              <Reveal><h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Entraînement aux entretiens avec un interlocuteur virtuel</h3></Reveal>
              <ol className="rp-sources" style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: PAD.list, display: "grid", gap: 8 }}>
                {SOURCES.slice(0, FIRST).map(([t, u], i) => <Reveal as="li" key={u} delay={stagger(i, 4)}><a href={u} target="_blank" rel="noopener" className="rp-link" style={{ ...TY.link, color: T.primary, overflowWrap: "anywhere" }}>{t}</a> <span className="rp-sr">(nouvel onglet)</span></Reveal>)}
              </ol>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <Reveal><h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Une voix, pas d'avatar</h3></Reveal>
              <ol start={FIRST + 1} className="rp-sources" style={{ ...TY.body, color: T.body, margin: 0, paddingLeft: PAD.list, display: "grid", gap: 8 }}>
                {SOURCES.slice(FIRST).map(([t, u], i) => <Reveal as="li" key={u} delay={stagger(i, 4)}><a href={u} target="_blank" rel="noopener" className="rp-link" style={{ ...TY.link, color: T.primary, overflowWrap: "anywhere" }}>{t}</a> <span className="rp-sr">(nouvel onglet)</span></Reveal>)}
              </ol>
            </div>
            <div style={{ display: "grid", gap: 12 }}>
              <Reveal><h3 style={{ ...TY.h3, color: T.navy, margin: 0 }}>Apprentissage et accompagnement</h3></Reveal>
              <ul className="rp-sources" style={{ ...TY.small, color: T.body, margin: 0, paddingLeft: PAD.list, display: "grid", gap: 8 }}>
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
