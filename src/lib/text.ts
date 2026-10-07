/** The source writes game text with the game's own markup: icon tags like <DT_SLASH_COLOR>, <br>, and unfilled values like |DAMAGE|. */
const TAG = /<\/?[A-Za-z_0-9]+\/?>/g, BR = /<br\s*\/?>/gi, SLOT = /\|[A-Za-z_0-9]+\|/g;
/** Removes the markup tags and keeps the words that follow them. Placeholders are left for the renderer. */
export const clean = (s: string) => s.replace(/\\n/g, "\n").replace(BR, "\n").replace(TAG, "").replace(/[ \t]{2,}/g, " ").trim();
/** Splits text around unfilled |VALUE| placeholders so they can be shown as "unknown" instead of invented. */
export const pieces = (s: string): { t: string; unknown: boolean }[] => {
  const out: { t: string; unknown: boolean }[] = []; let at = 0;
  for (const m of s.matchAll(SLOT)) { if (m.index > at) out.push({ t: s.slice(at, m.index), unknown: false }); out.push({ t: m[0], unknown: true }); at = m.index + m[0].length; }
  if (at < s.length) out.push({ t: s.slice(at), unknown: false });
  return out;
};
export type Tok = { k: "t"; v: string } | { k: "dmg"; v: string } | { k: "unk"; v: string };
const ALIAS: Record<string, string> = { freeze: "cold", fire: "heat", poison: "toxin", explosion: "blast", virus: "viral", electric: "electricity" };
const RICH = /<(\/?)DT_([A-Za-z0-9]+?)(?:_COLOR)?\s*\/?>|\|[A-Za-z_0-9]+\||<br\s*\/?>|<\/?[A-Za-z_0-9]+\/?>/g;
/** Game text as tokens: plain text, damage-type markers (to show as icons) and values the source left blank. */
export function rich(raw: string): Tok[] {
  const s = raw.replace(/\\n/g, "\n");
  const out: Tok[] = []; let at = 0;
  const push = (v: string) => { const t = v.replace(/[ \t]{2,}/g, " "); if (t) out.push({ k: "t", v: t }); };
  for (const m of s.matchAll(RICH)) {
    push(s.slice(at, m.index)); at = m.index + m[0].length;
    if (m[2] !== undefined) { if (m[1] === "") { const n = m[2].toLowerCase(); out.push({ k: "dmg", v: ALIAS[n] ?? n }); } }
    else if (m[0].startsWith("|")) out.push({ k: "unk", v: m[0] });
    else if (/^<br/i.test(m[0])) push("\n");
  }
  push(s.slice(at)); return out;
}

/** "a Lith", "a Meso", "a Neo", "an Axi": the right article for a relic tier. */
export const aTier = (t: string) => (/^[aeiou]/i.test(t) ? "an " : "a ") + t;
