"use client";

import PlantsView from "./PlantsView";
import BottomNav from "@/components/BottomNav";

export default function PlantsPage() {
  return (
    <>
      <PlantsView />
      <BottomNav value="plants" />
    </>
  );
}
