import { expect, it } from "vitest";
import { favId, toggleFav } from "./fav";
it("toggles a favorite on and off without touching others", () => {
  const a = { id: favId("warframe", "rhino"), cat: "warframe" as const, slug: "rhino", name: "Rhino" }, b = { id: favId("mod", "serration"), cat: "mod" as const, slug: "serration", name: "Serration" };
  const on = toggleFav([a], b); expect(on.map(x => x.id)).toEqual(["warframe:rhino", "mod:serration"]);
  expect(toggleFav(on, b)).toEqual([a]);
});
