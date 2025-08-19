import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";
import { getUserId } from "@/lib/getUserId";

export async function GET() {
  const supabase = await createRouteHandlerClient();
  const { userId, error: userIdError } = await getUserId(supabase);
  if (userIdError === "unauthorized")
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (userIdError)
    return NextResponse.json({ error: "misconfigured server" }, { status: 500 });

  const [plantRes, taskRes] = await Promise.all([
    supabase
      .from("plants")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
    supabase
      .from("tasks")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId),
  ]);

  if (plantRes.error) {
    console.error("GET /api/insights plant count failed:", plantRes.error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
  if (taskRes.error) {
    console.error("GET /api/insights task count failed:", taskRes.error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  return NextResponse.json({
    plantCount: plantRes.count ?? 0,
    taskCount: taskRes.count ?? 0,
  });
}
