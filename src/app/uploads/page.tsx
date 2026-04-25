"use client";

import { useEffect, useState, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

const BUCKET = "vision-board";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const STORAGE_BASE = `${SUPABASE_URL}/storage/v1/object/public/${BUCKET}/`;

type UploadItem = {
  id: string;
  image_url: string;
  title: string | null;
  storage_path: string | null;
};

function getStoragePath(url: string): string | null {
  if (url.startsWith(STORAGE_BASE)) return url.slice(STORAGE_BASE.length);
  return null;
}

function isUploadedItem(url: string): boolean {
  return url.startsWith(STORAGE_BASE) || url.startsWith("data:");
}

export default function UploadsPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [items, setItems] = useState<UploadItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
      const { data, error: loadError } = await supabase
        .from("vision_board_items")
        .select("id, image_url, title")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });
      if (loadError) { setError(loadError.message); setLoading(false); return; }
      const uploads = (data ?? [])
        .filter((row: { image_url: string }) => isUploadedItem(row.image_url))
        .map((row: { id: string; image_url: string; title: string | null }) => ({
          ...row,
          storage_path: getStoragePath(row.image_url),
        }));
      setItems(uploads);
      setLoading(false);
    };
    void load();
  }, [userId]);

  const handleUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !userId) return;
    e.target.value = "";
    setUploading(true);
    setError(null);

    const ext = file.name.split(".").pop() ?? "jpg";
    const path = `${userId}/${Date.now()}.${ext}`;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(path, file, { contentType: file.type, upsert: false });

    if (uploadError) {
      setError(uploadError.message);
      setUploading(false);
      return;
    }

    const publicUrl = `${STORAGE_BASE}${path}`;

    const { data, error: insertError } = await supabase
      .from("vision_board_items")
      .insert({ user_id: userId, image_url: publicUrl, title: null })
      .select("id, image_url, title")
      .single();

    if (insertError) {
      setError(insertError.message);
    } else if (data) {
      const row = data as { id: string; image_url: string; title: string | null };
      setItems((prev) => [{ ...row, storage_path: path }, ...prev]);
    }
    setUploading(false);
  };

  const deleteItem = async (item: UploadItem) => {
    if (item.storage_path) {
      await supabase.storage.from(BUCKET).remove([item.storage_path]);
    }
    await supabase.from("vision_board_items").delete().eq("id", item.id);
    setItems((prev) => prev.filter((i) => i.id !== item.id));
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
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/app"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/50 hover:bg-white/10 hover:text-white transition text-lg"
          >
            ←
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">My Uploads</h1>
            <p className="text-xs text-white/35 mt-0.5">Images you've uploaded to your vision board</p>
          </div>
        </div>

        {/* Upload card */}
        <div
          style={{
            background: "rgba(255,255,255,0.06)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 20,
            padding: "20px 24px",
            marginBottom: 28,
          }}
        >
          <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-3">Upload Image</p>
          <input type="file" accept="image/*" id="uploads-file" onChange={handleUpload} style={{ display: "none" }} />
          <label
            htmlFor="uploads-file"
            className="block text-center px-3 py-2.5 border border-white/10 rounded-xl text-sm text-white/50 cursor-pointer hover:bg-white/8 hover:text-white/70 transition"
          >
            {uploading ? "Uploading..." : "Choose Image from Device"}
          </label>
          {error && <p className="mt-2 text-xs text-red-400">{error}</p>}
        </div>

        {/* Grid */}
        {loading ? (
          <p className="text-sm text-white/30 text-center py-12">Loading uploads...</p>
        ) : items.length === 0 ? (
          <div style={{ border: "2px dashed rgba(255,255,255,0.10)", borderRadius: 20, padding: "60px 24px", textAlign: "center" }}>
            <p className="text-white/25 text-sm">No uploads yet.</p>
            <p className="text-white/15 text-xs mt-1">Upload an image above to get started.</p>
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
                  alt={item.title ?? "Uploaded image"}
                  className="w-full h-full object-cover"
                  onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                  {item.title && <p className="text-xs font-medium text-white mb-2 truncate">{item.title}</p>}
                  <button
                    type="button"
                    onClick={() => void deleteItem(item)}
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
