import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useMany } from "./lib/data";
import { parseRelics } from "./lib/drops";
import { search, type Hit } from "./lib/search";
export default function Palette({ onClose }: { onClose: () => void }) {
  const [{ rec }] = useMany([{ id: "relics", file: "relics.json" }]);
  const [q, setQ] = useState(""), [sel, setSel] = useState(0), nav = useNavigate();
  const hits = search(q, parseRelics(rec?.data));
  const go = (h?: Hit) => { if (h) { nav(h.to); onClose(); } };
  const key = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setSel((sel + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % Math.max(hits.length, 1)); }
    else if (e.key === "Enter") go(hits[sel]);
  };
  return (<div className="ov" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="pal" role="dialog" aria-modal="true" aria-label="Search">
      <input autoFocus aria-label="Search" placeholder="Search or ask, e.g. where do I farm Plastids?" value={q} onChange={e => { setQ(e.target.value); setSel(0); }} onKeyDown={key} />
      <div role="listbox">{hits.map((h, i) => <div key={h.cat + h.label} role="option" aria-selected={i === sel} onClick={() => go(h)}><span>{h.label}</span><span className="tag">{h.cat}</span></div>)}
        {!hits.length && <div className="muted pad">{q ? "No results" : "Type to search"}</div>}</div></div></div>);
}
