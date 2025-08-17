import { mockPlants } from '@/mock/plants';

export async function getPlantById(id: string) {
  return mockPlants.find((plant) => plant.id === id) ?? null;
}
