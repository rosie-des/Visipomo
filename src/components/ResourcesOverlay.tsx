"use client";

const RESOURCES = [
  {
    title: "Motivational Articles",
    items: [
      { label: "Harvard Business Review — Productivity", url: "https://hbr.org/topic/subject/productivity" },
      { label: "Psychology Today — Motivation", url: "https://www.psychologytoday.com/us/basics/motivation" },
      { label: "Inc. — Habits of Successful People", url: "https://www.inc.com/best-industries/habits.html" },
      { label: "Medium — Productivity Tag", url: "https://medium.com/tag/productivity" },
    ],
  },
  {
    title: "Inspirational Success Stories",
    items: [
      { label: "Entrepreneur — Success Stories", url: "https://www.entrepreneur.com/topic/success-stories" },
      { label: "Forbes — Billionaires", url: "https://www.forbes.com/billionaires/" },
      { label: "Success.com — Articles", url: "https://www.success.com/category/articles/" },
      { label: "Business Insider — Success", url: "https://www.businessinsider.com/success" },
    ],
  },
  {
    title: "Wealth Information Sites",
    items: [
      { label: "Investopedia", url: "https://www.investopedia.com" },
      { label: "NerdWallet — Personal Finance", url: "https://www.nerdwallet.com" },
      { label: "The Balance — Money", url: "https://www.thebalancemoney.com" },
      { label: "MindValley — Success & Wealth", url: "https://www.mindvalley.com" },
    ],
  },
  {
    title: "Science Behind the App",
    items: [
      { label: "Pomodoro Technique — Wikipedia", url: "https://en.wikipedia.org/wiki/Pomodoro_Technique" },
      { label: "Atomic Habits — James Clear", url: "https://jamesclear.com/atomic-habits" },
      { label: "Flow State Research — Psychology Today", url: "https://www.psychologytoday.com/us/basics/flow" },
      { label: "Vision Boards & Goal Achievement", url: "https://www.psychologytoday.com/us/blog/the-mindful-self-express/201609/if-you-do-this-one-thing-youre-more-likely-to-succeed" },
    ],
  },
];

interface ResourcesOverlayProps {
  onClose: () => void;
}

export default function ResourcesOverlay({ onClose }: ResourcesOverlayProps) {
  return (
    <>
      <button
        type="button"
        style={{ position: "fixed", inset: 0, zIndex: 50, background: "rgba(0,0,0,0.6)", backdropFilter: "blur(4px)", cursor: "default" }}
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        aria-label="Close"
      />
      <div style={{ position: "fixed", inset: 0, zIndex: 51, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, pointerEvents: "none" }}>
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            pointerEvents: "auto",
            width: "100%",
            maxWidth: 480,
            maxHeight: "80vh",
            overflowY: "auto",
            background: "rgba(10,10,14,0.96)",
            backdropFilter: "blur(28px)",
            WebkitBackdropFilter: "blur(28px)",
            border: "1px solid rgba(255,255,255,0.10)",
            borderRadius: 24,
            padding: "28px 24px 24px",
          }}
        >
          {/* Header */}
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-sm font-semibold text-white">Resources</h2>
            <button
              type="button"
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-full text-white/40 hover:bg-white/10 hover:text-white transition"
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" strokeLinecap="round" />
              </svg>
            </button>
          </div>

          <div className="space-y-5">
            {RESOURCES.map((section) => (
              <div key={section.title}>
                <p className="text-[10px] font-semibold uppercase tracking-widest text-white/30 mb-2">{section.title}</p>
                <ul className="space-y-0.5">
                  {section.items.map((item) => (
                    <li key={item.label}>
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center justify-between w-full px-3 py-2.5 rounded-xl text-sm text-white/65 hover:bg-white/8 hover:text-white transition group"
                      >
                        <span>{item.label}</span>
                        <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0 text-white/20 group-hover:text-white/50 transition" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" strokeLinecap="round" strokeLinejoin="round" />
                          <polyline points="15 3 21 3 21 9" strokeLinecap="round" strokeLinejoin="round" />
                          <line x1="10" y1="14" x2="21" y2="3" strokeLinecap="round" />
                        </svg>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
