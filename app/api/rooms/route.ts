import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";
import { getUserId } from "@/lib/getUserId";

export async function GET() {
  try {
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
    }

    const supabase = await createRouteHandlerClient();
    const userRes = await getUserId(supabase);
    if ("error" in userRes) {
      if (userRes.error === "unauthorized")
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
    }
    const { userId } = userRes;

    const { data, error: dbError } = await supabase
      .from("rooms")
      .select("id, name")
      .eq("user_id", userId)
      .order("name");
    if (dbError) {
      console.error("GET /api/rooms failed:", dbError);
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
    if (
      !process.env.NEXT_PUBLIC_SUPABASE_URL ||
      !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    ) {
      console.error("Missing Supabase environment variables");
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
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
    const name = String(body.name || "").trim();
    if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

    const { data, error: dbError } = await supabase
      .from("rooms")
      .insert({ user_id: userId, name })
      .select("id, name")
      .single();
    if (dbError) {
      console.error("POST /api/rooms failed:", dbError);
      return NextResponse.json({ error: "server" }, { status: 500 });
    }
    return NextResponse.json(data, { status: 201 });
  } catch (e: any) {
    console.error("POST /api/rooms failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
