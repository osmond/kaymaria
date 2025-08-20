'use client';

import AddPlantForm, { AddPlantFormData } from '@/components/forms/AddPlantForm';
import { useRouter } from 'next/navigation';

export default function NewPlantPage() {
  const router = useRouter();

  async function handleSubmit(data: AddPlantFormData) {
    // Placeholder submit handler - replace with API call
    // await fetch('/api/plants', {...})
    console.log('submit', data);
    router.back();
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

