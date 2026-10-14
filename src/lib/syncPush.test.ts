import { expect, it } from "vitest";
import type { Snap } from "./cloud";
import { pushGuarded, type Row, type Store } from "./syncPush";
// Fake server: one row per uid, version = a counter string, like the real updated_at is a token that changes on every write.
function fake() {
  const rows = new Map<string, Row>(); let n = 0; const calls: string[] = [];
  const store: Store = {
    select: async uid => { calls.push("select"); return rows.get(uid) ?? null; },
    insert: async (uid, data) => { calls.push("insert"); if (rows.has(uid)) return { duplicate: true }; rows.set(uid, { data, updatedAt: "v" + ++n }); return { duplicate: false }; },
    update: async (uid, data, _at, expected) => { calls.push("update"); const r = rows.get(uid); if (!r || r.updatedAt !== expected) return null; const row = { data, updatedAt: "v" + ++n }; rows.set(uid, row); return row.updatedAt; },
  };
  return { rows, store, calls };
}
const A: Snap = { "ff.goals": [{ id: "a" }] }, B: Snap = { "ff.goals": [{ id: "b" }] }, C: Snap = { "ff.goals": [{ id: "c" }] };
it("first write inserts and returns the server's version", async () => {
  const f = fake(); const r = await pushGuarded(f.store, "u", A, null);
  expect(r).toEqual({ ok: true, updatedAt: "v1" }); expect(f.rows.get("u")?.data).toEqual(A);
});
it("a write with the version this device saw succeeds and advances the version", async () => {
  const f = fake(); await pushGuarded(f.store, "u", A, null);
  const r = await pushGuarded(f.store, "u", B, "v1"); expect(r).toEqual({ ok: true, updatedAt: "v2" }); expect(f.rows.get("u")?.data).toEqual(B);
});
it("a device with an old version cannot overwrite a newer cloud row", async () => {
  const f = fake(); await pushGuarded(f.store, "u", A, null);      // device 1 and 2 both know v1
  await pushGuarded(f.store, "u", B, "v1");                          // device 1 writes: v2
  const r = await pushGuarded(f.store, "u", C, "v1");                // device 2 tries with v1
  expect(r.ok).toBe(false); if (!r.ok) expect(r.remote).toEqual({ data: B, updatedAt: "v2" });
  expect(f.rows.get("u")?.data).toEqual(B);                          // nothing was overwritten
});
it("two devices that both think there is no row: the second insert is a conflict, not an overwrite", async () => {
  const f = fake(); await pushGuarded(f.store, "u", A, null);
  const r = await pushGuarded(f.store, "u", B, null);
  expect(r.ok).toBe(false); if (!r.ok) expect(r.remote?.data).toEqual(A); expect(f.rows.get("u")?.data).toEqual(A);
});
it("after the person picks this device's data, writing with the refreshed version works", async () => {
  const f = fake(); await pushGuarded(f.store, "u", A, null); await pushGuarded(f.store, "u", B, "v1");
  const lost = await pushGuarded(f.store, "u", C, "v1"); expect(lost.ok).toBe(false);
  const ok = await pushGuarded(f.store, "u", C, lost.ok ? "" : lost.remote!.updatedAt); expect(ok).toEqual({ ok: true, updatedAt: "v3" });
});
it("a row that was deleted meanwhile is reported as a conflict with remote null", async () => {
  const f = fake(); await pushGuarded(f.store, "u", A, null); f.rows.delete("u");
  const r = await pushGuarded(f.store, "u", B, "v1"); expect(r).toEqual({ ok: false, remote: null });
});
it("accounts are isolated by uid in the store contract", async () => {
  const f = fake(); await pushGuarded(f.store, "u1", A, null); const r = await pushGuarded(f.store, "u2", B, null);
  expect(r.ok).toBe(true); expect(f.rows.get("u1")?.data).toEqual(A);
});
it("an unchanged row whose guarded update matches nothing is an error, not a fake conflict", async () => {
  const f = fake(); await pushGuarded(f.store, "u", A, null);
  const broken: Store = { ...f.store, update: async () => null };
  let msg = ""; try { await pushGuarded(broken, "u", B, "v1"); } catch (e) { msg = (e as Error).message; }
  expect(msg).toContain("version check failed"); expect(f.rows.get("u")?.data).toEqual(A);
});
