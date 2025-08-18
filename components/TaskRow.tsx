'use client';

import { motion } from 'framer-motion';
import {
  Check,
  Trash2,
  Clock,
  Edit2,
  StickyNote,
  Droplet,
  FlaskConical,
  Sprout,
  Leaf,
} from 'lucide-react';
import { useState } from 'react';

export default function TaskRow({
  plant,
  imageUrl,
  action,
  last,
  due,
  status,
  onOpen,
  onComplete,
  onAddNote,
  onDelete,
  onDefer,
  onEdit,
  showPlant = true,
}: {
  plant: string;
  imageUrl?: string;
  action: 'Water' | 'Fertilize' | 'Repot';
  last: string;
  due: string;
  status?: 'overdue' | 'today';
  onOpen: () => void;
  onComplete: () => void;
  onAddNote: (note: string) => void;
  onDelete: () => void;
  onDefer: () => void;
  onEdit: () => void;
  showPlant?: boolean;
}) {
  function iconFor(action: 'Water' | 'Fertilize' | 'Repot') {
    const className = "h-3 w-3";
    return action === 'Water'
      ? <Droplet className={className} />
      : action === 'Fertilize'
      ? <FlaskConical className={className} />
      : <Sprout className={className} />;
  }
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState('');

  const statusStyles =
    status === 'overdue'
      ? 'border-red-300 bg-red-50'
      : status === 'today'
      ? 'border-emerald-300 bg-emerald-50'
      : 'border-neutral-200 bg-white';
  const dueStyles =
    status === 'overdue'
      ? 'text-red-600'
      : status === 'today'
      ? 'text-emerald-600'
      : 'text-neutral-500';

  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-20 grid place-items-center bg-emerald-100 text-emerald-700">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Check className="h-4 w-4" />
            Complete
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 flex">
          <div className="w-20 grid place-items-center bg-blue-100 text-blue-600">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Edit2 className="h-4 w-4" />
              Edit
            </div>
          </div>
          <div className="w-20 grid place-items-center bg-red-100 text-red-600">
            <div className="flex items-center gap-2 text-xs font-medium">
              <Trash2 className="h-4 w-4" />
              Delete
            </div>
          </div>
        </div>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -160, right: 80 }}
        dragElastic={0.2}
        onDragEnd={(_, i) => {
          if (i.offset.x > 60) onComplete();
          else if (i.offset.x < -120) onDelete();
          else if (i.offset.x < -60) onEdit();
        }}
        className="relative"
      >
        <div className={`rounded-xl border shadow-sm ${statusStyles}`}>
          <div className="p-3 flex items-center gap-3">
            <button
              onClick={onOpen}
              className="h-10 w-10 rounded-xl overflow-hidden bg-neutral-100 grid place-items-center"
            >
              {imageUrl ? (
                <img src={imageUrl} alt="" className="h-full w-full object-cover" />
              ) : (
                <Leaf className="h-5 w-5" />
              )}
            </button>
            <div className="flex-1" onClick={onOpen}>
              {showPlant ? (
                <div className="flex items-center justify-between">
                  <div className="font-medium">{plant}</div>
                  <span className="text-xs text-neutral-500 flex items-center gap-1">
                    {iconFor(action)}
                    {action}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="font-medium flex items-center gap-1">
                    {iconFor(action)}
                    {action}
                  </div>
                </div>
              )}
              <div className={`text-xs ${dueStyles}`}>
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
                aria-label="Edit"
                onClick={onEdit}
                className="p-2 rounded hover:bg-neutral-100"
              >
                <Edit2 className="h-4 w-4" />
              </button>
              <button
                aria-label="Add note"
                onClick={() => setNoteOpen((v) => !v)}
                className="p-2 rounded hover:bg-neutral-100"
              >
                <StickyNote className="h-4 w-4" />
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

