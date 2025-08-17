import { NextRequest, NextResponse } from "next/server";
import { addEvent, getPlant } from "@/lib/mockdb";

// Record a water event + reschedule the next water task
export async function PATCH(_req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const plant = getPlant(id);
  if (!plant) return NextResponse.json({ error: "Not found" }, { status: 404 });

  addEvent(id, "water");
  return NextResponse.json({ ok: true });
}
