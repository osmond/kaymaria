import { NextRequest, NextResponse } from "next/server";
import { allPlants, addPlant } from "@/lib/plantstore";

export async function GET() {
  try {
    return NextResponse.json(allPlants());
  } catch (e: any) {
    console.error("GET /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const created = addPlant({
      name: body?.name,
      room: body?.room ?? body?.roomId,
      species: body?.species,
      waterEveryDays: Number(body?.rules?.find?.((r: any) => r?.type === "water")?.intervalDays) || Number(body?.waterEveryDays) || 7,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
