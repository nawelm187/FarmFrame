import { Pic } from "../ItemArt";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CATS } from "../lib/catalog";
import { readFavs, writeFavs, type Fav } from "../lib/fav";
import { readTracked, trackCounts, trackFilter, writeTracked, type TrackFilter, type Tracked } from "../lib/track";
export default function Tracking() {
  const [list, setList] = useState<Tracked[]>(readTracked), [n, setN] = useState(""), [o, setO] = useState(""), [t, setT] = useState(""), [favs, setFavs] = useState<Fav[]>(readFavs), [f, setF] = useState<TrackFilter>("all"), [q, setQ] = useState(""), [undo, setUndo] = useState<{ i: number; prev: number } | null>(null);
  const commit = (a: Tracked[]) => { setList(a); writeTracked(a); }, cnt = trackCounts(list), shown = trackFilter(list, f, q), set = (i: number, o: number) => commit(list.map((m, j) => (j === i ? { ...m, o } : m)));
  const unfav = (id: string) => { const a = favs.filter(f => f.id !== id); setFavs(a); writeFavs(a); };
  return (<><h1>Tracking</h1><p className="lead">How many of each item you have, and where it came from. Stored only in this browser.</p>
    {favs.length > 0 && <section aria-label="Favorites"><h2>Favorites</h2><p className="muted">Saved for quick access. A favorite is not tracked or owned.</p>
      <ul className="list">{favs.map(f => <li key={f.id}><span><Pic name={f.name} size={28} /> <Link to={`/${f.cat}/${f.slug}`}>{f.name}</Link> <span className="muted">{CATS[f.cat].label.replace(/s$/, "")}</span></span><button className="btn" onClick={() => unfav(f.id)}>Remove</button></li>)}</ul></section>}
    <h2>Tracked items</h2>
    <div className="bar"><input aria-label="Name" placeholder="Item or resource name" value={n} onChange={e => setN(e.target.value)} />
      <input aria-label="Owned" type="number" min={0} placeholder="Owned" value={o} onChange={e => setO(e.target.value)} style={{ width: "6rem" }} />
      <input aria-label="Needed" type="number" min={1} placeholder="Needed" value={t} onChange={e => setT(e.target.value)} style={{ width: "6rem" }} />
      <button className="btn" onClick={() => { const need = +t; if (!n.trim() || !(need > 0)) return; commit([...list, { n: n.trim(), o: +o || 0, t: need }]); setN(""); setO(""); setT(""); }}>Add</button></div>
    {!list.length ? <p className="muted">No tracked items yet. Add something you need and FarmFrame will show where to farm it.</p> : <>
      <p className="muted">{cnt.done} of {cnt.all} complete{cnt.missing ? `, ${cnt.missing} still missing` : ""}.</p>
      <div className="bar"><input aria-label="Search tracked items" placeholder="Search tracked items" value={q} onChange={e => setQ(e.target.value)} />
        <div className="chips" role="group" aria-label="Filter">{([["all", "All"], ["missing", "Missing"], ["done", "Complete"]] as const).map(([k, t]) => <button key={k} className={"btn" + (f === k ? " on" : "")} aria-pressed={f === k} onClick={() => setF(k)}>{t} <span className="muted">{cnt[k]}</span></button>)}</div></div>
      {undo && <p className="muted" role="status">Marked {list[undo.i]?.n} complete. <button className="btn" onClick={() => { commit(list.map((m, j) => (j === undo.i ? { ...m, o: undo.prev } : m))); setUndo(null); }}>Undo</button></p>}
      {!shown.length ? <p className="muted">Nothing matches this filter.</p> : <ul className="list comp">{shown.map(({ t: m, i }) => { const done = m.o >= m.t;
        return <li key={i}><span><Pic name={m.n} size={30} /> <b>{m.n}</b> {done && <span className="tag FRESH">Complete</span>}
          <div className="muted">{m.o} of {m.t}{done ? "" : `, missing ${m.t - m.o}`}{m.from ? ` · ${m.from}` : ""}</div><progress max={m.t} value={Math.min(m.o, m.t)} aria-label={`${m.n} progress`} />
          <div className="chips"><button className="btn" aria-label={`One less ${m.n}`} onClick={() => set(i, Math.max(0, m.o - 1))}>−</button><button className="btn" aria-label={`One more ${m.n}`} onClick={() => set(i, m.o + 1)}>+</button>
            {!done && <button className="btn" onClick={() => { setUndo({ i, prev: m.o }); set(i, m.t); }}>Mark complete</button>}
            {!done && <Link className="btn" to={`/farm/${encodeURIComponent(m.n)}`}>Farm</Link>}<button className="btn" onClick={() => { commit(list.filter((_, j) => j !== i)); setUndo(null); }}>Remove</button></div></span></li>; })}</ul>}</>}</>);
}
