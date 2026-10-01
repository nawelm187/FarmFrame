import { Link } from "react-router-dom";
import { useWorld } from "../lib/data";
import { value } from "../lib/farmNow";
import { baroMatches, expired, isExp, type Archon, type Sortie, type Steel, type Trader, type Wave } from "../lib/planner";
import { useFarmNow } from "../lib/useFarmNow";
import { useNeeded } from "../lib/useNeeded";
import { Countdown, Panel, Unavailable } from "./parts";
const isSortie = (d: unknown): d is Sortie => isExp(d), isArchon = (d: unknown): d is Archon => isExp(d), isSteel = (d: unknown): d is Steel => isExp(d), isWave = (d: unknown): d is Wave => isExp(d), isTrader = (d: unknown): d is Trader => isExp(d);
function Sortie() {
  const { data, status, rec } = useWorld("sortie", isSortie);
  if (!data || expired(data)) return <Unavailable title="Sortie" status={data ? "STALE" : status} why={data ? "Expired, refreshing." : "No verified data."} rec={rec} />;
  return <Panel title="Sortie" status={status} rec={rec}><b>{data.boss}</b>{data.faction && <span className="muted"> · {data.faction}</span>}<div><Countdown exp={data.expiry} pre="resets in " /></div>
    <ul className="sub">{(data.variants ?? []).map((v, i) => <li key={i}>{v.missionType} · {v.node}{v.modifier ? ` · ${v.modifier}` : ""}</li>)}</ul></Panel>;
}
function ArchonHunt() {
  const { data, status, rec } = useWorld("archonHunt", isArchon);
  if (!data || expired(data)) return <Unavailable title="Archon Hunt" status={data ? "STALE" : status} why={data ? "Expired, refreshing." : "No verified data."} rec={rec} />;
  return <Panel title="Archon Hunt" status={status} rec={rec}><b>{data.boss}</b><div><Countdown exp={data.expiry} pre="resets in " /></div>
    <ul className="sub">{(data.missions ?? []).map((m, i) => <li key={i}>{m.type} · {m.node}</li>)}</ul></Panel>;
}
function SteelPath() {
  const { data, status, rec } = useWorld("steelPath", isSteel);
  if (!data || expired(data)) return <Unavailable title="Steel Path Honors" status={data ? "STALE" : status} why={data ? "Expired, refreshing." : "No verified data."} rec={rec} />;
  return <Panel title="Steel Path Honors" status={status} rec={rec}><b>{data.currentReward?.name ?? "Unknown reward"}</b>{data.currentReward?.cost != null && <span className="muted"> · {data.currentReward.cost} Steel Essence</span>}<div><Countdown exp={data.expiry} pre="rotates in " /></div></Panel>;
}
function Nightwave() {
  const { data, status, rec } = useWorld("nightwave", isWave);
  if (!data || expired(data)) return <Unavailable title="Nightwave" status={data ? "STALE" : status} why={data ? "Expired, refreshing." : "No verified data, or no active season."} rec={rec} />;
  const c = data.activeChallenges ?? [];
  return <Panel title="Nightwave" status={status} rec={rec}><b>{c.length} active challenges</b><div><Countdown exp={data.expiry} pre="season ends in " /></div>
    <ul className="sub">{c.slice(0, 6).map((x, i) => <li key={i}>{x.title}{x.isDaily ? " (daily)" : ""}{x.reputation ? ` · ${x.reputation} standing` : ""}</li>)}</ul></Panel>;
}
function VoidTrader() {
  const { data, status, rec } = useWorld("voidTrader", isTrader), needed = useNeeded();
  if (!data) return <Unavailable title="Void Trader" status={status} why="No verified data." rec={rec} />;
  if (!data.active) return <Panel title="Void Trader" status={status} rec={rec}><b>Not here yet</b>{data.location && <span className="muted"> · arrives at {data.location}</span>}{data.activation && <div><Countdown exp={data.activation} pre="arrives in " /></div>}</Panel>;
  const hit = baroMatches(data, needed);
  return <Panel title="Void Trader" status={status} rec={rec}><b>{data.location}</b><div><Countdown exp={data.expiry} pre="leaves in " /></div>
    {hit.length ? <p><b>Stock you need:</b> {hit.map(i => `${i.item}${i.ducats != null ? ` (${i.ducats} ducats, ${i.credits ?? "?"} credits)` : ""}`).join(", ")}</p> : <p className="muted">Nothing in his stock matches what you still need (matched by item name).</p>}</Panel>;
}
export default function Planner() {
  const { goals, opps, fis, inv } = useFarmNow(), trader = useWorld("voidTrader", isTrader), needed = useNeeded();
  const baro = trader.data ? baroMatches(trader.data, needed) : [];
  const empty = !opps.length && !baro.length;
  return (<><h1>Planner</h1>
    <p className="lead">Current activities, with what matters to your own goals first.</p>
    <h2>Relevant to you</h2>
    {!goals ? <p className="muted">No goals yet. Add one from a Warframe or weapon page and this section will show what advances it. <Link to="/warframes">Browse Warframes</Link></p>
      : !fis.data && !inv.data && !trader.data ? <p className="muted">Live data is unavailable, so relevance cannot be computed right now.</p>
      : empty ? <p className="muted">Nothing active right now advances your goals.</p>
      : <ol className="opps">{baro.length > 0 && <li><b>Void Trader</b><div className="muted">Advances: {baro.map(i => i.item).join(", ")}</div><div className="muted">Value to your current goals: <b>{value(baro.length)}</b></div></li>}
        {opps.slice(0, 4).map(o => <li key={o.key}><b>{o.title}</b><div className="muted">Advances: {o.advances.slice(0, 4).join(", ")}</div><div className="muted">Value to your current goals: <b>{value(o.advances.length)}</b></div></li>)}</ol>}
    <h2>Daily</h2><div className="grid"><Sortie /></div>
    <h2>Weekly and rotating</h2><div className="grid"><ArchonHunt /><SteelPath /><Nightwave /><VoidTrader /></div></>);
}
