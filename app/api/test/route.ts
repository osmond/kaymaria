import { NextResponse } from "next/server";
import { listPlants, getTasks } from "@/lib/mockdb";

export async function GET() {
  try {
    const plants = listPlants();
    const tasks = getTasks();
    return NextResponse.json({ plants, tasks });
  } catch (e) {
    console.error("GET /api/test failed:", e);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
}
