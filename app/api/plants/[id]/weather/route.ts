import { NextResponse } from "next/server";
import { getPlant } from "@/lib/prisma/plants";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const plant = await getPlant(id);
    if (!plant || plant.latitude === undefined || plant.longitude === undefined) {
      return NextResponse.json({ error: "location unavailable" }, { status: 404 });
    }

    const url = `https://api.open-meteo.com/v1/forecast?latitude=${plant.latitude}&longitude=${plant.longitude}&current_weather=true`;
    const r = await fetch(url);
    if (!r.ok) throw new Error("weather fetch failed");
    const data = await r.json();
    return NextResponse.json(data.current_weather ?? {});
  } catch (e) {
    console.error("GET /api/plants/[id]/weather failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
