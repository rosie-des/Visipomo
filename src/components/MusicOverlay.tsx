"use client";
import { useState, type ChangeEvent } from "react";

type MusicTab = "youtube" | "spotify" | "link";

function extractSpotifyEmbed(url: string): string | null {
  const match = url.match(/open\.spotify\.com\/(track|album|playlist|episode)\/([a-zA-Z0-9]+)/);
  if (!match) return null;
  return `https://open.spotify.com/embed/${match[1]}/${match[2]}?utm_source=generator&theme=0`;
}

interface MusicOverlayProps {
  onClose: () => void;
  audioUrl: string | null;
  audioPlaying: boolean;
  audioVolume: number;
  youtubeAudioId: string | null;
  onSubmitUrl: (url: string) => void;
  onToggleAudio: () => void;
  onRemoveAudio: () => void;
  onRemoveYoutubeAudio: () => void;
  onVolumeChange: (v: number) => void;
  onFileUpload: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function MusicOverlay({
  onClose,
  audioUrl,
  audioPlaying,
  audioVolume,
  youtubeAudioId,
  onSubmitUrl,
  onToggleAudio,
  onRemoveAudio,
  onRemoveYoutubeAudio,
  onVolumeChange,
  onFileUpload,
}: MusicOverlayProps) {
  const [tab, setTab] = useState<MusicTab>("youtube");
  const [urlInput, setUrlInput] = useState("");
  const [spotifyInput, setSpotifyInput] = useState("");
  const [spotifyEmbed, setSpotifyEmbed] = useState<string | null>(null);
  const [spotifyError, setSpotifyError] = useState(false);

  const handleUrlSubmit = () => {
    if (!urlInput.trim()) return;
    onSubmitUrl(urlInput.trim());
    setUrlInput("");
  };

  const handleSpotifyLoad = () => {
    const embed = extractSpotifyEmbed(spotifyInput);
    if (embed) {
      setSpotifyEmbed(embed);
      setSpotifyError(false);
    } else {
      setSpotifyError(true);
    }
  };

  const hasAudio = !!(audioUrl || youtubeAudioId);

  const TABS: { key: MusicTab; label: string }[] = [
    { key: "youtube", label: "YouTube" },
    { key: "spotify", label: "Spotify" },
    { key: "link", label: "Link / File" },
  ];

  return (
    <>
      <button
        type="button"
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", cursor: "default" }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
      />
      <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ pointerEvents: "auto", width: "100%", maxWidth: 440, background: "rgba(10,10,14,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: "32px 28px 28px", maxHeight: "85vh", overflowY: "auto" }}>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white">Music</h2>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex gap-1 rounded-full border border-white/10 bg-black/20 p-1 mb-5">
            {TABS.map(({ key, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                className={`flex-1 rounded-full py-1.5 text-xs font-semibold transition ${tab === key ? "bg-white text-black" : "text-white/45 hover:text-white/70"}`}
              >
                {label}
              </button>
            ))}
          </div>

          {/* YouTube tab */}
          {tab === "youtube" && (
            <div className="space-y-3">
              <p className="text-xs text-white/35">Paste a YouTube URL to play as background audio.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleUrlSubmit(); }}
                  placeholder="https://youtube.com/watch?v=..."
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                />
                <button type="button" onClick={handleUrlSubmit} className="px-4 py-2 text-sm rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition">
                  Add
                </button>
              </div>
              {youtubeAudioId && (
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2.5">
                  <span className="text-xs text-white/50">YouTube audio loaded</span>
                  <button type="button" onClick={onRemoveYoutubeAudio} className="text-xs text-red-400/60 hover:text-red-400 transition">Remove</button>
                </div>
              )}
            </div>
          )}

          {/* Spotify tab */}
          {tab === "spotify" && (
            <div className="space-y-3">
              <p className="text-xs text-white/35">Paste a Spotify track, album, or playlist link.</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={spotifyInput}
                  onChange={(e) => { setSpotifyInput(e.target.value); setSpotifyError(false); }}
                  onKeyDown={(e) => { if (e.key === "Enter") handleSpotifyLoad(); }}
                  placeholder="https://open.spotify.com/track/..."
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                />
                <button type="button" onClick={handleSpotifyLoad} className="px-4 py-2 text-sm rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition">
                  Load
                </button>
              </div>
              {spotifyError && (
                <p className="text-xs text-red-400/70">Couldn't parse that URL. Make sure it's a valid Spotify link.</p>
              )}
              {spotifyEmbed && (
                <div className="rounded-xl overflow-hidden" style={{ border: "1px solid rgba(255,255,255,0.08)" }}>
                  <iframe
                    src={spotifyEmbed}
                    width="100%"
                    height="152"
                    frameBorder="0"
                    allow="autoplay; clipboard-write; encrypted-media; fullscreen; picture-in-picture"
                    loading="lazy"
                    title="Spotify player"
                    style={{ display: "block" }}
                  />
                </div>
              )}
              {!spotifyEmbed && (
                <div className="rounded-xl border border-white/8 bg-white/5 p-4 text-center">
                  <p className="text-xs text-white/25">Paste a Spotify link above to load the player.</p>
                  <p className="text-xs text-white/15 mt-1">Requires a Spotify account to play.</p>
                </div>
              )}
            </div>
          )}

          {/* Link / File tab */}
          {tab === "link" && (
            <div className="space-y-3">
              <p className="text-xs text-white/35">Paste any direct audio URL (MP3, WAV, etc.).</p>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") handleUrlSubmit(); }}
                  placeholder="https://example.com/audio.mp3"
                  className="flex-1 px-3 py-2 text-sm rounded-xl border border-white/10 bg-white/5 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                />
                <button type="button" onClick={handleUrlSubmit} className="px-4 py-2 text-sm rounded-xl bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition">
                  Add
                </button>
              </div>
              <div className="flex items-center gap-3">
                <div className="flex-1 h-px bg-white/10" />
                <span className="text-xs text-white/25">or</span>
                <div className="flex-1 h-px bg-white/10" />
              </div>
              <input type="file" accept="audio/*" id="music-overlay-upload" onChange={onFileUpload} style={{ display: "none" }} />
              <label htmlFor="music-overlay-upload" className="block text-center px-3 py-2.5 border border-white/10 rounded-xl text-sm text-white/50 cursor-pointer hover:bg-white/8 hover:text-white/70 transition">
                Upload Audio File
              </label>
            </div>
          )}

          {/* Current audio controls */}
          {hasAudio && (
            <div className="mt-5 pt-5 border-t border-white/8 space-y-3">
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30">Now Playing</p>
              <div className="flex justify-between items-center mb-1">
                <label className="text-xs text-white/35">Volume</label>
                <span className="text-xs text-white/35">{Math.round(audioVolume * 100)}%</span>
              </div>
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={audioVolume}
                onChange={(e) => onVolumeChange(parseFloat(e.target.value))}
                className="w-full accent-white"
              />
              {audioUrl ? (
                <div className="flex gap-2">
                  <button type="button" onClick={onToggleAudio} className="flex-1 py-2 text-xs rounded-xl bg-white/10 text-white/65 hover:bg-white/15 hover:text-white transition font-medium">
                    {audioPlaying ? "Pause" : "Play"}
                  </button>
                  <button type="button" onClick={onRemoveAudio} className="px-4 py-2 text-xs rounded-xl text-red-400/60 hover:bg-red-400/10 hover:text-red-400 transition">
                    Remove
                  </button>
                </div>
              ) : (
                <div className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2.5">
                  <span className="text-xs text-white/40">YouTube audio is active</span>
                  <button type="button" onClick={onRemoveYoutubeAudio} className="text-xs text-red-400/60 hover:text-red-400 transition">Remove</button>
                </div>
              )}
            </div>
          )}

        </div>
      </div>
    </>
  );
}
