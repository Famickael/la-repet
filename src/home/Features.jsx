import React from "react";
import { T, HL, RAD, SH, Tag, Card, I, Icon, TY, Section, IconTile, PAD, GAP } from "../ui.jsx";
import { ON, GRAD_DOOR_BLUE, GRAD_DOOR_GREEN, GRAD_DOOR_VIOLET } from "../tokens.js";
import { spaceHash } from "../app/router.js";
import { useReducedMotion, useInView, Reveal, stagger } from "../motion.jsx";
import { Pin } from "./shared.jsx";

/* ─── Cartes de fonctionnalités : micro-animation en boucle, seulement quand la carte est visible ─── */
/* Chaque carte apparaît au défilement (Reveal, décalée dans sa rangée), puis sa micro-animation joue tant qu'elle est visible. */
export function FCard({ title, text, children, i = 0 }) {
  const reduced = useReducedMotion();
  const [ref, v] = useInView({ once: false, threshold: 0.35, rootMargin: "0px" });
  return (
    <Reveal className="rs-fcard-w" delay={stagger(i)} style={{ display: "grid" }}>
      <div ref={ref} className={`rs-fcard ${v && !reduced ? "play" : ""}`}>
        <div className="rs-fvis" aria-hidden>{children}</div>
        <h3 style={{ ...TY.h3, color: T.navy, margin: "4px 8px 0" }}>{title}</h3>
        <p style={{ ...TY.body, color: T.body, margin: "0 8px" }}>{text}</p>
      </div>
    </Reveal>
  );
}

export const miniCard = { background: T.surface, borderRadius: RAD.sm, padding: "12px 16px", boxShadow: SH.xs };

export function Features() {
  return (
    <Section eyebrow="Au fil de l'entraînement" title="Tout ce qu'il faut pour vous entraîner à votre rythme" sub="Des outils simples, sans avatar, pour vous entraîner de votre côté et garder la main sur ce que vous envoyez.">
      <div className="rs-fcards" tabIndex={0} role="group" aria-label="Fonctions, liste à faire défiler">
        <FCard i={0} title="Un échauffement sans enregistrement" text="Des phrases à lire à voix haute pour se mettre en route. Rien n'est enregistré ni analysé.">
          <div style={{ ...TY.overline, color: T.muted, marginBottom: 8 }}>Échauffement · lisez à voix haute</div>
          <div className="rs-cyc" style={{ display: "grid" }}>
            {["« Je vous remercie de me recevoir. »", "« J'ai travaillé deux ans en boutique. »", "« Je suis disponible dès lundi. »"].map(t => (
              <div key={t} style={{ ...miniCard, ...TY.h3, color: T.navy }}>{t}</div>
            ))}
          </div>
        </FCard>
        <FCard i={1} title="Des questions adaptées au métier" text="Choisissez le métier visé : les questions s'y adaptent. Vous pouvez aussi ajouter les vôtres.">
          <div className="rs-jobs" style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
            {["agent d'accueil", "serveur(se)", "aide-soignant(e)"].map(j => <span key={j} style={{ ...TY.tag, padding: "8px 12px", borderRadius: RAD.pill, border: `1.5px solid ${T.line}`, background: T.surface, color: T.body }}>{j}</span>)}
          </div>
          <div className="rs-cyc" style={{ display: "grid" }}>
            {["« Comment accueillez-vous une personne mécontente ? »", "« Comment gérez-vous un service chargé ? »", "« Comment réagissez-vous face à une urgence ? »"].map(t => (
              <div key={t} style={{ ...miniCard, ...TY.label, color: T.navy }}>{t}</div>
            ))}
          </div>
        </FCard>
        <FCard i={2} title="Caméra ou voix seule" text="Répondez en vidéo, ou en voix seule si vous préférez. 3 minutes au plus par réponse.">
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
            <span style={{ display: "inline-flex", alignItems: "center", gap: 8, background: T.surface, borderRadius: RAD.pill, padding: "4px 12px", boxShadow: SH.xs }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, animation: "blink 1.2s infinite" }} />
              <span style={{ ...TY.time, color: T.navy }}>0:4<span className="rs-digits"><span>0<br />1<br />2<br />3<br />4<br />5<br />6<br />7<br />8<br />9</span></span></span>
            </span>
            <Tag tone="muted" icon={I.mic}>Voix seule</Tag>
          </div>
          <div className="rs-wave" style={{ marginTop: GAP.grid, justifyContent: "center" }}>
            {Array.from({ length: 22 }, (_, i) => <i key={i} style={{ animationDelay: `${(i * 137) % 900}ms`, height: `${30 + ((i * 53) % 60)}%` }} />)}
          </div>
        </FCard>
        <FCard i={3} title="Votre entretien mis par écrit" text="Votre entretien est mis par écrit sur votre appareil. Les passages utiles sont repérés, sans jugement.">
          <p style={{ ...TY.small, color: T.navy, margin: 0 }}>
            Bonjour, je m'appelle Sami. <span className="rs-fhl h2" style={{ backgroundImage: HL.ai }}>Euh</span>, j'ai <span className="rs-fhl" style={{ backgroundImage: HL.appui }}>géré la caisse d'une supérette pendant trois ans</span>.
          </p>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
            <span className="rs-ftag"><Tag tone="appui" icon={I.check}>Exemple concret</Tag></span>
            <span className="rs-ftag t2"><Tag tone="ai" icon={I.search}>Petit mot répété</Tag></span>
          </div>
        </FCard>
        <FCard i={4} title="Un assistant pour vos questions" text="Une hésitation sur un retour ou sur une question difficile ? L'assistant répond, votre coach complète.">
          <div style={{ display: "grid", gap: 8 }}>
            <div style={{ ...miniCard, justifySelf: "end", background: T.primaryBg, ...TY.small, color: T.navy, maxWidth: "85%" }}>Comment parler d'un trou dans mon CV ?</div>
            <div style={{ position: "relative", ...miniCard, background: T.violetBg, ...TY.small, color: T.navy, maxWidth: "90%", minHeight: 44 }}>
              <span className="rs-typing rp-dots" style={{ color: T.violet }}><i /><i /><i /></span>
              <span className="rs-answer" style={{ display: "block" }}>Restez simple et honnête, puis parlez de ce que vous avez fait pendant cette période.</span>
            </div>
          </div>
        </FCard>
        <FCard i={5} title="Un retour à lire ou à regarder" text="Découvrez votre retour comme vous le préférez : en lisant, ou en vous revoyant avec des repères.">
          <div className="rs-seg"><i /><span>Lire mon retour</span><span>Me revoir en vidéo</span></div>
          <div style={{ ...miniCard, marginTop: 12, display: "flex", alignItems: "center", gap: 8 }}>
            <Pin ap /><span style={{ ...TY.caption, color: T.navy, flex: 1 }}>Ouverture directe à 0:04</span><span style={{ ...TY.time, color: T.muted }}>0:04</span>
          </div>
        </FCard>
      </div>
    </Section>
  );
}

/* ─── Ce que La Répét' ne fait pas ─── */
export function NotDo() {
  const items = [
    ["7/10", I.ban, "Aucune note", "Ni score, ni classement. L'assistant analyse, vous décidez quoi en faire."],
    ["humeur", I.shield, "Aucune émotion devinée", "L'assistant ne cherche pas à deviner votre humeur ni votre personnalité. Il analyse ce qui se voit et ce qui s'entend."],
    ["envoi auto", I.lock, "Aucun envoi sans votre accord", "Votre coach voit seulement ce que vous lui envoyez. Vous pouvez tout supprimer, à tout moment."],
    ["employeur", I.building, "Rien pour votre employeur ni pour votre financeur", "Votre employeur, ou l'organisme qui finance votre accompagnement, ne voit ni vos vidéos ni vos retours. Il reçoit seulement un bilan d'ensemble, sans information sur vous."],
  ];
  return (
    <Section eyebrow="Nos engagements" title="Ce que La Répét' ne fait pas">
      <div className="rs-g4">
        {items.map(([ghost, ic, t, d], i) => (
          <Reveal key={t} delay={i * 90} style={{ height: "100%" }}>
            <Card style={{ height: "100%", display: "grid", gap: 8, alignContent: "start" }}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <IconTile icon={ic} />
                <span className="strike" aria-hidden style={{ ...TY.mono, color: T.muted }}>{ghost}</span>
              </div>
              <h3 style={{ ...TY.h3, margin: 0, color: T.navy }}>{t}</h3>
              <p style={{ ...TY.body, color: T.body, margin: 0 }}>{d}</p>
            </Card>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ─── Portes d'entrée ───
   Trois cartes entièrement cliquables, un dégradé par public (bleu : personne accompagnée, vert : coach,
   violet : commanditaire), flèche à droite. L'adresse suit la session ouverte (src/app/router.js, spaceHash). */
export function ForWho({ go, openSpace }) {
  const doors = [
    { bg: GRAD_DOOR_BLUE, t: "Vous avez un code d'accès", d: "Votre coach vous a donné un code d'accès de 6\u00a0caractères. Il ouvre votre espace.", cta: "Ouvrir mon espace", href: () => spaceHash("benef"), on: () => openSpace("benef") },
    { bg: GRAD_DOOR_GREEN, t: "Vous êtes coach", d: "Créez un parcours et transmettez le code d'accès. Relisez les entretiens que l'on vous envoie. Préparez vos débriefings.", cta: "Me connecter à l'espace coach", href: () => spaceHash("coach"), on: () => openSpace("coach") },
    { bg: GRAD_DOOR_VIOLET, t: "Vous portez un projet d'accompagnement", d: "Acteur public de l'emploi ou entreprise\u00a0: confiez-nous l'accompagnement de demandeurs d'emploi ou de collaborateurs en mobilité.", cta: "Parler de votre projet", href: () => "#/demo", on: () => go("#/demo") },
  ];
  return (
    <Section title={"Par où commencer\u202f?"}>
      <div className="rs-g3">
        {doors.map((x, i) => (
          <Reveal key={x.t} delay={i * 90} style={{ height: "100%" }}>
            <a className="rs-door rp-pad-md" href={x.href()} onClick={e => { e.preventDefault(); x.on(); }}
              style={{ background: x.bg, color: ON.text, borderRadius: RAD.lg, boxShadow: SH.sm, padding: PAD.md, height: "100%", display: "flex", flexDirection: "column", gap: 12, textDecoration: "none" }}>
              <h3 style={{ ...TY.h2, margin: 0, color: ON.text }}>{x.t}</h3>
              <p style={{ ...TY.body, color: ON.text, margin: 0, flex: 1 }}>{x.d}</p>
              <span style={{ ...TY.bodyStrong, color: ON.text, display: "flex", alignItems: "center", justifyContent: "space-between", gap: 12, minHeight: 44 }}>
                {x.cta}
                <span className="rs-door-arrow" aria-hidden style={{ width: 40, height: 40, borderRadius: "50%", background: ON.chip, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon d={I.arrow} s={20} /></span>
              </span>
            </a>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}

/* ─── Bandeau de réassurance, sous le héros (rapport du panel, section 5, bloc 2) ───
   Quatre engagements courts (demande du propriétaire), chacun précisé en une ligne. La gratuité pour la personne est
   validée par le propriétaire ; « Démarrage rapide » : pas de compte, on entre avec le code donné par le coach. */
export const REASSURE = [
  [I.gift, "Sans frais pour vous", "Compris dans votre accompagnement."],
  [I.zap, "Démarrage rapide", "Pas de compte\u00a0: vous entrez avec votre code."],
  [I.shield, "Sécurisé", "Votre vidéo reste sur votre appareil."],
  [I.eyeOff, "Confidentiel", "Votre employeur ne voit pas vos entretiens."],
];
export function Reassurance() {
  return (
    <section aria-label="L'essentiel" className="rs-reassure">
      <ul className="rs-g4" style={{ listStyle: "none", margin: 0, padding: PAD.row, background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.lg, boxShadow: SH.xs }}>
        {REASSURE.map(([ic, t, d], i) => (
          <Reveal as="li" key={t} delay={i * 90} style={{ display: "flex", alignItems: "center", gap: 12, minHeight: 44 }}>
            <IconTile icon={ic} />
            <span style={{ display: "grid", gap: 2 }}>
              <span style={{ ...TY.bodyStrong, color: T.navy }}>{t}</span>
              <span style={{ ...TY.small, color: T.body }}>{d}</span>
            </span>
          </Reveal>
        ))}
      </ul>
    </section>
  );
}
