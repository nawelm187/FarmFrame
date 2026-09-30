import { useState } from "react";
import { Link } from "react-router-dom";
import { readTracked, writeTracked, type Tracked } from "../lib/track";
export default function Tracking() {
  const [list, setList] = useState<Tracked[]>(readTracked), [n, setN] = useState(""), [o, setO] = useState(""), [t, setT] = useState("");
  const commit = (a: Tracked[]) => { setList(a); writeTracked(a); };
  return (<><h1>Tracking</h1><p className="lead">Manual progress. Stored only in this browser.</p>
    <div className="bar"><input aria-label="Name" placeholder="Item or resource name" value={n} onChange={e => setN(e.target.value)} />
      <input aria-label="Owned" type="number" min={0} placeholder="Owned" value={o} onChange={e => setO(e.target.value)} style={{ width: "6rem" }} />
      <input aria-label="Needed" type="number" min={1} placeholder="Needed" value={t} onChange={e => setT(e.target.value)} style={{ width: "6rem" }} />
      <button className="btn" onClick={() => { const need = +t; if (!n.trim() || !(need > 0)) return; commit([...list, { n: n.trim(), o: +o || 0, t: need }]); setN(""); setO(""); setT(""); }}>Add</button></div>
    {!list.length ? <p className="muted">No tracked items yet. Add something you need and FarmFrame will show where to farm it.</p> :
      <div className="wrap"><table><thead><tr><th>Name</th><th>Owned</th><th>Needed</th><th>Missing</th><th></th></tr></thead><tbody>
        {list.map((m, i) => <tr key={i}><td>{m.n}</td><td>{m.o}</td><td>{m.t}</td><td>{Math.max(0, m.t - m.o)}</td>
          <td><Link to={`/finder?q=${encodeURIComponent(m.n)}`}>Where to farm</Link> <button className="btn" onClick={() => commit(list.filter((_, j) => j !== i))}>Remove</button></td></tr>)}</tbody></table></div>}</>);
}
