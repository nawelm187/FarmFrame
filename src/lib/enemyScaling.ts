/**
 * Enemy level scaling: health, shields, armor, overguard, damage and affinity at a given level.
 * Source: WARFRAME Wiki, "Enemy Level Scaling" (https://wiki.warframe.com/w/Enemy_Level_Scaling), read on 2026-10-24.
 * The page asks for IEEE 754 binary32 arithmetic in the displayed order, so every step goes through Math.fround.
 * These are calculated estimates, not values read from the game. Things the page does not give (for example a
 * faction's shield curve) return null instead of a guess. Not included: Steel Path, weapon damage, armor stripping, shield gating.
 */
export const SCALING_SOURCE = { name: "WARFRAME Wiki, Enemy Level Scaling", url: "https://wiki.warframe.com/w/Enemy_Level_Scaling", date: "2026-10-24" } as const;
const f32 = Math.fround;

export type GroupId = "grineer" | "scaldra" | "corpus" | "infested" | "corrupted" | "techrot" | "sentient" | "murmur" | "anarchs" | "unaffiliated";
/** Scaling groups, in the order shown to the person. The labels are game names, so they are not translated. */
export const GROUPS: { id: GroupId; label: string }[] = [
  { id: "grineer", label: "Grineer" }, { id: "corpus", label: "Corpus" }, { id: "infested", label: "Infested" }, { id: "corrupted", label: "Corrupted" },
  { id: "techrot", label: "Techrot" }, { id: "scaldra", label: "Scaldra" }, { id: "sentient", label: "Sentient" }, { id: "murmur", label: "The Murmur" },
  { id: "anarchs", label: "Anarchs" }, { id: "unaffiliated", label: "Unaffiliated" },
];
/** Guess the scaling group from the faction name of the enemy data. Anything the wiki page does not list stays unknown. */
export function groupFromFaction(faction: string): GroupId | null {
  const k = faction.toLowerCase().replace(/^the\s+/, "").trim();
  return (GROUPS.find(g => g.id === k)?.id) ?? (k === "murmur" ? "murmur" : null);
}

interface K { c: number; e: number }
interface Curves { f1: K; f2: K; L: number; U: number }
const HEALTH_SHAPE = { L: 70, U: 80 };
const HEALTH: Record<GroupId, Curves> = {
  grineer: { f1: { c: .015, e: 2.12 }, f2: { c: 10.7332, e: .72 }, ...HEALTH_SHAPE },
  scaldra: { f1: { c: .015, e: 2.12 }, f2: { c: 10.7332, e: .72 }, ...HEALTH_SHAPE },
  corpus: { f1: { c: .015, e: 2.12 }, f2: { c: 13.4165, e: .55 }, ...HEALTH_SHAPE },
  infested: { f1: { c: .0225, e: 2.12 }, f2: { c: 16.0998, e: .72 }, ...HEALTH_SHAPE },
  corrupted: { f1: { c: .015, e: 2.1 }, f2: { c: 10.7332, e: .685 }, ...HEALTH_SHAPE },
  murmur: { f1: { c: .015, e: 2 }, f2: { c: 10.7332, e: .5 }, ...HEALTH_SHAPE },
  sentient: { f1: { c: .015, e: 2 }, f2: { c: 10.7332, e: .5 }, ...HEALTH_SHAPE },
  anarchs: { f1: { c: .015, e: 2 }, f2: { c: 10.7332, e: .5 }, ...HEALTH_SHAPE },
  unaffiliated: { f1: { c: .015, e: 2 }, f2: { c: 10.7332, e: .5 }, ...HEALTH_SHAPE },
  techrot: { f1: { c: .02, e: 2.12 }, f2: { c: 15.0998, e: .7 }, ...HEALTH_SHAPE },
};
const SHIELD: Partial<Record<GroupId, Curves>> = {
  corpus: { f1: { c: .02, e: 1.76 }, f2: { c: 2, e: .76 }, ...HEALTH_SHAPE },
  corrupted: { f1: { c: .02, e: 1.75 }, f2: { c: 2, e: .75 }, ...HEALTH_SHAPE },
  grineer: { f1: { c: .02, e: 1.75 }, f2: { c: 1.6, e: .75 }, ...HEALTH_SHAPE },
  sentient: { f1: { c: .02, e: 1.75 }, f2: { c: 1.6, e: .75 }, ...HEALTH_SHAPE },
  techrot: { f1: { c: .02, e: 1.76 }, f2: { c: 3.5, e: .76 }, ...HEALTH_SHAPE },
};
const ARMOR: Curves = { f1: { c: .005, e: 1.75 }, f2: { c: .4, e: .75 }, ...HEALTH_SHAPE };
const OVERGUARD: Curves = { f1: { c: .0015, e: 4 }, f2: { c: 260, e: .9 }, L: 45, U: 50 };
const DAMAGE_MODIFIED: Curves = { f1: { c: .015, e: 1.75 }, f2: { c: .0075, e: 1.55 }, L: 1, U: 25 };
export const ARMOR_CAP = 2700, ARMOR_MIN = 200, OVERGUARD_BASE = 12;

/** One endpoint curve: 1 + C * q^E, evaluated step by step in binary32. */
const curve = (q: number, k: K) => f32(1 + f32(f32(k.c) * f32(Math.pow(f32(q), f32(k.e)))));
/** The multiplier between the two endpoint curves, weighted by a smoothstep between L and U. */
export function multiplier(q: number, cv: Curves): number {
  const a = curve(q, cv.f1), b = curve(q, cv.f2);
  const t = Math.min(1, Math.max(0, f32(f32(q - cv.L) / f32(cv.U - cv.L))));
  const s = f32(f32(t * t) * f32(3 - f32(2 * t)));
  return f32(a + f32(f32(b - a) * s));
}
const apply = (base: number, mult: number) => f32(f32(base) * f32(mult));
const clampLevel = (n: number) => Math.min(9999, Math.max(1, Math.floor(Number.isFinite(n) ? n : 1)));
/** q = current level minus base level (never below 0: an enemy does not spawn under its base level). */
const qOf = (level: number, base: number) => Math.max(0, clampLevel(level) - clampLevel(base));

export const healthMultiplier = (g: GroupId, level: number, baseLevel: number) => multiplier(qOf(level, baseLevel), HEALTH[g]);
export const shieldMultiplier = (g: GroupId, level: number, baseLevel: number): number | null => { const c = SHIELD[g]; return c ? multiplier(qOf(level, baseLevel), c) : null; };
export const armorMultiplier = (level: number, baseLevel: number) => multiplier(qOf(level, baseLevel), ARMOR);
/** Overguard ignores the enemy's base level: q = level - 1. */
export const overguardMultiplier = (level: number) => multiplier(Math.max(0, clampLevel(level) - 1), OVERGUARD);
/** Enemy damage multiplier. Corpus, Grineer and Techrot use the modified curve (and deal 2x; Infested 3x) on top of it. */
export function damageMultiplier(g: GroupId, level: number, baseLevel: number): number {
  const q = qOf(level, baseLevel);
  if (g === "corpus" || g === "grineer" || g === "techrot") return f32(multiplier(q, DAMAGE_MODIFIED) * 2);
  const plain = f32(1 + f32(.015 * f32(Math.pow(f32(q), 1.55))));
  return g === "infested" ? f32(plain * 3) : plain;
}
/** Affinity ignores the base level; the base affinity times this is rounded down. */
export const affinityMultiplier = (level: number, eximus: boolean) => (eximus ? 3 : 1) + .1425 * Math.sqrt(clampLevel(level));
/** The level-dependent step of the Eximus base increase (1 up to level 15, 6 from level 100). */
export function eximusStep(x: number): number {
  const l = clampLevel(x);
  if (l <= 15) return 1; if (l <= 25) return 1 + .025 * (l - 15); if (l <= 35) return 1.25 + .125 * (l - 25);
  if (l <= 50) return 2.5 + (2 / 15) * (l - 35); if (l <= 100) return 4.5 + .03 * (l - 50); return 6;
}
/** Eximus base health before the faction scaling (0.25 with shields or armor, 0.375 without). */
export const eximusBaseHealth = (health: number, level: number, hasShieldOrArmor: boolean) => Math.max(health * 1.1, (hasShieldOrArmor ? .25 : .375) * (health + 900) * eximusStep(level));
export const eximusBaseShield = (shield: number, level: number) => Math.max(shield * 1.1, shield * eximusStep(level));
/** Damage reduction from armor under the standard enemy formula. */
export const armorReduction = (armor: number) => (armor <= 0 ? 0 : armor / (armor + 300));

export interface ScaleInput { group: GroupId; baseHealth: number; baseShield: number; baseArmor: number; baseLevel: number; level: number; eximus: boolean }
export interface ScaleResult {
  health: number; shield: number | null; armor: number; armorNote: "cap" | "min" | null; overguard: number | null;
  reduction: number; ehp: number | null; affinityMultiplier: number; healthMultiplier: number; damageMultiplier: number;
}
/** Everything about an enemy at one level. A shield value is null when the wiki gives no shield curve for the group. */
export function scaleEnemy(i: ScaleInput): ScaleResult {
  const bh = Math.max(0, i.baseHealth), bs = Math.max(0, i.baseShield), ba = Math.max(0, i.baseArmor);
  const hm = healthMultiplier(i.group, i.level, i.baseLevel);
  const health = apply(i.eximus ? eximusBaseHealth(bh, i.level, bs > 0 || ba > 0) : bh, hm);
  const sm = shieldMultiplier(i.group, i.level, i.baseLevel);
  const shield = bs <= 0 ? 0 : sm === null ? null : apply(i.eximus ? eximusBaseShield(bs, i.level) : bs, sm);
  let armor = 0, armorNote: ScaleResult["armorNote"] = null;
  if (ba > 0) {
    const raw = apply(ba, armorMultiplier(i.level, i.baseLevel));
    armor = Math.min(ARMOR_CAP, Math.max(ARMOR_MIN, raw)); armorNote = raw > ARMOR_CAP ? "cap" : raw < ARMOR_MIN ? "min" : null;
  }
  const reduction = armorReduction(armor);
  const ehp = shield === null ? null : health * (1 + armor / 300) + shield;
  return { health, shield, armor, armorNote, overguard: i.eximus ? apply(OVERGUARD_BASE, overguardMultiplier(i.level)) : null, reduction, ehp, affinityMultiplier: affinityMultiplier(i.level, i.eximus), healthMultiplier: hm, damageMultiplier: damageMultiplier(i.group, i.level, i.baseLevel) };
}
