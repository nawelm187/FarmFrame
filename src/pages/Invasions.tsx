import { useWorld } from "../lib/data";
import { Badge, Prov, Unavailable } from "./parts";
interface Side { faction?: string; reward?: { countedItems?: { count: number; type: string }[]; items?: string[] } }
interface Inv { id: string; node: string; desc: string; completed: boolean; completion: number; attacker?: Side; defender?: Side }
const isInv = (d: unknown): d is Inv[] => Array.isArray(d);
const rw = (s?: Side) => { const c = s?.reward?.countedItems?.map(i => `${i.count}x ${i.type}`) ?? [], i = s?.reward?.items ?? []; return [...c, ...i].join(", ") || "None"; };
export default function Invasions() {
  const { data, status, rec } = useWorld("invasions", isInv);
  if (!data) return <><h1>Invasions</h1><Unavailable title="Invasions" status={status} why="No verified data." rec={rec} /></>;
  const a = data.filter(i => !i.completed);
  return (<><h1>Invasions</h1><p><Badge s={status} /></p>
    <div className="wrap"><table><thead><tr><th>Node</th><th>Type</th><th>Attacker reward</th><th>Defender reward</th><th>Progress</th></tr></thead><tbody>
      {a.map(i => <tr key={i.id}><td>{i.node}</td><td>{i.desc}</td><td>{i.attacker?.faction}: {rw(i.attacker)}</td><td>{i.defender?.faction}: {rw(i.defender)}</td><td>{Math.max(0, Math.min(100, +i.completion || 0)).toFixed(0)}%</td></tr>)}
      {!a.length && <tr><td colSpan={5} className="muted">No active invasions.</td></tr>}</tbody></table></div><Prov rec={rec} /></>);
}
