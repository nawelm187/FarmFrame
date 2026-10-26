# Damage test (v0.106)

A panel under the build editor (primary and secondary weapons; melee shows a notice for now): pick or type an enemy, its scaling group and level, and it shows the average damage per shot, DPS with and without reloads, shots to kill and time to kill, plus a table per damage type.

## Rules (`src/lib/damage.ts`), sources read on 2026-10-25
- WARFRAME Wiki, [Calculating Bonuses](https://wiki.warframe.com/w/Calculating_Bonuses): base damage mods add together; elemental and physical mods are then calculated on the *modified* base damage (Karak 29 + Serration = 76.85; Hellfire adds 69.165). Mod elements combine two by two in slot order (left to right, top row then bottom row), the weapon's own elements last; a repeated element joins the pair it is already in.
- WARFRAME Wiki, [Damage 2.0](https://wiki.warframe.com/w/Damage_2.0): damage multiplier per type on armored health = 300 / (300 + armor x (1 - AM)) x (1 + AM) x (1 + HM) (AM armor class, HM health class); with armor 0 the armor class is lost. Shields use their own class modifier and ignore armor.
- Average critical multiplier = 1 + chance x (multiplier - 1), valid above 100% (linear). Multishot multiplies the pellets; fire rate, magazine and reload follow their mods.
- Enemy health, shields and armor at a level come from `enemyScaling.ts` (v0.103).
- Tests (`damage.test.ts`, 9) check those worked examples by hand. They are **not** compared with in-game numbers.

## Where the numbers come from
- Weapon: the item data (`damageTypes`, `damage` or the `damagePerShot` array in the same order the item page uses), `fireRate`, `criticalChance` (read as a fraction up to 1, a percent above), `criticalMultiplier`, `procChance`, `multishot`, `magazineSize`, `reloadTime`. If damage or fire rate are missing, the panel opens in manual mode and nothing is invented. Every base value can be edited.
- Mods: only plain "+N% stat" lines (the same rule as `calc.ts`), plus "+N% Heat/Cold/Electricity/Toxin/Impact/Puncture/Slash (Damage)". Anything else is listed as "not counted".
- Enemy: the resistance layers of the enemy data (armor class, shield class, health class). Neutral modifiers when the layers are missing. That data is the community's WFCD copy and may lag behind the post-Update 36 values.

## Not included (the panel says so)
Status effects and damage over time, headshots and weak points, faction damage mods, conditional mods, armor stripping, shield gating and spill, Overguard, Steel Path, damage quantization, alt fire modes, melee (combos, stances, attack speed), and the `luck-averaged`/auto-build features of other tools.
