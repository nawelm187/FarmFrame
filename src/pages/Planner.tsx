import PageArt from "../PageArt";
import { READY_LABEL, readiness } from "../lib/unlock";
import { Link } from "react-router-dom";
import { useRefreshAt, useWorld } from "../lib/data";
import { value } from "../lib/farmNow";
import { baroMatches, expired, isExp, type Archon, type Sortie, type Steel, type Trader, type Wave } from "../lib/planner";
import { useFarmNow } from "../lib/useFarmNow";
import { useNeeded } from "../lib/useNeeded";
import Baro from "../Baro";
import Npc from "../Npc";
import { Countdown, Panel, Unavailable } from "./parts";
import { tp, useT } from "../i18n";
const at = (d: { expiry: string } | null) => (d ? Date.parse(d.expiry) : null);
const isSortie = (d: unknown): d is Sortie => isExp(d), isArchon = (d: unknown): d is Archon => isExp(d), isSteel = (d: unknown): d is Steel => isExp(d), isWave = (d: unknown): d is Wave => isExp(d), isTrader = (d: unknown): d is Trader => isExp(d);
function Sortie() {
  const tr = useT();
  const { data, status, rec } = useWorld("sortie", isSortie); useRefreshAt("sortie", at(data));
  if (!data || expired(data)) return <Unavailable title="Sortie" status={data ? "LOADING" : status} why={tr("noVerified")} note={tr("updating")} rec={rec} />;
  return <Panel title="Sortie" status={status} rec={rec}><b>{data.boss}</b>{data.faction && <span className="muted"> · {data.faction}</span>}<div><Countdown exp={data.expiry} pre={tr("cdResets") + " "} /></div>
    <ul className="sub">{(data.variants ?? []).map((v, i) => <li key={i}>{v.missionType} · {v.node}{v.modifier ? ` · ${v.modifier}` : ""}</li>)}</ul></Panel>;
}
function ArchonHunt() {
  const tr = useT();
  const { data, status, rec } = useWorld("archonHunt", isArchon); useRefreshAt("archonHunt", at(data));
  if (!data || expired(data)) return <Unavailable title="Archon Hunt" status={data ? "LOADING" : status} why={tr("noVerified")} note={tr("updating")} rec={rec} />;
  return <Panel title="Archon Hunt" status={status} rec={rec}>{data.boss && <Npc name={data.boss} role="Archon Hunt" />}<b>{data.boss}</b><div><Countdown exp={data.expiry} pre={tr("cdResets") + " "} /></div>
    <ul className="sub">{(data.missions ?? []).map((m, i) => <li key={i}>{m.type} · {m.node}</li>)}</ul></Panel>;
}
function SteelPath() {
  const tr = useT();
  const { data, status, rec } = useWorld("steelPath", isSteel); useRefreshAt("steelPath", at(data));
  if (!data || expired(data)) return <Unavailable title="Steel Path Honors" status={data ? "LOADING" : status} why={tr("noVerified")} note={tr("updating")} rec={rec} />;
  return <Panel title="Steel Path Honors" status={status} rec={rec}><Npc name="Teshin" role="Steel Path Honors" /><b>{data.currentReward?.name ?? tr("plUnknownReward")}</b>{data.currentReward?.cost != null && <span className="muted"> · {data.currentReward.cost} Steel Essence</span>}<div><Countdown exp={data.expiry} pre={tr("cdRotates") + " "} /></div></Panel>;
}
function Nightwave() {
  const tr = useT();
  const { data, status, rec } = useWorld("nightwave", isWave); useRefreshAt("nightwave", at(data));
  if (!data || expired(data)) return <Unavailable title="Nightwave" status={data ? "LOADING" : status} why={tr("plNoSeason")} note={tr("updating")} rec={rec} />;
  const c = data.activeChallenges ?? [];
  return <Panel title="Nightwave" status={status} rec={rec}><Npc name="Nora Night" role="Nightwave" /><b>{tp("plChallenges", c.length)}</b><div><Countdown exp={data.expiry} pre={tr("cdSeasonEnds") + " "} /></div>
    <ul className="sub">{c.slice(0, 6).map((x, i) => <li key={i}>{x.title}{x.isDaily ? " " + tr("plDailyTag") : ""}{x.reputation ? " · " + tr("plStanding", { n: x.reputation }) : ""}</li>)}</ul></Panel>;
}
export default function Planner() {
  const tr = useT();
  const { goals, opps, fis, inv } = useFarmNow(), trader = useWorld("voidTrader", isTrader), needed = useNeeded();
  const baro = trader.data ? baroMatches(trader.data, needed) : [];
  const empty = !opps.length && !baro.length;
  return (<><h1><PageArt name="Planner" size={36} />{tr("planner")}</h1>
    <p className="lead">{tr("plLead")}</p>
    <h2>{tr("plRelevant")}</h2>
    {!goals ? <p className="muted">{tr("noGoals")} <Link to="/warframes">{tr("browseWarframes")}</Link></p>
      : !fis.data && !inv.data && !trader.data ? <p className="muted">{tr("plNoLive")}</p>
      : empty ? <p className="muted">{tr("plNothing")}</p>
      : <ol className="opps">{baro.length > 0 && <li><b>{tr("baroRole")}</b><div className="muted">{tr("fpAdvances", { list: baro.map(i => i.item).join(", ") })}</div><div className="muted">{tr("plValue")} <b>{value(baro.length)}</b></div></li>}
        {opps.slice(0, 4).map(o => <li key={o.key}><b>{o.title}</b> <span className="tag">{READY_LABEL[readiness(o.blocks)]}</span>{(o.blocks ?? []).map(b => <div key={b.text} className="muted">{b.severity === "blocked" ? tr("saNeeds") : tr("saCheck")} {b.text}</div>)}<div className="muted">{tr("fpAdvances", { list: o.advances.slice(0, 4).join(", ") })}</div><div className="muted">{tr("plValue")} <b>{value(o.advances.length)}</b></div></li>)}</ol>}
    <h2>{tr("plDaily")}</h2><div className="grid"><Sortie /></div>
    <h2>{tr("plWeekly")}</h2><div className="grid"><ArchonHunt /><SteelPath /><Nightwave /><Baro full /></div></>);
}
