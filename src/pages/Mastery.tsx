import { useDeferredValue, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { tp, useT, type Key } from "../i18n";
import { rich } from "../lib/rich";
import { Pic } from "../ItemArt";
import PlanetImg from "../PlanetImg";
import { PageHead, Ring } from "../ui";
import { ALL_GROUPS, groupLabel, groupProgress, itemKey, nextRankHelp, rankFor, rankShort, readMastery, totalPoints, writeMastery } from "../lib/mastery";
import type { MGroup } from "../data/masteryData";
const SECTIONS = [["item", "mrSecItems"], ["starchart", "mrSecStar"], ["steelpath", "mrSecSteel"], ["intrinsic", "mrSecIntr"], ["founder", "mrSecFounders"]] as const;
const sectionOf = (g: MGroup) => (g.id.startsWith("sp-") ? "steelpath" : g.kind);
const HINT = { "k-drive": ["/kdrives", "mrHintKdrives"], necramech: ["/guides", "mrHintNecra"], archwing: ["/guides", "mrHintLaunch"] } as const;
const planetName = (g: MGroup) => g.label.replace(/ \(Steel Path\)$/, "");
/** Mastery Rank checklist: tick what you have maxed, see your rank, what is missing and how to get it. Stored only in this browser. */
export default function Mastery() {
  const t = useT(), [chk, setChk] = useState(readMastery), [sec, setSec] = useState<(typeof SECTIONS)[number][0]>("item"), [open, setOpen] = useState<Record<string, string>>({}), [q, setQ] = useState(""), [only, setOnly] = useState(false), dq = useDeferredValue(q.trim().toLowerCase());
  const groups = useMemo(() => ALL_GROUPS(), []);
  const all = totalPoints(chk, groups.filter(g => g.kind !== "founder")), founders = totalPoints(chk, groups.filter(g => g.kind === "founder")), have = all.have + founders.have, r = rankFor(have), help = nextRankHelp(r.toNext);
  const save = (s: Set<string>) => { setChk(s); writeMastery(s); };
  const toggle = (k: string) => { const s = new Set(chk); if (!s.delete(k)) s.add(k); save(s); };
  const bulk = (gs: MGroup[], on: boolean) => { const s = new Set(chk); for (const g of gs) for (const [n] of g.items) (on ? s.add(itemKey(g.id, n)) : s.delete(itemKey(g.id, n))); save(s); };
  const list = groups.filter(g => sectionOf(g) === sec), cur = list.find(g => g.id === open[sec]) ?? list[0], searching = dq.length >= 2;
  const clearAll = () => { if (chk.size === 0 || window.confirm(t("mrConfirmClear", { n: chk.size.toLocaleString() }))) save(new Set()); };
  const tile = (g: MGroup, n: string, x: number) => { const k = itemKey(g.id, n), on = chk.has(k);
    return (<li key={k} className={"tile" + (on ? " on" : "")}><label className="tl"><input type="checkbox" checked={on} onChange={() => toggle(k)} /><span className="tick" aria-hidden="true">✓</span>
      {g.kind === "item" && <Pic name={n} size={30} />}<span className="tn"><b title={n}>{n}</b><small>{t("mrPts", { n: x.toLocaleString() })}{searching ? ` · ${groupLabel(g)}` : ""}</small></span></label>
      {!on && g.kind === "item" && <Link className="how" to={`/farm/${encodeURIComponent(n)}`} title={t("sfHow", { name: n })} aria-label={t("sfHow", { name: n })}>?</Link>}</li>); };
  const rows = (g: MGroup) => g.items.filter(([n]) => (!searching || n.toLowerCase().includes(dq)) && (!only || !chk.has(itemKey(g.id, n))));
  const hits = searching ? list.map(g => ({ g, rows: rows(g) })).filter(x => x.rows.length) : [];
  const curRows = cur ? rows(cur) : [], cp = cur ? groupProgress(cur, chk) : null, hint = cur ? (HINT as Record<string, readonly [string, Key]>)[cur.id] : undefined;
  return (<><PageHead title={t("mastery")} art={<Ring pct={r.pct} size={64}><b>{r.rank > 30 ? "L" + (r.rank - 30) : r.rank}</b></Ring>}>
      {t("mrIntro")}</PageHead>
    <section className="gcard sec" aria-label={t("mrYourRank")}><header className="sechead"><h2>{r.label}</h2><span className="muted">{t("mrPointsHave", { n: have.toLocaleString() })}{founders.have > 0 ? ` ${t("mrIncludesFounders", { n: founders.have.toLocaleString() })}` : ""}</span></header>
      <progress max={100} value={r.pct} aria-label={t("mrProgress")} /><div className="muted">{t("mrToNext", { pct: r.pct, n: r.toNext.toLocaleString(), rank: rankShort(r.next) })}</div>
      <div className="facts"><div className="fact"><b>{help.frames}</b><span>{t("mrFrames")}</span></div><div className="fact"><b>{help.weapons}</b><span>{t("mrWeapons")}</span></div><div className="fact"><b>{all.left.toLocaleString()}</b><span>{t("mrMissing", { max: all.max.toLocaleString() })}</span></div></div>
      <p className="muted">{t("mrValues")}</p></section>
    <div className="toolbar"><button className="btn sm" onClick={() => bulk(groups.filter(g => g.kind !== "founder"), true)}>{t("mrSelectAll")}</button><button className="btn sm danger" onClick={clearAll}>{t("mrClearAll")}</button>
      <span className="muted">{t("mrTicked", { n: chk.size.toLocaleString() })}</span><span className="grow" />
      <input aria-label={t("mrSearchAria")} placeholder={t("mrSearchPh")} value={q} onChange={e => setQ(e.target.value)} /><label><input type="checkbox" checked={only} onChange={e => setOnly(e.target.checked)} /> {t("mrOnly")}</label></div>
    <div className="chips" role="group" aria-label={t("mrSection")} style={{ marginBottom: ".8rem" }}>{SECTIONS.map(([id, label]) => <button key={id} className={"btn" + (sec === id ? " on" : "")} aria-pressed={sec === id} onClick={() => setSec(id)}>{t(label)}</button>)}</div>
    {!searching && <div className="gsel" role="group" aria-label={t("mrGroup")}>{list.map(g => { const p = groupProgress(g, chk), pc = p.count ? Math.round(100 * p.n / p.count) : 0;
      return (<button key={g.id} className={"gbtn" + (pc >= 100 ? " done" : "")} aria-pressed={cur?.id === g.id} onClick={() => setOpen({ ...open, [sec]: g.id })}>
        <b>{g.kind === "starchart" && <PlanetImg name={planetName(g)} size={22} />} {groupLabel(g)}</b><div className={"mbar" + (pc >= 100 ? " done" : "")}><i style={{ width: pc + "%" }} /></div><small>{p.n}/{p.count} · {p.have.toLocaleString()} / {p.total.toLocaleString()}</small></button>); })}</div>}
    {searching ? (hits.length ? hits.map(({ g, rows: rs }) => <section key={g.id} className="gcard sec" aria-label={groupLabel(g)}><header className="sechead"><h2>{groupLabel(g)}</h2><span className="muted">{tp("mrMatches", rs.length)}</span></header><ul className="cgrid">{rs.map(([n, x]) => tile(g, n, x))}</ul></section>) : <p className="muted">{t("mrNoMatch", { q })}</p>)
      : cur && cp && <section className="gcard sec" aria-label={groupLabel(cur)}><header className="sechead"><h2>{cur.kind === "starchart" && <PlanetImg name={planetName(cur)} size={28} />} {groupLabel(cur)}</h2><span className="muted">{t("mrTickedOf", { n: cp.n, count: cp.count, have: cp.have.toLocaleString(), total: cp.total.toLocaleString() })}</span></header>
        <div className="toolbar"><button className="btn sm" onClick={() => bulk([cur], true)}>{t("mrSelGroup")}</button><button className="btn sm danger" onClick={() => bulk([cur], false)}>{t("mrClearGroup")}</button>{hint && <Link to={hint[0]}>{t(hint[1])}</Link>}</div>
        {curRows.length ? <div className="scrollbox"><ul className="cgrid">{curRows.map(([n, x]) => tile(cur, n, x))}</ul></div> : <p className="muted">{only ? t("mrNoMissing") : t("mrNoGroup")}</p>}</section>}
    <p className="muted">{rich(t("mrSource"), { link: <a href="https://wiki.warframe.com/w/Mastery_Rank/Checklist" target="_blank" rel="noreferrer">{t("mrSourceLink")}</a> })}</p></>);
}
