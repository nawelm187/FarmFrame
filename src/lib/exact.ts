import type { Component, Entity } from "./catalog";
import { parseRelics, type Relic, type Row } from "./drops";
import { missing, tiersOf, type Goal, type Owned } from "./goals";
/** Drop tables that can say where a relic drops. Ids must match FIND in drops.ts ("missions", not "missionRewards"). */
export const RELIC_SOURCE_IDS = ["missions", "cetusBountyRewards", "solarisBountyRewards", "zarimanRewards", "transientRewards"];
export const STATES = ["Intact", "Exceptional", "Flawless", "Radiant"] as const;
const RO: Record<string, number> = { Common: 0, Uncommon: 1, Rare: 2 };
export interface RelicOpt { name: string; tier: string; rarity: string; chance: Record<string, number>; vaulted: boolean | null; stack: number }
export interface PartPlan { goal: Goal; entity: string; part: Component; left: number; have: number; relics: RelicOpt[]; other: { location: string; type: string }[]; relicTiers: string[] }
export interface Fis { tier: string; node: string; missionType: string; expiry: string; isHard: boolean; isStorm: boolean }
const rc = new WeakMap<object, Relic[] | null>();
/** parseRelics with a per-dataset cache, so it is not recomputed on every render. */
export function relicsOf(d: unknown): Relic[] | null {
  if (!d || typeof d !== "object") return null;
  if (!rc.has(d)) rc.set(d, parseRelics(d)); return rc.get(d) ?? null;
}
const ic = new WeakMap<Relic[], Map<string, { r: Relic; rarity: string }[]>>();
function index(relics: Relic[]) {
  let m = ic.get(relics); if (m) return m; m = new Map();
  for (const r of relics) for (const x of r.st.Intact ?? []) { const k = x.itemName.toLowerCase(), a = m.get(k) ?? []; a.push({ r, rarity: x.rarity }); m.set(k, a); }
  ic.set(relics, m); return m;
}
/** Reward names a component can have in the relic tables ("Rhino Prime" + "Neuroptics" -> "Rhino Prime Neuroptics Blueprint"). */
export function partNames(entity: string, c: Component): string[] {
  const e = entity.toLowerCase(), n = c.name.toLowerCase(), out = [`${e} ${n}`, `${e} ${n} blueprint`];
  if (n === "blueprint") out.push(`${e} blueprint`);
  return out;
}
/** Exact relics whose reward table contains the part, with the part's chance at each refinement. Vault status comes from the vault dataset (null = unknown). */
export function relicsForPart(relics: Relic[], entity: string, c: Component, vault: Map<string, boolean> | null): RelicOpt[] {
  const idx = index(relics), seen = new Map<string, RelicOpt>();
  for (const nm of partNames(entity, c)) for (const { r, rarity } of idx.get(nm) ?? []) {
    if (seen.has(r.name)) continue;
    const chance: Record<string, number> = {};
    for (const s of STATES) { const y = (r.st[s] ?? []).find(z => z.itemName.toLowerCase() === nm); if (y) chance[s] = y.chance; }
    seen.set(r.name, { name: r.name, tier: r.tier, rarity, chance, vaulted: vault?.get(r.name) ?? null, stack: 1 });
  }
  return [...seen.values()];
}
/** Best first: not vaulted, then relics that carry more of your missing parts, then the better chance. */
export const byValue = (a: RelicOpt, b: RelicOpt) => Number(a.vaulted === true) - Number(b.vaulted === true) || b.stack - a.stack || (RO[a.rarity] ?? 3) - (RO[b.rarity] ?? 3) || (b.chance.Intact ?? 0) - (a.chance.Intact ?? 0) || a.name.localeCompare(b.name);
/** Missing parts of every goal, each with its exact relics (when relic data is loaded) and non-relic sources from the item data. */
export function planParts(goals: Goal[], find: (g: Goal) => Entity | undefined, own: Owned, relics: Relic[] | null, vault: Map<string, boolean> | null): PartPlan[] {
  const plans: PartPlan[] = [];
  for (const g of goals) {
    const e = find(g); if (!e) continue;
    for (const c of missing(e.components, own[g.id])) {
      const have = Math.min(c.count, own[g.id]?.[c.name] ?? 0);
      plans.push({ goal: g, entity: e.name, part: c, left: c.count - have, have, relics: relics ? relicsForPart(relics, e.name, c, vault) : [], other: c.drops.filter(d => !/\b(Lith|Meso|Neo|Axi|Requiem)\b/i.test(d.location)), relicTiers: tiersOf(c) });
    }
  }
  const count = new Map<string, number>();
  for (const p of plans) for (const r of p.relics) count.set(r.name, (count.get(r.name) ?? 0) + 1);
  for (const p of plans) { for (const r of p.relics) r.stack = count.get(r.name) ?? 1; p.relics.sort(byValue); }
  return plans;
}
export const label = (p: PartPlan) => `${p.part.name} (${p.entity})`;
/** Active fissures for a tier, Star Chart before Railjack storms. */
export const fissuresFor = (fis: Fis[] | null, tier: string, now = Date.now()) => (fis ?? []).filter(f => f.tier === tier && Date.parse(f.expiry) > now).sort((a, b) => Number(a.isStorm) - Number(b.isStorm));
/** How a relic is refined: the part's chance at Intact versus Radiant, straight from the drop table. */
export function refinement(o: RelicOpt): { best: string; from: number; to: number; better: boolean } | null {
  const from = o.chance.Intact, to = o.chance.Radiant; if (from == null || to == null) return null;
  return { best: "Radiant", from, to, better: to > from };
}
export interface TierPlan { tier: string; fissures: Fis[]; relics: { opt: RelicOpt; parts: PartPlan[] }[] }
/** The farm plan: relics grouped by tier, each with the parts it advances, ordered by what is runnable now and how much it advances. */
export function tierPlans(plans: PartPlan[], fis: Fis[] | null, now = Date.now()): TierPlan[] {
  const m = new Map<string, Map<string, { opt: RelicOpt; parts: PartPlan[] }>>();
  for (const p of plans) for (const o of p.relics) {
    const t = m.get(o.tier) ?? new Map(); const e = t.get(o.name) ?? { opt: o, parts: [] }; e.parts.push(p); t.set(o.name, e); m.set(o.tier, t);
  }
  return [...m].map(([tier, rs]) => ({ tier, fissures: fissuresFor(fis, tier, now), relics: [...rs.values()].sort((a, b) => byValue(a.opt, b.opt)) }))
    .sort((a, b) => Number(!!b.fissures.length) - Number(!!a.fissures.length) || b.relics.length - a.relics.length || a.tier.localeCompare(b.tier));
}
/** Where a relic drops, from the loaded drop rows, best chance first. Nothing is guessed when no row exists. */
export function relicSources(rows: Row[], relic: string): Row[] {
  const k = relic.toLowerCase() + " relic";
  return rows.filter(r => r.item.toLowerCase().startsWith(k)).sort((a, b) => (b.ch ?? -1) - (a.ch ?? -1)).slice(0, 4);
}
export interface Next { text: string; to?: string; kind: "open" | "get" | "vaulted" | "source" | "none"; /** True only for "open" when a fissure of the relic's tier is running now. */ now?: boolean }
/** One concrete next action for a missing part. `owned` = relics the user marked as owned. */
export function nextAction(p: PartPlan, fis: Fis[] | null, owned: Record<string, number>, relicsLoaded = true, now = Date.now()): Next {
  const live = p.relics.filter(r => r.vaulted !== true);
  const mine = live.find(r => (owned[r.name] ?? 0) > 0);
  if (mine) { const f = fissuresFor(fis, mine.tier, now);
    return { kind: "open", now: f.length > 0, to: "/farm-plan", text: f.length ? `Open ${mine.name} (${mine.rarity}) in a ${mine.tier} fissure now: ${f[0].missionType} ${f[0].node}${f.length > 1 ? ` and ${f.length - 1} more` : ""}` : `You own ${mine.name} (${mine.rarity}). No ${mine.tier} fissure is active right now.` }; }
  if (live.length) { const r = live[0]; return { kind: "get", to: `/farm/${encodeURIComponent(r.name + " Relic")}`, text: `Get ${r.name} (${r.rarity})${live.length > 1 ? ` or ${live.length - 1} other relic${live.length > 2 ? "s" : ""}` : ""}, then open it in a ${r.tier} fissure` }; }
  if (p.relics.length) return { kind: "vaulted", text: `Only in vaulted relics (${p.relics.slice(0, 2).map(r => r.name).join(", ")}). Vaulted relics no longer drop; they come from trading or Varzia.` };
  if (p.relicTiers.length && !relicsLoaded) return { kind: "none", text: "Relic tables are not loaded yet, so the exact relics cannot be listed." };
  if (p.other.length) return { kind: "source", to: `/farm/${encodeURIComponent(p.entity + " " + p.part.name)}`, text: `Source: ${p.other.slice(0, 2).map(d => d.location).join("; ")}` };
  return { kind: "none", to: `/farm/${encodeURIComponent(p.entity + " " + p.part.name)}`, text: "No acquisition data in the loaded sources. Check the drop tables." };
}

/** Where a missing part sits in the plan: doable right now, a step away, or blocked (vaulted relic, or no data to act on). */
export type Group = "now" | "next" | "blocked";
export const groupOf = (n: Next): Group => (n.kind === "open" && n.now ? "now" : n.kind === "vaulted" || n.kind === "none" ? "blocked" : "next");
export const GROUP_TITLE: Record<Group, string> = { now: "Available now", next: "Next steps", blocked: "Blocked or no data" };
