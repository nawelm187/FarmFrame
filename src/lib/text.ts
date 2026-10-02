/** The source writes game text with the game's own markup: icon tags like <DT_SLASH_COLOR>, <br>, and unfilled values like |DAMAGE|. */
const TAG = /<\/?[A-Za-z_0-9]+\/?>/g, BR = /<br\s*\/?>/gi, SLOT = /\|[A-Za-z_0-9]+\|/g;
/** Removes the markup tags and keeps the words that follow them. Placeholders are left for the renderer. */
export const clean = (s: string) => s.replace(BR, "\n").replace(TAG, "").replace(/[ \t]{2,}/g, " ").trim();
/** Splits text around unfilled |VALUE| placeholders so they can be shown as "unknown" instead of invented. */
export const pieces = (s: string): { t: string; unknown: boolean }[] => {
  const out: { t: string; unknown: boolean }[] = []; let at = 0;
  for (const m of s.matchAll(SLOT)) { if (m.index > at) out.push({ t: s.slice(at, m.index), unknown: false }); out.push({ t: m[0], unknown: true }); at = m.index + m[0].length; }
  if (at < s.length) out.push({ t: s.slice(at), unknown: false });
  return out;
};
