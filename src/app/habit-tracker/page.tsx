"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";

type Habit = {
  id: string;
  user_id: string;
  name: string;
  created_at: string;
};

type HabitCompletion = {
  id: string;
  habit_id: string;
  user_id: string;
  completed_on: string;
};

export default function HabitTrackerPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completions, setCompletions] = useState<HabitCompletion[]>([]);
  const [loading, setLoading] = useState(true);
  const [newHabitInput, setNewHabitInput] = useState("");
  const [addingHabit, setAddingHabit] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace("/login");
        return;
      }
      setUserId(user.id);
      setCheckingAuth(false);
    };
    void checkAuth();
  }, [router]);

  useEffect(() => {
    if (checkingAuth || !userId) return;

    const fetchData = async () => {
      setLoading(true);
      try {
        const { data: habitsData, error: habitsError } = await supabase
          .from("habits")
          .select("*")
          .eq("user_id", userId);

        if (habitsError) {
          console.error("Habits error details:", habitsError.message, habitsError.code, habitsError.details);
          throw habitsError;
        }

        const { data: completionsData, error: completionsError } = await supabase
          .from("habit_completions")
          .select("*")
          .eq("user_id", userId);

        if (completionsError) {
          console.error("Completions error details:", completionsError.message, completionsError.code, completionsError.details);
          throw completionsError;
        }

        setHabits(habitsData || []);
        setCompletions(completionsData || []);
      } catch (error) {
        console.error("Error fetching habits:", error);
      } finally {
        setLoading(false);
      }
    };

    void fetchData();
  }, [checkingAuth, userId]);

  const today = new Date().toISOString().split("T")[0];

  const isCompletedToday = (habitId: string) => {
    return completions.some(
      (c) => c.habit_id === habitId && c.completed_on === today
    );
  };

  const getStreak = (habitId: string) => {
    let streak = 0;
    let currentDate = new Date(today);

    for (let i = 0; i < 7; i++) {
      const dateStr = currentDate.toISOString().split("T")[0];
      const completed = completions.some(
        (c) => c.habit_id === habitId && c.completed_on === dateStr
      );

      if (completed) {
        streak++;
        currentDate.setDate(currentDate.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  };

  const toggleCompletion = async (habitId: string) => {
    const completed = isCompletedToday(habitId);

    try {
      if (completed) {
        const completion = completions.find(
          (c) => c.habit_id === habitId && c.completed_on === today
        );
        if (completion) {
          const { error } = await supabase
            .from("habit_completions")
            .delete()
            .eq("id", completion.id);
          if (error) throw error;
          setCompletions(completions.filter((c) => c.id !== completion.id));
        }
      } else {
        const { error } = await supabase
          .from("habit_completions")
          .insert([{ habit_id: habitId, user_id: userId, completed_on: today }]);
        if (error) throw error;
        setCompletions([
          ...completions,
          {
            id: "",
            habit_id: habitId,
            user_id: userId || "",
            completed_on: today,
          },
        ]);
      }
    } catch (error) {
      console.error("Error toggling completion:", error);
    }
  };

  const addHabit = async () => {
    if (!newHabitInput.trim() || !userId) return;

    setAddingHabit(true);
    try {
      const { data, error } = await supabase
        .from("habits")
        .insert([{ user_id: userId, name: newHabitInput }]);
      if (error) throw error;
      setNewHabitInput("");
      if (Array.isArray(data) && data.length > 0) {
        setHabits([...habits, (data as Habit[])[0]]);
      }
    } catch (error) {
      console.error("Error adding habit:", error);
    } finally {
      setAddingHabit(false);
    }
  };

  const deleteHabit = async (habitId: string) => {
    try {
      const { error: completionsError } = await supabase
        .from("habit_completions")
        .delete()
        .eq("habit_id", habitId);
      if (completionsError) throw completionsError;

      const { error: habitError } = await supabase
        .from("habits")
        .delete()
        .eq("id", habitId);
      if (habitError) throw habitError;

      setHabits(habits.filter((h) => h.id !== habitId));
      setCompletions(completions.filter((c) => c.habit_id !== habitId));
    } catch (error) {
      console.error("Error deleting habit:", error);
    }
  };

  if (checkingAuth) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/app"
            className="text-2xl text-gray-600 hover:text-gray-900 transition"
          >
            ←
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">Habit Tracker</h1>
        </div>

        {/* Add Habit Card */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex gap-3">
            <input
              type="text"
              value={newHabitInput}
              onChange={(e) => setNewHabitInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === "Enter") {
                  void addHabit();
                }
              }}
              placeholder="Enter a new habit..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-400"
            />
            <button
              onClick={() => void addHabit()}
              disabled={addingHabit || !newHabitInput.trim()}
              className="px-6 py-2 bg-green-500 text-white rounded-lg font-medium hover:bg-green-600 active:bg-green-700 disabled:bg-gray-300 transition"
            >
              Add
            </button>
          </div>
        </div>

        {/* Habits List */}
        {loading ? (
          <div className="text-center py-8">Loading habits...</div>
        ) : habits.length === 0 ? (
          <div className="bg-white rounded-lg shadow-md p-8 text-center">
            <p className="text-gray-500 text-lg">
              No habits yet. Add one above.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {habits.map((habit) => {
              const completed = isCompletedToday(habit.id);
              const streak = getStreak(habit.id);

              return (
                <div
                  key={habit.id}
                  className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between"
                >
                  <div className="flex-1">
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      {habit.name}
                    </h3>
                    <div className="flex gap-6">
                      <div className="flex items-center gap-4">
                        <button
                          onClick={() => void toggleCompletion(habit.id)}
                          className={`text-3xl transition ${
                            completed
                              ? "text-green-500"
                              : "text-gray-300 hover:text-green-400"
                          }`}
                        >
                          ✓
                        </button>
                        <span className="text-sm text-gray-600">Today</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">🔥</span>
                        <span className="text-lg font-semibold text-gray-900">
                          {streak}
                        </span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => void deleteHabit(habit.id)}
                    className="px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg transition font-medium"
                  >
                    Delete
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
