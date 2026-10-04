import { Pic } from "../ItemArt";
import { useState } from "react";
import { Link } from "react-router-dom";
import { useCatalogs } from "../lib/useCatalog";
import { nextAction, label } from "../lib/exact";
import { missing, progress, readGoals, readOwned, readRes, writeGoals, writeOwned, writeRes, type Goal } from "../lib/goals";
import { readReqs, writeReqs } from "../lib/reqs";
import { GROUPS, groupOf, needs, type Group, type Need } from "../lib/tree";
import { useFarmNow } from "../lib/useFarmNow";
import RelicArt from "../RelicArt";
import OppList from "./OppList";
import { Skeleton } from "./parts";
const ORDER = { open: 0, get: 1, source: 2, vaulted: 3, none: 4 } as const;
export default function Roadmap() {
  const [goals, setGoals] = useState(readGoals), [own, setOwn] = useState(readOwned), [res2, setRes2] = useState(readRes), [reqs, setReqs] = useState(readReqs);
  const cats = [...new Set(goals.map(g => g.cat))];
  const cat = useCatalogs(cats), f = useFarmNow(), ex = f.exact;
  const ent = (g: Goal) => cat[g.cat]?.items?.find(e => e.slug === g.slug);
  const setO = (gid: string, name: string, v: number) => { const o = { ...own, [gid]: { ...own[gid], [name]: Math.max(0, v) } }; setOwn(o); writeOwned(o); };
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
  if (!goals.length && !reqs.length) return <><h1>Roadmap</h1><p className="lead">No active goals yet.</p><p className="muted">Open a Warframe or weapon and choose "Add to Goal". FarmFrame will list what is missing and where to get it.</p><Link className="btn" to="/warframes">Browse Warframes</Link></>;
  return (<><h1>Roadmap</h1>
    <p className="lead">Goal, what is missing, how to get it, your next action and your progress.</p>
    {overall.total > 0 && <section className="panel" aria-label="Master checklist"><div className="row"><h3>Master checklist</h3><span className="muted">{overall.have} / {overall.total}</span></div>
      {GROUPS.map(g => { const t = sum(r => r.g === g); return t.total ? <label className="muted chk" key={g}>{g} <b>{t.have} / {t.total}</b><progress max={t.total} value={t.have} /></label> : null; })}
      <label className="chk"><b>Overall {Math.round(100 * overall.have / overall.total)}%</b><progress max={overall.total} value={overall.have} /></label>
      <p className="muted">Goal parts, resources and build requirements. Progress here is entered manually.</p></section>}
    {acts.length > 0 && <><div className="row"><h2>Next actions</h2><Link to="/farm-plan">Open Farm Plan</Link></div>
      <ul className="list comp nextacts">{acts.map(({ p, n }) => <li key={p.goal.id + p.part.name}><span><Pic name={label(p)} size={34} /> <b>{label(p)}</b><div className="muted">{n.text}</div></span>{n.to ? <Link to={n.to}>{n.kind === "open" ? "Plan" : "Find"}</Link> : <span />}</li>)}</ul></>}
    <h2>Farm now</h2>
    {!ex.fis.data ? <p className="muted">Fissure data is unavailable ({ex.fis.status.toLowerCase()}), so current opportunities cannot be computed.</p>
      : !f.opps.length ? <p className="muted">No active fissure matches the exact relics of your missing parts right now.</p>
      : <OppList opps={f.opps} fisStatus={ex.fis.status} invStatus={f.inv.status} />}
    {resList.length > 0 && <><h2>Resources needed</h2><p className="muted">Summed across all goals; a resource shared by several parts appears once.</p>
      <ul className="list comp">{resList.map(x => (<li key={x.name}><span><Pic name={x.name} size={28} /> {x.name} <b>×{x.qty}</b><span className="muted"> for {x.from.join(", ")}</span></span>
        <label className="muted">Owned <input type="number" min={0} value={res2[x.name] ?? 0} style={{ width: "5rem" }} onChange={ev => setR(x.name, +ev.target.value || 0)} /></label></li>))}</ul></>}
    {builds.length > 0 && <><h2>From builds</h2><p className="muted">Mods, arcanes and Forma you added from a build. Acquisition shows what the item data lists; it can be incomplete.</p>
      {builds.map(b => { const rs = reqs.filter(r => r.build === b), have = rs.reduce((a, r) => a + Math.min(r.need, r.have), 0), tot = rs.reduce((a, r) => a + r.need, 0);
        return (<section className="panel goal" key={b}><div className="row"><h3><Link to={`/build/${b}`}>{rs[0].buildName}</Link></h3><button className="btn" onClick={() => dropBuild(b)}>Remove</button></div>
          <label className="muted">{have} / {tot} requirements <progress max={tot} value={have} /></label>
          <ul className="list comp">{rs.map(r => (<li key={r.id}><span><Pic name={r.name} size={28} /> {r.name}{r.need > 1 ? ` ×${r.need}` : ""} <span className="muted">{r.kind === "omni" ? "omni forma" : r.kind}</span> <span className={"tag " + (r.have >= r.need ? "FRESH" : "ERROR")}>{r.have >= r.need ? "Have" : "Missing"}</span>
            <div className="muted">{r.src.length ? `How to get: ${r.src.join("; ")}` : "No acquisition data in the item source."} · <Link to={`/farm/${encodeURIComponent(r.name)}`}>Where to farm</Link></div></span>
            <label className="muted">Owned <input type="number" min={0} value={r.have} style={{ width: "4.5rem" }} onChange={ev => setQ(r.id, +ev.target.value || 0)} /></label></li>))}</ul></section>); })}</>}
    {goals.length > 0 && <h2>Goals</h2>}
    {goals.map(g => { const e = ent(g), o = own[g.id] ?? {}, p = e ? progress(e.components, o) : null, miss = e ? missing(e.components, o) : [], nx = ex.plans.find(x => x.goal.id === g.id);
      const na = nx ? nextAction(nx, ex.fis.data, ex.mine, !!ex.relics) : null;
      return (<section className="panel goal" key={g.id}>
        <div className="row"><h3><Pic name={g.name} size={40} /> <Link to={`/${g.cat}/${g.slug}`}>{g.name}</Link></h3><button className="btn" onClick={() => drop(g)}>Remove</button></div>
        {!e || !p ? <Skeleton /> : <>
          <label className="muted">{p.have} / {p.total} parts · {p.pct}% <progress max={p.total} value={p.have} /></label>
          {miss.length && nx ? <p><b>Next:</b> {label(nx)} <span className="muted">{na?.text}{na?.to && <> · <Link to={na.to}>{na.kind === "open" ? "plan" : "find"}</Link></>}</span></p> : <p className="gold">All parts collected.</p>}
          <ul className="list comp">{e.components.map(c => { const pl = ex.plans.find(x => x.goal.id === g.id && x.part.name === c.name), have = (o[c.name] ?? 0) >= c.count;
            return (<li key={c.name}><span><Pic name={c.name === "Blueprint" ? `${e.name} Blueprint` : `${e.name} ${c.name}`} size={28} /> {c.name}{c.count > 1 ? ` ×${c.count}` : ""} <span className={"tag " + (have ? "FRESH" : "ERROR")}>{have ? "Have" : "Missing"}</span>
              {pl && !have && <div className="chips">{pl.relics.filter(r => r.vaulted !== true).slice(0, 3).map(r => <Link key={r.name} className="relicchip" to={`/relics?q=${encodeURIComponent(r.name)}`}><RelicArt tier={r.tier} name={r.name} size={20} /><span>{r.name}</span><span className="muted">{r.rarity}</span></Link>)}
                {!pl.relics.length && pl.other.length > 0 && <span className="muted">{pl.other.slice(0, 2).map(d => d.location).join("; ")}</span>}</div>}</span>
              <label className="muted">Owned <input type="number" min={0} max={c.count} value={o[c.name] ?? 0} style={{ width: "4.5rem" }} onChange={ev => setO(g.id, c.name, +ev.target.value || 0)} /></label></li>); })}</ul></>}
      </section>); })}</>);
}
