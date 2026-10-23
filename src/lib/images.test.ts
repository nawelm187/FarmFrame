import { expect, it } from "vitest";
import type { Entity } from "./catalog";
import { buildImageIndex, imageExact, imageFor, isPalette } from "./images";
const e = { name: "Akbronco Prime", image: "akbronco.png", components: [{ name: "Receiver", count: 1, image: "rec.png", drops: [], children: [] }, { name: "Blueprint", count: 1, image: null, drops: [], children: [] }] } as unknown as Entity;
it("finds part images and falls back to the owner", () => {
  const i = buildImageIndex([[e]]);
  expect(imageFor(i, "Akbronco Prime Receiver")).toBe("rec.png");
  expect(imageFor(i, "Akbronco Prime Blueprint")).toBe("akbronco.png");
  expect(imageFor(i, "Akbronco Prime Barrel")).toBe("akbronco.png");
  expect(imageFor(i, "Forma Blueprint")).toBeNull();
});
it("imageExact is only an exact name (or name without Blueprint), never the owner's borrowed picture", () => {
  const i = buildImageIndex([[e]]);
  expect(imageExact(i, "Akbronco Prime")).toBe("akbronco.png"); expect(imageExact(i, "akbronco prime receiver")).toBe("rec.png");
  expect(imageExact(i, "Akbronco Prime Barrel")).toBeNull(); expect(imageFor(i, "Akbronco Prime Barrel")).toBe("akbronco.png");
});
it("colour palettes are never an item picture (Jade the Warframe vs the Jade palette)", () => {
  expect(isPalette("ColorPickerJade.png")).toBe(true); expect(isPalette("colorpickerkavat.png")).toBe(true);
  expect(isPalette("Jade.png")).toBe(false); expect(isPalette(null)).toBe(false); expect(isPalette(undefined)).toBe(false);
});
