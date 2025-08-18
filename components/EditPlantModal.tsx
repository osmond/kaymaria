'use client';

import React from 'react';
import PlantForm, { PlantFormSubmit } from './PlantForm';

export default function EditPlantModal({
  open,
  onOpenChange,
  plant,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plant: any;
  onUpdated: (p: any) => void;
}) {
  function close() {
    onOpenChange(false);
  }

  async function handleSubmit(data: PlantFormSubmit) {
    const r = await fetch(`/api/plants/${plant.id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const updated = await r.json();
    onUpdated(updated);
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
          <h2 className="text-lg font-display font-semibold">Edit Plant</h2>
        </div>
        <PlantForm
          initial={{
            name: plant.name,
            roomId: plant.roomId || '',
            species: plant.species || '',
            pot: plant.potSize || '6 in',
            potMaterial: plant.potMaterial || 'Plastic',
            light: plant.lightLevel || plant.light || 'Medium',
            indoor: plant.indoor ? 'Indoor' : 'Outdoor',
            drainage: plant.drainage || 'ok',
            soil: plant.soilType || '',
            lat: plant.latitude !== undefined ? String(plant.latitude) : '',
            lon: plant.longitude !== undefined ? String(plant.longitude) : '',
            waterEvery: plant.waterIntervalDays !== undefined ? String(plant.waterIntervalDays) : '7',
            waterAmount: plant.waterAmountMl !== undefined ? String(plant.waterAmountMl) : '500',
            fertEvery: plant.fertilizeIntervalDays !== undefined ? String(plant.fertilizeIntervalDays) : '30',
            fertFormula: plant.fertilizeFormula || '',
          }}
          submitLabel="Save"
          onSubmit={handleSubmit}
          onCancel={close}
        />
      </div>
    </div>
  );
}

