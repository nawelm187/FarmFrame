import type { Entity } from "./catalog";
import type { Build } from "./build";
/** Requirements that come from builds (mods, arcanes, Forma) and live in the Roadmap next to goal parts. */
export interface Req { id: string; build: string; buildName: string; kind: "mod" | "arcane" | "forma" | "omni"; name: string; slug?: string; need: number; have: number; src: string[] }
const K = "ff.reqs";
export const readReqs = (): Req[] => { try { const v: unknown = JSON.parse(localStorage.getItem(K) || "[]"); return Array.isArray(v) ? (v as Req[]) : []; } catch { return []; } };
export const writeReqs = (a: Req[]) => { try { localStorage.setItem(K, JSON.stringify(a)); } catch { /* storage unavailable */ } };
/** Acquisition methods listed by the item data itself (best chance first). Empty when the source lists none; nothing is invented. */
export function acquisition(e: Entity | undefined, max = 3): string[] {
  const d = e?.raw.drops; if (!Array.isArray(d)) return [];
  const rows = d.filter((x): x is Record<string, unknown> => !!x && typeof x === "object" && typeof (x as Record<string, unknown>).location === "string")
    .map(x => ({ loc: String(x.location), ch: typeof x.chance === "number" ? x.chance : -1, rar: typeof x.rarity === "string" ? x.rarity : "" }));
  rows.sort((a, b) => b.ch - a.ch);
  return rows.slice(0, max).map(r => (r.rar ? `${r.loc} (${r.rar})` : r.loc));
}
type RQ = { missingMods: { slug: string; name: string; rank: number }[]; missingArcanes: { slug: string; name: string }[]; forma: number; omni: number };
/** Turns a build's missing pieces into Roadmap requirements. Merges with what is already there: counts and owned amounts you entered are kept. */
export function fromBuild(b: Build, rq: RQ, ents: Map<string, Entity>, arcs: Map<string, Entity>, old: Req[]): Req[] {
  const mk = (kind: Req["kind"], name: string, need: number, slug?: string, e?: Entity): Req => ({ id: `${b.id}:${kind}:${slug ?? name}`, build: b.id, buildName: b.name, kind, name, slug, need, have: 0, src: kind === "forma" || kind === "omni" ? [] : acquisition(e) });
  const next = [...rq.missingMods.map(m => mk("mod", m.name, 1, m.slug, ents.get(m.slug))), ...rq.missingArcanes.map(a => mk("arcane", a.name, 1, a.slug, arcs.get(a.slug)))];
  if (rq.forma > 0) next.push(mk("forma", "Forma Blueprint", rq.forma)); if (rq.omni > 0) next.push(mk("omni", "Omni Forma Blueprint", rq.omni));
  const rest = old.filter(r => r.build !== b.id);
  return [...rest, ...next.map(n => ({ ...n, have: old.find(r => r.id === n.id)?.have ?? 0 }))];
}
