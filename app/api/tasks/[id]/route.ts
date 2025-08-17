import { NextResponse } from "next/server";
import { completeTask, addEvent, CareType, deferTask, updateTask, undoTaskCompletion } from "@/lib/mockdb";
import { touchWatered } from "@/lib/plantstore";

// Accept both "t_<uuid>" and "plantId:type" (e.g. "p3:water")
export async function PATCH(req: Request, ctx: any) {
  const params = await ctx.params;
  const id = decodeURIComponent(params.id);
  let body: any = null;
  try {
    body = await req.json();
  } catch {}

  if (body?.deferDays) {
    const rec = deferTask(id, Number(body.deferDays));
    if (!rec)
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rec);
  }

  if (body?.status === "done") {
    const rec = completeTask(id);
    if (rec) {
      const now = new Date();
      if (rec.type === "water") touchWatered(rec.plantId);
      addEvent(rec.plantId, rec.type, now);
      return NextResponse.json({ ok: true, task: rec, eventAt: now.toISOString() });
    }

    // If composite id "plantId:type", schedule next task even if no mock task existed
    if (id.includes(":")) {
      const [plantId, type] = id.split(":");
      if (!plantId || !type) {
        return NextResponse.json({ error: "bad id" }, { status: 400 });
      }
      const now = new Date();
      if (type === "water") touchWatered(plantId);
      addEvent(plantId, type as CareType, now);
      return NextResponse.json({ ok: true, eventAt: now.toISOString() });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (body?.undo && body.task && body.eventAt) {
    undoTaskCompletion(body.task, body.eventAt);
    return NextResponse.json({ ok: true });
  }

  if (body?.type || body?.dueAt) {
    const rec = updateTask(id, {
      type: body.type,
      dueAt: body.dueAt,
    });
    if (!rec) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(rec);
  }

  return NextResponse.json({ error: "Unsupported" }, { status: 400 });
}
