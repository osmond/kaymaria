'use client';

import PlantForm, { PlantFormSubmit } from '@/components/PlantForm';
import { useRouter } from 'next/navigation';

export default function NewPlantPage() {
  const router = useRouter();

  async function handleSubmit(data: PlantFormSubmit) {
    const res = await fetch('/api/plants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const created = await res.json();
    router.push(`/app/plants/${created.id}/created`);
  }

  const today = new Date().toISOString().slice(0, 10);

  return (
    <main className="max-w-xl mx-auto rounded-2xl bg-surface-1 shadow-card">
      <header className="border-b p-4 md:p-6">
        <h1 className="text-2xl font-display font-semibold">Add Plant</h1>
      </header>
      <div className="p-4 md:p-6">
        <PlantForm
          initial={{
            name: '',
            roomId: '',
            species: '',
            pot: '6 in',
            potHeight: '6 in',
            potMaterial: 'Plastic',
            light: 'Medium',
            indoor: 'Indoor',
            drainage: 'ok',
            soil: '',
            humidity: '',
            waterEvery: '7',
            waterAmount: '500',
            fertEvery: '30',
            fertFormula: '',
            lastWatered: today,
            lastFertilized: today,
          }}
          submitLabel="Add Plant"
          onSubmit={handleSubmit}
          onCancel={() => router.back()}
        />
      </div>
    </main>
  );
}

