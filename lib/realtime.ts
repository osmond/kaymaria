import { createSupabaseClient } from "./supabase";

export function subscribeToTaskChanges(onChange: () => void) {
  const supabase = createSupabaseClient();
  const channel = supabase
    .channel("tasks-db-changes")
    .on(
      "postgres_changes",
      { event: "*", schema: "public", table: "tasks" },
      () => onChange()
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}
