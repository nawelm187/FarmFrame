import { useMemo, useState } from "react";
import { Pic } from "../ItemArt";
import SyndicateArt from "../SyndicateArt";
import { PageHead } from "../ui";
import { ALL_SYNDICATES, FACTION, NOTES, RANKS, SYNDICATE_SOURCE, dailyCap, groupOfSyndicate, keyOf } from "../data/syndicateInfo";
import { useMany } from "../lib/data";
import { affordable, clampStanding, effects, parseSyndicates, readStanding, toRank, writeStanding, type Stand, type Syndicate } from "../lib/syndicates";
import { Prov } from "./parts";
const FILE = [{ id: "syndicates", file: "syndicates.json" }];
const ORDER = { faction: 0, "open-world": 1, neutral: 2, event: 3 } as const, TITLE = { faction: "Faction syndicates", "open-world": "Open-world syndicates", neutral: "Neutral syndicates", event: "Event syndicates" } as const;
const KIND = { ally: "Ally · +50%", opposed: "Opposed · −50%", enemy: "Enemy · −100%" } as const;
const sign = (n: number) => (n > 0 ? "+" : "") + n.toLocaleString();
const Initial = ({ name, size }: { name: string; size: number }) => <span className="blank" style={{ width: size, height: size }} aria-hidden="true">{name[0]}</span>;
/** Syndicates: every syndicate with its emblem, rank ladder, who likes or hates whom, what each rank sells, and your own standing and target, kept in this browser. */
export default function Syndicates() {
  const [r] = useMany(FILE), data = parseSyndicates(r.rec?.data), [sel, setSel] = useState(ALL_SYNDICATES[0]), [st, setSt] = useState(readStanding), [amt, setAmt] = useState(10000), [rel, setRel] = useState(true), [mr, setMr] = useState(0);
  const sorted = useMemo<Syndicate[]>(() => {
    const byKey = new Map((data ?? []).map(s => [keyOf(s.name), s])), known = new Set(ALL_SYNDICATES.map(keyOf));
    const list = [...ALL_SYNDICATES.map(n => byKey.get(keyOf(n)) ?? { name: n, ranks: [], count: 0 }), ...(data ?? []).filter(s => !known.has(keyOf(s.name)))];
    return list.sort((a, b) => ORDER[groupOfSyndicate(a.name)] - ORDER[groupOfSyndicate(b.name)]);
  }, [data]);
  const cur = sorted.find(s => keyOf(s.name) === keyOf(sel)) ?? sorted[0], key = keyOf(cur.name), faction = !!FACTION[key], me: Stand = st[cur.name] ?? { have: 0, target: 0 }, rank = me.rank ?? 0, tRank = me.targetRank ?? Math.min(5, rank + 1);
  const save = (a: Record<string, Stand>) => { setSt(a); writeStanding(a); };
  const set = (p: Partial<Stand>) => save({ ...st, [cur.name]: { ...me, ...p } });
  const find = (n: string) => sorted.find(s => keyOf(s.name) === keyOf(n))?.name ?? n;
  const fx = faction ? effects(cur.name, amt) : [];
  const add = (sg: 1 | -1) => { const a = { ...st }, d = sg * amt, upd = (name: string, delta: number) => { const c = a[name] ?? { have: 0, target: 0 }, rk = c.rank ?? 0; a[name] = { ...c, have: clampStanding(rk, c.have + delta) }; };
    upd(cur.name, d); if (rel && faction) for (const e of effects(cur.name, d)) upd(find(e.name), e.delta); save(a); };
  const need = faction ? toRank(rank, me.have, tRank) : 0, days = Math.ceil(need / dailyCap(mr)), grp = groupOfSyndicate(cur.name);
  const groups = (Object.keys(ORDER) as (keyof typeof ORDER)[]).map(g => ({ g, items: sorted.filter(s => groupOfSyndicate(s.name) === g) })).filter(x => x.items.length);
  const ladder = [...RANKS].sort((a, b) => a.rank - b.rank);
  return (<><PageHead title="Syndicates" art={<SyndicateArt name={cur.name} size={60} />}>Pick a syndicate to see its rank ladder, which others it helps or hurts, and what each rank sells. Enter your own standing and a target rank. Offers come from the official drop tables; ranks and relations come from the Warframe Wiki.</PageHead>
    {groups.map(({ g, items }) => <div key={g}><h2 style={{ margin: ".6rem 0 .4rem" }}>{TITLE[g]}</h2>
      <div className="emb" role="group" aria-label={TITLE[g]}>{items.map(s => { const k = keyOf(s.name), mine = st[s.name];
        return (<button key={s.name} className="embtn" aria-pressed={k === key} onClick={() => setSel(s.name)}>{SyndicateArt({ name: s.name, size: 48 }) ?? <Initial name={s.name} size={48} />}<b>{s.name}</b>
          <small>{FACTION[k] && mine?.rank != null ? `Rank ${mine.rank}` : mine?.have ? `${mine.have.toLocaleString()} standing` : s.count ? `${s.count} offers` : "no offer data"}</small></button>); })}</div></div>)}
    <section className="gcard sec" aria-label={cur.name} style={{ marginTop: "1rem" }}>
      <div className="sechead"><span style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>{SyndicateArt({ name: cur.name, size: 64 }) ?? <Initial name={cur.name} size={64} />}<span><h2>{cur.name}</h2><span className="muted">{TITLE[grp].replace(" syndicates", "")} syndicate</span></span></span></div>
      {faction ? <>
        <div className="cols">
          <div className="minicard"><h3>Your standing and rank</h3>
            <div className="bar"><label>Rank <select value={rank} onChange={e => { const v = +e.target.value; set({ rank: v, have: clampStanding(v, me.have), targetRank: Math.max(v, tRank) }); }}>{ladder.map(x => <option key={x.rank} value={x.rank}>{x.rank}</option>)}</select></label>
              <label>Standing <input type="number" value={me.have} onChange={e => set({ have: clampStanding(rank, +e.target.value || 0) })} style={{ width: "7.5rem" }} /></label>
              <label>Target rank <select value={tRank} onChange={e => set({ targetRank: +e.target.value })}>{ladder.map(x => <option key={x.rank} value={x.rank}>{x.rank}</option>)}</select></label></div>
            <p style={{ margin: 0 }}>{tRank <= rank ? <span className="tag FRESH">Already at or above rank {tRank}</span> : <>To reach rank {tRank} you need about <b>{need.toLocaleString()}</b> more standing{need > 0 ? ` (about ${days} day${days === 1 ? "" : "s"} at the daily cap)` : ""}.</>}</p></div>
          <div className="minicard"><h3>Earn or lose standing</h3>
            <div className="bar"><label>Amount <input type="number" min={0} value={amt} onChange={e => setAmt(Math.max(0, +e.target.value || 0))} style={{ width: "7.5rem" }} /></label>
              <button className="btn sm" onClick={() => add(1)}>Add</button><button className="btn sm danger" onClick={() => add(-1)}>Remove</button></div>
            <div className="bar"><label><input type="checkbox" checked={rel} onChange={e => setRel(e.target.checked)} /> Apply to related syndicates</label>
              <label>Mastery Rank <input type="number" min={0} max={40} value={mr} onChange={e => setMr(Math.max(0, +e.target.value || 0))} style={{ width: "4.5rem" }} /></label></div>
            <p className="muted" style={{ margin: 0 }}>Daily cap at your Mastery Rank: {dailyCap(mr).toLocaleString()} standing (resets at 0:00 UTC).</p></div></div>
        <h3>Who it helps and who it hurts</h3>
        <div className="cgrid wide">{fx.map(e => <button key={e.kind} className="rel" style={{ textAlign: "left", color: "inherit", font: "inherit", cursor: "pointer" }} onClick={() => setSel(find(e.name))}>{SyndicateArt({ name: e.name, size: 36 }) ?? <Initial name={e.name} size={36} />}<span className="tn"><b>{e.name}</b><small className={e.delta > 0 ? "pos" : "neg"}>{KIND[e.kind]} · {sign(e.delta)} for {amt.toLocaleString()} earned</small></span></button>)}</div>
        <h3>Rank ladder</h3>
        <div className="rungs">{ladder.map(x => <div key={x.rank} className={"rung" + (x.rank < 0 ? " neg" : "") + (x.rank === rank ? " here" : x.rank === tRank && tRank > rank ? " goal" : "")}><span>Rank</span><b>{x.rank}</b><span>{x.min.toLocaleString()} to {x.max.toLocaleString()}</span>{x.rank === rank ? <span className="tag FRESH">You are here</span> : x.rank === tRank && tRank > rank ? <span className="tag">Target</span> : x.rank === 0 ? <span>neutral</span> : null}</div>)}</div>
        <p className="muted">{NOTES.join(" ")}</p></>
        : <div className="minicard" style={{ maxWidth: "30rem" }}><h3>Standing you can spend</h3><div className="bar"><input type="number" min={0} aria-label="Standing available" value={me.have} onChange={e => set({ have: Math.max(0, +e.target.value || 0) })} style={{ width: "8rem" }} />
          <button className="btn sm" onClick={() => set({ have: me.have + 1000 })}>+1,000</button><button className="btn sm" onClick={() => set({ have: Math.max(0, me.have - 1000) })}>−1,000</button></div>
          <p className="muted" style={{ margin: 0 }}>This syndicate has no rank table or opposing syndicates in the sources used here, so only the standing you can spend is tracked.</p></div>}
      <p className="muted" style={{ marginTop: ".8rem" }}>Stored only in this browser. Rank names are not shown: the sources used here list rank numbers, and names differ for each syndicate.</p></section>
    <section className="gcard sec" aria-label={cur.name + " offers"}><div className="sechead"><h2>What {cur.name} sells</h2><span className="muted">{cur.count ? `${cur.count} offers` : ""}</span></div>
      {cur.ranks.length ? <div className="cols" style={{ alignItems: "start" }}>{cur.ranks.map(rk => <div key={rk.rank} className="seccard"><h3>{rk.rank}</h3><span className="muted">{rk.offers.length} offers</span>
        <div className="scrollbox" style={{ maxHeight: "22rem" }}><div style={{ display: "grid", gap: ".35rem" }}>{affordable(rk.offers, me.have).map(o => <div key={o.item} className={"offer" + (me.have > 0 && o.standing > 0 && o.canBuy ? " can" : "")}><Pic name={o.item} size={30} /><span className="tn"><b title={o.item}>{o.item}</b>
          <small>{o.standing ? `${o.standing.toLocaleString()} standing` : "no standing"}{o.cost != null ? ` · ${o.cost.toLocaleString()} credits` : ""}</small></span>
          {me.have > 0 && o.standing > 0 && <span className={"tag" + (o.canBuy ? " FRESH" : "")}>{o.canBuy ? "Affordable" : `${o.missing.toLocaleString()} more`}</span>}</div>)}</div></div></div>)}</div>
        : <p className="muted">The drop data used here has no list of offers for this syndicate{data ? "" : " (the data could not be loaded)"}. Nothing is invented: check the in-game vendor or the wiki.</p>}</section>
    <p className="srclist">Ranks, relations and daily cap: <a href={SYNDICATE_SOURCE.url} target="_blank" rel="noreferrer">{SYNDICATE_SOURCE.label}</a>, entered by hand on {SYNDICATE_SOURCE.verified}.</p><Prov rec={r.rec} /></>);
}
