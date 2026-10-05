import { useState } from "react";
import { Pic } from "../ItemArt";
import { useRefreshAt, useWorld } from "../lib/data";
import { ROATHE_PARTS, descendiaView, rewardsFor, type Mode, type Reward } from "../lib/descendia";
import { Countdown, Panel, Unavailable } from "./parts";
const ok = (d: unknown): d is object => !!d && typeof d === "object";
const Rw = ({ r }: { r: Reward }) => (r.pool
  ? <details className="advit"><summary><Pic name={r.pool[0]} size={20} /> {r.qty ? r.qty + " " : ""}{r.name} <span className="muted">· one of {r.pool.length}</span></summary><ul className="sub">{r.pool.map(p => <li key={p}><Pic name={p} size={18} /> {p}</li>)}</ul></details>
  : <span className="advit"><Pic name={r.name} size={20} />{r.qty ? r.qty + " " : ""}{r.name}</span>);
/** The weekly Descendia: this week's 21 floors from the live data, and the rewards each floor gives in normal and Steel Path (reference table). */
export default function Descendia() {
  const { data, status, rec } = useWorld("descendia", ok), [mode, setMode] = useState<Mode>("steel");
  const v = descendiaView(data), end = v?.expiry ? Date.parse(v.expiry) : null; useRefreshAt("descendia", end);
  if (!v) return <Unavailable title="The Descendia" status={data ? "UNAVAILABLE" : status} why="No verified data." rec={rec} />;
  return (<Panel title="The Descendia" status={status} rec={rec}>
    {v.expiry && <p><Countdown exp={v.expiry} pre="resets in " /> <span className="muted">· floors, modifiers and rewards reset every Monday 00:00 UTC</span></p>}
    <div className="chips" role="group" aria-label="Difficulty">{(["normal", "steel"] as const).map(m => <button key={m} className={"btn" + (mode === m ? " on" : "")} aria-pressed={mode === m} onClick={() => setMode(m)}>{m === "normal" ? "Normal" : "Steel Path"}</button>)}</div>
    <ol className="floors">{v.floors.map(f => { const rw = rewardsFor(mode, f.index); return (<li key={f.index} value={f.index}>
      <b>{f.kind}</b>{f.penance && <span className="muted"> · {f.penance}</span>}
      {rw.length > 0 && <div className="advrow">{rw.map((r, i) => <Rw key={i} r={r} />)}</div>}
      {f.index === 21 && <div className="muted">Always drops: {ROATHE_PARTS}, with no weekly limit.</div>}</li>); })}</ol>
    <p className="muted">Floors and modifiers are live data; names are the game's own keys. Rewards per floor come from the Warframe wiki (each once per week), because the live data does not list them. Where a reward is "one of", the wiki lists the whole pool and not which is offered.</p>
  </Panel>);
}
