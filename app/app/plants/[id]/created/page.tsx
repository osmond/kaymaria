import PlantCreated from '@/components/PlantCreated';

export default function PlantCreatedPage({ params }: { params: { id: string } }) {
  return <PlantCreated plantId={params.id} />;
}
