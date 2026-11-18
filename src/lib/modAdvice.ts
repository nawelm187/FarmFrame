import { modFits } from "./build";
import type { Entity } from "./catalog";
/** "Mods for Rhino": the mods made for that Warframe, plus the general Warframe mods grouped by what they raise. A grouping, not a ranking: what is best depends on the build. */
export const GROUPS: [string, RegExp][] = [["health", /\bhealth\b/], ["shields", /\bshields?\b/], ["armor", /\barmor\b/], ["energy", /\benergy\b/], ["efficiency", /ability efficiency/], ["strength", /ability strength/], ["duration", /ability duration/], ["range", /ability range/], ["speed", /sprint speed|movement speed/]];
export const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
export const baseName = (n: string) => n.replace(/\s+prime$/i, "").trim();
const RANK: Record<string, number> = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
const byTier = (a: Entity, b: Entity) => (RANK[a.rarity.toLowerCase()] ?? 9) - (RANK[b.rarity.toLowerCase()] ?? 9) || a.name.localeCompare(b.name);
/** What a mod does at its highest rank, as text. */
export const maxText = (m: Entity) => (m.levelStats?.length ? m.levelStats[m.levelStats.length - 1].join(" ") : m.description ?? "").toLowerCase();
/** The Warframe a typed name points at: exact name, then the name without "Prime", then a name that starts with the words typed. */
export function findFrame(subject: string, frames: Entity[]): Entity | null {
  const q = norm(subject); if (q.length < 2) return null;
  return frames.find(f => norm(f.name) === q) ?? frames.find(f => norm(baseName(f.name)) === q) ?? frames.find(f => norm(f.name).startsWith(q + " ")) ?? null;
}
export function modsForFrame(frameName: string, mods: Entity[], frameNames: Set<string>, limit = 4): { exclusive: Entity[]; groups: { key: string; mods: Entity[] }[] } {
  const base = norm(baseName(frameName)), fits = mods.filter(m => modFits("warframe", m));
  // Generic = made for no Warframe in particular: its compatibility is not the name of any Warframe.
  const exclusive = fits.filter(m => norm(m.compat) === base).sort(byTier), generic = fits.filter(m => !frameNames.has(norm(m.compat)));
  return { exclusive, groups: GROUPS.map(([key, re]) => ({ key, mods: generic.filter(m => re.test(maxText(m))).sort(byTier).slice(0, limit) })).filter(g => g.mods.length) };
}
