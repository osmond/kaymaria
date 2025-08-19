"use client";
import Link from "next/link";
import Fab from "@/components/Fab";
import { useRouter } from "next/navigation";
import usePlants from "./usePlants";
import PlantsSkeleton from "./PlantsSkeleton";

export default function PlantsView() {
  const { plants: items, error: err, isLoading } = usePlants();
  const router = useRouter();
  const sortedItems =
    items?.slice().sort((a, b) => {
      const roomA = a.room || "";
      const roomB = b.room || "";
      if (roomA !== roomB) return roomA.localeCompare(roomB);
      return a.name.localeCompare(b.name);
    }) ?? null;

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
            <div className="rounded-2xl border bg-white shadow-card p-4 text-sm text-red-600">
              {err}
            </div>
          )}

          {isLoading && !items && <PlantsSkeleton />}

          {sortedItems && (
            <div className="grid grid-cols-2 gap-3">
              {sortedItems.map((p) => (
                <Link key={p.id} href={`/app/plants/${p.id}`} className="text-left">
                  <div className="rounded-2xl border bg-white shadow-card overflow-hidden">
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
      <Fab onClick={() => router.push("/app/plants/new")} />
    </>
  );
}
