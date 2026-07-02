import type { Config } from "tailwindcss";

/**
 * Site visual identity — dark, high-tech, restrained.
 *
 * Near-black canvas + warm "ember" accent (an evolution of the original clay,
 * tuned for dark backgrounds). ONE accent color used sparingly; monospace
 * details carry the "technical" signal. Deliberately avoids the generic
 * purple-gradient/neon-glass "AI site" look.
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
        paper: "#0b0b0d", // page background (near-black, slightly warm)
        surface: "#131316", // cards / framed content
        raised: "#1a1a1f", // elevated hovers / inner chips
        ink: "#f0efec", // primary text (warm off-white)
        muted: "#8f8d86", // secondary text
        hairline: "#232327", // subtle borders
        accent: {
          DEFAULT: "#ff6a3c", // ember — the single accent
          bright: "#ff8a61",
          soft: "rgba(255, 106, 60, 0.10)",
          edge: "rgba(255, 106, 60, 0.35)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: [
          "var(--font-display)",
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "sans-serif",
        ],
        mono: [
          "var(--font-mono)",
          "ui-monospace",
          "SFMono-Regular",
          "Menlo",
          "monospace",
        ],
      },
      maxWidth: {
        content: "72rem",
      },
      borderRadius: {
        xl2: "1.25rem",
      },
      boxShadow: {
        "card-hover": "0 24px 48px -24px rgba(0, 0, 0, 0.7)",
        "accent-glow": "0 0 40px -8px rgba(255, 106, 60, 0.35)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        blink: {
          "0%, 49%": { opacity: "1" },
          "50%, 100%": { opacity: "0" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.6s ease-out both",
        blink: "blink 1.1s step-end infinite",
        "pulse-dot": "pulse-dot 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
