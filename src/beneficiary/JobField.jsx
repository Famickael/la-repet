import React, { useEffect, useRef, useState } from "react";
import { T, TY, RAD, SH, Icon, I, Field, Input } from "../ui.jsx";
import { updateParcours } from "../lib/store.js";
import { PHRASES } from "../content/legal.js";
import { searchJobs, norm } from "../lib/jobs.js";
import { stack } from "./shared.jsx";

/* Métier visé : champ avec autocomplétion accessible (combobox), saisie libre acceptée. */
export function JobField({ p }) {
  const [val, setVal] = useState(p.poste || "");
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [status, setStatus] = useState("");
  const valRef = useRef(val); valRef.current = val;
  const blurT = useRef(0);
  useEffect(() => () => clearTimeout(blurT.current), []);
  useEffect(() => { if (!open) setVal(p.poste || ""); }, [p.poste]); // eslint-disable-line

  const matches = searchJobs(val, 8);
  const typed = val.trim();
  const exact = matches.some(m => norm(m) === norm(typed));
  const items = typed && !exact ? [...matches, { free: typed }] : matches;
  const labelOf = it => (typeof it === "string" ? it : it.free);

  const commit = v => {
    const t = (v || "").trim();
    setOpen(false); setActive(-1);
    if (!t) { setVal(p.poste || ""); return; }
    setVal(t);
    if (t !== p.poste) { updateParcours(p.code, { poste: t }); setStatus(`Métier enregistré : ${t}. Les questions en tiennent compte.`); }
  };
  const onKey = e => {
    if (e.key === "ArrowDown") { e.preventDefault(); setOpen(true); setActive(a => (items.length ? (a + 1) % items.length : -1)); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActive(a => (items.length ? (a <= 0 ? items.length - 1 : a - 1) : -1)); }
    else if (e.key === "Enter") { e.preventDefault(); commit(open && active >= 0 && items[active] ? labelOf(items[active]) : val); }
    else if (e.key === "Escape") { if (open) { e.preventDefault(); setOpen(false); setActive(-1); } else setVal(p.poste || ""); }
  };

  return (
    <div style={{ position: "relative", ...stack(8) }}>
      <Field id="job" label="Métier ou poste visé" hint={`Écrivez-le ou choisissez-le dans la liste. ${PHRASES.job}`}>
        <div style={{ position: "relative" }}>
          <Input id="job" icon={I.search} hint role="combobox" aria-autocomplete="list" aria-expanded={open && items.length > 0} aria-controls="job-list"
            aria-activedescendant={open && active >= 0 ? `job-opt-${active}` : undefined}
            value={val} autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder="Par exemple : agent d'accueil"
            onChange={e => { setVal(e.target.value); setOpen(true); setActive(-1); setStatus(""); }}
            onFocus={() => { clearTimeout(blurT.current); setOpen(true); }}
            onClick={() => setOpen(true)}
            onBlur={() => { blurT.current = setTimeout(() => commit(valRef.current), 160); }}
            onKeyDown={onKey} />
          {open && items.length > 0 && (
            <ul id="job-list" role="listbox" aria-label="Métiers proposés"
              style={{ position: "absolute", left: 0, right: 0, top: "calc(100% + 8px)", zIndex: 30, margin: 0, padding: 4, listStyle: "none", background: T.surface, border: `1px solid ${T.line}`, borderRadius: RAD.md, boxShadow: SH.lg, maxHeight: 264, overflowY: "auto" }}>
              {items.map((it, i) => (
                // design-lint-disable-next-line K4 -- option d'une liste combobox ARIA : le clavier passe par le champ (aria-activedescendant), le clic complète
                <li key={labelOf(it) + i} id={`job-opt-${i}`} role="option" aria-selected={i === active} className="rp-opt"
                  onPointerDown={e => e.preventDefault()} onMouseDown={e => e.preventDefault()}
                  onClick={() => { clearTimeout(blurT.current); commit(labelOf(it)); }}
                  onMouseMove={() => active !== i && setActive(i)}
                  style={{ padding: "12px 12px", borderRadius: RAD.sm, cursor: "pointer", ...(typeof it === "string" ? TY.body : TY.bodyStrong), color: typeof it === "string" ? T.navy : T.primary, background: i === active ? T.primaryBg : undefined }}>
                  {typeof it === "string" ? it : `Utiliser « ${it.free} »`}
                </li>
              ))}
            </ul>
          )}
        </div>
      </Field>
      <div role="status" aria-live="polite" style={{ ...TY.small, color: T.successDk, display: "flex", alignItems: "center", gap: 8 }}>
        {status && <><Icon d={I.check} s={16} />{status}</>}
      </div>
    </div>
  );
}
