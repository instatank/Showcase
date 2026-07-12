import type { Config } from "tailwindcss";

/**
 * Site visual identity (PRD §8): clean, light, restrained, Apple-inspired.
 * Warm "paper + ink" neutral palette with a single calm clay accent.
 * Deliberately NOT PartySpark's navy/violet, and NOT a Liquid-Glass theme.
 */
const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./data/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        paper: "#faf9f7", // warm off-white page background
        surface: "#ffffff", // cards / framed content
        ink: "#1b1a18", // primary text
        muted: "#6b6963", // secondary text
        hairline: "#e7e4df", // subtle borders
        accent: {
          DEFAULT: "#b5532b", // restrained clay accent, used sparingly
          soft: "#f4e9e2",
          deep: "#9c4823", // darker clay for small text on accent-soft (WCAG AA)
        },
      },
      fontFamily: {
        sans: [
          "Inter",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Helvetica Neue",
          "Arial",
          "sans-serif",
        ],
      },
      maxWidth: {
        content: "72rem",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
      },
    },
  },
  plugins: [],
};

export default config;
