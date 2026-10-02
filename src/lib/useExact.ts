import { useCatalogs } from "./useCatalog";
import { useMany, useWorld } from "./data";
import { planParts, relicsOf, tierPlans, type Fis } from "./exact";
import { readGoals, readOwned } from "./goals";
import { readRelics } from "./myrelics";
import { parseVault, VAULT_ALT, VAULT_SRC, VAULT_URL } from "./vault";
const isFis = (d: unknown): d is Fis[] => Array.isArray(d);
/** One shared view of the plan: goals -> missing parts -> exact relics -> active fissures. Everything is read from loaded data. */
export function useExact() {
  const goals = readGoals(), own = readOwned(), cats = [...new Set(goals.map(g => g.cat))], cat = useCatalogs(cats);
  const [rr, vr] = useMany([{ id: "relics", file: "relics.json" }, { id: "relicsVault", file: "", url: VAULT_URL, alt: VAULT_ALT, src: VAULT_SRC }]);
  const fis = useWorld("fissures", isFis), relics = relicsOf(rr.rec?.data), vault = parseVault(vr.rec?.data);
  const plans = planParts(goals, g => cat[g.cat]?.items?.find(x => x.slug === g.slug), own, relics, vault);
  return { goals, plans, tiers: tierPlans(plans, fis.data), fis, relics, relicStatus: rr.status, relicRec: rr.rec, mine: readRelics(), pending: goals.some(g => !cat[g.cat]?.items) };
}
