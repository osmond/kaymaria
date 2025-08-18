"use client";

import { TimelineView } from "../AppShell";
import BottomNav from "@/components/BottomNav";

export default function TimelinePage() {
  return (
    <>
      <TimelineView />
      <BottomNav value="timeline" />
    </>
  );
}
