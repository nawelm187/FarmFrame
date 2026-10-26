# Mod cards (v0.104)

Drawn in CSS only (no game images): a metal frame by quality, a cost + polarity tag over the art, rank pips, a name banner, effect text and category.

| Quality | Frame | How it is chosen (`src/lib/modTier.ts`) |
|---|---|---|
| Common | bronze | rarity Common |
| Uncommon | silver | rarity Uncommon |
| Rare | gold (Primed mods glow) | rarity Rare; name starting with "Primed" adds the glow |
| Legendary | platinum | rarity Legendary |
| Amalgam | steel and teal | name starts with "Amalgam" (wins over the rarity) |
| Archon | crimson | name starts with "Archon" (wins over the rarity) |
| Riven | purple with a slow sheen (off with reduced motion) | type or name contains "Riven" |
| anything else | neutral grey | unknown rarity |

- `ModCard` has a normal, a `big` (item page) and a `mini` variant. `mini` is the compact card of the build editor: the art fills the card, the name sits over it.
- The build editor shows a grid of `mini` cards, one per slot, with rank - / + under each. The real slot drain (with the slot's polarity) is shown through the `drain` prop; an empty slot shows its polarity.
- The artwork comes from the catalog. The previews in this repo's history used generated placeholder art, so check how the real art looks under each frame.
- Not done yet: slot kinds (stance, exilus, aura) with their own dashed colors, and the Underframe-style "test the build against an enemy" panel under the grid.
