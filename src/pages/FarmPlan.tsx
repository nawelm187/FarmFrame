import { useState } from "react";
import { Link } from "react-router-dom";
import RelicArt from "../RelicArt";
import { useMany } from "../lib/data";
import { FIND, collect } from "../lib/drops";
import { label, nextAction, refinement, RELIC_SOURCE_IDS, relicSources, STATES, type TierPlan } from "../lib/exact";
import { readRelics, writeRelics, type MyRelics } from "../lib/myrelics";
import { useExact } from "../lib/useExact";
import { Badge, Countdown, Skeleton } from "./parts";
const SRC = FIND.filter(f => RELIC_SOURCE_IDS.includes(f.id)).map(f => ({ id: f.id, file: f.file }));
function Sources({ relic }: { relic: string }) {
  const res = useMany(SRC), { rows, ok } = collect(FIND.filter(f => SRC.some(s => s.id === f.id)).map(f => { const i = SRC.findIndex(s => s.id === f.id); return { f, rec: res[i].rec, status: res[i].status }; }));
  if (!ok) return <p className="muted">Loading drop tables…</p>;
  const s = relicSources(rows, relic);
  return s.length ? <ul className="sub">{s.map((r, i) => <li key={i}>{r.where}{r.rot ? ` · rotation ${r.rot}` : ""}{r.ch != null ? ` · ${r.ch}%` : ""}<span className="muted"> · {r.src}</span></li>)}</ul>
    : <p className="muted">No drop source for this relic in the loaded tables. It may be vaulted. <Link to={`/farm/${encodeURIComponent(relic + " Relic")}`}>Check the drop tables</Link></p>;
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
  if (!ex.goals.length) return <><h1>Farm Plan</h1><p className="lead">No active goals yet.</p><p className="muted">Add a Warframe or weapon to your goals and this page lists the exact relics for each missing part. <Link to="/warframes">Browse Warframes</Link></p></>;
  const todo = ex.plans.filter(p => p.part.count > p.have);
  return (<><h1>Farm Plan</h1>
    <p className="lead">Goal, missing part, exact relic, how to get it, active fissures and refinement. Relics and chances come from the official drop tables.</p>
    <p className="muted">Fissures <Badge s={ex.fis.status} /> {ex.relics ? "Relic tables loaded" : `Relic tables ${ex.relicStatus.toLowerCase()}`}. Mark the relics you own: the plan then tells you which one to open in the fissures running now.</p>
    {ex.pending && <Skeleton />}
    <h2>Next action per missing part</h2>
    {!todo.length ? <p className="gold">{ex.pending ? "Loading your goals…" : "All parts collected."}</p> : <ul className="list comp">{todo.map(p => { const n = nextAction(p, ex.fis.data, mine, !!ex.relics);
      return <li key={p.goal.id + p.part.name}><span><b>{label(p)}</b>{p.left > 1 ? ` ×${p.left}` : ""}<div className="muted">{n.text}</div></span>{n.to && <Link to={n.to}>{n.kind === "open" ? "Plan" : "Find"}</Link>}</li>; })}</ul>}
    {ex.tiers.length > 0 && <><h2>Relics by tier</h2>{ex.tiers.map(t => <TierBlock key={t.tier} t={t} mine={mine} set={set} />)}</>}
    {todo.some(p => !p.relics.length && p.relicTiers.length > 0) && ex.relics && <p className="muted">Some parts list a relic tier in the item data but no exact relic was found in the relic tables by name: {todo.filter(p => !p.relics.length && p.relicTiers.length).map(label).join(", ")}.</p>}
    {ex.fis.data && ex.tiers.some(t => t.fissures.length) && <p className="muted">Soonest fissure ending: <Countdown exp={[...ex.tiers.flatMap(t => t.fissures)].sort((a, b) => Date.parse(a.expiry) - Date.parse(b.expiry))[0].expiry} /></p>}</>);
}
