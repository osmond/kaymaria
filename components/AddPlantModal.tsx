'use client';

import React, { useEffect, useState } from 'react';

type CareSuggest = {
  version: string;
  water: { intervalDays: number; amountMl?: number; notes?: string };
  fertilize: { intervalDays: number; formula?: string; notes?: string };
  repot?: { intervalDays?: number; notes?: string };
  assumptions?: string[];
  warnings?: string[];
  confidence?: number;
};

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
  // basic fields
  const [name, setName] = useState(prefillName || '');
  const [roomId, setRoomId] = useState(defaultRoomId);
  const [species, setSpecies] = useState('');
  const [pot, setPot] = useState('6 in');
  const [potMaterial, setPotMaterial] = useState('Plastic');
  const [light, setLight] = useState('Medium');
  const [indoor, setIndoor] = useState<'Indoor'|'Outdoor'>('Indoor');
  const [drainage, setDrainage] = useState<'poor'|'ok'|'great'>('ok');
  const [soil, setSoil] = useState('Well-draining mix');
  const [lat, setLat] = useState('44.9778');
  const [lon, setLon] = useState('-93.2650');

  // care fields
  const [waterEvery, setWaterEvery] = useState('7');
  const [waterAmount, setWaterAmount] = useState('500');
  const [fertEvery, setFertEvery] = useState('30');
  const [fertFormula, setFertFormula] = useState('10-10-10 @ 1/2 strength');

  // suggestion state
  const [suggest, setSuggest] = useState<CareSuggest | null>(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  // saving state
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    if (open) setName(prefillName || '');
  }, [open, prefillName]);

  function close() { onOpenChange(false); }

  async function requestSuggest() {
    setSuggestError(null);
    setLoadingSuggest(true);
    try {
      const r = await fetch('/api/ai/care-suggest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          lat: Number(lat),
          lon: Number(lon),
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      const json: CareSuggest = await r.json();
      setSuggest(json);
    } catch (e:any) {
      setSuggestError(e?.message || 'Could not get suggestions.');
    } finally {
      setLoadingSuggest(false);
    }
  }

  function applySuggest() {
    if (!suggest) return;
    if (suggest.water.intervalDays) setWaterEvery(String(suggest.water.intervalDays));
    if (suggest.water.amountMl) setWaterAmount(String(suggest.water.amountMl));
    if (suggest.fertilize.intervalDays) setFertEvery(String(suggest.fertilize.intervalDays));
    if (suggest.fertilize.formula) setFertFormula(String(suggest.fertilize.formula));
  }

  async function save() {
    if (!name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      const r = await fetch('/api/plants', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          roomId,
          species: species || undefined,
          potSize: pot,
          potMaterial,
          lightLevel: light,
          indoor: indoor === 'Indoor',
          soilType: soil || undefined,
          drainage,
          lat: Number(lat),
          lon: Number(lon),
          rules: [
            { type: 'water', intervalDays: Number(waterEvery || 7), amountMl: Number(waterAmount || 500) },
            { type: 'fertilize', intervalDays: Number(fertEvery || 30), formula: fertFormula || undefined },
          ],
        }),
      });
      if (!r.ok) throw new Error(`HTTP ${r.status}`);
      onCreate(name.trim());
    } catch (e:any) {
      setSaveError(e?.message || 'Failed to create plant.');
    } finally {
      setSaving(false);
    }
  }

  // --- UI ---
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
    >
      {/* backdrop */}
      <div className="absolute inset-0 bg-black/30" onClick={close} />

      {/* panel */}
      <div className="relative w-full sm:max-w-lg bg-white rounded-t-2xl sm:rounded-2xl shadow-xl max-h-[90vh] overflow-y-auto">
        <div className="p-5 border-b">
          <h2 className="text-lg font-display font-semibold">Add Plant</h2>
          <p className="text-sm text-neutral-600">Use a canned AI suggestion for MVP.</p>
        </div>

        <div className="p-5 space-y-4">
          <Field label="Name">
            <input className="input" value={name} onChange={e=>setName(e.target.value)} placeholder="e.g., Monstera Deliciosa" />
          </Field>

          <Field label="Room ID (internal)">
            <input className="input" value={roomId} onChange={e=>setRoomId(e.target.value)} placeholder={defaultRoomId} />
            <p className="hint">Stored locally in Settings → Defaults.</p>
          </Field>

          <Field label="Species (optional)">
            <input className="input" value={species} onChange={e=>setSpecies(e.target.value)} placeholder="e.g., Monstera deliciosa" />
          </Field>

          <div className="grid grid-cols-3 gap-3">
            <Field label="Pot size">
              <select className="input" value={pot} onChange={e=>setPot(e.target.value)}>
                <option>4 in</option><option>6 in</option><option>8 in</option>
              </select>
            </Field>
            <Field label="Pot material">
              <select className="input" value={potMaterial} onChange={e=>setPotMaterial(e.target.value)}>
                <option>Plastic</option><option>Terracotta</option><option>Ceramic</option>
              </select>
            </Field>
            <Field label="Light">
              <select className="input" value={light} onChange={e=>setLight(e.target.value)}>
                <option>Low</option><option>Medium</option><option>Bright</option>
              </select>
            </Field>
          </div>

          <Field label="Environment">
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={indoor} onChange={e=>setIndoor(e.target.value as 'Indoor'|'Outdoor')}>
                <option>Indoor</option><option>Outdoor</option>
              </select>
              <select className="input" value={drainage} onChange={e=>setDrainage(e.target.value as 'poor'|'ok'|'great')}>
                <option value="poor">Poor drainage</option>
                <option value="ok">OK drainage</option>
                <option value="great">Great drainage</option>
              </select>
            </div>
            <input className="input mt-2" value={soil} onChange={e=>setSoil(e.target.value)} placeholder="Soil type (e.g., Aroid mix)" />
          </Field>

          <Field label="Location (for weather)">
            <div className="grid grid-cols-2 gap-3">
              <input className="input" value={lat} onChange={e=>setLat(e.target.value)} placeholder="Latitude" />
              <input className="input" value={lon} onChange={e=>setLon(e.target.value)} placeholder="Longitude" />
            </div>
            <p className="hint">Used to tailor intervals based on local conditions.</p>
          </Field>

          {/* AI suggestion */}
          <div className="rounded-xl border p-3 bg-neutral-50">
            <div className="flex items-center justify-between mb-2">
              <div className="text-sm font-medium">AI + Weather Suggestions</div>
              <button className="btn" onClick={requestSuggest} disabled={loadingSuggest}>
                {loadingSuggest ? 'Getting…' : 'Get suggestions'}
              </button>
            </div>
            {suggestError && <div className="text-xs text-red-600 mb-2">{suggestError}</div>}
            {!suggest && !loadingSuggest && <div className="text-xs text-neutral-600">Uses species, pot, light, environment and your local weather.</div>}
            {suggest && (
              <div className="grid gap-2 text-sm">
                <div className="grid grid-cols-2 gap-2">
                  <div className="rounded-lg border bg-white p-2">
                    <div className="text-xs text-neutral-500">Water</div>
                    <div className="font-medium">every {suggest.water.intervalDays} d · {suggest.water.amountMl ?? '~'} ml</div>
                  </div>
                  <div className="rounded-lg border bg-white p-2">
                    <div className="text-xs text-neutral-500">Fertilize</div>
                    <div className="font-medium">every {suggest.fertilize.intervalDays} d</div>
                    <div className="text-xs text-neutral-500">{suggest.fertilize.formula}</div>
                  </div>
                </div>
                {suggest.assumptions && <div className="text-xs text-neutral-500">Assumptions: {suggest.assumptions.join(', ')}</div>}
                {suggest.warnings && <div className="text-xs text-amber-700">Warnings: {suggest.warnings.join('; ')}</div>}
                <div><button className="btn-secondary" onClick={applySuggest}>Apply to fields</button></div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Water every (days)">
              <input className="input" type="number" min={1} value={waterEvery} onChange={e=>setWaterEvery(e.target.value)} />
            </Field>
            <Field label="Water amount (ml)">
              <input className="input" type="number" min={50} step={10} value={waterAmount} onChange={e=>setWaterAmount(e.target.value)} />
            </Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Fertilize every (days)">
              <input className="input" type="number" min={7} value={fertEvery} onChange={e=>setFertEvery(e.target.value)} />
            </Field>
            <Field label="Formula">
              <input className="input" value={fertFormula} onChange={e=>setFertFormula(e.target.value)} placeholder="e.g., 10-10-10 @ 1/2 strength" />
            </Field>
          </div>

          {saveError && <div className="text-xs text-red-600">{saveError}</div>}
        </div>

        <div className="p-5 border-t flex gap-2 justify-end">
          <button className="btn-secondary" onClick={close}>Cancel</button>
          <button className="btn" onClick={save} disabled={saving || !name.trim()}>{saving ? 'Creating…' : 'Create Plant'}</button>
        </div>
      </div>

      <style jsx>{`
        .input { @apply w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300; }
        .btn { @apply rounded-lg bg-neutral-900 text-white text-sm px-3 py-2 disabled:opacity-70; }
        .btn-secondary { @apply rounded-lg border text-sm px-3 py-2 bg-white; }
        .hint { @apply text-xs text-neutral-500 mt-1; }
      `}</style>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-neutral-700">{label}</label>
      {children}
    </div>
  );
}
