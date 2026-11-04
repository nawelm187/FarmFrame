import { isEmpty, same, type Snap } from "./cloud";
/** Local-storage key that remembers which account the data on this device was last synced with. Not part of KEYS, so it is never uploaded. */
export const OWNER_KEY = "ff.owner";
export type SyncAction = "push-local" | "apply-cloud" | "noop" | "conflict" | "replace-foreign-with-cloud" | "drop-foreign-local";
/**
 * Decides what to do right after signing in, before anything is written.
 * `owner` is the account the device data was last synced with (null when it was never tied to an account: guest data).
 * Data tied to ANOTHER account is never uploaded to this one: it is replaced by this account's cloud data, or dropped when the cloud is empty.
 * Guest data (owner null) keeps the original behaviour: it is adopted by the account, or shown as a conflict when both sides differ.
 */
export function decideSync(o: { uid: string; owner: string | null; local: Snap; cloud: Snap | null }): SyncAction {
  const cloudEmpty = !o.cloud || isEmpty(o.cloud), localEmpty = isEmpty(o.local);
  if (!localEmpty && o.owner !== null && o.owner !== o.uid) return cloudEmpty ? "drop-foreign-local" : "replace-foreign-with-cloud";
  if (cloudEmpty) return localEmpty ? "noop" : "push-local";
  if (localEmpty) return "apply-cloud";
  return same(o.local, o.cloud!) ? "noop" : "conflict";
}
export const readOwner = (): string | null => { try { return localStorage.getItem(OWNER_KEY); } catch { return null; } };
export const claimOwner = (uid: string) => { try { localStorage.setItem(OWNER_KEY, uid); } catch { /* storage unavailable: the next sign-in treats the data as guest data */ } };
