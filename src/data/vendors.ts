// Written by hand from the Warframe wiki because the live APIs FarmFrame uses do not list these tables.
// Shown in the app with a "Manual source" label. They can go out of date after a game update: check the wiki page before relying on them.
export interface Src { name: string; url: string; date: string }
export const PALLADINO_SOURCE: Src = { name: "Warframe Wiki, Palladino", url: "https://wiki.warframe.com/w/Palladino", date: "2026-10-07" };
export interface Ware { name: string; cost: number; currency: string; limit: string }
/** Purchase limits reset every Monday 00:00 UTC. */
export const PALLADINO: Ware[] = [
  { name: "Credits 150,000", cost: 5, currency: "Riven Sliver", limit: "1 per week" },
  { name: "Endo 6,000", cost: 10, currency: "Riven Sliver", limit: "1 per week" },
  { name: "Kuva 35,000", cost: 10, currency: "Riven Sliver", limit: "1 per week" },
  { name: "Riven Mod (2 available)", cost: 10, currency: "Riven Sliver", limit: "1 each per week" },
  { name: "Veiled Riven Cipher", cost: 10, currency: "Riven Sliver", limit: "1 per week" },
  { name: "Requiem Ultimatum", cost: 10, currency: "Riven Sliver", limit: "1 per week" },
  { name: "Riven Transmuter", cost: 10, currency: "Riven Sliver", limit: "3 per week" },
  { name: "Requiem I, II, III and IV Relics", cost: 10, currency: "Riven Sliver", limit: "10 per week, each" },
  { name: "Rell's Donda (orbiter decoration)", cost: 25, currency: "Orokin Ducat", limit: "unlimited" },
  { name: "Rell's Emotile displays", cost: 5, currency: "Riven Sliver", limit: "unlimited, each" },
  { name: "Iron Wake Captura Scene", cost: 25, currency: "Orokin Ducat", limit: "unlimited" },
];
export const ARBITRATION_SOURCE: Src = { name: "Warframe Wiki, Arbitrations (Rewards)", url: "https://wiki.warframe.com/w/Arbitrations#Rewards", date: "2026-10-07" };
export interface ArbReward { name: string; chance: number }
/** Rotations run A, A, B, B, C, C, C and so on: the first two rewards of a run are from A, the next two from B, then C repeats. */
export const ARB_ROTATIONS: Record<"A" | "B" | "C", ArbReward[]> = {
  A: [{ name: "Endo ×900", chance: 44 }, { name: "Ayatan Ayr Sculpture", chance: 9 }, { name: "Ayatan Sah Sculpture", chance: 9 }, { name: "Ayatan Valana Sculpture", chance: 9 }, { name: "Vitus Essence ×3", chance: 7 }, { name: "Arcane Bodyguard", chance: 5 }, { name: "Arcane Pistoleer", chance: 5 }, { name: "Arcane Tanker", chance: 5 }, { name: "Adaptation", chance: 2 }, { name: "Aerodynamic", chance: 2 }, { name: "Combat Discipline", chance: 2 }, { name: "Omni Forma Blueprint", chance: 1 }],
  B: [{ name: "Endo ×1,200", chance: 44.5 }, { name: "Ayatan Piv Sculpture", chance: 12 }, { name: "Ayatan Vaya Sculpture", chance: 12 }, { name: "Vitus Essence ×3", chance: 7 }, { name: "Arcane Blade Charger", chance: 5 }, { name: "Arcane Bodyguard", chance: 5 }, { name: "Arcane Primary Charger", chance: 5 }, { name: "Adaptation", chance: 2.5 }, { name: "Combat Discipline", chance: 2.5 }, { name: "Shepherd", chance: 2.5 }, { name: "Omni Forma Blueprint", chance: 2 }],
  C: [{ name: "Endo ×1,500", chance: 35 }, { name: "Ayatan Orta Sculpture", chance: 20 }, { name: "Vitus Essence ×3", chance: 10 }, { name: "Arcane Blade Charger", chance: 5 }, { name: "Arcane Pistoleer", chance: 5 }, { name: "Arcane Primary Charger", chance: 5 }, { name: "Arcane Tanker", chance: 5 }, { name: "Omni Forma Blueprint", chance: 4.5 }, { name: "Combat Discipline", chance: 3.5 }, { name: "Melee Guidance", chance: 3.5 }, { name: "Swift Momentum", chance: 3.5 }],
};
export const ARB_NOTES = ["Every completed mission also gives 50,000 Credits.", "Arbitration Shield Drones have a 6% chance to drop Vitus Essence."];
/** Chances of one rotation should add up to 100: a quick check that the hand-copied table is complete. */
export const rotationTotal = (r: ArbReward[]) => Math.round(r.reduce((a, x) => a + x.chance, 0) * 10) / 10;
