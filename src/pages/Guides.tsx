import { Link } from "react-router-dom";
import { GUIDE_SOURCES, LAUNCHERS, NECRAMECHS, NECRAMECH_COMMON } from "../data/guides";
/** Things a new player is never told: where the Archwing, K-Drive and Necramech launchers come from, and how to build a Necramech. */
export default function Guides() {
  return (<><h1>Starter guides</h1>
    <p className="lead">Small things the game does not explain. Each guide says where the information comes from and when it was checked.</p>
    {LAUNCHERS.map(l => <section key={l.id} id={l.id} className="gcard"><h2>{l.title}</h2><p>{l.summary}</p>
      <h3>How to get it</h3><ol>{l.steps.map(s => <li key={s}>{s}</li>)}</ol>
      {l.notes.length > 0 && <ul>{l.notes.map(n => <li key={n} className="muted">{n}</li>)}</ul>}
      {l.link && <Link to={l.link[0]}>{l.link[1]}</Link>}
      <p className="muted">Sources: {l.sources.map((k, i) => <span key={k}>{i ? " · " : ""}<a href={GUIDE_SOURCES[k].url} target="_blank" rel="noreferrer">{GUIDE_SOURCES[k].label}</a></span>)} (read {GUIDE_SOURCES[l.sources[0]].verified}).</p></section>)}
    <section id="necramech" className="gcard"><h2>Building a Necramech</h2>
      <p>A Necramech is built from four components (Casing, Engine, Capsule, Weapon Pod), each needing a damaged part plus materials, and then the main body. Each one gives 8,000 Mastery Points at level 40.</p>
      <ul>{NECRAMECH_COMMON.map(n => <li key={n}>{n}</li>)}</ul>
      {NECRAMECHS.map(b => <details key={b.name} open><summary><b>{b.name}</b></summary>
        <p>{b.blueprint}</p><p>Final build: {b.credits.toLocaleString()} credits, {b.hours} hours (rush {b.rush} Platinum), using one of each component.</p>
        <div className="wrap"><table><thead><tr><th>Component</th><th className="num">Credits</th><th>Damaged part</th><th>Other materials</th><th className="num">Time</th></tr></thead>
          <tbody>{b.parts.map(p => <tr key={p.part}><td>{p.part}</td><td className="num">{p.credits.toLocaleString()}</td><td>{p.damaged}</td><td>{p.materials}</td><td className="num">{p.hours} h</td></tr>)}</tbody></table></div>
        <ul>{b.extra.map(e => <li key={e} className="muted">{e}</li>)}</ul>
        <p className="muted">Source: <a href={GUIDE_SOURCES[b.source].url} target="_blank" rel="noreferrer">{GUIDE_SOURCES[b.source].label}</a> (read {GUIDE_SOURCES[b.source].verified}).</p></details>)}
      <p><Link to="/mastery">Mastery checklist</Link> · <Link to="/syndicates">Syndicates</Link></p></section></>);
}
