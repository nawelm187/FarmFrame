import type { Entity } from "./catalog";
export const NSLOTS = 8;
export interface Slot { mod: string | null; rank: number; owned?: boolean; pol?: string }
export interface Build { id: string; name: string; frame: string; slots: Slot[]; reactor: boolean; haveFrame?: boolean; arcanes?: ArcSlot[] }
export interface ArcSlot { mod: string | null; owned?: boolean }
export interface Issue { level: "error" | "warn"; text: string }
const K = "ff.builds";
export const readBuilds = (): Build[] => { try { const v: unknown = JSON.parse(localStorage.getItem(K) || "[]"); return Array.isArray(v) ? (v as Build[]) : []; } catch { return []; } };
export const writeBuilds = (a: Build[]) => { try { localStorage.setItem(K, JSON.stringify(a)); } catch { /* storage unavailable */ } };
export const newBuild = (): Build => ({ id: Date.now().toString(36), name: "New build", frame: "", reactor: true, slots: Array.from({ length: NSLOTS }, () => ({ mod: null, rank: 0 })) });
/** Drain at a rank in a slot: base + rank; matching polarity halves (rounded up), mismatch adds 25%. */
export function drain(mod: Entity, rank: number, slotPol: string | null): number | null {
  if (mod.baseDrain == null || mod.baseDrain < 0) return null;
  const d = mod.baseDrain + rank;
  if (!slotPol || slotPol === "any" || !mod.polarity) return d;
  return slotPol === mod.polarity ? Math.ceil(d / 2) : Math.ceil(d * 1.25);
}
export function evaluate(b: Build, frame: Entity | undefined, mods: Map<string, Entity>) {
  const issues: Issue[] = [], seen = new Set<string>(); let total = 0;
  const capacity = b.reactor ? 60 : 30;
  if (b.frame && !frame) issues.push({ level: "warn", text: "Selected Warframe is not in the loaded data." });
  if (frame && !frame.slots) issues.push({ level: "warn", text: "This source has no slot polarities for the Warframe, so no polarity bonuses are applied." });
  const rows = b.slots.map((s, i) => {
    const pol = s.pol || frame?.slots?.[i] || null, m = s.mod ? mods.get(s.mod) : undefined;
    if (!s.mod) return { i, pol, m: undefined, d: null as number | null };
    if (!m) { issues.push({ level: "warn", text: `Slot ${i + 1}: mod not found in loaded data.` }); return { i, pol, m, d: null }; }
    if (seen.has(m.name)) issues.push({ level: "error", text: `${m.name} is used more than once.` }); seen.add(m.name);
    if (m.maxRank != null && s.rank > m.maxRank) issues.push({ level: "error", text: `${m.name}: rank ${s.rank} exceeds max rank ${m.maxRank}.` });
    const d = drain(m, s.rank, pol);
    if (d == null) issues.push({ level: "warn", text: `${m.name}: no usable drain in the source (aura-type or missing), not counted.` }); else total += d;
    return { i, pol, m, d };
  });
  if (total > capacity) issues.push({ level: "error", text: `Capacity exceeded: ${total} / ${capacity}.` });
  return { rows, total, capacity, issues };
}
/** Standard endo rule: base (10/20/30/40 by rarity) x (2^rank - 1). A calculated estimate, not read from the source. */
const BASE: Record<string, number> = { common: 10, uncommon: 20, rare: 30, legendary: 40 };
export const endoFor = (rarity: string, rank: number): number | null => { const b = BASE[rarity.toLowerCase()]; return b && rank >= 0 ? b * (2 ** rank - 1) : null; };
export function requirements(b: Build, frame: Entity | undefined, mods: Map<string, Entity>, arc: Map<string, Entity> = new Map()) {
  const arcanes = [0, 1].map(i => b.arcanes?.[i]).filter((s): s is ArcSlot => !!s?.mod).map(s => ({ slug: s.mod!, name: arc.get(s.mod!)?.name ?? s.mod!, owned: !!s.owned }));
  const list = b.slots.filter(s => s.mod).map(s => { const m = mods.get(s.mod!); return { slug: s.mod!, name: m?.name ?? s.mod!, rank: s.rank, owned: !!s.owned, endo: m ? endoFor(m.rarity, s.rank) : null }; });
  const forma = frame?.slots ? b.slots.filter((s, i) => s.pol && s.pol !== frame.slots![i]).length : 0;
  return { arcanes, missingArcanes: arcanes.filter(a => !a.owned), arcDup: arcanes.length === 2 && arcanes[0].slug === arcanes[1].slug, forma, frame: b.frame ? { name: frame?.name ?? b.frame, slug: b.frame, have: !!b.haveFrame } : null, mods: list, missingMods: list.filter(x => !x.owned),
    endoTotal: list.reduce((a, x) => a + (x.endo ?? 0), 0), endoKnown: list.every(x => x.endo != null) };
}
