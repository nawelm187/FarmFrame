import { useCatalogs } from "./useCatalog";
import { readGoals, readOwned, readRes } from "./goals";
import { readTracked } from "./track";
import { needs } from "./tree";
/** Lowercase names of everything the user still needs (goal parts, their resources, tracked items). Read from local progress. */
export function useNeeded(): Set<string> {
  const goals = readGoals(), own = readOwned(), res = readRes(), cats = [...new Set(goals.map(g => g.cat))];
  const cat = useCatalogs(cats);
  const s = new Set<string>();
  for (const t of readTracked()) if (t.o < t.t) s.add(t.n.toLowerCase());
  for (const g of goals) {
    const e = cat[g.cat]?.items?.find(x => x.slug === g.slug); if (!e) continue;
    const o = own[g.id] ?? {};
    for (const c of e.components) {
      const left = c.count - (o[c.name] ?? 0); if (left <= 0) continue;
      const full = `${e.name} ${c.name}`.toLowerCase(); s.add(c.name.toLowerCase()); s.add(full); s.add(full + " blueprint");
      for (const n of needs(c, left, "").values()) if (n.qty > (res[n.name] ?? 0)) s.add(n.name.toLowerCase());
    }
  }
  return s;
}
