import { clean } from "./text";
import type { Entity } from "./catalog";
/** Cost of a mod at a rank, the way the card shows it: auras give capacity ("+n"), everything else drains. */
export const costAt = (e: Entity, rank: number): string | null => (e.baseDrain == null ? null : e.baseDrain < 0 ? `+${Math.abs(e.baseDrain) + rank}` : String(e.baseDrain + rank));
export const effectsAtMax = (e: Entity): string[] => { const ls = e.levelStats?.length ? e.levelStats[e.levelStats.length - 1] : e.description ? [e.description] : []; return ls.flatMap(t => clean(t).split("\n")).map(t => t.trim()).filter(Boolean); };
