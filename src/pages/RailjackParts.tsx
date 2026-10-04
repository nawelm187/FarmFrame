import { Link } from "react-router-dom";
import { COMPONENTS, HOUSES, HOW, NOT_COVERED, RAILJACK_SOURCE, TIERS } from "../data/railjack";
/** Ship components, from a hand-written source (not a live feed). Weapons below it come from the item data. */
export default function RailjackParts({ q }: { q: string }) {
  const l = q.trim().toLowerCase(), list = COMPONENTS.filter(c => !l || c.name.toLowerCase().includes(l));
  if (!list.length && l) return null;
  return (<section className="panel"><div className="row"><h2>Ship components</h2><span className="tag STALE" title="Written by hand from the source below; not read from a live data feed">Manual source</span></div>
    <ul className="list comp">{list.map(c => <li key={c.name}><span><b>{c.name}</b><div className="muted">{c.does}</div></span><Link to={`/farm/${encodeURIComponent(c.name)}`}>Search drops</Link></li>)}</ul>
    <h3>Houses</h3><p>{HOUSES.join(", ")}: each house has its own stat focus. Parts exist for every house.</p>
    <h3>Tiers</h3><ul className="sub">{TIERS.map(t => <li key={t.tier}><b>{t.tier}</b> <span className="muted">{t.where}</span></li>)}</ul>
    <h3>How to get them</h3><ul className="sub">{HOW.map((h, i) => <li key={i}>{h}</li>)}</ul>
    <p className="muted">{NOT_COVERED}</p>
    <p className="muted">Source: <a href={RAILJACK_SOURCE.url} target="_blank" rel="noopener noreferrer">{RAILJACK_SOURCE.name}</a>, page dated {RAILJACK_SOURCE.date}. Check it in game before relying on it.</p></section>);
}
