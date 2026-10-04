import { expect, it } from "vitest";
import { probeHealth } from "./probe";
const P = (o: Partial<{ ok: boolean; ms: number; http: number | null }>) => ({ ok: true, at: 1, ms: 100, http: 200, note: "", ...o });
it("maps probe outcomes to health", () => {
  expect(probeHealth(undefined)).toBe("UNKNOWN"); expect(probeHealth(P({}))).toBe("HEALTHY"); expect(probeHealth(P({ ms: 9000 }))).toBe("DEGRADED");
  expect(probeHealth(P({ ok: false, http: 429 }))).toBe("RATE_LIMITED"); expect(probeHealth(P({ ok: false, http: 403 }))).toBe("BLOCKED"); expect(probeHealth(P({ ok: false, http: null }))).toBe("DOWN");
});
