/** Starter-player guides written by hand from official Warframe pages. Manual source: re-check after game updates. Every claim below comes from the pages in GUIDE_SOURCES, read on the date shown. */
export const GUIDE_SOURCES = {
  archwing: { label: "Warframe Wiki: Archwing Launcher", url: "https://wiki.warframe.com/w/Archwing_Launcher", verified: "2026-10-07" },
  kdrive: { label: "Warframe Wiki: K-Drive", url: "https://wiki.warframe.com/w/K-Drive", verified: "2026-10-07" },
  kdriveSupport: { label: "Warframe Support: K-Drives", url: "https://support.warframe.com/hc/en-us/articles/38821782542733-K-Drives", verified: "2026-10-07" },
  necramechSupport: { label: "Warframe Support: Necramech, a basic guide", url: "https://support.warframe.com/hc/en-us/articles/4404024402957-NECRAMECH-a-basic-guide", verified: "2026-10-07" },
  voidrig: { label: "Warframe Wiki: Voidrig", url: "https://wiki.warframe.com/w/Voidrig", verified: "2026-10-07" },
  bonewidow: { label: "Warframe Wiki: Bonewidow", url: "https://wiki.warframe.com/w/Bonewidow", verified: "2026-10-07" },
} as const;
export interface Launcher { id: string; title: string; summary: string; steps: string[]; notes: string[]; sources: (keyof typeof GUIDE_SOURCES)[]; link?: [string, string] }
export const LAUNCHERS: Launcher[] = [
  { id: "archwing", title: "Archwing Launcher", summary: "Lets you summon your Archwing in the open worlds (Plains of Eidolon, Orb Vallis, Cambion Drift) and use it in the air.",
    steps: ["Complete The Archwing quest. Since Update 39.0 (2025-06-25) the launcher is given when the quest ends, with nothing to craft or buy.", "Equip it in the Gear menu. Once equipped, activating it puts your Archwing on automatically. It has unlimited uses."],
    notes: ["Older guides tell you to research an Archwing Launcher Segment in a clan dojo or buy it for 175 Platinum. That was removed in Update 39.0, and Dojo resources were refunded.", "It no longer needs a Mastery Rank. The wiki says it is \"no longer Mastery Rank locked\"."], sources: ["archwing"] },
  { id: "kdrive", title: "K-Drive Launcher", summary: "Lets you summon a K-Drive (a hoverboard) in the open worlds.",
    steps: ["Complete the quest Vox Solaris, which begins in Fortuna (Orb Vallis). When it ends you get a basic Bondi K-Drive Launcher.", "The Bondi is free but cannot be modded or leveled and gives no Mastery. To get a real K-Drive, build one from parts bought from the Ventkids in Fortuna (see the K-Drives page)."],
    notes: ["The wiki says the Bondi is lost once you get a custom K-Drive.", "The official support article lists no Mastery Rank requirement."], sources: ["kdriveSupport", "kdrive"], link: ["/kdrives", "Open the K-Drives page"] },
  { id: "necramech", title: "Necramech Launcher", summary: "Lets you summon your Necramech (Voidrig or Bonewidow) in the open worlds.",
    steps: ["Finish the quests The War Within and Heart of Deimos. Necramechs are not available before that.", "Talk to Loid in the Necralisk (Cambion Drift) in Operator form to get Necramech blueprints.", "Build your first Necramech in the Foundry. When you do, you receive a Launcher to summon it."],
    notes: ["Each Necramech can be leveled to 40 using 5 Formas (2 ranks per Forma).", "You need a free Archwing weapon slot, because Voidrig and Bonewidow come with the Mausolon archgun.", "The official support article lists no Mastery Rank requirement."], sources: ["necramechSupport", "voidrig"], link: ["/guides#necramech", "See how to build them"] },
];
export interface Build { name: string; blueprint: string; credits: number; hours: number; rush: number; parts: { part: string; credits: number; damaged: string; materials: string; hours: number; rush: number }[]; extra: string[]; source: keyof typeof GUIDE_SOURCES }
export const NECRAMECHS: Build[] = [
  { name: "Voidrig", blueprint: "Heart of Deimos gives all the blueprints for free. Otherwise: component blueprints cost 2,000 Standing at Necraloid Rank 1, and the main blueprint 5,000 Standing at Necraloid Rank 2.", credits: 25000, hours: 72, rush: 50, source: "voidrig",
    parts: [{ part: "Casing", credits: 15000, damaged: "Damaged Necramech Casing", materials: "60 Adramal Alloy, 30 Faceted Tiametrite, 140 Lucent Teroglobe", hours: 12, rush: 25 },
      { part: "Engine", credits: 15000, damaged: "Damaged Necramech Engine", materials: "50 Tempered Bapholite, 4 Parasitic Tethermaw, 10 Orokin Cell", hours: 12, rush: 25 },
      { part: "Capsule", credits: 15000, damaged: "Damaged Necramech Pod", materials: "3 Morphics, 12 Spinal Core Section, 50 Devolved Namalon", hours: 12, rush: 25 },
      { part: "Weapon Pod", credits: 15000, damaged: "Damaged Necramech Weapon Pod", materials: "3 Biotic Filter, 40 Purified Heciphron, 30 Purged Dagonic", hours: 12, rush: 25 }],
    extra: ["Crafting the components needs Entrati Rank 1 (Stranger). Purified Heciphron also needs it.", "Parasitic Tethermaw comes from Lobotriscid fish; Spinal Core Section from Vitreospina and Chondricord fish."] },
  { name: "Bonewidow", blueprint: "Component blueprints cost 3,500 Standing at Necraloid Rank 2, and the main blueprint 10,000 Standing at Necraloid Rank 3. Blueprints cannot be traded.", credits: 25000, hours: 72, rush: 50, source: "bonewidow",
    parts: [{ part: "Casing", credits: 15000, damaged: "Damaged Necramech Casing", materials: "100 Tempered Bapholite, 20 Thaumic Distillate, 15 Goblite Tears", hours: 12, rush: 25 },
      { part: "Engine", credits: 15000, damaged: "Damaged Necramech Engine", materials: "120 Adramal Alloy, 2 Cranial Foremount, 750 Titanium", hours: 12, rush: 25 },
      { part: "Capsule", credits: 15000, damaged: "Damaged Necramech Pod", materials: "4 Scintillant, 20 Biotic Filter, 6 Star Crimzian", hours: 12, rush: 25 },
      { part: "Weapon Pod", credits: 15000, damaged: "Damaged Necramech Weapon Pod", materials: "6 Spinal Core Section, 80 Devolved Namalon, 45 Scrap", hours: 12, rush: 25 }],
    extra: ["Materials need standing with other syndicates: Solaris United Rank 1 (Goblite Tears), Ostron Rank 3 (Star Crimzian), Entrati Rank 2 (Thaumic Distillate, Adramal Alloy, Devolved Namalon).", "Cranial Foremounts come from Myxostomata (fished with Processed Vome Residue, Entrati Rank 4) or at random from Requiem Obelisks on the Cambion Drift."] },
];
export const NECRAMECH_COMMON = ["Damaged Necramech parts drop from enemy Necramechs in Isolation Vault bounties, or can be bought from Father for 2,000 Entrati Standing.", "The market price of a built Voidrig or Bonewidow is 375 Platinum.", "Fallen Necramechs can also be found in the Cambion Drift and in Orphix missions; you take control of one with Transference. They come without mods."];
export type KPart = "Board" | "Reactor" | "Nose" | "Jet";
export interface KItem { part: KPart; name: string; standing: number | null; rank: number; where: string }
/** Ventkids K-Drive parts. Standing null = a Cambion Drift race reward. Parts are cosmetic; the Board is the piece that gives Mastery. */
export const KDRIVE_PARTS: KItem[] = [
  { part: "Board", name: "Feverspine", standing: null, rank: 0, where: "Dead Drop race, southwest of Deimos Terminus (Cambion Drift)" },
  { part: "Board", name: "Bad Baby", standing: 5000, rank: 0, where: "Ventkids, Fortuna" }, { part: "Board", name: "Flatbelly", standing: 10000, rank: 2, where: "Ventkids, Fortuna" },
  { part: "Board", name: "Needlenose", standing: 15000, rank: 4, where: "Ventkids, Fortuna" }, { part: "Board", name: "Runway", standing: 15000, rank: 5, where: "Ventkids, Fortuna" },
  { part: "Reactor", name: "Gristlebuck", standing: null, rank: 0, where: "Muck and Mire race, west of the Infested Seraglio (Cambion Drift)" },
  { part: "Reactor", name: "Coldfusor", standing: 5000, rank: 0, where: "Ventkids, Fortuna" }, { part: "Reactor", name: "Arc Twelve", standing: 10000, rank: 2, where: "Ventkids, Fortuna" },
  { part: "Reactor", name: "Hothead", standing: 15000, rank: 4, where: "Ventkids, Fortuna" }, { part: "Reactor", name: "Highbrow", standing: 15000, rank: 5, where: "Ventkids, Fortuna" },
  { part: "Nose", name: "Nodulite", standing: null, rank: 0, where: "Exocrine Flow race, north of Catabolic Gutter (Cambion Drift)" },
  { part: "Nose", name: "Beaky", standing: 5000, rank: 0, where: "Ventkids, Fortuna" }, { part: "Nose", name: "Wingnut", standing: 10000, rank: 2, where: "Ventkids, Fortuna" },
  { part: "Nose", name: "Dink-A-Donk", standing: 15000, rank: 4, where: "Ventkids, Fortuna" }, { part: "Nose", name: "Two-Sloops", standing: 15000, rank: 5, where: "Ventkids, Fortuna" },
  { part: "Jet", name: "Steeba", standing: null, rank: 0, where: "Pride Before a Fall race, north of the Undulatum (Cambion Drift)" },
  { part: "Jet", name: "Twin Kavats", standing: 5000, rank: 0, where: "Ventkids, Fortuna" }, { part: "Jet", name: "Step Tens", standing: 10000, rank: 2, where: "Ventkids, Fortuna" },
  { part: "Jet", name: "Fatboys", standing: 15000, rank: 4, where: "Ventkids, Fortuna" }, { part: "Jet", name: "Thugs", standing: 15000, rank: 5, where: "Ventkids, Fortuna" },
];
export const VENTKIDS_RANKS: Record<number, string> = { 0: "Neutral", 2: "Whozit", 4: "Primo", 5: "Logical" };
export const KDRIVE_HOW = ["Finish the quest Vox Solaris to unlock Fortuna's Ventkids and get the Bondi launcher.", "Earn Ventkids Standing, mostly by completing K-Drive races in Orb Vallis (tricks also earn Standing). The wiki counts 22 races in Orb Vallis and the Cambion Drift, with 5 active each day.", "Buy the four parts (Board, Reactor, Nose, Jet) in the Ventkids' clubhouse in Fortuna, reached through a vent above Legs' shop. Higher Ventkids ranks unlock more parts.", "Talk to Roky in Fortuna to assemble the K-Drive. Roky can also preview any combination, even with parts you do not own.", "The Infested parts (Feverspine, Gristlebuck, Nodulite, Steeba) come from Grandmother's races on the Cambion Drift, then Roky assembles them too.", "A random built K-Drive can also be bought for Platinum in the Ventkids' Daily Specials (the wiki gives no price)."];
export const KDRIVE_NOTES = ["Parts are cosmetic and do not change stats.", "Mastery: each custom K-Drive gives 6,000 Mastery Points once fully ranked (30 levels), per the Mastery Rank checklist. Five Boards are listed: Bad Baby, Feverspine, Flatbelly, Needlenose and Runway.", "Specific K-Drive mods are sold at the same place for Standing (the support article gives no amounts)."];
