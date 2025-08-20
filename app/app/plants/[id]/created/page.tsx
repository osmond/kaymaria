import PlantCreated from '@/components/PlantCreated';

export default async function PlantCreatedPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PlantCreated plantId={id} />;
}
