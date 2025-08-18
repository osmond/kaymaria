"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import Fab from "@/components/Fab";
import AddPlantModal from "@/components/AddPlantModal";

type Plant = { id: string; name: string; room?: string; species?: string };

export default function PlantsPage() {
  const [items, setItems] = useState<Plant[] | null>(null);
  const [err, setErr] = useState<string | null>(null);
  const [addOpen, setAddOpen] = useState(false);
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

          {items && (
            <div className="grid grid-cols-2 gap-3">
              {items.map((p) => (
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
        onCreate={() => {
          setAddOpen(false);
          load();
        }}
      />
    </>
  );
}
