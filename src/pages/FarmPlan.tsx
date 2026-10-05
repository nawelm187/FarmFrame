import { Pic } from "../ItemArt";
import { useState } from "react";
import { Link } from "react-router-dom";
import RelicArt from "../RelicArt";
import { useMany } from "../lib/data";
import { FIND, collect, query, type Row } from "../lib/drops";
import { label, nextAction, refinement, RELIC_SOURCE_IDS, relicSources, STATES, type TierPlan } from "../lib/exact";
import { readRelics, writeRelics, type MyRelics } from "../lib/myrelics";
import { readReqs } from "../lib/reqs";
import { readTracked } from "../lib/track";
import { useExact } from "../lib/useExact";
import { Badge, Countdown, Skeleton } from "./parts";
const ALL = FIND.map(f => ({ id: f.id, file: f.file }));
const SRC = FIND.filter(f => RELIC_SOURCE_IDS.includes(f.id)).map(f => ({ id: f.id, file: f.file }));
function Sources({ relic }: { relic: string }) {
  const res = useMany(SRC), { rows, ok } = collect(FIND.filter(f => SRC.some(s => s.id === f.id)).map(f => { const i = SRC.findIndex(s => s.id === f.id); return { f, rec: res[i].rec, status: res[i].status }; }));
  if (!ok) return <p className="muted">Loading drop tables…</p>;
  const s = relicSources(rows, relic);
  return s.length ? <ul className="sub">{s.map((r, i) => <li key={i}>{r.where}{r.rot ? ` · rotation ${r.rot}` : ""}{r.ch != null ? ` · ${r.ch}%` : ""}<span className="muted"> · {r.src}</span></li>)}</ul>
    : <p className="muted">No drop source for this relic in the loaded tables. It may be vaulted. <Link to={`/farm/${encodeURIComponent(relic + " Relic")}`}>Check the drop tables</Link></p>;
}
/** The best verified sources for an item name, from the drop tables. Says so when there are none. */
function Where({ rows, ok, name, extra = [] }: { rows: Row[]; ok: boolean; name: string; extra?: string[] }) {
  const q = name.trim().toLowerCase(), m = ok ? query(rows, q).filter(r => r.item.toLowerCase() === q || r.item.toLowerCase().startsWith(q + " ")).slice(0, 3) : [];
  return (<div className="muted">{m.length ? m.map((r, i) => <div key={i}>{r.where}{r.rot ? ` · rotation ${r.rot}` : ""}{r.ch != null ? ` · ${r.ch}%` : ""} <span>({r.src})</span></div>)
    : extra.length ? <div>From the item data: {extra.join("; ")}</div> : <div>{ok ? "No drop in the loaded tables (it may come from a vendor, crafting or trading)." : "Drop tables are still loading."}</div>}
    <Link to={`/farm/${encodeURIComponent(name)}`}>Open ranked farming view</Link></div>);
}
function Extras() {
  const res = useMany(ALL), { rows, ok } = collect(FIND.map((f, i) => ({ f, rec: res[i].rec, status: res[i].status })));
  const tracked = readTracked().filter(t => t.o < t.t), reqs = readReqs().filter(r => r.have < r.need);
  if (!tracked.length && !reqs.length) return null;
  return (<>
    {tracked.length > 0 && <><h2>Tracked items you still need</h2><p className="muted">From your Tracking list. Sources come from the official drop tables.</p>
      <ul className="list comp">{tracked.map((t, i) => <li key={i}><span><Pic name={t.n} size={30} /> <b>{t.n}</b> <span className="muted">· have {t.o} of {t.t}, missing {t.t - t.o}</span><Where rows={rows} ok={ok > 0} name={t.n} /></span><Link to="/tracking">Edit</Link></li>)}</ul></>}
    {reqs.length > 0 && <><h2>Build requirements not obtained</h2><p className="muted">Mods, arcanes and Forma that your builds need and you have not marked as owned.</p>
      <ul className="list comp">{reqs.map(r => <li key={r.id}><span><Pic name={r.name} size={30} /> <b>{r.name}</b> <span className="muted">· {r.kind} for {r.buildName}{r.need > 1 ? ` · have ${r.have} of ${r.need}` : ""}</span>
        {r.kind === "forma" || r.kind === "omni" ? <div className="muted">Forma Blueprints come from the Foundry, Nightwave or the in-game store; check the item page for the current source.</div> : <Where rows={rows} ok={ok > 0} name={r.name} extra={r.src} />}</span>{r.slug && r.kind === "mod" ? <Link to={`/mod/${r.slug}`}>Mod</Link> : <Link to="/roadmap">Roadmap</Link>}</li>)}</ul></>}
  </>);
}
function TierBlock({ t, mine, set }: { t: TierPlan; mine: MyRelics; set: (n: string, v: number) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  return (<section className="panel tierplan">
    <div className="row"><h3><RelicArt tier={t.tier} size={36} /> {t.tier} relics</h3>
      <span className="muted">{t.fissures.length ? `${t.fissures.length} active fissure${t.fissures.length > 1 ? "s" : ""}` : "No fissure of this tier is active"}</span></div>
    {t.fissures.length > 0 && <div className="muted">{t.fissures.slice(0, 4).map(f => `${f.missionType} ${f.node}${f.isHard ? " (Steel Path)" : ""}${f.isStorm ? " (Storm)" : ""}`).join(" · ")}</div>}
    <ul className="list comp">{t.relics.map(({ opt, parts }) => { const rf = refinement(opt), o = mine[opt.name] ?? 0;
      return (<li key={opt.name}><span><RelicArt tier={t.tier} name={opt.name} size={26} /> <b>{opt.name}</b> <span className={"rar " + opt.rarity}>{opt.rarity}</span>{opt.vaulted === true && <span className="tag STALE" title="Vaulted relics no longer drop"> Vaulted</span>}
        <div className="muted">Advances: {parts.map(label).join(", ")}</div>
        <div className="muted">Chance for the part: {STATES.filter(s => opt.chance[s] != null).map(s => `${s} ${opt.chance[s]}%`).join(" · ")}</div>
        {rf && <div className="muted">{rf.better ? `Refining to ${rf.best} raises it from ${rf.from}% to ${rf.to}%.` : `Refining to ${rf.best} does not raise the chance for this part (${rf.from}% to ${rf.to}%). Intact is enough.`}</div>}
        <button className="btn" onClick={() => setOpen(open === opt.name ? null : opt.name)} aria-expanded={open === opt.name}>How to get this relic</button>{open === opt.name && (opt.vaulted === true ? <p className="muted">Vaulted: it no longer drops from missions. It comes from trading or Varzia.</p> : <Sources relic={opt.name} />)}</span>
        <label className="muted">Owned <input type="number" min={0} value={o} style={{ width: "4.5rem" }} onChange={e => set(opt.name, Math.max(0, +e.target.value || 0))} /></label></li>); })}</ul></section>);
}
export default function FarmPlan() {
  const ex = useExact(), [mine, setMine] = useState<MyRelics>(readRelics), set = (n: string, v: number) => { const m = { ...mine, [n]: v }; setMine(m); writeRelics(m); };
  const hasOther = readTracked().some(t => t.o < t.t) || readReqs().some(r => r.have < r.need);
  if (!ex.goals.length && !hasOther) return <><h1>Farm Plan</h1><p className="lead">Nothing to plan yet.</p><p className="muted">Add a Warframe or weapon to your goals, track an item, or build something with mods you do not own. This page then lists where to get each missing piece. <Link to="/warframes">Browse Warframes</Link> · <Link to="/tracking">Tracking</Link></p></>;
  const todo = ex.plans.filter(p => p.part.count > p.have);
  return (<><h1>Farm Plan</h1>
    <p className="lead">Goal, missing part, exact relic, how to get it, active fissures and refinement. Relics and chances come from the official drop tables.</p>
    <p className="muted">Fissures <Badge s={ex.fis.status} /> {ex.relics ? "Relic tables loaded" : `Relic tables ${ex.relicStatus.toLowerCase()}`}. Mark the relics you own: the plan then tells you which one to open in the fissures running now.</p>
    {ex.pending && <Skeleton />}
    <h2>Next action per missing part</h2>
    {ex.info.length > 0 && <p className="muted">{ex.info.map(i => `${i.goal.name}: ${i.parts ? `${i.have}/${i.total} parts` : "no parts listed in the data"}`).join(" · ")}</p>}
    {ex.lost.length > 0 && <p className="tag STALE" role="alert">Not found in the current data: {ex.lost.map(g => g.name).join(", ")}. The item may have been renamed. Remove and add it again from its page.</p>}
    {!ex.goals.length ? <p className="muted">No goals. Your tracked items and build requirements are below.</p> : !todo.length ? <p className="gold">{ex.pending ? "Loading your goals…" : ex.lost.length ? "Nothing to show for the goals that could be found." : ex.info.length && ex.info.every(i => !i.parts) ? "The data lists no parts for these goals, so there is nothing to plan." : ex.info.some(i => !i.parts) ? `All listed parts collected. No parts are listed for ${ex.info.filter(i => !i.parts).map(i => i.goal.name).join(", ")}.` : "All goal parts collected."}</p> : <ul className="list comp">{todo.map(p => { const n = nextAction(p, ex.fis.data, mine, !!ex.relics);
      return <li key={p.goal.id + p.part.name}><span><Pic name={`${p.entity} ${p.part.name}`} size={34} /> <b>{label(p)}</b>{p.left > 1 ? ` ×${p.left}` : ""}<div className="muted">{n.text}</div></span>{n.to && <Link to={n.to}>{n.kind === "open" ? "Plan" : "Find"}</Link>}</li>; })}</ul>}
    <Extras />
    {ex.tiers.length > 0 && <><h2>Relics by tier</h2>{ex.tiers.map(t => <TierBlock key={t.tier} t={t} mine={mine} set={set} />)}</>}
    {todo.some(p => !p.relics.length && p.relicTiers.length > 0) && ex.relics && <p className="muted">Some parts list a relic tier in the item data but no exact relic was found in the relic tables by name: {todo.filter(p => !p.relics.length && p.relicTiers.length).map(label).join(", ")}.</p>}
    {ex.fis.data && ex.tiers.some(t => t.fissures.length) && <p className="muted">Soonest fissure ending: <Countdown exp={[...ex.tiers.flatMap(t => t.fissures)].sort((a, b) => Date.parse(a.expiry) - Date.parse(b.expiry))[0].expiry} /></p>}</>);
}
