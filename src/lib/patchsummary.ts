import type { Patch } from "./patchlogs";
// Turns long patch notes into a short list of balance changes: who changed, which stat, from what to what, and whether it is a buff or a nerf.
// It only reads what the notes say. A line without a recognizable stat and direction is not shown as a change.
export type Good = "buff" | "nerf" | "change";
export interface Change { subject: string; stat: string; from: number | null; to: number | null; unit: string; good: Good; text: string }
export interface Summary { changes: Change[]; additions: string[]; fixes: number; /** Bug fixes that correct a number (damage, armor, cooldown...) of a warframe, weapon, enemy or ability. */ statFixes: Change[] }
interface StatDef { re: RegExp; label: string; lowerBetter?: boolean }
// Order matters: the first match names the stat.
const STATS: StatDef[] = [
  { re: /critical chance|crit(?:ical)? chance/i, label: "Crit chance" }, { re: /critical (?:damage|multiplier)|crit(?:ical)? (?:damage|multiplier)/i, label: "Crit damage" },
  { re: /status chance|proc chance/i, label: "Status chance" }, { re: /fire rate|attack speed|attack rate/i, label: "Fire rate" },
  { re: /reload/i, label: "Reload time", lowerBetter: true }, { re: /magazine|mag size|clip size/i, label: "Magazine" },
  { re: /ability efficiency|efficiency/i, label: "Efficiency" }, { re: /ability strength|strength/i, label: "Strength" }, { re: /ability duration|duration/i, label: "Duration" },
  { re: /ability range|\brange\b|radius/i, label: "Range" }, { re: /energy cost|ability cost|\bcost\b|\bdrain\b/i, label: "Cost", lowerBetter: true },
  { re: /cooldown/i, label: "Cooldown", lowerBetter: true }, { re: /recoil|spread/i, label: "Recoil/spread", lowerBetter: true },
  { re: /armor/i, label: "Armor" }, { re: /shield/i, label: "Shields" }, { re: /health/i, label: "Health" }, { re: /energy/i, label: "Energy" },
  { re: /multishot/i, label: "Multishot" }, { re: /ammo/i, label: "Ammo" }, { re: /sprint|movement speed|\bspeed\b/i, label: "Speed" },
  { re: /drop (?:chance|rate)/i, label: "Drop chance" }, { re: /damage/i, label: "Damage" },
];
const UP = /\b(increased?|raised?|buffed|improved|doubled|tripled|boosted|extended|higher|greater|more)\b/i, DOWN = /\b(reduced?|decreased?|lowered?|nerfed|halved|shortened|cut|lower|less)\b/i;
const FROMTO = /(?:from\s+)?(-?\d[\d.,]*)\s*(%|x|m|s)?\s*(?:to|→|->|=>)\s*(-?\d[\d.,]*)\s*(%|x|m|s)?/i;
const num = (t: string) => { const v = parseFloat(t.replace(/,/g, "")); return Number.isFinite(v) ? v : null; };
const strip = (l: string) => l.replace(/^\s*(?:[-*•·]+|\d+[.)])\s+/, "").replace(/^#+\s*/, "").replace(/\*\*|__|`/g, "").replace(/\s+/g, " ").trim();
const short = (t: string, n = 170) => (t.length > n ? t.slice(0, n - 1).trimEnd() + "…" : t);
/** A heading: marked as one, bold on its own, or a short line without a bullet or full stop. */
const isHeading = (raw: string) => { const t = strip(raw); return !!t && (/^\s*#+\s/.test(raw) || /^\s*\*\*[^*]+\*\*:?\s*$/.test(raw) || (!/^\s*(?:[-*•·]|\d+[.)])\s/.test(raw) && t.length <= 48 && !/[.!?]$/.test(t))); };
function subjectOf(line: string, section: string): string {
  const m = line.match(/^([A-Z][^:]{1,40}):\s+\S/); if (m && !/^(?:note|warning|fixed)$/i.test(m[1])) return m[1].trim();
  return section || "General";
}
/** Reads one line. Returns null when it is not a stat change. */
export function readChange(line: string, section = ""): Change | null {
  const text = strip(line); if (text.length < 8 || /^(?:fixed|fixes)\b/i.test(text)) return null;
  const stat = STATS.find(s => s.re.test(text)); if (!stat) return null;
  const ft = text.match(FROMTO); let from = ft ? num(ft[1]) : null, to = ft ? num(ft[3]) : null; const unit = ft ? (ft[4] ?? ft[2] ?? "") : "";
  const by = text.match(/\bby\s+(\d+(?:\.\d+)?)\s*%/i);
  let dir: "up" | "down" | null = from != null && to != null && from !== to ? (to > from ? "up" : "down") : null;
  if (!dir) { const u = UP.test(text), d = DOWN.test(text); if (u && !d) dir = "up"; else if (d && !u) dir = "down"; else if (u && d) dir = UP.exec(text)!.index < DOWN.exec(text)!.index ? "up" : "down"; }
  if (!dir || (from == null && !by && !UP.test(text) && !DOWN.test(text))) return null;
  const good: Good = dir === "up" ? (stat.lowerBetter ? "nerf" : "buff") : stat.lowerBetter ? "buff" : "nerf";
  return { subject: subjectOf(text, section), stat: stat.label, from, to, unit: unit === "x" || unit === "%" || unit === "m" || unit === "s" ? unit : "", good, text: short(text) };
}
const VERB = /\b(now|no longer|removed|reworked|changed|adjusted|improved|extended|shortened|doubled|halved|swapped|replaced|instead|can now|will now|moved|reduced|decreased|increased|lowered|raised|added)\b/i;
/** Looser reading for lines that change something without naming a known stat ("Narin's ability now also slows enemies"). Direction comes from the wording; unclear direction stays a plain change. */
export function readLoose(line: string, section = ""): Change | null {
  const text = strip(line); if (text.length < 20 || /^(?:fixed|fixes)\b/i.test(text) || /^\*/.test(line.trim()) || !VERB.test(text)) return null;
  const ft = text.match(FROMTO), from = ft ? num(ft[1]) : null, to = ft ? num(ft[3]) : null, u = UP.test(text), d = DOWN.test(text);
  const dir = from != null && to != null && from !== to ? (to > from ? "up" : "down") : u && !d ? "up" : d && !u ? "down" : null;
  return { subject: subjectOf(text, section), stat: "", from, to, unit: ft ? (ft[4] ?? ft[2] ?? "") : "", good: dir === "up" ? "buff" : dir === "down" ? "nerf" : "change", text: short(text, 220) };
}
const NOISE = /\b(crash(?:es|ing)?|typo|visual|vfx|animations?|sounds?|audio|ui|text|tooltips?|localiz\w*|cosmetic|appearance|clipping|textures?|lighting|hangs?|softlock|host migration|stuck|camera|subtitle|tints?|colou?rs?|capitali[sz]ation|menus?|ephemera|irises|iris|settings?|controllers?|progress(?:ing)?|invulnerable|pop ?ups?|icons?|offset|(?:chest|leg|arm|shoulder) armors?|helmets?|syandanas?)\b/i;
const WRONG = /\b(instead of|rather than|not (?:being )?(?:applied|working|scaling|scaled|affect\w*|counting)|incorrect(?:ly)?|wrongly|too (?:high|low|much|little)|(?:higher|lower|more|less) than (?:intended|expected|listed|stated)|(?:now )?(?:correctly|properly)|ignor(?:ed|ing)|doubled?|applied twice)\b/i;
/** Who a fix is about: the first possessive name in the line (\"Rhino's Iron Skin...\" -> Rhino). Section headings in fix lists are unreliable, so they are not used. */
const fixSubject = (t: string) => { const b = t.replace(/^fix(?:ed|es)\s+/i, ""), c = b.match(/^([A-Z][^:]{1,30}):\s/); if (c) return c[1]; const m = b.match(/([A-Z][\w\-.]*(?:\s+[A-Z0-9][\w\-.]*){0,3})['’]s\b/); return m ? m[1] : "General"; };
/** A bug fix that corrects a stat. It needs a known stat and either a number or wording that says the value was wrong; crashes, visuals and UI fixes are left out. */
export function readFix(line: string): Change | null {
  const text = strip(line); if (text.length < 15 || !/^fix(?:ed|es)\b/i.test(text) || NOISE.test(text)) return null;
  const stat = STATS.find(x => x.re.test(text)); if (!stat) return null;
  const ft = text.match(FROMTO), hasNum = /\d/.test(text); if (!hasNum && !WRONG.test(text)) return null;
  return { subject: fixSubject(text), stat: stat.label, from: ft ? num(ft[1]) : null, to: ft ? num(ft[3]) : null, unit: ft ? (ft[4] ?? ft[2] ?? "") : "", good: "change", text: short(text, 220) };
}
export function summarize(p: Patch): Summary {
  const changes: Change[] = []; let section = "";
  for (const raw of (p.changes + "\n" + p.additions).split(/\r?\n/)) {
    if (!raw.trim()) continue;
    if (isHeading(raw)) { section = strip(raw).replace(/:$/, ""); continue; }
    const c = readChange(raw, section) ?? readLoose(raw, section); if (c) changes.push(c);
  }
  const additions: string[] = []; let head = "";
  for (const raw of p.additions.split(/\r?\n/)) { if (!raw.trim()) continue; if (isHeading(raw)) { head = strip(raw).replace(/:$/, ""); continue; }
    const t = strip(raw); if (t.length > 12 && additions.length < 10 && !readChange(raw)) additions.push(short(head ? `${head}: ${t}` : t, 130)); }
  const fixes = p.fixes.split(/\r?\n/).filter(l => /^\s*(?:[-*•·]+|\d+[.)])\s+\S/.test(l)).length || (p.fixes.trim() ? 1 : 0);
  const statFixes: Change[] = [];
  for (const raw of p.fixes.split(/\r?\n/)) { if (!raw.trim() || isHeading(raw)) continue; const c = readFix(raw); if (c) statFixes.push(c); }
  return { changes: dedupe(changes).slice(0, 120), additions, fixes, statFixes: dedupe(statFixes).slice(0, 60) };
}
const dedupe = (cs: Change[]) => { const seen = new Set<string>(); return cs.filter(c => { const k = c.text.toLowerCase(); if (seen.has(k)) return false; seen.add(k); return true; }); };
/** Counts of buffs and nerfs, for the one-line headline of an entry. */
export const tally = (cs: Change[]) => ({ buff: cs.filter(c => c.good === "buff").length, nerf: cs.filter(c => c.good === "nerf").length, change: cs.filter(c => c.good === "change").length });
/** True when the change names something the player has (build, goal, mod, tracked item). Names shorter than 4 letters are ignored to avoid false matches. */
export const touches = (c: Change, mine: Set<string>) => { const t = `${c.subject} ${c.text}`.toLowerCase(); for (const n of mine) if (n.length >= 4 && t.includes(n)) return n; return null; };
