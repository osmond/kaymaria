import { headers } from "next/headers";
import AppShell from "./AppShell";

export default async function Page() {
  const h = await headers();
  const searchParams = new URLSearchParams(h.get("x-url")?.split("?")[1]);
  const tab = searchParams.get("tab") ?? "today";
  return <AppShell initialView={tab as "today"|"timeline"|"plants"|"insights"|"settings"} />;
}
