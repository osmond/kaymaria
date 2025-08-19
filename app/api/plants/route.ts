import { NextRequest, NextResponse } from "next/server";
import { listPlants, createPlant } from "@/lib/prisma/plants";
import { createRouteHandlerClient } from "@/lib/supabase";
import { getUserId } from "@/lib/getUserId";
import { z } from "zod";

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
    const userRes = await getUserId(supabase);
    if ("error" in userRes) {
      if (userRes.error === "unauthorized")
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
    }
    const { userId } = userRes;

    const body = await req.json().catch(() => ({}));

    const ruleSchema = z.object({
      type: z.enum(["water", "fertilize", "repot"]),
      intervalDays: z.coerce.number(),
      amountMl: z.coerce.number().optional(),
      formula: z.string().optional(),
    });

    const schema = z.object({
      name: z.string().trim().min(1),
      roomId: z.string().optional(),
      species: z.string().optional(),
      potSize: z.string().optional(),
      potMaterial: z.string().optional(),
      soilType: z.string().optional(),
      lightLevel: z.string().optional(),
      indoor: z.coerce.boolean().optional(),
      drainage: z.enum(["poor", "ok", "great"]).optional(),
      lat: z.coerce.number().optional(),
      lon: z.coerce.number().optional(),
      carePlanSource: z.string().optional(),
      presetId: z.string().optional(),
      aiModel: z.string().optional(),
      aiVersion: z.string().optional(),
      lastWateredAt: z.coerce.date().optional(),
      lastFertilizedAt: z.coerce.date().optional(),
      plan: z.array(ruleSchema).optional(),
      createTasks: z.boolean().optional(),
    });

    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "invalid", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const {
      plan,
      createTasks,
      lastWateredAt,
      lastFertilizedAt,
      ...rest
    } = parsed.data;

    const plant = await createPlant(userId, {
      ...rest,
      ...(plan ? { carePlan: plan } : {}),
      ...(lastWateredAt ? { lastWateredAt: lastWateredAt.toISOString() } : {}),
      ...(lastFertilizedAt
        ? { lastFertilizedAt: lastFertilizedAt.toISOString() }
        : {}),
    });

    if (createTasks && plan && plan.length > 0) {
      const tasks = plan.map((r) => {
        let base: Date;
        if (r.type === "water" && lastWateredAt) base = lastWateredAt;
        else if (r.type === "fertilize" && lastFertilizedAt)
          base = lastFertilizedAt;
        else base = new Date();
        const due = new Date(base);
        due.setDate(due.getDate() + r.intervalDays);
        return {
          user_id: userId,
          plant_id: plant.id,
          type: r.type,
          due_at: due.toISOString(),
        };
      });
      const { error } = await supabase.from("tasks").insert(tasks);
      if (error) {
        console.error("Failed to pre-create tasks", error);
      }
    }

    return NextResponse.json(plant, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/plants failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

