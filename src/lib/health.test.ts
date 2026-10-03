import { describe, expect, it } from "vitest";
import { countOf, datasetHealth, healthTag, nextStat, worst, type LoadStat } from "./health";
const rec = (o: Partial<{ data: unknown; at: number | null; err: string | null; window: number }> = {}) => ({ id: "x", data: [1], at: 1000, err: null, url: "", window: 500, src: "", ...o });
describe("health", () => {
  it("counts records and folds outcomes, resetting the failure streak on success", () => {
    expect(countOf([1, 2])).toBe(2); expect(countOf({ a: 1 })).toBe(1); expect(countOf("x")).toBeNull();
    let s: LoadStat = nextStat(undefined, { ok: false, at: 1, ms: 5, http: 500, data: null, drift: [] }); s = nextStat(s, { ok: false, at: 2, ms: 5, http: 500, data: null, drift: [] });
    expect(s.fails).toBe(2); s = nextStat(s, { ok: true, at: 3, ms: 9, http: 200, data: [1, 2, 3], drift: [] }); expect(s.fails).toBe(0); expect(s.count).toBe(3);
  });
  it("ranks the states", () => {
    expect(datasetHealth(undefined, undefined)).toBe("UNKNOWN");
    expect(datasetHealth(rec(), undefined, 1200)).toBe("HEALTHY"); expect(datasetHealth(rec(), undefined, 2000)).toBe("STALE");
    expect(datasetHealth(rec({ data: null, err: "x" }), { ...nextStat(undefined, { ok: false, at: 1, ms: 1, http: 429, data: null, drift: [] }) })).toBe("RATE_LIMITED");
    expect(datasetHealth(rec({ data: null, err: "x" }), nextStat(undefined, { ok: false, at: 1, ms: 1, http: 403, data: null, drift: [] }))).toBe("BLOCKED");
    expect(datasetHealth(rec(), nextStat(undefined, { ok: true, at: 1, ms: 1, http: 200, data: [], drift: ["empty response"] }), 1200)).toBe("SCHEMA_DRIFT");
    expect(worst(["HEALTHY", "STALE", "DOWN"])).toBe("DOWN"); expect(worst([])).toBe("UNKNOWN"); expect(healthTag("DOWN")).toBe("ERROR"); expect(healthTag("HEALTHY")).toBe("FRESH");
  });
});
