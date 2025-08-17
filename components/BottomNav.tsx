"use client";
import * as React from "react";

import { Leaf, Sprout, BarChart3, Cog, History } from "lucide-react";


export type Tab = "today" | "timeline" | "plants" | "insights" | "settings";

export default function BottomNav({
  value,
  onChange,
}: {
  value: Tab;
  onChange: (t: Tab) => void;
}) {
  const Item = ({
    tab,
    label,
    icon,
  }: {
    tab: Tab;
    label: string;
    icon: React.ReactNode;
  }) => {
    const active = value === tab;
    return (
      <button
        onClick={() => onChange(tab)}
        className={`py-3 flex flex-col items-center justify-center text-xs ${
          active ? "text-neutral-900" : "text-neutral-600"
        }`}
        aria-current={active ? "page" : undefined}
      >
        <div className={`mb-1 ${active ? "" : "opacity-80"}`}>{icon}</div>
        <span className="font-sans">{label}</span>
        {active && <span className="mt-1 h-1 w-6 rounded-full bg-neutral-900" />}
      </button>
    );
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-screen-sm mx-auto grid grid-cols-5">

        <Item tab="today" label="Today" icon={<Leaf />} />
        <Item tab="timeline" label="Timeline" icon={<History />} />
        <Item tab="plants" label="Plants" icon={<Sprout />} />
        <Item tab="insights" label="Insights" icon={<BarChart3 />} />
        <Item tab="settings" label="Settings" icon={<Cog />} />

      </div>
    </nav>
  );
}
