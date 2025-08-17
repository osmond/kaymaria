CREATE TABLE "Plant" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "species" TEXT,
    "lastWatered" DATETIME,
    "nextWater" DATETIME,
    "lastFertilized" DATETIME,
    "nextFertilize" DATETIME
);

CREATE TABLE "Task" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL,
    "due" DATETIME NOT NULL,
    "completed" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT,
    "notes" TEXT,
    "plantId" TEXT NOT NULL,
    CONSTRAINT "Task_plantId_fkey" FOREIGN KEY ("plantId") REFERENCES "Plant"("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
