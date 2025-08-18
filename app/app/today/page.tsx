"use client";

import { TodayView } from "../AppShell";
import BottomNav from "@/components/BottomNav";

export default function TodayPage() {
  return (
    <>
      <TodayView />
      <BottomNav value="today" />
    </>
  );
}
