"use client";
import { useState } from "react";

const QUOTES = [
  { text: "The secret of getting ahead is getting started.", author: "Mark Twain" },
  { text: "It always seems impossible until it's done.", author: "Nelson Mandela" },
  { text: "Don't watch the clock; do what it does. Keep going.", author: "Sam Levenson" },
  { text: "Success is not final, failure is not fatal.", author: "Winston Churchill" },
  { text: "Believe you can and you're halfway there.", author: "Theodore Roosevelt" },
  { text: "Hard work beats talent when talent doesn't work hard.", author: "Tim Notke" },
  { text: "Success is the sum of small efforts, repeated day in and day out.", author: "Robert Collier" },
  { text: "The only way to do great work is to love what you do.", author: "Steve Jobs" },
  { text: "You don't have to be great to start, but you have to start to be great.", author: "Zig Ziglar" },
  { text: "Motivation is what gets you started. Habit is what keeps you going.", author: "Jim Ryun" },
  { text: "Dream big and dare to fail.", author: "Norman Vaughan" },
  { text: "What you do today can improve all your tomorrows.", author: "Ralph Marston" },
  { text: "Opportunities don't happen. You create them.", author: "Chris Grosser" },
  { text: "Little by little, one travels far.", author: "J.R.R. Tolkien" },
  { text: "Fall seven times, stand up eight.", author: "Japanese Proverb" },
];

export default function QuotesOverlay({ onClose }: { onClose: () => void }) {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * QUOTES.length));
  const quote = QUOTES[index];

  return (
    <>
      <button
        type="button"
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", cursor: "default" }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
      />
      <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ pointerEvents: "auto", width: "100%", maxWidth: 420, background: "rgba(10,10,14,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: "36px 32px 32px" }}>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-sm font-semibold text-white">Motivational Quotes</h2>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="text-center mb-8 px-2">
            <p className="text-xl font-medium text-white leading-relaxed mb-4">"{quote.text}"</p>
            <p className="text-sm text-white/40">— {quote.author}</p>
          </div>
          <div className="flex items-center justify-center gap-4">
            <button
              type="button"
              onClick={() => setIndex((i) => (i - 1 + QUOTES.length) % QUOTES.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/50 hover:bg-white/10 hover:text-white transition"
            >←</button>
            <span className="text-xs text-white/25">{index + 1} / {QUOTES.length}</span>
            <button
              type="button"
              onClick={() => setIndex((i) => (i + 1) % QUOTES.length)}
              className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 text-white/50 hover:bg-white/10 hover:text-white transition"
            >→</button>
          </div>
        </div>
      </div>
    </>
  );
}
