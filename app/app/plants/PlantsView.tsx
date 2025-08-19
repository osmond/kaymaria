"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import Fab from "@/components/Fab";
import AddPlantModal from "@/components/AddPlantModal";

type Plant = { id: string; name: string; room?: string; species?: string };

export default function PlantsView() {
  const [items, setItems] = useState<Plant[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [snackbar, setSnackbar] = useState<{
    visible: boolean;
    message: string;
    action?: { label: string; onClick: () => void };
  }>({ visible: false, message: "" });
  const timer = useRef<number | null>(null);
  const sortedItems =
    items?.slice().sort((a, b) => {
      const roomA = a.room || "";
      const roomB = b.room || "";
      if (roomA !== roomB) return roomA.localeCompare(roomB);
      return a.name.localeCompare(b.name);
    }) ?? null;
  async function load() {
    try {
      setErr(null);
      const r = await fetch("/api/plants", { cache: "no-store" });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      setItems(await r.json());
    } catch (e: any) {
      setErr(e?.message || "Failed to load");
    }
  }

  useEffect(() => {
    load();
  }, []);

  return (
    <>
      <section className="mt-4 space-y-6">
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-display font-medium text-neutral-600">My Plants</h2>
            <span className="text-xs text-neutral-500">
              {items?.length ?? 0} total
            </span>
          </div>

          {err && (
            <div className="rounded-xl border bg-white shadow-sm p-4 text-sm text-red-600">
              {err}
            </div>
          )}

          {!items && !err && <div className="text-sm text-neutral-500">Loading…</div>}

          {sortedItems && (
            <div className="grid grid-cols-2 gap-3">
              {sortedItems.map((p) => (
                <Link key={p.id} href={`/app/plants/${p.id}`} className="text-left">
                  <div className="rounded-xl border bg-white shadow-sm overflow-hidden">
                    <div className="h-24 bg-neutral-100" />
                    <div className="p-2">
                      <div className="text-sm font-medium truncate">{p.name}</div>
                      <div className="text-xs text-neutral-500">
                        {p.room ? `Room: ${p.room}` : "—"}
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
      <Fab onClick={() => setAddOpen(true)} />
      <AddPlantModal
        open={addOpen}
        onOpenChange={setAddOpen}
        defaultRoomId="room-1"
        onCreate={(p) => {
          setAddOpen(false);
          load();
          if (timer.current) window.clearTimeout(timer.current);
          setSnackbar({
            visible: true,
            message: `${p.name} added`,
            action: {
              label: "Undo",
              onClick: async () => {
                setSnackbar({ visible: false, message: "" });
                await fetch(`/api/plants/${p.id}`, { method: "DELETE" });
                load();
              },
            },
          });
          // @ts-ignore
          timer.current = window.setTimeout(
            () => setSnackbar({ visible: false, message: "" }),
            5000,
          );
        }}
      />
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
    </>
  );
}
