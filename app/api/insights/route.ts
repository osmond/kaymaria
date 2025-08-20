import { NextRequest, NextResponse } from "next/server";
import { createRouteHandlerClient } from "@/lib/supabase";
import { getUserId } from "@/lib/getUserId";

type InsightPoint = {
  period: string;
  newPlantCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
};

export async function GET(req: NextRequest) {
  const url = (req as any).nextUrl ?? new URL(req.url, "http://localhost");
  const startParam = url.searchParams.get("start");
  const endParam = url.searchParams.get("end");

  const endDate = endParam ? new Date(endParam) : new Date();
  const startDate = startParam ? new Date(startParam) : new Date(endDate);

  // Default to last 7 days if start not provided
  if (!startParam) startDate.setDate(endDate.getDate() - 6);

  // Normalize to start/end of day boundaries
  startDate.setHours(0, 0, 0, 0);
  endDate.setHours(23, 59, 59, 999);

  const supabase = await createRouteHandlerClient();
  const userRes = await getUserId(supabase);
  if ("error" in userRes) {
    if (userRes.error === "unauthorized")
      return NextResponse.json({ error: "unauthorized" }, { status: 401 });
    return NextResponse.json({ error: "misconfigured server" }, { status: 500 });
  }
  const { userId } = userRes;

  const startIso = startDate.toISOString();
  const endIso = endDate.toISOString();

  const [plantRes, completedRes, dueRes] = await Promise.all([
    supabase
      .from("plants")
      .select("created_at")
      .eq("user_id", userId)
      .gte("created_at", startIso)
      .lte("created_at", endIso),
    supabase
      .from("tasks")
      .select("last_done_at")
      .eq("user_id", userId)
      .gte("last_done_at", startIso)
      .lte("last_done_at", endIso),
    supabase
      .from("tasks")
      .select("due_at, last_done_at")
      .eq("user_id", userId)
      .gte("due_at", startIso)
      .lte("due_at", endIso),
  ]);

  if (plantRes.error) {
    console.error("GET /api/insights plant count failed:", plantRes.error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
  if (completedRes.error) {
    console.error(
      "GET /api/insights completed task count failed:",
      completedRes.error,
    );
    return NextResponse.json({ error: "server" }, { status: 500 });
  }
  if (dueRes.error) {
    console.error("GET /api/insights overdue task count failed:", dueRes.error);
    return NextResponse.json({ error: "server" }, { status: 500 });
  }

  // Prepare daily buckets
  const points: InsightPoint[] = [];
  for (
    let d = new Date(startDate);
    d <= endDate;
    d.setDate(d.getDate() + 1)
  ) {
    points.push({
      period: d.toISOString().slice(0, 10),
      newPlantCount: 0,
      completedTaskCount: 0,
      overdueTaskCount: 0,
    });
  }
  const map = new Map(points.map((p) => [p.period, p]));

  plantRes.data?.forEach((row: any) => {
    const key = row.created_at.slice(0, 10);
    const p = map.get(key);
    if (p) p.newPlantCount++;
  });
  completedRes.data?.forEach((row: any) => {
    const key = row.last_done_at.slice(0, 10);
    const p = map.get(key);
    if (p) p.completedTaskCount++;
  });
  dueRes.data?.forEach((row: any) => {
    const key = row.due_at.slice(0, 10);
    const p = map.get(key);
    if (p && (!row.last_done_at || row.last_done_at < row.due_at))
      p.overdueTaskCount++;
  });

  return NextResponse.json(points);
}
