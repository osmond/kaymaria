'use client';
import { useState } from 'react';

export default function QuickAddModal({
  open,
  onClose,
  onSave,
  onAddPlant,
}: {
  open: boolean;
  onClose: () => void;
  onSave: (t: { plant: string; action: 'Water' | 'Fertilize' | 'Repot'; last: string; due: string }) => void;
  onAddPlant: (name: string) => void;
}) {
  const [plant, setPlant] = useState('');
  const [action, setAction] = useState<'Water' | 'Fertilize' | 'Repot'>('Water');
  const [due, setDue] = useState('Today');

  if (!open) return null;
  return (
    <div
      className='fixed inset-0 z-50 bg-black/30 grid place-items-center p-4'
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className='w-full max-w-md rounded-2xl bg-white p-4 shadow-xl'>
        <div className='mb-2'>
          <div className='text-lg font-semibold'>Quick Add Task</div>
          <div className='text-sm text-neutral-600'>Create a one-off care task fast.</div>
        </div>
        <div className='grid gap-3'>
          <div className='grid gap-1'>
            <label className='text-sm'>Plant</label>
            <input
              className='border rounded px-3 py-2'
              value={plant}
              onChange={(e) => setPlant(e.target.value)}
              placeholder='e.g., Monstera'
            />
            <div className='text-xs text-neutral-500'>
              <button className='underline' onClick={() => onAddPlant(plant || 'New Plant')}>
                Add new plant…
              </button>
            </div>
          </div>
          <div className='grid gap-1'>
            <label className='text-sm'>Action</label>
            <select
              className='border rounded px-3 py-2'
              value={action}
              onChange={(e) => setAction(e.target.value as any)}
            >
              <option>Water</option>
              <option>Fertilize</option>
              <option>Repot</option>
            </select>
          </div>
          <div className='grid gap-1'>
            <label className='text-sm'>Due</label>
            <select
              className='border rounded px-3 py-2'
              value={due}
              onChange={(e) => setDue(e.target.value)}
            >
              <option>Today</option>
              <option>Tomorrow</option>
              <option>In 2d</option>
            </select>
          </div>
        </div>
        <div className='mt-3 flex gap-2 justify-end'>
          <button className='border rounded px-3 py-2' onClick={onClose}>
            Cancel
          </button>
          <button
            className='bg-neutral-900 text-white rounded px-3 py-2'
            onClick={() => {
              if (!plant.trim()) return;
              onSave({ plant, action, last: '—', due });
              onClose();
            }}
          >
            Save Task
          </button>
        </div>
      </div>
    </div>
  );
}
