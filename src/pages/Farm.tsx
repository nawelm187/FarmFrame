import { Pic } from "../ItemArt";
import { Link, useParams } from "react-router-dom";
import { useMany } from "../lib/data";
import { FIND, collect, query } from "../lib/drops";
import { rank, stackIndex } from "../lib/farm";
import { useNeeded } from "../lib/useNeeded";
import { useCatalogs } from "../lib/useCatalog";
import type { Cat, Entity } from "../lib/catalog";
import SetFarm from "./SetFarm";
import { Unavailable } from "./parts";
const BUILT: Cat[] = ["warframe", "weapon", "companion", "archwing"];
const items = FIND.map(f => ({ id: f.id, file: f.file }));
export default function Farm() {
  const { item = "" } = useParams();
  const res = useMany(items), needed = useNeeded(), cats = useCatalogs(BUILT);
  const built = BUILT.flatMap(c => (cats[c]?.items ?? []).filter(x => x.components.length > 0 && x.name.toLowerCase() === item.trim().toLowerCase()).map(x => ({ c, x: x as Entity })))[0];
  const { rows, gaps, ok } = collect(FIND.map((f, i) => ({ f, rec: res[i].rec, status: res[i].status })));
  if (built) return <><h1><Pic name={item} size={44} /> Farming: {item}</h1><SetFarm e={built.x} cat={built.c} /></>;
  if (!ok) return <><h1>{item}</h1><Unavailable title="Drop tables" status={res[0].status} why="No verified drop data loaded yet. See Data Sources." /></>;
  const list = rank(query(rows, item), stackIndex(rows, needed), item);
  return (<><h1><Pic name={item} size={44} /> Farming: {item}</h1>
    <p className="lead">Where it drops, ordered by drop chance, with your other goals taken into account. Not a universal "best farm".</p>
    <p className="muted"><b>Verified fact:</b> chance and source, from the official drop tables. <b>Calculated estimate:</b> rolls per drop (100 ÷ chance). Run speed, enemy density and modifiers are not in this data, so they are not part of the ranking.</p>
    {gaps.length > 0 && <p className="muted">Not included: {gaps.join("; ")}</p>}
    {!list.length ? <p className="muted">No drop for "{item}" in the loaded tables. <Link to={`/finder?q=${encodeURIComponent(item)}`}>Search the Finder</Link></p> :
      <div className="wrap"><table><thead><tr><th>Where</th><th>Type</th><th>Rot.</th><th>Chance</th><th>≈ Rolls per drop</th><th>Also advances</th></tr></thead><tbody>
        {list.map((o, i) => (<tr key={i}><td>{o.row.item !== item && <span className="muted"><Pic name={o.row.item} size={22} /> {o.row.item} · </span>}{o.row.where}
          {o.tags.map(t => <div key={t}><span className="tag STALE">{t}</span></div>)}
          <details><summary>Why?</summary><ul><li>Source: {o.row.src}</li><li>{o.row.ch == null ? "No chance value in the source" : `Drop chance ${o.row.ch}%`}{o.row.note ? ` (${o.row.note})` : ""}</li>
            {o.stacked.length > 0 && <li>Same location also drops things you still need (matched by item name): {o.stacked.join(", ")}</li>}</ul></details></td>
          <td>{o.row.mode || o.row.src}</td><td>{o.row.rot || "—"}</td><td>{o.row.ch == null ? "—" : o.row.ch + "%"}</td><td>{o.rolls ?? "—"}</td>
          <td className="muted">{o.stacked.length ? o.stacked.slice(0, 3).join(", ") : "—"}</td></tr>))}</tbody></table></div>}</>);
}
