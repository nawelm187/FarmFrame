import { useWorld } from "./data";
import { farmNow, type Inv, type Link, type OppGoal } from "./farmNow";
import { progress, readOwned } from "./goals";
import { label } from "./exact";
import { useExact } from "./useExact";
import { useNeeded } from "./useNeeded";
import { useCatalogs } from "./useCatalog";
const isInv = (d: unknown): d is Inv[] => Array.isArray(d);
export function useFarmNow() {
  const ex = useExact(), inv = useWorld("invasions", isInv), needed = useNeeded(), own = readOwned();
  const cat = useCatalogs([...new Set(ex.goals.map(g => g.cat))]);
  const tiers = new Map<string, string[]>(), links: Link[] = [], prog = new Map<string, OppGoal>();
  for (const g of ex.goals) { const e = cat[g.cat]?.items?.find(x => x.slug === g.slug); if (e) { const p = progress(e.components, own[g.id]); prog.set(g.name, { name: g.name, have: p.have, total: p.total }); } }
  for (const p of ex.plans) {
    for (const t of p.relicTiers) tiers.set(t, [...(tiers.get(t) ?? []), label(p)]);
    for (const r of p.relics) links.push({ tier: r.tier, relic: r.name, rarity: r.rarity, part: label(p), goal: p.goal.name, vaulted: r.vaulted, owned: ex.mine[r.name] ?? 0 });
  }
  const opps = farmNow({ tiers, fissures: ex.fis.data, invasions: inv.data, needed, now: Date.now(), exact: ex.relics ? links : null, progress: prog });
  return { goals: ex.goals.length, fis: ex.fis, inv, opps, exact: ex };
}
