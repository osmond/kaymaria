'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import PlantForm, { PlantFormSubmit, PlantFormValues } from './PlantForm';

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
  const [initial, setInitial] = useState<PlantFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  function close() {
    onOpenChange(false);
  }

  useEffect(() => {
    if (!open) return;
    async function loadDefaults() {
      setLoading(true);
      setLoadError(null);
      setNotice(null);
      const base: PlantFormValues = {
        name: prefillName || '',
        roomId: defaultRoomId,
        species: prefillName || '',
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
      };
      try {
        const r = await fetch(`/api/species-care?species=${encodeURIComponent(prefillName || '')}`);
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (json.presets) {
          setInitial({ ...base, ...json.presets });
        } else {
          setNotice('No presets found—please adjust manually or request AI suggestions');
          setInitial(base);
        }
      } catch (e) {
        setLoadError('Failed to load species defaults.');
        setInitial(base);
      } finally {
        setLoading(false);
      }
    }
    loadDefaults();
  }, [open, prefillName, defaultRoomId]);

  async function handleSubmit(data: PlantFormSubmit, source: 'ai' | 'manual' = 'manual') {
    console.log('Creating plant via', source);
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
          </div>
          {loading && <div className="p-5">Loading defaults…</div>}
          {!loading && initial && (
            <>
              {loadError && (
                <div className="p-5 text-sm text-red-600">{loadError}</div>
              )}
              {notice && (
                <div className="p-5 text-sm text-gray-600">{notice}</div>
              )}
              <PlantForm
                initial={initial}
                submitLabel="Create Plant"
                onSubmit={handleSubmit}
                onCancel={close}
                enableAiSubmit
              />
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
