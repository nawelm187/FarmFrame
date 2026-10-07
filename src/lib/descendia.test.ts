import { describe, expect, it } from "vitest";
import { descendiaView, rewardsFor, words } from "./descendia";
import { alertsView } from "./alerts";
const ch = (index: number, typeKey: string, challengeKey: string) => ({ index, typeKey, challengeKey });
describe("descendiaView", () => {
  const v = descendiaView({ activation: "2026-10-05T00:00:00.000Z", expiry: "2026-10-12T00:00:00.000Z", challenges: [ch(3, "DT_RACE", "BasicRace"), ch(1, "DT_COLLECTION", "NC_SlipAndSlide"), ch(7, "DT_PROTOFRAME", "Wisp"), ch(17, "DT_BOSS", "Kullervo"), ch(9, "DT_ALCHEMY", "ShockingLeech")] })!;
  it("orders floors and names the known kinds", () => { expect(v.floors.map(f => f.index)).toEqual([1, 3, 7, 9, 17]); expect(v.floors[1].kind).toBe("Time Tribulation"); expect(v.floors[2].kind).toBe("Marie's Sanctuary"); });
  it("does not invent names for unknown kinds", () => { expect(v.floors[0].kind).toBe("Collection"); expect(v.floors[0].penance).toBe("Slip And Slide"); });
  it("skips the modifier on basic floors and uses the boss name", () => { expect(v.floors[1].penance).toBeNull(); expect(v.floors[4].kind).toBe("Assassination: Kullervo"); expect(v.floors[3].penance).toBe("Shocking Leech"); });
  it("is null without floors", () => { expect(descendiaView({})).toBeNull(); expect(descendiaView({ challenges: [] })).toBeNull(); expect(words("NC_Security_Spin")).toBe("Security Spin"); });
});
describe("rewards", () => {
  it("differs between normal and Steel Path", () => { expect(rewardsFor("steel", 18)[0]).toMatchObject({ name: "Steel Essence", qty: "25" }); expect(rewardsFor("normal", 18).some(r => r.name === "Steel Essence")).toBe(false); expect(rewardsFor("normal", 3)).toEqual([]); });
});
describe("alertsView", () => {
  const a = (id: string, expiry: string, over = {}) => ({ id, expiry, mission: { node: "Ganymede (Jupiter)", type: "Disruption", faction: "Corpus", minEnemyLevel: 20, maxEnemyLevel: 30, reward: { items: ["Conquera Kuaka Floof"], countedItems: [{ type: "Conquera Kuaka Floof", count: 1 }], credits: 10000 }, ...over } });
  const now = Date.parse("2026-10-05T12:00:00Z");
  it("keeps active alerts, soonest first, without duplicating rewards", () => {
    const r = alertsView([a("b", "2026-10-15T18:00:00Z"), a("a", "2026-10-06T18:00:00Z"), a("old", "2026-10-01T00:00:00Z")], now);
    expect(r.map(x => x.id)).toEqual(["a", "b"]); expect(r[0].rewards).toEqual([{ name: "Conquera Kuaka Floof", count: 1 }]); expect(r[0].levels).toEqual([20, 30]); expect(r[0].title).toBe("Conquera Kuaka Floof");
  });
  it("handles empty and malformed data", () => { expect(alertsView([], now)).toEqual([]); expect(alertsView(null, now)).toEqual([]); expect(alertsView([{ id: "x" }], now)).toEqual([]); });
});
import { usefulIn } from "./descendia";
it("finds needed items among rewards and inside 'one of' pools", () => {
  const g = [{ name: "Riven", pool: ["Zenurik Blueprint", "Forma Blueprint"] }, { name: "Orokin Catalyst" }];
  expect(usefulIn(g, new Set(["forma blueprint", "orokin catalyst"]))).toEqual(["Forma Blueprint", "Orokin Catalyst"]);
  expect(usefulIn(g, new Set(["x"]))).toEqual([]);
});
