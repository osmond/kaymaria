'use client';

import { useRef } from 'react';

export function ChipSelect({
  options,
  value,
  onChange,
}: {
  options: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  const refs = useRef<HTMLButtonElement[]>([]);
  return (
    <div className="flex gap-2" role="radiogroup" aria-label="Options">
      {options.map((opt, i) => (
        <button
          key={opt}
          ref={(el) => {
            refs.current[i] = el!;
          }}
          type="button"
          role="radio"
          aria-checked={value === opt}
          aria-label={opt}
          tabIndex={value === opt ? 0 : -1}
          className={`min-w-12 min-h-12 px-4 py-3 rounded-full border text-sm flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-neutral-900 dark:focus-visible:ring-neutral-100 focus-visible:ring-offset-white dark:focus-visible:ring-offset-neutral-800 ${
            value === opt
              ? 'bg-neutral-900 text-white border-neutral-900 dark:bg-neutral-100 dark:text-neutral-900 dark:border-neutral-100'
              : 'bg-white text-neutral-900 border-neutral-300 hover:bg-neutral-100 dark:bg-neutral-800 dark:text-neutral-100 dark:border-neutral-600 dark:hover:bg-neutral-700'
          }`}
          onClick={() => onChange(opt)}
          onKeyDown={(e) => {
            if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
              e.preventDefault();
              refs.current[(i + 1) % options.length]?.focus();
            } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
              e.preventDefault();
              refs.current[(i - 1 + options.length) % options.length]?.focus();
            } else if (e.key === ' ' || e.key === 'Enter') {
              e.preventDefault();
              onChange(opt);
            }
          }}
        >
          {opt}
        </button>
      ))}
    </div>
  );
}

export default ChipSelect;
