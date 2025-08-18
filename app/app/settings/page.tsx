"use client";

import { SettingsView } from "../AppShell";
import BottomNav from "@/components/BottomNav";

export default function SettingsPage() {
  return (
    <>
      <SettingsView />
      <BottomNav value="settings" />
    </>
  );
}
