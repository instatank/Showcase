/**
 * content.ts — the shared narrative + visual identity layer for the Lab.
 *
 * All three immersive experiments read the SAME facts from data/apps.ts and
 * data/site.ts (single source of truth, PRD §9) — this file only adds the
 * presentational layer: a color, a glyph, a card rank per app, plus the
 * connective narration each experiment speaks in its own voice.
 *
 * scrub() strips the "PLACEHOLDER — " scaffolding so the experiments read
 * like a live product while the underlying data is still being written.
 */

import { apps, type App } from "@/data/apps";
import { site } from "@/data/site";

/** Strip placeholder scaffolding from display copy (data stays untouched). */
export function scrub(s: string): string {
  return s
    .replace(/^PLACEHOLDER\s*—\s*/i, "")
    .replace(/\s*\[confirm[^\]]*\]/gi, "")
    .replace(/\s*Confirm[^.]*\.\s*$/i, "")
    .trim();
}

/** True if a field is still pure scaffolding (nothing worth showing). */
export function isBlank(s: string): boolean {
  const t = scrub(s);
  return t.length === 0 || /^Feature (one|two|three)$/i.test(t) || /needs a full first-pass/i.test(t);
}

export interface LabIdentity {
  slug: string;
  /** Accent used across all three experiments for this app. */
  accent: string;
  /** A one-character mark — symbolic geometry, never a logo. */
  glyph: string;
  /** Card face for The Deal: six ranks, one hand. */
  rank: string;
  suit: "♠" | "♥" | "♦" | "♣";
  /** Red or black suit rendering. */
  suitRed: boolean;
  /** Two or three words of flavor the experiments can whisper. */
  flavor: string;
}

/**
 * The hand: AA holds six cards. Ranks descend A→9; suits alternate.
 * Accents are per-app identities inside the lab only — the classic site's
 * restrained paper/ink identity (PRD §8) is untouched.
 */
export const identities: LabIdentity[] = [
  { slug: "dayos", accent: "#f5b950", glyph: "✳", rank: "A", suit: "♠", suitRed: false, flavor: "the day, run like a system" },
  { slug: "partyspark", accent: "#c084fc", glyph: "✦", rank: "K", suit: "♥", suitRed: true, flavor: "a room, set alight" },
  { slug: "billbud", accent: "#34d399", glyph: "▤", rank: "Q", suit: "♦", suitRed: true, flavor: "every bill, one ledger" },
  { slug: "cadence", accent: "#fb7185", glyph: "∿", rank: "J", suit: "♣", suitRed: false, flavor: "training with a pulse" },
  { slug: "mymealmap", accent: "#a3e635", glyph: "❋", rank: "10", suit: "♥", suitRed: true, flavor: "meals that fit the body" },
  { slug: "tradegenie", accent: "#38bdf8", glyph: "⇗", rank: "9", suit: "♠", suitRed: false, flavor: "the trade, on the record" },
];

export interface LabApp {
  app: App;
  id: LabIdentity;
  index: number; // 0-based position in the hand
}

export const labApps: LabApp[] = identities.map((id, index) => {
  const app = apps.find((a) => a.slug === id.slug);
  if (!app) throw new Error(`lab identity without app data: ${id.slug}`);
  return { app, id, index };
});

export function labApp(slug: string): LabApp | undefined {
  return labApps.find((l) => l.id.slug === slug);
}

/** The operator himself — shared framing. */
export const operator = {
  name: site.name,
  /** The monogram is a gift: AA — pocket aces, the best starting hand. */
  monogram: "AA",
  line: "Ex-professional poker player. No engineering background. Six shipped AI products.",
  arc: site.arc.map(scrub),
  contact: {
    blurb: scrub(site.contact.blurb),
    email: site.contact.email,
    x: site.contact.x,
    linkedin: site.contact.linkedin,
  },
};

/** Status → chip color (poker chips, building signage, orbit rings alike). */
export const statusColor: Record<App["statusTag"], string> = {
  "Daily driver": "#f5b950",
  Shipped: "#34d399",
  "In progress": "#38bdf8",
  Prototype: "#c084fc",
};
