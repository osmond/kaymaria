'use client';

import {
  useForm,
  type UseFormRegister,
  type FieldErrors,
} from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { plantFieldSchemas } from '@/lib/plantFormSchema';
import { useState, useEffect } from 'react';
import { getRooms, type Room } from '@/lib/rooms';

export type AddPlantFormData = {
  name: string;
  roomId: string;
  light: string;
  waterEvery: number;
  waterAmount: number;
  fertEvery: number;
  lastWatered?: string;
  lastFertilized?: string;
  lat?: number;
  lon?: number;
};

type StepProps = {
  register: UseFormRegister<AddPlantFormData>;
  errors: FieldErrors<AddPlantFormData>;
};

type BasicsStepProps = StepProps & { rooms: Room[] };

function BasicsStep({ register, errors, rooms }: BasicsStepProps) {
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
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
        </select>
        {errors.roomId && (
          <p className="text-sm text-red-600">{errors.roomId.message}</p>
        )}
      </label>
    </div>
  );
}

function EnvironmentStep({ register, errors }: StepProps) {
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
      <label className="flex flex-col gap-1">
        <span className="font-medium">Latitude</span>
        <input
          type="number"
          step="any"
          {...register('lat')}
          className={`border rounded p-2 ${errors.lat ? 'border-red-500' : ''}`}
          min={-90}
          max={90}
        />
        {errors.lat && (
          <p className="text-sm text-red-600">{errors.lat.message}</p>
        )}
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">Longitude</span>
        <input
          type="number"
          step="any"
          {...register('lon')}
          className={`border rounded p-2 ${errors.lon ? 'border-red-500' : ''}`}
          min={-180}
          max={180}
        />
        {errors.lon && (
          <p className="text-sm text-red-600">{errors.lon.message}</p>
        )}
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
      <label className="flex flex-col gap-1">
        <span className="font-medium">Water amount (ml)</span>
        <input
          type="number"
          {...register('waterAmount', { valueAsNumber: true })}
          className={`border rounded p-2 ${errors.waterAmount ? 'border-red-500' : ''}`}
          min={10}
        />
        {errors.waterAmount && (
          <p className="text-sm text-red-600">{errors.waterAmount.message}</p>
        )}
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">Fertilize every (days)</span>
        <input
          type="number"
          {...register('fertEvery', { valueAsNumber: true })}
          className={`border rounded p-2 ${errors.fertEvery ? 'border-red-500' : ''}`}
          min={1}
        />
        {errors.fertEvery && (
          <p className="text-sm text-red-600">{errors.fertEvery.message}</p>
        )}
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">Last watered</span>
        <input type="date" {...register('lastWatered')} className="border rounded p-2" />
        {errors.lastWatered && (
          <p className="text-sm text-red-600">{errors.lastWatered.message}</p>
        )}
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">Last fertilized</span>
        <input
          type="date"
          {...register('lastFertilized')}
          className="border rounded p-2"
        />
        {errors.lastFertilized && (
          <p className="text-sm text-red-600">{errors.lastFertilized.message}</p>
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
    waterAmount: plantFieldSchemas.waterAmount,
    fertEvery: plantFieldSchemas.fertEvery,
    lastWatered: plantFieldSchemas.lastWatered.transform((d) =>
      d ? d.toISOString().slice(0, 10) : ''
    ),
    lastFertilized: plantFieldSchemas.lastFertilized.transform((d) =>
      d ? d.toISOString().slice(0, 10) : ''
    ),
    lat: plantFieldSchemas.lat,
    lon: plantFieldSchemas.lon,
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
        waterAmount: 250,
        fertEvery: 30,
        lastWatered: '',
        lastFertilized: '',
        lat: undefined,
        lon: undefined,
      },
  });
  const [step, setStep] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    getRooms().then(setRooms).catch((e) => {
      console.error('Failed to load rooms', e);
    });
  }, []);

  const steps = [
    {
      title: 'Basics',
      component: <BasicsStep register={register} errors={errors} rooms={rooms} />,
    },
    {
      title: 'Environment',
      component: <EnvironmentStep register={register} errors={errors} />,
    },
    { title: 'Care', component: <CareStep register={register} errors={errors} /> },
  ];

  const stepFields: (keyof AddPlantFormData)[][] = [
    ['name', 'roomId'],
    ['light', 'lat', 'lon'],
    ['waterEvery', 'waterAmount', 'fertEvery', 'lastWatered', 'lastFertilized'],
  ];
  const next = async () => {
    const fields = stepFields[step];
    const valid = await trigger(fields);
    if (valid) setStep((s) => Math.min(s + 1, steps.length - 1));
  };
  const back = () => setStep((s) => Math.max(s - 1, 0));

  const handleStepClick = (i: number) => {
    if (i <= step) {
      setStep(i);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      aria-label="plant-form"
      noValidate
      className="flex flex-col gap-6"
    >
      <nav aria-label="Progress" className="text-sm">
        <ol className="flex items-center gap-2">
          {steps.map((s, i) => (
            <li key={s.title} className="flex items-center">
              <button
                type="button"
                onClick={() => handleStepClick(i)}
                disabled={i > step}
                aria-current={i === step ? 'step' : undefined}
                className={
                  i === step
                    ? 'font-semibold'
                    : i > step
                    ? 'text-neutral-400 cursor-not-allowed'
                    : ''
                }
              >
                {s.title}
              </button>
              {i < steps.length - 1 && (
                <span aria-hidden="true" className="mx-2">
                  →
                </span>
              )}
            </li>
          ))}
        </ol>
      </nav>
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

