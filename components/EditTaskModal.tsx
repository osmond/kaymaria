'use client';
import { useState, useEffect } from 'react';

export default function EditTaskModal({
  open,
  task,
  onClose,
  onSave,
}:{
  open: boolean;
  task: { plant: string; action: 'Water'|'Fertilize'|'Repot'; dueAt: string } | null;
  onClose: () => void;
  onSave: (t:{ action:'Water'|'Fertilize'|'Repot'; due: string }) => void;
}){
  const [action, setAction] = useState<'Water'|'Fertilize'|'Repot'>('Water');
  const [due, setDue] = useState('Today');

  useEffect(() => {
    if (task) {
      setAction(task.action);
      setDue(labelFromISO(task.dueAt));
    }
  }, [task]);

  if (!open || !task) return null;

  function labelFromISO(iso: string){
    const today = new Date();
    const due = new Date(iso);
    const t0 = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    const d0 = new Date(due.getFullYear(), due.getMonth(), due.getDate());
    const diff = Math.round((d0.getTime() - t0.getTime())/86400000);
    if (diff <= 0) return 'Today';
    if (diff === 1) return 'Tomorrow';
    return `In ${diff}d`;
  }

  return (
    <div
      className='fixed inset-0 bg-black/30 grid place-items-center p-4'
      onClick={(e)=>{ if(e.target===e.currentTarget) onClose(); }}
    >
      <div className='w-full max-w-md rounded-2xl bg-white p-4 shadow-xl'>
        <div className='mb-2'>
          <div className='text-lg font-semibold'>Edit Task</div>
          <div className='text-sm text-neutral-600'>Update task details.</div>
        </div>
        <div className='grid gap-3'>
          <div className='grid gap-1'>
            <label className='text-sm'>Plant</label>
            <div className='px-3 py-2 rounded bg-neutral-100 text-sm'>{task.plant}</div>
          </div>
          <div className='grid gap-1'>
            <label className='text-sm'>Action</label>
            <select className='border rounded px-3 py-2' value={action} onChange={e=>setAction(e.target.value as any)}>
              <option>Water</option>
              <option>Fertilize</option>
              <option>Repot</option>
            </select>
          </div>
          <div className='grid gap-1'>
            <label className='text-sm'>Due</label>
            <select className='border rounded px-3 py-2' value={due} onChange={e=>setDue(e.target.value)}>
              <option>Today</option>
              <option>Tomorrow</option>
              <option>In 2d</option>
            </select>
          </div>
        </div>
        <div className='mt-3 flex gap-2 justify-end'>
          <button className='border rounded px-3 py-2' onClick={onClose}>Cancel</button>
          <button
            className='bg-neutral-900 text-white rounded px-3 py-2'
            onClick={()=>{ onSave({action, due}); onClose(); }}
          >Save Changes</button>
        </div>
      </div>
    </div>
  );
}
