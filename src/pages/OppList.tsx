import { Link } from "react-router-dom";
import RelicArt from "../RelicArt";
import type { Opp } from "../lib/farmNow";
import { value } from "../lib/farmNow";
import type { Status } from "../lib/data";
import { Badge } from "./parts";
/** "What can I farm now" cards: what to run, which exact relics, which goal moves, and why. Shared by Home and Roadmap. */
export default function OppList({ opps, fisStatus, invStatus }: { opps: Opp[]; fisStatus: Status; invStatus: Status }) {
  return (<ol className="opps">{opps.map(o => (<li key={o.key}>
    <div className="row"><b className="oppt">{o.tier && <RelicArt tier={o.tier} size={32} />}{o.title}</b><Link className="btn" to={o.kind === "fissure" ? "/fissures" : "/invasions"}>Open</Link></div>
    {o.relics && o.relics.length > 0 && <div className="chips" aria-label="Exact relics">{o.relics.slice(0, 5).map(r => <Link key={r.relic} className={"relicchip" + (r.owned > 0 ? " own" : "")} to={`/relics?q=${encodeURIComponent(r.relic)}`}><RelicArt tier={o.tier ?? ""} name={r.relic} size={22} /><span>{r.relic}</span><span className="muted">{r.rarity}{r.parts.length > 1 ? ` · ${r.parts.length} parts` : ""}</span>{r.owned > 0 && <span className="tag FRESH">Owned</span>}</Link>)}</div>}
    <div className="muted">Advances: {o.advances.slice(0, 4).join(", ")}{o.advances.length > 4 ? ` and ${o.advances.length - 4} more` : ""}</div>
    {o.goals && o.goals.length > 0 && <div className="goalrow">{o.goals.map(g => <span key={g.name} className="tag">{g.name}{g.total ? ` · ${g.have}/${g.total} parts` : ""}</span>)}</div>}
    <div className="muted">Value to your current goals: <b>{value(o.advances.length)}</b></div>
    <details><summary>Why this?</summary><ul>{o.why.map(w => <li key={w}>{w}</li>)}<li>Live data: fissures <Badge s={fisStatus} />, invasions <Badge s={invStatus} /></li></ul></details></li>))}</ol>);
}
