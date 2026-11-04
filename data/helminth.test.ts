import { expect, it } from "vitest";
import { FEED, INFUSE, METAMORPHOSIS, SECRETIONS, SUBSUMABLE } from "./helminth";
it("Metamorphosis totals add up and the step grows by 1,125 each rank", () => {
  let sum = 0; for (const [r, step, total] of METAMORPHOSIS) { sum += step; expect(total).toBe(sum); if (r >= 2) expect(step - METAMORPHOSIS[r - 1][1]).toBe(1125); }
  expect(METAMORPHOSIS).toHaveLength(16);
});
it("every secretion has resources and the three double-secretion ones are marked", () => {
  for (const s of SECRETIONS) expect(FEED[s].length > 5).toBe(true);
  const dbl = SECRETIONS.flatMap(s => FEED[s].filter(f => f[2]).map(f => f[1])).sort(); expect(dbl).toEqual(["Ganglion", "Lucent Teroglobe", "Pustulite"]);
  const names = SECRETIONS.flatMap(s => FEED[s].map(f => f[1])); expect(new Set(names).size).toBe(names.length);
});
it("each subsumable row costs three different secretions that are valid percentages", () => {
  expect(SUBSUMABLE.length > 60).toBe(true);
  for (const [name, , , sub, inj] of SUBSUMABLE) {
    expect(sub).toHaveLength(3); expect(new Set(sub.map(c => c[0])).size).toBe(3);
    for (const [s, p] of [...sub, ...(inj ?? [])]) { expect(SECRETIONS.includes(s as never)).toBe(true); expect(p > 0 && p <= 100).toBe(true); }
    if (inj) { expect(inj).toHaveLength(3); expect(new Set(inj.map(c => c[0])).size).toBe(3); }
    expect(name.length > 0).toBe(true);
  }
});
/** Yareli is shown with an overlap on the wiki itself (Pheromones and Bile in both columns); kept as shown. */
const WIKI_ODD = ["Yareli"];
it("subsuming and injecting use different secretions (three each)", () => {
  for (const [name, , , sub, inj] of SUBSUMABLE) if (inj && sub[0][1] !== 82.5 && !WIKI_ODD.includes(name)) { const a = sub.map(c => c[0]), b = inj.map(c => c[0]); if (a.some(x => b.includes(x))) throw new Error("overlap " + name); }
  expect(INFUSE.length > 3).toBe(true);
});
