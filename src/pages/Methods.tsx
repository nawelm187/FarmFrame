import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { METHODS, type Level } from "../data/methods";
import { thingRoute } from "../lib/refs";
import { PageHead } from "../ui";
const GOALS = ["All", ...new Set(METHODS.map(m => m.yields[0]))] as string[], LEVELS: ("All" | Level)[] = ["All", "Beginner", "Intermediate", "Veteran"];
/** Farming methods: what to do to get a material quickly, what boosts it, and where the numbers come from. */
export default function Methods() {
  const [sp] = useSearchParams(), target = sp.get("m"), [goal, setGoal] = useState<string>("All"), [level, setLevel] = useState<"All" | Level>("All");
  useEffect(() => { if (target) setTimeout(() => document.getElementById(target)?.scrollIntoView({ block: "start" }), 80); }, [target]);
  const list = METHODS.filter(m => (goal === "All" || m.yields.includes(goal)) && (level === "All" || m.level === level) || m.id === target);
  return (<><PageHead title="Farming Methods" art={<span aria-hidden="true" style={{ fontSize: "2rem" }}>⚑</span>}>Ways to get Credits, Aya, Endo, Kuva, Forma, Orokin Cells, Steel Essence, Void Traces, Vosfor, Gallium, Nitain Extract and more. Each one says what to do, what boosts it, what it needs first and where the numbers come from.</PageHead>
    <div className="chips" role="group" aria-label="What do you want to farm">{GOALS.map(g => <button key={g} className={"btn" + (goal === g ? " on" : "")} aria-pressed={goal === g} onClick={() => setGoal(g)}>{g}</button>)}</div>
    <div className="chips" role="group" aria-label="Level">{LEVELS.map(l => <button key={l} className={"btn" + (level === l ? " on" : "")} aria-pressed={level === l} onClick={() => setLevel(l)}>{l}</button>)}</div>
    <p className="muted">The numbers are chances or amounts per roll or per run, not per hour: the wiki does not measure time. Methods are written by hand and may change with game updates.</p>
    <div className="gcards">{list.map(m => <section key={m.id} id={m.id} className="gcard sec" style={{ scrollMarginTop: "4.2rem" }}>
      <header className="sechead"><h2>{m.title}</h2><span className="tag">{m.level}</span>{m.status === "community" && <span className="tag STALE">Community strategy, not verified</span>}</header>
      <p>{m.summary}</p>
      {m.requires.length > 0 && <p className="note"><b>Needs first:</b> {m.requires.join("; ")}.</p>}
      <h3>What to do</h3><ol className="steps">{m.steps.map(s => <li key={s} className="step"><span>{s}</span></li>)}</ol>
      <h3>Boosts</h3><ul>{m.boosts.map(b => <li key={b.name}><b>{b.name}</b>: {b.effect} <span className={"tag " + (b.applies ? "FRESH" : "STALE")}>{b.applies ? "Applies" : "Does not apply"}</span></li>)}</ul>
      {m.mods?.map(x => <article key={x.name} className="minicard"><h4>{x.name}</h4><p>{x.effect}</p><p className="muted">Polarity {x.polarity} · drain {x.drain}</p><p className="muted">Where to get it: {x.where}.</p><Link to={thingRoute(x.name)}>Open its page</Link></article>)}
      {m.notes.map(n => <p key={n} className="note">{n}</p>)}
      <p className="muted">{m.yields.map((y, i) => <span key={y}>{i ? " · " : ""}<Link to={thingRoute(y)}>All sources of {y}</Link></span>)}</p>
      <p className="srclist">Source: <a href={m.source.url} target="_blank" rel="noreferrer">{m.source.label}</a> (read {m.checked}). {m.confidence}</p></section>)}</div>
    {!list.length && <p className="muted">No method matches that filter.</p>}</>);
}
