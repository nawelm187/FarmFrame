import { useCatalogs } from "./useCatalog";
import { useMany, useWorld } from "./data";
import { planParts, relicsOf, tierPlans, type Fis } from "./exact";
import { progress, readGoals, readOwned, type Goal } from "./goals";
import { readRelics } from "./myrelics";
import { parseVault, VAULT_ALT, VAULT_SRC, VAULT_URL } from "./vault";
const isFis = (d: unknown): d is Fis[] => Array.isArray(d);
/** One shared view of the plan: goals -> missing parts -> exact relics -> active fissures. Everything is read from loaded data. */
export function useExact() {
  const goals = readGoals(), own = readOwned(), cats = [...new Set(goals.map(g => g.cat))], cat = useCatalogs(cats);
  const [rr, vr] = useMany([{ id: "relics", file: "relics.json" }, { id: "relicsVault", file: "", url: VAULT_URL, alt: VAULT_ALT, src: VAULT_SRC }]);
  const fis = useWorld("fissures", isFis), relics = relicsOf(rr.rec?.data), vault = parseVault(vr.rec?.data);
  const plans = planParts(goals, g => cat[g.cat]?.items?.find(x => x.slug === g.slug), own, relics, vault);
  // Goals the catalog cannot find (renamed or removed) must be said out loud, not read as "nothing missing".
  const lost: Goal[] = goals.filter(g => cat[g.cat]?.items && !cat[g.cat]!.items!.some(x => x.slug === g.slug));
  const info = goals.flatMap(g => { const e = cat[g.cat]?.items?.find(x => x.slug === g.slug); if (!e) return []; const p = progress(e.components, own[g.id]); return [{ goal: g, parts: e.components.length, have: p.have, total: p.total, pct: p.pct }]; });
  return { goals, lost, info, plans, tiers: tierPlans(plans, fis.data), fis, relics, relicStatus: rr.status, relicRec: rr.rec, mine: readRelics(), pending: goals.some(g => !cat[g.cat]?.items) };
}
