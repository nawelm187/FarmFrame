// Plain .mjs on purpose: it reads the source tree with Node APIs and the project has no @types/node (tsc only reads src/).
import { describe, expect, it } from "vitest";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { audit, findHardcoded } from "./i18n-audit.mjs";
/** Screens whose visible text is fully translated. A file listed here may never get hard-coded English back. Add a file when you finish it. */
const DONE = ["src/App.tsx", "src/Baro.tsx", "src/Details.tsx", "src/ErrorBoundary.tsx", "src/GameText.tsx", "src/GoalCards.tsx", "src/LangBar.tsx", "src/ModCard.tsx", "src/Onboarding.tsx", "src/Palette.tsx", "src/main.tsx", "src/pages/Home.tsx", "src/pages/Invasions.tsx", "src/pages/NotFound.tsx", "src/pages/RailjackWeapons.tsx", "src/pages/Fissures.tsx", "src/pages/Relics.tsx", "src/pages/Part.tsx", "src/pages/Mastery.tsx", "src/pages/OppList.tsx", "src/pages/Resources.tsx", "src/pages/Enemies.tsx", "src/EnemyScaling.tsx", "src/DamageTest.tsx", "src/pages/Patches.tsx", "src/pages/Syndicates.tsx", "src/pages/Explore.tsx", "src/pages/CompanionMods.tsx", "src/pages/RailjackParts.tsx", "src/VendorStock.tsx", "src/MissingList.tsx", "src/Money.tsx", "src/VendorList.tsx", "src/Icons.tsx", "src/pages/Methods.tsx", "src/pages/PartSearch.tsx", "src/pages/Finder.tsx", "src/pages/Entity.tsx", "src/SetPrice.tsx", "src/ModPrice.tsx", "src/MarketCheck.tsx", "src/lib/rich.tsx", "src/pages/Alerts.tsx", "src/ReportIssue.tsx", "src/pages/Farm.tsx", "src/pages/SetFarm.tsx", "src/pages/Rotations.tsx", "src/pages/Builds.tsx", "src/ModPicker.tsx", "src/SearchAnswers.tsx", "src/pages/Advisor.tsx", "src/pages/FarmPlan.tsx", "src/pages/Roadmap.tsx", "src/pages/Planner.tsx", "src/pages/Hub.tsx", "src/pages/Profile.tsx", "src/RelicCard.tsx", "src/pages/Tracking.tsx", "src/pages/parts.tsx", "src/ui.tsx"];
const walk = d => readdirSync(d).flatMap(f => { const p = join(d, f); return statSync(p).isDirectory() ? walk(p) : /\.tsx?$/.test(p) && !/\.test\.tsx?$/.test(p) ? [p] : []; });
describe("translation coverage", () => {
  const rows = audit("src");
  it("finished screens have no hard-coded text", () => { for (const f of DONE) expect(rows.find(r => r.file === f)?.found ?? [`${f} not found`], f).toEqual([]); });
  it("the scanner finds what it is meant to find", () => {
    expect(findHardcoded('<p>Hello there friend</p>')).toHaveLength(1);
    expect(findHardcoded('<p>{t("a")}</p>')).toHaveLength(0);
    expect(findHardcoded('<input aria-label="Search things" />')).toHaveLength(1);
    expect(findHardcoded('<Unavailable why="No data here." />')).toHaveLength(1);
    expect(findHardcoded('<span>Ctrl K</span>')).toHaveLength(0);
  });
  it("every t(\"key\") in the code is a key that exists in English", () => {
    const keys = new Set([...readFileSync("src/i18n/en.ts", "utf8").matchAll(/^  (\w+):/gm)].map(m => m[1])), missing = [];
    for (const f of walk("src")) for (const m of readFileSync(f, "utf8").matchAll(/\b(?:t|tr)\("(\w+)"/g)) if (!keys.has(m[1])) missing.push(`${f}: ${m[1]}`);
    expect(missing).toEqual([]);
  });
});
