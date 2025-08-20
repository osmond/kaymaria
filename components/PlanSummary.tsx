'use client';

export type PlanSummaryValues = {
  lastWatered: string;
  waterEvery: string;
  lastFertilized: string;
  fertEvery: string;
};

function computeUpcoming(last: string, every: string, count = 3): Date[] {
  const interval = Number(every);
  if (!last || !interval || interval <= 0) return [];
  const start = new Date(last);
  const arr: Date[] = [];
  for (let i = 1; i <= count; i++) {
    arr.push(new Date(start.getTime() + i * interval * 864e5));
  }
  return arr;
}

export default function PlanSummary({ values }: { values: PlanSummaryValues }) {
  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(undefined, {
      month: 'short',
      day: 'numeric',
    }).format(d);
  const now = new Date();
  const fmtItem = (d: Date) => {
    const diff = Math.round((d.getTime() - now.getTime()) / 864e5);
    const rel = diff >= 0 ? `in ${diff}d` : `${-diff}d ago`;
    return `${fmtDate(d)} (${rel})`;
  };

  const waterDates = computeUpcoming(values.lastWatered, values.waterEvery);
  const fertDates = computeUpcoming(values.lastFertilized, values.fertEvery);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h3 className="text-base font-medium mb-2">Watering</h3>
        {waterDates.length ? (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {waterDates.map((d, i) => (
              <li key={i}>{fmtItem(d)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-600">No upcoming waterings</p>
        )}
      </div>
      <div>
        <h3 className="text-base font-medium mb-2">Fertilizing</h3>
        {fertDates.length ? (
          <ul className="list-disc pl-5 space-y-1 text-sm">
            {fertDates.map((d, i) => (
              <li key={i}>{fmtItem(d)}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-neutral-600">No upcoming fertilizings</p>
        )}
      </div>
    </div>
  );
}

