"use client";
import { useRef, useState } from "react";

type SoundType = "white" | "brown" | "rain";

function buildNoiseBuffer(ctx: AudioContext, type: SoundType): AudioBufferSourceNode {
  const bufferSize = ctx.sampleRate * 3;
  const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
  const data = buffer.getChannelData(0);

  if (type === "white") {
    for (let i = 0; i < bufferSize; i++) data[i] = Math.random() * 2 - 1;
  } else if (type === "brown") {
    let last = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      data[i] = (last + 0.02 * w) / 1.02;
      last = data[i];
      data[i] *= 3.5;
    }
  } else {
    let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
    for (let i = 0; i < bufferSize; i++) {
      const w = Math.random() * 2 - 1;
      b0 = 0.99886 * b0 + w * 0.0555179;
      b1 = 0.99332 * b1 + w * 0.0750759;
      b2 = 0.96900 * b2 + w * 0.1538520;
      b3 = 0.86650 * b3 + w * 0.3104856;
      b4 = 0.55000 * b4 + w * 0.5329522;
      b5 = -0.7616 * b5 - w * 0.0168980;
      data[i] = (b0 + b1 + b2 + b3 + b4 + b5 + b6 + w * 0.5362) * 0.11;
      b6 = w * 0.115926;
    }
  }

  const source = ctx.createBufferSource();
  source.buffer = buffer;
  source.loop = true;
  return source;
}

const SOUNDS: { type: SoundType; label: string; desc: string }[] = [
  { type: "white", label: "White Noise", desc: "Crisp, even hiss" },
  { type: "brown", label: "Brown Noise", desc: "Deep, low rumble" },
  { type: "rain", label: "Rain", desc: "Soft rainfall texture" },
];

export default function SoundOverlay({ onClose, volume }: { onClose: () => void; volume: number }) {
  const [playing, setPlaying] = useState<SoundType | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const sourceRef = useRef<AudioBufferSourceNode | null>(null);

  const play = (type: SoundType) => {
    if (sourceRef.current) { sourceRef.current.stop(); sourceRef.current = null; }
    if (playing === type) { setPlaying(null); return; }

    if (!ctxRef.current) ctxRef.current = new AudioContext();
    const ctx = ctxRef.current;
    const source = buildNoiseBuffer(ctx, type);
    const gain = ctx.createGain();
    gain.gain.value = volume * 0.4;
    source.connect(gain);
    gain.connect(ctx.destination);
    source.start();
    sourceRef.current = source;
    setPlaying(type);
  };

  const handleClose = () => {
    if (sourceRef.current) { sourceRef.current.stop(); sourceRef.current = null; }
    if (ctxRef.current) { void ctxRef.current.close(); ctxRef.current = null; }
    setPlaying(null);
    onClose();
  };

  return (
    <>
      <button
        type="button"
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", cursor: "default" }}
        onClick={(e) => { e.stopPropagation(); handleClose(); }}
        aria-label="Close"
      />
      <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ pointerEvents: "auto", width: "100%", maxWidth: 380, background: "rgba(10,10,14,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: "32px 28px 28px" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white">Ambient Sounds</h2>
            <button type="button" onClick={handleClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="space-y-2">
            {SOUNDS.map(({ type, label, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => play(type)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${playing === type ? "border-green-400/40 bg-green-400/10 text-white" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"}`}
              >
                <div className="text-left">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-white/35">{desc}</p>
                </div>
                {playing === type && <span className="text-green-400 text-xs font-medium">Playing</span>}
              </button>
            ))}
          </div>
          <p className="mt-5 text-xs text-white/25 text-center leading-relaxed">
            For lofi, café & more — paste a YouTube URL in the Audio section of Settings
          </p>
        </div>
      </div>
    </>
  );
}
