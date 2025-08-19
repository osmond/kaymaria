import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";
import { ensureSupabaseEnv } from "./supabase";

export function createSupabaseAdminClient(): SupabaseClient<Database> {
  const { url } = ensureSupabaseEnv();
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!serviceKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return createClient<Database>(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
