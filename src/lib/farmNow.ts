export interface Fis { tier: string; node: string; missionType: string; expiry: string; isHard: boolean; isStorm: boolean }
export interface Side { faction?: string; reward?: { countedItems?: { count: number; type: string }[]; items?: string[] } }
export interface Inv { node: string; completed: boolean; attacker?: Side; defender?: Side }
export interface Opp { key: string; kind: "fissure" | "invasion"; tier?: string; title: string; advances: string[]; why: string[] }
const names = (s?: Side) => [...(s?.reward?.countedItems?.map(i => i.type) ?? []), ...(s?.reward?.items ?? [])];
/** Current opportunities = live world state x what the user still needs. Never claims more than the data supports. */
export function farmNow(i: { tiers: Map<string, string[]>; fissures: Fis[] | null; invasions: Inv[] | null; needed: Set<string>; now: number }): Opp[] {
  const out: Opp[] = [];
  for (const [t, items] of i.tiers) {
    const f = (i.fissures ?? []).filter(x => x.tier === t && Date.parse(x.expiry) > i.now).sort((a, b) => Number(a.isStorm) - Number(b.isStorm));
    if (!f.length) continue;
    out.push({ key: "f" + t, kind: "fissure", tier: t, title: `${t} fissure: ${f[0].node} (${f[0].missionType})`, advances: items,
      why: [`${f.length} active ${t} fissure${f.length > 1 ? "s" : ""}`, `These missing parts list a ${t} relic as a source`, "Matched by relic tier, not by the exact relic you own"] });
  }
  (i.invasions ?? []).forEach((v, n) => {
    if (v.completed) return;
    const hit = [...new Set([...names(v.attacker), ...names(v.defender)].filter(x => i.needed.has(x.toLowerCase())))];
    if (hit.length) out.push({ key: "i" + n, kind: "invasion", title: `Invasion: ${v.node}`, advances: hit, why: ["Its reward matches something you still need (matched by item name)"] });
  });
  return out.sort((a, b) => b.advances.length - a.advances.length).slice(0, 5);
}
