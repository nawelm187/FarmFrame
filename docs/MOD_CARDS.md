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

## Marcos de imagen opcionales (v0.127)
Las cartas llevan un marco dibujado con CSS por calidad. Si dejas imágenes en `src/assets/modframes/`, las cartas usan esas imágenes como marco, **calidad por calidad** (las que no tengan imagen siguen con el marco CSS). Funciona igual en todas las cartas: lista de mods, comparación, editor de builds (en las pequeñas el grosor se reduce solo) y el selector de mods.
- Nombres: `common`, `uncommon`, `rare`, `legendary`, `amalgam`, `archon`, `riven`, `other`; `primed` para los Primed; `default` como respaldo.
- Dos modos (`config.json`): `overlay` (una imagen con el centro transparente estirada sobre la carta) y `slice` (se corta en 9 partes: las esquinas no se deforman; recomendado).
- Todo está explicado, con ejemplos, en `src/assets/modframes/LEEME.md`.
- Probado con marcos sintéticos en los dos modos, en la lista de mods y en las cartas pequeñas del editor. **No se ha probado con imágenes reales del juego**: la proporción, el grosor (`width`) y el corte (`slice`) habrá que ajustarlos con ellas.
- Sobre de dónde sacar las imágenes: ver `docs/LEGAL_Y_PRIVACIDAD.md` (política de contenido de Digital Extremes: uso no comercial y sin logotipos; el método de obtención no está verificado).
