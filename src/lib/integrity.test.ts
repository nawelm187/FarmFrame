// Deterministic data-integrity gate (audit P0.1). Runs in CI with `npm test`; needs no network.
import { expect, it } from "vitest";
import { METHODS } from "../data/methods";
import { CONFIDENCE, SOURCES, sourceById } from "./sources";
const host = (u: string) => { try { return new URL(u).hostname; } catch { return null; } };
it("source registry: unique ids, known confidence, real https hosts, no fallback to a planned or unknown source", () => {
  const ids = SOURCES.map(s => s.id); expect(new Set(ids).size).toBe(ids.length);
  for (const s of SOURCES) {
    expect(Object.keys(CONFIDENCE), s.id).toContain(s.confidence);
    for (const h of s.hosts) expect(/^[a-z0-9.-]+\.[a-z]{2,}$/.test(h), `${s.id} host ${h}`).toBe(true);
    if (s.fallback) { const f = sourceById(s.fallback); if (f) { expect(f.use, `${s.id} falls back to planned source ${f.id}`).toBe("active"); expect(f.id).not.toBe(s.id); } }
  }
});
it("source registry: an active source is never an unverified one (F)", () => {
  for (const s of SOURCES) if (s.use === "active") expect(s.confidence, s.id).not.toBe("F");
});
it("farm methods: unique ids, valid dates, at least one yield and step, no empty boosts", () => {
  expect(new Set(METHODS.map(m => m.id)).size).toBe(METHODS.length);
  for (const m of METHODS) {
    expect(/^\d{4}-\d{2}-\d{2}$/.test(m.checked), m.id).toBe(true); expect(Date.parse(m.checked) <= Date.now() + 86_400_000, m.id).toBe(true);
    expect(m.yields.length > 0 && m.steps.length > 0 && m.summary.length > 10, m.id).toBe(true);
    for (const y of m.yields) expect(y.trim().length > 0, `${m.id} empty yield`).toBe(true);
    for (const b of m.boosts) expect(b.name.length > 0 && b.effect.length > 0 && typeof b.applies === "boolean", `${m.id} boost`).toBe(true);
  }
});
it("farm methods: provenance matches the status and the source registry", () => {
  for (const m of METHODS) {
    expect(host(m.source.url), `${m.id} url`).not.toBeNull(); expect(m.source.url.startsWith("https://"), m.id).toBe(true);
    if (m.status === "wiki") expect(host(m.source.url), `${m.id} is marked wiki`).toBe("wiki.warframe.com");
    else { expect(host(m.source.url), `${m.id} community host`).not.toBe("wiki.warframe.com"); expect(/communit|not verified|unverified/i.test(m.confidence + " " + m.notes.join(" ")), `${m.id} community method needs a visible caveat`).toBe(true); }
  }
  // Every host a method cites belongs to a source the registry knows by name, so Data Sources can explain it.
  const known = ["wiki.warframe.com", "forums.warframe.com", "steamcommunity.com"];
  for (const m of METHODS) expect(known, `${m.id} cites a host with no registry entry`).toContain(host(m.source.url)!);
  expect(sourceById("warframe-wiki-guides")).toBeDefined(); expect(sourceById("steam-discussions")).toBeDefined(); expect(sourceById("warframe-forums")).toBeDefined();
});
it("farm methods: any percentage written in the text is within (0, 100]", () => {
  for (const m of METHODS) for (const x of [m.summary, ...m.steps, ...m.notes].join(" ").matchAll(/(\d+(?:\.\d+)?)%/g)) { const v = parseFloat(x[1]); expect(v > 0 && v <= 100, `${m.id}: ${x[0]}`).toBe(true); }
});
