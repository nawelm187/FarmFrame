import type { Cat, Component, Entity } from "./catalog";
import type { RelicOpt } from "./exact";
export interface PartRef { entity: Entity; cat: Cat; comp: Component; blueprint: boolean; /** Name as the game writes it, e.g. "Ash Prime Neuroptics Blueprint". */ title: string }
const norm = (t: string) => t.toLowerCase().replace(/\s+/g, " ").trim();
/** Turns a typed item name ("Ash Prime Neuroptics Blueprint", "Ash Prime Systems", "Ash Prime Blueprint") into its parent item and component.
 *  The longest item name that starts the text wins. Returns null when no item has such a component, so nothing is guessed. */
export function resolvePart(text: string, ents: { e: Entity; cat: Cat }[]): PartRef | null {
  const n = norm(text); let best: { e: Entity; cat: Cat } | null = null;
  for (const x of ents) { const en = norm(x.e.name); if (x.e.components.length && (n === en || n.startsWith(en + " ")) && (!best || en.length > best.e.name.length)) best = x; }
  if (!best) return null;
  let rest = n.slice(best.e.name.length).trim(); if (!rest) return null;
  const blueprint = /(^|\s)blueprint$/.test(rest); rest = rest.replace(/\s*blueprint$/, "").trim() || "blueprint";
  const comp = best.e.components.find(c => norm(c.name) === rest) ?? (rest === "blueprint" ? best.e.components.find(c => norm(c.name) === "blueprint") : undefined);
  if (!comp) return null;
  const isMain = norm(comp.name) === "blueprint";
  return { entity: best.e, cat: best.cat, comp, blueprint: blueprint || isMain, title: isMain ? `${best.e.name} Blueprint` : `${best.e.name} ${comp.name}${blueprint ? " Blueprint" : ""}` };
}
export interface Difficulty { level: "Easy" | "Medium" | "Hard" | "Very hard" | "Unknown"; why: string }
const LV: Record<string, Difficulty["level"]> = { Common: "Easy", Uncommon: "Medium", Rare: "Hard" };
/** A calculated estimate from drop rarity and vault status. It is not an official rating. */
export function difficulty(opts: RelicOpt[], otherSources: number): Difficulty {
  if (opts.length) {
    const live = opts.filter(o => o.vaulted !== true);
    if (!live.length) return { level: "Very hard", why: "Every relic that holds it is vaulted, so it no longer drops. It comes from trading with players or from Varzia." };
    const order = ["Common", "Uncommon", "Rare"], best = order.find(r => live.some(o => o.rarity === r));
    if (best) return { level: LV[best], why: `Its best case is a ${best} reward in ${live.filter(o => o.rarity === best).length} relic${live.filter(o => o.rarity === best).length === 1 ? "" : "s"} you can still get.` };
  }
  if (otherSources > 0) return { level: "Medium", why: "It comes from non-relic sources listed below; difficulty depends on that activity." };
  return { level: "Unknown", why: "The loaded data does not say where it comes from." };
}
