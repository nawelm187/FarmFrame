import { expect, it } from "vitest";
import { ago, trustLine } from "./freshness";
const now = 10_000_000_000;
it("describes how long ago something was retrieved", () => {
  expect(ago(null, now)).toBe("not retrieved"); expect(ago(now - 20_000, now)).toBe("just now"); expect(ago(now - 5 * 60_000, now)).toBe("5 min ago");
  expect(ago(now - 3 * 3_600_000, now)).toBe("3 h ago"); expect(ago(now - 2 * 86_400_000, now)).toBe("2 d ago"); expect(ago(now + 5000, now)).toBe("just now");
});
it("warns only when an input is not fresh", () => {
  const rec = (at: number | null) => ({ id: "x", data: null, at, err: null, url: "", window: 1, src: "" });
  const ok = trustLine([{ label: "Fissures", status: "FRESH", rec: rec(now - 120_000) }, { label: "Relic tables", status: "LOADING" }], now);
  expect(ok.warn).toBeNull(); expect(ok.lines).toEqual(["Fissures: 2 min ago", "Relic tables: loading"]);
  const bad = trustLine([{ label: "Fissures", status: "STALE", rec: rec(now - 3_600_000) }, { label: "Relic tables", status: "ERROR" }], now);
  expect(bad.warn).toContain("Fissures and Relic tables may be out of date"); expect(bad.lines[0]).toBe("Fissures: stale, last retrieved 1 h ago"); expect(bad.lines[1]).toBe("Relic tables: error");
});
