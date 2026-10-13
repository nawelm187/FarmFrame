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
import { rankActivities } from "./advisor";
const fis = (tier: string, node: string, over: Partial<{ isHard: boolean; isStorm: boolean }> = {}) => ({ tier, node, missionType: "Capture", expiry: exp, isHard: false, isStorm: false, ...over });
const link = (tier: string, relic: string, owned: number) => ({ tier, relic, rarity: "Common", part: "P (G)", goal: "G", vaulted: false, owned });
it("a relic you do not own makes the activity need setup; an owned one is ready", () => {
  const o = farmNow({ tiers: new Map(), fissures: [fis("Lith", "A (Earth)"), fis("Axi", "B (Earth)")], invasions: null, needed: new Set(), now: Date.now(), exact: [link("Lith", "Lith A1", 0), link("Axi", "Axi B2", 1)] });
  expect(o.map(x => x.key)).toEqual(["fAxi", "fLith"]); expect(o[0].blocks).toEqual([]); expect(o[1].blocks?.[0].kind).toBe("relic"); expect(o[1].blocks?.[0].severity).toBe("blocked");
  expect(rankActivities(o).map(a => a.ready)).toEqual(["ready", "needs"]);
});
it("among fissures of one tier, the one you can start is shown, not a Void Storm", () => {
  const o = farmNow({ tiers: new Map([["Axi", ["P (G)"]]]), fissures: [fis("Axi", "Lu-yan (Saturn Proxima)", { isStorm: true }), fis("Axi", "C (Earth)")], invasions: null, needed: new Set(), now: Date.now(),
    unlock: n => (n.storm ? [{ kind: "railjack", severity: "check", text: "railjack" }] : []) });
  expect(o[0].node).toBe("C (Earth)"); expect(o[0].blocks).toEqual([]);
});
it("a ready activity ranks above a better one that is blocked", () => {
  const o = farmNow({ tiers: new Map(), fissures: [fis("Lith", "A (Earth)"), fis("Axi", "B (Earth)")], invasions: null, needed: new Set(), now: Date.now(), exact: [link("Lith", "Lith A1", 0), { ...link("Lith", "Lith A1", 0), part: "Q (G)" }, link("Axi", "Axi B2", 1)] });
  const r = rankActivities(o); expect(r[0].opp.tier).toBe("Axi"); expect(r[0].ready).toBe("ready");
});
it("invasions carry their node's checks too", () => {
  const o = farmNow({ tiers: new Map(), fissures: null, invasions: [{ node: "Ceres (Ceres)", completed: false, attacker: { reward: { items: ["Plastids"] } } }], needed: new Set(["plastids"]), now: Date.now(), unlock: () => [{ kind: "node", severity: "check", text: "n" }] });
  expect(o[0].node).toBe("Ceres (Ceres)"); expect(o[0].blocks).toHaveLength(1);
});
it("an owned relic is paired with the best fissure you can start, and every node is listed", () => {
  const o = farmNow({ tiers: new Map(), fissures: [fis("Lith", "S (Saturn Proxima)", { isStorm: true }), fis("Lith", "E (Earth)")], invasions: null, needed: new Set(), now: Date.now(), exact: [link("Lith", "Lith A1", 1), link("Lith", "Lith B2", 0)],
    unlock: n => (n.storm ? [{ kind: "railjack", severity: "check", text: "r" }] : []) });
  expect(o[0].plays).toEqual([{ relic: "Lith A1", parts: ["P (G)"], node: "E (Earth)", mission: "Capture", ready: "ready" }]);
  expect(o[0].nodes?.map(n => n.node)).toEqual(["E (Earth)", "S (Saturn Proxima)"]); expect(o[0].nodes?.[1].ready).toBe("check");
});
it("without an owned relic there is nothing to open yet", () => {
  const o = farmNow({ tiers: new Map(), fissures: [fis("Lith", "E (Earth)")], invasions: null, needed: new Set(), now: Date.now(), exact: [link("Lith", "Lith B2", 0)] });
  expect(o[0].plays).toEqual([]);
});
