export default function LoadingPlantDetail() {
  return (
    <div
      aria-busy="true"
      className="p-4 space-y-4 animate-pulse"
    >
      <div className="flex items-center gap-2">
        <div className="h-9 w-9 rounded-lg bg-border" />
        <div className="h-6 w-32 bg-border rounded" />
      </div>
      <div className="rounded-2xl border border-border bg-white shadow-card overflow-hidden">
        <div className="h-40 w-full bg-border" />
        <div className="p-4 space-y-2">
          <div className="h-5 w-1/3 bg-border rounded" />
          <div className="h-4 w-1/4 bg-border rounded" />
        </div>
      </div>
    </div>
  );
}
