'use client';

import React, { useEffect, useState, useRef, useId } from 'react';
import {
  Dialog,
  DialogBackdrop,
  // (optional) DialogPanel, DialogTitle
} from '@headlessui/react';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import {
  BasicsFields,
  EnvironmentFields,
  CarePlanFields,
  FormStyles,
  PlantFormSubmit,
  PlantFormValues,
  plantValuesToSubmit,
  PlanSource,
} from './PlantForm';
import PlanSummary from './PlanSummary';
import { plantFormSchema, plantFieldSchemas } from '@/lib/plantFormSchema';
import type { AiCareSuggestion } from '@/lib/aiCare';
import { fetchJson, FetchJsonError } from '@/lib/fetchJson';
import useCareTips from './useCareTips';

export function todayLocalYYYYMMDD(): string {
  const d = new Date();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${d.getFullYear()}-${month}-${day}`;
}

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
  onCreate: (plant: { id: string; name: string }) => void;
}) {
  const titleId = useId();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const prevFocus = useRef<HTMLElement | null>(null);
  const requestIdRef = useRef<string | null>(null);
  const [initial, setInitial] = useState<PlantFormValues | null>(null);
  const [values, setValues] = useState<PlantFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [notice, setNotice] = useState<string | null>(null);
  const [initialSuggest, setInitialSuggest] = useState<AiCareSuggestion | null>(
    null,
  );
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState<0 | 1 | 2 | 3>(0);
  const [planSource, setPlanSource] = useState<PlanSource | null>(null);
  const [defaults, setDefaults] = useState<{
    pot: string;
    potMaterial: string;
    light: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [locationTag, setLocationTag] = useState<string | null>(null);
  const validationId = useId();
  const saveErrorId = useId();
  const canSubmit = values ? plantFormSchema.safeParse(values).success : false;
  const basicsValid = values
    ? plantFieldSchemas.name.safeParse(values.name).success &&
      plantFieldSchemas.roomId.safeParse(values.roomId).success
    : false;

  const careTips = useCareTips(values);

  const validationMessage =
    step === 0 && !basicsValid
      ? 'Name and room are required to continue.'
      : step === 2 && !canSubmit
      ? 'Please fill out all required fields to continue.'
      : step === 3 && !canSubmit
      ? 'Please fill out all required fields before submitting.'
      : null;
  const submitDescribedBy = [
    validationMessage ? validationId : null,
    saveError ? saveErrorId : null,
  ]
    .filter((v): v is string => Boolean(v))
    .join(' ') || undefined;

  function saveDefault(
    field: 'pot' | 'potMaterial' | 'light',
    value: string,
  ) {
    setDefaults((d) => ({ ...(d || {}), [field]: value }));
    try {
      const stored = JSON.parse(localStorage.getItem('plantDefaults') || '{}');
      localStorage.setItem(
        'plantDefaults',
        JSON.stringify({ ...stored, [field]: value }),
      );
    } catch {}
    setToast('Defaults saved.');
  }

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  useEffect(() => {
    setSaveError(null);
  }, [step]);

  function close() {
    onOpenChange(false);
    prevFocus.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    const controller = new AbortController();
    async function loadDefaults() {
      setLoading(true);
      setNotice(null);
      setStep(0);
      setPlanSource({ type: 'manual' });
      setLocationTag(null);
      let stored: any = {};
      try {
        stored = JSON.parse(localStorage.getItem('plantDefaults') || '{}');
      } catch {}
      const species = prefillName?.trim() || '';
      const base: PlantFormValues = {
        name: prefillName || '',
        roomId: defaultRoomId,
        species,
        pot: stored.pot || '6 in',
        potMaterial: stored.potMaterial || 'Plastic',
        light: stored.light || 'Medium',
        indoor: 'Indoor',
        drainage: 'ok',
        soil: stored.soil || 'Well-draining mix',
        humidity: stored.humidity || '50',
        lat: '',
        lon: '',
        waterEvery: '7',
        waterAmount: '500',
        fertEvery: '30',
        fertFormula: stored.fertFormula || '10-10-10 @ 1/2 strength',
        lastWatered: todayLocalYYYYMMDD(),
        lastFertilized: todayLocalYYYYMMDD(),
      };
      if ('geolocation' in navigator) {
        try {
          const pos = await new Promise<GeolocationPosition>((resolve, reject) =>
            navigator.geolocation.getCurrentPosition(resolve, reject)
          );
          base.lat = pos.coords.latitude.toFixed(6);
          base.lon = pos.coords.longitude.toFixed(6);
          setLocationTag('Current location');
        } catch {}
      }
      setDefaults({
        pot: base.pot,
        potMaterial: base.potMaterial,
        light: base.light,
      });
      try {
        let json: {
          presets?: Partial<PlantFormValues>;
          presetId?: string;
          updated?: string;
        } | null = null;
        if (species) {
          json = await fetchJson<{
            presets?: Partial<PlantFormValues>;
            presetId?: string;
            updated?: string;
          }>(
            `/api/species-care?species=${encodeURIComponent(species)}`,
            { retries: 2, signal: controller.signal },
          );
        }
        if (json?.presets) {
          const init = { ...base, ...json.presets };
          setInitial(init);
          setValues(init);
          setPlanSource({ type: 'preset', presetId: json.presetId });
          if (json.updated) {
            setNotice(
              `Found care preset • last updated ${new Date(json.updated).toLocaleDateString()}`,
            );
          } else {
            setNotice('Found care preset');
          }
        } else {
          setInitial(base);
          setValues(base);
          if (base.species && base.pot) {
            try {
              const aiBody: any = {
                name: base.name,
                species: base.species,
                potSize: base.pot,
                potMaterial: base.potMaterial,
                light: base.light,
                indoor: base.indoor === 'Indoor',
                drainage: base.drainage,
                soil: base.soil,
                humidity: Number(base.humidity),
              };
              if (base.lat && base.lon) {
                aiBody.lat = Number(base.lat);
                aiBody.lon = Number(base.lon);
              }
              const sug = await fetchJson<AiCareSuggestion>(
                '/api/ai-care',
                {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(aiBody),
                  signal: controller.signal,
                },
              );
              setInitialSuggest(sug);
              setNotice(null);
            } catch (e) {
              setNotice('No suggestions available.');
            }
          }
        }
      } catch (e) {
        console.error('Failed to load species defaults', e);
        setNotice("Couldn't fetch a plan—using a safe starting point.");
        setInitial(base);
        setValues(base);
      } finally {
        setLoading(false);
      }
    }
    loadDefaults();
    return () => controller.abort();
  }, [open, prefillName, defaultRoomId]);

  async function handleSubmit(
    data: PlantFormSubmit,
    source: 'ai' | 'manual' = 'manual',
  ) {
    if (process.env.NODE_ENV !== 'production') {
      console.log('Creating plant via', source, 'plan source', planSource);
    }
    const payload: any = { ...data };
    if (!requestIdRef.current) {
      requestIdRef.current = crypto.randomUUID();
    }
    payload.clientRequestId = requestIdRef.current;
    if (planSource) {
      payload.carePlanSource = planSource.type;
      if (planSource.type === 'preset') {
        payload.presetId = planSource.presetId;
      } else if (planSource.type === 'ai') {
        payload.aiModel = planSource.aiModel;
        payload.aiVersion = planSource.aiVersion;
      }
    }
    const created = await fetchJson<
      any,
      { error?: string; message?: string; detail?: string }
    >('/api/plants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      retries: 2,
    });
    requestIdRef.current = null;
    return created;
  }

  async function submitCurrent(
    source: 'ai' | 'manual' = 'manual',
    override?: PlantFormValues,
  ) {
    if (!values) return;
    const current = override ?? values;
    if (!current.name.trim()) return;
    if (!canSubmit) return;
    setSaving(true);
    setSaveError(null);
    try {
      const created = await handleSubmit(
        plantValuesToSubmit(current),
        source,
      );
      try {
        localStorage.setItem(
          'plantDefaults',
          JSON.stringify({
            pot: current.pot,
            potMaterial: current.potMaterial,
            light: current.light,
            soil: current.soil,
            humidity: current.humidity,
            fertFormula: current.fertFormula,
          }),
        );
      } catch {}
      onCreate({ id: created.id, name: created.name || current.name });
      close();
    } catch (e: unknown) {
      const err = e as FetchJsonError<{
        error?: string;
        message?: string;
        detail?: string;
      }>;
      let message = 'Failed to save plant.';
      const status: number | undefined = err?.status;
      const data = err?.data;
      if (status === 401) {
        message = 'Please log in before adding a plant.';
      } else if (data?.error) {
        message = data.error;
      } else if (data?.message) {
        message = data.message;
      } else if (data?.detail) {
        message = data.detail;
      } else if (typeof err?.message === 'string') {
        message = err.message;
      }
      console.error('Error saving plant', err, { status, data });
      setSaveError(message);
    } finally {
      setSaving(false);
    }
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 3));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  if (!open) return null;

  return (
    <>
      <Dialog
        open={open}
        onClose={close}
        className="relative z-50"
        initialFocus={firstFieldRef}
        aria-labelledby={titleId}
      >
        <DialogBackdrop className="fixed inset-0 z-40 bg-black/30" />
        <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Dialog.Panel className="relative z-50 w-full h-full sm:h-auto sm:max-w-lg bg-background rounded-2xl shadow-card sm:max-h-[90vh] flex flex-col">
            <header className="sticky top-0 bg-background border-b p-6">
              <Dialog.Title
                id={titleId}
                className="text-lg font-display font-semibold"
              >
                Add Plant
              </Dialog.Title>
              <div className="mt-4 flex gap-2">
                {[0, 1, 2, 3].map((n) => (
                  <div
                    key={n}
                    className={`h-1 flex-1 rounded ${step >= n ? 'bg-primary' : 'bg-neutral-200'}`}
                  />
                ))}
              </div>
            </header>
            <div className="flex-1 overflow-y-auto p-6">
              {loading && (
                <div className="py-6 space-y-4 animate-pulse">
                  <div className="h-6 bg-neutral-200 rounded" />
                  <div className="h-6 bg-neutral-200 rounded" />
                  <div className="h-6 bg-neutral-200 rounded" />
                </div>
              )}
              {!loading && values && (
                <>
                  {notice && (
                    <div
                      role="status"
                      aria-live="polite"
                      className="py-6 text-sm text-gray-600"
                    >
                      {notice}
                    </div>
                  )}
                  {step === 0 && (
                    <BasicsFields
                      state={values}
                      setState={setValues}
                      defaults={defaults || undefined}
                      nameInputRef={firstFieldRef}
                      onSaveDefault={saveDefault}
                      careTips={careTips}
                    />
                  )}
                  {step === 1 && (
                    <EnvironmentFields
                      state={values}
                      setState={setValues}
                      locationTag={locationTag}
                      onLocationEdit={() => setLocationTag(null)}
                      onUseCurrentLocation={() => setLocationTag('Current location')}
                    />
                  )}
                  {step === 2 && (
                    <CarePlanFields
                      state={values}
                      setState={setValues}
                      initialSuggest={initialSuggest}
                      onPlanModeChange={(v) => setPlanSource(v)}
                    />
                  )}
                  {step === 3 && <PlanSummary values={values} />}
                  <div className="mt-6 flex flex-wrap gap-2 text-xs">
                    <span className="rounded-full border bg-white px-3 py-1 shadow-sm">
                      {`Water every ${values.waterEvery}d · ${values.waterAmount} ml • Fertilize every ${values.fertEvery}d`}
                    </span>
                    {planSource && planSource.type !== 'manual' && (
                      <span className="rounded-full border bg-white px-3 py-1 shadow-sm">
                        {planSource.type === 'ai' ? 'AI plan' : 'Preset plan'}
                      </span>
                    )}
                  </div>
                </>
              )}
            </div>
            {!loading && values && (
              <footer className="sticky bottom-0 border-t bg-background p-6 flex gap-2 justify-end items-center">
                {validationMessage && (
                  <div
                    id={validationId}
                    role="status"
                    aria-live="polite"
                    className="mr-auto text-sm text-red-600"
                  >
                    {validationMessage}
                  </div>
                )}
                {step === 3 && saveError && (
                  <div
                    id={saveErrorId}
                    role="status"
                    aria-live="polite"
                    className="mr-auto text-sm text-red-600"
                  >
                    {saveError}
                  </div>
                )}
                <button
                  className="inline-flex items-center gap-2 rounded-lg bg-secondary text-secondary-foreground px-4 py-3 min-h-11 min-w-11 shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                  onClick={close}
                >
                  <X className="h-4 w-4" />
                  Cancel
                </button>
                {step > 0 && (
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-secondary text-secondary-foreground px-4 py-3 min-h-11 min-w-11 shadow-sm hover:bg-secondary/80 focus:outline-none focus:ring-2 focus:ring-secondary/50 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                    onClick={prevStep}
                  >
                    <ArrowLeft className="h-4 w-4" />
                    Back
                  </button>
                )}
                {step < 3 && (
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-3 min-h-11 min-w-11 shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                    onClick={nextStep}
                    disabled={(step === 0 && !basicsValid) || (step === 2 && !canSubmit)}
                    aria-describedby={validationMessage ? validationId : undefined}
                  >
                    <ArrowRight className="h-4 w-4" />
                    Next
                  </button>
                )}
                {step === 3 && (
                  <button
                    className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-3 min-h-11 min-w-11 shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                    onClick={() =>
                      submitCurrent(planSource?.type === 'ai' ? 'ai' : 'manual')
                    }
                    disabled={saving || !canSubmit}
                    aria-describedby={submitDescribedBy}
                  >
                    <Check className="h-4 w-4" />
                    {saving ? 'Saving…' : 'Confirm Plan'}
                  </button>
                )}
              </footer>
            )}
            {!loading && values && <FormStyles />}
          </Dialog.Panel>
        </div>
      </Dialog>
      {toast && (
        <div className="fixed bottom-20 left-1/2 -translate-x-1/2 bg-neutral-900 text-white text-sm px-4 py-2 rounded-full shadow-lg">
          {toast}
        </div>
      )}
    </>
  );
}
