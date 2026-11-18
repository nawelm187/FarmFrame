import { useMemo } from "react";
import { CATS, type Cat } from "./catalog";
import { useMany } from "./data";
import { useCatalogs } from "./useCatalog";
import { parseRelics } from "./drops";
import { PAGES, search, type Ent, type Hit } from "./search";
import { buildDocs, goalTarget } from "./searchDocs";
import { buildIndex, searchIndex, suggest } from "./smartSearch";
import { methodsForQuery, understand } from "./understand";
import { ENEMY_ALT, ENEMY_SRC, ENEMY_URL, parseEnemies } from "./enemies";
import { FILES, parseThings, resAlt, resUrl, RES_SRC } from "./resources";
import { METHODS } from "../data/methods";
import { methodDocs } from "./methods";
import { sameName } from "./refs";
const ITEM_KINDS = new Set(["Part", "Item", "Resource", "Vendor"]);
const kindOf = (c: Cat, cg: string) => (c === "warframe" || c === "companion" || c === "archwing" ? c : c === "weapon" && ["primary", "secondary", "melee"].includes(cg.toLowerCase()) ? cg.toLowerCase() : undefined);
/** Everything the search and the assistant know how to answer, computed from one question: the same engine for the Ctrl+K search and the Assistant page. */
export function useAnswerEngine(q: string) {
  const [{ rec }] = useMany([{ id: "relics", file: "relics.json" }]);
  const cats: Cat[] = q.trim().length >= 3 ? ["warframe", "weapon", "companion", "archwing", "mod"] : ["warframe", "weapon", "companion", "archwing"];
  const loaded = useCatalogs(cats);
  const ents = useMemo(() => cats.flatMap(c => (loaded[c]?.items ?? []).map((e): Ent & { description: string } => ({ name: e.name, cat: c, slug: e.slug, label: CATS[c].label.replace(/s$/, ""), kind: kindOf(c, e.category), parts: e.components.map(k => k.name), description: e.description }))),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [loaded.warframe?.items, loaded.weapon?.items, loaded.companion?.items, loaded.archwing?.items, loaded.mod?.items]);
  // Resources, items and enemies are loaded only once the search has two letters, so opening the palette stays light.
  const on = q.trim().length >= 2, win = 6 * 3_600_000;
  const extra = useMany(on ? [{ id: "things:resources", file: "", url: resUrl(FILES.resources), alt: resAlt(FILES.resources), src: RES_SRC, win }, { id: "things:items", file: "", url: resUrl(FILES.items), alt: resAlt(FILES.items), src: RES_SRC, win }, { id: "enemies", file: "", url: ENEMY_URL, alt: ENEMY_ALT, src: ENEMY_SRC, win }] : []);
  const relics = useMemo(() => parseRelics(rec?.data), [rec?.data]);
  const d0 = extra[0]?.rec?.data, d1 = extra[1]?.rec?.data, d2 = extra[2]?.rec?.data;
  const resources = useMemo(() => parseThings(d0), [d0]), items = useMemo(() => parseThings(d1), [d1]), enemies = useMemo(() => parseEnemies(d2), [d2]);
  const ix = useMemo(() => buildIndex([...buildDocs({ pages: PAGES, ents, relics, resources, items, enemies }), ...methodDocs()]), [ents, relics, resources, items, enemies]);
  const u0 = useMemo(() => understand(q), [q]);
  // Misspelt words: if nothing was recognised, retry with the closest known words and offer them as "Did you mean".
  // "what can I do now" has no item to correct: spell-fixing it would turn "now" into "new" and bury the intent it already recognised.
  const spelled = useMemo(() => (q.trim().length >= 3 ? suggest(ix, u0.text) : null), [ix, u0.text, q]), fixed = u0.intent?.kind === "now" || u0.intent?.kind === "changed" ? null : spelled;
  const u = useMemo(() => (!u0.material && fixed ? understand(fixed) : u0), [u0, fixed]), intent = u.intent, sub = intent && "subject" in intent ? intent.subject : "";
  const smart = useMemo(() => searchIndex(ix, sub || u.text, 12), [ix, u.text, sub]);
  // The older sentence patterns still add their shortcuts (need, build, prerequisite); the cards below replace the ones they overlap with.
  const shortcuts = q.trim().length >= 3 ? search(q, relics, ents).filter(h => h.cat === "Intent" && h.to !== "/farm" && h.to !== "/patches") : [];
  const hits: Hit[] = [...shortcuts, ...smart.map(m => ({ label: m.doc.title, cat: m.doc.kind, to: m.doc.to, s: 0 }))].slice(0, 10);
  const top = smart[0], ms = intent && (intent.kind === "method" || intent.kind === "where" || intent.kind === "what") ? methodsForQuery(u) : [];
  const topItem = top && ITEM_KINDS.has(top.doc.kind) && top.score >= 1.5 ? top.doc.title : null;
  // A material the person named wins over a fuzzy match; a subject nothing recognises is only shown as a last resort, and never when a method already answers it.
  const itemName = intent?.kind === "where" ? (u.material ?? topItem ?? (ms.length ? null : sub))
    : !intent && q.trim().length >= 4 && top && ITEM_KINDS.has(top.doc.kind) && top.field === "title" && top.score >= 2.2 ? top.doc.title : null;
  const whatName = intent?.kind === "what" ? (u.material ?? topItem) : null;
  const thing = (name: string | null) => (name ? [...(resources ?? []), ...(items ?? [])].find(t => sameName(t.name, name)) ?? null : null);
  const info = thing(itemName ?? whatName);
  const topMethod = !intent && !itemName && top?.doc.kind === "Method" && top.score >= 1.5 ? METHODS.find(x => `method:${x.id}` === top.doc.id) : undefined;
  const methods = intent?.kind === "method" ? ms : topMethod ? [topMethod] : intent?.kind === "where" && !itemName && ms.length ? ms : null;
  const target = !intent && !itemName && !methods && q.trim().length >= 3 && top && top.field === "title" && top.score >= 2.2 ? goalTarget(top.doc.to) : null;
  // Lore question: the best catalog match that is a real thing (not a page), so "lore de styanax" shows Styanax.
  const loreHit = intent?.kind === "lore" ? smart.find(m => m.doc.kind !== "Page")?.doc ?? null : null;
  return { q, hits, u, u0, fixed, intent, sub, top, itemName, whatName, info, methods, target, loreHit, ms };
}
export type AnswerEngine = ReturnType<typeof useAnswerEngine>;
