import { Link } from "react-router-dom";
import { useRefreshAt, useWorld } from "../lib/data";
import { value } from "../lib/farmNow";
import { baroMatches, expired, isExp, type Archon, type Sortie, type Steel, type Trader, type Wave } from "../lib/planner";
import { useFarmNow } from "../lib/useFarmNow";
import { useNeeded } from "../lib/useNeeded";
import Baro from "../Baro";
import { Countdown, Panel, Unavailable } from "./parts";
const at = (d: { expiry: string } | null) => (d ? Date.parse(d.expiry) : null);
const isSortie = (d: unknown): d is Sortie => isExp(d), isArchon = (d: unknown): d is Archon => isExp(d), isSteel = (d: unknown): d is Steel => isExp(d), isWave = (d: unknown): d is Wave => isExp(d), isTrader = (d: unknown): d is Trader => isExp(d);
function Sortie() {
  const { data, status, rec } = useWorld("sortie", isSortie); useRefreshAt("sortie", at(data));
  if (!data || expired(data)) return <Unavailable title="Sortie" status={data ? "LOADING" : status} why="No verified data." note="Updating…" rec={rec} />;
  return <Panel title="Sortie" status={status} rec={rec}><b>{data.boss}</b>{data.faction && <span className="muted"> · {data.faction}</span>}<div><Countdown exp={data.expiry} pre="resets in " /></div>
    <ul className="sub">{(data.variants ?? []).map((v, i) => <li key={i}>{v.missionType} · {v.node}{v.modifier ? ` · ${v.modifier}` : ""}</li>)}</ul></Panel>;
}
function ArchonHunt() {
  const { data, status, rec } = useWorld("archonHunt", isArchon); useRefreshAt("archonHunt", at(data));
  if (!data || expired(data)) return <Unavailable title="Archon Hunt" status={data ? "LOADING" : status} why="No verified data." note="Updating…" rec={rec} />;
  return <Panel title="Archon Hunt" status={status} rec={rec}><b>{data.boss}</b><div><Countdown exp={data.expiry} pre="resets in " /></div>
    <ul className="sub">{(data.missions ?? []).map((m, i) => <li key={i}>{m.type} · {m.node}</li>)}</ul></Panel>;
}
function SteelPath() {
  const { data, status, rec } = useWorld("steelPath", isSteel); useRefreshAt("steelPath", at(data));
  if (!data || expired(data)) return <Unavailable title="Steel Path Honors" status={data ? "LOADING" : status} why="No verified data." note="Updating…" rec={rec} />;
  return <Panel title="Steel Path Honors" status={status} rec={rec}><b>{data.currentReward?.name ?? "Unknown reward"}</b>{data.currentReward?.cost != null && <span className="muted"> · {data.currentReward.cost} Steel Essence</span>}<div><Countdown exp={data.expiry} pre="rotates in " /></div></Panel>;
}
function Nightwave() {
  const { data, status, rec } = useWorld("nightwave", isWave); useRefreshAt("nightwave", at(data));
  if (!data || expired(data)) return <Unavailable title="Nightwave" status={data ? "LOADING" : status} why="No verified data, or no active season." note="Updating…" rec={rec} />;
  const c = data.activeChallenges ?? [];
  return <Panel title="Nightwave" status={status} rec={rec}><b>{c.length} active challenges</b><div><Countdown exp={data.expiry} pre="season ends in " /></div>
    <ul className="sub">{c.slice(0, 6).map((x, i) => <li key={i}>{x.title}{x.isDaily ? " (daily)" : ""}{x.reputation ? ` · ${x.reputation} standing` : ""}</li>)}</ul></Panel>;
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
    <h2>Weekly and rotating</h2><div className="grid"><ArchonHunt /><SteelPath /><Nightwave /><Baro full /></div></>);
}
