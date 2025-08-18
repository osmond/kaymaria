import { headers } from "next/headers";
import AppShell from "./AppShell";

export default function Page() {
  const url = headers().get("x-url");
  const searchParams = new URLSearchParams(url?.split("?")[1] || "");
  const tab = searchParams.get("tab") ?? "today";
  return <AppShell initialView={tab as "today" | "timeline" | "plants" | "insights" | "settings"} />;
}
