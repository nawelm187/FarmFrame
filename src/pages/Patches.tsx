import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { readBuilds } from "../lib/build";
import { useMany } from "../lib/data";
import { readGoals } from "../lib/goals";
import { PATCH_ALT, PATCH_SRC, PATCH_URL, PATCH_WINDOW, matchPatch, parsePatches, patchTypes, type Patch } from "../lib/patchlogs";
import { summarize, tally, touches, type Change } from "../lib/patchsummary";
import { readReqs } from "../lib/reqs";
import { readTracked } from "../lib/track";
import { useCatalogs } from "../lib/useCatalog";
import { Panel, Skeleton, Unavailable } from "./parts";
const SHOW = 12;
const ARROW: Record<Change["good"], [string, string]> = { buff: ["▲", "FRESH"], nerf: ["▼", "ERROR"], change: ["●", "UNAVAILABLE"] };
const fmt = (c: Change) => (c.from != null && c.to != null ? `${c.from}${c.unit} → ${c.to}${c.unit}` : "");
function Entry({ p, open, mine, link }: { p: Patch; open?: boolean; mine: Set<string>; link: (name: string) => string | null }) {
  const s = useMemo(() => summarize(p), [p]), t = tally(s.changes), hits = s.changes.filter(c => touches(c, mine)).length;
  return (<details className="panel patch" open={open}>
    <summary><b>{p.name}</b> <span className="tag">{p.type}</span> <span className="muted">{new Date(p.date).toLocaleDateString()}</span>
      {t.buff > 0 && <span className="tag FRESH"> ▲ {t.buff}</span>}{t.nerf > 0 && <span className="tag ERROR"> ▼ {t.nerf}</span>}{t.change > 0 && <span className="tag UNAVAILABLE"> ● {t.change}</span>}
      {hits > 0 && <span className="tag STALE"> ★ touches your builds or goals</span>}</summary>
    {s.changes.length > 0 ? <ul className="chg">{[...s.changes].sort((a, b) => Number(!!touches(b, mine)) - Number(!!touches(a, mine))).map((c, i) => { const [a, tag] = ARROW[c.good], to = link(c.subject), me = touches(c, mine);
      return <li key={i} title={c.text}><span className={"tag " + tag}>{a} {c.good}</span> <b>{to ? <Link to={to}>{c.subject}</Link> : c.subject}</b> <span className="muted">{c.stat}</span> {fmt(c) && <b>{fmt(c)}</b>}{me && <span className="gold"> ★ {me}</span>}<div className="muted chgtxt">{c.text}</div></li>; })}</ul>
      : <p className="muted">No stat changes found in these notes.</p>}
    {s.additions.length > 0 && <><h4>New</h4><ul className="sub">{s.additions.map((a, i) => <li key={i}>{a}</li>)}</ul></>}
    {s.fixes > 0 && <p className="muted">{s.fixes} bug fix{s.fixes === 1 ? "" : "es"} (not listed here).</p>}
    <details><summary className="muted">Full notes</summary>
      {(["additions", "changes", "fixes"] as const).map(k => p[k] ? <div key={k}><h4>{k[0].toUpperCase() + k.slice(1)}</h4><div className="patchtext">{p[k]}</div></div> : null)}</details>
    {p.url ? <p><a href={p.url} target="_blank" rel="noopener noreferrer">Open the official post</a></p> : <p className="muted">No link in the source.</p>}
  </details>);
}
export default function Patches() {
  const [r] = useMany([{ id: "patchlogs", file: "", url: PATCH_URL, alt: PATCH_ALT, src: PATCH_SRC, win: PATCH_WINDOW }]);
  const [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", type = sp.get("type") ?? "", onlyMine = sp.get("mine") === "1", [more, setMore] = useState(1);
  const cat = useCatalogs(["warframe", "weapon", "mod"]);
  const data = useMemo(() => parsePatches(r.rec?.data), [r.rec?.data]);
  // Names of everything the player has set up: build and goal names, tracked items, build requirements and the mods slotted in builds.
  const { mine, links } = useMemo(() => {
    const m = new Set<string>(), l = new Map<string, string>(), mods = new Map((cat.mod?.items ?? []).map(e => [e.slug, e.name]));
    for (const c of ["warframe", "weapon"] as const) for (const e of cat[c]?.items ?? []) l.set(e.name.toLowerCase(), `/${c}/${e.slug}`);
    for (const e of cat.mod?.items ?? []) l.set(e.name.toLowerCase(), `/mod/${e.slug}`);
    for (const b of readBuilds()) { m.add(b.name.toLowerCase()); if (b.frame) m.add(b.frame.toLowerCase()); for (const s of b.slots) if (s.mod && mods.get(s.mod)) m.add(mods.get(s.mod)!.toLowerCase()); for (const a of b.arcanes ?? []) if (a.mod) m.add(a.mod.toLowerCase()); }
    for (const g of readGoals()) m.add(g.name.toLowerCase()); for (const t of readTracked()) m.add(t.n.toLowerCase()); for (const x of readReqs()) m.add(x.name.toLowerCase());
    return { mine: m, links: l };
  }, [cat.mod?.items, cat.warframe?.items, cat.weapon?.items]);
  const link = (n: string) => links.get(n.toLowerCase()) ?? null;
  const list = useMemo(() => (data?.patches ?? []).filter(p => (!type || p.type === type) && matchPatch(p, q) && (!onlyMine || summarize(p).changes.some(c => touches(c, mine)))), [data, q, type, onlyMine, mine]);
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); setMore(1); };
  return (<><h1>Patch notes</h1>
    <p className="lead">The important part of each update: which stats went up or down, and what is new. Full notes are one click away.</p>
    {!data ? (r.status === "LOADING" ? <Skeleton /> : <Unavailable title="Patch notes" status={r.status === "FRESH" ? "ERROR" : r.status} why={r.rec?.data != null ? "The patch notes arrived in a format FarmFrame does not recognize (source schema changed)." : "Patch notes could not be loaded."} rec={r.rec} />) : (<>
      <div className="bar"><input aria-label="Search patch notes" placeholder="Search a warframe, weapon, mod or stat, e.g. Nidus, Soma, Shields" value={q} onChange={e => set("q", e.target.value)} />
        <select aria-label="Type" value={type} onChange={e => set("type", e.target.value)}><option value="">All types</option>{patchTypes(data.patches).map(t => <option key={t}>{t}</option>)}</select>
        <label className="muted"><input type="checkbox" checked={onlyMine} onChange={e => set("mine", e.target.checked ? "1" : "")} /> Only what touches my builds and goals</label></div>
      <p className="muted">▲ buff, ▼ nerf (a lower cost or cooldown counts as a buff), ● other change. Read from the notes by rule; if a line is unclear it is not listed. {list.length} of {data.patches.length} entries{data.skipped ? ` · ${data.skipped} source entries skipped` : ""}.</p>
      {list.length === 0 ? <p className="muted">No patch notes match.</p> : list.slice(0, SHOW * more).map((p, i) => <Entry key={p.date + p.name} p={p} open={i === 0 && !q && !type && !onlyMine} mine={mine} link={link} />)}
      {list.length > SHOW * more && <button className="btn" onClick={() => setMore(more + 1)}>Show more</button>}
      <Panel title="Data source" status={r.status} rec={r.rec}><span className="muted">{PATCH_SRC}. Updated every 6 hours.</span></Panel></>)}
  </>);
}
