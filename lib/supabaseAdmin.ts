import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";
import { ensureSupabaseEnv } from "./supabaseEnv";

const { url } = ensureSupabaseEnv();
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!serviceKey) {
  throw new Error("Missing Supabase environment variables");
}

const supabaseAdmin: SupabaseClient<Database> = createClient<Database>(
  url,
  serviceKey,
  { auth: { persistSession: false, autoRefreshToken: false } },
);

export function createSupabaseAdminClient(): SupabaseClient<Database> {
  return supabaseAdmin;
}
