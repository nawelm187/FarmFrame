import { Pic } from "../ItemArt";
import { Link } from "react-router-dom";
import RelicArt from "../RelicArt";
import type { Opp } from "../lib/farmNow";
import { value } from "../lib/farmNow";
import type { Status } from "../lib/data";
import { Badge } from "./parts";
/** "What can I farm now" cards: what to run, which exact relics, which goal moves, and why. Shared by Home and Roadmap. */
export default function OppList({ opps, fisStatus, invStatus }: { opps: Opp[]; fisStatus: Status; invStatus: Status }) {
  /** Only says the top pick is easier than the rest when the data shows it: it has a relic you own and no other option does. */
  const easier = (o: Opp, i: number) => i === 0 && opps.length > 1 && !!o.relics?.some(r => r.owned > 0) && opps.slice(1).every(x => !x.relics?.some(r => r.owned > 0));
  return (<ol className="opps">{opps.map((o, i) => (<li key={o.key}>
    {i === 0 && <span className="tag FRESH">Recommended</span>}
    <div className="row"><b className="oppt">{o.tier && <RelicArt tier={o.tier} size={32} />}{o.title}</b><Link className="btn" to={o.kind === "fissure" ? "/fissures" : "/invasions"}>{o.kind === "fissure" ? "Open fissures" : "Open invasions"}</Link></div>
    {o.relics && o.relics.length > 0 && <div className="chips" aria-label="Exact relics">{o.relics.slice(0, 5).map(r => <Link key={r.relic} className={"relicchip" + (r.owned > 0 ? " own" : "")} to={`/relics?q=${encodeURIComponent(r.relic)}`}><RelicArt tier={o.tier ?? ""} name={r.relic} size={22} /><span>{r.relic}</span><span className="muted">{r.rarity}{r.parts.length > 1 ? ` · ${r.parts.length} parts` : ""}</span>{r.owned > 0 && <span className="tag FRESH">Owned</span>}</Link>)}</div>}
    <div className="muted advrow">Advances: {o.advances.slice(0, 4).map((a, i) => <span key={i} className="advit"><Pic name={a} size={24} /> {a}{i < Math.min(o.advances.length, 4) - 1 ? ", " : ""}</span>)}{o.advances.length > 4 ? ` and ${o.advances.length - 4} more` : ""}</div>
    {o.goals && o.goals.length > 0 && <div className="goalrow">{o.goals.map(g => <span key={g.name} className="tag">{g.name}{g.total ? ` · ${g.have}/${g.total} parts` : ""}</span>)}</div>}
    <div className="muted">Value to your current goals: <b>{value(o.advances.length)}</b></div>
    <details open={i === 0}><summary>Why this?</summary><ul>{o.why.map(w => <li key={w}>{w}</li>)}{easier(o, i) && <li>Lower friction than the other options: you already own a relic for it and the others need you to get one first</li>}<li>Live data: fissures <Badge s={fisStatus} />, invasions <Badge s={invStatus} /></li></ul></details></li>))}</ol>);
}
