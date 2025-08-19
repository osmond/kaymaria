import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";
import { uploadPlantPhoto } from "@/lib/storage";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from('plant_photos')
      .select('url')
      .eq('plant_id', id)
      .order('created_at', { ascending: true });
    if (error) throw error;
    return NextResponse.json(data?.map(p => p.url) ?? []);
  } catch (e) {
    console.error("GET /api/plants/[id]/photos failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function POST(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const formData = await req.formData();
    const file = formData.get('file');
    if (!(file instanceof File)) {
      return NextResponse.json({ error: "file required" }, { status: 400 });
    }

    const supabase = await createRouteHandlerClient();

    const singleUser = process.env.SINGLE_USER_MODE === "true";
    let userId: string | undefined;
    if (singleUser) {
      if (!process.env.SINGLE_USER_ID)
        return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
      userId = process.env.SINGLE_USER_ID;
    } else {
      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();
      if (userError || !user)
        return NextResponse.json({ error: "unauthorized" }, { status: 401 });
      userId = user.id;
    }

    const url = await uploadPlantPhoto(supabase, id, file);
    const { error } = await supabase
      .from('plant_photos')
      .insert({ user_id: userId, plant_id: id, url });
    if (error) throw error;
    return NextResponse.json({ src: url }, { status: 201 });
  } catch (e) {
    console.error("POST /api/plants/[id]/photos failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}

export async function DELETE(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await ctx.params;
    const body = await req.json().catch(() => ({}));
    const src = typeof body.src === "string" ? body.src.trim() : "";
    if (!src) return NextResponse.json({ error: "src required" }, { status: 400 });
    const supabase = await createRouteHandlerClient();
    const { data, error } = await supabase
      .from('plant_photos')
      .delete()
      .eq('plant_id', id)
      .eq('url', src)
      .select();
    if (error) throw error;
    if (!data || data.length === 0) {
      return NextResponse.json({ error: "not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/plants/[id]/photos failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
