import { NextResponse } from "next/server";
import { completeTask } from "@/lib/mockdb";
import { touchWatered } from "@/lib/plantstore";

// Accept both "t_<uuid>" and "plantId:type" (e.g. "p3:water")
export async function PATCH(
  _req: Request,
  ctx: any
) {
  const params = await ctx.params;

  const id = decodeURIComponent(params.id);

  // If composite id "plantId:type", also update plant lastWaterAt
  if (id.includes(":")) {
    const [plantId, type] = id.split(":");
    if (!plantId || !type) {
      return NextResponse.json({ error: "bad id" }, { status: 400 });
    }
    if (type === "water") touchWatered(plantId);
    // Also try to remove task if it matches any mock task id
    completeTask(id);
    return NextResponse.json({ ok: true });
  }

  // Normal task id
  const ok = completeTask(id);
  if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
