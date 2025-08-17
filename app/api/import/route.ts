import { NextRequest, NextResponse } from "next/server";
import { load } from "@/lib/mockdb";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.tasks)) {
    return NextResponse.json({ error: "Invalid payload. Expected { tasks: Task[] }" }, { status: 400 });
  }
  const count = load(body.tasks);
  return NextResponse.json({ ok: true, count });
}
