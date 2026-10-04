import { useDeferredValue, useMemo, useState } from "react";
import { PolIcon } from "./Icons";
import ModCard from "./ModCard";
import type { Entity } from "./lib/catalog";
const POLS = ["madurai", "vazarin", "naramon", "zenurik", "unairu", "penjaga", "umbra", "any"];
const RAR = ["common", "uncommon", "rare", "legendary"];
const blob = (m: Entity) => [m.name, m.description, ...(m.levelStats?.[m.levelStats.length - 1] ?? [])].join(" ").toLowerCase();
/** Visual mod browser for builds: search by name or by what the mod does ("fire rate", "armor"), filter by polarity and rarity, sort by drain, click a card to equip it. */
export default function ModPicker({ mods, onPick, taken, target }: { mods: Entity[]; onPick: (m: Entity) => void; taken: Set<string>; target: string }) {
  const [q, setQ] = useState(""), [pol, setPol] = useState(""), [rar, setRar] = useState(""), [sort, setSort] = useState("name"), [more, setMore] = useState(1), dq = useDeferredValue(q);
  const idx = useMemo(() => mods.map(m => ({ m, t: blob(m) })), [mods]);
  const words = dq.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list = useMemo(() => { const l = idx.filter(({ m, t }) => (!pol || m.polarity === pol) && (!rar || m.rarity.toLowerCase() === rar) && words.every(w => t.includes(w))).map(x => x.m);
    return sort === "name" ? l : l.sort((a, b) => ((a.baseDrain ?? 99) - (b.baseDrain ?? 99)) * (sort === "drain-asc" ? 1 : -1)); }, [idx, pol, rar, sort, dq]); // eslint-disable-line react-hooks/exhaustive-deps
  const reset = () => setMore(1);
  return (<section className="picker"><h2>Mods</h2><p className="muted">Click a mod to put it in {target}. Search by name or by effect, for example "fire rate" or "armor".</p>
    <div className="bar"><input aria-label="Search mods" placeholder="Search by name or effect" value={q} onChange={e => { setQ(e.target.value); reset(); }} />
      <select aria-label="Sort mods" value={sort} onChange={e => setSort(e.target.value)}><option value="name">Name</option><option value="drain-asc">Drain, low first</option><option value="drain-desc">Drain, high first</option></select></div>
    <div className="chips" role="group" aria-label="Polarity"><button className={"relicchip" + (!pol ? " own" : "")} onClick={() => { setPol(""); reset(); }}>Any polarity</button>
      {POLS.map(p => <button key={p} className={"relicchip" + (pol === p ? " own" : "")} aria-pressed={pol === p} title={p} onClick={() => { setPol(pol === p ? "" : p); reset(); }}><PolIcon pol={p} size={20} /></button>)}</div>
    <div className="chips" role="group" aria-label="Rarity">{RAR.map(r => <button key={r} className={"relicchip" + (rar === r ? " own" : "")} onClick={() => { setRar(rar === r ? "" : r); reset(); }}>{r[0].toUpperCase() + r.slice(1)}</button>)}</div>
    <p className="muted">{list.length} mod{list.length === 1 ? "" : "s"}</p>
    <div className="cards">{list.slice(0, 24 * more).map(m => <button key={m.slug} className={"cardlink pickcard" + (taken.has(m.slug) ? " used" : "")} onClick={() => onPick(m)} aria-label={`Equip ${m.name}`}><ModCard e={m} />{taken.has(m.slug) && <span className="tag STALE">Equipped</span>}</button>)}</div>
    {list.length > 24 * more && <button className="btn" onClick={() => setMore(more + 1)}>Show more ({list.length - 24 * more} left)</button>}</section>);
}
