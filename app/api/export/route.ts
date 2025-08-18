import { NextRequest, NextResponse } from "next/server";
import { dump } from "@/lib/mockdb";

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get("format");
  const { tasks, plants } = dump();

  if (format === "csv") {
    const header = "id,plantId,plantName,roomId,type,dueAt,status,lastEventAt";
    const rows = tasks.map(t =>
      [
        t.id,
        t.plantId,
        t.plantName,
        t.roomId,
        t.type,
        t.dueAt,
        t.status,
        t.lastEventAt ?? "",
      ].join(","),
    );

    return new NextResponse([header, ...rows].join("\n"), {
      headers: {
        "Content-Type": "text/csv",
        "Cache-Control": "no-store",
      },
    });
  }

  return NextResponse.json(
    { plants, tasks },
    { headers: { "Cache-Control": "no-store" } },
  );
}
