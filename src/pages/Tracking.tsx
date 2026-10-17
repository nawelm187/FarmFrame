import { Pic } from "../ItemArt";
import { useState } from "react";
import { Link } from "react-router-dom";
import { CAT_ONE } from "../lib/catLabel";
import { useT } from "../i18n";
import { readFavs, writeFavs, type Fav } from "../lib/fav";
import { nextTracked } from "../lib/completion";
import { readTracked,trackCounts, trackFilter, writeTracked, type TrackFilter, type Tracked } from "../lib/track";
export default function Tracking() {
  const [list, setList] = useState<Tracked[]>(readTracked), [n, setN] = useState(""), [o, setO] = useState(""), [t, setT] = useState(""), [favs, setFavs] = useState<Fav[]>(readFavs), [f, setF] = useState<TrackFilter>("all"), [q, setQ] = useState(""), [undo, setUndo] = useState<{ i: number; prev: number } | null>(null), tr = useT();
  const commit = (a: Tracked[]) => { setList(a); writeTracked(a); }, cnt = trackCounts(list), shown = trackFilter(list, f, q), set = (i: number, o: number) => commit(list.map((m, j) => (j === i ? { ...m, o } : m)));
  const unfav = (id: string) => { const a = favs.filter(f => f.id !== id); setFavs(a); writeFavs(a); };
  return (<><h1>{tr("tracking")}</h1><p className="lead">{tr("trkLead")}</p>
    {favs.length > 0 && <section aria-label={tr("trkFavs")}><h2>{tr("trkFavs")}</h2><p className="muted">{tr("trkFavNote")}</p>
      <ul className="list">{favs.map(f => <li key={f.id}><span><Pic name={f.name} size={28} /> <Link to={`/${f.cat}/${f.slug}`}>{f.name}</Link> <span className="muted">{tr(CAT_ONE[f.cat])}</span></span><button className="btn" onClick={() => unfav(f.id)}>{tr("remove")}</button></li>)}</ul></section>}
    <h2>{tr("trkTracked")}</h2>
    <div className="bar"><input aria-label={tr("trkName")} placeholder={tr("trkNamePh")} value={n} onChange={e => setN(e.target.value)} />
      <input aria-label={tr("trkOwned")} type="number" min={0} placeholder={tr("trkOwned")} value={o} onChange={e => setO(e.target.value)} style={{ width: "6rem" }} />
      <input aria-label={tr("trkNeeded")} type="number" min={1} placeholder={tr("trkNeeded")} value={t} onChange={e => setT(e.target.value)} style={{ width: "6rem" }} />
      <button className="btn" onClick={() => { const need = +t; if (!n.trim() || !(need > 0)) return; commit([...list, { n: n.trim(), o: +o || 0, t: need }]); setN(""); setO(""); setT(""); }}>{tr("add")}</button></div>
    {!list.length ? <p className="muted">{tr("trkNone")}</p> : <>
      <p className="muted">{cnt.missing ? tr("trkCountMissing", { done: cnt.done, all: cnt.all, n: cnt.missing }) : tr("trkCount", { done: cnt.done, all: cnt.all })}</p>
      <div className="bar"><input aria-label={tr("trkSearch")} placeholder={tr("trkSearch")} value={q} onChange={e => setQ(e.target.value)} />
        <div className="chips" role="group" aria-label={tr("filterLabel")}>{([["all", "fAll"], ["missing", "fMissing"], ["done", "fDone"]] as const).map(([k, l]) => <button key={k} className={"btn" + (f === k ? " on" : "")} aria-pressed={f === k} onClick={() => setF(k)}>{tr(l)} <span className="muted">{cnt[k]}</span></button>)}</div></div>
      {undo && <p className="muted" role="status">{nextTracked(list, undo.i) ? tr("trkMarkedNext", { name: list[undo.i]?.n ?? "", next: nextTracked(list, undo.i) ?? "" }) : tr("trkMarkedLast", { name: list[undo.i]?.n ?? "" })} <button className="btn" onClick={() => { commit(list.map((m, j) => (j === undo.i ? { ...m, o: undo.prev } : m))); setUndo(null); }}>{tr("undo")}</button></p>}
      {!shown.length ? <p className="muted">{tr("trkNoMatch")}</p> : <ul className="list comp">{shown.map(({ t: m, i }) => { const done = m.o >= m.t;
        return <li key={i} className="trow"><span><Pic name={m.n} size={34} /> <b>{m.n}</b> {done && <span className="tag FRESH">{tr("fDone")}</span>}
          <div className="muted">{done ? tr("trkRow", { o: m.o, t: m.t }) : tr("trkRowMissing", { o: m.o, t: m.t, m: m.t - m.o })}{m.from ? ` · ${m.from}` : ""}</div><progress max={m.t} value={Math.min(m.o, m.t)} aria-label={tr("progressOf", { x: m.n })} />
          <div className="chips"><button className="btn" aria-label={tr("oneLess", { x: m.n })} onClick={() => set(i, Math.max(0, m.o - 1))}>−</button><button className="btn" aria-label={tr("oneMore", { x: m.n })} onClick={() => set(i, m.o + 1)}>+</button>
            {!done && <button className="btn" onClick={() => { setUndo({ i, prev: m.o }); set(i, m.t); }}>{tr("trkMarkDone")}</button>}
            {!done && <Link className="btn" to={`/farm/${encodeURIComponent(m.n)}`}>{tr("whereToFarm")}</Link>}<button className="btn" onClick={() => { commit(list.filter((_, j) => j !== i)); setUndo(null); }}>{tr("remove")}</button></div></span></li>; })}</ul>}</>}</>);
}
