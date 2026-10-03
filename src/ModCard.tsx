import { useState, type CSSProperties } from "react";
import { PolIcon } from "./Icons";
import { imgUrl, type Entity } from "./lib/catalog";
import { clean } from "./lib/text";
// Frame colors per rarity (light, base, dark), in the spirit of the in-game bronze / silver / gold / white cards. Drawn in CSS, no game assets used.
const RC: Record<string, [string, string, string]> = {
  common: ["#D2A275", "#9A6B43", "#4E3522"], uncommon: ["#E6E9ED", "#A1A7AE", "#5A5F65"], rare: ["#F3DA92", "#C29B4A", "#6E5526"],
  legendary: ["#FFFFFF", "#D4D9DF", "#80878F"], riven: ["#CDBAF5", "#8A72C0", "#463870"],
};
const FALLBACK: [string, string, string] = ["#A6ABAE", "#757B7F", "#3B4043"];
const ARCHON = /archon|primed|amalgam/i;
/** Mod card in the spirit of the in-game card: metal frame by rarity, drain and polarity over the art, name banner, effect text, rank pips and category. */
export default function ModCard({ e, rank, big }: { e: Entity; rank?: number; big?: boolean }) {
  const [bad, setBad] = useState(false), mr = e.maxRank ?? 0, r = Math.min(rank ?? mr, mr), key = e.rarity.toLowerCase(), [lt, bs, dk] = RC[key] ?? FALLBACK;
  const ls = e.levelStats?.length ? e.levelStats[Math.min(r, e.levelStats.length - 1)] : [];
  const raw = ls.length ? ls : e.description ? [e.description] : [];
  // Each effect on its own line; the source sometimes packs several into one string with line breaks.
  const lines = raw.flatMap(t => clean(t).split("\n")).map(t => t.trim()).filter(Boolean).slice(0, big ? 12 : 5);
  const drain = e.baseDrain == null ? null : e.baseDrain < 0 ? `+${Math.abs(e.baseDrain) + r}` : String(e.baseDrain + r);
  const kind = e.compat || e.type.replace(/\s*Mod$/i, "") || "Mod";
  return (<div className={"modcard" + (big ? " big" : "") + (ARCHON.test(e.name) ? " special" : "")} style={{ "--lt": lt, "--mc": bs, "--dk": dk } as CSSProperties}>
    <div className="mface">
      <div className="mart">
        {e.image && !bad ? <img src={imgUrl(e.image)} alt="" loading="lazy" decoding="async" onError={() => setBad(true)} /> : <span className="noart" aria-hidden="true">{e.name.charAt(0)}</span>}
        {drain != null && <span className="drain" title="Mod capacity cost at this rank"><b>{drain}</b></span>}
        {e.polarity && <span className="mpol" title={e.polarity + " polarity"}><PolIcon pol={e.polarity} size={big ? 20 : 16} /></span>}
      </div>
      <h4>{e.name}</h4>
      <div className="mtext">{lines.map((t, i) => <p key={i}>{t}</p>)}</div>
      {mr > 0 && <div className="pips" role="img" aria-label={`Rank ${r} of ${mr}`}>{Array.from({ length: Math.min(mr, 10) }, (_, i) => <i key={i} className={i < r ? "on" : ""} />)}</div>}
      <small>{kind}{e.rarity ? ` · ${e.rarity}` : ""}</small>
    </div>
  </div>);
}
