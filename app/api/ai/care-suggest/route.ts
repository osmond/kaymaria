import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // base canned suggestion
  const body = await req.json().catch(() => ({}));
  const lat = typeof body.lat === "number" ? body.lat : null;
  const lon = typeof body.lon === "number" ? body.lon : null;
  let interval = 7;
  let amount = 500;
  let et0: number | null = null;

  if (lat !== null && lon !== null) {
    try {
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&daily=et0_fao_evapotranspiration&timezone=auto`;
      const r = await fetch(url);
      if (r.ok) {
        const data = await r.json();
        et0 = data.daily?.et0_fao_evapotranspiration?.[0] ?? null;
        if (typeof et0 === "number") {
          // simple adjustment: higher ET₀ -> water more frequently
          if (et0 > 5) interval = Math.max(1, interval - 2);
          else if (et0 > 3) interval = Math.max(1, interval - 1);
          else if (et0 < 1) interval = interval + 1;
        }
      }
    } catch (e) {
      // ignore network errors and fall back to default suggestion
    }
  }

  return NextResponse.json({
    version: "mvp-2",
    water: {
      intervalDays: interval,
      amountMl: amount,
      notes: et0 ? `Adjusted for ET₀ ${et0.toFixed(2)}mm` : "Adjust in summer heat.",
    },
    fertilize: { intervalDays: 30, formula: "10-10-10 @ 1/2 strength", notes: "Skip in winter." },
    repot: { intervalDays: 365, notes: "Up 1–2 inches if root bound." },
    assumptions: ["Indoor, medium light", "6in pot", "Well-draining soil"],
    warnings: ["Watch for soggy soil (root rot risk)"],
    confidence: 0.72,
  });
}
