'use client';

import React from 'react';

type Room = { id: string; name?: string };

export default function RoomSelector({
  value,
  onChange,
}: {
  value?: string;
  onChange: (id: string) => void;
}) {
  const [rooms, setRooms] = React.useState<Room[]>([]);
  const [newRoom, setNewRoom] = React.useState('');
  const inputRef = React.useRef<HTMLInputElement>(null);

  React.useEffect(() => {
    async function load() {
      try {
        const res = await fetch('/api/rooms');
        if (res.ok) {
          const json = await res.json();
          setRooms(json);
        }
      } catch (e) {
        console.error('Failed to load rooms', e);
      }
    }
    load();
  }, []);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    const name = newRoom.trim();
    if (!name) return;
    try {
      const res = await fetch('/api/rooms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name }),
      });
      if (res.ok) {
        const json: Room = await res.json();
        setRooms((r) => [...r, json]);
        onChange(json.id);
        setNewRoom('');
        requestAnimationFrame(() => {
          inputRef.current?.focus();
        });
      }
    } catch (e) {
      console.error('Failed to add room', e);
    }
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2">
        {rooms.map((r) => (
          <button
            key={r.id}
            type="button"
            className={`px-3 py-1 rounded-full border text-sm ${
              value === r.id
                ? 'bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900'
                : 'bg-white dark:bg-neutral-800'
            }`}
            onClick={() => onChange(r.id)}
          >
            {r.name || r.id}
          </button>
        ))}
      </div>
      <form onSubmit={handleAdd} className="mt-2 flex gap-2">
        <input
          ref={inputRef}
          className="input flex-1"
          placeholder="Add room"
          value={newRoom}
          onChange={(e) => setNewRoom(e.target.value)}
        />
        <button type="submit" className="border rounded px-3 py-2 text-sm">
          Save
        </button>
      </form>
    </div>
  );
}
