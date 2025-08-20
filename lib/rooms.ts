import { fetchJson } from './fetchJson';

export type Room = { id: string; name?: string };

export async function getRooms(signal?: AbortSignal) {
  return fetchJson<Room[]>('/api/rooms', { signal });
}
