import RarityMark from "../RarityMark";
import { Pic } from "../ItemArt";
import { Link } from "react-router-dom";
import RelicArt from "../RelicArt";
import type { Opp } from "../lib/farmNow";
import { value } from "../lib/farmNow";
import type { Status } from "../lib/data";
import { Badge } from "./parts";
import { READY_LABEL, readiness } from "../lib/unlock";
/** "What can I farm now" cards: what to run, which exact relics, which goal moves, and why. Shared by Home and Roadmap. */
export default function OppList({ opps, fisStatus, invStatus }: { opps: Opp[]; fisStatus: Status; invStatus: Status }) {
  /** Only says the top pick is easier than the rest when the data shows it: it has a relic you own and no other option does. */
  const easier = (o: Opp, i: number) => i === 0 && opps.length > 1 && !!o.relics?.some(r => r.owned > 0) && opps.slice(1).every(x => !x.relics?.some(r => r.owned > 0));
  return (<ol className="opps">{opps.map((o, i) => (<li key={o.key}>
    {i === 0 && readiness(o.blocks) === "ready" && <span className="tag FRESH">Recommended</span>}<span className={"tag " + (readiness(o.blocks) === "ready" ? "FRESH" : readiness(o.blocks) === "check" ? "STALE" : "ERROR")}>{READY_LABEL[readiness(o.blocks)]}</span>
    <div className="row"><b className="oppt">{o.tier && <RelicArt tier={o.tier} size={32} />}{o.title}</b><Link className="btn" to={o.kind === "fissure" ? "/fissures" : "/invasions"}>{o.kind === "fissure" ? "Open fissures" : "Open invasions"}</Link></div>
    {o.plays && o.plays.length > 0 && <ul className="plays" aria-label="What to open where">{o.plays.map(p => <li key={p.relic}><b>Open {p.relic}</b> in {p.mission} at {p.node} <span className="muted">for {p.parts.slice(0, 2).join(", ")}{p.parts.length > 2 ? ` and ${p.parts.length - 2} more` : ""}</span></li>)}</ul>}
    {o.relics && o.relics.length > 0 && <div className="chips" aria-label="Exact relics">{o.relics.slice(0, 5).map(r => <Link key={r.relic} className={"relicchip" + (r.owned > 0 ? " own" : "")} to={`/relics?q=${encodeURIComponent(r.relic)}`}><RelicArt tier={o.tier ?? ""} name={r.relic} size={22} /><span>{r.relic}</span><RarityMark r={r.rarity} />{r.parts.length > 1 && <span className="muted">{r.parts.length} parts</span>}{r.owned > 0 && <span className="tag FRESH">Owned</span>}</Link>)}</div>}
    {o.nodes && o.nodes.length > 1 && <details><summary>{o.nodes.length} active fissures of this tier</summary><ul>{o.nodes.map(n => <li key={n.node + n.mission}>{n.mission} at {n.node}{n.storm ? " (Void Storm)" : ""}{n.hard ? " (Steel Path)" : ""} <span className="tag">{READY_LABEL[n.ready]}</span></li>)}</ul></details>}
    <div className="muted advrow">Advances: {o.advances.slice(0, 4).map((a, i) => <span key={i} className="advit"><Pic name={a} size={24} /> {a}{i < Math.min(o.advances.length, 4) - 1 ? ", " : ""}</span>)}{o.advances.length > 4 ? ` and ${o.advances.length - 4} more` : ""}</div>
    {o.goals && o.goals.length > 0 && <div className="goalrow">{o.goals.map(g => <span key={g.name} className="tag">{g.name}{g.total ? ` · ${g.have}/${g.total} parts` : ""}</span>)}</div>}
    <div className="muted">Value to your current goals: <b>{value(o.advances.length)}</b></div>
    <details open={i === 0 || !!o.blocks?.length}><summary>Why this?</summary><ul>{o.why.map(w => <li key={w}>{w}</li>)}{(o.blocks ?? []).map(b => <li key={b.text}><b>{b.severity === "blocked" ? "Needs: " : "Check: "}</b>{b.text}</li>)}{easier(o, i) && <li>Lower friction than the other options: you already own a relic for it and the others need you to get one first</li>}<li>Live data: fissures <Badge s={fisStatus} />, invasions <Badge s={invStatus} /></li></ul></details></li>))}</ol>);
}
