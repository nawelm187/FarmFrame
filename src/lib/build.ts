import type { Entity } from "./catalog";
export const NSLOTS = 8;
const CP = ["companion", "sentinel", "beast", "kubrow", "kavat", "vulpaphyla", "predasite"], WEAPON = ["primary", "secondary", "melee", "rifle", "shotgun", "pistol", "bow", "sniper", "crossbow", "launcher", "archgun", "arch-gun", "archmelee", "arch-melee"];
/** Hard compatibility by the mod's own listed category: a companion or weapon mod never fits a Warframe build, and so on. */
export function modFits(k: Kind, m: Entity): boolean {
  const t = `${m.type} ${m.compat}`.toLowerCase(), has = (...w: string[]) => w.some(x => t.includes(x));
  if (k === "companion") return has(...CP);
  if (k === "archwing") return has("archwing");
  if (k === "warframe") return !has(...CP, ...WEAPON, "archwing", "stance", "aura");
  return !has("warframe", ...CP, "archwing", "aura", "stance");
}
const classFits = (itemType: string, compat: string, kind: Kind) => { const c = compat.toLowerCase(); return c === "any" || c.includes(kind) || itemType.toLowerCase().split(/\s+/).some(w => w && c.includes(w)); };
export interface Slot { mod: string | null; rank: number; owned?: boolean; pol?: string }
/** Slots with their own rules: the Aura slot of a Warframe, the Stance slot of a melee weapon and the Exilus slot. */
export type SpecialKey = "aura" | "stance" | "exilus";
export type Kind = "warframe" | "primary" | "secondary" | "melee" | "companion" | "archwing";
export const KIND_LABEL: Record<Kind, string> = { warframe: "Warframe", primary: "Primary weapon", secondary: "Secondary weapon", melee: "Melee weapon", companion: "Companion", archwing: "Archwing" };
export interface Build { id: string; kind?: Kind; name: string; frame: string; slots: Slot[]; reactor: boolean; haveFrame?: boolean; arcanes?: ArcSlot[]; special?: Partial<Record<SpecialKey, Slot>> }
export const SPECIALS: Record<Kind, SpecialKey[]> = { warframe: ["aura", "exilus"], primary: ["exilus"], secondary: ["exilus"], melee: ["stance", "exilus"], companion: [], archwing: [] };
const SLOT_NAME: Record<SpecialKey, string> = { aura: "Aura", stance: "Stance", exilus: "Exilus" };
export const specialSlot = (b: Build, k: SpecialKey): Slot => b.special?.[k] ?? { mod: null, rank: 0 };
/** Every slot of a build: the eight normal ones plus the special ones that kind of item has. */
export const allSlots = (b: Build): Slot[] => [...b.slots, ...SPECIALS[b.kind ?? "warframe"].map(k => specialSlot(b, k))];
/** Does a mod belong in a special slot? "unknown" when the source does not say (Exilus needs the utility flag). */
export function specialFits(key: SpecialKey, kind: Kind, m: Entity): "yes" | "no" | "unknown" {
  const t = `${m.type} ${m.compat}`.toLowerCase();
  if (key === "aura") return kind === "warframe" && t.includes("aura") ? "yes" : "no";
  if (key === "stance") return kind === "melee" && t.includes("stance") ? "yes" : "no";
  if (!modFits(kind, m) || t.includes("aura") || t.includes("stance")) return "no";
  const u = m.raw?.isUtility; return u === true ? "yes" : u === false ? "no" : "unknown";
}
/** Capacity an Aura or Stance mod provides (rank counts): doubled on a matching polarity or an omni slot, 25% less (rounded) on a mismatch.
 *  Source: WARFRAME Wiki, Mod (older pages say 20% less; this follows the current wiki). */
export function capacityBonus(mod: Entity, rank: number, slotPol: string | null): number | null {
  if (mod.baseDrain == null) return null;
  const v = Math.abs(mod.baseDrain) + rank;
  if (!slotPol) return v; if (slotPol === "any") return v * 2; if (!mod.polarity) return v;
  return slotPol === mod.polarity ? v * 2 : Math.round(v * .75);
}
export interface ArcSlot { mod: string | null; owned?: boolean }
/** `text` is the English message (tests and the AI read it); `key` + `args` let the screen show it in the chosen language. */
export interface Issue { level: "error" | "warn"; text: string; key?: string; args?: Record<string, string | number | null | undefined> }
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
  let capacity = b.reactor ? 60 : 30;
  if (b.frame && !frame) issues.push({ level: "warn", text: "Selected item is not in the loaded data.", key: "issNotLoaded" });
  if (frame && !frame.slots) issues.push({ level: "warn", text: "This source lists no native polarities for this item, so every slot polarity you set is counted as a Forma.", key: "issNoNative" });
  const rows = b.slots.map((s, i) => {
    const pol = s.pol || null, m = s.mod ? mods.get(s.mod) : undefined;
    if (!s.mod) return { i, pol, m: undefined, d: null as number | null };
    if (!m) { issues.push({ level: "warn", text: `Slot ${i + 1}: mod not found in loaded data.`, key: "issSlotMissing", args: { n: i + 1 } }); return { i, pol, m, d: null }; }
    if (!modFits(kind, m)) issues.push({ level: "error", text: `${m.name} is not a ${KIND_LABEL[kind]} mod (listed as "${m.type || m.compat}").`, key: "issNotKind", args: { mod: m.name, kind, type: m.type || m.compat } });
    else if (frame && (kind === "primary" || kind === "secondary" || kind === "melee") && frame.type && m.compat && !classFits(frame.type, m.compat, kind)) issues.push({ level: "warn", text: `${m.name} lists compatibility "${m.compat}" and this weapon is "${frame.type}". Check it fits.`, key: "issCompat", args: { mod: m.name, compat: m.compat, type: frame.type } });
    if (seen.has(m.name)) issues.push({ level: "error", text: `${m.name} is used more than once.`, key: "issDup", args: { mod: m.name } }); seen.add(m.name);
    if (m.maxRank != null && s.rank > m.maxRank) issues.push({ level: "error", text: `${m.name}: rank ${s.rank} exceeds max rank ${m.maxRank}.`, key: "issRank", args: { mod: m.name, rank: s.rank, max: m.maxRank } });
    const d = drain(m, s.rank, pol);
    if (d == null) issues.push({ level: "warn", text: `${m.name}: no usable drain in the source (aura-type or missing), not counted.`, key: "issNoDrainAura", args: { mod: m.name } }); else total += d;
    return { i, pol, m, d };
  });
  const special = SPECIALS[kind].map(key => {
    const s = specialSlot(b, key), pol = s.pol || null, m = s.mod ? mods.get(s.mod) : undefined, none = { key, pol, m, d: null as number | null, bonus: null as number | null };
    if (!s.mod) return none;
    if (!m) { issues.push({ level: "warn", text: `${SLOT_NAME[key]} slot: mod not found in loaded data.`, key: "issSpecialMissing", args: { slot: key } }); return none; }
    const fit = specialFits(key, kind, m);
    if (fit === "no") issues.push({ level: "error", text: `${m.name} does not fit the ${SLOT_NAME[key]} slot (listed as "${m.type || m.compat}").`, key: "issNoFit", args: { mod: m.name, slot: key, type: m.type || m.compat } });
    else if (fit === "unknown") issues.push({ level: "warn", text: `${m.name}: the source does not say whether it is an Exilus mod, check it in game.`, key: "issExilusUnknown", args: { mod: m.name } });
    else if (key === "stance" && frame && frame.type && m.compat && !classFits(frame.type, m.compat, "melee")) issues.push({ level: "warn", text: `${m.name} lists compatibility "${m.compat}" and this weapon is "${frame.type}". Check it fits.`, key: "issCompat", args: { mod: m.name, compat: m.compat, type: frame.type } });
    if (seen.has(m.name)) issues.push({ level: "error", text: `${m.name} is used more than once.`, key: "issDup", args: { mod: m.name } }); seen.add(m.name);
    if (m.maxRank != null && s.rank > m.maxRank) issues.push({ level: "error", text: `${m.name}: rank ${s.rank} exceeds max rank ${m.maxRank}.`, key: "issRank", args: { mod: m.name, rank: s.rank, max: m.maxRank } });
    if (key === "exilus") { const d = drain(m, s.rank, pol); if (d == null) issues.push({ level: "warn", text: `${m.name}: no usable drain in the source, not counted.`, key: "issNoDrain", args: { mod: m.name } }); else total += d; return { ...none, d }; }
    const bonus = capacityBonus(m, s.rank, pol); if (bonus == null) issues.push({ level: "warn", text: `${m.name}: no capacity value in the source, not counted.`, key: "issNoCap", args: { mod: m.name } }); else capacity += bonus;
    return { ...none, bonus };
  });
  if (total > capacity) issues.push({ level: "error", text: `Capacity exceeded: ${total} / ${capacity}.`, key: "issCapacity", args: { total, cap: capacity } });
  return { rows, special, total, capacity, issues };
}
/** Standard endo rule: base (10/20/30/40 by rarity) x (2^rank - 1). A calculated estimate, not read from the source. */
const BASE: Record<string, number> = { common: 10, uncommon: 20, rare: 30, legendary: 40 };
export const endoFor = (rarity: string, rank: number): number | null => { const b = BASE[rarity.toLowerCase()]; return b && rank >= 0 ? b * (2 ** rank - 1) : null; };
export function requirements(b: Build, frame: Entity | undefined, mods: Map<string, Entity>, arc: Map<string, Entity> = new Map()) {
  const arcanes = [0, 1].map(i => b.arcanes?.[i]).filter((s): s is ArcSlot => !!s?.mod).map(s => ({ slug: s.mod!, name: arc.get(s.mod!)?.name ?? s.mod!, owned: !!s.owned }));
  const list = allSlots(b).filter(s => s.mod).map(s => { const m = mods.get(s.mod!); return { slug: s.mod!, name: m?.name ?? s.mod!, rank: s.rank, owned: !!s.owned, endo: m ? endoFor(m.rarity, s.rank) : null }; });
  // The data lists WHICH polarities the item has natively, not which slot they sit on, so they are a pool: every polarity you set on a slot uses one native of that kind first, and each one beyond that costs a Forma.
  const pool = new Map<string, number>(); for (const p of frame?.slots ?? []) if (p) pool.set(p, (pool.get(p) ?? 0) + 1);
  const want = new Map<string, number>(); for (const sl of b.slots) if (sl.pol && sl.pol !== "any") want.set(sl.pol, (want.get(sl.pol) ?? 0) + 1);
  // Special slots keep their own native polarity (Aura on a Warframe, Stance on a melee weapon); Exilus has none, so any polarity set there costs a Forma.
  const raw = (frame?.raw ?? {}) as Record<string, unknown>, nat = (k: SpecialKey): string[] => { const v = k === "aura" ? raw.aura : k === "stance" ? raw.stancePolarity : null; return (Array.isArray(v) ? v : [v]).filter((x): x is string => typeof x === "string").map(x => x.toLowerCase()).map(x => (x === "universal" ? "any" : x)); }; // real data: one value, or a list (Jade); melee stances may be "universal"
  const sp = SPECIALS[b.kind ?? "warframe"].map(k => ({ k, pol: specialSlot(b, k).pol })).filter(x => x.pol);
  const forma = [...want].reduce((a, [p, n]) => a + Math.max(0, n - (pool.get(p) ?? 0)), 0) + sp.filter(x => x.pol !== "any" && !nat(x.k).includes(x.pol as string)).length, omni = b.slots.filter(sl => sl.pol === "any").length + sp.filter(x => x.pol === "any" && !nat(x.k).includes("any")).length;
  return { arcanes, missingArcanes: arcanes.filter(a => !a.owned), arcDup: arcanes.length === 2 && arcanes[0].slug === arcanes[1].slug, forma, omni, frame: b.frame ? { name: frame?.name ?? b.frame, slug: b.frame, have: !!b.haveFrame } : null, mods: list, missingMods: list.filter(x => !x.owned),
    endoTotal: list.reduce((a, x) => a + (x.endo ?? 0), 0), endoKnown: list.every(x => x.endo != null) };
}
