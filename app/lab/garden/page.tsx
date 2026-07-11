import type { Metadata } from "next";
import GardenScene from "@/components/lab/GardenScene";

export const metadata: Metadata = {
  title: "The Garden — Ankit Anand",
  description:
    "Experiment 04: the showcase as a Japanese temple garden at dusk. Walk a winding path past six stations — each app a different kind of place — and ring the temple bell. One world, two render styles.",
};

export default function GardenPage() {
  return <GardenScene />;
}
