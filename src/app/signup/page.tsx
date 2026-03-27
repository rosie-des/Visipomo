"use client";

import { FormEvent, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

export default function SignupPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setMessage(null);
    setLoading(true);

    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (signUpError) {
      setError(signUpError.message);
    } else {
      setMessage("Account created. You can now log in.");
    }

    setLoading(false);
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background text-foreground">
      <div className="w-full max-w-sm px-6">
        <h1 className="text-center text-3xl font-semibold tracking-tight">
          Sign up for Visipomo
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
            {loading ? "Creating account..." : "Sign up"}
          </button>
        </form>

        {error && (
          <p className="mt-4 text-sm text-red-600" role="alert">
            {error}
          </p>
        )}

        {message && (
          <p className="mt-4 text-sm text-emerald-600" role="status">
            {message}
          </p>
        )}
      </div>
    </main>
  );
}

