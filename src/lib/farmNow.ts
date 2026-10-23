import { tierA } from "./text";
import { t as tr, tp } from "../i18n";
import { READY_RANK, readiness, type Block, type Ready } from "./unlock";
export interface Fis { tier: string; node: string; missionType: string; expiry: string; isHard: boolean; isStorm: boolean }
export interface Side { faction?: string; reward?: { countedItems?: { count: number; type: string }[]; items?: string[] } }
export interface Inv { node: string; completed: boolean; attacker?: Side; defender?: Side }
/** One exact relic that carries a part you still need. */
export interface Link { tier: string; relic: string; rarity: string; part: string; goal: string; vaulted: boolean | null; owned: number }
export interface OppRelic { relic: string; rarity: string; parts: string[]; vaulted: boolean | null; owned: number }
export interface OppGoal { name: string; have: number; total: number }
/** One concrete step: open this exact relic in this exact fissure. */
export interface Play { relic: string; parts: string[]; node: string; mission: string; ready: Ready }
export interface OppNode { node: string; mission: string; storm: boolean; hard: boolean; ready: Ready }
export interface Opp { key: string; kind: "fissure" | "invasion"; tier?: string; title: string; advances: string[]; why: string[]; relics?: OppRelic[]; goals?: OppGoal[]; exact?: boolean; /** Every active fissure of this tier, playable ones first. */ nodes?: OppNode[]; /** Owned relics paired with the best fissure you can start. */ plays?: Play[];
  /** The node it is played at, when known. */ node?: string; /** What to get or confirm before it can be played; empty means ready now. */ blocks?: Block[] }
export type UnlockCheck = (n: { node: string; hard: boolean; storm: boolean }) => Block[];
export const names = (s?: Side) => [...(s?.reward?.countedItems?.map(i => i.type) ?? []), ...(s?.reward?.items ?? [])];
/** Current opportunities = live world state x what the user still needs. Never claims more than the data supports.
 *  With `exact` (relic tables loaded) fissures are matched to the exact relics holding your missing parts; without it, by relic tier only. */
export function farmNow(i: { tiers: Map<string, string[]>; fissures: Fis[] | null; invasions: Inv[] | null; needed: Set<string>; now: number; exact?: Link[] | null; progress?: Map<string, OppGoal>; unlock?: UnlockCheck }): Opp[] {
  const out: Opp[] = [];
  const tierSet = new Set(i.tiers.keys()); if (i.exact) for (const l of i.exact) tierSet.add(l.tier);
  for (const t of tierSet) {
    const fb = (x: Fis) => i.unlock?.({ node: x.node, hard: x.isHard, storm: x.isStorm }) ?? [];
    // A mission you can start comes first; among equals, normal missions before Void Storms.
    const f = (i.fissures ?? []).filter(x => x.tier === t && Date.parse(x.expiry) > i.now).sort((a, b) => READY_RANK[readiness(fb(a))] - READY_RANK[readiness(fb(b))] || Number(a.isStorm) - Number(b.isStorm));
    if (!f.length) continue;
    const head = tp("fnHead", f.length, { tier: t, list: f.slice(0, 3).map(x => `${x.missionType} ${x.node}`).join(", ") }) + (f.length > 3 ? " " + tr("fnAndMore") : "");
    if (i.exact) {
      const links = i.exact.filter(l => l.tier === t && l.vaulted !== true); if (!links.length) continue;
      const rm = new Map<string, OppRelic>();
      for (const l of links) { const r = rm.get(l.relic) ?? { relic: l.relic, rarity: l.rarity, parts: [], vaulted: l.vaulted, owned: l.owned }; if (!r.parts.includes(l.part)) r.parts.push(l.part); rm.set(l.relic, r); }
      const relics = [...rm.values()].sort((a, b) => Number(b.owned > 0) - Number(a.owned > 0) || b.parts.length - a.parts.length || a.relic.localeCompare(b.relic));
      const parts = [...new Set(links.map(l => l.part))], goals = [...new Set(links.map(l => l.goal))].map(g => i.progress?.get(g) ?? { name: g, have: 0, total: 0 }), mine = relics.filter(r => r.owned > 0);
      const nodes: OppNode[] = f.map(x => ({ node: x.node, mission: x.missionType, storm: x.isStorm, hard: x.isHard, ready: readiness(fb(x)) })), bestNode = nodes[0];
      const plays: Play[] = mine.slice(0, 3).map(r => ({ relic: r.relic, parts: r.parts, node: bestNode.node, mission: bestNode.mission, ready: bestNode.ready }));
      const noRelic: Block[] = mine.length ? [] : [{ kind: "relic", severity: "blocked", text: tr("fnNoRelic", { list: relics.slice(0, 3).map(r => r.relic).join(", ") }) }];
      out.push({ key: "f" + t, kind: "fissure", tier: t, exact: true, nodes, plays, node: f[0].node, blocks: [...noRelic, ...fb(f[0])], title: tr("fnTitle", { tier: t, node: f[0].node, mission: f[0].missionType }), advances: parts, relics, goals,
        why: [head, relics.length > 4 ? tr("fnExactMore", { list: relics.slice(0, 4).map(r => `${r.relic} (${r.rarity})`).join(", "), n: relics.length - 4 }) : tr("fnExact", { list: relics.slice(0, 4).map(r => `${r.relic} (${r.rarity})`).join(", ") }),
          mine.length ? tr("fnYouOwn", { list: mine.map(r => r.relic).join(", ") }) : tr("fnNoneOwned")] });
      continue;
    }
    const items = i.tiers.get(t) ?? [];
    out.push({ key: "f" + t, kind: "fissure", tier: t, node: f[0].node, nodes: f.map(x => ({ node: x.node, mission: x.missionType, storm: x.isStorm, hard: x.isHard, ready: readiness(fb(x)) })), blocks: fb(f[0]), title: tr("fnTitle", { tier: t, node: f[0].node, mission: f[0].missionType }), advances: items,
      why: [head, tr("fnTierPart", { tier: t, tierA: tierA(t) }), tr("fnMatchedTier")] });
  }
  (i.invasions ?? []).forEach((v, n) => {
    if (v.completed) return;
    const hit = [...new Set([...names(v.attacker), ...names(v.defender)].filter(x => i.needed.has(x.toLowerCase())))];
    if (hit.length) out.push({ key: "i" + n, kind: "invasion", node: v.node, blocks: i.unlock?.({ node: v.node, hard: false, storm: false }) ?? [], title: tr("fnInvasion", { node: v.node }), advances: hit, why: [tr("fnInvMatch")] });
  });
  return out.sort((a, b) => READY_RANK[readiness(a.blocks)] - READY_RANK[readiness(b.blocks)] || Number((b.relics?.some(r => r.owned > 0)) ?? false) - Number((a.relics?.some(r => r.owned > 0)) ?? false) || b.advances.length - a.advances.length).slice(0, 5);
}
/** Calculated relevance to the user's own goals (number of objectives advanced), not a universal ranking. */
export const value = (n: number) => (n >= 3 ? tr("valHigh") : n === 2 ? tr("valMedium") : tr("valLow"));

/** Reward names of an invasion (either side) that match something the user still needs (`needed`: lowercase names). */
export const usefulInvasion = (v: Inv, needed: Set<string>): string[] => [...new Set([...names(v.attacker), ...names(v.defender)].filter(x => needed.has(x.toLowerCase())))];
