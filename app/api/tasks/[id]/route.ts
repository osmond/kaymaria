import { NextResponse } from "next/server";
import { completeTask, addEvent, CareType } from "@/lib/mockdb";
import { touchWatered } from "@/lib/plantstore";

// Accept both "t_<uuid>" and "plantId:type" (e.g. "p3:water")
export async function PATCH(
  _req: Request,
  ctx: any
) {
  const params = await ctx.params;

  const id = decodeURIComponent(params.id);

  // Try to find and remove a matching task
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
