/* Espace coach (ARC-10) : liste des parcours, création, fiche d'un parcours, relecture. Un fichier par vue dans ce
   dossier ; les données restent nommées « counselor » dans src/lib/store.js pour ne pas migrer le stockage (ARC-19). */
import React, { useEffect, useState } from "react";
import { T, PAD, GAP, W, Btn, I, Txt, Notice, Modal } from "../ui.jsx";
import { useStore } from "../lib/store.js";
import { useTitle, useFocusOnChange } from "../lib/hooks.js";
import { writeHash, coachSub, parseCoachSub } from "../lib/viewHash.js";
import { Withdrawn, actions, stack } from "./shared.jsx";
import { List } from "./List.jsx";
import { Create, Created } from "./Create.jsx";
import { Parcours } from "./Parcours.jsx";
import { Review } from "./Review.jsx";
import { Compare } from "./Compare.jsx";
import { comparable } from "../lib/compare.js";

export default function Counselor({ sub = "" }) {
  const s = useStore();
  /* Vue dans l'ancre (BUG-07) : #/coach, #/coach/parcours/CODE, #/coach/relecture/CODE/RÉPONSE. */
  const [view, setViewState] = useState(() => parseCoachSub(sub));
  const setView = (v, replace = false) => { setViewState(v); const sb = coachSub(v); writeHash(`#/coach${sb ? `/${sb}` : ""}`, replace); window.scrollTo({ top: 0 }); };
  useEffect(() => { const t = parseCoachSub(sub); if (coachSub(t) !== coachSub(view)) setViewState(t); }, [sub]); // eslint-disable-line
  const [modal, setModal] = useState(null); // null | { step: "create" } | { step: "created", code }
  const [gone, setGone] = useState("");
  /* Parcours ou réponse supprimés ailleurs (autre onglet, retrait de l'accord) : retour à la liste avec un message (BUG-09). */
  const cmpTakes = view.name === "compare" ? [s.takes[view.a], s.takes[view.b]] : [];
  const missing = (view.name === "parcours" && !s.parcours[view.code]) || (view.name === "review" && (!s.parcours[view.code] || !s.takes[view.takeId]))
    || (view.name === "compare" && (!s.parcours[view.code] || view.a === view.b || !cmpTakes.every(t => t && t.code === view.code)));
  useEffect(() => {
    if (!missing) return;
    if (view.name !== "parcours" && s.parcours[view.code]) { setGone("Cet entretien n'existe plus."); setView({ name: "parcours", code: view.code }, true); }
    else { setGone("Ce parcours n'existe plus."); setView({ name: "list" }, true); }
  }, [missing]); // eslint-disable-line
  useEffect(() => { if (!missing && gone) { const t = setTimeout(() => setGone(""), 8000); return () => clearTimeout(t); } }, [view]); // eslint-disable-line
  /* Un titre de page et un h1 propres à chaque vue (A11Y-06, A11Y-07), focus sur le titre au changement de vue (A11Y-02). */
  useTitle(view.name === "list" ? "Mes parcours" : view.name === "parcours" ? `Parcours de ${s.parcours[view.code]?.prenom || ""}` : view.name === "compare" ? "Comparaison de deux entretiens" : "Relecture");
  useFocusOnChange(`${view.name}-${view.code || ""}-${view.takeId || ""}-${view.a || ""}-${view.b || ""}`);
  if (!s.counselor) return null; // sans connexion, App affiche « Mon espace » (connexion intégrée)

  return (
    <main className="rp-page" style={{ maxWidth: W.wide, margin: "0 auto", padding: PAD.page, ...stack(GAP.grid) }}>
      <div style={{ ...actions, alignItems: "flex-end" }} className="noprint">
        <div style={stack(4)}>
          {view.name === "list"
            ? <><Txt v="small" color={T.body}>Bienvenue {(s.counselor.name || "").split(" ")[0]}</Txt><Txt v="h1" as="h1" color={T.navy}>Mes parcours</Txt><Txt v="body" color={T.body}>Vos parcours et les entretiens que l'on vous a envoyés</Txt></>
            : <Txt v="body" color={T.body}>Bienvenue {(s.counselor.name || "").split(" ")[0]} · vos parcours et les entretiens que l'on vous a envoyés</Txt>}
        </div>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <Btn kind={view.name === "list" ? "primary" : "secondary"} size="sm" onClick={() => setView({ name: "list" })} aria-current={view.name === "list" ? "page" : undefined}>Mes parcours</Btn>
          <Btn kind="secondary" size="sm" onClick={() => setModal({ step: "create" })} icon={I.plus}>Créer un parcours</Btn>
        </div>
      </div>
      {gone && <Notice tone="info" role="status">{gone}</Notice>}
      <div key={view.name + (view.code || "") + (view.takeId || "") + (view.a || "") + (view.b || "")} className="up">
        {view.name === "list" && <List s={s} open={code => setView({ name: "parcours", code })} create={() => setModal({ step: "create" })} />}
        {view.name === "parcours" && s.parcours[view.code] && <Parcours s={s} p={s.parcours[view.code]} back={() => setView({ name: "list" })} review={takeId => setView({ name: "review", code: view.code, takeId })} compare={(a, b) => setView({ name: "compare", code: view.code, a, b })} />}
        {/* Comparaison : seulement deux entretiens envoyés, avec leur analyse. Un entretien non envoyé (ou repris) n'est jamais affiché. */}
        {view.name === "compare" && !missing && (cmpTakes.every(t => t.shared && comparable(t))
          ? <Compare p={s.parcours[view.code]} a={cmpTakes[0]} b={cmpTakes[1]} back={() => setView({ name: "parcours", code: view.code })} review={takeId => setView({ name: "review", code: view.code, takeId })} />
          : <Withdrawn back={() => setView({ name: "parcours", code: view.code })} />)}
        {view.name === "review" && s.takes[view.takeId] && (s.takes[view.takeId].shared
          ? <Review s={s} p={s.parcours[view.code]} take={s.takes[view.takeId]} back={() => setView({ name: "parcours", code: view.code })} />
          : <Withdrawn back={() => setView({ name: "parcours", code: view.code })} />)}
      </div>
      {modal?.step === "create" && (
        <Modal close={() => setModal(null)} title="Créer un parcours" sub="Vous obtenez un code d'accès à transmettre. La personne n'a pas de compte à créer.">
          <Create done={code => setModal({ step: "created", code })} cancel={() => setModal(null)} />
        </Modal>
      )}
      {modal?.step === "created" && (
        <Modal close={() => setModal(null)} label="Parcours créé">
          <Created p={s.parcours[modal.code]} back={() => { setModal(null); setView({ name: "list" }); }} openAsBenef={() => { location.hash = `#/s/${modal.code}`; }} />
        </Modal>
      )}
    </main>
  );
}
