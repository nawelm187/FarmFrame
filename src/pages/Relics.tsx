import { useSearchParams } from "react-router-dom";
import { useMany, useWorld } from "../lib/data";
import { parseRelics } from "../lib/drops";
import { ts } from "../lib/format";
import { Prov, Unavailable } from "./parts";
const STATES = ["Intact", "Exceptional", "Flawless", "Radiant"];
const isArr = (d: unknown): d is { tier: string; expiry: string }[] => Array.isArray(d);
export default function Relics() {
  const [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", l = q.trim().toLowerCase();
  const [{ rec, status }] = useMany([{ id: "relics", file: "relics.json" }]);
  const fis = useWorld("fissures", isArr).data;
  const relics = parseRelics(rec?.data);
  if (!relics) return <><h1>Relics</h1><Unavailable title="Relic data" status={status} why={status === "LOADING" ? "Loading relic tables…" : "No verified data."} rec={rec} /></>;
  const hit = l ? relics.filter(r => r.name.toLowerCase().includes(l) || (r.st.Intact ?? []).some(x => x.itemName.toLowerCase().includes(l))).slice(0, 25) : [];
  return (<><h1>Relics</h1>
    <p className="lead">Search by relic (e.g. "Lith A1") or by reward item. Chances by refinement come straight from the drop tables. Vault status is not part of this dataset, so it is not shown.</p>
    <div className="bar"><input aria-label="Relic or item name" placeholder="Relic or item name" value={q} onChange={e => setSp({ q: e.target.value }, { replace: true })} /></div>
    {!l && <p className="muted">Type a relic or item name.</p>}
    {l && !hit.length && <p className="muted">No relic matches "{q}".</p>}
    {hit.map(r => { const base = r.st.Intact ?? Object.values(r.st)[0] ?? [];
      const n = fis ? fis.filter(x => x.tier === r.tier && ts(x.expiry) > Date.now()).length : null;
      return (<section className="panel" key={r.name} style={{ marginBottom: ".6rem" }}>
        <div className="row"><h3>{r.name}</h3><span className="muted">{n == null ? "Fissure data unavailable" : `${n} active ${r.tier} fissures`}</span></div>
        <div className="wrap"><table><thead><tr><th>Reward</th><th>Rarity</th>{STATES.map(s => <th key={s}>{s}</th>)}</tr></thead><tbody>
          {base.map(x => <tr key={x.itemName + x.rarity}><td>{x.itemName}</td><td>{x.rarity}</td>{STATES.map(s => { const y = (r.st[s] ?? []).find(z => z.itemName === x.itemName && z.rarity === x.rarity); return <td key={s}>{y ? y.chance + "%" : "—"}</td>; })}</tr>)}</tbody></table></div></section>); })}
    <Prov rec={rec} /></>);
}
