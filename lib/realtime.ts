import { createSupabaseClient } from "./supabase";

export function subscribeToTaskChanges(onChange: () => void) {
  try {
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
  } catch {
    return () => {};
  }
}

export function subscribeToPlantChanges(onChange: () => void) {
  try {
    const supabase = createSupabaseClient();
    const channel = supabase
      .channel("plants-db-changes")
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "plants" },
        () => onChange()
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch {
    return () => {};
  }
}
