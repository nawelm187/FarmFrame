import { useState, type CSSProperties } from "react";
import { PolIcon } from "./Icons";
import { imgRetry, imgUrl, type Entity } from "./lib/catalog";
import { clean } from "./lib/text";
import { useT } from "./i18n";
import { TIER_KEY, TIER_NAME, isPrimedMod, modTier } from "./lib/modTier";
import { FRAMES, cfgFor, frameClass, frameFor, frameVars } from "./lib/modFrames";
/** Mod card in the spirit of the in-game card: metal frame by quality (bronze, silver, gold, platinum, Amalgam, Archon, Riven; Primed glows), cost and polarity over the art, rank pips, name banner, effect text and category. `mini` is the compact card of the build editor. */
export default function ModCard({ e, rank, big, mini, drain: drainIn }: { e: Entity; rank?: number; big?: boolean; mini?: boolean; drain?: number | string | null }) {
  const tr = useT();
  const [bad, setBad] = useState(false), mr = e.maxRank ?? 0, r = Math.min(rank ?? mr, mr), tier = modTier(e), tierLabel = TIER_NAME[tier] ?? (tier in TIER_KEY ? tr(TIER_KEY[tier as keyof typeof TIER_KEY]) : e.rarity);
  const ls = e.levelStats?.length ? e.levelStats[Math.min(r, e.levelStats.length - 1)] : [];
  const raw = ls.length ? ls : e.description ? [e.description] : [];
  // Each effect on its own line; the source sometimes packs several into one string with line breaks.
  const lines = raw.flatMap(t => clean(t).split("\n")).map(t => t.trim()).filter(Boolean).slice(0, big ? 12 : 5);
  const drain = drainIn !== undefined ? (drainIn == null ? null : String(drainIn)) : e.baseDrain == null ? null : e.baseDrain < 0 ? `+${Math.abs(e.baseDrain) + r}` : String(e.baseDrain + r);
  // An image frame from src/assets/modframes/ replaces the CSS frame for this quality when there is one (see that folder's LEEME.md).
  const fr = frameFor(tier, isPrimedMod(e.name), FRAMES), cfg = fr ? cfgFor(fr.key) : null;
  const kind = e.compat || e.type.replace(/\s*Mod$/i, "") || "Mod";
  return (<div className={"modcard t-" + tier + (big ? " big" : "") + (mini ? " mini" : "") + (isPrimedMod(e.name) ? " primed" : "") + (cfg ? " " + frameClass(cfg.mode) : "")} style={fr && cfg ? (frameVars(fr.url, cfg) as CSSProperties) : undefined}>
    <div className="mframe"><div className="mface">
      <div className="mart">
        {e.image && !bad ? <img src={imgUrl(e.image)} alt="" loading="lazy" decoding="async" onError={ev => { if (!imgRetry(ev)) setBad(true); }} /> : <span className="noart" aria-hidden="true">{e.name.charAt(0)}</span>}
        {(drain != null || e.polarity) && <span className="mtag">{drain != null && <b title={tr("modDrain")}>{drain}</b>}{e.polarity && <span className="mpol" title={tr("icPol", { name: e.polarity.charAt(0).toUpperCase() + e.polarity.slice(1) })}><PolIcon pol={e.polarity} size={mini ? 14 : big ? 22 : 18} /></span>}</span>}
        {mr > 0 && <div className="pips" role="img" aria-label={`${r}/${mr}`}>{Array.from({ length: Math.min(mr, 10) }, (_, i) => <i key={i} className={i < r ? "on" : ""} />)}</div>}
      </div>
      <h4>{e.name}</h4>
      <div className="mtext">{lines.map((t, i) => <p key={i}>{t}</p>)}</div>
      <small>{kind}{tierLabel ? ` · ${tierLabel}` : ""}</small>
    </div></div>
    {cfg && <i className="mfimg" aria-hidden="true" />}
  </div>);
}
