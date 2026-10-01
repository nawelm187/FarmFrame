export interface Exp { expiry: string }
export interface Sortie extends Exp { boss?: string; faction?: string; variants?: { missionType?: string; node?: string; modifier?: string }[] }
export interface Archon extends Exp { boss?: string; missions?: { type?: string; node?: string }[] }
export interface Steel extends Exp { currentReward?: { name?: string; cost?: number } }
export interface Wave extends Exp { activeChallenges?: { title?: string; isDaily?: boolean; reputation?: number }[] }
export interface Trader extends Exp { active?: boolean; location?: string; activation?: string; inventory?: { item?: string; ducats?: number; credits?: number }[] }
export const isExp = (d: unknown): d is Exp => !!d && typeof d === "object" && typeof (d as Exp).expiry === "string";
export const expired = (d: Exp, now = Date.now()) => Date.parse(d.expiry) < now;
/** Void Trader stock that matches something the user still needs (by lowercase item name). */
export const baroMatches = (t: Trader, needed: Set<string>) => (t.active ? (t.inventory ?? []).filter(i => typeof i.item === "string" && needed.has(i.item.toLowerCase())) : []);
