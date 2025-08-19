"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import TaskRow from "@/components/TaskRow";
import ThemeToggle from "@/components/ThemeToggle";
import { TaskDTO } from "@/lib/types";

import { createSupabaseClient } from "@/lib/supabase";
import { subscribeToTaskChanges } from "@/lib/realtime";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";

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
  FlaskRound,
  Sprout,
  Home,
  X,
  Filter as FilterIcon,
} from "lucide-react";
import TimelineSkeleton from "./timeline/TimelineSkeleton";

const DEFAULT_TASK_WINDOW_DAYS = (() => {
  const parsed = parseInt(
    process.env.NEXT_PUBLIC_TASK_WINDOW_DAYS ?? "7",
    10,
  );
  if (Number.isNaN(parsed)) {
    console.warn(
      `Invalid NEXT_PUBLIC_TASK_WINDOW_DAYS value "${process.env.NEXT_PUBLIC_TASK_WINDOW_DAYS}", falling back to 7`,
    );
    return 7;
  }
  return parsed;
})();
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

function ClientDate() {
  const [text, setText] = useState("");
  useEffect(() => {
    setText(
      new Intl.DateTimeFormat(undefined, {
        weekday: "short",
        month: "short",
        day: "numeric",
      }).format(new Date()),
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

type EventDTO = {
  id: string;
  plantId: string;
  plantName: string;
  type: "water" | "fertilize" | "repot";
  at: string;
};

export function TodayView() {
  const taskWindow = DEFAULT_TASK_WINDOW_DAYS;

  // ui
  const [confetti, setConfetti] = useState<number[]>([]);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    action?: { label: string; onClick: () => void };
  }>({ visible: false, message: "" });
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // data
  const [tasks, setTasks] = useState<TaskDTO[]>([]);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const notifiedRef = useRef<Set<string>>(new Set());

  // filters
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
    }
  }

  useEffect(() => {
    refresh(taskWindow);
  }, []);

  useEffect(() => {
    const unsubscribe = subscribeToTaskChanges(() => refresh(taskWindow));
    return () => unsubscribe();
  }, [taskWindow]);

  useEffect(() => {
    if (
      typeof window === "undefined" ||
      !("Notification" in window) ||
      Notification.permission !== "granted"
    )
      return;
    const now = Date.now();
    tasks.forEach((t) => {
      const due = new Date(t.dueAt).getTime();
      if (due < now && !notifiedRef.current.has(t.id)) {
        new Notification(`${t.plantName}: ${labelForType(t.type)} overdue`);
        notifiedRef.current.add(t.id);
      }
    });
  }, [tasks]);

  const trigger = () => {
    const id = Math.floor(Math.random() * 1e9);
    setConfetti((p) => [...p, id]);
    window.setTimeout(() => setConfetti((p) => p.filter((n) => n !== id)), 1200);
  };

  const toast = (
    m: string,
    action?: { label: string; onClick: () => void },
  ) => {
    if (timer.current) window.clearTimeout(timer.current);
    setSnackbar({ visible: true, message: m, action });
    timer.current = window.setTimeout(
      () => setSnackbar({ visible: false, message: "" }),
      5000,
    );
  };

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
      const data = await r.json();
      trigger();
      const time = new Date().toLocaleTimeString([], {
        hour: "numeric",
        minute: "2-digit",
      });
      toast(`${pastTenseLabel(t.type)}! ${time}`, {
        label: "Undo",
        onClick: async () => {
          setTasks((prev) => [t, ...prev]);
          await fetch(`/api/tasks/${encodeURIComponent(t.id)}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ undo: true, task: t, eventAt: data.eventAt }),
          });
          refresh();
        },
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

  const today = new Date();
  const tasksToday = useMemo(() => {
    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );
    return filteredTasks
      .filter((t) => new Date(t.dueAt) < tomorrow)
      .sort(
        (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
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
        (a, b) => new Date(a.dueAt).getTime() - new Date(b.dueAt).getTime(),
      ),
    ]) as [string, TaskDTO[]][];
    groups.sort(
      (a, b) =>
        new Date(a[1][0].dueAt).getTime() - new Date(b[1][0].dueAt).getTime(),
    );
    return groups;
  }, [tasksToday]);
  const upcoming = useMemo(() => {
    const tomorrow = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + 1,
    );
    const windowEnd = new Date(
      today.getFullYear(),
      today.getMonth(),
      today.getDate() + taskWindow,
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
    <div className="min-h-[100dvh] flex flex-col w-full">
      <header
        className="px-4 pb-2 sticky top-0 z-20 bg-gradient-to-b from-white/90 to-neutral-50/60 backdrop-blur border-b"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
      >
        <div className="flex items-baseline justify-between w-full">
          <h1 className="text-xl font-display font-semibold">Today</h1>
          <ClientDate />
        </div>
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
      </header>

      <main className="flex-1 px-4 pb-28">
        <section className="space-y-3 mt-4">
          {loading && (
            <div className="space-y-3">
              {[...Array(2)].map((_, i) => (
                <div
                  key={i}
                  className="rounded-2xl border bg-white shadow-card h-16 animate-pulse"
                />
              ))}
            </div>
          )}
          {!loading && err && (
            <div className="rounded-2xl border bg-white shadow-card p-4 text-sm text-red-600">
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
                <div className="rounded-2xl border bg-white shadow-card divide-y">
                  {items.map((t) => (
                    <TaskRow
                      key={t.id}
                      overdue={new Date(t.dueAt).getTime() < Date.now()}
                      label={labelForType(t.type as any)}
                      status={
                        isSameDay(today, new Date(t.dueAt)) ? "due" : "upcoming"
                      }
                      due={new Date(t.dueAt).toLocaleTimeString([], {
                        hour: "numeric",
                        minute: "2-digit",
                      })}
                      onComplete={() => complete(t)}
                      onDefer={() => deferTask(t)}
                    />
                  ))}
                </div>
              </div>
            ))}
          {!loading && !err && tasksTodayGrouped.length === 0 && (
            <div className="rounded-2xl border bg-white shadow-card p-6 text-center text-sm text-neutral-500 dark:bg-neutral-800 dark:border-neutral-700 dark:text-neutral-300">
              No tasks today — your plants are happy! 🌿
              {upcoming.length > 0 && (
                <div className="mt-2 text-neutral-600 dark:text-neutral-300">
                  Next up: {upcoming[0][1][0].plantName} {labelForType(upcoming[0][1][0].type)} {dueLabel(new Date(upcoming[0][1][0].dueAt), today)}
                </div>
              )}
            </div>
          )}
        </section>
      </main>

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
    </div>
  );
}

export function TimelineView() {
  const [events, setEvents] = useState<EventDTO[]>([]);
  const [eventsErr, setEventsErr] = useState<string | null>(null);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [eventTypeFilter, setEventTypeFilter] = useState("");
  const [plantFilter, setPlantFilter] = useState("");
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const limit = 20;

  const loadPage = useCallback(
    async (p: number) => {
      try {
        setEventsLoading(true);
        setEventsErr(null);
        const r = await fetch(
          `/api/events?offset=${p * limit}&limit=${limit}`,
          { cache: "no-store" },
        );
        if (!r.ok) throw new Error("HTTP " + r.status);
        const newEvents: EventDTO[] = await r.json();
        setEvents((prev) => {
          const existing = new Set(prev.map((e) => e.id));
          const deduped = newEvents.filter((e) => !existing.has(e.id));
          return p === 0 ? deduped : [...prev, ...deduped];
        });
        setPage(p);
        if (newEvents.length < limit) setHasMore(false);
      } catch (e: any) {
        setEventsErr(e?.message || "Failed to load");
      } finally {
        setEventsLoading(false);
      }
    },
    [limit],
  );

  useEffect(() => {
    loadPage(0);
  }, [loadPage]);

  const loadMore = useCallback(() => {
    if (!eventsLoading && hasMore) {
      loadPage(page + 1);
    }
  }, [eventsLoading, hasMore, page, loadPage]);

  useEffect(() => {
    const onScroll = () => {
      if (
        window.innerHeight + window.scrollY >=
        document.body.offsetHeight - 100
      ) {
        loadMore();
      }
    };
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [loadMore]);

  const plantNames = useMemo(() => {
    const set = new Set<string>();
    events.forEach((e) => set.add(e.plantName));
    return Array.from(set).sort();
  }, [events]);

  const filteredEvents = useMemo(
    () =>
      events.filter(
        (e) =>
          (!eventTypeFilter || e.type === eventTypeFilter) &&
          (!plantFilter || e.plantName === plantFilter),
      ),
    [events, eventTypeFilter, plantFilter],
  );

  function bucketEventsByDay(events: EventDTO[]) {
    const buckets: { date: Date; events: EventDTO[] }[] = [];
    events.forEach((e) => {
      const at = new Date(e.at);
      const day = new Date(at.getFullYear(), at.getMonth(), at.getDate());
      const last = buckets[buckets.length - 1];
      if (last && isSameDay(last.date, day)) {
        last.events.push(e);
      } else {
        buckets.push({ date: day, events: [e] });
      }
    });
    return buckets;
  }

  const dayBuckets = useMemo(() => bucketEventsByDay(filteredEvents), [filteredEvents]);

  const typeIcons = {
    water: Droplet,
    fertilize: FlaskRound,
    repot: Sprout,
  } as const;

  const typeColors: Record<EventDTO["type"], string> = {
    water: "text-sky-500",
    fertilize: "text-amber-500",
    repot: "text-emerald-500",
  };

  return (
    <div className="min-h-[100dvh] flex flex-col w-full">
      <header
        className="px-4 pb-2 sticky top-0 z-20 bg-gradient-to-b from-white/90 to-neutral-50/60 backdrop-blur border-b"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
      >
        <div className="flex items-baseline justify-between w-full">
          <h1 className="text-xl font-display font-semibold">Timeline</h1>
          <ClientDate />
        </div>
      </header>
      <main className="flex-1 px-4 pb-28">
        <section className="mt-4 rounded-2xl border bg-white shadow-card">
          <div className="px-4 py-3 border-b">
            <div className="text-base font-medium">Timeline</div>
            <div className="text-xs text-neutral-500">Recent care events</div>
          </div>
          <div className="px-4 py-2 border-b flex flex-col gap-2">
            <Select
              value={plantFilter || undefined}
              onValueChange={(v) => setPlantFilter(v)}
            >
              <SelectTrigger className="flex h-9 w-full items-center gap-2 rounded border px-3 text-sm">
                <PottedPlant className="h-4 w-4 text-neutral-500" />
                <SelectValue placeholder="Plant" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">All plants</SelectItem>
                {plantNames.map((p) => (
                  <SelectItem key={p} value={p}>
                    {p}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
          <div className="text-sm px-4 py-2">
            {eventsErr && <div className="py-3 text-red-600">{eventsErr}</div>}
            {!eventsErr && events.length === 0 && eventsLoading && (
              <TimelineSkeleton />
            )}
            {!eventsErr && !eventsLoading && dayBuckets.length === 0 && (
              <div className="py-3 text-neutral-500">No events</div>
            )}
            {!eventsErr &&
              dayBuckets.map((b) => (
                <div key={b.date.toISOString()} className="py-2">
                  <h3 className="font-medium">
                    {new Intl.DateTimeFormat(undefined, {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    }).format(b.date)}
                  </h3>
                  <ul>
                    {b.events.map((e) => {
                      const Icon = typeIcons[e.type];
                      return (
                        <li key={e.id} className="py-3 border-b last:border-b-0">
                          <span className="font-medium">{e.plantName}</span> — {" "}
                          <span className={`inline-flex items-center ${typeColors[e.type]}`}>
                            <Icon className="h-4 w-4" aria-hidden="true" />
                            <span className="sr-only">{pastTenseLabel(e.type)}</span>
                          </span>
                          <span className="text-neutral-500"> {timeAgo(new Date(e.at))}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            {!eventsErr && hasMore && (
              <div className="py-3 text-center">
                {eventsLoading ? (
                  <TimelineSkeleton />
                ) : (
                  <button
                    onClick={loadMore}
                    className="underline text-blue-600"
                  >
                    Load more
                  </button>
                )}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}

export function SettingsView() {
  const supabase = useRef(createSupabaseClient());
  const singleUser = process.env.SINGLE_USER_MODE === "true";

  async function handleSignOut() {
    await supabase.current.auth.signOut();
    document.cookie = "sb-access-token=; Path=/; Max-Age=0";
    window.location.href = "/login";
  }

  return (
    <div className="min-h-[100dvh] flex flex-col w-full">
      <header
        className="px-4 pb-2 sticky top-0 z-20 bg-gradient-to-b from-white/90 to-neutral-50/60 backdrop-blur border-b"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
      >
        <div className="flex items-baseline justify-between w-full">
          <h1 className="text-xl font-display font-semibold">Settings</h1>
          <ClientDate />
        </div>
      </header>
      <main className="flex-1 px-4 pb-28">
        <section className="mt-4 grid gap-3">
          <Card>
            <CardHeader className="pb-2">
              <div className="text-base font-medium">Export / Import</div>
              <div className="text-sm text-neutral-600 dark:text-neutral-300">
                Backup JSON / CSV; restore from file
              </div>
            </CardHeader>
            <CardContent className="pt-0 flex gap-2">
              <Button variant="secondary" size="sm">
                Export JSON
              </Button>
              <Button variant="secondary" size="sm">
                Export CSV
              </Button>
              <Button variant="default" size="sm">
                Import
              </Button>
            </CardContent>
          </Card>
          <div className="rounded-2xl border bg-white shadow-card p-4 flex items-center justify-between dark:bg-neutral-800 dark:border-neutral-700">
            <div className="text-base font-medium">Theme</div>
            <ThemeToggle />
          </div>
          {!singleUser && (
            <button
              onClick={handleSignOut}
              className="rounded-2xl border bg-white shadow-card p-4 text-left text-base font-medium dark:bg-neutral-800 dark:border-neutral-700"
            >
              Sign out
            </button>
          )}
        </section>
      </main>
    </div>
  );
}

