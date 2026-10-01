import type { Session } from "@supabase/supabase-js";
import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from "react";
import { applySnap, fingerprint, isEmpty, same, snapshot, type Snap } from "./cloud";
import { supabase } from "./supabase";
export type SyncState = "off" | "checking" | "conflict" | "synced" | "error";
interface Ctx { email: string | null; ready: boolean; sync: SyncState; err: string | null; signIn: (e: string, p: string) => Promise<string | null>; signUp: (e: string, p: string) => Promise<string | null>; signOut: () => Promise<void>; resolve: (c: "cloud" | "device") => Promise<void>; retry: () => void }
const C = createContext<Ctx | null>(null);
export const useCloud = () => { const c = useContext(C); if (!c) throw new Error("CloudProvider missing"); return c; };
const msg = (e: unknown) => (e instanceof Error ? e.message : String(e));
async function push(uid: string, snap: Snap) {
  const { error } = await supabase.from("user_state").upsert({ user_id: uid, data: snap, updated_at: new Date().toISOString() });
  if (error) throw new Error(error.message);
}
export function CloudProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null), [ready, setReady] = useState(false);
  const [sync, setSync] = useState<SyncState>("off"), [err, setErr] = useState<string | null>(null), [tick, setTick] = useState(0);
  const remote = useRef<Snap | null>(null), last = useRef("");
  const uid = session?.user.id;
  useEffect(() => {
    void supabase.auth.getSession().then(({ data }) => { setSession(data.session); setReady(true); });
    const { data } = supabase.auth.onAuthStateChange((_e, s) => { setSession(s); setReady(true); });
    return () => data.subscription.unsubscribe();
  }, []);
  useEffect(() => {
    if (!uid) { setSync("off"); return; }
    let dead = false; setSync("checking"); setErr(null);
    void (async () => {
      try {
        const { data, error } = await supabase.from("user_state").select("data").eq("user_id", uid).maybeSingle();
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
    signIn: async (email, password) => { const { error } = await supabase.auth.signInWithPassword({ email, password }); return error ? error.message : null; },
    signUp: async (email, password) => { const { data, error } = await supabase.auth.signUp({ email, password }); return error ? error.message : data.session ? null : "Check your email to confirm your account, then sign in."; },
    signOut: async () => { await supabase.auth.signOut(); },
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
