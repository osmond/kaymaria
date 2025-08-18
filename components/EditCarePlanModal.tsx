'use client';

import { useEffect, useState } from 'react';

export default function EditCarePlanModal({
  open,
  plant,
  onOpenChange,
  onUpdated,
}: {
  open: boolean;
  plant: { id: string; rules?: any[] };
  onOpenChange: (v: boolean) => void;
  onUpdated: (p: any) => void;
}) {
  const [waterEvery, setWaterEvery] = useState('');
  const [waterAmount, setWaterAmount] = useState('');
  const [fertEvery, setFertEvery] = useState('');
  const [fertAmount, setFertAmount] = useState('');

  useEffect(() => {
    if (!open) return;
    const w = plant.rules?.find((r: any) => r.type === 'water') || {};
    const f = plant.rules?.find((r: any) => r.type === 'fertilize') || {};
    setWaterEvery(w.intervalDays ? String(w.intervalDays) : '');
    setWaterAmount(w.amountMl ? String(w.amountMl) : '');
    setFertEvery(f.intervalDays ? String(f.intervalDays) : '');
    setFertAmount(f.amountMl ? String(f.amountMl) : '');
  }, [plant, open]);

  function close() {
    onOpenChange(false);
  }

  async function save() {
    const rules = [
      { type: 'water', intervalDays: Number(waterEvery || 0), amountMl: Number(waterAmount || 0) },
      { type: 'fertilize', intervalDays: Number(fertEvery || 0), amountMl: Number(fertAmount || 0) },
    ];
    try {
      const r = await fetch(`/api/plants/${plant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ rules }),
      });
      if (r.ok) {
        const r2 = await fetch(`/api/plants/${plant.id}`, { cache: 'no-store' });
        if (r2.ok) {
          const updated = await r2.json();
          const w = updated.rules?.find((r: any) => r.type === 'water') || {};
          const f = updated.rules?.find((r: any) => r.type === 'fertilize') || {};
          onUpdated({
            ...plant,
            ...updated,
            waterIntervalDays: w.intervalDays,
            waterAmountMl: w.amountMl,
            fertilizeIntervalDays: f.intervalDays,
            fertilizeAmountMl: f.amountMl,
          });
        }
      }
    } catch {
      /* ignore errors in mock env */
    }
    close();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 bg-black/30 grid place-items-center p-4"
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <div className="w-full max-w-md rounded-2xl bg-white p-4 shadow-xl">
        <div className="mb-2">
          <div className="text-lg font-semibold">Edit Care Plan</div>
          <div className="text-sm text-neutral-600">Update watering and fertilizing schedule.</div>
        </div>
        <div className="grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm">Water every (days)</label>
            <input
              className="border rounded px-3 py-2"
              value={waterEvery}
              onChange={(e) => setWaterEvery(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Water amount (ml)</label>
            <input
              className="border rounded px-3 py-2"
              value={waterAmount}
              onChange={(e) => setWaterAmount(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Fertilize every (days)</label>
            <input
              className="border rounded px-3 py-2"
              value={fertEvery}
              onChange={(e) => setFertEvery(e.target.value)}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm">Fertilize amount (ml)</label>
            <input
              className="border rounded px-3 py-2"
              value={fertAmount}
              onChange={(e) => setFertAmount(e.target.value)}
            />
          </div>
        </div>
        <div className="mt-3 flex gap-2 justify-end">
          <button className="border rounded px-3 py-2" onClick={close}>
            Cancel
          </button>
          <button
            className="bg-neutral-900 text-white rounded px-3 py-2"
            onClick={save}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}

