"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function signIn(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
    } else {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await fetch("/api/sync", {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
      }
      router.push("/app");
    }
  }

  async function signUp() {
    setError(null);
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) setError(error.message);
    else router.push("/app");
  }

  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <form
        onSubmit={signIn}
        className="w-full max-w-xs space-y-4"
      >
        <h1 className="text-xl font-medium text-center">Sign In</h1>
        <input
          type="email"
          className="w-full border rounded px-3 py-2"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <input
          type="password"
          className="w-full border rounded px-3 py-2"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-sm text-red-600">{error}</p>}
        <button
          type="submit"
          className="w-full bg-neutral-900 text-white py-2 rounded"
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={signUp}
          className="w-full border py-2 rounded"
        >
          Sign Up
        </button>
      </form>
    </main>
  );
}

