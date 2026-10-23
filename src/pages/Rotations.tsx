import { useState } from "react";
import { Link } from "react-router-dom";
import { Pic } from "../ItemArt";
import PageArt from "../PageArt";
import Baro from "../Baro";
import Descendia from "./Descendia";
import Npc from "../Npc";
import { useRefreshAt, useWorld } from "../lib/data";
import { Plat } from "../Money";
import VendorStock from "../VendorStock";
import { anomalyView, arbView, archView, calendarView, dealsView, duviriView, kuvaView, nextWeeklyReset, simarisView, steelView, stockView } from "../lib/rotations";
import { Countdown, Panel, Unavailable } from "./parts";
import { t as tt, tp, useT } from "../i18n";
import { ACRITHIS, ACRITHIS_SOURCE, ARBITRATION_SOURCE, ARB_NOTES, ARB_ROTATIONS, PALLADINO, PALLADINO_SOURCE, acrithisOutdated } from "../data/vendors";
const KUVA_DATE = "2026-10-08";
const ok = (d: unknown): d is object => !!d && typeof d === "object";
const at = (d: unknown) => { const e = (Array.isArray(d) ? d[0] : d) as { expiry?: unknown } | null; return typeof e?.expiry === "string" ? Date.parse(e.expiry) : null; };
const iso = (ms: number) => new Date(ms).toISOString();
const dayLabel = (d: string) => { const t = Date.parse(d); return Number.isFinite(t) && /^\d{4}-\d\d-\d\d/.test(d) ? new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }) : tt("rotDayN", { d }); };
function Teshin() {
  const tr = useT();
  const { data, status, rec } = useWorld("steelPath", ok); useRefreshAt("steelPath", at(data));
  const v = steelView(data);
  if (!v || (!v.current && !v.rotation.length)) return <Unavailable title="Steel Path Honors" status={data ? "UNAVAILABLE" : status} why={tr("noVerified")} rec={rec} />;
  return (<Panel title="Steel Path Honors" status={status} rec={rec}><Npc name="Teshin" role={tr("rotRoleTeshin")} />
    {v.current && <p><b>{tr("rotThisWeek")}</b> {v.current.name}{v.current.cost != null && <span className="muted"> · {v.current.cost} Steel Essence</span>}</p>}
    <details className="stock"><summary className="btn">{tr("rotStockTeshin")}</summary>
    {v.rotation.length > 0 && <><div className="muted">{tr("rotWeeklyStep")}</div><ol className="sub">{v.rotation.map((o, i) => <li key={i} className={o.name === v.current?.name ? "gold" : undefined}>{o.name}{o.cost != null && <span className="muted"> · {o.cost}</span>}{o.name === v.current?.name && " " + tr("rotThisWeekTag")}</li>)}</ol></>}
    {v.evergreens.length > 0 && <><div className="muted">{tr("rotAlways")}</div><VendorStock items={v.evergreens.map(o => ({ name: o.name, cost: o.cost ?? undefined }))} /></>}
    </details>
  </Panel>);
}
function Duviri() {
  const tr = useT();
  const { data, status, rec } = useWorld("duviriCycle", ok); useRefreshAt("duviriCycle", at(data));
  const v = duviriView(data);
  if (!v) return <Unavailable title="Duviri" status={data ? "UNAVAILABLE" : status} why={tr("noVerified")} rec={rec} />;
  return (<Panel title="Duviri" status={status} rec={rec}>{v.state && <p><b>{tr("rotMood")}</b> {v.state}{v.expiry && <> · <Countdown exp={v.expiry} pre={tr("cdChanges") + " "} /></>}</p>}
    {v.choices.length ? v.choices.map(c => <div key={c.category}><div className="muted">{tr("rotCircuit", { category: c.category })}</div><ul className="sub">{c.items.map(i => <li key={i}><Pic name={i} size={22} /> {i}</li>)}</ul></div>) : <p className="muted">{tr("rotNoCircuit")}</p>}
  </Panel>);
}
function Calendar() {
  const tr = useT();
  const { data, status, rec } = useWorld("calendar", ok); useRefreshAt("calendar", at(data));
  const v = calendarView(data);
  if (!v || !v.season) return <Unavailable title="1999 Calendar" status={data ? "UNAVAILABLE" : status} why={tr("noVerified")} rec={rec} />;
  return (<Panel title="1999 Calendar" status={status} rec={rec}><p><b>{v.season}</b>{v.loop != null && <span className="muted"> · {tr("rotLoop", { n: v.loop })}</span>}{v.expiry && <> · <Countdown exp={v.expiry} pre={tr("cdEnds") + " "} /></>}</p>
    {v.days.length > 0 ? <details><summary>{tp("rotDays", v.days.length)}</summary><ul className="sub">{v.days.map(d => <li key={d.day}><b>{dayLabel(d.day)}</b>{d.groups.map(g => <div key={g.kind}><span className="muted">{g.kind}: </span>{g.items.join(" · ")}</div>)}</li>)}</ul></details> : <p className="muted">{tr("rotNoEvents")}</p>}
  </Panel>);
}
function Varzia() {
  const tr = useT();
  const { data, status, rec } = useWorld("vaultTrader", ok); useRefreshAt("vaultTrader", at(data));
  const v = stockView(data);
  if (!v) return <Unavailable title="Prime Resurgence" status={data ? "UNAVAILABLE" : status} why={tr("noVerified")} rec={rec} />;
  return (<Panel title="Prime Resurgence" status={status} rec={rec}><Npc name="Varzia" role="Prime Resurgence" />{v.location && <p><b>{v.location}</b></p>}
    {v.expiry && <div><Countdown exp={v.expiry} pre={(v.active ? tr("cdLeaves") : tr("cdNextChange")) + " "} /></div>}
    {v.items.length > 0 ? <details open><summary>{tr("rotStock", { n: v.items.length })}</summary><VendorStock items={v.items.map(name => ({ name }))} /></details> : <p className="muted">{tr("rotNoStock")}</p>}
  </Panel>);
}
function Archimedeas() {
  const tr = useT();
  const { data, status, rec } = useWorld("archimedeas", ok); useRefreshAt("archimedeas", at(data));
  const v = archView(data);
  if (!v.length) return <Unavailable title="Archimedea" status={data ? "UNAVAILABLE" : status} why={tr("noVerified")} rec={rec} />;
  return (<Panel title="Archimedea" status={status} rec={rec}>{v.map((a, i) => <div key={i}><b>{a.type}</b>{a.expiry && <> · <Countdown exp={a.expiry} pre={tr("cdResets") + " "} /></>}
    <ul className="sub">{a.missions.map((m, j) => <li key={j}>{m}</li>)}</ul></div>)}</Panel>);
}
function Darvo() {
  const tr = useT();
  const { data, status, rec } = useWorld("dailyDeals", ok); useRefreshAt("dailyDeals", at(data));
  const v = dealsView(data);
  if (!v.length) return <Unavailable title={tr("rotDaily")} art="Daily deal" status={data ? "UNAVAILABLE" : status} why={tr("noVerified")} rec={rec} />;
  return (<Panel title={tr("rotDaily")} art="Daily deal" status={status} rec={rec}><Npc name="Darvo" role={tr("rotDaily")} />{v.map((d, i) => <div key={i}><b>{d.item}</b>
    <div className="muted">{d.price != null && <>{tr("rotPrice")} <Plat n={d.price} /></>}{d.original != null && <> {tr("rotInstead")} <Plat n={d.original} /></>}{d.left != null && " · " + tr("rotLeft", { n: d.left })}</div>
    {d.expiry && <div><Countdown exp={d.expiry} pre={tr("cdEnds") + " "} /></div>}</div>)}<p className="muted">{tr("rotStoreDeal")}</p></Panel>);
}
function Arbitration() {
  const tr = useT();
  const { data, status, rec } = useWorld("arbitration", ok); useRefreshAt("arbitration", at(data));
  const v = arbView(data);
  if (!v) return <Unavailable title="Arbitration" status={data ? "UNAVAILABLE" : status} why={data ? tr("rotNoArb") : tr("noVerified")} rec={rec} />;
  return (<Panel title="Arbitration" status={status} rec={rec}><b>{v.node}</b><div className="muted">{[v.type, v.enemy].filter(Boolean).join(" · ")}</div>{v.expiry && <div><Countdown exp={v.expiry} pre={tr("cdRotates") + " "} /></div>}</Panel>);
}
const ManualTag = ({ date }: { date: string }) => { const tr = useT(); return <span className="tag STALE" title={tr("rotManualTip", { date })}>{tr("rotManual")}</span>; };
/** Palladino's stock is fixed (it only resets its purchase limits weekly), so it is copied from the wiki and labeled as manual. */
function Palladino() {
  const tr = useT();
  return (<section className="panel"><div className="row"><h3>Palladino</h3><ManualTag date={PALLADINO_SOURCE.date} /></div><Npc name="Palladino" role={tr("rotRoleRiven")} />
    <p className="muted">{tr("rotPalladino")}</p>
    <details className="stock"><summary className="btn">{tr("rotStockPrices")}</summary><ul className="sub">{PALLADINO.map(w => <li key={w.name}><b>{w.name}</b> <span className="muted">· {w.cost} {w.currency}{w.cost > 1 ? "s" : ""} · {w.limit}</span></li>)}</ul></details>
    <div className="muted">{tr("rotSourceA")} <a href={PALLADINO_SOURCE.url} target="_blank" rel="noreferrer">{PALLADINO_SOURCE.name}</a>{tr("rotChecked", { date: PALLADINO_SOURCE.date })}</div></section>);
}
function ArbRewards() {
  const tr = useT();
  const [r, setR] = useState<"A" | "B" | "C">("A");
  return (<section className="panel"><div className="row"><h3>{tr("rotArbRewards")}</h3><ManualTag date={ARBITRATION_SOURCE.date} /></div>
    <p className="muted">{tr("rotArbOrder")}</p>
    <div className="seg" role="group" aria-label={tr("rotRotation")}>{(["A", "B", "C"] as const).map(k => <button key={k} className={"btn" + (r === k ? " on" : "")} aria-pressed={r === k} onClick={() => setR(k)}>{tr("rotRotationN", { k })}</button>)}</div>
    <ul className="rwlist">{ARB_ROTATIONS[r].map(x => <li key={x.name}><span>{x.name}</span><b>{x.chance}%</b></li>)}</ul>
    {ARB_NOTES.map(n => <p className="muted" key={n}>{n}</p>)}
    <p><Link to="/guides?s=arbitrations">{tr("rotHowArb")}</Link></p>
    <div className="muted">{tr("rotSourceA")} <a href={ARBITRATION_SOURCE.url} target="_blank" rel="noreferrer">{ARBITRATION_SOURCE.name}</a>{tr("rotChecked", { date: ARBITRATION_SOURCE.date })}</div></section>);
}
function Kuva() {
  const tr = useT();
  const { data, status, rec } = useWorld("kuva", ok); useRefreshAt("kuva", Array.isArray(data) ? at(data) : null);
  const v = kuvaView(data);
  if (!v.length) return <Unavailable title={tr("rotKuvaTitle")} art="Kuva missions" status={data ? "UNAVAILABLE" : status} why={Array.isArray(data) ? tr("rotNoKuva") : tr("noVerified")} rec={rec} />;
  return (<Panel title={tr("rotKuvaTitle")} art="Kuva missions" status={status} rec={rec}><ul className="sub">{v.slice(0, 8).map((k, i) => <li key={i}><b>{k.node}</b><span className="muted"> {[k.type, k.enemy].filter(Boolean).join(" · ")}</span></li>)}</ul>{v.length > 8 && <p className="muted">{tr("rotShowing", { a: 8, b: v.length })}</p>}</Panel>);
}
function KuvaInfo() {
  const tr = useT();
  return (<section className="panel"><div className="row"><h3>Kuva Siphons</h3><ManualTag date={KUVA_DATE} /></div>
    <p className="muted">{tr("rotKuvaInfo")}</p>
    <p><Link to="/guides?s=kuva">{tr("rotHowKuva")}</Link></p></section>);
}
function Simaris() {
  const tr = useT();
  const { data, status, rec } = useWorld("simaris", ok);
  const v = simarisView(data);
  if (!v) return <Unavailable title="Sanctuary" status={data ? "UNAVAILABLE" : status} why={tr("noVerified")} rec={rec} />;
  return (<Panel title="Sanctuary" status={status} rec={rec}><Npc name="Cephalon Simaris" role={tr("rotRoleSim")} /><b>{v.target}</b><div className="muted">{v.active ? tr("rotSimActive") : tr("rotSimInactive")}</div></Panel>);
}
function Anomaly() {
  const tr = useT();
  const { data, status, rec } = useWorld("sentientOutposts", ok); useRefreshAt("sentientOutposts", at(data));
  const v = anomalyView(data);
  if (!v) return <Unavailable title="Sentient Anomaly" status={data ? "UNAVAILABLE" : status} why={tr("noVerified")} rec={rec} />;
  return (<Panel title="Sentient Anomaly" status={status} rec={rec}>{v.active ? <><b>{v.node}</b><div className="muted">{[v.type, v.faction].filter(Boolean).join(" · ")}</div>{v.expiry && <div><Countdown exp={v.expiry} pre={tr("cdEnds") + " "} /></div>}</> : <p className="muted">{tr("rotNotActive")}</p>}</Panel>);
}
/** Acrithis' weekly wares as the wiki lists them. Copied by hand, so it says plainly when the week it was read in is over. */
function Acrithis() {
  const tr = useT();
  const old = acrithisOutdated(Date.now());
  return (<section className="panel"><div className="row"><h3>Acrithis</h3>{old ? <span className="tag STALE" title={tr("rotOutdatedTip")}>{tr("rotMayOutdated")}</span> : <ManualTag date={ACRITHIS_SOURCE.date} />}</div><Npc name="Acrithis" role={tr("rotRoleAcr")} />
    <p className="muted">{tr("rotAcrithis", { date: ACRITHIS.asOf })}</p>
    <ul className="rwlist">{ACRITHIS.wares.map(w => <li key={w}><span>{w}</span></li>)}</ul>
    {old && <p className="muted">{tr("rotAcrOver")}</p>}
    <div className="muted">{tr("rotSourceA")} <a href={ACRITHIS_SOURCE.url} target="_blank" rel="noreferrer">{ACRITHIS_SOURCE.name}</a>{tr("rotChecked", { date: ACRITHIS_SOURCE.date })}</div></section>);
}
export default function Rotations() {
  const tr = useT();
  const reset = iso(nextWeeklyReset());
  return (<><h1><PageArt name="Rotations" size={36} />{tr("rotations")}</h1>
    <p className="lead">{tr("rotLead")}</p>
    <p className="muted"><b>{tr("rotNextReset")}</b> <Countdown exp={reset} /> <span>{tr("rotCalcSched")}</span></p>
    <h2>{tr("rotTraders")}</h2><div className="grid"><Baro full /><Varzia /></div>
    <h2>{tr("rotWeekly")}</h2><div className="grid"><Teshin /><Duviri /><Calendar /><Archimedeas /></div>
    <h2>The Descendia</h2><Descendia />
    <h2>{tr("rotDailyMission")}</h2><div className="grid"><Darvo /><Arbitration /><ArbRewards /><Kuva /><KuvaInfo /><Simaris /><Anomaly /></div>
    <h2>{tr("rotOtherVendors")}</h2><div className="grid">
      <Palladino />
      <Acrithis />
    </div></>);
}
