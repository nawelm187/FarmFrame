#!/usr/bin/env node
// Attacks YOUR OWN Supabase project the way a stranger would, with only the public key, and says what is open.
// Usage: node tools/security-smoke.mjs https://YOUR-REF.supabase.co sb_publishable_xxx [https://your-site.example]
// It writes one small test report row (category "security-smoke") and nothing else; it never reads or changes anyone's data.
import { writeFileSync } from "node:fs";
const [URL_, KEY, SITE = "https://nawelm187.github.io"] = process.argv.slice(2);
if (!URL_ || !KEY) { console.error("usage: node tools/security-smoke.mjs <project url> <publishable key> [your site origin]"); process.exit(2); }
const out = []; let bad = 0, warn = 0;
const hdr = (o = {}) => ({ apikey: KEY, Authorization: `Bearer ${KEY}`, "content-type": "application/json", ...o });
const go = async (method, path, { headers = {}, body } = {}) => { try { const r = await fetch(URL_ + path, { method, headers: hdr(headers), body, signal: AbortSignal.timeout(15000) }); const t = await r.text(); return { s: r.status, t }; } catch (e) { return { s: 0, t: String(e.message) }; } };
const check = (name, ok, got) => { if (!ok) bad++; out.push(`${ok ? "OK  " : "FAIL"} ${name}  (got ${got})`); };
// A function that answers 404 is simply not deployed: reported as a warning, not as a hole.
const fnCheck = (name, r, ok) => { if (r.s === 404) { warn++; out.push(`WARN ${name}  (the function is not deployed: got 404)`); } else check(name, ok, r.s); };
const emptyOrDenied = r => r.s === 401 || r.s === 403 || (r.s === 200 && r.t.trim() === "[]");
const EVIL = "https://evil.example";
// Database through the public API
let r = await go("GET", "/rest/v1/user_state?select=*"); check("a stranger cannot read user_state", emptyOrDenied(r), r.s + " " + r.t.slice(0, 60));
r = await go("POST", "/rest/v1/user_state", { headers: { Prefer: "return=minimal" }, body: JSON.stringify({ user_id: "00000000-0000-0000-0000-000000000001", data: {} }) }); check("a stranger cannot write user_state", r.s === 401 || r.s === 403, r.s + " " + r.t.slice(0, 60));
r = await go("GET", "/rest/v1/data_reports?select=*"); check("a stranger cannot read the reports", emptyOrDenied(r), r.s + " " + r.t.slice(0, 60));
r = await go("GET", "/rest/v1/ai_usage?select=*"); check("a stranger cannot read the AI quota table", emptyOrDenied(r) || r.s === 404, r.s + " " + r.t.slice(0, 60));
r = await go("POST", "/rest/v1/rpc/ai_take", { body: JSON.stringify({ p_user: "00000000-0000-0000-0000-000000000001", p_user_max: 999999, p_global_max: 999999 }) }); check("a stranger cannot call the quota function", r.s === 401 || r.s === 403 || r.s === 404, r.s + " " + r.t.slice(0, 60));
r = await go("POST", "/rest/v1/data_reports", { headers: { Prefer: "return=minimal" }, body: JSON.stringify({ category: "security-smoke", page: "/test", note: "x".repeat(501) }) }); check("an oversized report is refused", r.s >= 400 && r.s < 500, r.s);
r = await go("POST", "/rest/v1/data_reports", { headers: { Prefer: "return=minimal" }, body: JSON.stringify({ category: "security-smoke", page: "/test", note: "automatic check, safe to delete" }) }); check("a normal report is accepted", r.s === 201, r.s + " " + r.t.slice(0, 60));
// Account functions and internal tables: closed to strangers. heartbeat is the one function a stranger may call.
for (const fn of ["my_account_state", "request_account_deletion", "restore_account", "erase_my_account", "admin_stats", "purge_due_accounts", "account_active"]) { r = await go("POST", `/rest/v1/rpc/${fn}`, { body: JSON.stringify(fn === "request_account_deletion" || fn === "erase_my_account" ? { p_confirm: "x@y.z" } : fn === "account_active" ? { p_uid: "00000000-0000-0000-0000-000000000001" } : {}) }); check(`a stranger cannot call ${fn}`, r.s === 401 || r.s === 403 || r.s === 404, r.s + " " + r.t.slice(0, 50)); }
for (const tb of ["presence", "account_events", "account_status", "admins", "daily_peak"]) { r = await go("GET", `/rest/v1/${tb}?select=*`); check(`a stranger cannot read ${tb}`, emptyOrDenied(r) || r.s === 404, r.s + " " + r.t.slice(0, 50)); }
r = await go("POST", "/rest/v1/rpc/heartbeat", { body: JSON.stringify({ p_session: "00000000-0000-0000-0000-00000000beef" }) }); check("a stranger can send the visitor heartbeat", r.s === 200 || r.s === 204, r.s);
r = await go("POST", "/rest/v1/rpc/heartbeat", { body: JSON.stringify({ p_session: "not-a-uuid" }) }); check("a malformed heartbeat is refused", r.s >= 400 && r.s < 500, r.s);
// Functions
for (const f of ["market?slug=serration", "worldstate"]) { r = await go("GET", `/functions/v1/${f}`, { headers: { Origin: EVIL } }); fnCheck(`${f.split("?")[0]} refuses a foreign website`, r, r.s === 403 || r.s === 401); }
r = await go("GET", "/functions/v1/market?slug=../../etc/passwd"); fnCheck("market refuses a path in the slug", r, r.s === 400);
r = await go("GET", "/functions/v1/market?slug=serration", { headers: { Origin: SITE } }); fnCheck("market answers your own site", r, [200, 429, 502].includes(r.s));
for (const f of ["build-analysis"]) {
  r = await go("POST", `/functions/v1/${f}`, { headers: { Authorization: `Bearer ${KEY}` }, body: JSON.stringify({ build: { a: 1 } }) }); check(`${f} refuses a request without a signed-in user`, r.s === 401, r.s + " " + r.t.slice(0, 50));
  r = await go("POST", `/functions/v1/${f}`, { headers: { Origin: EVIL, Authorization: `Bearer ${KEY}` }, body: "{}" }); check(`${f} refuses a foreign website`, r.s === 401 || r.s === 403, r.s);
}
const text = `Security smoke test ${new Date().toISOString()}\n${URL_}\n\n${out.join("\n")}\n\n${bad ? bad + " check(s) FAILED: something is open that should be closed or an old version is deployed. Send me this file." : warn ? "No holes found, but " + warn + " function(s) are not deployed." : "All checks passed."}\n`;
writeFileSync("reporte-seguridad.txt", text); console.log(text); process.exit(bad ? 1 : 0);
