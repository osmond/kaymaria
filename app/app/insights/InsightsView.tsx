"use client";

import { useEffect, useState } from "react";
import InsightsSkeleton from "./InsightsSkeleton";
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

type InsightPoint = {
  period: string;
  newPlantCount: number;
  completedTaskCount: number;
  overdueTaskCount: number;
};

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

  const totalNewPlants =
    data?.reduce((s, d) => s + d.newPlantCount, 0) ?? 0;
  const totalCompletedTasks =
    data?.reduce((s, d) => s + d.completedTaskCount, 0) ?? 0;
  const totalOverdueTasks =
    data?.reduce((s, d) => s + d.overdueTaskCount, 0) ?? 0;

  const chartData = {
    labels: data ? data.map((d) => d.period) : [],
    datasets: [
      {
        label: "Completed Tasks",
        data: data ? data.map((d) => d.completedTaskCount) : [],
        borderColor: "#93c5fd",
        backgroundColor: "rgba(147,197,253,0.5)",
      },
      {
        label: "Overdue Tasks",
        data: data ? data.map((d) => d.overdueTaskCount) : [],
        borderColor: "#fca5a5",
        backgroundColor: "rgba(252,165,165,0.5)",
      },
      {
        label: "New Plants",
        data: data ? data.map((d) => d.newPlantCount) : [],
        borderColor: "#86efac",
        backgroundColor: "rgba(134,239,172,0.5)",
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

        {!data && !err && <InsightsSkeleton />}

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
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-xl border bg-white shadow-sm p-4 text-center">
                <div className="text-sm text-neutral-500">Completed Tasks</div>
                <div className="text-2xl font-bold">{totalCompletedTasks}</div>
              </div>
              <div className="rounded-xl border bg-white shadow-sm p-4 text-center">
                <div className="text-sm text-neutral-500">Overdue Tasks</div>
                <div className="text-2xl font-bold">{totalOverdueTasks}</div>
              </div>
              <div className="rounded-xl border bg-white shadow-sm p-4 text-center">
                <div className="text-sm text-neutral-500">New Plants</div>
                <div className="text-2xl font-bold">{totalNewPlants}</div>
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
