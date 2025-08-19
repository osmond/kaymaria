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
  const dec = () => {
    const next = num - step;
    onChange(String(next < min ? min : next));
  };
  const inc = () => {
    const next = num + step;
    onChange(String(next));
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
        className="input w-16 text-center"
        value={value}
        onChange={(e) => onChange(e.target.value.replace(/[^0-9]/g, ''))}
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

