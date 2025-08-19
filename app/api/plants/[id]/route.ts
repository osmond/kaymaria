import { NextResponse } from "next/server";
import {
  getPlant,
  getComputedWaterInfo,
  updatePlant,
  deletePlant,
} from "@/lib/prisma/plants";
import { createRouteHandlerClient } from "@/lib/supabase";
import { getUserId } from "@/lib/getUserId";
import { plantServerSchema } from "@/lib/plantFormSchema";

// In Next 15, params may be a Promise — await it.
export async function GET(
  _req: Request,
  ctx: any
) {
  try {
    const params = await (ctx as any).params;
    const plant = await getPlant(params.id);
    if (!plant) return NextResponse.json({ error: "Not found" }, { status: 404 });
    const water = getComputedWaterInfo(plant);
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
    if (
      !process.env.DATABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.error("Missing Supabase or database environment variables");
      return NextResponse.json(
        { error: "misconfigured server" },
        { status: 503 }
      );
    }

    const supabase = await createRouteHandlerClient();
    const userRes = await getUserId(supabase);
    if ("error" in userRes) {
      if (userRes.error === "unauthorized")
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
    }
    const { userId } = userRes;

    const body = await req.json().catch(() => ({}));
    const parsed = plantServerSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "validation", details: parsed.error.format() },
        { status: 400 }
      );
    }
    const data = parsed.data;
    if (data.roomId) {
      const { data: room } = await supabase
        .from("rooms")
        .select("id")
        .eq("id", data.roomId)
        .eq("user_id", userId)
        .single();
      if (!room)
        return NextResponse.json({ error: "invalid room" }, { status: 403 });
    }
    const { rules, ...rest } = data;
    const updated = await updatePlant(params.id, rest);
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

