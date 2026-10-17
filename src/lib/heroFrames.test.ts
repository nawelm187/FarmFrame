// Synthetic entries (invented names and dates), not game data: they only check the selection and ordering rules.
import { describe, expect, it } from "vitest";
import type { Entity } from "./catalog";
import { heroFrames } from "./heroFrames";
const NOW = Date.parse("2026-10-14");
const fr = (name: string, o: { prime?: boolean; vaulted?: boolean | null; date?: unknown } = {}) =>
  ({ name, slug: name.toLowerCase().replace(/ /g, "-"), isPrime: o.prime ?? false, vaulted: o.vaulted ?? null, raw: o.date === undefined ? {} : { releaseDate: o.date } }) as unknown as Entity;
describe("heroFrames", () => {
  it("shows unvaulted Primes, newest release first", () => {
    const r = heroFrames([fr("A Prime", { prime: true, vaulted: false, date: "2024-01-05" }), fr("B Prime", { prime: true, vaulted: false, date: "2026-09-01" }), fr("C Prime", { prime: true, vaulted: false, date: "2025-03-10" })], NOW);
    expect(r.map(x => x.name)).toEqual(["B Prime", "C Prime", "A Prime"]); expect(r.every(x => x.why === "prime")).toBe(true);
  });
  it("never shows a vaulted Prime, or a Prime whose vault status is unknown", () => {
    expect(heroFrames([fr("V Prime", { prime: true, vaulted: true, date: "2026-01-01" }), fr("U Prime", { prime: true, vaulted: null, date: "2026-01-01" })], NOW)).toEqual([]);
  });
  it("a Warframe released within 90 days comes first and is labelled new; an old one is not shown", () => {
    const r = heroFrames([fr("Old Frame", { date: "2025-01-01" }), fr("Fresh Frame", { date: "2026-09-20" }), fr("A Prime", { prime: true, vaulted: false, date: "2026-09-01" })], NOW);
    expect(r.map(x => [x.name, x.why])).toEqual([["Fresh Frame", "new"], ["A Prime", "prime"]]);
  });
  it("entries without a usable date keep catalog order after the dated ones, and nothing is guessed", () => {
    const r = heroFrames([fr("X Prime", { prime: true, vaulted: false }), fr("Y Prime", { prime: true, vaulted: false, date: "not a date" }), fr("Z Prime", { prime: true, vaulted: false, date: "2025-05-05" })], NOW);
    expect(r.map(x => x.name)).toEqual(["Z Prime", "X Prime", "Y Prime"]); expect(r[1].date).toBeNull();
  });
  it("future dates are ignored, the list is capped and has no duplicates", () => {
    expect(heroFrames([fr("Soon Frame", { date: "2027-01-01" }), fr("Soon Prime", { prime: true, vaulted: false, date: "2027-01-01" })], NOW)).toEqual([]);
    const many = Array.from({ length: 12 }, (_, i) => fr(`P${i} Prime`, { prime: true, vaulted: false, date: `2025-01-${String(i + 1).padStart(2, "0")}` }));
    expect(heroFrames([...many, many[0]], NOW)).toHaveLength(8); expect(heroFrames([many[0], many[0]], NOW)).toHaveLength(1);
  });
  it("nothing qualifies: empty list so the Home falls back", () => { expect(heroFrames([], NOW)).toEqual([]); });
});
