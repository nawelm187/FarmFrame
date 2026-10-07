import { authMessage } from "./authMsg";
import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { applySnap, fingerprint, isEmpty, same, snapshot, type Snap } from "./cloud";
export type SyncState = "off" | "checking" | "conflict" | "synced" | "error";
interface Ctx { email: string | null; ready: boolean; sync: SyncState; err: string | null; signIn: (e: string, p: string) => Promise<string | null>; signUp: (e: string, p: string) => Promise<string | null>; signInLink: (e: string) => Promise<string | null>; resetPassword: (e: string) => Promise<string | null>; setPassword: (p: string) => Promise<string | null>; recovery: boolean; signOut: () => Promise<void>; resolve: (c: "cloud" | "device") => Promise<void>; retry: () => void }
const C = createContext<Ctx | null>(null);
export const useCloud = () => { const c = useContext(C); if (!c) throw new Error("CloudProvider missing"); return c; };
const sb = async () => (await import("./supabase")).supabase;
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));
async function push(uid: string, snap: Snap) {
  const { error } = await (await sb()).from("user_state").upsert({ user_id: uid, data: snap, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
export function CloudProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null), [ready, setReady] = useState(false), [recovery, setRecovery] = useState(false);
  const [sync, setSync] = useState<SyncState>("off"), [err, setErr] = useState<string | null>(null), [tick, setTick] = useState(0);
  const remote = useRef<Snap | null>(null), last = useRef("");
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
        const { data, error } = await (await sb()).from("user_state").select("data").eq("user_id", uid).maybeSingle();
        if (error) throw new Error(error.message);
        if (dead) return;
        const local = snapshot(), cloud = (data?.data ?? null) as Snap | null;
        if (!cloud || isEmpty(cloud)) { if (!isEmpty(local)) await push(uid, local); last.current = fingerprint(local); setSync("synced"); }
        else if (isEmpty(local)) { applySnap(cloud); last.current = fingerprint(cloud); setSync("synced"); location.reload(); }
        else if (same(local, cloud)) { last.current = fingerprint(local); setSync("synced"); }
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
      push(uid, s).then(() => { last.current = f; }).catch(e => { setErr(msg(e)); setSync("error"); });
    }, 4000);
    return () => clearInterval(t);
  }, [uid, sync]);
  const value: Ctx = {
    email: session?.user.email ?? null, ready, sync, err, retry: () => setTick(t => t + 1),
    signIn: async (email, password) => { const { error } = await (await sb()).auth.signInWithPassword({ email, password }); return error ? authMessage(error.message) : null; },
    signUp: async (email, password) => { const { data, error } = await (await sb()).auth.signUp({ email, password }); return error ? authMessage(error.message) : data.session ? null : "Check your email to confirm your account, then sign in."; },
    // Passwordless sign-in: Supabase emails a one-time link. Works for new and existing accounts.
    signInLink: async email => { const { error } = await (await sb()).auth.signInWithOtp({ email, options: { emailRedirectTo: location.origin + location.pathname } }); return error ? error.message : "Check your email: we sent you a sign-in link."; },
    // A person who only ever used the email link has no password. This sends a link that lets them choose one.
    resetPassword: async email => { const { error } = await (await sb()).auth.resetPasswordForEmail(email, { redirectTo: location.origin + location.pathname }); return error ? authMessage(error.message) : "Check your email: we sent a link to choose a new password."; },
    setPassword: async pw => { const { error } = await (await sb()).auth.updateUser({ password: pw }); if (!error) setRecovery(false); return error ? authMessage(error.message) : null; },
    recovery,
    signOut: async () => { await (await sb()).auth.signOut(); },
    resolve: async c => {
      if (!uid) return;
      try {
        if (c === "cloud" && remote.current) { applySnap(remote.current); last.current = fingerprint(remote.current); setSync("synced"); location.reload(); }
        else { const s = snapshot(); await push(uid, s); last.current = fingerprint(s); setSync("synced"); }
      } catch (e) { setErr(msg(e)); setSync("error"); }
    },
  };
  return <C.Provider value={value}>{children}</C.Provider>;
}
