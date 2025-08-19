import { Droplet, FlaskConical } from "lucide-react";

export default function CareSummary({
  nextWater,
  nextFertilize,
  waterIntervalDays,
  fertilizeIntervalDays,
}: {
  nextWater: Date | null;
  nextFertilize: Date | null;
  waterIntervalDays?: number;
  fertilizeIntervalDays?: number;
}) {
  const daysUntil = (d: Date | null) => {
    if (!d) return null;
    const today = new Date();
    const diff = Math.round(
      (new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() -
        new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime()) /
        86400000
    );
    return diff;
  };
  const waterIn = daysUntil(nextWater);
  const fertilizeIn = daysUntil(nextFertilize);

  return (
    <div className="mt-4 grid grid-cols-2 gap-3">
      <div className="flex items-center gap-2 rounded-2xl border bg-white p-3 shadow-card">
        <Droplet className="h-4 w-4" />
        <div>
          <div className="text-xs text-neutral-500">Water</div>
          <div className="text-base font-medium">
            {waterIn !== null
              ? `in ${waterIn}d`
              : waterIntervalDays
              ? `every ${waterIntervalDays}d`
              : "—"}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-2 rounded-2xl border bg-white p-3 shadow-card">
        <FlaskConical className="h-4 w-4" />
        <div>
          <div className="text-xs text-neutral-500">Fertilize</div>
          <div className="text-base font-medium">
            {fertilizeIn !== null
              ? `in ${fertilizeIn}d`
              : fertilizeIntervalDays
              ? `every ${fertilizeIntervalDays}d`
              : "—"}
          </div>
        </div>
      </div>
    </div>
  );
}
