import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { dump, load } from "@/lib/mockdb";

async function getUser(req: NextRequest) {
  const token = req.headers.get("authorization")?.replace("Bearer ", "");
  if (!token) return null;
  const { data, error } = await supabaseAdmin.auth.getUser(token);
  if (error || !data.user) return null;
  return data.user;
}

export async function GET(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { data, error } = await supabaseAdmin
    .from("plant_sync")
    .select("data")
    .eq("user_id", user.id)
    .single();

  if (error) return NextResponse.json({ error: "fetch failed" }, { status: 500 });

  if (data?.data) {
    try {
      load(data.data);
    } catch (e) {
      console.error("Failed to load user state", e);
    }
  }

  return NextResponse.json(dump());
}

export async function POST(req: NextRequest) {
  const user = await getUser(req);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const state = dump();
  const { error } = await supabaseAdmin
    .from("plant_sync")
    .upsert({ user_id: user.id, data: state });

  if (error) return NextResponse.json({ error: "save failed" }, { status: 500 });
  return NextResponse.json({ ok: true });
}

