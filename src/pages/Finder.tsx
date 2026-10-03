import { useDeferredValue } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMany } from "../lib/data";
import { FIND, collect, parseRelics, query } from "../lib/drops";
import RelicCard from "../RelicCard";
import { Unavailable } from "./parts";
const items = [...FIND.map(f => ({ id: f.id, file: f.file })), { id: "relics", file: "relics.json" }];
export default function Finder() {
  const [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", dq = useDeferredValue(q), l = dq.trim().toLowerCase();
  const res = useMany(items);
  const { rows, gaps, ok } = collect(FIND.map((f, i) => ({ f, rec: res[i].rec, status: res[i].status })));
  const relics = parseRelics(res[res.length - 1].rec?.data) ?? [];
  const m = l ? query(rows, l) : [], rl = l ? relics.filter(r => (r.st.Intact ?? []).some(x => x.itemName.toLowerCase().includes(l))).slice(0, 10) : [];
  return (<><h1>Resource Finder</h1>
    <p className="lead">Where an item drops, from the official drop tables: missions, enemies, mods, bounties, sorties, objectives and syndicates. Items that only come from other systems (vendors, crafting, trading) are not covered.</p>
    <div className="bar"><input aria-label="Item name" placeholder="Item or resource name, e.g. Plastids" value={q} onChange={e => setSp({ q: e.target.value }, { replace: true })} /></div>
    <p className="muted">{ok}/{FIND.length} drop datasets loaded{gaps.length ? " · not shown: " + gaps.join("; ") : ""}</p>
    {l && ok > 0 && <p><Link to={`/farm/${encodeURIComponent(q.trim())}`}>Ranked farming view for "{q.trim()}"</Link></p>}
    {!ok && <Unavailable title="Drop tables" status={res.some(x => x.status === "LOADING") ? "LOADING" : "ERROR"} rec={res.find(x => x.rec?.err)?.rec} why="No drop tables could be loaded. See Data Sources for the reason." />}
    {!l && ok > 0 && <p className="muted">Search for a resource, mod, part or item.</p>}
    {l && ok > 0 && !m.length && <p className="muted">No drop for "{q}" in the loaded tables.</p>}
    {rl.length > 0 && <><h2>Relics containing "{q.trim()}"</h2><p className="muted">Each card shows everything the relic can give. The reward you searched for is highlighted.</p><div className="relgrid">{rl.map(r => <RelicCard key={r.name} r={r} mark={l} />)}</div></>}
    {m.length > 0 && <h2>Other places it drops</h2>}
    {m.length > 0 && <div className="wrap"><table><thead><tr><th>Item</th><th>Source</th><th>Location</th><th>Rot.</th><th>Chance</th><th>Rarity</th><th>Detail</th></tr></thead><tbody>
      {m.map((r, i) => <tr key={i}><td><Link to={`/item/${encodeURIComponent(r.item)}`}>{r.item}</Link></td><td>{r.src}</td><td>{r.where}{r.mode && r.mode !== r.src ? <span className="muted"> {r.mode}</span> : null}</td><td>{r.rot || "—"}</td><td>{r.ch == null ? "—" : r.ch + "%"}</td><td>{r.rar}</td><td className="muted">{r.note}</td></tr>)}</tbody></table></div>}
    {m.length > 0 && <p className="muted">Mission chances are per reward roll in that rotation, not per run. Enemy chances combine the enemy's drop chance with the table chance.</p>}
</>);
}
