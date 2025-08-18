import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";

export async function GET(req: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const url = new URL(req.url);
  const win = url.searchParams.get("window") || "7d";
  const days = Number(win.replace("d", "")) || 7;
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + days);

  const { data, error } = await supabase
    .from("tasks")
    .select("id, type, due_at, plant:plants(id, name, room_id)")
    .eq("user_id", user.id)
    .lte("due_at", maxDate.toISOString())
    .order("due_at");
  if (error) {
    console.error("GET /api/tasks failed:", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  const tasks = (data || []).map((t: any) => ({
    id: t.id,
    plantId: t.plant?.id ?? t.plant_id,
    plantName: t.plant?.name ?? "",
    roomId: t.plant?.room_id ?? "",
    type: t.type,
    dueAt: t.due_at,
    status: "due",
    lastEventAt: null,
  }));

  return NextResponse.json(tasks);
}

export async function POST(req: NextRequest) {
  const supabase = await createRouteHandlerClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();
  if (userError || !user)
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const action = String(body.action || "Water").toLowerCase();
  const plantId = body.plantId;
  if (!plantId) {
    return NextResponse.json({ error: "plantId required" }, { status: 400 });
  }
  const type = action === "water" ? "water" : action === "fertilize" ? "fertilize" : "repot";
  const dueAt = body.dueAt || new Date().toISOString();

  const { data, error } = await supabase
    .from("tasks")
    .insert({
      user_id: user.id,
      plant_id: plantId,
      type,
      due_at: dueAt,
    })
    .select("id, type, due_at, plant:plants(id, name, room_id)")
    .single();
  if (error) {
    console.error("POST /api/tasks failed:", error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  const rec = {
    id: data.id,
    plantId: data.plant?.id ?? plantId,
    plantName: data.plant?.name ?? "",
    roomId: data.plant?.room_id ?? "",
    type: data.type,
    dueAt: data.due_at,
    status: "due",
    lastEventAt: null,
  };
  return NextResponse.json(rec, { status: 201 });
}
