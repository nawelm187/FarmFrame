import type { Rec, Status } from "./data";
import { curLang, t } from "../i18n";
import { ST } from "./statusKey";
/** "just now", "5 min ago", "3 h ago", "2 d ago", or "not retrieved". */
export function ago(at: number | null | undefined, now = Date.now()): string {
  if (at == null) return t("agoNever");
  const m = Math.floor(Math.max(0, now - at) / 60_000);
  return m < 1 ? t("agoNow") : m < 60 ? t("agoMin", { m }) : m < 1440 ? t("agoH", { h: Math.floor(m / 60) }) : t("agoD", { d: Math.floor(m / 1440) });
}
export interface Used { label: string; status: Status; rec?: Rec; /** Structural problems found in the data (see drift.ts). */ drift?: string[] }
/** What a recommendation was based on and how fresh it is. `warn` is set when any input is not fresh, so the user knows to double-check. */
export function trustLine(used: Used[], now = Date.now()): { lines: string[]; warn: string | null } {
  const lines = used.map(u => `${u.label}: ${u.status === "LOADING" ? t(ST.LOADING).toLowerCase() : u.status === "FRESH" ? `${ago(u.rec?.at, now)}${u.rec?.via === "cache" ? " " + t("frCache") : ""}` : `${t(ST[u.status]).toLowerCase()}${u.rec?.at ? t("frLast", { ago: ago(u.rec.at, now) }) : ""}`}`);
  const bad = used.filter(u => u.status !== "FRESH" && u.status !== "LOADING").map(u => u.label), odd = used.filter(u => u.drift?.length).map(u => u.label);
  const and = (a: string[]) => new Intl.ListFormat(curLang(), { type: "conjunction" }).format(a);
  const warn = [bad.length ? t("frStale", { list: and(bad) }) : "", odd.length ? t("frDrift", { list: and(odd) }) : ""].filter(Boolean).join(" ");
  return { lines, warn: warn || null };
}
/** The line under a panel: when its data was retrieved. A time of day alone is not enough (data from yesterday looked like today's), so another day shows the date too, and a copy read from the device cache says so. */
export function provLine(rec: Rec | undefined, now = Date.now()): string {
  const err = rec?.err ? " · " + rec.err : "";
  if (!rec?.at) return t("provNot") + err;
  const d = new Date(rec.at), same = new Date(now).toDateString() === d.toDateString();
  const loc = curLang() === "en" ? undefined : curLang();
  return t("provRetrieved", { when: same ? d.toLocaleTimeString(loc) : d.toLocaleString(loc) }) + (rec.via === "cache" ? " · " + t("provCache") : "") + err;
}
