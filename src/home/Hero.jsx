import React, { useEffect, useState } from "react";
import { T, FIX, Bare, GRAD_ACCROCHE, GLOW, PACE, RAD, SH, Halo, Tag, Btn, Icon, I, ON, TY, W, img } from "../ui.jsx";
import { clock } from "../lib/format.js";
import { useReducedMotion } from "../motion.jsx";
import { Pin, lineStyle, useTicker } from "./shared.jsx";

/* Fins d'accroche et scènes synchronisées : même cadence, même fondu, un lien de sens entre le mot et l'image. */
export function Hero({ openSpace }) {
  const reduced = useReducedMotion();
  const [hover, setHover] = useState(false);
  const [stopped, setStopped] = useState(false);
  const [w, setW] = useTicker(SCENES.length, PACE.scene, reduced || hover || stopped);
  return (
    <section style={{ position: "relative", overflowX: "clip" }}>
      <div className="rs-pad" style={{ position: "relative", maxWidth: W.page, margin: "0 auto", padding: "80px 24px" }}>
        <div className="rs-hero">
          <div className="up" style={{ display: "grid", gap: 24, justifyItems: "start" }}>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {/* Teinte coach (sarcelle de GRAD_COACH, ton « appui ») et violet de l'assistant (docs/design-system.md, 5.4) */}
              <Tag tone="appui" icon={I.users}>Avec votre coach</Tag>
              <Tag tone="ai" icon={I.sparkle}>Assistant IA</Tag>
              <Tag tone="primary">Sans jugement</Tag>
            </div>
            <h1 className="ty-display" style={{ ...TY.display, color: T.primary, margin: 0 }}>
              <span className="rs-sr">Répétez votre entretien, {SCENES.map(x => x.ending.replace(".", "")).join(", ")}.</span>
              <span aria-hidden>
                <span style={{ color: T.navy }}>Répétez votre entretien,</span>
                <span className="rs-rot">
                  {SCENES.map(({ ending: e }, i) => (
                    <span key={e} className={i === w ? "on" : ""} style={{ background: GRAD_ACCROCHE, WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>{e}</span>
                  ))}
                </span>
              </span>
            </h1>
            <p className="ty-lead" style={{ ...TY.lead, color: T.body, maxWidth: 520, margin: 0 }}>
              Vous répondez à des questions d'entretien, à voix haute, autant de fois que vous voulez. Un assistant IA <strong style={{ color: T.navy }}>décrit votre réponse, sans la noter</strong> : rythme, pauses, exemples concrets. Votre vidéo reste sur votre appareil : vous choisissez ce que voit votre coach.
            </p>
            <div className="rp-wide-m" style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
              {/* Connecté : l'espace de la personne (ou l'espace coach), jamais la page de connexion (src/app/router.js, spaceHash) */}
              <Btn kind="objective" size="lg" onClick={() => openSpace("benef")} iconRight={I.arrow}>Lancer ma première répétition</Btn>
            </div>
          </div>
          <HeroStage reduced={reduced} i={w} setI={setW} stopped={stopped} setStopped={setStopped} setHover={setHover} />
        </div>
      </div>
    </section>
  );
}

/* Scènes du héros : une photo en situation et un petit morceau d'interface, chacune liée à sa fin d'accroche.
   Jamais de score ni de courbe. bubbleTop : position de la bulle (jamais sur un visage). */
export const SCENES = [
  {
    ending: "à votre rythme.", src: "entrainement.webp", alt: "Un homme s'entraîne devant son ordinateur portable, écouteurs aux oreilles.", label: "S'entraîner quand on veut, et les repères de l'assistant",
    bubble: { who: "Question 2 sur 3", text: "« Pourquoi ce poste vous intéresse-t-il ? »", rec: 38 }, bubbleTop: "6%", card: "reperes",
  },
  {
    ending: "sans jugement.", src: "ressources/se-presenter-en-deux-minutes.webp", pos: "40% 50%", alt: "Une femme assise à une table chez elle, souriante, une tablette à la main.", label: "Un échauffement chez soi, rien n'est enregistré",
    bubble: { who: "Consigne 2 sur 7", text: "« Redites-la un peu plus lentement. »" }, bubbleTop: "56%", card: "warmup",
  },
  {
    ending: "avec vos mots.", src: "ressources/parler-de-ses-experiences-methode-sar.webp", pos: "66% 50%", alt: "Un homme explique avec les mains, assis face à une collègue.", label: "Votre réponse mise par écrit, avec vos mots",
    bubble: { who: "Mise par écrit", text: "« J'ai travaillé deux ans à l'accueil d'une mairie. »", live: 12 }, bubbleTop: "58%", card: "transcript",
  },
  {
    ending: "en confiance.", src: "recruteuse.webp", alt: "Une recruteuse écoute la personne en face d'elle, un bloc-notes à la main.", label: "Une question de recruteuse et le retour de l'assistant",
    bubble: { who: "Question de la recruteuse", text: "« Parlez-moi d'un problème que vous avez résolu au travail. »" }, bubbleTop: "40%", card: "debrief",
  },
];

/* Minuteur qui avance en direct quand la scène est affichée. */
export function LiveTime({ from, on, reduced }) {
  const [t, setT] = useState(from);
  useEffect(() => {
    if (!on) { setT(from); return; }
    if (reduced) return;
    const id = setInterval(() => setT(x => x + 1), 1000);
    return () => clearInterval(id);
  }, [on, from, reduced]);
  return <>{clock(t)}</>;
}

export function HeroStage({ reduced, i, setI, stopped, setStopped, setHover }) {
  return (
    <div className="rs-stage" role="group" aria-roledescription="carrousel" aria-label="La Répét' en quatre images"
      onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} onFocus={() => setHover(true)} onBlur={() => setHover(false)}>
      {SCENES.map((sc, k) => <Scene key={sc.src} sc={sc} on={k === i} first={k === 0} reduced={reduced} />)}
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 4, marginTop: 40 }}>
        {SCENES.map((sc, k) => (
          <Bare key={sc.src} className="rs-dot" aria-current={k === i ? "true" : "false"} aria-label={`Scène ${k + 1} sur ${SCENES.length} : ${sc.label}`} onClick={() => setI(k)}><i /></Bare>
        ))}
        {!reduced && (
          <Bare className="rs-dot" aria-label={stopped ? "Relancer les images" : "Mettre les images en pause"} onClick={() => setStopped(v => !v)} style={{ color: T.primary, width: 44, height: 44, display: "inline-grid", placeItems: "center" }}>
            <Icon d={stopped ? I.play : I.pause} s={16} />
          </Bare>
        )}
      </div>
    </div>
  );
}

export function Scene({ sc, on, first, reduced }) {
  const b = sc.bubble;
  return (
    <div className={`rs-scene ${on ? "on" : ""}`} aria-hidden={!on}>
      <div style={{ position: "relative" }}>
        <Halo style={{ width: "120%", height: "90%", background: GLOW.violet, top: "-8%", left: "-24%" }} />
        <Halo style={{ width: "100%", height: "80%", background: GLOW.blue, bottom: "-16%", right: "-24%" }} />
        <div style={{ position: "relative", borderRadius: RAD.xl, overflow: "hidden", boxShadow: SH.glow, aspectRatio: "4 / 5", background: T.primaryBg }}>
          <img src={img(sc.src)} alt={sc.alt} width={900} height={1125} loading={first ? "eager" : "lazy"} decoding="async"
            style={{ display: "block", width: "100%", height: "100%", objectFit: "cover", objectPosition: sc.pos || "50% 50%" }} />
        </div>
        <div className="rs-pop d1 rs-bubble" style={{ position: "absolute", top: sc.bubbleTop, maxWidth: 290, background: T.surface, borderRadius: RAD.md, borderTopLeftRadius: RAD.xs, padding: "12px 16px", boxShadow: SH.glow, display: "grid", gap: 4 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            {b.rec != null && <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}><span style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, animation: "blink 1.2s infinite" }} /><span style={{ ...TY.time, color: T.navy, fontVariantNumeric: "tabular-nums" }}><LiveTime from={b.rec} on={on} reduced={reduced} /></span></span>}
            {b.live != null && <span style={{ ...TY.time, color: T.surface, background: T.primary, borderRadius: RAD.pill, padding: "4px 8px", fontVariantNumeric: "tabular-nums" }}><LiveTime from={b.live} on={on} reduced={reduced} /></span>}
            <span style={{ ...TY.overline, color: T.muted }}>{b.who}</span>
          </div>
          <div style={{ ...TY.h3, color: T.navy }}>{b.text}</div>
        </div>
        <div className="rs-pop d2 rs-card-pos" style={{ position: "absolute", right: -16, bottom: -28, width: "min(310px, 86%)" }}>
          {sc.card === "debrief" && <DebriefCard />}
          {sc.card === "reperes" && <ReperesCard />}
          {sc.card === "warmup" && <WarmupCard />}
          {sc.card === "transcript" && <TranscriptCard />}
        </div>
      </div>
    </div>
  );
}

export const DebriefCard = () => (
  <div style={{ background: FIX.primary, color: ON.text, borderRadius: RAD.md, padding: 16, boxShadow: SH.glow, display: "grid", gap: 8 }}>
    <div className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.overline, ...lineStyle(0, 3) }}><Icon d={I.sparkle} s={12} c={ON.text} /> Retour de l'assistant</div>
    <div className="rs-line" style={{ display: "flex", gap: 8, ...TY.bodyStrong, ...lineStyle(1, 3) }}><Icon d={I.check} s={16} c={ON.text} /><span>Vous décrivez clairement le problème.</span></div>
    <div className="rs-line" style={{ display: "flex", gap: 8, ...TY.body, ...lineStyle(2, 3) }}><Icon d={I.search} s={16} c={ON.text} /><span>Qu'avez-vous fait personnellement pour le résoudre ?</span></div>
  </div>
);

export const WarmupCard = () => (
  <div style={{ background: T.surface, borderRadius: RAD.md, padding: 16, boxShadow: SH.glow, display: "grid", gap: 8 }}>
    <div className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.overline, color: T.primary, ...lineStyle(0, 3) }}><Icon d={I.mic} s={12} c={T.primary} /> Échauffement · rien n'est enregistré</div>
    <div className="rs-line" style={{ ...TY.h4, color: T.navy, ...lineStyle(1, 3) }}>« Merci de me recevoir aujourd'hui. »</div>
    <div className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.small, color: T.body, ...lineStyle(2, 3) }}><Icon d={I.lock} s={16} c={T.successDk} /> Chez vous, quand vous voulez</div>
  </div>
);

export const TranscriptCard = () => {
  const rows = [["0:08", "Bonjour, je m'appelle Sami."], ["0:12", "J'ai travaillé deux ans à l'accueil d'une mairie."], ["0:18", "J'aime orienter les gens."]];
  return (
    <div style={{ background: T.surface, borderRadius: RAD.md, padding: 16, boxShadow: SH.glow, display: "grid", gap: 8 }}>
      <div className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.overline, color: T.primary, ...lineStyle(0, 4) }}><Icon d={I.note} s={12} c={T.primary} /> Votre réponse, mise par écrit</div>
      {rows.map(([t, x], k) => (
        <div key={t} className="rs-line" style={{ display: "flex", gap: 8, alignItems: "baseline", ...lineStyle(k + 1, 4) }}>
          <span style={{ ...TY.time, color: T.muted, minWidth: 32 }}>{t}</span>
          <span className={k === rows.length - 2 ? "rs-hl" : undefined} style={{ ...TY.small, color: T.navy }}>{x}</span>
        </div>
      ))}
    </div>
  );
};

export const ReperesCard = () => (
  <div style={{ background: T.surface, borderRadius: RAD.md, padding: 16, boxShadow: SH.glowAi, display: "grid", gap: 12, borderTop: `4px solid ${T.violet}` }}>
    <div className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.overline, color: T.violet, ...lineStyle(0, 4) }}><Icon d={I.sparkle} s={12} c={T.violet} /> Repères de l'assistant</div>
    {[[true, "Un exemple concret à 0:35"], [true, "Environ 140 mots par minute"], [false, "« Euh » revient 4 fois"]].map(([ap, t], k) => (
      <div key={t} className="rs-line" style={{ display: "flex", alignItems: "center", gap: 8, ...lineStyle(k + 1, 4) }}>
        <Pin ap={ap} /><span style={{ ...TY.small, color: T.navy, flex: 1 }}>{t}</span>
        <span style={{ ...TY.label, color: ap ? T.accent : T.violet }}>{ap ? "Point d'appui" : "À explorer"}</span>
      </div>
    ))}
  </div>
);

export const RapportCard = () => (
  <div style={{ background: T.surface, borderRadius: RAD.md, padding: 16, boxShadow: SH.glow, display: "flex", gap: 12, alignItems: "center" }}>
    <div style={{ width: 40, height: 40, borderRadius: "50%", background: T.successBg, display: "grid", placeItems: "center", flexShrink: 0 }}><Icon d={I.check} s={20} c={T.successDk} /></div>
    <div>
      <div style={{ ...TY.h4, color: T.navy }}>Rapport de votre coach reçu</div>
      <div style={{ ...TY.caption, color: T.muted }}>Ses remarques, placées au bon moment de votre réponse</div>
    </div>
  </div>
);
