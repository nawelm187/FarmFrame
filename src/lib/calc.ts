import type { Entity } from "./catalog";
import type { Build } from "./build";
export type StatKey = "health" | "shield" | "armor" | "energy" | "strength" | "duration" | "efficiency" | "range" | "damage" | "critChance" | "critDamage" | "multishot" | "status" | "fireRate" | "magazine" | "reload";
export const ORDER: StatKey[] = ["health", "shield", "armor", "energy", "strength", "duration", "efficiency", "range", "damage", "critChance", "critDamage", "multishot", "status", "fireRate", "magazine", "reload"];
export const LABEL: Record<StatKey, string> = { health: "Health", shield: "Shield", armor: "Armor", energy: "Energy", strength: "Ability strength", duration: "Ability duration", efficiency: "Ability efficiency", range: "Ability range", damage: "Damage", critChance: "Critical chance", critDamage: "Critical damage", multishot: "Multishot", status: "Status chance", fireRate: "Fire rate", magazine: "Magazine capacity", reload: "Reload speed" };
const NAMES: Record<string, StatKey> = { health: "health", "shield capacity": "shield", shield: "shield", shields: "shield", armor: "armor", "energy max": "energy", "max energy": "energy", "energy capacity": "energy",
  "ability strength": "strength", "ability duration": "duration", "ability efficiency": "efficiency", "ability range": "range", damage: "damage", "critical chance": "critChance", "critical damage": "critDamage", multishot: "multishot", "status chance": "status", "fire rate": "fireRate", "magazine capacity": "magazine", "reload speed": "reload" };
/** Only plain "+N% Stat" lines are understood. Anything conditional or unfamiliar is reported as not calculated, never guessed. */
export function parseEffect(line: string): { key: StatKey; pct: number } | null {
  const m = /^([+-]?\d+(?:\.\d+)?)%\s+(.+)$/.exec(line.trim()); if (!m) return null;
  const key = NAMES[m[2].trim().toLowerCase()]; return key ? { key, pct: parseFloat(m[1]) } : null;
}
export interface Part { mod: string; pct: number }
export function calc(b: Build, mods: Map<string, Entity>) {
  const acc = new Map<StatKey, Part[]>(), unparsed: string[] = [];
  for (const s of b.slots) {
    if (!s.mod) continue; const m = mods.get(s.mod); if (!m?.levelStats?.length) continue;
    for (const line of m.levelStats[Math.min(s.rank, m.levelStats.length - 1)] ?? []) {
      const p = parseEffect(line);
      if (p) acc.set(p.key, [...(acc.get(p.key) ?? []), { mod: m.name, pct: p.pct }]); else unparsed.push(`${m.name}: ${line}`);
    }
  }
  const stats = ORDER.filter(k => acc.has(k)).map(k => ({ key: k, label: LABEL[k], parts: acc.get(k)!, pct: acc.get(k)!.reduce((a, p) => a + p.pct, 0) }));
  return { stats, unparsed };
}
