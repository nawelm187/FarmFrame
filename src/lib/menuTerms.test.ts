import { describe, expect, it } from "vitest";
import de from "../i18n/de";
import es from "../i18n/es";
import fr from "../i18n/fr";
import it_ from "../i18n/it";
import ja from "../i18n/ja";
import pt from "../i18n/pt";
import ru from "../i18n/ru";
import zh from "../i18n/zh";
import { en } from "../i18n/en";
import { MENU_KEYS, MENU_TERMS } from "./menuTerms";
const DICTS: Record<string, Record<string, string>> = { de, es, fr, it: it_, ja, pt, ru, zh };
describe("menuTerms (search menu names, generated from the dictionaries)", () => {
  it("is in sync with src/i18n/*.ts (else run: node scripts/gen-menu-terms.mjs)", () => {
    for (const c of Object.keys(DICTS)) for (const k of MENU_KEYS) expect(MENU_TERMS[c][k], `${c}.${k}`).toBe(DICTS[c][k]);
  });
  it("has all 8 languages and every key, with no empty text", () => {
    expect(Object.keys(MENU_TERMS).sort()).toEqual(["de", "es", "fr", "it", "ja", "pt", "ru", "zh"]);
    for (const c of Object.keys(MENU_TERMS)) for (const k of MENU_KEYS) expect(MENU_TERMS[c][k].length, `${c}.${k}`).toBeGreaterThan(0);
  });
  it("every key exists in the English dictionary", () => { for (const k of MENU_KEYS) expect(typeof en[k], k).toBe("string"); });
});
