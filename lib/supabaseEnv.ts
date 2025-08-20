export function ensureSupabaseEnv() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !anonKey) {
    console.warn("Missing Supabase environment variables, using placeholders");
    return { url: "http://localhost", anonKey: "anon" };
  }
  return { url, anonKey };
}
