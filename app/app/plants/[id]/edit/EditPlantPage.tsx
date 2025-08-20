'use client';

import { useRouter } from 'next/navigation';
import PlantForm, { PlantFormSubmit } from '@/components/PlantForm';
import type { Plant } from '@prisma/client';

type PlantExtras = {
  latitude?: number | null;
  longitude?: number | null;
  waterIntervalDays?: number | null;
  waterAmountMl?: number | null;
  fertilizeIntervalDays?: number | null;
  fertilizeFormula?: string | null;
  lastWateredAt?: string | Date | null;
  lastFertilizedAt?: string | Date | null;
};

export default function EditPlantPage({
  plant,
}: {
  plant: Plant & PlantExtras;
}) {
  const router = useRouter();

  async function handleSubmit(data: PlantFormSubmit) {
    const res = await fetch(`/api/plants/${plant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    await res.json();
    router.push(`/app/plants/${plant.id}`);
    router.refresh();
  }

  return (
    <main className="max-w-xl mx-auto rounded-2xl bg-surface-1 shadow-card">
      <header className="border-b p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold">Edit Plant</h1>
      </header>
      <div className="p-4 md:p-6">
        <PlantForm
          initial={{
            name: plant.name,
            roomId: plant.roomId || '',
            species: plant.species || '',
            pot: plant.potSize || '6 in',
            potHeight: plant.potSize || '6 in',
            potMaterial: plant.potMaterial || 'Plastic',
            light: plant.lightLevel || 'Medium',
            indoor: plant.indoor ? 'Indoor' : 'Outdoor',
            drainage: (plant.drainage as 'poor' | 'ok' | 'great' | null) ?? 'ok',
            soil: plant.soilType || '',
            humidity: '',
            lat: plant.latitude !== undefined ? String(plant.latitude) : '',
            lon: plant.longitude !== undefined ? String(plant.longitude) : '',
            waterEvery: plant.waterIntervalDays !== undefined ? String(plant.waterIntervalDays) : '7',
            waterAmount: plant.waterAmountMl !== undefined ? String(plant.waterAmountMl) : '500',
            fertEvery: plant.fertilizeIntervalDays !== undefined ? String(plant.fertilizeIntervalDays) : '30',
            fertFormula: plant.fertilizeFormula || '',
            lastWatered: plant.lastWateredAt
              ? new Date(plant.lastWateredAt).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10),
            lastFertilized: plant.lastFertilizedAt
              ? new Date(plant.lastFertilizedAt).toISOString().slice(0, 10)
              : new Date().toISOString().slice(0, 10),
          }}
          submitLabel="Save"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </main>
  );
}

