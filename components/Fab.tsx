'use client';

import { Plus } from 'lucide-react';

export default function Fab({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Add"
      className="fixed right-4 h-12 w-12 rounded-full bg-neutral-900 text-white grid place-items-center shadow-lg dark:bg-neutral-100 dark:text-neutral-900"
      style={{ bottom: `calc(5rem + env(safe-area-inset-bottom))` }}
    >
      <Plus className="h-5 w-5" />
    </button>
  );
}
