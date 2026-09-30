import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useMany } from "../lib/data";
import { CATS, CAT_SRC, imgUrl, parseCatalog, type Cat, type Component } from "../lib/catalog";
import { goalId, readGoals, writeGoals } from "../lib/goals";
import { readTracked, writeTracked } from "../lib/track";
import { Badge, Prov, Unavailable } from "./parts";
const Sub = ({ cs }: { cs: Component[] }) => cs.length ? <ul className="sub">{cs.map(k => <li key={k.name}>{k.name}{k.count > 1 ? ` ×${k.count}` : ""}<Sub cs={k.children} /></li>)}</ul> : null;
export default function Entity({ cat }: { cat: Cat }) {
  const { slug } = useParams(), c = CATS[cat], [done, setDone] = useState(false), [goal, setGoal] = useState(false);
  const [{ rec, status }] = useMany([{ id: cat, file: "", url: c.url, src: CAT_SRC }]);
  const list = parseCatalog(rec?.data, cat), e = list?.find(x => x.slug === slug);
  if (!list) return <Unavailable title={c.label} status={status} why={status === "LOADING" ? "Loading catalog…" : "No verified data."} rec={rec} />;
  if (!e) return <><h1>Not found</h1><p className="muted">"{slug}" is not in the loaded {c.label.toLowerCase()} data. <Link to={`/${c.path}`}>Browse {c.label.toLowerCase()}</Link></p></>;
  const q = encodeURIComponent(e.name);
  const track = () => { const a = readTracked(); if (!a.some(t => t.n === e.name)) writeTracked([...a, { n: e.name, o: 0, t: 1 }]); setDone(true); };
  const addGoal = () => { const a = readGoals(), id = goalId(cat, e.slug); if (!a.some(g => g.id === id)) writeGoals([...a, { id, cat, slug: e.slug, name: e.name }]); setGoal(true); };
  return (<article className="entity">
    <div className="hero">
      <div className="art">{e.image && <img src={imgUrl(e.image)} alt={e.name} width={320} height={320} onError={ev => { ev.currentTarget.style.display = "none"; }} />}</div>
      <div><p className="muted">{e.type || c.label}{e.isPrime ? " · " : ""}{e.isPrime && <span className="gold">PRIME</span>} <Badge s={status} /></p>
        <h1>{e.name}</h1>{e.description && <p className="lead">{e.description}</p>}
        {e.stats.length > 0 && <dl className="stats">{e.stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
        <div className="bar"><Link className="btn" to={`/relics?q=${q}`}>Relics with this</Link><Link className="btn" to={`/finder?q=${q}`}>Where it drops</Link>
          <button className="btn" onClick={track} disabled={done}>{done ? "Tracked" : "Track"}</button>
          {e.components.length > 0 && (goal ? <Link className="btn" to="/roadmap">In Roadmap</Link> : <button className="btn" onClick={addGoal}>Add to Goal</button>)}</div></div></div>
    {e.facts.length > 0 && <p className="muted">{e.facts.map(([k, v]) => `${k}: ${v}`).join(" · ")}{e.vaulted !== null ? ` · Vaulted: ${e.vaulted ? "yes" : "no"}` : ""}</p>}
    {e.components.length > 0 && <><h2>Components</h2><ul className="list comp">{e.components.map(k => (
      <li key={k.name}><span><b>{k.name}</b>{k.count > 1 ? ` ×${k.count}` : ""}<span className="muted"> <Link to={`/farm/${encodeURIComponent(e.name + " " + k.name)}`}>find</Link></span><Sub cs={k.children} /></span>
        <span className="muted">{k.drops.length ? k.drops.slice(0, 6).map(d => `${d.location}${d.type ? " (" + d.type + ")" : ""}`).join("; ") : "No acquisition data in this source"}</span></li>))}</ul></>}
    <Prov rec={rec} /></article>);
}
