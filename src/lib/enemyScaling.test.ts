import { describe, expect, it } from "vitest";
import { ARMOR_CAP, ARMOR_MIN, affinityMultiplier, armorMultiplier, armorReduction, damageMultiplier, eximusBaseHealth, eximusStep, groupFromFaction, healthMultiplier, overguardMultiplier, scaleEnemy, shieldMultiplier } from "./enemyScaling";
// These check the formulas of the wiki page against values worked out by hand (and internal coherence). They are NOT compared with in-game values.
describe("enemy level scaling (WARFRAME Wiki, Enemy Level Scaling)", () => {
  it("every multiplier is exactly 1 at the base level", () => {
    for (const g of ["grineer", "corpus", "infested", "corrupted", "techrot", "scaldra", "sentient", "murmur", "anarchs", "unaffiliated"] as const) expect(healthMultiplier(g, 20, 20), g).toBe(1);
    expect(armorMultiplier(5, 5)).toBe(1); expect(shieldMultiplier("corpus", 9, 9)).toBe(1); expect(overguardMultiplier(1)).toBe(1);
  });
  it("matches hand-worked values below the transition (s = 0 up to a level difference of 70)", () => {
    expect(healthMultiplier("grineer", 11, 1)).toBeCloseTo(1 + .015 * Math.pow(10, 2.12), 3);   // 2.9774
    expect(armorMultiplier(11, 1)).toBeCloseTo(1 + .005 * Math.pow(10, 1.75), 3);               // 1.2812
    expect(shieldMultiplier("grineer", 11, 1)).toBeCloseTo(1 + .02 * Math.pow(10, 1.75), 3);    // 2.1247
    expect(healthMultiplier("corpus", 71, 1)).toBeCloseTo(1 + .015 * Math.pow(70, 2.12), 1);    // q = 70: t = 0, still the lower curve
  });
  it("uses the upper curve from a level difference of 80", () => {
    expect(healthMultiplier("grineer", 101, 1)).toBeCloseTo(1 + 10.7332 * Math.pow(100, .72), 0);
    expect(healthMultiplier("corpus", 101, 1)).toBeCloseTo(1 + 13.4165 * Math.pow(100, .55), 0);
    expect(armorMultiplier(81, 1)).toBeCloseTo(1 + .4 * Math.pow(80, .75), 2);
  });
  it("grows with level and stays between the two curves in the transition", () => {
    let prev = 0; for (let l = 1; l <= 300; l++) { const m = healthMultiplier("grineer", l, 1); expect(m).toBeGreaterThanOrEqual(prev); prev = m; }
    const lo = 1 + .015 * Math.pow(75, 2.12), hi = 1 + 10.7332 * Math.pow(75, .72), mid = healthMultiplier("grineer", 76, 1);
    expect(mid).toBeGreaterThanOrEqual(Math.min(lo, hi)); expect(mid).toBeLessThanOrEqual(Math.max(lo, hi));
  });
  it("returns no shield curve for groups the wiki does not list, instead of guessing", () => {
    expect(shieldMultiplier("infested", 50, 1)).toBeNull(); expect(shieldMultiplier("murmur", 50, 1)).toBeNull();
    expect(scaleEnemy({ group: "infested", baseHealth: 100, baseShield: 50, baseArmor: 0, baseLevel: 1, level: 30, eximus: false }).shield).toBeNull();
  });
  it("caps armor at 2700 (90% reduction), raises it to the minimum 200, and leaves unarmored enemies at 0", () => {
    const hi = scaleEnemy({ group: "grineer", baseHealth: 100, baseShield: 0, baseArmor: 500, baseLevel: 1, level: 400, eximus: false });
    expect(hi.armor).toBe(ARMOR_CAP); expect(hi.armorNote).toBe("cap"); expect(hi.reduction).toBeCloseTo(.9, 5);
    const lo = scaleEnemy({ group: "grineer", baseHealth: 100, baseShield: 0, baseArmor: 50, baseLevel: 1, level: 1, eximus: false });
    expect(lo.armor).toBe(ARMOR_MIN); expect(lo.armorNote).toBe("min");
    expect(scaleEnemy({ group: "grineer", baseHealth: 100, baseShield: 0, baseArmor: 0, baseLevel: 1, level: 50, eximus: false }).armor).toBe(0);
    expect(armorReduction(300)).toBe(.5); expect(armorReduction(0)).toBe(0);
  });
  it("Eximus: the base increase is continuous at every breakpoint and capped at x6 from level 100", () => {
    expect(eximusStep(15)).toBe(1); expect(eximusStep(25)).toBeCloseTo(1.25, 10); expect(eximusStep(35)).toBeCloseTo(2.5, 10); expect(eximusStep(50)).toBeCloseTo(4.5, 10); expect(eximusStep(100)).toBeCloseTo(6, 10); expect(eximusStep(5000)).toBe(6);
    expect(eximusBaseHealth(100, 1, true)).toBeCloseTo(Math.max(110, .25 * 1000), 8);       // 250
    expect(eximusBaseHealth(100, 1, false)).toBeCloseTo(Math.max(110, .375 * 1000), 8);     // 375
    expect(eximusBaseHealth(100, 120, true)).toBeCloseTo(.25 * 1000 * 6, 8);
  });
  it("Overguard: base 12 at level 1; only Eximus get it; affinity ignores the base level", () => {
    const e = scaleEnemy({ group: "corpus", baseHealth: 100, baseShield: 100, baseArmor: 0, baseLevel: 5, level: 1, eximus: true });
    expect(e.overguard).toBe(12); expect(scaleEnemy({ group: "corpus", baseHealth: 100, baseShield: 100, baseArmor: 0, baseLevel: 1, level: 10, eximus: false }).overguard).toBeNull();
    expect(Math.floor(100 * affinityMultiplier(1, false))).toBe(114); expect(affinityMultiplier(100, true)).toBeCloseTo(3 + .1425 * 10, 8);
  });
  it("damage: 2x for Grineer/Corpus/Techrot and 3x for Infested on top of the curve", () => {
    expect(damageMultiplier("grineer", 1, 1)).toBe(2); expect(damageMultiplier("infested", 1, 1)).toBe(3); expect(damageMultiplier("sentient", 1, 1)).toBe(1);
  });
  it("effective health adds shields and scales health by armor (standard, without shield gating or toxin)", () => {
    const r = scaleEnemy({ group: "grineer", baseHealth: 300, baseShield: 150, baseArmor: 100, baseLevel: 1, level: 1, eximus: false });
    expect(r.armor).toBe(200); expect(r.ehp).toBeCloseTo(300 * (1 + 200 / 300) + 150, 3);
  });
  it("guesses the scaling group only from names the wiki page lists", () => {
    expect(groupFromFaction("Grineer")).toBe("grineer"); expect(groupFromFaction("The Murmur")).toBe("murmur"); expect(groupFromFaction("Orokin")).toBeNull(); expect(groupFromFaction("Narmer")).toBeNull();
  });
});
