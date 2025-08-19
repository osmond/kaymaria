import { prisma } from "../lib/prisma/client";

async function main() {
  // Clear tables but no longer seed mock data.
  await prisma.task.deleteMany();
  await prisma.plant.deleteMany();
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
