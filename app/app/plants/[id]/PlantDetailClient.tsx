import type { Tab } from '@/components/BottomNav';

"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import BottomNav from '@/components/BottomNav';

type CareType = "water" | "fertilize" | "repot";
type TaskDTO = {
  id: string;
  plantId: string;
  plantName: string;
  type: CareType;
  dueAt: string;
  status: "due";
  lastEventAt?: string;
};

export default function PlantDetailClient({ plant }: { plant: { id: string; name: string; species?: string; photos?: string[]; acquiredAt?: string; nextWater?: string; waterIntervalDays?: number; nextFertilize?: string; fertilizeIntervalDays?: number; light?: string; humidity?: string; potSize?: string; potMaterial?: string; soilType?: string } }) {
  const id = plant.id;
  const [name] = useState(plant.name);
  const photo = plant.photos?.[0] || "https://placehold.co/600x400?text=Plant";
  const acquired = plant.acquiredAt ? new Date(plant.acquiredAt) : null;
  const nextWater = plant.nextWater ? new Date(plant.nextWater) : null;
  const nextFertilize = plant.nextFertilize ? new Date(plant.nextFertilize) : null;
  const [allTasks, setAllTasks] = useState<TaskDTO[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [tab, setTab] = useState<"stats" | "timeline" | "notes" | "photos">("stats");

  const fmt = (d: Date) => new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(d);

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const r = await fetch(`/api/tasks?window=365d`, { cache: "no-store" });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const data: TaskDTO[] = await r.json();
        if (alive) setAllTasks(data);
      } catch (e:any) { if (alive) setErr(e?.message || "Failed to load tasks"); }
    })();
    return () => { alive = false; };
  }, []);

  const plantTasks = useMemo(() => (allTasks ?? []).filter(t => t.plantId === id), [allTasks, id]);

  const markWatered = async () => {
    try {
      const taskId = `${id}:water`;
      const r = await fetch(`/api/tasks/${encodeURIComponent(taskId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      if (!r.ok) throw new Error();
      const r2 = await fetch(`/api/tasks?window=365d`, { cache: "no-store" });
      if (r2.ok) setAllTasks(await r2.json());
    } catch { /* keep UX smooth in mock */ }
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-2 sticky top-0 bg-white/90 backdrop-blur border-b">
        <div className="flex items-center gap-2">
          <Link href="/app" aria-label="Back" className="h-9 w-9 rounded-lg grid place-items-center hover:bg-neutral-100">
            <span className="text-lg leading-none">←</span>
          </Link>
          <div className="flex items-baseline justify-between w-full">
            <h1 className="text-xl font-semibold tracking-tight">{name}</h1>
            <span className="text-sm text-neutral-500">
              {new Intl.DateTimeFormat(undefined, { weekday:"short", month:"short", day:"numeric" }).format(new Date())}
            </span>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pb-28">
        {/* Hero */}
        <div className="rounded-2xl overflow-hidden border bg-white shadow-sm mt-4">
          <img src={photo} alt={name} className="h-40 w-full object-cover bg-neutral-200" />
          <div className="p-4">
            <h2 className="text-lg font-semibold">{name}</h2>
            <div className="text-sm text-neutral-500">
              {plant.species || "—"}
              {acquired && ` • Acquired ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(acquired)}`}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 grid grid-cols-4 gap-2 text-sm">
          <button
            className={`py-2 rounded-lg border ${tab === "stats" ? "bg-white shadow-sm font-medium" : "text-neutral-600"}`}
            onClick={() => setTab("stats")}
          >
            Stats
          </button>
          <button
            className={`py-2 rounded-lg border ${tab === "timeline" ? "bg-white shadow-sm font-medium" : "text-neutral-600"}`}
            onClick={() => setTab("timeline")}
          >
            Timeline
          </button>
          <button
            className={`py-2 rounded-lg border ${tab === "notes" ? "bg-white shadow-sm font-medium" : "text-neutral-600"}`}
            onClick={() => setTab("notes")}
          >
            Notes
          </button>
          <button
            className={`py-2 rounded-lg border ${tab === "photos" ? "bg-white shadow-sm font-medium" : "text-neutral-600"}`}
            onClick={() => setTab("photos")}
          >
            Photos
          </button>
        </div>

        {tab === "stats" && (
          <div className="grid grid-cols-2 gap-3 mt-4">
            <Stat
              label="Water"
              value={
                plant.waterIntervalDays
                  ? `Every ${plant.waterIntervalDays}d${nextWater ? ` • next ${fmt(nextWater)}` : ""}`
                  : "—"
              }
            />
            <Stat
              label="Fertilize"
              value={
                plant.fertilizeIntervalDays
                  ? `Every ${plant.fertilizeIntervalDays}d${nextFertilize ? ` • next ${fmt(nextFertilize)}` : ""}`
                  : "—"
              }
            />
            <Stat label="Light" value={plant.light || "—"} />
            <Stat label="Humidity" value={plant.humidity || "—"} />
            <Stat
              label="Pot"
              value={
                plant.potSize
                  ? `${plant.potSize}${plant.potMaterial ? ` ${plant.potMaterial}` : ""}`
                  : "—"
              }
            />
            <Stat label="Soil" value={plant.soilType || "—"} />
          </div>
        )}

        {tab === "timeline" && (
          <section className="mt-4 rounded-xl border bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <div className="text-base font-medium">Timeline</div>
              <div className="text-xs text-neutral-500">Upcoming &amp; recent care</div>
            </div>
            <ul className="text-sm px-4 py-2">
              {err && <li className="py-3 text-red-600">{err}</li>}
              {!err && plantTasks.length === 0 && <li className="py-3 text-neutral-500">No tasks yet</li>}
              {!err && plantTasks.map(t => (
                <li key={t.id} className="py-3 border-b last:border-b-0">
                  {t.type === "water" ? "💧" : t.type === "fertilize" ? "🧪" : "🪴"}{" "}
                  {t.type === "water" ? "Water" : t.type === "fertilize" ? "Fertilize" : "Repot"} —{" "}
                  {new Intl.DateTimeFormat(undefined, { month:"short", day:"numeric" }).format(new Date(t.dueAt))}
                  {(() => {
                    const d = new Date(t.dueAt); const today = new Date();
                    const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
                                             new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime())/86400000);
                    return diff > 0 ? ` (In ${diff}d)` : diff === 0 ? " (Today)" : "";
                  })()}
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === "notes" && (
          <section className="mt-4 rounded-xl border bg-white shadow-sm p-4 text-sm text-neutral-500">
            No notes yet
          </section>
        )}

        {tab === "photos" && (
          <section className="mt-4 rounded-xl border bg-white shadow-sm p-4 text-sm text-neutral-500">
            No photos yet
          </section>
        )}

        <div className="h-16" />
      </main>

      {/* Sticky action bar */}
      <div className="fixed bottom-16 left-0 right-0 px-4">
        <div className="max-w-screen-sm mx-auto flex gap-2">
          <button onClick={markWatered} className="flex-1 h-10 rounded-lg bg-neutral-900 text-white text-sm font-medium">Mark Watered</button>
          <button className="flex-1 h-10 rounded-lg bg-white border text-sm font-medium">Add Photo</button>
        </div>
      </div>

      {/* Bottom nav */}
      <BottomNav value="plants" onChange={() => {}} />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border bg-white p-3 shadow-sm">
      <div className="text-xs text-neutral-500">{label}</div>
      <div className="text-base font-medium">{value}</div>
    </div>
  );
}
