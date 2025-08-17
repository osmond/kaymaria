import { NextResponse } from "next/server";
import { completeTask, addEvent, CareType, deferTask } from "@/lib/mockdb";
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
      if (rec.type === "water") touchWatered(rec.plantId);
      addEvent(rec.plantId, rec.type);
      return NextResponse.json({ ok: true });
    }

    // If composite id "plantId:type", schedule next task even if no mock task existed
    if (id.includes(":")) {
      const [plantId, type] = id.split(":");
      if (!plantId || !type) {
        return NextResponse.json({ error: "bad id" }, { status: 400 });
      }
      if (type === "water") touchWatered(plantId);
      addEvent(plantId, type as CareType);
      return NextResponse.json({ ok: true });
    }

    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({ error: "Unsupported" }, { status: 400 });
}
