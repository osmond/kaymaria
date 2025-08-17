import { NextResponse } from "next/server";

export async function POST() {
  // canned suggestion used by AddPlantModal
  return NextResponse.json({
    version: "mvp-1",
    water: { intervalDays: 7, amountMl: 500, notes: "Adjust in summer heat." },
    fertilize: { intervalDays: 30, formula: "10-10-10 @ 1/2 strength", notes: "Skip in winter." },
    repot: { intervalDays: 365, notes: "Up 1–2 inches if root bound." },
    assumptions: ["Indoor, medium light", "6in pot", "Well-draining soil"],
    warnings: ["Watch for soggy soil (root rot risk)"],
    confidence: 0.72
  });
}
