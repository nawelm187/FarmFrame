import { describe, expect, it } from "vitest";
import { fmt } from "./format";
import { statusOf } from "./data";
describe("fmt", () => { it("formats", () => { expect(fmt(0)).toBe("0s"); expect(fmt(90_000)).toBe("1m 30s"); }); });
describe("statusOf", () => {
  const r = (o: object) => ({ id: "x", data: {}, at: 1000, err: null, url: "", window: 100, src: "", ...o });
  it("fresh/stale/error", () => {
    expect(statusOf(r({}), false, 1050)).toBe("FRESH");
    expect(statusOf(r({}), false, 1200)).toBe("STALE");
    expect(statusOf(r({ err: "x" }), false, 1050)).toBe("STALE");
    expect(statusOf(r({ data: null, err: "x" }), false)).toBe("ERROR");
    expect(statusOf(undefined, false)).toBe("UNAVAILABLE");
  });
});
it("statusOf: cached copies are judged by their source age, never fresh just because they came from cache", () => {
  const r = (o: object) => ({ id: "x", data: {}, at: 1000, err: null, url: "", window: 100, src: "", via: "cache" as const, ...o });
  expect(statusOf(r({}), false, 1050)).toBe("FRESH");
  expect(statusOf(r({}), false, 1200)).toBe("STALE");
  expect(statusOf(r({ at: null }), false, 1200)).toBe("STALE"); // unknown age is never fresh
  expect(statusOf(undefined, true)).toBe("LOADING");
  expect(statusOf(undefined, false)).toBe("UNAVAILABLE");
  expect(statusOf(r({ data: null }), false)).toBe("UNAVAILABLE");
});
