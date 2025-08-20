'use client';

import {
  useForm,
  type UseFormRegister,
  type FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { plantFieldSchemas } from '@/lib/plantFormSchema';
import { useState } from 'react';

export type AddPlantFormData = {
  name: string;
  roomId: string;
  light: string;
  waterEvery: number;
};

type StepProps = {
  register: UseFormRegister<AddPlantFormData>;
  errors: FieldErrors<AddPlantFormData>;
};

function BasicsStep({ register, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Name</span>
        <input
          type="text"
          {...register('name')}
          className={`border rounded p-2 ${errors.name ? 'border-red-500' : ''}`}
        />
        {errors.name && (
          <p className="text-sm text-red-600">{errors.name.message}</p>
        )}
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">Room</span>
        <select
          {...register('roomId')}
          className={`border rounded p-2 ${errors.roomId ? 'border-red-500' : ''}`}
        >
          <option value="">Select a room</option>
          <option value="living">Living Room</option>
          <option value="bedroom">Bedroom</option>
        </select>
        {errors.roomId && (
          <p className="text-sm text-red-600">{errors.roomId.message}</p>
        )}
      </label>
    </div>
  );
}

function EnvironmentStep({ register }: StepProps) {
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

function CareStep({ register, errors }: StepProps) {
  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Water every (days)</span>
        <input
          type="number"
          {...register('waterEvery', { valueAsNumber: true })}
          className={`border rounded p-2 ${errors.waterEvery ? 'border-red-500' : ''}`}
          min={1}
        />
        {errors.waterEvery && (
          <p className="text-sm text-red-600">{errors.waterEvery.message}</p>
        )}
      </label>
    </div>
  );
}

type AddPlantFormProps = {
  onSubmit: (data: AddPlantFormData) => void | Promise<void>;
  initialValues?: AddPlantFormData;
  submitLabel?: string;
};

export default function AddPlantForm({
  onSubmit,
  initialValues,
  submitLabel,
}: AddPlantFormProps) {
  const formSchema = z.object({
    name: plantFieldSchemas.name,
    roomId: plantFieldSchemas.roomId,
    waterEvery: plantFieldSchemas.waterEvery,
    light: z.string(),
  });
  const {
    register,
    handleSubmit,
    formState: { errors },
    trigger,
  } = useForm<AddPlantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues:
      initialValues ?? {
        name: '',
        roomId: '',
        light: 'medium',
        waterEvery: 7,
      },
  });
  const [step, setStep] = useState(0);

  const steps = [
    { title: 'Basics', component: <BasicsStep register={register} errors={errors} /> },
    {
      title: 'Environment',
      component: <EnvironmentStep register={register} errors={errors} />,
    },
    { title: 'Care', component: <CareStep register={register} errors={errors} /> },
  ];

  const stepFields: (keyof AddPlantFormData)[][] = [
    ['name', 'roomId'],
    ['light'],
    ['waterEvery'],
  ];
  const next = async () => {
    const fields = stepFields[step];
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="plant-form"
      noValidate
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
            {submitLabel ?? 'Add Plant'}
          </button>
        )}
      </div>
    </form>
  );
}

