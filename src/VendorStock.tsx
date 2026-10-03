import { useState } from "react";
import { Link } from "react-router-dom";
import { Credits } from "./Money";
import { groupStock, VCATS, type Known, type Stock } from "./lib/vendor";
import { useCatalogs } from "./lib/useCatalog";
const names = (a?: { name: string }[] | null) => new Set((a ?? []).map(e => e.name.toLowerCase()));
/** A vendor's stock, split by kind (mods, weapons, cosmetics, relics, resources...). A filter row shows one kind at a time. */
export default function VendorStock({ items, needed }: { items: Stock[]; needed?: Set<string> }) {
  const cat = useCatalogs(["mod", "weapon", "warframe", "companion"]), [sel, setSel] = useState("");
  const loading = !cat.mod?.items || !cat.weapon?.items;
  const k: Known = { mods: names(cat.mod?.items), weapons: names(cat.weapon?.items), frames: new Set([...names(cat.warframe?.items), ...names(cat.companion?.items)]) };
  const groups = groupStock(items, k), shown = sel ? groups.filter(g => g.cat === sel) : groups;
  return (<div className="vstock">
    {loading && <p className="muted">Sorting by kind… (catalogs still loading, some items may land in Other for now)</p>}
    <div className="chips" role="group" aria-label="Filter by kind"><button className={"relicchip" + (!sel ? " own" : "")} aria-pressed={!sel} onClick={() => setSel("")}>All ({items.length})</button>
      {groups.map(g => <button key={g.cat} className={"relicchip" + (sel === g.cat ? " own" : "")} aria-pressed={sel === g.cat} onClick={() => setSel(sel === g.cat ? "" : g.cat)}>{g.label} ({g.items.length})</button>)}</div>
    {shown.map(g => (<section key={g.cat}><h4>{VCATS.find(c => c[0] === g.cat)?.[1]} <span className="muted">({g.items.length})</span></h4>
      <ul className="sub">{g.items.map((i, n) => { const want = needed?.has(i.name.toLowerCase());
        return <li key={n} className={want ? "gold" : undefined}>{g.cat === "mod" || g.cat === "weapon" || g.cat === "warframe" ? <Link to={`/item/${encodeURIComponent(i.name)}`}>{i.name}</Link> : i.name}{want && " ★ you need this"}
          {(i.ducats != null || i.credits != null) && <span className="muted"> · {i.ducats != null ? `${i.ducats} ducats` : ""}{i.ducats != null && i.credits != null ? ", " : ""}{i.credits != null && <Credits n={i.credits} />}</span>}</li>; })}</ul></section>))}
  </div>);
}
