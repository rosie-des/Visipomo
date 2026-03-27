"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type SessionRow = {
  id: string;
  user_id: string;
  mode: string;
  duration_seconds: number;
  completed_at: string;
};

export default function HistoryPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [sessions, setSessions] = useState<SessionRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        router.replace("/login");
        return;
      }

      setCheckingAuth(false);

      const { data, error } = await supabase
        .from("sessions")
        .select("*")
        .eq("user_id", user.id)
        .order("completed_at", { ascending: false });

      if (error) {
        setError(error.message);
        setLoading(false);
        return;
      }

      setSessions(data ?? []);
      setLoading(false);
    };

    void load();
  }, [router]);

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#9EC79B] text-black">
        <p className="text-sm text-black/70">Checking authentication...</p>
      </main>
    );
  }

  return (
    <main className="flex min-h-screen flex-col bg-[#9EC79B] text-black">
      <section className="mx-auto flex w-full max-w-2xl flex-1 flex-col px-6 py-10">
        <h1 className="text-2xl font-semibold tracking-tight">Session History</h1>

        {loading ? (
          <p className="mt-6 text-sm text-black/70">Loading sessions...</p>
        ) : error ? (
          <p className="mt-6 text-sm text-red-700" role="alert">
            {error}
          </p>
        ) : sessions.length === 0 ? (
          <p className="mt-6 text-sm text-black/70">
            No sessions recorded yet. Complete a focus session to see it here.
          </p>
        ) : (
          <ul className="mt-6 space-y-3">
            {sessions.map((session) => (
              <li
                key={session.id}
                className="flex items-center justify-between rounded-2xl bg-[#C5D9C3] px-4 py-3 text-sm"
              >
                <div>
                  <p className="font-medium">
                    {session.mode === "focus"
                      ? "Focus"
                      : session.mode === "short_break"
                      ? "Short Break"
                      : "Long Break"}
                  </p>
                  <p className="mt-1 text-xs text-black/70">
                    {new Date(session.completed_at).toLocaleString()}
                  </p>
                </div>
                <div className="text-right text-sm font-semibold">
                  {Math.round(session.duration_seconds / 60)} min
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </main>
  );
}

