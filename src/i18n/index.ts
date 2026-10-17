import { useSyncExternalStore } from "react";
import { en, type Dict, type Key, type PluralKey } from "./en";
export type { Key, PluralKey } from "./en";
export interface Lang { code: string; name: string; /** Absent for English: it ships with the app, every other dictionary is a separate file fetched only when chosen. */ load?: () => Promise<{ default: Dict }> }
export const LANGS: readonly Lang[] = [
  { code: "en", name: "English" },
  { code: "es", name: "Español", load: () => import("./es") },
  { code: "pt", name: "Português (Brasil)", load: () => import("./pt") },
  { code: "fr", name: "Français", load: () => import("./fr") },
  { code: "de", name: "Deutsch", load: () => import("./de") },
  { code: "it", name: "Italiano", load: () => import("./it") },
  { code: "ru", name: "Русский", load: () => import("./ru") },
  { code: "zh", name: "中文 (简体)", load: () => import("./zh") },
  { code: "ja", name: "日本語", load: () => import("./ja") },
];
const STORE = "ff.lang", HTML_LANG: Record<string, string> = { zh: "zh-Hans" };
/** The saved choice if it is one we have; else the first browser language we have ("es-AR" -> es, "pt-PT" -> pt); else English. */
export function pickLang(saved: string | null, browser: readonly string[]): string {
  const has = (c: string) => LANGS.some(l => l.code === c);
  if (saved && has(saved)) return saved;
  for (const b of browser) { const base = b.toLowerCase().split("-")[0]; if (has(base)) return base; }
  return "en";
}
/** Replaces {name} placeholders. A placeholder with no value is left as written so a mistake is visible, not silent. */
export const fill = (s: string, v?: Record<string, string | number>) => (v ? s.replace(/\{(\w+)\}/g, (m, k: string) => (k in v ? String(v[k]) : m)) : s);
let code = "en", dict: Dict = en; const subs = new Set<() => void>();
/** Text for a key in the current language; a key missing from a dictionary falls back to English instead of showing blank. */
export const t = (k: Key, v?: Record<string, string | number>) => fill(dict[k] || en[k], v);
/** Text for a count in the right plural form of the current language ("1 relic", "2 relics"; Russian has three forms, Chinese and Japanese one). {n} is filled in. */
export function tp(k: PluralKey, n: number, v?: Record<string, string | number>) {
  const form = new Intl.PluralRules(code).select(n), d = dict as Record<string, string | undefined>, e = en as Record<string, string>;
  return fill(d[`${k}_${form}`] || d[`${k}_other`] || e[`${k}_${form}`] || e[`${k}_other`], { n, ...v });
}
/** Switches language (loading its dictionary first, so there is never a half-translated flash), remembers it and tells the page. */
export async function setLang(c: string): Promise<void> {
  const l = LANGS.find(x => x.code === c); if (!l || c === code) return;
  try { dict = l.load ? (await l.load()).default : en; } catch { return; } // offline or file missing: stay as we are
  code = c; try { localStorage.setItem(STORE, c); } catch { /* private mode: the choice just is not remembered */ }
  document.documentElement.lang = HTML_LANG[c] ?? c; subs.forEach(f => f());
}
export function initLang(): Promise<void> {
  let saved: string | null = null; try { saved = localStorage.getItem(STORE); } catch { /* ignore */ }
  return setLang(pickLang(saved, navigator.languages?.length ? navigator.languages : [navigator.language]));
}
const sub = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };
/** Re-renders the component when the language changes. Use as `const t = useT()`. */
export function useT() { useSyncExternalStore(sub, () => code); return t; }
export const useLang = () => useSyncExternalStore(sub, () => code);
