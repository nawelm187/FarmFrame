import { useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CATS, type Cat } from "./lib/catalog";
import { useMany } from "./lib/data";
import { useCatalogs } from "./lib/useCatalog";
import { parseRelics } from "./lib/drops";
import { search, type Hit } from "./lib/search";
import { ENEMY_ALT, ENEMY_SRC, ENEMY_URL, parseEnemies } from "./lib/enemies";
import { FILES, parseThings, resAlt, resUrl, RES_SRC } from "./lib/resources";
export default function Palette({ onClose }: { onClose: () => void }) {
  const [{ rec }] = useMany([{ id: "relics", file: "relics.json" }]);
  const [q, setQ] = useState(""), [sel, setSel] = useState(0), nav = useNavigate();
  const cats: Cat[] = q.trim().length >= 3 ? ["warframe", "weapon", "companion", "archwing", "mod"] : ["warframe", "weapon", "companion", "archwing"];
  const loaded = useCatalogs(cats);
  const kindOf = (c: Cat, cg: string) => (c === "warframe" || c === "companion" || c === "archwing" ? c : c === "weapon" && ["primary", "secondary", "melee"].includes(cg.toLowerCase()) ? cg.toLowerCase() : undefined);
  const ents = cats.flatMap(c => (loaded[c]?.items ?? []).map(e => ({ name: e.name, cat: c, slug: e.slug, label: CATS[c].label.replace(/s$/, ""), kind: kindOf(c, e.category), parts: e.components.map(k => k.name) })));
  // Resources, items and enemies are loaded only once the search has two letters, so opening the palette stays light.
  const on = q.trim().length >= 2, extra = useMany(on ? [{ id: "things:resources", file: "", url: resUrl(FILES.resources), alt: resAlt(FILES.resources), src: RES_SRC, win: 6 * 3_600_000 }, { id: "things:items", file: "", url: resUrl(FILES.items), alt: resAlt(FILES.items), src: RES_SRC, win: 6 * 3_600_000 }, { id: "enemies", file: "", url: ENEMY_URL, alt: ENEMY_ALT, src: ENEMY_SRC, win: 6 * 3_600_000 }] : []);
  const l = q.trim().toLowerCase(), more: Hit[] = !on ? [] : [
    ...(parseThings(extra[0]?.rec?.data) ?? []).filter(t => t.name.toLowerCase().includes(l)).slice(0, 4).map(t => ({ label: t.name, cat: "Resource", to: `/resources?q=${encodeURIComponent(t.name)}`, s: t.name.toLowerCase().startsWith(l) ? 0.8 : 1.6 })),
    ...(parseThings(extra[1]?.rec?.data) ?? []).filter(t => t.name.toLowerCase().includes(l)).slice(0, 3).map(t => ({ label: t.name, cat: "Item", to: `/resources?t=items&q=${encodeURIComponent(t.name)}`, s: t.name.toLowerCase().startsWith(l) ? 0.9 : 1.7 })),
    ...(parseEnemies(extra[2]?.rec?.data) ?? []).filter(t => t.name.toLowerCase().includes(l)).slice(0, 4).map(t => ({ label: t.name, cat: "Enemy", to: `/enemies?q=${encodeURIComponent(t.name)}`, s: t.name.toLowerCase().startsWith(l) ? 0.7 : 1.5 }))];
  const hits = [...search(q, parseRelics(rec?.data), ents), ...more].sort((a, c) => a.s - c.s).slice(0, 10);
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
