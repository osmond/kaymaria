import { NextRequest, NextResponse } from "next/server";
import { listPlants, createPlant } from "@/lib/mockdb";

export async function GET() {
  try {
    return NextResponse.json(listPlants());
  } catch (e: any) {
    console.error("GET /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const created = createPlant({
      name: body?.name || "New Plant",
      roomId: body?.room ?? body?.roomId,
      species: body?.species,
      potSize: body?.potSize,
      potMaterial: body?.potMaterial,
      rules: Array.isArray(body?.rules)
        ? body.rules.map((r: any) => ({
            type: r?.type,
            intervalDays: Number(r?.intervalDays) || 0,
            amountMl: r?.amountMl,
            formula: r?.formula,
          }))
        : undefined,
    });
    return NextResponse.json(created, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
