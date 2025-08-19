import { NextResponse } from "next/server";
import {
  getPlant,
  getComputedWaterInfo,
  updatePlant,
  deletePlant,
} from "@/lib/prisma/plants";

// In Next 15, params may be a Promise — await it.
export async function GET(
  _req: Request,
  ctx: any
) {
  try {
    const params = await (ctx as any).params;
    const plant = await getPlant(params.id);
    if (!plant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const water = await getComputedWaterInfo(plant);
    return NextResponse.json({ ...plant, water });
  } catch (e: any) {
    console.error("GET /api/plants/[id] failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  ctx: any
) {
  try {
    const params = await (ctx as any).params;
    const body = await req.json().catch(() => ({}));
    const { rules, ...rest } = body;
    const updated = await updatePlant(params.id, {
      ...rest,
      ...(rules ? { carePlan: rules } : {}),
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("PATCH /api/plants/[id] failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  ctx: any
) {
  try {
    const params = await (ctx as any).params;
    const ok = await deletePlant(params.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/plants/[id] failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

