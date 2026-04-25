"use client";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";

type JournalEntry = { id: string; content: string; created_at: string };

export default function JournalOverlay({ onClose, userId }: { onClose: () => void; userId: string }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [content, setContent] = useState("");
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const { data } = await supabase
        .from("journal_entries")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false })
        .limit(10);
      setEntries((data as JournalEntry[]) ?? []);
      setLoading(false);
    };
    void load();
  }, [userId]);

  const save = async () => {
    if (!content.trim()) return;
    setSaving(true);
    const { data } = await supabase.from("journal_entries").insert({ user_id: userId, content: content.trim() }).select().single();
    if (data) setEntries((prev) => [data as JournalEntry, ...prev]);
    setContent("");
    setSaving(false);
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
        <div onClick={(e) => e.stopPropagation()} style={{ pointerEvents: "auto", width: "100%", maxWidth: 480, background: "rgba(10,10,14,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: "32px 28px 28px", maxHeight: "85vh", overflowY: "auto" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white">Journal</h2>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Write about your session, thoughts, or goals..."
            rows={5}
            className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none mb-3"
          />
          <button
            type="button"
            onClick={() => void save()}
            disabled={saving || !content.trim()}
            className="w-full py-2.5 rounded-xl text-sm font-semibold text-white mb-6 transition"
            style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", opacity: saving || !content.trim() ? 0.5 : 1 }}
          >
            {saving ? "Saving..." : "Save Entry"}
          </button>
          {loading ? (
            <p className="text-xs text-white/30 text-center">Loading entries...</p>
          ) : entries.length === 0 ? (
            <p className="text-xs text-white/25 text-center">No journal entries yet.</p>
          ) : (
            <div className="space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">Past Entries</p>
              {entries.map((entry) => (
                <div key={entry.id} className="rounded-xl border border-white/8 bg-white/5 p-3">
                  <p className="text-[11px] text-white/30 mb-1.5">{new Date(entry.created_at).toLocaleString()}</p>
                  <p className="text-sm text-white/65 leading-relaxed whitespace-pre-wrap">{entry.content}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
