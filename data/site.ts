/**
 * site.ts — non-app page content (hero, stats, journey, how-I-build, now,
 * beyond, contact). All PLACEHOLDER copy — edit here; the layout is driven
 * entirely by this file.
 */

export const site = {
  name: "Ankit Anand",

  // Hero — one-line positioning + the hook (a concrete claim, not a job title)
  positioning: "PLACEHOLDER — Ex-professional poker player turned AI builder.",
  hook:
    "PLACEHOLDER — No engineering background. Shipped six real AI products in a few months.",
  heroPhoto: {
    src: "/images/ankit.png",
    alt: "PLACEHOLDER — Photo of Ankit Anand",
  },

  // Hero "operator card" — quick mono facts next to the photo
  operator: {
    status: "PLACEHOLDER — Building in public",
    location: "PLACEHOLDER — City, Country",
    origin: "PLACEHOLDER — Professional poker",
    focus: "PLACEHOLDER — Shipping AI products",
  },

  // Proof-of-work strip — small, honest numbers shown right under the fold
  stats: [
    { value: "06", label: "PLACEHOLDER — apps shipped" },
    { value: "00", label: "PLACEHOLDER — months from zero" },
    { value: "00", label: "PLACEHOLDER — daily drivers" },
    { value: "∞", label: "PLACEHOLDER — reps & counting" },
  ],

  // The journey — a ship-log timeline (poker → AI operator → next chapter).
  // Each entry: when, what happened, and the one thing it taught.
  journeyIntro:
    "PLACEHOLDER — The short version: a decade of reading incomplete information at the poker table, pointed at building with AI.",
  journey: [
    {
      period: "PLACEHOLDER — 20XX–20XX",
      title: "PLACEHOLDER — The poker years",
      body:
        "PLACEHOLDER — Professional poker: incomplete information, risk management, emotional control, edge.",
      learned: "PLACEHOLDER — Think in probabilities, not certainties.",
    },
    {
      period: "PLACEHOLDER — 20XX",
      title: "PLACEHOLDER — The pivot",
      body:
        "PLACEHOLDER — AI started moving fast. Approached it like a new game: study the edge, build real reps, manage the downside.",
      learned: "PLACEHOLDER — New games reward early, deliberate reps.",
    },
    {
      period: "PLACEHOLDER — 20XX",
      title: "PLACEHOLDER — First build",
      body:
        "PLACEHOLDER — With no engineering background, used AI tools to design and ship the first working product.",
      learned: "PLACEHOLDER — Shipping beats studying.",
    },
    {
      period: "PLACEHOLDER — Now",
      title: "PLACEHOLDER — Six apps and counting",
      body:
        "PLACEHOLDER — Six working products, each built for a real personal itch. The proof the process works — and the next chapter is turning it into something bigger.",
      learned: "PLACEHOLDER — The meta-skill compounds.",
    },
  ],

  // How I build — the AI-builder meta-skill, as three terminal-style steps
  howIBuild: {
    intro:
      "PLACEHOLDER — How I actually ship: AI-assisted building kept honest by a written brief and a tight, lean-first scope.",
    points: [
      {
        command: "PLACEHOLDER — describe the itch",
        title: "PLACEHOLDER — AI-assisted workflow",
        body: "PLACEHOLDER — Describe the day-to-day: prompting, iterating, reviewing.",
      },
      {
        command: "PLACEHOLDER — write the brief",
        title: "PLACEHOLDER — The discipline",
        body: "PLACEHOLDER — PROJECT_BRIEF / CLAUDE.md as the source of truth that keeps the AI on-rails.",
      },
      {
        command: "PLACEHOLDER — ship lean",
        title: "PLACEHOLDER — The stack",
        body: "PLACEHOLDER — The tools and frameworks reached for by default.",
      },
    ],
    stack: [
      "PLACEHOLDER — Claude Code",
      "PLACEHOLDER — Next.js",
      "PLACEHOLDER — Tailwind",
      "PLACEHOLDER — Vercel",
      "PLACEHOLDER — Supabase",
    ],
  },

  // Now — what's actively in motion (signals constant learning & growth)
  now: [
    {
      label: "Building",
      body: "PLACEHOLDER — What's on the workbench right now.",
    },
    {
      label: "Learning",
      body: "PLACEHOLDER — The skill or tool currently being studied.",
    },
    {
      label: "Exploring",
      body: "PLACEHOLDER — The open question or experiment in progress.",
    },
  ],

  // Beyond the build — the person behind the terminal. One contained zone,
  // no photo wall; four quiet facets with a line each.
  beyond: [
    {
      glyph: "meditation" as const,
      title: "PLACEHOLDER — Meditator",
      line: "PLACEHOLDER — A daily sitting practice; the same stillness that held up at the tables.",
    },
    {
      glyph: "yoga" as const,
      title: "PLACEHOLDER — Yogi",
      line: "PLACEHOLDER — Years on the mat. Discipline for the body, clarity for the work.",
    },
    {
      glyph: "travel" as const,
      title: "PLACEHOLDER — Traveler",
      line: "PLACEHOLDER — X countries and counting. New places, new priors.",
    },
    {
      glyph: "cards" as const,
      title: "PLACEHOLDER — Game theorist",
      line: "PLACEHOLDER — Still thinks in ranges, pot odds and expected value.",
    },
  ],

  // Contact — low-pressure, one primary action
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
    // Optional Cal.com booking link — leave undefined to hide.
    calcom: undefined as undefined | { label: string; url: string },
  },
};

export type BeyondGlyph = (typeof site.beyond)[number]["glyph"];
