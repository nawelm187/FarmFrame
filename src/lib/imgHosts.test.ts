import { expect, it } from "vitest";
import { IMG_HOSTS, hostDown, imgUrl, nextSrc, orderedHosts, fileOf, hostOf, resetTally, record } from "./imgHosts";
it("the CDN comes first and the raw GitHub address last", () => {
  resetTally(); expect(IMG_HOSTS[0].id).toBe("jsdelivr"); expect(IMG_HOSTS[IMG_HOSTS.length - 1].id).toBe("github");
  expect(imgUrl("a b.png")).toBe(IMG_HOSTS[0].base + "a%20b.png");
});
it("a host is skipped only after repeated failures with almost no successes", () => {
  expect(hostDown("x", { x: { ok: 0, bad: 4 } })).toBe(false); expect(hostDown("x", { x: { ok: 0, bad: 5 } })).toBe(true);
  expect(hostDown("x", { x: { ok: 10, bad: 20 } })).toBe(false); expect(hostDown("x", { x: { ok: 10, bad: 31 } })).toBe(true);
  expect(orderedHosts({ jsdelivr: { ok: 0, bad: 9 } })[0].id).toBe("cdn");
  expect(orderedHosts({ jsdelivr: { ok: 0, bad: 9 }, cdn: { ok: 0, bad: 9 }, github: { ok: 0, bad: 9 } }).length).toBe(3);
});
it("retries walk through every host once and then stop", () => {
  const t = {}; const a = nextSrc("f.png", ["jsdelivr"], t)!; expect(hostOf(a)?.id).toBe("cdn");
  expect(hostOf(nextSrc("f.png", ["jsdelivr", "cdn"], t)!)?.id).toBe("github");
  expect(nextSrc("f.png", ["jsdelivr", "cdn", "github"], t)).toBeNull();
});
it("reads the file name back from any host address", () => {
  expect(fileOf(IMG_HOSTS[1].base + "a%20b.png")).toBe("a b.png"); expect(fileOf("")).toBe("");
});
it("recording is harmless without a browser and counts against the right host", () => {
  resetTally(); for (let i = 0; i < 5; i++) record(IMG_HOSTS[0].base + "x.png", false); record("https://other.example/x.png", false);
  expect(imgUrl("x.png").startsWith(IMG_HOSTS[1].base)).toBe(true); resetTally();
});
