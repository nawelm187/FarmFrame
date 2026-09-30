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
