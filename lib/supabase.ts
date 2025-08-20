import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";
import supabase from "./supabaseClient";
export { ensureSupabaseEnv } from "./supabaseEnv";

// Authenticated client helper for Route Handlers
export async function createRouteHandlerClient(): Promise<SupabaseClient<Database>> {
  const { cookies } = await import("next/headers");
  // `cookies()` is now asynchronous in Next 15 and must be awaited
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  supabase.auth.setAuth(accessToken ?? "");
  return supabase;
}
