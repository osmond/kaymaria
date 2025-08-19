"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, Droplet, FlaskConical, Sprout, Pencil } from "lucide-react";
import EditPlantModal from '@/components/EditPlantModal';
import BottomNav from '@/components/BottomNav';
import CareSummary from '@/components/CareSummary';
import type { DrainageOption } from '@/lib/plantFormSchema';

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

type Note = { id: string; note: string; createdAt: string };

export default function PlantDetailClient({ plant }: { plant: {
  id: string;
  name: string;
  species?: string;
  roomId?: string;
  photos?: string[];
  acquiredAt?: string;
  nextWater?: string;
  waterIntervalDays?: number;
  waterAmountMl?: number;
  nextFertilize?: string;
  fertilizeIntervalDays?: number;
  fertilizeFormula?: string;
  light?: string;
  lightLevel?: string;
  humidity?: string;
  potSize?: string;
  potMaterial?: string;
  soilType?: string;
  drainage?: DrainageOption;
  indoor?: boolean;
  latitude?: number;
  longitude?: number;
} }) {
  const [plantState, setPlantState] = useState(plant);
  const id = plantState.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const [name, setName] = useState(plant.name);
  const [species, setSpecies] = useState(plant.species || "");
  const [photos, setPhotos] = useState<string[]>(plant.photos ?? []);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const heroPhoto = photos[0] || "https://placehold.co/600x400?text=Plant";
  const acquired = plantState.acquiredAt ? new Date(plantState.acquiredAt) : null;
  const [allTasks, setAllTasks] = useState<TaskDTO[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const initialTab = (searchParams.get("tab") as "stats" | "timeline" | "notes" | "photos") || "stats";
  const [tab, setTab] = useState<"stats" | "timeline" | "notes" | "photos">(initialTab);
  const [notes, setNotes] = useState<Note[]>([]);
  const [noteText, setNoteText] = useState("");
  const [undoInfo, setUndoInfo] = useState<{ task: TaskDTO; eventAt: string } | null>(null);
  const [editOpen, setEditOpen] = useState(false);
  const [weather, setWeather] = useState<{ temperature: number } | null>(null);
  const plantTasks = useMemo(() => (allTasks ?? []).filter(t => t.plantId === id), [allTasks, id]);
  const nextWater = useMemo(() => {
    const t = plantTasks
      .filter(t => t.type === "water")
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
    return t ? new Date(t.dueAt) : plantState.nextWater ? new Date(plantState.nextWater) : null;
  }, [plantTasks, plantState.nextWater]);
  const nextFertilize = useMemo(() => {
    const t = plantTasks
      .filter(t => t.type === "fertilize")
      .sort((a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime())[0];
    return t ? new Date(t.dueAt) : plantState.nextFertilize ? new Date(plantState.nextFertilize) : null;
  }, [plantTasks, plantState.nextFertilize]);
  const careTips = useMemo(() => {
    const tips: string[] = [];
    const now = Date.now();
    if (nextWater) {
      const diff = (nextWater.getTime() - now) / 864e5;
      if (weather && weather.temperature > 28 && diff > 2) {
        tips.push("Hot weather—consider watering sooner.");
      } else if (diff <= 2) {
        tips.push("Watering due soon.");
      }
    }
    if (nextFertilize) {
      const diffF = (nextFertilize.getTime() - now) / 864e5;
      if (diffF <= 7) {
        tips.push("Fertilizing due soon.");
      }
    }
    return tips;
  }, [nextWater?.getTime(), nextFertilize?.getTime(), weather]);

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

    useEffect(() => {
      let alive = true;
      (async () => {
        try {
          const r = await fetch(`/api/plants/${id}/notes`, { cache: "no-store" });
          if (!r.ok) throw new Error();
          const data: Note[] = await r.json();
          if (alive) setNotes(data);
        } catch {}
      })();
      return () => { alive = false; };
    }, [id]);

    useEffect(() => {
      let alive = true;
      (async () => {
        try {
          const r = await fetch(`/api/plants/${id}/photos`, { cache: "no-store" });
          if (!r.ok) throw new Error();
          const data: string[] = await r.json();
          if (alive) setPhotos(data);
        } catch {}
      })();
      return () => { alive = false; };
    }, [id]);

  useEffect(() => {
    let alive = true;
    if (plantState.latitude === undefined || plantState.longitude === undefined) return;
    (async () => {
      try {
        const r = await fetch(`/api/plants/${id}/weather`, { cache: "no-store" });
        if (!r.ok) throw new Error();
        const data: { temperature: number } = await r.json();
        if (alive) setWeather(data);
      } catch {}
    })();
    return () => { alive = false; };
  }, [id, plantState.latitude, plantState.longitude]);



  const iconFor = (type: CareType) => {
    const className = "inline h-4 w-4";
    switch (type) {
      case "water":
        return <Droplet className={className} />;
      case "fertilize":
        return <FlaskConical className={className} />;
      default:
        return <Sprout className={className} />;
    }
  };

  const addNote = async () => {
    const text = noteText.trim();
    if (!text) return;
    try {
      const r = await fetch(`/api/plants/${id}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ note: text }),
      });
      if (!r.ok) throw new Error();
      const rec: Note = await r.json();
      setNotes((n) => [rec, ...n]);
      setNoteText("");
    } catch {}

  };

  const markTimelineDone = async (task: TaskDTO) => {
    try {
      const r = await fetch(`/api/tasks/${encodeURIComponent(task.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      if (!r.ok) throw new Error();
      const data = await r.json();
      setUndoInfo({ task, eventAt: data.eventAt });
      const r2 = await fetch(`/api/tasks?window=365d`, { cache: "no-store" });
      if (r2.ok) setAllTasks(await r2.json());
    } catch {}
  };

  const undoTimeline = async () => {
    if (!undoInfo) return;
    try {
      await fetch(`/api/tasks/${encodeURIComponent(undoInfo.task.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ undo: true, task: undoInfo.task, eventAt: undoInfo.eventAt }),
      });
      const r2 = await fetch(`/api/tasks?window=365d`, { cache: "no-store" });
      if (r2.ok) setAllTasks(await r2.json());
    } catch {}
    setUndoInfo(null);
  };

  const addPhotoFile = async () => {
    if (!newPhotoFile) return;
    const formData = new FormData();
    formData.append("file", newPhotoFile);
    try {
      const upload = await fetch(`/api/plants/${id}/photos`, {
        method: "POST",
        body: formData,
      });
      if (!upload.ok) throw new Error();
      const { src } = await upload.json();
      if (!src) throw new Error();
      setPhotos((p) => [...p, src]);
      setNewPhotoFile(null);
    } catch {}
  };

  const removePhotoUrl = async (src: string) => {
    try {
      await fetch(`/api/plants/${id}/photos`, {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ src }),
      });
      setPhotos((p) => p.filter((s) => s !== src));
    } catch {}
  };

  const deletePlant = async () => {
    if (!confirm("Delete this plant?")) return;
    try {
      const r = await fetch(`/api/plants/${id}`, { method: "DELETE" });
      if (!r.ok) throw new Error();
      router.push("/app/plants");
      router.refresh();
    } catch {}
  };

  return (
    <div className="min-h-[100dvh] bg-neutral-50 text-neutral-900 flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-2 sticky top-0 bg-white/90 backdrop-blur border-b">
        <div className="flex items-center gap-2">
          <Link href="/app" aria-label="Back" className="h-9 w-9 rounded-lg grid place-items-center hover:bg-neutral-100">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-baseline justify-between w-full">
            <h1 className="text-xl font-display font-semibold tracking-tight">{name}</h1>
            <div className="flex items-center gap-1">
              <span className="text-sm text-neutral-500">
                {new Intl.DateTimeFormat(undefined, { weekday:"short", month:"short", day:"numeric" }).format(new Date())}
              </span>
              <button
                aria-label="Edit plant"
                onClick={() => setEditOpen(true)}
                className="h-9 w-9 rounded-lg grid place-items-center hover:bg-neutral-100"
              >
                <Pencil className="h-5 w-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pb-28">
        {/* Hero */}
        <div className="rounded-2xl overflow-hidden border bg-white shadow-sm mt-4">
        <img src={heroPhoto} alt={name} className="h-40 w-full object-cover bg-neutral-200" />
          <div className="p-4">
            <h2 className="text-lg font-display font-semibold">{name}</h2>
            <div className="text-sm text-neutral-500">
              {species || "—"}
              {acquired && ` • Acquired ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(acquired)}`}
            </div>
          </div>
        </div>
          {careTips.length > 0 && (
            <div className="mt-4 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
              {careTips.map((t, i) => (
                <div key={i}>{t}</div>
              ))}
            </div>
          )}

          <CareSummary
            nextWater={nextWater}
            nextFertilize={nextFertilize}
            waterIntervalDays={plantState.waterIntervalDays}
            fertilizeIntervalDays={plantState.fertilizeIntervalDays}
          />

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
          <div className="mt-4">
            <div className="grid grid-cols-2 gap-3">
              <Stat
                label="Water"
                value={
                  plantState.waterIntervalDays
                    ? `Every ${plantState.waterIntervalDays}d${nextWater ? ` • next ${fmt(nextWater)}` : ""}`
                    : "—"
                }
              />
              <Stat
                label="Fertilize"
                value={
                  plantState.fertilizeIntervalDays
                    ? `Every ${plantState.fertilizeIntervalDays}d${nextFertilize ? ` • next ${fmt(nextFertilize)}` : ""}`
                    : "—"
                }
              />
              <Stat label="Light" value={plantState.light || plantState.lightLevel || "—"} />
              <Stat label="Humidity" value={plantState.humidity || "—"} />
              <Stat label="Weather" value={weather ? `${Math.round(weather.temperature)}°C` : "—"} />
              <Stat
                label="Pot"
                value={
                  plantState.potSize
                    ? `${plantState.potSize}${plantState.potMaterial ? ` ${plantState.potMaterial}` : ""}`
                    : "—"
                }
              />
              <Stat label="Soil" value={plantState.soilType || "—"} />
            </div>
          </div>
        )}

        {tab === "timeline" && (
          <section className="mt-4 rounded-xl border bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <div className="text-base font-medium">Timeline</div>
              <div className="text-xs text-neutral-500">Upcoming &amp; recent care</div>
            </div>
            {undoInfo && (
              <div className="px-4 py-2 text-xs bg-green-50 text-green-800 flex justify-between">
                <span>Task completed.</span>
                <button onClick={undoTimeline} className="underline">Undo</button>
              </div>
            )}
            <ul className="text-sm px-4 py-2">
              {err && <li className="py-3 text-red-600">{err}</li>}
              {!err && plantTasks.length === 0 && <li className="py-3 text-neutral-500">No tasks yet</li>}
              {!err && plantTasks.map(t => (
                <li key={t.id} className="py-3 border-b last:border-b-0 flex justify-between items-center">
                  <span>
                    {iconFor(t.type)} {t.type === "water" ? "Water" : t.type === "fertilize" ? "Fertilize" : "Repot"} — {new Intl.DateTimeFormat(undefined, { month:"short", day:"numeric" }).format(new Date(t.dueAt))}
                    {(() => {
                      const d = new Date(t.dueAt); const today = new Date();
                      const diff = Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() - new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime())/86400000);
                      return diff > 0 ? ` (In ${diff}d)` : diff === 0 ? " (Today)" : "";
                    })()}
                  </span>
                  <button onClick={() => markTimelineDone(t)} className="text-xs text-blue-600">Done</button>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === "notes" && (
          <section className="mt-4 rounded-xl border bg-white shadow-sm p-4 text-sm">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addNote();
              }}
            >
              <textarea
                value={noteText}
                onChange={(e) => setNoteText(e.target.value)}
                placeholder="Write a note..."
                className="w-full border rounded p-2 text-sm"
              />
              <div className="text-right mt-2">
                <button type="submit" className="px-3 py-1 rounded bg-neutral-900 text-white text-xs">
                  Add Note
                </button>
              </div>
            </form>
            <ul className="mt-4 space-y-3">
              {notes.length === 0 && <li className="text-neutral-500">No notes yet</li>}
              {notes.map((n) => (
                <li key={n.id} className="border-t pt-2 first:border-t-0 first:pt-0">
                  <div>{n.note}</div>
                  <div className="text-xs text-neutral-500">
                    {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(n.createdAt))}
                  </div>
                </li>
              ))}
            </ul>
          </section>
        )}

        {tab === "photos" && (
          <section className="mt-4 rounded-xl border bg-white shadow-sm p-4">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                addPhotoFile();
                e.currentTarget.reset();
              }}
              className="flex gap-2 mb-4"
            >
              <input
                type="file"
                accept="image/*"
                capture="environment"
                onChange={(e) => setNewPhotoFile(e.target.files?.[0] || null)}
                className="flex-1 border rounded p-2 text-sm"
              />
              <button
                type="submit"
                className="px-3 py-2 rounded bg-neutral-900 text-white text-sm"
                disabled={!newPhotoFile}
              >
                Add
              </button>
            </form>
            {photos.length > 0 ? (
              <div className="grid grid-cols-3 gap-2">
                {photos.map((src, i) => (
                  <div key={i} className="relative">
                    <img
                      src={src}
                      alt={`${plantState.name} photo ${i + 1}`}
                      className="w-full h-24 object-cover rounded"
                    />
                    <button
                      type="button"
                      onClick={() => removePhotoUrl(src)}
                      className="absolute top-1 right-1 text-xs bg-white/80 rounded-full px-1"
                      aria-label="Remove photo"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-sm text-neutral-500 text-center">No photos yet</div>
            )}
          </section>
        )}

        <button
          onClick={deletePlant}
          className="mt-4 w-full rounded-lg border border-red-200 bg-red-50 py-2 text-sm text-red-700"
        >
          Delete plant
        </button>
        <div className="h-16" />
      </main>

      {/* Bottom nav */}
      <BottomNav value="plants" />
      <EditPlantModal
        open={editOpen}
        onOpenChange={setEditOpen}
        plant={plantState}
        onUpdated={(p) => {
          setPlantState(p);
          setName(p.name);
          setSpecies(p.species || "");
        }}
      />
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
