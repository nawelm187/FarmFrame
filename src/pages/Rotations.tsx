import { Pic } from "../ItemArt";
import PageArt from "../PageArt";
import Baro from "../Baro";
import Npc from "../Npc";
import { useRefreshAt, useWorld } from "../lib/data";
import { Plat } from "../Money";
import VendorStock from "../VendorStock";
import { anomalyView, arbView, archView, calendarView, dealsView, duviriView, kuvaView, nextWeeklyReset, simarisView, steelView, stockView } from "../lib/rotations";
import { Countdown, Panel, Unavailable } from "./parts";
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
    {v.rotation.length > 0 && <><div className="muted">Weekly rotation, one step each week:</div><ol className="sub">{v.rotation.map((o, i) => <li key={i} className={o.name === v.current?.name ? "gold" : undefined}>{o.name}{o.cost != null && <span className="muted"> · {o.cost}</span>}{o.name === v.current?.name && " (this week)"}</li>)}</ol></>}
    {v.evergreens.length > 0 && <><div className="muted">Always available (Steel Essence):</div><VendorStock items={v.evergreens.map(o => ({ name: o.name, cost: o.cost ?? undefined }))} /></>}
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
function Kuva() {
  const { data, status, rec } = useWorld("kuva", ok); useRefreshAt("kuva", Array.isArray(data) ? at(data) : null);
  const v = kuvaView(data);
  if (!v.length) return <Unavailable title="Kuva missions" status={data ? "UNAVAILABLE" : status} why={Array.isArray(data) ? "The source lists no Kuva missions right now." : "No verified data."} rec={rec} />;
  return (<Panel title="Kuva missions" status={status} rec={rec}><ul className="sub">{v.slice(0, 8).map((k, i) => <li key={i}><b>{k.node}</b><span className="muted"> {[k.type, k.enemy].filter(Boolean).join(" · ")}</span></li>)}</ul>{v.length > 8 && <p className="muted">Showing 8 of {v.length}.</p>}</Panel>);
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
const Fixed = ({ name, role, where }: { name: string; role: string; where: string }) => (
  <section className="panel"><div className="row"><h3>{name}</h3><span className="tag UNAVAILABLE">No stock data</span></div><Npc name={name} role={role} />
    <p className="muted">{where}</p>
    <p className="muted">This vendor's weekly stock is not in any data source FarmFrame uses, so nothing is listed instead of guessing.</p></section>
);
export default function Rotations() {
  const reset = iso(nextWeeklyReset());
  return (<><h1><PageArt name="Rotations" size={36} />Rotations</h1>
    <p className="lead">Shops and rewards that rotate. Weekly vendors and the Circuit reset every Monday at 00:00 UTC.</p>
    <p className="muted"><b>Next weekly reset:</b> <Countdown exp={reset} /> <span>(calculated from the fixed weekly schedule)</span></p>
    <h2>Traders</h2><div className="grid"><Baro full /><Varzia /></div>
    <h2>Weekly shops and rewards</h2><div className="grid"><Teshin /><Duviri /><Calendar /><Archimedeas /></div>
    <h2>Daily and mission rotations</h2><div className="grid"><Darvo /><Arbitration /><Kuva /><Simaris /><Anomaly /></div>
    <h2>Other weekly vendors</h2><div className="grid">
      <Fixed name="Palladino" role="Riven vendor" where="Found at Iron Wake, Earth." />
      <Fixed name="Acrithis" role="Duviri vendor" where="Found in Duviri." />
    </div></>);
}
