import type { Entity } from "./catalog";
/** Trading facts exactly as the data states them: true, false, or null when the source says nothing. */
export function tradeLine(e: Entity): { label: string; tone: "yes" | "no" | "mixed" } | null {
  const ok = e.components.filter(c => c.tradable === true).map(c => c.name);
  if (e.tradable === true) return { label: "Tradable between players", tone: "yes" };
  if (e.tradable === false && ok.length) return { label: `The item itself cannot be traded, but these parts can: ${ok.join(", ")}`, tone: "mixed" };
  if (e.tradable === false) return { label: "Cannot be traded between players", tone: "no" };
  return ok.length ? { label: `Tradable parts: ${ok.join(", ")}`, tone: "mixed" } : null;
}
/** A Prime set only has a player price when its parts can be traded. If the source has no trade data for any part, we do not rule it out. */
export const setTradable = (e: Entity) => e.isPrime && (e.components.some(c => c.tradable === true) || (e.components.length > 0 && e.components.every(c => c.tradable == null)));
