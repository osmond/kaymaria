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

  const result = completeTask(id);
  if (!result) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (result.type === "water") touchWatered(result.plantId);

  return NextResponse.json({ ok: true });
}
