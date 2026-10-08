import RarityMark from "../RarityMark";
import { Pic } from "../ItemArt";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogs } from "../lib/useCatalog";
import { nextAction, label } from "../lib/exact";
import { missing, progress, readGoals, readOwned, readRes, writeGoals, writeOwned, writeRes, type Goal } from "../lib/goals";
import { readReqs, writeReqs } from "../lib/reqs";
import { completionNote, type CompletionNote } from "../lib/completion";
import { GROUPS, groupOf, needs, type Group, type Need } from "../lib/tree";
import { useFarmNow } from "../lib/useFarmNow";
import RelicArt from "../RelicArt";
import OppList from "./OppList";
import { Skeleton } from "./parts";
import { Meter, Ring, StatTile, Stepper } from "../ui";
const ORDER = { open: 0, get: 1, source: 2, vaulted: 3, none: 4 } as const;
export default function Roadmap() {
  const [goals, setGoals] = useState(readGoals), [own, setOwn] = useState(readOwned), [res2, setRes2] = useState(readRes), [reqs, setReqs] = useState(readReqs);
  const cats = [...new Set(goals.map(g => g.cat))];
  const cat = useCatalogs(cats), f = useFarmNow(), ex = f.exact;
  const ent = (g: Goal) => cat[g.cat]?.items?.find(e => e.slug === g.slug);
  const [note, setNote] = useState<CompletionNote | null>(null);
  const setO = (gid: string, name: string, v: number) => {
    const o = { ...own, [gid]: { ...own[gid], [name]: Math.max(0, v) } }; setOwn(o); writeOwned(o);
    const g = goals.find(x => x.id === gid), e = g ? ent(g) : undefined;
    setNote(g && e ? completionNote(gid, g.name, e.components, own[gid] ?? {}, o[gid], name) : null);
  };
  const undoNote = () => { if (note) { setO(note.goalId, note.part, note.prev); setNote(null); } };
  const drop = (g: Goal) => { const a = goals.filter(x => x.id !== g.id); setGoals(a); writeGoals(a); };
  const setR = (name: string, v: number) => { const o = { ...res2, [name]: Math.max(0, v) }; setRes2(o); writeRes(o); };
  const setQ = (id: string, v: number) => { const a = reqs.map(r => (r.id === id ? { ...r, have: Math.max(0, v) } : r)); setReqs(a); writeReqs(a); };
  const dropBuild = (b: string) => { const a = reqs.filter(r => r.build !== b); setReqs(a); writeReqs(a); };
  const all = new Map<string, Need>(), rows: { g: Group; have: number; total: number }[] = [];
  for (const g of goals) { const e = ent(g); if (!e) continue; const o = own[g.id] ?? {};
    for (const c of e.components) { const have = Math.min(c.count, o[c.name] ?? 0); rows.push({ g: groupOf(c), have, total: c.count }); if (c.count > have) needs(c, c.count - have, `${c.name} (${e.name})`, all); } }
  const resList = [...all.values()].sort((a, b) => a.name.localeCompare(b.name));
  for (const r of resList) rows.push({ g: "Resources", have: Math.min(r.qty, res2[r.name] ?? 0), total: r.qty });
  for (const r of reqs) rows.push({ g: "Builds", have: Math.min(r.need, r.have), total: r.need });
  const sum = (fn: (r: { g: Group }) => boolean) => rows.filter(fn).reduce((a, r) => ({ have: a.have + r.have, total: a.total + r.total }), { have: 0, total: 0 });
  const overall = sum(() => true);
  const acts = ex.plans.map(p => ({ p, n: nextAction(p, ex.fis.data, ex.mine, !!ex.relics) })).sort((a, b) => ORDER[a.n.kind] - ORDER[b.n.kind]).slice(0, 6);
  const builds = [...new Set(reqs.map(r => r.build))];
  const prog = (g: Goal) => { const e = ent(g); return e ? progress(e.components, own[g.id] ?? {}) : null; };
  const done = goals.filter(g => { const p = prog(g); return !!p && p.total > 0 && p.have >= p.total; }), active = goals.filter(g => !done.includes(g));
  const pendRes = resList.filter(x => (res2[x.name] ?? 0) < x.qty), doneRes = resList.filter(x => (res2[x.name] ?? 0) >= x.qty);
  const jump = (id: string) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  if (!goals.length && !reqs.length) return <><h1>Roadmap</h1><p className="lead">No active goals yet.</p><p className="muted">Open a Warframe or weapon and choose "Add to Goal". FarmFrame will list what is missing and where to get it.</p><Link className="btn" to="/warframes">Browse Warframes</Link></>;
  const pct = overall.total ? Math.round(100 * overall.have / overall.total) : 0, rsum = sum(r => r.g === "Resources"), bsum = sum(r => r.g === "Builds");
  return (<><h1>Roadmap</h1>
    <p className="lead">Goal, what is missing, how to get it, your next action and your progress.</p>
    {overall.total > 0 && <section className="hud" aria-label="Master checklist"><Ring pct={pct} size={104} />
      <div><h2>Master checklist</h2><div className="muted">{overall.have} of {overall.total} items collected across goals, resources and builds. Progress is entered by hand.</div>
        <div className="stats"><StatTile n={goals.length} label="Goals" /><StatTile n={`${overall.have - rsum.have - bsum.have}/${overall.total - rsum.total - bsum.total}`} label="Parts" tone="gold" /><StatTile n={`${rsum.have}/${rsum.total}`} label="Resources" /><StatTile n={`${bsum.have}/${bsum.total}`} label="Build items" tone="acc" /></div>
        {GROUPS.map(g => { const t = sum(r => r.g === g); return t.total ? <Meter key={g} label={g === "Other" ? "Parts (chassis, neuroptics, systems...)" : g} have={t.have} total={t.total} /> : null; })}</div></section>}
    <div className="chips tabs" role="group" aria-label="Jump to a section">{([["tasks", "Tasks", acts.length], ["goals", "Goals", active.length], ["reqs", "Requirements", pendRes.length + builds.length], ["done", "Completed", done.length + doneRes.length]] as const).map(([id, t, n]) => <button key={id} className="btn" onClick={() => jump(id)}>{t} <span className="muted">{n}</span></button>)}</div>
    <p className="muted">Roadmap says what to do next. How many loose items you own lives in <Link to="/tracking">Tracking</Link>.</p>
    {note && <p className="tag FRESH" role="status">✓ {note.text} {note.next && <Link to={`/farm/${encodeURIComponent(note.next)}`}>Where to farm {note.next}</Link>} <button className="btn" onClick={undoNote}>Undo</button></p>}
    {acts.length > 0 && <><div className="row"><h2 id="tasks">Tasks: what to do now</h2><Link to="/farm-plan">Open Farm Plan</Link></div>
      <div className="acards">{acts.map(({ p, n }, i) => { const body = <><Pic name={`${p.entity} ${p.part.name}`} size={52} /><span className="tx"><span className={"kicker" + (n.now ? " now" : "")}>{n.now ? "Available now" : n.kind === "get" ? "Get a relic" : n.kind === "vaulted" ? "Vaulted" : n.kind === "source" ? "Direct source" : n.kind === "none" ? "No data" : "Next"}</span><b>{label(p)}</b><span className="muted">{n.text}</span></span></>;
        return n.to ? <Link key={p.goal.id + p.part.name} className={"acard" + (n.now ? " now" : "")} style={{ animationDelay: i * 50 + "ms" }} to={n.to}>{body}</Link> : <div key={p.goal.id + p.part.name} className="acard" style={{ animationDelay: i * 50 + "ms" }}>{body}</div>; })}</div></>}
    <h2>Farm now</h2>
    {!ex.fis.data ? <p className="muted">Fissure data is unavailable ({ex.fis.status.toLowerCase()}), so current opportunities cannot be computed.</p>
      : !f.opps.length ? <p className="muted">No active fissure matches the exact relics of your missing parts right now.</p>
      : <OppList opps={f.opps} fisStatus={ex.fis.status} invStatus={f.inv.status} />}
    {active.length > 0 && <h2 id="goals">Goals in progress</h2>}
    {!active.length && goals.length > 0 && <p className="gold" id="goals">Every goal is complete.</p>}
    {active.map(g => { const e = ent(g), o = own[g.id] ?? {}, p = e ? progress(e.components, o) : null, miss = e ? missing(e.components, o) : [], nx = ex.plans.find(x => x.goal.id === g.id);
      const na = nx ? nextAction(nx, ex.fis.data, ex.mine, !!ex.relics) : null;
      return (<section className="gcard" key={g.id}>
        <div className="ghead">{p && p.total > 0 ? <Ring pct={p.pct} size={76}><Pic name={g.name} size={44} /></Ring> : <Pic name={g.name} size={64} />}
          <div className="grow"><h3><Link to={`/${g.cat}/${g.slug}`}>{g.name}</Link></h3>
            {p && p.total > 0 ? <div className="muted">{p.have} of {p.total} parts · {p.pct}%</div> : e && <div className="muted">The data lists no parts for this goal.</div>}
            {miss.length && nx ? <div><b>Next:</b> {label(nx)} <span className="muted">{na?.text}{na?.to && <> · <Link to={na.to}>{na.kind === "open" ? "plan" : "find"}</Link></>}</span></div> : p && p.total > 0 ? <div className="gold">All parts collected.</div> : null}</div>
          <button className="btn" onClick={() => drop(g)}>Remove</button></div>
        {!e || !p ? <Skeleton /> : <div className="pgrid">{e.components.map(c => { const pl = ex.plans.find(x => x.goal.id === g.id && x.part.name === c.name), have = (o[c.name] ?? 0) >= c.count;
          return (<div className={"ptile" + (have ? " have" : "")} key={c.name}>
            <div className="top"><Pic name={c.name === "Blueprint" ? `${e.name} Blueprint` : `${e.name} ${c.name}`} size={44} /><span className="nm">{c.name}{c.count > 1 ? ` ×${c.count}` : ""}</span><span className={"tag " + (have ? "FRESH" : "ERROR")}>{have ? "Have" : "Missing"}</span></div>
            {pl && !have && <div className="chips">{pl.relics.filter(r => r.vaulted !== true).slice(0, 3).map(r => <Link key={r.name} className="relicchip" to={`/relics?q=${encodeURIComponent(r.name)}`}><RelicArt tier={r.tier} name={r.name} size={20} /><span>{r.name}</span><RarityMark r={r.rarity} /></Link>)}
              {!pl.relics.length && pl.other.length > 0 && <span className="muted">{pl.other.slice(0, 2).map(d => d.location).join("; ")}</span>}</div>}
            <div className="foot"><span className="muted">Owned</span><Stepper value={o[c.name] ?? 0} max={c.count} label={`${g.name} ${c.name}`} onChange={v => setO(g.id, c.name, v)} /></div></div>); })}</div>}
      </section>); })}
    {pendRes.length > 0 && <><h2 id="reqs">Requirements: resources still needed</h2><p className="muted">Summed across all goals; a resource shared by several parts appears once, with what needs it.</p>
      <div className="rowcards">{pendRes.map(x => (<article className="rowcard" key={x.name}><Pic name={x.name} size={44} /><div className="rcbody"><div className="rchead"><b>{x.name}</b><span className="fchip gold">×{x.qty}</span></div><p className="muted">Needed for {x.from.join(", ")}</p></div>
        <div className="rcside"><Stepper value={res2[x.name] ?? 0} label={x.name} onChange={v => setR(x.name, v)} /></div></article>))}</div></>}
    {builds.length > 0 && <><h2 id={pendRes.length ? undefined : "reqs"}>Requirements: from builds</h2><p className="muted">Mods, arcanes and Forma you added from a build. Sources are what the item data lists; they can be incomplete.</p>
      {builds.map(b => { const rs = reqs.filter(r => r.build === b), have = rs.reduce((a, r) => a + Math.min(r.need, r.have), 0), tot = rs.reduce((a, r) => a + r.need, 0);
        return (<section className="gcard" key={b}><div className="ghead"><Ring pct={tot ? 100 * have / tot : 0} size={64} /><div className="grow"><h3><Link to={`/build/${b}`}>{rs[0].buildName}</Link></h3><div className="muted">{have} / {tot} requirements</div></div><button className="btn" onClick={() => dropBuild(b)}>Remove</button></div>
          <div className="rowcards inner">{rs.map(r => (<article className="rowcard" key={r.id}><Pic name={r.name} size={44} /><div className="rcbody"><div className="rchead"><b>{r.name}{r.need > 1 ? ` ×${r.need}` : ""}</b><span className="fchip">{r.kind === "omni" ? "omni forma" : r.kind}</span><span className={"tag " + (r.have >= r.need ? "FRESH" : "ERROR")}>{r.have >= r.need ? "Have" : "Missing"}</span></div>
            {r.src.length ? <details className="srcdet"><summary>How to get it <span className="muted">· {r.src.length} source{r.src.length === 1 ? "" : "s"}</span></summary><ul className="srcs">{r.src.map(x => <li key={x}>{x}</li>)}</ul></details> : <p className="muted">No acquisition data in the item source.</p>}</div>
            <div className="rcside"><Stepper value={r.have} max={r.need} label={r.name} onChange={v => setQ(r.id, v)} /><Link className="btn" to={`/farm/${encodeURIComponent(r.name)}`}>Where to farm</Link></div></article>))}</div></section>); })}</>}
    {(done.length > 0 || doneRes.length > 0) && <><h2 id="done">Completed</h2>
      <ul className="list comp">{done.map(g => <li key={g.id}><span><Pic name={g.name} size={34} /> <b>{g.name}</b> <span className="tag FRESH">All parts collected</span></span><span className="chips"><Link to={`/${g.cat}/${g.slug}`}>Open {g.name}</Link><button className="btn" onClick={() => drop(g)}>Remove goal</button></span></li>)}
        {doneRes.map(x => <li key={x.name}><span><Pic name={x.name} size={28} /> {x.name} <b>×{x.qty}</b> <span className="tag FRESH">Have enough</span></span><span /></li>)}</ul></>}
  </>);
}
