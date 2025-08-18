'use client';

import React from 'react';
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem, useSelectCtx } from './ui/select';

type Room = { id: string; name?: string };

export default function RoomSelector({
  value,
  onChange,
}: {
  value?: string;
  onChange: (id: string) => void;
}) {
  const [rooms, setRooms] = React.useState<Room[]>([]);

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


  async function handleAdd(ctx: ReturnType<typeof useSelectCtx>) {
    if (!ctx) return;
    const name = prompt('New room name');
    if (!name) {
      ctx.setOpen(false);
      return;
    }
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
        ctx.setSelectedLabel(json.name || json.id);
      }
    } catch (e) {
      console.error('Failed to add room', e);
    } finally {
      ctx.setOpen(false);
    }
  }

  function AddRoomItem() {
    const ctx = useSelectCtx();
    if (!ctx) return null;
    return (
      <button
        type="button"
        className="block w-full px-3 py-2 text-left text-sm hover:bg-neutral-100"
        onClick={() => handleAdd(ctx)}
      >
        Add room
      </button>
    );
  }

  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger>
        <SelectValue placeholder="Select room" />
      </SelectTrigger>
      <SelectContent>
        {rooms.map((r) => (
          <SelectItem key={r.id} value={r.id}>
            {r.name || r.id}
          </SelectItem>
        ))}
        <AddRoomItem />
      </SelectContent>
    </Select>
  );
}
