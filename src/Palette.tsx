import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import type { Hit } from "./lib/search";
import { useAnswerEngine } from "./lib/useAnswerEngine";
import AnswerCards from "./AnswerCards";
import { useT } from "./i18n";
export default function Palette({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState(""), [sel, setSel] = useState(0), nav = useNavigate(), t = useT();
  const e = useAnswerEngine(q), { hits, u0, fixed } = e;
  const go = (h?: Hit) => { if (h) { nav(h.to); onClose(); } };
  const key = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setSel((sel + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % Math.max(hits.length, 1)); }
    else if (e.key === "Enter") go(hits[sel]);
  };
  return (<div className="ov" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="pal" role="dialog" aria-modal="true" aria-label={t("searchLabel")}>
      <input autoFocus aria-label={t("searchLabel")} placeholder={t("paletteHint")} value={q} onChange={e => { setQ(e.target.value); setSel(0); }} onKeyDown={key} />
      <AnswerCards e={e} go={onClose} />
      {fixed && fixed !== u0.text && <div className="muted pad">{t("didA")} <button className="btn sm" onClick={() => { setQ(fixed); setSel(0); }}>{fixed}</button>{t("didB")}</div>}
      <div role="listbox">{hits.map((h, i) => <div key={h.cat + h.label + i} role="option" aria-selected={i === sel} onClick={() => go(h)}><span>{h.label}</span><span className="tag">{h.cat}</span></div>)}
        {!hits.length && <div className="muted pad">{q ? t("paletteNone") : t("paletteType")}</div>}</div></div></div>);
}
