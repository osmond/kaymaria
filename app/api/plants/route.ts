import { NextRequest, NextResponse } from "next/server";
import { listPlants, createPlant } from "@/lib/prisma/plants";
import { createRouteHandlerClient } from "@/lib/supabase";

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
    const supabase = await createRouteHandlerClient();
    const singleUser = process.env.SINGLE_USER_MODE === "true";
    let userId: string | undefined;
    if (singleUser) {
      userId = process.env.SINGLE_USER_ID;
      if (!userId) {
        console.error("SINGLE_USER_MODE enabled but SINGLE_USER_ID not set");
        return NextResponse.json({ error: "server" }, { status: 500 });
      }
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user)
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      userId = user.id;
    }

    const body = await req.json().catch(() => ({}));
    if (body.planSource) {
      console.log('Plan source:', body.planSource);
    }
    const plant = await createPlant(userId!, body);
    return NextResponse.json(plant, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

