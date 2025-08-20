'use client';

import { useForm, type UseFormRegister } from 'react-hook-form';
import { useState, useEffect } from 'react';
import { getRooms, type Room } from '@/lib/rooms';

export type AddPlantFormData = {
  name: string;
  roomId: string;
  light: string;
  waterInterval: number;
};

function BasicsStep({
  register,
  rooms,
}: {
  register: UseFormRegister<AddPlantFormData>;
  rooms: Room[];
}) {
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
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              {r.name}
            </option>
          ))}
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
          {...register('waterInterval', { valueAsNumber: true })}
          className="border rounded p-2"
          min={1}
        />
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
  const { register, handleSubmit, setValue } = useForm<AddPlantFormData>({
    defaultValues:
      initialValues ?? {
        name: '',
        roomId: '',
        light: 'medium',
        waterInterval: 7,
      },
  });
  const [step, setStep] = useState(0);
  const [rooms, setRooms] = useState<Room[]>([]);

  useEffect(() => {
    getRooms()
      .then(setRooms)
      .catch((e) => console.error('Failed to load rooms', e));
  }, []);

  useEffect(() => {
    if (rooms.length && initialValues?.roomId) {
      setValue('roomId', initialValues.roomId);
    }
  }, [rooms, initialValues?.roomId, setValue]);

  const steps = [
    { title: 'Basics', component: <BasicsStep register={register} rooms={rooms} /> },
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
            {submitLabel ?? 'Add Plant'}
          </button>
        )}
      </div>
    </form>
  );
}

