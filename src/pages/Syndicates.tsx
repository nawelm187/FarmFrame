import { useState } from "react";
import { Pic } from "../ItemArt";
import SyndicateArt from "../SyndicateArt";
import { FACTION, NOTES, RANKS, SYNDICATE_SOURCE, dailyCap, groupOfSyndicate, keyOf } from "../data/syndicateInfo";
import { useMany } from "../lib/data";
import { affordable, clampStanding, effects, parseSyndicates, readStanding, toRank, writeStanding, type Stand } from "../lib/syndicates";
import { Prov, Unavailable } from "./parts";
const FILE = [{ id: "syndicates", file: "syndicates.json" }];
const ORDER = { faction: 0, "open-world": 1, neutral: 2, event: 3 } as const, TITLE = { faction: "Faction syndicates", "open-world": "Open-world syndicates", neutral: "Neutral syndicates", event: "Event syndicates" } as const;
const KIND = { ally: "Allied +50%", opposed: "Opposed −50%", enemy: "Enemy −100%" } as const;
const sign = (n: number) => (n > 0 ? "+" : "") + n.toLocaleString();
/** Syndicates: rank ladder, who likes or hates whom, what each rank sells, and your own standing and target, kept in this browser. */
export default function Syndicates() {
  const [r] = useMany(FILE), list = parseSyndicates(r.rec?.data), [sel, setSel] = useState(""), [st, setSt] = useState(readStanding), [amt, setAmt] = useState(10000), [rel, setRel] = useState(true), [mr, setMr] = useState(0);
  if (!list) return <><h1>Syndicates</h1><Unavailable title="Syndicates" status={r.rec?.data ? "UNAVAILABLE" : r.status} why={r.rec?.data ? "The syndicate data has an unexpected format." : "No verified data."} rec={r.rec} /></>;
  const sorted = [...list].sort((a, b) => ORDER[groupOfSyndicate(a.name)] - ORDER[groupOfSyndicate(b.name)]);
  const cur = sorted.find(s => s.name === sel) ?? sorted[0], key = keyOf(cur.name), faction = !!FACTION[key], me: Stand = st[cur.name] ?? { have: 0, target: 0 }, rank = me.rank ?? 0, tRank = me.targetRank ?? Math.min(5, rank + 1);
  const save = (a: Record<string, Stand>) => { setSt(a); writeStanding(a); };
  const set = (p: Partial<Stand>) => save({ ...st, [cur.name]: { ...me, ...p } });
  const find = (n: string) => sorted.find(s => keyOf(s.name) === keyOf(n))?.name ?? n;
  const fx = faction ? effects(cur.name, amt) : [];
  const add = (sign: 1 | -1) => { const a = { ...st }, d = sign * amt, upd = (name: string, delta: number) => { const c = a[name] ?? { have: 0, target: 0 }, rk = c.rank ?? 0; a[name] = { ...c, have: clampStanding(rk, c.have + delta) }; };
    upd(cur.name, d); if (rel && faction) for (const e of effects(cur.name, d)) upd(find(e.name), e.delta); save(a); };
  const need = faction ? toRank(rank, me.have, tRank) : 0, days = Math.ceil(need / dailyCap(mr));
  const groups = (Object.keys(ORDER) as (keyof typeof ORDER)[]).map(g => ({ g, items: sorted.filter(s => groupOfSyndicate(s.name) === g) })).filter(x => x.items.length);
  return (<><h1>Syndicates</h1>
    <p className="lead">Pick a syndicate to see its rank ladder, which others it helps or hurts, and what each rank sells. Enter your own standing and a target rank. Offers come from the official drop tables; ranks and relations come from the Warframe Wiki.</p>
    {groups.map(({ g, items }) => <div key={g}><h3>{TITLE[g]}</h3><div className="chips" role="group" aria-label={TITLE[g]}>{items.map(s => <button key={s.name} className={"btn" + (s.name === cur.name ? " on" : "")} aria-pressed={s.name === cur.name} onClick={() => setSel(s.name)}><SyndicateArt name={s.name} size={22} /> {s.name}</button>)}</div></div>)}
    <section className="gcard" aria-label={cur.name}><div className="row"><SyndicateArt name={cur.name} size={64} /><h2>{cur.name}</h2></div>
      {faction ? <><h3>Standing and rank</h3>
        <div className="bar"><label>Rank <select value={rank} onChange={e => { const v = +e.target.value; set({ rank: v, have: clampStanding(v, me.have), targetRank: Math.max(v, tRank) }); }}>{RANKS.map(x => <option key={x.rank} value={x.rank}>{x.rank}</option>)}</select></label>
          <label>Standing <input type="number" value={me.have} onChange={e => set({ have: clampStanding(rank, +e.target.value || 0) })} style={{ width: "8rem" }} /></label>
          <label>Target rank <select value={tRank} onChange={e => set({ targetRank: +e.target.value })}>{RANKS.map(x => <option key={x.rank} value={x.rank}>{x.rank}</option>)}</select></label></div>
        <p>{tRank <= rank ? <span className="tag FRESH">Already at or above rank {tRank}</span> : <>To reach rank {tRank} you need about <b>{need.toLocaleString()}</b> more standing{need > 0 ? ` (about ${days} day${days === 1 ? "" : "s"} at the daily cap)` : ""}.</>}</p>
        <h3>Earn or lose standing</h3>
        <div className="bar"><label>Amount <input type="number" min={0} value={amt} onChange={e => setAmt(Math.max(0, +e.target.value || 0))} style={{ width: "8rem" }} /></label>
          <button className="btn" onClick={() => add(1)}>Add</button><button className="btn" onClick={() => add(-1)}>Remove</button>
          <label><input type="checkbox" checked={rel} onChange={e => setRel(e.target.checked)} /> Apply to related syndicates</label>
          <label>Mastery Rank <input type="number" min={0} max={40} value={mr} onChange={e => setMr(Math.max(0, +e.target.value || 0))} style={{ width: "5rem" }} /></label></div>
        <p className="muted">Daily cap for faction syndicates at your Mastery Rank: {dailyCap(mr).toLocaleString()} standing (resets at 0:00 UTC).</p>
        <h3>Who it helps and who it hurts</h3>
        <ul className="list">{fx.map(e => <li key={e.kind}><span><SyndicateArt name={e.name} size={26} /> <b>{e.name}</b></span><span className="muted">{KIND[e.kind]}</span><span className={"tag" + (e.delta > 0 ? " FRESH" : " STALE")}>{sign(e.delta)} for {amt.toLocaleString()} earned</span></li>)}</ul>
        <h3>Rank ladder</h3>
        <div className="wrap"><table><thead><tr><th>Rank</th><th>Lowest standing</th><th>Highest standing</th><th /></tr></thead><tbody>{RANKS.map(x => <tr key={x.rank}><td>{x.rank}</td><td className="num">{x.min.toLocaleString()}</td><td className="num">{x.max.toLocaleString()}</td><td>{x.rank === rank ? <span className="tag FRESH">You are here</span> : x.rank === tRank && tRank > rank ? <span className="tag">Target</span> : x.rank === 0 ? <span className="muted">neutral</span> : null}</td></tr>)}</tbody></table></div>
        <p className="muted">{NOTES.join(" ")}</p></>
        : <><div className="bar"><label>Standing available <input type="number" min={0} value={me.have} onChange={e => set({ have: Math.max(0, +e.target.value || 0) })} style={{ width: "8rem" }} /></label>
          <button className="btn" onClick={() => set({ have: me.have + 1000 })}>+1,000</button><button className="btn" onClick={() => set({ have: Math.max(0, me.have - 1000) })}>−1,000</button></div>
          <p className="muted">This syndicate has no rank table or opposing syndicates in the sources used here, so only the standing you can spend is tracked.</p></>}
      <p className="muted">Stored only in this browser. Rank names are not shown: the sources used here list rank numbers, and names differ for each syndicate.</p></section>
    {cur.ranks.map(rk => (<section key={rk.rank} className="gcard" aria-label={rk.rank}><h3>{rk.rank} <span className="muted">{rk.offers.length}</span></h3>
      <ul className="list">{affordable(rk.offers, me.have).map(o => <li key={o.item}><span><Pic name={o.item} size={26} /> {o.item}</span>
        <span className="muted">{o.standing ? `${o.standing.toLocaleString()} standing` : "no standing"}{o.cost != null ? ` · ${o.cost.toLocaleString()} credits` : ""}</span>
        {me.have > 0 && o.standing > 0 && <span className={"tag" + (o.canBuy ? " FRESH" : "")}>{o.canBuy ? "You can afford it" : `${o.missing.toLocaleString()} more`}</span>}</li>)}</ul></section>))}
    <p className="muted">Ranks, relations and daily cap: <a href={SYNDICATE_SOURCE.url} target="_blank" rel="noreferrer">{SYNDICATE_SOURCE.label}</a>, entered by hand on {SYNDICATE_SOURCE.verified}.</p><Prov rec={r.rec} /></>);
}
