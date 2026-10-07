import { Link } from "react-router-dom";
import RelicArt from "../RelicArt";
import { Pic } from "../ItemArt";
import type { Cat, Entity } from "../lib/catalog";
import { useMany, useWorld } from "../lib/data";
import { STATES, label, nextAction, planParts, relicsOf, type Fis } from "../lib/exact";
import { goalId, readGoals, writeGoals } from "../lib/goals";
import { parseVault, VAULT_ALT, VAULT_SRC, VAULT_URL } from "../lib/vault";
import { useState } from "react";
import { Skeleton } from "./parts";
const isFis = (d: unknown): d is Fis[] => Array.isArray(d);
/** Everything needed to get an item that is built from parts (a Warframe, weapon, companion or Archwing): each part, its best relics, what is running now and the next step. No extra clicks. */
export default function SetFarm({ e, cat }: { e: Entity; cat: Cat }) {
  const [rr, vr] = useMany([{ id: "relics", file: "relics.json" }, { id: "relicsVault", file: "", url: VAULT_URL, alt: VAULT_ALT, src: VAULT_SRC }]);
  const fis = useWorld("fissures", isFis), relics = relicsOf(rr.rec?.data), vault = parseVault(vr.rec?.data);
  const goal = { id: goalId(cat, e.slug), cat, slug: e.slug, name: e.name }, [added, setAdded] = useState(() => readGoals().some(g => g.id === goal.id));
  const plans = planParts([goal], () => e, {}, relics, vault);
  const add = () => { const a = readGoals(); if (!a.some(g => g.id === goal.id)) writeGoals([...a, goal]); setAdded(true); };
  return (<section className="gcard" aria-label={`How to get ${e.name}`}>
    <div className="row"><h2>How to get {e.name}</h2>{added ? <Link className="btn" to="/roadmap">In your goals</Link> : <button className="btn" onClick={add}>Add to my goals</button>}</div>
    <p className="muted">{e.name} is built from {e.components.length} part{e.components.length === 1 ? "" : "s"}. For each one: the best relics to open, whether a fissure for it is running now, and where else it comes from.</p>
    {!relics && <Skeleton />}
    <ul className="list comp">{plans.map(p => { const n = nextAction(p, fis.data, {}, !!relics), live = p.relics.filter(r => r.vaulted !== true).slice(0, 3);
      return (<li key={p.part.name}><span><Pic name={`${e.name} ${p.part.name}`} size={36} /> <b>{label(p)}</b>{p.part.count > 1 && <span className="muted"> ×{p.part.count}</span>}
        <div className="muted">{n.text}</div>
        {live.length > 0 && <div className="chips" aria-label="Best relics">{live.map(r => <Link key={r.name} className="relicchip" to={`/relics?q=${encodeURIComponent(r.name)}`}><RelicArt tier={r.tier} name={r.name} size={20} /><span>{r.name}</span><span className={"rar " + r.rarity}>{r.rarity}</span><span className="muted">{STATES.filter(s => r.chance[s] != null).slice(0, 1).map(s => `${r.chance[s]}%`)}</span></Link>)}</div>}
        {p.relics.length > 0 && !live.length && <div className="muted">Every relic for this part is vaulted. It comes from trading or Varzia.</div>}
        {!p.relics.length && p.other.length > 0 && <div className="muted">Also from: {p.other.slice(0, 3).map(d => d.location).join("; ")}</div>}
        <Link to={`/item/${encodeURIComponent(`${e.name} ${p.part.name}`)}`}>Part page, market price and all sources</Link></span></li>); })}</ul>
    {relics && !plans.length && <p className="muted">The data lists no parts for {e.name}.</p>}
  </section>);
}
