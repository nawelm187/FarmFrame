import { expect, it } from "vitest";
import { search } from "./search";
it("intent and typo", () => {
  expect(search("where do i farm plastids?", null)[0].to).toBe("/finder?q=plastids");
  expect(search("fisures", null)[0].label).toBe("Fissures");
});
