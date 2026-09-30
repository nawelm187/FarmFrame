import type { Relic } from "./drops";
export interface Hit { label: string; cat: string; to: string; s: number }
export const PAGES: [string, string][] = [["/roadmap", "Roadmap"], ["/warframes", "Warframes"], ["/weapons", "Weapons"], ["/mods", "Mods"], ["/fissures", "Fissures"], ["/invasions", "Invasions"], ["/relics", "Relics"], ["/finder", "Resource Finder"], ["/tracking", "Tracking"], ["/sources", "Data Sources"]];
export function lev(a: string, b: string) {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i]); for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
const q2 = (p: string, q: string) => `${p}?q=${encodeURIComponent(q)}`;
export function search(q: string, relics: Relic[] | null): Hit[] {
  const l = q.trim().toLowerCase(); if (!l) return []; const o: Hit[] = [];
  const m = l.match(/^(?:where(?: do i| can i)? (?:farm|get|find)|how(?: do i)? (?:farm|get)|farm)\s+(.+?)\??$/);
  if (m) o.push({ label: `Where to farm "${m[1]}"`, cat: "Intent", to: q2("/finder", m[1]), s: -1 });
  for (const [to, n] of PAGES) { const x = n.toLowerCase(); const s = x.startsWith(l) ? 0 : x.includes(l) ? 1 : l.length > 3 && lev(l, x) <= 2 ? 2 : 9; if (s < 9) o.push({ label: n, cat: "Page", to, s }); }
  if (relics) {
    relics.filter(r => r.name.toLowerCase().includes(l)).slice(0, 4).forEach(r => o.push({ label: r.name, cat: "Relic", to: q2("/relics", r.name), s: 1 }));
    const seen = new Set<string>();
    for (const r of relics) { for (const x of r.st.Intact ?? []) if (!seen.has(x.itemName) && x.itemName.toLowerCase().includes(l)) { seen.add(x.itemName); o.push({ label: x.itemName, cat: "Item", to: q2("/finder", x.itemName), s: 1 }); } if (seen.size >= 5) break; }
  }
  return o.sort((a, b) => a.s - b.s).slice(0, 9);
}
