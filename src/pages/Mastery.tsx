import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pic } from "../ItemArt";
import PlanetImg from "../PlanetImg";
import { PageHead, Ring } from "../ui";
import { ALL_GROUPS, groupProgress, itemKey, nextRankHelp, rankFor, readMastery, totalPoints, writeMastery } from "../lib/mastery";
import type { MGroup } from "../data/masteryData";
const SECTIONS = [["item", "Items"], ["starchart", "Star Chart"], ["steelpath", "Steel Path"], ["intrinsic", "Intrinsics"], ["founder", "Founders"]] as const;
const sectionOf = (g: MGroup) => (g.id.startsWith("sp-") ? "steelpath" : g.kind);
const HINT: Record<string, [string, string]> = { "k-drive": ["/kdrives", "How to get K-Drives"], necramech: ["/guides", "How to build Necramechs"], archwing: ["/guides", "Launcher guides"] };
const planetName = (g: MGroup) => g.label.replace(/ \(Steel Path\)$/, "");
/** Mastery Rank checklist: tick what you have maxed, see your rank, what is missing and how to get it. Stored only in this browser. */
export default function Mastery() {
  const [chk, setChk] = useState(readMastery), [sec, setSec] = useState<(typeof SECTIONS)[number][0]>("item"), [open, setOpen] = useState<Record<string, string>>({}), [q, setQ] = useState(""), [only, setOnly] = useState(false), dq = useDeferredValue(q.trim().toLowerCase());
  const groups = useMemo(() => ALL_GROUPS(), []);
  const all = totalPoints(chk, groups.filter(g => g.kind !== "founder")), founders = totalPoints(chk, groups.filter(g => g.kind === "founder")), have = all.have + founders.have, r = rankFor(have), help = nextRankHelp(r.toNext);
  const save = (s: Set<string>) => { setChk(s); writeMastery(s); };
  const toggle = (k: string) => { const s = new Set(chk); if (!s.delete(k)) s.add(k); save(s); };
  const bulk = (gs: MGroup[], on: boolean) => { const s = new Set(chk); for (const g of gs) for (const [n] of g.items) (on ? s.add(itemKey(g.id, n)) : s.delete(itemKey(g.id, n))); save(s); };
  const list = groups.filter(g => sectionOf(g) === sec), cur = list.find(g => g.id === open[sec]) ?? list[0], searching = dq.length >= 2;
  const clearAll = () => { if (chk.size === 0 || window.confirm(`Clear all ${chk.size.toLocaleString()} ticked items?`)) save(new Set()); };
  const tile = (g: MGroup, n: string, x: number) => { const k = itemKey(g.id, n), on = chk.has(k);
    return (<li key={k} className={"tile" + (on ? " on" : "")}><label className="tl"><input type="checkbox" checked={on} onChange={() => toggle(k)} /><span className="tick" aria-hidden="true">✓</span>
      {g.kind === "item" && <Pic name={n} size={30} />}<span className="tn"><b title={n}>{n}</b><small>{x.toLocaleString()} points{searching ? ` · ${g.label}` : ""}</small></span></label>
      {!on && g.kind === "item" && <Link className="how" to={`/farm/${encodeURIComponent(n)}`} title={`How to get ${n}`} aria-label={`How to get ${n}`}>?</Link>}</li>); };
  const rows = (g: MGroup) => g.items.filter(([n]) => (!searching || n.toLowerCase().includes(dq)) && (!only || !chk.has(itemKey(g.id, n))));
  const hits = searching ? list.map(g => ({ g, rows: rows(g) })).filter(x => x.rows.length) : [];
  const curRows = cur ? rows(cur) : [], cp = cur ? groupProgress(cur, chk) : null, hint = cur ? HINT[cur.id] : undefined;
  return (<><PageHead title="Mastery Rank" art={<Ring pct={r.pct} size={64}><b>{r.rank > 30 ? "L" + (r.rank - 30) : r.rank}</b></Ring>}>
      Mastery Rank (MR) tracks how much of the game you have experienced: you earn points by ranking up Warframes, weapons, companions, K-Drives, Necramechs and Archwings to max level, completing Star Chart nodes and junctions, and ranking up Intrinsics. Tick what you already have and FarmFrame shows your rank and what is missing. MR cannot go up until you complete Vor's Prize.</PageHead>
    <section className="gcard sec" aria-label="Your rank"><div className="sechead"><h2>{r.label}</h2><span className="muted">{have.toLocaleString()} Mastery Points{founders.have > 0 ? ` (includes ${founders.have.toLocaleString()} from Founders items)` : ""}</span></div>
      <progress max={100} value={r.pct} aria-label="Progress to the next rank" /><div className="muted">{r.pct}% · {r.toNext.toLocaleString()} points to {r.next > 30 ? `Legendary ${r.next - 30}` : `MR ${r.next}`}</div>
      <div className="facts"><div className="fact"><b>{help.frames}</b><span>Warframes (6,000 each) to the next rank</span></div><div className="fact"><b>{help.weapons}</b><span>Weapons (3,000 each) to the next rank</span></div><div className="fact"><b>{all.left.toLocaleString()}</b><span>Points still missing of {all.max.toLocaleString()}</span></div></div>
      <p className="muted">Most weapons give 3,000, Warframes, companions and K-Drives 6,000, Necramechs 8,000. Items only count once they reach their maximum level. Every rank after MR 30 is a Legendary Rank.</p></section>
    <div className="toolbar"><button className="btn sm" onClick={() => bulk(groups.filter(g => g.kind !== "founder"), true)}>Select everything</button><button className="btn sm danger" onClick={clearAll}>Clear everything</button>
      <span className="muted">{chk.size.toLocaleString()} ticked</span><span className="grow" />
      <input aria-label="Search the checklist" placeholder="Search this section" value={q} onChange={e => setQ(e.target.value)} /><label><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} /> Only what I am missing</label></div>
    <div className="chips" role="group" aria-label="Section" style={{ marginBottom: ".8rem" }}>{SECTIONS.map(([id, label]) => <button key={id} className={"btn" + (sec === id ? " on" : "")} aria-pressed={sec === id} onClick={() => setSec(id)}>{label}</button>)}</div>
    {!searching && <div className="gsel" role="group" aria-label="Group">{list.map(g => { const p = groupProgress(g, chk), pc = p.count ? Math.round(100 * p.n / p.count) : 0;
      return (<button key={g.id} className={"gbtn" + (pc >= 100 ? " done" : "")} aria-pressed={cur?.id === g.id} onClick={() => setOpen({ ...open, [sec]: g.id })}>
        <b>{g.kind === "starchart" && <PlanetImg name={planetName(g)} size={22} />} {g.label}</b><div className={"mbar" + (pc >= 100 ? " done" : "")}><i style={{ width: pc + "%" }} /></div><small>{p.n}/{p.count} · {p.have.toLocaleString()} / {p.total.toLocaleString()}</small></button>); })}</div>}
    {searching ? (hits.length ? hits.map(({ g, rows: rs }) => <section key={g.id} className="gcard sec" aria-label={g.label}><div className="sechead"><h2>{g.label}</h2><span className="muted">{rs.length} match{rs.length === 1 ? "" : "es"}</span></div><ul className="cgrid">{rs.map(([n, x]) => tile(g, n, x))}</ul></section>) : <p className="muted">Nothing matches "{q}" in this section.</p>)
      : cur && cp && <section className="gcard sec" aria-label={cur.label}><div className="sechead"><h2>{cur.kind === "starchart" && <PlanetImg name={planetName(cur)} size={28} />} {cur.label}</h2><span className="muted">{cp.n}/{cp.count} ticked · {cp.have.toLocaleString()} / {cp.total.toLocaleString()} points</span></div>
        <div className="toolbar"><button className="btn sm" onClick={() => bulk([cur], true)}>Select all in this group</button><button className="btn sm danger" onClick={() => bulk([cur], false)}>Clear this group</button>{hint && <Link to={hint[0]}>{hint[1]}</Link>}</div>
        {curRows.length ? <div className="scrollbox"><ul className="cgrid">{curRows.map(([n, x]) => tile(cur, n, x))}</ul></div> : <p className="muted">{only ? "Nothing missing here." : "Nothing in this group."}</p>}</section>}
    <p className="muted">Source: <a href="https://wiki.warframe.com/w/Mastery_Rank/Checklist" target="_blank" rel="noreferrer">Warframe Wiki, Mastery Rank Checklist</a>, read from the page version saved on 2026-10-04 by the project owner. Each group adds up to the totals printed on that page, and the grand total only reaches the wiki's maximum of 3,213,138 if Steel Path nodes are worth the same as the normal Star Chart, so they are listed that way. New items appear here after the next data update.</p></>);
}
