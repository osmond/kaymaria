"use client";

import { useEffect, useState } from "react";
import InsightsSkeleton from "./InsightsSkeleton";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
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
        <h2 className="text-sm font-display font-medium text-foreground">Insights</h2>

        {err && (
          <Card className="p-4 text-sm text-destructive">
            {err}
          </Card>
        )}

        {!data && !err && <InsightsSkeleton />}

        {data && (
          <>
            <div className="flex gap-2">
              <Label className="flex items-center gap-1">
                Start:
                <Input
                  type="date"
                  value={start}
                  onChange={(e) => setStart(e.target.value)}
                  className="w-auto"
                />
              </Label>
              <Label className="flex items-center gap-1">
                End:
                <Input
                  type="date"
                  value={end}
                  onChange={(e) => setEnd(e.target.value)}
                  className="w-auto"
                />
              </Label>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center">
                <CardHeader className="space-y-1">
                  <CardDescription>Completed Tasks</CardDescription>
                  <CardTitle className="text-2xl font-bold">
                    {totalCompletedTasks}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader className="space-y-1">
                  <CardDescription>Overdue Tasks</CardDescription>
                  <CardTitle className="text-2xl font-bold">
                    {totalOverdueTasks}
                  </CardTitle>
                </CardHeader>
              </Card>
              <Card className="text-center">
                <CardHeader className="space-y-1">
                  <CardDescription>New Plants</CardDescription>
                  <CardTitle className="text-2xl font-bold">
                    {totalNewPlants}
                  </CardTitle>
                </CardHeader>
              </Card>
            </div>
            <Card className="p-4">
              <div className="h-48">
                <Line
                  data={chartData}
                  options={{
                    responsive: true,
                    maintainAspectRatio: false,
                  }}
                />
              </div>
            </Card>
          </>
        )}
      </section>
    </>
  );
}
