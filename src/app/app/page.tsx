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
      <main className="flex min-h-screen items-center justify-center bg-black">
        <p className="text-sm text-white/40">Checking authentication...</p>
      </main>
    );
  }

  return (
    <>
      <BackgroundLayer />

      <div style={{ position: "relative", zIndex: 2, minHeight: "100vh", display: "flex", flexDirection: "column" }}>

        {/* Top nav */}
        <header style={{ position: "fixed", top: 0, left: 0, right: 0, display: "flex", justifyContent: "center", paddingTop: 28, zIndex: 5 }}>
          <div className="inline-flex items-center gap-0.5 rounded-full border border-white/20 bg-black/20 p-1 backdrop-blur-sm">
            <button type="button" className="rounded-full px-4 py-1.5 text-xs font-medium text-white/50 hover:text-white/80 transition">Planning</button>
            <button type="button" className="rounded-full px-4 py-1.5 text-xs font-medium text-white/50 hover:text-white/80 transition">Syncing</button>
            <button type="button" className="rounded-full bg-white/90 px-4 py-1.5 text-xs font-semibold text-black">Timer Views</button>
          </div>
        </header>

        {/* Minimized widget */}
        {isMinimized && (
          <div
            onClick={() => setIsMinimized(false)}
            style={{ position: "fixed", top: 20, right: 20, zIndex: 20, background: "rgba(255,255,255,0.12)", backdropFilter: "blur(24px)", WebkitBackdropFilter: "blur(24px)", border: "1px solid rgba(255,255,255,0.18)", borderRadius: 999, padding: "8px 18px", cursor: "pointer", display: "flex", alignItems: "center", gap: 10, boxShadow: "0 4px 20px rgba(0,0,0,0.3)" }}
          >
            <span style={{ fontSize: 14, fontWeight: 700, color: "white", fontVariantNumeric: "tabular-nums", letterSpacing: "0.01em" }}>{formatTime(secondsRemaining)}</span>
            <button type="button" onClick={(e) => { e.stopPropagation(); handleStartPause(); }} style={{ background: "none", border: "none", color: "rgba(255,255,255,0.7)", cursor: "pointer", fontSize: 12, padding: 0 }}>
              {isRunning ? "⏸" : "▶"}
            </button>
            <span style={{ fontSize: 10, color: "rgba(255,255,255,0.4)", textTransform: "uppercase", letterSpacing: "0.06em" }}>
              {mode === "focus" ? "Focus" : mode === "short" ? "Short" : "Long"}
            </span>
          </div>
        )}

        {/* Full timer card */}
        {!isMinimized && (
          <main className="flex flex-1 items-center justify-center px-4" style={{ paddingTop: 96, paddingBottom: 96 }}>
            <div
              className="w-full max-w-sm text-center"
              style={{
                position: "relative",
                background: "rgba(255,255,255,0.10)",
                backdropFilter: "blur(32px)",
                WebkitBackdropFilter: "blur(32px)",
                border: "1px solid rgba(255,255,255,0.16)",
                borderRadius: 28,
                padding: "36px 36px 32px",
                boxShadow: "0 8px 40px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.10)",
              }}
            >
              {/* Minimize */}
              <button
                type="button"
                onClick={() => setIsMinimized(true)}
                className="absolute top-3.5 right-3.5 flex h-6 w-6 items-center justify-center rounded-full border border-white/15 text-white/40 hover:bg-white/10 hover:text-white/70 transition text-xs"
                aria-label="Minimize timer"
              >—</button>

              {/* Session label */}
              <div className="flex items-center justify-center gap-2 mb-6">
                <span className="text-[10px] font-semibold tracking-[0.18em] uppercase text-white/40">Session</span>
                <span className="text-sm font-bold tracking-[0.12em] uppercase text-white">THE GRIND</span>
                <button
                  type="button"
                  className="flex h-6 w-6 items-center justify-center rounded-full border border-white/15 text-white/40 hover:bg-white/10 hover:text-white/70 transition"
                  aria-label="Edit timer name"
                >
                  <svg viewBox="0 0 20 20" aria-hidden="true" className="h-3 w-3">
                    <path d="M3 14.5V17h2.5L14 8.5 11.5 6 3 14.5Zm1.5 1.5v-1.09L11.5 7.4l1.09 1.09L5.59 16H4.5Zm9.71-9.21L12.59 5.66 13.8 4.46a1 1 0 0 1 1.4 0l.34.34a1 1 0 0 1 0 1.41l-1.33 1.33Z" fill="currentColor" />
                  </svg>
                </button>
              </div>

              {/* Mode tabs */}
              <div className="flex justify-center mb-6">
                <div className="inline-flex gap-1 rounded-full border border-white/15 bg-black/20 p-1">
                  {([
                    { key: "focus", label: "Focus" },
                    { key: "short", label: "Short Break" },
                    { key: "long", label: "Long Break" },
                  ] as const).map(({ key, label }) => (
                    <button
                      key={key}
                      type="button"
                      onClick={() => switchMode(key)}
                      className={`rounded-full px-4 py-1.5 text-xs font-semibold transition-all ${
                        mode === key
                          ? "bg-white text-black shadow-sm"
                          : "text-white/55 hover:text-white/80"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Session dots */}
              <div className="flex items-center justify-center gap-2 mb-7">
                {[1, 2, 3, 4].map((n) => (
                  <div
                    key={n}
                    className={`h-1.5 w-1.5 rounded-full transition-all ${
                      completedFocusSessions >= n ? "bg-white scale-125" : "bg-white/20"
                    }`}
                  />
                ))}
                <span className="ml-2 text-[11px] font-medium text-white/35">{completedFocusSessions} / 4</span>
              </div>

              {/* Timer display */}
              <div className="mb-5">
                <span
                  className="tabular-nums font-extrabold leading-none text-white"
                  style={{ fontSize: 84, letterSpacing: "-0.03em", textShadow: "0 2px 24px rgba(0,0,0,0.25)" }}
                >
                  {formatTime(secondsRemaining)}
                </span>
              </div>

              {/* Progress bar */}
              <div className="mb-8 px-1">
                <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/15">
                  <div
                    className="absolute left-0 top-0 h-full rounded-full bg-white/80 transition-all duration-500"
                    style={{ width: `${fillPercent}%` }}
                  />
                  <input
                    type="range"
                    min={0}
                    max={maxForCurrentMode}
                    value={maxForCurrentMode - secondsRemaining}
                    onChange={handleSliderChange}
                    className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  />
                </div>
              </div>

              {/* Controls */}
              <div className="flex items-center justify-center gap-3">
                <button
                  type="button"
                  onClick={handleStartPause}
                  className="flex-1 rounded-full py-3 text-sm font-semibold text-white transition-all"
                  style={{
                    background: isRunning
                      ? "rgba(255,255,255,0.15)"
                      : "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
                    border: isRunning ? "1px solid rgba(255,255,255,0.2)" : "none",
                    boxShadow: isRunning ? "none" : "0 4px 18px rgba(34,197,94,0.45)",
                  }}
                >
                  {isRunning ? "Pause" : "Start"}
                </button>
                <button
                  type="button"
                  onClick={resetToCurrentMode}
                  className="flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-white/50 hover:bg-white/10 hover:text-white/80 transition"
                  aria-label="Reset timer"
                >
                  <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                    <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M3 3v5h5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          </main>
        )}

        {/* Bottom bar */}
        <footer style={{ position: "fixed", bottom: 0, left: 0, right: 0, padding: "0 28px 28px", display: "flex", alignItems: "center", justifyContent: "space-between", zIndex: 5 }}>
          <div className="inline-flex items-center gap-0.5 rounded-full border border-white/20 bg-black/20 p-1 backdrop-blur-sm">
            <button
              type="button"
              aria-label="Sound controls"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:bg-white/15 hover:text-white transition"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <line x1="2" y1="12" x2="2" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="6" y1="8" x2="6" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="10" y1="5" x2="10" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="14" y1="8" x2="14" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="18" y1="10" x2="18" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
                <line x1="22" y1="12" x2="22" y2="12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" fill="none" />
              </svg>
            </button>
            <button
              type="button"
              onClick={toggleAudio}
              aria-label="Toggle audio"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:bg-white/15 hover:text-white transition"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 18V5l12-2v13" /><circle cx="6" cy="18" r="3" /><circle cx="18" cy="16" r="3" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Link session"
              className="flex h-9 w-9 items-center justify-center rounded-full text-white/60 hover:bg-white/15 hover:text-white transition"
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
            <button
              type="button"
              aria-label="Settings"
              onClick={() => setShowSettingsOverlay((open) => !open)}
              className={`flex h-9 w-9 items-center justify-center rounded-full transition ${showSettingsOverlay ? "bg-white/20 text-white" : "text-white/60 hover:bg-white/15 hover:text-white"}`}
            >
              <svg viewBox="0 0 24 24" aria-hidden="true" className="h-4 w-4">
                <circle cx="12" cy="12" r="3" fill="none" stroke="currentColor" strokeWidth="2" />
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>
          <button type="button" className="rounded-full bg-white/90 px-6 py-2 text-sm font-semibold text-black hover:bg-white transition shadow-sm">
            View Board
          </button>
        </footer>
      </div>

      {/* Settings backdrop */}
      {showSettingsOverlay && (
        <button
          type="button"
          style={{ position: "fixed", inset: 0, zIndex: 30, background: "rgba(0,0,0,0.45)", cursor: "default", backdropFilter: "blur(2px)" }}
          onClick={() => setShowSettingsOverlay(false)}
          aria-label="Close settings overlay"
        />
      )}

      {/* Settings panel */}
      <div style={{ position: "fixed", inset: "0 auto 0 0", zIndex: 40, display: "flex", alignItems: "stretch", pointerEvents: "none" }}>
        <div
          style={{
            pointerEvents: "auto",
            width: 300,
            height: "100%",
            background: "rgba(10,10,14,0.94)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            borderRight: "1px solid rgba(255,255,255,0.08)",
            overflowY: "auto",
            transform: showSettingsOverlay ? "translateX(0)" : "translateX(-100%)",
            transition: "transform 280ms cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {/* Panel header */}
          <div className="flex items-center justify-between px-6 py-5 border-b border-white/10">
            <span className="text-sm font-semibold text-white">Settings</span>
            <button
              type="button"
              onClick={() => setShowSettingsOverlay(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition"
              aria-label="Close settings"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="px-6 pb-20 pt-1">

            {/* Visions */}
            <div className="py-5 border-b border-white/10">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Visions</p>
              <div className="space-y-0.5">
                {["Vision Boards", "Image Library", "My Uploads"].map((item) => (
                  <button key={item} type="button" className="block w-full text-left text-sm text-white/65 py-1.5 px-2 rounded-lg hover:bg-white/8 hover:text-white transition" onClick={() => console.log(item)}>{item}</button>
                ))}
              </div>
            </div>

            {/* Display */}
            <div className="py-5 border-b border-white/10">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Display</p>
              <div className="space-y-0.5 mb-4">
                {["Timer Views", "Fonts"].map((item) => (
                  <button key={item} type="button" className="block w-full text-left text-sm text-white/65 py-1.5 px-2 rounded-lg hover:bg-white/8 hover:text-white transition">{item}</button>
                ))}
              </div>
              <p className="mb-2 text-xs text-white/40 font-medium">Background</p>
              <div className="flex gap-2 mb-3">
                {(["video", "image"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    className={`flex-1 py-1.5 px-3 text-xs font-medium rounded-lg capitalize transition ${backgroundType === type ? "bg-white text-black" : "bg-white/10 text-white/50 hover:bg-white/15 hover:text-white/80"}`}
                    onClick={() => handleBackgroundTypeChange(type)}
                  >{type}</button>
                ))}
              </div>
              {backgroundType === "video" ? (
                <div>
                  <label className="block text-xs text-white/35 mb-1.5">YouTube URL</label>
                  <input type="text" value={videoUrl} onChange={(e) => handleVideoUrlChange(e.target.value)} placeholder="Paste YouTube URL" className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/8 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20" />
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="block text-xs text-white/35">Image URL</label>
                  <input type="text" value={imageUrl} onChange={(e) => handleImageUrlChange(e.target.value)} placeholder="Enter image URL" className="w-full px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/8 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20" />
                  <input type="file" accept="image/*" onChange={handleFileUpload} style={{ display: "none" }} id="settings-image-upload" />
                  <label htmlFor="settings-image-upload" className="block text-center px-3 py-2 border border-white/10 rounded-lg text-xs text-white/50 cursor-pointer hover:bg-white/8 hover:text-white/70 transition">Upload from Device</label>
                </div>
              )}
            </div>

            {/* Success Activities */}
            <div className="py-5 border-b border-white/10">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Success Activities</p>
              <div className="space-y-0.5">
                {["Habit Tracker", "Motivational Quotes", "Journals", "To Do Lists"].map((item) => (
                  <button
                    key={item}
                    type="button"
                    className="block w-full text-left text-sm text-white/65 py-1.5 px-2 rounded-lg hover:bg-white/8 hover:text-white transition"
                    onClick={() => { if (item === "Habit Tracker") { setShowSettingsOverlay(false); window.location.href = "/habit-tracker"; } else { console.log(item); } }}
                  >{item}</button>
                ))}
              </div>
            </div>

            {/* Resources */}
            <div className="py-5 border-b border-white/10">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Resources</p>
              <div className="space-y-0.5">
                {["Motivational Articles", "Inspirational Success Stories", "Wealth Information Sites", "Science Behind the App"].map((item) => (
                  <button key={item} type="button" className="block w-full text-left text-sm text-white/65 py-1.5 px-2 rounded-lg hover:bg-white/8 hover:text-white transition" onClick={() => console.log(item)}>{item}</button>
                ))}
              </div>
            </div>

            {/* Audio */}
            <div className="py-5 border-b border-white/10">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Audio</p>
              <div className="space-y-3">
                <div>
                  <input type="file" accept="audio/*" onChange={handleAudioUpload} style={{ display: "none" }} id="bg-audio-upload" />
                  <label htmlFor="bg-audio-upload" className="block text-center px-3 py-2 border border-white/10 rounded-lg text-xs text-white/50 cursor-pointer hover:bg-white/8 hover:text-white/70 transition">Upload Audio</label>
                </div>
                <div>
                  <label className="block text-xs text-white/35 mb-1.5">Paste URL (YouTube, etc.)</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={audioUrlInput}
                      onChange={(e) => setAudioUrlInput(e.target.value)}
                      onKeyDown={(e) => { if (e.key === "Enter") handleAudioUrlSubmit(audioUrlInput); }}
                      placeholder="YouTube or audio URL"
                      className="flex-1 px-3 py-2 text-xs rounded-lg border border-white/10 bg-white/8 text-white placeholder:text-white/20 focus:outline-none focus:border-white/20"
                    />
                    <button type="button" onClick={() => handleAudioUrlSubmit(audioUrlInput)} className="px-3 py-2 text-xs rounded-lg bg-white/10 text-white/70 hover:bg-white/15 hover:text-white transition">Add</button>
                  </div>
                </div>
                {youtubeAudioId && (
                  <div className="p-3 rounded-xl border border-white/10 bg-white/5">
                    <p className="text-xs font-medium text-white/60 mb-2">YouTube added</p>
                    <div className="flex gap-2 mb-2">
                      <button type="button" onClick={() => { setYoutubeAudioMode("audio"); setShowYoutubePlayer(true); }} className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition ${youtubeAudioMode === "audio" && showYoutubePlayer ? "bg-white text-black" : "bg-white/10 text-white/55 hover:bg-white/15"}`}>Audio only</button>
                      <button type="button" onClick={() => { setYoutubeAudioMode("video"); setShowYoutubePlayer(true); }} className={`flex-1 py-1.5 px-2 text-xs rounded-lg transition ${youtubeAudioMode === "video" && showYoutubePlayer ? "bg-white text-black" : "bg-white/10 text-white/55 hover:bg-white/15"}`}>Video + Audio</button>
                    </div>
                    <button type="button" onClick={() => { setYoutubeAudioId(null); setShowYoutubePlayer(false); localStorage.removeItem("youtubeAudioId"); }} className="w-full text-xs text-white/30 hover:text-red-400 py-1 transition">Remove</button>
                  </div>
                )}
                <div>
                  <div className="flex justify-between items-center mb-1.5">
                    <label className="text-xs text-white/35">Volume</label>
                    <span className="text-xs text-white/35">{Math.round(audioVolume * 100)}%</span>
                  </div>
                  <input type="range" min={0} max={1} step={0.01} value={audioVolume} onChange={(e) => setAudioVolume(parseFloat(e.target.value))} className="w-full accent-white" />
                </div>
                {audioUrl && (
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-xs text-white/35 truncate">Audio loaded</span>
                    <div className="flex gap-2">
                      <button type="button" onClick={toggleAudio} className="px-3 py-1.5 text-xs rounded-lg bg-white/10 text-white/65 hover:bg-white/15 transition">{audioPlaying ? "Pause" : "Play"}</button>
                      <button type="button" onClick={removeAudio} className="px-3 py-1.5 text-xs rounded-lg text-red-400/60 hover:bg-red-400/10 hover:text-red-400 transition">Remove</button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Session History */}
            <div className="py-5">
              <p className="mb-3 text-[10px] font-semibold uppercase tracking-widest text-white/30">Session History</p>
              {historyLoading ? (
                <p className="text-xs text-white/35">Loading...</p>
              ) : historyError ? (
                <p className="text-xs text-red-400/70">{historyError}</p>
              ) : historySessions.length === 0 ? (
                <p className="text-xs text-white/30 leading-relaxed">No sessions yet. Complete a Focus timer to see your history.</p>
              ) : (
                <ul className="space-y-1.5 max-h-48 overflow-y-auto">
                  {historySessions.map((session) => (
                    <li key={session.id} className="flex items-center justify-between rounded-xl border border-white/8 bg-white/5 px-3 py-2.5">
                      <div>
                        <p className="text-xs font-medium text-white/75">{session.mode === "focus" ? "Focus" : session.mode === "short_break" ? "Short Break" : "Long Break"}</p>
                        <p className="text-[11px] text-white/30 mt-0.5">{new Date(session.completed_at).toLocaleDateString()}</p>
                      </div>
                      <p className="text-xs text-white/35">{Math.round(session.duration_seconds / 60)}m</p>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>

        </div>
      </div>

      {/* Session Complete Modal */}
      {showSessionCompleteModal && (
        <div style={{ position: "fixed", inset: 0, zIndex: 50, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.65)", backdropFilter: "blur(6px)" }}>
          <div
            className="w-full max-w-sm mx-4 text-center"
            style={{
              background: "rgba(10,10,14,0.96)",
              backdropFilter: "blur(28px)",
              WebkitBackdropFilter: "blur(28px)",
              border: "1px solid rgba(255,255,255,0.10)",
              borderRadius: 24,
              padding: "40px 36px 36px",
            }}
          >
            <div className="mb-4 flex justify-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full text-2xl" style={{ background: "rgba(34,197,94,0.15)", border: "1px solid rgba(34,197,94,0.25)" }}>🎉</div>
            </div>
            <h2 className="text-xl font-bold text-white mb-1.5">Session Complete</h2>
            <p className="text-sm text-white/40 mb-6">How did that session go?</p>
            <textarea
              value={sessionFeedback}
              onChange={(e) => setSessionFeedback(e.target.value)}
              placeholder="Add a note..."
              className="w-full rounded-xl border border-white/10 bg-white/5 p-3.5 text-sm text-white placeholder:text-white/20 focus:outline-none focus:border-white/20 resize-none"
              rows={4}
            />
            <div className="mt-5 flex gap-3">
              <button
                type="button"
                onClick={handleModalSkip}
                className="flex-1 rounded-full border border-white/15 py-2.5 text-sm font-medium text-white/50 hover:bg-white/8 hover:text-white/70 transition"
              >Skip</button>
              <button
                type="button"
                onClick={handleModalSave}
                className="flex-1 rounded-full py-2.5 text-sm font-semibold text-white transition"
                style={{ background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)", boxShadow: "0 4px 18px rgba(34,197,94,0.4)" }}
              >Save</button>
            </div>
          </div>
        </div>
      )}

      {/* YouTube audio-only player */}
      {youtubeAudioId && showYoutubePlayer && youtubeAudioMode === "audio" && (
        <iframe
          style={{ position: "fixed", top: -9999, left: -9999, width: 1, height: 1, zIndex: -1 }}
          src={`https://www.youtube.com/embed/${youtubeAudioId}?autoplay=1&loop=1&playlist=${youtubeAudioId}&controls=0`}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title="Audio player"
        />
      )}

      {/* YouTube video + audio player */}
      {youtubeAudioId && showYoutubePlayer && youtubeAudioMode === "video" && (
        <div style={{ position: "fixed", bottom: 100, right: 24, zIndex: 15, borderRadius: 14, overflow: "hidden", boxShadow: "0 8px 32px rgba(0,0,0,0.4)", border: "1px solid rgba(255,255,255,0.1)", width: 280, height: 158 }}>
          <iframe
            style={{ width: "100%", height: "100%", border: "none" }}
            src={`https://www.youtube.com/embed/${youtubeAudioId}?autoplay=1&loop=1&playlist=${youtubeAudioId}`}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            title="Video audio player"
          />
          <button type="button" onClick={() => setShowYoutubePlayer(false)} style={{ position: "absolute", top: 6, right: 6, background: "rgba(0,0,0,0.65)", border: "none", borderRadius: 999, width: 22, height: 22, color: "white", fontSize: 11, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}>✕</button>
        </div>
      )}
    </>
  );
}
