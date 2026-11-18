import { describe, expect, it } from "vitest";
import { EXTRA_KEYS, fingerprint, isEmpty, same, stable } from "./cloud";
it("stable ignores key order; same ignores empties and unknown keys", () => {
  expect(stable({ b: 1, a: { d: 2, c: 3 } })).toBe(stable({ a: { c: 3, d: 2 }, b: 1 }));
  expect(same({ "ff.goals": [{ id: "a" }], "ff.res": {} }, { "ff.goals": [{ id: "a" }], "ff.track": [], junk: 1 })).toBe(true);
  expect(same({ "ff.goals": [{ id: "a" }] }, { "ff.goals": [{ id: "b" }] })).toBe(false);
  expect(isEmpty({ "ff.track": [], "ff.res": {} })).toBe(true); expect(isEmpty({ "ff.builds": [1] })).toBe(false);
  expect(fingerprint({})).toBe(fingerprint({ "ff.track": [] }));
});
import { cleanImport } from "./cloud";
describe("cleanImport", () => {
  it("keeps only known keys holding objects or arrays", () => {
    expect(cleanImport({ "ff.goals": [{ id: "a" }], "ff.res": { Ignia: 3 }, "ff.other": [1], "ff.track": "text" })).toEqual({ "ff.goals": [{ id: "a" }], "ff.res": { Ignia: 3 } });
  });
  it("rejects files with nothing usable", () => { expect(cleanImport(null)).toBeNull(); expect(cleanImport([])).toBeNull(); expect(cleanImport({ hello: 1 })).toBeNull(); });
});

it("Mastery and Standing travel with the account but never decide a sign-in", () => {
  expect(EXTRA_KEYS).toEqual(["ff.mastery", "ff.standing"]);
  expect(same({ "ff.goals": [{ id: "a" }], "ff.mastery": ["x"] }, { "ff.goals": [{ id: "a" }] })).toBe(true);
  expect(isEmpty({ "ff.mastery": ["x"], "ff.standing": { a: 1 } })).toBe(true);
  expect(fingerprint({ "ff.mastery": ["x"] })).not.toBe(fingerprint({}));
  expect(cleanImport({ "ff.mastery": ["x"], "ff.standing": { a: 1 }, "ff.other": [1] })).toEqual({ "ff.mastery": ["x"], "ff.standing": { a: 1 } });
});
