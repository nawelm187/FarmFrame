import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { evaluate, KIND_LABEL, modFits, newBuild, readBuilds, requirements, writeBuilds, type ArcSlot, type Build, type Kind, type Slot } from "../lib/build";
import { readTracked, writeTracked } from "../lib/track";
import { calc, LABEL } from "../lib/calc";
import { CATS, CAT_SRC, parseCatalog, type Cat } from "../lib/catalog";
import { useMany } from "../lib/data";
import { Unavailable } from "./parts";
const ARC_URL = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Arcanes.json";
const ARC_ALT = "https://cdn.jsdelivr.net/gh/WFCD/warframe-items@master/data/json/Arcanes.json";
const ARC_SRC = "WFCD warframe-items on GitHub (community, unofficial)";
const RAW = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/", CDN = "https://cdn.jsdelivr.net/gh/WFCD/warframe-items@master/data/json/";
const WF = [{ id: "warframe", url: CATS.warframe.url, cat: "warframe" as Cat }], WP = [{ id: "weapon", url: CATS.weapon.url, cat: "weapon" as Cat }];
const SRCS: Record<Kind, { id: string; url: string; alt?: string; cat: Cat }[]> = { warframe: WF, primary: WP, secondary: WP, melee: WP,
  companion: [{ id: "sentinels", url: RAW + "Sentinels.json", alt: CDN + "Sentinels.json", cat: "warframe" }, { id: "pets", url: RAW + "Pets.json", alt: CDN + "Pets.json", cat: "warframe" }],
  archwing: [{ id: "archwing", url: RAW + "Archwing.json", alt: CDN + "Archwing.json", cat: "warframe" }] };
const POLS = ["madurai", "vazarin", "naramon", "zenurik", "unairu", "penjaga", "any"];
export function BuildList() {
  const [bs, setBs] = useState(readBuilds), nav = useNavigate();
  const commit = (a: Build[]) => { setBs(a); writeBuilds(a); };
  const add = () => { const b = newBuild(); commit([...bs, b]); nav(`/build/${b.id}`); };
  return (<><h1>Builds</h1><p className="lead">Plan mod loadouts with capacity checks. Stored only in this browser.</p>
    <div className="bar"><button className="btn" onClick={add}>New build</button></div>
    {!bs.length ? <p className="muted">No builds yet. Create one to check mod capacity and see what you still need to farm.</p> : <ul className="list comp">{bs.map(b => (<li key={b.id}><span><Link to={`/build/${b.id}`}>{b.name}</Link> <span className="muted">{KIND_LABEL[b.kind ?? "warframe"]}</span></span><button className="btn" onClick={() => commit(bs.filter(x => x.id !== b.id))}>Delete</button></li>))}</ul>}</>);
}
export function BuildEditor() {
  const { id } = useParams(), [bs, setBs] = useState(readBuilds), [q, setQ] = useState(""), [sent, setSent] = useState(false), [aq, setAq] = useState(["", ""]);
  const b = bs.find(x => x.id === id), kind: Kind = b?.kind ?? "warframe", srcs = SRCS[kind];
  const res = useMany([...srcs.map(s => ({ id: s.id, file: "", url: s.url, alt: s.alt, src: s.alt ? ARC_SRC : CAT_SRC })), { id: "mod", file: "", url: CATS.mod.url, src: CAT_SRC }, { id: "arcane", file: "", url: ARC_URL, alt: ARC_ALT, src: ARC_SRC }]);
  const modRes = res[srcs.length], ar = res[srcs.length + 1];
  if (!b) return <><h1>Build not found</h1><Link to="/builds">Back to builds</Link></>;
  const all = srcs.flatMap((s, i) => parseCatalog(res[i].rec?.data, s.cat) ?? []);
  const frames = (kind === "primary" || kind === "secondary" || kind === "melee" ? all.filter(e => e.category.toLowerCase() === kind) : all).sort((x, y) => x.name.localeCompare(y.name));
  const mods = parseCatalog(modRes.rec?.data, "mod");
  if (!all.length || !mods) return <Unavailable title="Build data" status={!all.length ? res[0].status : modRes.status} why="The item and mod catalogs are needed and not loaded yet." rec={(!all.length ? res[0] : modRes).rec} />;
  const save = (nb: Build) => { const a = bs.map(x => (x.id === nb.id ? nb : x)); setBs(a); writeBuilds(a); };
  const bySlug = new Map(mods.map(m => [m.slug, m])), fit = mods.filter(m => modFits(kind, m)), byName = new Map(fit.map(m => [m.name.toLowerCase(), m]));
  const frameEnt = frames.find(f => f.slug === b.frame), ev = evaluate(b, frameEnt, bySlug), st = calc(b, bySlug);
  const setSlot = (i: number, s: Slot) => save({ ...b, slots: b.slots.map((x, j) => (j === i ? s : x)) });
  const arcs = parseCatalog(ar.rec?.data, "mod"), arcBy = new Map((arcs ?? []).map(a => [a.slug, a])), arcByName = new Map((arcs ?? []).map(a => [a.name.toLowerCase(), a]));
  const arcSlot = (i: number): ArcSlot => b.arcanes?.[i] ?? { mod: null };
  const setArc = (i: number, v: ArcSlot) => { const a = [arcSlot(0), arcSlot(1)]; a[i] = v; save({ ...b, arcanes: a }); };
  const onArc = (i: number, v: string) => { const m = arcByName.get(v.trim().toLowerCase()); if (m) { setArc(i, { mod: m.slug, owned: false }); setAq(["", ""]); } else setAq(aq.map((x, j) => (j === i ? v : x))); };
  const rq = requirements(b, frames.find(f => f.slug === b.frame), bySlug, arcBy);
  const send = () => { const a = readTracked(); const add = [...rq.missingMods, ...rq.missingArcanes].filter(m => !a.some(t => t.n === m.name)).map(m => ({ n: m.name, o: 0, t: 1 }));
    if (rq.forma > 0 && !a.some(t => t.n === "Forma Blueprint")) add.push({ n: "Forma Blueprint", o: 0, t: rq.forma });
    if (rq.omni > 0 && !a.some(t => t.n === "Omni Forma Blueprint")) add.push({ n: "Omni Forma Blueprint", o: 0, t: rq.omni }); writeTracked([...a, ...add]); setSent(true); };
  const onAdd = (v: string) => { setQ(v); const m = byName.get(v.trim().toLowerCase()), i = b.slots.findIndex(s => !s.mod); if (m && i >= 0) { setSlot(i, { mod: m.slug, rank: m.maxRank ?? 0 }); setQ(""); } };
  return (<><h1><input aria-label="Build name" value={b.name} onChange={e => save({ ...b, name: e.target.value })} style={{ fontSize: "1.2rem" }} /></h1>
    <div className="bar"><select aria-label="Build type" value={kind} onChange={e => save({ ...b, kind: e.target.value as Kind, frame: "", haveFrame: false, slots: newBuild().slots, arcanes: undefined })}>{(Object.keys(KIND_LABEL) as Kind[]).map(k => <option key={k} value={k}>{KIND_LABEL[k]}</option>)}</select><select aria-label="Item" value={b.frame} onChange={e => save({ ...b, frame: e.target.value })}><option value="">Choose {KIND_LABEL[kind].toLowerCase()}</option>{frames.map(f => <option key={f.slug} value={f.slug}>{f.name}</option>)}</select>
      <label className="muted"><input type="checkbox" checked={b.reactor} onChange={e => save({ ...b, reactor: e.target.checked })} /> {kind === "primary" || kind === "secondary" || kind === "melee" ? "Orokin Catalyst" : "Orokin Reactor"} (capacity 60)</label></div>
    <label className="chk muted">Mod capacity <b>{ev.total} / {ev.capacity}</b><progress max={ev.capacity} value={Math.min(ev.total, ev.capacity)} /></label>
    <div className="bar"><input aria-label="Add mod" list="modnames" placeholder="Add a mod by name" value={q} onChange={e => onAdd(e.target.value)} /><datalist id="modnames">{fit.map(m => <option key={m.slug} value={m.name} />)}</datalist></div>
    <ul className="list comp">{ev.rows.map(r => (<li key={r.i}><span>Slot {r.i + 1} <span className="muted">{r.pol ?? "no polarity"}</span> · {r.m ? <b>{r.m.name}</b> : <span className="muted">Empty</span>}{r.d != null && <span className="muted"> · drain {r.d}</span>}</span>
      <span><select aria-label={`Slot ${r.i + 1} polarity`} value={b.slots[r.i].pol ?? ""} onChange={e => setSlot(r.i, { ...b.slots[r.i], pol: e.target.value || undefined })}><option value="">Native</option>{POLS.map(x => <option key={x} value={x}>{x === "any" ? "omni (any)" : x}</option>)}</select> {b.slots[r.i].mod && <><label className="muted"><input type="checkbox" checked={!!b.slots[r.i].owned} onChange={e => setSlot(r.i, { ...b.slots[r.i], owned: e.target.checked })} /> Owned </label><label className="muted">Rank <input type="number" min={0} max={r.m?.maxRank ?? 30} value={b.slots[r.i].rank} style={{ width: "4rem" }} onChange={e => setSlot(r.i, { ...b.slots[r.i], rank: Math.max(0, +e.target.value || 0) })} /></label> <button className="btn" onClick={() => setSlot(r.i, { ...b.slots[r.i], mod: null, rank: 0, owned: false })}>Remove</button></>}</span></li>))}</ul>
    {kind === "warframe" && <><h2>Arcanes</h2>
    {!arcs ? <p className="muted">Arcane data {ar.status === "LOADING" ? "is loading" : "is unavailable"}.</p> : <><datalist id="arcnames">{arcs.map(a => <option key={a.slug} value={a.name} />)}</datalist>
      <ul className="list comp">{[0, 1].map(i => { const s = arcSlot(i), a = s.mod ? arcBy.get(s.mod) : undefined; return (<li key={i}><span>Arcane slot {i + 1} · {a ? <b>{a.name}</b> : s.mod ? <span className="muted">not in loaded data</span> : <span className="muted">Empty</span>}</span>
        <span>{s.mod ? <><label className="muted"><input type="checkbox" checked={!!s.owned} onChange={e => setArc(i, { ...s, owned: e.target.checked })} /> Owned </label><button className="btn" onClick={() => setArc(i, { mod: null })}>Remove</button></> : <input aria-label={`Arcane slot ${i + 1}`} list="arcnames" placeholder="Add an arcane" value={aq[i]} onChange={e => onArc(i, e.target.value)} />}</span></li>); })}</ul>
      {rq.arcDup && <p className="ERROR">The same arcane is equipped twice.</p>}</>}</>}
    {ev.issues.length > 0 ? <ul>{ev.issues.map((x, i) => <li key={i} className={x.level === "error" ? "ERROR" : "STALE"} style={{ border: 0 }}>{x.level === "error" ? "Error: " : "Note: "}{x.text}</li>)}</ul> : <p className="gold">No issues found.</p>}
    {rq.frame && <><h2>Requirements</h2>
      <ul className="list comp"><li><span>{rq.frame.name}</span><label className="muted"><input type="checkbox" checked={!!b.haveFrame} onChange={e => save({ ...b, haveFrame: e.target.checked })} /> I have it {!rq.frame.have && (kind === "warframe" || kind === "primary" || kind === "secondary" || kind === "melee") && <Link to={`/${kind === "warframe" ? "warframe" : "weapon"}/${rq.frame.slug}`}>Open to plan it</Link>}</label></li>
        {rq.forma > 0 && <li><span>Forma <b>×{rq.forma}</b> <span className="muted">from slot polarity changes</span></span><Link to="/farm/Forma%20Blueprint">Farm</Link></li>}
        {rq.omni > 0 && <li><span>Omni Forma <b>×{rq.omni}</b> <span className="muted">for omni (universal) slots</span></span><Link to="/farm/Omni%20Forma%20Blueprint">Farm</Link></li>}
        {rq.mods.map(m => (<li key={m.slug}><span>{m.name} <span className="muted">rank {m.rank}{m.endo != null ? ` · about ${m.endo} endo` : ""}</span></span>
          <span><span className={"tag " + (m.owned ? "FRESH" : "ERROR")}>{m.owned ? "Have" : "Missing"}</span> {!m.owned && <Link to={`/farm/${encodeURIComponent(m.name)}`}>Farm</Link>}</span></li>))}
        {rq.arcanes.map(a => (<li key={a.slug}><span>{a.name} <span className="muted">arcane</span></span><span><span className={"tag " + (a.owned ? "FRESH" : "ERROR")}>{a.owned ? "Have" : "Missing"}</span> {!a.owned && <Link to={`/farm/${encodeURIComponent(a.name)}`}>Farm</Link>}</span></li>))}</ul>
      <p className="muted">{rq.missingMods.length} missing mod{rq.missingMods.length === 1 ? "" : "s"}{rq.arcanes.length ? ` and ${rq.missingArcanes.length} missing arcane${rq.missingArcanes.length === 1 ? "" : "s"}` : ""}.{rq.endoKnown && rq.endoTotal > 0 ? ` Endo to rank every mod from zero: about ${rq.endoTotal} (calculated estimate from the standard rule).` : ""} Forma is counted from slot polarity changes when the source lists the Warframe's native polarities.</p>
      <div className="bar"><button className="btn" onClick={send} disabled={(!rq.missingMods.length && !rq.missingArcanes.length && !rq.forma && !rq.omni) || sent}>{sent ? "Sent to Tracking" : "Send missing mods to my plan"}</button></div>
      {sent && <p className="muted">Added to Tracking. Home and the farming pages now take them into account.</p>}</>}
    {st.stats.length > 0 && <><h2>Statistics</h2>
      <ul className="list comp">{st.stats.map(s => { const base = ["health", "shield", "armor", "energy"].includes(s.key) ? frameEnt?.stats.find(([l]) => l === LABEL[s.key])?.[1] : undefined, sg = s.pct > 0 ? "+" : "";
        return (<li key={s.key}><span>{s.label} <b>{sg}{+s.pct.toFixed(1)}%</b>{base != null && <span className="muted"> · about {Math.round(base * (1 + s.pct / 100))} from the source's base {base}</span>}</span>
          <details><summary>Explain</summary><ul className="sub">{s.parts.map((p, i) => <li key={i}>{p.mod} {p.pct > 0 ? "+" : ""}{p.pct}%</li>)}</ul>
            <p className="muted">{base != null ? `Base ${base} (from the source, before Warframe rank scaling) × (1 + ${+s.pct.toFixed(1)}/100) = ${+(base * (1 + s.pct / 100)).toFixed(1)}. Approximation: rank 30 scaling and in-game rounding are not applied.` : ["strength", "duration", "efficiency", "range"].includes(s.key) ? `100% + ${+s.pct.toFixed(1)}% = ${+(100 + s.pct).toFixed(1)}%. In-game caps and diminishing returns are not applied.` : `Sum of the listed bonuses: ${+s.pct.toFixed(1)}%. They add to the item's own base value; in-game rounding and caps are not applied.`}</p></details></li>); })}</ul>
      <p className="muted">Only effects the source lists as plain percentages are counted, at the rank you set. Conditional effects are not included.{st.unparsed.length > 0 && ` Not calculated: ${st.unparsed.slice(0, 6).join("; ")}${st.unparsed.length > 6 ? ` and ${st.unparsed.length - 6} more` : ""}.`}</p></>}
    <p className="muted">Scope: capacity, validation and percentage-based statistics. Drain uses the standard rules (base + rank, polarity match halves, mismatch +25%) on data from a community source. Aura, exilus, shards and full weapon damage calculation are not included yet. Weapon arcanes are not supported yet.</p></>);
}
