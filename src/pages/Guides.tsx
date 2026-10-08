import { Link } from "react-router-dom";
import ItemArt from "../ItemArt";
import { PageHead, SectionTabs } from "../ui";
import { GUIDE_SOURCES, LAUNCHERS, NECRAMECHS, NECRAMECH_COMMON } from "../data/guides";
const TABS = [["launchers", "Launchers"], ["necramech", "Building a Necramech"], ["voidrig", "Voidrig"], ["bonewidow", "Bonewidow"]] as const;
const ART: Record<string, string> = { archwing: "Archwing Launcher", kdrive: "K-Drive Launcher", necramech: "Necramech Launcher" };
const GLYPH: Record<string, string> = { archwing: "✈", kdrive: "◈", necramech: "⬢" };
const Sources = ({ keys }: { keys: (keyof typeof GUIDE_SOURCES)[] }) => <p className="srclist">Sources: {keys.map((k, i) => <span key={k}>{i ? " · " : ""}<a href={GUIDE_SOURCES[k].url} target="_blank" rel="noreferrer">{GUIDE_SOURCES[k].label}</a></span>)} (read {GUIDE_SOURCES[keys[0]].verified}).</p>;
/** Things a new player is never told: where the Archwing, K-Drive and Necramech launchers come from, and how to build a Necramech. */
export default function Guides() {
  return (<><PageHead title="Starter guides" art={<span aria-hidden="true" style={{ fontSize: "2rem" }}>✦</span>}>Small things the game does not explain. Each guide says where the information comes from and when it was checked.</PageHead>
    <SectionTabs items={TABS} />
    <div id="launchers" className="gcards" style={{ scrollMarginTop: "4.2rem" }}>{LAUNCHERS.map(l => <section key={l.id} id={l.id} className="gcard sec"><div className="sechead"><span style={{ display: "flex", alignItems: "center", gap: ".7rem" }}><ItemArt file={null} name={ART[l.id] ?? l.title} size={44} fallback={<span aria-hidden="true">{GLYPH[l.id] ?? "✦"}</span>} /><h2>{l.title}</h2></span></div>
      <p>{l.summary}</p><h3>How to get it</h3><ol className="steps">{l.steps.map(s => <li key={s} className="step"><span>{s}</span></li>)}</ol>
      {l.notes.map(n => <p key={n} className="note">{n}</p>)}
      {l.link && <p><Link to={l.link[0]}>{l.link[1]}</Link></p>}<Sources keys={l.sources} /></section>)}</div>
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
