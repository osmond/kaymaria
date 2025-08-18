"use client";

import { useEffect, useState } from "react";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

type Insights = { plantCount: number; taskCount: number };

export default function InsightsView() {
  const [data, setData] = useState<Insights | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        setErr(null);
        const r = await fetch("/api/insights", { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        setData(await r.json());
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load");
      }
    }
    load();
  }, []);

  const chartData = {
    labels: ["Plants", "Tasks"],
    datasets: [
      {
        label: "Count",
        data: data ? [data.plantCount, data.taskCount] : [0, 0],
        backgroundColor: ["#86efac", "#93c5fd"],
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
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border bg-white shadow-sm p-4 text-center">
                <div className="text-sm text-neutral-500">Plants</div>
                <div className="text-2xl font-bold">{data.plantCount}</div>
              </div>
              <div className="rounded-xl border bg-white shadow-sm p-4 text-center">
                <div className="text-sm text-neutral-500">Tasks</div>
                <div className="text-2xl font-bold">{data.taskCount}</div>
              </div>
            </div>
            <div className="rounded-xl border bg-white shadow-sm p-4">
              <div className="h-48">
                <Bar
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                    plugins: { legend: { display: false } },
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

