"use client";
import { type ChangeEvent } from "react";

interface BackgroundOverlayProps {
  onClose: () => void;
  backgroundType: "video" | "image";
  videoUrl: string;
  imageUrl: string;
  onBackgroundTypeChange: (type: "video" | "image") => void;
  onVideoUrlChange: (url: string) => void;
  onImageUrlChange: (url: string) => void;
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function BackgroundOverlay({
  onClose,
  backgroundType,
  videoUrl,
  imageUrl,
  onBackgroundTypeChange,
  onVideoUrlChange,
  onImageUrlChange,
  onFileUpload,
}: BackgroundOverlayProps) {
  return (
    <>
      <button
        type="button"
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", cursor: "default" }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
      />
      <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ pointerEvents: "auto", width: "100%", maxWidth: 400, background: "rgba(10,10,14,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: "32px 28px 28px" }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white">Background</h2>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>

          {/* Video / Image toggle */}
          <div className="flex gap-2 mb-5">
            {(["video", "image"] as const).map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => onBackgroundTypeChange(type)}
                className={`flex-1 py-2 px-3 text-sm font-semibold rounded-xl capitalize transition ${backgroundType === type ? "bg-white text-black" : "bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/80"}`}
              >
                {type}
              </button>
            ))}
          </div>

          {/* Video options */}
          {backgroundType === "video" && (
            <div>
              <label className="block text-xs text-white/35 mb-2">YouTube URL</label>
              <input
                type="text"
                value={videoUrl}
                onChange={(e) => onVideoUrlChange(e.target.value)}
                placeholder="https://youtube.com/watch?v=..."
                className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
              />
              <p className="text-xs text-white/25 mt-2">The video plays silently as your background. Use the Music icon to add audio separately.</p>
            </div>
          )}

          {/* Image options */}
          {backgroundType === "image" && (
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-white/35 mb-2">Image URL</label>
                <input
                  type="text"
                  value={imageUrl}
                  onChange={(e) => onImageUrlChange(e.target.value)}
                  placeholder="https://example.com/image.jpg"
                  className="w-full px-3 py-2.5 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                />
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/25">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <input
                type="file"
                accept="image/*"
                id="bg-overlay-upload"
                onChange={onFileUpload}
                style={{ display: "none" }}
              />
              <label
                htmlFor="bg-overlay-upload"
                className="block text-center px-3 py-2.5 border border-white/10 rounded-xl text-sm text-white/50 cursor-pointer hover:bg-white/8 hover:text-white/70 transition"
              >
                Upload from Device
              </label>
              {imageUrl && (
                <div
                  className="w-full rounded-xl overflow-hidden"
                  style={{ height: 100, background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.08)" }}
                >
                  <img
                    src={imageUrl}
                    alt="Background preview"
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
