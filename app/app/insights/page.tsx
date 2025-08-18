"use client";

import InsightsView from "./InsightsView";
import BottomNav from "@/components/BottomNav";

export default function InsightsPage() {
  return (
    <>
      <InsightsView />
      <BottomNav value="insights" />
    </>
  );
}
