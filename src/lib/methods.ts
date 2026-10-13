import { METHODS, type Level, type Method } from "../data/methods";
import { nameKey } from "./refs";
import type { Doc } from "./smartSearch";
const LV: Record<Level, number> = { Beginner: 0, Intermediate: 1, Veteran: 2 };
/** Methods that give a material: those whose main product it is first, community strategies last, then easiest first. Matches the name ignoring case, accents and spacing. */
export function methodsFor(name: string, all: Method[] = METHODS): Method[] {
  const k = nameKey(name); if (!k) return [];
  return all.filter(m => m.yields.some(y => nameKey(y) === k)).sort((a, b) => Number(nameKey(a.yields[0]) !== k) - Number(nameKey(b.yields[0]) !== k) || Number(a.status === "community") - Number(b.status === "community") || LV[a.level] - LV[b.level] || a.title.localeCompare(b.title));
}
/** Search entries for the methods: found by what they give, where they happen and the words of their steps. */
export function methodDocs(all: Method[] = METHODS): Doc[] {
  return all.map(m => ({ id: `method:${m.id}`, title: m.title, kind: "Method", to: `/methods?m=${m.id}`, alias: `${m.status === "community" ? "community unverified exploit trick " : ""}${m.yields.join(" ")} farm farming method fastest best way ${m.level}`,
    body: `${m.summary} ${m.steps.join(" ")} ${(m.mods ?? []).map(x => `${x.name} companion mod ${x.effect}`).join(" ")} ${m.boosts.map(b => b.name).join(" ")}`.slice(0, 900), boost: 0.15 }));
}
