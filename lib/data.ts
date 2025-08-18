import { mockPlants } from '@/mock/plants';

export async function getPlantById(id: string) {
  return mockPlants.find((plant) => plant.id === id) ?? null;
}

export async function listPhotos(id: string): Promise<string[]> {
  const plant = mockPlants.find((p) => p.id === id);
  return plant?.photos ?? [];
}

export async function addPhoto(id: string, src: string): Promise<{ src: string } | null> {
  const plant = mockPlants.find((p) => p.id === id);
  if (!plant) return null;
  if (!plant.photos) plant.photos = [];
  plant.photos.push(src);
  return { src };
}

export async function removePhoto(id: string, src: string): Promise<boolean> {
  const plant = mockPlants.find((p) => p.id === id);
  if (!plant || !plant.photos) return false;
  const idx = plant.photos.indexOf(src);
  if (idx === -1) return false;
  plant.photos.splice(idx, 1);
  return true;
}
