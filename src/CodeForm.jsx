import React, { useState } from "react";
import { GAP, Btn, I, Field, Input } from "./ui.jsx";
import { TRIAL_CODE, findParcours } from "./lib/store.js";

/* Saisie du code d'accès, commune à « Mon espace » et à l'entrée de l'espace (ARC-15). */
export const CODE_ERR = "Ce code ne fonctionne pas. Vérifiez les 6 caractères, ou demandez-le à votre coach.";

export default function CodeForm({ id = "code", initial, invalid, onOk, hint, size = "md", footer, grow = false }) {
  const [code, setCode] = useState((initial || TRIAL_CODE).toUpperCase());
  /* Erreur posée d'office seulement si le code reçu par le lien est inconnu (BUG-04). */
  const [err, setErr] = useState(invalid ? CODE_ERR : "");
  const submit = e => {
    e?.preventDefault();
    const p = findParcours(code);
    if (!p) return setErr(CODE_ERR);
    onOk(p.code); // pas d'attente artificielle (UI-10)
  };
  return (
    <form onSubmit={submit} style={{ display: "flex", flexDirection: "column", gap: grow ? GAP.field : GAP.grid, flex: grow ? 1 : undefined }}>
      <Field id={id} label="Votre code d'accès" hint={hint} error={err}>
        <Input id={id} variant="code" hint={!!hint} error={err} value={code} autoComplete="off" maxLength={6} placeholder="6 caractères"
          onChange={e => { setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")); setErr(""); }} />
      </Field>
      <div style={{ marginTop: grow ? "auto" : 0, display: "grid", gap: 12 }}>
        <Btn kind="objective" size={size} full disabled={code.length < 6} iconRight={I.arrow}>Ouvrir mon espace</Btn>
        {footer}
      </div>
    </form>
  );
}
