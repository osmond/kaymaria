import { NextRequest, NextResponse } from "next/server";
import { getTasks, createTask } from "@/lib/mockdb";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const win = url.searchParams.get("window") || "7d";
  const days = Number(win.replace("d", "")) || 7;
  return NextResponse.json(getTasks(days));
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  // payload: { plant, action: "Water"|"Fertilize"|"Repot", due }
  const action = String(body.action || "Water").toLowerCase();
  const rec = createTask({
    plantId: body.plantId || "p1",
    plantName: body.plant || "New Plant",
    type: action === "water" ? "water" : action === "fertilize" ? "fertilize" : "repot",
    dueAt: new Date().toISOString(),
  });
  return NextResponse.json(rec, { status: 201 });
}
