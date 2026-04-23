export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#090910]">

      {/* Ambient background blobs */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute rounded-full"
          style={{
            left: "30%",
            top: "25%",
            width: 480,
            height: 480,
            transform: "translate(-50%, -50%)",
            background: "radial-gradient(circle, rgba(34,197,94,0.12) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
        <div
          className="absolute rounded-full"
          style={{
            right: "20%",
            bottom: "30%",
            width: 360,
            height: 360,
            background: "radial-gradient(circle, rgba(59,130,246,0.08) 0%, transparent 70%)",
            filter: "blur(40px)",
          }}
        />
      </div>

      {/* Subtle grid overlay */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.025]"
        style={{
          backgroundImage: "linear-gradient(rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.5) 1px, transparent 1px)",
          backgroundSize: "64px 64px",
        }}
      />

      {/* Content */}
      <div className="relative z-10 flex flex-col items-center px-6 text-center">

        {/* Badge */}
        <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-green-400" style={{ boxShadow: "0 0 6px rgba(74,222,128,0.8)" }} />
          <span className="text-xs font-medium tracking-widest text-white/40 uppercase">Focus · Vision · Growth</span>
        </div>

        {/* Hero */}
        <h1
          className="font-extrabold text-white mb-5"
          style={{ fontSize: "clamp(56px, 10vw, 88px)", letterSpacing: "-0.035em", lineHeight: 1 }}
        >
          Visi<span style={{ color: "#4ade80" }}>pomo</span>
        </h1>

        <p className="max-w-xs text-base leading-relaxed mb-10" style={{ color: "rgba(255,255,255,0.38)" }}>
          Where daily focus meets<br />long-term success.
        </p>

        {/* CTAs */}
        <div className="flex items-center gap-3">
          <a
            href="/signup"
            className="rounded-full px-8 py-3 text-sm font-semibold text-white transition-all hover:opacity-90 active:scale-95"
            style={{
              background: "linear-gradient(135deg, #22c55e 0%, #16a34a 100%)",
              boxShadow: "0 4px 20px rgba(34,197,94,0.38)",
            }}
          >
            Get Started
          </a>
          <a
            href="/login"
            className="rounded-full border px-8 py-3 text-sm font-semibold transition-all hover:bg-white/8 active:scale-95"
            style={{ borderColor: "rgba(255,255,255,0.15)", color: "rgba(255,255,255,0.65)" }}
          >
            Log In
          </a>
        </div>

        {/* Feature hints */}
        <div className="mt-16 flex items-center gap-6">
          {[
            { icon: "⏱", label: "Focus Timer" },
            { icon: "✦", label: "Habit Tracker" },
            { icon: "◈", label: "Vision Board" },
          ].map(({ icon, label }) => (
            <div key={label} className="flex flex-col items-center gap-2.5">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl text-base"
                style={{ border: "1px solid rgba(255,255,255,0.08)", background: "rgba(255,255,255,0.04)", color: "rgba(255,255,255,0.55)" }}
              >
                {icon}
              </div>
              <span className="text-[11px] font-medium uppercase tracking-widest" style={{ color: "rgba(255,255,255,0.25)" }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom fade */}
      <div
        className="pointer-events-none absolute bottom-0 left-0 right-0 h-32"
        style={{ background: "linear-gradient(to top, rgba(9,9,16,0.8), transparent)" }}
      />
    </main>
  );
}
