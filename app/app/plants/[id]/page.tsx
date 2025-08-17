import { getPlantById } from '@/lib/data';
import { notFound } from 'next/navigation';
import PlantDetailClient from './PlantDetailClient';

export default async function PlantDetailPage({ params }: { params: { id: string } }) {
  const plant = await getPlantById(params.id);

  if (!plant) return notFound();

  return <PlantDetailClient plant={plant} />;
}
