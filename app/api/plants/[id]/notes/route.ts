import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";
import { getUserId } from "@/lib/getUserId";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from('plant_notes')
      .select('id, note, created_at')
      .eq('plant_id', id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    const notes = (data ?? []).map(n => ({
      id: n.id,
      note: n.note,
      createdAt: n.created_at,
    }));
    return NextResponse.json(notes);
  } catch (e) {
    console.error("GET /api/plants/[id]/notes failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const supabase = await createRouteHandlerClient();
    const userRes = await getUserId(supabase);
    if ("error" in userRes) {
      if (userRes.error === "unauthorized") {
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      }
      return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
    }
    const { userId } = userRes;

    const body = await req.json().catch(() => ({}));
    const note = typeof body.note === "string" ? body.note.trim() : "";
    if (!note) {
      return NextResponse.json({ error: "note required" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('plant_notes')
      .insert({ user_id: userId, plant_id: id, note })
      .select('id, note, created_at')
      .single();
    if (error) throw error;
    return NextResponse.json({
      id: data.id,
      note: data.note,
      createdAt: data.created_at,
    }, { status: 201 });
  } catch (e) {
    console.error("POST /api/plants/[id]/notes failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
