import { useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useMany } from "../lib/data";
import { CATS, CAT_SRC, imgUrl, parseCatalog, type Cat } from "../lib/catalog";
import { Badge, Prov, Unavailable } from "./parts";
export default function Explore({ cat }: { cat: Cat }) {
  const c = CATS[cat], [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", [more, setMore] = useState(1);
  const [{ rec, status }] = useMany([{ id: cat, file: "", url: c.url, src: CAT_SRC }]);
  const all = parseCatalog(rec?.data, cat);
  if (!all) return <><h1>{c.label}</h1><Unavailable title={c.label} status={status} why={status === "LOADING" ? "Loading catalog…" : rec?.data ? "Unrecognised data shape, ignored." : "No verified data."} rec={rec} /></>;
  const l = q.trim().toLowerCase(), m = l ? all.filter(e => e.name.toLowerCase().includes(l)) : all, shown = m.slice(0, 60 * more);
  return (<><h1>{c.label}</h1><p className="lead">{all.length} entries from a community dataset. <Badge s={status} /></p>
    <div className="bar"><input aria-label={"Filter " + c.label} placeholder={"Filter " + c.label.toLowerCase()} value={q} onChange={e => { setSp({ q: e.target.value }, { replace: true }); setMore(1); }} /></div>
    <ul className="list cat">{shown.map(e => (
      <li key={e.slug}><span className="thumb">{e.image && <img src={imgUrl(e.image)} alt="" loading="lazy" width={48} height={48} onError={ev => { ev.currentTarget.style.display = "none"; }} />}</span>
        <Link to={`/${cat}/${e.slug}`}>{e.name}</Link><span className="muted">{e.type}{e.isPrime ? " · " : ""}{e.isPrime && <span className="gold">Prime</span>}</span></li>))}
      {!m.length && <li className="muted">No {c.label.toLowerCase()} match "{q}".</li>}</ul>
    {m.length > shown.length && <button className="btn" onClick={() => setMore(more + 1)}>Show more ({m.length - shown.length} left)</button>}<Prov rec={rec} /></>);
}
