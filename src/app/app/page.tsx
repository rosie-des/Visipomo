"use client";

import { useEffect, useState, useRef, type ChangeEvent } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import BackgroundLayer from "@/components/BackgroundLayer";

const FOCUS_DURATION = 50 * 60;
const SHORT_BREAK_DURATION = 10 * 60;
const LONG_BREAK_DURATION = 20 * 60;

type TimerMode = "focus" | "short" | "long";

type SessionRow = {
  id: string;
  user_id: string;
  mode: string;
  duration_seconds: number;
  completed_at: string;
};

export default function AppPage() {
  const router = useRouter();
  const [checkingAuth, setCheckingAuth] = useState(true);
  const [mode, setMode] = useState<TimerMode>("focus");
  const [secondsRemaining, setSecondsRemaining] = useState(FOCUS_DURATION);
  const [isRunning, setIsRunning] = useState(false);
  const [completedFocusSessions, setCompletedFocusSessions] = useState(0);
  const [isMinimized, setIsMinimized] = useState(false);
  const [showSessionCompleteModal, setShowSessionCompleteModal] = useState(false);
  const [sessionFeedback, setSessionFeedback] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [showSettingsOverlay, setShowSettingsOverlay] = useState(false);
  const [historySessions, setHistorySessions] = useState<SessionRow[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState<string | null>(null);
  const [backgroundType, setBackgroundType] = useState<"video" | "image">("video");
  const [videoId, setVideoId] = useState("jfKfPfyJRdk");
  const [imageUrl, setImageUrl] = useState("");
  const [videoUrl, setVideoUrl] = useState("");
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [audioPlaying, setAudioPlaying] = useState(false);
  const [audioVolume, setAudioVolume] = useState(0.5);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [audioUrlInput, setAudioUrlInput] = useState("");
  const [youtubeAudioId, setYoutubeAudioId] = useState<string | null>(null);
  const [youtubeAudioMode, setYoutubeAudioMode] = useState<"audio" | "video">("audio");
  const [showYoutubePlayer, setShowYoutubePlayer] = useState(false);

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
    const savedBackgroundType = (localStorage.getItem("backgroundType") as "video" | "image") || "video";
    const savedVideoId = localStorage.getItem("videoId") || "jfKfPfyJRdk";
    const savedImageUrl = localStorage.getItem("imageUrl") || "";
    setBackgroundType(savedBackgroundType);
    setVideoId(savedVideoId);
    setImageUrl(savedImageUrl);

    const savedYoutubeAudioId = localStorage.getItem("youtubeAudioId");
    if (savedYoutubeAudioId) {
      setYoutubeAudioId(savedYoutubeAudioId);
    }

    const savedAudio = localStorage.getItem("audioUrl");
    if (savedAudio) {
      setAudioUrl(savedAudio);
      const audio = new Audio(savedAudio);
      audio.loop = true;
      audio.volume = 0.5;
      audioRef.current = audio;
    }
  }, []);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = audioVolume;
    }
  }, [audioVolume]);

  const extractVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    return match ? match[1] : "";
  };

  const handleVideoUrlChange = (url: string) => {
    setVideoUrl(url);
    const extractedId = extractVideoId(url);
    if (extractedId) {
      setVideoId(extractedId);
      localStorage.setItem("videoId", extractedId);
    }
  };

  const handleFileUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      setImageUrl(base64);
      setBackgroundType("image");
      localStorage.setItem("imageUrl", base64);
      localStorage.setItem("backgroundType", "image");
    };
    reader.readAsDataURL(file);
  };

  const handleBackgroundTypeChange = (type: "video" | "image") => {
    setBackgroundType(type);
    localStorage.setItem("backgroundType", type);
  };

  const handleImageUrlChange = (url: string) => {
    setImageUrl(url);
    localStorage.setItem("imageUrl", url);
  };

  const handleAudioUpload = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
      setAudioUrl(base64);
      localStorage.setItem("audioUrl", base64);
      const audio = new Audio(base64);
      audio.loop = true;
      audio.volume = audioVolume;
      audioRef.current = audio;
      setAudioPlaying(false);
    };
    reader.readAsDataURL(file);
  };

  const handleAudioUrlSubmit = (url: string) => {
    if (!url.trim()) return;
    const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/);
    if (ytMatch) {
      const id = ytMatch[1];
      setYoutubeAudioId(id);
      localStorage.setItem("youtubeAudioId", id);
      setShowYoutubePlayer(false);
      setYoutubeAudioMode("audio");
      setAudioUrlInput("");
      return;
    }
    // Non-YouTube URL — try as direct audio
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    const audio = new Audio(url);
    audio.loop = true;
    audio.volume = audioVolume;
    audio.crossOrigin = "anonymous";
    audioRef.current = audio;
    setAudioUrl(url);
    localStorage.setItem("audioUrl", url);
    setAudioUrlInput("");
  };

  const toggleAudio = () => {
    if (!audioRef.current) return;
    if (audioPlaying) {
      audioRef.current.pause();
      setAudioPlaying(false);
    } else {
      void audioRef.current.play();
      setAudioPlaying(true);
    }
  };

  const removeAudio = () => {
    if (audioRef.current) { audioRef.current.pause(); audioRef.current = null; }
    setAudioPlaying(false);
    setAudioUrl(null);
    localStorage.removeItem("audioUrl");
  };

  useEffect(() => {
    if (!userId) return;
    const loadSessions = async () => {
      setHistoryLoading(true);
      setHistoryError(null);
      const { data, error } = await supabase.from("sessions").select("*").eq("user_id", userId).order("completed_at", { ascending: false });
      if (error) { setHistoryError(error.message); setHistoryLoading(false); return; }
      setHistorySessions(data ?? []);
      setHistoryLoading(false);
    };
    void loadSessions();
  }, [userId]);

  useEffect(() => {
    if (!isRunning) return;
    const intervalId = window.setInterval(() => {
      setSecondsRemaining((prevSeconds) => {
        if (prevSeconds <= 1) {
          if (mode === "focus") {
            setCompletedFocusSessions((prev) => { const next = prev + 1; return next > 4 ? 1 : next; });
            void logSession("focus", FOCUS_DURATION);
            setIsRunning(false);
            setShowSessionCompleteModal(true);
            return 0;
          }
          setMode("focus");
          return FOCUS_DURATION;
        }
        return prevSeconds - 1;
      });
    }, 1000);
    return () => { window.clearInterval(intervalId); };
  }, [isRunning, mode]);

  const handleStartPause = () => setIsRunning((prev) => !prev);

  const resetToCurrentMode = () => {
    if (mode === "focus") setSecondsRemaining(FOCUS_DURATION);
    else if (mode === "short") setSecondsRemaining(SHORT_BREAK_DURATION);
    else setSecondsRemaining(LONG_BREAK_DURATION);
  };

  const switchMode = (nextMode: TimerMode) => {
    setMode(nextMode);
    setIsRunning(false);
    if (nextMode === "focus") setSecondsRemaining(FOCUS_DURATION);
    else if (nextMode === "short") setSecondsRemaining(SHORT_BREAK_DURATION);
    else setSecondsRemaining(LONG_BREAK_DURATION);
  };

  const formatTime = (totalSeconds: number) => {
    const minutes = Math.floor(totalSeconds / 60).toString().padStart(2, "0");
    const seconds = (totalSeconds % 60).toString().padStart(2, "0");
    return `${minutes}:${seconds}`;
  };

  const startShortBreakAfterModal = () => {
    setShowSessionCompleteModal(false);
    setSessionFeedback("");
    setMode("short");
    setSecondsRemaining(SHORT_BREAK_DURATION);
    setIsRunning(true);
  };

  const handleModalSave = () => { console.log("Session feedback:", sessionFeedback); startShortBreakAfterModal(); };
  const handleModalSkip = () => startShortBreakAfterModal();

  const logSession = async (sessionMode: "focus" | "short_break" | "long_break", durationSeconds: number) => {
    if (!userId) return;
    await supabase.from("sessions").insert({ user_id: userId, mode: sessionMode, duration_seconds: durationSeconds, completed_at: new Date().toISOString() });
  };

  const getDurationForMode = (currentMode: TimerMode) => {
    if (currentMode === "focus") return FOCUS_DURATION;
    if (currentMode === "short") return SHORT_BREAK_DURATION;
    return LONG_BREAK_DURATION;
  };

  const maxForCurrentMode = getDurationForMode(mode);
  const fillPercent = Math.max(0, Math.min(100, ((maxForCurrentMode - secondsRemaining) / maxForCurrentMode) * 100));

  const handleSliderChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextSeconds = Number(event.target.value);
    if (Number.isNaN(nextSeconds)) return;
    setSecondsRemaining(maxForCurrentMode - Math.min(Math.max(0, nextSeconds), maxForCurrentMode));
  };

  if (checkingAuth) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#9EC79B] text-black">
        <p className="text-sm text-black/70">Checking authentication...</p>
      </main>
    );
  }

  return (
    <>
      <BackgroundLayer />

      {/* Dark overlay */}
      <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.3)", zIndex: 1, pointerEvents: "none" }} />

      {/* All app UI */}
      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Top navigation bar */}
        <header style={{ position: "fixed", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", paddingTop: 32, zIndex: 5 }}>
          <div className="inline-flex items-center gap-1 rounded-full border border-black/40 bg-white/10 px-2 py-1">
            <button type="button" className="px-5 py-2 text-sm font-medium text-white/90">Planning</button>
            <button type="button" className="px-5 py-2 text-sm font-medium text-white/90">Syncing</button>
            <button type="button" className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-black shadow-sm">Timer Views</button>
          </div>
        </header>

        {/* Minimized widget */}
        {isMinimized && (
          <div
            onClick={() => setIsMinimized(false)}
            style={{ position: "fixed", top: 20, right: 20, zIndex: 20, background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)", borderRadius: 999, padding: "8px 20px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 16px rgba(0,0,0,0.2)" }}
          >
            <span style={{ fontSize: 13, fontWeight: 700, color: "white", fontVariantNumeric: "tabular-nums" }}>{formatTime(secondsRemaining)}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleStartPause(); }} style={{ background: "none", border: "none", color: "white", cursor: "pointer", fontSize: 13, padding: 0 }}>
              {isRunning ? "⏸" : "▶️"}
            </button>
            <span style={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>{mode === "focus" ? "Focus" : mode === "short" ? "Short Break" : "Long Break"}</span>
          </div>
        )}

        {/* Full timer card */}
        {!isMinimized && (
          <main className="flex flex-1 items-center justify-center px-4" style={{ paddingTop: 100, paddingBottom: 100 }}>
            <div className="w-full max-w-xl rounded-3xl px-10 py-10 text-center" style={{ position: "relative", background: "rgba(255,255,255,0.15)", backdropFilter: "blur(20px)", WebkitBackdropFilter: "blur(20px)", border: "1px solid rgba(255,255,255,0.25)", boxShadow: "0 8px 32px rgba(0,0,0,0.2)" }}>
              <div className="flex items-center justify-center gap-2">
                <h1 className="text-2xl font-extrabold tracking-[0.35em] text-white">THE GRIND</h1>
                <button type="button" className="flex h-7 w-7 items-center justify-center rounded-full border border-black/20 bg-white text-black" aria-label="Edit timer name">
                  <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3.5 w-3.5">
                    <path d="M3 14.5V17h2.5L14 8.5 11.5 6 3 14.5Zm1.5 1.5v-1.09L11.5 7.4l1.09 1.09L5.59 16H4.5Zm9.71-9.21L12.59 5.66 13.8 4.46a1 1 0 0 1 1.4 0l.34.34a1 1 0 0 1 0 1.41l-1.33 1.33Z" fill="currentColor" />
                  </svg>
                </button>
              </div>
              <button type="button" onClick={() => setIsMinimized(true)} style={{ position: "absolute", top: 12, right: 12, background: "rgba(255,255,255,0.2)", border: "1px solid rgba(255,255,255,0.3)", borderRadius: 999, width: 28, height: 28, cursor: "pointer", fontSize: 14, color: "white", display: "flex", alignItems: "center", justifyContent: "center" }} aria-label="Minimize timer">—</button>

              {/* Mode buttons */}
              <div className="mt-6 flex justify-center gap-3">
                <button type="button" className="rounded-full bg-[#4A90D9] px-5 py-2 text-sm font-semibold text-white shadow-sm" onClick={() => switchMode("focus")}>Focus</button>
                <button type="button" className="rounded-full border border-white/40 bg-white/20 px-5 py-2 text-sm font-semibold text-white" onClick={() => switchMode("short")}>Short Break</button>
                <button type="button" className="rounded-full border border-white/40 bg-white/20 px-5 py-2 text-sm font-semibold text-white" onClick={() => switchMode("long")}>Long Break</button>
              </div>

              {/* Progress dots */}
              <div className="mt-6 flex justify-center gap-3">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className={`flex h-6 w-6 items-center justify-center rounded-full text-xs font-semibold ${completedFocusSessions >= n ? "bg-white text-[#4A90D9]" : "border border-white/70 text-white/80"}`}>
                    {completedFocusSessions >= n ? "✓" : ""}
                  </div>
                ))}
              </div>

              {/* Timer display */}
              <div className="mt-6">
                <span className="tabular-nums text-[96px] font-extrabold leading-none text-white">{formatTime(secondsRemaining)}</span>
              </div>

              {/* Progress slider */}
              <div className="mt-6 w-full">
                <div className="flex h-[53px] w-full items-center rounded-[14px] bg-white/10 px-4 shadow-[0_4px_27px_rgba(0,0,0,0.25)]">
                  <div className="relative h-[10px] w-full">
                    <div className="absolute inset-0 rounded-full bg-[#D9D9D9]" />
                    <div className="absolute left-0 top-0 h-full rounded-full bg-[#4CAF50] pointer-events-none" style={{ width: `${fillPercent}%` }} />
                    <input type="range" min={0} max={maxForCurrentMode} value={maxForCurrentMode - secondsRemaining} onChange={handleSliderChange} className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-rose-400" />
                  </div>
                </div>
              </div>

              {/* Start and reset controls */}
              <div className="mt-8 flex items-center justify-center gap-4">
                <button type="button" className="rounded-full bg-[#4CAF50] px-12 py-3 text-lg font-semibold text-white shadow-sm" onClick={handleStartPause}>{isRunning ? "Pause" : "Start"}</button>
                <button type="button" className="flex h-11 w-11 items-center justify-center rounded-full border border-white/70 text-white" aria-label="Reset timer" onClick={resetToCurrentMode}>
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 3v5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Bottom bar - always fixed, never moves */}
        <footer style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "0 32px 32px 32px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 5 }}>
          <div className="flex items-center gap-3">
            <button type="button" className="flex items-center justify-center rounded-full border border-white/50 bg-white/70 px-4 py-2 text-black" aria-label="Sound controls">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <line x1="2" y1="12" x2="2" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="6" y1="8" x2="6" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="10" y1="5" x2="10" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="14" y1="8" x2="14" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="18" y1="10" x2="18" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="22" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </button>
            <button type="button" onClick={toggleAudio} className="flex items-center justify-center rounded-full border border-white/50 bg-white/70 px-4 py-2 text-black" aria-label="Toggle audio">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>
              </svg>
            </button>
            <button type="button" className="flex items-center justify-center rounded-full border border-white/50 bg-white/70 px-4 py-2 text-black" aria-label="Link session">
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button type="button" className="flex items-center justify-center rounded-full border border-white/50 bg-white/70 px-4 py-2 text-black" aria-label="Settings" onClick={() => setShowSettingsOverlay((open) => !open)}>
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <button type="button" className="rounded-full border border-white/50 bg-white px-6 py-2 text-sm font-semibold text-black shadow-sm">View Board</button>
        </footer>
      </div>

      {/* Settings overlay backdrop */}
      {showSettingsOverlay && (
        <button type="button" style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.5)", cursor: "default" }} onClick={() => setShowSettingsOverlay(false)} aria-label="Close settings overlay" />
      )}

      {/* Settings panel */}
      <div style={{ position: "fixed", inset: "0 auto 0 0", zIndex: 40, display: "flex", alignItems: "stretch", pointerEvents: "none" }}>
        <div style={{ pointerEvents: "auto", width: 320, height: "100%", background: "white", borderRadius: "0 14px 14px 0", boxShadow: "4px 0 27px rgba(0,0,0,0.15)", overflowY: "auto", transform: showSettingsOverlay ? "translateX(0)" : "translateX(-100%)", transition: "transform 300ms ease" }}>
          <div className="flex justify-start p-4">
            <button type="button" className="h-8 w-8 rounded-full border border-black/20 text-sm font-semibold text-black" onClick={() => setShowSettingsOverlay(false)} aria-label="Close settings">✕</button>
          </div>

          <div className="px-6 pb-24">
            {/* Visions */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold text-black">Visions</h3>
              <div className="space-y-2">
                {["Vision Boards", "Image Library", "My Uploads"].map((item) => (
                  <button key={item} type="button" className="block w-full text-left text-sm text-black/80 py-1 px-2 hover:bg-black/5 rounded" onClick={() => console.log(item)}>{item}</button>
                ))}
              </div>
            </div>

            {/* Display */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold text-black">Display</h3>
              <div className="space-y-2">
                {["Timer Views", "Fonts"].map((item) => (
                  <button key={item} type="button" className="block w-full text-left text-sm text-black/80 py-1 px-2 hover:bg-black/5 rounded" onClick={() => console.log(item)}>{item}</button>
                ))}
              </div>
              <div className="mt-4 pt-4 border-t border-gray-200">
                <h4 className="mb-3 text-sm font-semibold text-black">Background</h4>
                <div className="flex gap-2 mb-3">
                  {(["video", "image"] as const).map((type) => (
                    <button key={type} type="button" className={`flex-1 py-2 px-3 text-xs font-medium rounded capitalize ${backgroundType === type ? "bg-[#4CAF50] text-white" : "bg-gray-100 text-black"}`} onClick={() => handleBackgroundTypeChange(type)}>{type}</button>
                  ))}
                </div>
                {backgroundType === "video" ? (
                  <div>
                    <label className="block text-xs text-black/70 mb-1">YouTube URL:</label>
                    <input type="text" value={videoUrl} onChange={(e) => handleVideoUrlChange(e.target.value)} placeholder="Paste YouTube video URL" className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#4CAF50]" />
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-black/70 mb-1">Image URL:</label>
                    <input type="text" value={imageUrl} onChange={(e) => handleImageUrlChange(e.target.value)} placeholder="Enter image URL" className="w-full px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#4CAF50]" />
                    <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} id="settings-image-upload" />
                    <label htmlFor="settings-image-upload" className="block text-center px-2 py-1 mt-2 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50">Upload Image from Device</label>
                  </div>
                )}
              </div>
            </div>

            {/* Success Activities */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold text-black">Success Activities</h3>
              <div className="space-y-2">
                {["Habit Tracker", "Motivational Quotes", "Journals", "To Do Lists"].map((item) => (
                  <button key={item} type="button" className="block w-full text-left text-sm text-black/80 py-1 px-2 hover:bg-black/5 rounded" onClick={() => { if (item === "Habit Tracker") { setShowSettingsOverlay(false); window.location.href = "/habit-tracker"; } else { console.log(item); } }}>{item}</button>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold text-black">Resources</h3>
              <div className="space-y-2">
                {["Motivational Articles", "Inspirational Success Stories", "Wealth Information Sites", "Science Behind the App"].map((item) => (
                  <button key={item} type="button" className="block w-full text-left text-sm text-black/80 py-1 px-2 hover:bg-black/5 rounded" onClick={() => console.log(item)}>{item}</button>
                ))}
              </div>
            </div>

            {/* Audio */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold text-black">Audio</h3>
              <div className="space-y-3">
                {/* File upload */}
                <div>
                  <input type="file" accept="audio/*" onChange={handleAudioUpload} style={{ display: "none" }} id="bg-audio-upload" />
                  <label htmlFor="bg-audio-upload" className="block text-center px-2 py-2 border border-gray-300 rounded text-xs cursor-pointer hover:bg-gray-50">📁 Upload Audio from Device</label>
                </div>

                {/* URL input */}
                <div>
                  <label className="block text-xs text-black/70 mb-1">Or paste a URL (YouTube, etc.):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={audioUrlInput}
                      onChange={(e) => setAudioUrlInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAudioUrlSubmit(audioUrlInput); }}
                      placeholder="Paste YouTube or audio URL"
                      className="flex-1 px-2 py-1 text-xs border border-gray-300 rounded focus:outline-none focus:border-[#4CAF50]"
                    />
                    <button type="button" onClick={() => handleAudioUrlSubmit(audioUrlInput)} className="px-3 py-1 text-xs bg-[#4CAF50] text-white rounded hover:bg-[#43a047]">Add</button>
                  </div>
                </div>

                {/* YouTube options */}
                {youtubeAudioId && (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <p className="text-xs font-semibold text-black mb-2">✅ YouTube video added:</p>
                    <div className="flex gap-2 mb-2">
                      <button type="button" onClick={() => { setYoutubeAudioMode("audio"); setShowYoutubePlayer(true); }} className={`flex-1 py-1 px-2 text-xs rounded border ${youtubeAudioMode === "audio" && showYoutubePlayer ? "bg-[#4CAF50] text-white border-[#4CAF50]" : "bg-white text-black border-gray-300"}`}>🎵 Audio Only</button>
                      <button type="button" onClick={() => { setYoutubeAudioMode("video"); setShowYoutubePlayer(true); }} className={`flex-1 py-1 px-2 text-xs rounded border ${youtubeAudioMode === "video" && showYoutubePlayer ? "bg-[#4CAF50] text-white border-[#4CAF50]" : "bg-white text-black border-gray-300"}`}>🎬 Video + Audio</button>
                    </div>
                    <button type="button" onClick={() => { setYoutubeAudioId(null); setShowYoutubePlayer(false); localStorage.removeItem("youtubeAudioId"); }} className="w-full text-xs text-red-500 hover:text-red-700 py-1">Remove</button>
                  </div>
                )}

                {/* Volume */}
                <div>
                  <label className="block text-xs text-black/70 mb-1">Volume: {Math.round(audioVolume * 100)}%</label>
                  <input type="range" min={0} max={1} step={0.01} value={audioVolume} onChange={(e) => setAudioVolume(parseFloat(e.target.value))} className="w-full" />
                </div>

                {/* Currently playing + controls */}
                {audioUrl && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-black/60 truncate">🎵 Audio loaded</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={toggleAudio} className="px-3 py-1 text-xs rounded border border-gray-300 hover:bg-gray-50">{audioPlaying ? "Pause" : "Play"}</button>
                      <button type="button" onClick={removeAudio} className="px-3 py-1 text-xs rounded border border-red-200 text-red-500 hover:bg-red-50">Remove</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Session History */}
            <div className="mb-6">
              <h3 className="mb-3 text-lg font-bold text-black">Session History</h3>
              {historyLoading ? (
                <p className="text-sm text-black/70">Loading sessions...</p>
              ) : historyError ? (
                <p className="text-sm text-red-700">{historyError}</p>
              ) : historySessions.length === 0 ? (
                <p className="text-sm text-black/70">No sessions yet. Complete a Focus timer to see your history.</p>
              ) : (
                <ul className="space-y-2 max-h-48 overflow-y-auto">
                  {historySessions.map((session) => (
                    <li key={session.id} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2 text-xs">
                      <div>
                        <p className="font-medium text-black">{session.mode === "focus" ? "Focus" : session.mode === "short_break" ? "Short Break" : "Long Break"}</p>
                        <p className="text-[11px] text-black/70">{new Date(session.completed_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-black/60">{Math.round(session.duration_seconds / 60)}m</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

          {/* Share Setup button */}
          <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 bg-white">
            <button type="button" className="w-full rounded-full border border-black/20 py-2 text-sm font-semibold text-black hover:bg-black/5">Share Setup</button>
          </div>
        </div>
      </div>

      {/* Session Complete Modal */}
      {showSessionCompleteModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.5)" }}>
          <div className="w-full max-w-md rounded-3xl bg-white px-10 py-10 text-center mx-4">
            <h2 className="text-2xl font-bold text-black">Session Complete 🎉</h2>
            <p className="mt-2 text-sm text-black/70">How did that session go?</p>
            <textarea value={sessionFeedback} onChange={(e) => setSessionFeedback(e.target.value)} placeholder="How did that session go?" className="mt-4 w-full rounded-xl border border-black/20 p-3 text-sm text-black focus:outline-none focus:border-[#4CAF50] resize-none" rows={4} />
            <div className="mt-6 flex gap-3 justify-center">
              <button type="button" className="rounded-full bg-[#4CAF50] px-8 py-3 text-sm font-semibold text-white" onClick={handleModalSave}>Save</button>
              <button type="button" className="rounded-full border border-black/20 px-8 py-3 text-sm font-semibold text-black" onClick={handleModalSkip}>Skip</button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube Audio Only - hidden iframe */}
      {youtubeAudioId && showYoutubePlayer && youtubeAudioMode === "audio" && (
        <iframe
          style={{ position: "fixed", top: -9999, left: -9999, width: 1, height: 1, zIndex: -1 }}
          src={`https://www.youtube.com/embed/${youtubeAudioId}?autoplay=1&loop=1&playlist=${youtubeAudioId}&controls=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Audio player"
        />
      )}

      {/* YouTube Video + Audio - floating player */}
      {youtubeAudioId && showYoutubePlayer && youtubeAudioMode === "video" && (
        <div style={{ position: "fixed", bottom: 100, right: 24, zIndex: 15, borderRadius: 12, overflow: "hidden", boxShadow: "0 4px 20px rgba(0,0,0,0.3)", width: 280, height: 158 }}>
          <iframe
            style={{ width: "100%", height: "100%", border: "none" }}
            src={`https://www.youtube.com/embed/${youtubeAudioId}?autoplay=1&loop=1&playlist=${youtubeAudioId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Video audio player"
          />
          <button type="button" onClick={() => setShowYoutubePlayer(false)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.6)", border: "none", borderRadius: 999, width: 22, height: 22, color: "white", fontSize: 11, cursor: "pointer" }}>✕</button>
        </div>
      )}
    </>
  );
}
