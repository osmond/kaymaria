import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";

export async function GET() {
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

    const { data, error } = await supabase
      .from("rooms")
      .select("id, name")
      .eq("user_id", userId)
      .order("name");
    if (error) {
      console.error("GET /api/rooms failed:", error);
      return NextResponse.json({ error: "server" }, { status: 500 });
    }
    return NextResponse.json(data || []);
  } catch (e: any) {
    console.error("GET /api/rooms failed:", e);
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
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

    const { data, error } = await supabase
      .from("rooms")
      .insert({ user_id: userId, name })
      .select("id, name")
      .single();
    if (error) {
      console.error("POST /api/rooms failed:", error);
      return NextResponse.json({ error: "server" }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/rooms failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
