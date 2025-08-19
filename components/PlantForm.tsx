'use client';

import React, { useEffect, useState } from 'react';

import type { AiCareSuggestion } from '@/lib/aiCare';
import { z } from 'zod';
import { plantFieldSchemas, plantFormSchema } from '@/lib/plantFormSchema';


import SpeciesAutosuggest from './SpeciesAutosuggest';

import RoomSelector from './RoomSelector';
import Stepper from './Stepper';


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
  humidity: string;
  lat?: string;
  lon?: string;
  waterEvery: string;
  waterAmount: string;
  fertEvery: string;
  fertFormula: string;
  lastWatered: string;
  lastFertilized: string;
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
  lat?: number;
  lon?: number;
  lastWateredAt?: string;
  lastFertilizedAt?: string;
  rules: {
    type: 'water' | 'fertilize';
    intervalDays: number;
    amountMl?: number;
    formula?: string;
  }[];
};

export function plantValuesToSubmit(s: PlantFormValues): PlantFormSubmit {
  const base: PlantFormSubmit = {
    name: s.name.trim(),
    roomId: s.roomId,
    species: s.species || undefined,
    potSize: s.pot,
    potMaterial: s.potMaterial,
    lightLevel: s.light,
    indoor: s.indoor === 'Indoor',
    soilType: s.soil || undefined,
    drainage: s.drainage,
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
  if (s.lastWatered) {
    base.lastWateredAt = new Date(s.lastWatered).toISOString();
  }
  if (s.lastFertilized) {
    base.lastFertilizedAt = new Date(s.lastFertilized).toISOString();
  }
  if (s.lat && s.lon && !isNaN(Number(s.lat)) && !isNaN(Number(s.lon))) {
    base.lat = Number(s.lat);
    base.lon = Number(s.lon);
  }
  return base;
}

type SectionProps = {
  state: PlantFormValues;
  setState: React.Dispatch<React.SetStateAction<PlantFormValues>>;
};

type FieldName =
  | 'name'
  | 'roomId'
  | 'waterEvery'
  | 'waterAmount'
  | 'fertEvery'
  | 'lastWatered'
  | 'lastFertilized'
  | 'lat'
  | 'lon';

type Validation = {
  errors: Partial<Record<FieldName, string>>;
  touched: Partial<Record<FieldName, boolean>>;
  validate: (field: FieldName, value: string | undefined) => void;
  markTouched: (field: FieldName) => void;
};

const emptyValidation: Validation = {
  errors: {},
  touched: {},
  validate: () => {},
  markTouched: () => {},
};

function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="flex gap-2">
      {options.map((opt) => (
        <button
          key={opt}
          type="button"
          className={`min-w-11 min-h-11 px-3 py-2 rounded-full border text-sm flex items-center justify-center ${
            value === opt
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
          }`}
          onClick={() => onChange(opt)}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export function BasicsFields({
  state,
  setState,
  validation = emptyValidation,
  defaults,
  nameInputRef,
  onSaveDefault,
}: SectionProps & {
  validation?: Validation;
  defaults?: { pot: string; potMaterial: string; light: string };
  nameInputRef?: React.RefObject<HTMLInputElement>;
  onSaveDefault?: (field: 'pot' | 'potMaterial' | 'light', value: string) => void;
}) {
  const { errors, touched, validate, markTouched } = validation;
  return (
    <div className="p-6 space-y-6">
      <Field
        label="Name"
        message={
          touched.name
            ? errors.name
              ? errors.name
              : 'Looks good!'
            : undefined
        }
        status={touched.name ? (errors.name ? 'error' : 'success') : undefined}
      >
        <SpeciesAutosuggest
          value={state.name}
          onChange={(v) => {
            setState({ ...state, name: v });
            markTouched('name');
            validate('name', v);
          }}
          onSelect={(s) => {
            setState({ ...state, name: s.name, species: s.species });
            markTouched('name');
            validate('name', s.name);
          }}
          onBlur={() => {
            markTouched('name');
            validate('name', state.name);
          }}
          inputRef={nameInputRef}
        />
      </Field>

      <Field label="Room">
        <RoomSelector
          value={state.roomId}
          onChange={(id) => {
            setState({ ...state, roomId: id });
            markTouched('roomId');
            validate('roomId', id);
          }}
        />
        {touched.roomId && (
          errors.roomId ? (
            <span className="text-xs text-red-600">{errors.roomId}</span>
          ) : (
            <span className="text-xs text-green-600">Looks good!</span>
          )
        )}
        <p className="hint">Stored locally in Settings → Defaults.</p>
      </Field>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Field label="Pot size" defaulted={defaults?.pot === state.pot}>
          <div className="flex items-center gap-2">
            <Stepper
              value={state.pot.replace(' in', '')}
              onChange={(v) =>
                setState({ ...state, pot: v ? `${v} in` : '' })
              }
              min={1}
            />
            <span className="text-sm">in</span>
          </div>
          {defaults && defaults.pot !== state.pot && onSaveDefault && (
            <button
              type="button"
              className="text-xs underline text-left"
              onClick={() => onSaveDefault('pot', state.pot)}
            >
              Save as new default
            </button>
          )}
          <p className="hint">Larger pots stay moist longer.</p>
        </Field>
        <Field
          label="Pot material"
          defaulted={defaults?.potMaterial === state.potMaterial}
        >
          <ChipSelect
            options={["Plastic", "Terracotta", "Ceramic"]}
            value={state.potMaterial}
            onChange={(v) => setState({ ...state, potMaterial: v })}
          />
          {defaults && defaults.potMaterial !== state.potMaterial &&
            onSaveDefault && (
              <button
                type="button"
                className="text-xs underline text-left"
                onClick={() => onSaveDefault('potMaterial', state.potMaterial)}
              >
                Save as new default
              </button>
            )}
          {state.pot && (
            <p className="hint">
              {state.pot}{' '}
              {state.potMaterial === 'Terracotta'
                ? 'terracotta dries faster than plastic.'
                : state.potMaterial === 'Plastic'
                ? 'plastic retains moisture longer.'
                : 'ceramic balances moisture.'}
            </p>
          )}
        </Field>
        <Field label="Light" defaulted={defaults?.light === state.light}>
          <ChipSelect
            options={["Low", "Medium", "Bright"]}
            value={state.light}
            onChange={(v) => setState({ ...state, light: v })}
          />
          {defaults && defaults.light !== state.light && onSaveDefault && (
            <button
              type="button"
              className="text-xs underline text-left"
              onClick={() => onSaveDefault('light', state.light)}
            >
              Save as new default
            </button>
          )}
        </Field>
      </div>
    </div>
  );
}

export function EnvironmentFields({
  state,
  setState,
  validation = emptyValidation,
}: SectionProps & { validation?: Validation }) {
  const { errors, touched, validate, markTouched } = validation;
  const [showMore, setShowMore] = useState(false);
  const [address, setAddress] = useState('');
  const [geoError, setGeoError] = useState<string | null>(null);

  function useCurrentLocation() {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude.toFixed(6);
        const lon = pos.coords.longitude.toFixed(6);
        setState({ ...state, lat, lon });
        markTouched('lat');
        markTouched('lon');
        validate('lat', lat);
        validate('lon', lon);
        setGeoError(null);
      },
      (err) => {
        if (err.code === err.PERMISSION_DENIED) {
          setGeoError('Location permission denied.');
        }
      }
    );
  }

  async function lookupAddress() {
    if (!address.trim()) return;
    try {
      const r = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
          address.trim()
        )}`
      );
      const data = await r.json();
      if (data[0]) {
        const lat = data[0].lat;
        const lon = data[0].lon;
        setState({ ...state, lat, lon });
        markTouched('lat');
        markTouched('lon');
        validate('lat', lat);
        validate('lon', lon);
      }
    } catch {}
  }

  return (
    <div className="p-6 space-y-6">
      <Field label="Environment">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
      </Field>
      {showMore && (
        <>
          <Field label="Soil type">
            <input
              className="input"
              value={state.soil}
              onChange={(e) => setState({ ...state, soil: e.target.value })}
              placeholder="e.g., cactus mix"
            />
          </Field>
          <Field label="Humidity (%)">
            <Stepper
              value={state.humidity}
              onChange={(v) => setState({ ...state, humidity: v })}
              min={0}
              step={5}
            />
          </Field>
        </>
      )}

      <Field label="Location (for weather)">
        <div className="grid gap-2">
          <button
            type="button"
            className="btn-secondary"
            onClick={useCurrentLocation}
            title="We’ll tailor watering to local weather."
          >
            Use current location
          </button>
          {geoError && <p className="text-xs text-red-600">{geoError}</p>}
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="Search address"
            />
            <button type="button" className="btn-secondary" onClick={lookupAddress}>
              Search
            </button>
          </div>
          {showMore && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="grid gap-1">
                <input
                  className="input"
                  value={state.lat ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setState({ ...state, lat: v });
                    markTouched('lat');
                    validate('lat', v);
                  }}
                  onBlur={() => {
                    markTouched('lat');
                    validate('lat', state.lat);
                  }}
                  placeholder="Latitude"
                />
                {touched.lat && (
                  errors.lat ? (
                    <span className="text-xs text-red-600">{errors.lat}</span>
                  ) : state.lat ? (
                    <span className="text-xs text-green-600">Looks good!</span>
                  ) : null
                )}
              </div>
              <div className="grid gap-1">
                <input
                  className="input"
                  value={state.lon ?? ''}
                  onChange={(e) => {
                    const v = e.target.value;
                    setState({ ...state, lon: v });
                    markTouched('lon');
                    validate('lon', v);
                  }}
                  onBlur={() => {
                    markTouched('lon');
                    validate('lon', state.lon);
                  }}
                  placeholder="Longitude"
                />
                {touched.lon && (
                  errors.lon ? (
                    <span className="text-xs text-red-600">{errors.lon}</span>
                  ) : state.lon ? (
                    <span className="text-xs text-green-600">Looks good!</span>
                  ) : null
                )}
              </div>
            </div>
          )}
        </div>
        <p className="hint">Used to tailor intervals based on local conditions.</p>
      </Field>

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
  onPlanModeChange?: (mode: 'ai' | 'manual') => void;
  validation?: Validation;
};

export function CarePlanFields({
  state,
  setState,
  initialSuggest,
  onSuggestChange,
  showSuggest = true,
  onPlanModeChange,
  validation = emptyValidation,
}: CarePlanProps) {
  const { errors, touched, validate, markTouched } = validation;
  const [suggest, setSuggest] = useState<AiCareSuggestion | null>(null);
  const [prevManual, setPrevManual] = useState<{
    waterEvery: string;
    waterAmount: string;
    fertEvery: string;
    fertFormula: string;
  } | null>(null);
  const [loadingSuggest, setLoadingSuggest] = useState(false);
  const [suggestError, setSuggestError] = useState<string | null>(null);
  const [showMore, setShowMore] = useState(false);

  const fmtDate = (d: Date) =>
    new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' }).format(d);
  const lastWateredDate = state.lastWatered ? new Date(state.lastWatered) : null;
  const lastFertilizedDate = state.lastFertilized
    ? new Date(state.lastFertilized)
    : null;
  const nextWater =
    lastWateredDate && Number(state.waterEvery) > 0
      ? new Date(lastWateredDate.getTime() + Number(state.waterEvery) * 864e5)
      : null;
  const nextFertilize =
    lastFertilizedDate && Number(state.fertEvery) > 0
      ? new Date(lastFertilizedDate.getTime() + Number(state.fertEvery) * 864e5)
      : null;

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
    onPlanModeChange?.('ai');
  }, [initialSuggest, setState, onPlanModeChange]);

  useEffect(() => {
    async function fetchSuggest() {
      if (!state.species) return;
      setSuggestError(null);
      setLoadingSuggest(true);
      try {
        const body: any = {
          name: state.name,
          species: state.species,
          potSize: state.pot,
          potMaterial: state.potMaterial,
          light: state.light,
          indoor: state.indoor === 'Indoor',
          drainage: state.drainage,
          soil: state.soil,
          humidity: Number(state.humidity),
        };
        if (state.lat && state.lon) {
          body.lat = Number(state.lat);
          body.lon = Number(state.lon);
        }
        const res = await fetch('/api/ai-care', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
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
        onPlanModeChange?.('ai');
      } catch (e: any) {
        setSuggestError(e?.message || 'Could not get suggestions.');
      } finally {
        setLoadingSuggest(false);
      }
    }
    if (showSuggest) fetchSuggest();
  }, [
    state.species,
    state.pot,
    state.potMaterial,
    state.light,
    state.indoor,
    state.drainage,
    state.soil,
    state.humidity,
    state.lat,
    state.lon,
    setState,
    showSuggest,
  ]);

  useEffect(() => {
    onSuggestChange?.(suggest);
  }, [suggest, onSuggestChange]);

  function applySuggest() {
    setSuggest(null);
    setPrevManual(null);
    onPlanModeChange?.('ai');
  }

  function customizePlan() {
    if (prevManual) {
      setState((s) => ({ ...s, ...prevManual }));
    }
    setSuggest(null);
    setPrevManual(null);
    onPlanModeChange?.('manual');
  }

  return (
    <div className="p-6 space-y-6">
      {showSuggest && (
        <div className="rounded-xl border p-3 bg-neutral-50">
          <div className="text-sm font-medium mb-2">Suggested plan</div>
          {loadingSuggest && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 animate-pulse">
              <div className="h-20 rounded-lg bg-neutral-200" />
              <div className="h-20 rounded-lg bg-neutral-200" />
            </div>
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
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
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
                <button className="btn" onClick={applySuggest}>Apply Suggested Plan</button>
                <button className="btn-secondary" onClick={customizePlan}>
                  Customize
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Water every (days)">
          <Stepper
            value={state.waterEvery}
            onChange={(v) => {
              setState({ ...state, waterEvery: v });
              markTouched('waterEvery');
              validate('waterEvery', v);
            }}
            min={1}
          />
          {touched.waterEvery && (
            errors.waterEvery ? (
              <span className="text-xs text-red-600">{errors.waterEvery}</span>
            ) : (
              <span className="text-xs text-green-600">Looks good!</span>
            )
          )}
          <p className="hint">Use arrows or type a number.</p>
          {nextWater && <p className="hint">Next watering: {fmtDate(nextWater)}</p>}
        </Field>
        <Field label="Water amount (ml)">
          <Stepper
            value={state.waterAmount}
            onChange={(v) => {
              setState({ ...state, waterAmount: v });
              markTouched('waterAmount');
              validate('waterAmount', v);
            }}
            min={10}
            step={10}
          />
          {touched.waterAmount && (
            errors.waterAmount ? (
              <span className="text-xs text-red-600">{errors.waterAmount}</span>
            ) : (
              <span className="text-xs text-green-600">Looks good!</span>
            )
          )}
          <p className="hint">Use arrows or type a number.</p>
        </Field>
      </div>

      <Field label="Last watered">
        <input
          type="date"
          className="input"
          value={state.lastWatered}
          onChange={(e) => {
            setState({ ...state, lastWatered: e.target.value });
            markTouched('lastWatered');
            validate('lastWatered', e.target.value);
          }}
        />
        {touched.lastWatered && (
          errors.lastWatered ? (
            <span className="text-xs text-red-600">{errors.lastWatered}</span>
          ) : (
            <span className="text-xs text-green-600">Looks good!</span>
          )
        )}
      </Field>

      <div className={`grid grid-cols-1 gap-4 ${showMore ? 'sm:grid-cols-3' : 'sm:grid-cols-2'}`}
      >
        <Field label="Fertilize every (days)">
          <Stepper
            value={state.fertEvery}
            onChange={(v) => {
              setState({ ...state, fertEvery: v });
              markTouched('fertEvery');
              validate('fertEvery', v);
            }}
            min={1}
          />
          {touched.fertEvery && (
            errors.fertEvery ? (
              <span className="text-xs text-red-600">{errors.fertEvery}</span>
            ) : (
              <span className="text-xs text-green-600">Looks good!</span>
            )
          )}
          <p className="hint">Use arrows or type a number.</p>
          {nextFertilize && (
            <p className="hint">Next fertilizing: {fmtDate(nextFertilize)}</p>
          )}
        </Field>
        <Field label="Last fertilized">
          <input
            type="date"
            className="input"
            value={state.lastFertilized}
            onChange={(e) => {
              setState({ ...state, lastFertilized: e.target.value });
              markTouched('lastFertilized');
              validate('lastFertilized', e.target.value);
            }}
          />
          {touched.lastFertilized && (
            errors.lastFertilized ? (
              <span className="text-xs text-red-600">{errors.lastFertilized}</span>
            ) : (
              <span className="text-xs text-green-600">Looks good!</span>
            )
          )}
        </Field>
        {showMore && (
          <Field label="Formula">
            <input
              className="input"
              value={state.fertFormula}
              onChange={(e) => setState({ ...state, fertFormula: e.target.value })}
              placeholder="e.g., 10-10-10 @ 1/2 strength"
            />
          </Field>
        )}
      </div>
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

export default function PlantForm({
  initial,
  submitLabel,
  onSubmit,
  onCancel,
  initialSuggest,
  defaults,
}: {
  initial: PlantFormValues;
  submitLabel: string;
  onSubmit: (data: PlantFormSubmit, source?: 'ai' | 'manual') => Promise<void>;
  onCancel: () => void;
  initialSuggest?: AiCareSuggestion | null;
  defaults?: { pot: string; potMaterial: string; light: string };
}) {
  const [state, setState] = useState<PlantFormValues>(initial);
  const [errors, setErrors] = useState<Validation['errors']>({});
  const [touched, setTouched] = useState<Validation['touched']>({});
  const fieldSchemas: Record<FieldName, z.ZodTypeAny> = {
    ...plantFieldSchemas,
    lat: z
      .string()
      .optional()
      .refine((v) => !v || !isNaN(Number(v)), {
        message: 'Latitude must be a number',
      }),
    lon: z
      .string()
      .optional()
      .refine((v) => !v || !isNaN(Number(v)), {
        message: 'Longitude must be a number',
      }),
  };

  const validate: Validation['validate'] = (field, value) => {
    const schema = fieldSchemas[field];
    if (!schema) return;
    const res = schema.safeParse(value);
    setErrors((e) => ({ ...e, [field]: res.success ? undefined : res.error.errors[0]?.message }));
  };
  const markTouched: Validation['markTouched'] = (field) => {
    setTouched((t) => ({ ...t, [field]: true }));
  };
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const hasSpecies = Boolean(state.species);
  const [planSource, setPlanSource] = useState<'ai' | 'manual' | null>(
    initialSuggest ? 'ai' : null,
  );

  useEffect(() => {
    setState(initial);
    setErrors({});
    setTouched({});
  }, [initial]);

  async function handleSubmit(source: 'ai' | 'manual' = 'manual', override?: PlantFormValues) {
    const current = override ?? state;
    if (!current.name.trim()) return;
    setSaving(true);
    setSaveError(false);
    try {
      await onSubmit(plantValuesToSubmit(current), source);
    } catch (e: any) {
      console.error('Error saving plant', e);
      try {
        let data: any = null;
        if (e instanceof Response) {
          data = await e.json().catch(() => null);
        } else if (e?.response && typeof e.response.json === 'function') {
          data = await e.response.json().catch(() => null);
        } else if (e?.response?.data) {
          data = e.response.data;
        }
        const field = data?.field as FieldName | undefined;
        if (field && fieldSchemas[field]) {
          const msg = data?.message || data?.error || 'Invalid value';
          setErrors((err) => ({ ...err, [field]: msg }));
          setTouched((t) => ({ ...t, [field]: true }));
        } else {
          setSaveError(true);
        }
      } catch (_) {
        setSaveError(true);
      }
      return;
    } finally {
      setSaving(false);
    }
  }

  const canSubmit = plantFormSchema.safeParse(state).success;
  const validation = { errors, touched, validate, markTouched };

  return (
    <>
      <BasicsFields
        state={state}
        setState={setState}
        validation={validation}
        defaults={defaults}
      />
      {hasSpecies && (
        <EnvironmentFields state={state} setState={setState} validation={validation} />
      )}
      <CarePlanFields
        state={state}
        setState={setState}
        initialSuggest={initialSuggest}
        showSuggest={hasSpecies}
        onPlanModeChange={setPlanSource}
        validation={validation}
      />
      <div className="p-5 border-t flex gap-2 justify-end items-center">
        <button className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        {saveError ? (
          <>
            <span className="text-sm text-red-600 mr-auto">
              Couldn’t save — please try again.
            </span>
            <button
              className="btn"
              onClick={() => handleSubmit(planSource === 'ai' ? 'ai' : 'manual')}
              disabled={saving}
            >
              Retry
            </button>
          </>
        ) : (
          <button
            className="btn"
            onClick={() => handleSubmit(planSource === 'ai' ? 'ai' : 'manual')}
            disabled={saving || !canSubmit}
          >
            {saving ? 'Saving…' : submitLabel}
          </button>
        )}
      </div>
      <FormStyles />
    </>
  );
}

export function FormStyles() {
  return (
    <style jsx>{`
      .input { @apply w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300; }
      .btn { @apply inline-flex items-center justify-center rounded-lg bg-neutral-900 text-white text-sm px-4 py-3 min-h-11 min-w-11 disabled:opacity-70 dark:bg-neutral-100 dark:text-neutral-900; }
      .btn-secondary { @apply inline-flex items-center justify-center rounded-lg border border-neutral-300 text-sm px-4 py-3 bg-white text-neutral-900 min-h-11 min-w-11 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-700; }
      .hint { @apply text-xs text-neutral-500 mt-1; }
    `}</style>
  );
}

function Field({
  label,
  children,
  message,
  status,
  defaulted,
}: {
  label: string;
  children: React.ReactNode;
  message?: string;
  status?: 'error' | 'success';
  defaulted?: boolean;
}) {
  return (
    <div className="grid gap-2">
      <label className="text-sm font-medium text-neutral-700 flex items-center gap-2">
        {label}
        {defaulted && (
          <span className="text-[10px] text-neutral-500 border px-1 rounded">
            Using your default
          </span>
        )}
      </label>
      {children}
      {message && (
        <span
          className={`text-xs ${
            status === 'error' ? 'text-red-600' : 'text-green-600'
          }`}
        >
          {message}
        </span>
      )}
    </div>
  );
}

