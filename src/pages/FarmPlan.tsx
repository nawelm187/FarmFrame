import { Pic } from "../ItemArt";
import { useState } from "react";
import { Link } from "react-router-dom";
import RelicArt from "../RelicArt";
import { useMany } from "../lib/data";
import { FIND, collect, query, type Row } from "../lib/drops";
import { GROUP_TITLE, groupOf, label, nextAction, refinement, RELIC_SOURCE_IDS, relicSources, STATES, type TierPlan } from "../lib/exact";
import { readRelics, writeRelics, type MyRelics } from "../lib/myrelics";
import { readReqs } from "../lib/reqs";
import { readTracked } from "../lib/track";
import { useExact } from "../lib/useExact";
import { Badge, Countdown, Skeleton } from "./parts";
import { Ring, StatTile, Stepper } from "../ui";
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
      <ul className="list comp">{tracked.map((t, i) => <li key={i}><span><Pic name={t.n} size={30} /> <b>{t.n}</b> <span className="muted">· have {t.o} of {t.t}, missing {t.t - t.o}</span><Where rows={rows} ok={ok > 0} name={t.n} /></span><Link to="/tracking">Edit in Tracking</Link></li>)}</ul></>}
    {reqs.length > 0 && <><h2>Build requirements not obtained</h2><p className="muted">Mods, arcanes and Forma that your builds need and you have not marked as owned.</p>
      <ul className="list comp">{reqs.map(r => <li key={r.id}><span><Pic name={r.name} size={30} /> <b>{r.name}</b> <span className="muted">· {r.kind} for {r.buildName}{r.need > 1 ? ` · have ${r.have} of ${r.need}` : ""}</span>
        {r.kind === "forma" || r.kind === "omni" ? <div className="muted">Forma Blueprints come from the Foundry, Nightwave or the in-game store; check the item page for the current source.</div> : <Where rows={rows} ok={ok > 0} name={r.name} extra={r.src} />}</span>{r.slug && r.kind === "mod" ? <Link to={`/mod/${r.slug}`}>Open mod</Link> : <Link to="/roadmap">Open Roadmap</Link>}</li>)}</ul></>}
  </>);
}
function TierBlock({ t, mine, set }: { t: TierPlan; mine: MyRelics; set: (n: string, v: number) => void }) {
  const [open, setOpen] = useState<string | null>(null);
  return (<section className="gcard tierplan">
    <div className="ghead"><RelicArt tier={t.tier} size={56} /><div className="grow"><h3>{t.tier} relics</h3>
      <div className="muted">{t.fissures.length ? `${t.fissures.length} active fissure${t.fissures.length > 1 ? "s" : ""}` : "No fissure of this tier is active"}</div>{t.fissures.length > 0 && <div className="muted">{t.fissures.slice(0, 4).map(f => `${f.missionType} ${f.node}${f.isHard ? " (Steel Path)" : ""}${f.isStorm ? " (Storm)" : ""}`).join(" · ")}</div>}</div></div>
    <ul className="list comp">{t.relics.map(({ opt, parts }) => { const rf = refinement(opt), o = mine[opt.name] ?? 0;
      return (<li key={opt.name}><span><RelicArt tier={t.tier} name={opt.name} size={26} /> <b>{opt.name}</b> <span className={"rar " + opt.rarity}>{opt.rarity}</span>{opt.vaulted === true && <span className="tag STALE" title="Vaulted relics no longer drop"> Vaulted</span>}
        <div className="muted">Advances: {parts.map(label).join(", ")}</div>
        <div className="muted">Chance for the part: {STATES.filter(s => opt.chance[s] != null).map(s => `${s} ${opt.chance[s]}%`).join(" · ")}</div>
        {rf && <div className="muted">{rf.better ? `Refining to ${rf.best} raises it from ${rf.from}% to ${rf.to}%.` : `Refining to ${rf.best} does not raise the chance for this part (${rf.from}% to ${rf.to}%). Intact is enough.`}</div>}
        <button className="btn" onClick={() => setOpen(open === opt.name ? null : opt.name)} aria-expanded={open === opt.name}>How to get this relic</button>{open === opt.name && (opt.vaulted === true ? <p className="muted">Vaulted: it no longer drops from missions. It comes from trading or Varzia.</p> : <Sources relic={opt.name} />)}</span>
        <Stepper value={o} label={opt.name} onChange={v => set(opt.name, v)} /></li>); })}</ul></section>);
}
export default function FarmPlan() {
  const ex = useExact(), [mine, setMine] = useState<MyRelics>(readRelics), set = (n: string, v: number) => { const m = { ...mine, [n]: v }; setMine(m); writeRelics(m); };
  const hasOther = readTracked().some(t => t.o < t.t) || readReqs().some(r => r.have < r.need);
  if (!ex.goals.length && !hasOther) return <><h1>Farm Plan</h1><p className="lead">Nothing to plan yet.</p><p className="muted">Add a Warframe or weapon to your goals, track an item, or build something with mods you do not own. This page then lists where to get each missing piece. <Link to="/warframes">Browse Warframes</Link> · <Link to="/tracking">Tracking</Link></p></>;
  const todo = ex.plans.filter(p => p.part.count > p.have);
  const cnt = { now: 0, next: 0, blocked: 0 }; for (const p of todo) cnt[groupOf(nextAction(p, ex.fis.data, mine, !!ex.relics))]++;
  const tot = ex.info.reduce((a, i) => ({ have: a.have + i.have, total: a.total + i.total }), { have: 0, total: 0 });
  return (<><h1>Farm Plan</h1>
    <p className="lead">Goal, missing part, exact relic, how to get it, active fissures and refinement. Relics and chances come from the official drop tables.</p>
    <section className="hud" aria-label="Plan summary">{tot.total > 0 ? <Ring pct={100 * tot.have / tot.total} size={96} /> : <Ring pct={0} size={96}>—</Ring>}
      <div><h2>{todo.length ? `${todo.length} part${todo.length > 1 ? "s" : ""} to farm` : "Nothing left to farm"}</h2>
        <div className="muted">Fissures <Badge s={ex.fis.status} /> · {ex.relics ? "relic tables loaded" : `relic tables ${ex.relicStatus.toLowerCase()}`}. Mark the relics you own and the plan tells you which one to open in the fissures running now.</div>
        <div className="stats"><StatTile n={cnt.now} label="Available now" tone="gold" /><StatTile n={cnt.next} label="Next steps" tone="acc" /><StatTile n={cnt.blocked} label="Blocked" /><StatTile n={`${tot.have}/${tot.total}`} label="Goal parts" /></div></div></section>
    {ex.pending && <Skeleton />}
    <h2>Next action per missing part</h2>
    {ex.info.length > 0 && <p className="muted">{ex.info.map(i => `${i.goal.name}: ${i.parts ? `${i.have}/${i.total} parts` : "no parts listed in the data"}`).join(" · ")}</p>}
    {ex.lost.length > 0 && <p className="tag STALE" role="alert">Not found in the current data: {ex.lost.map(g => g.name).join(", ")}. The item may have been renamed. Remove and add it again from its page.</p>}
    {!ex.goals.length ? <p className="muted">No goals. Your tracked items and build requirements are below.</p> : !todo.length ? <p className="gold">{ex.pending ? "Loading your goals…" : ex.lost.length ? "Nothing to show for the goals that could be found." : ex.info.length && ex.info.every(i => !i.parts) ? "The data lists no parts for these goals, so there is nothing to plan." : ex.info.some(i => !i.parts) ? `All listed parts collected. No parts are listed for ${ex.info.filter(i => !i.parts).map(i => i.goal.name).join(", ")}.` : "All goal parts collected."}</p> : <>{(["now", "next", "blocked"] as const).map(g => { const rows = todo.map(p => ({ p, n: nextAction(p, ex.fis.data, mine, !!ex.relics) })).filter(x => groupOf(x.n) === g); if (!rows.length) return null;
      return (<section key={g} aria-label={GROUP_TITLE[g]}><h3>{GROUP_TITLE[g]} <span className="muted">{rows.length}</span></h3><div className="acards">{rows.map(({ p, n }, i) => { const gi = ex.info.find(x => x.goal.id === p.goal.id), top = p.relics.filter(r => r.vaulted !== true)[0];
        return <div key={p.goal.id + p.part.name} className={"acard" + (g === "now" ? " now" : "")} style={{ animationDelay: i * 40 + "ms" }}><Pic name={`${p.entity} ${p.part.name}`} size={56} />
          <span className="tx"><span className={"kicker" + (g === "now" ? " now" : "")}>For {p.goal.name}</span><b>{label(p)}{p.left > 1 ? ` ×${p.left}` : ""}</b>
            <span className="muted">Have {p.have} of {p.part.count}, missing {p.left}</span>
            <span className="muted">{n.text}</span>
            {top && g !== "blocked" && <Link className="relicchip" to={`/relics?q=${encodeURIComponent(top.name)}`}><RelicArt tier={top.tier} name={top.name} size={20} /><span>{top.name}</span><span className="muted">{top.rarity}</span></Link>}
            {gi && gi.parts > 0 && <span className="muted">Goal: {gi.have}/{gi.total} parts{gi.have < gi.total ? ` → ${Math.min(gi.have + 1, gi.total)}/${gi.total}` : ""}</span>}
            {n.to && <Link to={n.to}>{n.kind === "open" ? "Open plan" : "Find sources"}</Link>}</span></div>; })}</div></section>); })}</>}
    <Extras />
    {ex.tiers.length > 0 && <><h2>Relics by tier</h2>{ex.tiers.map(t => <TierBlock key={t.tier} t={t} mine={mine} set={set} />)}</>}
    {todo.some(p => !p.relics.length && p.relicTiers.length > 0) && ex.relics && <p className="muted">Some parts list a relic tier in the item data but no exact relic was found in the relic tables by name: {todo.filter(p => !p.relics.length && p.relicTiers.length).map(label).join(", ")}.</p>}
    {ex.fis.data && ex.tiers.some(t => t.fissures.length) && <p className="muted">Soonest fissure ending: <Countdown exp={[...ex.tiers.flatMap(t => t.fissures)].sort((a, b) => Date.parse(a.expiry) - Date.parse(b.expiry))[0].expiry} /></p>}</>);
}
