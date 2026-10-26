/**
 * Damage test: what a ranged weapon with a build does to an enemy, and how long it takes to kill it.
 * Rules (WARFRAME Wiki, "Calculating Bonuses", "Damage 2.0", "Damage Reduction", "Critical Hit"; read on 2026-10-25):
 *  - Base damage mods add together: base x (1 + sum). Elemental and physical mods are then calculated on that modified base damage.
 *  - Mod elements combine two by two in slot order (left to right, top row then bottom row), the weapon's own elements last.
 *    Repeats of an element add to the pair it is already in.
 *  - Average critical multiplier = 1 + critical chance x (critical multiplier - 1), valid above 100% chance too.
 *  - Against an enemy, each damage type is multiplied by 300 / (300 + armor x (1 - AM)) x (1 + AM) x (1 + HM) on armored health
 *    (AM: armor class modifier, HM: health class modifier), by (1 + HM) when the armor is 0, and by (1 + shield modifier) on shields.
 * Calculated estimates: not compared with in-game values. NOT included: status effects and their damage over time, headshots and
 * weak points, faction damage mods, conditional mods, damage quantization, armor stripping, shield gating and spill, Overguard.
 */
export const DAMAGE_SOURCE = { name: "WARFRAME Wiki, Calculating Bonuses and Damage 2.0", url: "https://wiki.warframe.com/w/Calculating_Bonuses", date: "2026-10-25" } as const;
import type { Entity } from "./catalog";
import { allSlots, type Build } from "./build";
import { parseEffect } from "./calc";

export type DType = "impact" | "puncture" | "slash" | "heat" | "cold" | "electricity" | "toxin" | "blast" | "radiation" | "gas" | "magnetic" | "viral" | "corrosive" | "void" | "tau" | "true";
export const DTYPES: DType[] = ["impact", "puncture", "slash", "heat", "cold", "electricity", "toxin", "blast", "radiation", "gas", "magnetic", "viral", "corrosive", "void", "tau", "true"];
const PHYS = ["impact", "puncture", "slash"] as const, PRIMARY = ["heat", "cold", "electricity", "toxin"] as const;
const COMBO: Record<string, DType> = { "cold+heat": "blast", "electricity+heat": "radiation", "heat+toxin": "gas", "cold+electricity": "magnetic", "cold+toxin": "viral", "electricity+toxin": "corrosive" };
type PrimaryEl = (typeof PRIMARY)[number];
type PhysType = (typeof PHYS)[number];
const isPrimary = (t: string): t is PrimaryEl => (PRIMARY as readonly string[]).includes(t);

export interface Weapon { damage: Partial<Record<DType, number>>; critChance: number; critMult: number; status: number; fireRate: number; multishot: number; magazine: number | null; reload: number | null }
export interface ModBonus { damage: number; elements: { el: PrimaryEl; pct: number }[]; physical: Partial<Record<PhysType, number>>; critChance: number; critDamage: number; multishot: number; status: number; fireRate: number; magazine: number; reload: number }
export const emptyBonus = (): ModBonus => ({ damage: 0, elements: [], physical: {}, critChance: 0, critDamage: 0, multishot: 0, status: 0, fireRate: 0, magazine: 0, reload: 0 });

const EL_LINE = /^([+-]?\d+(?:\.\d+)?)%\s+(heat|cold|electricity|toxin|impact|puncture|slash)(?:\s+damage)?$/i;
/** Reads the plain "+N% stat" lines of the mods in the build, in slot order. Anything else is returned as ignored, never guessed. */
export function readMods(b: Build, mods: Map<string, Entity>): { bonus: ModBonus; ignored: string[] } {
  const bonus = emptyBonus(), ignored: string[] = [];
  for (const s of allSlots(b)) {
    if (!s.mod) continue; const m = mods.get(s.mod); if (!m?.levelStats?.length) continue;
    for (const line of m.levelStats[Math.min(s.rank, m.levelStats.length - 1)] ?? []) {
      const e = EL_LINE.exec(line.trim());
      if (e) { const t = e[2].toLowerCase(), pct = parseFloat(e[1]) / 100; if (isPrimary(t)) bonus.elements.push({ el: t, pct }); else bonus.physical[t as PhysType] = (bonus.physical[t as PhysType] ?? 0) + pct; continue; }
      const p = parseEffect(line); if (!p) { ignored.push(`${m.name}: ${line}`); continue; }
      const v = p.pct / 100;
      if (p.key === "damage") bonus.damage += v; else if (p.key === "critChance") bonus.critChance += v; else if (p.key === "critDamage") bonus.critDamage += v; else if (p.key === "multishot") bonus.multishot += v;
      else if (p.key === "status") bonus.status += v; else if (p.key === "fireRate") bonus.fireRate += v; else if (p.key === "magazine") bonus.magazine += v; else if (p.key === "reload") bonus.reload += v;
    }
  }
  return { bonus, ignored };
}

/** Damage of one pellet (before critical hits and the enemy), per type, after the mods. */
export function modDamage(w: Weapon, bonus: ModBonus): Partial<Record<DType, number>> {
  const mb: Partial<Record<DType, number>> = {}; let total = 0;
  for (const t of DTYPES) { const v = w.damage[t]; if (v) { mb[t] = v * (1 + bonus.damage); total += mb[t]!; } }
  const out: Partial<Record<DType, number>> = { ...mb };
  for (const p of PHYS) { const k = bonus.physical[p]; if (k && mb[p]) out[p] = mb[p]! * (1 + k); }
  // elements: mods first (in slot order), then the weapon's own primary elements; each two different ones combine
  const amount = new Map<PrimaryEl, number>(), order: PrimaryEl[] = [];
  const add = (el: PrimaryEl, v: number) => { if (!amount.has(el)) order.push(el); amount.set(el, (amount.get(el) ?? 0) + v); };
  for (const { el, pct } of bonus.elements) add(el, total * pct);
  for (const el of PRIMARY) if (mb[el]) { add(el, mb[el]!); delete out[el]; }
  for (let i = 0; i < order.length; i += 2) {
    const a = order[i], c = order[i + 1];
    if (c === undefined) { out[a] = (out[a] ?? 0) + amount.get(a)!; continue; }
    const key = [a, c].sort().join("+"), t = COMBO[key]; out[t] = (out[t] ?? 0) + amount.get(a)! + amount.get(c)!;
  }
  return out;
}

export interface Totals { critChance: number; critMult: number; status: number; fireRate: number; multishot: number; magazine: number | null; reload: number | null; avgCrit: number }
export function totals(w: Weapon, bonus: ModBonus): Totals {
  const critChance = w.critChance * (1 + bonus.critChance), critMult = w.critMult * (1 + bonus.critDamage);
  return { critChance, critMult, status: w.status * (1 + bonus.status), fireRate: w.fireRate * (1 + bonus.fireRate), multishot: w.multishot * (1 + bonus.multishot),
    magazine: w.magazine == null ? null : Math.round(w.magazine * (1 + bonus.magazine)), reload: w.reload == null ? null : w.reload / (1 + bonus.reload), avgCrit: 1 + critChance * (critMult - 1) };
}

type Mods = Partial<Record<string, number>>;
export interface Target { health: number; shield: number | null; armor: number; healthMod: Mods; shieldMod: Mods; armorMod: Mods }
/** Damage multiplier of one type against armored (or unarmored) health. Armor 0 loses the armor class modifier. */
export function healthMultiplier(t: DType, tg: Target): number {
  const hm = tg.healthMod[t] ?? 0, am = tg.armorMod[t] ?? 0;
  return tg.armor > 0 ? (300 / (300 + tg.armor * (1 - am))) * (1 + am) * (1 + hm) : 1 + hm;
}
export const shieldMultiplier = (t: DType, tg: Target) => 1 + (tg.shieldMod[t] ?? 0);

export interface TestResult {
  perType: { type: DType; pellet: number; vsHealth: number; vsShield: number }[]; totals: Totals; pelletTotal: number;
  perShotRaw: number; perShotHealth: number; perShotShield: number; burstDpsHealth: number; sustainedDpsHealth: number; shotsToKill: number | null; ttk: number | null; reloads: number; notes: string[];
}
/** Average damage per trigger pull, DPS and time to kill against one target. Shields first, then health; no spill or gating. */
export function runTest(w: Weapon, bonus: ModBonus, tg: Target): TestResult {
  const d = modDamage(w, bonus), t = totals(w, bonus), notes: string[] = [];
  const per = DTYPES.filter(k => d[k]).map(k => ({ type: k, pellet: d[k]!, vsHealth: d[k]! * healthMultiplier(k, tg), vsShield: d[k]! * shieldMultiplier(k, tg) }));
  const k = t.multishot * t.avgCrit, sum = (f: (x: (typeof per)[number]) => number) => per.reduce((a, x) => a + f(x), 0);
  const perShotRaw = sum(x => x.pellet) * k, perShotHealth = sum(x => x.vsHealth) * k, perShotShield = sum(x => x.vsShield) * k;
  const shotsPerSec = t.fireRate, burst = perShotHealth * shotsPerSec;
  let sustained = burst; if (t.magazine && t.reload != null && shotsPerSec > 0) sustained = (t.magazine * perShotHealth) / (t.magazine / shotsPerSec + t.reload);
  let shots: number | null = null, ttk: number | null = null, reloads = 0;
  if (perShotHealth > 0 && shotsPerSec > 0) {
    const shieldShots = tg.shield && tg.shield > 0 && perShotShield > 0 ? tg.shield / perShotShield : 0;
    if (tg.shield === null) notes.push("shield");
    shots = shieldShots + tg.health / perShotHealth;
    reloads = t.magazine ? Math.max(0, Math.ceil(Math.ceil(shots) / t.magazine) - 1) : 0;
    ttk = shots / shotsPerSec + (t.reload != null ? reloads * t.reload : 0);
  }
  return { perType: per, totals: t, pelletTotal: sum(x => x.pellet), perShotRaw, perShotHealth, perShotShield, burstDpsHealth: burst, sustainedDpsHealth: sustained, shotsToKill: shots, ttk, reloads, notes };
}

/** Order of the `damagePerShot` array of the item data, the same table the item page uses (null: entries that are not damage types). */
export const DMG_ORDER: (DType | null)[] = ["impact", "puncture", "slash", "cold", "electricity", "heat", "toxin", "blast", "radiation", "gas", "magnetic", "viral", "corrosive", "void", "tau", null, null, null, null, "true"];
const isO = (x: unknown): x is Record<string, unknown> => !!x && typeof x === "object" && !Array.isArray(x);
const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : null);
/** Reads a ranged weapon from the item data. Missing fields give null and a note: nothing is invented. Chances above 1 are read as percents. */
export function weaponFromEntity(e: Entity): { weapon: Weapon | null; notes: string[] } {
  const r = e.raw ?? {}, notes: string[] = [];
  const src = isO(r.damageTypes) ? r.damageTypes : isO(r.damage) ? r.damage : null, damage: Partial<Record<DType, number>> = {};
  if (src) for (const [k, v] of Object.entries(src)) { const t = k.toLowerCase().replace(/^dt[_ ]?/, "").replace(/[^a-z]/g, "") as DType, n = num(v); if (n && (DTYPES as string[]).includes(t)) damage[t] = n; }
  else if (Array.isArray(r.damagePerShot)) r.damagePerShot.forEach((v, i) => { const t = DMG_ORDER[i], n = num(v); if (t && n && n > 0) damage[t] = n; });
  if (!Object.keys(damage).length) { notes.push("damage"); return { weapon: null, notes }; }
  const fireRate = num(r.fireRate); if (!fireRate) { notes.push("fireRate"); return { weapon: null, notes }; }
  const frac = (x: unknown, n: string) => { const v = num(x); if (v == null) { notes.push(n); return 0; } return v > 1 ? v / 100 : v; };
  return { weapon: { damage, critChance: frac(r.criticalChance, "critChance"), critMult: num(r.criticalMultiplier) ?? (notes.push("critMult"), 1), status: frac(r.procChance, "status"), fireRate, multishot: num(r.multishot) ?? 1, magazine: num(r.magazineSize), reload: num(r.reloadTime) }, notes };
}

type Layer = { kind: string; takesMore: { el: string; pct: number }[]; takesLess: { el: string; pct: number }[] };
const typeKey = (el: string) => el.toLowerCase().replace(/^dt[_ ]?/, "").replace(/[^a-z]/g, "");
const modsOf = (l?: Layer): Mods => { const m: Mods = {}; for (const a of [...(l?.takesMore ?? []), ...(l?.takesLess ?? [])]) m[typeKey(a.el)] = a.pct / 100; return m; };
/** Builds the target from scaled values and the enemy's resistance layers (armor class, shield class, health class). Neutral when a layer is missing. */
export function targetFrom(values: { health: number; shield: number | null; armor: number }, layers: Layer[]): Target {
  const armor = layers.find(l => /armor/i.test(l.kind)), shield = layers.find(l => /shield/i.test(l.kind)), health = layers.find(l => !/armor|shield/i.test(l.kind));
  return { health: values.health, shield: values.shield, armor: values.armor, healthMod: modsOf(health), shieldMod: modsOf(shield), armorMod: modsOf(armor) };
}
