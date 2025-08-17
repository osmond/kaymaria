import { NextResponse } from "next/server";
import { getPlant, computedWaterInfo } from "@/lib/plantstore";

// In Next 15, params may be a Promise — await it.
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> } | { params: { id: string } }
) {
  try {
    const params = "then" in (ctx as any).params
      ? await (ctx as any).params
      : (ctx as any).params;
    const p = getPlant(params.id);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const water = computedWaterInfo(p);
    return NextResponse.json({ ...p, water });
  } catch (e: any) {
    console.error("GET /api/plants/[id] failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
