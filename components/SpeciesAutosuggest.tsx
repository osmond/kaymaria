'use client';

import React, { useEffect, useId, useState } from 'react';

type Suggestion = {
  name: string;
  species: string;
  thumbnail?: string;
  info?: string;
};

const CACHE_MS = 10 * 60 * 1000;
const cache = new Map<string, { ts: number; data: Suggestion[] }>();
const controllers = new Map<string, AbortController>();

export default function SpeciesAutosuggest({
  value,
  onChange,
  onSelect,
  onBlur,
  inputRef,
}: {
  value: string;
  onChange: (v: string) => void;
  onSelect: (s: Suggestion) => void;
  onBlur?: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
}) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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
  ];

  useEffect(() => {
    if (!query.trim()) {
      controllers.forEach((c) => c.abort());
      controllers.clear();
      setLoading(false);
      setSuggestions(staticSuggestions);
      setOpen(false);
      return;
    }

    // Abort any other in-flight requests
    controllers.forEach((c, q) => {
      if (q !== query) {
        c.abort();
        controllers.delete(q);
      }
    });

    const cached = cache.get(query);
    if (cached && Date.now() - cached.ts < CACHE_MS) {
      if (cached.data.length === 0) {
        setSuggestions([
          {
            name: 'No matches. Add as custom plant.',
            species: 'custom',
            thumbnail: 'https://via.placeholder.com/40?text=%2B',
          },
          ...staticSuggestions,
        ]);
      } else {
        setSuggestions([...cached.data, ...staticSuggestions]);
      }
      setOpen(true);
      setLoading(false);
      return;
    }

    const controller = new AbortController();
    controllers.set(query, controller);
    setLoading(true);
    setOpen(true);
    const handle = setTimeout(async () => {
      try {
        const r = await fetch(`/api/species-search?q=${encodeURIComponent(query)}`, {
          signal: controller.signal,
        });
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const json = await r.json();
        cache.set(query, { ts: Date.now(), data: json });
        if (controllers.get(query) === controller) {
          if (json.length === 0) {
            setSuggestions([
              {
                name: 'No matches. Add as custom plant.',
                species: 'custom',
                thumbnail: 'https://via.placeholder.com/40?text=%2B',
              },
              ...staticSuggestions,
            ]);
          } else {
            setSuggestions([...json, ...staticSuggestions]);
          }
          setLoading(false);
        }
      } catch (e) {
        if ((e as any).name !== 'AbortError' && controllers.get(query) === controller) {
          console.error('species search failed', e);
          setLoading(false);
        }
      } finally {
        controllers.delete(query);
      }
    }, 250);
    return () => {
      controller.abort();
      controllers.delete(query);
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
        ref={inputRef}
        onFocus={() => { if (suggestions.length || loading) setOpen(true); }}
        onBlur={() => {
          onBlur?.();
          setTimeout(() => setOpen(false), 100);
        }}
        placeholder="e.g., Monstera deliciosa"
      />
      {open && (
        <ul
          id={listId}
          role="listbox"
          className="absolute z-10 mt-1 w-full bg-white border rounded-lg shadow"
        >
          {loading
            ? Array.from({ length: 3 }).map((_, i) => (
                <li
                  key={i}
                  className="px-3 py-2"
                >
                  <div className="h-6 bg-neutral-200 animate-pulse rounded" />
                </li>
              ))
            : suggestions.map((s) => (
                <li
                  key={s.species + s.name}
                  role="option"
                  className="flex items-center gap-2 px-3 py-2 text-sm cursor-pointer hover:bg-neutral-100"
                  onMouseDown={(e) => {
                    e.preventDefault();
                    choose(s);
                  }}
                >
                  <img
                    src={s.thumbnail || 'https://via.placeholder.com/40'}
                    alt=""
                    className="h-6 w-6 rounded object-cover"
                  />
                  <div>
                    <div className="font-medium">{s.name}</div>
                    {s.info && (
                      <div className="text-xs text-neutral-500">{s.info}</div>
                    )}
                  </div>
                </li>
              ))}
        </ul>
      )}
    </div>
  );
}
