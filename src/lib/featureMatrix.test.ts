import { expect, it } from "vitest";
import { FEATURES } from "./featureMatrix";
import { SOURCES } from "./sources";
const tests = import.meta.glob("../**/*.test.ts"); // vite keys: "./x.test.ts" for this folder (src/lib), "../data/x.test.ts" for the others
it("feature ids are unique and every field is filled in", () => {
  expect(new Set(FEATURES.map(f => f.featureId)).size).toBe(FEATURES.length);
  for (const f of FEATURES) { expect(f.featureName.length > 3, f.featureId).toBe(true); expect(f.acceptanceCriteria.length > 10, f.featureId).toBe(true); expect(f.priorityReason.length > 5, f.featureId).toBe(true); expect(f.knownGaps.length > 0, f.featureId).toBe(true); }
});
it("every sourceId exists in the source registry", () => {
  const ids = new Set(SOURCES.map(s => s.id));
  for (const f of FEATURES) for (const s of f.sourceIds) expect(ids.has(s), `${f.featureId} -> ${s}`).toBe(true);
});
it("every testId is a real test file (the matrix cannot point at tests that do not exist)", () => {
  const found = new Set(Object.keys(tests).map(k => (k.startsWith("./") ? "lib/" + k.slice(2) : k.replace(/^\.\.\//, ""))));
  expect(found.size > 20, "glob found the test files").toBe(true);
  for (const f of FEATURES) for (const t of f.testIds) expect(found.has(t), `${f.featureId} -> ${t}`).toBe(true);
});
it("lastVerifiedAt is a real date or null, and a feature with no verification date is never marked verified", () => {
  for (const f of FEATURES) { if (f.lastVerifiedAt) { expect(/^\d{4}-\d{2}-\d{2}$/.test(f.lastVerifiedAt)).toBe(true); expect(Date.parse(f.lastVerifiedAt) <= Date.now() + 86_400_000).toBe(true); } else expect(f.dataStatus === "verified", f.featureId).toBe(false); }
});
it("features with no tests are never claimed fully implemented unless flagged in knownGaps", () => {
  for (const f of FEATURES.filter(x => x.implementationStatus === "IMPLEMENTED" && x.testIds.length === 0)) expect(f.knownGaps.some(g => /no automated test/i.test(g)), f.featureId).toBe(true);
});
