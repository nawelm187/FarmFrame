import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CATS, type Cat } from "./lib/catalog";
import { useMany } from "./lib/data";
import { useCatalogs } from "./lib/useCatalog";
import { parseRelics } from "./lib/drops";
import { search, type Hit } from "./lib/search";
export default function Palette({ onClose }: { onClose: () => void }) {
  const [{ rec }] = useMany([{ id: "relics", file: "relics.json" }]);
  const [q, setQ] = useState(""), [sel, setSel] = useState(0), nav = useNavigate();
  const cats: Cat[] = q.trim().length >= 3 ? ["warframe", "weapon", "companion", "archwing", "mod"] : ["warframe", "weapon", "companion", "archwing"];
  const loaded = useCatalogs(cats);
  const kindOf = (c: Cat, cg: string) => (c === "warframe" || c === "companion" || c === "archwing" ? c : c === "weapon" && ["primary", "secondary", "melee"].includes(cg.toLowerCase()) ? cg.toLowerCase() : undefined);
  const ents = cats.flatMap(c => (loaded[c]?.items ?? []).map(e => ({ name: e.name, cat: c, slug: e.slug, label: CATS[c].label.replace(/s$/, ""), kind: kindOf(c, e.category) })));
  const hits = search(q, parseRelics(rec?.data), ents);
  const go = (h?: Hit) => { if (h) { nav(h.to); onClose(); } };
  const key = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setSel((sel + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % Math.max(hits.length, 1)); }
    else if (e.key === "Enter") go(hits[sel]);
  };
  return (<div className="ov" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="pal" role="dialog" aria-modal="true" aria-label="Search">
      <input autoFocus aria-label="Search" placeholder="Search or ask: where do I farm X, what relic contains X, build X" value={q} onChange={e => { setQ(e.target.value); setSel(0); }} onKeyDown={key} />
      <div role="listbox">{hits.map((h, i) => <div key={h.cat + h.label} role="option" aria-selected={i === sel} onClick={() => go(h)}><span>{h.label}</span><span className="tag">{h.cat}</span></div>)}
        {!hits.length && <div className="muted pad">{q ? "No results" : "Type to search"}</div>}</div></div></div>);
}
