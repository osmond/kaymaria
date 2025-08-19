import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";

export async function GET() {
  try {
    const singleUser = process.env.SINGLE_USER_MODE === "true";
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      (singleUser && !process.env.SINGLE_USER_ID)
    ) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
    }

    const supabase = await createRouteHandlerClient();
    let userId: string | undefined;
    if (singleUser) {
      userId = process.env.SINGLE_USER_ID!;
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
    const singleUser = process.env.SINGLE_USER_MODE === "true";
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ||
      (singleUser && !process.env.SINGLE_USER_ID)
    ) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
    }

    const supabase = await createRouteHandlerClient();
    let userId: string | undefined;
    if (singleUser) {
      userId = process.env.SINGLE_USER_ID!;
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
