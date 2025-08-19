import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./supabase.types";

function getSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    throw new Error("Missing Supabase environment variables");
  }
  return { url, anonKey };
}

// Factory for an unauthenticated client
export function createSupabaseClient(): SupabaseClient<Database> {
  const { url, anonKey } = getSupabaseEnv();
  return createClient<Database>(url, anonKey);
}

// Authenticated client helper for Route Handlers
export async function createRouteHandlerClient(): Promise<SupabaseClient<Database>> {
  const { cookies } = await import("next/headers");
  const { url, anonKey } = getSupabaseEnv();
  // `cookies()` is now asynchronous in Next 15 and must be awaited
  const cookieStore = await cookies();
  const accessToken = cookieStore.get("sb-access-token")?.value;
  return createClient<Database>(url, anonKey, {
    global: {
      headers: {
        Authorization: accessToken ? `Bearer ${accessToken}` : "",
      },
    },
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });
}
