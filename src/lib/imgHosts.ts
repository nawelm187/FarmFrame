/** Where item pictures are loaded from, in order of preference. The first choice is a real CDN with long caching (jsDelivr serves the same GitHub files);
 *  the raw GitHub address is only the last resort because it has short caching and is slow and rate-limited under many requests.
 *  A host that keeps failing without ever succeeding in this visit is skipped, so a host that does not serve these files costs a few failed requests, not a slow page. */
export interface ImgHost { id: string; base: string }
export const IMG_HOSTS: ImgHost[] = [
  { id: "jsdelivr", base: "https://cdn.jsdelivr.net/gh/WFCD/warframe-items@master/data/img/" },
  { id: "cdn", base: "https://cdn.warframestat.us/img/" },
  { id: "github", base: "https://raw.githubusercontent.com/WFCD/warframe-items/master/data/img/" },
];
export type Tally = Record<string, { ok: number; bad: number }>;
let tally: Tally = {};
const KEY = "ff.imgtally";
try { const s = JSON.parse(sessionStorage.getItem(KEY) ?? "{}"); if (s && typeof s === "object") tally = s as Tally; } catch { /* storage may be blocked */ }
/** Down = at least 5 failures and more than three times as many failures as successes during this visit. */
export const hostDown = (id: string, t: Tally = tally) => { const x = t[id]; return !!x && x.bad >= 5 && x.bad > 3 * x.ok; };
export function orderedHosts(t: Tally = tally): ImgHost[] { const up = IMG_HOSTS.filter(h => !hostDown(h.id, t)); return up.length ? up : IMG_HOSTS; }
export const imgUrl = (file: string) => orderedHosts()[0].base + encodeURIComponent(file);
export const imgCdn = (file: string) => IMG_HOSTS[1].base + encodeURIComponent(file);
export const hostOf = (src: string) => IMG_HOSTS.find(h => src.startsWith(h.base));
export const fileOf = (src: string) => { try { return decodeURIComponent(src.split("?")[0].split("/").pop() ?? ""); } catch { return ""; } };
/** Next address to try after `tried` host ids have failed, or null when every host was tried. */
export function nextSrc(file: string, tried: string[], t: Tally = tally): string | null {
  const h = [...orderedHosts(t), ...IMG_HOSTS].find(x => !tried.includes(x.id)); return h ? h.base + encodeURIComponent(file) : null;
}
/** For an <img onError>: moves to the next host once per failed host and returns true; false when nothing is left to try. */
export function imgRetry(ev: { currentTarget: HTMLImageElement }): boolean {
  const el = ev.currentTarget, file = fileOf(el.src); if (!file) return false;
  let tried = el.dataset.triedFile === file ? (el.dataset.tried ?? "").split(",").filter(Boolean) : [];
  const cur = hostOf(el.src); if (cur && !tried.includes(cur.id)) tried = [...tried, cur.id];
  const n = nextSrc(file, tried); if (!n) return false;
  el.dataset.triedFile = file; el.dataset.tried = tried.join(","); el.src = n; return true;
}
export function record(src: string, ok: boolean) {
  const h = hostOf(src); if (!h) return;
  const x = tally[h.id] ??= { ok: 0, bad: 0 }; if (ok) x.ok++; else x.bad++;
  try { sessionStorage.setItem(KEY, JSON.stringify(tally)); } catch { /* ignore */ }
}
/** Counts every picture load and failure on the page (these events do not bubble, so they are caught on the way down). Call once at start. */
export function trackImages(w: Window = window) {
  const on = (ok: boolean) => (e: Event) => { const t = e.target as { tagName?: string; currentSrc?: string; src?: string } | null; if (t && t.tagName === "IMG") record(t.currentSrc || t.src || "", ok); };
  w.addEventListener("load", on(true), true); w.addEventListener("error", on(false), true);
}
export const resetTally = () => { tally = {}; };
