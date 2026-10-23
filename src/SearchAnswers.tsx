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
import { tp, useT } from "./i18n";
const Card = ({ title, children }: { title: string; children: ReactNode }) => <section className="answer" aria-live="polite" aria-label={title}><h3>{title}</h3>{children}</section>;
/** "What should I farm?": the best activity running now for the person's own goals, where it is, why it is first, and what else is running. */
export function NowAnswer({ go }: { go: () => void }) {
  const tr = useT();
  const fn = useFarmNow(), ex = fn.exact;
  if (!fn.goals) return <Card title={tr("saNowTitle")}><p>{tr("saNoGoals")}</p><Link to="/farm" onClick={go}>{tr("saPick")}</Link></Card>;
  if (ex.pending) return <Card title={tr("saNowTitle")}><p className="muted">{tr("saReading")}</p></Card>;
  const acts = rankActivities(fn.opps), trust = trustLine([{ label: "Fissures", status: ex.fis.status, rec: ex.fis.rec, drift: allStats().get("fissures")?.drift }]);
  const note = <p className={trust.warn ? "tag STALE" : "muted"}>{trust.warn ?? tr("saBasedOn", { list: trust.lines.join(" · ") })}</p>;
  if (!acts.length) return <Card title={tr("saNowTitle")}><p>{tp("saNothing", fn.goals)}</p><p className="muted">{tr("saChecked")}</p>{note}<Link to="/fissures" onClick={go}>{tr("saSeeFis")}</Link></Card>;
  const [best, second] = acts, o = best.opp, relics = (o.relics ?? []).slice(0, 3);
  const cmp = !second ? null : best.ready === "ready" && second.ready !== "ready" ? tr("saCmpReady", { other: second.opp.title }) : best.goals.length !== second.goals.length ? tr("saCmpGoals", { a: best.goals.length, other: second.opp.title, b: second.goals.length })
    : o.advances.length !== second.opp.advances.length ? tr("saCmpItems", { a: o.advances.length, b: second.opp.advances.length, other: second.opp.title }) : tr("saCmpTie", { other: second.opp.title });
  return (<Card title={tr("saNowTitle")}><div className="best"><span className={"kicker" + (best.ready === "ready" ? " now" : "")}>{best.ready === "ready" ? tr("saBest") : READY_LABEL[best.ready]}</span><b> {o.title}</b>
    {o.advances.length > 0 && <p>{o.advances.length > 4 ? tr("saAdvancesMore", { list: o.advances.slice(0, 4).join(", "), n: o.advances.length - 4 }) : tr("saAdvances", { list: o.advances.slice(0, 4).join(", ") })}</p>}
    {relics.length > 0 && <p>{tr("saRelics", { list: relics.map(r => tr(r.owned > 0 ? "saRelicOwned" : "saRelic", { relic: r.relic, rarity: r.rarity })).join(", ") })}</p>}
    {best.blocks.map(b => <p key={b.text} className="tag STALE">{b.severity === "blocked" ? tr("saNeeds") : tr("saCheck")} {b.text}</p>)}
    <p className="muted">{tr("saWhyFirst", { reasons: best.reasons.join(" · "), cmp: cmp ?? "" })}</p></div>
    {acts.length > 1 && <><b>{tr("saAlso")}</b><ul>{acts.slice(1, 3).map(x => <li key={x.opp.key}>{tp("saMissingItems", x.opp.advances.length, { title: x.opp.title, ready: READY_LABEL[x.ready] })}</li>)}</ul></>}
    {note}<Link to={o.kind === "fissure" ? "/fissures" : "/invasions"} onClick={go}>{tr("saOpenIt")}</Link></Card>);
}
const ALL = FIND.map(f => ({ id: f.id, file: f.file }));
/** "Where do I get X?": the best verified places, why the first one is first, and what vendors sell it. */
export interface ThingInfo { type: string; description: string; tradable: boolean | null }
export function ItemAnswer({ name, go, info }: { name: string; go: () => void; info?: ThingInfo | null }) {
  const tr = useT();
  const res = useMany(ALL), { rows, ok } = collect(FIND.map((f, i) => ({ f, rec: res[i].rec, status: res[i].status }))), needed = useNeeded();
  const adv = ok > 0 ? itemAdvice(rows, name, needed) : null, vend = vendorSources(name), [a, b] = adv?.sources ?? [], ms = methodsFor(name).slice(0, 2);
  const why = a && b && a.rolls != null && b.rolls != null ? tp("saWhy", a.rolls, { b: b.rolls, where: b.row.where }) : null;
  return (<Card title={tr("saWhereGet", { name })}>
    {info && <p><b>{info.type}</b>{info.tradable != null ? <span className="muted"> · {info.tradable ? tr("saTradable") : tr("saNotTradable")}</span> : null}{info.description ? `. ${info.description.slice(0, 280)}${info.description.length > 280 ? "…" : ""}` : ""}</p>}
    {!adv && !vend.length ? <p className="muted">{tr("saReadingDrops")}</p> : null}
    {a && <div className="best"><span className="kicker now">{tr("saBestOption")}</span><b> {a.row.where}</b>{a.row.rot ? " · " + tr("saRotation", { rot: a.row.rot }) : ""}<p className="muted">{sourceWhy(a)}. {why}</p></div>}
    {adv && adv.sources.length > 1 && <ul>{adv.sources.slice(1).map((s, i) => <li key={s.row.where + i}>{s.row.where}{s.row.rot ? " · " + tr("saRotation", { rot: s.row.rot }) : ""}: {sourceWhy(s)}</li>)}</ul>}
    {vend.length > 0 && <><b>{tr("saSoldBy")}</b><ul>{vend.slice(0, 4).map((v, i) => <li key={v.seller + i}>{v.seller}: {v.price}{v.need ? ` · ${v.need}` : ""}</li>)}</ul></>}
    {ms.length > 0 && <><b>{tr("saFaster")}</b><ul>{ms.map(m => <li key={m.id}><Link to={`/methods?m=${m.id}`} onClick={go}>{m.title}</Link> <span className="muted">· {m.level}: {m.summary}</span></li>)}</ul></>}
    {adv && !adv.sources.length && !vend.length && <p className="muted">{tr("saNoSource")}</p>}
    {adv && !adv.exact && adv.sources.length > 0 && <p className="muted">{tr("saPartial")}</p>}
    <Link to={`/farm/${encodeURIComponent(name)}`} onClick={go}>{tr("saSeeAll")}</Link></Card>);
}
/** "What changed?": the newest update or hotfix with its link. */
export function ChangedAnswer({ go }: { go: () => void }) {
  const tr = useT();
  const [r] = useMany([{ id: "patchlogs", file: "", url: PATCH_URL, alt: PATCH_ALT, src: PATCH_SRC, win: PATCH_WINDOW }]);
  const p = parsePatches(r?.rec?.data)?.patches.slice().sort((x, y) => y.date - x.date)[0];
  return (<Card title={tr("saChangedTitle")}>{!p ? <p className="muted">{tr("saReadingPatch")}</p> : <p><b>{p.name}</b> <span className="muted">{p.type} · {new Date(p.date).toLocaleDateString()}</span></p>}
    <Link to="/patches" onClick={go}>{tr("saOpenPatch")}</Link></Card>);
}
/** A Warframe or weapon: add it to your goals from the search box, or see that it is already there. */
export function GoalAnswer({ cat, slug, name, go }: { cat: "warframe" | "weapon"; slug: string; name: string; go: () => void }) {
  const tr = useT();
  const id = goalId(cat, slug), [has, setHas] = useState(() => readGoals().some(g => g.id === id));
  const add = () => { const a = readGoals(); if (!a.some(g => g.id === id)) writeGoals([...a, { id, cat, slug, name }]); setHas(true); };
  return (<Card title={name}>{has ? <p className="tag FRESH">{tr("saInGoals")}</p> : <p>{tr("saWantQ")}</p>}
    <div className="bar">{!has && <button className="btn" onClick={add}>{tr("saWantBtn")}</button>}<Link to={has ? "/farm" : `/${cat}/${slug}`} onClick={go}>{has ? tr("saNext") : tr("saOpenPage")}</Link></div></Card>);
}

/** "Best way to farm X": hand-written methods with their steps and boosts, or an honest note when none is written yet. */
export function MethodAnswer({ methods, subject, go }: { methods: Method[]; subject: string; go: () => void }) {
  const tr = useT();
  if (!methods.length) return <Card title={tr("saMethodsTitle")}><p>{tr("saNoMethod", { subject: subject || tr("saThat") })}</p><Link to="/methods" onClick={go}>{tr("saOpenMethods")}</Link></Card>;
  return (<Card title={subject ? tr("saWaysTo", { subject }) : tr("saWays")}>{methods.slice(0, 2).map((m, i) => <div key={m.id} className="best"><span className={"kicker" + (i === 0 ? " now" : "")}>{i === 0 ? tr("saStartHere") : tr("saAlsoWord")} · {m.level}</span>{m.status === "community" && <span className="tag STALE"> {tr("saCommunity")}</span>}<b> {m.title}</b><p>{m.summary}</p>
    <ol>{m.steps.slice(0, 3).map(x => <li key={x}>{x}</li>)}</ol>
    {m.boosts.some(b => b.applies) && <p className="muted">{tr("saBoosts", { list: m.boosts.filter(b => b.applies).map(b => b.name).join(", ") })}</p>}
    <Link to={`/methods?m=${m.id}`} onClick={go}>{tr("saFullMethod")}</Link></div>)}
    <p className="muted">{tr("saPerRoll")}</p></Card>);
}

/** "What is X?": what it is (type, tradable, description from the game data) and the ways to farm it, with the way to its sources. */
export function WhatAnswer({ name, info, go }: { name: string; info: ThingInfo | null; go: () => void }) {
  const tr = useT();
  const ms = methodsFor(name).slice(0, 3);
  return (<Card title={name}>
    {info ? <p><b>{info.type}</b>{info.tradable != null ? <span className="muted"> · {info.tradable ? tr("saTradable") : tr("saNotTradable")}</span> : null}{info.description ? `. ${info.description.slice(0, 400)}${info.description.length > 400 ? "…" : ""}` : ""}</p> : <p className="muted">{tr("saNoDesc")}</p>}
    {ms.length > 0 && <><b>{tr("saWaysIt")}</b><ul>{ms.map(m => <li key={m.id}><Link to={`/methods?m=${m.id}`} onClick={go}>{m.title}</Link> <span className="muted">· {m.level}</span></li>)}</ul></>}
    <Link to={`/item/${encodeURIComponent(name)}`} onClick={go}>{tr("saWherePrices")}</Link></Card>);
}

/** "Lore of X": shows the in-game description FarmFrame has for the best match and opens the Lore codex on that name. It never writes story text of its own. */
export function LoreAnswer({ subject, hit, go }: { subject: string; hit: { title: string; kind: string; to: string; body?: string } | null; go: () => void }) {
  const tr = useT();
  const name = hit?.title ?? subject, base = name.replace(/ prime$/i, "");
  return (<Card title={tr("saLoreTitle", { name })}>
    {hit?.body ? <p><b>{tr("saInGame")}</b>{`. ${hit.body.slice(0, 400)}${hit.body.length > 400 ? "…" : ""}`}</p> : <p className="muted">{tr("saNoDescName")}</p>}
    <p className="muted">{tr("saLoreNote")}</p>
    <Link to={`/lore?t=warframes&q=${encodeURIComponent(base)}`} onClick={go}>{tr("saFindCodex", { base })}</Link>{" · "}
    {hit && <><Link to={hit.to} onClick={go}>{tr("saOpenX", { title: hit.title })}</Link>{" · "}</>}<Link to="/lore" onClick={go}>{tr("saLorePage")}</Link></Card>);
}
