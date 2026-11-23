/* Page d'accueil (ARC-10). Ordre recommandé par le panel bénéficiaires (21 novembre 2026, section 5) : héros,
   bandeau de réassurance, phrase (remontée sous le bandeau à la demande du propriétaire), strate des quatre étapes,
   ce que La Répét' ne fait pas, outils, portes d'entrée (bandeau final et mini FAQ retirés à la demande du propriétaire). Un fichier par section dans ce dossier. */
import React from "react";
import { W, PAD } from "../ui.jsx";
import { Background } from "./Background.jsx";
import { Hero } from "./Hero.jsx";
import { Strate } from "./Strate.jsx";
import { Phrase } from "./Phrase.jsx";
import { Features, ForWho, NotDo, Reassurance } from "./Features.jsx";

/* Le détail par public est dans « Cas d'usage », le détail de l'outil dans « Solutions ». */

const wrap = { maxWidth: W.page, margin: "0 auto", padding: PAD.wrap };

export default function Home({ go, openSpace }) {
  return (
    <main className="rs-home" style={{ position: "relative", isolation: "isolate" }}>
      <Background />
      <Hero openSpace={openSpace} />
      <div className="rs-pad" style={wrap}><Reassurance /></div>
      <Phrase />
      <Strate />
      <div className="rs-pad" style={wrap}><NotDo /></div>
      <div className="rs-pad" style={wrap}>
        <Features />
        <ForWho go={go} openSpace={openSpace} />
      </div>
    </main>
  );
}
