/* Styles globaux de La Répét' (ARC-10, extrait de ui.jsx) : classes rp-* et rs-* (mobile, états, impression).
   Aucune valeur de couleur écrite ici : tout vient des jetons (règle X2 de tests/design-lint.mjs). */
import React from "react";
import {
  T, ON, GLOW, GRAD, GRAD_MAIN, GRAD_COACH, GRAD_AI, GRAD_SOFT, GRAD_PAGE, FD, FB, FM, TY, PAD, PAD_MOBILE, GAP, W, RAD, SH, MO, Z,
  TONE, HEADER_H, HEADER_H_M, TY_MOBILE, GRAD_AI_BORDER, FONT_STACKS, MASK, GRAD_LOGO, FADE_FOOT,
} from "../tokens.js";

/* ─── STYLES GLOBAUX ─── */

const F = k => TY[k].font; // police d'un niveau, pour les règles CSS ci-dessous
/* Polices auto-hébergées (public/fonts, sous-ensemble latin, licence OFL) : aucun appel à un service tiers. */
/* Polices : public/fonts/fonts.css, liée et préchargée par index.html (PERF-03). */
export const GStyle = () => (
  <style>{`
    :root{--ff-d:${FONT_STACKS.display};--ff-b:${FONT_STACKS.body};--fs:1}
    html[data-font=lisible]{--ff-d:${FONT_STACKS.lisible};--ff-b:${FONT_STACKS.lisible}}
    *{box-sizing:border-box} body{margin:0;background:${T.bg};color:${T.navy}}
    html{overflow-y:scroll;scrollbar-gutter:stable}
    html.rp-lock,html.rp-lock body{overflow:hidden!important;overscroll-behavior:none}
    /* Menu mobile ouvert : boutons flottants retirés (rien de cliquable derrière le panneau) */
    html.rp-menu-open .rp-totop,html.rp-menu-open .rp-ai-fab,html.rp-menu-open .rp-ai-bubble,html.rp-account-open .rp-totop,html.rp-account-open .rp-ai-fab,html.rp-account-open .rp-ai-bubble{display:none!important}
    /* Panneau « Mon compte » : à droite sur grand écran, plein écran sur mobile */
    .rp-account-ov{position:fixed;inset:0;z-index:${Z.modal};background:${T.overlay};display:flex;justify-content:flex-end;animation:rpFade ${MO.base} ${MO.ease} both}
    @keyframes rpFade{from{opacity:0}to{opacity:1}}
    .rp-account{width:min(400px,100vw);height:100%;background:${T.surface};box-shadow:${SH.lg};display:flex;flex-direction:column;animation:rpAiIn ${MO.enter} ${MO.ease} both}
    ::selection{background:${T.lavender};color:${T.surface}}
    img{max-width:100%}
    @keyframes up{from{opacity:0;transform:translateY(12px)}to{opacity:1;transform:none}}
    @keyframes spin{to{transform:rotate(360deg)}}
    @keyframes blink{0%,100%{opacity:1}50%{opacity:.25}}
    .up{animation:up ${MO.enter} ${MO.ease} both}
    /* Focus clavier (référentiel 1.6) : contour 2 px primary, décalage 2 px ; blanc sur fond sombre */
    a:focus-visible,button:focus-visible,summary:focus-visible,[role=button]:focus-visible,[role=tab]:focus-visible,[role=checkbox]:focus-visible,[role=radio]:focus-visible,[role=option]:focus-visible,[tabindex]:focus-visible{outline:2px solid ${T.primary};outline-offset:2px}
    .rs-on-dark :focus-visible{outline-color:${ON.text}}
    .rp-skip{position:fixed;left:16px;top:-80px;z-index:${Z.modal + 10};background:${T.surface};color:${T.primary};padding:12px 16px;border-radius:${RAD.md}px;box-shadow:${SH.lg};font-weight:700;text-decoration:underline}
    .rp-skip:focus{top:12px}
    main h1[tabindex="-1"]:focus:not(:focus-visible),main[tabindex="-1"]:focus:not(:focus-visible){outline:none}
    .rp-sr,.rs-sr{position:absolute!important;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
    .rp-show-m{display:none}
    .rp-dots{display:inline-flex;gap:4px}
    .rp-dots i{width:6px;height:6px;border-radius:50%;background:currentColor;opacity:.3;animation:rpDot 1.2s infinite}
    .rp-dots i:nth-child(2){animation-delay:.2s}
    .rp-dots i:nth-child(3){animation-delay:.4s}
    @keyframes rpDot{0%,80%,100%{opacity:.25;transform:none}40%{opacity:1;transform:translateY(-2px)}}
    .rp-opt:hover{background:${T.lineLt}}
    .rp-sel{position:-webkit-sticky;position:sticky;bottom:12px;z-index:3}
    .rp-app{min-height:100vh;min-height:100svh}
    /* Liens, retour, boutons icône */
    .rp-link{text-underline-offset:3px;transition:color ${MO.fast}}
    .rp-link:hover{color:${T.primaryDk}!important}
    .rs-on-dark .rp-link:hover{color:${ON.text}!important}
    .rp-back:hover{color:${T.primary}!important}
    .rp-menuitem:hover,.rp-menuitem:focus-visible{background:${T.primaryBg}}
    /* Assistant de préparation d'entretien : panneau latéral, bouton flottant, bulle */
    .rp-ai-panel{position:fixed;right:16px;top:${HEADER_H + 16}px;bottom:16px;width:min(400px,calc(100vw - 32px));z-index:${Z.nav + 2};display:flex;flex-direction:column;border:2px solid transparent;border-radius:${RAD.lg}px;background:linear-gradient(${T.surface},${T.surface}) padding-box,${GRAD_AI_BORDER} border-box;background-size:100% 100%,300% 300%;background-position:0 0,0 50%;box-shadow:${SH.lg};overflow:hidden}
    .rp-ai-panel[hidden]{display:none}
    .rp-ai-panel.is-in{animation:rpAiIn ${MO.enter} ${MO.ease} both,rpAiBorder 1.4s ${MO.ease} both}
    @keyframes rpAiIn{from{opacity:0;transform:translateX(24px)}to{opacity:1;transform:none}}
    @keyframes rpAiBorder{from{background-position:0 0,100% 50%}to{background-position:0 0,0 50%}}
    .rp-ai-fab{position:fixed;right:16px;bottom:16px;z-index:${Z.nav};width:56px;height:56px;border-radius:50%;border:none;cursor:pointer;display:grid;place-items:center;color:${T.surface};background:${GRAD_AI};box-shadow:${SH.btn.ai[0]};transition:box-shadow ${MO.base} ${MO.ease},transform ${MO.base} ${MO.ease}}
    .rp-ai-fab:hover{box-shadow:${SH.btn.ai[1]};transform:translateY(-1px)}
    .rp-ai-bubble{position:fixed;right:84px;bottom:16px;z-index:${Z.nav};max-width:min(240px,calc(100vw - 100px));display:flex;align-items:center;gap:4px;padding:4px 4px 4px 16px;border:2px solid transparent;border-radius:${RAD.md}px;background:linear-gradient(${T.surface},${T.surface}) padding-box,${GRAD_AI_BORDER} border-box;box-shadow:${SH.lg};animation:rpAiIn ${MO.enter} ${MO.ease} both}
    .rp-has-fab{padding-bottom:96px!important}
    /* Grand écran : le contenu se décale pour rester visible à côté du panneau ouvert (insertion en un clic) */
    @media (min-width:1180px){html.rp-asst-open .rp-view{padding-right:432px}}
    /* Changement de page (référentiel 7) : seul le contenu change, l'en-tête reste en place */
    .rp-header{view-transition-name:rp-header}
    .rp-view{view-transition-name:rp-page}
    ::view-transition-old(root),::view-transition-new(root){animation:none}
    ::view-transition-old(rp-page){animation:rpPageOut ${MO.pageOut} ${MO.soft} both}
    ::view-transition-new(rp-page){animation:rpPageIn ${MO.pageIn} ${MO.soft} ${MO.pageOut} both}
    @keyframes rpPageOut{to{opacity:0}}
    @keyframes rpPageIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .rp-leave{opacity:0;transition:opacity ${MO.pageOut} ${MO.soft}}
    .rp-enter{animation:rpPageIn ${MO.pageIn} ${MO.soft} both}
    @media (prefers-reduced-motion: reduce){::view-transition-old(rp-page),::view-transition-new(rp-page){animation:none}}
    html[data-motion=reduce]::view-transition-old(rp-page),html[data-motion=reduce]::view-transition-new(rp-page){animation:none}
    /* Navigation à deux niveaux */
    .rp-navitem{position:relative;display:flex;align-items:center}
    .rp-subbtn{width:28px;height:44px;display:inline-grid;place-items:center;color:${T.body}}
    .rp-subbtn:hover,.rp-subbtn[aria-expanded=true]{color:${T.primary}}
    .rp-subbtn svg{transition:transform ${MO.base} ${MO.ease}}
    .rp-subbtn[aria-expanded=true] svg,.rp-rot svg{transform:rotate(180deg)}
    .rp-submenu{position:absolute;left:-12px;top:100%;min-width:240px;padding:8px;background:${T.surface};border:1px solid ${T.line};border-radius:${RAD.md}px;box-shadow:${SH.lg};z-index:${Z.nav + 1};animation:rsMenu ${MO.base} ${MO.ease} both}
    .rp-submenu[hidden]{display:none}
    .rp-subitem{display:flex;align-items:center;min-height:44px;padding:0 12px;border-radius:${RAD.sm}px;color:${T.navy};text-decoration:none;font:${F("body")}}
    .rp-subitem:hover,.rp-subitem:focus-visible{background:${T.primaryBg};color:${T.primary}}
    /* Logo en masques : couleurs gardées à l'impression */
    .rp-logo-layer{-webkit-print-color-adjust:exact;print-color-adjust:exact}
    /* Logo animé d'attente */
    .rp-bl-l{animation:rpBlL 1.3s ${MO.soft} both}
    .rp-bl-r{animation:rpBlR 1.3s ${MO.soft} both}
    .rp-bl-d{animation:rpBlD 1s ease-in-out 1.2s infinite both}
    .rp-bl-d2{animation-delay:1.35s}.rp-bl-d3{animation-delay:1.5s}
    @keyframes rpBlL{from{opacity:0;transform:translate(-22px,10px)}to{opacity:1;transform:none}}
    @keyframes rpBlR{from{opacity:0;transform:translate(22px,-10px)}to{opacity:1;transform:none}}
    @keyframes rpBlD{0%,60%,100%{opacity:.35;transform:none}30%{opacity:1;transform:translateY(-5px)}}
    .rp-bl-full{position:fixed;inset:0;z-index:${Z.modal + 2};display:grid;place-items:center;background:${T.bg};animation:up ${MO.base} ${MO.ease} both}
    .rp-totop{position:fixed;right:22px;z-index:${Z.nav};box-shadow:${SH.sm}}
    /* « Revenir en haut » : fondu à l'apparition et à la disparition (opacité, déplacement de 8 px) ; mouvement réduit : opacité seule */
    .rp-icbtn.rp-totop{opacity:0;transform:translateY(8px);pointer-events:none;transition:opacity .3s ${MO.ease},transform .3s ${MO.ease},background-color ${MO.fast},border-color ${MO.fast}}
    .rp-icbtn.rp-totop.is-in{opacity:1;transform:none;pointer-events:auto}
    html[data-motion=reduce] .rp-icbtn.rp-totop{transform:none!important;transition:opacity .3s ease!important}
    @media (prefers-reduced-motion: reduce){ .rp-icbtn.rp-totop{transform:none!important;transition:opacity .3s ease!important} }
    /* Bordure haute en dégradé des cartes : bleu vers violet (personne accompagnée), vert (coach), IA */
    .rp-tb::before{content:"";position:absolute;inset:-1px;border-radius:inherit;padding-top:5px;background:var(--tb);-webkit-mask:${MASK} content-box,${MASK};-webkit-mask-composite:xor;mask:${MASK} content-box,${MASK};mask-composite:exclude;pointer-events:none;z-index:1}
    .rp-tb-main{--tb:${GRAD_MAIN}} .rp-tb-coach{--tb:${GRAD_COACH}} .rp-tb-ai{--tb:${GRAD_AI}}
    /* Recruteur oral : indicateur discret (barres qui pulsent pendant la lecture, immobiles sinon) */
    .rp-voice{display:inline-flex;align-items:center;gap:2px;height:16px}
    .rp-voice i{display:block;width:3px;height:6px;border-radius:2px;background:${T.primary};opacity:.5}
    .rp-voice.on i{opacity:1;animation:rpVoice 1s ease-in-out infinite}
    .rp-voice.on i:nth-child(2){animation-delay:.15s}.rp-voice.on i:nth-child(3){animation-delay:.3s}.rp-voice.on i:nth-child(4){animation-delay:.45s}
    @keyframes rpVoice{0%,100%{height:6px}50%{height:16px}}
    .rp-trustlink:hover{color:${T.primary}!important;text-decoration:underline!important}
    /* Pied de page : présentation et trois groupes de liens sur une rangée (3/2/2/2), engagements répartis sur la largeur */
    .rp-fgrid{display:grid;grid-template-columns:minmax(0,3fr) repeat(3,minmax(0,2fr));gap:24px 40px}
    footer .rp-trust{justify-content:space-between;row-gap:0!important}
    @media (max-width:1023px){ .rp-fgrid{grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 32px} footer .rp-trust{justify-content:flex-start;column-gap:24px!important} }
    @media (max-width:560px){ .rp-fgrid{gap:16px 24px} .rp-fbrief{grid-column:1/-1} }
    /* Mobile : espace sous le pied de page pour que la languette d'accessibilité et « Revenir en haut » ne masquent pas les derniers liens */
    @media (max-width:760px){ .rp-foot{padding-bottom:64px} }
    .rp-icbtn{width:44px;height:44px;border-radius:50%;display:inline-grid;place-items:center;cursor:pointer;flex-shrink:0;padding:0;transition:background-color ${MO.fast},border-color ${MO.fast}}
    .rp-icbtn-outline{border:1px solid ${T.line};background:${T.surface}}
    .rp-icbtn-outline:hover{border-color:${T.primary}}
    .rp-icbtn-plain{border:none;background:transparent}
    .rp-icbtn-plain:hover,.rp-icbtn-plain[aria-expanded=true]{background:${T.primaryBg}}
    .rp-icbtn-dark{border:1px solid ${ON.line};background:${ON.chip}}
    .rp-icbtn:disabled{cursor:not-allowed;background:${T.line};color:${T.muted}!important;border-color:${T.line}}
    /* Tuiles à cocher et bascules (état sélectionné de 1.6) */
    .rp-tile-btn{border:1.5px solid ${T.line}!important;background:${T.surface}!important;box-shadow:${SH.xs};transition:border-color ${MO.fast},background-color ${MO.fast}}
    .rp-tile-btn:hover{border-color:${T.primary}!important}
    .rp-tile.on .rp-tile-btn{border-color:${T.primary}!important;background:${T.primaryBg}!important;box-shadow:none}
    .rp-tile-box{background:${T.surface};border:1.5px solid ${T.lineStrong};color:${T.surface}}
    .rp-tile.on .rp-tile-box{background:${T.primary};border-color:${T.primary}}
    .rp-toggle{height:48px;padding:0 16px;border-radius:${RAD.md}px;cursor:pointer;font:${F("label")};border:1.5px solid ${T.lineStrong};background:${T.surface};color:${T.body};transition:border-color ${MO.fast},background-color ${MO.fast},color ${MO.fast}}
    .rp-toggle:hover{border-color:${T.primary}}
    .rp-toggle[aria-checked=true]{background:${T.primaryBg};border-color:${T.primary};color:${T.primary}}
    /* Mouvement */
    .rv{opacity:0;transform:translateY(12px);transition:opacity ${MO.reveal} ${MO.soft},transform ${MO.reveal} ${MO.soft}}
    .rv.is-in{opacity:1;transform:none}
    .strike{position:relative;display:inline-block}
    .strike::after{content:"";position:absolute;left:-2px;right:-2px;top:50%;height:2px;background:${T.error};transform:scaleX(0);transform-origin:left;transition:transform .4s ease .2s}
    .is-in .strike::after{transform:scaleX(1)}
    /* Texte barré lisible (contraste muted conservé, TST-07) : seul le trait rouge apparaît */
    .navlink{white-space:nowrap;font:${F("bodyStrong")};color:${T.body};background:none;border:none;cursor:pointer;padding:8px 4px;text-decoration:none;text-underline-offset:6px;text-decoration-thickness:2px}
    .navlink:hover{color:${T.primary}}
    .navlink.on{color:${T.primary};text-decoration:underline}
    /* En-tête */
    .rs-progress{position:absolute;left:0;right:0;bottom:-1px;height:3px;background:${T.primary};transform-origin:0 50%;transform:scaleX(0);pointer-events:none}
    .rs-menu{position:fixed;left:0;right:0;bottom:0;top:${HEADER_H}px;z-index:${Z.nav - 1};background:${T.bg};overflow-y:auto;padding:24px 24px 48px;display:flex;flex-direction:column;gap:8px;animation:rsMenu ${MO.base} ${MO.ease} both}
    @keyframes rsMenu{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:none}}
    .rs-menu a.rs-mlink{display:flex;align-items:center;justify-content:space-between;min-height:56px;padding:0 4px;border-bottom:1px solid ${T.line};text-decoration:none;color:${T.navy};font:${F("h2")}}
    .rs-menu a.rs-mlink[aria-current=page]{color:${T.primary}}
    .rs-burger{display:none!important}
    @media (max-width:1023px){ .rs-links,.rs-demo{display:none!important} .rs-burger{display:inline-grid!important} }
    /* Texte agrandi ou espacé : la navigation complète ne tient plus sous 1280 px, le menu repliable prend le relais */
    @media (max-width:1279px){ html[data-textsize=lg] .rs-links,html[data-textsize=lg] .rs-demo{display:none!important} html[data-textsize=lg] .rs-burger{display:inline-grid!important} }
    /* Titres et paragraphes : un mot long passe à la ligne plutôt que de faire déborder la page (texte agrandi, 320 px) */
    h1,h2,h3,h4,p,li,dt,dd,label,blockquote{overflow-wrap:anywhere}
    /* Puces */
    .rs-chip{display:inline-flex;align-items:center;gap:8px;min-height:40px;padding:8px 16px;border-radius:${RAD.pill}px;border:1.5px solid ${T.line};background:${T.surface};color:${T.body};cursor:pointer;font:${F("btnSm")};text-align:left;transition:background-color ${MO.fast},border-color ${MO.fast},color ${MO.fast}}
    .rs-chip:hover{border-color:${T.primary};color:${T.primary}}
    .rs-chip[aria-pressed=true],.rs-chip[aria-selected=true],.rs-chip[aria-checked=true]{background:${T.primaryBg};border-color:${T.primary};color:${T.primary}}
    .rs-chip:disabled{cursor:not-allowed;background:${T.line};border-color:${T.line};color:${T.muted}}
    .rs-chip-ai{color:${T.violet};border-color:${T.violet};max-width:100%}
    .rs-chip-ai:hover{background:${T.violetBg};border-color:${T.violet};color:${T.violet}}
    .rs-card-btn{display:block;width:100%;text-align:left;background:${T.surface};border:1px solid ${T.line};border-radius:${RAD.lg}px;padding:0;cursor:pointer;box-shadow:${SH.xs};overflow:hidden;color:inherit;font:inherit;transition:box-shadow ${MO.base} ${MO.ease},transform ${MO.base} ${MO.ease},border-color ${MO.fast}}
    .rs-card-btn:hover{box-shadow:${SH.lg};transform:translateY(-2px)}
    /* Accordéon */
    .rs-acc{border-bottom:1px solid ${T.line}}
    .rs-acc-btn{width:100%;display:flex;align-items:center;justify-content:space-between;gap:16px;min-height:56px;padding:16px 0;background:none;border:none;cursor:pointer;text-align:left;color:${T.navy};font:${F("h3")}}
    .rs-acc-btn:hover{color:${T.primary}}
    .rs-acc-btn svg{transition:transform ${MO.base} ${MO.ease};flex-shrink:0}
    .rs-acc-btn[aria-expanded=true] svg{transform:rotate(180deg)}
    .rs-acc-panel{padding:0 0 20px;color:${T.body};font:${F("body")};max-width:${W.read}px}
    .rs-acc-panel p{margin:0 0 12px}.rs-acc-panel p:last-child{margin:0}
    /* Champs (référentiel 5.3) */
    .rs-input{width:100%;height:48px;padding:0 16px;border-radius:${RAD.md}px;border:1.5px solid ${T.lineStrong};background:${T.surface};color:${T.navy};font:${F("input")};transition:border-color ${MO.fast},box-shadow ${MO.fast}}
    .rs-input-icon{padding-left:40px}
    .rs-input-code{height:56px;font:${F("code")};letter-spacing:.25em;text-align:center;text-transform:uppercase}
    textarea.rs-input{height:auto;min-height:96px;padding:12px 16px;resize:vertical}
    select.rs-input{appearance:none;-webkit-appearance:none;padding-right:40px}
    .rs-input::placeholder{color:${T.muted}}
    .rs-input:focus{outline:none;border-color:${T.primary}!important;box-shadow:${SH.ring}!important}
    .rs-input[aria-invalid=true]{border-color:${T.errorDk}}
    .rs-input:disabled{background:${T.lineLt}}
    .rs-check{display:flex;gap:12px;align-items:flex-start;cursor:pointer;color:${T.body};font:${F("body")}}
    .rs-check input{width:20px;height:20px;margin:2px 0 0;flex-shrink:0;accent-color:${T.primary};cursor:pointer}
    /* Héros */
    .rs-hero{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,.95fr);gap:64px;align-items:center}
    .rs-rot{display:grid}
    .rs-rot>span{grid-area:1/1;opacity:0;transform:translateY(.2em);transition:opacity ${MO.fade} ${MO.soft},transform ${MO.fade} ${MO.soft};padding-bottom:.08em}
    .rs-rot>span.on{opacity:1;transform:none}
    .rs-stage{position:relative;width:100%;max-width:${W.narrow}px;margin:0 auto}
    .rs-scene{position:absolute;inset:0;opacity:0;visibility:hidden;transition:opacity ${MO.fade} ${MO.soft},visibility 0s linear ${MO.fade}}
    .rs-scene.on{position:relative;opacity:1;visibility:visible;transition:opacity ${MO.fade} ${MO.soft},visibility 0s}
    .rs-pop{opacity:0;transform:translateY(12px);transition:opacity ${MO.reveal} ${MO.soft},transform ${MO.reveal} ${MO.soft}}
    .on .rs-pop{opacity:1;transform:none}
    .on .rs-pop.d1{transition-delay:.5s}.on .rs-pop.d2{transition-delay:1s}
    .rs-bubble{left:-32px}
    .rs-dot{width:44px;height:44px;border:none;background:none;padding:0;cursor:pointer;display:inline-grid;place-items:center;color:${T.primary}}
    .rs-dot i{display:block;height:8px;width:8px;border-radius:4px;background:${T.faint};transition:width ${MO.reveal} ${MO.soft},background-color ${MO.reveal} ${MO.soft}}
    .rs-dot[aria-current=true] i{width:24px;background:${T.primary}}
    /* Strate épinglée */
    .rs-strate{position:relative}
    .rs-panel{position:-webkit-sticky;position:sticky;top:${HEADER_H}px;height:calc(100vh - ${HEADER_H}px);height:calc(100svh - ${HEADER_H}px);display:flex;flex-direction:column;justify-content:center;padding:24px 0;overflow:hidden}
    .rs-pgrid{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:64px;align-items:center;min-height:0}
    .rs-step{display:flex;gap:16px;width:100%;text-align:left;background:none;border:none;padding:12px 0;cursor:pointer;color:inherit;font:inherit}
    .rs-step-bar{position:relative;width:3px;border-radius:2px;background:${T.line};flex-shrink:0;overflow:hidden}
    .rs-step-bar i{position:absolute;left:0;right:0;top:0;height:100%;background:${T.primary};transform-origin:50% 0;transform:scaleY(0)}
    .rs-step-d{display:grid;grid-template-rows:0fr;transition:grid-template-rows ${MO.slow} ${MO.soft},opacity ${MO.slow} ${MO.soft};opacity:0}
    .rs-step-d>div{overflow:hidden}
    .rs-step.on .rs-step-d{grid-template-rows:1fr;opacity:1}
    .rs-vis{position:absolute;inset:0;opacity:0;transform:translateY(12px);transition:opacity ${MO.slow} ${MO.soft},transform ${MO.slow} ${MO.soft};pointer-events:none}
    .rs-vis.on{opacity:1;transform:none}
    .rs-tabs-m{display:none}
    .rs-vcard{position:absolute;inset:0;background:${T.surface};border-radius:${RAD.xl}px;border:1px solid ${T.line};box-shadow:${SH.glow};overflow:hidden;transform-origin:50% 0;transition:transform ${MO.slow} ${MO.soft},opacity ${MO.slow} ${MO.soft},box-shadow ${MO.slow} ${MO.soft}}
    .rs-vcard.on{transform:none;opacity:1}
    .rs-vcard.past{transform:translateY(-20px) scale(.92);opacity:.6;box-shadow:${SH.sm}}
    .rs-vcard.next{transform:translateY(110%) rotate(2deg);opacity:0;pointer-events:none}
    /* Lignes d'encart du héros : du bas vers le haut, en fondu, à chaque arrivée de la scène */
    .rs-hl{background:${T.accentBg};border-radius:4px;padding:0 4px}
    .rs-line{opacity:0}
    .on .rs-line{animation:rsUp .45s ${MO.soft} both}
    /* Fond de l'accueil qui suit la souris */
    .rs-glow{position:fixed;inset:0;z-index:-1;pointer-events:none;overflow:hidden;-webkit-mask:${FADE_FOOT};mask:${FADE_FOOT}}
    .rs-glow>i{position:absolute;inset:-12%;background:radial-gradient(48vmax circle at var(--vx,72%) var(--vy,18%),${GLOW.violet},transparent 70%),radial-gradient(56vmax circle at var(--bx,28%) var(--by,82%),${GLOW.blue},transparent 70%);animation:rsDrift 26s ${MO.soft} infinite alternate}
    .rs-glow>b{position:absolute;inset:0;background:radial-gradient(22vmax circle at var(--px,50%) var(--py,50%),${T.bg} 0,${T.bg} 30%,transparent 100%);opacity:var(--clear,0);transition:opacity ${MO.slow} ${MO.soft}}
    @keyframes rsDrift{0%{transform:translate3d(0,0,0)}33%{transform:translate3d(-5%,3%,0)}66%{transform:translate3d(4%,-3%,0)}100%{transform:translate3d(-2%,5%,0)}}
    .rs-in{opacity:0;transform:translateY(12px);transition:opacity ${MO.reveal} ${MO.soft},transform ${MO.reveal} ${MO.soft}}
    .on .rs-in{opacity:1;transform:none}
    .rs-knob{left:4px;transition:left .25s ease .6s}
    .on .rs-knob{left:20px}
    .rs-track{background:${T.lineStrong};transition:background-color .25s ease .6s}
    .on .rs-track{background:${T.accent}}
    .rs-swap{transition:opacity .3s ease .7s}
    .rs-onl,.on .rs-off{opacity:0}
    .on .rs-onl{opacity:1}
    /* Carte de chronologie (retour descriptif) */
    @keyframes rsMask{from{transform:scaleX(1)}to{transform:scaleX(0)}}
    @keyframes rsHead{0%{left:0;opacity:1}92%{left:100%;opacity:1}100%{left:100%;opacity:0}}
    @keyframes rsPop{from{transform:translateX(-50%) scale(0)}to{transform:translateX(-50%) scale(1)}}
    @keyframes rsUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
    .rs-tl .rs-tl-mask{transform-origin:right;transform:scaleX(1)}
    .rs-tl .rs-tl-head{opacity:0}
    .rs-tl .rs-tl-pin{transform:translateX(-50%) scale(0)}
    .rs-tl .rs-tl-row,.rs-tl .rs-tl-facts{opacity:0}
    .rs-tl.play .rs-tl-mask{animation:rsMask 2s linear .2s both}
    .rs-tl.play .rs-tl-head{animation:rsHead 2.2s linear .2s both}
    .rs-tl.play .rs-tl-pin{animation:rsPop .24s cubic-bezier(.34,1.56,.64,1) both}
    .rs-tl.play .rs-tl-row{animation:rsUp .3s ${MO.ease} both}
    .rs-tl.play .rs-tl-facts{animation:rsUp .3s ${MO.ease} 2.2s both}
    /* Phrase qui se colore au défilement */
    .rs-phrase{position:relative}
    .rs-phrase-in{position:-webkit-sticky;position:sticky;top:${HEADER_H}px;height:calc(100vh - ${HEADER_H}px);height:calc(100svh - ${HEADER_H}px);display:flex;align-items:center}
    .rs-w{transition:color ${MO.reveal} ${MO.soft}}
    /* Cartes de fonctionnalités animées */
    .rs-fcards{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${GAP.grid}px}
    .rs-fcard{background:${T.surface};border:1px solid ${T.line};border-radius:${RAD.lg}px;padding:16px 16px 24px;box-shadow:${SH.xs};display:grid;gap:12px;align-content:start;transition:box-shadow ${MO.base} ${MO.ease},transform ${MO.base} ${MO.ease}}
    .rs-fcard:hover{box-shadow:${SH.glow};transform:translateY(-2px)}
    .rs-fvis{position:relative;height:168px;border-radius:${RAD.md}px;background:${T.bg};overflow:hidden;display:flex;flex-direction:column;justify-content:center;padding:16px}
    .rs-cyc>*{grid-area:1/1}
    .rs-cyc>*:not(:first-child){opacity:0}
    .play .rs-cyc>*{animation:rsCyc 9s infinite both}
    .play .rs-cyc>*:nth-child(2){animation-delay:3s}.play .rs-cyc>*:nth-child(3){animation-delay:6s}
    @keyframes rsCyc{0%{opacity:0;transform:translateY(8px)}4%,30%{opacity:1;transform:none}34%,100%{opacity:0;transform:translateY(-8px)}}
    .rs-jobs>span:first-child{background:${T.primaryBg};border-color:${T.primary};color:${T.primary}}
    .play .rs-jobs>span{animation:rsJob 9s infinite both}
    .play .rs-jobs>span:nth-child(2){animation-delay:3s}.play .rs-jobs>span:nth-child(3){animation-delay:6s}
    @keyframes rsJob{0%,33%{background:${T.primaryBg};border-color:${T.primary};color:${T.primary}}34%,100%{background:${T.surface};border-color:${T.line};color:${T.body}}}
    .rs-fhl{background-repeat:no-repeat;background-size:100% 100%;border-radius:4px;padding:0 2px}
    .play .rs-fhl{animation:rsHl 6s infinite both}
    .play .rs-fhl.h2{animation-delay:.8s}
    @keyframes rsHl{0%,8%{background-size:0% 100%}20%,85%{background-size:100% 100%}95%,100%{background-size:0% 100%}}
    .rs-ftag{opacity:1}
    .play .rs-ftag{animation:rsTag 6s infinite both}
    .play .rs-ftag.t2{animation-delay:.3s}
    @keyframes rsTag{0%,22%{opacity:0;transform:translateY(8px)}30%,85%{opacity:1;transform:none}95%,100%{opacity:0}}
    .rs-digits{display:inline-block;height:1em;overflow:hidden;vertical-align:top}
    .rs-digits>span{display:block}
    .play .rs-digits>span{animation:rsDig 10s steps(10) infinite}
    @keyframes rsDig{from{transform:translateY(0)}to{transform:translateY(-10em)}}
    .rs-wave{display:flex;align-items:center;gap:4px;height:40px}
    .rs-wave i{display:block;width:4px;border-radius:2px;background:${T.primary};height:40%}
    .play .rs-wave i{animation:rsWave 1.2s ease-in-out infinite}
    @keyframes rsWave{0%,100%{transform:scaleY(.5)}50%{transform:scaleY(1.4)}}
    .rs-typing{display:none}
    .play .rs-typing{display:inline-flex;position:absolute;top:16px;left:16px;animation:rsTypeA 6s infinite both}
    .play .rs-answer{animation:rsTypeB 6s infinite both}
    @keyframes rsTypeA{0%,40%{opacity:1}45%,100%{opacity:0}}
    @keyframes rsTypeB{0%,44%{opacity:0;transform:translateY(8px)}52%,92%{opacity:1;transform:none}100%{opacity:0}}
    .rs-seg{position:relative;display:grid;grid-template-columns:1fr 1fr;background:${T.surface};border:1px solid ${T.line};border-radius:${RAD.md}px;padding:4px}
    .rs-seg>i{position:absolute;top:4px;bottom:4px;left:4px;width:calc(50% - 4px);border-radius:12px;background:${T.primaryBg};border:1.5px solid ${T.primary}}
    .play .rs-seg>i{animation:rsSeg 6s ${MO.ease} infinite both}
    @keyframes rsSeg{0%,40%{transform:none}50%,90%{transform:translateX(100%)}100%{transform:none}}
    .rs-seg>span{position:relative;text-align:center;padding:8px 4px;font:${F("label")};color:${T.navy}}
    .rs-band{padding:48px}
    /* Article */
    .rs-prose{color:${T.body};font:${F("bodyLg")}}
    .rs-prose h2{font:800 calc(24px * var(--fs))/1.25 ${FD};letter-spacing:-.02em;color:${T.navy};margin:48px 0 16px;scroll-margin-top:${GAP.section + 16}px}
    .rs-prose h3{font:700 calc(18px * var(--fs))/1.4 ${FD};color:${T.navy};margin:32px 0 12px}
    .rs-prose p{margin:0 0 16px}
    .rs-prose ul,.rs-prose ol{margin:0 0 16px;padding-left:24px}
    .rs-prose li{margin:0 0 8px;padding-left:4px}
    .rs-prose strong{color:${T.navy};font-weight:700}
    .rs-prose a{color:${T.primary};font-weight:600;text-underline-offset:3px}
    .rs-prose>:first-child{margin-top:0}
    .rs-callout{border-radius:${RAD.md}px;padding:16px 20px;margin:24px 0;font:${F("bodyLg")}}
    .rs-callout p:last-child,.rs-callout ul:last-child{margin-bottom:0}
    .rs-callout-t{display:flex;align-items:center;gap:8px;font:${F("overline")};letter-spacing:.08em;text-transform:uppercase;margin-bottom:8px}
    .rs-quote{border-left:3px solid ${T.primary};padding:8px 0 8px 24px;margin:32px 0;color:${T.navy};font:${F("quote")}}
    .rs-quote p{margin:0 0 8px}
    .rs-toc a{display:block;padding:8px 0 8px 12px;border-left:2px solid ${T.line};color:${T.body};text-decoration:none;font:${F("small")}}
    .rs-toc a:hover{color:${T.primary};border-left-color:${T.primary}}
    .rs-art{display:grid;grid-template-columns:240px minmax(0,1fr);gap:64px;align-items:start}
    .rs-art-side{position:-webkit-sticky;position:sticky;top:${HEADER_H + 32}px}
    /* Grilles */
    .rs-g2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:${GAP.grid}px}
    .rs-g3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:${GAP.grid}px}
    .rs-g4{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:${GAP.grid}px}
    .rs-split{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:64px;align-items:center}
    .rs-chips{display:flex;gap:8px;flex-wrap:wrap}
    .rp-split{display:grid;grid-template-columns:minmax(0,3fr) minmax(0,2fr);gap:${GAP.grid}px;align-items:start}
    .rp-stack{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:${GAP.grid}px}
    @media (max-width:1023px){ .rs-g4{grid-template-columns:repeat(2,minmax(0,1fr))} .rs-art{grid-template-columns:minmax(0,1fr);gap:32px} .rs-art-side{position:static} }
    @media (prefers-reduced-motion: reduce){
      *,*::before,*::after{animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001ms!important;transition-delay:0s!important;scroll-behavior:auto!important}
    }
    /* Options d'accessibilité (docs/design-system.md, section 8 bis) : attributs posés sur <html> par src/lib/a11y.js */
    html[data-motion=reduce] *,html[data-motion=reduce] *::before,html[data-motion=reduce] *::after{animation-duration:.001ms!important;animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:.001ms!important;transition-delay:0s!important;scroll-behavior:auto!important}
    html[data-spacing=on] body *{letter-spacing:.12em!important;word-spacing:.16em!important}
    html[data-spacing=on] :is(p,li,dd,dt,label,blockquote,td,th,h1,h2,h3,h4,.rs-prose){line-height:1.8!important}
    html[data-spacing=on] :is(p,li,dd,blockquote,h1,h2,h3,h4){text-align:left!important}
    html[data-spacing=on] p{margin-bottom:.5em}
    html[data-focusmode=on] .rp-deco,html[data-focusmode=on] .rs-fvis{display:none!important}
    html[data-focusmode=on] *,html[data-focusmode=on] *::before,html[data-focusmode=on] *::after{animation-iteration-count:1!important}
    html[data-links=on] a,html[data-links=on] .navlink,html[data-links=on] .rp-link{text-decoration:underline!important;text-underline-offset:3px}
    html[data-focusring=on] :focus-visible{outline:3px solid ${T.navy}!important;outline-offset:3px!important;box-shadow:${SH.ring}!important}
    .rp-ruler{position:fixed;left:0;right:0;z-index:${Z.modal + 1};background:${T.overlay};pointer-events:none}
    /* Options d'accessibilité (8 bis) : languette en demi-cercle au bord gauche (milieu de l'écran ; en bas à gauche sur mobile),
       qui s'allonge au survol et au focus ; le panneau se déploie depuis elle (clip-path de la forme de la languette au panneau). */
    .rp-a11y{--a11y-w:32px;--a11y-h:52px}
    .rp-a11y-tab{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:${Z.nav + 1};width:var(--a11y-w);height:var(--a11y-h);color:${T.surface}!important;transition:opacity ${MO.base} ${MO.ease}}
    .rp-a11y-knob,.rp-a11y-label{position:absolute;top:0;left:0;height:100%;display:flex;align-items:center;background:${T.primary};border-radius:0 ${RAD.pill}px ${RAD.pill}px 0;transition:background-color ${MO.fast}}
    .rp-a11y-knob{z-index:1;width:var(--a11y-w);padding-left:6px}
    .rp-a11y-label{padding:0 20px 0 calc(var(--a11y-w) + 8px);font:${F("label")};white-space:nowrap;transform:translateX(calc(var(--a11y-w) - 100%));transition:transform .3s ${MO.ease},background-color ${MO.fast}}
    .rp-a11y-tab:focus-visible{outline:none}
    .rp-a11y-tab:focus-visible .rp-a11y-label{transform:none;outline:2px solid ${T.primary};outline-offset:2px}
    @media (hover:hover){.rp-a11y-tab:hover .rp-a11y-label{transform:none}.rp-a11y-tab:hover :is(.rp-a11y-knob,.rp-a11y-label){background:${T.primaryDk}}}
    .rp-a11y.is-open .rp-a11y-tab{opacity:0;pointer-events:none}
    .rp-a11y-panel{position:fixed;left:0;top:50%;transform:translateY(-50%);z-index:${Z.modal};width:min(640px,calc(100vw - 16px));filter:drop-shadow(${SH.lg});visibility:hidden;transition:visibility 0s linear .45s}
    .rp-a11y.is-open .rp-a11y-panel{visibility:visible;transition:none}
    .rp-a11y-shape{display:flex;flex-direction:column;max-height:calc(100vh - 32px);max-height:calc(100dvh - 32px);background:${T.surface};border:1px solid ${T.line};border-left:none;border-radius:0 ${RAD.lg}px ${RAD.lg}px 0;overflow:hidden;clip-path:inset(calc(50% - var(--a11y-h) / 2) calc(100% - var(--a11y-w)) calc(50% - var(--a11y-h) / 2) 0 round 0 26px 26px 0);transition:clip-path .45s ${MO.soft}}
    .rp-a11y.is-open .rp-a11y-shape{clip-path:inset(0 0 0 0 round 0 ${RAD.lg}px ${RAD.lg}px 0)}
    .rp-a11y-shape>*{opacity:0;transition:opacity ${MO.base} ${MO.ease}}
    .rp-a11y.is-open .rp-a11y-shape>*{opacity:1;transition:opacity ${MO.base} ${MO.ease} .12s}
    .rp-a11y-head{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:12px 12px 12px 24px;border-bottom:1px solid ${T.line};flex-shrink:0}
    .rp-a11y-body{padding:16px 16px 16px 16px;overflow-y:auto;overscroll-behavior:contain}
    .rp-a11y-cols{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:16px 24px}
    .rp-a11y-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;padding:8px 12px 8px 24px;border-top:1px solid ${T.line};flex-shrink:0}
    .rp-a11y section>h3{padding:0 8px}
    .rp-a11y-row{display:flex!important;align-items:center;justify-content:space-between;gap:12px;width:100%;min-height:48px;padding:4px 8px!important;border-radius:${RAD.sm}px!important;text-align:left!important;transition:background-color ${MO.fast}}
    .rp-a11y-row:hover{background:${T.primaryBg}!important}
    .rp-a11y-sw{position:relative;flex-shrink:0;width:40px;height:24px;border-radius:${RAD.pill}px;border:1.5px solid ${T.lineStrong};background:${T.surface};transition:background-color ${MO.base} ${MO.ease},border-color ${MO.base} ${MO.ease}}
    .rp-a11y-sw i{position:absolute;top:2px;left:2px;width:17px;height:17px;border-radius:50%;background:${T.lineStrong};color:${T.primary};display:grid;place-items:center;transition:transform ${MO.base} ${MO.ease},background-color ${MO.base} ${MO.ease}}
    .rp-a11y-row[aria-checked=true] .rp-a11y-sw{background:${T.primary};border-color:${T.primary}}
    .rp-a11y-row[aria-checked=true] .rp-a11y-sw i{transform:translateX(16px);background:${T.surface}}
    .rp-a11y-seg{display:flex;flex-wrap:wrap;gap:8px}
    .rp-a11y-seg-2{display:grid;grid-template-columns:repeat(2,minmax(0,1fr))}
    .rp-a11y .rp-toggle{height:auto;min-height:44px;padding:4px 12px;flex:1 1 auto}
    /* Jamais par-dessus un menu, un panneau ou une fenêtre ouverts */
    html.rp-menu-open .rp-a11y-tab,html.rp-account-open .rp-a11y-tab,html.rp-lock .rp-a11y-tab{display:none!important}
    /* Point de rupture unique : 760 px (référentiel 6) */
    @media (max-width:760px){
      .rp-hide-m,.rp-rail-other{display:none!important}
      .rp-show-m{display:inline}
      .rp-nav{padding:0 16px!important;height:${HEADER_H_M}px!important;gap:8px}
      /* Boutons de l'en-tête : texte agrandi plafonné à 115 % pour que logo, « Mon espace », accessibilité et menu tiennent sur une ligne */
      .rp-nav button{font-size:calc(13px * min(var(--fs, 1), 1.15))!important}
      .rp-nav nav{gap:8px!important}
      .rp-nav nav .navlink{font-size:calc(13px * var(--fs))}
      .ty-display{font-size:calc(${TY_MOBILE.display}px * var(--fs))!important} .ty-xl{font-size:calc(${TY_MOBILE.xl}px * var(--fs))!important} .ty-h1{font-size:calc(${TY_MOBILE.h1}px * var(--fs))!important} .ty-lead{font-size:calc(${TY_MOBILE.lead}px * var(--fs))!important}
      .rp-pad-sm{padding:${PAD_MOBILE.sm}px!important} .rp-pad-md{padding:${PAD_MOBILE.md}px!important} .rp-pad-lg{padding:${PAD_MOBILE.lg}px!important}
      .rp-page{padding:${PAD_MOBILE.page}!important}
      .rp-btn-sm{min-height:44px!important}
      .rp-actions{flex-direction:column-reverse;align-items:stretch!important}
      .rp-actions>*{width:100%}
      .rp-actions>.rp-back{width:auto;align-self:flex-start}
      .rp-stack,.rp-split{grid-template-columns:minmax(0,1fr)!important}
      .rp-pad,.rs-pad{padding-left:16px!important;padding-right:16px!important}
      .rp-wide-m{width:100%}
      .rp-wide-m>button{width:100%}
      .rp-trust{display:grid!important;grid-template-columns:1fr;gap:0 16px!important}
      .rp-fgroups{grid-template-columns:minmax(0,1fr)!important;gap:16px!important}
      .rp-ai-panel{left:0;right:0;top:auto;bottom:0;width:auto;height:62vh;height:62svh;border-radius:${RAD.lg}px ${RAD.lg}px 0 0}
      @keyframes rpAiIn{from{opacity:0;transform:translateY(24px)}to{opacity:1;transform:none}}
      html.rp-asst-open .rp-app{padding-bottom:62vh;padding-bottom:62svh}
      .rp-flow{flex-direction:column;gap:20px!important;overflow:visible!important}
      .rp-flow-step{flex:none!important;min-width:0!important}
      .rs-menu{top:${HEADER_H_M}px;padding:16px 16px 40px}
      .rp-account{width:100vw}
      .rs-hero{grid-template-columns:minmax(0,1fr);gap:40px}
      .rs-bubble{left:-8px}
      .rs-card-pos{right:8px!important;width:min(310px,calc(100% - 16px))!important}
      .rs-fcards{display:flex;overflow-x:auto;scroll-snap-type:x mandatory;gap:16px;margin:0 -16px;padding:4px 16px 16px;scroll-padding:0 16px;-webkit-overflow-scrolling:touch}
      .rs-fcard{flex:0 0 82%;scroll-snap-align:start}
      .rs-phrase-in{top:${HEADER_H_M}px;height:calc(100vh - ${HEADER_H_M}px);height:calc(100svh - ${HEADER_H_M}px)}
      .rs-phrase-t{font-size:calc(32px * var(--fs))!important}
      .rs-g2,.rs-g3,.rs-g4,.rs-split{grid-template-columns:minmax(0,1fr);gap:16px}
      .rs-split{gap:32px}
      .rs-panel{top:${HEADER_H_M}px;height:calc(100vh - ${HEADER_H_M}px);height:calc(100svh - ${HEADER_H_M}px);justify-content:flex-start;padding:16px 0}
      .rs-pgrid{grid-template-columns:minmax(0,1fr);grid-template-rows:auto minmax(0,1fr);gap:16px;flex:1}
      .rs-steps-d{display:none!important}
      .rs-tabs-m{display:block}
      .rs-visbox{height:auto!important;min-height:300px}
      .rs-section{padding-top:48px!important}
      .rp-a11y{--a11y-w:28px;--a11y-h:48px}
      .rp-a11y-tab{top:auto;bottom:16px;transform:none}
      .rp-a11y-knob{padding-left:4px}
      .rp-a11y-panel{top:auto;bottom:16px;transform:none}
      .rp-a11y-shape{max-height:calc(100vh - ${HEADER_H_M + 32}px);max-height:calc(100dvh - ${HEADER_H_M + 32}px);clip-path:inset(calc(100% - var(--a11y-h)) calc(100% - var(--a11y-w)) 0 0 round 0 26px 26px 0)}
      .rp-a11y-cols{grid-template-columns:minmax(0,1fr)}
      .rp-a11y-head{padding-left:16px} .rp-a11y-body{padding:12px 8px} .rp-a11y-foot{padding-left:16px}
      html.rp-asst-open .rp-a11y-tab{display:none!important}
      .rs-chips.rs-scroll{flex-wrap:nowrap;overflow-x:auto;margin:0 -16px;padding:0 16px 4px}
      .rs-prose h2{font-size:calc(20px * var(--fs))}
      .rs-quote{font-size:calc(18px * var(--fs))}
      .rs-band{padding:32px 24px}
    }
    @media (max-height:520px){ .rs-panel{position:static!important;height:auto!important} }
    @media (max-width:360px){ .rp-hide-xs{display:none!important} }
    /* En-tête des petits écrans : logo réduit, puis option d'accessibilité déplacée dans le menu (elle y est déjà) */
    @media (max-width:420px){ .rp-head-logo .rp-logo-sym{height:30px!important} .rp-head-logo .rp-logo-word{height:28px!important} }
    @media (max-width:359px){ .rp-nav{padding:0 12px!important} }
    /* Bouton d'accessibilité de l'en-tête remplacé par la languette du bord gauche (8 bis) ; l'entrée du menu mobile et de « Mon compte » reste */
    .rp-head-a11y{display:none!important}
    /* Cibles tactiles de 44 px (référentiel 8) sur mobile et sur tout écran tactile */
    @media (max-width:760px),(pointer:coarse){
      .rs-chip,[role=tab]{min-height:44px}
      .rs-toc a{min-height:44px;display:flex;align-items:center}
      .rp-crumbs a,.rp-sources a{display:inline-flex;align-items:center;min-height:44px}
      .rp-ai-bubble a,.rp-ai-bubble button{min-height:44px}
    }
    @media print{header,footer,.noprint{display:none!important}body{background:${T.surface}}}
    ::-webkit-scrollbar{height:8px;width:8px}::-webkit-scrollbar-thumb{background:${T.line};border-radius:4px}
  `}</style>
);
