#!/bin/bash
set -e

echo "🔧 Patching client import in /app/app/plants/[id]/page.tsx..."

cat <<EOF > app/app/plants/[id]/page.tsx
import { getPlantById } from '@/lib/data';
import { notFound } from 'next/navigation';
import PlantDetailClient from './PlantDetailClient';

export default async function PlantDetailPage({ params }: { params: { id: string } }) {
  const plant = await getPlantById(params.id);

  if (!plant) return notFound();

  return <PlantDetailClient plant={plant} />;
}
EOF

echo "✅ Patched client import successfully."
echo "🚀 Now run: npm run dev"
