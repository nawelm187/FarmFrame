// Plain .mjs on purpose: it needs Node APIs and the project has no @types/node, so tsc (which only reads src/) must not see it.
// Runs scripts/measure-coverage.mjs on a tiny SYNTHETIC fixture (invented weapons, not game data) to prove exit codes and that the script's
// predicates agree with src/lib/coverage.ts. It says nothing about the real catalog.
import { expect, it } from "vitest";
import { execFileSync, spawnSync } from "node:child_process";
import { mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { dispositionCoverage, incarnonWeapons } from "../src/lib/coverage.ts";
const primary = [{ name: "Fix A", disposition: 3 }, { name: "Fix B" }, { name: "Fix C", disposition: 0 }, { name: "Fix D", disposition: 2, attacks: [{ name: "Incarnon Form" }] }];
const secondary = [{ name: "Fix E", disposition: 5, tags: ["Incarnon"] }, { name: "fix a", disposition: 1 }];
const melee = [{ name: "Fix F", disposition: 4 }];
const dir = mkdtempSync(join(tmpdir(), "ffcov-")); for (const [n, d] of [["Primary", primary], ["Secondary", secondary], ["Melee", melee]] ) writeFileSync(join(dir, `${n}.json`), JSON.stringify(d));
const script = join(process.cwd(), "scripts/measure-coverage.mjs");
const run = (...a) => spawnSync(process.execPath, [script, ...a], { encoding: "utf8" });
it("script and coverage.ts agree on the fixture", () => {
  const j = JSON.parse(execFileSync(process.execPath, [script, "--dir", dir, "--json"], { encoding: "utf8" }));
  const c = dispositionCoverage(primary);
  expect(j.files.Primary.withDisposition).toBe(c.found); expect(j.files.Primary.missingDisposition).toEqual(c.missing);
  expect(j.incarnon).toEqual(incarnonWeapons([...primary, ...secondary, ...melee])); expect(j.duplicates).toEqual(["fix a"]);
});
it("report mode exits 0; a missing file exits 2, never 0", () => {
  expect(run("--dir", dir).status).toBe(0);
  const empty = mkdtempSync(join(tmpdir(), "ffcov-empty-")); expect(run("--dir", empty).status).toBe(2);
});
it("gate mode exits 1 when an expectation is violated and 0 when exceptions are documented", () => {
  const bad = join(dir, "bad.json"); writeFileSync(bad, JSON.stringify({ maxMissingDisposition: { Primary: 0 }, minIncarnon: 5 }));
  const r = run("--dir", dir, "--expect", bad); expect(r.status).toBe(1); expect(r.stdout).toContain("VIOLATION");
  const good = join(dir, "good.json");
  writeFileSync(good, JSON.stringify({ maxMissingDisposition: { Primary: 0 }, minIncarnon: 2, minWithDisposition: { Melee: 1 }, allowMissing: [{ name: "Fix B", reason: "fixture", reviewed: "2026-10-13" }, { name: "Fix C", reason: "fixture", reviewed: "2026-10-13" }], allowDuplicates: [{ name: "fix a", reason: "fixture", reviewed: "2026-10-13" }] }));
  expect(run("--dir", dir, "--expect", good).status).toBe(0);
  expect(run("--dir", dir, "--expect", join(dir, "nope.json")).status).toBe(2);
});
