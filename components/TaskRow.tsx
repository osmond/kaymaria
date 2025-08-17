'use client';

import { motion } from 'framer-motion';
import { Check, Pencil, Trash2, Clock } from 'lucide-react';
import { useState } from 'react';

export default function TaskRow({
  plant,
  action,
  last,
  due,
  onOpen,
  onComplete,
  onAddNote,
  onDelete,
  onDefer,
  showPlant = true,
}: {
  plant: string;
  action: 'Water' | 'Fertilize' | 'Repot';
  last: string;
  due: string;
  onOpen: () => void;
  onComplete: () => void;
  onAddNote: (note: string) => void;
  onDelete: () => void;
  onDefer: () => void;
  showPlant?: boolean;
}) {
  function iconFor(action: 'Water' | 'Fertilize' | 'Repot') {
    return action === 'Water' ? '💧' : action === 'Fertilize' ? '🌱' : '🪴';
  }
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-1/2 grid place-items-center bg-emerald-100 text-emerald-700">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Check className="h-4 w-4" />
            Complete
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-1/2 grid place-items-center bg-red-100 text-red-600">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Trash2 className="h-4 w-4" />
            Delete
          </div>
        </div>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -120, right: 120 }}
        dragElastic={0.2}
        onDragEnd={(_, i) => {
          if (i.offset.x > 80) onComplete();
          else if (i.offset.x < -80) onDelete();
        }}
        className="relative"
      >
        <div className="rounded-xl border bg-white shadow-sm">
          <div className="p-3 flex items-center gap-3">
            <button
              onClick={onOpen}
              className="h-10 w-10 rounded-xl bg-neutral-100 grid place-items-center"
            >
              🪴
            </button>
            <div className="flex-1" onClick={onOpen}>
              {showPlant ? (
                <div className="flex items-center justify-between">
                  <div className="font-medium">{plant}</div>
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    <span>{iconFor(action)}</span>
                    {action}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center gap-1">
                    <span>{iconFor(action)}</span>
                    {action}
                  </div>
                </div>
              )}
              <div className="text-xs text-neutral-500">
                Last: {last} • Due: {due}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="Done"
                onClick={onComplete}
                className="p-2 rounded hover:bg-neutral-100"
              >
                <Check className="h-4 w-4" />
              </button>
              <button
                aria-label="Defer"
                onClick={onDefer}
                className="p-2 rounded hover:bg-neutral-100"
              >
                <Clock className="h-4 w-4" />
              </button>
              <button
                aria-label="Add note"
                onClick={() => setNoteOpen((v) => !v)}
                className="p-2 rounded hover:bg-neutral-100"
              >
                <Pencil className="h-4 w-4" />
              </button>
              <button
                aria-label="Delete"
                onClick={onDelete}
                className="p-2 rounded hover:bg-neutral-100"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
        {noteOpen && (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              if (!note.trim()) return;
              onAddNote(note.trim());
              setNote('');
              setNoteOpen(false);
            }}
            className="flex items-center gap-2 border-t p-3"
          >
            <input
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Quick note..."
              className="flex-1 text-sm border rounded px-2 py-1"
            />
            <button
              type="submit"
              className="text-sm px-2 py-1 rounded bg-neutral-100"
            >
              Save
            </button>
          </form>
        )}
      </motion.div>
    </div>
  );
}

