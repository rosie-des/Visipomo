"use client";
import { useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

export default function BackgroundLayer() {
  const [backgroundType, setBackgroundType] = useState<"video" | "image">("video");
  const [videoId, setVideoId] = useState("jfKfPfyJRdk");
  const [imageUrl, setImageUrl] = useState("");
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const waitIntervalRef = useRef<any>(null);

  useEffect(() => {
    setBackgroundType((localStorage.getItem("backgroundType") as "video" | "image") || "video");
    setVideoId(localStorage.getItem("videoId") || "jfKfPfyJRdk");
    setImageUrl(localStorage.getItem("imageUrl") || "");
  }, []);

  const destroyPlayer = () => {
    // Clear any pending init interval
    if (waitIntervalRef.current) {
      clearInterval(waitIntervalRef.current);
      waitIntervalRef.current = null;
    }
    if (playerRef.current) {
      try { playerRef.current.stopVideo(); } catch (_) {}
      try { playerRef.current.mute(); } catch (_) {}
      try { playerRef.current.destroy(); } catch (_) {}
      playerRef.current = null;
    }
    setPlayerReady(false);
    setIsPlaying(true);
    setIsMuted(true);
  };

  useEffect(() => {
    if (backgroundType !== "video") {
      destroyPlayer();
      return;
    }

    // Always destroy existing player first before creating a new one
    destroyPlayer();

    const createPlayer = () => {
      waitIntervalRef.current = setInterval(() => {
        const div = document.getElementById("yt-background");
        if (!div) return;
        clearInterval(waitIntervalRef.current);
        waitIntervalRef.current = null;

        playerRef.current = new window.YT.Player("yt-background", {
          videoId,
          playerVars: {
            autoplay: 1,
            mute: 1,
            controls: 0,
            showinfo: 0,
            rel: 0,
            loop: 1,
            playlist: videoId,
          },
          events: {
            onReady: (event: any) => {
              playerRef.current = event.target;
              event.target.playVideo();
              setPlayerReady(true);
              setIsPlaying(true);
              setIsMuted(true);
            },
          },
        });
      }, 100);
    };

    if (window.YT && window.YT.Player) {
      createPlayer();
    } else {
      if (!document.querySelector('script[src="https://www.youtube.com/iframe_api"]')) {
        const tag = document.createElement("script");
        tag.src = "https://www.youtube.com/iframe_api";
        document.head.appendChild(tag);
      }
      window.onYouTubeIframeAPIReady = () => createPlayer();
    }

    return () => {
      destroyPlayer();
    };
  }, [videoId, backgroundType]);

  const toggleMute = () => {
    if (!playerRef.current || !playerReady) return;
    try {
      if (isMuted) {
        playerRef.current.unMute();
        playerRef.current.setVolume(100);
        setIsMuted(false);
      } else {
        playerRef.current.mute();
        setIsMuted(true);
      }
    } catch (e) {
      console.error("Mute toggle error:", e);
    }
  };

  const togglePlayPause = () => {
    if (!playerRef.current || !playerReady) return;
    try {
      if (isPlaying) {
        playerRef.current.pauseVideo();
        setIsPlaying(false);
      } else {
        playerRef.current.playVideo();
        setIsPlaying(true);
      }
    } catch (e) {
      console.error("Play/pause error:", e);
    }
  };

  const handleImageUrlChange = (url: string) => {
    const processedUrl = url.replace(/\/(236x|474x|564x)\//g, "/originals/");
    setImageUrl(processedUrl);
    localStorage.setItem("imageUrl", processedUrl);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
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

  return (
    <>
      {backgroundType === "video" && (
        <>
          <div
            id="yt-background"
            style={{
              position: "fixed",
              inset: 0,
              width: "100%",
              height: "100%",
              zIndex: 0,
              pointerEvents: "none",
            }}
          />
          <button
            type="button"
            onClick={toggleMute}
            style={{
              position: "fixed",
              bottom: 80,
              left: 24,
              zIndex: 10,
              background: playerReady ? "rgba(255,255,255,0.85)" : "rgba(200,200,200,0.6)",
              border: "none",
              borderRadius: 999,
              padding: "6px 14px",
              cursor: playerReady ? "pointer" : "not-allowed",
              fontSize: 12,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {!playerReady ? "⏳" : isMuted ? "🔇 Unmute" : "🔊 Mute"}
          </button>
          <button
            type="button"
            onClick={togglePlayPause}
            style={{
              position: "fixed",
              bottom: 80,
              left: 130,
              zIndex: 10,
              background: playerReady ? "rgba(255,255,255,0.85)" : "rgba(200,200,200,0.6)",
              border: "none",
              borderRadius: 999,
              padding: "6px 14px",
              cursor: playerReady ? "pointer" : "not-allowed",
              fontSize: 12,
              fontWeight: 600,
              boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
            }}
          >
            {!playerReady ? "⏳" : isPlaying ? "⏸ Pause" : "▶️ Play"}
          </button>
        </>
      )}

      {backgroundType === "image" && imageUrl && (
        <img
          src={imageUrl}
          alt="Background"
          style={{
            position: "fixed",
            inset: 0,
            width: "100%",
            height: "100%",
            zIndex: 0,
            pointerEvents: "none",
            objectFit: "cover",
          }}
        />
      )}

      <div
        style={{
          position: "fixed",
          inset: 0,
          background: "rgba(0,0,0,0.3)",
          zIndex: 1,
          pointerEvents: "none",
        }}
      />
    </>
  );
}
