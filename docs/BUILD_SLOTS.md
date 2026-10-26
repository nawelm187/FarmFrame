# Build slots: Aura, Stance and Exilus (v0.105)

| Item | Special slots |
|---|---|
| Warframe | Aura, Exilus |
| Primary / Secondary | Exilus |
| Melee | Stance, Exilus |
| Companion / Archwing | none |

Stored in `Build.special` (optional, so older saved builds still load). `allSlots(build)` is the eight normal slots plus these.

## Rules (`src/lib/build.ts`)
- **Aura and Stance mods give capacity instead of spending it:** (|base| + rank), doubled on a matching polarity or an omni slot, 25% less (rounded) on a mismatch. Source: WARFRAME Wiki, [Mod](https://wiki.warframe.com/w/Mod). Older pages (Fandom Polarity, the official Mods Guide) say the mismatch loses 20% instead; the current wiki page is followed. Tests: `build.special.test.ts`.
- **Exilus** takes only mods flagged as utility (`isUtility` in the item data). If the data has no flag the build says it cannot confirm it (warning), it does not guess. The mod spends capacity like a normal one.
- Aura mods and Stance mods are no longer accepted in the normal slots (before, a melee build could not place a Stance mod at all).
- Mods in special slots count for the duplicate check, the missing-mods list, the endo estimate and the stat totals (`calc.ts`).

## Not done
- **Forma for the polarity of the special slots is not counted** in the Forma total (the data lists the native polarity of the normal slots only).
- Riven slot and the Archon Shard slots of Warframes.
- Weapons have more Exilus rules (adapters) than are modelled here.
