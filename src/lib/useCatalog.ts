import { CATS, CAT_SRC, parseCatalog, type Cat, type Entity } from "./catalog";
import { useMany } from "./data";
const RAW = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/", CDN = "https://cdn.jsdelivr.net/gh/WFCD/warframe-items@master/data/json/";
const GH_SRC = "WFCD warframe-items on GitHub (community, unofficial)";
const gh = (f: string) => ({ url: RAW + f, alt: CDN + f });
interface Src { id: string; url: string; alt?: string; cat: Cat; src: string }
const SOURCES: Record<Cat, Src[]> = {
  warframe: [{ id: "warframe", url: CATS.warframe.url, cat: "warframe", src: CAT_SRC }],
  weapon: [{ id: "weapon", url: CATS.weapon.url, cat: "weapon", src: CAT_SRC }],
  mod: [{ id: "mod", url: CATS.mod.url, cat: "mod", src: CAT_SRC }],
  companion: [{ id: "sentinels", ...gh("Sentinels.json"), cat: "companion", src: GH_SRC }, { id: "pets", ...gh("Pets.json"), cat: "companion", src: GH_SRC }],
  archwing: ["Archwing.json", "Arch-Gun.json", "Arch-Melee.json"].map(f => ({ id: "aw-" + f, ...gh(f), cat: "archwing" as Cat, src: GH_SRC })),
  railjack: [{ id: "mod", url: CATS.mod.url, cat: "mod", src: CAT_SRC }],
};
/** Railjack has no dedicated file in the source: its mods are picked out of the mod list by their own listed category. */
const FILTER: Partial<Record<Cat, (e: Entity) => boolean>> = { railjack: e => /railjack|avionic|plexus/i.test(`${e.type} ${e.compat}`) };
/** One catalog, possibly assembled from several source files. */
export function useCatalog(cat: Cat) {
  const srcs = SOURCES[cat], res = useMany(srcs.map(s => ({ id: s.id, file: "", url: s.url, alt: s.alt, src: s.src })));
  const parts = srcs.map((s, i) => parseCatalog(res[i].rec?.data, s.cat)), f = FILTER[cat];
  const items = srcs.length === 1 && !f ? parts[0] ?? [] : [...parts.flatMap(p => p ?? []).filter(e => !f || f(e))].sort((a, b) => a.name.localeCompare(b.name));
  return { items: items.length ? items : null, status: (res.find(r => r.status === "LOADING") ?? res[0]).status, rec: res.find(r => r.rec?.err)?.rec ?? res[0].rec };
}
