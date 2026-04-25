"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "vision-board";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

type BoardItem = { id: string; image_url: string; title: string | null };

export default function VisionBoardPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<BoardItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [adding, setAdding] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setUserId(user.id);
      setCheckingAuth(false);
    };
    void checkAuth();
  }, [router]);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      const { data } = await supabase
        .from("vision_board_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      setItems((data as BoardItem[]) ?? []);
      setLoading(false);
    };
    void load();
  }, [userId]);

  const addByUrl = async () => {
    if (!urlInput.trim() || !userId) return;
    setAdding(true);
    const { data } = await supabase
      .from("vision_board_items")
      .insert({ user_id: userId, image_url: urlInput.trim(), title: titleInput.trim() || null })
      .select()
      .single();
    if (data) setItems((prev) => [data as BoardItem, ...prev]);
    setUrlInput("");
    setTitleInput("");
    setAdding(false);
  };

  const handleFileUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    e.target.value = "";
    setAdding(true);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      console.error("Upload error:", uploadError.message);
      setAdding(false);
      return;
    }

    const publicUrl = `${STORAGE_BASE}${path}`;

    const { data } = await supabase
      .from("vision_board_items")
      .insert({ user_id: userId, image_url: publicUrl, title: titleInput.trim() || null })
      .select()
      .single();

    if (data) setItems((prev) => [data as BoardItem, ...prev]);
    setTitleInput("");
    setAdding(false);
  };

  const deleteItem = async (id: string, imageUrl: string) => {
    if (imageUrl.startsWith(STORAGE_BASE)) {
      const path = imageUrl.slice(STORAGE_BASE.length);
      await supabase.storage.from(BUCKET).remove([path]);
    }
    await supabase.from("vision_board_items").delete().eq("id", id);
    setItems((prev) => prev.filter((item) => item.id !== id));
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-sm text-white/40">Checking authentication...</p>
      </main>
    );
  }

  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-3xl mx-auto px-6 py-12">
        {/* Header */}
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/app"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/50 hover:bg-white/10 hover:text-white transition text-lg"
          >
            ←
          </Link>
          <h1 className="text-2xl font-bold text-white">Vision Board</h1>
        </div>

        {/* Add image card */}
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 20,
            padding: "24px",
            marginBottom: 28,
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-4">Add an Image</p>
          <input
            type="text"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            placeholder="Title (optional)"
            className="w-full px-3 py-2 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 mb-3"
          />
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") void addByUrl(); }}
              placeholder="Paste image URL..."
              className="flex-1 px-3 py-2 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
            />
            <button
              type="button"
              onClick={() => void addByUrl()}
              disabled={adding || !urlInput.trim()}
              className="px-4 py-2 text-sm rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition disabled:opacity-40"
            >
              Add
            </button>
          </div>
          <div className="flex items-center gap-3 mb-1">
            <div className="flex-1 h-px bg-white/10" />
            <span className="text-xs text-white/25">or</span>
            <div className="flex-1 h-px bg-white/10" />
          </div>
          <input type="file" accept="image/*" id="vb-upload" onChange={handleFileUpload} style={{ display: "none" }} />
          <label
            htmlFor="vb-upload"
            className="block text-center mt-3 px-3 py-2.5 border border-white/10 rounded-xl text-sm text-white/50 cursor-pointer hover:bg-white/8 hover:text-white/70 transition"
          >
            {adding ? "Uploading..." : "Upload from Device"}
          </label>
        </div>

        {/* Grid */}
        {loading ? (
          <p className="text-sm text-white/30 text-center py-12">Loading your board...</p>
        ) : items.length === 0 ? (
          <div
            style={{ border: "2px dashed rgba(255,255,255,0.10)", borderRadius: 20, padding: "60px 24px", textAlign: "center" }}
          >
            <p className="text-white/25 text-sm">Your vision board is empty.</p>
            <p className="text-white/15 text-xs mt-1">Add images above to get started.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {items.map((item) => (
              <div
                key={item.id}
                className="relative group overflow-hidden rounded-2xl"
                style={{ aspectRatio: "4/3", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
              >
                <img
                  src={item.image_url}
                  alt={item.title ?? "Vision board image"}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  {item.title && <p className="text-xs font-medium text-white mb-2 truncate">{item.title}</p>}
                  <button
                    type="button"
                    onClick={() => void deleteItem(item.id, item.image_url)}
                    className="self-end flex h-7 w-7 items-center justify-center rounded-full bg-red-500/80 text-white text-xs hover:bg-red-500 transition"
                    aria-label="Delete image"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
