import { PrismaClient, Plant, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type PlantData = {
  name?: string;
  roomId?: string | null;
  species?: string | null;
  potSize?: string | null;
  potMaterial?: string | null;
  soilType?: string | null;
  lat?: number | null;
  lon?: number | null;
};

export async function listPlants(): Promise<Plant[]> {
  return prisma.plant.findMany({ orderBy: { name: "asc" } });
}

export async function getPlant(id: string): Promise<Plant | null> {
  return prisma.plant.findUnique({ where: { id } });
}

export async function createPlant(userId: string, data: PlantData): Promise<Plant> {
  return prisma.plant.create({
    data: {
      userId,
      name: data.name ?? "New Plant",
      roomId: data.roomId,
      species: data.species,
      potSize: data.potSize,
      potMaterial: data.potMaterial,
      soilType: data.soilType,
      latitude: data.lat ?? undefined,
      longitude: data.lon ?? undefined,
    },
  });
}

export async function updatePlant(id: string, data: PlantData): Promise<Plant | null> {
  try {
    return await prisma.plant.update({
      where: { id },
      data: {
        name: data.name,
        roomId: data.roomId,
        species: data.species,
        potSize: data.potSize,
        potMaterial: data.potMaterial,
        soilType: data.soilType,
        latitude: data.lat ?? undefined,
        longitude: data.lon ?? undefined,
      },
    });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return null;
    }
    throw e;
  }
}

export async function deletePlant(id: string): Promise<boolean> {
  try {
    await prisma.plant.delete({ where: { id } });
    return true;
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError && e.code === "P2025") {
      return false;
    }
    throw e;
  }
}

export function getComputedWaterInfo(_plant: Plant): Record<string, never> {
  return {};
}

