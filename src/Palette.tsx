import { useMemo, useState, type KeyboardEvent } from "react";
import { useNavigate } from "react-router-dom";
import { CATS, type Cat } from "./lib/catalog";
import { useMany } from "./lib/data";
import { useCatalogs } from "./lib/useCatalog";
import { parseRelics } from "./lib/drops";
import { PAGES, search, type Ent, type Hit } from "./lib/search";
import { buildDocs, goalTarget } from "./lib/searchDocs";
import { buildIndex, searchIndex } from "./lib/smartSearch";
import { methodsForQuery, understand } from "./lib/understand";
import { ENEMY_ALT, ENEMY_SRC, ENEMY_URL, parseEnemies } from "./lib/enemies";
import { FILES, parseThings, resAlt, resUrl, RES_SRC } from "./lib/resources";
import { ChangedAnswer, GoalAnswer, ItemAnswer, MethodAnswer, NowAnswer, WhatAnswer } from "./SearchAnswers";
import { METHODS } from "./data/methods";
import { methodDocs } from "./lib/methods";
import { sameName } from "./lib/refs";
const ITEM_KINDS = new Set(["Part", "Item", "Resource", "Vendor"]);
const kindOf = (c: Cat, cg: string) => (c === "warframe" || c === "companion" || c === "archwing" ? c : c === "weapon" && ["primary", "secondary", "melee"].includes(cg.toLowerCase()) ? cg.toLowerCase() : undefined);
export default function Palette({ onClose }: { onClose: () => void }) {
  const [{ rec }] = useMany([{ id: "relics", file: "relics.json" }]);
  const [q, setQ] = useState(""), [sel, setSel] = useState(0), nav = useNavigate();
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
  const u = useMemo(() => understand(q), [q]), intent = u.intent, sub = intent && "subject" in intent ? intent.subject : "";
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
  const go = (h?: Hit) => { if (h) { nav(h.to); onClose(); } };
  const key = (e: KeyboardEvent) => {
    if (e.key === "Escape") onClose();
    else if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setSel((sel + (e.key === "ArrowDown" ? 1 : -1) + hits.length) % Math.max(hits.length, 1)); }
    else if (e.key === "Enter") go(hits[sel]);
  };
  return (<div className="ov" onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
    <div className="pal" role="dialog" aria-modal="true" aria-label="Search">
      <input autoFocus aria-label="Search" placeholder="Search anything, or ask: what should I farm now, where do I get X" value={q} onChange={e => { setQ(e.target.value); setSel(0); }} onKeyDown={key} />
      <div className="answers">{intent?.kind === "now" && <NowAnswer go={onClose} />}{intent?.kind === "changed" && <ChangedAnswer go={onClose} />}{methods && <MethodAnswer key={methods.map(m => m.id).join()} methods={methods} subject={intent?.kind === "method" ? u.material ?? intent.subject : ""} go={onClose} />}{whatName && <WhatAnswer key={"w" + whatName} name={whatName} info={info} go={onClose} />}{itemName && <ItemAnswer key={itemName} name={itemName} go={onClose} info={info} />}{target && top && <GoalAnswer key={top.doc.to} cat={target.cat} slug={target.slug} name={top.doc.title} go={onClose} />}</div>
      <div role="listbox">{hits.map((h, i) => <div key={h.cat + h.label + i} role="option" aria-selected={i === sel} onClick={() => go(h)}><span>{h.label}</span><span className="tag">{h.cat}</span></div>)}
        {!hits.length && <div className="muted pad">{q ? "No results. Try fewer or shorter words." : "Type to search"}</div>}</div></div></div>);
}
