import { expect, it } from "vitest";
import { ALL_SYNDICATES, FACTION, RANKS, keyOf } from "./syndicateInfo";
import { NIGHTWAVE_SERIES, SYNDICATE_WIKI } from "./syndicateWiki";
it("has an entry for every syndicate", () => {
  for (const n of ALL_SYNDICATES) expect(!!SYNDICATE_WIKI[keyOf(n)], n).toBe(true);
  expect(Object.keys(SYNDICATE_WIKI).length).toBe(ALL_SYNDICATES.length);
});
it("faction ranks agree with the shared rank table", () => {
  for (const k of Object.keys(FACTION)) for (const r of SYNDICATE_WIKI[k].ranks) {
    const base = RANKS.find(x => x.rank === r.rank); if (!base || r.title === "Initiation" || r.title === "Neutral") continue;
    expect(r.max, k + " " + r.rank).toBe(base.max);
  }
});
it("every offer has a positive cost and a source url", () => {
  for (const [k, w] of Object.entries(SYNDICATE_WIKI)) { expect(/^https:\/\/wiki\.warframe\.com\//.test(w.url), k).toBe(true); for (const o of w.offers) { expect(o.cost > 0 && o.item.trim().length > 1, k + " " + o.item).toBe(true); } }
});
it("the rank-up standing given up equals the previous rank's maximum", () => {
  for (const k of Object.keys(FACTION)) for (const r of SYNDICATE_WIKI[k].ranks) { const prev = RANKS.find(x => x.rank === r.rank - 1); if (r.standing && prev && r.rank > 0) expect(r.standing, k + " " + r.rank).toBe(prev.max); }
});
it("Nightwave series ranks climb by 10,000", () => {
  const r = NIGHTWAVE_SERIES.rewards.filter(x => x.rank <= 30); r.forEach(x => expect(x.standing).toBe(x.rank * 10000));
});
