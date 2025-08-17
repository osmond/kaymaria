export type CareType = "water" | "fertilize" | "repot";

export type Rule =
  | { type: "water"; intervalDays: number; amountMl?: number }
  | { type: "fertilize"; intervalDays: number; formula?: string }
  | { type: "repot"; intervalDays?: number };

export type Plant = {
  id: string;           // p1, p2, ...
  name: string;
  roomId: string;
  species?: string;
  potSize?: string;
  potMaterial?: string;
  soilType?: string;
  rules: Rule[];
};

export type Event = {
  id: string;           // e_<uuid>
  plantId: string;
  type: CareType;
  at: string;           // ISO
};

export type Note = {
  id: string;           // n_<uuid>
  plantId: string;
  text: string;
  at: string;           // ISO
};

export type TaskRec = {
  id: string;           // t_<uuid>
  plantId: string;
  plantName: string;
  roomId: string;
  type: CareType;
  dueAt: string;        // ISO
  status: "due";
  lastEventAt?: string; // ISO
};

// ----- In-memory DB (mock) -----
const now = Date.now();

function uuid() {
  // quick-and-light uuid for mock data
  return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, c => {
    const r = (Math.random() * 16) | 0, v = c === "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

let PLANTS: Plant[] = [
  {
    id: "p1",
    name: "Aloe",
    roomId: "living",
    species: "Aloe vera",
    potSize: "6in",
    potMaterial: "plastic",
    soilType: "cactus mix",
    rules: [
      { type: "water", intervalDays: 7 },
      { type: "fertilize", intervalDays: 30 },
    ],
  },
  {
    id: "p2",
    name: "Monstera",
    roomId: "living",
    species: "Monstera deliciosa",
    potSize: "8in",
    potMaterial: "terracotta",
    soilType: "aroid mix",
    rules: [
      { type: "water", intervalDays: 5 },
      { type: "fertilize", intervalDays: 28 },
    ],
  },
  {
    id: "p3",
    name: "Orchid",
    roomId: "bed",
    species: "Phalaenopsis",
    potSize: "4in",
    potMaterial: "ceramic",
    soilType: "orchid bark",
    rules: [
      { type: "water", intervalDays: 10 },
      { type: "fertilize", intervalDays: 45 },
    ],
  },
  {
    id: "p4",
    name: "Snake Plant",
    roomId: "bed",
    species: "Sansevieria",
    potSize: "6in",
    potMaterial: "plastic",
    soilType: "sandy mix",
    rules: [
      { type: "water", intervalDays: 14 },
    ],
  },
  {
    id: "p5",
    name: "Fern",
    roomId: "living",
    species: "Boston fern",
    potSize: "6in",
    potMaterial: "ceramic",
    soilType: "peaty mix",
    rules: [
      { type: "water", intervalDays: 3 },
    ],
  },
  {
    id: "p6",
    name: "Fiddle Fig",
    roomId: "living",
    species: "Ficus lyrata",
    potSize: "10in",
    potMaterial: "plastic",
    soilType: "rich potting mix",
    rules: [
      { type: "water", intervalDays: 7 },
    ],
  },
];

let EVENTS: Event[] = [
  // one old event to make "365d ago" style things appear
  { id: `e_${uuid()}`, plantId: "p3", type: "water", at: new Date(now - 365 * 864e5).toISOString() },
];

let TASKS: TaskRec[] = [
  { id: `t_${uuid()}`, plantId: "p1", plantName: "Aloe", roomId: "living", type: "water", dueAt: new Date(now).toISOString(), status: "due" },
  { id: `t_${uuid()}`, plantId: "p3", plantName: "Orchid", roomId: "bed", type: "repot", dueAt: new Date(now).toISOString(), status: "due", lastEventAt: EVENTS[0].at },
  { id: `t_${uuid()}`, plantId: "p2", plantName: "Monstera", roomId: "living", type: "water", dueAt: new Date(now + 2*864e5).toISOString(), status: "due" },
  { id: `t_${uuid()}`, plantId: "p5", plantName: "Fern", roomId: "living", type: "water", dueAt: new Date(now + 1*864e5).toISOString(), status: "due" },
  { id: `t_${uuid()}`, plantId: "p6", plantName: "Fiddle Fig", roomId: "living", type: "water", dueAt: new Date(now + 3*864e5).toISOString(), status: "due" },
];

let NOTES: Note[] = [];

// ----- Query helpers -----
export function listPlants(): Plant[] {
  return PLANTS.slice();
}

export function getPlant(id: string): Plant | undefined {
  return PLANTS.find(p => p.id === id);
}

export function createPlant(partial: {
  name: string;
  roomId?: string;
  species?: string;
  potSize?: string;
  potMaterial?: string;
  soilType?: string;
  rules?: Rule[];
}): Plant {
  const id = `p_${uuid()}`;
  const plant: Plant = {
    id,
    name: partial.name || "New Plant",
    roomId: partial.roomId ?? "living",
    species: partial.species,
    potSize: partial.potSize,
    potMaterial: partial.potMaterial,
    soilType: partial.soilType,
    rules: partial.rules ?? [],
  };
  PLANTS.push(plant);

  // schedule initial tasks based on provided rules
  for (const rule of plant.rules) {
    const interval =
      rule.type === "water" ? rule.intervalDays :
      rule.type === "fertilize" ? rule.intervalDays :
      rule.intervalDays ?? 180;
    const due = new Date(Date.now() + (interval * 864e5));
    createTask({
      plantId: plant.id,
      plantName: plant.name,
      type: rule.type,
      dueAt: due.toISOString(),
    });
  }

  return plant;
}

export function updatePlant(id: string, updates: Partial<Omit<Plant, "id" | "rules">> & { rules?: Rule[] }): Plant | undefined {
  const p = getPlant(id);
  if (!p) return undefined;
  if (updates.name !== undefined) p.name = updates.name;
  if (updates.roomId !== undefined) p.roomId = updates.roomId;
  if (updates.species !== undefined) p.species = updates.species;
  if (updates.potSize !== undefined) p.potSize = updates.potSize;
  if (updates.potMaterial !== undefined) p.potMaterial = updates.potMaterial;
  if (updates.soilType !== undefined) p.soilType = updates.soilType;
  if (updates.rules !== undefined) p.rules = updates.rules;
  return p;
}

export function deletePlant(id: string): boolean {
  const idx = PLANTS.findIndex(p => p.id === id);
  if (idx === -1) return false;
  PLANTS.splice(idx, 1);
  // remove any tasks/events for this plant
  TASKS = TASKS.filter(t => t.plantId !== id);
  EVENTS = EVENTS.filter(e => e.plantId !== id);
  return true;
}

export function getTasks(windowDays = 7): TaskRec[] {
  const maxTs = Date.now() + windowDays * 864e5;
  return TASKS.filter(t => new Date(t.dueAt).getTime() <= maxTs);
}

export function completeTask(idOrComposite: string): TaskRec | null {
  // Supports both "t_<uuid>" and "plantId:type"
  const idx = TASKS.findIndex(t =>
    t.id === idOrComposite ||
    (idOrComposite.includes(":") && `${t.plantId}:${t.type}` === idOrComposite)
  );
  if (idx === -1) return null;
  const [rec] = TASKS.splice(idx, 1);
  return rec;
}

export function deferTask(id: string, days: number): TaskRec | null {
  const rec = TASKS.find(t => t.id === id);
  if (!rec) return null;
  const d = new Date(rec.dueAt);
  d.setDate(d.getDate() + days);
  rec.dueAt = d.toISOString();
  return rec;
}

export function updateTask(id: string, updates: Partial<Pick<TaskRec, "type" | "dueAt" >>): TaskRec | null {
  const rec = TASKS.find(t => t.id === id);
  if (!rec) return null;
  if (updates.type) rec.type = updates.type;
  if (updates.dueAt) rec.dueAt = updates.dueAt;
  return rec;
}

export function createTask(partial: Partial<TaskRec>): TaskRec {
  const id = `t_${uuid()}`;
  const plant = getPlant(partial.plantId ?? "p_new");
  const rec: TaskRec = {
    id,
    plantId: partial.plantId ?? "p_new",
    plantName: partial.plantName ?? plant?.name ?? "New Plant",
    roomId: plant?.roomId ?? "unknown",
    type: (partial.type ?? "water") as CareType,
    dueAt: partial.dueAt ?? new Date().toISOString(),
    status: "due",
    lastEventAt: partial.lastEventAt,
  };
  TASKS.push(rec);
  return rec;
}

// ----- Event + scheduling helpers -----
export function addEvent(plantId: string, type: CareType, at = new Date()): void {
  const ev: Event = { id: `e_${uuid()}`, plantId, type, at: at.toISOString() };
  EVENTS.push(ev);

  // Remove any currently-due task of same type for this plant
  TASKS = TASKS.filter(t => !(t.plantId === plantId && t.type === type));

  // Schedule next task using the rule interval
  const plant = getPlant(plantId);
  if (!plant) return;
  const rule = plant.rules.find(r => r.type === type) as Rule | undefined;
  if (!rule) return;

  let nextDue = new Date(at);
  const interval =
    rule.type === "water" ? rule.intervalDays :
    rule.type === "fertilize" ? rule.intervalDays :
    (rule.intervalDays ?? 180);
  nextDue = new Date(nextDue.getTime() + (interval * 864e5));

  createTask({
    plantId,
    plantName: plant.name,
    type,
    dueAt: nextDue.toISOString(),
    lastEventAt: at.toISOString(),
  });
}

export function undoTaskCompletion(task: TaskRec, eventAt: string): void {
  EVENTS = EVENTS.filter(e => !(e.plantId === task.plantId && e.type === task.type && e.at === eventAt));
  TASKS = TASKS.filter(t => !(t.plantId === task.plantId && t.type === task.type && t.lastEventAt === eventAt));
  TASKS.push(task);
}

export function getLastEvent(plantId: string, type: CareType): Event | undefined {
  const events = EVENTS
    .filter(e => e.plantId === plantId && e.type === type)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  return events[0];
}

export function getRule(plantId: string, type: CareType): Rule | undefined {
  const p = getPlant(plantId);
  return p?.rules.find(r => r.type === type);
}

// ----- Notes helpers -----
export function addNote(plantId: string, text: string): Note {
  const note: Note = {
    id: `n_${uuid()}`,
    plantId,
    text,
    at: new Date().toISOString(),
  };
  NOTES.push(note);
  return note;
}

export function listNotes(plantId: string): Note[] {
  return NOTES
    .filter(n => n.plantId === plantId)
    .sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
}

export function getComputedWaterInfo(plantId: string): {
  lastWateredAt?: string;
  nextWaterAt?: string;
  intervalDays?: number;
} {
  const last = getLastEvent(plantId, "water");
  const rule = getRule(plantId, "water") as Extract<Rule, {type: "water"}> | undefined;
  const interval = rule?.intervalDays ?? 7;
  const next = new Date(last ? last.at : Date.now());
  next.setDate(next.getDate() + interval);
  return {
    lastWateredAt: last?.at,
    nextWaterAt: next.toISOString(),
    intervalDays: interval,
  };
}

export async function getPlantById(id: string) {
  const plants = await getPlants?.(); // fallback to getPlants in same file
  return plants?.find(p => p.id === id) ?? null;
}

export async function getPlants() {
  return [
    {
      id: "p1",
      name: "Fiddle Leaf Fig",
      roomId: "r1",
      interval: { water: 7, fertilize: 30 },
      notes: "Bright indirect light.",
      lastWatered: "2025-08-10",
      lastFertilized: "2025-07-15"
    },
    {
      id: "p5",
      name: "Snake Plant",
      roomId: "r1",
      interval: { water: 14, fertilize: 60 },
      notes: "Tolerates low light.",
      lastWatered: "2025-08-07",
      lastFertilized: "2025-06-01"
    }
  ];
}

export function dump() {
  return TASKS.slice();
}

export function load(tasks: TaskRec[] = []) {
  TASKS = tasks.slice();
  return TASKS.length;
}

export function getInsights() {
  return {
    plantCount: PLANTS.length,
    taskCount: TASKS.length,
  };
}

export const _state = {
  get plants() {
    return PLANTS;
  },
  get events() {
    return EVENTS.map(e => ({ plantId: e.plantId, type: e.type, occurredAt: e.at }));
  },
  get rules() {
    return PLANTS.flatMap(p => p.rules.map(r => ({ ...r, plantId: p.id })));
  }
};
