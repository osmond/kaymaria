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

  const url = (req as any).nextUrl ?? new URL(req.url, "http://localhost");
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

export async function POST(req: NextRequest) {
  try {
    const supabase = await createRouteHandlerClient();
    const userRes = await getUserId(supabase);
    if ("error" in userRes) {
      if (userRes.error === "unauthorized") {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
    }

    const body = await req.json().catch(() => ({}));
    const plantId = body.plantId;
    const type = String(body.type || "").toLowerCase();
    const validTypes = ["water", "fertilize", "repot"];
    if (!plantId || !validTypes.includes(type)) {
      return NextResponse.json({ error: "invalid payload" }, { status: 400 });
    }

    const eventAt = body.at
      ? new Date(body.at).toISOString()
      : new Date().toISOString();
    const nextDue = new Date(eventAt);
    nextDue.setDate(nextDue.getDate() + 1);

    const { data: existing, error: fetchError } = await supabase
      .from("tasks")
      .select("id")
      .eq("user_id", userRes.userId)
      .eq("plant_id", plantId)
      .eq("type", type)
      .maybeSingle();
    if (fetchError) {
      console.error("POST /api/events fetch failed:", fetchError);
      return NextResponse.json({ error: "server" }, { status: 500 });
    }

    let record;
    if (existing) {
      const { data, error } = await supabase
        .from("tasks")
        .update({
          last_done_at: eventAt,
          due_at: nextDue.toISOString(),
        })
        .eq("id", existing.id)
        .select("id, type, plant:plants(id, name)")
        .single();
      if (error) {
        console.error("POST /api/events update failed:", error);
        return NextResponse.json({ error: "server" }, { status: 500 });
      }
      record = data;
    } else {
      const { data, error } = await supabase
        .from("tasks")
        .insert({
          user_id: userRes.userId,
          plant_id: plantId,
          type,
          due_at: nextDue.toISOString(),
          last_done_at: eventAt,
        })
        .select("id, type, plant:plants(id, name)")
        .single();
      if (error) {
        console.error("POST /api/events insert failed:", error);
        return NextResponse.json({ error: "server" }, { status: 500 });
      }
      record = data;
    }

    const event = {
      id: record.id,
      plantId: record.plant?.id ?? plantId,
      plantName: record.plant?.name ?? "",
      type: record.type,
      at: eventAt,
    };
    return NextResponse.json(event, { status: existing ? 200 : 201 });
  } catch (e) {
    console.error("POST /api/events failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
