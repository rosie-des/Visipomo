"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type Todo = { id: string; text: string; completed: boolean };

export default function TodoOverlay({ onClose, userId }: { onClose: () => void; userId: string }) {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase.from("todos").select("*").eq("user_id", userId).order("created_at", { ascending: true });
      setTodos((data as Todo[]) ?? []);
      setLoading(false);
    };
    void load();
  }, [userId]);

  const addTodo = async () => {
    if (!input.trim()) return;
    const { data } = await supabase.from("todos").insert({ user_id: userId, text: input.trim() }).select().single();
    if (data) setTodos((prev) => [...prev, data as Todo]);
    setInput("");
  };

  const toggleTodo = async (id: string, completed: boolean) => {
    await supabase.from("todos").update({ completed: !completed }).eq("id", id);
    setTodos((prev) => prev.map((t) => (t.id === id ? { ...t, completed: !completed } : t)));
  };

  const deleteTodo = async (id: string) => {
    await supabase.from("todos").delete().eq("id", id);
    setTodos((prev) => prev.filter((t) => t.id !== id));
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
        <div onClick={(e) => e.stopPropagation()} style={{ pointerEvents: "auto", width: "100%", maxWidth: 440, background: "rgba(10,10,14,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: "32px 28px 28px", maxHeight: "80vh", overflowY: "auto" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white">To-Do List</h2>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="flex gap-2 mb-5">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void addTodo(); }}
              placeholder="Add a task..."
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-white/10 bg-white/8 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
            />
            <button type="button" onClick={() => void addTodo()} className="px-4 py-2 text-sm rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition">Add</button>
          </div>
          {loading ? (
            <p className="text-xs text-white/30 text-center py-4">Loading...</p>
          ) : todos.length === 0 ? (
            <p className="text-xs text-white/25 text-center py-6">No tasks yet. Add one above.</p>
          ) : (
            <ul className="space-y-2">
              {todos.map((todo) => (
                <li key={todo.id} className="flex items-center gap-3 rounded-xl border border-white/8 bg-white/5 px-3 py-2.5">
                  <button
                    type="button"
                    onClick={() => void toggleTodo(todo.id, todo.completed)}
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full border transition ${todo.completed ? "border-green-400 bg-green-400/20 text-green-400" : "border-white/20 text-transparent"}`}
                  >
                    {todo.completed && (
                      <svg viewBox="0 0 24 24" className="h-3 w-3" fill="none" stroke="currentColor" strokeWidth="3">
                        <path d="M20 6L9 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </button>
                  <span className={`flex-1 text-sm ${todo.completed ? "text-white/30 line-through" : "text-white/80"}`}>{todo.text}</span>
                  <button type="button" onClick={() => void deleteTodo(todo.id)} className="text-white/20 hover:text-red-400 transition text-xs">✕</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
