import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";
import { getUserId } from "@/lib/getUserId";

export async function GET(req: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const userRes = await getUserId(supabase);
  if ("error" in userRes) {
    if (userRes.error === "unauthorized")
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
  }
  const { userId } = userRes;

  const url = new URL(req.url);
  const offset = Number(url.searchParams.get("offset") || 0);
  const limit = Number(url.searchParams.get("limit") || 50);

  const { data, error } = await supabase
    .from("tasks")
    .select("id, type, last_done_at, plant:plants(id, name)")
    .eq("user_id", userId)
    .not("last_done_at", "is", null)
    .order("last_done_at", { ascending: false })
    .range(offset, offset + limit - 1);
  if (error) {
    console.error("GET /api/events failed:", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  const events = (data || []).map((t: any) => ({
    id: t.id,
    plantId: t.plant?.id ?? t.plant_id,
    plantName: t.plant?.name ?? "",
    type: t.type,
    at: t.last_done_at,
  }));
  return NextResponse.json(events);
}
