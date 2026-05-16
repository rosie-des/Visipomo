"use client";
import { useEffect, useState, useRef } from "react";

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface BackgroundLayerProps {
  backgroundType: "video" | "image";
  videoId: string;
  imageUrl: string;
}

export default function BackgroundLayer({ backgroundType, videoId, imageUrl }: BackgroundLayerProps) {
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [playerReady, setPlayerReady] = useState(false);
  const playerRef = useRef<any>(null);
  const waitIntervalRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const destroyPlayer = () => {
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
    if (containerRef.current) {
      while (containerRef.current.firstChild) {
        containerRef.current.removeChild(containerRef.current.firstChild);
      }
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

    destroyPlayer();

    const createPlayer = () => {
      waitIntervalRef.current = setInterval(() => {
        if (!containerRef.current) return;
        clearInterval(waitIntervalRef.current);
        waitIntervalRef.current = null;

        const target = document.createElement("div");
        target.style.width = "100%";
        target.style.height = "100%";
        containerRef.current.appendChild(target);

        playerRef.current = new window.YT.Player(target, {
          width: "100%",
          height: "100%",
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

  return (
    <>
      <div
        ref={containerRef}
        style={{
          position: "fixed",
          inset: 0,
          width: "100%",
          height: "100%",
          zIndex: 0,
          pointerEvents: "none",
          display: backgroundType === "video" ? "block" : "none",
        }}
      />

      {backgroundType === "video" && (
        <>
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
