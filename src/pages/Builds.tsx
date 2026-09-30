import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { evaluate, newBuild, readBuilds, requirements, writeBuilds, type Build, type Slot } from "../lib/build";
import { readTracked, writeTracked } from "../lib/track";
import { CATS, CAT_SRC, parseCatalog } from "../lib/catalog";
import { useMany } from "../lib/data";
import { Unavailable } from "./parts";
const POLS = ["madurai", "vazarin", "naramon", "zenurik", "unairu", "penjaga", "any"];
export function BuildList() {
  const [bs, setBs] = useState(readBuilds), nav = useNavigate();
  const commit = (a: Build[]) => { setBs(a); writeBuilds(a); };
  const add = () => { const b = newBuild(); commit([...bs, b]); nav(`/build/${b.id}`); };
  return (<><h1>Builds</h1><p className="lead">Plan mod loadouts with capacity checks. Stored only in this browser.</p>
    <div className="bar"><button className="btn" onClick={add}>New build</button></div>
    {!bs.length ? <p className="muted">No builds yet.</p> : <ul className="list comp">{bs.map(b => (<li key={b.id}><Link to={`/build/${b.id}`}>{b.name}</Link><button className="btn" onClick={() => commit(bs.filter(x => x.id !== b.id))}>Delete</button></li>))}</ul>}</>);
}
export function BuildEditor() {
  const { id } = useParams(), [bs, setBs] = useState(readBuilds), [q, setQ] = useState(""), [sent, setSent] = useState(false);
  const [wf, md] = useMany([{ id: "warframe", file: "", url: CATS.warframe.url, src: CAT_SRC }, { id: "mod", file: "", url: CATS.mod.url, src: CAT_SRC }]);
  const b = bs.find(x => x.id === id);
  if (!b) return <><h1>Build not found</h1><Link to="/builds">Back to builds</Link></>;
  const frames = parseCatalog(wf.rec?.data, "warframe"), mods = parseCatalog(md.rec?.data, "mod");
  if (!frames || !mods) return <Unavailable title="Build data" status={!frames ? wf.status : md.status} why="Warframe and mod catalogs are needed and not loaded yet." rec={(!frames ? wf : md).rec} />;
  const save = (nb: Build) => { const a = bs.map(x => (x.id === nb.id ? nb : x)); setBs(a); writeBuilds(a); };
  const bySlug = new Map(mods.map(m => [m.slug, m])), byName = new Map(mods.map(m => [m.name.toLowerCase(), m]));
  const ev = evaluate(b, frames.find(f => f.slug === b.frame), bySlug);
  const setSlot = (i: number, s: Slot) => save({ ...b, slots: b.slots.map((x, j) => (j === i ? s : x)) });
  const rq = requirements(b, frames.find(f => f.slug === b.frame), bySlug);
  const send = () => { const a = readTracked(); const add = rq.missingMods.filter(m => !a.some(t => t.n === m.name)).map(m => ({ n: m.name, o: 0, t: 1 }));
    if (rq.forma > 0 && !a.some(t => t.n === "Forma Blueprint")) add.push({ n: "Forma Blueprint", o: 0, t: rq.forma }); writeTracked([...a, ...add]); setSent(true); };
  const onAdd = (v: string) => { setQ(v); const m = byName.get(v.trim().toLowerCase()), i = b.slots.findIndex(s => !s.mod); if (m && i >= 0) { setSlot(i, { mod: m.slug, rank: m.maxRank ?? 0 }); setQ(""); } };
  return (<><h1><input aria-label="Build name" value={b.name} onChange={e => save({ ...b, name: e.target.value })} style={{ fontSize: "1.2rem" }} /></h1>
    <div className="bar"><select aria-label="Warframe" value={b.frame} onChange={e => save({ ...b, frame: e.target.value })}><option value="">Choose a Warframe</option>{frames.map(f => <option key={f.slug} value={f.slug}>{f.name}</option>)}</select>
      <label className="muted"><input type="checkbox" checked={b.reactor} onChange={e => save({ ...b, reactor: e.target.checked })} /> Orokin Reactor (capacity 60)</label></div>
    <label className="chk muted">Mod capacity <b>{ev.total} / {ev.capacity}</b><progress max={ev.capacity} value={Math.min(ev.total, ev.capacity)} /></label>
    <div className="bar"><input aria-label="Add mod" list="modnames" placeholder="Add a mod by name" value={q} onChange={e => onAdd(e.target.value)} /><datalist id="modnames">{mods.map(m => <option key={m.slug} value={m.name} />)}</datalist></div>
    <ul className="list comp">{ev.rows.map(r => (<li key={r.i}><span>Slot {r.i + 1} <span className="muted">{r.pol ?? "no polarity"}</span> · {r.m ? <b>{r.m.name}</b> : <span className="muted">Empty</span>}{r.d != null && <span className="muted"> · drain {r.d}</span>}</span>
      <span><select aria-label={`Slot ${r.i + 1} polarity`} value={b.slots[r.i].pol ?? ""} onChange={e => setSlot(r.i, { ...b.slots[r.i], pol: e.target.value || undefined })}><option value="">Native</option>{POLS.map(x => <option key={x}>{x}</option>)}</select> {b.slots[r.i].mod && <><label className="muted"><input type="checkbox" checked={!!b.slots[r.i].owned} onChange={e => setSlot(r.i, { ...b.slots[r.i], owned: e.target.checked })} /> Owned </label><label className="muted">Rank <input type="number" min={0} max={r.m?.maxRank ?? 30} value={b.slots[r.i].rank} style={{ width: "4rem" }} onChange={e => setSlot(r.i, { ...b.slots[r.i], rank: Math.max(0, +e.target.value || 0) })} /></label> <button className="btn" onClick={() => setSlot(r.i, { ...b.slots[r.i], mod: null, rank: 0, owned: false })}>Remove</button></>}</span></li>))}</ul>
    {ev.issues.length > 0 ? <ul>{ev.issues.map((x, i) => <li key={i} className={x.level === "error" ? "ERROR" : "STALE"} style={{ border: 0 }}>{x.level === "error" ? "Error: " : "Note: "}{x.text}</li>)}</ul> : <p className="gold">No issues found.</p>}
    {rq.frame && <><h2>Requirements</h2>
      <ul className="list comp"><li><span>{rq.frame.name}</span><label className="muted"><input type="checkbox" checked={!!b.haveFrame} onChange={e => save({ ...b, haveFrame: e.target.checked })} /> I have it {!rq.frame.have && <Link to={`/warframe/${rq.frame.slug}`}>Open to plan it</Link>}</label></li>
        {rq.forma > 0 && <li><span>Forma <b>×{rq.forma}</b> <span className="muted">from slot polarity changes</span></span><Link to="/farm/Forma%20Blueprint">Farm</Link></li>}
        {rq.mods.map(m => (<li key={m.slug}><span>{m.name} <span className="muted">rank {m.rank}{m.endo != null ? ` · about ${m.endo} endo` : ""}</span></span>
          <span><span className={"tag " + (m.owned ? "FRESH" : "ERROR")}>{m.owned ? "Have" : "Missing"}</span> {!m.owned && <Link to={`/farm/${encodeURIComponent(m.name)}`}>Farm</Link>}</span></li>))}</ul>
      <p className="muted">{rq.missingMods.length} missing mod{rq.missingMods.length === 1 ? "" : "s"}.{rq.endoKnown && rq.endoTotal > 0 ? ` Endo to rank every mod from zero: about ${rq.endoTotal} (calculated estimate from the standard rule).` : ""} Forma is counted from slot polarity changes when the source lists the Warframe's native polarities. Arcanes are not part of builds yet.</p>
      <div className="bar"><button className="btn" onClick={send} disabled={(!rq.missingMods.length && !rq.forma) || sent}>{sent ? "Sent to Tracking" : "Send missing mods to my plan"}</button></div>
      {sent && <p className="muted">Added to Tracking. Home and the farming pages now take them into account.</p>}</>}
    <p className="muted">Scope: capacity and validation only. Drain uses the standard rules (base + rank, polarity match halves, mismatch +25%) on data from a community source. Stat calculation, aura, exilus, arcanes and shards are not included yet.</p></>);
}
