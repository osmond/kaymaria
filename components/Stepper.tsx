'use client';

import { Minus, Plus } from 'lucide-react';

export default function Stepper({
  value,
  onChange,
  min = 0,
  step = 1,
  ariaLabel = 'Value',
}: {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  step?: number;
  ariaLabel?: string;
}) {
  const num = Number(value) || 0;
  const clamp = (n: number) => {
    let res = n;
    if (res < min) res = min;
    if (step > 1) {
      res = Math.round(res / step) * step;
    }
    return res;
  };
  const dec = () => {
    onChange(String(clamp(num - step)));
  };
  const inc = () => {
    onChange(String(clamp(num + step)));
  };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(String(clamp(num + 1)));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(String(clamp(num - 1)));
    }
  };
  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    onChange(String(clamp(Number(e.target.value) || 0)));
  };
  const handleButtonKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (e.key === 'ArrowUp' || e.key === 'ArrowRight') {
      e.preventDefault();
      inc();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowLeft') {
      e.preventDefault();
      dec();
    }
  };
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="w-11 h-11 flex items-center justify-center border rounded-2xl shadow-md bg-white text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
        onClick={dec}
        aria-label="Decrease value"
        onKeyDown={handleButtonKeyDown}
      >
        <Minus className="w-4 h-4 text-neutral-900 dark:text-neutral-100" aria-hidden="true" />
      </button>
      <input
        type="number"
        className="input w-16 text-center h-11"
        value={value}
        min={min}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        aria-label={ariaLabel}
      />
      <button
        type="button"
        className="w-11 h-11 flex items-center justify-center border rounded-2xl shadow-md bg-white text-neutral-900 hover:bg-neutral-100 focus:outline-none focus:ring-2 focus:ring-primary transition-colors dark:bg-neutral-800 dark:text-neutral-100 dark:hover:bg-neutral-700"
        onClick={inc}
        aria-label="Increase value"
        onKeyDown={handleButtonKeyDown}
      >
        <Plus className="w-4 h-4 text-neutral-900 dark:text-neutral-100" aria-hidden="true" />
      </button>
    </div>
  );
}

