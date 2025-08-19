import { NextRequest, NextResponse } from "next/server";
import { listPlants, createPlant } from "@/lib/prisma/plants";
import { createRouteHandlerClient } from "@/lib/supabase";
import { getUserId } from "@/lib/getUserId";

const missingEnv = () =>
  !process.env.DATABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_URL ||
  !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

const envErrorResponse = () =>
  NextResponse.json(
    {
      error: "misconfigured server",
      message:
        "Set NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, and DATABASE_URL, or enable SINGLE_USER_MODE",
    },
    { status: 503 }
  );

export async function GET() {
  try {
    if (missingEnv()) {
      console.error("Missing Supabase or database environment variables");
      return envErrorResponse();
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
    if (missingEnv()) {
      console.error("Missing Supabase or database environment variables");
      return envErrorResponse();
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
    const { lastWateredAt, lastFertilizedAt, ...rest } = body;
    const plant = await createPlant(userId!, {
      ...rest,
      ...(lastWateredAt ? { lastWateredAt } : {}),
      ...(lastFertilizedAt ? { lastFertilizedAt } : {}),
    });
    return NextResponse.json(plant, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

