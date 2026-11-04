import { describe, expect, it } from "vitest";
import { trackCounts, trackFilter } from "./track";
describe("tracking filters", () => {
  const a = [{ n: "Continuity", o: 0, t: 1, from: "Build: Excal" }, { n: "Forma Blueprint", o: 3, t: 3 }, { n: "Ash Prime Systems", o: 1, t: 2 }];
  it("counts complete and missing", () => expect(trackCounts(a)).toEqual({ all: 3, done: 1, missing: 2 }));
  it("filters and keeps the original index so edits hit the right row", () => {
    expect(trackFilter(a, "missing").map(x => x.i)).toEqual([0, 2]); expect(trackFilter(a, "done").map(x => x.t.n)).toEqual(["Forma Blueprint"]);
    expect(trackFilter(a, "all", "prime").map(x => x.i)).toEqual([2]); expect(trackFilter(a, "done", "prime")).toEqual([]);
  });
});
