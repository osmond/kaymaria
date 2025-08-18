'use client';

import React from 'react';
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
    onCreate(data.name);
    close();
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/30" onClick={close} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b">
          <h2 className="text-lg font-display font-semibold">Add Plant</h2>
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
      </div>
    </div>
  );
}

