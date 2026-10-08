import { Link } from "react-router-dom";
import PageArt from "../PageArt";
import { Pic } from "../ItemArt";
import { useNow, useRefreshAt, useWorld } from "../lib/data";
import SyndicateArt from "../SyndicateArt";
import { alertsView, syndicateAlerts, usefulRewards, type AlertView } from "../lib/alerts";
import { useNeeded } from "../lib/useNeeded";
import { Badge, Countdown, Prov, Unavailable } from "./parts";
const isArr = (d: unknown): d is unknown[] => Array.isArray(d);
/** Live alerts. Re-requested every minute and again right after the earliest end time; ended alerts disappear on their own. */
export function useAlerts() {
  const w = useWorld("alerts", isArr), now = useNow(5000), list = w.data ? alertsView(w.data, now) : null;
  useRefreshAt("alerts", list?.length ? Date.parse(list[0].expiry) : null);
  return { ...w, list };
}
const Card = ({ a, needed }: { a: AlertView; needed: Set<string> }) => { const hit = usefulRewards(a, needed); return (<li className="alertcard">
  {hit.length > 0 && <span className="tag FRESH">★ This helps you: {hit.join(", ")} (still needed for your goals or tracking)</span>}
  <div className="row"><b className="oppt">{a.rewards[0] && <Pic name={a.rewards[0].name} size={36} />}{a.title}</b><span className="muted"><Countdown exp={a.expiry} pre="ends in " /></span></div>
  <div className="muted">{[a.type, a.faction, a.node].filter(Boolean).join(" · ")}{a.levels && ` · level ${a.levels[0]}-${a.levels[1]}`}{a.archwing && " · Archwing"}{a.nightmare && " · Nightmare"}</div>
  <div className="advrow">{a.rewards.map(r => <span key={r.name} className="advit"><Pic name={r.name} size={22} />{r.count > 1 ? `${r.count}x ` : ""}{r.name}</span>)}{a.credits != null && <span className="advit">{a.credits.toLocaleString()} credits</span>}</div></li>); };
/** Daily Syndicate Alerts from the world state. The feed gives the syndicate, its nodes and the end time; it does not list the standing reward. */
function SyndicateMissions() {
  const w = useWorld("syndicateMissions", isArr), now = useNow(5000), list = w.data ? syndicateAlerts(w.data, now) : null;
  if (!list) return <Unavailable title="Syndicate alerts" status={w.status} why="No verified data." rec={w.rec} />;
  if (!list.length) return <p className="muted">No syndicate alerts are listed right now.</p>;
  return (<section aria-label="Syndicate alerts"><h2>Syndicate alerts</h2><p className="muted">Daily missions unlocked at rank 1 of a syndicate. They give extra standing and reset with the Sorties. <Link to="/syndicates">Syndicates</Link></p>
    <ul className="list alerts">{list.map(a => <li key={a.id} className="alertcard"><div className="row"><b className="oppt"><SyndicateArt name={a.syndicate} size={32} /> {a.syndicate}</b><span className="muted"><Countdown exp={a.expiry} pre="ends in " /></span></div><div className="muted">{a.nodes.join(" · ")}</div></li>)}</ul><Prov rec={w.rec} /></section>);
}
export default function Alerts() {
  const { list, status, rec } = useAlerts(), needed = useNeeded();
  return (<><h1><PageArt name="Alerts" size={36} />Alerts</h1><p className="lead">Alerts running right now and their rewards. <Badge s={status} /></p>
    {!list ? <Unavailable title="Alerts" status={status} why="No verified data." rec={rec} />
      : !list.length ? <p className="muted">No alerts are active right now. This page updates by itself when a new one appears.</p>
      : <ul className="list alerts">{list.map(a => <Card key={a.id} a={a} needed={needed} />)}</ul>}
    {list && <Prov rec={rec} />}
    <SyndicateMissions /></>);
}
/** Compact version for Home: how many are active and what they give. */
export function AlertsSummary() {
  const { list, status, rec } = useAlerts(), needed = useNeeded();
  if (!list) return <Unavailable title="Alerts" status={status} why="No verified data." rec={rec} />;
  const useful = [...new Set(list.flatMap(a => usefulRewards(a, needed)))], names = [...new Set(list.flatMap(a => a.rewards.map(r => r.name)))];
  return (<section className="panel"><div className="row"><h3><PageArt name="Alerts" />Alerts</h3><Badge s={status} /></div>
    <div className="big">{list.length} active</div>{names.length > 0 && <div className="muted">{names.slice(0, 3).join(", ")}{names.length > 3 ? ` and ${names.length - 3} more` : ""}</div>}
    {useful.length > 0 && <div className="tag FRESH">★ This helps you: {useful.slice(0, 3).join(", ")}</div>}<Link to="/alerts">Open alerts</Link><Prov rec={rec} /></section>);
}
