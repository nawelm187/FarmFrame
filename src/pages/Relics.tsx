import { useDeferredValue, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import RelicArt from "../RelicArt";
import RelicCard, { VaultBadge } from "../RelicCard";
import { useMany, useWorld } from "../lib/data";
import { parseRelics, relicsByItem, type Relic } from "../lib/drops";
import { MARKET_ENABLED, fetchStat } from "../lib/market";
import { VAULT_ALT, VAULT_SRC, VAULT_URL, parseVault } from "../lib/vault";
import { ts } from "../lib/format";
import { Plat } from "../Money";
import { Prov, Unavailable } from "./parts";
const TIERS = ["Lith", "Meso", "Neo", "Axi", "Requiem"], PAGE = 24;
/** The relic list shown when nothing is searched: filter by era and by vault status, cards show every reward. */
function Browse({ relics, sp, setSp }: { relics: Relic[]; sp: URLSearchParams; setSp: (n: URLSearchParams, o?: { replace?: boolean }) => void }) {
  const [vr] = useMany([{ id: "relicsVault", file: "", url: VAULT_URL, alt: VAULT_ALT, src: VAULT_SRC }]), vault = parseVault(vr.rec?.data);
  const [more, setMore] = useState(1), tier = sp.get("tier") ?? "", show = sp.get("vault") ?? "available";
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); setMore(1); };
  const list = relics.filter(r => (!tier || r.tier === tier) && (show === "all" || (show === "vaulted" ? vault?.get(r.name) === true : vault?.get(r.name) !== true)))
    .sort((a, b) => TIERS.indexOf(a.tier) - TIERS.indexOf(b.tier) || a.name.localeCompare(b.name, undefined, { numeric: true }));
  return (<>
    <div className="tierbar" role="group" aria-label="Filter by era">{TIERS.map(t => { const n = relics.filter(r => r.tier === t).length; return n ? <button key={t} className="tierbtn" aria-pressed={tier === t} onClick={() => set("tier", tier === t ? "" : t)}><RelicArt tier={t} size={34} /><span>{t}</span><b>{n}</b></button> : null; })}</div>
    <div className="bar"><select aria-label="Vault status" value={show} onChange={e => set("vault", e.target.value === "available" ? "" : e.target.value)}><option value="available">Available (not vaulted)</option><option value="vaulted">Vaulted only</option><option value="all">All relics</option></select>
      <span className="muted">{list.length} relics{!vault ? " · vault status is still loading, so vaulted relics may be included" : ""}</span></div>
    {!list.length ? <p className="muted">No relics match these filters.</p> : <div className="relgrid">{list.slice(0, PAGE * more).map(r => <RelicCard key={r.name} r={r} />)}</div>}
    {list.length > PAGE * more && <button className="btn" onClick={() => setMore(more + 1)}>Show more ({list.length - PAGE * more} left)</button>}
  </>);
}
const STATES = ["Intact", "Exceptional", "Flawless", "Radiant"];
const isArr = (d: unknown): d is { tier: string; expiry: string }[] => Array.isArray(d);
type Vals = Record<string, number | null> | "loading" | "error" | null;
const RO: Record<string, number> = { Common: 0, Uncommon: 1, Rare: 2 };
function RelicValue({ r }: { r: Relic }) {
  const [vals, setVals] = useState<Vals>(null), [sel, setSel] = useState("Intact");
  const names = [...new Set(Object.values(r.st).flat().map(x => x.itemName))];
  const run = async () => {
    setVals("loading"); const out: Record<string, number | null> = {};
    try { for (const n of names) { const st = await fetchStat(n); out[n] = st ? st.median : null; await new Promise(res => setTimeout(res, 400)); } setVals(out); } catch { setVals("error"); }
  };
  const states = STATES.filter(s => r.st[s]), cur = r.st[sel] ? sel : states[0];
  const rows = (s: string) => (r.st[s] ?? []).slice().sort((a, b) => (RO[a.rarity] ?? 3) - (RO[b.rarity] ?? 3) || a.itemName.localeCompare(b.itemName));
  const value = (v: Record<string, number | null>, x: { itemName: string; chance: number }) => { const p = v[x.itemName]; return p == null ? null : +((x.chance * p) / 100).toFixed(2); };
  const total = (v: Record<string, number | null>, s: string) => +rows(s).reduce((a, x) => a + (value(v, x) ?? 0), 0).toFixed(1);
  return (<div className="rv" style={{ marginTop: ".6rem" }}>
    {(vals === null || vals === "error") && <button className="btn" onClick={() => void run()}>Estimate platinum value</button>}
    {vals === "loading" && <span className="muted">Checking {names.length} market prices…</span>}
    {vals === "error" && <div className="muted">Market data unavailable right now.</div>}
    {vals && typeof vals === "object" && cur && <>
      <h4>Estimated value per relic</h4>
      <div className="chips" role="tablist" aria-label="Refinement">{states.map(s => <button key={s} role="tab" aria-selected={s === cur} className={s === cur ? "on" : ""} onClick={() => setSel(s)}>{s} · <Plat n={total(vals, s)} size={14} /></button>)}</div>
      <div className="wrap"><table><thead><tr><th>Reward</th><th>Rarity</th><th className="num">Drop chance</th><th className="num">Market price</th><th className="num">Worth per relic</th></tr></thead>
        <tbody>{rows(cur).map(x => { const p = vals[x.itemName], w = value(vals, x); return (<tr key={x.itemName + x.rarity}>
          <td><Link to={`/item/${encodeURIComponent(x.itemName)}`}>{x.itemName}</Link></td><td><span className={"rar " + x.rarity}>{x.rarity}</span></td><td className="num">{x.chance}%</td>
          <td className="num">{p != null ? <Plat n={p} /> : <span className="muted">no price</span>}</td><td className="num">{w != null ? <Plat n={w} /> : "—"}</td></tr>); })}</tbody>
        <tfoot><tr><th colSpan={4}>Expected value per relic ({cur})</th><th className="num"><Plat n={total(vals, cur)} /></th></tr></tfoot></table></div>
      <p className="muted">Worth per relic = drop chance × the item's live market median. Rewards with no market price count as 0. Market value, not a farming recommendation.</p></>}
  </div>);
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
    {!l && <Browse relics={relics} sp={sp} setSp={setSp} />}
    {l && !hit.length && <p className="muted">No relic matches "{q}".</p>}
    {grouped.length > 0 && <><h2>Relics by item</h2>{grouped.map(([item, list]) => (<section className="panel" key={item} style={{ marginBottom: ".6rem" }}><h3><Link to={`/item/${encodeURIComponent(item)}`}>{item}</Link></h3>
      <div className="chips">{list.map(x => <button key={x.relic.name} className="relicchip" onClick={() => setSp({ q: x.relic.name }, { replace: true })}><RelicArt tier={x.relic.tier} name={x.relic.name} size={26} /><span>{x.relic.name}</span><span className="muted">{x.rarity}</span><VaultBadge name={x.relic.name} /></button>)}</div></section>))}
      {all.length > hit.length && <p className="muted">Showing {hit.length} of {all.length} matching relics below. Pick a relic above to see only that one.</p>}</>}
    {hit.map(r => { const base = r.st.Intact ?? Object.values(r.st)[0] ?? [];
      const n = fis ? fis.filter(x => x.tier === r.tier && ts(x.expiry) > Date.now()).length : null;
      return (<section className="panel" key={r.name} style={{ marginBottom: ".6rem" }}>
        <div className="row"><h3><RelicArt tier={r.tier} name={r.name} size={40} /> {r.name} <VaultBadge name={r.name} /></h3><span className="muted">{n == null ? "Fissure data unavailable" : `${n} active ${r.tier} fissures`}</span></div>
        <div className="wrap"><table><thead><tr><th>Reward</th><th>Rarity</th>{STATES.map(s => <th key={s}>{s}</th>)}</tr></thead><tbody>
          {base.map(x => <tr key={x.itemName + x.rarity}><td><Link to={`/item/${encodeURIComponent(x.itemName)}`}>{x.itemName}</Link></td><td>{x.rarity}</td>{STATES.map(s => { const y = (r.st[s] ?? []).find(z => z.itemName === x.itemName && z.rarity === x.rarity); return <td key={s}>{y ? y.chance + "%" : "—"}</td>; })}</tr>)}</tbody></table></div>{MARKET_ENABLED && <RelicValue r={r} />}</section>); })}
    <Prov rec={rec} /></>);
}
