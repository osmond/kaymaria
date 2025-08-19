'use client';
import React from 'react';
import { Dialog } from '@headlessui/react';

function labelForType(t: string) {
  return t === 'water' ? 'Water' : t === 'fertilize' ? 'Fertilize' : 'Repot';
}

type Props = {
  open: boolean;
  onClose: () => void;
  rooms: string[];
  roomFilter: string;
  setRoomFilter: (v: string) => void;
  types: string[];
  typeFilter: string;
  setTypeFilter: (v: string) => void;
  statusFilter: string;
  setStatusFilter: (v: string) => void;
  eventTypeFilter: string;
  setEventTypeFilter: (v: string) => void;
};

export default function FiltersModal({
  open,
  onClose,
  rooms,
  roomFilter,
  setRoomFilter,
  types,
  typeFilter,
  setTypeFilter,
  statusFilter,
  setStatusFilter,
  eventTypeFilter,
  setEventTypeFilter,
}: Props) {
  if (!open) return null;
  return (
    <Dialog open={open} onClose={onClose} className="relative z-50">
      <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
      <div className="fixed inset-0 flex items-end sm:items-center justify-center p-4">
        <Dialog.Panel className="relative w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-card max-h-[90vh] overflow-y-auto">
          <div className="mb-3">
            <Dialog.Title className="text-lg font-semibold">Filters</Dialog.Title>
          </div>
          <div className="space-y-3">
            <div className="grid gap-1">
              <label className="text-sm">Room</label>
              <select className="border rounded px-3 py-2 w-full" value={roomFilter} onChange={(e) => setRoomFilter(e.target.value)}>
                <option value="">All rooms</option>
                {rooms.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Task type</label>
              <select className="border rounded px-3 py-2 w-full" value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)}>
                <option value="">All task types</option>
                {types.map((t) => (
                  <option key={t} value={t}>{labelForType(t)}</option>
                ))}
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Status</label>
              <select className="border rounded px-3 py-2 w-full" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
                <option value="">All statuses</option>
                <option value="overdue">Overdue</option>
                <option value="urgent">Due soon</option>
              </select>
            </div>
            <div className="grid gap-1">
              <label className="text-sm">Event type</label>
              <select className="border rounded px-3 py-2 w-full" value={eventTypeFilter} onChange={(e) => setEventTypeFilter(e.target.value)}>
                <option value="">All event types</option>
                <option value="water">Water</option>
                <option value="fertilize">Fertilize</option>
                <option value="repot">Repot</option>
              </select>
            </div>
          </div>
          <div className="mt-4 flex justify-end">
            <button className="border rounded px-3 py-2" onClick={onClose}>Close</button>
          </div>
        </Dialog.Panel>
      </div>
    </Dialog>
  );
}
