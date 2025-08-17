import { PrismaClient } from "@prisma/client";
import { mockPlants } from "../mock/plants";
import { mockTasks } from "../mock/tasks";

const prisma = new PrismaClient();

async function main() {
  await prisma.task.deleteMany();
  await prisma.plant.deleteMany();

  await prisma.plant.createMany({
    data: mockPlants.map((p) => ({
      id: p.id,
      name: p.name,
      species: p.species,
      lastWatered: p.lastWatered ? new Date(p.lastWatered) : undefined,
      nextWater: p.nextWater ? new Date(p.nextWater) : undefined,
      lastFertilized: p.lastFertilized ? new Date(p.lastFertilized) : undefined,
      nextFertilize: p.nextFertilize ? new Date(p.nextFertilize) : undefined,
      waterIntervalDays: p.waterIntervalDays,
      fertilizeIntervalDays: p.fertilizeIntervalDays,
      latitude: p.latitude,
      longitude: p.longitude,
    })),
  });

  await prisma.task.createMany({
    data: mockTasks.map((t) => ({
      id: t.id,
      title: t.title,
      due: new Date(t.due),
      completed: t.completed ?? false,
      type: t.type,
      notes: t.notes,
      plantId: t.plantId,
    })),
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
