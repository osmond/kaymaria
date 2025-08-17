import { getPlantById } from '@/lib/data';
import { notFound } from 'next/navigation';
import PlantDetailClient from './PlantDetailClient';

export default async function PlantDetailPage(ctx: any) {
  const params = await ctx.params;
  const plant = await getPlantById(params.id);

  if (!plant) return notFound();

  return <PlantDetailClient plant={plant} />;
}
