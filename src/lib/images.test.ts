import { expect, it } from "vitest";
import type { Entity } from "./catalog";
import { buildImageIndex, imageFor } from "./images";
const e = { name: "Akbronco Prime", image: "akbronco.png", components: [{ name: "Receiver", count: 1, image: "rec.png", drops: [], children: [] }, { name: "Blueprint", count: 1, image: null, drops: [], children: [] }] } as unknown as Entity;
it("finds part images and falls back to the owner", () => {
  const i = buildImageIndex([[e]]);
  expect(imageFor(i, "Akbronco Prime Receiver")).toBe("rec.png");
  expect(imageFor(i, "Akbronco Prime Blueprint")).toBe("akbronco.png");
  expect(imageFor(i, "Akbronco Prime Barrel")).toBe("akbronco.png");
  expect(imageFor(i, "Forma Blueprint")).toBeNull();
});
