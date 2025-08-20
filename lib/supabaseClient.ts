import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { ensureSupabaseEnv } from "./supabaseEnv";
import type { Database } from "./supabase.types";

const { url, anonKey } = ensureSupabaseEnv();
const singleUserMode = process.env.SINGLE_USER_MODE === "true";

let supabase: SupabaseClient<Database>;

if (singleUserMode) {
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
  }
  supabase = createClient<Database>(url, serviceKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
} else {
  supabase = createClient<Database>(url, anonKey);
}

export default supabase;
