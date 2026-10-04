import { useDeferredValue, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ItemArt, { bundled } from "../ItemArt";
import PageArt from "../PageArt";
import { useMany } from "../lib/data";
import { FILES, parseThings, pct, resAlt, resUrl, RES_SRC, type Thing } from "../lib/resources";
import { Badge, Prov, Unavailable } from "./parts";
const own = (t: Thing) => { const b = bundled(t.name); return b ? "bundled:" + b : t.image; };
function Card({ t }: { t: Thing }) {
  return (<details className="panel enemy"><summary><span className="row"><ItemArt file={own(t)} size={48} /><b>{t.name}</b> <span className="muted">{t.type}</span></span><span className="muted"> {t.drops.length ? `${t.drops.length} drop source${t.drops.length === 1 ? "" : "s"}` : "no drop data"}{t.tradable === false ? " · not tradable" : ""}</span></summary>
    {t.description && <p>{t.description}</p>}
    {t.drops.length > 0 ? <><h4>Where to farm</h4><ul className="sub">{t.drops.slice(0, 12).map((d, i) => <li key={i}>{d.location} <span className="muted">{[d.type, d.rarity, pct(d.chance) != null ? pct(d.chance) + "%" : ""].filter(Boolean).join(" · ")}</span></li>)}</ul></> : <p className="muted">This source lists no drops for it.</p>}
    <Link to={`/farm/${encodeURIComponent(t.name)}`}>Search the official drop tables</Link>
  </details>);
}
/** Resources and items (Ferrite, Orokin Cell, Forma and so on): picture, what it is and where it drops. */
export default function Resources() {
  const [sp, setSp] = useSearchParams(), tab = sp.get("t") === "items" ? "items" : "resources", q = sp.get("q") ?? "", kind = sp.get("k") ?? "", dq = useDeferredValue(q), [more, setMore] = useState(1);
  const f = FILES[tab], [r] = useMany([{ id: "things:" + tab, file: "", url: resUrl(f), alt: resAlt(f), src: RES_SRC, win: 6 * 3_600_000 }]);
  const all = parseThings(r.rec?.data), set = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); if (k === "t") { n.delete("k"); } setSp(n, { replace: true }); setMore(1); };
  const head = <><h1><PageArt name="Resources" size={36} />Resources and items</h1>
    <div className="chips" role="tablist" aria-label="Kind"><button role="tab" aria-selected={tab === "resources"} className={"relicchip" + (tab === "resources" ? " own" : "")} onClick={() => set("t", "")}>Resources</button><button role="tab" aria-selected={tab === "items"} className={"relicchip" + (tab === "items" ? " own" : "")} onClick={() => set("t", "items")}>Items</button></div></>;
  if (!all) return <>{head}<Unavailable title="Resources" status={r.status} why={r.status === "LOADING" ? "Loading…" : "No verified data."} rec={r.rec} /></>;
  const l = dq.trim().toLowerCase(), kinds = [...new Set(all.map(t => t.type))].sort(), list = all.filter(t => (!kind || t.type === kind) && (!l || t.name.toLowerCase().includes(l))), shown = list.slice(0, 40 * more);
  return (<>{head}<p className="lead">{all.length} {tab} with their picture and where they drop. <Badge s={r.status} /></p>
    <div className="bar"><input aria-label="Filter" placeholder={`Filter ${tab}`} value={q} onChange={e => set("q", e.target.value)} />
      <select aria-label="Type" value={kind} onChange={e => set("k", e.target.value)}><option value="">All types</option>{kinds.map(k => <option key={k}>{k}</option>)}</select></div>
    {shown.map(t => <Card key={t.name} t={t} />)}{!list.length && <p className="muted">Nothing matches.</p>}
    {list.length > shown.length && <button className="btn" onClick={() => setMore(more + 1)}>Show more ({list.length - shown.length} left)</button>}
    <p className="muted">Drop chances come from a community copy of the official tables. Where a resource has no listed source, use the drop-table search.</p><Prov rec={r.rec} /></>);
}
