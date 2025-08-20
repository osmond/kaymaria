"use client";
import Link from "next/link";
import Fab from "@/components/Fab";
import { useRouter } from "next/navigation";
import usePlants from "./usePlants";
import PlantsSkeleton from "./PlantsSkeleton";
import { Card, CardContent } from "@/components/ui/card";
import { useEffect, useState } from "react";

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
    <div className="min-h-[100dvh] flex flex-col w-full">
      <header
        className="px-4 pb-2 sticky top-0 z-20 bg-gradient-to-b from-white/90 to-neutral-50/60 backdrop-blur border-b"
        style={{ paddingTop: "calc(env(safe-area-inset-top) + 1.5rem)" }}
      >
        <div className="flex items-baseline justify-between w-full">
          <h1 className="text-xl font-display font-semibold">Plants</h1>
          <ClientDate />
        </div>
      </header>
      <main className="flex-1 px-4 pb-28">
        <section className="mt-4 space-y-6">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h2 className="text-base font-medium text-foreground">My Plants</h2>
              <span className="text-sm text-muted">
                {items?.length ?? 0} total
              </span>
            </div>

            {err && (
              <div className="rounded-2xl border bg-white shadow-card p-4 text-sm text-destructive">
                {err}
              </div>
            )}

            {isLoading && !items && <PlantsSkeleton />}

            {sortedItems && sortedItems.length > 0 && (
              <div
                className="grid grid-cols-1 sm:grid-cols-2 gap-3"
                data-testid="plants-grid"
              >
                {sortedItems.map((p) => (
                  <Link key={p.id} href={`/app/plants/${p.id}`} className="text-left">
                    <Card className="overflow-hidden">
                      <div className="h-24 bg-muted" />
                      <CardContent className="p-2">
                        <div className="text-sm font-medium truncate">{p.name}</div>
                        <div className="text-xs text-muted">
                          {p.room ? `Room: ${p.room}` : "—"}
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            )}

            {sortedItems && sortedItems.length === 0 && !isLoading && !err && (
              <div className="rounded-2xl border bg-white shadow-card p-6 text-center">
                <p className="text-sm text-muted">
                  No plants yet. Add your first to start tending 🌿
                </p>
              </div>
            )}
          </div>
        </section>
      </main>
      <Fab onClick={() => router.push("/app/plants/new")} />
    </div>
  );
}
