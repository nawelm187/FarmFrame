import { expect, it } from "vitest";
import { farmNow } from "./farmNow";
const exp = new Date(Date.now() + 3_600_000).toISOString(), old = new Date(Date.now() - 1000).toISOString();
it("combines live fissures and invasions with needs", () => {
  const o = farmNow({
    tiers: new Map([["Axi", ["Chassis (X)", "Systems (X)"]], ["Lith", ["Y (Z)"]]]),
    fissures: [{ tier: "Axi", node: "Mot", missionType: "Survival", expiry: exp, isHard: false, isStorm: false }, { tier: "Lith", node: "A", missionType: "Spy", expiry: old, isHard: false, isStorm: false }],
    invasions: [{ node: "Ceres", completed: false, attacker: { reward: { countedItems: [{ count: 3, type: "Plastids" }] } } }, { node: "Eris", completed: true, defender: { reward: { items: ["Plastids"] } } }],
    needed: new Set(["plastids"]), now: Date.now() });
  expect(o.map(x => x.key)).toEqual(["fAxi", "iCeres".replace("iCeres", "i0")]);
  expect(o[0].advances).toHaveLength(2);
  expect(o[1].advances).toEqual(["Plastids"]);
});
it("with exact relics, only matches fissures of tiers that hold your parts and explains goal and relics", () => {
  const o = farmNow({
    tiers: new Map([["Axi", ["Chassis (X)"]], ["Lith", ["Y (Z)"]]]),
    fissures: [{ tier: "Axi", node: "Mot", missionType: "Survival", expiry: exp, isHard: false, isStorm: false }, { tier: "Lith", node: "A", missionType: "Spy", expiry: exp, isHard: false, isStorm: false }],
    invasions: null, needed: new Set(), now: Date.now(),
    exact: [{ tier: "Lith", relic: "Lith G1", rarity: "Rare", part: "Y (Z)", goal: "Z", vaulted: false, owned: 1 }, { tier: "Lith", relic: "Lith S3", rarity: "Common", part: "Y (Z)", goal: "Z", vaulted: null, owned: 0 }, { tier: "Axi", relic: "Axi V1", rarity: "Rare", part: "Chassis (X)", goal: "X", vaulted: true, owned: 0 }],
    progress: new Map([["Z", { name: "Z", have: 1, total: 4 }]]) });
  expect(o.map(x => x.key)).toEqual(["fLith"]);
  expect(o[0].exact).toBe(true); expect(o[0].relics?.map(r => r.relic)).toEqual(["Lith G1", "Lith S3"]);
  expect(o[0].goals).toEqual([{ name: "Z", have: 1, total: 4 }]); expect(o[0].why.join("|")).toContain("You own: Lith G1");
});
import { usefulInvasion } from "./farmNow";
it("flags invasion rewards that match what you need, on either side", () => {
  const v = { node: "Ceres", completed: false, attacker: { reward: { countedItems: [{ count: 3, type: "Plastids" }] } }, defender: { reward: { items: ["Orokin Reactor Blueprint"] } } };
  expect(usefulInvasion(v, new Set(["orokin reactor blueprint"]))).toEqual(["Orokin Reactor Blueprint"]);
  expect(usefulInvasion(v, new Set())).toEqual([]);
});
