type O = Record<string, unknown>;
const isO = (v: unknown): v is O => !!v && typeof v === "object" && !Array.isArray(v);
const str = (v: unknown) => (typeof v === "string" && v ? v : null);
/** "NC_SlipAndSlide" -> "Slip And Slide". The game data has no display names, so keys are only split into words, never reinterpreted. */
export const words = (k: string) => k.replace(/^NC_/, "").replace(/_/g, " ").replace(/([a-z0-9])([A-Z])/g, "$1 $2").trim();
/** Floor kinds whose meaning is certain. Anything else is shown as the game's own key, split into words. */
const KIND: Record<string, string> = {
  DT_RACE: "Time Tribulation", DT_MIMICS: "Plunder Roulette", DT_LOOT: "Plunder", DT_EXCAVATION: "Excavation", DT_PRESURE_GAUGE: "Pressure Cooker",
  DT_ALCHEMY: "Alchemy", DT_EXTERMINATE: "Extermination", DT_INFESTED_SALVAGE: "Purify", DT_BOSS: "Assassination", DT_SABOTAGE_HIVE: "Hive",
};
const REST: Record<number, string> = { 7: "Marie's Sanctuary", 14: "Lyon's Sanctuary", 21: "Roathe's Oblivion" };
export interface Floor { index: number; kind: string; penance: string | null }
export interface DescendiaView { activation: string | null; expiry: string | null; floors: Floor[] }
export function descendiaView(d: unknown): DescendiaView | null {
  if (!isO(d) || !Array.isArray(d.challenges)) return null;
  const floors = d.challenges.filter(isO).map((c, i): Floor | null => {
    const index = typeof c.index === "number" ? c.index : i + 1, tk = str(c.typeKey) ?? "", ck = str(c.challengeKey);
    const kind = tk === "DT_PROTOFRAME" ? REST[index] ?? "Sanctuary" : KIND[tk] ?? (tk ? words(tk.replace(/^DT_/, "").toLowerCase().replace(/(^|_)([a-z])/g, (_, a, b) => a + b.toUpperCase())) : "");
    if (!kind) return null;
    // "Basic ..." floors have no modifier; sanctuaries and the boss fight show their own name instead.
    const penance = ck && !/^Basic/.test(ck) && tk !== "DT_PROTOFRAME" && tk !== "DT_BOSS" ? words(ck) : null;
    return { index, kind: tk === "DT_BOSS" ? `Assassination: ${words(ck ?? "")}` : kind, penance };
  }).filter((f): f is Floor => !!f).sort((a, b) => a.index - b.index);
  return floors.length ? { activation: str(d.activation), expiry: str(d.expiry), floors } : null;
}
export type Mode = "normal" | "steel";
export interface Reward { name: string; qty?: string; pool?: string[] }
const ARC_N = ["Acceleration", "Agility", "Arachne", "Avenger", "Awakening", "Consequence", "Deflection", "Eruption", "Fury", "Healing", "Ice", "Momentum", "Nullifier", "Phantasm", "Precision", "Pulse", "Rage", "Resistance", "Strike", "Tempo", "Trickery", "Ultimatum", "Velocity", "Victory", "Warmth"].map(x => `Arcane ${x}`);
const ARC_S = ["Primary Bulwark", "Primary Debilitate", "Primary Overcharge", "Arcane Concentration", "Arcane Expertise", "Arcane Persistence", "Arcane Circumvent", "Secondary Irradiate", "Melee Careen"];
const ADAPTERS = ["Primary Arcane Adapter", "Secondary Arcane Adapter", "Melee Arcane Adapter", "Amp Arcane Adapter"];
const R = (name: string, qty?: string, pool?: string[]): Reward => ({ name, qty, pool });
/** Per-floor rewards from the Warframe wiki (reviewed 1 Oct 2026). They are not in the live data. Each can be earned once per week. */
const TABLE: Record<Mode, [number[], Reward[]][]> = {
  normal: [
    [[2, 4, 9, 11, 16, 18], [R("Credits Cache", "3x 10,000"), R("Endo", "2,500"), R("Vosfor", "50"), R("Ignia", "25"), R("Maphica", "5")]],
    [[6, 13], [R("Arcane", "1x", ARC_N)]],
    [[20], [R("Arcane", "3x", ARC_N)]],
    [[21], [R("Forma Blueprint"), ...ADAPTERS.map(a => R(a))]],
  ],
  steel: [
    [[2, 9, 16], [R("Ignia", "75"), R("Maphica", "15")]],
    [[4, 11], [R("Forma Blueprint"), R("Riven Mod", undefined, ["Melee", "Pistol", "Rifle", "Shotgun", "Zaw", "Kitgun"].map(x => `${x} Riven Mod`)), R("Arcane Adapter", undefined, ADAPTERS),
      R("3 Day Booster", undefined, ["Affinity Booster", "Resource Drop Chance Booster", "Mod Drop Chance Booster"])]],
    [[6, 13], [R("Arcane", "1x", ARC_S)]],
    [[18], [R("Steel Essence", "25")]],
    [[20], [R("Arcane", "3x", ARC_S)]],
    [[21], [R("Orokin Catalyst Blueprint"), R("Orokin Reactor Blueprint"), R("Omni Forma Blueprint"), R("Eidolon Lens Blueprint", undefined, ["Madurai", "Vazarin", "Zenurik", "Naramon", "Unairu"].map(x => `Eidolon ${x} Lens Blueprint`)),
      R("Archon Shard", undefined, ["Crimson Archon Shard", "Azure Archon Shard", "Amber Archon Shard"])]],
  ],
};
/** Infernum 21 always drops one of these as well, with no weekly limit (so Roathe can be fought again for parts). */
export const ROATHE_PARTS = "A Uriel part (Neuroptics, Chassis or Systems) or a Vinquibus blueprint or part";
/** The reward sets of a difficulty, each with the floors that share it. */
export const rewardGroups = (mode: Mode): { floors: number[]; rewards: Reward[] }[] => TABLE[mode].map(([floors, rewards]) => ({ floors, rewards })).sort((a, b) => a.floors[0] - b.floors[0]);
export const rewardsFor = (mode: Mode, floor: number): Reward[] => TABLE[mode].find(([f]) => f.includes(floor))?.[1] ?? [];
/** Rewards in a group (including every possibility of a "one of" pool) that match something the user still needs (`needed`: lowercase names). Exact name match only. */
export const usefulIn = (rewards: Reward[], needed: Set<string>): string[] => [...new Set(rewards.flatMap(r => [r.name, ...(r.pool ?? [])]).filter(n => needed.has(n.toLowerCase())))];
