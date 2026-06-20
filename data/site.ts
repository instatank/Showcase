/**
 * site.ts — non-app page content (hero, arc, how-I-build, contact).
 * All PLACEHOLDER for the Phase 1–2 scaffold — edit copy here.
 */

export const site = {
  name: "Ankit Anand",
  // PRD §5.1 — one-line positioning + the hook
  positioning: "PLACEHOLDER — Ex-professional poker player turned AI builder.",
  hook:
    "PLACEHOLDER — No engineering background. Shipped six real AI products in a few months.",
  heroPhoto: {
    src: "/images/ankit.png",
    alt: "PLACEHOLDER — Photo of Ankit Anand",
  },

  // PRD §5.2 + Appendix A — the arc (poker → AI operator). ~2–3 short paragraphs.
  arc: [
    "PLACEHOLDER — I spent years as a professional poker player: a game of incomplete information, risk management, and edge.",
    "PLACEHOLDER — When AI started moving fast, I approached it the same way — study the edge, build real reps, manage the downside. With no engineering background, I used AI tools to design and ship six working products.",
    "PLACEHOLDER — They began as tools I built for myself. They're how I learned the craft, and they're the proof it works. The next chapter is turning that into something bigger.",
  ],

  // PRD §5.5 — how I build (the AI-builder meta-skill)
  howIBuild: {
    intro:
      "PLACEHOLDER — How I actually ship: AI-assisted/vibe-coding kept honest by a written brief and a tight, lean-first scope.",
    points: [
      {
        title: "PLACEHOLDER — AI-assisted workflow",
        body: "PLACEHOLDER — Describe the day-to-day: prompting, iterating, reviewing.",
      },
      {
        title: "PLACEHOLDER — The discipline",
        body: "PLACEHOLDER — PROJECT_BRIEF / CLAUDE.md as the source of truth that keeps the AI on-rails.",
      },
      {
        title: "PLACEHOLDER — The stack",
        body: "PLACEHOLDER — The tools and frameworks reached for by default.",
      },
    ],
  },

  // PRD §10 + Appendix C — contact (low-pressure, one primary action)
  contact: {
    blurb: "PLACEHOLDER — Low-pressure line inviting people to get in touch.",
    email: "placeholder@example.com",
    x: {
      handle: "@placeholder",
      url: "https://x.com/placeholder",
    },
    linkedin: {
      label: "PLACEHOLDER — LinkedIn",
      url: "https://www.linkedin.com/in/placeholder",
    },
    // Optional Cal.com booking link (PRD §10) — leave undefined to hide.
    calcom: undefined as undefined | { label: string; url: string },
  },
};
