'use client';

import AddPlantForm, { AddPlantFormData } from '@/components/forms/AddPlantForm';
import { useRouter } from 'next/navigation';

export default function NewPlantPage() {
  const router = useRouter();

  async function handleSubmit(data: AddPlantFormData) {
    const res = await fetch('/api/plants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        roomId: data.roomId,
        lightLevel: data.light,
        lat: data.lat,
        lon: data.lon,
        lastWateredAt: data.lastWatered
          ? new Date(data.lastWatered).toISOString()
          : undefined,
        lastFertilizedAt: data.lastFertilized
          ? new Date(data.lastFertilized).toISOString()
          : undefined,
        plan: [
          {
            type: 'water',
            intervalDays: data.waterEvery || 7,
            amountMl: data.waterAmount,
          },
          { type: 'fertilize', intervalDays: data.fertEvery || 30 },
        ],
      }),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const plant = await res.json();
    router.push(`/app/plants/${plant.id}/created`);
    router.refresh();
  }

  return (
    <main className="max-w-xl mx-auto rounded-2xl bg-surface-1 shadow-card">
      <header className="border-b p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold">Add Plant</h1>
      </header>
      <div className="p-4 md:p-6">
        <AddPlantForm onSubmit={handleSubmit} />
      </div>
    </main>
  );
}

