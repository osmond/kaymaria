import { Plant, Prisma } from "@prisma/client";
import { prisma } from "./client";

type PlantData = {
  name?: string;
  roomId?: string | null;
  species?: string | null;
  potSize?: string | null;
  potMaterial?: string | null;
  soilType?: string | null;
  lightLevel?: string | null;
  indoor?: boolean | null;
  drainage?: 'poor' | 'ok' | 'great' | null;
  lat?: number | null;
  lon?: number | null;
  carePlanSource?: string | null;
  presetId?: string | null;
  aiModel?: string | null;
  aiVersion?: string | null;
  carePlan?: Prisma.JsonValue | null;
  lastWateredAt?: string | null;
  lastFertilizedAt?: string | null;
};

export async function listPlants(filter?: {
  name?: string;
  roomId?: string;
}): Promise<Plant[]> {
  return prisma.plant.findMany({
    where: {
      ...(filter?.name ? { name: filter.name } : {}),
      ...(filter?.roomId ? { roomId: filter.roomId } : {}),
    },
    orderBy: { name: "asc" },
  });
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
      lightLevel: data.lightLevel,
      indoor: data.indoor ?? undefined,
      drainage: data.drainage,
      latitude: data.lat ?? undefined,
      longitude: data.lon ?? undefined,
      carePlanSource: data.carePlanSource ?? undefined,
      carePlan: data.carePlan ?? undefined,
      presetId: data.presetId ?? undefined,
      aiModel: data.aiModel ?? undefined,
      aiVersion: data.aiVersion ?? undefined,
      lastWateredAt: data.lastWateredAt ? new Date(data.lastWateredAt) : undefined,
      lastFertilizedAt: data.lastFertilizedAt
        ? new Date(data.lastFertilizedAt)
        : undefined,
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
        lightLevel: data.lightLevel,
        indoor: data.indoor ?? undefined,
        drainage: data.drainage,
        latitude: data.lat ?? undefined,
        longitude: data.lon ?? undefined,
        carePlanSource: data.carePlanSource ?? undefined,
        carePlan: data.carePlan ?? undefined,
        presetId: data.presetId ?? undefined,
        aiModel: data.aiModel ?? undefined,
        aiVersion: data.aiVersion ?? undefined,
        lastWateredAt: data.lastWateredAt ? new Date(data.lastWateredAt) : undefined,
        lastFertilizedAt: data.lastFertilizedAt
          ? new Date(data.lastFertilizedAt)
          : undefined,
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

export async function getComputedWaterInfo(plant: Plant) {
  const task = await prisma.task.findFirst({
    where: { plantId: plant.id, type: "water" },
    orderBy: { dueAt: "asc" },
  });
  if (!task) {
    return {
      lastDoneAt: plant.lastWateredAt
        ? plant.lastWateredAt.toISOString()
        : null,
      nextDue: null,
    };
  }
  return {
    lastDoneAt: task.lastDoneAt
      ? task.lastDoneAt.toISOString()
      : plant.lastWateredAt
      ? plant.lastWateredAt.toISOString()
      : null,
    nextDue: task.dueAt.toISOString(),
  };
}

