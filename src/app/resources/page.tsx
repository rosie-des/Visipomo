"use client";
import Link from "next/link";

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

export default function ResourcesPage() {
  return (
    <div className="min-h-screen bg-black text-white">
      <div className="max-w-2xl mx-auto px-6 py-12">
        <div className="flex items-center gap-4 mb-10">
          <Link
            href="/app"
            className="flex h-9 w-9 items-center justify-center rounded-full border border-white/15 text-white/50 hover:bg-white/10 hover:text-white transition text-lg"
          >
            ←
          </Link>
          <h1 className="text-2xl font-bold text-white">Resources</h1>
        </div>
        <div className="space-y-6">
          {RESOURCES.map((section) => (
            <div
              key={section.title}
              style={{
                background: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.10)",
                borderRadius: 20,
                padding: "24px 24px 20px",
              }}
            >
              <p className="text-[10px] font-semibold uppercase tracking-widest text-white/35 mb-4">{section.title}</p>
              <ul className="space-y-1.5">
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
  );
}
