"use client";

import Link from "next/link";
 import { useEffect, useMemo, useState, useRef } from "react";
 import { usePathname, useRouter, useSearchParams } from "next/navigation";
 import { ArrowLeft, Droplet, FlaskConical, Sprout, Pencil, MoreVertical } from "lucide-react";
import BottomNav from '@/components/BottomNav';
import CareSummary from '@/components/CareSummary';
import { Card, CardHeader, CardContent, CardTitle, CardDescription } from '@/components/ui/card';
import type { Plant } from '@prisma/client';

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

type PlantExtras = {
  photos?: string[];
  acquiredAt?: string;
  nextWater?: string;
  waterIntervalDays?: number;
  waterAmountMl?: number;
  nextFertilize?: string;
  fertilizeIntervalDays?: number;
  fertilizeFormula?: string;
  light?: string;
  humidity?: string;
};

type Tab = "stats" | "timeline" | "notes" | "photos";

export default function PlantDetailClient({ plant }: { plant: Plant & PlantExtras }) {
  const plantState = plant;
  const id = plantState.id;
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const name = plant.name;
  const species = plant.species || "";
  const [photos, setPhotos] = useState<string[]>(plant.photos ?? []);
  const [newPhotoFile, setNewPhotoFile] = useState<File | null>(null);
  const heroPhoto = photos[0] || "https://placehold.co/600x400?text=Plant";
  const acquired = plantState.acquiredAt ? new Date(plantState.acquiredAt) : null;
  const [allTasks, setAllTasks] = useState<TaskDTO[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const initialTab = (searchParams.get("tab") as Tab) || "stats";
  const [tab, setTab] = useState<Tab>(initialTab);
  const [notes, setNotes] = useState<Note[] | null>(null);
  const [noteText, setNoteText] = useState("");
  const [undoInfo, setUndoInfo] = useState<{ task: TaskDTO; eventAt: string } | null>(null);
  const [weather, setWeather] = useState<{ temperature: number } | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
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
    const param = (searchParams.get("tab") as Tab) || "stats";
    setTab(prev => (prev === param ? prev : param));
  }, [searchParams]);

  useEffect(() => {
    const current = searchParams.get("tab") || "stats";
    if ((tab === "stats" && current === "stats") || tab === current) return;
    const sp = new URLSearchParams(searchParams.toString());
    if (tab === "stats") sp.delete("tab"); else sp.set("tab", tab);
    const qs = sp.toString();
    router.replace(qs ? `${pathname}?${qs}` : pathname, { scroll: false });
  }, [tab, pathname, router, searchParams]);

    useEffect(() => {
      let alive = true;
      (async () => {
    try {
      const r = await fetch(`/api/plants/${id}/notes`, { cache: "no-store" });
      if (!r.ok) throw new Error();
      const data: Note[] = await r.json();
      if (alive) setNotes(data);
    } catch {
      if (alive) setNotes([]);
    }
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

  useEffect(() => {
    const clickHandler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    const keyHandler = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setMenuOpen(false);
      }
    };
    document.addEventListener("click", clickHandler);
    document.addEventListener("keydown", keyHandler);
    return () => {
      document.removeEventListener("click", clickHandler);
      document.removeEventListener("keydown", keyHandler);
    };
  }, []);



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
      setNotes((n) => [rec, ...(n || [])]);
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
    <div className="min-h-[100dvh] bg-background text-foreground flex flex-col">
      {/* Header */}
      <header className="px-4 pt-6 pb-2 sticky top-0 bg-background/90 backdrop-blur border-b border-border">
        <div className="flex items-center gap-2">
          <Link
            href="/app/plants"
            aria-label="Back to plants"
            className="h-9 w-9 rounded-lg grid place-items-center hover:bg-secondary"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-baseline justify-between w-full">
            <h1 className="text-xl font-display font-semibold tracking-tight">{name}</h1>
            <div className="flex items-center gap-1">
              <span className="text-sm text-muted">
                {new Intl.DateTimeFormat(undefined, { weekday:"short", month:"short", day:"numeric" }).format(new Date())}
              </span>
              <Link
                href={`/app/plants/${id}/edit`}
                aria-label="Edit plant"

                onClick={() => setEditOpen(true)}
            className="h-9 w-9 rounded-lg grid place-items-center hover:bg-secondary"

              >
                <Pencil className="h-5 w-5" />
              </Link>
              <div ref={menuRef} className="relative">
                <button
                  aria-label="More options"
                  onClick={() => setMenuOpen(o => !o)}
                  className="h-9 w-9 rounded-lg grid place-items-center hover:bg-secondary"
                >
                  <MoreVertical className="h-5 w-5" />
                </button>
                {menuOpen && (
                  <div className="absolute right-0 z-10 mt-1 w-28 rounded-md border border-border bg-white shadow-card py-1 text-sm">

                    <button
                      onClick={() => {
                        setEditOpen(true);
                        setMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-1.5 hover:bg-secondary"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => { setMenuOpen(false); deletePlant(); }}
                      className="w-full text-left px-3 py-1.5 hover:bg-secondary text-destructive"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 px-4 pb-28">
        {/* Hero */}
        <Card className="overflow-hidden mt-4">
          <img src={heroPhoto} alt={name} className="w-full aspect-[4/3] object-cover bg-border" />
          <CardContent>
            <h2 className="text-lg font-display font-semibold">{name}</h2>
            <div className="text-sm text-muted">
              {species || "—"}
              {acquired && ` • Acquired ${new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric", year: "numeric" }).format(acquired)}`}
            </div>
          </CardContent>
        </Card>
          {careTips.length > 0 && (
            <div className="mt-4 rounded-lg border border-warning/20 bg-warning/10 p-3 text-sm text-warning">
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
            className={`py-2 rounded-lg border border-border ${tab === "stats" ? "bg-white shadow-sm font-medium" : "text-muted"}`}
            onClick={() => setTab("stats")}
          >
            Stats
          </button>
          <button
            className={`py-2 rounded-lg border border-border ${tab === "timeline" ? "bg-white shadow-sm font-medium" : "text-muted"}`}
            onClick={() => setTab("timeline")}
          >
            Timeline
          </button>
          <button
            className={`py-2 rounded-lg border border-border ${tab === "notes" ? "bg-white shadow-sm font-medium" : "text-muted"}`}
            onClick={() => setTab("notes")}
          >
            Notes
          </button>
          <button
            className={`py-2 rounded-lg border border-border ${tab === "photos" ? "bg-white shadow-sm font-medium" : "text-muted"}`}
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
          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Timeline</CardTitle>
              <CardDescription>Upcoming &amp; recent care</CardDescription>
            </CardHeader>
            {undoInfo && (

              <div className="px-4 md:px-6 py-2 text-xs bg-green-50 text-green-800 flex justify-between">

                <span>Task completed.</span>
                <button onClick={undoTimeline} className="underline">Undo</button>
              </div>
            )}

            <CardContent className="pt-2">
              <ul className="text-sm">
                {allTasks === null && !err && (
                  <>
                    {[0, 1, 2].map(i => (
                      <li key={i} className="py-3 border-b border-border last:border-b-0 flex justify-between items-center animate-pulse">
                        <span className="h-4 w-1/2 bg-border rounded" />
                        <span className="h-4 w-10 bg-border rounded" />
                      </li>
                    ))}
                  </>
                )}
                {err && <li className="py-3 text-red-600">{err}</li>}
                {!err && allTasks !== null && plantTasks.length === 0 && <li className="py-3 text-muted">No tasks yet</li>}
                {!err && allTasks !== null && plantTasks.map(t => (
                  <li key={t.id} className="py-3 border-b border-border last:border-b-0 flex justify-between items-center">
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
            </CardContent>
          </Card>

        )}

        {tab === "notes" && (
          <Card className="mt-4 text-sm">
            <CardContent>
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
                  className="w-full border border-border rounded p-2 text-sm"
                />
                <div className="text-right mt-2">
                  <button type="submit" className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs">
                    Add Note
                  </button>
                </div>
              </form>
              <ul className="mt-4 space-y-3">
                {notes === null && <li className="h-4 bg-border rounded animate-pulse" />}
                {notes !== null && notes.length === 0 && <li className="text-muted">No notes yet</li>}
                {notes?.map((n) => (
                  <li key={n.id} className="border-t border-border pt-2 first:border-t-0 first:pt-0">
                    <div>{n.note}</div>
                    <div className="text-xs text-muted">
                      {new Intl.DateTimeFormat(undefined, { month: "short", day: "numeric" }).format(new Date(n.createdAt))}
                    </div>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        )}

        {tab === "photos" && (
          <Card className="mt-4">
            <CardContent>
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
                  className="flex-1 border border-border rounded p-2 text-sm"
                />
                <button
                  type="submit"
                  className="px-3 py-2 rounded bg-primary text-primary-foreground text-sm"
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
                <div className="text-sm text-muted text-center">No photos yet</div>
              )}
            </CardContent>
          </Card>
        )}

        <div className="h-16" />
      </main>

      {/* Bottom nav */}
      <BottomNav value="plants" />
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <Card>
      <CardContent>
        <div className="text-xs text-muted">{label}</div>
        <div className="text-base font-medium">{value}</div>
      </CardContent>
    </Card>
  );
}
