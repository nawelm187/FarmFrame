/** Syndicate facts transcribed by hand from https://wiki.warframe.com/w/Syndicate (screenshots supplied by the project owner, checked 2026-10-07). Manual source: update it when the wiki changes. */
export const SYNDICATE_SOURCE = { id: "manual-wiki-syndicates", label: "Warframe Wiki: Syndicate", url: "https://wiki.warframe.com/w/Syndicate", verified: "2026-10-07" };
export type Group = "faction" | "open-world" | "event" | "neutral";
/** Faction syndicates and how each treats the others when you earn standing with it: ally +50%, opposed -50%, enemy -100% (as listed on the wiki). */
export interface Relations { ally: string; opposed: string; enemy: string }
export const FACTION: Record<string, Relations> = {
  "steel meridian": { ally: "Red Veil", opposed: "New Loka", enemy: "Perrin Sequence" },
  "arbiters of hexis": { ally: "Cephalon Suda", opposed: "Perrin Sequence", enemy: "Red Veil" },
  "cephalon suda": { ally: "Arbiters of Hexis", opposed: "Red Veil", enemy: "New Loka" },
  "perrin sequence": { ally: "New Loka", opposed: "Arbiters of Hexis", enemy: "Steel Meridian" },
  "red veil": { ally: "Steel Meridian", opposed: "Cephalon Suda", enemy: "Arbiters of Hexis" },
  "new loka": { ally: "Perrin Sequence", opposed: "Steel Meridian", enemy: "Cephalon Suda" },
};
export const RATE = { ally: 0.5, opposed: -0.5, enemy: -1 } as const;
/** Faction syndicate ranks: lowest and highest standing you can hold at each rank. */
export const RANKS: { rank: number; min: number; max: number }[] = [
  { rank: 5, min: 0, max: 132000 }, { rank: 4, min: 0, max: 99000 }, { rank: 3, min: 0, max: 70000 }, { rank: 2, min: 0, max: 44000 }, { rank: 1, min: 0, max: 22000 },
  { rank: 0, min: -5000, max: 5000 }, { rank: -1, min: -22000, max: 0 }, { rank: -2, min: -44000, max: 0 },
];
export const MIN_RANK = -2, MAX_RANK = 5;
/** Daily standing cap for faction syndicates: 16,000 at Mastery Rank 0, plus 500 per rank. Resets at 0:00 UTC. */
export const dailyCap = (mr: number) => 16000 + 500 * Math.max(0, Math.floor(mr));
export const NOTES = ["Standing comes from a Pledge made at the Syndicate terminal in the Orbiter: 15% of the Affinity you earn is converted into Standing.", "You also gain it from daily Syndicate Alerts (Rank 1 unlocks them; they reset at the same time as Sorties) and by turning in Syndicate Medallions."];
export const groupOfSyndicate = (name: string): Group => {
  const k = keyOf(name);
  if (FACTION[k]) return "faction";
  if (["ostron", "quills", "solaris united", "vox solaris", "ventkids", "entrati", "necraloid", "kahls garrison", "holdfasts", "cavia", "hex", "nightcap"].includes(k)) return "open-world";
  if (["operational supply", "nightwave"].includes(k)) return "event";
  return "neutral";
};
/** Normalised key: lowercase, no leading "the", no punctuation. */
export const keyOf = (n: string) => n.toLowerCase().replace(/['’]/g, "").replace(/^the\s+/, "").replace(/[^a-z0-9]+/g, " ").trim();
