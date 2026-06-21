/**
 * apps.ts — the single typed content source for the showcase (PRD §6, §9).
 *
 * Adding a 7th app later = one entry here + its image files in /public/images.
 *
 * ⚠️ EVERYTHING below is PLACEHOLDER content for the Phase 1–2 scaffold.
 *    Swap real copy in here; drop real images at the paths each app points to.
 *    Image paths are intentional even though the files don't exist yet — the
 *    <Visual> placeholder blocks render a labelled box at the right aspect ratio
 *    until a real file is added at that path.
 */

export type StatusTag =
  | "Daily driver"
  | "Shipped"
  | "Shipped · actively maintained"
  | "In progress"
  | "Prototype";

/** Aspect ratios used by the placeholder/visual system. */
export type VisualAspect = "phone" | "wide" | "square";

/**
 * How a visitor can experience the app from its detail page.
 * - "screenshots": images only — no live link, no demo button (e.g. a
 *   login-gated app holding personal data).
 * - "screenshots-demo": screenshots now, demo-capable — no public URL wired yet
 *   (badge reads "Screenshots / demo"). Switch to "live-demo" once a URL exists.
 * - "live-demo": render a live link / demo button (needs `liveUrl` on the App).
 */
export type ExperienceMode = "screenshots" | "screenshots-demo" | "live-demo";

export interface Visual {
  /** Path where the real asset will live, e.g. /images/dayos/hero.png */
  src: string;
  /** Accessible description / caption seed. */
  alt: string;
  /** Short caption shown under the visual (PRD §7 "uniform caption rhythm"). */
  caption: string;
  /** Controls the placeholder box + framing aspect ratio. */
  aspect: VisualAspect;
  /**
   * When true, render the real <Image> at `src` instead of the labelled
   * placeholder block. Set this once the real file exists at `src`.
   */
  real?: boolean;
}

export interface App {
  /** URL segment for /apps/[slug] */
  slug: string;
  name: string;
  /** PRD §6: plain language, ~10 words. */
  oneLiner: string;
  /** PRD §6: the personal problem that prompted it (1–2 sentences). */
  theItch: string;
  /** PRD §6: exactly 3 concrete feature bullets. */
  features: [string, string, string];
  /** PRD §6: AI stack + one interesting build decision. */
  howItWasBuilt: string;
  statusTag: StatusTag;
  /**
   * How the app is presented to visitors. Defaults to "screenshots" when
   * omitted. "live-demo" renders a demo/live button (requires `liveUrl`).
   */
  experienceMode?: ExperienceMode;
  /** Live/demo URL — only used when experienceMode is "live-demo". */
  liveUrl?: string;
  /** Hero shot — rendered inside a DeviceFrame. */
  heroImage: Visual;
  /** 2–4 supporting shots. */
  supportingImages: Visual[];
  /** Optional 15–20s screen-recording (PRD §7). */
  clipUrl?: string;
}

export const apps: App[] = [
  {
    slug: "dayos",
    name: "DayOS",
    // ⚠️ DRAFT PLACEHOLDER — one-liner to be confirmed in Ankit's own words.
    oneLiner:
      "An AI time-intelligence system I built for myself — and use every day.",
    // ⚠️ DRAFT PLACEHOLDER — the itch to be replaced in Ankit's own words.
    theItch:
      "I wanted an honest record of where my time and attention actually go each day — without juggling a calendar, a notes app, and a separate journal. So I built one place to run the day: log it, journal it, review it.",
    features: [
      "Logs the day as time blocks — deep work, learning, practice, leisure, leaks — alongside journaling, quick notes, project sessions, and a daily review.",
      'Uses Claude three ways: turns a spoken or typed brain-dump into structured time blocks, tightens rough journal entries on one tap ("Organize"), and pulls a clean to-do list out of messy text.',
      "Surfaces trends over time — how the hours split across categories and projects — with a calendar to revisit any past day.",
    ],
    howItWasBuilt:
      "Frontend: a single-file PWA in vanilla JavaScript — no framework, no build step, installable, works offline. Data: Firebase (auth, Firestore, storage for voice notes, push notifications). AI: Claude (Sonnet 4.6) via a tiny Vercel serverless proxy. Charts: Chart.js, lazy-loaded only when needed.\n\nThe build decision worth showing: the backend runs with zero installed packages. When the app calls Claude, the serverless function verifies the user's Firebase login token by hand — checking its cryptographic signature with Node's built-in crypto and Firebase's public keys — instead of pulling in the Firebase server library. Nothing to install, update, or break. Same philosophy as the app itself: as few moving parts as possible.",
    statusTag: "Daily driver",
    // Screenshots only — login-gated, holds personal data, so no live link/demo.
    experienceMode: "screenshots",
    heroImage: {
      src: "/screenshots/dayos/08todaylight.png",
      alt: "DayOS Today view — focus task, time-block logs, and captures",
      caption:
        "The day, laid out as time blocks — focus task, logs, and captures in one view.",
      aspect: "phone",
      real: true,
    },
    supportingImages: [
      {
        src: "/screenshots/dayos/04trendsovertime.png",
        alt: "DayOS Trends — categories and projects over time",
        caption:
          "Time intelligence: where the hours actually went, across categories and projects.",
        aspect: "phone",
        real: true,
      },
      {
        src: "/screenshots/dayos/07captureorganize.png",
        alt: "DayOS capture sheet — journaling with one-tap AI cleanup",
        caption:
          "Journaling with one-tap AI cleanup — messy thoughts in, structured entry out.",
        aspect: "phone",
        real: true,
      },
      {
        src: "/screenshots/dayos/projects.png",
        alt: "DayOS Projects — tagged, dated, searchable project sessions",
        caption:
          "Project sessions and learning logs — tagged, dated, searchable.",
        aspect: "phone",
        real: true,
      },
    ],
  },
  {
    slug: "partyspark",
    name: "PartySpark",
    // ⚠️ DRAFT PLACEHOLDER — one-liner to be confirmed in Ankit's own words.
    oneLiner: "15+ party games in one app — offline-first, AI-spiced.",
    // ⚠️ DRAFT PLACEHOLDER — the itch to be replaced in Ankit's own words.
    theItch:
      "Getting a group laughing and engaged — at a party, on the couch, in the car — usually means hunting for a game, signing up for something, or needing a connection that isn't there. I wanted one premium-feeling app that bundles the best party games, works offline, and uses AI to keep the content fresh when you want it.",
    features: [
      "15+ party games in one app — trivia, word games, social-deduction, couples and crowd games — most fully playable offline, no account needed.",
      "AI generates custom content on demand (tailored question packs, photo-based roasts), and always falls back to bundled content, so a game never breaks on a failed network call.",
      "Flexible play modes — pass-the-phone or named players with live leaderboards — plus a frictionless gate for mature decks.",
    ],
    howItWasBuilt:
      'Frontend: React 19 + TypeScript, built with Vite 7, styled with Tailwind v4 — a premium glassmorphism design system. Backend: Vercel serverless functions that keep all API keys server-side; the app talks to a single /api/ai endpoint. AI: Claude Haiku 4.5 as the primary generator, with Google Gemini 2.5 Flash as fallback for most text, and a Gemini image model powering the "Roast Me" caricatures.\n\nThe build decision worth showing: PartySpark is offline-first, with AI as optional spice — never a hard dependency. Every AI-backed game ships with a bundled static deck, so if the AI call fails the player still gets a full game. Custom-content requests try Claude first and silently fall back to Gemini if needed — the player never sees which AI answered, or that one failed. All keys live server-side in a Vercel function, never exposed in the app people use. The result feels smart when online and simply never breaks when it isn\'t.',
    statusTag: "Shipped · actively maintained",
    // "Screenshots / demo" for now — no-login, no personal data, so a live "Try it"
    // link is a candidate later. Do not hardcode a URL until one is provided.
    experienceMode: "screenshots-demo",
    // NOTE: set `real: true` on each visual once the PNG exists at its src.
    heroImage: {
      src: "/screenshots/partyspark/home-grid.png",
      alt: "PartySpark home — glass-on-navy game grid with filter pills",
      caption:
        "15+ games in one app, filtered by vibe — in a premium glass design system.",
      aspect: "phone",
      real: true,
    },
    supportingImages: [
      {
        src: "/screenshots/partyspark/roast-me.png",
        alt: "PartySpark Roast Me — pick a sticker, drop a photo for an AI roast",
        caption:
          "Pick a sticker, drop a photo, and AI roasts you with a custom caricature — the signature party moment.",
        aspect: "phone",
        real: true,
      },
      {
        src: "/screenshots/partyspark/create-your-vibe.png",
        alt: "PartySpark Most Likely To… deck picker with an AI 'Create Your Vibe' option",
        caption:
          "Pick a vibe — or let AI spin up a custom 'Create Your Vibe' pack — with bundled decks as fallback.",
        aspect: "phone",
        real: true,
      },
      {
        src: "/screenshots/partyspark/mlt-play.png",
        alt: "PartySpark Most Likely To… in play — prompt card with a 3-2-1 group vote",
        caption:
          "…and into the round: read the prompt, then everyone points on a 3-2-1 vote.",
        aspect: "phone",
        real: true,
      },
      {
        src: "/screenshots/partyspark/scramble.png",
        alt: "PartySpark Scramble — solo word game with letter tiles, timer and score",
        caption:
          "Scramble: a clean solo word game with a live timer and end-of-round scoring.",
        aspect: "phone",
        real: true,
      },
      {
        src: "/screenshots/partyspark/in-play-card.png",
        alt: "PartySpark Taboo in play — word, forbidden list, timer and skip/correct",
        caption:
          "Taboo in play: describe the word without the forbidden five, against the clock.",
        aspect: "phone",
        real: true,
      },
      {
        src: "/screenshots/partyspark/nhie.png",
        alt: "PartySpark Never Have I Ever — Classic Party card with I Have / I've Never",
        caption:
          "Never Have I Ever: two-tap play through the Classic Party deck — one consistent design system across every game.",
        aspect: "phone",
        real: true,
      },
    ],
  },
  {
    slug: "billbud",
    name: "BillBud",
    oneLiner: "PLACEHOLDER — Bill & expense management in one tight tool.",
    theItch:
      "PLACEHOLDER — Managing household bills/subscriptions in one place instead of across apps. Confirm.",
    features: [
      "PLACEHOLDER — Feature one",
      "PLACEHOLDER — Feature two",
      "PLACEHOLDER — Feature three",
    ],
    howItWasBuilt:
      "PLACEHOLDER — Built with [stack]. Interesting decision: [one choice].",
    statusTag: "In progress",
    heroImage: {
      src: "/images/billbud/hero.png",
      alt: "PLACEHOLDER — BillBud hero screenshot",
      caption: "PLACEHOLDER — BillBud overview",
      aspect: "phone",
    },
    supportingImages: [
      {
        src: "/images/billbud/shot-1.png",
        alt: "PLACEHOLDER — BillBud supporting screenshot 1",
        caption: "PLACEHOLDER — Upcoming bills",
        aspect: "phone",
      },
      {
        src: "/images/billbud/shot-2.png",
        alt: "PLACEHOLDER — BillBud supporting screenshot 2",
        caption: "PLACEHOLDER — Subscriptions",
        aspect: "phone",
      },
    ],
  },
  {
    slug: "cadence",
    name: "Cadence",
    oneLiner: "PLACEHOLDER — Personalised workout planner that adapts to you.",
    theItch:
      "PLACEHOLDER — Needs a full first-pass from Ankit (PRD §12).",
    features: [
      "PLACEHOLDER — Feature one",
      "PLACEHOLDER — Feature two",
      "PLACEHOLDER — Feature three",
    ],
    howItWasBuilt:
      "PLACEHOLDER — Built with [stack]. Interesting decision: [one choice].",
    statusTag: "In progress",
    heroImage: {
      src: "/images/cadence/hero.png",
      alt: "PLACEHOLDER — Cadence hero screenshot",
      caption: "PLACEHOLDER — Cadence weekly plan",
      aspect: "phone",
    },
    supportingImages: [
      {
        src: "/images/cadence/shot-1.png",
        alt: "PLACEHOLDER — Cadence supporting screenshot 1",
        caption: "PLACEHOLDER — Workout detail",
        aspect: "phone",
      },
      {
        src: "/images/cadence/shot-2.png",
        alt: "PLACEHOLDER — Cadence supporting screenshot 2",
        caption: "PLACEHOLDER — Progress",
        aspect: "phone",
      },
    ],
    clipUrl: "/images/cadence/clip.mp4", // PLACEHOLDER — 15–20s screen-recording (PRD §7 minimum)
  },
  {
    slug: "mymealmap",
    name: "MyMealMap",
    oneLiner: "PLACEHOLDER — Meal planner built around your nutrition profile.",
    theItch:
      "PLACEHOLDER — Planning meals around a specific nutrition profile. Confirm.",
    features: [
      "PLACEHOLDER — AI-generated plans",
      "PLACEHOLDER — Profiles",
      "PLACEHOLDER — Feature three",
    ],
    howItWasBuilt:
      "PLACEHOLDER — AI generation engine + audit layer [confirm]. Interesting decision: [one choice].",
    statusTag: "Prototype",
    heroImage: {
      src: "/images/mymealmap/hero.png",
      alt: "PLACEHOLDER — MyMealMap hero screenshot",
      caption: "PLACEHOLDER — MyMealMap weekly plan",
      aspect: "phone",
    },
    supportingImages: [
      {
        src: "/images/mymealmap/shot-1.png",
        alt: "PLACEHOLDER — MyMealMap supporting screenshot 1",
        caption: "PLACEHOLDER — Recipe detail",
        aspect: "phone",
      },
      {
        src: "/images/mymealmap/shot-2.png",
        alt: "PLACEHOLDER — MyMealMap supporting screenshot 2",
        caption: "PLACEHOLDER — Nutrition profile",
        aspect: "phone",
      },
    ],
  },
  {
    slug: "tradegenie",
    name: "TradeGenie",
    oneLiner: "PLACEHOLDER — Low-friction journal to log and review trades.",
    theItch:
      "PLACEHOLDER — Wanted a low-friction journal to log and review trades. Confirm.",
    features: [
      "PLACEHOLDER — Feature one",
      "PLACEHOLDER — Feature two",
      "PLACEHOLDER — Feature three",
    ],
    howItWasBuilt:
      "PLACEHOLDER — Built with [stack]; PROJECT_BRIEF-governed, lean-first. Interesting decision: [one choice].",
    statusTag: "In progress",
    heroImage: {
      src: "/images/tradegenie/hero.png",
      alt: "PLACEHOLDER — TradeGenie hero screenshot",
      caption: "PLACEHOLDER — TradeGenie journal",
      aspect: "phone",
    },
    supportingImages: [
      {
        src: "/images/tradegenie/shot-1.png",
        alt: "PLACEHOLDER — TradeGenie supporting screenshot 1",
        caption: "PLACEHOLDER — Trade entry",
        aspect: "phone",
      },
      {
        src: "/images/tradegenie/shot-2.png",
        alt: "PLACEHOLDER — TradeGenie supporting screenshot 2",
        caption: "PLACEHOLDER — Review dashboard",
        aspect: "phone",
      },
    ],
  },
];

/** Lookup helper used by the dynamic detail route. */
export function getApp(slug: string): App | undefined {
  return apps.find((a) => a.slug === slug);
}

export const appSlugs = apps.map((a) => a.slug);
