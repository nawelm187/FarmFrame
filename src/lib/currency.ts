type Art = { platinum?: string; credits?: string };
const cache = new WeakMap<object, Art | null>();
/** imageName of the platinum and credits items, read from the same warframe-items data. Nothing is guessed. */
export function parseCurrency(d: unknown): Art | null {
  if (!Array.isArray(d)) return null;
  const c = cache.get(d); if (c !== undefined) return c;
  const out: Art = {};
  for (const x of d) {
    if (!x || typeof x !== "object") continue;
    const o = x as Record<string, unknown>;
    if (typeof o.name !== "string" || typeof o.imageName !== "string" || !o.imageName) continue;
    const n = o.name.toLowerCase();
    if (n === "platinum" && !out.platinum) out.platinum = o.imageName; else if (n === "credits" && !out.credits) out.credits = o.imageName;
  }
  const r = out.platinum || out.credits ? out : null; cache.set(d, r); return r;
}
