// The project address and its publishable key are NOT kept in the source: the deploy workflow passes them from the repository variables
// SUPABASE_URL / SUPABASE_KEY (VITE_SUPABASE_URL / VITE_SUPABASE_KEY at build time; for local work put them in .env.local, which git ignores).
// The publishable key is public by design (row level security protects the data), but there is no reason to publish it in the code as well.
// Never put a service_role or secret key anywhere in this project.
// When they are missing the app points at an address that can never resolve (.invalid is reserved), so every cloud feature fails closed and shows "unavailable".
const NOT_SET = "https://not-configured.invalid", NO_KEY = "not-configured";
export const SUPABASE_URL = (import.meta.env.VITE_SUPABASE_URL as string | undefined) || NOT_SET;
export const SUPABASE_KEY = (import.meta.env.VITE_SUPABASE_KEY as string | undefined) || NO_KEY;
export const CLOUD_CONFIGURED = SUPABASE_URL !== NOT_SET && SUPABASE_KEY !== NO_KEY;
