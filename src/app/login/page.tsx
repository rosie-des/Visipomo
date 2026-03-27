"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setLoading(true);

    const { error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      setError(signInError.message);
      setLoading(false);
    } else {
      router.replace("/app");
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-center text-3xl font-semibold tracking-tight">
          Log in to Visipomo
        </h1>

        <form onSubmit={handleSubmit} className="mt-8 space-y-4">
          <div className="space-y-1">
            <label htmlFor="email" className="block text-sm font-medium">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
            />
          </div>

          <div className="space-y-1">
            <label htmlFor="password" className="block text-sm font-medium">
              Password
            </label>
            <input
              id="password"
              type="password"
              className="w-full rounded-md border border-foreground/20 bg-background px-3 py-2 text-sm outline-none focus:border-foreground"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="mt-2 w-full rounded-md bg-foreground px-3 py-2 text-sm font-medium text-background disabled:opacity-70"
          >
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}
      </div>
    </main>
  );
}

