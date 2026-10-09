import { Link } from "react-router-dom";
import { Pic } from "./ItemArt";
export interface GoalInfo { goal: { id: string; name: string; cat: string; slug: string }; have: number; total: number; pct: number; parts?: unknown }
/** One card per goal: the picture, the name, how many parts you have and a progress bar. Used on Home. */
export default function GoalCards({ info }: { info: GoalInfo[] }) {
  return (<ul className="goalgrid">{info.map(i => (<li key={i.goal.id}><Link className="goalcard" to={`/${i.goal.cat}/${i.goal.slug}`}>
    <span className="gimg"><Pic name={i.goal.name} size={64} /></span>
    <span className="gtx"><b>{i.goal.name}</b>
      {i.parts ? <><span className="muted">{i.have} / {i.total} parts · {i.pct}%</span><span className={"mbar" + (i.pct >= 100 ? " done" : "")} role="progressbar" aria-valuemin={0} aria-valuemax={i.total} aria-valuenow={i.have} aria-label={`${i.goal.name}: ${i.have} of ${i.total} parts`}><i style={{ width: i.pct + "%" }} /></span></>
        : <span className="muted">The data lists no parts for this goal</span>}</span></Link></li>))}</ul>);
}
