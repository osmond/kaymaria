// lib/mockStore.ts
export type CareType = "water" | "fertilize" | "repot";

export type TaskDTO = {
  id: string;
  plantId: string;
  plantName: string;
  type: CareType;
  dueAt: string; // ISO
  status: "due";
  lastEventAt?: string;
};

export type PlantDTO = {
  id: string;
  name: string;
  roomId?: string;
  species?: string;
  potSize?: string;
  lightLevel?: string;
  indoor?: boolean;
  soilType?: string;
  drainage?: string;
  lat?: number;
  lon?: number;
};

const g = globalThis as any;

function iso(d: Date) {
  return d.toISOString();
}

function initialTasks(): TaskDTO[] {
  const today = new Date();
  return [
    {
      id: "t_seed_1",
      plantId: "p_orchid",
      plantName: "Orchid",
      type: "repot",
      dueAt: iso(today),
      status: "due",
      lastEventAt: new Date(today.getTime() - 365 * 86400000).toISOString(),
    },
  ];
}

function initialPlants(): PlantDTO[] {
  return [
    { id: "p_orchid", name: "Orchid", roomId: "room-1", species: "Orchidaceae" },
  ];
}

// singleton in-memory store (dev only)
if (!g.__MOCK_STORE__) {
  g.__MOCK_STORE__ = {
    tasks: initialTasks() as TaskDTO[],
    plants: initialPlants() as PlantDTO[],
  };
}
function S() {
  return g.__MOCK_STORE__ as { tasks: TaskDTO[]; plants: PlantDTO[] };
}

// ---- tasks ----
export function listTasks(): TaskDTO[] {
  return S().tasks;
}
export function addTask(input: {
  plant: string;
  plantId?: string;
  type: CareType;
  dueAt: Date;
}): TaskDTO {
  const id =
    "t_" +
    (globalThis.crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2));
  const plantId =
    input.plantId ?? ("p_" + input.plant.toLowerCase().replace(/\s+/g, "-"));
  const task: TaskDTO = {
    id,
    plantId,
    plantName: input.plant,
    type: input.type,
    dueAt: input.dueAt.toISOString(),
    status: "due",
  };
  S().tasks.unshift(task);
  return task;
}
export function completeTask(id: string): boolean {
  const i = S().tasks.findIndex((t) => t.id === id);
  if (i === -1) return false;
  S().tasks.splice(i, 1);
  return true;
}
export function deleteTask(id: string): boolean {
  const i = S().tasks.findIndex((t) => t.id === id);
  if (i === -1) return false;
  S().tasks.splice(i, 1);
  return true;
}
export function parseDueLabelToDate(label: string, base = new Date()): Date {
  const day0 = new Date(base.getFullYear(), base.getMonth(), base.getDate());
  const d = new Date(day0);
  if (label === "Tomorrow") d.setDate(day0.getDate() + 1);
  else if (/^In \d+d$/.test(label)) d.setDate(day0.getDate() + Number(label.slice(3, -1)));
  return d; // default Today
}

// ---- plants ----
export function listPlants(): PlantDTO[] {
  return S().plants;
}
export function addPlant(p: Omit<PlantDTO, "id">): PlantDTO {
  const id =
    "p_" +
    (globalThis.crypto?.randomUUID?.() ??
      Math.random().toString(36).slice(2));
  const plant: PlantDTO = { id, ...p };
  S().plants.unshift(plant);
  return plant;
}
