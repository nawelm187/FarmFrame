import { SYNDICATE_WIKI, WIKI_VERIFIED } from "../data/syndicateWiki";
import { ACRITHIS, PALLADINO } from "../data/vendors";
/** One place that sells an item: who, what you pay, and what you need first. */
export interface VendorHit { seller: string; price: string; need?: string; url: string; dated: string }
const norm = (s: string) => s.toLowerCase().replace(/\s*\([^)]*\)\s*$/, "").replace(/[^a-z0-9]+/g, " ").trim();
/** Everything the hand-typed vendor data knows about an item name: syndicate offers, Palladino and Acrithis. Empty when none of them sells it. Matches the whole name, ignoring a trailing "(Warframe)". */
export function vendorSources(name: string): VendorHit[] {
  const q = norm(name); if (q.length < 3) return [];
  const out: VendorHit[] = [];
  for (const w of Object.values(SYNDICATE_WIKI)) {
    const seen = new Set<string>();
    for (const o of w.offers) {
      if (norm(o.item) !== q) continue;
      const rk = o.rank != null ? w.ranks.find(r => r.rank === o.rank && r.title !== "Initiation")?.title : undefined, key = `${o.section}|${o.cost}|${o.rank}`;
      if (seen.has(key)) continue; seen.add(key);
      out.push({ seller: w.name + (o.section && !/^Rank \d/.test(o.section) ? ` (${o.section})` : ""), price: `${o.cost.toLocaleString()} ${o.currency ?? "standing"}${o.credits != null ? ` + ${o.credits.toLocaleString()} credits` : ""}`, need: o.rank != null ? `Rank ${o.rank}${rk ? ` (${rk})` : ""}` : undefined, url: w.url, dated: WIKI_VERIFIED });
    }
  }
  for (const w of PALLADINO) if (norm(w.name) === q) out.push({ seller: "Palladino (Kuva Lich weekly shop)", price: `${w.cost} ${w.currency}`, need: w.limit, url: "https://wiki.warframe.com/w/Palladino", dated: "2026-10-07" });
  for (const w of ACRITHIS.wares) if (norm(w) === q) out.push({ seller: "Acrithis (this week's offers, may be outdated)", price: "see the Rotations page", url: "https://wiki.warframe.com/w/Acrithis/Current_Offerings", dated: ACRITHIS.asOf });
  return out;
}
