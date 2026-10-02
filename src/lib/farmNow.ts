export interface Fis { tier: string; node: string; missionType: string; expiry: string; isHard: boolean; isStorm: boolean }
export interface Side { faction?: string; reward?: { countedItems?: { count: number; type: string }[]; items?: string[] } }
export interface Inv { node: string; completed: boolean; attacker?: Side; defender?: Side }
/** One exact relic that carries a part you still need. */
export interface Link { tier: string; relic: string; rarity: string; part: string; goal: string; vaulted: boolean | null; owned: number }
export interface OppRelic { relic: string; rarity: string; parts: string[]; vaulted: boolean | null; owned: number }
export interface OppGoal { name: string; have: number; total: number }
export interface Opp { key: string; kind: "fissure" | "invasion"; tier?: string; title: string; advances: string[]; why: string[]; relics?: OppRelic[]; goals?: OppGoal[]; exact?: boolean }
const names = (s?: Side) => [...(s?.reward?.countedItems?.map(i => i.type) ?? []), ...(s?.reward?.items ?? [])];
/** Current opportunities = live world state x what the user still needs. Never claims more than the data supports.
 *  With `exact` (relic tables loaded) fissures are matched to the exact relics holding your missing parts; without it, by relic tier only. */
export function farmNow(i: { tiers: Map<string, string[]>; fissures: Fis[] | null; invasions: Inv[] | null; needed: Set<string>; now: number; exact?: Link[] | null; progress?: Map<string, OppGoal> }): Opp[] {
  const out: Opp[] = [];
  const tierSet = new Set(i.tiers.keys()); if (i.exact) for (const l of i.exact) tierSet.add(l.tier);
  for (const t of tierSet) {
    const f = (i.fissures ?? []).filter(x => x.tier === t && Date.parse(x.expiry) > i.now).sort((a, b) => Number(a.isStorm) - Number(b.isStorm));
    if (!f.length) continue;
    const head = `${f.length} active ${t} fissure${f.length > 1 ? "s" : ""}: ${f.slice(0, 3).map(x => `${x.missionType} ${x.node}`).join(", ")}${f.length > 3 ? " and more" : ""}`;
    if (i.exact) {
      const links = i.exact.filter(l => l.tier === t && l.vaulted !== true); if (!links.length) continue;
      const rm = new Map<string, OppRelic>();
      for (const l of links) { const r = rm.get(l.relic) ?? { relic: l.relic, rarity: l.rarity, parts: [], vaulted: l.vaulted, owned: l.owned }; if (!r.parts.includes(l.part)) r.parts.push(l.part); rm.set(l.relic, r); }
      const relics = [...rm.values()].sort((a, b) => Number(b.owned > 0) - Number(a.owned > 0) || b.parts.length - a.parts.length || a.relic.localeCompare(b.relic));
      const parts = [...new Set(links.map(l => l.part))], goals = [...new Set(links.map(l => l.goal))].map(g => i.progress?.get(g) ?? { name: g, have: 0, total: 0 }), mine = relics.filter(r => r.owned > 0);
      out.push({ key: "f" + t, kind: "fissure", tier: t, exact: true, title: `${t} fissure: ${f[0].node} (${f[0].missionType})`, advances: parts, relics, goals,
        why: [head, `Exact relics that hold your missing parts: ${relics.slice(0, 4).map(r => `${r.relic} (${r.rarity})`).join(", ")}${relics.length > 4 ? ` and ${relics.length - 4} more` : ""}`,
          mine.length ? `You own: ${mine.map(r => r.relic).join(", ")}. Open them in these fissures.` : "You have not marked any of these relics as owned. Get one first (see Farm Plan), then open it in a fissure of this tier."] });
      continue;
    }
    const items = i.tiers.get(t) ?? [];
    out.push({ key: "f" + t, kind: "fissure", tier: t, title: `${t} fissure: ${f[0].node} (${f[0].missionType})`, advances: items,
      why: [head, `These missing parts list a ${t} relic as a source`, "Matched by relic tier because the exact relic tables are not loaded"] });
  }
  (i.invasions ?? []).forEach((v, n) => {
    if (v.completed) return;
    const hit = [...new Set([...names(v.attacker), ...names(v.defender)].filter(x => i.needed.has(x.toLowerCase())))];
    if (hit.length) out.push({ key: "i" + n, kind: "invasion", title: `Invasion: ${v.node}`, advances: hit, why: ["Its reward matches something you still need (matched by item name)"] });
  });
  return out.sort((a, b) => Number((b.relics?.some(r => r.owned > 0)) ?? false) - Number((a.relics?.some(r => r.owned > 0)) ?? false) || b.advances.length - a.advances.length).slice(0, 5);
}
/** Calculated relevance to the user's own goals (number of objectives advanced), not a universal ranking. */
export const value = (n: number) => (n >= 3 ? "High" : n === 2 ? "Medium" : "Low");
