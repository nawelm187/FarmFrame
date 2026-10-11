import { expect, it } from "vitest";
import { detectDrift } from "./drift";
const fis = { tier: "Lith", node: "A", expiry: "x", missionType: "Spy" };
it("accepts the expected shape and unknown datasets", () => {
  expect(detectDrift("fissures", [fis, fis])).toEqual([]); expect(detectDrift("fissures", [])).toEqual([]); expect(detectDrift("sortie", { a: 1 })).toEqual([]); expect(detectDrift("fissures", null)).toEqual([]);
});
it("reports a renamed field and a changed container", () => {
  expect(detectDrift("fissures", [{ ...fis, tier: undefined, tierName: "Lith" }, { ...fis, tier: undefined }]).join()).toContain('field "tier" is missing in 2 of 2');
  expect(detectDrift("fissures", { data: [] })).toEqual(["expected a list, got an object"]);
});
it("tolerates a few odd entries but not a mostly broken list", () => {
  const ok = Array.from({ length: 10 }, () => fis); ok[3] = {} as typeof fis;
  expect(detectDrift("fissures", ok)).toEqual([]);
  expect(detectDrift("fissures", [fis, {}, {}, {}])).not.toEqual([]);
});
it("checks catalog entries and their parts", () => {
  expect(detectDrift("f:Warframes.json", [{ name: "Rhino", uniqueName: "/x", components: [{ uniqueName: "/y", itemCount: 1 }] }])).toEqual([]);
  expect(detectDrift("f:Warframes.json", [{ name: "Rhino", uniqueName: "/x", components: [{ itemCount: 1 }] }])[0]).toContain("part entries");
  expect(detectDrift("f:Primary.json", [{ title: "x" }]).length).toBe(2);
});
it("flags relic tables whose odds do not add up, and accepts a sound one", () => {
  const rw = (c: number[]) => c.map((chance, i) => ({ itemName: `X${i}`, rarity: "Common", chance }));
  const good = { tier: "Lith", relicName: "A1", state: "Intact", rewards: rw([25.33, 25.33, 25.33, 11, 11, 2]) };
  expect(detectDrift("relics", { relics: [good] })).toEqual([]);
  expect(detectDrift("relics", { relics: [good, { ...good, relicName: "B2", rewards: rw([25, 25, 25, 11, 11]) }] })).toEqual(["1 relic refinements have odds that do not add up to 100 (for example Lith B2 Intact: chances add up to 97, not 100)"]);
});
