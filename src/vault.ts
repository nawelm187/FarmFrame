// api.warframestat.us has no /relics endpoint (404), so read the warframe-items file directly, with a CDN mirror as fallback.
export const VAULT_URL = "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/json/Relics.json";
export const VAULT_ALT = "https://cdn.jsdelivr.net/gh/WFCD/warframe-items@master/data/json/Relics.json";
export const VAULT_SRC = "WFCD warframe-items on GitHub (community, unofficial)";
const cache = new WeakMap<object, Map<string, boolean> | null>();
/** relic key ("Axi A1") -> vaulted. Only entries with an explicit boolean are kept; anything else stays unknown. */
export function parseVault(d: unknown): Map<string, boolean> | null {
  if (!Array.isArray(d)) return null;
  if (cache.has(d)) return cache.get(d)!;
  const m = new Map<string, boolean>();
  for (const x of d) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.name !== "string" || typeof o.vaulted !== "boolean") continue;
    m.set(o.name.replace(/\s+(Intact|Exceptional|Flawless|Radiant)$/i, "").trim(), o.vaulted);
  }
  const r = m.size ? m : null; cache.set(d, r); return r;
}
type Art = { byRelic: Map<string, string>; byTier: Map<string, string> };
const imgCache = new WeakMap<object, Art | null>();
const STATE = /\s+(Intact|Exceptional|Flawless|Radiant)$/i;
/** imageName per relic (prefers the Intact entry) and one per tier, read from the same warframe-items file. Nothing is guessed. */
export function parseRelicImages(d: unknown): Art | null {
  if (!Array.isArray(d)) return null;
  const c = imgCache.get(d); if (c !== undefined) return c;
  const byRelic = new Map<string, string>(), byTier = new Map<string, string>();
  for (const x of d) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.name !== "string" || typeof o.imageName !== "string" || !o.imageName) continue;
    const intact = /\sIntact$/i.test(o.name), key = o.name.replace(STATE, "").trim(), tier = key.split(/\s+/)[0];
    if (intact || !byRelic.has(key)) byRelic.set(key, o.imageName);
    if (tier && (intact || !byTier.has(tier))) byTier.set(tier, o.imageName);
  }
  const r = byRelic.size ? { byRelic, byTier } : null; imgCache.set(d, r); return r;
}
