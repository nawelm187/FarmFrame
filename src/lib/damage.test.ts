import { expect, it } from "vitest";
import { emptyBonus, healthMultiplier, modDamage, readMods, runTest, shieldMultiplier, targetFrom, totals, weaponFromEntity, type Target, type Weapon } from "./damage";
import { newBuild } from "./build";
import type { Entity } from "./catalog";
// Values worked out by hand from the wiki's own examples (Calculating Bonuses, Damage 2.0). Not compared with in-game values.
const W = (damage: Weapon["damage"], over: Partial<Weapon> = {}): Weapon => ({ damage, critChance: 0, critMult: 1, status: 0, fireRate: 1, multishot: 1, magazine: null, reload: null, ...over });
const T = (over: Partial<Target> = {}): Target => ({ health: 1000, shield: 0, armor: 0, healthMod: {}, shieldMod: {}, armorMod: {}, ...over });
const mod = (name: string, lines: string[]): Entity => ({ slug: name.toLowerCase(), name, type: "", description: "", image: null, isPrime: false, vaulted: null, stats: [], facts: [], components: [], polarity: null, baseDrain: 4, maxRank: 5, compat: "", rarity: "Common", slots: null, levelStats: [lines], category: "", raw: {}, tradable: null });
it("base damage mods add up, then elements are calculated on the modified base (the wiki's Karak example)", () => {
  const d = modDamage(W({ impact: 29 }), { ...emptyBonus(), damage: 1.65, elements: [{ el: "heat", pct: .9 }] });
  expect(d.impact).toBeCloseTo(76.85, 6); expect(d.heat).toBeCloseTo(69.165, 6);
  expect(modDamage(W({ impact: 140 }), { ...emptyBonus(), damage: 3.3 }).impact).toBeCloseTo(602, 6);
});
it("two different mod elements combine; the same element twice joins the pair it is in; the weapon's own elements come last", () => {
  const c = modDamage(W({ impact: 100 }), { ...emptyBonus(), elements: [{ el: "toxin", pct: .9 }, { el: "electricity", pct: .9 }] });
  expect(c.corrosive).toBeCloseTo(180, 6); expect(c.toxin).toBeUndefined(); expect(c.electricity).toBeUndefined();
  const amprex = modDamage(W({ impact: 60, electricity: 40 }), { ...emptyBonus(), elements: [{ el: "heat", pct: .9 }, { el: "cold", pct: .9 }, { el: "heat", pct: .9 }] });
  expect(amprex.blast).toBeCloseTo(270, 6); expect(amprex.electricity).toBeCloseTo(40, 6); expect(amprex.heat).toBeUndefined();
  const gas = modDamage(W({ puncture: 80, heat: 20 }), { ...emptyBonus(), elements: [{ el: "toxin", pct: .9 }] });
  expect(gas.gas).toBeCloseTo(110, 6); expect(modDamage(W({ impact: 100 }), { ...emptyBonus(), elements: [{ el: "heat", pct: .9 }] }).heat).toBeCloseTo(90, 6);
});
it("physical mods multiply that type but do not raise the elemental bonus", () => {
  const d = modDamage(W({ slash: 50, impact: 50 }), { ...emptyBonus(), physical: { slash: 1 }, elements: [{ el: "heat", pct: .9 }] });
  expect(d.slash).toBeCloseTo(100, 6); expect(d.impact).toBeCloseTo(50, 6); expect(d.heat).toBeCloseTo(90, 6);
});
it("average critical multiplier is linear in the chance, also above 100%", () => {
  expect(totals(W({ impact: 1 }, { critChance: .5, critMult: 2 }), emptyBonus()).avgCrit).toBeCloseTo(1.5, 8);
  expect(totals(W({ impact: 1 }, { critChance: 1.5, critMult: 2 }), emptyBonus()).avgCrit).toBeCloseTo(2.5, 8);
  const t = totals(W({ impact: 1 }, { critChance: .2, critMult: 2, multishot: 1, fireRate: 10 }), { ...emptyBonus(), critChance: 1.5, critDamage: 1.2, multishot: .9, fireRate: .5 });
  expect(t.critChance).toBeCloseTo(.5, 8); expect(t.critMult).toBeCloseTo(4.4, 8); expect(t.multishot).toBeCloseTo(1.9, 8); expect(t.fireRate).toBeCloseTo(15, 8);
});
it("critical chance bonuses are relative to the base chance (the wiki's Braton example: 12% x (1 + 150% + 135%) = 46.2%)", () => {
  expect(totals(W({ impact: 1 }, { critChance: .12, critMult: 2 }), { ...emptyBonus(), critChance: 1.5 + 1.35 }).critChance).toBeCloseTo(.462, 8);
});
it("enemy modifiers: armor class changes the effective armor, armor 0 loses it, shields ignore armor", () => {
  expect(healthMultiplier("slash", T({ armor: 300 }))).toBeCloseTo(.5, 8);
  expect(healthMultiplier("corrosive", T({ armor: 300, armorMod: { corrosive: .75 } }))).toBeCloseTo(1.4, 8);   // 300 / (300 + 300 x 0.25) x 1.75
  expect(healthMultiplier("corrosive", T({ armor: 0, armorMod: { corrosive: .75 }, healthMod: { corrosive: .1 } }))).toBeCloseTo(1.1, 8);
  expect(healthMultiplier("slash", T({ armor: 300, armorMod: { slash: -.15 }, healthMod: { slash: .25 } }))).toBeCloseTo((300 / (300 + 300 * 1.15)) * .85 * 1.25, 8);
  expect(shieldMultiplier("magnetic", T({ shieldMod: { magnetic: .75 }, armor: 900 }))).toBeCloseTo(1.75, 8);
});
it("time to kill: shields first, reloads only when the magazine runs out", () => {
  const w = W({ impact: 100 }, { fireRate: 2, magazine: 1000, reload: 2 });
  const r = runTest(w, emptyBonus(), T()); expect(r.perShotHealth).toBeCloseTo(100, 8); expect(r.shotsToKill).toBeCloseTo(10, 8); expect(r.ttk).toBeCloseTo(5, 8); expect(r.burstDpsHealth).toBeCloseTo(200, 8);
  expect(runTest({ ...w, magazine: 5 }, emptyBonus(), T()).ttk).toBeCloseTo(7, 8);
  expect(runTest(w, emptyBonus(), T({ shield: 500 })).shotsToKill).toBeCloseTo(15, 8);
  const sus = runTest({ ...w, magazine: 10 }, emptyBonus(), T()); expect(sus.sustainedDpsHealth).toBeCloseTo(1000 / (5 + 2), 6);
  expect(runTest(W({ impact: 100 }, { multishot: 2.5, critChance: .5, critMult: 2 }), emptyBonus(), T()).perShotHealth).toBeCloseTo(100 * 2.5 * 1.5, 8);
});
it("reads plain mod lines in slot order and reports the rest as ignored", () => {
  const ms = new Map([["serration", mod("Serration", ["+165% Damage"])], ["hellfire", mod("Hellfire", ["+90% Heat Damage"])], ["cryo", mod("Cryo Rounds", ["+90% Cold"])], ["hunter", mod("Hunter Munitions", ["+30% Critical Chance", "Slash proc on critical hit"])]]);
  const b = { ...newBuild(), kind: "primary" as const, slots: newBuild().slots.map((s, i) => ({ ...s, mod: ["serration", "hellfire", "cryo", "hunter"][i] ?? null })) };
  const r = readMods(b, ms); expect(r.bonus.damage).toBeCloseTo(1.65, 8); expect(r.bonus.elements.map(e => e.el).join()).toBe("heat,cold"); expect(r.bonus.critChance).toBeCloseTo(.3, 8); expect(r.ignored.join()).toContain("Slash proc on critical hit");
});
it("reads a weapon from the item data, never inventing missing fields", () => {
  const e = (raw: Record<string, unknown>) => ({ ...mod("Gun", []), raw }) as Entity;
  const full = weaponFromEntity(e({ damageTypes: { impact: 10, puncture: 20 }, fireRate: 10, criticalChance: 0.2, criticalMultiplier: 2, procChance: 0.1, multishot: 1, magazineSize: 30, reloadTime: 2 }));
  expect(full.weapon?.damage.puncture).toBe(20); expect(full.weapon?.critChance).toBeCloseTo(.2, 8); expect(full.weapon?.magazine).toBe(30); expect(full.notes).toEqual([]);
  expect(weaponFromEntity(e({ damageTypes: { impact: 10 }, fireRate: 5, criticalChance: 20, criticalMultiplier: 2 })).weapon?.critChance).toBeCloseTo(.2, 8);
  const arr = weaponFromEntity(e({ damagePerShot: [10, 20, 5, 0, 0, 30], fireRate: 8, criticalChance: 0.1, criticalMultiplier: 1.5 })).weapon;
  expect(arr?.damage.impact).toBe(10); expect(arr?.damage.slash).toBe(5); expect(arr?.damage.heat).toBe(30); expect(arr?.damage.cold).toBeUndefined();   // index 3 is cold, 5 is heat (the item page uses the same order)
  expect(weaponFromEntity(e({ fireRate: 5 })).weapon).toBeNull(); expect(weaponFromEntity(e({ damage: { impact: 5 } })).weapon).toBeNull();
});
it("builds the target from the resistance layers of the enemy data", () => {
  const t = targetFrom({ health: 100, shield: 50, armor: 200 }, [{ kind: "Cloned Flesh", takesMore: [{ el: "DT_SLASH", pct: 25 }], takesLess: [] }, { kind: "Ferrite Armor", takesMore: [{ el: "Corrosive", pct: 75 }], takesLess: [{ el: "Slash", pct: -15 }] }, { kind: "Shield", takesMore: [{ el: "Magnetic", pct: 75 }], takesLess: [] }]);
  expect(t.healthMod.slash).toBeCloseTo(.25, 8); expect(t.armorMod.corrosive).toBeCloseTo(.75, 8); expect(t.armorMod.slash).toBeCloseTo(-.15, 8); expect(t.shieldMod.magnetic).toBeCloseTo(.75, 8);
});
