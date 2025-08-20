'use client';

import { useForm } from 'react-hook-form';

export type AddPlantFormData = {
  name: string;
  roomId: string;
};

export default function AddPlantForm({
  onSubmit,
}: {
  onSubmit: (data: AddPlantFormData) => void | Promise<void>;
}) {
  const { register, handleSubmit } = useForm<AddPlantFormData>({
    defaultValues: { name: '', roomId: '' },
  });

  return (
    <form onSubmit={handleSubmit(onSubmit)} aria-label="plant-form" className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="font-medium">Name</span>
        <input
          type="text"
          {...register('name')}
          className="border rounded p-2"
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="font-medium">Room</span>
        <select {...register('roomId')} className="border rounded p-2">
          <option value="">Select a room</option>
          <option value="living">Living Room</option>
          <option value="bedroom">Bedroom</option>
        </select>
      </label>
      <button type="submit" className="btn btn-primary self-start">
        Add Plant
      </button>
    </form>
  );
}

