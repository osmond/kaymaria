"use client";

import React from "react";

export function TimelineSkeleton() {
  return (
    <div className="py-3">
      <div className="hidden motion-safe:block space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-4 rounded bg-neutral-200 relative overflow-hidden"
          >
            <div
              className="absolute inset-0 bg-gradient-to-r from-transparent via-white/60 to-transparent"
              style={{ animation: "shimmer 1.5s infinite" }}
            />
          </div>
        ))}
      </div>
      <div className="text-neutral-500 block motion-safe:hidden">Loading…</div>
    </div>
  );
}

export default TimelineSkeleton;

