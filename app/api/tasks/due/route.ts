import { NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";

// Return all tasks due in the next 7 days for the authenticated user.
export async function GET() {
  return withAuth(async (supabase, userId) => {
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 7);

    const { data, error } = await supabase
      .from("tasks")
      .select("id, type, due_at, last_done_at, plant:plants(id, name, room_id)")
      .eq("user_id", userId)
      .lte("due_at", maxDate.toISOString())
      .order("due_at");
    if (error) {
      console.error("GET /api/tasks/due failed:", error);
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
      lastEventAt: t.last_done_at || null,
    }));

    return NextResponse.json(tasks);
  });
}
