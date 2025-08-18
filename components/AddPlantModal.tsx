'use client';

import React from 'react';
import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import PlantForm, { PlantFormSubmit } from './PlantForm';

export default function AddPlantModal({
  open,
  onOpenChange,
  prefillName,
  defaultRoomId,
  onCreate,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  prefillName?: string;
  defaultRoomId: string;
  onCreate: (name: string) => void;
}) {
  const router = useRouter();
  function close() {
    onOpenChange(false);
  }

  async function handleSubmit(data: PlantFormSubmit) {
    const r = await fetch('/api/plants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const created = await r.json();
    onCreate(data.name);
    close();
    router.push(`/app/plants/${created.id}?tab=photos`);
  }

  if (!open) return null;

  return (
    <Dialog open={open} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4">
        <Dialog.Panel className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
          <div className="p-5 border-b">
            <Dialog.Title className="text-lg font-display font-semibold">Add Plant</Dialog.Title>
            <p className="text-sm text-neutral-600">Use a canned AI suggestion for MVP.</p>
          </div>
          <PlantForm
            initial={{
              name: prefillName || '',
              roomId: defaultRoomId,
              species: '',
              pot: '6 in',
              potMaterial: 'Plastic',
              light: 'Medium',
              indoor: 'Indoor',
              drainage: 'ok',
              soil: 'Well-draining mix',
              lat: '44.9778',
              lon: '-93.2650',
              waterEvery: '7',
              waterAmount: '500',
              fertEvery: '30',
              fertFormula: '10-10-10 @ 1/2 strength',
            }}
            submitLabel="Create Plant"
            onSubmit={handleSubmit}
            onCancel={close}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

