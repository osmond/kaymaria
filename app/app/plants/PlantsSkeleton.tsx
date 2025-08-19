"use client";

export default function PlantsSkeleton() {
  return (
    <div
      aria-busy="true"
      data-testid="plants-skeleton"
      className="grid grid-cols-2 gap-3 animate-pulse"
    >
      {Array.from({ length: 4 }).map((_, i) => (
        <div
          key={i}
          className="rounded-2xl border bg-white shadow-card overflow-hidden"
        >
          <div className="h-24 bg-neutral-200" />
          <div className="p-2 space-y-2">
            <div className="h-4 w-3/4 bg-neutral-200 rounded" />
            <div className="h-3 w-1/2 bg-neutral-200 rounded" />
          </div>
        </div>
      ))}
    </div>
  );
}
