import React, { useEffect, useRef, useState } from "react";
import { T, Bare, GRAD_NIGHT, GRAD, RAD, SH, RepetMark, Tag, Icon, I, ON, TY, W, Eyebrow, IconTile, HEADER_H, HEADER_H_M, PAD, GAP } from "../ui.jsx";
import { useReducedMotion, useCount } from "../motion.jsx";
import { Pin } from "./shared.jsx";

/* ─── Strate épinglée : le panneau reste fixe, seul son contenu change au fil du défilement ─── */
export const STEPS = [
  { k: "S'entraîner", t: "Vous vous entraînez quand vous voulez", d: "Choisissez une question liée au métier que vous visez. Répondez à voix haute, face à la caméra ou en voix seule. Pas d'avatar en face de vous.", V: VisCamera },
  { k: "Recevoir un retour", t: "L'assistant décrit votre réponse", d: "Rythme de parole, pauses, exemples : il dit ce qu'il a remarqué, et à quel moment. Il commence par ce qui fonctionne déjà, puis propose des pistes. Vous recommencez quand vous voulez.", V: VisReport },
  { k: "Envoyer", t: "Vous décidez de ce que vous envoyez", d: "Votre vidéo reste sur votre appareil. Votre coach la voit seulement si vous la lui envoyez, réponse par réponse.", V: VisShare },
  { k: "En parler", t: "Votre coach vous répond, vous en parlez ensemble", d: "Votre coach regarde votre réponse et ajoute ses remarques. Ensemble, vous voyez ce qui a changé d'une réponse à l'autre, sans note, et vous choisissez la suite.", V: VisCoach },
];

export function Strate() {
  const reduced = useReducedMotion();
  const [short, setShort] = useState(false);
  const [active, setActive] = useState(0);
  const sec = useRef(null), barsD = useRef([]), barsM = useRef([]);
  const N = STEPS.length;

  useEffect(() => {
    if (!window.matchMedia) return;
    const m = window.matchMedia("(max-height: 619px)"), on = () => setShort(m.matches);
    on(); m.addEventListener ? m.addEventListener("change", on) : m.addListener(on);
    return () => (m.removeEventListener ? m.removeEventListener("change", on) : m.removeListener(on));
  }, []);
  const stacked = reduced || short;

  useEffect(() => {
    if (stacked) return;
    let raf = 0, last = -1;
    const upd = () => {
      raf = 0;
      const el = sec.current; if (!el) return;
      const hh = window.innerWidth <= 760 ? HEADER_H_M : HEADER_H;
      const r = el.getBoundingClientRect(), range = r.height - (window.innerHeight - hh);
      const p = range > 0 ? Math.min(1, Math.max(0, (hh - r.top) / range)) : 0;
      for (let i = 0; i < N; i++) {
        const f = Math.min(1, Math.max(0, p * N - i));
        if (barsD.current[i]) barsD.current[i].style.transform = `scaleY(${f})`;
        if (barsM.current[i]) barsM.current[i].style.transform = `scaleX(${f})`;
      }
      const a = Math.min(N - 1, Math.floor(p * N));
      if (a !== last) { last = a; setActive(a); }
    };
    const on = () => { if (!raf) raf = requestAnimationFrame(upd); };
    upd();
    window.addEventListener("scroll", on, { passive: true });
    window.addEventListener("resize", on);
    return () => { window.removeEventListener("scroll", on); window.removeEventListener("resize", on); cancelAnimationFrame(raf); };
  }, [stacked, N]);

  const jump = i => {
    const el = sec.current; if (!el) return;
    const hh = window.innerWidth <= 760 ? HEADER_H_M : HEADER_H;
    const range = el.offsetHeight - (window.innerHeight - hh);
    const top = el.getBoundingClientRect().top + window.scrollY - hh + range * ((i + 0.08) / N);
    window.scrollTo({ top, behavior: reduced ? "auto" : "smooth" });
  };

  const head = (
    <div style={{ display: "grid", gap: 12, maxWidth: W.read }}>
      <Eyebrow>Comment ça marche</Eyebrow>
      <h2 className="ty-xl" style={{ ...TY.xl, color: T.navy, margin: 0 }}>Quatre étapes, de votre première réponse à l'échange avec votre coach</h2>
    </div>
  );

  if (stacked) {
    return (
      <section id="comment-ca-marche" className="rs-pad rs-section" style={{ maxWidth: W.page, margin: "0 auto", padding: `${GAP.section}px ${PAD.x}px 0` }}>
        {head}
        <ol style={{ listStyle: "none", margin: `${GAP.block}px 0 0`, padding: 0, display: "grid", gap: GAP.head }}>
          {STEPS.map((s, i) => (
            <li key={s.k} className="rs-g2" style={{ alignItems: "center" }}>
              <div style={{ display: "grid", gap: 8 }}>
                <Eyebrow c={T.accent}>{`${i + 1}. ${s.k}`}</Eyebrow>
                <h3 className="ty-h1" style={{ ...TY.h1, color: T.navy, margin: 0 }}>{s.t}</h3>
                <p style={{ ...TY.bodyLg, color: T.body, margin: 0, maxWidth: 480 }}>{s.d}</p>
              </div>
              <div className="on" style={{ position: "relative", height: 380 }}><VisFrame><s.V play /></VisFrame></div>
            </li>
          ))}
        </ol>
      </section>
    );
  }

  return (
    <section ref={sec} id="comment-ca-marche" className="rs-strate" aria-label="Quatre étapes, de votre première réponse à l'échange avec votre coach" style={{ height: `calc(100vh + ${N * 85}vh)` }}>
      <div className="rs-panel">
        <div className="rs-pad" style={{ maxWidth: W.page, width: "100%", margin: "0 auto", padding: PAD.wrap, display: "flex", flexDirection: "column", gap: GAP.block, height: "100%", justifyContent: "center", minHeight: 0 }}>
          {head}
          <div className="rs-pgrid">
            <div>
              <ol className="rs-steps-d" style={{ listStyle: "none", margin: 0, padding: 0, display: "grid", gap: 4 }}>
                {STEPS.map((s, i) => (
                  <li key={s.k}>
                    <Bare className={`rs-step ${active === i ? "on" : ""}`} aria-current={active === i ? "step" : undefined} onClick={() => jump(i)} style={{ display: "flex", gap: 16, width: "100%", padding: "12px 0" }}>
                      <span className="rs-step-bar"><i ref={el => (barsD.current[i] = el)} /></span>
                      <span style={{ display: "grid", gap: 8, padding: "4px 0" }}>
                        <span style={{ ...TY.overline, color: active === i ? T.accent : T.muted }}>{`${i + 1}. ${s.k}`}</span>
                        <span className="ty-h1" style={{ ...TY.h1, color: active === i ? T.navy : T.muted }}>{s.t}</span>
                        <span className="rs-step-d"><span style={{ display: "block", overflow: "hidden" }}><span style={{ display: "block", ...TY.bodyLg, color: T.body, maxWidth: 480 }}>{s.d}</span></span></span>
                      </span>
                    </Bare>
                  </li>
                ))}
              </ol>
              <div className="rs-tabs-m">
                <div style={{ display: "flex", gap: 8 }} aria-hidden>
                  {STEPS.map((s, i) => (
                    <span key={s.k} style={{ flex: 1, height: 4, borderRadius: 2, background: T.line, overflow: "hidden" }}>
                      <i ref={el => (barsM.current[i] = el)} style={{ display: "block", height: "100%", background: T.primary, transformOrigin: "0 50%", transform: "scaleX(0)" }} />
                    </span>
                  ))}
                </div>
                <div aria-live="off" style={{ display: "grid", gap: 8, marginTop: 16 }}>
                  <span style={{ ...TY.overline, color: T.accent }}>{`Étape ${active + 1} sur ${N} · ${STEPS[active].k}`}</span>
                  <span style={{ ...TY.h2, color: T.navy }}>{STEPS[active].t}</span>
                  <span style={{ ...TY.small, color: T.body }}>{STEPS[active].d}</span>
                </div>
              </div>
            </div>
            <div className="rs-visbox" style={{ position: "relative", height: 440 }} aria-hidden>
              {/* Pile de cartes : chaque étape est sa propre carte, qui glisse et se superpose à la précédente */}
              {STEPS.map(({ V, k }, i) => (
                <div key={k} className={`rs-vcard ${active === i ? "on" : i < active ? "past" : "next"}`} style={{ zIndex: i + 1 }}><V play={active === i} /></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export const VisFrame = ({ children }) => (
  <div aria-hidden style={{ position: "absolute", inset: 0, background: T.surface, borderRadius: RAD.xl, boxShadow: SH.glow, border: `1px solid ${T.line}`, overflow: "hidden" }}>{children}</div>
);

export const visBox = { height: "100%", padding: PAD.md, display: "flex", flexDirection: "column", justifyContent: "center", gap: 12 };

export function VisCamera() {
  return (
    <div style={visBox}>
      <div style={{ position: "relative", flex: 1, minHeight: 0, borderRadius: RAD.lg, background: GRAD_NIGHT, overflow: "hidden" }}>
        <svg viewBox="0 0 200 160" style={{ position: "absolute", left: "50%", bottom: 0, transform: "translateX(-50%)", height: "78%" }}>
          <circle cx="100" cy="60" r="30" fill={ON.glow} />
          <path d="M36 160c0-38 28-62 64-62s64 24 64 62z" fill={ON.glow} />
        </svg>
        <div style={{ position: "absolute", top: 12, left: 12, display: "flex", alignItems: "center", gap: 8, background: ON.scrim, padding: "4px 12px", borderRadius: RAD.pill }}>
          <span style={{ width: 8, height: 8, borderRadius: "50%", background: T.error, animation: "blink 1.2s infinite" }} />
          <span style={{ ...TY.time, color: ON.text }}>0:42</span>
        </div>
        <div className="rs-in" style={{ position: "absolute", left: 12, right: 12, bottom: 12, background: T.surface, borderRadius: RAD.md, padding: "12px 16px", transitionDelay: ".25s", display: "grid", gap: 4 }}>
          <div style={{ ...TY.overline, color: T.muted }}>Question · agent d'accueil</div>
          <div style={{ ...TY.h3, color: T.navy }}>« Pouvez-vous vous présenter en deux minutes ? »</div>
        </div>
      </div>
    </div>
  );
}

/* Retour descriptif : la chronologie de l'entretien se remplit, les repères apparaissent.
   Aucune note, aucune jauge : uniquement le temps de l'entretien et des faits. */
export const SEGS = [[0, 11], [13, 27], [29, 41], [44, 58], [60, 70], [73, 86], [88, 100]];

export const OBS = [
  { at: 4, time: "0:04", ap: true, d: 300, t: "Ouverture", txt: "Vous entrez directement dans le sujet." },
  { at: 38, time: "0:35", ap: true, d: 900, t: "Exemples concrets", txt: "Vous citez une expérience précise." },
  { at: 66, time: "1:01", ap: false, d: 1500, t: "Petits mots répétés", txt: "« Euh » revient quelques fois." },
];

export function VisReport({ play }) {
  const reduced = useReducedMotion();
  const wpm = useCount(148, play, 2200, reduced), pauses = useCount(6, play, 2200, reduced);
  return (
    <div key={play ? "p" : "s"} className={`rs-tl ${play ? "play" : ""}`} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
      <div style={{ background: GRAD, padding: PAD.callout, display: "flex", alignItems: "center", gap: 12 }}>
        <RepetMark s={28} white />
        <div style={{ ...TY.h3, color: ON.text }}>Votre retour · question 1</div>
      </div>
      <div style={{ padding: `${PAD.sm}px ${PAD.md}px 8px` }}>
        <div style={{ ...TY.overline, color: T.muted }}>Déroulé de votre réponse</div>
        <div style={{ position: "relative", marginTop: GAP.grid }}>
          <div style={{ position: "relative", height: 10, borderRadius: 4, background: T.lineLt, overflow: "hidden" }}>
            {SEGS.map(([a, b]) => <span key={a} style={{ position: "absolute", top: 0, bottom: 0, left: `${a}%`, width: `${b - a}%`, background: T.primary, borderRadius: 3 }} />)}
            <span className="rs-tl-mask" style={{ position: "absolute", inset: 0, background: T.surface }} />
          </div>
          <span className="rs-tl-head" style={{ position: "absolute", top: -4, height: 18, width: 2, transform: "translateX(-1px)", background: T.navy, borderRadius: 1 }} />
          {OBS.map(o => (
            <span key={o.at} className="rs-tl-pin" style={{ position: "absolute", left: `${o.at}%`, bottom: 12, display: "flex", flexDirection: "column", alignItems: "center", animationDelay: `${o.d}ms` }}>
              <Pin ap={o.ap} /><span style={{ width: 2, height: 4, background: o.ap ? T.accent : T.violet }} />
            </span>
          ))}
        </div>
        <div style={{ display: "flex", justifyContent: "space-between", ...TY.time, color: T.muted, marginTop: 8 }}><span>0:00</span><span>1:32</span></div>
      </div>
      <div className="rs-tl-facts" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", margin: `4px ${PAD.md}px 0`, borderTop: `1px solid ${T.lineLt}`, borderBottom: `1px solid ${T.lineLt}` }}>
        {[[wpm, "mots/min", "Rythme"], [pauses, "", "Pauses"], ["1:32", "", "Durée"]].map(([n, u, l], i) => (
          <div key={l} style={{ padding: "12px 0", textAlign: "center", borderLeft: i ? `1px solid ${T.lineLt}` : "none" }}>
            <div style={{ ...TY.num, color: T.navy, fontVariantNumeric: "tabular-nums" }}>{n}{u && <span style={{ ...TY.caption, color: T.muted, marginLeft: 4 }}>{u}</span>}</div>
            <div style={{ ...TY.overline, color: T.muted, marginTop: 4 }}>{l}</div>
          </div>
        ))}
      </div>
      <div style={{ padding: `4px ${PAD.md}px ${PAD.sm}px` }}>
        {OBS.map((o, i) => {
          const c = o.ap ? T.accent : T.violet;
          return (
            <div key={o.t} className="rs-tl-row" style={{ display: "flex", alignItems: "center", gap: 12, padding: "8px 0", borderBottom: i < 2 ? `1px solid ${T.lineLt}` : "none", animationDelay: `${o.d}ms` }}>
              <span style={{ ...TY.time, color: T.surface, background: c, borderRadius: RAD.pill, padding: "4px 8px", flexShrink: 0 }}>{o.time}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ ...TY.h4, color: T.navy }}>{o.t}</div>
                <div style={{ ...TY.caption, color: T.muted }}>{o.txt}</div>
              </div>
              <Tag tone={o.ap ? "appui" : "ai"}>{o.ap ? "Point d'appui" : "À explorer"}</Tag>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export function VisShare() {
  return (
    <div style={{ ...visBox, alignItems: "stretch" }}>
      <div style={{ border: `1px solid ${T.line}`, borderRadius: RAD.lg, padding: 20, boxShadow: SH.xs }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <IconTile icon={I.play} />
          <div>
            <div style={{ ...TY.h3, color: T.navy }}>Entretien du 12 mars</div>
            <div style={{ ...TY.mono, color: T.muted }}>1 min 32</div>
          </div>
        </div>
        <div style={{ position: "relative", height: 24, marginTop: 16 }}>
          <span className="rs-swap rs-off" style={{ position: "absolute", left: 0, top: 0 }}><Tag tone="muted" icon={I.lock}>Sur cet appareil</Tag></span>
          <span className="rs-swap rs-onl" style={{ position: "absolute", left: 0, top: 0 }}><Tag tone="success" icon={I.send}>Envoyée à votre coach</Tag></span>
        </div>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 16, paddingTop: 16, borderTop: `1px solid ${T.lineLt}` }}>
          <span style={{ ...TY.bodyStrong, color: T.navy }}>Envoyer à mon coach</span>
          <span className="rs-track" style={{ position: "relative", width: 44, height: 26, borderRadius: RAD.pill }}>
            <span className="rs-knob" style={{ position: "absolute", top: 3, width: 20, height: 20, borderRadius: "50%", background: T.surface, boxShadow: SH.sm }} />
          </span>
        </div>
      </div>
      <div className="rs-in" style={{ ...TY.caption, color: T.muted, display: "flex", gap: 8, alignItems: "center", transitionDelay: ".9s" }}>
        <Icon d={I.shield} s={16} c={T.primary} /> Vous pouvez supprimer une réponse, ou tout votre espace, à tout moment.
      </div>
    </div>
  );
}

export function VisCoach() {
  const note = (t, txt, d) => (
    <div className="rs-in" style={{ display: "flex", gap: 12, alignItems: "flex-start", background: T.primaryBg, borderLeft: `3px solid ${T.primary}`, borderRadius: RAD.xs, padding: "8px 12px", transitionDelay: d }}>
      <span style={{ ...TY.time, color: T.surface, background: T.primary, borderRadius: RAD.pill, padding: "4px 8px", flexShrink: 0 }}>{t}</span>
      <span style={{ ...TY.small, color: T.navy }}>{txt}</span>
    </div>
  );
  return (
    <div style={visBox}>
      <div style={{ ...TY.overline, color: T.muted }}>Remarques de votre coach</div>
      <div style={{ position: "relative", marginTop: 16 }}>
        <div style={{ height: 6, borderRadius: 3, background: T.primaryBg }} />
        {OBS.map(o => <span key={o.at} style={{ position: "absolute", left: `${o.at}%`, top: -4, transform: "translateX(-50%)" }}><Pin ap={o.ap} /></span>)}
        <span style={{ position: "absolute", left: "52%", top: -4, width: 14, height: 14, borderRadius: RAD.xs / 2, background: T.primary, border: `2px solid ${T.surface}` }} />
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", ...TY.time, color: T.muted }}><span>0:00</span><span>1:32</span></div>
      {note("0:35", "Très bon exemple, gardez-le.", ".3s")}
      {note("0:48", "Ici, vous pouvez dire ce que vous avez fait, vous.", ".55s")}
      {note("1:01", "Une respiration suffit à la place du « euh ».", ".8s")}
      <div className="rs-in" style={{ display: "flex", alignItems: "center", gap: 8, ...TY.bodyStrong, color: T.primary, marginTop: 4, transitionDelay: "1.05s" }}>
        <Icon d={I.users} s={16} c={T.primary} /> Rendez-vous avec votre coach jeudi
      </div>
    </div>
  );
}
