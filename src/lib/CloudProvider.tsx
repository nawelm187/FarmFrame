import { authMessage } from "./authMsg";
import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { applySnap, fingerprint, snapshot, type Snap } from "./cloud";
import { claimOwner, decideSync, readOwner } from "./syncGuard";
import { pushGuarded, type Store } from "./syncPush";
import { t } from "../i18n";
export interface AdminStats { active_now: number; accounts_total: number; accounts_pending_deletion: number; created_since_install: number; events_by_day: { day: string; kind: string; n: number }[]; peak_by_day: { day: string; peak: number }[] }
export type SyncState = "off" | "checking" | "conflict" | "synced" | "error";
interface Ctx { email: string | null; ready: boolean; sync: SyncState; err: string | null; signIn: (e: string, p: string) => Promise<string | null>; signUp: (e: string, p: string) => Promise<string | null>; signInLink: (e: string) => Promise<string | null>; resetPassword: (e: string) => Promise<string | null>; setPassword: (p: string) => Promise<string | null>; recovery: boolean; signOut: () => Promise<void>; pending: string | null; requestDeletion: (confirmEmail: string) => Promise<string | null>; eraseNow: (confirmEmail: string) => Promise<string | null>; restoreAccount: () => Promise<string | null>; adminStats: () => Promise<{ ok: true; data: AdminStats } | { ok: false; reason: "denied" | "error" }>; resolve: (c: "cloud" | "device") => Promise<void>; retry: () => void }
const C = createContext<Ctx | null>(null);
export const useCloud = () => { const c = useContext(C); if (!c) throw new Error("CloudProvider missing"); return c; };
const sb = async () => (await import("./supabase")).supabase;
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));
// Supabase adapter for the guarded write in syncPush.ts. The version token is the row's updated_at exactly as the server returned it.
async function store(): Promise<Store> {
  const c = await sb();
  return {
    select: async uid => {
      const { data, error } = await c.from("user_state").select("data,updated_at").eq("user_id", uid).maybeSingle();
      if (error) throw new Error(error.message);
      return data ? { data: (data.data ?? null) as Snap | null, updatedAt: String(data.updated_at) } : null;
    },
    insert: async (uid, data, at) => {
      const { error } = await c.from("user_state").insert({ user_id: uid, data, updated_at: at });
      if (error) { if (error.code === "23505") return { duplicate: true }; throw new Error(error.message); }
      return { duplicate: false };
    },
    update: async (uid, data, at, expected) => {
      const { data: rows, error } = await c.from("user_state").update({ data, updated_at: at }).eq("user_id", uid).eq("updated_at", expected).select("updated_at");
      if (error) throw new Error(error.message);
      return rows && rows.length ? String(rows[0].updated_at) : null;
    },
  };
}
export function CloudProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null), [ready, setReady] = useState(false), [recovery, setRecovery] = useState(false);
  const [sync, setSync] = useState<SyncState>("off"), [err, setErr] = useState<string | null>(null), [tick, setTick] = useState(0), [pending, setPending] = useState<string | null>(null);
  const remote = useRef<Snap | null>(null), last = useRef(""), known = useRef<string | null>(null);
  // Writes only if the cloud copy is still the version this device last saw. On a newer cloud copy it overwrites nothing and opens the conflict screen.
  const write = async (id: string, s: Snap): Promise<boolean> => {
    const r = await pushGuarded(await store(), id, s, known.current);
    if (r.ok) { known.current = r.updatedAt; return true; }
    known.current = r.remote?.updatedAt ?? null; remote.current = r.remote?.data ?? null; setSync("conflict"); return false;
  };
  const uid = session?.user.id;
  useEffect(() => {
    let off = () => {}, dead = false;
    void sb().then(supabase => {
      if (dead) return;
      void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
      const { data } = supabase.auth.onAuthStateChange((e, s) => { setSession(s); setReady(true); if (e === "PASSWORD_RECOVERY") { setRecovery(true); location.hash = "#/profile"; } });
      off = () => data.subscription.unsubscribe();
    });
    return () => { dead = true; off(); };
  }, []);
  useEffect(() => {
    if (!uid) { setSync("off"); return; }
    let dead = false; setSync("checking"); setErr(null);
    void (async () => {
      try {
        // An account scheduled for deletion is closed: sync stays off until it is restored. If the server has no lifecycle functions yet, carry on as before.
        const st = await (await sb()).rpc("my_account_state"), info = st.error ? null : (st.data as { deleted?: boolean; purge_at?: string } | null);
        if (dead) return;
        if (info?.deleted) { setPending(String(info.purge_at)); setSync("off"); return; }
        setPending(null);
        const row = await (await store()).select(uid);
        if (dead) return;
        known.current = row?.updatedAt ?? null;
        const local = snapshot(), cloud = row?.data ?? null;
        const act = decideSync({ uid, owner: readOwner(), local, cloud });
        if (act === "push-local") { if (await write(uid, local)) { claimOwner(uid); last.current = fingerprint(local); setSync("synced"); } }
        else if (act === "noop") { claimOwner(uid); last.current = fingerprint(local); setSync("synced"); }
        else if (act === "apply-cloud" || act === "replace-foreign-with-cloud") { applySnap(cloud ?? {}, act === "replace-foreign-with-cloud"); claimOwner(uid); last.current = fingerprint(cloud ?? {}); setSync("synced"); location.reload(); }
        else if (act === "drop-foreign-local") { applySnap({}, true); claimOwner(uid); last.current = fingerprint({}); setSync("synced"); location.reload(); }
        else { remote.current = cloud; setSync("conflict"); }
      } catch (e) { if (!dead) { setErr(msg(e)); setSync("error"); } }
    })();
    return () => { dead = true; };
  }, [uid, tick]);
  useEffect(() => {
    if (!uid || sync !== "synced") return;
    const t = setInterval(() => {
      const s = snapshot(), f = fingerprint(s);
      if (f === last.current) return;
      write(uid, s).then(ok => { if (ok) last.current = f; }).catch(e => { setErr(msg(e)); setSync("error"); });
    }, 4000);
    return () => clearInterval(t);
  }, [uid, sync]);
  const value: Ctx = {
    email: session?.user.email ?? null, ready, sync, err, retry: () => setTick(t => t + 1),
    signIn: async (email, password) => { const { error } = await (await sb()).auth.signInWithPassword({ email, password }); return error ? authMessage(error.message) : null; },
    signUp: async (email, password) => { const { data, error } = await (await sb()).auth.signUp({ email, password }); return error ? authMessage(error.message) : data.session ? null : t("amConfirmMail"); },
    // Passwordless sign-in: Supabase emails a one-time link. Works for new and existing accounts.
    signInLink: async email => { const { error } = await (await sb()).auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } }); return error ? error.message : t("amLinkSent"); },
    // A person who only ever used the email link has no password. This sends a link that lets them choose one.
    resetPassword: async email => { const { error } = await (await sb()).auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }); return error ? authMessage(error.message) : t("amResetSent"); },
    setPassword: async pw => { const { error } = await (await sb()).auth.updateUser({ password: pw }); if (!error) setRecovery(false); return error ? authMessage(error.message) : null; },
    recovery,
    signOut: async () => { await (await sb()).auth.signOut(); },
    // Schedules deletion in 30 days. The server checks the token and the typed email; until the date the account can be restored. Data on this device stays.
    requestDeletion: async confirmEmail => { try { const c = await sb(), { error } = await c.rpc("request_account_deletion", { p_confirm: confirmEmail }); if (error) return t("amDeleteFail"); await c.auth.signOut().catch(() => {}); return null; } catch { return t("amDeleteFail"); } },
    // Erases the account at once and for good.
    eraseNow: async confirmEmail => { try { const c = await sb(), { error } = await c.rpc("erase_my_account", { p_confirm: confirmEmail }); if (error) return t("amDeleteFail"); await c.auth.signOut().catch(() => {}); return null; } catch { return t("amDeleteFail"); } },
    restoreAccount: async () => { try { const { data, error } = await (await sb()).rpc("restore_account"); if (error || data !== true) return t("prRestoreFail"); setPending(null); setTick(x => x + 1); return null; } catch { return t("prRestoreFail"); } },
    adminStats: async () => { try { const { data, error, status } = await (await sb()).rpc("admin_stats"); if (error) return { ok: false as const, reason: status === 401 || status === 403 ? "denied" as const : "error" as const }; return { ok: true as const, data: data as AdminStats }; } catch { return { ok: false as const, reason: "error" as const }; } },
    pending,
    resolve: async c => {
      if (!uid) return;
      try {
        if (c === "cloud" && remote.current) { applySnap(remote.current); claimOwner(uid); last.current = fingerprint(remote.current); setSync("synced"); location.reload(); }
        else { const s = snapshot(); if (await write(uid, s)) { claimOwner(uid); last.current = fingerprint(s); setSync("synced"); } }
      } catch (e) { setErr(msg(e)); setSync("error"); }
    },
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
