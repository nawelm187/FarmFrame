import type { Rec, Status } from "./data";
/** "just now", "5 min ago", "3 h ago", "2 d ago", or "not retrieved". */
export function ago(at: number | null | undefined, now = Date.now()): string {
  if (at == null) return "not retrieved";
  const m = Math.floor(Math.max(0, now - at) / 60_000);
  return m < 1 ? "just now" : m < 60 ? `${m} min ago` : m < 1440 ? `${Math.floor(m / 60)} h ago` : `${Math.floor(m / 1440)} d ago`;
}
export interface Used { label: string; status: Status; rec?: Rec; /** Structural problems found in the data (see drift.ts). */ drift?: string[] }
/** What a recommendation was based on and how fresh it is. `warn` is set when any input is not fresh, so the user knows to double-check. */
export function trustLine(used: Used[], now = Date.now()): { lines: string[]; warn: string | null } {
  const lines = used.map(u => `${u.label}: ${u.status === "LOADING" ? "loading" : u.status === "FRESH" ? ago(u.rec?.at, now) : `${u.status.toLowerCase()}${u.rec?.at ? `, last retrieved ${ago(u.rec.at, now)}` : ""}`}`);
  const bad = used.filter(u => u.status !== "FRESH" && u.status !== "LOADING").map(u => u.label), odd = used.filter(u => u.drift?.length).map(u => u.label);
  const warn = [bad.length ? `${bad.join(" and ")} may be out of date, so double-check before acting.` : "", odd.length ? `${odd.join(" and ")} changed format, so some results may be missing or wrong.` : ""].filter(Boolean).join(" ");
  return { lines, warn: warn || null };
}
