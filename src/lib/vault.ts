export const VAULT_URL = "https://api.warframestat.us/relics?language=en";
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
