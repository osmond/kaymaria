import { NextResponse } from "next/server";
import { dump } from "@/lib/mockdb";

export async function GET() {
  return NextResponse.json({ tasks: dump() }, { headers: { "Cache-Control": "no-store" } });
}
