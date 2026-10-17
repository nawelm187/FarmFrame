# FarmFrame v0.84 audit and v0.85 repairs

Date of audit: 2026-10-13. Method: read the directive, inspected the repository, ran what could be run, fixed what could be fixed and verified by tests.
Status words follow the directive (section 7): NOT_ASSESSED, PLANNED, PRESENT_UNVERIFIED, PARTIAL, IMPLEMENTED, TESTED, DATA_VERIFIED, RELEASE_READY, BLOCKED.
The machine-readable coverage matrix is `src/lib/featureMatrix.ts` (checked by `featureMatrix.test.ts`). **No feature is RELEASE_READY or DATA_VERIFIED: nothing was checked in a real browser and no game data was compared with a live source in this audit.**

## 1. Environment and commands actually run

| Command | Result |
|---|---|
| `node -v`, `npm -v` | Node 22.22.2, npm 10.9.7 (CI also uses Node 22) |
| `npm ci` | **FAILED, environment blocker**: `ENOTFOUND registry.npmjs.org` (the sandbox has no network). npm then crashed ("Exit handler never called") leaving a partial `node_modules`, which was deleted. This says nothing about the code. |
| `npm run typecheck` (real `tsc` 5.x with `vite/client`, React and Supabase types) | **NOT RUN**: dependencies could not be installed |
| `npm test` (real `vitest`) | **NOT RUN**: same reason |
| `npm run build` (`vite build`) | **NOT RUN**: same reason |
| `npm audit` | **NOT RUN**: needs the registry |
| Stand-in runner (outside the repo: esbuild bundling + a small `describe/it/expect` shim) | Baseline before my changes: 60 test files, **238 passed, 0 failed, 0 skipped**. After: 64 files, **257 passed, 0 failed, 0 skipped**. This is **not vitest**; it implements only the matchers the tests use (`toBe`, `toEqual`, `toBeNull`, `toContain`, `toHaveLength`, `toMatch`, `toBeGreaterThan`, `toMatchObject`, `toBeUndefined`, `toBeDefined`, `.not`) and ignores the optional message argument of `expect`. |
| Partial typecheck (global `tsc` 6.0.3, strict, `noUnusedLocals`, stub typings for `react` and `vitest`) on `syncGuard.ts`, `featureMatrix.ts`, `data.ts` and the new and edited tests | exit 0. This is **not** the project's `typecheck`: different TypeScript major version, stubbed React. |
| esbuild syntax transform on `CloudProvider.tsx` and `Sources.tsx` | parses. Types of those two files are **unverified**. |

Re-count of tests: 60 test files and 241 `it(`/`test(` text matches, but only 238 tests ran: three matches were `.test(` regex calls, so grep counts are not a quality score.

**Before publishing run:** `npm ci && npm run typecheck && npm test && npm run build`. If typecheck reports an error in `CloudProvider.tsx` or `Sources.tsx`, it comes from my edit there.

### Results reported from the owner's PC (2026-10-14, Windows, vitest 2.1.9; pasted console output, not run by me)

| Command | Result |
|---|---|
| `npm ci` | OK, 112 packages. `npm` reported **8 vulnerabilities (5 moderate, 1 high, 2 critical)**, not analysed yet: run `npm audit --omit=dev` to see whether any affects what ships to the browser; do not run `npm audit fix --force` blindly. npm also blocked the `esbuild` install script (`allowScripts`); typecheck and tests still ran. |
| `npm run typecheck` (real `tsc --noEmit`) | **Passed** (the chain continued). This covers my edits in `CloudProvider.tsx` and `Sources.tsx`. |
| `npm test` (real vitest) | 65 files, **264 passed, 1 failed**. The failure was my own test: `featureMatrix.test.ts` compared testIds with the wrong glob key format (vite names files of the same folder `./x`, my stand-in runner named them `../lib/x`). Fixed in this version and reproduced with a stand-in that now mimics vite's key format. Not yet re-run with the real vitest. |
| `npm build` | The command typed was `npm build`, which is not the build script: **the build has not run**. Use `npm run build`. |

| `npm audit --omit=dev` (production dependencies) | **2 moderate**, both in `react-router` / `react-router-dom` 6.x (range 6.0.0 to 7.17.0; the only fix is 7.18.4, a major upgrade). (a) open redirect via a backslash in `<Link>`/`useNavigate`: relevant only if the app passes user-controlled text as a destination; callers seen by grep (`Palette`, `Builds`, `Onboarding`) were **not** reviewed in depth. (b) `deserializeErrors()` in server-side hydration: **does not apply**, the app is a static client with `HashRouter`. Decision: no forced upgrade; schedule React Router 7 as its own task with tests. |
| Same audit without `--omit=dev` | the other 6 (1 high, 2 critical, 3 moderate) are **development tools only** (`vite`/`esbuild` dev server, `vitest`, `vite-node`, `tinypool` worker options). They are not part of the built site that GitHub Pages serves. Realistic exposure: the dev server while running `npm run dev`, and test workers on your own machine. Fix needs vite 8 / vitest 5 (breaking). Not applied. |
| Second `npm run` chain on 2026-10-14 | still showed the old failing `featureMatrix.test.ts` (line 15 `found.has("../" + t)`): that copy did not include the fix. Because the chain uses `&&`, **`npm run build` did not run** after the failing test. |

Lesson recorded: the stand-in runner is not faithful to vite in details like glob keys, so its passes are weaker evidence than a real run.

### Final PC run (2026-10-14 02:27, pasted by the owner): all green

`npm ci && npm run typecheck && npm test && npm run build && npm audit --omit=dev`: typecheck passed; **vitest 2.1.9: 65 files, 265 tests passed, 0 failed**; `vite build` succeeded (356 modules, 20.5 s). Audit for production dependencies: the 2 moderate React Router advisories analysed above. **Still not run by anyone: any browser check** (section 8).

Measured from the build output (new finding D11, P2, performance, not changed): two images are very large for a web page (`cephalon-simaris` PNG 3.96 MB, `amir-nightwave` PNG 2.12 MB, then `baro-ki-teer` 634 KB) and `imgindex` is a 554 kB script chunk (148 kB gzipped) that vite warns about. Converting the big PNGs to WebP and loading `imgindex` on demand would help; it needs a visual check, so it was left alone.

## 2. Audit findings re-verified against the code

| Claim in the directive | Verified result |
|---|---|
| `coverage.ts` not used by the app or CI | **Confirmed**: no import outside its own test. Now partly connected: the standalone script is gated by a test on a fixture; no UI shows coverage (deliberate: no denominator exists). |
| Status union FRESH/STALE/UNAVAILABLE/ERROR/LOADING, no CACHED | **Confirmed.** A dataset read from IndexedDB inside its window was indistinguishable from a network one. Fixed with `Rec.via` instead of a new status (see section 4). |
| Source registry about 30 entries, 17 active, 13 planned | **Corrected**: 29 entries, 16 active, 13 planned. |
| Planned sources listed as if integrated | **Found one case**: `wfcd-drops.fallback = "de-drops"` while `de-drops` is only planned. Removed. |
| 35 farming methods | **Confirmed**: 35 methods (33 wiki, 2 community), unique ids, valid dates. Their content was **not** re-checked against the wiki. |
| Supabase `user_state` with four own-row policies; `data_reports` insert only | **Confirmed by reading `schema.sql`.** Policies were not executed against a database. |
| Build page discloses its calculation limits | Not re-read in a browser; `calc.ts` only sums plain "+N% Stat" lines and lists everything else as not calculated (consistent with the disclosure). |
| Prior typecheck failure was environmental | Same failure class here (no registry). Not evidence about the code. |

## 3. Defects found (ordered by priority)

| # | P | Defect | Evidence | Status |
|---|---|---|---|---|
| D1 | P0 | **Account switch leaks personal state.** `signOut` leaves the `ff.*` data in the browser. A different account signing in on that device with an empty cloud row had the previous account's goals uploaded to it. | `CloudProvider.tsx` (old effect: cloud empty and local not empty -> `push`) | **Fixed** (`syncGuard.ts`, 4 tests). Residual risk: changes made in the last 4 s before the switch that never reached the old account's cloud are dropped, not stashed. |
| D2 | P0 | Data of unknown age (no timestamp) was reported FRESH. | old `statusOf` | **Fixed**, tested in `format.test.ts`. |
| D3 | P1 | Cached copy shown as if retrieved this visit. | `load()` cache branch set no marker | **Fixed** for the trust line (`Rec.via`). Other panels that show their own "updated" text were not audited. |
| D4 | P1 | Registry claimed a fallback that does not exist; Data Sources printed a raw id as fallback. | `sources.ts`, `Sources.tsx` | **Fixed**. |
| D5 | P0 | **Last write wins**: two devices editing did overwrite each other every 4 s; nothing compared versions. | old `push()` was an unconditional `upsert` | **Fixed in code, not yet proven against Supabase.** `syncPush.ts` writes only if the cloud `updated_at` still equals the one this device last saw (no SQL change needed); otherwise it overwrites nothing and opens the existing conflict screen. 8 tests on a fake store. If the version check itself fails on an unchanged row it raises an error instead of a fake conflict. Needs the PC checks in section 8. |
| D6 | P1 | `user_state.data` has no size limit in SQL. | `schema.sql` | **OPEN** (proposal below). |
| D7 | P1 | Report rate limit lives only in `localStorage`; the table accepts any `category` text up to 60 characters. Sizes are bounded in SQL (60/200/500). | `ReportIssue.tsx`, `schema.sql` | **OPEN**, low severity. |
| D8 | P1 | Coverage enforcement absent in CI. | no gate existed | **Partly fixed**: `integrity.test.ts`, matrix test, script with exit codes. **Real catalog counts are not enforced**: a pinned snapshot needs network. |
| D9 | P1 | Tracking compares part names normalised, not ids. | `track.ts` uses `sameName` = `nameKey`, the same normalisation that builds the shared ids (`thing:...`) | **Reclassified, not changed**: equality already is by that key; a migration would add risk for no gain. Remaining risk (two different items with the same key) not found. |
| D11 | P2 | Very large images and one 554 kB script chunk in the build. | `vite build` output | **Images fixed in v0.87** (9 portraits, 8.5 MB to 0.4 MB, compared visually at display size; confirm the new build sizes on the PC). The 554 kB `imgindex` file is imported on demand (`ItemArt.tsx`), so only Vite's warning remains; left alone. |
| D10 | P2 | Stray 1-byte file `supabase/functions/build-analysis/N.md`. | file listing | OPEN, harmless, not deleted. |

No secret was found in the repository. `src/lib/config.ts` embeds a Supabase **publishable** key and project URL; that is designed to be public and relies on RLS (not re-tested). The edge function `build-analysis` requires a signed-in user, caps the request size and reads its API key from a server secret. No `innerHTML`, `dangerouslySetInnerHTML` or `eval` in `src`. The functions `market` and `worldstate` were not reviewed in depth.

## 4. What changed

- `src/lib/syncGuard.ts` (+ test): decision function for first sync after sign-in; owner key `ff.owner`.
- `src/lib/CloudProvider.tsx`: uses it; sets the owner whenever the device and the cloud are in sync.
- `src/lib/data.ts`: `Rec.via`; `statusOf` treats no timestamp as STALE.
- `src/lib/freshness.ts`: trust line says when a result came from the device cache.
- `src/lib/sources.ts`, `src/pages/Sources.tsx`: fallback correction and readable fallback name.
- `src/lib/integrity.test.ts`, `src/lib/featureMatrix.ts`, `src/lib/featureMatrix.test.ts`.
- `scripts/measure-coverage.mjs` (rewritten, same predicates as `coverage.ts`), `scripts/measure-coverage.test.mjs` (kept outside `src` because it needs Node APIs and the project has no `@types/node`), `vite.config.ts` (test include).
- Version 0.85.0 (`package.json`, lockfile root, `version.ts`), `CHANGELOG.md`, this document.

Existing tests were only added to, never edited or disabled.

## 5. Proposed SQL (NOT applied, NOT tested; optional, owner's decision)

D5 no longer needs SQL. Only the size bound for D6 remains a proposal (`not valid` leaves existing rows untouched; rollback: drop the constraint):

```sql
alter table public.user_state add constraint user_state_size check (pg_column_size(data) <= 1000000) not valid;
```

## 6. Prioritised plan

1. (P0) Run the PC checks of section 8 for the account sync (D5, D1).
2. (P0) Run the real `npm ci`, typecheck, tests and build; fix anything my edits broke.
3. (P1) Commit a pinned weapon-catalog snapshot plus a reviewed `coverage-expect.json`, then run `measure-coverage.mjs --dir ... --expect ...` in CI. Counts must come from a reviewed real snapshot.
4. (P1) Replace name matching in Tracking with canonical ids (D9) with an explicit migration of saved data.
5. (P1) Browser pass with Playwright at 360, 768 and 1280 px: search opens the right entity, tracking persists, stale state shown, keyboard use, axe.
6. (P1) Show the cache badge in the panels that print their own update time.
7. (P2) Game systems with no structured source found (quests, enemy scaling, adversaries, arcane pages, Incarnon evolutions and Circuit rotation): choose and verify a source before any model.

## 8. Checks to run on the PC (nothing below was run)

1. `npm ci && npm run typecheck && npm test && npm run build`. Any type error in `CloudProvider.tsx` comes from my edit (adapter `store()`, `write()`).
2. Two-device sync (D5): sign in on browser A and browser B with the same account, edit a goal in A, wait 5 s, edit a different goal in B **without reloading**. Expected: B shows the conflict screen and A's change is still in the cloud (check the `user_state` row in Supabase). Choosing "this device" must then save; choosing "cloud" must load A's data.
3. Normal use must NOT show a conflict: edit on one device only for a few minutes; the sync state stays "synced" and `updated_at` advances. **If a sync error says "version check failed"**, the timestamp does not round-trip through the API: tell me the exact message and the `updated_at` value format; do not ignore it.
4. Account switch (D1): sign in as account 1, add a goal, sign out, sign in as account 2 (empty). Expected: no goal from account 1 appears in account 2, and account 2's cloud row stays empty.
5. Guest data: with no account, add a goal, then sign in to an empty account. Expected: the goal is kept and uploaded (unchanged behaviour).
6. Cache badge (D3): reload twice inside a dataset's window; the trust line should say "(from the device cache...)" on the second load.

## 7. Not verified, and why

Real `vitest`/`tsc`/`vite build`/`npm audit` (no network). Any browser behaviour, responsiveness, accessibility, performance (no browser run). RLS behaviour against a real database. Correctness of the hand-typed game data (no live source access). Whether `de-publicexport` or `de-drops` can replace the community mirrors (planned, not integrated).

## 9. v0.86 (2026-10-14): Rotations cards, smarter search, Home hero

Verified here: stand-in runner 67 files, 277 tests passed (not vitest); partial strict `tsc` on the new pure modules (`heroFrames.ts`, `smartSearch.ts`, `understand.ts` and their tests): exit 0; Rotations CSS reproduced and fixed on a mock page rendered by headless Chromium with the real `styles.css` (before: all cards of a row stretched to 26 rem; after: neighbours keep their height, opened list capped at 20 rem and scrolls). **Not verified:** the same screens inside the real app; `Palette.tsx`, `SearchAnswers.tsx`, `Home.tsx` have only a syntax check.

PC checks: (1) `npm run typecheck && npm test && npm run build`. (2) Rotations: open Teshin's stock and Baro's list; the other cards in the row must keep their height. (3) Search: "necesito creditos", "quiero platino", "cual es el lore de styanax", "necesito styanax prime". (4) Home: the picture rotates and the label never names a vaulted Prime. If every Warframe shows in catalog order, or no Warframe is marked "New", the live data probably has no `releaseDate`: tell me and I will look at the real JSON. Still true: no field says which Prime Access is current, so the app only claims "not vaulted".

## 10. v0.87 (2026-10-14)

Images converted with `sharp` (WebP, max 512 px, quality 82), compared with the originals at the CSS crop. `Prov` line now uses `provLine()` (date when not today, "from the device cache"): 1 new test, 278 pass in the stand-in runner; partial `tsc` exit 0 on the pure modules; `parts.tsx` syntax-checked only. Step-by-step PC checks for v0.85 to v0.87 are in `FarmFrame_Pruebas_PC.md`.

## 11. v0.88 (2026-10-14)

- Search: 30 natural queries were run through the intent reader; 10 gave a wrong or no reading and were fixed (Spanish buying, price, "sacar", "best place", "dame", "ayuda", question words). 281 tests passed then, golden search tests included.
- Accessibility (static scan of `src/**/*.tsx`): 0 `<img>` without `alt`; 4 number inputs flagged, 3 were already inside a `<label>`, 1 (Builds mod rank) got an `aria-label`; the one clickable `div` is the search backdrop (Escape also closes it). Not done: any screen-reader, keyboard or axe run in a real browser.
- Contrast (computed from the CSS variables, WCAG 2.x): text `#E6E6E6` 13:1 and `#C3C9CE` 9.7:1 on the card background; muted text `#8A939B` 5.2:1 on cards and 4.65:1 on the lighter surface, 4.26:1 on the border colour (just under 4.5 if text ever sits there); accent `#089B9B` 4.77:1 on cards but 4.27:1 and 3.91:1 on the two lightest surfaces; red `#E0605A` 4.63:1 on cards, 4.14:1 and 3.80:1 on the lightest. Which of those combinations actually appear in the app was not checked.
- D12 (P1, unverified assumption): `pct()` in `resources.ts` reads 0 to 1 as a fraction and above 1 as a percentage. If a source ever sends a percentage such as 0.5 meaning 0.5 %, it would show 50 %. Pinned by a test; needs a look at the live resource data to settle.
- D13 (P2): `eff()` rounds the product of two chances to two decimals, so a chance below 0.005 % shows as 0 instead of "less than 0.01 %". Pinned by a test, not changed.

## 12. v0.89 (2026-10-14): interface languages

Design: `src/i18n/en.ts` is the source of truth (63 keys); `es pt fr de it ru zh ja` are separate files typed `Record<Key, string>`, so a missing key is a type error and a test fails on any difference in keys or placeholders. `setLang()` loads the dictionary first, then switches, saves `ff.lang` and sets `<html lang>`. `main.tsx` loads the saved or browser language before the first render (English needs no download). `LangBar` draws simplified SVG flags (rendered here with the real stylesheet at 1600 px and 400 px: recognisable, wraps under the search box on narrow screens; this also exposed and fixed a missing React `key` on the US flag stripes).

Verified: 296 tests in the stand-in runner; partial strict `tsc` (exit 0) on `i18n/*.ts`, `featureMatrix.ts` and the tests; syntax check on the five edited screens. **Not verified:** the app in a browser (switching, saving, first-visit detection, fonts for Russian, Chinese and Japanese), translation quality (AI-made, no native review), whether the item catalog carries translated item names that could be used later.

Limits to remember: only menus, search box and Home are translated; the Advisor on Home and every other page stay English; the search engine understands English and Spanish questions only; no right-to-left languages (Arabic, Hebrew) yet; dates use the browser's own format.

## 13. v0.90 (2026-10-14): search in any language and wider translation

- **Cause found:** `normalize()` kept only `a-z0-9`, so a Cyrillic, Chinese or Japanese query became empty. It now keeps letters of every script (Latin accents are still removed). A new pre-pass, `src/lib/multilang.ts`, maps words of the 9 languages to the canonical English words the engine knows; filler words of other languages are dropped only when the phrase is clearly not English or Spanish (the first version dropped words Spanish needs ("que es", "del vacio") and the existing golden tests caught it).
- **Verified here:** 347 tests in the stand-in runner (49 new for search, 1 for dictionaries parity per language, 3 for the coverage ratchet); partial strict `tsc` on the pure modules: exit 0. **Not verified:** the app in a browser; typing in a Chinese or Japanese input method; whether item names have translations in the live catalog.
- **Measured coverage:** 33 of 77 screens with no hard-coded text, 679 strings in 44 screens (`node scripts/i18n-audit.mjs`). The audit cannot see sentences built in `src/lib/` or the long texts in `src/data/`, so a clean screen is not a promise that everything on it is translated (the Home page still shows Advisor sentences generated in `lib/advisor.ts`).
- **Why not "everything" in one pass:** the Advisor, Farm Now, item advice, completion notes and freshness lines are produced as English sentences by logic with their own tests; they must become keys with variables first. The long prose (guides, methods, Helminth, lore) is hundreds of KB per language. Plan and rules: `docs/I18N.md`.
- **Quality:** translations are AI-made; no native review yet.

## 14. v0.91 (2026-10-14): more screens, plurals

- Scanner improved first (it now reads template strings and strings inside expressions): the honest count went from 679 to 997 and, after this round, to 895 strings in 53 screens (24 of 77 screens clean).
- Screens done: Tracking, Fissures, Relics and its cards, Details labels, Home leftovers, Railjack weapons, Stepper, Countdown. `tp()` adds plural forms (Russian one/few/many); the parity test now allows `_few` and `_many` extras and checks they have a base key.
- Verified: 349 tests in the stand-in runner (coverage ratchet now covers 22 files); partial strict `tsc` exit 0 on `i18n/*.ts` including the new `Dict` type. **Not verified:** the app in a browser; typecheck of the edited screens (syntax only). The damage-icon logic in `Details.tsx` was changed (explicit `dmg` count instead of comparing English titles): check a weapon page.
- Quality: a re-read of my own Russian found one double negative; native review is still needed for all 8 languages.
