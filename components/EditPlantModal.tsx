'use client';

import React from 'react';
import { Dialog } from '@headlessui/react';
import PlantForm, { PlantFormSubmit } from './PlantForm';
import type { Plant } from '@prisma/client';

export default function EditPlantModal({
  open,
  onOpenChange,
  plant,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plant: Plant;
  onUpdated: (p: Plant) => void;
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
    <Dialog open={open} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4">
        <Dialog.Panel className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-card max-h-[90vh] overflow-y-auto">
          <div className="p-5 border-b">
            <Dialog.Title className="text-lg font-display font-semibold">Edit Plant</Dialog.Title>
          </div>
          <PlantForm
            initial={{
              name: plant.name,
              roomId: plant.roomId || '',
              species: plant.species || '',
              pot: plant.potSize || '6 in',
              potHeight: plant.potSize || '6 in',
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
              lastWatered: plant.lastWateredAt
                ? new Date(plant.lastWateredAt).toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10),
              lastFertilized: plant.lastFertilizedAt
                ? new Date(plant.lastFertilizedAt).toISOString().slice(0, 10)
                : new Date().toISOString().slice(0, 10),
            }}
            submitLabel="Save"
            onSubmit={handleSubmit}
            onCancel={close}
          />
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}

