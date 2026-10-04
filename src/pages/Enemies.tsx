import { useDeferredValue, useState } from "react";
import { useSearchParams } from "react-router-dom";
import FactionArt from "../FactionArt";
import PageArt from "../PageArt";
import { useMany } from "../lib/data";
import { ENEMY_ALT, ENEMY_SRC, ENEMY_URL, FACTIONS, parseEnemies, type Enemy, type Layer } from "../lib/enemies";
import { DamageIcon } from "../DamageIcon";
import ItemArt from "../ItemArt";
import { Badge, Prov, Unavailable } from "./parts";
const own = import.meta.glob("./../assets/enemies/*.{png,webp,jpg,jpeg}", { eager: true, import: "default", query: "?url" }) as Record<string, string>;
const mine: Record<string, string> = {};
for (const [p, u] of Object.entries(own)) mine[(p.split("/").pop() ?? "").replace(/\.[a-z]+$/i, "").toLowerCase()] = u;
export const enemySlug = (n: string) => n.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
const Mods = ({ m, sign }: { m: Layer["takesMore"]; sign: string }) => <>{m.map(x => <span key={x.el} className="dmgchip"><DamageIcon type={x.el} size={16} /> {x.el} {sign}{Math.abs(x.pct)}%</span>)}</>;
function Card({ e }: { e: Enemy }) {
  const u = mine[enemySlug(e.name)];
  return (<details className="panel enemy"><summary><span className="row"><ItemArt file={u ? null : e.image} size={44} />{u && <img className="itemart" src={u} alt="" width={44} height={44} />}<b>{e.name}</b> <span className="muted"><FactionArt f={e.faction} size={16} />{e.faction}</span></span>
    <span className="muted"> {[e.health != null && `Health ${e.health}`, e.shield ? `Shield ${e.shield}` : null, e.armor ? `Armor ${e.armor}` : null].filter(Boolean).join(" · ")}</span></summary>
    {e.description && <p>{e.description}</p>}
    {e.layers.length > 0 ? e.layers.map(l => <div key={l.kind} className="lay"><b>{l.kind}</b>{l.amount != null && <span className="muted"> ({l.amount})</span>}
      <div>{l.takesMore.length > 0 && <><span className="muted">Weak to </span><Mods m={l.takesMore} sign="+" /></>}</div>
      <div>{l.takesLess.length > 0 && <><span className="muted">Resists </span><Mods m={l.takesLess} sign="-" /></>}</div></div>) : <p className="muted">No damage resistance data for this enemy.</p>}
    {e.drops.length > 0 && <details><summary className="muted">Drops ({e.drops.length})</summary><ul className="sub">{e.drops.slice(0, 40).map((d, i) => <li key={i}>{d.location} <span className="muted">{d.type}{d.rarity ? ` · ${d.rarity}` : ""}{d.chance != null ? ` · ${+(d.chance * 100).toFixed(2)}%` : ""}</span></li>)}</ul></details>}
  </details>);
}
export default function Enemies() {
  const [r] = useMany([{ id: "enemies", file: "", url: ENEMY_URL, alt: ENEMY_ALT, src: ENEMY_SRC, win: 6 * 3_600_000 }]);
  const [sp, setSp] = useSearchParams(), q = sp.get("q") ?? "", fac = sp.get("f") ?? "", dq = useDeferredValue(q), [more, setMore] = useState(1);
  const all = parseEnemies(r.rec?.data);
  if (!all) return <><h1><PageArt name="Enemies" size={36} />Enemies</h1><Unavailable title="Enemies" status={r.status} why={r.status === "LOADING" ? "Loading enemies…" : "No verified data."} rec={r.rec} /></>;
  const l = dq.trim().toLowerCase(), list = all.filter(e => (!fac || e.faction === fac) && (!l || e.name.toLowerCase().includes(l))), shown = list.slice(0, 40 * more);
  return (<><h1><PageArt name="Enemies" size={36} />Enemies</h1><p className="lead">{all.length} enemies with health, shield, armor and what damage types they are weak to or resist. <Badge s={r.status} /></p>
    <div className="bar"><input aria-label="Filter enemies" placeholder="Filter enemies" value={q} onChange={e => { const n = new URLSearchParams(sp); n.set("q", e.target.value); setSp(n, { replace: true }); setMore(1); }} /></div>
    <div className="chips" role="group" aria-label="Faction"><button className={"relicchip" + (!fac ? " own" : "")} onClick={() => { const n = new URLSearchParams(sp); n.delete("f"); setSp(n, { replace: true }); }}>All</button>
      {FACTIONS(all).map(f => <button key={f} className={"relicchip" + (fac === f ? " own" : "")} onClick={() => { const n = new URLSearchParams(sp); n.set("f", f); setSp(n, { replace: true }); setMore(1); }}><FactionArt f={f} size={16} />{f}</button>)}</div>
    {shown.map(e => <Card key={e.name} e={e} />)}{!list.length && <p className="muted">No enemy matches.</p>}
    {list.length > shown.length && <button className="btn" onClick={() => setMore(more + 1)}>Show more ({list.length - shown.length} left)</button>}
    <p className="muted">"Weak to" means the enemy takes more damage of that type; "Resists" means less. Values come from a community dataset and may lag behind the game.</p><Prov rec={r.rec} /></>);
}
