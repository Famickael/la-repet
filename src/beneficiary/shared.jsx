import React from "react";
import { PAD, GAP, Link, I, Notice } from "../ui.jsx";
import { loadVideoUrl, exportData, loadMediaBlob, mediaFileName } from "../lib/store.js";
import { hasMedia, isAudio, noFeedback } from "../lib/takes.js";
import { dateTime, duration } from "../lib/format.js";

/* Ouvrir une réponse : choix du mode de lecture seulement s'il y a un retour de l'assistant et un enregistrement. */
export const openView = t => (!hasMedia(t) ? ["report", "simple"] : noFeedback(t) ? ["report", "video"] : ["choose", "simple"]);

export const wrap = w => ({ maxWidth: w, margin: "0 auto", width: "100%" });

export const stack = (gap = GAP.stack) => ({ display: "grid", gap });

export const dateFr = dateTime; // formats uniques (src/lib/format.js)

export const dur = duration;

export const actions = { display: "flex", justifyContent: "space-between", alignItems: "center", gap: GAP.actions, flexWrap: "wrap" };

export const PAGE = { padding: PAD.page };

export function EmotionNote({ setModal }) {
  return (
    <Notice tone="ai" icon={I.shield}>
      <strong>L'assistant ne cherche pas à deviner vos émotions.</strong> Il analyse seulement ce qui se voit et ce qui s'entend.{" "}
      <Link onClick={() => setModal("assistant")}>En savoir plus sur ce choix</Link>
    </Notice>
  );
}

/* Portabilité : télécharger sa réponse (fichier local, rien n'est envoyé). */
export async function downloadTake(take) {
  const url = await loadVideoUrl(take.id);
  if (!url) return;
  const a = document.createElement("a");
  a.href = url; a.download = `la-repet-reponse-${take.createdAt.slice(0, 10)}.${take.mime?.includes("mp4") ? (isAudio(take) ? "m4a" : "mp4") : "webm"}`; // BUG-28
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}

/* Portabilité (B7, C9) : « Télécharger mes données » crée sur l'appareil un fichier JSON lisible (parcours, réponses,
   textes, retours, rapports du coach). Les vidéos se téléchargent à part, une par une. Rien n'est envoyé. */
function saveFile(blob, name) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = name;
  document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 4000);
}
export function downloadData(code) {
  const data = exportData(code);
  if (!data) return false;
  saveFile(new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }), `la-repet-mes-donnees-${new Date().toISOString().slice(0, 10)}.json`);
  return true;
}
/* Renvoie le nombre de fichiers enregistrés ; un court délai entre deux fichiers évite que le navigateur en bloque. */
export async function downloadAllMedia(takes) {
  let n = 0;
  for (const t of takes.filter(hasMedia)) {
    const blob = await loadMediaBlob(t.id);
    if (!blob) continue;
    saveFile(blob, mediaFileName(t));
    n++;
    await new Promise(r => setTimeout(r, 600));
  }
  return n;
}
