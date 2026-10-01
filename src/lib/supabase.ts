import { createClient } from "@supabase/supabase-js";
// Project URL and publishable key are public by design; what a user can read or write is enforced by row level security.
// Never put a service_role or secret key in this project.
const URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "https://ibhhtmbgdksriyaecclg.supabase.co";
const KEY = (import.meta.env.VITE_SUPABASE_KEY as string | undefined) ?? "sb_publishable_XYgT7IazoEcmhA7YdL2B7Q_Fs6ZCH_u";
export const supabase = createClient(URL, KEY);
