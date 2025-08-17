import { NextRequest, NextResponse } from "next/server";
import { listEvents } from "@/lib/mockdb";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const win = url.searchParams.get("window") || "30d";
  const days = Number(win.replace("d", "")) || 30;
  return NextResponse.json(listEvents(days));
}
