'use client';

import React, { useEffect, useState } from 'react';

import type { AiCareSuggestion } from '@/lib/aiCare';

import { fetchCareRules, CareSuggest } from '@/lib/careRules';

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

export default function PlantForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
}: {
  initial: PlantFormValues;
  submitLabel: string;
  onSubmit: (data: PlantFormSubmit) => Promise<void>;
  onCancel: () => void;
}) {
  const [state, setState] = useState<PlantFormValues>(initial);
  const [suggest, setSuggest] = useState<AiCareSuggestion | null>(null);
  const [prevManual, setPrevManual] = useState<{
    waterEvery: string;
    waterAmount: string;
    fertEvery: string;
    fertFormula: string;
  } | null>(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  useEffect(() => {
    setState(initial);
  }, [initial]);

  useEffect(() => {
    async function fetchSuggest() {
      if (!state.species && !state.pot && !state.potMaterial) return;
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
    fetchSuggest();
  }, [state.species, state.pot, state.potMaterial]);

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

  async function handleSubmit() {
    if (!state.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await onSubmit({
        name: state.name.trim(),
        roomId: state.roomId,
        species: state.species || undefined,
        potSize: state.pot,
        potMaterial: state.potMaterial,
        lightLevel: state.light,
        indoor: state.indoor === 'Indoor',
        soilType: state.soil || undefined,
        drainage: state.drainage,
        lat: Number(state.lat),
        lon: Number(state.lon),
        rules: [
          {
            type: 'water',
            intervalDays: Number(state.waterEvery || 7),
            amountMl: Number(state.waterAmount || 500),
          },
          {
            type: 'fertilize',
            intervalDays: Number(state.fertEvery || 30),
            formula: state.fertFormula || undefined,
          },
        ],
      });
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

  return (
    <>
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

        <Field label="Environment">
          <div className="grid grid-cols-2 gap-3">
            <select
              className="input"
              value={state.indoor}
              onChange={(e) => setState({ ...state, indoor: e.target.value as 'Indoor' | 'Outdoor' })}
            >
              <option>Indoor</option>
              <option>Outdoor</option>
            </select>
            <select
              className="input"
              value={state.drainage}
              onChange={(e) => setState({ ...state, drainage: e.target.value as 'poor' | 'ok' | 'great' })}
            >
              <option value="poor">Poor drainage</option>
              <option value="ok">OK drainage</option>
              <option value="great">Great drainage</option>
            </select>
          </div>
          <input
            className="input mt-2"
            value={state.soil}
            onChange={(e) => setState({ ...state, soil: e.target.value })}
            placeholder="Soil type (e.g., Aroid mix)"
          />
        </Field>

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

        {saveError && <div className="text-xs text-red-600">{saveError}</div>}
      </div>
      <div className="p-5 border-t flex gap-2 justify-end">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button className="btn" onClick={handleSubmit} disabled={saving || !state.name.trim()}>
          {saving ? 'Saving…' : submitLabel}
        </button>
      </div>
      <style jsx>{`
        .input { @apply w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300; }
        .btn { @apply rounded-lg bg-neutral-900 text-white text-sm px-3 py-2 disabled:opacity-70; }
        .btn-secondary { @apply rounded-lg border text-sm px-3 py-2 bg-white; }
        .hint { @apply text-xs text-neutral-500 mt-1; }
      `}</style>
    </>
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

