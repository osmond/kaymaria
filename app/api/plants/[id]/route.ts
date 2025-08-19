import { NextResponse } from "next/server";
import {
  getPlant,
  getComputedWaterInfo,
  updatePlant,
  deletePlant,
} from "@/lib/prisma/plants";
import { createRouteHandlerClient } from "@/lib/supabase";
import { getUserId } from "@/lib/getUserId";
import { plantInputSchema } from "@/lib/plantInputSchema";

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

export async function PATCH(req: Request, ctx: any) {
  try {
    const params = await (ctx as any).params;
    const supabase = await createRouteHandlerClient();
    const userRes = await getUserId(supabase);
    if ("error" in userRes) {
      if (userRes.error === "unauthorized")
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
    }
    const { userId } = userRes;

    const body = await req.json().catch(() => ({}));
    const parsed = plantInputSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "invalid" }, { status: 400 });
    }
    const { roomId, rules, ...rest } = parsed.data;
    if (roomId) {
      const { data: room } = await supabase
        .from("rooms")
        .select("id")
        .eq("id", roomId)
        .eq("user_id", userId)
        .single();
      if (!room) {
        return NextResponse.json({ error: "invalid room" }, { status: 400 });
      }
    }
    const updated = await updatePlant(params.id, {
      ...rest,
      ...(roomId ? { roomId } : {}),
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

