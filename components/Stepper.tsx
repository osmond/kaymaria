'use client';

export function clampValue(n: number, min: number, step: number) {
  if (Number.isNaN(n)) return min;
  n = Math.max(min, n);
  if (step > 1) {
    n = Math.round(n / step) * step;
  }
  return n;
}

export default function Stepper({
  value,
  onChange,
  min = 0,
  step = 1,
}: {
  value: string;
  onChange: (v: string) => void;
  min?: number;
  step?: number;
}) {
  const num = Number(value) || 0;
  const set = (v: number) => onChange(String(clampValue(v, min, step)));
  const dec = () => set(num - step);
  const inc = () => set(num + step);
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        className="px-2 py-1 border rounded"
        onClick={dec}
      >
        -
      </button>
      <input
        type="number"
        className="input w-16 text-center"
        value={value}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (e.target.value === '') {
            onChange('');
          } else {
            set(v);
          }
        }}
        onKeyDown={(e) => {
          if (e.key === 'ArrowUp') {
            e.preventDefault();
            set(num + 1);
          } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            set(num - 1);
          }
        }}
        min={min}
      />
      <button
        type="button"
        className="px-2 py-1 border rounded"
        onClick={inc}
      >
        +
      </button>
    </div>
  );
}

