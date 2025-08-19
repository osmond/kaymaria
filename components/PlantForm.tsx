'use client';

import React, { useEffect, useState, useRef } from 'react';

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
  potHeight: string;
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
  potHeight: string;
  potMaterial: string;
  lightLevel: string;
  indoor: boolean;
  soilType?: string;
  drainage: 'poor' | 'ok' | 'great';
  lat?: number;
  lon?: number;
  lastWateredAt?: string;
  lastFertilizedAt?: string;
  createTasks?: boolean;
  rules: {
    type: 'water' | 'fertilize';
    intervalDays: number;
    amountMl?: number;
    formula?: string;
  }[];
};

export type PlanSource =
  | { type: 'preset'; presetId?: string }
  | { type: 'ai'; aiModel?: string; aiVersion?: string }
  | { type: 'manual' };

export function plantValuesToSubmit(s: PlantFormValues): PlantFormSubmit {
  const base: PlantFormSubmit = {
    name: s.name.trim(),
    roomId: s.roomId,
    species: s.species || undefined,
    potSize: s.pot,
    potHeight: s.potHeight,
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
  if (s.lat && s.lon) {
    const lat = Number(s.lat);
    const lon = Number(s.lon);
    if (
      !isNaN(lat) &&
      !isNaN(lon) &&
      lat >= -90 &&
      lat <= 90 &&
      lon >= -180 &&
      lon <= 180
    ) {
      base.lat = lat;
      base.lon = lon;
    }
  }
  base.createTasks = true;
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

export function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<HTMLButtonElement[]>([]);
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Options">
      {options.map((opt, i) => (
        <button
          key={opt}
          ref={(el) => (refs.current[i] = el!)}
          type="button"
          role="radio"
          aria-checked={value === opt}
          aria-label={opt}
          tabIndex={value === opt ? 0 : -1}
          className={`min-w-11 min-h-11 px-3 py-2 rounded-full border text-sm flex items-center justify-center ${
            value === opt
              ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
              : 'bg-white text-neutral-900 dark:bg-neutral-800 dark:text-neutral-100'
          }`}
          onClick={() => onChange(opt)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault();
              refs.current[(i + 1) % options.length]?.focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault();
              refs.current[(i - 1 + options.length) % options.length]?.focus();
            } else if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              onChange(opt);
            }
          }}
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
  nameInputRef,
}: SectionProps & {
  validation?: Validation;
  nameInputRef?: React.RefObject<HTMLInputElement>;
}) {
  const { errors, touched, validate, markTouched } = validation;
  return (
    <div className="p-0 space-y-6">
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
        <p className="hint">
          Species helps personalize care. If unknown, generic tips apply.
        </p>
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
    </div>
  );
}

export function EnvironmentFields({
  state,
  setState,
  validation = emptyValidation,
  locationTag,
  onLocationEdit,
  onUseCurrentLocation,
}: SectionProps & {
  validation?: Validation;
  locationTag?: string | null;
  onLocationEdit?: () => void;
  onUseCurrentLocation?: () => void;
}) {
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
        onUseCurrentLocation?.();
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
        onLocationEdit?.();
      }
    } catch {}
  }

  return (
    <div className="p-0 space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <Field label="Pot size">
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
          <p className="hint">Larger pots stay moist longer.</p>
        </Field>
        <Field label="Pot height">
          <div className="flex items-center gap-2">
            <Stepper
              value={state.potHeight.replace(' in', '')}
              onChange={(v) =>
                setState({ ...state, potHeight: v ? `${v} in` : '' })
              }
              min={1}
            />
            <span className="text-sm">in</span>
          </div>
        </Field>
        <Field label="Material">
          <ChipSelect
            options={["Plastic", "Terracotta", "Ceramic"]}
            value={state.potMaterial}
            onChange={(v) => setState({ ...state, potMaterial: v })}
          />
        </Field>
        <Field label="Light level">
          <ChipSelect
            options={["Low", "Medium", "Bright"]}
            value={state.light}
            onChange={(v) => setState({ ...state, light: v })}
          />
        </Field>
      </div>

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
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="btn-secondary"
              onClick={useCurrentLocation}
              title="We’ll tailor watering to local weather."
            >
              Use current location
            </button>
            {locationTag && (
              <span className="rounded-full border bg-white px-2 py-1 text-xs shadow-sm">
                {locationTag}
              </span>
            )}
          </div>
          {geoError && <p className="text-xs text-red-600">{geoError}</p>}
          <div className="flex gap-2">
            <input
              className="input flex-1"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
                onLocationEdit?.();
              }}
              placeholder="ZIP or address"
            />
            <button
              type="button"
              className="btn-secondary"
              onClick={lookupAddress}
            >
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
                    onLocationEdit?.();
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
                    onLocationEdit?.();
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
        {state.lat && state.lon ? (
          <span className="text-xs text-neutral-600">
            Using your current location for weather-aware care tips
          </span>
        ) : (
          <span className="text-xs text-neutral-600">
            Location not available. You can enter manually.
          </span>
        )}
        <p className="hint">
          Used to tailor intervals based on local conditions. Without a location we'll use standard intervals.
        </p>
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
  onPlanModeChange?: (mode: PlanSource) => void;
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
  const [showCard, setShowCard] = useState(true);

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

  const aiWaterEvery = prevManual && state.waterEvery !== prevManual.waterEvery;
  const aiWaterAmount = prevManual && state.waterAmount !== prevManual.waterAmount;
  const aiFertEvery = prevManual && state.fertEvery !== prevManual.fertEvery;
  const aiFertFormula = prevManual && state.fertFormula !== prevManual.fertFormula;

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
    onSuggestChange?.(initialSuggest);
  }, [initialSuggest, setState, onSuggestChange]);

  useEffect(() => {
    if (!showSuggest) return;
    if (!state.species || !state.pot || !state.potHeight) return;

    const handle = setTimeout(async () => {
      setSuggestError(null);
      setLoadingSuggest(true);
      try {
        const body: any = {
          name: state.name,
          species: state.species,
          potSize: state.pot,
          potHeight: state.potHeight,
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
        onSuggestChange?.(json);
      } catch (e: any) {
        setSuggestError("Couldn't reach the server. Your info is safe—try again.");
      } finally {
        setLoadingSuggest(false);
      }
    }, 400);

    return () => clearTimeout(handle);
  }, [
    state.species,
    state.pot,
    state.potHeight,
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

  function applySuggest() {
    onPlanModeChange?.({
      type: 'ai',
      aiModel: suggest?.model,
      aiVersion: suggest?.version,
    });
    onSuggestChange?.(suggest);
    setSuggest(null);
    setPrevManual(null);
    setShowCard(false);
  }

  function customizePlan() {
    if (prevManual) {
      setState((s) => ({ ...s, ...prevManual }));
    }
    setSuggest(null);
    setPrevManual(null);
    onPlanModeChange?.({ type: 'manual' });
    onSuggestChange?.(null);
    setShowCard(true);
  }

  return (
    <div className="p-0 space-y-6">
      {showSuggest && showCard && (
        <section className="bg-neutral-50 rounded-2xl border p-4">
          <h2 className="text-xl font-medium mb-2">Smart Care Plan</h2>
          {loadingSuggest && (
            <p className="text-sm text-neutral-600">
              We’re generating personalized care tips based on your plant’s needs and local weather...
            </p>
          )}
          {suggestError && (
            <div className="text-xs text-red-600 mb-2">{suggestError}</div>
          )}
          {!suggest && !loadingSuggest && !suggestError && (
            <p className="text-sm text-neutral-600">
              We’re generating personalized care tips based on your plant’s needs and local weather...
            </p>
          )}
          {suggest && !loadingSuggest && (
            <>
              <p className="text-sm text-neutral-600 mb-2">Based on weather and environment:</p>
              <ul className="text-sm list-disc pl-5 mb-3">
                <li>
                  Water every <strong>{suggest.waterEvery} days</strong>, {suggest.waterAmount}ml
                </li>
                <li>
                  Fertilize every <strong>{suggest.fertEvery} days</strong>
                  {suggest.fertFormula && ` with ${suggest.fertFormula}`}
                </li>
              </ul>
              <div className="flex gap-2 mb-2">
                <button className="btn" onClick={applySuggest}>Apply Suggestions</button>
                <button className="btn-secondary" onClick={customizePlan}>Reset to defaults</button>
              </div>
              <details className="text-xs text-neutral-600 mt-2">
                <summary className="cursor-pointer">Why this plan?</summary>
                <p className="mt-1">
                  Based on ET₀ data, species, light, and pot size.
                </p>
              </details>
            </>
          )}
        </section>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Water every (days)">
          <div className="flex items-center gap-2">
            <Stepper
              value={state.waterEvery}
              onChange={(v) => {
                setState({ ...state, waterEvery: v });
                markTouched('waterEvery');
                validate('waterEvery', v);
              }}
              min={1}
            />
            {aiWaterEvery && (
              <span className="text-[10px] px-1 rounded bg-brand text-white">✨ AI</span>
            )}
          </div>
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
          <div className="flex items-center gap-2">
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
            {aiWaterAmount && (
              <span className="text-[10px] px-1 rounded bg-brand text-white">✨ AI</span>
            )}
          </div>
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
          <div className="flex items-center gap-2">
            <Stepper
              value={state.fertEvery}
              onChange={(v) => {
                setState({ ...state, fertEvery: v });
                markTouched('fertEvery');
                validate('fertEvery', v);
              }}
              min={1}
            />
            {aiFertEvery && (
              <span className="text-[10px] px-1 rounded bg-brand text-white">✨ AI</span>
            )}
          </div>
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
            <div className="flex items-center gap-2">
              <input
                className="input"
                value={state.fertFormula}
                onChange={(e) => setState({ ...state, fertFormula: e.target.value })}
                placeholder="e.g., 10-10-10 @ 1/2 strength"
              />
              {aiFertFormula && (
                <span className="text-[10px] px-1 rounded bg-brand text-white">✨ AI</span>
              )}
            </div>
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
}: {
  initial: PlantFormValues;
  submitLabel: string;
  onSubmit: (data: PlantFormSubmit, source?: 'ai' | 'manual') => Promise<void>;
  onCancel: () => void;
  initialSuggest?: AiCareSuggestion | null;
}) {
  const [state, setState] = useState<PlantFormValues>(initial);
  const [errors, setErrors] = useState<Validation['errors']>({});
  const [touched, setTouched] = useState<Validation['touched']>({});
  const fieldSchemas: Record<FieldName, z.ZodTypeAny> = {
    ...plantFieldSchemas,
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
  const [planSource, setPlanSource] = useState<PlanSource>({ type: 'manual' });
  const [aiMeta, setAiMeta] = useState<AiCareSuggestion | null>(initialSuggest ?? null);

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
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">About the Plant</h2>
        <BasicsFields
          state={state}
          setState={setState}
          validation={validation}
        />
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Pot & Environment</h2>
        <EnvironmentFields state={state} setState={setState} validation={validation} />
      </section>
      <section className="mb-6">
        <h2 className="text-xl font-medium mb-2">Care Plan</h2>
        <CarePlanFields
          state={state}
          setState={setState}
          initialSuggest={initialSuggest}
          showSuggest={hasSpecies}
          onPlanModeChange={setPlanSource}
          validation={validation}
          onSuggestChange={setAiMeta}
        />
        {planSource.type === 'ai' && aiMeta && (
          <p className="mt-4 text-center text-xs text-neutral-500">
            AI-generated care plan • {aiMeta.model} • {aiMeta.weatherSource || 'Open-Meteo'} •{' '}
            {aiMeta.fetchedAt ? new Date(aiMeta.fetchedAt).toLocaleDateString() : ''}
          </p>
        )}
      </section>
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
              onClick={() =>
                handleSubmit(planSource.type === 'ai' ? 'ai' : 'manual')
              }
              disabled={saving}
            >
              Retry
            </button>
          </>
        ) : (
          <button
            className="btn"
            onClick={() =>
              handleSubmit(planSource.type === 'ai' ? 'ai' : 'manual')
            }
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
      .input { @apply w-full rounded-xl border border-border bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2; }
      .btn { @apply inline-flex items-center justify-center gap-2 rounded-xl px-4 h-11 bg-primary text-primary-foreground shadow-card transition active:translate-y-px focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50; }
      .btn-secondary { @apply inline-flex items-center justify-center gap-2 rounded-xl border border-border px-4 h-11 bg-white text-foreground shadow-card transition active:translate-y-px focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50; }
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

