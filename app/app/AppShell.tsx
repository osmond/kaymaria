"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import Fab from "@/components/Fab";
import TaskRow from "@/components/TaskRow";
import QuickAddModal from "@/components/QuickAddModal";
import AddPlantModal from "@/components/AddPlantModal";
import EditTaskModal from "@/components/EditTaskModal";
import ThemeToggle from "@/components/ThemeToggle";
import { TaskDTO } from "@/lib/types";
import { supabase } from "@/lib/supabase";
import { motion } from "framer-motion";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Check,
  AlertCircle,
  Droplet,
  Home,
  X,
  Filter as FilterIcon,
} from "lucide-react";

const DEFAULT_TASK_WINDOW_DAYS = Number(
  process.env.NEXT_PUBLIC_TASK_WINDOW_DAYS ?? "7"
);
const URGENT_WINDOW_DAYS = 2;

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
function dueLabel(dueAt: Date, today: Date) {
  const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const d0 = new Date(dueAt.getFullYear(), dueAt.getMonth(), dueAt.getDate());
  const diff = Math.round((d0.getTime() - t0.getTime()) / 86400000);
  if (diff <= 0) return "Today";
  if (diff === 1) return "Tomorrow";
  return `In ${diff}d`;
}
function timeAgo(d: Date) {
  const diff = Math.max(0, Date.now() - d.getTime());
  const days = Math.floor(diff / 86400000);
  if (days > 0) return days + "d ago";
  const h = Math.floor(diff / 3600000);
  if (h > 0) return h + "h ago";
  const m = Math.floor(diff / 60000);
  return m + "m ago";
}
function labelForType(t: "water" | "fertilize" | "repot") {
  return t === "water" ? "Water" : t === "fertilize" ? "Fertilize" : "Repot";
}

function pastTenseLabel(t: "water" | "fertilize" | "repot") {
  return t === "water"
    ? "Watered"
    : t === "fertilize"
    ? "Fertilized"
    : "Repotted";
}

// Client-only date to avoid hydration drift
function ClientDate() {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date())
    );
  }, []);
  return (
    <span suppressHydrationWarning className="text-sm text-neutral-500">
      {text}
    </span>
  );
}

function CompleteFlash() {
  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      <motion.div
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1.2, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        className="rounded-full bg-emerald-500 p-4 text-white"
      >
        <Check className="h-6 w-6" />
      </motion.div>
    </div>
  );
}

type PlantListItem = { id: string; name: string; roomId?: string };
type EventDTO = { id: string; plantId: string; plantName: string; type: "water" | "fertilize" | "repot"; at: string };

export default function AppShell({ initialView }:{ initialView?: "today"|"timeline"|"plants"|"insights"|"settings" }) {
  type View = "today" | "timeline" | "plants" | "insights" | "settings";
  const [view, setView] = useState<View>(initialView ?? "today");
  const [homeTab, setHomeTab] = useState<"today" | "upcoming">("today");
  const [taskWindow, setTaskWindow] = useState(DEFAULT_TASK_WINDOW_DAYS);
  const [ready, setReady] = useState(false);

  // modals
  const [addOpen, setAddOpen] = useState(false);
  const [addPlantOpen, setAddPlantOpen] = useState(false);
  const [prefillPlantName, setPrefillPlantName] = useState("");
  const [editTask, setEditTask] = useState<TaskDTO | null>(null);

  // ui
  const [confetti, setConfetti] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    action?: { label: string; onClick: () => void };
  }>({ visible: false, message: "" });
  const timer = useRef<number | null>(null);

  // data
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const notifiedRef = useRef<Set<string>>(new Set());

  // events list for Timeline tab
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventsErr, setEventsErr] = useState<string | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState("");

  // plants list for Plants tab
  const [plants, setPlants] = useState<PlantListItem[]>([]);
  const [plantsErr, setPlantsErr] = useState<string | null>(null);
  const [plantsLoading, setPlantsLoading] = useState(false);

  // room, type & status filters
  const [roomFilter, setRoomFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const rooms = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => set.add(t.roomId));
    return Array.from(set);
  }, [tasks]);
  const types = useMemo(() => {
    const set = new Set<string>();
    tasks.forEach((t) => set.add(t.type));
    return Array.from(set);
  }, [tasks]);
  const filteredTasks = useMemo(() => {
    const now = Date.now();
    const urgentMax = now + URGENT_WINDOW_DAYS * 864e5;
    return tasks.filter((t) => {
      const due = new Date(t.dueAt).getTime();
      const statusOk =
        statusFilter === "overdue"
          ? due < now
          : statusFilter === "urgent"
          ? due >= now && due <= urgentMax
          : true;
      return (
        (!roomFilter || t.roomId === roomFilter) &&
        (!typeFilter || t.type === typeFilter) &&
        statusOk
      );
    });
  }, [tasks, roomFilter, typeFilter, statusFilter]);

  const filteredEvents = useMemo(() => {
    return eventTypeFilter
      ? events.filter((e) => e.type === eventTypeFilter)
      : events;
  }, [events, eventTypeFilter]);

  async function refresh(window = taskWindow) {
    setLoading(true);
    setErr(null);
    try {
      const r = await fetch(`/api/tasks?window=${window}d`, {
        cache: "no-store",
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      setTasks(await r.json());
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    } finally {
      setLoading(false);
      sync();
    }
  }
  useEffect(() => {
    if (ready) refresh(taskWindow);
  }, [taskWindow, ready]);

  useEffect(() => {
    supabase.auth.getSession().then(async ({ data: { session } }) => {
      if (!session) {
        window.location.href = "/login";
      } else {
        await fetch("/api/sync", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        setReady(true);
      }
    });
  }, []);

  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "Notification" in window &&
      Notification.permission === "default"
    ) {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (typeof window === "undefined" || !("Notification" in window)) return;
    if (Notification.permission !== "granted") return;
    const now = Date.now();
    tasks.forEach((t) => {
      const due = new Date(t.dueAt).getTime();
      if (due < now && !notifiedRef.current.has(t.id)) {
        new Notification(`${t.plantName}: ${labelForType(t.type)} overdue`);
        notifiedRef.current.add(t.id);
      }
    });
  }, [tasks]);

  useEffect(() => {
    (async () => {
      try {
        setEventsLoading(true);
        setEventsErr(null);
        const r = await fetch(`/api/events?window=30d`, { cache: "no-store" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        setEvents(await r.json());
      } catch (e: any) {
        setEventsErr(e?.message || "Failed to load");
      } finally {
        setEventsLoading(false);
      }
    })();
  }, []);

  // Load plants list once we first visit the Plants tab
  useEffect(() => {
    if (view !== "plants" || plants.length || plantsLoading) return;
    (async () => {
      try {
        setPlantsLoading(true);
        setPlantsErr(null);
        const r = await fetch("/api/plants", { cache: "no-store" });
        if (!r.ok) throw new Error("HTTP " + r.status);
        const data = await r.json();
        // Map to the minimal fields we need
        setPlants(
          (data as any[]).map((p) => ({ id: p.id, name: p.name, roomId: p.roomId }))
        );
      } catch (e: any) {
        setPlantsErr(e?.message || "Failed to load plants");
      } finally {
        setPlantsLoading(false);
      }
    })();
  }, [view, plants.length, plantsLoading]);

  const trigger = () => {
    const id = Math.floor(Math.random() * 1e9);
    setConfetti((p) => [...p, id]);
    window.setTimeout(
      () => setConfetti((p) => p.filter((n) => n !== id)),
      1200
    );
  };
  const toast = (
    m: string,
    action?: { label: string; onClick: () => void }
  ) => {
    if (timer.current) window.clearTimeout(timer.current);
    setSnackbar({ visible: true, message: m, action });
    // @ts-ignore
    timer.current = window.setTimeout(
      () => setSnackbar({ visible: false, message: "" }),
      5000
    );
  };

  async function sync() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
      await fetch("/api/sync", {
        method: "POST",
        headers: { Authorization: `Bearer ${session.access_token}` },
      });
    }
  }

  // Composite id so the API matches "plantId:type"
  const complete = async (t: TaskDTO) => {
    try {
      setTasks((prev) => prev.filter((x) => x.id !== t.id));
      const compositeId = `${t.plantId}:${t.type}`;
      const r = await fetch(`/api/tasks/${encodeURIComponent(compositeId)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "done" }),
      });
      if (!r.ok) throw new Error();
      trigger();
      const time = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      toast(`${pastTenseLabel(t.type)}! ${time}`, {
        label: "Undo",
        onClick: () => setTasks((prev) => [t, ...prev]),
      });
      refresh();
    } catch {
      toast("Failed to complete");
      setTasks((prev) => [t, ...prev]);
    }
  };

  const deferTask = async (t: TaskDTO) => {
    try {
      setTasks((prev) => prev.filter((x) => x.id !== t.id));
      const r = await fetch(`/api/tasks/${encodeURIComponent(t.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ deferDays: 1 }),
      });
      if (!r.ok) throw new Error();
      toast(`${labelForType(t.type)} • ${t.plantName} deferred`);
      refresh();
    } catch {
      toast("Failed to defer");
      refresh();
    }
  };

  const updateTaskDetails = async (updates: {
    action: "Water" | "Fertilize" | "Repot";
    due: string;
  }) => {
    if (!editTask) return;
    function optionToISO(opt: string) {
      const d = new Date();
      if (opt === "Tomorrow") d.setDate(d.getDate() + 1);
      else if (opt.startsWith("In "))
        d.setDate(d.getDate() + Number(opt.replace(/[^0-9]/g, "")));
      return d.toISOString();
    }
    try {
      const r = await fetch(`/api/tasks/${encodeURIComponent(editTask.id)}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: updates.action.toLowerCase(),
          dueAt: optionToISO(updates.due),
        }),
      });
      if (!r.ok) throw new Error();
      const rec = await r.json();
      setTasks((prev) => prev.map((t) => (t.id === rec.id ? rec : t)));
      toast("Task updated");
    } catch {
      toast("Failed to update task");
    } finally {
      setEditTask(null);
      refresh();
    }
  };

  const remove = (t: TaskDTO) => {
    setTasks((prev) => prev.filter((x) => x.id !== t.id));
    toast(`Dismissed • ${t.plantName}`, {
      label: "Undo",
      onClick: () => setTasks((prev) => [t, ...prev]),
    });
  };

  const addNote = async (plantId: string, text: string) => {
    try {
      const r = await fetch(`/api/plants/${plantId}/notes`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      if (!r.ok) throw new Error();
      toast("Note added");
      sync();
    } catch {
      toast("Failed to add note");
    }
  };

  const openAddPlant = (name: string) => {
    setAddOpen(false);
    setPrefillPlantName(name);
    setTimeout(() => setAddPlantOpen(true), 50);
  };

  const onPlantCreated = (name: string) => {
    setAddPlantOpen(false);
    toast(`${name} created`);
    refresh();
    // Optionally refresh plants list next time user visits the tab
    setPlants([]);
  };

  // create task from Quick Add -> POST /api/tasks (mock)
  async function createQuickTask(payload: {
    plant: string;
    action: "Water" | "Fertilize" | "Repot";
    due: string;
  }) {
    try {
      const r = await fetch("/api/tasks", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!r.ok) throw new Error("HTTP " + r.status);
      const created: TaskDTO = await r.json();
      setTasks((prev) => [created, ...prev]);
      trigger();
      toast(`${payload.action} • ${payload.plant} added`);
      sync();
    } catch (e: any) {
      toast("Failed to add task");
    }
  }

  const today = new Date();
  const tasksToday = useMemo(() => {
    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    return filteredTasks
      .filter((t) => new Date(t.dueAt) < tomorrow)
      .sort(
        (a, b) =>
          new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      );
  }, [filteredTasks]);
  const tasksTodayGrouped = useMemo(() => {
    const m = new Map<string, TaskDTO[]>();
    tasksToday.forEach((t) => {
      const arr = m.get(t.plantName) || [];
      arr.push(t);
      m.set(t.plantName, arr);
    });
    const groups = Array.from(m.entries()).map(([plant, items]) => [
      plant,
      items.sort(
        (a, b) =>
          new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime()
      ),
    ]) as [string, TaskDTO[]][];
    groups.sort(
      (a, b) =>
        new Date(a[1][0].dueAt).getTime() - new Date(b[1][0].dueAt).getTime()
    );
    return groups;
  }, [tasksToday]);
  const upcoming = useMemo(() => {
    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1
    );
    const windowEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + taskWindow
    );
    const m = new Map<string, TaskDTO[]>();
    filteredTasks
      .filter((t) => {
        const d = new Date(t.dueAt);
        return d >= tomorrow && d < windowEnd;
      })
      .forEach((t) => {
        const label = new Intl.DateTimeFormat(undefined, {
          weekday: "short",
          month: "short",
          day: "numeric",
        }).format(new Date(t.dueAt));
        m.set(label, [...(m.get(label) || []), t]);
      });
    return Array.from(m.entries());
  }, [filteredTasks, taskWindow]);

  return (
    <div className="min-h-[100dvh] flex flex-col w-full max-w-screen-sm mx-auto">
      <header
        className="px-4 pb-2 sticky top-0 z-20 bg-gradient-to-b from-white/90 to-neutral-50/60 backdrop-blur border-b"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
      >
        <div className="flex items-baseline justify-between w-full">
          <h1 className="text-xl font-display font-semibold">
            {view === "today"
              ? homeTab === "today"
                ? "Today"
                : "Upcoming"
              : view[0].toUpperCase() + view.slice(1)}
          </h1>
          <ClientDate />
        </div>
        {view === "today" && (
          <>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                className={
                  homeTab === "today"
                    ? "bg-neutral-900 text-white rounded px-3 py-2"
                    : "border rounded px-3 py-2"
                }
                onClick={() => setHomeTab("today")}
              >
                Today
              </button>
              <button
                className={
                  homeTab === "upcoming"
                    ? "bg-neutral-900 text-white rounded px-3 py-2"
                    : "border rounded px-3 py-2"
                }
                onClick={() => setHomeTab("upcoming")}
              >
                Upcoming
              </button>
            </div>
            {homeTab === "upcoming" && (
              <div className="mt-3 flex justify-end">
                <div className="inline-flex rounded border overflow-hidden text-xs">
                  <button
                    className={
                      taskWindow === 7
                        ? "bg-neutral-900 text-white px-3 py-1"
                        : "px-3 py-1"
                    }
                    onClick={() => setTaskWindow(7)}
                  >
                    Next 7 days
                  </button>
                  <button
                    className={
                      taskWindow === 30
                        ? "bg-neutral-900 text-white px-3 py-1"
                        : "px-3 py-1"
                    }
                    onClick={() => setTaskWindow(30)}
                  >
                    Next 30 days
                  </button>
                </div>
              </div>
            )}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <Select
                value={roomFilter || undefined}
                onValueChange={(v) => setRoomFilter(v)}
              >
                <SelectTrigger className="flex h-9 w-full items-center gap-2 rounded border px-3 text-sm">
                  <Home className="h-4 w-4 text-neutral-500" />
                  <SelectValue placeholder="Room" />
                </SelectTrigger>
                <SelectContent searchable>
                  <SelectItem value="">All rooms</SelectItem>
                  {rooms.map((r) => (
                    <SelectItem key={r} value={r}>
                      {r}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={typeFilter || undefined}
                onValueChange={(v) => setTypeFilter(v)}
              >
                <SelectTrigger className="flex h-9 w-full items-center gap-2 rounded border px-3 text-sm">
                  <Droplet className="h-4 w-4 text-neutral-500" />
                  <SelectValue placeholder="Type" />
                </SelectTrigger>
                <SelectContent searchable>
                  <SelectItem value="">All task types</SelectItem>
                  {types.map((t) => (
                    <SelectItem key={t} value={t}>
                      {labelForType(t as any)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Select
                value={statusFilter || undefined}
                onValueChange={(v) => setStatusFilter(v)}
              >
                <SelectTrigger className="flex h-9 w-full items-center gap-2 rounded border px-3 text-sm">
                  <AlertCircle className="h-4 w-4 text-neutral-500" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All statuses</SelectItem>
                  <SelectItem value="overdue">Overdue</SelectItem>
                  <SelectItem value="urgent">Due soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {(roomFilter || typeFilter || statusFilter) && (
              <div className="mt-2 flex flex-wrap gap-2">
                {roomFilter && (
                  <span className="flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800">
                    {roomFilter}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      onClick={() => setRoomFilter("")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {typeFilter && (
                  <span className="flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800">
                    {labelForType(typeFilter as any)}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      onClick={() => setTypeFilter("")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
                {statusFilter && (
                  <span className="flex items-center gap-1 rounded-full border bg-white px-2 py-1 text-xs dark:border-neutral-700 dark:bg-neutral-800">
                    {statusFilter === "overdue" ? "Overdue" : "Due soon"}
                    <button
                      type="button"
                      className="rounded-full p-0.5 hover:bg-neutral-200 dark:hover:bg-neutral-700"
                      onClick={() => setStatusFilter("")}
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </span>
                )}
              </div>
            )}
          </>
        )}
      </header>

      <main className="flex-1 px-4 pb-28">
        {view === "today" && homeTab === "today" && (
          <section className="space-y-3 mt-4">
            {loading && (
              <div className="space-y-3">
                {[...Array(2)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-white shadow-sm h-16 animate-pulse"
                  />
                ))}
              </div>
            )}
            {!loading && err && (
              <div className="rounded-xl border bg-white shadow-sm p-4 text-sm text-red-600">
                {err}
              </div>
            )}
            {!loading &&
              !err &&
              tasksTodayGrouped.map(([plantName, items]) => (
                <div key={plantName} className="space-y-2">
                  <div className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
                    {plantName}
                  </div>
                  <div className="space-y-3">
                    {items.map((t) => (
                      <TaskRow
                        key={t.id}
                        plant={t.plantName}
                        action={labelForType(t.type) as any}
                        last={t.lastEventAt ? timeAgo(new Date(t.lastEventAt)) : "—"}
                        due={dueLabel(new Date(t.dueAt), today)}
                        onOpen={() => {}}
                        onComplete={() => complete(t)}
                        onAddNote={(note) => addNote(t.plantId, note)}
                        onDelete={() => remove(t)}
                        onDefer={() => deferTask(t)}
                        onEdit={() => setEditTask(t)}
                        showPlant={false}
                      />
                    ))}
                  </div>
                </div>
              ))}
            {!loading && !err && tasksToday.length === 0 && (
              <div className="rounded-xl border bg-white shadow-sm p-6 text-center text-sm text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
                No tasks today — your plants are happy! 🌿
                {upcoming.length > 0 && (
                  <div className="mt-2 text-neutral-600 dark:text-neutral-300">
                    Next up: {upcoming[0][1][0].plantName} {labelForType(upcoming[0][1][0].type)} {dueLabel(new Date(upcoming[0][1][0].dueAt), today)}
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {view === "today" && homeTab === "upcoming" && (
          <section className="space-y-5 mt-4">
            {loading && (
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border bg-white shadow-sm h-16 animate-pulse"
                  />
                ))}
              </div>
            )}
            {!loading && err && (
              <div className="rounded-xl border bg-white shadow-sm p-4 text-sm text-red-600">
                {err}
              </div>
            )}
            {!loading &&
              !err &&
              upcoming.map(([label, items]) => (
                <div key={label} className="space-y-2">
                  <div className="text-xs font-medium text-neutral-600 uppercase tracking-wide">
                    {label}
                  </div>
                  <div className="space-y-3">
                    {items.map((t) => (
                      <TaskRow
                        key={t.id}
                        plant={t.plantName}
                        action={labelForType(t.type) as any}
                        last={
                          t.lastEventAt ? timeAgo(new Date(t.lastEventAt)) : "—"
                        }
                        due={dueLabel(new Date(t.dueAt), today)}
                        onOpen={() => {}}
                        onComplete={() => complete(t)}
                        onAddNote={(note) => addNote(t.plantId, note)}
                        onDelete={() => remove(t)}
                        onDefer={() => deferTask(t)}
                        onEdit={() => setEditTask(t)}
                      />
                    ))}
                  </div>
                </div>
              ))}
            {!loading && !err && upcoming.length === 0 && (
              <div className="rounded-xl border bg-white shadow-sm p-6 text-center text-sm text-neutral-500">
                No upcoming tasks
              </div>
            )}
          </section>
        )}

        {view === "timeline" && (
          <section className="mt-4 rounded-xl border bg-white shadow-sm">
            <div className="px-4 py-3 border-b">
              <div className="text-base font-medium">Timeline</div>
              <div className="text-xs text-neutral-500">Recent care events</div>
            </div>
            <div className="px-4 py-2 border-b">
              <Select
                value={eventTypeFilter || undefined}
                onValueChange={(v) => setEventTypeFilter(v)}
              >
                <SelectTrigger className="flex h-9 w-full items-center gap-2 rounded border px-3 text-sm">
                  <FilterIcon className="h-4 w-4 text-neutral-500" />
                  <SelectValue placeholder="Event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">All event types</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="fertilize">Fertilize</SelectItem>
                  <SelectItem value="repot">Repot</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <ul className="text-sm px-4 py-2">
              {eventsErr && <li className="py-3 text-red-600">{eventsErr}</li>}
              {!eventsErr && eventsLoading && (
                <li className="py-3 text-neutral-500">Loading…</li>
              )}
              {!eventsErr && !eventsLoading && filteredEvents.length === 0 && (
                <li className="py-3 text-neutral-500">No events</li>
              )}
              {!eventsErr &&
                filteredEvents.map((e) => (
                  <li key={e.id} className="py-3 border-b last:border-b-0">
                    <span className="font-medium">{e.plantName}</span> — {pastTenseLabel(e.type)}
                    <span className="text-neutral-500"> {timeAgo(new Date(e.at))}</span>
                  </li>
                ))}
            </ul>
          </section>
        )}

        {view === "plants" && (
          <section className="mt-4 space-y-6">
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-sm font-display font-medium text-neutral-600">My Plants</h2>
              {plantsLoading && (
                <span className="text-xs text-neutral-500">Loading…</span>
              )}
            </div>

            {plantsErr && (
              <div className="rounded-xl border bg-white shadow-sm p-4 text-sm text-red-600">
                {plantsErr}
              </div>
            )}

            {!plantsErr && (
              <div className="grid grid-cols-2 gap-3">
                {plants.map((p) => (
                  <Link
                    key={p.id}
                    href={`/app/plants/${encodeURIComponent(p.id)}`}
                    className="text-left block rounded-xl focus:outline-none focus:ring-2 focus:ring-neutral-300"
                  >
                    <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                      <div className="h-24 bg-neutral-100" />
                      <div className="p-2">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-neutral-500">
                          Last watered: —
                        </div>
                      </div>
                    </div>
                  </Link>
                ))}
                {!plantsLoading && plants.length === 0 && (
                  <div className="col-span-2 text-sm text-neutral-500 border rounded-xl bg-white shadow-sm p-6 text-center">
                    No plants yet. Use the + button to add one.
                  </div>
                )}
              </div>
            )}
          </section>
        )}

        {view === "insights" && (
          <section className="mt-4 grid gap-3">
            <div className="rounded-xl border bg-white shadow-sm p-4">
              <div className="text-base font-medium">Longest Streak</div>
              <div className="text-sm text-neutral-600">
                Monstera • 12 waterings
              </div>
              <div className="mt-2 h-24 rounded-xl border border-dashed grid place-items-center text-sm text-neutral-500">
                sparkline placeholder
              </div>
            </div>
            <div className="rounded-xl border bg-white shadow-sm p-4">
              <div className="text-base font-medium">Most Neglected</div>
              <div className="text-sm text-neutral-600">Orchid • last 35d</div>
              <div className="mt-2 h-24 rounded-xl border border-dashed grid place-items-center text-sm text-neutral-500">
                list placeholder
              </div>
            </div>
            <div className="rounded-xl border bg-white shadow-sm p-4">
              <div className="text-base font-medium">Seasonality</div>
              <div className="text-sm text-neutral-600">
                Care events per month
              </div>
              <div className="mt-2 h-32 rounded-xl border border-dashed grid place-items-center text-sm text-neutral-500">
                chart placeholder
              </div>
            </div>
          </section>
        )}

        {view === "settings" && (
          <section className="mt-4 grid gap-3">
            <div className="rounded-xl border bg-white shadow-sm p-4 dark:bg-neutral-800 dark:border-neutral-700">
              <div className="text-base font-medium">Export / Import</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">
                Backup JSON / CSV; restore from file
              </div>
              <div className="mt-2 flex gap-2">
                <button className="border rounded px-3 py-2 text-sm">
                  Export JSON
                </button>
                <button className="border rounded px-3 py-2 text-sm">
                  Export CSV
                </button>
                <button className="bg-neutral-900 text-white rounded px-3 py-2 text-sm dark:bg-neutral-100 dark:text-neutral-900">
                  Import
                </button>
              </div>
            </div>
            <div className="rounded-xl border bg-white shadow-sm p-4 flex items-center justify-between dark:bg-neutral-800 dark:border-neutral-700">
              <div className="text-base font-medium">Theme</div>
              <ThemeToggle />
            </div>
            <div className="rounded-xl border bg-white shadow-sm p-4 flex items-center justify-between dark:bg-neutral-800 dark:border-neutral-700">
              <div className="text-base font-medium">Account</div>
              <button
                className="text-sm underline"
                onClick={async () => {
                  await supabase.auth.signOut();
                  window.location.href = "/login";
                }}
              >
                Sign out
              </button>
            </div>
          </section>
        )}
      </main>

      <BottomNav value={view} onChange={(v) => setView(v as any)} />
      <Fab onClick={() => setAddOpen(true)} />

      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        {confetti.map((id) => (
          <CompleteFlash key={id} />
        ))}
      </div>

      {snackbar.visible && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-sm px-4 py-2 rounded-full shadow-lg flex items-center gap-3">
          <span>{snackbar.message}</span>
          {snackbar.action && (
            <button className="underline" onClick={snackbar.action.onClick}>
              {snackbar.action.label}
            </button>
          )}
        </div>
      )}

      <EditTaskModal
        open={!!editTask}
        task={
          editTask
            ? {
                plant: editTask.plantName,
                action: labelForType(editTask.type) as any,
                dueAt: editTask.dueAt,
              }
            : null
        }
        onClose={() => setEditTask(null)}
        onSave={(u) => updateTaskDetails(u)}
      />

      <QuickAddModal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onSave={(t) => {
          setAddOpen(false);
          createQuickTask({ plant: t.plant, action: t.action, due: t.due });
        }}
        onAddPlant={(name) => openAddPlant(name)}
      />

      <AddPlantModal
        open={addPlantOpen}
        onOpenChange={setAddPlantOpen}
        prefillName={prefillPlantName}
        defaultRoomId="room-1"
        onCreate={(name) => onPlantCreated(name)}
      />
    </div>
  );
}
