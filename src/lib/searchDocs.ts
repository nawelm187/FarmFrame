import type { Relic } from "./drops";
import { normalize, type Doc } from "./smartSearch";
import { SYNDICATE_WIKI, NIGHTWAVE_SERIES } from "../data/syndicateWiki";
import { PALLADINO, ARB_ROTATIONS } from "../data/vendors";
import { SUBSUMABLE } from "../data/helminth";
import { LAUNCHERS } from "../data/guides";
import { ref, refOf, thingRoute } from "./refs";
const enc = encodeURIComponent;
/** Extra words for each page, so "baro", "circuit" or "mastery points" find the right page without the page name containing them. */
export const PAGE_WORDS: Record<string, string> = {
  "/fissures": "void fissure relic missions tier lith meso neo axi requiem steel path open relics", "/invasions": "invasion reward counter faction grineer corpus infested", "/rotations": "baro ki teer void trader varzia vendor circuit duviri steel path teshin arbitration weekly reset descendia",
  "/relics": "relic reward drop chance refinement radiant exceptional flawless intact vaulted", "/mastery": "mastery rank mr points checklist legendary rank up", "/finder": "drops where to get farm source resource", "/farm-plan": "farm plan what is missing parts goals", "/methods": "farming methods fastest way credits aya endo kuva efficient grind boost booster", "/roadmap": "roadmap goals requirements shared resources",
  "/planner": "nightwave daily weekly alerts cycles day night cetus orb vallis cambion", "/builds": "build mods forma arcane polarity", "/tracking": "tracked items counts", "/patches": "patch notes update hotfix changes changelog", "/sources": "data sources status health api",
  "/syndicates": "standing reputation rank offers faction relays", "/helminth": "subsume infuse feed secretion invigoration", "/kdrives": "k drive hoverboard vent kids", "/guides": "starter guides launcher necramech archwing", "/enemies": "enemy loot drops faction health armor", "/resources": "resources items materials where to farm",
};
export interface EntIn { name: string; cat: string; slug: string; label: string; description?: string; parts?: string[] }
export interface ThingIn { name: string; type: string; description: string; drops: { location: string }[] }
export interface EnemyIn { name: string; faction: string; description: string }
export interface DocInput { pages: [string, string][]; ents: EntIn[]; relics: Relic[] | null; resources?: ThingIn[] | null; items?: ThingIn[] | null; enemies?: EnemyIn[] | null }
const trim = (s: string | undefined, n: number) => (s ?? "").slice(0, n);
export function buildDocs(i: DocInput): Doc[] {
  const out: Doc[] = [], seen = new Map<string, Doc>();
  /** Same name from two places (a part and a relic reward): one entry, with both kinds of words. */
  const push = (d: Doc) => { d.id ??= refOf(d.to) ?? undefined; const k = normalize(d.title); const old = seen.get(k + "|" + d.kind); if (old) { old.body = trim((old.body ?? "") + " " + (d.body ?? ""), 900); return; } seen.set(k + "|" + d.kind, d); out.push(d); };
  for (const [to, name] of i.pages) push({ title: name, kind: "Page", to, alias: PAGE_WORDS[to.split("?")[0]] ?? "", boost: -0.1 });
  for (const e of i.ents) {
    push({ title: e.name, kind: e.label, to: `/${e.cat}/${e.slug}`, body: trim(e.description, 400), boost: 0.2 });
    for (const p of e.parts ?? []) { const t = p.toLowerCase() === "blueprint" ? `${e.name} Blueprint` : `${e.name} ${p}`; push({ title: t, kind: "Part", to: thingRoute(t), alias: "blueprint part component", body: `part of ${e.name}` }); }
  }
  if (i.relics) {
    const by = new Map<string, string[]>();
    for (const r of i.relics) { push({ title: r.name, kind: "Relic", to: `/relics?q=${enc(r.name)}`, alias: `${r.tier} relic`, body: (r.st.Intact ?? []).map(x => x.itemName).join(" ") });
      for (const x of r.st.Intact ?? []) { const a = by.get(x.itemName) ?? []; if (a.length < 6) a.push(r.name); by.set(x.itemName, a); } }
    for (const [name, rl] of by) push({ title: name, kind: "Item", to: thingRoute(name), alias: "relic reward", body: `dropped by relics ${rl.join(" ")}` });
  }
  for (const t of i.resources ?? []) push({ title: t.name, kind: "Resource", to: `/resources?q=${enc(t.name)}`, alias: t.type, body: trim(`${t.description} ${t.drops.slice(0, 25).map(d => d.location).join(" ")}`, 700) });
  for (const t of i.items ?? []) push({ title: t.name, kind: "Item", to: `/resources?t=items&q=${enc(t.name)}`, alias: t.type, body: trim(`${t.description} ${t.drops.slice(0, 25).map(d => d.location).join(" ")}`, 700) });
  for (const e of i.enemies ?? []) push({ title: e.name, kind: "Enemy", to: `/enemies?q=${enc(e.name)}`, alias: e.faction, body: trim(e.description, 300) });
  for (const w of Object.values(SYNDICATE_WIKI)) for (const o of w.offers) push({ title: o.item, kind: "Vendor", to: `/farm/${enc(o.item)}`, alias: `${w.name} syndicate`, body: `sold by ${w.name} for ${o.cost} ${o.currency ?? "standing"}${o.rank != null ? ` at rank ${o.rank}` : ""}` });
  for (const w of PALLADINO) push({ title: w.name, kind: "Vendor", to: `/farm/${enc(w.name)}`, alias: "Palladino", body: `sold by Palladino for ${w.cost} ${w.currency}` });
  for (const [rot, rs] of Object.entries(ARB_ROTATIONS)) for (const r of rs) push({ title: r.name, kind: "Arbitrations", to: "/guides?s=arbitrations", alias: "arbitration reward", body: `arbitrations rotation ${rot}` });
  for (const [frame, ability, tags] of SUBSUMABLE) push({ title: `${ability} (${frame})`, kind: "Helminth", to: "/helminth", alias: `${frame} subsume ability`, body: String(tags) });
  for (const l of LAUNCHERS) push({ title: l.title, kind: "Guide", to: `/guides?s=${enc(l.id)}`, alias: "guide how to", body: trim(`${l.summary} ${l.steps.join(" ")}`, 700) });
  for (const r of NIGHTWAVE_SERIES.rewards) push({ title: r.reward, kind: "Nightwave", to: "/planner", alias: "nightwave reward", body: `${NIGHTWAVE_SERIES.name} rank ${r.rank} standing ${r.standing}` });
  return out;
}
/** A Warframe or weapon result that can become a goal: its category and slug, read from the page address. Companions, Archwings and mods have no parts to plan. */
export function goalTarget(to: string): { cat: "warframe" | "weapon"; slug: string } | null {
  const m = /^\/(warframe|weapon)\/([^/?#]+)$/.exec(to); return m ? { cat: m[1] as "warframe" | "weapon", slug: decodeURIComponent(m[2]) } : null;
}
