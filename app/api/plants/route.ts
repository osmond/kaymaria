import { NextRequest, NextResponse } from "next/server";
import { listPlants, createPlant } from "@/lib/prisma/plants";

export async function GET() {
  try {
    const plants = await listPlants();
    return NextResponse.json(plants);
  } catch (e: any) {
    console.error("GET /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json().catch(() => ({}));
    const plant = await createPlant(body);
    return NextResponse.json(plant, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

