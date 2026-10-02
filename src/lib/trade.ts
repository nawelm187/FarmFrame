import type { Component, Entity } from "./catalog";
/** Prime parts can be traded between players by game rule even when the data does not flag them. Anything else follows the data (null = unknown). */
export const partTradable = (e: Entity, c: Component): boolean | null => c.tradable ?? (e.isPrime && c.ducats != null ? true : null);
/** Trading facts as the data and the Prime rule state them. */
export function tradeLine(e: Entity): { label: string; tone: "yes" | "no" | "mixed" } | null {
  if (e.tradable === true) return { label: "Tradable between players", tone: "yes" };
  const parts = e.components.filter(c => partTradable(e, c) === true).map(c => c.name);
  if (parts.length) return { label: `${e.isPrime ? "The finished item cannot be traded, but its Prime parts can" : "The item itself cannot be traded, but these parts can"}: ${parts.join(", ")}`, tone: "mixed" };
  if (e.tradable === false) return { label: "Cannot be traded between players", tone: "no" };
  return null;
}
/** A Prime set has a player price unless every part is known to be untradable. */
export const setTradable = (e: Entity) => e.isPrime && e.components.some(c => partTradable(e, c) !== false);
