import { Link } from "react-router-dom";
import RelicArt from "../RelicArt";
import { readBuilds } from "../lib/build";
import { useWorld } from "../lib/data";
import { ts } from "../lib/format";
import { value } from "../lib/farmNow";
import { useFarmNow } from "../lib/useFarmNow";
import { VERSION } from "../version";
import { Badge, Countdown, Panel, Unavailable } from "./parts";
interface Cyc { state: string; expiry: string }
const isCyc = (d: unknown): d is Cyc => !!d && typeof d === "object" && typeof (d as Cyc).state === "string" && typeof (d as Cyc).expiry === "string";
interface Fis { id: string; expiry: string }
const isFis = (d: unknown): d is Fis[] => Array.isArray(d);
function Cycle({ title, k }: { title: string; k: string }) {
  const { data, status, rec } = useWorld(k, isCyc);
  if (!data) return <Unavailable title={title} status={status} why={rec?.err ? "Request failed." : "Waiting for data."} rec={rec} />;
  if (ts(data.expiry) < Date.now()) return <Unavailable title={title} status="STALE" why="Cycle data expired; refreshing." rec={rec} />;
  return <Panel title={title} status={status} rec={rec}><b>{data.state}</b><br /><Countdown exp={data.expiry} pre="ends in " /></Panel>;
}
function FissureCount() {
  const { data, status, rec } = useWorld("fissures", isFis);
  if (!data) return <Unavailable title="Void Fissures" status={status} why="No verified data." rec={rec} />;
  return <Panel title="Void Fissures" status={status} rec={rec}><div className="big">{data.filter(f => ts(f.expiry) > Date.now()).length} active</div><Link to="/fissures">Open fissure list</Link></Panel>;
}
function FarmRightNow() {
  const { goals, opps, fis, inv } = useFarmNow();
  return (<section aria-label="What should I farm right now">
    <h2>What should I farm right now?</h2>
    {!goals ? <p className="muted">No goals yet. Add one from a Warframe or weapon page and this list will show what advances it right now. <Link to="/warframes">Browse Warframes</Link></p>
      : !fis.data && !inv.data ? <p className="muted">Live fissure and invasion data is unavailable ({fis.status.toLowerCase()}), so current opportunities cannot be computed.</p>
      : !opps.length ? <p className="muted">Nothing active right now advances your goals. Check back as fissures and invasions rotate.</p>
      : <ol className="opps">{opps.map(o => (<li key={o.key}><div className="row"><b className="oppt">{o.tier && <RelicArt tier={o.tier} size={32} />}{o.title}</b><Link className="btn" to={o.kind === "fissure" ? "/fissures" : "/invasions"}>View</Link></div>
          <div className="muted">Advances: {o.advances.slice(0, 4).join(", ")}{o.advances.length > 4 ? ` and ${o.advances.length - 4} more` : ""}</div>
          <div className="muted">Value to your current goals: <b>{value(o.advances.length)}</b></div>
          <details><summary>Why this?</summary><ul>{o.why.map(w => <li key={w}>{w}</li>)}<li>Live data: fissures <Badge s={fis.status} />, invasions <Badge s={inv.status} /></li></ul></details></li>))}</ol>}
    {goals > 0 && <p className="muted">Based on your goals and live data. It cannot see everything, so treat it as a suggestion.</p>}
  </section>);
}
export default function Home() {
  const b = readBuilds().length;
  return (<>
    <h1>FarmFrame</h1>
    <p className="lead">Plan what you need, then see where and when to get it.</p>
    <h2>World state</h2>
    <div className="grid">
      <Cycle title="Cetus (Plains)" k="cetusCycle" /><Cycle title="Orb Vallis" k="vallisCycle" />
      <Cycle title="Cambion Drift" k="cambionCycle" /><Cycle title="Zariman" k="zarimanCycle" /><FissureCount />
    </div>
    <FarmRightNow />
    <h2>Your plan</h2>
    <p><Link to="/roadmap">Roadmap and checklist</Link> · <Link to="/planner">Planner</Link> · <Link to="/builds">{b ? `${b} saved build${b > 1 ? "s" : ""}` : "Create a build"}</Link> · <Link to="/tracking">Tracking</Link></p>
    <h2>Tools</h2>
    <p><Link to="/finder">Resource Finder</Link> · <Link to="/relics">Relics</Link> · <Link to="/invasions">Invasions</Link> · <Link to="/sources">Data sources</Link></p>
    <p className="muted">FarmFrame v{VERSION}</p>
  </>);
}
