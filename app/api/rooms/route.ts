import { NextRequest, NextResponse } from "next/server";
import { withAuth } from "@/lib/withAuth";

export async function GET() {
  try {
    return await withAuth(async (supabase, userId) => {
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
    });
  } catch (e: any) {
    console.error("GET /api/rooms failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    return await withAuth(async (supabase, userId) => {
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
    });
  } catch (e: any) {
    console.error("POST /api/rooms failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
