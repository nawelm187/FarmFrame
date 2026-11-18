import { CLOUD_CONFIGURED, SUPABASE_KEY, SUPABASE_URL } from "./config";
/** Tells the server this tab is open, once a minute while it is visible, so the owner can see how many people are online.
 *  What it sends: a random id made for this tab (kept only in sessionStorage, gone when the tab closes). No account, no cookie, no IP stored.
 *  It does nothing when the browser says Do Not Track, or when the cloud is not configured. */
export function startPresence(): () => void {
  if (!CLOUD_CONFIGURED || typeof document === "undefined" || (navigator as Navigator & { doNotTrack?: string | null }).doNotTrack === "1") return () => {};
  let id = "";
  try { id = sessionStorage.getItem("ff.tab") ?? ""; if (!id) { id = crypto.randomUUID(); sessionStorage.setItem("ff.tab", id); } } catch { id = crypto.randomUUID(); }
  const beat = () => { if (document.visibilityState !== "visible") return; void fetch(`${SUPABASE_URL}/rest/v1/rpc/heartbeat`, { method: "POST", headers: { apikey: SUPABASE_KEY, "content-type": "application/json" }, body: JSON.stringify({ p_session: id }), keepalive: true }).catch(() => {}); };
  beat(); const t = setInterval(beat, 60_000); document.addEventListener("visibilitychange", beat);
  return () => { clearInterval(t); document.removeEventListener("visibilitychange", beat); };
}
