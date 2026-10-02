import type { Relic } from "./drops";
export interface Hit { label: string; cat: string; to: string; s: number }
export const PAGES: [string, string][] = [["/profile", "Account"], ["/roadmap", "Roadmap"], ["/planner", "Planner"], ["/rotations", "Rotations"], ["/farm-plan", "Farm Plan"], ["/builds", "Builds"], ["/warframes", "Warframes"], ["/weapons", "Weapons"], ["/mods", "Mods"], ["/lore", "Lore"], ["/companions", "Companions"], ["/archwings", "Archwings"], ["/railjack", "Railjack"], ["/fissures", "Fissures"], ["/invasions", "Invasions"], ["/relics", "Relics"], ["/finder", "Resource Finder"], ["/tracking", "Tracking"], ["/sources", "Data Sources"]];
export function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const q2 = (p: string, q: string) => `${p}?q=${encodeURIComponent(q)}`;
export interface Ent { name: string; cat: string; slug: string; label: string; kind?: string }
const FARM = /^(?:where(?: do i| can i| to)? (?:farm|get|find)|how(?: do i| can i| to)? (?:farm|get|obtain|find)|farm)\s+(.+?)\s*\??$/;
const RELIC = /^(?:what|which) relics?(?: (?:do|does))? (?:contains?|has|have|drops?|holds?|gives?|includes?)\s+(.+?)\s*\??$|^relics? (?:for|with|containing)\s+(.+?)\s*\??$/;
const NEED = /^what (?:do|will|would|should) i need (?:for|to (?:build|make|craft|get))\s+(.+?)\s*\??$|^what(?:'s| is) (?:needed|required) (?:for|to (?:build|make|craft))\s+(.+?)\s*\??$|^(?:requirements?|parts?) (?:for|of)\s+(.+?)\s*\??$|^what do i need\s+(.+?)\s*\??$/;
const BUILD = /^(?:build(?: for)?|(?:create|make|new) (?:a )?build(?: for)?)\s+(.+?)\s*\??$/;
const cap = (m: RegExpMatchArray | null) => m?.slice(1).find(x => !!x);
/** Best entity for a name typed in an intent: exact, then prefix, then contains; shorter names win ties. */
const pick = (ents: Ent[] | undefined, x: string, ok: (e: Ent) => boolean = () => true) => {
  const l = x.toLowerCase(); let best: Ent | undefined, bs = 9;
  for (const e of ents ?? []) { if (!ok(e)) continue; const n = e.name.toLowerCase(), sc = n === l ? 0 : n.startsWith(l) ? 1 : n.includes(l) ? 2 : 9; if (sc < bs || (sc === bs && best && e.name.length < best.name.length)) { best = e; bs = sc; } }
  return bs < 9 ? best : undefined;
};
const enc = encodeURIComponent;
/** Understands intents ("where do I farm X", "what relic contains X", "what do I need for X", "build X") before falling back to name search. */
export function search(q: string, relics: Relic[] | null, ents?: Ent[]): Hit[] {
  const l = q.trim().toLowerCase(); if (!l) return []; const o: Hit[] = [];
  const f = cap(l.match(FARM)), r = cap(l.match(RELIC)), n = cap(l.match(NEED)), b = cap(l.match(BUILD));
  if (f) { o.push({ label: `Where to farm "${f}"`, cat: "Intent", to: `/farm/${enc(f)}`, s: -2 }); o.push({ label: `Search drop tables for "${f}"`, cat: "Intent", to: q2("/finder", f), s: -1 }); }
  if (r) o.push({ label: `Relics that contain "${r}"`, cat: "Intent", to: q2("/relics", r), s: -2 });
  if (n) { const e = pick(ents, n, x => x.cat !== "mod") ?? pick(ents, n);
    o.push(e ? { label: `What you need for ${e.name}`, cat: "Intent", to: `/${e.cat}/${e.slug}`, s: -2 } : { label: `Parts and relics for "${n}"`, cat: "Intent", to: q2("/relics", n), s: -2 }); }
  if (b) { const e = pick(ents, b, x => !!x.kind);
    o.push(e ? { label: `Build ${e.name}`, cat: "Intent", to: `/builds?new=${e.kind}:${e.slug}&n=${enc(e.name)}`, s: -2 } : { label: `Create a build for "${b}"`, cat: "Intent", to: "/builds", s: -2 }); }
  for (const [to, nm] of PAGES) { const x = nm.toLowerCase(); const s = x.startsWith(l) ? 0 : x.includes(l) ? 1 : l.length > 3 && lev(l, x) <= 2 ? 2 : 9; if (s < 9) o.push({ label: nm, cat: "Page", to, s }); }
  if (relics) {
    relics.filter(x => x.name.toLowerCase().includes(l)).slice(0, 4).forEach(x => o.push({ label: x.name, cat: "Relic", to: q2("/relics", x.name), s: 1 }));
    const seen = new Set<string>();
    for (const x of relics) { for (const y of x.st.Intact ?? []) if (!seen.has(y.itemName) && y.itemName.toLowerCase().includes(l)) { seen.add(y.itemName); o.push({ label: y.itemName, cat: "Item", to: q2("/finder", y.itemName), s: 1 }); } if (seen.size >= 5) break; }
  }
  if (ents) {
    const hits: Hit[] = [];
    for (const e of ents) { const nm = e.name.toLowerCase(); if (nm.includes(l)) hits.push({ label: e.name, cat: e.label, to: `/${e.cat}/${e.slug}`, s: nm.startsWith(l) ? 0 : 1 }); }
    hits.sort((a, c) => a.s - c.s || a.label.length - c.label.length).slice(0, 8).forEach(h => o.push(h));
  }
  return o.sort((a, c) => a.s - c.s).slice(0, 9);
}
