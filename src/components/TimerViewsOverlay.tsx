"use client";

export type TimerView = "default" | "minimal" | "circle";

const VIEWS: { type: TimerView; label: string; desc: string }[] = [
  { type: "default", label: "Default", desc: "Timer with mode tabs and progress bar" },
  { type: "minimal", label: "Minimal", desc: "Just the timer display and controls" },
  { type: "circle", label: "Circle", desc: "Circular progress ring around the timer" },
];

export default function TimerViewsOverlay({
  onClose,
  current,
  onChange,
}: {
  onClose: () => void;
  current: TimerView;
  onChange: (v: TimerView) => void;
}) {
  return (
    <>
      <button
        type="button"
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", cursor: "default" }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
      />
      <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div onClick={(e) => e.stopPropagation()} style={{ pointerEvents: "auto", width: "100%", maxWidth: 360, background: "rgba(10,10,14,0.96)", backdropFilter: "blur(28px)", WebkitBackdropFilter: "blur(28px)", border: "1px solid rgba(255,255,255,0.10)", borderRadius: 24, padding: "32px 28px 28px" }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-sm font-semibold text-white">Timer Views</h2>
            <button type="button" onClick={onClose} className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition">
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" /></svg>
            </button>
          </div>
          <div className="space-y-2">
            {VIEWS.map(({ type, label, desc }) => (
              <button
                key={type}
                type="button"
                onClick={() => { onChange(type); onClose(); }}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl border transition ${current === type ? "border-green-400/40 bg-green-400/10 text-white" : "border-white/10 bg-white/5 text-white/65 hover:bg-white/10 hover:text-white"}`}
              >
                <div className="text-left">
                  <p className="text-sm font-medium">{label}</p>
                  <p className="text-xs text-white/35">{desc}</p>
                </div>
                {current === type && <span className="text-green-400 text-xs">✓</span>}
              </button>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
