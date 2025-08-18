'use client';

import React, { useEffect, useState } from 'react';
import { Dialog } from '@headlessui/react';
import { useRouter } from 'next/navigation';
import {
  BasicsFields,
  EnvironmentFields,
  CarePlanFields,
  FormStyles,
  PlantFormSubmit,
  PlantFormValues,
  plantValuesToSubmit,
} from './PlantForm';
import type { AiCareSuggestion } from '@/lib/aiCare';

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
  const [values, setValues] = useState<PlantFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [initialSuggest, setInitialSuggest] = useState<AiCareSuggestion | null>(
    null,
  );
  const [suggest, setSuggest] = useState<AiCareSuggestion | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [step, setStep] = useState<0 | 1 | 2>(0);
  const [planSource, setPlanSource] = useState<'preset' | 'ai' | null>(null);

  function close() {
    onOpenChange(false);
  }

  useEffect(() => {
    if (!open) return;
    async function loadDefaults() {
      setLoading(true);
      setLoadError(null);
      setNotice(null);
      setStep(0);
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
        lat: '',
        lon: '',
        waterEvery: '7',
        waterAmount: '500',
        fertEvery: '30',
        fertFormula: '10-10-10 @ 1/2 strength',
      };
      try {
        const r = await fetch(
          `/api/species-care?species=${encodeURIComponent(prefillName || '')}`,
        );
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        if (json.presets) {
          const init = { ...base, ...json.presets };
          setInitial(init);
          setValues(init);
          setPlanSource('preset');
        } else {
          setInitial(base);
          setValues(base);
          setNotice('No presets found—generating AI suggestion');
          try {
            const aiBody: any = {
              name: base.name,
              species: base.species,
              potSize: base.pot,
              potMaterial: base.potMaterial,
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
              setSuggest(sug);
              setPlanSource('ai');
            } else {
              setNotice('No presets found and AI suggestion failed');
            }
          } catch (e) {
            setNotice('No presets found and AI suggestion failed');
          }
        }
      } catch (e) {
        setLoadError('Failed to load species defaults.');
        setInitial(base);
        setValues(base);
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
    const r = await fetch('/api/plants', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...data, planSource }),
    });
    if (!r.ok) throw new Error(`HTTP ${r.status}`);
    const created = await r.json();
    onCreate(data.name);
    close();
    router.push(`/app/plants/${created.id}?tab=photos`);
  }

  async function submitCurrent(source: 'ai' | 'manual' = 'manual', override?: PlantFormValues) {
    if (!values) return;
    const current = override ?? values;
    if (!current.name.trim()) return;
    setSaving(true);
    setSaveError(null);
    try {
      await handleSubmit(plantValuesToSubmit(current), source);
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
    if (!suggest || !values) return;
    const s: PlantFormValues = {
      ...values,
      waterEvery: String(suggest.waterEvery ?? Number(values.waterEvery)),
      waterAmount: String(suggest.waterAmount ?? Number(values.waterAmount)),
      fertEvery: String(suggest.fertEvery ?? Number(values.fertEvery)),
      fertFormula: suggest.fertFormula ?? values.fertFormula,
    };
    await submitCurrent('ai', s);
  }

  function nextStep() {
    setStep((s) => Math.min(s + 1, 2));
  }

  function prevStep() {
    setStep((s) => Math.max(s - 1, 0));
  }

  if (!open) return null;

  return (
    <Dialog open={open} onClose={close} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <Dialog.Panel className="relative w-full h-full sm:h-auto sm:max-w-lg bg-white rounded-none sm:rounded-2xl shadow-xl overflow-y-auto sm:max-h-[90vh]">
          <div className="p-5 border-b">
            <Dialog.Title className="text-lg font-display font-semibold">Add Plant</Dialog.Title>
          </div>
          {loading && <div className="p-5">Loading defaults…</div>}
          {!loading && values && (
            <>
              {loadError && (
                <div className="p-5 text-sm text-red-600">{loadError}</div>
              )}
              {notice && (
                <div className="p-5 text-sm text-gray-600">{notice}</div>
              )}
              {step === 0 && <BasicsFields state={values} setState={setValues} />}
              {step === 1 && <EnvironmentFields state={values} setState={setValues} />}
              {step === 2 && (
                <CarePlanFields
                  state={values}
                  setState={setValues}
                  initialSuggest={initialSuggest}
                  onSuggestChange={(s) => {
                    setSuggest(s);
                    if (s) setPlanSource('ai');
                  }}
                />
              )}
              {saveError && step === 2 && (
                <div className="p-5 text-xs text-red-600">{saveError}</div>
              )}
              <div className="p-5 border-t flex gap-2 justify-end">
                <button className="btn-secondary" onClick={close}>
                  Cancel
                </button>
                {step > 0 && (
                  <button className="btn-secondary" onClick={prevStep}>
                    Back
                  </button>
                )}
                {step < 2 && (
                  <button className="btn" onClick={nextStep}>
                    Next
                  </button>
                )}
                {step === 2 && (
                  <>
                    {suggest && (
                      <button
                        className="btn"
                        onClick={handleSubmitAi}
                        disabled={saving || !values.name.trim()}
                      >
                        {saving ? 'Saving…' : 'Create with AI Plan'}
                      </button>
                    )}
                    <button
                      className="btn"
                      onClick={() => submitCurrent('manual')}
                      disabled={saving || !values.name.trim()}
                    >
                      {saving ? 'Saving…' : 'Create Plant'}
                    </button>
                  </>
                )}
              </div>
              <FormStyles />
            </>
          )}
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
