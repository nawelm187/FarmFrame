import { KIND_LABEL, newBuild, NSLOTS, SPECIALS, type Build, type Kind, type Slot, type SpecialKey } from "./build";
/** A build as a short text code you can paste in chat. It carries what defines the build (item, mods, ranks, polarities), never what you own. */
const PREFIX = "FF1.", POLS = new Set(["madurai", "vazarin", "naramon", "zenurik", "unairu", "penjaga", "umbra", "any"]);
const b64 = (s: string) => btoa(String.fromCharCode(...new TextEncoder().encode(s))).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
const unb64 = (s: string) => new TextDecoder().decode(Uint8Array.from(atob(s.replace(/-/g, "+").replace(/_/g, "/")), c => c.charCodeAt(0)));
const slotOut = (s: Slot) => [s.mod, s.rank, s.pol ?? ""];
export function encodeBuild(b: Build): string {
  const kind = b.kind ?? "warframe";
  return PREFIX + b64(JSON.stringify({ n: b.name, k: kind, f: b.frame, r: b.reactor ? 1 : 0, s: b.slots.map(slotOut), x: Object.fromEntries(SPECIALS[kind].map(k => [k, slotOut(b.special?.[k] ?? { mod: null, rank: 0 })])) }));
}
const clean = (v: unknown): Slot | null => {
  if (!Array.isArray(v)) return null; const [mod, rank, pol] = v;
  if (mod !== null && (typeof mod !== "string" || mod.length > 80)) return null;
  if (typeof rank !== "number" || !Number.isInteger(rank) || rank < 0 || rank > 40) return null;
  const s: Slot = { mod, rank: mod ? rank : 0 }; if (typeof pol === "string" && POLS.has(pol)) s.pol = pol; return s;
};
/** Returns a new build (fresh id, nothing marked as owned) or null when the text is not a valid code. */
export function decodeBuild(code: string): Build | null {
  try {
    const c = code.trim(); if (!c.startsWith(PREFIX) || c.length > 6000) return null;
    const d = JSON.parse(unb64(c.slice(PREFIX.length))) as Record<string, unknown>;
    if (typeof d.n !== "string" || typeof d.f !== "string" || typeof d.k !== "string" || !(d.k in KIND_LABEL) || !Array.isArray(d.s) || d.s.length !== NSLOTS) return null;
    const slots = d.s.map(clean); if (slots.some(x => !x)) return null;
    const kind = d.k as Kind, special: Partial<Record<SpecialKey, Slot>> = {}, x = (d.x ?? {}) as Record<string, unknown>;
    for (const k of SPECIALS[kind]) { const sl = clean(x[k]); if (x[k] !== undefined && !sl) return null; if (sl) special[k] = sl; }
    return { ...newBuild(), name: d.n.slice(0, 60) || "Build", kind, frame: d.f.slice(0, 80), reactor: d.r !== 0, slots: slots as Slot[], special };
  } catch { return null; }
}
