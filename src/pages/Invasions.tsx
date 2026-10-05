import FactionArt from "../FactionArt";
import PageArt from "../PageArt";
import { Pic } from "../ItemArt";
import { useWorld } from "../lib/data";
import { Badge, Prov, Unavailable } from "./parts";
interface Side { faction?: string; reward?: { countedItems?: { count: number; type: string }[]; items?: string[] } }
interface Inv { id: string; node: string; desc: string; completed: boolean; completion: number; attacker?: Side; defender?: Side }
const isInv = (d: unknown): d is Inv[] => Array.isArray(d);
const Rw = ({ s }: { s?: Side }) => { const c = s?.reward?.countedItems ?? [], i = s?.reward?.items ?? [];
  if (!c.length && !i.length) return <>None</>;
  return <>{c.map((x, k) => <span key={"c" + k} className="advit"><Pic name={x.type} size={22} />{x.count}x {x.type}</span>)}{i.map((x, k) => <span key={"i" + k} className="advit"><Pic name={x} size={22} />{x}</span>)}</>; };
const Fac = ({ f }: { f?: string }) => <span className="muted"><FactionArt f={f} size={22} />{f ?? "Unknown"}:</span>;
export default function Invasions() {
  const { data, status, rec } = useWorld("invasions", isInv);
  if (!data) return <><h1><PageArt name="Invasions" size={36} />Invasions</h1><Unavailable title="Invasions" status={status} why="No verified data." rec={rec} /></>;
  const a = data.filter(i => !i.completed);
  return (<><h1><PageArt name="Invasions" size={36} />Invasions</h1><p><Badge s={status} /></p>
    <div className="wrap"><table><thead><tr><th>Node</th><th>Type</th><th>Attacker reward</th><th>Defender reward</th><th>Progress</th></tr></thead><tbody>
      {a.map(i => <tr key={i.id}><td>{i.node}</td><td>{i.desc}</td><td><Fac f={i.attacker?.faction} /> <Rw s={i.attacker} /></td><td><Fac f={i.defender?.faction} /> <Rw s={i.defender} /></td><td>{Math.max(0, Math.min(100, +i.completion || 0)).toFixed(0)}%</td></tr>)}
      {!a.length && <tr><td colSpan={5} className="muted">No active invasions.</td></tr>}</tbody></table></div><Prov rec={rec} /></>);
}
