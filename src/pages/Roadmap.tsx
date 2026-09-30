import { useState } from "react";
import { Link } from "react-router-dom";
import { CATS, CAT_SRC, parseCatalog } from "../lib/catalog";
import { useMany, useWorld } from "../lib/data";
import { ts } from "../lib/format";
import { missing, progress, readGoals, readOwned, readRes, tiersOf, writeGoals, writeOwned, writeRes, type Goal } from "../lib/goals";
import { GROUPS, groupOf, needs, type Group, type Need } from "../lib/tree";
import { Badge, Skeleton } from "./parts";
interface Fis { id: string; node: string; missionType: string; tier: string; isStorm: boolean; isHard: boolean; expiry: string }
const isFis = (d: unknown): d is Fis[] => Array.isArray(d);
export default function Roadmap() {
  const [goals, setGoals] = useState(readGoals), [own, setOwn] = useState(readOwned), [res2, setRes2] = useState(readRes);
  const cats = [...new Set(goals.map(g => g.cat))];
  const res = useMany(cats.map(c => ({ id: c, file: "", url: CATS[c].url, src: CAT_SRC })));
  const fis = useWorld("fissures", isFis);
  const ent = (g: Goal) => parseCatalog(res[cats.indexOf(g.cat)]?.rec?.data, g.cat)?.find(e => e.slug === g.slug);
  const setO = (gid: string, name: string, v: number) => { const o = { ...own, [gid]: { ...own[gid], [name]: Math.max(0, v) } }; setOwn(o); writeOwned(o); };
  const drop = (g: Goal) => { const a = goals.filter(x => x.id !== g.id); setGoals(a); writeGoals(a); };
  const setR = (name: string, v: number) => { const o = { ...res2, [name]: Math.max(0, v) }; setRes2(o); writeRes(o); };
  const all = new Map<string, Need>(), rows: { g: Group; have: number; total: number }[] = [];
  for (const g of goals) { const e = ent(g); if (!e) continue; const o = own[g.id] ?? {};
    for (const c of e.components) { const have = Math.min(c.count, o[c.name] ?? 0); rows.push({ g: groupOf(c), have, total: c.count }); if (c.count > have) needs(c, c.count - have, `${c.name} (${e.name})`, all); } }
  const resList = [...all.values()].sort((a, b) => a.name.localeCompare(b.name));
  for (const r of resList) rows.push({ g: "Resources", have: Math.min(r.qty, res2[r.name] ?? 0), total: r.qty });
  const sum = (f: (r: { g: Group }) => boolean) => rows.filter(f).reduce((a, r) => ({ have: a.have + r.have, total: a.total + r.total }), { have: 0, total: 0 });
  const overall = sum(() => true);
  const opp = new Map<string, string[]>();
  for (const g of goals) { const e = ent(g); if (e) for (const c of missing(e.components, own[g.id])) for (const t of tiersOf(c)) opp.set(t, [...(opp.get(t) ?? []), `${c.name} (${e.name})`]); }
  const now = Date.now();
  const live = [...opp].map(([t, items]) => ({ t, items, f: (fis.data ?? []).filter(x => x.tier === t && ts(x.expiry) > now).sort((a, b) => Number(a.isStorm) - Number(b.isStorm)) })).filter(o => o.f.length).sort((a, b) => b.items.length - a.items.length);
  if (!goals.length) return <><h1>Roadmap</h1><p className="lead">No active goals yet.</p><p className="muted">Open a Warframe or weapon and choose "Add to Goal". FarmFrame will list what is missing and where to get it.</p><Link className="btn" to="/warframes">Browse Warframes</Link></>;
  return (<><h1>Roadmap</h1>
    {overall.total > 0 && <section className="panel" aria-label="Master checklist"><div className="row"><h3>Master checklist</h3><span className="muted">{overall.have} / {overall.total}</span></div>
      {GROUPS.map(g => { const t = sum(r => r.g === g); return t.total ? <label className="muted chk" key={g}>{g} <b>{t.have} / {t.total}</b><progress max={t.total} value={t.have} /></label> : null; })}
      <label className="chk"><b>Overall {Math.round(100 * overall.have / overall.total)}%</b><progress max={overall.total} value={overall.have} /></label>
      <p className="muted">Mods, Forma, Endo and Arcanes will appear once builds exist. Progress here is entered manually.</p></section>}
    <h2>Farm now</h2>
    {!fis.data ? <p className="muted">Fissure data is unavailable ({fis.status.toLowerCase()}), so current opportunities cannot be computed.</p>
      : !live.length ? <p className="muted">No active fissure matches the relic tiers of your missing parts right now.</p>
      : <ul className="list opp">{live.map(o => (<li key={o.t}><div><b>{o.t} fissures</b><span className="muted"> · currently useful for {o.items.length} missing part{o.items.length > 1 ? "s" : ""}</span>
        <div className="muted">{o.f.slice(0, 3).map(f => `${f.missionType} ${f.node}${f.isHard ? " (Steel Path)" : ""}${f.isStorm ? " (Storm)" : ""}`).join(" · ")}</div>
        <details><summary>Why this?</summary><ul><li>{o.f.length} active {o.t} fissure{o.f.length > 1 ? "s" : ""}</li><li>Missing parts whose source lists a {o.t} relic: {o.items.join(", ")}</li>
          <li>Matched by the relic tier named in the source's drop locations; it does not check which exact relic you own. Fissure data <Badge s={fis.status} />{fis.rec?.at ? ` retrieved ${new Date(fis.rec.at).toLocaleTimeString()}` : ""}.</li></ul></details></div></li>))}</ul>}
    {resList.length > 0 && <><h2>Resources needed</h2><p className="muted">Summed across all goals; a resource shared by several parts appears once.</p>
      <ul className="list comp">{resList.map(x => (<li key={x.name}><span>{x.name} <b>×{x.qty}</b><span className="muted"> for {x.from.join(", ")}</span></span>
        <label className="muted">Owned <input type="number" min={0} value={res2[x.name] ?? 0} style={{ width: "5rem" }} onChange={ev => setR(x.name, +ev.target.value || 0)} /></label></li>))}</ul></>}
    <h2>Goals</h2>
    {goals.map(g => { const e = ent(g), o = own[g.id] ?? {}, p = e ? progress(e.components, o) : null, miss = e ? missing(e.components, o) : [];
      return (<section className="panel goal" key={g.id}>
        <div className="row"><h3><Link to={`/${g.cat}/${g.slug}`}>{g.name}</Link></h3><button className="btn" onClick={() => drop(g)}>Remove</button></div>
        {!e || !p ? <Skeleton /> : <>
          <label className="muted">{p.have} / {p.total} parts · {p.pct}% <progress max={p.total} value={p.have} /></label>
          {miss.length ? <p><b>Next:</b> {miss[0].name} <span className="muted">{miss[0].drops.slice(0, 3).map(d => d.location).join("; ") || "no acquisition data in this source"} · <Link to={`/farm/${encodeURIComponent(g.name + " " + miss[0].name)}`}>find</Link></span></p> : <p className="gold">All parts collected.</p>}
          <ul className="list comp">{e.components.map(c => (<li key={c.name}><span>{c.name}{c.count > 1 ? ` ×${c.count}` : ""}</span>
            <label className="muted">Owned <input type="number" min={0} max={c.count} value={o[c.name] ?? 0} style={{ width: "4.5rem" }} onChange={ev => setO(g.id, c.name, +ev.target.value || 0)} /></label></li>))}</ul></>}
      </section>); })}</>);
}
