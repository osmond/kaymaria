import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";

export async function POST() {
  return withAuth(async (_supabase, _userId) => {
    const admin = createSupabaseAdminClient();
    void admin; // placeholder for future sync logic
    return NextResponse.json({ ok: true });
  });
}
