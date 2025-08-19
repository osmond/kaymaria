import { Leaf, Sun, Droplet } from 'lucide-react';
import React from 'react';

export type PlantType = 'foliage' | 'sun' | 'water';

const icons: Record<PlantType, { icon: React.ComponentType<any>; label: string }> = {
  foliage: { icon: Leaf, label: 'Foliage plant' },
  sun: { icon: Sun, label: 'Sun-loving plant' },
  water: { icon: Droplet, label: 'Water-loving plant' },
};

export default function PlantTypeIcon({ type }: { type: PlantType }) {
  const { icon: Icon, label } = icons[type];
  return (
    <span
      className="inline-flex items-center justify-center text-neutral-900 dark:text-neutral-100"
      aria-label={label}
    >
      <Icon aria-hidden="true" />
    </span>
  );
}
