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
  | "In progress"
  | "Prototype";

/** Aspect ratios used by the placeholder/visual system. */
export type VisualAspect = "phone" | "wide" | "square";

export interface Visual {
  /** Path where the real asset will live, e.g. /images/dayos/hero.png */
  src: string;
  /** Accessible description / caption seed. */
  alt: string;
  /** Short caption shown under the visual (PRD §7 "uniform caption rhythm"). */
  caption: string;
  /** Controls the placeholder box + framing aspect ratio. */
  aspect: VisualAspect;
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
    oneLiner: "PLACEHOLDER — Personal system to run your whole day in one place.",
    theItch:
      "PLACEHOLDER — Needed one place to run the day (focus, journaling, wins) instead of five scattered tools. Confirm the real story.",
    features: [
      "PLACEHOLDER — Daily focus tasks",
      "PLACEHOLDER — Journaling",
      "PLACEHOLDER — Wins & tracking",
    ],
    howItWasBuilt:
      "PLACEHOLDER — AI-assisted build with [stack]. Interesting decision: [one brand-relevant choice that shows the meta-skill].",
    statusTag: "Daily driver",
    heroImage: {
      src: "/images/dayos/hero.png",
      alt: "PLACEHOLDER — DayOS hero screenshot",
      caption: "PLACEHOLDER — DayOS home / today view",
      aspect: "phone",
    },
    supportingImages: [
      {
        src: "/images/dayos/shot-1.png",
        alt: "PLACEHOLDER — DayOS supporting screenshot 1",
        caption: "PLACEHOLDER — Focus tasks",
        aspect: "phone",
      },
      {
        src: "/images/dayos/shot-2.png",
        alt: "PLACEHOLDER — DayOS supporting screenshot 2",
        caption: "PLACEHOLDER — Journaling",
        aspect: "phone",
      },
      {
        src: "/images/dayos/shot-3.png",
        alt: "PLACEHOLDER — DayOS supporting screenshot 3",
        caption: "PLACEHOLDER — Wins tracker",
        aspect: "phone",
      },
    ],
  },
  {
    slug: "partyspark",
    name: "PartySpark",
    oneLiner: "PLACEHOLDER — Social party game app that gets a room going.",
    theItch:
      "PLACEHOLDER — Confirm the real itch behind PartySpark.",
    features: [
      "PLACEHOLDER — Feature one",
      "PLACEHOLDER — Feature two",
      "PLACEHOLDER — Feature three",
    ],
    howItWasBuilt:
      "PLACEHOLDER — Built with [stack]. Note: PartySpark has its own full navy/violet + black/gold identity — the SHOWCASE deliberately does not reuse it (PRD §8).",
    statusTag: "Shipped",
    heroImage: {
      src: "/images/partyspark/hero.png",
      alt: "PLACEHOLDER — PartySpark hero screenshot",
      caption: "PLACEHOLDER — PartySpark lobby",
      aspect: "phone",
    },
    supportingImages: [
      {
        src: "/images/partyspark/shot-1.png",
        alt: "PLACEHOLDER — PartySpark supporting screenshot 1",
        caption: "PLACEHOLDER — Game in progress",
        aspect: "phone",
      },
      {
        src: "/images/partyspark/shot-2.png",
        alt: "PLACEHOLDER — PartySpark supporting screenshot 2",
        caption: "PLACEHOLDER — Round results",
        aspect: "phone",
      },
    ],
    clipUrl: "/images/partyspark/clip.mp4", // PLACEHOLDER — 15–20s screen-recording (PRD §7 minimum)
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
