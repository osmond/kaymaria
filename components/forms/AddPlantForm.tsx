'use client';

import { useForm, type UseFormRegister } from 'react-hook-form';
import { useState } from 'react';

export type AddPlantFormData = {
  name: string;
  roomId: string;
  light: string;
  waterInterval: string;
};

function BasicsStep({ register }: { register: UseFormRegister<AddPlantFormData> }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Name</span>
        <input type="text" {...register('name')} className="border rounded p-2" />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">Room</span>
        <select {...register('roomId')} className="border rounded p-2">
          <option value="">Select a room</option>
          <option value="living">Living Room</option>
          <option value="bedroom">Bedroom</option>
        </select>
      </label>
    </div>
  );
}

function EnvironmentStep({ register }: { register: UseFormRegister<AddPlantFormData> }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Light</span>
        <select {...register('light')} className="border rounded p-2">
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>
      </label>
    </div>
  );
}

function CareStep({ register }: { register: UseFormRegister<AddPlantFormData> }) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Water every (days)</span>
        <input
          type="number"
          {...register('waterInterval')}
          className="border rounded p-2"
          min={1}
        />
      </label>
    </div>
  );
}

export default function AddPlantForm({
  onSubmit,
}: {
  onSubmit: (data: AddPlantFormData) => void | Promise<void>;
}) {
  const { register, handleSubmit } = useForm<AddPlantFormData>({
    defaultValues: { name: '', roomId: '', light: 'medium', waterInterval: '7' },
  });
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Basics', component: <BasicsStep register={register} /> },
    { title: 'Environment', component: <EnvironmentStep register={register} /> },
    { title: 'Care', component: <CareStep register={register} /> },
  ];

  const next = () => setStep((s) => Math.min(s + 1, steps.length - 1));
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="plant-form"
      className="flex flex-col gap-6"
    >
      <h2 className="text-xl font-medium">{steps[step].title}</h2>
      {steps[step].component}
      <div className="flex gap-2">
        {step > 0 && (
          <button type="button" onClick={back} className="btn">
            Back
          </button>
        )}
        {step < steps.length - 1 && (
          <button type="button" onClick={next} className="btn btn-primary">
            Next
          </button>
        )}
        {step === steps.length - 1 && (
          <button type="submit" className="btn btn-primary self-start">
            Add Plant
          </button>
        )}
      </div>
    </form>
  );
}

