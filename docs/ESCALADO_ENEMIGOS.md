# Enemy level scaling (v0.103)

**Source:** WARFRAME Wiki, [Enemy Level Scaling](https://wiki.warframe.com/w/Enemy_Level_Scaling), read in full on 2026-10-24. Check the wiki's licence and keep the credit visible before publishing.

## What is implemented (`src/lib/enemyScaling.ts`, calculator in `src/EnemyScaling.tsx`, shown on the Enemies page)
- Health and shields: two endpoint curves per group, blended with a smoothstep between a level difference of 70 and 80, in IEEE 754 binary32 as the page asks.
- Armor: same blend, hard cap 2,700 (90% reduction), minimum 200 for enemies that have armor. Reduction = armor / (armor + 300).
- Overguard (Eximus, base 12), enemy damage multiplier, affinity multiplier.
- Eximus base increase for health and shields (the page's 2/15 term was garbled on copy; it is confirmed by the formula being continuous at level 35 and 50).
- Standard effective health = health x (1 + armor / 300) + shields.

## Decisions and limits
- The Eximus base increase is applied to the base value **before** the faction multiplier (the page says it is a separate increase of the base).
- q (current level minus base level) never goes below 0.
- Shield curves exist only for Corpus, Corrupted, Grineer, Sentient and Techrot. For other groups the calculator says so instead of guessing.
- **Base level per enemy is not in the data the site uses** (WFCD `Enemy.json`). It is a field the person fills in. The wiki keeps it per enemy.
- Not included: Steel Path, weapon damage, armor stripping, shield gating, Toxin.
- Tests (`src/lib/enemyScaling.test.ts`) check hand-worked values and coherence. They are **not** compared with values from the game.

## Next (build tester)
1. Weapon + build -> damage per hit, burst and sustained DPS (only simple "+N% stat" mods count; conditional ones are reported as not calculated, as `calc.ts` already does).
2. Damage type vs health/armor class (use the post-Update 36 values from the wiki's Damage pages, not the archived ones).
3. Time to kill against an enemy at a level, using this module.
