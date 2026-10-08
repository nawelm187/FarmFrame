import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Pic } from "../ItemArt";
import { ALL_GROUPS, groupProgress, itemKey, nextRankHelp, rankFor, readMastery, totalPoints, writeMastery } from "../lib/mastery";
import type { MGroup } from "../data/masteryData";
const SECTIONS = [["item", "Items"], ["starchart", "Star Chart"], ["steelpath", "Steel Path"], ["intrinsic", "Intrinsics"], ["founder", "Founders"]] as const;
const sectionOf = (g: MGroup) => (g.id.startsWith("sp-") ? "steelpath" : g.kind);
const HINT: Record<string, [string, string]> = { "k-drive": ["/kdrives", "How to get K-Drives"], necramech: ["/guides#necramech", "How to build Necramechs"], archwing: ["/guides", "Launcher guides"] };
/** Mastery Rank checklist: tick what you have maxed, see your rank, what is missing and how to get it. Stored only in this browser. */
export default function Mastery() {
  const [chk, setChk] = useState(readMastery), [sec, setSec] = useState<(typeof SECTIONS)[number][0]>("item"), [open, setOpen] = useState<string | null>(null), [q, setQ] = useState(""), [only, setOnly] = useState(false), dq = useDeferredValue(q.trim().toLowerCase());
  const groups = useMemo(() => ALL_GROUPS(), []);
  const all = totalPoints(chk, groups.filter(g => g.kind !== "founder")), founders = totalPoints(chk, groups.filter(g => g.kind === "founder")), have = all.have + founders.have, r = rankFor(have), help = nextRankHelp(r.toNext);
  const save = (s: Set<string>) => { setChk(s); writeMastery(s); };
  const toggle = (k: string) => { const s = new Set(chk); if (!s.delete(k)) s.add(k); save(s); };
  const bulk = (g: MGroup, on: boolean) => { const s = new Set(chk); for (const [n] of g.items) (on ? s.add(itemKey(g.id, n)) : s.delete(itemKey(g.id, n))); save(s); };
  const list = groups.filter(g => sectionOf(g) === sec);
  return (<><h1>Mastery Rank</h1>
    <p className="lead">Mastery Rank (MR) tracks how much of the game you have experienced: you earn points by ranking up Warframes, weapons, companions, K-Drives, Necramechs and Archwings to max level, by completing Star Chart nodes and junctions, and by ranking up Intrinsics. Tick what you already have and FarmFrame shows your rank and what is missing. Mastery Rank cannot go up until you complete Vor's Prize.</p>
    <section className="gcard" aria-label="Your rank"><h2>{r.label}</h2>
      <div className="muted">{have.toLocaleString()} Mastery Points{founders.have > 0 ? ` (includes ${founders.have.toLocaleString()} from Founders items)` : ""}</div>
      <progress max={100} value={r.pct} aria-label="Progress to the next rank" /> <span className="muted">{r.pct}% · {r.toNext.toLocaleString()} points to {r.next > 30 ? `Legendary ${r.next - 30}` : `MR ${r.next}`}</span>
      <p>That is about <b>{help.frames}</b> Warframe{help.frames === 1 ? "" : "s"} (6,000 each) or <b>{help.weapons}</b> weapon{help.weapons === 1 ? "" : "s"} (3,000 each) fully ranked. Most weapons give 3,000, Warframes, companions and K-Drives 6,000, Necramechs 8,000. Every rank after MR 30 is a Legendary Rank.</p>
      <p className="muted">{all.left.toLocaleString()} points still missing out of {all.max.toLocaleString()} (the wiki's maximum for non-founders). Items only count once they reach their maximum level.</p></section>
    <div className="chips" role="group" aria-label="Section">{SECTIONS.map(([id, label]) => <button key={id} className={"btn" + (sec === id ? " on" : "")} aria-pressed={sec === id} onClick={() => { setSec(id); setOpen(null); }}>{label}</button>)}</div>
    <div className="bar"><input aria-label="Search the checklist" placeholder="Search by name" value={q} onChange={e => setQ(e.target.value)} /><label><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} /> Show only what I am missing</label></div>
    {list.map(g => { const p = groupProgress(g, chk), isOpen = open === g.id || (dq.length >= 2), rows = isOpen ? g.items.filter(([n]) => (!dq || n.toLowerCase().includes(dq)) && (!only || !chk.has(itemKey(g.id, n)))) : [], hint = HINT[g.id];
      if (dq.length >= 2 && !rows.length) return null;
      return (<section key={g.id} className="gcard" aria-label={g.label}>
        <button className="btn" aria-expanded={isOpen} onClick={() => setOpen(open === g.id ? null : g.id)}>{isOpen ? "▾" : "▸"} {g.label} <span className="muted">{p.n}/{p.count} · {p.have.toLocaleString()} / {p.total.toLocaleString()}</span></button>
        {isOpen && <>
          <div className="bar"><button className="btn" onClick={() => bulk(g, true)}>Select all</button><button className="btn" onClick={() => bulk(g, false)}>Clear all</button>{hint && <Link to={hint[0]}>{hint[1]}</Link>}</div>
          <ul className="list">{rows.map(([n, x]) => { const k = itemKey(g.id, n), on = chk.has(k);
            return (<li key={k}><label><input type="checkbox" checked={on} onChange={() => toggle(k)} /> {g.kind === "item" && <Pic name={n} size={24} />} {n}</label>
              <span className="muted">{x.toLocaleString()}</span>{!on && g.kind === "item" && <Link to={`/farm/${encodeURIComponent(n)}`}>How to get it</Link>}</li>); })}
            {!rows.length && <li className="muted">{only ? "Nothing missing here." : "Nothing matches."}</li>}</ul></>}
      </section>); })}
    <p className="muted">Source: <a href="https://wiki.warframe.com/w/Mastery_Rank/Checklist" target="_blank" rel="noreferrer">Warframe Wiki, Mastery Rank Checklist</a>, read from the page version saved on 2026-10-04 by the project owner. Each group adds up to the totals printed on that page, and the grand total only reaches the wiki's maximum of 3,213,138 if Steel Path nodes are worth the same as the normal Star Chart, so they are listed that way. New items appear here after the next data update.</p></>);
}
