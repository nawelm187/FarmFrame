import { describe, expect, it } from "vitest";
import { execFileSync } from "node:child_process";
import { en } from "../i18n/en";
import { MENU_KEYS, MENU_TERMS } from "./menuTerms";
describe("menuTerms (search menu names, generated from the dictionaries)", () => {
  it("is in sync with src/i18n/*.ts (else run: node scripts/gen-menu-terms.mjs)", () => {
    expect(() => execFileSync(process.execPath, ["scripts/gen-menu-terms.mjs", "--check"], { stdio: "pipe" })).not.toThrow();
  });
  it("has all 8 languages and every key, with no empty text", () => {
    expect(Object.keys(MENU_TERMS).sort()).toEqual(["de", "es", "fr", "it", "ja", "pt", "ru", "zh"]);
    for (const c of Object.keys(MENU_TERMS)) for (const k of MENU_KEYS) expect(MENU_TERMS[c][k].length, `${c}.${k}`).toBeGreaterThan(0);
  });
  it("every key exists in the English dictionary", () => { for (const k of MENU_KEYS) expect(typeof en[k], k).toBe("string"); });
});
