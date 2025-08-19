"use client";

export default function InsightsSkeleton() {
  return (
    <div
      aria-busy="true"
      data-testid="insights-skeleton"
      className="space-y-4 animate-pulse"
    >
      <div className="flex gap-2">
        <div className="h-6 w-32 rounded bg-neutral-200" />
        <div className="h-6 w-32 rounded bg-neutral-200" />
      </div>
      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="rounded-xl border bg-white shadow-sm p-4 space-y-2"
          >
            <div className="h-4 w-3/4 bg-neutral-200 rounded" />
            <div className="h-6 w-1/2 bg-neutral-200 rounded" />
          </div>
        ))}
      </div>
      <div className="rounded-xl border bg-white shadow-sm p-4">
        <div className="h-48 bg-neutral-200 rounded" />
      </div>
    </div>
  );
}
