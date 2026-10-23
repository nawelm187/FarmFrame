import { useState } from "react";
import { Link } from "react-router-dom";
import { Pic } from "../ItemArt";
import { advise, rankActivities } from "../lib/advisor";
import type { Cat, Entity } from "../lib/catalog";
import { completionNote, type CompletionNote } from "../lib/completion";
import { goalId, readGoals, readOwned, writeGoals, writeOwned } from "../lib/goals";
import { useCatalogs } from "../lib/useCatalog";
import { useFarmNow } from "../lib/useFarmNow";
import { Ring } from "../ui";
import MissingList from "../MissingList";
import { allStats, useMany } from "../lib/data";
import { FIND, collect } from "../lib/drops";
import { trustLine } from "../lib/freshness";
import { itemAdvice, sourceWhy } from "../lib/itemAdvice";
import { isTracked, readTracked, writeTracked } from "../lib/track";
import { useNeeded } from "../lib/useNeeded";
import { READY_LABEL } from "../lib/unlock";
import { Skeleton } from "./parts";
import { t as tt, useT } from "../i18n";
const ALL = FIND.map(f => ({ id: f.id, file: f.file }));
/** Any single item (mod, resource, part): the best verified places to get it, why, and a way to track how many you need. */
function ItemPlan({ name, onClose }: { name: string; onClose: () => void }) {
  const tr = useT();
  const res = useMany(ALL), { rows, ok } = collect(FIND.map((f, i) => ({ f, rec: res[i].rec, status: res[i].status })));
  const needed = useNeeded(), [qty, setQty] = useState(1), [tracked, setTracked] = useState(() => isTracked(readTracked(), name));
  const adv = ok > 0 ? itemAdvice(rows, name, needed) : null;
  const track = () => { const a = readTracked(); if (!isTracked(a, name)) writeTracked([...a, { n: name, o: 0, t: Math.max(1, qty), from: tr("advFrom") }]); setTracked(true); };
  return (<div className="adv"><div className="row"><h3>{name}</h3><button className="btn" onClick={onClose}>{tr("close")}</button></div>
    {!adv ? <p className="muted">{tr("saReadingDrops")}</p> : !adv.sources.length ? <p className="muted">{tr("advNoDrop")} <Link to={`/farm/${encodeURIComponent(name)}`}>{tr("advCheckAll")}</Link></p>
      : <><h3>{tr("advBestPlaces")}</h3><ol className="opps">{adv.sources.map((s, i) => <li key={s.row.where + i}>{i === 0 && <span className="tag FRESH">{tr("saBestOption")}</span>} <b>{s.row.where}</b>{s.row.rot ? " · " + tr("saRotation", { rot: s.row.rot }) : ""}<div className="muted">{sourceWhy(s)} · {s.row.src}</div></li>)}</ol>
        {!adv.exact && <p className="muted">{tr("saPartial")}</p>}<Link to={`/farm/${encodeURIComponent(name)}`}>{tr("saSeeAll")}</Link></>}
    <div className="bar">{tracked ? <span className="tag FRESH">{tr("advTracked")} <Link to="/tracking">{tr("advOpenTracking")}</Link></span> : <><input aria-label={tr("advHowMany")} type="number" min={1} value={qty} onChange={e => setQty(+e.target.value || 1)} style={{ width: "6rem" }} /><button className="btn" onClick={track}>{tr("advTrackBtn")}</button></>}</div></div>);
}
const GROUP_TAG = { now: "advTagNow", next: "advTagNext", blocked: "advTagBlocked" } as const;
/** "I want X": pick or search something, and get what is missing, what to do now, why, how far along you are and what comes next. */
export default function Advisor() {
  const tr = useT();
  const fn = useFarmNow(), ex = fn.exact, cat = useCatalogs(["warframe", "weapon"]), [q, setQ] = useState(""), [sel, setSel] = useState<string | null>(null), [, bump] = useState(0), [note, setNote] = useState<CompletionNote | null>(null), [other, setOther] = useState<string | null>(null);
  const term = q.trim().toLowerCase();
  const pool = (["warframe", "weapon"] as const).flatMap(c => (cat[c]?.items ?? []).filter(e => e.components.length > 0).map(e => ({ c: c as Cat, e })));
  const results = term.length < 2 ? [] : pool.filter(x => x.e.name.toLowerCase().includes(term)).sort((a, b) => Number(!a.e.name.toLowerCase().startsWith(term)) - Number(!b.e.name.toLowerCase().startsWith(term)) || a.e.name.localeCompare(b.e.name)).slice(0, 6);
  const add = (c: Cat, e: Entity) => { const a = readGoals(), id = goalId(c, e.slug); if (!a.some(g => g.id === id)) writeGoals([...a, { id, cat: c, slug: e.slug, name: e.name }]); setSel(id); setQ(""); bump(n => n + 1); };
  const cur = ex.goals.find(g => g.id === sel) ?? ex.goals[0], a = cur ? advise(cur.id, cur.name, ex.plans, ex.info.find(i => i.goal.id === cur.id), ex.fis.data, ex.mine, !!ex.relics) : null;
  /** Sets how many of a part the user has, and reports it when that completes the part. */
  const setPart = (goal: string, comps: Entity["components"], goalName: string, part: string, v: number) => {
    const all = readOwned(), before = all[goal] ?? {}, after = { ...before, [part]: v }; writeOwned({ ...all, [goal]: after });
    setNote(completionNote(goal, goalName, comps, before, after, part)); bump(n => n + 1);
  };
  const comps = cur ? cat[cur.cat]?.items?.find(e => e.slug === cur.slug)?.components : undefined;
  const got = () => { if (cur && comps && a?.focus) setPart(cur.id, comps, cur.name, a.focus.partName, a.focus.count); };
  const undoGot = () => { if (cur && comps && note) { setPart(cur.id, comps, cur.name, note.part, note.prev); setNote(null); } };
  const trust = trustLine([{ label: tr("fissures"), status: ex.fis.status, rec: ex.fis.rec, drift: allStats().get("fissures")?.drift }, { label: tr("advRelicTables"), status: ex.relics ? "FRESH" : ex.relicStatus, rec: ex.relicRec, drift: allStats().get("relics")?.drift }]);
  const acts = rankActivities(fn.opps).slice(0, 3);
  return (<section className="gcard advisor" aria-label={tr("advWhat")}>
    <h2>{tr("advWhat")}</h2>
    <div className="bar"><input aria-label={tr("advSearchAria")} placeholder={tr("advSearchPh")} value={q} onChange={e => setQ(e.target.value)} /></div>
    {term.length >= 2 && <div className="chips"><button className="btn" onClick={() => { setOther(q.trim()); setQ(""); }}>{tr("advFindSources", { q: q.trim() })}</button></div>}
    {other && <ItemPlan key={other} name={other} onClose={() => setOther(null)} />}
    {term.length >= 2 && !results.length && <p className="muted">{cat.warframe?.items && cat.weapon?.items ? tr("advNoMatch") : tr("advLoadingCat")}</p>}
    {results.length > 0 && <ul className="list" aria-label={tr("advResults")}>{results.map(({ c, e }) => <li key={c + e.slug}><span><Pic name={e.name} size={28} /> {e.name} <span className="muted">{c === "warframe" ? tr("catWarframe") : tr("catWeapon")}</span></span><button className="btn" onClick={() => add(c, e)}>{tr("saWantBtn")}</button></li>)}</ul>}
    {ex.goals.length > 1 && <div className="chips" role="group" aria-label={tr("goalsTitle")}>{ex.goals.map(g => <button key={g.id} className={"btn" + (g.id === cur?.id ? " on" : "")} aria-pressed={g.id === cur?.id} onClick={() => setSel(g.id)}>{g.name}</button>)}</div>}
    {note && <p className="tag FRESH" role="status">✓ {note.text} <button className="btn" onClick={undoGot}>{tr("undo")}</button></p>}
    {ex.pending && <Skeleton />}
    {!cur ? (other ? null : <p className="muted">{tr("advPick")}</p>) : !a ? null
      : a.status === "done" ? <p className="gold">{tr("advComplete", { goal: a.goal, have: a.have, total: a.total })}</p>
      : a.status === "nodata" ? <p className="muted">{tr("advNoParts", { goal: a.goal })}</p>
      : <div className="adv">
        <div className="hud"><Ring pct={a.pct} size={84}><Pic name={a.goal} size={44} /></Ring><div><h3>{a.goal}</h3><div className="muted">{tr("advProgress", { have: a.have, total: a.total, n: a.missing.length })}</div></div></div>
        {a.focus && <div className={"acard" + (a.focus.group === "now" ? " now" : "")}><span className="tx"><span className={"kicker" + (a.focus.group === "now" ? " now" : "")}>{tr(GROUP_TAG[a.focus.group])}</span><b>{a.focus.part}</b><span className="muted">{a.focus.action.text}</span>
          {a.focus.action.to && <Link to={a.focus.action.to}>{a.focus.action.kind === "open" ? tr("openFarmPlan") : tr("advFindSrc")}</Link>}
          <button className="btn" onClick={got}>{tr("advGotIt")}</button></span></div>}
        <details open><summary>{tr("advWhy")}</summary><ul>{a.why.map(w => <li key={w}>{w}</li>)}</ul></details>
        {a.missing.length > 1 && <><h3>{tr("advEverything")}</h3><MissingList items={a.missing} /></>}
        {acts.length > 0 && <><h3>{tr("advBestAct")}</h3><ul className="list">{acts.map((x, i) => <li key={x.opp.key}><span><b>{x.opp.title}</b>{i === 0 && x.ready === "ready" && <span className="tag FRESH"> {tr("saBest")}</span>}<span className="tag"> {READY_LABEL[x.ready]}</span><div className="muted">{x.reasons.join(" · ")}</div>{x.blocks.map(b => <div key={b.text} className="muted">{b.severity === "blocked" ? tr("saNeeds") : tr("saCheck")} {b.text}</div>)}</span><Link className="btn" to={x.opp.kind === "fissure" ? "/fissures" : "/invasions"}>{tr("advOpen")}</Link></li>)}</ul></>}
        <p className={trust.warn ? "tag STALE" : "muted"}>{trust.warn ?? tr("saBasedOn", { list: trust.lines.join(" · ") })} <Link to="/sources">{tr("dataSources")}</Link></p>
        {a.after ? <p className="muted"><b>{tr("advAfter")}</b> {a.after}</p> : <p className="muted"><b>{tr("advAfter")}</b> {tr("advAfterDone", { goal: a.goal })}</p>}
      </div>}
  </section>);
}
