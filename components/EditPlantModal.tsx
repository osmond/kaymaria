'use client';

import React, { useEffect, useState } from 'react';

export default function EditPlantModal({
  open,
  onOpenChange,
  plant,
  onUpdated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  plant: { id: string; name: string; species?: string };
  onUpdated: (p: { name: string; species?: string }) => void;
}) {
  const [name, setName] = useState(plant.name);
  const [species, setSpecies] = useState(plant.species || '');
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setName(plant.name);
      setSpecies(plant.species || '');
    }
  }, [open, plant]);

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    setErr(null);
    try {
      const r = await fetch(`/api/plants/${plant.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim(), species: species || undefined }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const updated = await r.json();
      onUpdated(updated);
      onOpenChange(false);
    } catch (e: any) {
      setErr(e?.message || 'Failed to update plant.');
    } finally {
      setSaving(false);
    }
  }

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      <div className="absolute inset-0 bg-black/30" onClick={() => onOpenChange(false)} />
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl">
        <div className="p-5 border-b">
          <h2 className="text-lg font-display font-semibold">Edit Plant</h2>
        </div>
        <div className="p-5 space-y-4">
          {err && <div className="text-sm text-red-600">{err}</div>}
          <Field label="Name">
            <input className="input" value={name} onChange={(e) => setName(e.target.value)} />
          </Field>
          <Field label="Species (optional)">
            <input className="input" value={species} onChange={(e) => setSpecies(e.target.value)} />
          </Field>
          <div className="text-right">
            <button
              onClick={save}
              disabled={saving}
              className="px-4 py-2 rounded bg-neutral-900 text-white text-sm font-medium"
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block text-sm">
      <div className="font-medium">{label}</div>
      <div className="mt-1">{children}</div>
    </label>
  );
}

