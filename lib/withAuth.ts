import { NextResponse } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";

import { createRouteHandlerClient } from "./supabase";
import { getUserId } from "./getUserId";
import type { Database } from "./supabase.types";

type Handler<T> = (
  supabase: SupabaseClient<Database>,
  userId: string,
) => Promise<T>;

/**
 * Helper to reduce repeated Supabase client and auth boilerplate in route handlers.
 * It creates a Supabase client, resolves the current user id, and invokes the
 * provided handler with those values. If authentication fails or the server is
 * misconfigured, an appropriate JSON response is returned instead.
 */
export async function withAuth<T>(
  handler: Handler<NextResponse<T>>,
): Promise<NextResponse<T | { error: string }>> {
  const supabase = await createRouteHandlerClient();
  const userRes = await getUserId(supabase);
  if ("error" in userRes) {
    if (userRes.error === "unauthorized") {
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    }
    return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
  }

  return handler(supabase, userRes.userId);
}

