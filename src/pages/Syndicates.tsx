import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Pic } from "../ItemArt";
import SyndicateArt from "../SyndicateArt";
import { PageHead } from "../ui";
import { ALL_SYNDICATES, FACTION, NOTES, RANKS, SYNDICATE_SOURCE, dailyCap, groupOfSyndicate, keyOf } from "../data/syndicateInfo";
import { useMany } from "../lib/data";
import { affordable, clampStanding, effects, parseSyndicates, readStanding, toRank, writeStanding, type Stand, type Syndicate } from "../lib/syndicates";
import { Prov } from "./parts";
import { tp, useT } from "../i18n";
import { rich } from "../lib/rich";
import { NightwaveSeries, RankCards, WIKI_NOTE, WikiOffers, wikiFor } from "../SyndicateWiki";
const FILE = [{ id: "syndicates", file: "syndicates.json" }];
const ORDER = { faction: 0, "open-world": 1, neutral: 2, event: 3 } as const, TITLE = { faction: "synFaction", "open-world": "synOpen", neutral: "synNeutral", event: "synEvent" } as const, SUB = { faction: "synKFaction", "open-world": "synKOpen", neutral: "synKNeutral", event: "synKEvent" } as const;
const KIND = { ally: "synAlly", opposed: "synOpposed", enemy: "synEnemy" } as const;
const sign = (n: number) => (n > 0 ? "+" : "") + n.toLocaleString();
const Initial = ({ name, size }: { name: string; size: number }) => <span className="blank" style={{ width: size, height: size }} aria-hidden="true">{name[0]}</span>;
/** Syndicates: every syndicate with its emblem, rank ladder, who likes or hates whom, what each rank sells, and your own standing and target, kept in this browser. */
export default function Syndicates() {
  const tr = useT(), [r] = useMany(FILE), data = parseSyndicates(r.rec?.data), [params] = useSearchParams(), [sel, setSel] = useState(ALL_SYNDICATES.find(n => keyOf(n) === keyOf(params.get("s") ?? "")) ?? ALL_SYNDICATES[0]), [st, setSt] = useState(readStanding), [amt, setAmt] = useState(10000), [rel, setRel] = useState(true), [mr, setMr] = useState(0);
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
  const wiki = wikiFor(key), rt = (n: number) => { const t = wiki?.ranks.find(r => r.rank === n && r.title !== "Initiation")?.title; return t ? `${n} · ${t}` : String(n); };
  const need = faction ? toRank(rank, me.have, tRank) : 0, days = Math.ceil(need / dailyCap(mr)), grp = groupOfSyndicate(cur.name);
  const groups = (Object.keys(ORDER) as (keyof typeof ORDER)[]).map(g => ({ g, items: sorted.filter(s => groupOfSyndicate(s.name) === g) })).filter(x => x.items.length);
  const ladder = [...RANKS].sort((a, b) => a.rank - b.rank);
  return (<><PageHead title={tr("syndicates")} art={<SyndicateArt name={cur.name} size={60} />}>{tr("synLead")}</PageHead>
    {groups.map(({ g, items }) => <div key={g}><h2 style={{ margin: ".6rem 0 .4rem" }}>{tr(TITLE[g])}</h2>
      <div className="emb" role="group" aria-label={tr(TITLE[g])}>{items.map(s => { const k = keyOf(s.name), mine = st[s.name];
        return (<button key={s.name} className="embtn" aria-pressed={k === key} onClick={() => setSel(s.name)}>{SyndicateArt({ name: s.name, size: 48 }) ?? <Initial name={s.name} size={48} />}<b>{s.name}</b>
          <small>{FACTION[k] && mine?.rank != null ? tr("synRank", { n: mine.rank }) : mine?.have ? tr("drNoteStanding", { n: mine.have.toLocaleString() }) : (wikiFor(k)?.offers.length || s.count) ? tr("synOffersN", { n: wikiFor(k)?.offers.length || s.count }) : tr("synRanksOnly")}</small></button>); })}</div></div>)}
    <section className="gcard sec" aria-label={cur.name} style={{ marginTop: "1rem" }}>
      <header className="sechead"><span style={{ display: "flex", alignItems: "center", gap: ".8rem" }}>{SyndicateArt({ name: cur.name, size: 64 }) ?? <Initial name={cur.name} size={64} />}<span><h2>{cur.name}</h2><span className="muted">{tr(SUB[grp])}</span></span></span></header>
      {faction ? <>
        <div className="cols">
          <article className="minicard"><h3>{tr("synYour")}</h3>
            <div className="bar"><label>{tr("synLblRank")} <select value={rank} onChange={e => { const v = +e.target.value; set({ rank: v, have: clampStanding(v, me.have), targetRank: Math.max(v, tRank) }); }}>{ladder.map(x => <option key={x.rank} value={x.rank}>{rt(x.rank)}</option>)}</select></label>
              <label>{tr("synLblStanding")} <input type="number" value={me.have} onChange={e => set({ have: clampStanding(rank, +e.target.value || 0) })} style={{ width: "7.5rem" }} /></label>
              <label>{tr("synTargetRank")} <select value={tRank} onChange={e => set({ targetRank: +e.target.value })}>{ladder.map(x => <option key={x.rank} value={x.rank}>{rt(x.rank)}</option>)}</select></label></div>
            <p style={{ margin: 0 }}>{tRank <= rank ? <span className="tag FRESH">{tr("synAlready", { n: tRank })}</span> : need > 0 ? rich(tp("synNeedB", days, { t: tRank, s: "{s}" }), { s: <b>{need.toLocaleString()}</b> }) : rich(tr("synNeedA", { t: tRank, n: "{n}" }), { n: <b>{need.toLocaleString()}</b> })}</p></article>
          <article className="minicard"><h3>{tr("synEarn")}</h3>
            <div className="bar"><label>{tr("synAmount")} <input type="number" min={0} value={amt} onChange={e => setAmt(Math.max(0, +e.target.value || 0))} style={{ width: "7.5rem" }} /></label>
              <button className="btn sm" onClick={() => add(1)}>{tr("synAdd")}</button><button className="btn sm danger" onClick={() => add(-1)}>{tr("remove")}</button></div>
            <div className="bar"><label><input type="checkbox" checked={rel} onChange={e => setRel(e.target.checked)} /> {tr("synApply")}</label>
              <label>{tr("mastery")} <input type="number" min={0} max={40} value={mr} onChange={e => setMr(Math.max(0, +e.target.value || 0))} style={{ width: "4.5rem" }} /></label></div>
            <p className="muted" style={{ margin: 0 }}>{tr("synDaily", { n: dailyCap(mr).toLocaleString() })}</p></article></div>
        <h3>{tr("synWho")}</h3>
        <div className="cgrid wide">{fx.map(e => <button key={e.kind} className="rel" style={{ textAlign: "left", color: "inherit", font: "inherit", cursor: "pointer" }} onClick={() => setSel(find(e.name))}>{SyndicateArt({ name: e.name, size: 36 }) ?? <Initial name={e.name} size={36} />}<span className="tn"><b>{e.name}</b><small className={e.delta > 0 ? "pos" : "neg"}>{tr(KIND[e.kind])} · {tr("synFor", { delta: sign(e.delta), amt: amt.toLocaleString() })}</small></span></button>)}</div>
        <h3>{tr("synLadder")}</h3>
        <div className="rungs">{ladder.map(x => <div key={x.rank} className={"rung" + (x.rank < 0 ? " neg" : "") + (x.rank === rank ? " here" : x.rank === tRank && tRank > rank ? " goal" : "")}><span>{tr("synLblRank")}</span><b>{x.rank}</b><span>{tr("synRange", { min: x.min.toLocaleString(), max: x.max.toLocaleString() })}</span>{x.rank === rank ? <span className="tag FRESH">{tr("synHere")}</span> : x.rank === tRank && tRank > rank ? <span className="tag">{tr("synTarget")}</span> : x.rank === 0 ? <span>{tr("synNeutralRank")}</span> : null}</div>)}</div>
        <p className="muted">{NOTES.join(" ")}</p></>
        : <article className="minicard" style={{ maxWidth: "30rem" }}><h3>{tr("synSpend")}</h3><div className="bar"><input type="number" min={0} aria-label={tr("synAvail")} value={me.have} onChange={e => set({ have: Math.max(0, +e.target.value || 0) })} style={{ width: "8rem" }} />
          <button className="btn sm" onClick={() => set({ have: me.have + 1000 })}>+1,000</button><button className="btn sm" onClick={() => set({ have: Math.max(0, me.have - 1000) })}>−1,000</button></div>
          <p className="muted" style={{ margin: 0 }}>{tr("synNoRanks")}</p></article>}
      {wiki && <RankCards w={wiki} here={faction ? rank : undefined} goal={faction ? tRank : undefined} />}
      <p className="muted" style={{ marginTop: ".8rem" }}>{tr("synStored")}</p></section>
    <section className="gcard sec" aria-label={tr("synOffersAria", { name: cur.name })}><header className="sechead"><h2>{tr("synSells", { name: cur.name })}</h2><span className="muted">{wiki?.offers.length ? tr("synOffersN", { n: wiki.offers.length }) : cur.count ? tr("synOffersN", { n: cur.count }) : ""}</span></header>
      {key === "nightwave" && <NightwaveSeries />}
      {wiki?.notes?.map(n => <p key={n} className="note">{n}</p>)}
      {wiki?.offers.length ? <WikiOffers w={wiki} have={me.have} /> : cur.ranks.length ? <div className="cols" style={{ alignItems: "start" }}>{cur.ranks.map(rk => <div key={rk.rank} className="seccard"><h3>{rk.rank}</h3><span className="muted">{tr("synOffersN", { n: rk.offers.length })}</span>
        <div className="scrollbox" style={{ maxHeight: "22rem" }}><div style={{ display: "grid", gap: ".35rem" }}>{affordable(rk.offers, me.have).map(o => <div key={o.item} className={"offer" + (me.have > 0 && o.standing > 0 && o.canBuy ? " can" : "")}><Pic name={o.item} size={30} /><span className="tn"><b title={o.item}>{o.item}</b>
          <small>{o.standing ? tr("drNoteStanding", { n: o.standing.toLocaleString() }) : tr("synNoStanding")}{o.cost != null ? ` · ${tr("alCredits", { n: o.cost.toLocaleString() })}` : ""}</small></span>
          {me.have > 0 && o.standing > 0 && <span className={"tag" + (o.canBuy ? " FRESH" : "")}>{o.canBuy ? tr("synAffordable") : tr("pchMoreN", { n: o.missing.toLocaleString() })}</span>}</div>)}</div></div></div>)}</div>
        : <p className="muted">{data ? tr("synNoOffers") : tr("synNoOffersLoad")}</p>}</section>
    <p className="srclist">{rich(tr("synSources", { date: SYNDICATE_SOURCE.verified }), { link: <a href={SYNDICATE_SOURCE.url} target="_blank" rel="noreferrer">{SYNDICATE_SOURCE.label}</a> })} {WIKI_NOTE}{wiki ? <> {rich(tr("synPage"), { link: <a href={wiki.url} target="_blank" rel="noreferrer">{tr("synOnWiki", { name: wiki.name })}</a> })}</> : null}</p><Prov rec={r.rec} /></>);
}
