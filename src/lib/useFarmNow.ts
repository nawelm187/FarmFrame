import { CATS, CAT_SRC, parseCatalog } from "./catalog";
import { useMany, useWorld } from "./data";
import { farmNow, type Fis, type Inv } from "./farmNow";
import { missing, readGoals, readOwned, tiersOf } from "./goals";
import { useNeeded } from "./useNeeded";
const isFis = (d: unknown): d is Fis[] => Array.isArray(d);
const isInv = (d: unknown): d is Inv[] => Array.isArray(d);
export function useFarmNow() {
  const goals = readGoals(), own = readOwned(), cats = [...new Set(goals.map(g => g.cat))];
  const r = useMany(cats.map(c => ({ id: c, file: "", url: CATS[c].url, src: CAT_SRC })));
  const fis = useWorld("fissures", isFis), inv = useWorld("invasions", isInv), needed = useNeeded();
  const tiers = new Map<string, string[]>();
  for (const g of goals) {
    const e = parseCatalog(r[cats.indexOf(g.cat)]?.rec?.data, g.cat)?.find(x => x.slug === g.slug); if (!e) continue;
    for (const c of missing(e.components, own[g.id])) for (const t of tiersOf(c)) tiers.set(t, [...(tiers.get(t) ?? []), `${c.name} (${e.name})`]);
  }
  return { goals: goals.length, fis, inv, opps: farmNow({ tiers, fissures: fis.data, invasions: inv.data, needed, now: Date.now() }) };
}
