import type { BeyondGlyph } from "@/data/site";

/**
 * Glyph — minimal line icons for the "beyond the build" personality tiles.
 * Deliberately quiet: 1.5px strokes, no fills, inherits currentColor.
 */
export default function Glyph({
  name,
  className = "h-6 w-6",
}: {
  name: BeyondGlyph;
  className?: string;
}) {
  const common = {
    className,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.5,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "meditation":
      // seated figure, half-lotus silhouette
      return (
        <svg {...common}>
          <circle cx="12" cy="5.5" r="2" />
          <path d="M12 8v4" />
          <path d="M12 12c-2.5 0-4.5 1.5-5.5 3.5" />
          <path d="M12 12c2.5 0 4.5 1.5 5.5 3.5" />
          <path d="M4 18c2.5-1.5 5.5-2 8-2s5.5.5 8 2" />
        </svg>
      );
    case "yoga":
      // lotus flower
      return (
        <svg {...common}>
          <path d="M12 4c-1.5 2-2 4-2 6 0 2.5 2 4 2 4s2-1.5 2-4c0-2-.5-4-2-6z" />
          <path d="M5 9c.5 3 2 5.5 4.5 6.5" />
          <path d="M19 9c-.5 3-2 5.5-4.5 6.5" />
          <path d="M4 15c2 3 5 4.5 8 4.5s6-1.5 8-4.5" />
        </svg>
      );
    case "travel":
      // globe with meridian
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="8.5" />
          <path d="M3.5 12h17" />
          <path d="M12 3.5c2.5 2.3 4 5.2 4 8.5s-1.5 6.2-4 8.5c-2.5-2.3-4-5.2-4-8.5s1.5-6.2 4-8.5z" />
        </svg>
      );
    case "cards":
      // spade
      return (
        <svg {...common}>
          <path d="M12 3.5c3 3.5 7 6 7 9.5a4 4 0 0 1-7 2.6A4 4 0 0 1 5 13c0-3.5 4-6 7-9.5z" />
          <path d="M12 15.5V20" />
          <path d="M9.5 20.5h5" />
        </svg>
      );
  }
}
