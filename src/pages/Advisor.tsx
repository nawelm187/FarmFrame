import { useState } from "react";
import { Link } from "react-router-dom";
import { Pic } from "../ItemArt";
import { advise, rankActivities } from "../lib/advisor";
import type { Cat, Entity } from "../lib/catalog";
import { completionNote, type CompletionNote } from "../lib/completion";
import { goalId, readGoals, readOwned, writeGoals, writeOwned } from "../lib/goals";
import { useCatalogs } from "../lib/useCatalog";
import { useFarmNow } from "../lib/useFarmNow";
import { Ring } from "../ui";
import MissingList from "../MissingList";
import { allStats, useMany } from "../lib/data";
import { FIND, collect } from "../lib/drops";
import { trustLine } from "../lib/freshness";
import { itemAdvice, sourceWhy } from "../lib/itemAdvice";
import { readTracked, writeTracked } from "../lib/track";
import { useNeeded } from "../lib/useNeeded";
import { Skeleton } from "./parts";
const ALL = FIND.map(f => ({ id: f.id, file: f.file }));
/** Any single item (mod, resource, part): the best verified places to get it, why, and a way to track how many you need. */
function ItemPlan({ name, onClose }: { name: string; onClose: () => void }) {
  const res = useMany(ALL), { rows, ok } = collect(FIND.map((f, i) => ({ f, rec: res[i].rec, status: res[i].status })));
  const needed = useNeeded(), [qty, setQty] = useState(1), [tracked, setTracked] = useState(() => readTracked().some(t => t.n.toLowerCase() === name.toLowerCase()));
  const adv = ok > 0 ? itemAdvice(rows, name, needed) : null;
  const track = () => { const a = readTracked(); if (!a.some(t => t.n.toLowerCase() === name.toLowerCase())) writeTracked([...a, { n: name, o: 0, t: Math.max(1, qty), from: "Advisor" }]); setTracked(true); };
  return (<div className="adv"><div className="row"><h3>{name}</h3><button className="btn" onClick={onClose}>Close</button></div>
    {!adv ? <p className="muted">Loading drop tables…</p> : !adv.sources.length ? <p className="muted">No drop for this name in the loaded tables. It may come from a vendor, crafting or trading. <Link to={`/farm/${encodeURIComponent(name)}`}>Check all sources</Link></p>
      : <><h3>Best places to get it</h3><ol className="opps">{adv.sources.map((s, i) => <li key={s.row.where + i}>{i === 0 && <span className="tag FRESH">Best option</span>} <b>{s.row.where}</b>{s.row.rot ? ` · rotation ${s.row.rot}` : ""}<div className="muted">{sourceWhy(s)} · {s.row.src}</div></li>)}</ol>
        {!adv.exact && <p className="muted">No item with exactly this name; these are partial matches.</p>}<Link to={`/farm/${encodeURIComponent(name)}`}>See all sources</Link></>}
    <div className="bar">{tracked ? <span className="tag FRESH">Tracked. <Link to="/tracking">Open Tracking</Link></span> : <><input aria-label="How many do you need" type="number" min={1} value={qty} onChange={e => setQty(+e.target.value || 1)} style={{ width: "6rem" }} /><button className="btn" onClick={track}>Track how many I have</button></>}</div></div>);
}
const GROUP_TAG = { now: "Do this now", next: "Next step", blocked: "Blocked" } as const;
/** "I want X": pick or search something, and get what is missing, what to do now, why, how far along you are and what comes next. */
export default function Advisor() {
  const fn = useFarmNow(), ex = fn.exact, cat = useCatalogs(["warframe", "weapon"]), [q, setQ] = useState(""), [sel, setSel] = useState<string | null>(null), [, bump] = useState(0), [note, setNote] = useState<CompletionNote | null>(null), [other, setOther] = useState<string | null>(null);
  const term = q.trim().toLowerCase();
  const pool = (["warframe", "weapon"] as const).flatMap(c => (cat[c]?.items ?? []).filter(e => e.components.length > 0).map(e => ({ c: c as Cat, e })));
  const results = term.length < 2 ? [] : pool.filter(x => x.e.name.toLowerCase().includes(term)).sort((a, b) => Number(!a.e.name.toLowerCase().startsWith(term)) - Number(!b.e.name.toLowerCase().startsWith(term)) || a.e.name.localeCompare(b.e.name)).slice(0, 6);
  const add = (c: Cat, e: Entity) => { const a = readGoals(), id = goalId(c, e.slug); if (!a.some(g => g.id === id)) writeGoals([...a, { id, cat: c, slug: e.slug, name: e.name }]); setSel(id); setQ(""); bump(n => n + 1); };
  const cur = ex.goals.find(g => g.id === sel) ?? ex.goals[0], a = cur ? advise(cur.id, cur.name, ex.plans, ex.info.find(i => i.goal.id === cur.id), ex.fis.data, ex.mine, !!ex.relics) : null;
  /** Sets how many of a part the user has, and reports it when that completes the part. */
  const setPart = (goal: string, comps: Entity["components"], goalName: string, part: string, v: number) => {
    const all = readOwned(), before = all[goal] ?? {}, after = { ...before, [part]: v }; writeOwned({ ...all, [goal]: after });
    setNote(completionNote(goal, goalName, comps, before, after, part)); bump(n => n + 1);
  };
  const comps = cur ? cat[cur.cat]?.items?.find(e => e.slug === cur.slug)?.components : undefined;
  const got = () => { if (cur && comps && a?.focus) setPart(cur.id, comps, cur.name, a.focus.partName, a.focus.count); };
  const undoGot = () => { if (cur && comps && note) { setPart(cur.id, comps, cur.name, note.part, note.prev); setNote(null); } };
  const trust = trustLine([{ label: "Fissures", status: ex.fis.status, rec: ex.fis.rec, drift: allStats().get("fissures")?.drift }, { label: "Relic tables", status: ex.relics ? "FRESH" : ex.relicStatus, rec: ex.relicRec, drift: allStats().get("relics")?.drift }]);
  const acts = rankActivities(fn.opps).slice(0, 3);
  return (<section className="gcard advisor" aria-label="What do you want to get?">
    <h2>What do you want to get?</h2>
    <div className="bar"><input aria-label="Search a Warframe or weapon" placeholder="Type a Warframe or weapon, e.g. Wisp Prime" value={q} onChange={e => setQ(e.target.value)} /></div>
    {term.length >= 2 && <div className="chips"><button className="btn" onClick={() => { setOther(q.trim()); setQ(""); }}>Find sources for "{q.trim()}" (mod, resource or part)</button></div>}
    {other && <ItemPlan key={other} name={other} onClose={() => setOther(null)} />}
    {term.length >= 2 && !results.length && <p className="muted">{cat.warframe?.items && cat.weapon?.items ? "Nothing with parts matches that name." : "Loading the catalog…"}</p>}
    {results.length > 0 && <ul className="list" aria-label="Results">{results.map(({ c, e }) => <li key={c + e.slug}><span><Pic name={e.name} size={28} /> {e.name} <span className="muted">{c === "warframe" ? "Warframe" : "Weapon"}</span></span><button className="btn" onClick={() => add(c, e)}>I want this</button></li>)}</ul>}
    {ex.goals.length > 1 && <div className="chips" role="group" aria-label="Your goals">{ex.goals.map(g => <button key={g.id} className={"btn" + (g.id === cur?.id ? " on" : "")} aria-pressed={g.id === cur?.id} onClick={() => setSel(g.id)}>{g.name}</button>)}</div>}
    {note && <p className="tag FRESH" role="status">✓ {note.text} <button className="btn" onClick={undoGot}>Undo</button></p>}
    {ex.pending && <Skeleton />}
    {!cur ? (other ? null : <p className="muted">Pick something above and FarmFrame will tell you what is missing, what to do right now and what comes next.</p>) : !a ? null
      : a.status === "done" ? <p className="gold">{a.goal} is complete: {a.have}/{a.total} parts collected.</p>
      : a.status === "nodata" ? <p className="muted">The data lists no parts for {a.goal}, so there is nothing to plan.</p>
      : <div className="adv">
        <div className="hud"><Ring pct={a.pct} size={84}><Pic name={a.goal} size={44} /></Ring><div><h3>{a.goal}</h3><div className="muted">{a.have} of {a.total} parts · {a.missing.length} still missing</div></div></div>
        {a.focus && <div className={"acard" + (a.focus.group === "now" ? " now" : "")}><span className="tx"><span className={"kicker" + (a.focus.group === "now" ? " now" : "")}>{GROUP_TAG[a.focus.group]}</span><b>{a.focus.part}</b><span className="muted">{a.focus.action.text}</span>
          {a.focus.action.to && <Link to={a.focus.action.to}>{a.focus.action.kind === "open" ? "Open Farm Plan" : "Find sources"}</Link>}
          <button className="btn" onClick={got}>I got it</button></span></div>}
        <details open><summary>Why this?</summary><ul>{a.why.map(w => <li key={w}>{w}</li>)}</ul></details>
        {a.missing.length > 1 && <><h3>Everything still missing</h3><MissingList items={a.missing} /></>}
        {acts.length > 0 && <><h3>Best activity right now</h3><ul className="list">{acts.map((x, i) => <li key={x.opp.key}><span><b>{x.opp.title}</b>{i === 0 && acts.length > 1 && <span className="tag FRESH"> Best for your plan</span>}<div className="muted">{x.reasons.join(" · ")}</div></span><Link className="btn" to={x.opp.kind === "fissure" ? "/fissures" : "/invasions"}>Open</Link></li>)}</ul></>}
        <p className={trust.warn ? "tag STALE" : "muted"}>{trust.warn ?? `Based on: ${trust.lines.join(" · ")}.`} <Link to="/sources">Data sources</Link></p>
        {a.after ? <p className="muted"><b>After that:</b> {a.after}</p> : <p className="muted"><b>After that:</b> {a.goal} would be complete.</p>}
      </div>}
  </section>);
}
