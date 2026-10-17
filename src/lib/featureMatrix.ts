// Feature and data coverage matrix (audit v0.84 -> v0.85, 2026-10-13). Machine-readable on purpose: featureMatrix.test.ts checks that
// every sourceId exists in the source registry, every testId is a real test file, and that nothing claims DATA_VERIFIED / RELEASE_READY without evidence.
// Statuses describe what was INSPECTED in code and run in unit tests. Nothing here was checked in a real browser, so no entry is RELEASE_READY.
export type ImplStatus = "NOT_ASSESSED" | "PLANNED" | "PRESENT_UNVERIFIED" | "PARTIAL" | "IMPLEMENTED" | "BLOCKED";
export type DataStatus = "verified" | "partial" | "stale" | "unavailable" | "unknown";
export type Priority = "P0" | "P1" | "P2" | "P3";
export interface Feature {
  featureId: string; featureName: string; implementationStatus: ImplStatus; dataStatus: DataStatus;
  sourceIds: string[]; /** ISO date when the DATA was last checked against a source by someone; null when it never was. Code inspection does not count. */ lastVerifiedAt: string | null;
  /** Test files under src/ that exercise it (paths relative to src/). */ testIds: string[];
  knownGaps: string[]; ownerModule: string; priority: Priority; priorityReason: string; acceptanceCriteria: string;
}
export const FEATURES: Feature[] = [
  { featureId: "search", featureName: "Global smart search", implementationStatus: "IMPLEMENTED", dataStatus: "unknown", sourceIds: ["wfcd-items", "wfcd-drops"], lastVerifiedAt: null,
    testIds: ["lib/search.golden.test.ts", "lib/smartSearch.test.ts", "lib/searchDocs.test.ts", "lib/search.test.ts", "lib/searchIntents.test.ts", "lib/searchMultilang.test.ts"],
    knownGaps: ["v0.86 added two readings (\"necesito <material>\" and lore questions): tested on the logic only, not typed into the real search box", "Golden queries are Spanish/English phrases the owner reported; no queries yet for quest gates, vendors by currency or saved plans", "Keyboard and screen-reader behaviour of the palette not checked in a browser"],
    ownerModule: "src/lib/smartSearch.ts", priority: "P1", priorityReason: "Front door of the core loop", acceptanceCriteria: "Every golden query opens the entity named in its expectation; a new failing phrase is added as a golden line before it is fixed" },
  { featureId: "i18n", featureName: "Interface languages (9) with a flag bar at the top", implementationStatus: "PARTIAL", dataStatus: "unknown", sourceIds: [], lastVerifiedAt: null,
    testIds: ["i18n/i18n.test.ts"],
    knownGaps: ["About 44 of 77 screens still have hard-coded English (run `node scripts/i18n-audit.mjs`), the sentences built in lib/ (Advisor, Farm Now, item advice, freshness) and the long texts in data/ (guides, methods, Helminth, lore) are English; game names stay as in the game", "Translations are AI-made and have not been read by native speakers", "No right-to-left languages", "Flag choice, saved language and first-visit detection were not tested in a real browser"],
    ownerModule: "src/i18n", priority: "P1", priorityReason: "Requested: players worldwide in their own language", acceptanceCriteria: "Every dictionary has exactly the English keys; English users download no other dictionary; a missing key shows English, never blank" },
  { featureId: "home-hero", featureName: "Home hero: rotating unvaulted Prime Warframes and new Warframes", implementationStatus: "PARTIAL", dataStatus: "unknown", sourceIds: ["wfcd-items"], lastVerifiedAt: null,
    testIds: ["lib/heroFrames.test.ts"],
    knownGaps: ["Depends on the catalog fields `vaulted` and `releaseDate`; whether the live data carries `releaseDate` for every Warframe was not checked (without it the order is the catalog's and no new Warframe is detected)", "The label says Prime · not vaulted: the data has no 'current Prime Access' field", "Rotation, pause and keyboard use were not tested in a real browser"],
    ownerModule: "src/lib/heroFrames.ts", priority: "P2", priorityReason: "Home first impression", acceptanceCriteria: "Never shows a vaulted Prime or an undated guess as new; falls back to the goal image or logo when nothing qualifies" },
  { featureId: "relic-drops", featureName: "Relic contents, refinement chances and drop finder", implementationStatus: "IMPLEMENTED", dataStatus: "partial", sourceIds: ["wfcd-drops", "wfcd-items"], lastVerifiedAt: null,
    testIds: ["lib/drops.test.ts", "lib/exact.test.ts", "lib/vault.test.ts"],
    knownGaps: ["The official drop tables (de-drops) are only planned; the live source is a community mirror", "No probability-after-N-runs calculator exists (planned P2)", "Radshare assumptions are not modelled"],
    ownerModule: "src/lib/drops.ts", priority: "P0", priorityReason: "Chances drive farming decisions", acceptanceCriteria: "relicIssues() is empty for the live relic table; rows with unknown chance show no chance" },
  { featureId: "farm-methods", featureName: "Resource farming methods (35)", implementationStatus: "IMPLEMENTED", dataStatus: "partial", sourceIds: ["warframe-wiki-guides", "steam-discussions", "warframe-forums"], lastVerifiedAt: "2026-10-12",
    testIds: ["lib/methods.test.ts", "lib/integrity.test.ts"],
    knownGaps: ["Read through a summarizer, not from the live page", "Rates are per roll or per run, none measured per hour", "2 of 35 methods are community strategies, not wiki"],
    ownerModule: "src/data/methods.ts", priority: "P1", priorityReason: "Hand-maintained data that can go stale after patches", acceptanceCriteria: "Unique ids, valid dates, wiki methods link to the wiki, community methods carry a visible warning" },
  { featureId: "world-state", featureName: "Live world state (fissures, cycles, Baro, invasions)", implementationStatus: "IMPLEMENTED", dataStatus: "partial", sourceIds: ["warframestat", "de-worldstate"], lastVerifiedAt: "2026-10-11",
    testIds: ["lib/format.test.ts", "lib/freshness.test.ts", "lib/health.test.ts", "lib/drift.test.ts", "lib/cycles.test.ts"],
    knownGaps: ["Only one live source for most datasets; the official fallback covers fissures only", "Source freshness is judged by a fixed window per dataset, not by the source's own update time", "Cache-vs-network is now recorded (Rec.via) but not yet shown as a badge in every panel"],
    ownerModule: "src/lib/data.ts", priority: "P0", priorityReason: "Stale data shown as live misleads", acceptanceCriteria: "Cached or old data is never labelled fresh without age; data of unknown age is STALE" },
  { featureId: "cloud-sync", featureName: "Account sync of goals, progress and builds", implementationStatus: "IMPLEMENTED", dataStatus: "unknown", sourceIds: ["supabase"], lastVerifiedAt: null,
    testIds: ["lib/cloud.test.ts", "lib/syncGuard.test.ts", "lib/syncPush.test.ts"],
    knownGaps: ["Concurrent-write guard (syncPush.ts, updated_at as version) is tested only against a fake store: the real Supabase round trip of the timestamp is untested", "RLS policies were read, not executed against a database", "The user_state JSON has no size limit in SQL", "CloudProvider.tsx could not be type-checked in this audit"],
    ownerModule: "src/lib/CloudProvider.tsx", priority: "P0", priorityReason: "Personal data integrity", acceptanceCriteria: "Data tied to another account is never uploaded to a new account; a device holding an old version never overwrites a newer cloud copy" },
  { featureId: "riven-disposition", featureName: "Riven disposition coverage", implementationStatus: "PARTIAL", dataStatus: "unknown", sourceIds: ["wfcd-items", "official-rivens-weekly", "rivens-wf"], lastVerifiedAt: null,
    testIds: ["lib/coverage.test.ts"], // plus scripts/measure-coverage.test.mjs (outside src: needs Node APIs)
    knownGaps: ["The helper counts dispositions but no page shows them", "No expected-weapon universe is defined, so no percentage is shown", "No pinned catalog snapshot exists: it needs network access that this audit did not have"],
    ownerModule: "src/lib/coverage.ts", priority: "P1", priorityReason: "Coverage enforcement was absent", acceptanceCriteria: "scripts/measure-coverage.mjs exits non-zero on unavailable source or on counts outside an explicit expectation file" },
  { featureId: "incarnon", featureName: "Incarnon weapons, evolutions, Circuit rotation", implementationStatus: "PARTIAL", dataStatus: "unknown", sourceIds: ["wfcd-items", "warframe-wiki-api"], lastVerifiedAt: null,
    testIds: ["lib/coverage.test.ts"],
    knownGaps: ["Only detects an Incarnon attack in the catalog; evolutions and unlock challenges are not modelled", "Weekly Circuit choices are not modelled as dynamic data"],
    ownerModule: "src/lib/coverage.ts", priority: "P2", priorityReason: "Needs a reliable evolution source first", acceptanceCriteria: "Not started: blocked on a verified evolution source" },
  { featureId: "builds", featureName: "Build editor and stat totals", implementationStatus: "PARTIAL", dataStatus: "unknown", sourceIds: ["wfcd-items"], lastVerifiedAt: null,
    testIds: ["lib/build.test.ts", "lib/reqs.test.ts"],
    knownGaps: ["Declared on the page: not every slot, Aura/Exilus, shards, weapon damage, weapon arcanes or conditional effects are calculated", "Only plain +N% lines are summed; others are listed as not calculated"],
    ownerModule: "src/lib/calc.ts", priority: "P2", priorityReason: "The limitation is disclosed; no false totals", acceptanceCriteria: "Unsupported effects stay listed as not calculated" },
  { featureId: "manual-vendors", featureName: "Hand-written vendor, syndicate and Helminth tables", implementationStatus: "IMPLEMENTED", dataStatus: "partial", sourceIds: ["manual-wiki-vendors", "manual-wiki-syndicates", "manual-wiki-helminth", "manual-railjack"], lastVerifiedAt: "2026-10-07",
    testIds: ["data/vendors.test.ts", "data/syndicateInfo.test.ts", "data/syndicateWiki.test.ts", "data/helminth.test.ts", "lib/vendor.test.ts", "lib/vendorSources.test.ts"],
    knownGaps: ["Typed by hand from wiki pages or screenshots; can contain slips", "No review schedule is recorded per dataset"],
    ownerModule: "src/data", priority: "P1", priorityReason: "Manual data needs provenance", acceptanceCriteria: "Each dataset carries a source and a date; totals are tested" },
  { featureId: "goal-identity", featureName: "Shared ids across Search, goals, Farm Plan, Roadmap and Tracking", implementationStatus: "PARTIAL", dataStatus: "unknown", sourceIds: ["wfcd-items"], lastVerifiedAt: null,
    testIds: ["lib/refs.test.ts", "lib/goals.test.ts", "lib/track.test.ts", "lib/completion.test.ts"],
    knownGaps: ["Tracking still compares normalised names for parts", "No end-to-end test follows item -> relic -> plan -> tracking"],
    ownerModule: "src/lib/refs.ts", priority: "P1", priorityReason: "Core loop consistency", acceptanceCriteria: "One id per entity resolves in every module" },
  { featureId: "farm-now", featureName: "Farm Now and Planner ranking", implementationStatus: "IMPLEMENTED", dataStatus: "partial", sourceIds: ["warframestat", "wfcd-drops"], lastVerifiedAt: null,
    testIds: ["lib/farmNow.test.ts", "lib/planner.test.ts", "lib/advisor.test.ts", "lib/unlock.test.ts"],
    knownGaps: ["Ranking weights are not documented as an objective function", "Readiness tags come from the user's own ticks, not from the game"],
    ownerModule: "src/lib/farmNow.ts", priority: "P1", priorityReason: "Must explain every recommendation", acceptanceCriteria: "Each recommendation states why it ranks first and how fresh its inputs are" },
  { featureId: "data-reports", featureName: "Data problem reports", implementationStatus: "IMPLEMENTED", dataStatus: "unknown", sourceIds: ["supabase"], lastVerifiedAt: null,
    testIds: [],
    knownGaps: ["Rate limit exists only in the browser (localStorage), so a script can skip it", "Category column is not restricted in SQL", "No automated test"],
    ownerModule: "src/ReportIssue.tsx", priority: "P1", priorityReason: "Anonymous insert endpoint", acceptanceCriteria: "Payload size is bounded in SQL (already: 60/200/500 characters)" },
  { featureId: "quests", featureName: "Quest prerequisites and unlock gates", implementationStatus: "NOT_ASSESSED", dataStatus: "unknown", sourceIds: [], lastVerifiedAt: null, testIds: [],
    knownGaps: ["No structured prerequisite graph found in code; only guide text"], ownerModule: "src/data/guides.ts", priority: "P2", priorityReason: "Needs a structured source", acceptanceCriteria: "Not started" },
  { featureId: "adversaries-enemy-scaling", featureName: "Kuva Liches, Sisters, enemy level scaling, Archon Shards, arcanes pages", implementationStatus: "NOT_ASSESSED", dataStatus: "unknown", sourceIds: [], lastVerifiedAt: null, testIds: [],
    knownGaps: ["No scaling formulas, adversary model or arcane page found; lich/Sister appear only in lore text and vendor sources"], ownerModule: "src/lib/lore.ts", priority: "P2", priorityReason: "No verified source chosen", acceptanceCriteria: "Not started" },
];
