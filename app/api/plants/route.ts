import { NextRequest, NextResponse } from "next/server";
import { listPlants, createPlant } from "@/lib/prisma/plants";
import { createRouteHandlerClient } from "@/lib/supabase";
import { getUserId } from "@/lib/getUserId";

export async function GET() {
  try {
    if (!process.env.DATABASE_URL) {
      console.error("Missing DATABASE_URL environment variable");
      return NextResponse.json(
        { error: "misconfigured server" },
        { status: 500 }
      );
    }

    const plants = await listPlants();
    return NextResponse.json(plants);
  } catch (e: any) {
    console.error("GET /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    if (
      !process.env.DATABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.error("Missing Supabase or database environment variables");
      return NextResponse.json(
        { error: "misconfigured server" },
        { status: 500 }
      );
    }

    const supabase = await createRouteHandlerClient();
    const { userId, error } = await getUserId(supabase);
    if (error === "unauthorized")
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    if (error)
      return NextResponse.json(
        { error: "misconfigured server" },
        { status: 500 }
      );

    const body = await req.json().catch(() => ({}));
    const plant = await createPlant(userId!, body);
    return NextResponse.json(plant, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

