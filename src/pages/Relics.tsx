import { useDeferredValue, useState } from "react";
import { useSearchParams } from "react-router-dom";
import RelicArt from "../RelicArt";
import { useMany, useWorld } from "../lib/data";
import { parseRelics, relicsByItem, type Relic } from "../lib/drops";
import { MARKET_ENABLED, fetchStat } from "../lib/market";
import { VAULT_ALT, VAULT_SRC, VAULT_URL, parseVault } from "../lib/vault";
import { ts } from "../lib/format";
import { Prov, Unavailable } from "./parts";
const STATES = ["Intact", "Exceptional", "Flawless", "Radiant"];
const isArr = (d: unknown): d is { tier: string; expiry: string }[] => Array.isArray(d);
type Vals = Record<string, number | null> | "loading" | "error" | null;
function RelicValue({ r }: { r: Relic }) {
  const [vals, setVals] = useState<Vals>(null);
  const names = [...new Set(Object.values(r.st).flat().map(x => x.itemName))];
  const run = async () => {
    setVals("loading"); const out: Record<string, number | null> = {};
    try { for (const n of names) { const st = await fetchStat(n); out[n] = st ? st.median : null; await new Promise(res => setTimeout(res, 400)); } setVals(out); } catch { setVals("error"); }
  };
  const ev = (s: string) => +((r.st[s] ?? []).reduce((a, x) => a + (typeof vals === "object" && vals && vals[x.itemName] != null ? (x.chance * (vals[x.itemName] as number)) / 100 : 0), 0)).toFixed(1);
  const missing = typeof vals === "object" && vals ? names.filter(n => vals[n] == null) : [];
  return (<div className="muted" style={{ marginTop: ".5rem" }}>
    {(vals === null || vals === "error") && <button className="btn" onClick={() => void run()}>Estimate platinum value</button>}
    {vals === "loading" && <span>Checking {names.length} market prices…</span>}
    {vals === "error" && <div>Market data unavailable right now.</div>}
    {vals && typeof vals === "object" && <div><b>Expected value per relic</b> (platinum, live market medians × drop chance): {STATES.filter(s => r.st[s]).map(s => `${s} ${ev(s)}`).join(" · ")}.
      {" "}{names.filter(n => vals[n] != null).map(n => `${n} ${vals[n]}`).join(", ")}.{missing.length > 0 && ` No market price for ${missing.join(", ")} (counted as 0).`} This is market value, not a farming recommendation.</div>}
  </div>);
}
function VaultBadge({ name }: { name: string }) {
  const [{ rec, status }] = useMany([{ id: "relicsVault", file: "", url: VAULT_URL, alt: VAULT_ALT, src: VAULT_SRC }]);
  const v = parseVault(rec?.data)?.get(name);
  const label = v === undefined ? (status === "LOADING" ? "Vault status loading" : "Vault status unknown") : v ? "Vaulted" : "Available";
  return <span className={"tag " + (v === undefined ? "UNAVAILABLE" : v ? "STALE" : "FRESH")} title="Community dataset, may lag behind the game">{label}</span>;
}
export default function Relics() {
  const [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", dq = useDeferredValue(q), l = dq.trim().toLowerCase();
  const [{ rec, status }] = useMany([{ id: "relics", file: "relics.json" }]);
  const fis = useWorld("fissures", isArr).data;
  const relics = parseRelics(rec?.data);
  if (!relics) return <><h1>Relics</h1><Unavailable title="Relic data" status={status} why={status === "LOADING" ? "Loading relic tables…" : "No verified data."} rec={rec} /></>;
  const grouped = l.length >= 3 ? relicsByItem(relics, l) : [];
  const all = l ? relics.filter(r => r.name.toLowerCase().includes(l) || (r.st.Intact ?? []).some(x => x.itemName.toLowerCase().includes(l))) : [];
  const hit = grouped.length && all.length > 3 && !all.some(r => r.name.toLowerCase() === l) ? all.slice(0, 3) : all.slice(0, 25);
  return (<><h1>Relics</h1>
    <p className="lead">Search by relic (e.g. "Lith A1") or by reward item. Chances by refinement come straight from the drop tables. Vault status comes from a separate community dataset and shows as unknown when it is missing.</p>
    <div className="bar"><input aria-label="Relic or item name" placeholder="Relic or item name" value={q} onChange={e => setSp({ q: e.target.value }, { replace: true })} /></div>
    {!l && <p className="muted">Type a relic or item name.</p>}
    {l && !hit.length && <p className="muted">No relic matches "{q}".</p>}
    {grouped.length > 0 && <><h2>Relics by item</h2>{grouped.map(([item, list]) => (<section className="panel" key={item} style={{ marginBottom: ".6rem" }}><h3>{item}</h3>
      <div className="chips">{list.map(x => <button key={x.relic.name} className="relicchip" onClick={() => setSp({ q: x.relic.name }, { replace: true })}><RelicArt tier={x.relic.tier} name={x.relic.name} size={26} /><span>{x.relic.name}</span><span className="muted">{x.rarity}</span><VaultBadge name={x.relic.name} /></button>)}</div></section>))}
      {all.length > hit.length && <p className="muted">Showing {hit.length} of {all.length} matching relics below. Pick a relic above to see only that one.</p>}</>}
    {hit.map(r => { const base = r.st.Intact ?? Object.values(r.st)[0] ?? [];
      const n = fis ? fis.filter(x => x.tier === r.tier && ts(x.expiry) > Date.now()).length : null;
      return (<section className="panel" key={r.name} style={{ marginBottom: ".6rem" }}>
        <div className="row"><h3><RelicArt tier={r.tier} name={r.name} size={40} /> {r.name} <VaultBadge name={r.name} /></h3><span className="muted">{n == null ? "Fissure data unavailable" : `${n} active ${r.tier} fissures`}</span></div>
        <div className="wrap"><table><thead><tr><th>Reward</th><th>Rarity</th>{STATES.map(s => <th key={s}>{s}</th>)}</tr></thead><tbody>
          {base.map(x => <tr key={x.itemName + x.rarity}><td>{x.itemName}</td><td>{x.rarity}</td>{STATES.map(s => { const y = (r.st[s] ?? []).find(z => z.itemName === x.itemName && z.rarity === x.rarity); return <td key={s}>{y ? y.chance + "%" : "—"}</td>; })}</tr>)}</tbody></table></div>{MARKET_ENABLED && <RelicValue r={r} />}</section>); })}
    <Prov rec={rec} /></>);
}
