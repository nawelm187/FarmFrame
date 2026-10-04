import type { Entity } from "./catalog";
export const NSLOTS = 8;
const CP = ["companion", "sentinel", "beast", "kubrow", "kavat", "vulpaphyla", "predasite"], WEAPON = ["primary", "secondary", "melee", "rifle", "shotgun", "pistol", "bow", "sniper", "crossbow", "launcher", "archgun", "arch-gun", "archmelee", "arch-melee"];
/** Hard compatibility by the mod's own listed category: a companion or weapon mod never fits a Warframe build, and so on. */
export function modFits(k: Kind, m: Entity): boolean {
  const t = `${m.type} ${m.compat}`.toLowerCase(), has = (...w: string[]) => w.some(x => t.includes(x));
  if (k === "companion") return has(...CP);
  if (k === "archwing") return has("archwing");
  if (k === "warframe") return !has(...CP, ...WEAPON, "archwing", "stance");
  return !has("warframe", ...CP, "archwing", "aura", "stance");
}
const classFits = (itemType: string, compat: string, kind: Kind) => { const c = compat.toLowerCase(); return c === "any" || c.includes(kind) || itemType.toLowerCase().split(/\s+/).some(w => w && c.includes(w)); };
export interface Slot { mod: string | null; rank: number; owned?: boolean; pol?: string }
export type Kind = "warframe" | "primary" | "secondary" | "melee" | "companion" | "archwing";
export const KIND_LABEL: Record<Kind, string> = { warframe: "Warframe", primary: "Primary weapon", secondary: "Secondary weapon", melee: "Melee weapon", companion: "Companion", archwing: "Archwing" };
export interface Build { id: string; kind?: Kind; name: string; frame: string; slots: Slot[]; reactor: boolean; haveFrame?: boolean; arcanes?: ArcSlot[] }
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
  if (!slotPol) return d;
  if (slotPol === "any") return Math.ceil(d / 2); // omni slots match every mod
  if (!mod.polarity) return d;
  return slotPol === mod.polarity ? Math.ceil(d / 2) : Math.ceil(d * 1.25);
}
export function evaluate(b: Build, frame: Entity | undefined, mods: Map<string, Entity>) {
  const issues: Issue[] = [], seen = new Set<string>(); let total = 0;
  const kind: Kind = b.kind ?? "warframe";
  const capacity = b.reactor ? 60 : 30;
  if (b.frame && !frame) issues.push({ level: "warn", text: "Selected item is not in the loaded data." });
  if (frame && !frame.slots) issues.push({ level: "warn", text: "This source lists no native polarities for this item, so every slot polarity you set is counted as a Forma." });
  const rows = b.slots.map((s, i) => {
    const pol = s.pol || null, m = s.mod ? mods.get(s.mod) : undefined;
    if (!s.mod) return { i, pol, m: undefined, d: null as number | null };
    if (!m) { issues.push({ level: "warn", text: `Slot ${i + 1}: mod not found in loaded data.` }); return { i, pol, m, d: null }; }
    if (!modFits(kind, m)) issues.push({ level: "error", text: `${m.name} is not a ${KIND_LABEL[kind]} mod (listed as "${m.type || m.compat}").` });
    else if (frame && (kind === "primary" || kind === "secondary" || kind === "melee") && frame.type && m.compat && !classFits(frame.type, m.compat, kind)) issues.push({ level: "warn", text: `${m.name} lists compatibility "${m.compat}" and this weapon is "${frame.type}". Check it fits.` });
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
  // The data lists WHICH polarities the item has natively, not which slot they sit on, so they are a pool: every polarity you set on a slot uses one native of that kind first, and each one beyond that costs a Forma.
  const pool = new Map<string, number>(); for (const p of frame?.slots ?? []) if (p) pool.set(p, (pool.get(p) ?? 0) + 1);
  const want = new Map<string, number>(); for (const sl of b.slots) if (sl.pol && sl.pol !== "any") want.set(sl.pol, (want.get(sl.pol) ?? 0) + 1);
  const forma = [...want].reduce((a, [p, n]) => a + Math.max(0, n - (pool.get(p) ?? 0)), 0), omni = b.slots.filter(sl => sl.pol === "any").length;
  return { arcanes, missingArcanes: arcanes.filter(a => !a.owned), arcDup: arcanes.length === 2 && arcanes[0].slug === arcanes[1].slug, forma, omni, frame: b.frame ? { name: frame?.name ?? b.frame, slug: b.frame, have: !!b.haveFrame } : null, mods: list, missingMods: list.filter(x => !x.owned),
    endoTotal: list.reduce((a, x) => a + (x.endo ?? 0), 0), endoKnown: list.every(x => x.endo != null) };
}
