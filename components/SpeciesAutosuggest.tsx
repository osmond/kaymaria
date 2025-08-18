'use client';

import React, { useEffect, useId, useState } from 'react';

type Suggestion = {
  name: string;
  species: string;
  thumbnail?: string;
  info?: string;
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
  const listId = useId();

  useEffect(() => {
    setQuery(value);
  }, [value]);

  const staticSuggestions: Suggestion[] = [
    {
      name: "Don't know species",
      species: 'unknown',
      thumbnail: 'https://via.placeholder.com/40?text=%3F',
      info: "We'll help identify it later",
    },
    {
      name: 'Add as custom plant',
      species: 'custom',
      thumbnail: 'https://via.placeholder.com/40?text=%2B',
      info: 'Provide your own details',
    },
  ];

  useEffect(() => {
    if (!query.trim()) {
      setSuggestions(staticSuggestions);
      return;
    }
    const controller = new AbortController();
    const handle = setTimeout(async () => {
      try {
        const r = await fetch(`/api/species-search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        setSuggestions([...json, ...staticSuggestions]);
        setOpen(true);
      } catch (e) {
        if ((e as any).name !== 'AbortError') {
          console.error('species search failed', e);
        }
      }
    }, 250);
    return () => {
      controller.abort();
      clearTimeout(handle);
    };
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
        role="combobox"
        aria-expanded={open}
        aria-controls={listId}
        aria-autocomplete="list"
        className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-neutral-300"
        value={query}
        onChange={handleChange}
        onFocus={() => { if (suggestions.length) setOpen(true); }}
        onBlur={() => setTimeout(() => setOpen(false), 100)}
        placeholder="e.g., Monstera"
      />
      {open && suggestions.length > 0 && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow"
        >
          {suggestions.map((s) => (
            <li
              key={s.species + s.name}
              role="option"
              className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-neutral-100"
              onMouseDown={(e) => { e.preventDefault(); choose(s); }}
            >
              <img
                src={s.thumbnail || 'https://via.placeholder.com/40'}
                alt=""
                className="h-6 w-6 rounded object-cover"
              />
              <div>
                <div className="font-medium">{s.name}</div>
                <div className="text-xs text-neutral-500">{s.info || s.species}</div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
