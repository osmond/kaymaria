export type CareType = "water" | "fertilize" | "repot";

export type Plant = {
  id: string;           // p1, p2, …
  name: string;
  room?: string;        // e.g. "living", "bedroom"
  species?: string;
  waterEveryDays: number;
  lastWaterAt?: string; // ISO
};

// Seed data
let PLANTS: Plant[] = [
  { id: "p1", name: "Aloe",        room: "living",  species: "Aloe vera",       waterEveryDays: 7 },
  { id: "p2", name: "Monstera",    room: "living",  species: "M. deliciosa",    waterEveryDays: 6 },
  { id: "p3", name: "Orchid",      room: "bedroom", species: "Phalaenopsis",    waterEveryDays: 10, lastWaterAt: new Date(Date.now()-365*864e5).toISOString() },
  { id: "p4", name: "Fern",        room: "living",  species: "Boston Fern",     waterEveryDays: 4 },
  { id: "p5", name: "Peace Lily",  room: "living",  species: "Spathiphyllum",   waterEveryDays: 5 },
  { id: "p6", name: "Fiddle Fig",  room: "living",  species: "Ficus lyrata",    waterEveryDays: 7 },
  { id: "p7", name: "Snake Plant", room: "bedroom", species: "Sansevieria",     waterEveryDays: 14 },
  { id: "p8", name: "ZZ Plant",    room: "office",  species: "Zamioculcas",     waterEveryDays: 12 },
];

export function allPlants(): Plant[] {
  return PLANTS.slice();
}
export function getPlant(id: string): Plant | undefined {
  return PLANTS.find(p => p.id === id);
}
export function addPlant(input: Partial<Plant>): Plant {
  const id = `p_${Math.random().toString(36).slice(2, 8)}`;
  const rec: Plant = {
    id,
    name: input.name ?? "New Plant",
    room: input.room ?? "living",
    species: input.species,
    waterEveryDays: input.waterEveryDays ?? 7,
    lastWaterAt: input.lastWaterAt,
  };
  PLANTS.push(rec);
  return rec;
}

export function updatePlant(id: string, updates: Partial<Plant>): Plant | undefined {
  const p = getPlant(id);
  if (!p) return undefined;
  if (updates.name !== undefined) p.name = updates.name;
  if (updates.room !== undefined) p.room = updates.room;
  if (updates.species !== undefined) p.species = updates.species;
  if (updates.waterEveryDays !== undefined) p.waterEveryDays = updates.waterEveryDays;
  if (updates.lastWaterAt !== undefined) p.lastWaterAt = updates.lastWaterAt;
  return p;
}

export function deletePlant(id: string): boolean {
  const idx = PLANTS.findIndex(p => p.id === id);
  if (idx === -1) return false;
  PLANTS.splice(idx, 1);
  return true;
}
export function touchWatered(id: string) {
  const p = getPlant(id);
  if (p) p.lastWaterAt = new Date().toISOString();
}
export function computedWaterInfo(p: Plant) {
  const last = p.lastWaterAt ? new Date(p.lastWaterAt) : undefined;
  const next = new Date((last?.getTime() ?? Date.now()) + p.waterEveryDays * 864e5);
  return {
    lastAt: p.lastWaterAt ?? null,
    nextAt: next.toISOString(),
  };
}
