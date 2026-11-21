/* Caméra et micro : ouverture et messages d'erreur partagés par l'enregistreur et l'échauffement (BUG-24, ARC-11). */

export const CONSTRAINTS = {
  audio: { audio: { echoCancellation: true, noiseSuppression: true } },
  video: { audio: { echoCancellation: true, noiseSuppression: true }, video: { width: { ideal: 640 }, height: { ideal: 360 }, facingMode: "user" } },
};

export async function openStream(audioOnly) {
  if (!navigator.mediaDevices?.getUserMedia) { const e = new Error("getUserMedia indisponible"); e.name = "NotSupportedError"; throw e; }
  return navigator.mediaDevices.getUserMedia(audioOnly ? CONSTRAINTS.audio : CONSTRAINTS.video);
}

/* Message adapté à la cause : accès refusé, appareil absent, appareil déjà utilisé, navigateur trop ancien. */
export function mediaError(e, { warmup = false } = {}) {
  const alt = warmup ? "passez en voix seule" : "choisissez « Voix seule »";
  switch (e?.name) {
    case "NotAllowedError": case "SecurityError":
      return { title: "Accès refusé", text: `L'accès a été refusé. Autorisez la caméra ou le micro dans les réglages du navigateur, ou ${alt}.` };
    case "NotReadableError": case "TrackStartError": case "AbortError":
      return { title: "Caméra ou micro déjà utilisé", text: "Une autre application utilise peut-être la caméra ou le micro. Fermez-la, puis réessayez." };
    case "NotSupportedError":
      return { title: "Enregistrement indisponible", text: "Ce navigateur ne permet pas d'enregistrer. Essayez avec une version récente de Chrome, Firefox, Edge ou Safari." };
    case "ended":
      return { title: "Caméra ou micro coupé", text: "La caméra ou le micro s'est arrêté (autorisation retirée ou appareil débranché). Vous pouvez réessayer." };
    default:
      return { title: "Caméra ou micro introuvable", text: warmup ? "Aucune caméra ou aucun micro n'est disponible sur cet appareil. Vous pouvez faire l'échauffement sans aperçu." : "Aucune caméra ou aucun micro n'est disponible sur cet appareil." };
  }
}

/* Appelle onEnded si une piste s'arrête d'elle-même (autorisation retirée, appareil débranché). */
export function watchEnded(stream, onEnded) {
  const tracks = stream.getTracks();
  const on = () => onEnded();
  tracks.forEach(t => t.addEventListener("ended", on));
  return () => tracks.forEach(t => t.removeEventListener("ended", on));
}
