import { GH_ALT, GH_RAW, GH_SRC, parseCatalog, type Cat, type Entity } from "./catalog";
import { useMany, type Rec, type Status } from "./data";
const WIN = 6 * 3_600_000; // catalogs are re-checked every 6 hours so new releases show up
interface Src { id: string; url: string; alt: string; cat: Cat }
const f = (file: string, cat: Cat): Src => ({ id: "f:" + file, url: GH_RAW + file, alt: GH_ALT + file, cat });
const SOURCES: Record<Cat, Src[]> = {
  warframe: [f("Warframes.json", "warframe")],
  weapon: ["Primary.json", "Secondary.json", "Melee.json"].map(x => f(x, "weapon")),
  mod: [f("Mods.json", "mod")],
  companion: ["Sentinels.json", "Pets.json"].map(x => f(x, "companion")),
  archwing: ["Archwing.json", "Arch-Gun.json", "Arch-Melee.json"].map(x => f(x, "archwing")),
  railjack: [f("Mods.json", "mod")],
};
/** Companions: real companions only (they have health). Railjack: mods the source itself lists as Railjack. */
const FILTER: Partial<Record<Cat, (e: Entity) => boolean>> = {
  companion: e => e.stats.some(([l]) => l === "Health") && !/apothic|egg\b|genetic|imprint|mutagen|incubator|antigen|stabilizer/i.test(e.name),
  railjack: e => /railjack/i.test(`${e.type} ${e.compat}`),
};
const mc = new Map<string, { refs: unknown[]; items: Entity[] }>();
function merged(c: Cat, parts: (Entity[] | null)[], build: () => Entity[]): Entity[] {
  const hit = mc.get(c);
  if (hit && hit.refs.length === parts.length && hit.refs.every((r, i) => r === parts[i])) return hit.items;
  const items = build(); mc.set(c, { refs: parts, items }); return items;
}
export interface CatState { items: Entity[] | null; status: Status; rec?: Rec }
/** Loads and merges every source file of the requested catalogs in one pass. */
export function useCatalogs(cats: Cat[]): Partial<Record<Cat, CatState>> {
  const list = cats.flatMap(c => SOURCES[c].map(s => ({ c, s })));
  const res = useMany(list.map(({ s }) => ({ id: s.id, file: "", url: s.url, alt: s.alt, src: GH_SRC, win: WIN })));
  const out: Partial<Record<Cat, CatState>> = {};
  for (const c of cats) {
    const idx = list.map((x, i) => (x.c === c ? i : -1)).filter(i => i >= 0), fl = FILTER[c];
    const parts = idx.map(i => parseCatalog(res[i].rec?.data, list[i].s.cat));
    const items = merged(c, parts, () => (idx.length === 1 && !fl ? parts[0] ?? [] : parts.flatMap(p => p ?? []).filter(e => !fl || fl(e)).sort((a, b) => a.name.localeCompare(b.name))));
    const mine = idx.map(i => res[i]);
    out[c] = { items: items.length ? items : null, status: (mine.find(r => r.status === "LOADING") ?? mine[0]).status, rec: mine.find(r => r.rec?.err)?.rec ?? mine[0].rec };
  }
  return out;
}
export const useCatalog = (cat: Cat): CatState => useCatalogs([cat])[cat]!;
