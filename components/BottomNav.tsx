"use client";
import * as React from "react";
import Link from "next/link";

import { Leaf, Sprout, BarChart3, Cog, History } from "lucide-react";

export type Tab = "today" | "timeline" | "plants" | "insights" | "settings";

export default function BottomNav({
  value,
  onChange,
}: {
  value: Tab;
  onChange?: (t: Tab) => void;
}) {
  const paths: Record<Tab, string> = {
    today: "/app?tab=today",
    timeline: "/app?tab=timeline",
    plants: "/app?tab=plants",
    insights: "/app/insights",
    settings: "/app?tab=settings",
  };

  const Item = ({
    tab,
    label,
    icon,
    href,
  }: {
    tab: Tab;
    label: string;
    icon: React.ReactNode;
    href?: string;
  }) => {
    const active = value === tab;
    const className = `py-3 flex flex-col items-center justify-center text-xs ${
      active
        ? "text-neutral-900 dark:text-neutral-100"
        : "text-neutral-600 dark:text-neutral-400"
    }`;

    if (href) {
      return (
        <Link href={href} className={className} aria-current={active ? "page" : undefined}>
          <div className={`mb-1 ${active ? "" : "opacity-80"}`}>{icon}</div>
          <span className="font-sans">{label}</span>
          {active && (
            <span className="mt-1 h-1 w-6 rounded-full bg-neutral-900 dark:bg-neutral-100" />
          )}
        </Link>
      );
    }
    return (
      <button
        onClick={() => onChange?.(tab)}
        className={className}
        aria-current={active ? "page" : undefined}
      >
        <div className={`mb-1 ${active ? "" : "opacity-80"}`}>{icon}</div>
        <span className="font-sans">{label}</span>
        {active && (
          <span className="mt-1 h-1 w-6 rounded-full bg-neutral-900 dark:bg-neutral-100" />
        )}
      </button>
    );
  };

  return (
    <nav
      className="fixed bottom-0 inset-x-0 bg-white/90 backdrop-blur border-t dark:bg-neutral-900/90 dark:border-neutral-800"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="max-w-screen-sm mx-auto grid grid-cols-5">
        <Item tab="today" label="Today" icon={<Leaf />} href={!onChange ? paths.today : undefined} />
        <Item tab="timeline" label="Timeline" icon={<History />} href={!onChange ? paths.timeline : undefined} />
        <Item tab="plants" label="Plants" icon={<Sprout />} href={!onChange ? paths.plants : undefined} />
        <Item tab="insights" label="Insights" icon={<BarChart3 />} href={paths.insights} />
        <Item tab="settings" label="Settings" icon={<Cog />} href={!onChange ? paths.settings : undefined} />
      </div>
    </nav>
  );
}
