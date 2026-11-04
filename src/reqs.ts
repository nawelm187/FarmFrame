import type { Entity } from "./catalog";
import type { Build } from "./build";
/** Requirements that come from builds (mods, arcanes, Forma) and live in the Roadmap next to goal parts. */
export interface Req { id: string; build: string; buildName: string; kind: "mod" | "arcane" | "forma" | "omni"; name: string; slug?: string; need: number; have: number; src: string[] }
const K = "ff.reqs";
const KINDS: Req["kind"][] = ["mod", "arcane", "forma", "omni"];
const cnt = (x: unknown) => (typeof x === "number" && Number.isFinite(x) && x >= 0 ? Math.floor(x) : null);
/** Keeps only well-formed requirements. Storage and cloud rows are untrusted input: a damaged entry is dropped instead of crashing the Roadmap. */
export function cleanReqs(v: unknown): Req[] {
  if (!Array.isArray(v)) return [];
  const out: Req[] = [];
  for (const x of v) {
    if (!x || typeof x !== "object") continue; const r = x as Record<string, unknown>, need = cnt(r.need), have = cnt(r.have);
    if (typeof r.id !== "string" || typeof r.build !== "string" || typeof r.name !== "string" || !KINDS.includes(r.kind as Req["kind"]) || need == null || have == null) continue;
    out.push({ id: r.id, build: r.build, buildName: typeof r.buildName === "string" ? r.buildName : "", kind: r.kind as Req["kind"], name: r.name, slug: typeof r.slug === "string" ? r.slug : undefined, need, have, src: Array.isArray(r.src) ? r.src.filter((y): y is string => typeof y === "string") : [] });
  }
  return out;
}
export const readReqs = (): Req[] => { try { return cleanReqs(JSON.parse(localStorage.getItem(K) || "[]")); } catch { return []; } };
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
