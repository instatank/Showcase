import type { Metadata } from "next";
import "./globals.css";
import { site } from "@/data/site";

export const metadata: Metadata = {
  title: `${site.name} — AI Builder`,
  description:
    "PLACEHOLDER — Personal showcase of Ankit Anand: ex-poker player shipping real AI products.",
};

/**
 * Bare root shell. The classic site (header/footer chrome) lives in the
 * (site) route group; the immersive experiments at /lab render full-bleed
 * with their own atmosphere.
 */
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen font-sans">{children}</body>
    </html>
  );
}
