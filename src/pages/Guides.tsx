import { useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ItemArt from "../ItemArt";
import SyndicateArt from "../SyndicateArt";
import { PageHead, SectionTabs } from "../ui";
import { ARBITRATION_GUIDE as ARB, GUIDE_SOURCES, KUVA_GUIDE as KUVA, LAUNCHERS, NECRAMECHS, NECRAMECH_COMMON } from "../data/guides";
const TABS = [["launchers", "Launchers"], ["arbitrations", "Arbitrations"], ["kuva", "Kuva Siphons"], ["necramech", "Building a Necramech"], ["voidrig", "Voidrig"], ["bonewidow", "Bonewidow"]] as const;
const ART: Record<string, string> = { archwing: "Archwing Launcher", kdrive: "K-Drive Launcher", necramech: "Necramech Launcher" };
const GLYPH: Record<string, string> = { archwing: "✈", kdrive: "◈", necramech: "⬢" };
const Sources = ({ keys }: { keys: (keyof typeof GUIDE_SOURCES)[] }) => <p className="srclist">Sources: {keys.map((k, i) => <span key={k}>{i ? " · " : ""}<a href={GUIDE_SOURCES[k].url} target="_blank" rel="noreferrer">{GUIDE_SOURCES[k].label}</a></span>)} (read {GUIDE_SOURCES[keys[0]].verified}).</p>;
/** Things a new player is never told: where the Archwing, K-Drive and Necramech launchers come from, and how to build a Necramech. */
export default function Guides() {
  const [sp] = useSearchParams(), target = sp.get("s");
  // A link such as /guides?s=kuva opens the page at that guide (a #hash cannot be used: the app uses hash routing).
  useEffect(() => { if (target) setTimeout(() => document.getElementById(target)?.scrollIntoView({ block: "start" }), 80); }, [target]);
  return (<><PageHead title="Starter guides" art={<span aria-hidden="true" style={{ fontSize: "2rem" }}>✦</span>}>Small things the game does not explain. Each guide says where the information comes from and when it was checked.</PageHead>
    <SectionTabs items={TABS} />
    <div id="launchers" className="gcards" style={{ scrollMarginTop: "4.2rem" }}>{LAUNCHERS.map(l => <section key={l.id} id={l.id} className="gcard sec"><div className="sechead"><span style={{ display: "flex", alignItems: "center", gap: ".7rem" }}><ItemArt file={null} name={ART[l.id] ?? l.title} size={44} fallback={<span aria-hidden="true">{GLYPH[l.id] ?? "✦"}</span>} /><h2>{l.title}</h2></span></div>
      <p>{l.summary}</p><h3>How to get it</h3><ol className="steps">{l.steps.map(s => <li key={s} className="step"><span>{s}</span></li>)}</ol>
      {l.notes.map(n => <p key={n} className="note">{n}</p>)}
      {l.link && <p><Link to={l.link[0]}>{l.link[1]}</Link></p>}<Sources keys={l.sources} /></section>)}</div>
    <section id="arbitrations" className="gcard sec" style={{ marginTop: "1rem" }}><div className="sechead"><span style={{ display: "flex", alignItems: "center", gap: ".7rem" }}><SyndicateArt name="Arbiters of Hexis" size={48} /><h2>Arbitrations</h2></span></div>
      <p>{ARB.intro}</p><p className="note"><b>Unlock:</b> {ARB.unlock}</p>
      <div className="cols"><div className="minicard"><h3>How they work</h3><ul>{ARB.how.map(x => <li key={x}>{x}</li>)}</ul></div>
        <div className="minicard"><h3>Dying and reviving</h3><ul>{ARB.death.map(x => <li key={x}>{x}</li>)}</ul></div>
        <div className="minicard"><h3>Shield Drones</h3><ul>{ARB.drones.map(x => <li key={x}>{x}</li>)}</ul></div></div>
      <h3>Changes to each mission type</h3><div className="cgrid wide">{ARB.modifiers.map(([m, t]) => <div key={m} className="minicard"><h4>{m}</h4><p className="muted" style={{ margin: 0 }}>{t}</p></div>)}</div>
      <h3>Bonus for variety</h3><p>{ARB.bonus}</p>
      <h3>Rewards</h3><ul>{ARB.rewards.map(x => <li key={x}>{x}</li>)}</ul><p><Link to="/rotations">Arbitration reward tables (Rotations)</Link></p>
      <h3>Tips from the wiki</h3><ul>{ARB.tips.map(x => <li key={x}>{x}</li>)}</ul><p className="muted">{ARB.note}</p><Sources keys={["arbitrations"]} /></section>
    <section id="kuva" className="gcard sec"><div className="sechead"><h2>Kuva Siphons and Kuva Floods</h2></div>
      <p>{KUVA.intro}</p><p className="note"><b>Unlock:</b> {KUVA.unlock}</p>
      <div className="cols"><div className="minicard"><h3>Where they appear</h3><ul>{KUVA.where.map(x => <li key={x}>{x}</li>)}</ul></div>
        <div className="minicard"><h3>How to harvest</h3><ol className="steps">{KUVA.steps.map(x => <li key={x} className="step"><span>{x}</span></li>)}</ol></div>
        <div className="minicard"><h3>What you get</h3><ul>{KUVA.results.map(x => <li key={x}>{x}</li>)}</ul></div></div>
      <h3>Extra mission rewards</h3><div className="cgrid wide">{KUVA.rewards.map(([a, b]) => <div key={a} className="minicard"><h4>{a}</h4><p className="muted" style={{ margin: 0 }}>{b}</p></div>)}</div>
      <h3>Tips from the wiki</h3><ul>{KUVA.tips.map(x => <li key={x}>{x}</li>)}</ul><p><Link to="/rotations">Current Kuva missions (Rotations)</Link></p><Sources keys={["kuvaSiphon"]} /></section>
    <section id="necramech" className="gcard sec" style={{ marginTop: "1rem" }}><h2>Building a Necramech</h2>
      <p>A Necramech is built from four components (Casing, Engine, Capsule, Weapon Pod), each needing a damaged part plus materials, and then the main body. Each one gives 8,000 Mastery Points at level 40.</p>
      <ul>{NECRAMECH_COMMON.map(n => <li key={n}>{n}</li>)}</ul></section>
    {NECRAMECHS.map(b => <section key={b.name} id={b.name.toLowerCase()} className="gcard sec"><div className="sechead"><span style={{ display: "flex", alignItems: "center", gap: ".7rem" }}><ItemArt file={null} name={b.name} size={56} fallback={<span aria-hidden="true">⬢</span>} /><h2>{b.name}</h2></span></div>
      <p>{b.blueprint}</p>
      <div className="facts"><div className="fact"><b>{b.credits.toLocaleString()}</b><span>Credits for the final build</span></div><div className="fact"><b>{b.hours} h</b><span>Build time</span></div><div className="fact"><b>{b.rush}</b><span>Platinum to rush</span></div></div>
      <h3>Components (one of each)</h3>
      <div className="cgrid wide">{b.parts.map(p => <article key={p.part} className="minicard"><h4>{p.part}</h4><p className="muted" style={{ margin: 0 }}>{p.damaged}</p><p style={{ margin: ".4rem 0" }}>{p.materials}</p><span className="tag">{p.credits.toLocaleString()} credits</span> <span className="tag">{p.hours} h</span></article>)}</div>
      {b.extra.map(e => <p key={e} className="note">{e}</p>)}<Sources keys={[b.source]} /></section>)}
    <p className="srclist"><Link to="/mastery">Mastery checklist</Link> · <Link to="/syndicates">Syndicates</Link> · <Link to="/kdrives">K-Drives</Link> · <Link to="/helminth">Helminth</Link></p></>);
}
