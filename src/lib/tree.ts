import type { Component } from "./catalog";
import { tiersOf } from "./goals";
export interface Need { name: string; qty: number; from: string[] }
/** Raw resources (leaf nodes under a component) needed for `m` copies of it. Same-named resources merge into one line, so shared dependencies are summed once, never listed twice. */
export function needs(c: Component, m: number, label: string, acc: Map<string, Need> = new Map(), depth = 0): Map<string, Need> {
  if (depth > 6) return acc;
  for (const k of c.children) {
    const q = k.count * m;
    if (k.children.length) needs(k, q, label, acc, depth + 1);
    else { const e = acc.get(k.name) ?? { name: k.name, qty: 0, from: [] }; e.qty += q; if (!e.from.includes(label)) e.from.push(label); acc.set(k.name, e); }
  }
  return acc;
}
export type Group = "Relics" | "Blueprints" | "Resources" | "Other";
export const GROUPS: Group[] = ["Relics", "Resources", "Blueprints", "Other"];
export const groupOf = (c: Component): Group => (/blueprint/i.test(c.name) ? "Blueprints" : tiersOf(c).length ? "Relics" : "Other");
