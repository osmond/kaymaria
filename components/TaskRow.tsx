'use client';

import { motion } from 'framer-motion';
import { useEffect, useState, type KeyboardEvent } from 'react';
import { Check, Clock, Droplet, FlaskConical, Sprout, Leaf } from 'lucide-react';

export default function TaskRow({
  plant,
  action,
  last,
  due,
  onOpen,
  onComplete,
  onDefer,
  showPlant = true,
}: {
  plant: string;
  action: 'Water' | 'Fertilize' | 'Repot';
  last: string;
  due: string;
  onOpen: () => void;
  onComplete: () => void;
  onDefer: () => void;
  showPlant?: boolean;
}) {
  const [announce, setAnnounce] = useState('');

  useEffect(() => {
    if (announce) {
      const t = setTimeout(() => setAnnounce(''), 1000);
      return () => clearTimeout(t);
    }
  }, [announce]);

  function handleComplete() {
    onComplete();
    setAnnounce('Task completed');
  }

  function handleDefer() {
    onDefer();
    setAnnounce('Task deferred');
  }

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'Enter' || e.key.toLowerCase() === 'o') onOpen();
    else if (e.key.toLowerCase() === 'c') handleComplete();
    else if (e.key.toLowerCase() === 's') handleDefer();
  }
  function iconFor(action: 'Water' | 'Fertilize' | 'Repot') {
    const className = "h-3 w-3";
    return action === 'Water'
      ? <Droplet className={className} />
      : action === 'Fertilize'
      ? <FlaskConical className={className} />
      : <Sprout className={className} />;
  }
  return (
    <div
      className="relative"
      tabIndex={0}
      onKeyDown={handleKeyDown}
      aria-keyshortcuts="Enter o c s"
      aria-label={`Task for ${plant}: ${action}. Last ${last}. Due ${due}. Press Enter or O to open, C to complete, S to snooze.`}
    >
      <div className="sr-only" aria-live="polite">{announce}</div>
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute inset-y-0 left-0 w-20 grid place-items-center bg-emerald-100 text-emerald-700">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Check className="h-4 w-4" />
            Complete
          </div>
        </div>
        <div className="absolute inset-y-0 right-0 w-20 grid place-items-center bg-amber-100 text-amber-700">
          <div className="flex items-center gap-2 text-xs font-medium">
            <Clock className="h-4 w-4" />
            Snooze
          </div>
        </div>
      </div>
      <motion.div
        drag="x"
        dragConstraints={{ left: -80, right: 80 }}
        dragElastic={0.2}
        onDragEnd={(_, i) => {
          if (i.offset.x > 60) handleComplete();
          else if (i.offset.x < -60) handleDefer();
        }}
        className="relative"
      >
        <div className="rounded-2xl border bg-white shadow-card dark:bg-neutral-800 dark:border-neutral-700">
          <div className="p-3 flex items-center gap-3">
            <button
              onClick={onOpen}
              aria-keyshortcuts="o"
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
                aria-keyshortcuts="c"
                onClick={handleComplete}
                className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
              >
                <Check className="h-4 w-4" />
              </button>
              <div className="flex items-center gap-1 ml-2 pl-2 border-l border-neutral-200 dark:border-neutral-600">
                <button
                  aria-label="Defer"
                  aria-keyshortcuts="s"
                  onClick={handleDefer}
                  className="p-2 rounded hover:bg-neutral-100 dark:hover:bg-neutral-700"
                >
                  <Clock className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

