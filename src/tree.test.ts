import { expect, it } from "vitest";
import { needs } from "./tree";
import type { Component } from "./catalog";
const k = (name: string, count: number, children: Component[] = []): Component => ({ name, count, drops: [], children });
it("merges shared and nested resources with quantities", () => {
  const chassis = k("Chassis", 1, [k("Plastids", 10), k("Alloy Plate", 5)]);
  const systems = k("Systems", 1, [k("Plastids", 5), k("Module", 2, [k("Circuits", 3)])]);
  const acc = needs(chassis, 1, "Chassis (X)"); needs(systems, 2, "Systems (X)", acc);
  expect(acc.get("Plastids")).toEqual({ name: "Plastids", qty: 20, from: ["Chassis (X)", "Systems (X)"] });
  expect(acc.get("Circuits")?.qty).toBe(12);
  expect(acc.get("Alloy Plate")?.qty).toBe(5);
});
