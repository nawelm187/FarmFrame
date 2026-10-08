import { useDeferredValue, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useCatalog } from "../lib/useCatalog";
import { CATS, imgRetry, imgUrl, type Cat } from "../lib/catalog";
import ModCard from "../ModCard";
import CompanionMods from "./CompanionMods";
import RailjackParts from "./RailjackParts";
import RailjackWeapons from "./RailjackWeapons";
import { Badge, Prov, Unavailable } from "./parts";
/** Categories where an item can have a Prime version. Mods and Railjack do not. */
const PRIMEABLE: Cat[] = ["warframe", "weapon", "companion", "archwing"];
export default function Explore({ cat }: { cat: Cat }) {
  const c = CATS[cat], [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", [more, setMore] = useState(1), dq = useDeferredValue(q);
  const { items: raw, rec, status } = useCatalog(cat), all = raw && cat === "warframe" ? raw.filter(e => e.name !== "Helminth") : raw;
  if (!all) return <><h1>{c.label}</h1><Unavailable title={c.label} status={status} why={status === "LOADING" ? "Loading catalog…" : rec?.data ? "Unrecognised data shape, ignored." : "No verified data."} rec={rec} /></>;
  const nPrime = all.filter(e => e.isPrime).length, canSplit = PRIMEABLE.includes(cat) && nPrime > 0 && nPrime < all.length;
  const v = canSplit && (sp.get("v") === "prime" || sp.get("v") === "normal") ? (sp.get("v") as "prime" | "normal") : "all";
  const pool = v === "prime" ? all.filter(e => e.isPrime) : v === "normal" ? all.filter(e => !e.isPrime) : all;
  const l = dq.trim().toLowerCase(), m = l ? pool.filter(e => e.name.toLowerCase().includes(l)) : pool, shown = m.slice(0, 60 * more);
  const setV = (x: "all" | "prime" | "normal") => { const n = new URLSearchParams(sp); if (x === "all") n.delete("v"); else n.set("v", x); setSp(n, { replace: true }); setMore(1); };
  return (<><h1>{c.label}</h1><p className="lead">{all.length} entries from a community dataset. <Badge s={status} />{cat === "warframe" && <> The Helminth has its own page: <Link to="/helminth">Helminth</Link>.</>}</p>
    <div className="bar"><input aria-label={"Filter " + c.label} placeholder={"Filter " + c.label.toLowerCase()} value={q} onChange={e => { const n = new URLSearchParams(sp); if (e.target.value) n.set("q", e.target.value); else n.delete("q"); setSp(n, { replace: true }); setMore(1); }} /></div>
    {canSplit && <div className="chips" role="group" aria-label="Prime or normal">{([["all", "All", all.length], ["prime", "Prime", nPrime], ["normal", "Normal", all.length - nPrime]] as const).map(([k, t, n]) => <button key={k} className={"btn" + (v === k ? " on" : "")} aria-pressed={v === k} onClick={() => setV(k)}>{t} <span className="muted">{n}</span></button>)}</div>}
    {cat === "mod" || cat === "railjack" ? <div className="cards">{shown.map(e => <Link key={e.slug} to={`/${cat}/${e.slug}`} className="cardlink"><ModCard e={e} /></Link>)}{!m.length && <p className="muted">No {c.label.toLowerCase()} match "{q}".</p>}</div> : <ul className="list cat">{shown.map(e => (
      <li key={e.slug}><span className="thumb">{e.image && <img src={imgUrl(e.image)} alt="" loading="lazy" decoding="async" width={48} height={48} onError={ev => { if (!imgRetry(ev)) ev.currentTarget.style.display = "none"; }} />}</span>
        <Link to={`/${cat}/${e.slug}`}>{e.name}</Link><span className="muted">{e.type}{e.isPrime ? " · " : ""}{e.isPrime && <span className="gold">Prime</span>}</span></li>))}
      {!m.length && <li className="muted">No {c.label.toLowerCase()} match{q ? ` "${q}"` : ""}{v !== "all" ? ` among ${v === "prime" ? "Prime" : "normal"} ones` : ""}.</li>}</ul>}
    {m.length > shown.length && <button className="btn" onClick={() => setMore(more + 1)}>Show more ({m.length - shown.length} left)</button>}{cat === "companion" && <CompanionMods q={dq} />}{cat === "railjack" && <><RailjackParts q={dq} /><RailjackWeapons q={dq} /></>}<Prov rec={rec} /></>);
}
