import { NextRequest, NextResponse } from "next/server";
import { load } from "@/lib/mockdb";

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (
    !body ||
    (!Array.isArray(body.tasks) && !Array.isArray(body.plants))
  ) {
    return NextResponse.json(
      { error: "Invalid payload. Expected { tasks?: Task[], plants?: Plant[] }" },
      { status: 400 },
    );
  }
  const counts = load(body);
  return NextResponse.json({ ok: true, ...counts });
}
