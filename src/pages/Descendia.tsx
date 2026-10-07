import { useState } from "react";
import { Pic } from "../ItemArt";
import { useRefreshAt, useWorld } from "../lib/data";
import { ROATHE_PARTS, descendiaView, rewardGroups, rewardsFor, usefulIn, type Floor, type Mode, type Reward } from "../lib/descendia";
import { useNeeded } from "../lib/useNeeded";
import { Countdown, Panel, Unavailable } from "./parts";
const ok = (d: unknown): d is object => !!d && typeof d === "object";
const Rw = ({ r }: { r: Reward }) => (r.pool
  ? <details className="advit"><summary><Pic name={r.pool[0]} size={20} /> {r.qty ? r.qty + " " : ""}{r.name} <span className="muted">· one of {r.pool.length}</span></summary><ul className="sub">{r.pool.map(p => <li key={p}><Pic name={p} size={18} /> {p}</li>)}</ul></details>
  : <span className="advit"><Pic name={r.name} size={20} />{r.qty ? r.qty + " " : ""}{r.name}</span>);
const ZONES: [string, number, number][] = [["Infernum 1 to 7", 1, 7], ["Infernum 8 to 14", 8, 14], ["Infernum 15 to 21", 15, 21]];
const FloorCard = ({ f, mode }: { f: Floor; mode: Mode }) => { const rw = rewardsFor(mode, f.index).length > 0, rest = [7, 14, 21].includes(f.index);
  return (<li className={"floor" + (rest ? " rest" : "")}><span className="fnum">{f.index}</span><span className="fbody"><b>{f.kind}</b>{f.penance && <span className="muted">Penance: {f.penance}</span>}</span>{rw && <span className="fchip gold" title="This floor gives a reward">★</span>}</li>); };
/** The weekly Descendia. Part one is this week's 21 floors (live data); part two is what each group of floors can reward (reference from the wiki). */
export default function Descendia() {
  const { data, status, rec } = useWorld("descendia", ok), [mode, setMode] = useState<Mode>("steel"), needed = useNeeded();
  const v = descendiaView(data), end = v?.expiry ? Date.parse(v.expiry) : null; useRefreshAt("descendia", end);
  if (!v) return <Unavailable title="The Descendia" status={data ? "UNAVAILABLE" : status} why="No verified data." rec={rec} />;
  return (<Panel title="The Descendia" status={status} rec={rec}>
    {v.expiry && <p><Countdown exp={v.expiry} pre="resets in " /> <span className="muted">· every Monday 00:00 UTC</span></p>}
    <h3>This week's floors</h3><p className="muted">Live data. The 7th, 14th and 21st are checkpoints (marked). A star means that floor gives a reward in the difficulty chosen below.</p>
    <div className="chips" role="group" aria-label="Difficulty">{(["normal", "steel"] as const).map(m => <button key={m} className={"btn" + (mode === m ? " on" : "")} aria-pressed={mode === m} onClick={() => setMode(m)}>{m === "normal" ? "Normal" : "Steel Path"}</button>)}</div>
    <div className="zones">{ZONES.map(([t, a, b]) => <section key={t} aria-label={t}><h4>{t}</h4><ol className="floorlist">{v.floors.filter(f => f.index >= a && f.index <= b).map(f => <FloorCard key={f.index} f={f} mode={mode} />)}</ol></section>)}</div>
    <h3>Rewards in {mode === "steel" ? "Steel Path" : "Normal"}</h3>
    <p className="muted">What each group of floors can give, once per week. The game picks the reward; the live data does not say which ones are offered this week, so every possibility is listed.</p>
    <div className="rgroups">{rewardGroups(mode).map(g => <article key={g.floors.join()} className="rgroup"><h4>Floor{g.floors.length > 1 ? "s" : ""} {g.floors.join(", ")}</h4>{usefulIn(g.rewards, needed).length > 0 && <p className="tag FRESH">★ This helps you: {usefulIn(g.rewards, needed).join(", ")} (it may be offered; the game picks)</p>}<div className="advrow">{g.rewards.map((r, i) => <Rw key={i} r={r} />)}</div>{g.floors.includes(21) && <p className="muted">Always drops: {ROATHE_PARTS}, with no weekly limit.</p>}</article>)}</div>
    <p className="muted">Floor names and penances are the game's own keys. Rewards come from the Warframe wiki (1 Oct 2026); amounts can change.</p>
  </Panel>);
}
