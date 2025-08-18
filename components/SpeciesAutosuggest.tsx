'use client';

import React, { useEffect, useState } from 'react';

type Suggestion = {
  name: string;
  species: string;
};

export default function SpeciesAutosuggest({
  value,
  onChange,
  onSelect,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: Suggestion) => void;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions([]);
      return;
    }
    const controller = new AbortController();
    async function load() {
      try {
        const r = await fetch(`/api/species-search?q=${encodeURIComponent(query)}`, { signal: controller.signal });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        setSuggestions(json);
        setOpen(true);
      } catch (e) {
        if ((e as any).name !== 'AbortError') {
          console.error('species search failed', e);
        }
      }
    }
    load();
    return () => controller.abort();
  }, [query]);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const v = e.target.value;
    setQuery(v);
    onChange(v);
  }

  function choose(item: Suggestion) {
    onSelect(item);
    setQuery(item.name);
    onChange(item.name);
    setOpen(false);
  }

  return (
    <div className="relative">
      <input
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
        value={query}
        onChange={handleChange}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        placeholder="e.g., Monstera"
      />
      {open && suggestions.length > 0 && (
        <ul className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow">
          {suggestions.map((s) => (
            <li
              key={s.species}
              className="px-3 py-2 text-sm cursor-pointer hover:bg-neutral-100"
              onMouseDown={(e) => { e.preventDefault(); choose(s); }}
            >
              <div className="font-medium">{s.name}</div>
              <div className="text-xs text-neutral-500">{s.species}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
