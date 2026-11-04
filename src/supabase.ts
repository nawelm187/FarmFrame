import { createClient } from "@supabase/supabase-js";
import { SUPABASE_KEY, SUPABASE_URL } from "./config";
// Loaded on demand (dynamic import) so the Supabase library stays out of the first page load.
export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
