import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ItemArt from "../ItemArt";
import SyndicateArt from "../SyndicateArt";
import { useT } from "../i18n";
import { rich } from "../lib/rich";
import { PageHead, SectionTabs } from "../ui";
import { ARBITRATION_GUIDE as ARB, GUIDE_SOURCES, KUVA_GUIDE as KUVA, LAUNCHERS, NECRAMECHS, NECRAMECH_COMMON } from "../data/guides";
const ART: Record<string, string> = { archwing: "Archwing Launcher", kdrive: "K-Drive Launcher", necramech: "Necramech Launcher" };
const GLYPH: Record<string, string> = { archwing: "✈", kdrive: "◈", necramech: "⬢" };
const Sources = ({ keys }: { keys: (keyof typeof GUIDE_SOURCES)[] }) => { const tr = useT(); return <p className="srclist">{rich(tr("gdSources", { date: GUIDE_SOURCES[keys[0]].verified, list: "{list}" }), { list: <>{keys.map((k, i) => <span key={k}>{i ? " · " : ""}<a href={GUIDE_SOURCES[k].url} target="_blank" rel="noreferrer">{GUIDE_SOURCES[k].label}</a></span>)}</> })}</p>; };
/** Things a new player is never told: where the Archwing, K-Drive and Necramech launchers come from, and how to build a Necramech. */
export default function Guides() {
  const tr = useT(), tabs = [["launchers", tr("gdLaunchers")], ["arbitrations", "Arbitrations"], ["kuva", "Kuva Siphons"], ["necramech", tr("gdBuildNecra")], ["voidrig", "Voidrig"], ["bonewidow", "Bonewidow"]] as const, [sp] = useSearchParams(), target = sp.get("s");
  // A link such as /guides?s=kuva opens the page at that guide (a #hash cannot be used: the app uses hash routing).
  useEffect(() => { if (target) setTimeout(() => document.getElementById(target)?.scrollIntoView({ block: "start" }), 80); }, [target]);
  return (<><PageHead title={tr("gdTitle")} art={<span aria-hidden="true" style={{ fontSize: "2rem" }}>✦</span>}>{tr("gdLead")}</PageHead>
    <SectionTabs items={tabs} />
    <div id="launchers" className="gcards" style={{ scrollMarginTop: "4.2rem" }}>{LAUNCHERS.map(l => <section key={l.id} id={l.id} className="gcard sec"><header className="sechead"><span style={{ display: "flex", alignItems: "center", gap: ".7rem" }}><ItemArt file={null} name={ART[l.id] ?? l.title} size={44} fallback={<span aria-hidden="true">{GLYPH[l.id] ?? "✦"}</span>} /><h2>{l.title}</h2></span></header>
      <p>{l.summary}</p><h3>{tr("gdHowGet")}</h3><ol className="steps">{l.steps.map(s => <li key={s} className="step"><span>{s}</span></li>)}</ol>
      {l.notes.map(n => <p key={n} className="note">{n}</p>)}
      {l.link && <p><Link to={l.link[0]}>{l.link[1]}</Link></p>}<Sources keys={l.sources} /></section>)}</div>
    <section id="arbitrations" className="gcard sec" style={{ marginTop: "1rem" }}><header className="sechead"><span style={{ display: "flex", alignItems: "center", gap: ".7rem" }}><SyndicateArt name="Arbiters of Hexis" size={48} /><h2>Arbitrations</h2></span></header>
      <p>{ARB.intro}</p><p className="note"><b>{tr("gdUnlock")}</b> {ARB.unlock}</p>
      <div className="cols"><article className="minicard"><h3>{tr("gdHow")}</h3><ul>{ARB.how.map(x => <li key={x}>{x}</li>)}</ul></article>
        <article className="minicard"><h3>{tr("gdDying")}</h3><ul>{ARB.death.map(x => <li key={x}>{x}</li>)}</ul></article>
        <article className="minicard"><h3>Shield Drones</h3><ul>{ARB.drones.map(x => <li key={x}>{x}</li>)}</ul></article></div>
      <h3>{tr("gdChanges")}</h3><div className="cgrid wide">{ARB.modifiers.map(([m, t]) => <article key={m} className="minicard"><h4>{m}</h4><p className="muted" style={{ margin: 0 }}>{t}</p></article>)}</div>
      <h3>{tr("gdBonus")}</h3><p>{ARB.bonus}</p>
      <h3>{tr("gdRewards")}</h3><ul>{ARB.rewards.map(x => <li key={x}>{x}</li>)}</ul><p><Link to="/rotations">{tr("gdArbLink")}</Link></p>
      <h3>{tr("hlTips")}</h3><ul>{ARB.tips.map(x => <li key={x}>{x}</li>)}</ul><p className="muted">{ARB.note}</p><Sources keys={["arbitrations"]} /></section>
    <section id="kuva" className="gcard sec"><header className="sechead"><h2>Kuva Siphons and Kuva Floods</h2></header>
      <p>{KUVA.intro}</p><p className="note"><b>{tr("gdUnlock")}</b> {KUVA.unlock}</p>
      <div className="cols"><article className="minicard"><h3>{tr("gdWhere")}</h3><ul>{KUVA.where.map(x => <li key={x}>{x}</li>)}</ul></article>
        <article className="minicard"><h3>{tr("gdHarvest")}</h3><ol className="steps">{KUVA.steps.map(x => <li key={x} className="step"><span>{x}</span></li>)}</ol></article>
        <article className="minicard"><h3>{tr("gdGet")}</h3><ul>{KUVA.results.map(x => <li key={x}>{x}</li>)}</ul></article></div>
      <h3>{tr("gdExtra")}</h3><div className="cgrid wide">{KUVA.rewards.map(([a, b]) => <article key={a} className="minicard"><h4>{a}</h4><p className="muted" style={{ margin: 0 }}>{b}</p></article>)}</div>
      <h3>{tr("hlTips")}</h3><ul>{KUVA.tips.map(x => <li key={x}>{x}</li>)}</ul><p><Link to="/rotations">{tr("gdKuvaLink")}</Link></p><Sources keys={["kuvaSiphon"]} /></section>
    <section id="necramech" className="gcard sec" style={{ marginTop: "1rem" }}><h2>{tr("gdBuildNecra")}</h2>
      <p>{tr("gdNecraP", { pts: (8000).toLocaleString() })}</p>
      <ul>{NECRAMECH_COMMON.map(n => <li key={n}>{n}</li>)}</ul></section>
    {NECRAMECHS.map(b => <section key={b.name} id={b.name.toLowerCase()} className="gcard sec"><header className="sechead"><span style={{ display: "flex", alignItems: "center", gap: ".7rem" }}><ItemArt file={null} name={b.name} size={56} fallback={<span aria-hidden="true">⬢</span>} /><h2>{b.name}</h2></span></header>
      <p>{b.blueprint}</p>
      <div className="facts"><div className="fact"><b>{b.credits.toLocaleString()}</b><span>{tr("gdFinalCredits")}</span></div><div className="fact"><b>{tr("prtHrs", { n: b.hours })}</b><span>{tr("gdBuildTime")}</span></div><div className="fact"><b>{b.rush}</b><span>{tr("gdRush")}</span></div></div>
      <h3>{tr("gdComps")}</h3>
      <div className="cgrid wide">{b.parts.map(p => <article key={p.part} className="minicard"><h4>{p.part}</h4><p className="muted" style={{ margin: 0 }}>{p.damaged}</p><p style={{ margin: ".4rem 0" }}>{p.materials}</p><span className="tag">{tr("alCredits", { n: p.credits.toLocaleString() })}</span> <span className="tag">{tr("prtHrs", { n: p.hours })}</span></article>)}</div>
      {b.extra.map(e => <p key={e} className="note">{e}</p>)}<Sources keys={[b.source]} /></section>)}
    <p className="srclist"><Link to="/mastery">{tr("hlMasteryLink")}</Link> · <Link to="/syndicates">{tr("syndicates")}</Link> · <Link to="/kdrives">{tr("kdrives")}</Link> · <Link to="/helminth">{tr("helminth")}</Link></p></>);
}
