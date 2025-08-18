'use client';

import { motion } from 'framer-motion';
import {
  Check,
  Clock,
  StickyNote,
  Droplet,
  FlaskConical,
  Sprout,
  Leaf,
} from 'lucide-react';
import { useState } from 'react';

export default function TaskRow({
  plant,
  action,
  last,
  due,
  onOpen,
  onComplete,
  onAddNote,
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
  onDefer: () => void;
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
  return (
    <div className="relative">
      <div className="absolute inset-0 rounded-xl overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-20 grid place-items-center bg-emerald-100 text-emerald-700">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Check className="h-4 w-4" />
            Complete
          </div>
        </div>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 80 }}
        dragElastic={0.2}
        onDragEnd={(_, i) => {
          if (i.offset.x > 60) onComplete();
        }}
        className="relative"
      >
        <div className="rounded-xl border bg-white shadow-sm dark:bg-neutral-800 dark:border-neutral-700">
          <div className="p-3 flex items-center gap-3">
            <button
              onClick={onOpen}
              className="h-10 w-10 rounded-xl bg-neutral-100 grid place-items-center dark:bg-neutral-700"
            >
              <Leaf className="h-5 w-5" />
            </button>
            <div className="flex-1" onClick={onOpen}>
              {showPlant ? (
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                    {plant}
                  </div>
                  <span className="text-xs text-neutral-600 dark:text-neutral-300 flex items-center gap-1">
                    {iconFor(action)}
                    {action}
                  </span>
                </div>
              ) : (
                <div className="flex items-center justify-between">
                  <div className="text-sm font-semibold flex items-center gap-1 text-neutral-900 dark:text-neutral-100">
                    {iconFor(action)}
                    {action}
                  </div>
                </div>
              )}
              <div className="text-xs text-neutral-500 dark:text-neutral-400">
                Last: {last} • Due: {due}
              </div>
            </div>
            <div className="flex items-center gap-1">
              <button
                aria-label="Done"
                onClick={onComplete}
                className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <Check className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-neutral-200 dark:border-neutral-600">
                <button
                  aria-label="Defer"
                  onClick={onDefer}
                  className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Clock className="h-4 w-4" />
                </button>
                <button
                  aria-label="Add note"
                  onClick={() => setNoteOpen((v) => !v)}
                  className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <StickyNote className="h-4 w-4" />
                </button>
              </div>
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

