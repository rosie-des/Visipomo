"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { supabase } from "@/lib/supabaseClient";

type LibraryImage = {
  id: string;
  url: string;
  title: string;
  category: string;
};

const LIBRARY: LibraryImage[] = [
  // Success & Achievement
  { id: "l1", url: "https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?w=600&q=80&auto=format&fit=crop", title: "Plan Your Success", category: "Success" },
  { id: "l2", url: "https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=600&q=80&auto=format&fit=crop", title: "Deep Work", category: "Success" },
  { id: "l3", url: "https://images.unsplash.com/photo-1484480974693-6ca0a78fb36b?w=600&q=80&auto=format&fit=crop", title: "Set Your Goals", category: "Success" },
  { id: "l4", url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=600&q=80&auto=format&fit=crop", title: "Confidence", category: "Mindset" },
  // Nature & Serenity
  { id: "l5", url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80&auto=format&fit=crop", title: "Summit", category: "Nature" },
  { id: "l6", url: "https://images.unsplash.com/photo-1448375240519-ca6649f29bf2?w=600&q=80&auto=format&fit=crop", title: "Forest Path", category: "Nature" },
  { id: "l7", url: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80&auto=format&fit=crop", title: "Ocean Horizon", category: "Nature" },
  { id: "l8", url: "https://images.unsplash.com/photo-1501854140801-50d01698950b?w=600&q=80&auto=format&fit=crop", title: "New Dawn", category: "Nature" },
  // Ambition & City
  { id: "l9", url: "https://images.unsplash.com/photo-1477959858617-67f85cf4f1df?w=600&q=80&auto=format&fit=crop", title: "City of Dreams", category: "Ambition" },
  { id: "l10", url: "https://images.unsplash.com/photo-1486325212027-8081e485255e?w=600&q=80&auto=format&fit=crop", title: "Skyline", category: "Ambition" },
  { id: "l11", url: "https://images.unsplash.com/photo-1444723121867-7a241cacace9?w=600&q=80&auto=format&fit=crop", title: "Urban Drive", category: "Ambition" },
  { id: "l12", url: "https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?w=600&q=80&auto=format&fit=crop", title: "First Class", category: "Ambition" },
  // Wealth & Luxury
  { id: "l13", url: "https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=600&q=80&auto=format&fit=crop", title: "Dream Home", category: "Wealth" },
  { id: "l14", url: "https://images.unsplash.com/photo-1553729459-efe14ef6055d?w=600&q=80&auto=format&fit=crop", title: "Financial Freedom", category: "Wealth" },
  { id: "l15", url: "https://images.unsplash.com/photo-1544636331-e26879cd4d9b?w=600&q=80&auto=format&fit=crop", title: "Luxury Drive", category: "Wealth" },
  { id: "l16", url: "https://images.unsplash.com/photo-1540339832862-474599807836?w=600&q=80&auto=format&fit=crop", title: "Take Off", category: "Wealth" },
  // Health & Fitness
  { id: "l17", url: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=600&q=80&auto=format&fit=crop", title: "Stronger Every Day", category: "Health" },
  { id: "l18", url: "https://images.unsplash.com/photo-1476480862126-209bfaa8edc8?w=600&q=80&auto=format&fit=crop", title: "Run Further", category: "Health" },
  // Mindset
  { id: "l19", url: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=600&q=80&auto=format&fit=crop", title: "Inner Peace", category: "Mindset" },
  { id: "l20", url: "https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07?w=600&q=80&auto=format&fit=crop", title: "Clear Mind", category: "Mindset" },
];

const CATEGORIES = ["All", "Success", "Mindset", "Nature", "Ambition", "Wealth", "Health"];

export default function ImageLibraryPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("All");
  const [adding, setAdding] = useState<string | null>(null);
  const [added, setAdded] = useState<Set<string>>(new Set());

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { router.replace("/login"); return; }
      setUserId(user.id);
      setCheckingAuth(false);
    };
    void checkAuth();
  }, [router]);

  const addToBoard = async (img: LibraryImage) => {
    if (!userId || adding) return;
    setAdding(img.id);
    const { error } = await supabase
      .from("vision_board_items")
      .insert({ user_id: userId, image_url: img.url, title: img.title });
    if (!error) {
      setAdded((prev) => new Set(prev).add(img.id));
    }
    setAdding(null);
  };

  const filtered = activeCategory === "All" ? LIBRARY : LIBRARY.filter((img) => img.category === activeCategory);

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
            <h1 className="text-2xl font-bold text-white">Image Library</h1>
            <p className="text-xs text-white/35 mt-0.5">Tap any image to add it to your vision board</p>
          </div>
        </div>

        {/* Category filter */}
        <div className="flex gap-2 flex-wrap mb-8">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition ${
                activeCategory === cat
                  ? "bg-white text-black"
                  : "border border-white/15 text-white/50 hover:bg-white/8 hover:text-white/80"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Grid */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
          {filtered.map((img) => (
            <div
              key={img.id}
              className="relative group overflow-hidden rounded-2xl"
              style={{ aspectRatio: "4/3", background: "rgba(255,255,255,0.05)", border: "1px solid rgba(255,255,255,0.08)" }}
            >
              <img
                src={img.url}
                alt={img.title}
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.opacity = "0.2"; }}
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-end p-3">
                <p className="text-xs font-semibold text-white mb-2 truncate">{img.title}</p>
                <button
                  type="button"
                  onClick={() => void addToBoard(img)}
                  disabled={adding === img.id || added.has(img.id)}
                  className="w-full py-1.5 rounded-xl text-xs font-semibold transition"
                  style={{
                    background: added.has(img.id)
                      ? "rgba(34,197,94,0.3)"
                      : "rgba(255,255,255,0.9)",
                    color: added.has(img.id) ? "rgba(34,197,94,0.9)" : "black",
                  }}
                >
                  {adding === img.id ? "Adding..." : added.has(img.id) ? "Added ✓" : "Add to Board"}
                </button>
              </div>
              {/* Category badge */}
              <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full text-[10px] font-semibold text-white/70 bg-black/50 backdrop-blur-sm">
                {img.category}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
