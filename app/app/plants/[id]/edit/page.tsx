import { getPlant } from '@/lib/prisma/plants';
import { notFound } from 'next/navigation';
import EditPlantPage from './EditPlantPage';

export default async function EditPlantRoute(ctx: any) {
  const params = await ctx.params;
  const plant = await getPlant(params.id);
  if (!plant) return notFound();
  return <EditPlantPage plant={plant} />;
}
