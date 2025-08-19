"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend,
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Tooltip,
  Legend
);

type InsightPoint = { period: string; plantCount: number; taskCount: number };

export default function InsightsView() {
  const [start, setStart] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [end, setEnd] = useState(() => new Date().toISOString().slice(0, 10));
  const [data, setData] = useState<InsightPoint[] | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setErr(null);
        const r = await fetch(`/api/insights?start=${start}&end=${end}`, {
          cache: "no-store",
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setData(await r.json());
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load");
      }
    }
    if (start && end) load();
  }, [start, end]);

  const totalPlants = data?.reduce((s, d) => s + d.plantCount, 0) ?? 0;
  const totalTasks = data?.reduce((s, d) => s + d.taskCount, 0) ?? 0;

  const chartData = {
    labels: data ? data.map((d) => d.period) : [],
    datasets: [
      {
        label: "Plants",
        data: data ? data.map((d) => d.plantCount) : [],
        borderColor: "#86efac",
        backgroundColor: "rgba(134,239,172,0.5)",
      },
      {
        label: "Tasks",
        data: data ? data.map((d) => d.taskCount) : [],
        borderColor: "#93c5fd",
        backgroundColor: "rgba(147,197,253,0.5)",
      },
    ],
  };

  return (
    <>
      <section className="mt-4 space-y-6">
        <h2 className="text-sm font-display font-medium text-neutral-600">Insights</h2>

        {err && (
          <div className="rounded-xl border bg-white shadow-sm p-4 text-sm text-red-600">
            {err}
          </div>
        )}

        {!data && !err && <div className="text-sm text-neutral-500">Loading…</div>}

        {data && (
          <>
            <div className="flex gap-2">
              <label className="text-sm">
                Start:
                <input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="ml-1 rounded border px-1"
                />
              </label>
              <label className="text-sm">
                End:
                <input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="ml-1 rounded border px-1"
                />
              </label>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-white shadow-sm p-4 text-center">
                <div className="text-sm text-neutral-500">Plants</div>
                <div className="text-2xl font-bold">{totalPlants}</div>
              </div>
              <div className="rounded-xl border bg-white shadow-sm p-4 text-center">
                <div className="text-sm text-neutral-500">Tasks</div>
                <div className="text-2xl font-bold">{totalTasks}</div>
              </div>
            </div>
            <div className="rounded-xl border bg-white shadow-sm p-4">
              <div className="h-48">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </div>
          </>
        )}
      </section>
    </>
  );
}
