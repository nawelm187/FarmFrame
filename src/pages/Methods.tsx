import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { METHODS, type Level } from "../data/methods";
import { thingRoute } from "../lib/refs";
import { PageHead } from "../ui";
import { useT, type Key } from "../i18n";
import { rich } from "../lib/rich";
const LV: Record<Level, Key> = { Beginner: "mtLvBeginner", Intermediate: "mtLvIntermediate", Veteran: "mtLvVeteran" };
const GOALS = ["All", ...new Set(METHODS.map(m => m.yields[0]))] as string[], LEVELS: ("All" | Level)[] = ["All", "Beginner", "Intermediate", "Veteran"];
/** Farming methods: what to do to get a material quickly, what boosts it, and where the numbers come from. */
export default function Methods() {
  const t = useT(), [sp] = useSearchParams(), target = sp.get("m"), [goal, setGoal] = useState<string>("All"), [level, setLevel] = useState<"All" | Level>("All");
  useEffect(() => { if (target) setTimeout(() => document.getElementById(target)?.scrollIntoView({ block: "start" }), 80); }, [target]);
  const list = METHODS.filter(m => (goal === "All" || m.yields.includes(goal)) && (level === "All" || m.level === level) || m.id === target);
  return (<><PageHead title={t("farmingMethods")} art={<span aria-hidden="true" style={{ fontSize: "2rem" }}>⚑</span>}>{t("mtLead")}</PageHead>
    <div className="chips" role="group" aria-label={t("mtGoalAria")}>{GOALS.map(g => <button key={g} className={"btn" + (goal === g ? " on" : "")} aria-pressed={goal === g} onClick={() => setGoal(g)}>{g === "All" ? t("psAll") : g}</button>)}</div>
    <div className="chips" role="group" aria-label={t("mtLevelAria")}>{LEVELS.map(l => <button key={l} className={"btn" + (level === l ? " on" : "")} aria-pressed={level === l} onClick={() => setLevel(l)}>{l === "All" ? t("psAll") : t(LV[l])}</button>)}</div>
    <p className="muted">{t("mtNumbers")}</p>
    <div className="mlist">{list.map(m => <section key={m.id} id={m.id} className="gcard sec mcard" style={{ scrollMarginTop: "4.2rem" }}>
      <header className="mhead"><div className="mtags"><span className="tag">{t(LV[m.level])}</span>{m.yields.map(y => <span key={y} className="tag FRESH">{y}</span>)}{m.status === "community" && <span className="tag STALE">{t("mtCommunity")}</span>}</div><h2>{m.title}</h2><p>{m.summary}</p></header>
      <details open={m.id === target} className="mbody"><summary>{t("mtSteps")}</summary>
        {m.requires.length > 0 && <p className="note"><b>{t("mtNeeds")}</b> {m.requires.join("; ")}.</p>}
        <h3>{t("mtDo")}</h3><ol className="steps">{m.steps.map(s => <li key={s} className="step"><span>{s}</span></li>)}</ol>
        <h3>{t("mtBoosts")}</h3><ul>{m.boosts.map(b => <li key={b.name}><b>{b.name}</b>: {b.effect} <span className={"tag " + (b.applies ? "FRESH" : "STALE")}>{b.applies ? t("mtApplies") : t("mtNotApply")}</span></li>)}</ul>
        {m.mods?.map(x => <article key={x.name} className="minicard"><h4>{x.name}</h4><p>{x.effect}</p><p className="muted">{t("mtPolarity", { pol: x.polarity, drain: x.drain })}</p><p className="muted">{t("mtWhereGet", { where: x.where })}</p><Link to={thingRoute(x.name)}>{t("mtOpenPage")}</Link></article>)}
        {m.notes.map(n => <p key={n} className="note">{n}</p>)}
        <p className="muted">{m.yields.map((y, i) => <span key={y}>{i ? " · " : ""}<Link to={thingRoute(y)}>{t("mtAllSources", { y })}</Link></span>)}</p>
        <p className="srclist">{rich(t("mtSource", { date: m.checked, conf: m.confidence }), { link: <a href={m.source.url} target="_blank" rel="noreferrer">{m.source.label}</a> })}</p></details></section>)}</div>
    {!list.length && <p className="muted">{t("mtNone")}</p>}</>);
}
