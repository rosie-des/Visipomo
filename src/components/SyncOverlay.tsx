"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Habit = { id: string; name: string };
type Completion = { habit_id: string; completed_on: string };

export default function SyncOverlay({ onClose, userId }: { onClose: () => void; userId: string }) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setLoading(true);
    const [{ data: h }, { data: c }] = await Promise.all([
      supabase.from("habits").select("id,name").eq("user_id", userId),
      supabase.from("habit_completions").select("habit_id,completed_on").eq("user_id", userId),
    ]);
    setHabits((h as Habit[]) ?? []);
    setCompletions((c as Completion[]) ?? []);
    setLoading(false);
  };

  useEffect(() => { void load(); }, [userId]);

  const today = new Date().toISOString().split("T")[0];
  const completedToday = completions.filter((c) => c.completed_on === today).length;

  const getStreak = (habitId: string) => {
    let streak = 0;
    const d = new Date(today);
    for (let i = 0; i < 7; i++) {
      const ds = d.toISOString().split("T")[0];
      if (completions.some((c) => c.habit_id === habitId && c.completed_on === ds)) {
        streak++;
        d.setDate(d.getDate() - 1);
      } else break;
    }
    return streak;
  };

  return (
    <>
      <button
        type="button"
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", cursor: "default" }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
      />
      <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ pointerEvents: "auto", width: "100%", maxWidth: 400, background: "rgba(10,10,14,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: "32px 28px 28px", maxHeight: "80vh", overflowY: "auto" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white">Habits & Goals Sync</h2>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
          {loading ? (
            <p className="text-xs text-white/30 text-center py-4">Loading...</p>
          ) : (
            <>
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-2xl font-bold text-white">{habits.length}</p>
                  <p className="text-xs text-white/35 mt-0.5">Total Habits</p>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-3 text-center">
                  <p className="text-2xl font-bold text-green-400">{completedToday}</p>
                  <p className="text-xs text-white/35 mt-0.5">Done Today</p>
                </div>
              </div>
              {habits.length > 0 ? (
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-3">Habit Streaks</p>
                  <ul className="space-y-1.5">
                    {habits.map((h) => {
                      const streak = getStreak(h.id);
                      const doneToday = completions.some((c) => c.habit_id === h.id && c.completed_on === today);
                      return (
                        <li key={h.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <span className={`h-2 w-2 rounded-full shrink-0 ${doneToday ? "bg-green-400" : "bg-white/15"}`} />
                            <span className="text-sm text-white/70">{h.name}</span>
                          </div>
                          <span className="text-xs text-white/35 shrink-0">🔥 {streak}</span>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ) : (
                <p className="text-xs text-white/25 text-center py-4">No habits tracked yet. Add some in Habit Tracker.</p>
              )}
              <button
                type="button"
                onClick={() => void load()}
                className="w-full mt-4 py-2 rounded-xl border border-white/10 text-xs text-white/45 hover:bg-white/8 hover:text-white/70 transition"
              >
                Refresh
              </button>
            </>
          )}
        </div>
      </div>
    </>
  );
}
