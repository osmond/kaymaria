import { PrismaClient, Plant, Prisma } from "@prisma/client";

const prisma = new PrismaClient();

type PlantData = Partial<Omit<Plant, "id" | "tasks">>;

export async function listPlants(): Promise<Plant[]> {
  return prisma.plant.findMany({ orderBy: { name: "asc" } });
}

export async function getPlant(id: string): Promise<Plant | null> {
  return prisma.plant.findUnique({ where: { id } });
}

export async function createPlant(data: PlantData): Promise<Plant> {
  return prisma.plant.create({
    data: {
      name: data.name ?? "New Plant",
      species: data.species,
      lastWatered: data.lastWatered ? new Date(data.lastWatered) : undefined,
      nextWater: data.nextWater ? new Date(data.nextWater) : undefined,
      lastFertilized: data.lastFertilized ? new Date(data.lastFertilized) : undefined,
      nextFertilize: data.nextFertilize ? new Date(data.nextFertilize) : undefined,
      waterIntervalDays: data.waterIntervalDays,
      fertilizeIntervalDays: data.fertilizeIntervalDays,
      latitude: data.latitude,
      longitude: data.longitude,
    },
  });
}

export async function updatePlant(id: string, data: PlantData): Promise<Plant | null> {
  try {
    return await prisma.plant.update({
      where: { id },
      data: {
        name: data.name,
        species: data.species,
        lastWatered: data.lastWatered ? new Date(data.lastWatered) : undefined,
        nextWater: data.nextWater ? new Date(data.nextWater) : undefined,
        lastFertilized: data.lastFertilized ? new Date(data.lastFertilized) : undefined,
        nextFertilize: data.nextFertilize ? new Date(data.nextFertilize) : undefined,
        waterIntervalDays: data.waterIntervalDays,
        fertilizeIntervalDays: data.fertilizeIntervalDays,
        latitude: data.latitude,
        longitude: data.longitude,
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

export function getComputedWaterInfo(plant: Plant): {
  lastWateredAt?: string;
  nextWaterAt?: string;
  intervalDays?: number;
} {
  return {
    lastWateredAt: plant.lastWatered?.toISOString(),
    nextWaterAt: plant.nextWater?.toISOString(),
    intervalDays: plant.waterIntervalDays ?? undefined,
  };
}

