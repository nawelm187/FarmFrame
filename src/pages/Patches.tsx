import { useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { readBuilds } from "../lib/build";
import { useMany } from "../lib/data";
import { readGoals } from "../lib/goals";
import { PATCH_ALT, PATCH_SRC, PATCH_URL, PATCH_WINDOW, matchPatch, parsePatches, patchTypes, type Patch } from "../lib/patchlogs";
import { summarize, tally, touches, type Change } from "../lib/patchsummary";
import { readReqs } from "../lib/reqs";
import { readTracked } from "../lib/track";
import { useCatalogs } from "../lib/useCatalog";
import { Panel, Skeleton, Unavailable } from "./parts";
import { tp, useT } from "../i18n";
const SHOW = 12;
const GOOD = { buff: "pchBuff", nerf: "pchNerf", change: "pchChange" } as const;
const ARROW: Record<Change["good"], [string, string]> = { buff: ["▲", "FRESH"], nerf: ["▼", "ERROR"], change: ["●", "UNAVAILABLE"] };
const groups = (cs: Change[], mine: Set<string>) => { const m = new Map<string, Change[]>(); for (const c of cs) m.set(c.subject, [...(m.get(c.subject) ?? []), c]);
  return [...m].map(([subject, items]) => ({ subject, items })).sort((a, b) => Number(b.items.some(c => touches(c, mine))) - Number(a.items.some(c => touches(c, mine))) || b.items.length - a.items.length); };
const fmt = (c: Change) => (c.from != null && c.to != null ? `${c.from}${c.unit} → ${c.to}${c.unit}` : "");
function Entry({ p, open, mine, link }: { p: Patch; open?: boolean; mine: Set<string>; link: (name: string) => string | null }) {
  const tr = useT(), s = useMemo(() => summarize(p), [p]), ty = tally(s.changes), hits = [...s.changes, ...s.statFixes].filter(c => touches(c, mine)).length;
  return (<details className="panel patch" open={open}>
    <summary><b>{p.name}</b> <span className="tag">{p.type}</span> <span className="muted">{new Date(p.date).toLocaleDateString()}</span>
      {ty.buff > 0 && <span className="tag FRESH"> ▲ {ty.buff}</span>}{ty.nerf > 0 && <span className="tag ERROR"> ▼ {ty.nerf}</span>}{ty.change > 0 && <span className="tag UNAVAILABLE"> ● {ty.change}</span>}
      {hits > 0 && <span className="tag STALE"> {tr("pchTouches")}</span>}</summary>
    {s.changes.length > 0 ? <div>{groups(s.changes, mine).map(g => <section key={g.subject} className="chgroup"><h4>{link(g.subject) ? <Link to={link(g.subject)!}>{g.subject}</Link> : g.subject} <span className="muted">{g.items.length}</span></h4>
      <ul className="chg">{g.items.slice(0, 8).map((c, i) => { const [a, tag] = ARROW[c.good], me = touches(c, mine);
        return <li key={i} title={c.text}><span className={"tag " + tag}>{a} {tr(GOOD[c.good])}</span> {c.stat && <span className="muted">{c.stat} </span>}{fmt(c) && <b>{fmt(c)} </b>}{me && <span className="gold"> ★ {me}</span>}<div className="muted chgtxt">{c.text}</div></li>; })}</ul>
      {g.items.length > 8 && <details><summary className="muted">{tr("pchMoreN", { n: g.items.length - 8 })}</summary><ul className="chg">{g.items.slice(8).map((c, i) => <li key={i}><span className={"tag " + ARROW[c.good][1]}>{ARROW[c.good][0]} {tr(GOOD[c.good])}</span> <span className="muted chgtxt">{c.text}</span></li>)}</ul></details>}</section>)}</div>
      : <p className="muted">{tr("pchNoStats")}</p>}
    {s.statFixes.length > 0 && <><h4>{tr("pchFixStats")} <span className="muted">{s.statFixes.length}</span></h4>
      <ul className="chg">{s.statFixes.slice(0, 12).map((c, i) => { const me = touches(c, mine), l = c.subject !== "General" ? link(c.subject) : null;
        return <li key={i} title={c.text}><span className="tag FRESH">✔ {tr("pchFix")}</span> {l ? <Link to={l}>{c.subject}</Link> : c.subject !== "General" && <b>{c.subject}</b>} <span className="muted">{c.stat} </span>{fmt(c) && <b>{fmt(c)} </b>}{me && <span className="gold"> ★ {me}</span>}<div className="muted chgtxt">{c.text}</div></li>; })}</ul>
      {s.statFixes.length > 12 && <details><summary className="muted">{tr("pchMoreN", { n: s.statFixes.length - 12 })}</summary><ul className="chg">{s.statFixes.slice(12).map((c, i) => <li key={i}><span className="tag FRESH">✔ {tr("pchFix")}</span> <span className="muted chgtxt">{c.text}</span></li>)}</ul></details>}</>}
    {s.additions.length > 0 && <><h4>{tr("pchNew")}</h4><ul className="sub">{s.additions.map((a, i) => <li key={i}>{a}</li>)}</ul></>}
    {s.fixes > 0 && <p className="muted">{s.statFixes.length ? tp("pchFixB", s.fixes, { m: s.statFixes.length }) : tp("pchFixA", s.fixes)}</p>}
    <details><summary className="muted">{tr("pchFull")}</summary>
      {(["additions", "changes", "fixes"] as const).map(k => p[k] ? <div key={k}><h4>{tr(k === "additions" ? "pchAdditions" : k === "changes" ? "pchChanges" : "pchFixesH")}</h4><div className="patchtext">{p[k]}</div></div> : null)}</details>
    {p.url ? <p><a href={p.url} target="_blank" rel="noopener noreferrer">{tr("pchOpen")}</a></p> : <p className="muted">{tr("pchNoLink")}</p>}
  </details>);
}
export default function Patches() {
  const tr = useT(), [r] = useMany([{ id: "patchlogs", file: "", url: PATCH_URL, alt: PATCH_ALT, src: PATCH_SRC, win: PATCH_WINDOW }]);
  const [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", type = sp.get("type") ?? "", onlyMine = sp.get("mine") === "1", [more, setMore] = useState(1);
  const cat = useCatalogs(["warframe", "weapon", "mod"]);
  const data = useMemo(() => parsePatches(r.rec?.data), [r.rec?.data]);
  // Names of everything the player has set up: build and goal names, tracked items, build requirements and the mods slotted in builds.
  const { mine, links } = useMemo(() => {
    const m = new Set<string>(), l = new Map<string, string>(), mods = new Map((cat.mod?.items ?? []).map(e => [e.slug, e.name]));
    for (const c of ["warframe", "weapon"] as const) for (const e of cat[c]?.items ?? []) l.set(e.name.toLowerCase(), `/${c}/${e.slug}`);
    for (const e of cat.mod?.items ?? []) l.set(e.name.toLowerCase(), `/mod/${e.slug}`);
    for (const b of readBuilds()) { m.add(b.name.toLowerCase()); if (b.frame) m.add(b.frame.toLowerCase()); for (const s of b.slots) if (s.mod && mods.get(s.mod)) m.add(mods.get(s.mod)!.toLowerCase()); for (const a of b.arcanes ?? []) if (a.mod) m.add(a.mod.toLowerCase()); }
    for (const g of readGoals()) m.add(g.name.toLowerCase()); for (const t of readTracked()) m.add(t.n.toLowerCase()); for (const x of readReqs()) m.add(x.name.toLowerCase());
    return { mine: m, links: l };
  }, [cat.mod?.items, cat.warframe?.items, cat.weapon?.items]);
  const link = (n: string) => links.get(n.toLowerCase()) ?? null;
  const list = useMemo(() => (data?.patches ?? []).filter(p => (!type || p.type === type) && matchPatch(p, q) && (!onlyMine || (() => { const x = summarize(p); return [...x.changes, ...x.statFixes].some(c => touches(c, mine)); })())), [data, q, type, onlyMine, mine]);
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); setMore(1); };
  return (<><h1>{tr("pchTitle")}</h1>
    <p className="lead">{tr("pchLead")}</p>
    {!data ? (r.status === "LOADING" ? <Skeleton /> : <Unavailable title={tr("pchTitle")} art="Patch notes" status={r.status === "FRESH" ? "ERROR" : r.status} why={r.rec?.data != null ? tr("pchBadFormat") : tr("pchLoadFail")} rec={r.rec} />) : (<>
      <div className="bar"><input aria-label={tr("pchSearchAria")} placeholder={tr("pchSearchPh")} value={q} onChange={e => set("q", e.target.value)} />
        <select aria-label={tr("fmType")} value={type} onChange={e => set("type", e.target.value)}><option value="">{tr("rsAllTypes")}</option>{patchTypes(data.patches).map(t => <option key={t}>{t}</option>)}</select>
        <label className="muted"><input type="checkbox" checked={onlyMine} onChange={e => set("mine", e.target.checked ? "1" : "")} /> {tr("pchOnlyMine")}</label></div>
      <p className="muted">{tr("pchLegend", { n: list.length, total: data.patches.length, skipped: data.skipped ? " · " + tr("pchSkipped", { n: data.skipped }) : "" })}</p>
      {list.length === 0 ? <p className="muted">{tr("pchNone")}</p> : list.slice(0, SHOW * more).map((p, i) => <Entry key={p.date + p.name} p={p} open={i === 0 && !q && !type && !onlyMine} mine={mine} link={link} />)}
      {list.length > SHOW * more && <button className="btn" onClick={() => setMore(more + 1)}>{tr("pchShowMore")}</button>}
      <Panel title={tr("pchDataSource")} status={r.status} rec={r.rec}><span className="muted">{tr("pchUpdated", { src: PATCH_SRC })}</span></Panel></>)}
  </>);
}
