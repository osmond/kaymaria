import { NextResponse } from "next/server";
import { getInsights } from "@/lib/mockdb";

export async function GET() {
  return NextResponse.json(getInsights());
}
