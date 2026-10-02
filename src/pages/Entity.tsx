import { useState } from "react";
import { Link, useParams } from "react-router-dom";
import { useCatalog } from "../lib/useCatalog";
import { CATS, imgUrl, type Cat, type Component } from "../lib/catalog";
import { Logo } from "../Icons";
import { MARKET_ENABLED } from "../lib/market";
import MarketCheck from "../MarketCheck";
import Details from "../Details";
import ModCard from "../ModCard";
import ModPrice from "../ModPrice";
import SetPrice from "../SetPrice";
import { goalId, readGoals, writeGoals } from "../lib/goals";
import { readTracked, writeTracked } from "../lib/track";
import { Badge, Prov, Unavailable } from "./parts";
const Sub = ({ cs }: { cs: Component[] }) => cs.length ? <ul className="sub">{cs.map(k => <li key={k.name}>{k.name}{k.count > 1 ? ` ×${k.count}` : ""}<Sub cs={k.children} /></li>)}</ul> : null;
export default function Entity({ cat }: { cat: Cat }) {
  const { slug } = useParams(), c = CATS[cat], [done, setDone] = useState(false), [goal, setGoal] = useState(false);
  const { items: list, rec, status } = useCatalog(cat), e = list?.find(x => x.slug === slug);
  if (!list) return <Unavailable title={c.label} status={status} why={status === "LOADING" ? "Loading catalog…" : "No verified data."} rec={rec} />;
  if (!e) return <><h1>Not found</h1><p className="muted">"{slug}" is not in the loaded {c.label.toLowerCase()} data. <Link to={`/${c.path}`}>Browse {c.label.toLowerCase()}</Link></p></>;
  const q = encodeURIComponent(e.name);
  const track = () => { const a = readTracked(); if (!a.some(t => t.n === e.name)) writeTracked([...a, { n: e.name, o: 0, t: 1 }]); setDone(true); };
  const addGoal = () => { const a = readGoals(), id = goalId(cat, e.slug); if (!a.some(g => g.id === id)) writeGoals([...a, { id, cat, slug: e.slug, name: e.name }]); setGoal(true); };
  return (<article className="entity">
    <div className="hero">
      {cat === "mod" || cat === "railjack" ? <div className="art" style={{ background: "none", WebkitMaskImage: "none", maskImage: "none" }}><ModCard e={e} big /></div> : <div className="art"><span className="ph"><Logo /></span>{e.image && <img src={imgUrl(e.image)} alt={e.name} width={320} height={320} onError={ev => { ev.currentTarget.style.display = "none"; }} />}</div>}
      <div><p className="muted">{e.type || c.label}{e.isPrime ? " · " : ""}{e.isPrime && <span className="gold">PRIME</span>} <Badge s={status} /></p>
        <h1>{e.name}</h1>{e.description && <p className="lead">{e.description}</p>}
        {e.stats.length > 0 && <dl className="stats">{e.stats.map(([k, v]) => <div key={k}><dt>{k}</dt><dd>{v}</dd></div>)}</dl>}
        <div className="bar"><Link className="btn" to={`/relics?q=${q}`}>Relics with this</Link><Link className="btn" to={`/finder?q=${q}`}>Where it drops</Link>
          <button className="btn" onClick={track} disabled={done}>{done ? "Tracked" : "Track"}</button>
          {e.components.length > 0 && (cat === "warframe" || cat === "weapon") && (goal ? <Link className="btn" to="/roadmap">In Roadmap</Link> : <button className="btn" onClick={addGoal}>Add to Goal</button>)}</div></div></div>
    {cat !== "mod" && cat !== "railjack" && <Details e={e} cat={cat} />}
    {MARKET_ENABLED && e.isPrime && <SetPrice key={e.slug} e={e} />}
    {MARKET_ENABLED && cat === "mod" && <ModPrice key={e.slug} e={e} />}
    {e.facts.length > 0 && <p className="muted">{e.facts.map(([k, v]) => `${k}: ${v}`).join(" · ")}{e.vaulted !== null ? ` · Vaulted: ${e.vaulted ? "yes" : "no"}` : ""}</p>}
    {e.components.length > 0 && <><h2>Components</h2><ul className="list comp">{e.components.map(k => (
      <li key={k.name}><span><b>{k.name}</b>{k.count > 1 ? ` ×${k.count}` : ""}{k.ducats != null && <span className="muted"> · {k.ducats} ducats</span>}<span className="muted"> <Link to={`/farm/${encodeURIComponent(e.name + " " + k.name)}`}>find</Link></span><Sub cs={k.children} /></span>
        <span><span className="muted">{k.drops.length ? k.drops.slice(0, 6).map(d => `${d.location}${d.type ? " (" + d.type + ")" : ""}`).join("; ") : "No acquisition data in this source"}</span>{MARKET_ENABLED && (e.isPrime || k.ducats != null) && <MarketCheck name={`${e.name} ${k.name}`} alt={k.name} />}</span></li>))}</ul></>}
    <Prov rec={rec} /></article>);
}
