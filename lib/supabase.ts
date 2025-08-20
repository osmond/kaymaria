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
  if (accessToken) {
    const auth: any = supabase.auth as any;
    if (typeof auth.setAuth === "function") {
      auth.setAuth(accessToken);
    } else if (typeof auth.setSession === "function") {
      await auth.setSession({ access_token: accessToken, refresh_token: "" });
    }
  }
  return supabase;
}
