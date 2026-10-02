import { expect, it } from "vitest";
import type { Component, Entity } from "./catalog";
import { nextAction, planParts, refinement, relicsForPart, relicSources, tierPlans } from "./exact";
import type { Relic, Row } from "./drops";
const k = (name: string, count = 1, drops: Component["drops"] = []): Component => ({ name, count, drops, children: [] });
const rel = (name: string, rewards: [string, string, number][], radiant: [string, string, number][] = rewards): Relic => ({ name, tier: name.split(" ")[0], st: { Intact: rewards.map(([itemName, rarity, chance]) => ({ itemName, rarity, chance })), Radiant: radiant.map(([itemName, rarity, chance]) => ({ itemName, rarity, chance })) } });
const relics = [
  rel("Lith G1", [["Rhino Prime Neuroptics Blueprint", "Rare", 2], ["Forma Blueprint", "Common", 25.33]], [["Rhino Prime Neuroptics Blueprint", "Rare", 10], ["Forma Blueprint", "Common", 20]]),
  rel("Lith S3", [["Rhino Prime Neuroptics Blueprint", "Common", 25.33], ["Rhino Prime Systems Blueprint", "Uncommon", 11]]),
  rel("Axi V1", [["Rhino Prime Systems Blueprint", "Rare", 2]]),
];
const rhino = { name: "Rhino Prime", slug: "rhino-prime", components: [k("Neuroptics", 1, [{ location: "Lith G1 Relic", type: "" }]), k("Systems", 1, [{ location: "Axi V1 Relic", type: "" }]), k("Blueprint", 1, [{ location: "Orokin Derelict", type: "" }])] } as unknown as Entity;
const goal = { id: "warframe:rhino-prime", cat: "warframe" as const, slug: "rhino-prime", name: "Rhino Prime" };
it("finds the exact relics for a part, with chance per refinement and vault status", () => {
  const o = relicsForPart(relics, "Rhino Prime", k("Neuroptics"), new Map([["Lith G1", true]]));
  expect(o.map(x => x.name).sort()).toEqual(["Lith G1", "Lith S3"]);
  const g1 = o.find(x => x.name === "Lith G1")!;
  expect(g1.chance).toEqual({ Intact: 2, Radiant: 10 }); expect(g1.vaulted).toBe(true); expect(o.find(x => x.name === "Lith S3")!.vaulted).toBeNull();
  expect(refinement(g1)).toEqual({ best: "Radiant", from: 2, to: 10, better: true });
});
it("plans missing parts, stacks relics and ranks vaulted ones last", () => {
  const plans = planParts([goal], () => rhino, {}, relics, new Map([["Lith G1", true]]));
  expect(plans.map(p => p.part.name)).toEqual(["Neuroptics", "Systems", "Blueprint"]);
  expect(plans[0].relics[0].name).toBe("Lith S3");
  expect(plans[1].relics.map(r => r.name)).toEqual(["Lith S3", "Axi V1"]);
  expect(plans[2].relics).toEqual([]); expect(plans[2].other[0].location).toBe("Orokin Derelict");
  expect(planParts([goal], () => rhino, { [goal.id]: { Neuroptics: 1 } }, relics, null).map(p => p.part.name)).toEqual(["Systems", "Blueprint"]);
});
it("groups relics by tier and puts tiers with active fissures first", () => {
  const plans = planParts([goal], () => rhino, {}, relics, null), now = Date.now(), exp = new Date(now + 600_000).toISOString();
  const t = tierPlans(plans, [{ tier: "Axi", node: "Hepit", missionType: "Capture", expiry: exp, isHard: false, isStorm: false }], now);
  expect(t.map(x => x.tier)).toEqual(["Axi", "Lith"]); expect(t[0].fissures).toHaveLength(1);
  expect(t[1].relics[0].opt.name).toBe("Lith S3"); expect(t[1].relics[0].parts).toHaveLength(2);
});
it("next action: open an owned relic, get one, or explain vaulted and missing data", () => {
  const plans = planParts([goal], () => rhino, {}, relics, null), now = Date.now(), exp = new Date(now + 600_000).toISOString();
  const fis = [{ tier: "Lith", node: "Ur", missionType: "Defense", expiry: exp, isHard: false, isStorm: false }];
  expect(nextAction(plans[0], fis, { "Lith G1": 1 }, true, now).kind).toBe("open");
  expect(nextAction(plans[0], fis, { "Lith G1": 1 }, true, now).text).toContain("Defense Ur");
  expect(nextAction(plans[0], fis, {}, true, now).kind).toBe("get");
  const v = planParts([goal], () => rhino, {}, relics, new Map([["Axi V1", true], ["Lith S3", true], ["Lith G1", true]]));
  expect(nextAction(v[1], fis, {}, true, now).kind).toBe("vaulted");
  expect(nextAction(plans[2], fis, {}, true, now).kind).toBe("source");
  expect(nextAction(planParts([goal], () => rhino, {}, null, null)[0], fis, {}, false, now).text).toContain("not loaded");
});
it("relic sources come only from loaded rows", () => {
  const rows = [{ item: "Lith G1 Relic", where: "Ceres (Lith)", mode: "", rot: "A", ch: 5, rar: "", note: "", src: "Mission rewards" }, { item: "Lith G1 Relic", where: "Sortie", mode: "", rot: "", ch: 12, rar: "", note: "", src: "x" }, { item: "Meso A1 Relic", where: "Y", mode: "", rot: "", ch: 9, rar: "", note: "", src: "x" }] as Row[];
  expect(relicSources(rows, "Lith G1").map(r => r.where)).toEqual(["Sortie", "Ceres (Lith)"]); expect(relicSources(rows, "Lith Z9")).toEqual([]);
});
import { FIND } from "./drops";
import { RELIC_SOURCE_IDS } from "./exact";
it("every relic source table id exists in the drop tables list", () => {
  for (const id of RELIC_SOURCE_IDS) expect(FIND.some(f => f.id === id), id).toBe(true);
});
