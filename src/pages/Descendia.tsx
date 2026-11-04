import { tp, useT } from "../i18n";
import { useState } from "react";
import { Pic } from "../ItemArt";
import { useRefreshAt, useWorld } from "../lib/data";
import { ROATHE_PARTS, descendiaView, rewardGroups, rewardsFor, usefulIn, type Floor, type Mode, type Reward } from "../lib/descendia";
import { useNeeded } from "../lib/useNeeded";
import { Countdown, Panel, Unavailable } from "./parts";
const ok = (d: unknown): d is object => !!d && typeof d === "object";
const Rw = ({ r }: { r: Reward }) => { const tr = useT(); return (r.pool
  ? <details className="advit"><summary><Pic name={r.pool[0]} size={20} /> {r.qty ? r.qty + " " : ""}{r.name} <span className="muted">· {tr("dsOneOf", { n: r.pool.length })}</span></summary><ul className="sub">{r.pool.map(p => <li key={p}><Pic name={p} size={18} /> {p}</li>)}</ul></details>
  : <span className="advit"><Pic name={r.name} size={20} />{r.qty ? r.qty + " " : ""}{r.name}</span>); };
const ZONES: [number, number][] = [[1, 7], [8, 14], [15, 21]];
const FloorCard = ({ f, mode }: { f: Floor; mode: Mode }) => { const tr = useT(), rw = rewardsFor(mode, f.index).length > 0, rest = [7, 14, 21].includes(f.index);
  return (<li className={"floor" + (rest ? " rest" : "")}><span className="fnum">{f.index}</span><span className="fbody"><b>{f.kind}</b>{f.penance && <span className="muted">{tr("dsPenance", { x: f.penance })}</span>}</span>{rw && <span className="fchip gold" title={tr("dsRewardTip")}>★</span>}</li>); };
/** The weekly Descendia. Part one is this week's 21 floors (live data); part two is what each group of floors can reward (reference from the wiki). */
export default function Descendia() {
  const tr = useT(), { data, status, rec } = useWorld("descendia", ok), [mode, setMode] = useState<Mode>("steel"), needed = useNeeded();
  const v = descendiaView(data), end = v?.expiry ? Date.parse(v.expiry) : null; useRefreshAt("descendia", end);
  if (!v) return <Unavailable title={tr("dsTitle")} art="The Descendia" status={data ? "UNAVAILABLE" : status} why={tr("noVerified")} rec={rec} />;
  return (<Panel title={tr("dsTitle")} status={status} rec={rec}>
    {v.expiry && <p><Countdown exp={v.expiry} pre={tr("dsResets") + " "} /> <span className="muted">· {tr("dsEvery")}</span></p>}
    <h3>{tr("dsFloorsH")}</h3><p className="muted">{tr("dsLive")}</p>
    <div className="chips" role="group" aria-label={tr("dsDiff")}>{(["normal", "steel"] as const).map(m => <button key={m} className={"btn" + (mode === m ? " on" : "")} aria-pressed={mode === m} onClick={() => setMode(m)}>{m === "normal" ? tr("exNormal") : tr("mrSecSteel")}</button>)}</div>
    <div className="zones">{ZONES.map(([a, b]) => <section key={a} aria-label={tr("dsZone", { a, b })}><h4>{tr("dsZone", { a, b })}</h4><ol className="floorlist">{v.floors.filter(f => f.index >= a && f.index <= b).map(f => <FloorCard key={f.index} f={f} mode={mode} />)}</ol></section>)}</div>
    <h3>{tr("dsRewardsIn", { mode: mode === "steel" ? tr("mrSecSteel") : tr("exNormal") })}</h3>
    <p className="muted">{tr("dsRewardsP")}</p>
    <div className="rgroups">{rewardGroups(mode).map(g => <article key={g.floors.join()} className="rgroup"><h4>{tp("dsFloor", g.floors.length, { list: g.floors.join(", ") })}</h4>{usefulIn(g.rewards, needed).length > 0 && <p className="tag FRESH">{tr("dsHelps", { list: usefulIn(g.rewards, needed).join(", ") })}</p>}<div className="advrow">{g.rewards.map((r, i) => <Rw key={i} r={r} />)}</div>{g.floors.includes(21) && <p className="muted">{tr("dsAlways", { parts: ROATHE_PARTS })}</p>}</article>)}</div>
    <p className="muted">{tr("dsFoot")}</p>
  </Panel>);
}
