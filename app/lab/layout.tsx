import type { Metadata, Viewport } from "next";
import "./lab.css";

export const metadata: Metadata = {
  title: "The Lab — Ankit Anand",
  description:
    "Three immersive experiments on the same showcase: a poker table, a night city, a planetary system. Same six apps, three ways in.",
};

export const viewport: Viewport = {
  themeColor: "#05070d",
};

/**
 * The Lab — full-bleed immersive experiments. No site chrome: each
 * experiment owns its entire atmosphere, the way the Voyage does in UoT.
 */
export default function LabLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <div className="lab-root">{children}</div>;
}
