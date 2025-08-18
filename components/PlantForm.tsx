'use client';

import React, { useEffect, useState } from 'react';

import type { AiCareSuggestion } from '@/lib/aiCare';


import SpeciesAutosuggest from './SpeciesAutosuggest';

import RoomSelector from './RoomSelector';


export type PlantFormValues = {
  name: string;
  roomId: string;
  species: string;
  pot: string;
  potMaterial: string;
  light: string;
  indoor: 'Indoor' | 'Outdoor';
  drainage: 'poor' | 'ok' | 'great';
  soil: string;
  lat: string;
  lon: string;
  waterEvery: string;
  waterAmount: string;
  fertEvery: string;
  fertFormula: string;
};

export type PlantFormSubmit = {
  name: string;
  roomId: string;
  species?: string;
  potSize: string;
  potMaterial: string;
  lightLevel: string;
  indoor: boolean;
  soilType?: string;
  drainage: 'poor' | 'ok' | 'great';
  lat: number;
  lon: number;
  rules: { type: 'water' | 'fertilize'; intervalDays: number; amountMl?: number; formula?: string }[];
};

export function plantValuesToSubmit(s: PlantFormValues): PlantFormSubmit {
  return {
    name: s.name.trim(),
    roomId: s.roomId,
    species: s.species || undefined,
    potSize: s.pot,
    potMaterial: s.potMaterial,
    lightLevel: s.light,
    indoor: s.indoor === 'Indoor',
    soilType: s.soil || undefined,
    drainage: s.drainage,
    lat: Number(s.lat),
    lon: Number(s.lon),
    rules: [
      {
        type: 'water',
        intervalDays: Number(s.waterEvery || 7),
        amountMl: Number(s.waterAmount || 500),
      },
      {
        type: 'fertilize',
        intervalDays: Number(s.fertEvery || 30),
        formula: s.fertFormula || undefined,
      },
    ],
  };
}

type SectionProps = {
  state: PlantFormValues;
  setState: React.Dispatch<React.SetStateAction<PlantFormValues>>;
};

export function BasicsFields({ state, setState }: SectionProps) {
  return (
    <div className="p-5 space-y-4">
      <Field label="Name">
        <SpeciesAutosuggest
          value={state.name}
          onChange={(v) => setState({ ...state, name: v })}
          onSelect={(s) => setState({ ...state, name: s.name, species: s.species })}
        />
      </Field>

      <Field label="Room">
        <RoomSelector
          value={state.roomId}
          onChange={(id) => setState({ ...state, roomId: id })}
        />
        <p className="hint">Stored locally in Settings → Defaults.</p>
      </Field>

      <div className="grid grid-cols-3 gap-3">
        <Field label="Pot size">
          <select
            className="input"
            value={state.pot}
            onChange={(e) => setState({ ...state, pot: e.target.value })}
          >
            <option>4 in</option>
            <option>6 in</option>
            <option>8 in</option>
          </select>
        </Field>
        <Field label="Pot material">
          <select
            className="input"
            value={state.potMaterial}
            onChange={(e) => setState({ ...state, potMaterial: e.target.value })}
          >
            <option>Plastic</option>
            <option>Terracotta</option>
            <option>Ceramic</option>
          </select>
        </Field>
        <Field label="Light">
          <select
            className="input"
            value={state.light}
            onChange={(e) => setState({ ...state, light: e.target.value })}
          >
            <option>Low</option>
            <option>Medium</option>
            <option>Bright</option>
          </select>
        </Field>
      </div>
    </div>
  );
}

export function EnvironmentFields({ state, setState }: SectionProps) {
  const [showMore, setShowMore] = useState(false);
  return (
    <div className="p-5 space-y-4">
      <Field label="Environment">
        <div className="grid grid-cols-2 gap-3">
          <select
            className="input"
            value={state.indoor}
            onChange={(e) =>
              setState({ ...state, indoor: e.target.value as 'Indoor' | 'Outdoor' })
            }
          >
            <option>Indoor</option>
            <option>Outdoor</option>
          </select>
          <select
            className="input"
            value={state.drainage}
            onChange={(e) =>
              setState({ ...state, drainage: e.target.value as 'poor' | 'ok' | 'great' })
            }
          >
            <option value="poor">Poor drainage</option>
            <option value="ok">OK drainage</option>
            <option value="great">Great drainage</option>
          </select>
        </div>
        {showMore && (
          <input
            className="input mt-2"
            value={state.soil}
            onChange={(e) => setState({ ...state, soil: e.target.value })}
            placeholder="Soil type (e.g., Aroid mix)"
          />
        )}
      </Field>

      {showMore && (
        <Field label="Location (for weather)">
          <div className="grid grid-cols-2 gap-3">
            <input
              className="input"
              value={state.lat}
              onChange={(e) => setState({ ...state, lat: e.target.value })}
              placeholder="Latitude"
            />
            <input
              className="input"
              value={state.lon}
              onChange={(e) => setState({ ...state, lon: e.target.value })}
              placeholder="Longitude"
            />
          </div>
          <p className="hint">Used to tailor intervals based on local conditions.</p>
        </Field>
      )}

      <button
        type="button"
        className="text-xs underline"
        onClick={() => setShowMore((m) => !m)}
      >
        {showMore ? 'Less options' : 'More options'}
      </button>
    </div>
  );
}

type CarePlanProps = SectionProps & {
  initialSuggest?: AiCareSuggestion | null;
  onSuggestChange?: (s: AiCareSuggestion | null) => void;
  showSuggest?: boolean;
};

export function CarePlanFields({
  state,
  setState,
  initialSuggest,
  onSuggestChange,
  showSuggest = true,
}: CarePlanProps) {
  const [suggest, setSuggest] = useState<AiCareSuggestion | null>(null);
  const [prevManual, setPrevManual] = useState<{
    waterEvery: string;
    waterAmount: string;
    fertEvery: string;
    fertFormula: string;
  } | null>(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);

  useEffect(() => {
    if (!initialSuggest) return;
    setPrevManual({
      waterEvery: state.waterEvery,
      waterAmount: state.waterAmount,
      fertEvery: state.fertEvery,
      fertFormula: state.fertFormula,
    });
    setState((s) => ({
      ...s,
      waterEvery: initialSuggest.waterEvery
        ? String(initialSuggest.waterEvery)
        : s.waterEvery,
      waterAmount: initialSuggest.waterAmount
        ? String(initialSuggest.waterAmount)
        : s.waterAmount,
      fertEvery: initialSuggest.fertEvery
        ? String(initialSuggest.fertEvery)
        : s.fertEvery,
      fertFormula: initialSuggest.fertFormula ?? s.fertFormula,
    }));
    setSuggest(initialSuggest);
  }, [initialSuggest, setState]);

  useEffect(() => {
    async function fetchSuggest() {
      if (!state.species) return;
      setSuggestError(null);
      setLoadingSuggest(true);
      try {
        const res = await fetch('/api/ai-care', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: state.name,
            species: state.species,
            potSize: state.pot,
            potMaterial: state.potMaterial,
            lat: Number(state.lat),
            lon: Number(state.lon),
          }),
        });
        if (!res.ok) throw new Error('Failed to get suggestion');
        const json: AiCareSuggestion = await res.json();
        setPrevManual({
          waterEvery: state.waterEvery,
          waterAmount: state.waterAmount,
          fertEvery: state.fertEvery,
          fertFormula: state.fertFormula,
        });
        setState((s) => ({
          ...s,
          waterEvery: json.waterEvery ? String(json.waterEvery) : s.waterEvery,
          waterAmount: json.waterAmount ? String(json.waterAmount) : s.waterAmount,
          fertEvery: json.fertEvery ? String(json.fertEvery) : s.fertEvery,
          fertFormula: json.fertFormula ?? s.fertFormula,
        }));
        setSuggest(json);
      } catch (e: any) {
        setSuggestError(e?.message || 'Could not get suggestions.');
      } finally {
        setLoadingSuggest(false);
      }
    }
    if (showSuggest) fetchSuggest();
  }, [state.species, state.pot, state.potMaterial, state.lat, state.lon, setState, showSuggest]);

  useEffect(() => {
    onSuggestChange?.(suggest);
  }, [suggest, onSuggestChange]);

  function acceptSuggest() {
    setSuggest(null);
    setPrevManual(null);
  }

  function overrideSuggest() {
    if (prevManual) {
      setState((s) => ({ ...s, ...prevManual }));
    }
    setSuggest(null);
    setPrevManual(null);
  }

  return (
    <div className="p-5 space-y-4">
      {showSuggest && (
        <div className="rounded-xl border p-3 bg-neutral-50">
          <div className="text-sm font-medium mb-2">Suggested plan</div>
          {loadingSuggest && (
            <div className="text-xs text-neutral-600">Getting suggestions…</div>
          )}
          {suggestError && (
            <div className="text-xs text-red-600 mb-2">{suggestError}</div>
          )}
          {!suggest && !loadingSuggest && (
            <div className="text-xs text-neutral-600">
              Select species and pot info to get AI recommendations.
            </div>
          )}
          {suggest && !loadingSuggest && (
            <div className="grid gap-2 text-sm">
              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg border bg-white p-2">
                  <div className="text-xs text-neutral-500">Water</div>
                  <div className="font-medium">
                    every {suggest.waterEvery} d · {suggest.waterAmount} ml
                  </div>
                </div>
                <div className="rounded-lg border bg-white p-2">
                  <div className="text-xs text-neutral-500">Fertilize</div>
                  <div className="font-medium">every {suggest.fertEvery} d</div>
                  {suggest.fertFormula && (
                    <div className="text-xs text-neutral-500">{suggest.fertFormula}</div>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button className="btn" onClick={acceptSuggest}>Use suggestions</button>
                <button className="btn-secondary" onClick={overrideSuggest}>
                  Override manually
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Water every (days)">
          <input
            className="input"
            type="number"
            min={1}
            value={state.waterEvery}
            onChange={(e) => setState({ ...state, waterEvery: e.target.value })}
          />
        </Field>
        <Field label="Water amount (ml)">
          <input
            className="input"
            type="number"
            min={50}
            step={10}
            value={state.waterAmount}
            onChange={(e) => setState({ ...state, waterAmount: e.target.value })}
          />
        </Field>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <Field label="Fertilize every (days)">
          <input
            className="input"
            type="number"
            min={7}
            value={state.fertEvery}
            onChange={(e) => setState({ ...state, fertEvery: e.target.value })}
          />
        </Field>
        <Field label="Formula">
          <input
            className="input"
            value={state.fertFormula}
            onChange={(e) => setState({ ...state, fertFormula: e.target.value })}
            placeholder="e.g., 10-10-10 @ 1/2 strength"
          />
        </Field>
      </div>
    </div>
  );
}

export default function PlantForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  enableAiSubmit,
  initialSuggest,
}: {
  initial: PlantFormValues;
  submitLabel: string;
  onSubmit: (data: PlantFormSubmit, source?: 'ai' | 'manual') => Promise<void>;
  onCancel: () => void;
  enableAiSubmit?: boolean;
  initialSuggest?: AiCareSuggestion | null;
}) {
  const [state, setState] = useState<PlantFormValues>(initial);
  const [suggest, setSuggest] = useState<AiCareSuggestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const hasSpecies = Boolean(state.species);

  useEffect(() => {
    setState(initial);
  }, [initial]);

  function toSubmit() {
    return plantValuesToSubmit(state);
  }

  async function handleSubmit(source: 'ai' | 'manual' = 'manual', override?: PlantFormValues) {
    const current = override ?? state;
    if (!current.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSubmit(plantValuesToSubmit(current), source);
    } catch (e: any) {
      console.error('Error saving plant', e);
      let message = 'Failed to save plant.';
      try {
        const status = e?.status ?? e?.response?.status;
        let data: any = null;
        if (e instanceof Response) {
          data = await e.json().catch(() => null);
        } else if (e?.response && typeof e.response.json === 'function') {
          data = await e.response.json().catch(() => null);
        } else if (e?.response?.data) {
          data = e.response.data;
        }
        if (status === 401 || /401/.test(e?.message || '')) {
          message = 'Please log in before adding a plant.';
        } else if (data?.error) {
          message = data.error;
        } else if (data?.message) {
          message = data.message;
        } else if (data?.detail) {
          message = data.detail;
        } else if (typeof e?.message === 'string') {
          message = e.message;
        }
      } catch (_) {
        // ignore parse errors
      }
      setSaveError(message);
      return;
    } finally {
      setSaving(false);
    }
  }

  async function handleSubmitAi() {
    if (!suggest) return;
    const s: PlantFormValues = {
      ...state,
      waterEvery: String(suggest.waterEvery ?? Number(state.waterEvery)),
      waterAmount: String(suggest.waterAmount ?? Number(state.waterAmount)),
      fertEvery: String(suggest.fertEvery ?? Number(state.fertEvery)),
      fertFormula: suggest.fertFormula ?? state.fertFormula,
    };
    await handleSubmit('ai', s);
  }

  return (
    <>
      <BasicsFields state={state} setState={setState} />
      {hasSpecies && <EnvironmentFields state={state} setState={setState} />}
      <CarePlanFields
        state={state}
        setState={setState}
        initialSuggest={initialSuggest}
        onSuggestChange={setSuggest}
        showSuggest={hasSpecies}
      />
      {saveError && <div className="p-5 text-xs text-red-600">{saveError}</div>}
      <div className="p-5 border-t flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        {enableAiSubmit && suggest && (
          <button className="btn" onClick={handleSubmitAi} disabled={saving || !state.name.trim()}>
            {saving ? 'Saving…' : 'Create with AI Plan'}
          </button>
        )}
        <button className="btn" onClick={() => handleSubmit('manual')} disabled={saving || !state.name.trim()}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
      <FormStyles />
    </>
  );
}

export function FormStyles() {
  return (
    <style jsx>{`
      .input { @apply w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300; }
      .btn { @apply rounded-lg bg-neutral-900 text-white text-sm px-3 py-2 disabled:opacity-70; }
      .btn-secondary { @apply rounded-lg border text-sm px-3 py-2 bg-white; }
      .hint { @apply text-xs text-neutral-500 mt-1; }
    `}</style>
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

