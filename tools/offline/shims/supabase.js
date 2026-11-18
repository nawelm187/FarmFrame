// No-network stand-in for @supabase/supabase-js: nobody is signed in, every call answers "not available".
const off = async () => ({ data: { session: null, user: null }, error: { message: "offline stand-in" } });
export const createClient = () => ({ auth: { getSession: off, onAuthStateChange: () => ({ data: { subscription: { unsubscribe() {} } } }), signInWithPassword: off, signInWithOtp: off, signUp: off, signOut: off, resetPasswordForEmail: off, updateUser: off },
  from: () => ({ select: off, upsert: off, insert: off, delete: off, update: off, eq() { return this; }, maybeSingle: off, single: off }), functions: { invoke: off } });
