import { NextResponse } from "next/server";
import {
  getPlant,
  getComputedWaterInfo,
  updatePlant,
  deletePlant,
} from "@/lib/prisma/plants";

type Params = { params: Promise<{ id: string }> };

// In Next 15, `params` is a Promise — await it.
export async function GET(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const plant = await getPlant(id);
    if (!plant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const water = await getComputedWaterInfo(plant);
    return NextResponse.json({ ...plant, water });
  } catch (e: any) {
    console.error("GET /api/plants/[id] failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { plan, ...rest } = body;
    const updated = await updatePlant(id, {
      ...rest,
      ...(plan ? { carePlan: plan } : {}),
    });
    if (!updated) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(updated);
  } catch (e: any) {
    console.error("PATCH /api/plants/[id] failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: Params) {
  try {
    const { id } = await params;
    const ok = await deletePlant(id);
    if (!ok) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/plants/[id] failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

