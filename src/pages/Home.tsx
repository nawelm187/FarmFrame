import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { Icon, Logo } from "../Icons";
import Baro from "../Baro";
import CycleSky from "../CycleSky";
import Onboarding from "../Onboarding";
import { readBuilds } from "../lib/build";
import { readGoals } from "../lib/goals";
import { projectCycle } from "../lib/cycles";
import { useMany, useNow, useRefreshAt, useWorld } from "../lib/data";
import { ts } from "../lib/format";
import { label } from "../lib/exact";
import { PATCH_ALT, PATCH_SRC, PATCH_URL, PATCH_WINDOW, latestUpdate, parsePatches } from "../lib/patchlogs";
import { useFarmNow } from "../lib/useFarmNow";
import { VERSION } from "../version";
import OppList from "./OppList";
import Advisor from "./Advisor";
import { AlertsSummary } from "./Alerts";
import { Pic } from "../ItemArt";
import { useCatalog } from "../lib/useCatalog";
import { heroFrames } from "../lib/heroFrames";
import { useT, type Key } from "../i18n";
import GoalCards from "../GoalCards";
import PageArt from "../PageArt";
import { Countdown, Panel, ST, Unavailable } from "./parts";
interface Cyc { state: string; expiry: string }
const isCyc = (d: unknown): d is Cyc => !!d && typeof d === "object" && typeof (d as Cyc).state === "string" && typeof (d as Cyc).expiry === "string";
interface Fis { id: string; expiry: string }
const isFis = (d: unknown): d is Fis[] => Array.isArray(d);
/** An open-world cycle. If the API served an already-ended cycle, the current phase is calculated and labeled as such instead of showing an orange STALE. */
function Cycle({ title, k }: { title: string; k: string }) {
  const { data, status, rec } = useWorld(k, isCyc), now = useNow(), t = useT();
  useRefreshAt(k, data ? ts(data.expiry) : null);
  if (!data) return <Unavailable title={title} status={status} why={rec?.err ? t("reqFailed") : t("waitingData")} rec={rec} />;
  const p = projectCycle(k, data.state, data.expiry, now);
  if (!p) return <Unavailable title={title} status="LOADING" why="" note={t("updating")} rec={rec} />;
  // A phase that has not ended is still true even if the last retrieval is a few minutes old, so it is not flagged STALE.
  return <Panel title={title} status={p.calculated ? "CALCULATED" : status === "STALE" ? "FRESH" : status} rec={rec}><CycleSky k={k} state={p.state} expiry={p.expiry} now={now} /><b>{p.state}</b><br /><Countdown exp={p.expiry} pre={t("cdEnds") + " "} />
    {p.calculated && <div className="muted">{t("calcNote")}</div>}</Panel>;
}
/** Newest full update from the patch-notes dataset. Shows nothing when the data is unavailable instead of guessing. */
function LatestUpdate() {
  const t = useT();
  const [r] = useMany([{ id: "patchlogs", file: "", url: PATCH_URL, alt: PATCH_ALT, src: PATCH_SRC, win: PATCH_WINDOW }]);
  const d = parsePatches(r.rec?.data), p = d ? latestUpdate(d.patches) : null;
  return p ? <p className="muted">{t("latestUpdate")} <Link to={"/patches?q=" + encodeURIComponent(p.name)}>{p.name}</Link> ({new Date(p.date).toLocaleDateString()}) · <Link to="/patches">{t("patchNotes")}</Link></p> : null;
}
function FissureCount() {
  const t = useT();
  const { data, status, rec } = useWorld("fissures", isFis);
  if (!data) return <Unavailable title={t("fissures")} art="Void Fissures" status={status} why={t("noVerified")} rec={rec} />;
  return <Panel title={t("fissures")} art="Void Fissures" status={status} rec={rec}><div className="big"><PageArt name="Void Fissures" size={40} /> {t("activeN", { n: data.filter(f => ts(f.expiry) > Date.now()).length })}</div><Link to="/fissures">{t("openFissures")}</Link></Panel>;
}
/** Priority 1 of Home: where each goal stands. Only goals whose parts are listed in the data get a bar; the others are said to have none. */
function Goals({ f }: { f: ReturnType<typeof useFarmNow> }) {
  const { info, goals } = f.exact, t = useT(); if (!goals.length) return null;
  return (<section aria-label={t("goalsTitle")}><div className="row"><h2>{t("goalsTitle")}</h2><Link className="btn sm" to="/roadmap">{t("openRoadmap")}</Link></div>
    <GoalCards info={info} /></section>);
}
function FarmRightNow({ f }: { f: ReturnType<typeof useFarmNow> }) {
  const { goals, opps, fis, inv, exact } = f, todo = exact.plans.filter(p => p.part.count > p.have), t = useT();
  return (<section aria-label={t("farmNowTitle")}>
    <div className="row"><h2>{t("farmNowTitle")}</h2>{goals > 0 && <Link className="btn sm" to="/farm-plan">{t("openFarmPlan")}</Link>}</div>
    {!goals ? <p className="muted">{t("noGoals")} <Link to="/warframes">{t("browseWarframes")}</Link></p>
      : !fis.data && !inv.data ? <p className="muted">{t("liveUnavail", { status: t(ST[fis.status]).toLowerCase() })}</p>
      : !opps.length ? <p className="muted">{t(exact.relics ? "farmNothing" : "farmNothingLoading")}</p>
      : <OppList opps={opps} fisStatus={fis.status} invStatus={inv.status} />}
    {goals > 0 && <p className="muted">{todo.length ? t("farmMissing", { n: todo.length, g: goals, list: todo.slice(0, 3).map(label).join(", ") + (todo.length > 3 ? "…" : "") }) + " " : ""}{t("farmBased")}</p>}
  </section>);
}
/** Hero picture: unvaulted Prime Warframes (newest first) and any Warframe released in the last 90 days, one at a time, from the loaded catalog.
 *  Rotates every 6 s, stops while the pointer or keyboard focus is on it and for people who asked for less motion. Nothing loaded: shows `fallback`. */
function HeroArt({ fallback }: { fallback: ReactNode }) {
  const t = useT();
  const { items } = useCatalog("warframe"), list = useMemo(() => heroFrames(items ?? []), [items]);
  const [i, setI] = useState(0), [hold, setHold] = useState(false), still = typeof matchMedia === "function" && matchMedia("(prefers-reduced-motion: reduce)").matches;
  useEffect(() => { if (list.length < 2 || hold || still) return; const t = setInterval(() => setI(k => k + 1), 6000); return () => clearInterval(t); }, [list.length, hold, still]);
  if (!list.length) return <div className="h2art" aria-hidden="true">{fallback}</div>;
  const at = i % list.length, cur = list[at];
  return (<div className="h2art herorot" role="group" aria-label={t("featured")} onMouseEnter={() => setHold(true)} onMouseLeave={() => setHold(false)} onFocus={() => setHold(true)} onBlur={() => setHold(false)}>
    <Link to={`/warframe/${cur.slug}`} className="heroframe" aria-label={`Open ${cur.name}`}><Pic key={cur.name} name={cur.name} size={190} /></Link>
    <div className="herocap" aria-live="off"><b>{cur.name}</b><span className="muted">{cur.why === "new" ? t("heroNew") : t("heroPrime")}</span></div>
    {list.length > 1 && <div className="herodots">{list.map((f, k) => <button key={f.name} className={"dot" + (k === at ? " on" : "")} aria-label={`Show ${f.name}`} aria-current={k === at} onClick={() => setI(k)} />)}</div>}
  </div>);
}
const TILES: [string, Key, Key][] = [["/builds", "builds", "tileBuilds"], ["/farm-plan", "farmPlan", "tileFarmPlan"], ["/relics", "relics", "tileRelics"], ["/finder", "resources", "tileResources"], ["/rotations", "rotations", "tileRotations"]];
const openSearch = () => document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", ctrlKey: true }));
export default function Home() {
  const b = readBuilds().length, f = useFarmNow(), first = readGoals()[0], t = useT();
  return (<>
    <section className="hero2" aria-label="FarmFrame">
      <div className="h2txt"><h1>{t("heroLine1")}<br /><span>{t("heroLine2")}</span></h1>
        <p className="lead">{t("heroLead")}</p>
        <button className="herosearch" onClick={openSearch} aria-label={t("heroSearchAria")}><Icon n="/finder" /><span>{t("heroSearch")}</span><kbd>Ctrl K</kbd></button></div>
      <HeroArt fallback={first ? <Pic name={first.name} size={190} /> : <Logo size={150} />} /></section>
    <div className="qtiles" role="group" aria-label={t("quickAccess")}>{TILES.map(([to, n, d]) => <Link key={to} className="qtile" to={to}><Icon n={to} /><span><b>{t(n)}</b><small>{t(d)}</small></span></Link>)}</div>
    <Onboarding />
    <LatestUpdate />
    <Advisor />
    <Goals f={f} />
    <FarmRightNow f={f} />
    <h2>{t("worldState")}</h2>
    <div className="grid">
      <Cycle title="Cetus (Plains)" k="cetusCycle" /><Cycle title="Orb Vallis" k="vallisCycle" />
      <Cycle title="Cambion Drift" k="cambionCycle" /><Cycle title="Zariman" k="zarimanCycle" /><FissureCount /><AlertsSummary /><Baro />
    </div>
    <h2>{t("more")}</h2>
    <div className="chips"><Link className="btn" to="/roadmap">{t("roadmapChecklist")}</Link><Link className="btn" to="/planner">{t("planner")}</Link><Link className="btn" to="/tracking">{t("tracking")}</Link><Link className="btn" to="/builds">{b ? t("savedBuilds", { n: b }) : t("createBuild")}</Link><Link className="btn" to="/invasions">{t("invasions")}</Link><Link className="btn" to="/patches">{t("patchNotes")}</Link><Link className="btn" to="/sources">{t("dataSources")}</Link></div>
    <p className="muted">FarmFrame v{VERSION}</p>
  </>);
}
