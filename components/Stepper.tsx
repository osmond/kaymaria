'use client';

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
        min={min}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
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

