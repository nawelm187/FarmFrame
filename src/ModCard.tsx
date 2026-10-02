import type { CSSProperties } from "react";
import { PolIcon } from "./Icons";
import { imgUrl, type Entity } from "./lib/catalog";
const RC: Record<string, string> = { common: "#8B6B4A", uncommon: "#9EA3A6", rare: "#B89A5B", legendary: "#E4E2DC", riven: "#7C6AA6" };
/** Mod card in the spirit of the in-game card: drain and polarity on top, art, name, effect at the chosen rank, rank pips. */
export default function ModCard({ e, rank, big }: { e: Entity; rank?: number; big?: boolean }) {
  const mr = e.maxRank ?? 0, r = Math.min(rank ?? mr, mr), c = RC[e.rarity.toLowerCase()] ?? "#8E9392";
  const ls = e.levelStats?.length ? e.levelStats[Math.min(r, e.levelStats.length - 1)] : [];
  const text = ls.length ? ls : e.description ? [e.description] : [];
  const drain = e.baseDrain == null ? null : e.baseDrain < 0 ? `+${Math.abs(e.baseDrain) + r}` : String(e.baseDrain + r);
  return (<div className={"modcard" + (big ? " big" : "")} style={{ "--mc": c } as CSSProperties}>
    <div className="top"><b>{drain ?? ""}</b><PolIcon pol={e.polarity} size={big ? 22 : 18} /></div>
    <div className="mart">{e.image && <img src={imgUrl(e.image)} alt="" loading="lazy" decoding="async" onError={ev => { ev.currentTarget.style.display = "none"; }} />}</div>
    <h4>{e.name}</h4>
    <p>{text.slice(0, big ? 8 : 3).join(" · ")}</p>
    {mr > 0 && <div className="pips" aria-label={`Rank ${r} of ${mr}`}>{Array.from({ length: Math.min(mr, 10) }, (_, i) => <i key={i} className={i < r ? "on" : ""} />)}</div>}
    <small>{e.type}{e.rarity ? ` · ${e.rarity}` : ""}</small>
  </div>);
}
