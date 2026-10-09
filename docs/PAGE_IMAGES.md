# Image folders and exact file names

Every file here is optional: without one, the page simply shows no picture. Skip anything that has no logo or emblem of its own.

Put each image in the folder shown. Any of .png, .webp, .jpg, .svg works; the name before the dot must match exactly (lowercase, dashes). Square images of 256x256 or more look best.

## Missing: pages and panels (`src/assets/pages/`)
| File name | Where it shows |
|---|---|
| `void-trader.png` | Void Trader (Baro) panel |
| `kuva-missions.png` | Kuva missions panel |
| `daily-deal.png` | Daily deal (Darvo) panel |
| `sortie.png` | Sortie panel |
| `sentient-anomaly.png` | Sentient Anomaly panel |
| `cetus-plains.png` | Cetus (Plains) cycle |
| `orb-vallis.png` | Orb Vallis cycle |
| `cambion-drift.png` | Cambion Drift cycle |
| `zariman.png` | Zariman cycle |
| `relics.png` | Relics page |
| `rotations.png` | Rotations page |
| `planner.png` | Planner page |
| `enemies.png` | Enemies page |
| `parts.png` | Parts page |
| `resources.png` | Resources and items page |
| `patch-notes.png` | Patch notes page |
| `warframes.png` | Hub tile: Warframes |
| `weapons.png` | Hub tile: Weapons |
| `mods.png` | Hub tile: Mods |
| `companions.png` | Hub tile: Companions |
| `archwings.png` | Hub tile: Archwings |
| `railjack.png` | Hub tile: Railjack |
| `lore.png` | Hub tile: Lore |
| `farm-plan.png` | Hub tile: Farm Plan |
| `resource-finder.png` | Hub tile: Resource Finder |
| `fissures.png` | Hub tile: Fissures |
| `roadmap.png` | Hub tile: Roadmap |
| `builds.png` | Hub tile: Builds |
| `tracking.png` | Hub tile: Tracking |

## Missing: polarity (`src/assets/polarity/`)
| File name | Where it shows |
|---|---|
| `koneksi.png` | Mods and Builds (Railjack mods) |

## Missing: items (`src/assets/items/`)
Name = item name with dashes. These take priority over the pictures that come with the data. Resources and items use the picture from the data unless you add one here (for example `ferrite.png`, `orokin-cell.png`).
| File name | Where it shows |
|---|---|
| `aura-forma.png` | Aura Forma Blueprint (optional; falls back to forma) |

## Optional: enemies (`src/assets/enemies/`)
Only needed to replace the picture that comes with the data. Name = enemy name with dashes, for example `aerial-commander.png`.

## Already included (nothing to do)
- pages: 1999-calendar, LEEME, arbitration, archon-hunt, duviri, invasions, nightwave, prime-resurgence, sanctuary, steel-path-honors, void-fissures
- factions: LEEME, corpus, grineer, infested, murmur, narmer, orokin, sentient
- items: LEEME, forma, omni-forma, stance-forma, umbra-forma
- npc, damage, polarity: all supplied
- `src/assets/railjack/`: reserved, not used yet
