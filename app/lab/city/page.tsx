import type { Metadata } from "next";
import CityScene from "@/components/lab/CityScene";

export const metadata: Metadata = {
  title: "The Strip — Ankit Anand",
  description:
    "Experiment 02: the showcase as a neon night street. Scroll to walk; every building is a shipped app; the road ends at what isn't built yet.",
};

export default function CityPage() {
  return <CityScene />;
}
