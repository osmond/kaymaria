import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";
import { createSupabaseAdminClient } from "@/lib/supabaseAdmin";
import { getUserId } from "@/lib/getUserId";

export async function POST() {
  try {
    const supabase = await createRouteHandlerClient();
    const userRes = await getUserId(supabase);
    if ("error" in userRes) {
      if (userRes.error === "unauthorized")
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
    }
    const { userId } = userRes;

    const admin = createSupabaseAdminClient();
    void admin; // placeholder for future sync logic
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("POST /api/sync failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
