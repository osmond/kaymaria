'use client';

import { useRouter } from 'next/navigation';
import AddPlantForm, { AddPlantFormData } from '@/components/forms/AddPlantForm';
import type { Plant } from '@prisma/client';

type PlantExtras = {
  waterIntervalDays?: number | null;
};

export default function EditPlantPage({
  plant,
}: {
  plant: Plant & PlantExtras;
}) {
  const router = useRouter();

  async function handleSubmit(data: AddPlantFormData) {
    const res = await fetch(`/api/plants/${plant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: data.name,
        species: data.species,
        roomId: data.roomId,
        potSize: data.potSize,
        potMaterial: data.potMaterial,
        soilType: data.soilType,
        lightLevel: data.light,
        indoor: data.indoor,
        drainage: data.drainage,
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
          {
            type: 'fertilize',
            intervalDays: data.fertEvery || 30,
            formula: data.fertFormula,
          },
        ],
      }),
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
        <AddPlantForm
          initialValues={{
            name: plant.name,
            species: plant.species || '',
            roomId: plant.roomId || '',
            light: (plant.lightLevel || 'medium').toLowerCase(),
            indoor: plant.indoor ?? true,
            lat: plant.latitude ?? undefined,
            lon: plant.longitude ?? undefined,
            potSize: plant.potSize || '',
            potMaterial: plant.potMaterial || '',
            soilType: plant.soilType || '',
            drainage: (plant.drainage as any) || undefined,
            waterEvery: plant.waterIntervalDays ?? 7,
            waterAmount: 250,
            fertEvery: 30,
            fertFormula: '',
            lastWatered: plant.lastWateredAt
              ? plant.lastWateredAt.toISOString().slice(0, 10)
              : '',
            lastFertilized: plant.lastFertilizedAt
              ? plant.lastFertilizedAt.toISOString().slice(0, 10)
              : '',
          }}
          submitLabel="Save"
          onSubmit={handleSubmit}
        />
      </div>
    </main>
  );
}

