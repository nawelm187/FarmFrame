import type { Snap } from "./cloud";
/** One row of public.user_state as the sync needs it. `updatedAt` is the string the server returned: it is the version token. */
export interface Row { data: Snap | null; updatedAt: string }
/** The few database operations the sync needs. CloudProvider adapts Supabase to this; tests use a fake. */
export interface Store {
  select(uid: string): Promise<Row | null>;
  insert(uid: string, data: Snap, at: string): Promise<{ duplicate: boolean }>;
  /** Updates only if the stored updated_at still equals `expected`. Returns the new token, or null when no row matched (someone else wrote first). */
  update(uid: string, data: Snap, at: string, expected: string): Promise<string | null>;
}
export type PushResult = { ok: true; updatedAt: string } | { ok: false; remote: Row | null };
/**
 * Writes this device's snapshot only if the cloud row is still the version this device last saw (`known`; null = this device saw no row).
 * If another device wrote in between, nothing is overwritten: the newer cloud row is returned so the person can choose (the existing conflict screen).
 * Uses the existing updated_at column as the version, so no SQL change is needed. It is optimistic concurrency, not a lock: two writes can still race
 * inside the database, but then only one matches `expected` and the other gets { ok: false }.
 */
export async function pushGuarded(store: Store, uid: string, snap: Snap, known: string | null, now = new Date()): Promise<PushResult> {
  const at = now.toISOString();
  if (known === null) {
    const { duplicate } = await store.insert(uid, snap, at);
    if (!duplicate) { const r = await store.select(uid); return { ok: true, updatedAt: r?.updatedAt ?? at }; }
    return { ok: false, remote: await store.select(uid) };
  }
  const next = await store.update(uid, snap, at, known);
  if (next !== null) return { ok: true, updatedAt: next };
  const remote = await store.select(uid);
  // The row is exactly the version we hold, yet the guarded update matched nothing: that is not a conflict, it is the version check itself failing
  // (for example the timestamp not round-tripping through the API). Say so loudly instead of showing a conflict the person cannot resolve.
  if (remote && remote.updatedAt === known) throw new Error("Sync version check failed although the cloud copy did not change. Nothing was overwritten.");
  return { ok: false, remote };
}
