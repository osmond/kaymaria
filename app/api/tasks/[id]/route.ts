import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";

// In Next 15, params may be a Promise — await it.
export async function PATCH(req: NextRequest, ctx: any) {
  try {
    const params = await (ctx as any).params;
    const supabase = await createRouteHandlerClient();
    const singleUser = process.env.SINGLE_USER_MODE === "true";
    let userId: string | undefined;
    if (singleUser) {
      userId = process.env.SINGLE_USER_ID;
      if (!userId) {
        console.error(
          "SINGLE_USER_MODE enabled but SINGLE_USER_ID not set",
        );
        return NextResponse.json({ error: "server" }, { status: 500 });
      }
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user)
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      userId = user.id;
    }

    const body = await req.json().catch(() => ({}));
    const id = params.id as string;

    const isComposite = id.includes(":");
    const [plantId, type] = isComposite ? id.split(":") : [null, null];
    const taskId = isComposite ? null : id;

    if (body.undo) {
      const task = body.task;
      if (!task) {
        return NextResponse.json({ error: "task required" }, { status: 400 });
      }
      const { error } = await supabase
        .from("tasks")
        .update({ due_at: task.dueAt, last_done_at: null })
        .eq("id", taskId ?? task.id)
        .eq("user_id", userId);
      if (error) {
        console.error("PATCH /api/tasks/[id] undo failed:", error);
        return NextResponse.json({ error: "server" }, { status: 500 });
      }
      return NextResponse.json({ ok: true });
    }

    const { data: existing, error: fetchError } = taskId
      ? await supabase
          .from("tasks")
          .select(
            "id, plant_id, type, due_at, last_done_at, plant:plants(id, name, room_id)",
          )
          .eq("user_id", userId)
          .eq("id", taskId)
          .single()
      : await supabase
          .from("tasks")
          .select(
            "id, plant_id, type, due_at, last_done_at, plant:plants(id, name, room_id)",
          )
          .eq("user_id", userId)
          .eq("plant_id", plantId as string)
          .eq("type", type as string)
          .single();

    if (fetchError || !existing)
      return NextResponse.json({ error: "Not found" }, { status: 404 });

    if (typeof body.deferDays === "number") {
      const d = new Date(existing.due_at);
      d.setDate(d.getDate() + Number(body.deferDays));
      const { data, error } = await supabase
        .from("tasks")
        .update({ due_at: d.toISOString() })
        .eq("id", existing.id)
        .select("id, type, due_at, last_done_at, plant:plants(id, name, room_id)")
        .single();
      if (error) {
        console.error("PATCH /api/tasks/[id] defer failed:", error);
        return NextResponse.json({ error: "server" }, { status: 500 });
      }
      const rec = {
        id: data.id,
        plantId: data.plant?.id ?? (data as any).plant_id,
        plantName: data.plant?.name ?? "",
        roomId: data.plant?.room_id ?? "",
        type: data.type,
        dueAt: data.due_at,
        status: "due" as const,
        lastEventAt: data.last_done_at || null,
      };
      return NextResponse.json(rec);
    }

    if (body.status === "done") {
      const eventAt = new Date().toISOString();
      const d = new Date(existing.due_at);
      d.setDate(d.getDate() + 1);
      const { error } = await supabase
        .from("tasks")
        .update({ due_at: d.toISOString(), last_done_at: eventAt })
        .eq("id", existing.id);
      if (error) {
        console.error("PATCH /api/tasks/[id] complete failed:", error);
        return NextResponse.json({ error: "server" }, { status: 500 });
      }
      return NextResponse.json({ eventAt });
    }

    return NextResponse.json({ error: "bad request" }, { status: 400 });
  } catch (e) {
    console.error("PATCH /api/tasks/[id] failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
