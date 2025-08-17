import { NextResponse } from "next/server";
import {
  getPlant,
  getComputedWaterInfo,
  updatePlant,
  deletePlant,
} from "@/lib/mockdb";

// In Next 15, params may be a Promise — await it.
export async function GET(
  _req: Request,
  ctx: any
) {
  try {
    const params = await (ctx as any).params;
    const p = getPlant(params.id);
    if (!p) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const water = getComputedWaterInfo(p.id);
    return NextResponse.json({ ...p, water });
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
    const updated = updatePlant(params.id, body);
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
    const ok = deletePlant(params.id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/plants/[id] failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
