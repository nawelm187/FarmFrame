import { useDeferredValue, useMemo, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import ItemArt from "../ItemArt";
import PageArt from "../PageArt";
import type { Cat, Component, Entity } from "../lib/catalog";
import { partTradable } from "../lib/trade";
import { useCatalogs } from "../lib/useCatalog";
import { Unavailable } from "./parts";
interface Row { title: string; owner: Entity; cat: Cat; c: Component; link: string; prime: boolean }
const KINDS: [Cat, string][] = [["warframe", "Warframes"], ["weapon", "Weapons"], ["companion", "Companions"], ["archwing", "Archwings"]];
/** Search every part and blueprint of warframes, weapons, companions and archwings. Market prices are only offered for Prime parts. */
export default function Parts() {
  const cat = useCatalogs(["warframe", "weapon", "companion", "archwing"]), [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", kind = sp.get("k") ?? "", prime = sp.get("p") === "1", dq = useDeferredValue(q), [more, setMore] = useState(1);
  const rows = useMemo(() => { const out: Row[] = [];
    for (const [k] of KINDS) for (const e of cat[k]?.items ?? []) for (const c of e.components) {
      const bp = c.name === "Blueprint", title = bp ? `${e.name} Blueprint` : `${e.name} ${c.name}`;
      out.push({ title, owner: e, cat: k, c, link: `/item/${encodeURIComponent(bp ? title : title + " Blueprint")}`, prime: e.isPrime }); }
    return out; }, [cat.warframe?.items, cat.weapon?.items, cat.companion?.items, cat.archwing?.items]);
  const loading = KINDS.some(([k]) => !cat[k]?.items) && !rows.length;
  const set = (k: string, v: string) => { const n = new URLSearchParams(sp); if (v) n.set(k, v); else n.delete(k); setSp(n, { replace: true }); setMore(1); };
  const words = dq.trim().toLowerCase().split(/\s+/).filter(Boolean);
  const list = rows.filter(r => (!kind || r.cat === kind) && (!prime || r.prime) && words.every(w => r.title.toLowerCase().includes(w)));
  if (loading) return <><h1><PageArt name="Parts" size={36} />Parts</h1><Unavailable title="Parts" status={cat.warframe?.status ?? "LOADING"} why="Loading the item catalogs…" rec={cat.warframe?.rec} /></>;
  if (!rows.length) return <><h1><PageArt name="Parts" size={36} />Parts</h1><Unavailable title="Parts" status="ERROR" why="The item catalogs loaded but list no parts. The source format may have changed. Report it with the button below and try again later." rec={cat.warframe?.rec} /></>;
  return (<><h1><PageArt name="Parts" size={36} />Parts</h1><p className="lead">Find any part or blueprint of a Warframe, weapon, companion or Archwing: what it is, where it drops and, for Prime parts, its market price.</p>
    <div className="bar"><input aria-label="Search parts" placeholder='Try "Ash Prime Systems" or "Akbronco"' value={q} onChange={e => set("q", e.target.value)} /></div>
    <div className="chips" role="group" aria-label="Filter"><button className={"relicchip" + (!kind ? " own" : "")} onClick={() => set("k", "")}>All</button>{KINDS.map(([k, l]) => <button key={k} className={"relicchip" + (kind === k ? " own" : "")} onClick={() => set("k", kind === k ? "" : k)}>{l}</button>)}
      <button className={"relicchip" + (prime ? " own" : "")} aria-pressed={prime} onClick={() => set("p", prime ? "" : "1")}>Prime only</button></div>
    {!words.length && !kind && !prime ? <p className="muted">{rows.length} parts and blueprints loaded. Type a name to search.</p> : <>
      <ul className="list comp">{list.slice(0, 40 * more).map(r => { const t = partTradable(r.owner, r.c);
        return (<li key={r.link}><span><ItemArt file={r.c.image ?? r.owner.image} size={36} /> <Link to={r.link}><b>{r.title}</b></Link> {r.prime && <span className="gold">PRIME</span>}
          <span className="muted"> {r.c.ducats != null ? `· ${r.c.ducats} ducats ` : ""}{r.prime ? "" : "· no market price (not tradable) "}</span>{t != null && r.prime && <span className={"tag " + (t ? "FRESH" : "UNAVAILABLE")}>{t ? "Tradable" : "Not tradable"}</span>}</span>
          <span className="muted"><Link to={`/farm/${encodeURIComponent(r.title)}`}>Where to find</Link></span></li>); })}
        {!list.length && <li className="muted">No part matches.</li>}</ul>
      {list.length > 40 * more && <button className="btn" onClick={() => setMore(more + 1)}>Show more ({list.length - 40 * more} left)</button>}</>}
    <p className="muted">Open a part to see its details, how to get it, how hard it is and its price. Prices appear only for Prime parts, because only those can be traded.</p></>);
}
