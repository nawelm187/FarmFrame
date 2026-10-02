import { useEffect, useSyncExternalStore } from "react";
import { cget, cset } from "./idb";
export type Status = "FRESH" | "STALE" | "UNAVAILABLE" | "ERROR" | "LOADING";
export interface Rec { id: string; data: unknown; at: number | null; err: string | null; url: string; window: number; src: string }
export const API = "https://api.warframestat.us/pc/";
export const WS_WINDOW = 150_000;
const reqs = new Map<string, { url: string; window: number; src: string; alt?: string }>(), recs = new Map<string, Rec>(), loading = new Set<string>(), subs = new Set<() => void>();
let ver = 0;
const emit = () => { ver++; subs.forEach(f => f()); };
const subscribe = (f: () => void) => { subs.add(f); return () => { subs.delete(f); }; };

export async function load(id: string, url: string, window: number, src: string, minGap = 30_000, alt?: string) {
  const r = recs.get(id);
  if (loading.has(id) || (r?.at && Date.now() - r.at < minGap)) return;
  reqs.set(id, { url, window, src, alt }); loading.add(id); emit();
  const c = new AbortController(), t = setTimeout(() => c.abort(), 45_000);
  let cached: { data: unknown; at: number; url: string } | undefined;
  const persist = window >= 3_600_000;
  try {
    if (persist && !r?.data) { cached = await cget(`v2:${id}`); if (cached && Date.now() - cached.at < window) { recs.set(id, { id, data: cached.data, at: cached.at, err: null, url: cached.url, window, src }); return; } }
    const get = async (u: string) => { const res = await fetch(u, { signal: c.signal }); if (!res.ok) throw new Error("HTTP " + res.status); return (await res.json()) as unknown; };
    let used = url, data: unknown;
    try { data = await get(url); } catch (e) { if (!alt) throw e; used = alt; data = await get(alt); }
    const at = Date.now();
    recs.set(id, { id, data, at, err: null, url: used, window, src });
    if (persist) setTimeout(() => void cset(`v2:${id}`, { data, at, url: used }), 800);
  } catch (e) {
    const msg = e instanceof Error && e.name === "AbortError" ? "timeout" : String(e instanceof Error ? e.message : e);
    recs.set(id, { id, data: r?.data ?? cached?.data ?? null, at: r?.at ?? cached?.at ?? null, err: msg + " (network, CORS or service down)", url, window, src });
  } finally { clearTimeout(t); loading.delete(id); emit(); }
}
/** Re-requests a dataset now, ignoring the freshness gap. */
export const retry = (id: string) => { const q = reqs.get(id); if (q) void load(id, q.url, q.window, q.src, 0, q.alt); };
export function statusOf(r: Rec | undefined, isLoading: boolean, now = Date.now()): Status {
  if (!r) return isLoading ? "LOADING" : "UNAVAILABLE";
  if (r.data == null) return r.err ? "ERROR" : "UNAVAILABLE";
  if (r.err) return "STALE";
  return r.at !== null && now - r.at > r.window ? "STALE" : "FRESH";
}
/** Loads a live dataset, refreshes every 60s, exposes status + provenance. Never fabricates data. */
export function useWorld<T>(key: string, guard: (d: unknown) => d is T) {
  useSyncExternalStore(subscribe, () => ver);
  useEffect(() => {
    const go = () => void load(key, API + key, WS_WINDOW, "WarframeStat API (community, unofficial)");
    go(); const i = setInterval(go, 60_000); return () => clearInterval(i);
  }, [key]);
  const r = recs.get(key);
  return { data: r && guard(r.data) ? r.data : null, status: statusOf(r, loading.has(key)), rec: r };
}
/** Re-requests a dataset shortly after a known end time (cached upstream data often lags), so expired panels fix themselves. */
export function useRefreshAt(key: string, at: number | null) {
  useEffect(() => {
    if (at == null || !Number.isFinite(at)) return;
    const wait = Math.max(at - Date.now(), 0) + 4000; if (wait > 6 * 3_600_000) return;
    const t = setTimeout(() => retry(key), wait); return () => clearTimeout(t);
  }, [key, at]);
}
export const allRecs = () => [...recs.entries()];
const tickSubs = new Set<() => void>();
let tickTimer: ReturnType<typeof setInterval> | undefined;
function subTick(f: () => void) {
  tickSubs.add(f); if (!tickTimer) tickTimer = setInterval(() => tickSubs.forEach(x => x()), 1000);
  return () => { tickSubs.delete(f); if (!tickSubs.size && tickTimer) { clearInterval(tickTimer); tickTimer = undefined; } };
}
/** One shared timer drives every countdown on the page. */
export function useNow(ms = 1000) {
  const s = useSyncExternalStore(subTick, () => Math.floor(Date.now() / ms));
  return s * ms;
}

export const DROPS = "https://drops.warframestat.us/data/";
export const DAY = 86_400_000;
export interface Item { id: string; file: string; url?: string; src?: string; alt?: string; win?: number }
/** Loads official drop-table datasets once (24h window). */
export function useMany(items: Item[]) {
  useSyncExternalStore(subscribe, () => ver);
  const key = items.map(i => i.id).join();
  useEffect(() => { items.forEach(i => void load(i.id, i.url ?? DROPS + i.file, i.win ?? DAY, i.src ?? "Digital Extremes drop tables via WFCD/warframe-drop-data", i.win ?? DAY, i.alt)); }, [key]); // eslint-disable-line react-hooks/exhaustive-deps
  return items.map(i => { const rec = recs.get(i.id); return { rec, status: statusOf(rec, loading.has(i.id)) }; });
}
