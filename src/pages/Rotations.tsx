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
import { ACRITHIS, ACRITHIS_SOURCE, ARBITRATION_SOURCE, ARB_NOTES, ARB_ROTATIONS, PALLADINO, PALLADINO_SOURCE, acrithisOutdated } from "../data/vendors";
const KUVA_DATE = "2026-10-08";
const ok = (d: unknown): d is object => !!d && typeof d === "object";
const at = (d: unknown) => { const e = (Array.isArray(d) ? d[0] : d) as { expiry?: unknown } | null; return typeof e?.expiry === "string" ? Date.parse(e.expiry) : null; };
const iso = (ms: number) => new Date(ms).toISOString();
const dayLabel = (d: string) => { const t = Date.parse(d); return Number.isFinite(t) && /^\d{4}-\d\d-\d\d/.test(d) ? new Date(t).toLocaleDateString(undefined, { month: "short", day: "numeric", timeZone: "UTC" }) : `Day ${d}`; };
function Teshin() {
  const { data, status, rec } = useWorld("steelPath", ok); useRefreshAt("steelPath", at(data));
  const v = steelView(data);
  if (!v || (!v.current && !v.rotation.length)) return <Unavailable title="Steel Path Honors" status={data ? "UNAVAILABLE" : status} why="No verified data." rec={rec} />;
  return (<Panel title="Steel Path Honors" status={status} rec={rec}><Npc name="Teshin" role="Steel Path Honors shop" />
    {v.current && <p><b>This week:</b> {v.current.name}{v.current.cost != null && <span className="muted"> · {v.current.cost} Steel Essence</span>}</p>}
    <details className="stock"><summary className="btn">Stock: weekly rotation and always available</summary>
    {v.rotation.length > 0 && <><div className="muted">Weekly rotation, one step each week:</div><ol className="sub">{v.rotation.map((o, i) => <li key={i} className={o.name === v.current?.name ? "gold" : undefined}>{o.name}{o.cost != null && <span className="muted"> · {o.cost}</span>}{o.name === v.current?.name && " (this week)"}</li>)}</ol></>}
    {v.evergreens.length > 0 && <><div className="muted">Always available (Steel Essence):</div><VendorStock items={v.evergreens.map(o => ({ name: o.name, cost: o.cost ?? undefined }))} /></>}
    </details>
  </Panel>);
}
function Duviri() {
  const { data, status, rec } = useWorld("duviriCycle", ok); useRefreshAt("duviriCycle", at(data));
  const v = duviriView(data);
  if (!v) return <Unavailable title="Duviri" status={data ? "UNAVAILABLE" : status} why="No verified data." rec={rec} />;
  return (<Panel title="Duviri" status={status} rec={rec}>{v.state && <p><b>Mood:</b> {v.state}{v.expiry && <> · <Countdown exp={v.expiry} pre="changes in " /></>}</p>}
    {v.choices.length ? v.choices.map(c => <div key={c.category}><div className="muted">The Circuit, {c.category}:</div><ul className="sub">{c.items.map(i => <li key={i}><Pic name={i} size={22} /> {i}</li>)}</ul></div>) : <p className="muted">No Circuit rotation in the data right now.</p>}
  </Panel>);
}
function Calendar() {
  const { data, status, rec } = useWorld("calendar", ok); useRefreshAt("calendar", at(data));
  const v = calendarView(data);
  if (!v || !v.season) return <Unavailable title="1999 Calendar" status={data ? "UNAVAILABLE" : status} why="No verified data." rec={rec} />;
  return (<Panel title="1999 Calendar" status={status} rec={rec}><p><b>{v.season}</b>{v.loop != null && <span className="muted"> · loop {v.loop}</span>}{v.expiry && <> · <Countdown exp={v.expiry} pre="ends in " /></>}</p>
    {v.days.length > 0 ? <details><summary>{v.days.length} days with events</summary><ul className="sub">{v.days.map(d => <li key={d.day}><b>{dayLabel(d.day)}</b>{d.groups.map(g => <div key={g.kind}><span className="muted">{g.kind}: </span>{g.items.join(" · ")}</div>)}</li>)}</ul></details> : <p className="muted">No readable events in the data.</p>}
  </Panel>);
}
function Varzia() {
  const { data, status, rec } = useWorld("vaultTrader", ok); useRefreshAt("vaultTrader", at(data));
  const v = stockView(data);
  if (!v) return <Unavailable title="Prime Resurgence" status={data ? "UNAVAILABLE" : status} why="No verified data." rec={rec} />;
  return (<Panel title="Prime Resurgence" status={status} rec={rec}><Npc name="Varzia" role="Prime Resurgence" />{v.location && <p><b>{v.location}</b></p>}
    {v.expiry && <div><Countdown exp={v.expiry} pre={v.active ? "leaves in " : "next change in "} /></div>}
    {v.items.length > 0 ? <details open><summary>Stock ({v.items.length})</summary><VendorStock items={v.items.map(name => ({ name }))} /></details> : <p className="muted">No stock listed in the data.</p>}
  </Panel>);
}
function Archimedeas() {
  const { data, status, rec } = useWorld("archimedeas", ok); useRefreshAt("archimedeas", at(data));
  const v = archView(data);
  if (!v.length) return <Unavailable title="Archimedea" status={data ? "UNAVAILABLE" : status} why="No verified data." rec={rec} />;
  return (<Panel title="Archimedea" status={status} rec={rec}>{v.map((a, i) => <div key={i}><b>{a.type}</b>{a.expiry && <> · <Countdown exp={a.expiry} pre="resets in " /></>}
    <ul className="sub">{a.missions.map((m, j) => <li key={j}>{m}</li>)}</ul></div>)}</Panel>);
}
function Darvo() {
  const { data, status, rec } = useWorld("dailyDeals", ok); useRefreshAt("dailyDeals", at(data));
  const v = dealsView(data);
  if (!v.length) return <Unavailable title="Daily deal" status={data ? "UNAVAILABLE" : status} why="No verified data." rec={rec} />;
  return (<Panel title="Daily deal" status={status} rec={rec}><Npc name="Darvo" role="Daily deal" />{v.map((d, i) => <div key={i}><b>{d.item}</b>
    <div className="muted">{d.price != null && <>Price <Plat n={d.price} /></>}{d.original != null && <> instead of <Plat n={d.original} /></>}{d.left != null && ` · ${d.left} left`}</div>
    {d.expiry && <div><Countdown exp={d.expiry} pre="ends in " /></div>}</div>)}<p className="muted">In-game store deal paid with platinum, not a player price.</p></Panel>);
}
function Arbitration() {
  const { data, status, rec } = useWorld("arbitration", ok); useRefreshAt("arbitration", at(data));
  const v = arbView(data);
  if (!v) return <Unavailable title="Arbitration" status={data ? "UNAVAILABLE" : status} why={data ? "No arbitration is scheduled in the data right now (the source sent an empty placeholder)." : "No verified data."} rec={rec} />;
  return (<Panel title="Arbitration" status={status} rec={rec}><b>{v.node}</b><div className="muted">{[v.type, v.enemy].filter(Boolean).join(" · ")}</div>{v.expiry && <div><Countdown exp={v.expiry} pre="rotates in " /></div>}</Panel>);
}
const ManualTag = ({ date }: { date: string }) => <span className="tag STALE" title={`Written by hand from the Warframe wiki on ${date}; not a live feed`}>Manual source</span>;
/** Palladino's stock is fixed (it only resets its purchase limits weekly), so it is copied from the wiki and labeled as manual. */
function Palladino() {
  return (<section className="panel"><div className="row"><h3>Palladino</h3><ManualTag date={PALLADINO_SOURCE.date} /></div><Npc name="Palladino" role="Riven vendor" />
    <p className="muted">Found at Iron Wake, Earth. Purchase limits reset every Monday at 00:00 UTC.</p>
    <details className="stock"><summary className="btn">Stock and prices</summary><ul className="sub">{PALLADINO.map(w => <li key={w.name}><b>{w.name}</b> <span className="muted">· {w.cost} {w.currency}{w.cost > 1 ? "s" : ""} · {w.limit}</span></li>)}</ul></details>
    <div className="muted">Source: <a href={PALLADINO_SOURCE.url} target="_blank" rel="noreferrer">{PALLADINO_SOURCE.name}</a>, checked {PALLADINO_SOURCE.date}.</div></section>);
}
function ArbRewards() {
  const [r, setR] = useState<"A" | "B" | "C">("A");
  return (<section className="panel"><div className="row"><h3>Arbitration rewards</h3><ManualTag date={ARBITRATION_SOURCE.date} /></div>
    <p className="muted">Rotations run A, A, B, B, then C every time after that.</p>
    <div className="seg" role="group" aria-label="Rotation">{(["A", "B", "C"] as const).map(k => <button key={k} className={"btn" + (r === k ? " on" : "")} aria-pressed={r === k} onClick={() => setR(k)}>Rotation {k}</button>)}</div>
    <ul className="rwlist">{ARB_ROTATIONS[r].map(x => <li key={x.name}><span>{x.name}</span><b>{x.chance}%</b></li>)}</ul>
    {ARB_NOTES.map(n => <p className="muted" key={n}>{n}</p>)}
    <p><Link to="/guides?s=arbitrations">How Arbitrations work</Link></p>
    <div className="muted">Source: <a href={ARBITRATION_SOURCE.url} target="_blank" rel="noreferrer">{ARBITRATION_SOURCE.name}</a>, checked {ARBITRATION_SOURCE.date}.</div></section>);
}
function Kuva() {
  const { data, status, rec } = useWorld("kuva", ok); useRefreshAt("kuva", Array.isArray(data) ? at(data) : null);
  const v = kuvaView(data);
  if (!v.length) return <Unavailable title="Kuva missions" status={data ? "UNAVAILABLE" : status} why={Array.isArray(data) ? "The source lists no Kuva missions right now." : "No verified data."} rec={rec} />;
  return (<Panel title="Kuva missions" status={status} rec={rec}><ul className="sub">{v.slice(0, 8).map((k, i) => <li key={i}><b>{k.node}</b><span className="muted"> {[k.type, k.enemy].filter(Boolean).join(" · ")}</span></li>)}</ul>{v.length > 8 && <p className="muted">Showing 8 of {v.length}.</p>}</Panel>);
}
function KuvaInfo() {
  return (<section className="panel"><div className="row"><h3>Kuva Siphons</h3><ManualTag date={KUVA_DATE} /></div>
    <p className="muted">Extra mission reward: Requiem Eterna 50%, Endo ×100 50%. A Kuva Flood always drops a Requiem relic (100%) and gives about double the Kuva. Needs The War Within and Mastery Rank 5.</p>
    <p><Link to="/guides?s=kuva">How Kuva Siphons work</Link></p></section>);
}
function Simaris() {
  const { data, status, rec } = useWorld("simaris", ok);
  const v = simarisView(data);
  if (!v) return <Unavailable title="Sanctuary" status={data ? "UNAVAILABLE" : status} why="No verified data." rec={rec} />;
  return (<Panel title="Sanctuary" status={status} rec={rec}><Npc name="Cephalon Simaris" role="Synthesis target" /><b>{v.target}</b><div className="muted">{v.active ? "Current synthesis target" : "Not currently active"}</div></Panel>);
}
function Anomaly() {
  const { data, status, rec } = useWorld("sentientOutposts", ok); useRefreshAt("sentientOutposts", at(data));
  const v = anomalyView(data);
  if (!v) return <Unavailable title="Sentient Anomaly" status={data ? "UNAVAILABLE" : status} why="No verified data." rec={rec} />;
  return (<Panel title="Sentient Anomaly" status={status} rec={rec}>{v.active ? <><b>{v.node}</b><div className="muted">{[v.type, v.faction].filter(Boolean).join(" · ")}</div>{v.expiry && <div><Countdown exp={v.expiry} pre="ends in " /></div>}</> : <p className="muted">Not active right now.</p>}</Panel>);
}
/** Acrithis' weekly wares as the wiki lists them. Copied by hand, so it says plainly when the week it was read in is over. */
function Acrithis() {
  const old = acrithisOutdated(Date.now());
  return (<section className="panel"><div className="row"><h3>Acrithis</h3>{old ? <span className="tag STALE" title="The week this list was read in has ended">May be outdated</span> : <ManualTag date={ACRITHIS_SOURCE.date} />}</div><Npc name="Acrithis" role="Duviri vendor" />
    <p className="muted">Found in Duviri. Her weekly wares change every Monday at 00:00 UTC. Reported on {ACRITHIS.asOf}:</p>
    <ul className="rwlist">{ACRITHIS.wares.map(w => <li key={w}><span>{w}</span></li>)}</ul>
    {old && <p className="muted">That week is over, so these wares have probably changed. Check the wiki for the current list.</p>}
    <div className="muted">Source: <a href={ACRITHIS_SOURCE.url} target="_blank" rel="noreferrer">{ACRITHIS_SOURCE.name}</a>, checked {ACRITHIS_SOURCE.date}.</div></section>);
}
export default function Rotations() {
  const reset = iso(nextWeeklyReset());
  return (<><h1><PageArt name="Rotations" size={36} />Rotations</h1>
    <p className="lead">Shops and rewards that rotate. Weekly vendors, the Circuit and The Descendia reset every Monday at 00:00 UTC.</p>
    <p className="muted"><b>Next weekly reset:</b> <Countdown exp={reset} /> <span>(calculated from the fixed weekly schedule)</span></p>
    <h2>Traders</h2><div className="grid"><Baro full /><Varzia /></div>
    <h2>Weekly shops and rewards</h2><div className="grid"><Teshin /><Duviri /><Calendar /><Archimedeas /></div>
    <h2>The Descendia</h2><Descendia />
    <h2>Daily and mission rotations</h2><div className="grid"><Darvo /><Arbitration /><ArbRewards /><Kuva /><KuvaInfo /><Simaris /><Anomaly /></div>
    <h2>Other weekly vendors</h2><div className="grid">
      <Palladino />
      <Acrithis />
    </div></>);
}
