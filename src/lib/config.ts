// Public project URL and publishable key: safe in the browser by design; row level security protects the data.
// Never put a service_role or secret key in this project.
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) ?? "https://ibhhtmbgdksriyaecclg.supabase.co";
export const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_KEY as string | undefined) ?? "sb_publishable_XYgT7IazoEcmhA7YdL2B7Q_Fs6ZCH_u";
