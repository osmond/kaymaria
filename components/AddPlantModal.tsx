'use client';

import React, { useEffect, useState, useRef, useId } from 'react';
import { Dialog } from '@headlessui/react';
import { X, ArrowLeft, ArrowRight, Check } from 'lucide-react';
import {
  BasicsFields,
  EnvironmentFields,
  CarePlanFields,
  FormStyles,
  PlantFormSubmit,
  PlantFormValues,
  plantValuesToSubmit,
} from './PlantForm';
import { plantFormSchema, plantFieldSchemas } from '@/lib/plantFormSchema';
import type { AiCareSuggestion } from '@/lib/aiCare';

type PlanSource =
  | { type: 'preset'; presetId?: string }
  | { type: 'ai'; aiModel?: string; aiVersion?: string }
  | { type: 'manual' };

async function fetchWithRetry(
  url: string,
  options: RequestInit,
  retries = 2,
): Promise<Response> {
  let attempt = 0;
  let delay = 500;
  while (true) {
    try {
      const res = await fetch(url, options);
      if (res.ok || attempt >= retries) return res;
    } catch (e) {
      if (attempt >= retries) throw e;
    }
    await new Promise((r) => setTimeout(r, delay));
    attempt++;
    delay *= 2;
  }
}

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
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [planSource, setPlanSource] = useState<PlanSource | null>(null);
  const [defaults, setDefaults] = useState<{
    pot: string;
    potMaterial: string;
    light: string;
  } | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const canSubmit = values ? plantFormSchema.safeParse(values).success : false;
  const basicsValid = values
    ? plantFieldSchemas.name.safeParse(values.name).success &&
      plantFieldSchemas.roomId.safeParse(values.roomId).success
    : false;

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

  function close() {
    onOpenChange(false);
    prevFocus.current?.focus();
  }

  useEffect(() => {
    if (!open) return;
    prevFocus.current = document.activeElement as HTMLElement | null;
    async function loadDefaults() {
      setLoading(true);
      setNotice(null);
      setStep(0);
      let stored: any = {};
      try {
        stored = JSON.parse(localStorage.getItem('plantDefaults') || '{}');
      } catch {}
      const base: PlantFormValues = {
        name: prefillName || '',
        roomId: defaultRoomId,
        species: prefillName || '',
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
      setDefaults({
        pot: base.pot,
        potMaterial: base.potMaterial,
        light: base.light,
      });
      try {
        const r = await fetchWithRetry(
          `/api/species-care?species=${encodeURIComponent(prefillName || '')}`,
          {},
          2,
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (json.presets) {
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
            const ai = await fetch('/api/ai-care', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify(aiBody),
            });
            if (ai.ok) {
              const sug: AiCareSuggestion = await ai.json();
              setInitialSuggest(sug);
              setPlanSource({
                type: 'ai',
                aiModel: sug.model,
                aiVersion: sug.version,
              });
              setNotice(null);
            } else {
              setNotice('No suggestions available.');
              setPlanSource({ type: 'manual' });
            }
          } catch (e) {
            setNotice('No suggestions available.');
            setPlanSource({ type: 'manual' });
          }
        }
      } catch (e) {
        console.error('Failed to load species defaults', e);
        setNotice("Couldn't fetch a plan—using a safe starting point.");
        setInitial(base);
        setValues(base);
        setPlanSource({ type: 'manual' });
      } finally {
        setLoading(false);
      }
    }
    loadDefaults();
  }, [open, prefillName, defaultRoomId]);

  async function handleSubmit(
    data: PlantFormSubmit,
    source: 'ai' | 'manual' = 'manual',
  ) {
    console.log('Creating plant via', source, 'plan source', planSource);
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
    const r = await fetchWithRetry(
      '/api/plants',
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      },
      2,
    );
    if (!r.ok) {
      // Throw the full response so callers can inspect status and body
      throw r;
    }
    const created = await r.json();
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
    setSaving(true);
    close();
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
    } catch (e: any) {
      let message = 'Failed to save plant.';
      let status: number | undefined;
      let data: any = null;
      try {
        status = e?.status ?? e?.response?.status;
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
      const context: Record<string, unknown> = { error: e };
      if (status !== undefined) context.status = status;
      if (data !== null) context.data = data;
      console.error('Error saving plant', context);
      setToast(message);
      return;
    } finally {
      setSaving(false);
    }
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 2));
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
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
          <Dialog.Panel className="relative w-full h-full sm:h-auto sm:max-w-lg bg-background rounded-2xl shadow-md p-6 overflow-y-auto sm:max-h-[90vh]">
            <div className="mb-6">
              <Dialog.Title
                id={titleId}
                className="text-lg font-display font-semibold"
              >
                Add Plant
              </Dialog.Title>
            </div>
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
                  <div className="py-6 text-sm text-gray-600">{notice}</div>
                )}
                {step === 0 && (
                  <BasicsFields
                    state={values}
                    setState={setValues}
                    defaults={defaults || undefined}
                    nameInputRef={firstFieldRef}
                    onSaveDefault={saveDefault}
                  />
                )}
                {step === 1 && <EnvironmentFields state={values} setState={setValues} />}
                {step === 2 && (
                  <CarePlanFields
                    state={values}
                    setState={setValues}
                    initialSuggest={initialSuggest}
                    onPlanModeChange={setPlanSource}
                  />
                )}
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
                <div className="pt-6 mt-6 flex gap-2 justify-end items-center">
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
                  {step < 2 && (
                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-3 min-h-11 min-w-11 shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                      onClick={nextStep}
                      disabled={step === 0 && !basicsValid}
                    >
                      <ArrowRight className="h-4 w-4" />
                      Next
                    </button>
                  )}
                  {step === 2 && (
                    <button
                      className="inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground px-4 py-3 min-h-11 min-w-11 shadow-sm hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/50 focus:ring-offset-2 disabled:opacity-70 transition-colors"
                      onClick={() =>
                        submitCurrent(planSource?.type === 'ai' ? 'ai' : 'manual')
                      }
                      disabled={saving || !canSubmit}
                    >
                      <Check className="h-4 w-4" />
                      {saving
                        ? 'Saving…'
                        : planSource && planSource.type !== 'manual'
                        ? 'Create with Suggested Plan'
                        : 'Create Plant (Manual)'}
                    </button>
                  )}
                </div>
                <FormStyles />
              </>
            )}
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
