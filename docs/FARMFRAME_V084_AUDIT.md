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

Lesson recorded: the stand-in runner is not faithful to vite in details like glob keys, so its passes are weaker evidence than a real run.

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
| D9 | P1 | Tracking compares part names normalised, not ids (see `refs.ts`). | `track.ts`, changelog v0.73 | **OPEN** |
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
