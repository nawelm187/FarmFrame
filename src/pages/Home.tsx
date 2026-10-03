import { Link } from "react-router-dom";
import Baro from "../Baro";
import CycleSky from "../CycleSky";
import Onboarding from "../Onboarding";
import { readBuilds } from "../lib/build";
import { projectCycle } from "../lib/cycles";
import { useMany, useNow, useRefreshAt, useWorld } from "../lib/data";
import { ts } from "../lib/format";
import { label } from "../lib/exact";
import { PATCH_ALT, PATCH_SRC, PATCH_URL, PATCH_WINDOW, latestUpdate, parsePatches } from "../lib/patchlogs";
import { useFarmNow } from "../lib/useFarmNow";
import { VERSION } from "../version";
import OppList from "./OppList";
import { Countdown, Panel, Unavailable } from "./parts";
interface Cyc { state: string; expiry: string }
const isCyc = (d: unknown): d is Cyc => !!d && typeof d === "object" && typeof (d as Cyc).state === "string" && typeof (d as Cyc).expiry === "string";
interface Fis { id: string; expiry: string }
const isFis = (d: unknown): d is Fis[] => Array.isArray(d);
/** An open-world cycle. If the API served an already-ended cycle, the current phase is calculated and labeled as such instead of showing an orange STALE. */
function Cycle({ title, k }: { title: string; k: string }) {
  const { data, status, rec } = useWorld(k, isCyc), now = useNow();
  useRefreshAt(k, data ? ts(data.expiry) : null);
  if (!data) return <Unavailable title={title} status={status} why={rec?.err ? "Request failed." : "Waiting for data."} rec={rec} />;
  const p = projectCycle(k, data.state, data.expiry, now);
  if (!p) return <Unavailable title={title} status="LOADING" why="" note="Updating…" rec={rec} />;
  // A phase that has not ended is still true even if the last retrieval is a few minutes old, so it is not flagged STALE.
  return <Panel title={title} status={p.calculated ? "CALCULATED" : status === "STALE" ? "FRESH" : status} rec={rec}><CycleSky k={k} state={p.state} expiry={p.expiry} now={now} /><b>{p.state}</b><br /><Countdown exp={p.expiry} pre="ends in " />
    {p.calculated && <div className="muted">Calculated from the last verified cycle while live data refreshes.</div>}</Panel>;
}
/** Newest full update from the patch-notes dataset. Shows nothing when the data is unavailable instead of guessing. */
function LatestUpdate() {
  const [r] = useMany([{ id: "patchlogs", file: "", url: PATCH_URL, alt: PATCH_ALT, src: PATCH_SRC, win: PATCH_WINDOW }]);
  const d = parsePatches(r.rec?.data), p = d ? latestUpdate(d.patches) : null;
  return p ? <p className="muted">Latest update: <Link to={"/patches?q=" + encodeURIComponent(p.name)}>{p.name}</Link> ({new Date(p.date).toLocaleDateString()}) · <Link to="/patches">Patch notes</Link></p> : null;
}
function FissureCount() {
  const { data, status, rec } = useWorld("fissures", isFis);
  if (!data) return <Unavailable title="Void Fissures" status={status} why="No verified data." rec={rec} />;
  return <Panel title="Void Fissures" status={status} rec={rec}><div className="big">{data.filter(f => ts(f.expiry) > Date.now()).length} active</div><Link to="/fissures">Open fissure list</Link></Panel>;
}
function FarmRightNow({ f }: { f: ReturnType<typeof useFarmNow> }) {
  const { goals, opps, fis, inv, exact } = f, todo = exact.plans.filter(p => p.part.count > p.have);
  return (<section aria-label="What should I farm right now">
    <div className="row"><h2>What should I farm right now?</h2>{goals > 0 && <Link to="/farm-plan">Open Farm Plan</Link>}</div>
    {!goals ? <p className="muted">No goals yet. Add one from a Warframe or weapon page and this list will show what advances it right now. <Link to="/warframes">Browse Warframes</Link></p>
      : !fis.data && !inv.data ? <p className="muted">Live fissure and invasion data is unavailable ({fis.status.toLowerCase()}), so current opportunities cannot be computed.</p>
      : !opps.length ? <p className="muted">Nothing active right now advances your goals{exact.relics ? "" : " (exact relic tables are still loading)"}. Check back as fissures and invasions rotate.</p>
      : <OppList opps={opps} fisStatus={fis.status} invStatus={inv.status} />}
    {goals > 0 && <p className="muted">{todo.length ? `${todo.length} missing part${todo.length > 1 ? "s" : ""} across ${goals} goal${goals > 1 ? "s" : ""}: ${todo.slice(0, 3).map(label).join(", ")}${todo.length > 3 ? "…" : ""}. ` : ""}Based on your goals and live data. It cannot see everything, so treat it as a suggestion.</p>}
  </section>);
}
export default function Home() {
  const b = readBuilds().length, f = useFarmNow();
  return (<>
    <h1>FarmFrame</h1>
    <p className="lead">Goal, what you are missing, how to get it, and what you can do right now.</p>
    <Onboarding />
    <LatestUpdate />
    <FarmRightNow f={f} />
    <h2>World state</h2>
    <div className="grid">
      <Cycle title="Cetus (Plains)" k="cetusCycle" /><Cycle title="Orb Vallis" k="vallisCycle" />
      <Cycle title="Cambion Drift" k="cambionCycle" /><Cycle title="Zariman" k="zarimanCycle" /><FissureCount /><Baro />
    </div>
    <h2>Your plan</h2>
    <p><Link to="/roadmap">Roadmap and checklist</Link> · <Link to="/farm-plan">Farm Plan</Link> · <Link to="/planner">Planner</Link> · <Link to="/builds">{b ? `${b} saved build${b > 1 ? "s" : ""}` : "Create a build"}</Link> · <Link to="/tracking">Tracking</Link></p>
    <h2>Tools</h2>
    <p><Link to="/finder">Resource Finder</Link> · <Link to="/relics">Relics</Link> · <Link to="/invasions">Invasions</Link> · <Link to="/patches">Patch notes</Link> · <Link to="/sources">Data sources</Link></p>
    <p className="muted">FarmFrame v{VERSION}</p>
  </>);
}
