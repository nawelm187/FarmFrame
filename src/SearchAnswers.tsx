import { useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import { rankActivities } from "./lib/advisor";
import { goalId, readGoals, writeGoals } from "./lib/goals";
import { allStats, useMany } from "./lib/data";
import { FIND, collect } from "./lib/drops";
import { trustLine } from "./lib/freshness";
import { itemAdvice, sourceWhy } from "./lib/itemAdvice";
import { PATCH_ALT, PATCH_SRC, PATCH_URL, PATCH_WINDOW, parsePatches } from "./lib/patchlogs";
import { useFarmNow } from "./lib/useFarmNow";
import { READY_LABEL } from "./lib/unlock";
import { useNeeded } from "./lib/useNeeded";
import { vendorSources } from "./lib/vendorSources";
import type { Method } from "./data/methods";
import { methodsFor } from "./lib/methods";
const Card = ({ title, children }: { title: string; children: ReactNode }) => <section className="answer" aria-live="polite" aria-label={title}><h3>{title}</h3>{children}</section>;
/** "What should I farm?": the best activity running now for the person's own goals, where it is, why it is first, and what else is running. */
export function NowAnswer({ go }: { go: () => void }) {
  const fn = useFarmNow(), ex = fn.exact;
  if (!fn.goals) return <Card title="What to farm now"><p>I rank what is running right now by how much it helps what you want to get, and you have not picked anything yet.</p><Link to="/farm" onClick={go}>Pick what you want to get</Link></Card>;
  if (ex.pending) return <Card title="What to farm now"><p className="muted">Reading your goals and the live fissures…</p></Card>;
  const acts = rankActivities(fn.opps), trust = trustLine([{ label: "Fissures", status: ex.fis.status, rec: ex.fis.rec, drift: allStats().get("fissures")?.drift }]);
  const note = <p className={trust.warn ? "tag STALE" : "muted"}>{trust.warn ?? `Based on: ${trust.lines.join(" · ")}.`}</p>;
  if (!acts.length) return <Card title="What to farm now"><p>Nothing running right now advances your {fn.goals} goal{fn.goals > 1 ? "s" : ""}.</p><p className="muted">I checked the active fissures and invasions against the parts you still need. Come back when new ones start.</p>{note}<Link to="/fissures" onClick={go}>See all fissures</Link></Card>;
  const [best, second] = acts, o = best.opp, relics = (o.relics ?? []).slice(0, 3);
  const cmp = !second ? null : best.ready === "ready" && second.ready !== "ready" ? `You can start it right now; ${second.opp.title} needs something first.` : best.goals.length !== second.goals.length ? `It advances ${best.goals.length} of your goals; ${second.opp.title} advances ${second.goals.length}.`
    : o.advances.length !== second.opp.advances.length ? `Same number of goals, but it can give ${o.advances.length} of your missing items against ${second.opp.advances.length} at ${second.opp.title}.` : `It ties with ${second.opp.title} for your plan, so either is fine.`;
  return (<Card title="What to farm now"><div className="best"><span className={"kicker" + (best.ready === "ready" ? " now" : "")}>{best.ready === "ready" ? "Best for your plan" : READY_LABEL[best.ready]}</span><b> {o.title}</b>
    {o.advances.length > 0 && <p>Advances: {o.advances.slice(0, 4).join(", ")}{o.advances.length > 4 ? ` and ${o.advances.length - 4} more` : ""}.</p>}
    {relics.length > 0 && <p>Relics to open: {relics.map(r => `${r.relic} (${r.rarity}${r.owned > 0 ? ", you own it" : ""})`).join(", ")}.</p>}
    {best.blocks.map(b => <p key={b.text} className="tag STALE">{b.severity === "blocked" ? "Needs: " : "Check: "}{b.text}</p>)}
    <p className="muted">Why it is first: {best.reasons.join(" · ")}. {cmp}</p></div>
    {acts.length > 1 && <><b>Also running</b><ul>{acts.slice(1, 3).map(x => <li key={x.opp.key}>{x.opp.title}: {x.opp.advances.length} missing item{x.opp.advances.length === 1 ? "" : "s"} · {READY_LABEL[x.ready]}</li>)}</ul></>}
    {note}<Link to={o.kind === "fissure" ? "/fissures" : "/invasions"} onClick={go}>Open it</Link></Card>);
}
const ALL = FIND.map(f => ({ id: f.id, file: f.file }));
/** "Where do I get X?": the best verified places, why the first one is first, and what vendors sell it. */
export interface ThingInfo { type: string; description: string; tradable: boolean | null }
export function ItemAnswer({ name, go, info }: { name: string; go: () => void; info?: ThingInfo | null }) {
  const res = useMany(ALL), { rows, ok } = collect(FIND.map((f, i) => ({ f, rec: res[i].rec, status: res[i].status }))), needed = useNeeded();
  const adv = ok > 0 ? itemAdvice(rows, name, needed) : null, vend = vendorSources(name), [a, b] = adv?.sources ?? [], ms = methodsFor(name).slice(0, 2);
  const why = a && b && a.rolls != null && b.rolls != null ? `About ${a.rolls} run${a.rolls === 1 ? "" : "s"} on average here, against ${b.rolls} at ${b.row.where}.` : null;
  return (<Card title={`Where to get ${name}`}>
    {info && <p><b>{info.type}</b>{info.tradable != null ? <span className="muted"> · {info.tradable ? "tradable" : "not tradable"}</span> : null}{info.description ? `. ${info.description.slice(0, 280)}${info.description.length > 280 ? "…" : ""}` : ""}</p>}
    {!adv && !vend.length ? <p className="muted">Reading the drop tables…</p> : null}
    {a && <div className="best"><span className="kicker now">Best option</span><b> {a.row.where}</b>{a.row.rot ? ` · rotation ${a.row.rot}` : ""}<p className="muted">{sourceWhy(a)}. {why}</p></div>}
    {adv && adv.sources.length > 1 && <ul>{adv.sources.slice(1).map((s, i) => <li key={s.row.where + i}>{s.row.where}{s.row.rot ? ` · rotation ${s.row.rot}` : ""}: {sourceWhy(s)}</li>)}</ul>}
    {vend.length > 0 && <><b>Sold by</b><ul>{vend.slice(0, 4).map((v, i) => <li key={v.seller + i}>{v.seller}: {v.price}{v.need ? ` · ${v.need}` : ""}</li>)}</ul></>}
    {ms.length > 0 && <><b>Ways to farm it faster</b><ul>{ms.map(m => <li key={m.id}><Link to={`/methods?m=${m.id}`} onClick={go}>{m.title}</Link> <span className="muted">· {m.level}: {m.summary}</span></li>)}</ul></>}
    {adv && !adv.sources.length && !vend.length && <p className="muted">No drop or vendor in the loaded data. It may come from crafting, a quest or trading.</p>}
    {adv && !adv.exact && adv.sources.length > 0 && <p className="muted">No item with exactly this name; these are partial matches.</p>}
    <Link to={`/farm/${encodeURIComponent(name)}`} onClick={go}>See all sources</Link></Card>);
}
/** "What changed?": the newest update or hotfix with its link. */
export function ChangedAnswer({ go }: { go: () => void }) {
  const [r] = useMany([{ id: "patchlogs", file: "", url: PATCH_URL, alt: PATCH_ALT, src: PATCH_SRC, win: PATCH_WINDOW }]);
  const p = parsePatches(r?.rec?.data)?.patches.slice().sort((x, y) => y.date - x.date)[0];
  return (<Card title="What changed in the latest update">{!p ? <p className="muted">Reading the patch notes…</p> : <p><b>{p.name}</b> <span className="muted">{p.type} · {new Date(p.date).toLocaleDateString()}</span></p>}
    <Link to="/patches" onClick={go}>Open the patch notes</Link></Card>);
}
/** A Warframe or weapon: add it to your goals from the search box, or see that it is already there. */
export function GoalAnswer({ cat, slug, name, go }: { cat: "warframe" | "weapon"; slug: string; name: string; go: () => void }) {
  const id = goalId(cat, slug), [has, setHas] = useState(() => readGoals().some(g => g.id === id));
  const add = () => { const a = readGoals(); if (!a.some(g => g.id === id)) writeGoals([...a, { id, cat, slug, name }]); setHas(true); };
  return (<Card title={name}>{has ? <p className="tag FRESH">In your goals.</p> : <p>Want to get this? Add it and FarmFrame will tell you what is missing, what to do now and why.</p>}
    <div className="bar">{!has && <button className="btn" onClick={add}>I want this</button>}<Link to={has ? "/farm" : `/${cat}/${slug}`} onClick={go}>{has ? "See what to do next" : "Open its page"}</Link></div></Card>);
}

/** "Best way to farm X": hand-written methods with their steps and boosts, or an honest note when none is written yet. */
export function MethodAnswer({ methods, subject, go }: { methods: Method[]; subject: string; go: () => void }) {
  if (!methods.length) return <Card title="Farming methods"><p>No hand-written method for {subject ? `"${subject}"` : "that"} yet. Methods exist for Credits, Aya, Endo, Kuva, Forma, Orokin Cells, Plastids, Argon Crystals, Steel Essence, Void Traces, Vosfor, Gallium, Nitain Extract and Tellurium.</p><Link to="/methods" onClick={go}>Open Farming Methods</Link></Card>;
  return (<Card title={subject ? `Ways to farm ${subject}` : "Ways to farm"}>{methods.slice(0, 2).map((m, i) => <div key={m.id} className="best"><span className={"kicker" + (i === 0 ? " now" : "")}>{i === 0 ? "Start here" : "Also"} · {m.level}</span>{m.status === "community" && <span className="tag STALE"> Community strategy, not verified</span>}<b> {m.title}</b><p>{m.summary}</p>
    <ol>{m.steps.slice(0, 3).map(x => <li key={x}>{x}</li>)}</ol>
    {m.boosts.some(b => b.applies) && <p className="muted">Boosts that apply: {m.boosts.filter(b => b.applies).map(b => b.name).join(", ")}.</p>}
    <Link to={`/methods?m=${m.id}`} onClick={go}>Full method, with sources</Link></div>)}
    <p className="muted">Numbers are per roll or per run, not per hour.</p></Card>);
}

/** "What is X?": what it is (type, tradable, description from the game data) and the ways to farm it, with the way to its sources. */
export function WhatAnswer({ name, info, go }: { name: string; info: ThingInfo | null; go: () => void }) {
  const ms = methodsFor(name).slice(0, 3);
  return (<Card title={name}>
    {info ? <p><b>{info.type}</b>{info.tradable != null ? <span className="muted"> · {info.tradable ? "tradable" : "not tradable"}</span> : null}{info.description ? `. ${info.description.slice(0, 400)}${info.description.length > 400 ? "…" : ""}` : ""}</p> : <p className="muted">No description in the loaded data yet.</p>}
    {ms.length > 0 && <><b>Ways to farm it</b><ul>{ms.map(m => <li key={m.id}><Link to={`/methods?m=${m.id}`} onClick={go}>{m.title}</Link> <span className="muted">· {m.level}</span></li>)}</ul></>}
    <Link to={`/item/${encodeURIComponent(name)}`} onClick={go}>Where to get it, with prices</Link></Card>);
}

/** "Lore of X": shows the in-game description FarmFrame has for the best match and opens the Lore codex on that name. It never writes story text of its own. */
export function LoreAnswer({ subject, hit, go }: { subject: string; hit: { title: string; kind: string; to: string; body?: string } | null; go: () => void }) {
  const name = hit?.title ?? subject, base = name.replace(/ prime$/i, "");
  return (<Card title={`Lore: ${name}`}>
    {hit?.body ? <p><b>In-game description</b>{`. ${hit.body.slice(0, 400)}${hit.body.length > 400 ? "…" : ""}`}</p> : <p className="muted">No description for this name in the loaded data.</p>}
    <p className="muted">The Lore page has the story timeline, factions, places and the Warframe codex.</p>
    <Link to={`/lore?t=warframes&q=${encodeURIComponent(base)}`} onClick={go}>Find {base} in the Warframe codex</Link>{" · "}
    {hit && <><Link to={hit.to} onClick={go}>Open {hit.title}</Link>{" · "}</>}<Link to="/lore" onClick={go}>Lore page</Link></Card>);
}
